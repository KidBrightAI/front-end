<template>
  <div class="recorder-container d-flex align-items-center">
    <div v-if="recording" class="recorder-container-active"></div>
    <p v-if="counting > 0" class="counting-timer-p">
      {{ counting }}
    </p>
    <div class="voice-meter">
      <canvas id="uv-meter" width="20"></canvas>
    </div>
    <div v-show="id == null" class="full">
      <canvas id="waveform-client"></canvas>
      <canvas id="mfcc-client" width="224" height="224" style="display:none;"></canvas>
    </div>
    <div v-show="id != null" class="full">
      <WaveFormPlayer
      :id="id"
      sound_ext="wav"
      img_ext="jpg"
      :delay="project.options.duration"
      :ref="`wavsuf`"
      :mute="true"
      >
      </WaveFormPlayer>
    </div>
    <div class="recorder-wrap">
      <div class="d-flex">
        <b-avatar id="change-threshold-popover" button variant="primary" icon="gear-fill" class="align-baseline config-btn"></b-avatar>
        <b-popover
          target="change-threshold-popover"
          triggers="focus"
          placement="auto"
        >
          <template #title>
            Setting Threshold
          </template>
          <div>
            <b-form-group
              :label="threshold"
              label-cols="2"
              class="mb-0 mt-0 threshold-config"
            >
              <b-form-input
                class="mt-2"
                v-model="threshold"
                type="range"
                min="1"
                max="99"
                step="1"
              ></b-form-input>
            </b-form-group>
          </div>
        </b-popover>
      </div>
      <div class="vol-adj d-flex">
        <img
          src="~/assets/images/UI/svg/volume-up.svg"
          height="16"
          class="op-btn"
        />
        <b-form-input
          type="range"
          v-model="volume"
          @change="(v)=>$emit('volumeChange',parseFloat(v))"
          min="0"
          max="1"
          step="0.1"
        ></b-form-input>
      </div>
      <div class="time-counter">
        <span class="current-time">{{
          timeCurrent ? timeCurrent + ":00": "0:00"
        }}</span
        ><span>/ {{ project.options.duration }}:00</span>
      </div>
    </div>
  </div>
</template>
<script>

import WaveFormPlayer from "./WaveFormPlayer.vue";
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  components: {
    WaveFormPlayer
  },
  props: ["id"],
  data() {
    return {
      mode: "single_short", //"continue"
      drawMode: "listening", //recording
      recording : false,
      volume: 0.5,
      threshold: 25,
      timeCurrent: 0,
      timeCounter : null,
      counting: 0,
      rmsCanvas: null,
      uvCanvas: null,
      canvasSize : [0,0],
      startTime: 0,
      //- ros -//
      ros: null,
      goal: null,
    };
  },
  computed: {
    ...mapState('project', ['project']),
    ...mapState(['currentDevice']),
  },
  async mounted() {
    await this.initRecord();
    this.ros = new ROSLIB.Ros({
      url : this.rosWebsocket
    });
    this.recordClient = new ROSLIB.ActionClient({
      ros : this.ros,
      serverName : '/save_wave_action',
      actionName : 'kidbright_tpu/recordAction'
    });
    this.goal = new ROSLIB.Goal({
      actionClient : this.recordClient,
      goalMessage: {
        projectid: this.project.id,
        duration: this.project.options.duration,
        threshold: 0.5
      }
    });
    this.goal.on("feedback", this.onFeedback.bind(this));
    this.goal.on("result", this.onResult.bind(this));
    this.ros.on('connection', this.onRosConnected.bind(this));
    this.ros.on('error', this.onRosError.bind(this));
    this.ros.on('close', this.onRosClosed.bind(this));
  },
  methods: {
    onFeedback(fb) {
      console.log("feedback : ", fb.status);
    },
    onResult(result) {
      console.log("record resulted");
      let results = result.result.split("$");
      if (results.length == 4 && results[0] == "SUCCESS") {
        let wav = Uint8Array.from(atob(results[1]), c => c.charCodeAt(0))
        let mfcc = Uint8Array.from(atob(results[2]), c => c.charCodeAt(0))
        let wavform = Uint8Array.from(atob(results[3]), c => c.charCodeAt(0))

      } else if (results.length == 1 && results[0] == "TIMEOUT") {

      }
    },
    onRosConnected() {
      console.log("ROS connected");
    },
    onRosError() {
      console.log("ROS error");
    },
    onRosClosed() {
      console.log("ROS Closed");
    },
    async recordComplete(rec,blob){
      console.log("recorded");
      let img = await this.downloadPreview("waveform-client");
      let mfcc = await this.downloadPreview("mfcc-client");
      this.$emit("recorded", {sound : blob, preview : img, mfcc : mfcc});
      this.clearCanvas();
    },
    recordTimeout(){
      console.log("record timeout");
      this.endRecord();
    },
    downloadPreview(id){
      return new Promise(resolve=>{
        const tmpCanvas = document.getElementById(id);
        tmpCanvas.toBlob(resolve, "image/jpeg", 0.8);
      });
    },
    async initRecord(){
      let rCanvas = document.getElementById("waveform-client");
      this.rmsCanvas = rCanvas.getContext("2d");
      rCanvas.style.width = "100%";
      rCanvas.style.height = "100%";
      rCanvas.width = rCanvas.offsetWidth;
      rCanvas.height = rCanvas.offsetHeight;
      this.canvasSize = [rCanvas.width, rCanvas.height];


      let uvMeterCanvas = document.getElementById("uv-meter");
      uvMeterCanvas.height = rCanvas.height;
      this.uvCanvas = uvMeterCanvas.getContext("2d");

    },
    clearCanvas(){
      this.rmsCanvas.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
      this.uvCanvas.clearRect(0, 0, 20, this.canvasSize[1]);
    },
    async continueRecord(){
      this.clearCanvas();
      //--------- countdown --------//
      this.counting = 3;
      await this.$helper.sleep(1000);
      this.counting = 2;
      await this.$helper.sleep(1000);
      this.counting = 1;
      await this.$helper.sleep(1000);
      this.counting = 0;
      //---------------------------//
      // ROS call here
      this.goal.send();
    },
    async endContinueRecord(){

    },

    startRecord(){
      this.recording = true;
      this.startTime = new Date();
      this.startTimer();
      this.$emit("onRecording");
      console.log("=== start record ===");
    },
    endRecord(){
      this.recording = false;
      this.stopTimer();
      this.$emit("onStopRecord");
      console.log("=== end record ===");
    },

    async simulatePlay(){
      if(this.$refs.wavsuf){
        this.startTimer();
        await this.$refs.wavsuf.play();
        this.stopTimer();
      }
    },
    startTimer(){
      this.timeCurrent = 0;
      this.timeCounter  = setInterval(()=>{
        this.timeCurrent += 1;
      },1000);
    },
    stopTimer(){
      clearInterval(this.timeCounter);
    }
  }
}
</script>
<style scoped lang="scss">
$primary-color: #007e4e;
.counting-timer-p{
  color: #6b6b6b;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 120px;
  position: absolute;
}
.recorder-container {
  background: #333333;
  width: 100%;
  height: 250px;
  position: relative;
  .recorder-wrap {
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 30px;
    left: 30px;
    z-index: 1;
    .vol-adj {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      margin-right: 10px;
      display: flex;
      align-items: center;
      img {
        margin-right: 0.3em;
      }
      input[type="range"] {
        width: 60px;
      }
    }
    .time-counter {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      span {
        font-weight: bold;
      }
      .current-time {
        color: $primary-color;
        padding-right: 5px;
      }
    }
    .rec-counter {
      background-color: #fff;
      border-radius: 19px;
      padding: 10px 20px;
      box-shadow: 0 0 10px #33333333;
      color: $primary-color;
      font-weight: bold;
      text-transform: uppercase;
    }
  }
}
.recorder-container-active {
  border: 10px solid #007e4e !important;
  position: absolute;
  width: 100%;
  height: 100%;
}
.full {
  position: relative;
  width: 100%;
  height: 100%;
}
.config-btn{
  margin-right: 10px;
}
.voice-meter{
  position: absolute;
  height: 100%;
}
.threshold-config{
  width: 180px;
}
</style>

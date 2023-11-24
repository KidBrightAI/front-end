<template>
  <div class="blockly-module">
    <div class="d-flex w-100 h-100 outer-wrap">
      <div class="d-flex flex-fill flex-column main-panel">
        <div class="d-flex flex-fill flex-row" style="background-color: white">
          <blockly-code
            ref="blockly"
            :style="{ width: '50%' }"
            :toolbox="toolbox"
            :blocks="block"
            language="javascript"
          ></blockly-code>
          <simulator-controller
            style="width: 50%"
            ref="simulator"
            :showController="false"
            :captureKey="false"
          >
            <continue-voice-capture ref="capture" @onImageData="onImageDataReady"></continue-voice-capture>
          </simulator-controller>
        </div>
        <div class="bottom-bar">
          <div class="terminal-container" id="terminal" ref="terminal"></div>
          <div class="button-container">
            <div class="button">
              <button pill v-on:click="handleRun" class="btn-run op-btn">
                <span class="ico">
                  <img v-if="!isRunning" src="~/assets/images/UI/svg/Group 80.svg"/>
                  <img v-else src="~/assets/images/UI/svg/Group 82.svg" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import SimulatorController from "~/components/InputConnection/SimulatorController.vue";
import BlocklyCode from "@/components/BlocklyCode.vue";
import Toolbox from "../Blocks/toolbox";
import Blocks from "../Blocks/blocks";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import axios from "axios";

import ContinueVoiceCapture from '~/components/InputConnection/ContinueVoiceCapture.vue';
import runner from "../voice.worker.js";

export default {
  name: "BlocklyComponent",
  components: {
    BlocklyCode,
    SimulatorController,
    ContinueVoiceCapture
  },
  data() {
    return {
      model: null,
      isRunning: false,
      toolbox: Toolbox,
      block: Blocks,
      image: null,
      worker: null
    };
  },
  methods: {
    imageDataFromSource: async function (source) {
      const image = Object.assign(new Image(), { src: source });
      await new Promise(resolve => image.addEventListener('load', () => resolve()));
      const context = Object.assign(document.createElement('canvas'), {
          width: image.width,
          height: image.height
      }).getContext('2d');
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height);
    },
    onImageDataReady: function(image){
      this.image = image;
      if(this.worker){
        this.worker.postMessage({command : "WRITE", subcommand: "VOICE", data : image});
      }
    },
    //==========================//
    handleRun : async function() {
      if (!this.isRunning) {
        this.isRunning = true;
        await this.run();
      } else {
        this.isRunning = false;
        this.stop();
      }
    },
    async processCommand(event){
      if(event.data.command == "PRINT"){
        this.term.write(event.data.msg);
      }else if(event.data.command == "MOVE"){
        let lin = event.data.lin;
        let ang = event.data.ang;
        this.$refs.simulator.$refs.gameInstance.contentWindow.VK_MovementDirec(lin,ang);
      }else if(event.data.command == "REQUEST"){
        if(event.data.data == "MODEL"){
          let modelInfo = await this.initModel();
          console.log("======== request model ==========");
          console.log(modelInfo);
          this.worker.postMessage({ command : "RESPONSE", subcommand : "MODEL", data: modelInfo});
        }
        if(event.data.data == "VOICE"){
          this.worker.postMessage({ command : "RESPONSE", subcommand : "VOICE", data: this.image});
        }
        if(event.data.data == "DATASETS"){
          this.worker.postMessage({ command : "RESPONSE", subcommand : "DATASETS", data: this.dataset});
        }
        if(event.data.data == "MFCC"){
          let imageUrl = `${this.getBaseURL}/${event.data.id}_mfcc.jpg`;
          let imageData = await this.imageDataFromSource(imageUrl);
          this.worker.postMessage({ command : "RESPONSE", subcommand : "MFCC", data: imageData});
        }
        if(event.data.data == "PROJECT"){
          this.worker.postMessage({command : "RESPONSE", subcommand : "PROJECT", data: this.project});
        }
      }else if(event.data.command=="MQTT_CONNECT"){
        var that = this;
        if(this.mqttClient != null){
          this.mqttClient.end();
        }
        this.mqttClient = mqtt.connect(event.data.host, {
          port: event.data.port,
          clientId: event.data.clientId,
          username: event.data.username,
          password: event.data.password,
        });
        this.mqttClient.on("connect", function () {
          console.log("MQTT Connected");
          that.worker.postMessage({command : "EVENT", subcommand : "MQTT_ON_CONNECT", data: "MQTT Connected"});
        });
        this.mqttClient.on("error", function (error) {
          console.log("MQTT Error : ", error);
          that.worker.postMessage({command : "EVENT", subcommand : "MQTT_ERROR", data: error});
        });
        this.mqttClient.on("message", function (topic, message) {
          //message is Uint8Array convert to string
          message = String.fromCharCode.apply(null, message);
          that.worker.postMessage({command : "EVENT", subcommand : "MQTT_ON_MESSAGE", data: {topic : topic, message : message}});
        });
        this.mqttClient.on("close", function () {
          console.log("MQTT Close");
          that.worker.postMessage({command : "EVENT", subcommand : "MQTT_CLOSE", data: "MQTT Close"});
        });
      }else if(event.data.command=="MQTT_PUBLISH"){
        this.mqttClient.publish(event.data.topic, event.data.message + "");
      }else if(event.data.command=="MQTT_SUBSCRIBE"){
        this.mqttClient.subscribe(event.data.topic);
      }else if(event.data.command=="MQTT_UNSUBSCRIBE"){
        this.mqttClient.unsubscribe(event.data.topic);
      }else if(event.data.command=="MQTT_DISCONNECT"){
        this.mqttClient.end();
      }else if(event.data.command=="MQTT_IS_CONNECTED"){
        this.worker.postMessage({command : "RESPONSE", subcommand : "MQTT_IS_CONNECTED", data: this.mqttClient.connected});
      }
    },
    onWorkerError(err){
      console.log("worker error : ");
      console.log(err);
      console.log(err.error);
    },
    async initModel() {
      let url = new URL(this.project.tfjs.replace("filesystem:",""));
      url.host = document.location.host;
      url.protocol = document.location.protocol;
      url.port = document.location.port;
      let tfjsModelJson = "filesystem:"+url.href;
      var modelJson = await axios.get(tfjsModelJson);
      var weights = [];
      let baseModelPath = tfjsModelJson.substring(
        0,
        tfjsModelJson.lastIndexOf("/")
      );
      let downloadPromises = [];
      for (let binFile of modelJson.data.weightsManifest[0].paths) {
        let w = axios.get(baseModelPath + "/" + binFile, {
          responseType: "arraybuffer",
        });
        downloadPromises.push(w);
      }
      let downloadedWeight = await Promise.all(downloadPromises);
      weights = downloadedWeight.map((el) => el.data);
      let weightData = this.$helper.concatenateArrayBuffers(weights);
      return {
        modelJson : modelJson.data,
        weight: weightData
      }
    },
    async getLabels() {
      try{
        let url = new URL(this.project.labelFile.replace("filesystem:",""));
        url.host = document.location.host;
        url.protocol = document.location.protocol;
        url.port = document.location.port;
        let modelLabels = "filesystem:"+url.href;
        const __label_res = await axios.get(modelLabels);
        const __labels_text = __label_res.data;
        let labels = __labels_text
          .replaceAll("\r", "")
          .split("\n")
          .map((el) => el.trim())
          .filter((el) => el);
        console.log(labels);
        return labels;
      }catch(err){
        console.log(err);
        return [];
      }
    },
    run : async function() {
      this.term.write("Running ...\r\n");
      //========== start worker ==============//
      this.worker = new runner();
      this.worker.onerror = this.onWorkerError.bind(this);
      this.worker.onmessage = this.processCommand.bind(this);
      let labels = this.project.modelLabel;
      if((Array.isArray(labels) && labels.length == 0) || labels == undefined){
        labels = await this.getLabels();
      }
      console.log("label : ",labels);
      //========== load tfjs model ===========//
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("1");
      var code = this.project.code;
      var codeAsync = `(async () => {
        ${code}
        this.isRunning = false;
        this.result = [];
      })();`;
      console.log(codeAsync);
      try {
        this.worker.postMessage({ command: "RUN", code: codeAsync, labels : labels });
        //eval(codeAsync);
      } catch (error) {
        console.log(error);
      }
      //========== start voice capture ==========//
      await this.$refs.capture.record();
      //=========================================//
    },
    stop() {
      console.log("stop!!!");
      //========== terminate continue voice =========//
      this.$refs.capture.stopListening();
      this.$refs.capture.endRecord();
      //========== stop robot ===========//
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("0");
      //========== stop web worker ======//
      //this.worker.onmessage = null;
      this.worker.terminate();
    },
  },
  computed: {
    ...mapState("project", ["project"]),
    ...mapState("dataset", ["dataset"]),
    ...mapGetters("dataset", ["getBaseURL"]),
  },
  mounted() {
    console.log("mounted");
    this.term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(this.$refs.terminal);
    fitAddon.fit();
    console.log("model tfjs path : ", this.project.tfjs);
    this.term.write("$ ");
  },
  beforeUnmount(){
    this.$refs.capture.stopListening();
    this.$refs.capture.endRecord();
  }
};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;
$black: #333;
$yellow: #fff7d6;
$grey: #eeeeee;

* {
  margin: 0;
  padding: 0;
  outline: none;
  box-sizing: border-box;
}

button {
  color: unset;
  border: unset;
  background-color: unset;
  text-align: left;
  position: relative;

  &::after {
    position: absolute;
    top: 17px;
    right: 15px;
  }
}

.button {
  .btn-run {
    img {
      width: 100px;
    }
  }

  .btn-stop {
    img {
      width: 100px;
    }
  }
}

.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

.main-panel {
  width: calc(100% - 300px);
}

.blockly-module {
  display: flex;
  position: relative;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  .blockly {
    height: 100%;
    width: 100%;
  }
}

.bottom-bar {
  height: 200px;
  display: flex;
}
.terminal-container {
  width: 100%;
  height: 100%;
  padding: 5px;
  background-color: black;
}
.button-container{
  width: 200px;
  height: 100%;
  text-align: center;
  padding-top: 46px;
  background-color: black;
}
</style>

<template>
  <div class="display-panel liveview">
    <div class="config-camera-float-button">
      <b-avatar
        :disabled="!cameraReady"
        :icon="running? 'pause':'play'"
        :size="32"
        button
        @click="onAi"
      ></b-avatar>
      <b-avatar v-if="simulator" icon="box" :size="32" button @click="$emit('openSim')"></b-avatar>
      <!-- <b-avatar icon="gear-fill" :size="32" button></b-avatar> -->
      <b-avatar
        v-if="captureDevices.length > 1"
        icon="arrow-repeat"
        :size="32"
        button
        @click="nextCamera"
      ></b-avatar>
    </div>

    <div v-if="deviceType == 'STREAM'">
      <b-img
        ref="displayImage"
        crossorigin="anonymous"
        :width="width"
        :src="captureDevices[currentCaptureDeviceIndex]"
      >
      </b-img>
    </div>
    <div class="video-container">
      <vue-web-cam
          v-show="deviceType != 'STREAM'"
          :width="width"
          :height="height"
          ref="webcam"
          @cameras="onCameras"
          @started="onStarted"
          @stopped="onStoped"
          :deviceId="captureDevice"
      />
      <canvas ref="overlay" id="overlay-camera" class="cam-overlay"></canvas>
    </div>
  </div>
</template>
<script>

import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
const ANCHOR_POINTS = [[0, 0, 0], [0, 0.1, 0], [-0.1, 0, 0], [-0.1, -0.1, 0]];

const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
}; // for rendering each finger as a polyline

const connections = [
  [0, 1], [1, 2], [2, 3], [3,4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13,14], [14, 15], [15, 16],
  [0, 17], [17, 18],[18, 19], [19,20]
];

export default {
  components:{
  },
  props: {
    source: {
      type: String,
      default: "",
    },
    width: {
      type: [String, Number],
      default: 260,
    },
    height: {
      type: [String, Number],
      default: '100%',
    },
    simulator : {
      type : Boolean,
      default: true
    }
  },
  data() {
    return {
      captureDevices: [],
      currentCaptureDeviceIndex: 0,
      canvas: null,
      overlay_canvas: null,
      cameraReady: false,
      //------- for detection --------//
      running: false,
      detector: null,
      //------- result --------//
      currentHand : null,
    };
  },
  created() {
    // add robot device
    if (this.currentDevice == "ROBOT") {
      this.captureDevices.push(this.streamUrl + '?topic=/output/image_raw&type=ros_compressed');
      this.$emit("started");
    }
    // add simulator device
  },
  async mounted() {
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: 'mediapipe', // or 'tfjs'
      modelType: 'full',
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands/"
    };
    this.detector = await handPoseDetection.createDetector(model, detectorConfig);
  },
  beforeDestroy() {
    console.log("beforeDestroy");
    this.running = false;
  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
    deviceType(){
      let curr = this.captureDevices[this.currentCaptureDeviceIndex];
      if(!curr){
        return "WEBCAM"
      }else if(curr.length == 64 && !curr.startsWith("http")){
        return "WEBCAM";
      }else if(curr.startsWith("http")){
        return "STREAM";
      }else if(curr == "SIM"){
        return "SIM";
      }
    },
    captureDevice(){
      console.log('capture device change');
      if(Array.isArray(this.captureDevices) && this.captureDevices.length > 0){
        return this.captureDevices[this.currentCaptureDeviceIndex];
      }else{
        return null;
      }
    }
  },
  methods: {
    getHand() {
      return this.currentHand;
    },
    getSerializedKeypoint() {
      if (this.currentHand) {
        return this.serializeHand(this.currentHand.keypoints);
      }
    },
    delay(millisec) {
      return new Promise(resolve => { setTimeout(() => { resolve('') }, millisec); });
    },
    async onAi() {
      if (!this.running) {
        this.running = true;
        this.initOverlay();
        this.$nextTick(async () => {
          await this.detect();
        });
      } else {
        this.running = false;
        this.$nextTick(async () => {
          await this.delay(1000);
          this.clearOverlay();
        });
      }
    },
    async detect() {
      const video = this.$refs.webcam.$el;
      console.log("running");
      while (this.running) {
        try {
          const hands = await this.detector.estimateHands(video);
          if (hands.length) {
            this.drawHands(hands);
            this.currentHand = hands[0];
          } else {
            this.clearOverlay();
            this.currentHand = null;
          }
          await this.delay(50);
        } catch (err) {
          console.log(err);
          await this.delay(1000);
        }
      }
      console.log("terminated");
    },
    initOverlay() {
      this.overlayCanvas = document.getElementById("overlay-camera");
      this.overlayCtx = this.overlayCanvas.getContext("2d");
      this.resizeOverlay();
    },
    resizeOverlay() {
      if (this.overlayCtx == null) {
        this.initOverlay();
      }
      let video = this.$refs.webcam.$el;
      let w = video.clientWidth;
      let h = video.clientHeight;
      this.overlayCanvas.width = w;
      this.overlayCanvas.height = h;
      let vw = video.videoWidth;
      let vh = video.videoHeight;
      //this.overlayCtx.translate(0,0);
      this.overlayCtx.scale(w/vw, h/vh);
    },
    clearOverlay() {
      let video = this.$refs.webcam.$el;
      this.overlayCtx.clearRect(0, 0,video.videoWidth, video.videoHeight);
    },
    drawHands(hands) {
      this.clearOverlay();
      // hands.sort((hand1, hand2) => {
      //   if (hand1.handedness < hand2.handedness) return 1;
      //   if (hand1.handedness > hand2.handedness) return -1;
      //   return 0;
      // });

      // for (let i = 0; i < hands.length; ++i) {
      //   if (hands[i].keypoints != null) {
      //     this.drawHandKeypoints(hands[i].keypoints, hands[i].handedness);
      //   }
      // }
      this.drawHandKeypoints(this.overlayCtx, hands[0].keypoints, hands[0].handedness);
    },
    drawHandKeypoints(canvasCtx, keypoints, handedness) {
      const keypointsArray = keypoints;
      canvasCtx.fillStyle = handedness === 'Left' ? 'Red' : 'Blue';
      canvasCtx.strokeStyle = 'White';
      canvasCtx.lineWidth = 3;

      const fingers = Object.keys(fingerLookupIndices);
      for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i];
        const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
        this.drawPath(canvasCtx,points, false);
      }
      for (let i = 0; i < keypointsArray.length; i++) {
        const y = keypointsArray[i].x;
        const x = keypointsArray[i].y;
        this.drawPoint(canvasCtx,x, y, 6);
      }
    },

    drawPath(canvasCtx,points, closePath) {
      const region = new Path2D();
      region.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point.x, point.y);
      }

      if (closePath) {
        region.closePath();
      }
      canvasCtx.stroke(region);
    },

    drawPoint(canvasCtx, y, x, r) {
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, r, 0, 2 * Math.PI);
      canvasCtx.fill();
    },

    onCameras(devices) {
      this.captureDevices = [...this.captureDevices, ...devices.map(el=>el.deviceId)];
      this.currentCaptureDeviceIndex = 0;
      console.log("capture devices : ", devices.length);
    },
    onStarted() {
      if(this.deviceType == "WEBCAM"){
        this.$emit("started");
      }
      this.cameraReady = true;
    },
    onStoped() {
      if(this.deviceType == "WEBCAM"){
        this.$emit("stoped");
      }
      this.cameraReady = false;
    },
    nextCamera() {
      this.currentCaptureDeviceIndex++;
      if (this.currentCaptureDeviceIndex >= this.captureDevices.length) {
        this.currentCaptureDeviceIndex = 0;
      }
      console.log(
        "change camera to : ",
        this.captureDevices[this.currentCaptureDeviceIndex]
      );
      // webcam
      if(this.deviceType == "WEBCAM"){
        this.$refs.webcam.changeCamera(
          this.captureDevices[this.currentCaptureDeviceIndex]
        );
      }
      else if(this.deviceType == "STREAM"){
        console.log("start stream");
        this.$emit("started");
      }
      // reset canvas
      this.ctx = null;
    },
    async snap() {
      let image = await this.captureWithHand();
      return image;
    },
    canvasToBlob(canvas, format = "image/jpeg", quality = 0.8) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject();
            }
          },
          format,
          quality
        );
      });
    },
    serializeHand(keypoints) {
      if (keypoints.length !== 21) {
        return null;
      }
      let ret = [];
      for (let i = 1; i < 21; i++){
        let distX = keypoints[0].x - keypoints[i].x;
        let distY = keypoints[0].y - keypoints[i].y;
        ret.push(distX);
        ret.push(distY);
      }
      return ret;
    },
    async captureWithHand() {
      let src,width,height;
      if(this.deviceType == "WEBCAM"){
        src = this.$refs.webcam.$refs.video;
        width = src.videoWidth;
        height = src.videoHeight;
      }else if(this.deviceType == "STREAM" || this.deviceType == "SIM"){
        src = this.$refs.displayImage;
        width = src.clientWidth;
        height = src.clientHeight;
      }
      if (!this.ctx) {
        let canvas = document.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
      }
      const { ctx, canvas } = this;
      ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
      let serialized = null;
      let handed = null;
      if (this.currentHand) {
        serialized = this.serializeHand(this.currentHand.keypoints);
        handed = this.currentHand.handedness;
        this.drawHandKeypoints(ctx, this.currentHand.keypoints, this.currentHand.handedness);
      }
      let image = await this.canvasToBlob(canvas);
      return {
        image: image,
        keypoints: serialized,
        handedness: handed,
        thumbnail: null,
        width: canvas.width,
        height: canvas.height,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.video-container {
  position: relative;
}
.cam-overlay{
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.config-camera-float-button {
  display: inline;
  position: absolute;
  margin-top: -38px;
  right: 20px;
}

.display-panel {
  border-radius: 8px;
  background-color: #333;
  overflow: hidden;
  margin-top: 15px;
  display: flex;
  .display-image {
    margin: 0;
    canvas {
      min-height: 180px;
      height: 180px;
      width: 100%;
      object-fit: cover;
    }
  }
}
.liveview {
  margin: 2em 1em;
}
</style>

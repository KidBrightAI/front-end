<template>
  <div class="display-panel liveview">
    <div class="config-camera-float-button">
      <b-avatar
        :disabled="!cameraReady"
        :icon="running ? 'pause' : 'play'"
        :size="32"
        button
        @click="onAi"
      ></b-avatar>
      <b-avatar
        v-if="simulator"
        icon="box"
        :size="32"
        button
        @click="$emit('openSim')"
      ></b-avatar>
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
import * as poseDetection from "@tensorflow-models/pose-detection";

import { mapState, mapActions, mapMutations, mapGetters } from "vuex";

export default {
  components: {},
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
      default: "100%",
    },
    simulator: {
      type: Boolean,
      default: true,
    },
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
      currentPose: null,
    };
  },
  async mounted() {
    await tf.setBackend('webgl');
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      runtime: "mediapipe", // or 'tfjs'
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose/",
    };
    this.detector = await poseDetection.createDetector(model, detectorConfig);
  },
  beforeDestroy() {
    console.log("beforeDestroy");
    this.running = false;
  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
    deviceType() {
      let curr = this.captureDevices[this.currentCaptureDeviceIndex];
      if (!curr) {
        return "WEBCAM";
      } else if (curr.length == 64 && !curr.startsWith("http")) {
        return "WEBCAM";
      } else if (curr.startsWith("http")) {
        return "STREAM";
      } else if (curr == "SIM") {
        return "SIM";
      }
    },
    captureDevice() {
      console.log("capture device change");
      if (
        Array.isArray(this.captureDevices) &&
        this.captureDevices.length > 0
      ) {
        return this.captureDevices[this.currentCaptureDeviceIndex];
      } else {
        return null;
      }
    },
  },
  methods: {
    getPose() {
      return this.currentPose;
    },
    getSerializedKeypoint() {
      if (this.currentPose) {
        return this.serializeKeypoint(this.currentPose.keypoints);
      }
    },
    delay(millisec) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("");
        }, millisec);
      });
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
          const poses = await this.detector.estimatePoses(video);
          if (poses.length) {
            this.drawPose(poses[0]);
            this.currentPose = poses[0];
          } else {
            this.clearOverlay();
            this.currentPose = null;
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
      this.overlayCtx.scale(w / vw, h / vh);
    },
    clearOverlay() {
      let video = this.$refs.webcam.$el;
      this.overlayCtx.clearRect(0, 0, video.videoWidth, video.videoHeight);
    },
    drawPose(pose) {
      this.clearOverlay();
      if (pose.keypoints != null) {
        this.drawKeypoints(this.overlayCtx, pose.keypoints);
        this.drawSkeleton(this.overlayCtx, pose.keypoints, pose.id);
      }
    },

    drawKeypoints(ctx, keypoints) {
      const keypointInd = poseDetection.util.getKeypointIndexBySide(
        poseDetection.SupportedModels.MoveNet
      );
      ctx.fillStyle = "Red";
      ctx.strokeStyle = "White";
      ctx.lineWidth = 4;

      for (const i of keypointInd.middle) {
        this.drawKeypoint(ctx,keypoints[i]);
      }

      ctx.fillStyle = "Green";
      for (const i of keypointInd.left) {
        this.drawKeypoint(ctx,keypoints[i]);
      }

      ctx.fillStyle = "Orange";
      for (const i of keypointInd.right) {
        this.drawKeypoint(ctx,keypoints[i]);
      }
    },

    drawKeypoint(ctx,keypoint) {
      // If score is null, just show the keypoint.
      const score = keypoint.score != null ? keypoint.score : 1;
      const scoreThreshold = 0.3;

      if (score >= scoreThreshold) {
        const circle = new Path2D();
        circle.arc(
          keypoint.x,
          keypoint.y,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill(circle);
        ctx.stroke(circle);
      }
    },

    drawSkeleton(ctx, keypoints, poseId) {
      // Each poseId is mapped to a color in the color palette.
      const color = "White";
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;

      poseDetection.util
        .getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
        .forEach(([i, j]) => {
          const kp1 = keypoints[i];
          const kp2 = keypoints[j];

          // If score is null, just show the keypoint.
          const score1 = kp1.score != null ? kp1.score : 1;
          const score2 = kp2.score != null ? kp2.score : 1;
          const scoreThreshold = 0.3;

          if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
          }
        });
    },

    onCameras(devices) {
      this.captureDevices = [
        ...this.captureDevices,
        ...devices.map((el) => el.deviceId),
      ];
      this.currentCaptureDeviceIndex = 0;
      console.log("capture devices : ", devices.length);
    },
    onStarted() {
      if (this.deviceType == "WEBCAM") {
        this.$emit("started");
      }
      this.cameraReady = true;
    },
    onStoped() {
      if (this.deviceType == "WEBCAM") {
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
      if (this.deviceType == "WEBCAM") {
        this.$refs.webcam.changeCamera(
          this.captureDevices[this.currentCaptureDeviceIndex]
        );
      } else if (this.deviceType == "STREAM") {
        console.log("start stream");
        this.$emit("started");
      }
      // reset canvas
      this.ctx = null;
    },
    async snap() {
      let image = await this.captureWithPose();
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
    serializeKeypoint(keypoints) {
      if (keypoints.length !== 17) {
        return null;
      }
      let ret = [];
      for (let i = 1; i < 17; i++) {
        let distX = keypoints[0].x - keypoints[i].x;
        let distY = keypoints[0].y - keypoints[i].y;
        ret.push(distX);
        ret.push(distY);
      }
      return ret;
    },
    async captureWithPose() {
      let src, width, height;
      if (this.deviceType == "WEBCAM") {
        src = this.$refs.webcam.$refs.video;
        width = src.videoWidth;
        height = src.videoHeight;
      } else if (this.deviceType == "STREAM" || this.deviceType == "SIM") {
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
      let poseId = 0;
      if (this.currentPose) {
        serialized = this.serializeKeypoint(this.currentPose.keypoints);
        poseId = this.currentPose.id;
        this.drawKeypoints(ctx, this.currentPose.keypoints);
        this.drawSkeleton(ctx, this.currentPose.keypoints, this.currentPose.id);
      }
      let image = await this.canvasToBlob(canvas);
      return {
        image: image,
        keypoints: serialized,
        poseId: poseId,
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
.cam-overlay {
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

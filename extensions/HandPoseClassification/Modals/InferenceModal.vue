<template>
  <b-modal
    id="inference"
    centered
    size="md"
    title="TEST"
    modal-class="my-modal-class"
    :hide-footer="true"
    @close="onClose"
    @hide="onClose"
  >
    <div class="display-screen">
      <image-capture-with-hand-detection
        :width="435"
        source=""
        ref="camera"
        :simulator="false"
        @started="(_) => (cameraReady = true)"
        @stoped="(_) => (cameraReady = false)"
      ></image-capture-with-hand-detection>
    </div>
    <div class="infer-class">
      <img
        class="tag"
        src="~/assets/images/UI/svg/Group 177_green.svg"
        height="24"
      />
      <span>{{ result }} [{{ (prob * 100).toFixed(2) }}%]</span>
    </div>
    <div class="infer_control">
      <b-avatar
        button
        @click="onInfer"
        :disabled="!cameraReady"
        variant="primary"
        :icon="terminated ? 'play-fill' : 'stop-fill'"
        class="align-baseline"
      ></b-avatar>
    </div>
  </b-modal>
</template>
<script>
import axios from "axios";
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import ImageCaptureWithHandDetection from "~/components/InputConnection/ImageCaptureWithHandDetection.vue";
import * as knnClassifier from '@tensorflow-models/knn-classifier';

export default {
  name: "InferenceModal",
  components: {
    ImageCaptureWithHandDetection,
  },
  props: {
    classifier: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      terminated: true,
      cameraReady: false,
      result: "-",
      prob: 0,
      labels: [],
    };
  },
  computed: {
    ...mapState("project", ["project"]),
    ...mapState("dataset", ["dataset"]),
  },
  methods: {
    doInference: async function () {
      if (this.terminated) {
        return;
      }
      if (!this.cameraReady) {
        await this.sleep(500);
        return await this.doInference();
      }
      let keypoints = this.$refs.camera.getSerializedKeypoint();
      if (keypoints) {
        keypoints = tf.tensor(keypoints);
        const result = await this.classifier.predictClass(keypoints);
        this.result = result.label;
        this.prob = result.confidences[this.result];
      } else {
        this.result = "-";
        this.prob = 0;
      }
      await this.sleep(50);
      return await this.doInference();
    },
    onInfer: async function () {
      if (this.classifier == null) {
        console.log("classifier is null")
        return;
      }
      this.terminated = !this.terminated;
      console.log("terminated : ", this.terminated);
      if (!this.terminated) {
        await this.doInference();
      }
    },
    onClose: async function () {
      this.terminated = true;
      this.cameraReady = false;
    },
    sleep: function (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>
<style lang="scss" scoped>
.display-screen {
  background-color: #fff;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  margin-top: 10px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.infer-class {
  padding: 10px;
  img {
    margin-right: 0.5em;
  }
  span {
    font-weight: 600;
  }
}
.infer_control {
  text-align: center;
}
</style>

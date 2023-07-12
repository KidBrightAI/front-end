<template>
  <div class="w-100 h-100">
    <div class="d-flex w-100 h-100 outer-wrap">
      <splitpanes class="default-theme" style="width: 100%;" @resized="onViewResized">
        <pane size="80">
          <div class="d-flex flex-column h-100">
            <div class="d-flex flex-fill align-items-center justify-content-center view-panel">
              <image-display
                v-if="current.length && mode == 'CAM'"
                :id="current.slice(-1).pop()"
              ></image-display>

              <p class="view-img-desc" v-if="!current.length && mode == 'CAM'">
                No selected image, please click on the image below to select.
              </p>
              <dataset-counter
                :current="current.length ? positionOf(current.slice(-1).pop()) + 1 : null"
                suffix="Image"
              ></dataset-counter>
            </div>
            <!-- <image-dataset-list v-model="current"></image-dataset-list> -->
            <image-dataset-list
              v-model="current"
              :multiple="true"
              :showInfo="true"
            ></image-dataset-list>
          </div>
        </pane>

        <pane class="d-flex justify-content-center">
          <div class="side-panel">
            <image-capture-with-hand-detection
              v-show="mode == 'CAM'"
              @openSim="mode = 'SIM'"
              source=""
              ref="camera"
              :width="'100%'"
              @started="(_) => (cameraReady = true)"
              @stoped="(_) => (cameraReady = false)"
            >
            </image-capture-with-hand-detection>
            <div class="center">
              <img
                v-on:click.prevent
                :class="[
                  'op-btn',
                  { 'op-btn-disable': !cameraReady && mode != 'SIM'},
                ]"
                src="~/assets/images/UI/png/Group 198.png"
                height="96"
                @click="snapAndSave"
              />
              <img
                v-b-modal.import-classify-image
                class="op-btn"
                src="~/assets/images/UI/png/Group 199.png"
                height="96"
              />
            </div>

          </div>
        </pane>

      </splitpanes>

    </div>
    <import-images></import-images>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import ImageCapture from "~/components/InputConnection/ImageCapture.vue";
import ImageDisplay from "~/components/InputConnection/ImageDisplay.vue";
import ImageDatasetList from "~/components/InputConnection/ImageDatasetList.vue";
import DatasetCounter from "~/components/InputConnection/DatasetCounter.vue";
import ImportImages from "../Modals/ImportImages.vue";
import SimulatorController from "~/components/InputConnection/SimulatorController.vue";

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import ImageCaptureWithHandDetection from '~/components/InputConnection/ImageCaptureWithHandDetection.vue';

export default {
  name: "Capture",
  components: {
    ImageCapture,
    ImageDisplay,
    ImageDatasetList,
    DatasetCounter,
    ImportImages,
    SimulatorController,
    Splitpanes,
    Pane,
    ImageCaptureWithHandDetection
  },
  data() {
    return {
      mode: "CAM", //SIM or CAM
      current: [],
      cameraReady: false,
    };
  },
  computed: {
    ...mapGetters("dataset", ["positionOf"]),
  },
  methods: {
    ...mapActions("dataset", ["addData"]),

    onViewResized() {
      this.$refs.camera.resizeOverlay();
    },

    async snapAndSave() {
      if (this.mode == "SIM") {
        let { image, thumbnail, width, height } =
          await this.$refs.simulator.snap();
        let data = {
          id: this.$helper.randomString(16),
          thumbnail: image,
          image: image,
          annotate: [],
          class: null,
          ext: "jpg",
        };
        let res = await this.addData(data);
      } else {
        let { image, thumbnail, width, height, keypoints, handedness } = await this.$refs.camera.snap();
        console.log(keypoints);
        console.log(handedness);
        let data = {
          id: this.$helper.randomString(16),
          thumbnail: thumbnail,
          image: image,
          keypoints: keypoints,
          handedness: handedness,
          annotate: [],
          class: null,
          ext: "jpg",
        };
        let res = await this.addData(data);
        this.current = [data.id];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;


.op-btn {
  transition: opacity 0.3s ease-in;
  cursor: pointer;
  margin: 0 0.5em;
  &:hover {
    opacity: 0.7;
  }
}
.op-btn-disable {
  pointer-events: none;
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
}
.side-panel {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  .next {
    height: 50px;
    background: #ffffff 0% 0% no-repeat padding-box;
    border-radius: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 15px;

    span {
      color: $primary-color;
      font-size: 1.5rem;
      font-weight: 800;
      &.ico {
        position: absolute;
        top: 7px;
        right: 18px;
      }
    }
  }
}
.outer-wrap {
  overflow: hidden;
}
.main-panel {
  width: calc(100% - 300px);
}
.view-panel {
  background-color: #333;
  position: relative;
  img {
    min-width: 50%;
    min-height: 50%;
    object-fit: contain;
  }
  .view-img-desc {
    color: #fff;
  }
}
</style>

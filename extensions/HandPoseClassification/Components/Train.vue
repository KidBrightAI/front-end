<template>
  <div style="height: 100vh; width: 100vw">
    <b-input-group class="train-panel">
      <b-input-group-append>
        <b-button
          class="btn train-btn"
          :variant="isTraining ? 'danger' : 'primary'"
          :disabled="isTerminating"
          @click="handleTrain()"
        >
          <b-spinner v-if="isTerminating" small></b-spinner>
          <b-spinner v-else-if="isTraining" small type="grow"></b-spinner>
          {{ isTraining ? "Terminate" : "Train" }}
        </b-button>
        <b-button
          class="btn base-btn"
          v-b-modal.inference
          :disabled="!isTrained"
        >
          Test
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <div
      class="test"
      style="height:calc(100vh - 80px)"
      @mousedown.stop
    >
      <MLModelDesigner></MLModelDesigner>
    </div>

    <sync-project-modal></sync-project-modal>
    <inference-modal></inference-modal>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";

import MLModelDesigner from "~/components/MLModelDesign.vue";
import SyncProjectModal from "~/components/Modals/SyncProjectModal.vue";
import ServerReport from "~/components/ServerReport.vue";
import InferenceModal from "../Modals/InferenceModal.vue";
import axios from "axios";
import { Multipane, MultipaneResizer } from "vue-multipane";

import * as knnClassifier from '@tensorflow-models/knn-classifier';

export default {
  name: "Train",
  components: {
    Multipane,
    MultipaneResizer,
    SyncProjectModal,
    MLModelDesigner,
    ServerReport,
    InferenceModal,
  },
  props: {},
  data() {
    return {
      isTraining: false,
      isTrained: false,
      isTerminating: false,
      isDownloading: false,
      isConverting: false,
      classifier : null,
    };
  },
  computed: {
    ...mapState("dataset", ["dataset"]),
    ...mapState("project",["project"]),
  },
  methods: {
    ...mapActions(["saveProject"]),
    ...mapMutations("project", [
      "savePretrained",
      "saveTfjs",
      "saveEdgeTPU",
      "saveModelLabel"
    ]),
    handleTrain: async function () {
      await tf.setBackend('webgl');
      if (this.project.model.code.includes("knn")) {
        this.isTraining = true;
        this.isTrained = false;
        this.classifier = knnClassifier.create();
        this.classifier.clearAllClasses();
        await this.train();
        let labels = Object.keys(this.classifier.getClassExampleCount());
        this.saveTfjs("knn");
        this.saveModelLabel(labels);
        this.isTraining = false;
        this.isTrained = true;
      }
      // if (this.isTraining) {
      //   await this.$store.dispatch("server/terminate");
      // } else {
      //   if(this.currentDevice == "ROBOT"){
      //     await this.$store.dispatch("saveProject");
      //   }
      //   await this.$store.dispatch("server/train");
      // }
    },
    train: function () {
      return new Promise((resolve, reject) => {
        for (let item of this.dataset.data) {
          this.classifier.addExample(tf.tensor(item.keypoints), item.class);
        }
        resolve();
      })
    },
    handleInference: function () {},
  },
  mounted() {

  },

};
</script>

<style lang="scss" scoped>
$primary-color: #007e4e;
.horizontal-panes {
  width: 100%;
  height: calc(100vh - 80px);
  border: 1px solid #ccc;
  overflow: hidden;
}
.multipane.horizontal-panes.layout-h .multipane-resizer {
  margin: 0;
  top: 0; /* reset default styling */
  height: 5px;
  background: #aaa;
}
.train-panel {
  padding: 20px;
  background: #222;
  height: 78px;
  display: flex;
  justify-content: flex-end;
}
.train-btn {
  color: white;
  margin-left: 10px !important;
  border-radius: 15px !important;
  min-width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
.base-btn {
  color: white;
  background-color: $primary-color;
  margin-left: 10px !important;
  border-radius: 15px !important;
  min-width: 150px;
  &:disabled {
    opacity: 0.7;
  }
}
</style>

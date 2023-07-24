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

    <multipane layout="horizontal" class="horizontal-panes multplane">
      <div
        class="test"
        :style="{ height: '70%', maxHeight: '90%', minHeight: '10%' }"
        @mousedown.stop
      >
        <MLModelDesigner></MLModelDesigner>
      </div>
      <multipane-resizer></multipane-resizer>
      <div :style="{ display: 'flex', flexGrow: 1, width: '100%' }">
        <b-tabs card class="tab-flex w-100" content-class="grow-container">
          <b-tab title="Message Logs" style="padding : 0px; width: 100%;">
            <div class="monitor-console">
              <ol ref="monitor" class="monitor-line">
                <li v-for="(line,inx) in message" :key="inx" class="serial-line" :style="[line.includes('Error') ? {'color':'orangered'} : {}]">
                  {{line}}
                </li>
              </ol>
            </div>
          </b-tab>
        </b-tabs>
      </div>
    </multipane>
    <inference-modal :classifier="classifier"></inference-modal>
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
      classifier: null,
      message:[],
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
      this.message = ["Start training..."];
      return new Promise((resolve, reject) => {
        for(let i = 0; i < this.dataset.data.length; i++){
          this.message.push(`Training step ${i+1}/${this.dataset.data.length} : [${this.dataset.data[i].class}] to classifier`);
          this.classifier.addExample(tf.tensor(this.dataset.data[i].keypoints), this.dataset.data[i].class);
        }
        this.message.push("Training completed");
        resolve();
      })
    },
    handleInference: function () {},
  },
  watch:{
    message(){
      let m = this.$refs.monitor;
      if (m) {
        this.$nextTick(_ => {
          m.scrollIntoView(false);// = m.scrollHeight;
        });
      }
    }
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

ol{
  list-style-type: none;
  counter-reset: elementcounter;
  padding-left: 0;
}
li:before{
  content: "  ";
  /* content: counter(elementcounter) " |"; */
  /* counter-increment:elementcounter; */
  font-weight: bold;
}
.monitor-line{
  padding-left: 10px;
}
.monitor-console {
  width: 100%;
  height: 100%;
  background-color: #363636;
  color: white;
  position: absolute;
  overflow-y: auto;
}
</style>

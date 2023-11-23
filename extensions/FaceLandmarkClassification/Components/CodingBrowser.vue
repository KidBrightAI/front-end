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
          <simulator-input-source-controller
            style="width: 50%"
            ref="simulator"
            :showController="false"
            :captureKey="false"
            v-slot="instance"
          >
            <image-capture-with-facelandmark-detection ref="streamer" :source="instance" :simulator="false"></image-capture-with-facelandmark-detection>
          </simulator-input-source-controller>
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
import SimulatorInputSourceController from "~/components/InputConnection/SimulatorInputSourceController.vue";
import BlocklyCode from "@/components/BlocklyCode.vue";
import Toolbox from "../Blocks/toolbox";
import Blocks from "../Blocks/blocks";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import axios from "axios";
import ImageSourceStreamer from "~/components/InputConnection/ImageSourceStreamer.vue";
import ImageCaptureWithFacelandmarkDetection from "~/components/InputConnection/ImageCaptureWithFacelandmarkDetection.vue";
import runner from "../facelandmark.worker.js";

export default {
  name: "BlocklyComponent",
  components: {
    BlocklyCode,
    SimulatorInputSourceController,
    ImageSourceStreamer,
    ImageCaptureWithFacelandmarkDetection
  },
  data() {
    return {
      model: null,
      isRunning: false,
      worker: null,
      toolbox: Toolbox,
      block: Blocks,
      mqttClient: null,
    };
  },
  methods: {
    handleRun: async function() {
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
          this.worker.postMessage({ command : "RESPONSE", subcommand : "MODEL", data: modelInfo});
        }
        if(event.data.data == "IMAGE"){
          //////////////////////////////////
          let keypoints = this.$refs.streamer.getSerializedKeypoint();
          //////////////////////////////////
          this.worker.postMessage({command : "RESPONSE", subcommand : "IMAGE", data: keypoints});
        }
      }else if(event.data.command == "TERMINATED"){
        this.term.write(event.data.msg);
        this.isRunning = false;
        this.stop();
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
    },
    async initModel() {
      return {
        dataset: this.dataset.data,
        model: this.project.model.code,
      }
    },

    run : async function() {
      this.term.write("Running ...\r\n");
      //========== start worker ==============//
      this.worker = new runner();
      this.worker.onerror = this.onWorkerError.bind(this);
      this.worker.onmessage = this.processCommand.bind(this);

      let labels = this.project.modelLabel;

      //========== load tfjs model ===========//
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("1");
      var code = this.project.code;
      var codeAsync = `(async () => {
        ${code}
        postMessage({ command: "TERMINATED", msg: "Terminated\\r\\n" });
      })();`;
      console.log(codeAsync);
      try {
        this.worker.postMessage({ command: "RUN", code: codeAsync, labels : labels });
      } catch (error) {
        console.log(error);
      }
    },
    stop() {
      console.log("stop!!!");
      this.$refs.simulator.$refs.gameInstance.contentWindow.MSG_RunProgram("0");
      //========== stop web worker ======//
      this.worker.terminate();
    },
  },
  computed: {
    ...mapState("project", ["project"]),
    ...mapState("dataset", ["dataset"]),
  },
  mounted() {
    this.term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(this.$refs.terminal);
    fitAddon.fit();
    console.log("model tfjs path : ", this.project.tfjs);
    this.term.write("$ ");
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

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

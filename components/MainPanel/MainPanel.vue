<template>
  <div class="left-panel d-flex flex-column">
    <div class="l-title font-weight-bold">KidBright AI</div>
    <main-menu></main-menu>
    <div class="left-bottom-content d-flex flex-fill position-relative">
      <div class="header-left-bar">
        <div class="proj-name">
          {{ project.name || 'สร้างหรือเลือกโปรเจคใหม่' }}
        </div>
        <div class="proj-type">
          Type : {{ project.projectTypeTitle || '-' }}
        </div>

        <div class="header-action-button">
          <b-button
            :disabled="currentDevice == 'BROWSER'"
            @click="openWiFiModal"
          >
            <b-icon
              class="mr-1"
              :icon="
                currentDevice == 'BROWSER'
                  ? 'wifi'
                  : currentWifi
                  ? 'wifi'
                  : 'wifi-off'
              "
            ></b-icon>
            {{
              currentDevice == "BROWSER"
                ? isOnline
                  ? "ONLINE"
                  : "OFFLINE"
                : currentWifi
                ? currentWifi.ssid
                  ? currentWifi.ssid
                  : "No Internet"
                : "No Internet"
            }}
          </b-button>

          <b-button
            @click="onToggleDevice"
            :disabled="initialDevice == 'BROWSER'"
          >
            <b-icon
              v-if="currentDevice == 'ROBOT'"
              class="mr-1"
              icon="cpu"
            ></b-icon>
            <b-icon v-else class="mr-1" icon="laptop"></b-icon>
            {{ currentDevice }}
          </b-button>
        </div>
      </div>
      <ul class="step">
        <li
          :class="{
            current: selectedMenu === 1,
            inactive: project.id == null,
          }"
          @click="project.id && handleTabChange(1)"
        >
          <img src="~/assets/images/UI/png/capture.png" alt="" srcset="" />
        </li>
        <li
          v-bind:class="{
            current: selectedMenu === 2,
            inactive: dataLength <= 0,
          }"
          v-on:click="
            if (dataLength > 0) {
              handleTabChange(2);
            }
          "
        >
          <img src="~/assets/images/UI/png/annotate.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 3,
            inactive: getLabeledLength <= 0,
          }"
          @click="
            if (getLabeledLength > 0) {
              handleTabChange(3);
            }
          "
        >
          <img src="~/assets/images/UI/png/train.png" alt="" srcset="" />
        </li>
        <li
          :class="{
            current: selectedMenu == 4,
            inactive: currentDevice == 'BROWSER' && !project.tfjs && !project.trained,
          }"
          @click="
              handleTabChange(4);
          "
        >
          <img src="~/assets/images/UI/png/code.png" alt="" srcset="" />
        </li>
      </ul>
      <div v-if="project.projectType == null" class="hint">
        <div class="main-hint txt notype">
          <p v-if="project.projectType == null">
            เริ่มใช้งานโดยกด
            <img src="~/assets/images/UI/png/Group 105.png" alt="" srcset="" />
            เพื่อสร้างโปรเจคและทำการเลือกประเภทการเรียนรู้
            <span class="p-color">Object Detection</span> หรือ
            <span class="p-color">Image Classification</span
            ><br /><br />ในกรณีที่เลือก
            <span class="p-color">Object Detection</span>
            กระบวนการสร้างโมเดล (Training) ทำบน Colab
            จำเป็นต้องเชื่อมต่ออินเทอร์เน็ตให้เรียบร้อยก่อน<br /><br />ในกรณีที่เลือก
            <span class="p-color">Image Classification</span>
            กระบวนการสร้างโมเดล (Training) ทำบน KidBright AI
          </p>
        </div>
        <div class="mascot">
          <img
            v-if="!isRunning"
            src="~/assets/images/UI/png/Mask Group 11.png"
            alt=""
            srcset=""
          />
        </div>
      </div>
      <div v-if="selectedMenu === 1" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.capture"
          target="./Instructions/CaptureInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.capture"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 2" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.annotate"
          target="./Instructions/AnnatateInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.annotate"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 3" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.train"
          target="./Instructions/TrainInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.train"
        ></extension-async-component>
      </div>
      <div v-if="selectedMenu === 4" class="d-contents">
        <async-component
          v-if="!project.extension.instructions.coding"
          target="./Instructions/CodingInstruction.vue"
        ></async-component>
        <extension-async-component
          v-else
          :target="project.extension.instructions.coding"
        ></extension-async-component>
      </div>
    </div>
  </div>

</template>
<script>

/////////////////// Virtual Kanomchan (start) ///////////////////
export let _sessionid = generateRandomSessionID(15);
export let _ip;
export let _duration = 0;
fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      //document.getElementById('ip').textContent = `${data.ip}`;
      _ip = `${data.ip}`;

      console.log(_ip);
    })
    .catch(error => {
      //document.getElementById('ip').textContent = 'Unable to fetch IP address';
      _ip = 'none';
});
function generateRandomSessionID(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
setInterval(GetTimeDuration,1000);
function GetTimeDuration(){
  _duration++;
}
/////////////////// Virtual Kanomchan (end) ///////////////////

import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import AsyncComponent from "~/components/AsyncComponent.vue";
import ExtensionAsyncComponent from "~/components/ExtensionAsyncComponent.vue";
export default {
  components: {
    AsyncComponent,
    ExtensionAsyncComponent,
  },
  props: ["selectedMenu"],
  model: {
    prop: "selectedMenu",
    event: "menuChange",
  },
  data() {
    return {
      parentVariable: 'Shared data from parent',
      exts: this.$extensions,
    };
  },
  created() {},
  mounted() {
    /////////////////// Virtual Kanomchan ///////////////////
    this.initImpact = setTimeout(()=>{this.InitImpact();},2000);
    this.updateImpact = setInterval(()=>{this.UpdateImpact();},15000);
  },

  computed: {
    ...mapState("project", [
      "project",
      "listProjectModal",
      "isLoading",
      "isSaving",
      "labelFile",
    ]),
    ...mapState(["currentDevice", "initialDevice", "isRunning", "currentWifi"]),
    ...mapGetters("dataset", ["dataLength", "getLabeledLength"]),
    isOnline() {
      return window.navigator.onLine;
    },
  },
  beforeDestroy() {
    // Clear interval to prevent memory leaks
    clearInterval(this.UpdateImpact);
  },
  methods: {
    ...mapMutations(["setDevice"]),
    openWiFiModal() {
      console.log("connect wifi");
      this.$bvModal.show("wifi_conn");
    },
    handleTabChange(tabIndex) {
      //this.menu = tabIndex;
      this.$emit("menuChange", tabIndex);
    },
    onToggleDevice() {
      if (this.currentDevice == "BROWSER") {
        this.setDevice("ROBOT");
      } else {
        this.setDevice("BROWSER");
      }
    },

    /////////////////// Virtual Kanomchan (start) ///////////////////
    async InitImpact() {
        try {

            const response = await fetch("/AE/impactvkinsert", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ip: _ip,
                duration: _duration,
                sessionid: _sessionid
              })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json(); // Wait for JSON response
            
            // this.users = data; // Store fetched data in the users array (uncomment to use)
            //console.log("mycompute Done", data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    },
    async UpdateImpact() {
        try {

            const response = await fetch("/AE/impactvkupdate", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ip: _ip,
                duration: _duration,
                sessionid: _sessionid
              })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json(); // Wait for JSON response
            
            // this.users = data; // Store fetched data in the users array (uncomment to use)
            //console.log("mycompute Done", data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    },
    /////////////////// Virtual Kanomchan (end) ///////////////////
  },
};
//module.exports = { ipFormImpact};

</script>

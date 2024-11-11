<template>
  <div class="game-container">
    <div v-show="classify || bbox.length" class="display-controller">
      <div v-show="bbox.length" class="bboxes" ref="boxContainer">
        <div
          v-for="(box, i) in boxes"
          :key="i"
          class="bbox"
          :style="{
            left: box.x1 + 'px',
            top: box.y1 + 'px',
            width: box.x2 - box.x1 + 'px',
            height: box.y2 - box.y1 + 'px',
          }"
        >
          <span class="label-box">{{ box.label }}</span>
        </div>
      </div>
      <div class="classify-result">{{ classify }}</div>
    </div>
    <iframe
      ref="gameInstance"
      width="100%"
      height="100%"
      scorlling="no"
      border="0"
      src="/VKBuild/index.html"
      frameborder="0"
    />

    <div v-if="showController" class="game-controller">
      <b-avatar
        icon="x-circle-fill"
        :size="52"
        button
        class="ml-4"
        @click="$emit('close')"
      ></b-avatar>
    </div>
    <slot :instance="$refs"></slot>
  </div>
</template>
<script>
/*let _sessionid = generateRandomSessionID(15);
let _ip;
let _duration = 0;
fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      //document.getElementById('ip').textContent = `${data.ip}`;
      _ip = `${data.ip}`;
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
}*/

import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
export default {
  props: {
    showController: {
      type: Boolean,
      default: true,
    },
    captureKey: {
      type: Boolean,
      default: true,
    },
    classify: {
      type: String,
      default: "",
    },
    bbox: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isStreaming: false,
      boxes: [],
    };
  },
  created() {},
  mounted() {
    if (this.captureKey) {
      this.$refs.gameInstance.contentWindow.addEventListener(
        "keyup",
        this.onKey.bind(this)
      );
    }
    //database test
    //this.initImpact = setTimeout(()=>{this.InitImpact();},2000);
    //this.updateImpact = setInterval(()=>{this.UpdateImpact();},15000);
  },
  computed: {
    ...mapState(["currentDevice", "initialDevice", "streamUrl"]),
    deviceType(){
      return "SIM";
    }
  },
  watch: {
    bbox: function (newValue) {
      if (newValue && newValue.length) {
        this.boxes = newValue.map((el) => {
          let cWidth = this.$refs.boxContainer.clientWidth / 320;
          let cHeight = this.$refs.boxContainer.clientHeight / 240;
          return {
            x1: el.left * cWidth,
            y1: el.top * cHeight,
            x2: el.right * cWidth,
            y2: el.bottom * cHeight,
            label: el.class,
            prob: el.score,
          };
        });
      }
    },
  },
  methods: {
    onKey(e) {
      if (e.key == "f") {
        this.$emit("snap");
      }
    },
    base64toBlob(base64Data, contentType = "image/jpeg") {
      contentType = contentType || "";
      var sliceSize = 1024;
      var byteCharacters = atob(base64Data);
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);

      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
    },
    getImageBase64() {
      return this.$refs.gameInstance.contentWindow.ImageBase64();
    },
    /*async InitImpact() {
        try {
            console.log(_ip + ", " + _duration + ", " + _sessionid);

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
            console.log("mycompute Done", data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    },
    async UpdateImpact() {
        try {
            console.log(_ip + ", " + _duration + ", " + _sessionid);

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
            console.log("mycompute Done", data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    },*/

    async snap() {
      let image = await this.captureWithTumbnail();
      return image;
    },
    async captureWithTumbnail(thumbnail_height = 120) {
      let res = this.$refs.gameInstance.contentWindow.ImageBase64();
      //res = "data:image/jpeg;base64," + res;
      //let b = await fetch(res);
      //let image = await b.blob();
      let image = this.base64toBlob(res);
      return {
        image: image,
        thumbnail: image,
        width: 320,
        height: 240,
      };
    },
  },
};

</script>
<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.display-controller {
  pointer-events: none;
  position: absolute;
  width: 100%;
  border: solid green 1px;
  top: 50%;
  aspect-ratio: 16 / 9;
  transform: translateY(-50%);
}
.classify-result {
  width: 100%;
  bottom: 0;
  position: absolute;
  text-align: center;
  color: white;
  background-color: #00000057;
}
.game-controller {
  position: absolute;
  bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  left: 50%;
  transform: translate(-50%, -50%);
}
.bboxes {
  width: 24%;
  height: 32%;
  right: 0;
  position: absolute;
  aspect-ratio: 4 / 3;
}
.bbox {
  display: block;
  position: absolute;
  border-width: 2px;
  border-color: green;
  border-style: solid;
}
.label-box {
  color: black;
  font-size: 11px;
  background-color: #fff;
}
</style>
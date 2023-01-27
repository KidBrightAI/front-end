<template>
  <div></div>
</template>

<script>
// import WebAudioRecorder from "../lib/web-audio-recorder-js/WebAudioRecorder.min.js";
export default {
  name: "Recorder",
  props: ["isRecording", "isShouldStart", "visualize", "upload"],
  data() {
    return {
      recorder: {},
    };
  },
  mounted() {
    let script = document.createElement("script");
    script.setAttribute(
      "src",
      "/js/WebAudioRecorder.min.js"
    );
    document.head.appendChild(script);
    var audioContext = new AudioContext();
    var input;
    var constraints = {
      audio: true,
      video: false,
    };
    var vm = this;
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        //stop the input from playing back through the speakers
        input.connect(audioContext.destination); //get the encoding
        
        this.recorder = new WebAudioRecorder(input, {
          workerDir: "/js/",
          encoding: "wav",
          timeLimit: 3,
          encodeAfterRecord: true,
          onEncoderLoading: function (recorder, encoding) {
            console.log("Loading " + encoding + " encoder...");
          },
          onEncoderLoaded: function (recorder, encoding) {
            console.log(encoding + " encoder loaded");
            vm.visualize(audioContext, stream, input);
          },
        });
        this.recorder.onComplete = function (rec, blob) {
          console.log("Encoding complete");
          vm.upload(blob)
        };
      })
      .catch(function (err) {});
  },
  methods: {},
  watch: {
    isShouldStart: function (value) {
      console.log(value);
      if (value && this.isRecording) {
        this.recorder.startRecording();
      } else if (!value && this.isRecording) {
        if (this.recorder.isRecording()) {
          this.recorder.finishRecording();
        }
      }
    },
  },
};
</script>

<style lang="css" scoped>
div {
  position: relative;
  background: #333333;
}
</style>
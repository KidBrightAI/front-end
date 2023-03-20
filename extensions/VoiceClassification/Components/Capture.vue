<template>
  <capture-browser v-if="currentDevice == 'BROWSER'"></capture-browser>
  <capture-robot v-else-if="currentDevice == 'ROBOT'"></capture-robot>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import CaptureBrowser from "./CaptureBrowser.vue";
import CaptureRobot from "./CaptureRobot.vue";

export default {
  name: "CaptureComponent",
  components: {
    CaptureBrowser,
    CaptureRobot
  },
  computed: {
    ...mapState(["currentDevice"]),
  }
};
</script>

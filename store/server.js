import axios from "axios";

export const state = () => ({
  url: "",
  isTraining: false,
  isTrained: false,
  isConnected: false,
  isConverted: false,
  isConverting: false,
  isSync: false,
  isTerminating: false,

  totalEpoch: 0,
  epoch: 0,
  totalBatch: 0,
  batch: 0,

  step: 0,
  progress: 0,
  message: [],
  matric: [],
  //{label : "train_loss", data : []}
});

export const mutations = {
  SOCKET_connect(state) {
    state.isConnected = true;
  },
  SOCKET_disconnect(state) {
    state.isConnected = false;
  },
  setSync(state, value) {
    state.isSync = value;
  },
  setStep(state, value) {
    state.step = value;
  },
  setTraining(state, value) {
    state.isTraining = value;
  },
  setTrained(state, value) {
    state.isTrained = value;
  },
  setConverting(state, value) {
    state.isConverting = value;
  },
  setConverted(state, value) {
    state.isConverted = value;
  },
  setURL(state, value) {
    state.url = value;
  },
  setProgress(state, progress) {
    state.progress = progress;
  },
  setTerminate(state, value) {
    state.isTerminating = value;
  },
  addMessage(state, message) {
    state.message.push(message);
  },
  addMatric(state, matric) {
    let target = state.matric;
    Object.keys(matric.matric).forEach((key) => {
      let dataKey = (matric.prefix || "") + key;
      let found = target.find((el) => el.label == dataKey);
      if (!found) {
        found = {
          label: dataKey,
          data: [matric.matric[key]],
        };
        target.push(found);
        return;
      }
      found.data[matric.label] = matric.matric[key];
    });
    state.matric = JSON.parse(JSON.stringify(target));
  },
  setEpoch(state, value) {
    state.epoch = value;
  },
  setTotalEpoch(state, value) {
    state.totalEpoch = value;
  },
  setBatch(state, value) {
    state.batch = value;
  },
  setTotalBatch(state, value) {
    state.totalBatch = value;
  },
  resetNewTrain(state) {
    state.isTrained = false;
    state.epoch = 0;
    state.batch = 0;
    state.totalEpoch = 0;
    state.totalBatch = 0;
    state.matric = [];
    state.message = [];
  },
};
export const getters = {
  matric(state) {
    return state.matric;
  },
};
export const actions = {
  async connect({ commit, dispatch, state }) {
    this._vm.$vueSocketIo.create(state.url, { autoConnect: true });
  },
  async terminate({ commit, dispatch, state, rootState }) {
    console.log("terminating");
    commit("setTerminate", true);
    if (state.step >= 2) {
      let project_id = rootState.project.project.id;
      const res = await axios.post(state.url + "/terminate_training", {
        project_id: project_id,
      });
    } else {
      console.log("project not sending command yet.");
    }
    console.log("terminate success");
    commit("setTerminate", false);
    commit("setTraining", false);
  },
  async convert_model({ commit, dispatch, state, rootState }) {
    commit("setConverting", true);
    commit("setConverted", false);
    try {
      let project_id = rootState.project.project.id;
      const res = await axios.post(state.url + "/convert_model", {
        project_id: project_id,
        backend: rootState.currentDevice == "ROBOT" ? rootState.backend : "",
      });
      if (res.status == 200 && res.data.result == "OK") {
        commit("setConverted", true);
        commit("setConverting", false);
        return true;
      } else {
        commit("setConverted", false);
        commit("setConverting", false);
        return false;
      }
    } catch (err) {
      commit("setConverted", false);
      commit("setConverting", false);
      return false;
    }
  },
  // async trainLocalServer({ commit, dispatch, state, rootState }) {
  //   if (rootState.project.project.model.code.includes("knn")) {
  //     //create knn classifier
  //     const classifier = knnClassifier.create();
  //     for (let item of this.dataset.data) {
  //       this.classifier.addExample(tf.tensor(item.keypoints), item.class);
  //     }
  //   }
  // },
  async train({ commit, dispatch, state, rootState }) {
    console.log("start training ...");
    commit("setTraining", true);
    commit("resetNewTrain");
    await dispatch("train_step1");
  },
  async train_step1({ commit, dispatch, state, rootState }) {
    console.log("start sync project");
    commit("setStep", 1);
    const res = await axios.post(state.url + "/sync_project", rootState);
    if (res.data && res.data.result && res.data.result == "OK") {
      //go to step 2
      console.log("sync complete no file needed");
      await dispatch("train_step2");
    } else if (res.data && res.data.result && res.data.result == "SYNC") {
      //go to sync dataset
      commit("setSync", true);
      let needed = res.data.needed;
      await dispatch("sync_dataset", needed);
    }
  },
  async train_step2({ commit, dispatch, state, rootState }) {
    if (!state.isTraining) {
      console.log("game changed user cancel training");
      return;
    }
    //start traning
    console.log("send training");
    let project_id = rootState.project.project.id;
    const res = await axios.post(state.url + "/start_training", {
      project_id: project_id,
    });
    commit("setStep", 2);
    await dispatch("train_step3");
  },
  async train_step3({ commit, dispatch, state, rootState }) {
    //create callback
    commit("setStep", 3);
    console.log("start callback socket");
  },
  async train_step4({ commit, dispatch, state, rootState }) {
    commit("setStep", 4);
    commit("setTraining", false);
    commit("setTrained", true);
  },
  async SOCKET_training_progress({ commit, dispatch, state, rootState }, data) {
    // progress will sending to here
    // let processMatric = (cm, matrics, prefix, label) => {
    //   Object.keys(matrics).forEach((el) => {
    //     let dt = { name: prefix + el, label: label, value: matrics[el] };
    //     cm("addMatric", dt);
    //   });
    // };
    let dt = new Date(data.time * 1000);
    let eventType = data.event;
    if (eventType == "epoch_begin") {
      commit("setEpoch", data.epoch);
      commit(
        "addMessage",
        `[${dt.toLocaleString()}]: training epoch ${data.epoch}`
      );
    } else if (eventType == "epoch_end") {
      // processMatric(commit, data.matric, "", data.epoch);
      // commit("addMatric", { label: data.epoch, matric: data.matric });
      commit(
        "addMessage",
        `[${dt.toLocaleString()}]: epoch [${data.epoch}] ended`
      );
    } else if (eventType == "train_batch_begin") {
      commit("setBatch", data.batch);
      commit("setTotalBatch", data.steps);
    } else if (eventType == "train_batch_end") {
      commit("addMatric", {
        label: state.epoch,
        matric: data.matric,
        prefix: "train_",
      });
      //processMatric(commit, data.matric, "train_", currentEpoch + 1);
    } else if (eventType == "test_end") {
      commit("addMatric", {
        label: state.epoch,
        matric: data.matric,
        prefix: "validate_",
      });
    } else if (eventType == "test_begin") {
      // do nothing
    } else if (eventType == "train_end") {
      commit("addMessage", `[${dt.toLocaleString()}]: ${data["msg"]}`);
      await dispatch("train_step4");
    } else {
      commit("addMessage", `[${dt.toLocaleString()}]: ${data["msg"]}`);
    }
  },
  async SOCKET_traning_completed({ commit, dispatch, state, rootState }) {
    // when traning completed
  },
  async SOCKET_convert_completed({ commit, dispatch, state, rootState }) {
    // when convert model completed
  },

  // ================= PROJECT SYNC ================== //
  // --- action to sync when dataset needed ---//
  async sync_dataset({ commit, dispatch, state, rootState }, request_file) {
    const formData = new FormData();
    for (let needed of request_file) {
      let dataset_file = await dispatch("dataset/getDataAsFile", needed, {
        root: true,
      });
      formData.append("dataset", dataset_file);
    }
    if (!state.isTraining) {
      commit("setSync", false);
      console.log("game changed user cancel training");
      return;
    }
    let project_id = rootState.project.project.id;
    formData.append("project_id", project_id);
    console.log("posting : ", state.url);
    let res = await axios({
      method: "POST",
      url: state.url + "/upload",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (pg) =>
        commit("setProgress", (pg.loaded / pg.total) * 100),
    });
    if (res.data && res.data.result && res.data.result == "OK") {
      commit("setSync", false);
      console.log("go to step 2");
      dispatch("train_step2");
    }
  },
  // ======================= END ====================== //
};

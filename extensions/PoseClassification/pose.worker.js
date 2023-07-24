importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow-models/knn-classifier");
let processing = false;
let sourceCode = "";

let __model = null;
let __labels = [];
let __keypoint = null;
let __data = null;
let __maxIndex = 0;

let responseCallback = null;
let requestCommand = null;

const requestData = async function (cmd, addition) {
  requestCommand = cmd;
  let postMessageData = { command: "REQUEST", data: cmd };
  if (addition) {
    postMessageData = Object.assign(postMessageData, addition);
  }
  postMessage(postMessageData);
  let responseCommand = new Promise((resolve) => (responseCallback = resolve));
  let res = await responseCommand;
  return res;
};

const loadingModel = async function () {
  let modelInfo = await requestData("MODEL");
  if (modelInfo.model.includes("knn")) {
    postMessage({ command: "PRINT", msg: "--- create kNN model ---\r\n" });
    __model = knnClassifier.create();
    __model.clearAllClasses();
    for (let item of modelInfo.dataset) {
      __model.addExample(tf.tensor(item.keypoints), item.class);
    }
    let knnInfo = __model.getClassExampleCount();
    let knnInfoText = "kNN dataset : ";
    for (let key of Object.keys(knnInfo)) {
      knnInfoText += key + " > " + knnInfo[key] + ",";
    }
    postMessage({ command: "PRINT", msg: "--- create kNN model ---\r\n" });
    postMessage({ command: "PRINT", msg: knnInfoText + "\r\n" });
  }
};

const __classify = async function (img) {
  let res = await __model.predictClass(img);
  return res;
};

const initModel = async function () {
  postMessage({ command: "PRINT", msg: "Loading model\r\n" });
  await loadingModel();
  postMessage({ command: "PRINT", msg: "Loading labels\r\n" });
  postMessage({
    command: "PRINT",
    msg: "Label : " + __labels.join(",") + "\r\n",
  });
  postMessage({ command: "PRINT", msg: "Model loaded\r\n" });
};

const classify = async function () {
  __image = await requestData("IMAGE");
  if (!__image) {
    return;
  }
  let __image_tensor = await tf.tensor(__image);
  __data = await __classify(__image_tensor);
};

onmessage = async (event) => {
  if (event.data.command == "RUN") {
    sourceCode = event.data.code;
    __labels = event.data.labels;
    if (!processing) {
      processing = true;
      process();
    }
  } else if (event.data.command == "RESPONSE") {
    if (event.data.subcommand == requestCommand) {
      responseCallback(event.data.data);
    }
  }
};

const process = function () {
  try {
    eval(sourceCode);
  } catch (err) {
    postMessage({
      command: "PRINT",
      msg: "ERROR !!! \r\n" + err.message,
    });
  }
};

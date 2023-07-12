export default {
  id: "HANDPOSE_CLASSIFICATION",
  name: "Hand Pose Classification",
  title: "การจำแนกท่าทางมือ (Hand Pose Classification)",
  type: "Classifier",
  description: "",
  config: {}, // not use yet
  // model: {}, // json of pre-config Model Design, this will register auto by ExtensionManager
  instructions: {
    capture: "HandPoseClassification/Instructions/CaptureInstruction.vue",
    annotate: "HandPoseClassification/Instructions/AnnotateInstruction.vue",
    train: "HandPoseClassification/Instructions/TrainInstruction.vue",
  },
  //components : ['image_classification/components/Capture.vue'] // this will register auto by ExtensionManager
};

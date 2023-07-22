export default {
  id: "POSE_CLASSIFICATION",
  name: "Pose Classification",
  title: "การจำแนกท่าทางร่างกาย (Pose Classification)",
  type: "Classifier",
  description: "",
  config: {}, // not use yet
  // model: {}, // json of pre-config Model Design, this will register auto by ExtensionManager
  instructions: {
    capture: "PoseClassification/Instructions/CaptureInstruction.vue",
    annotate: "PoseClassification/Instructions/AnnotateInstruction.vue",
    train: "PoseClassification/Instructions/TrainInstruction.vue",
  },
  //components : ['image_classification/components/Capture.vue'] // this will register auto by ExtensionManager
};

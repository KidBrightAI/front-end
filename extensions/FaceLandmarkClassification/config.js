export default {
  id: "FACELANDMARK_CLASSIFICATION",
  name: "Face Landmark Classification",
  title: "การจำแนกจากตำแหน่งใบหน้า (Face Landmark Classification)",
  type: "Classifier",
  description: "",
  config: {}, // not use yet
  // model: {}, // json of pre-config Model Design, this will register auto by ExtensionManager
  instructions: {
    capture: "FaceLandmarkClassification/Instructions/CaptureInstruction.vue",
    annotate: "FaceLandmarkClassification/Instructions/AnnotateInstruction.vue",
    train: "FaceLandmarkClassification/Instructions/TrainInstruction.vue",
  },
  //components : ['image_classification/components/Capture.vue'] // this will register auto by ExtensionManager
};

export default {
  name: "Skeleton Input",
  output: [
    {
      name: "skeleton output",
      type: "array",
    },
  ],
  options: [
    {
      name: "skeleton_input",
      description: "Serialized skeleton input from dataset",
      type: "text",
      default: "Serialized skeleton for KNN",
    },
  ],
  generator: (n) => {
    return '{"name":"Skeleton Input",  "target_model": "knn"}';
  },
};

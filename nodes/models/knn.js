export default {
  name: "k-Nearest Neighbors",
  input: [
    {
      name: "input",
      type: "array",
      accept: ["array"],
    },
  ],
  output: [
    {
      name: "output",
      type: "tensor",
    },
  ],
  options: [],
  generator: (input) => {
    return '{"name" : "knn" }';
  },
};

export default {
  name: "Non-Validate Output",
  input: [
    {
      name: "input",
      accept: ["tensor"],
    },
  ],
  options: [],
  generator: (n) => {
    return '{"name" : "non-validate-output"}';
  },
};

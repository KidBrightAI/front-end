import { NodeBuilder } from "@baklavajs/core";
String.prototype.interpolate = function (params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
};
const createNode = (config) => {
  const node = new NodeBuilder(config.name).setName(config.name);
  for (let output of config.output || []) {
    node.addOutputInterface(output.name, { type: output.type });
  }
  for (let input of config.input || []) {
    node.addInputInterface(input.name, "", input.default, {
      accept: input.accept,
      type: input.type,
    });
  }
  for (let opt of config.options || []) {
    if (opt.type == "string" && opt.options) {
      node.addOption(opt.name, "SelectOption", opt.default, null, {
        items: opt.options,
      });
    } else if (opt.type == "number") {
      node.addOption(opt.name, "IntegerOption", opt.default, null);
    } else if (opt.type == "float") {
      node.addOption(opt.name, "NumberOption", opt.default, null);
    } else if (opt.type == "boolean") {
      node.addOption(opt.name, "CheckboxOption", opt.default, null);
    } else if (opt.type == "input") {
      node.addOption(opt.name, "InputOption", opt.default, null);
    } else if (opt.type == "text") {
      node.addOption(opt.name, "TextOption", opt.default, null);
    }
  }
  node.onCalculate((n) => {
    //---- generate self ----//
    let nodeOption = {};
    let preloadGenerator = config.generator ? config.generator(n) : "";
    n.options.forEach((value, key) => {
      if (
        value.optionComponent == "CheckboxOption" &&
        !preloadGenerator.startsWith("{")
      ) {
        nodeOption[key] = value.value ? '"True"' : '"False"';
      } else {
        nodeOption[key] = value.value;
      }
    });
    let outputString = preloadGenerator
      ? preloadGenerator.interpolate(nodeOption)
      : "";
    // let text = eval(outputString);
    // console.log("json : ", text);
    //---- collect input ----//
    let outputValue = [];
    for (let input of config.input || []) {
      let iface = n.getInterface(input.name);
      if (iface.connectionCount > 0) {
        outputValue = outputValue.concat(iface.value);
      }
    }
    outputValue.push(outputString);
    if (config.output) {
      n.getInterface(config.output[0].name).value = outputValue;
    }
    if (n.name == "output" || n.name == "Output" || n.name.includes("Output")) {
      n.output = outputValue;
      return outputValue;
    }
  });
  return node.build();
};
export default async (context, inject) => {
  const nodes = require.context("@/nodes", true, /\.js$/);
  let nodesData = [];
  for (let key of nodes.keys()) {
    let file = key.substring(2);
    let cats = key.split("/");
    let cat = cats.length > 2 ? cats[1] : null;
    let config = (await import(`@/nodes/${file}`)).default;
    nodesData.push({ node: createNode(config), config: config, category: cat });
  }
  inject("nodes", nodesData);
};

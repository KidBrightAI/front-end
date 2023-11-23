export default (Blockly, that) => {
  // ========== classification process ========== //
  Blockly.Blocks["tfjs_classification_init_model"] = {
    init: function () {
      this.appendDummyInput().appendField("initial model");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_init_model"] = function (block) {
    var code = `await initModel();\n`;
    return code;
  };

  Blockly.Blocks["tfjs_classification_classify"] = {
    init: function () {
      this.appendDummyInput().appendField("classify pose");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };

  Blockly.JavaScript["tfjs_classification_classify"] = function (block) {
    var code = `await classify();\n`;
    return code;
  };

  Blockly.Blocks["tfjs_classification_get_class_name"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class name");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_name"] = function (block) {
    var code = "(__data ? __data.label : null)";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks["tfjs_classification_get_class_prob"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class probability");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_prob"] = function (block) {
    var code =
      "(__data ? Math.round( __data.confidences[__data.label] * 100 * 1e2 ) / 1e2  : null)";
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks["tfjs_classification_get_class_index"] = {
    init: function () {
      this.appendDummyInput().appendField("classify get class index");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["tfjs_classification_get_class_index"] = function (block) {
    var code = "(__data ? __data.classIndex : -1)";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  //=====================================//

  Blockly.Blocks["move"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("Linear velocity")
        .appendField(new Blockly.FieldNumber(0, -0.15, 0.15), "lin")
        .appendField("Angular velocity")
        .appendField(new Blockly.FieldNumber(0, -0.5, 0.5), "ang");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move"] = function (block) {
    var number_lin = block.getFieldValue("lin");
    var number_ang = block.getFieldValue("ang");
    var code = `postMessage({ command : "MOVE", lin : ${number_lin}, ang : ${number_ang} });\n`;
    return code;
  };

  Blockly.Blocks["move_forward_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Move forward speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("move robot ");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_forward_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : ${value_speed}, ang : 0 });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["move_backward_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Move backward speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("move robot ");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_backward_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : -${value_speed}, ang : 0 });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["move_turnleft_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Turn Left speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("90 deg ~ 1700ms");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_turnleft_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : 0, ang : ${value_speed} });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["move_turnright_in"] = {
    init: function () {
      this.appendValueInput("speed")
        .setCheck("Number")
        .appendField("Turn right speed");
      this.appendValueInput("duration")
        .setCheck("Number")
        .appendField("duration");
      this.appendDummyInput().appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("90 deg ~ 1700ms");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["move_turnright_in"] = function (block) {
    var value_speed = Blockly.JavaScript.valueToCode(
      block,
      "speed",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var value_duration = Blockly.JavaScript.valueToCode(
      block,
      "duration",
      Blockly.JavaScript.ORDER_ATOMIC
    );
    var code = `postMessage({ command : "MOVE", lin : 0, ang : -${value_speed} });
await new Promise(r => setTimeout(r,${value_duration}));
postMessage({ command : "MOVE", lin : 0, ang : 0 });
`;
    return code;
  };

  Blockly.Blocks["stop_move"] = {
    init: function () {
      this.appendDummyInput().appendField("stop robot");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("move robot ");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["stop_move"] = function (block) {
    var code = `postMessage({ command : "MOVE", lin : 0, ang : 0 });\n`;
    return code;
  };

  Blockly.Blocks["delay"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("delay")
        .appendField(new Blockly.FieldNumber(0), "ms")
        .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["delay"] = function (block) {
    var number_ms = block.getFieldValue("ms");
    var code = "await new Promise(r => setTimeout(r," + number_ms + "));\n";
    return code;
  };

  Blockly.Blocks["term_print"] = {
    init: function () {
      this.appendValueInput("text").setCheck(null).appendField("print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    },
  };
  Blockly.JavaScript["term_print"] = function (block) {
    var value_text = Blockly.JavaScript.valueToCode(
      block,
      "text",
      Blockly.JavaScript.ORDER_NONE
    );
    var code = `postMessage({command:"PRINT", msg : ${value_text}+"\\r\\n"});\n`;
    return code;
  };
  //============= MQTT =============//
  Blockly.Blocks['mqtt_config'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_config",
        "message0": "MQTT Connect %1 Host %2 Port %3 Client Id %4 Username %5 Password %6",
        "args0": [
          {
            "type": "input_dummy"
          },
          {
            "type": "input_value",
            "name": "host",
            "check": "String",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "port",
            "check": "Number",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "client_id",
            "check": "String",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "username",
            "check": "String",
            "align": "RIGHT"
          },
          {
            "type": "input_value",
            "name": "password",
            "check": "String",
            "align": "RIGHT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };

  Blockly.JavaScript['mqtt_config'] = function (block) {
    var value_host = Blockly.JavaScript.valueToCode(block, 'host', Blockly.JavaScript.ORDER_ATOMIC) || "'ws://broker.emqx.io/mqtt'";
    var value_port = Blockly.JavaScript.valueToCode(block, 'port', Blockly.JavaScript.ORDER_ATOMIC) || '8083';
    var value_client_id = Blockly.JavaScript.valueToCode(block, 'client_id', Blockly.JavaScript.ORDER_ATOMIC) || 'KidBright32';
    var value_username = Blockly.JavaScript.valueToCode(block, 'username', Blockly.JavaScript.ORDER_ATOMIC) || '';
    var value_password = Blockly.JavaScript.valueToCode(block, 'password', Blockly.JavaScript.ORDER_ATOMIC) || '';

    var code = `postMessage({ command : "MQTT_CONNECT",
  clientId: "${value_client_id}",
  host: ${value_host},
  port: ${value_port},
  username: "${value_username}",
  password: "${value_password}"
});\n`;
    return code;
  };

  Blockly.Blocks['mqtt_on_connected'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_on_connected",
        "message0": "MQTT on Connected %1 %2",
        "args0": [
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "callback"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };


Blockly.JavaScript['mqtt_on_connected'] = function (block) {
	var statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');

	var code = `
  registerCallback("MQTT_ON_CONNECT", async function(_event_data){
    ${statements_callback}
  });\n`;
	return code;
};

  Blockly.Blocks['mqtt_is_connect'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_is_connect",
        "message0": "MQTT is connected ?",
        "output": [
          "Number",
          "Boolean"
        ],
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };

  Blockly.JavaScript['mqtt_is_connect'] = function (block) {
    let code = `(await requestData("IMAGE"))`;
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks['mqtt_publish'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_publish",
        "message0": "MQTT Publish  topic : %1   data: %2",
        "args0": [
          {
            "type": "field_input",
            "name": "topic",
            "text": ""
          },
          {
            "type": "input_value",
            "name": "value",
            "check": [
              "Boolean",
              "Number",
              "String"
            ],
            "align": "RIGHT"
          }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };

  Blockly.JavaScript['mqtt_publish'] = function (block) {
    var text_topic = block.getFieldValue('topic');
    var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC) || '(char *)""';
    var code = `postMessage({ command : "MQTT_PUBLISH", topic : "${text_topic}", message : ${value_value} });\n`;
    return code;
  };

  Blockly.Blocks['mqtt_subscribe'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_subscribe",
        "message0": "MQTT Subscribe   topic : %1 on receive %2 %3",
        "args0": [
          {
            "type": "field_input",
            "name": "topic",
            "text": ""
          },
          {
            "type": "input_dummy"
          },
          {
            "type": "input_statement",
            "name": "callback"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };

  Blockly.JavaScript['mqtt_subscribe'] = function (block) {
    var text_topic = block.getFieldValue('topic');
    var statements_callback = Blockly.JavaScript.statementToCode(block, 'callback');
    var code = `postMessage({ command : "MQTT_SUBSCRIBE", topic : "${text_topic}" });
registerCallback("MQTT_ON_MESSAGE", async function(_event_data){
  if (_event_data.topic == "${text_topic}"){
    ${statements_callback}
  }
});\n`;
    return code;
  };

  Blockly.Blocks['mqtt_get_topic'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_get_text",
        "message0": "MQTT get topic",
        "output": "String",
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };

  Blockly.JavaScript['mqtt_get_topic'] = function (block) {
    var code = "_event_data.topic";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks['mqtt_get_number'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_get_number",
        "message0": "MQTT get payload number",
        "output": [
          "Number",
          "Boolean"
        ],
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };


  Blockly.JavaScript['mqtt_get_number'] = function (block) {
    var code = "parseInt(_event_data.message)";
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.Blocks['mqtt_get_text'] = {
    init: function () {
      this.jsonInit({
        "type": "mqtt_get_text",
        "message0": "MQTT get payload text",
        "output": "String",
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
      });
    }
  };

  Blockly.JavaScript['mqtt_get_text'] = function (block) {
    var code = '_event_data.message';
    return [code, Blockly.JavaScript.ORDER_NONE];
  };
  //============================================//
};

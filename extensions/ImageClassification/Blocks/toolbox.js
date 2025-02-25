export default `<xml>
  <category name="Logic" css-icon="customIcon mdi mdi-cog" categorystyle="logic_category">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
    <block type="logic_null" disabled="true"></block>
    <block type="logic_ternary"></block>
  </category>

  <category name="Loops" categorystyle="loop_category">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <block type="math_number">
          <field name="NUM">10</field>
        </block>
      </value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for">
      <value name="FROM">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="TO">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
      <value name="BY">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
    <block type="controls_forEach"></block>
    <block type="controls_flow_statements"></block>
  </category>

  <category name="Math" categorystyle="math_category">
    <block type="math_number" gap="32">
      <field name="NUM">123</field>
    </block>
    <block type="math_arithmetic">
      <value name="A">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="B">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
    <block type="math_single">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">9</field>
        </shadow>
      </value>
    </block>
    <block type="math_trig">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">45</field>
        </shadow>
      </value>
    </block>
    <block type="math_constant"></block>
    <block type="math_number_property">
      <value name="NUMBER_TO_CHECK">
        <shadow type="math_number">
          <field name="NUM">0</field>
        </shadow>
      </value>
    </block>
    <block type="math_round">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">3.1</field>
        </shadow>
      </value>
    </block>
    <block type="math_on_list"></block>
    <block type="math_modulo">
      <value name="DIVIDEND">
        <shadow type="math_number">
          <field name="NUM">64</field>
        </shadow>
      </value>
      <value name="DIVISOR">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="math_constrain">
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM">50</field>
        </shadow>
      </value>
      <value name="LOW">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="HIGH">
        <shadow type="math_number">
          <field name="NUM">100</field>
        </shadow>
      </value>
    </block>
    <block type="math_random_int">
      <value name="FROM">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="TO">
        <shadow type="math_number">
          <field name="NUM">100</field>
        </shadow>
      </value>
    </block>
    <block type="math_random_float"></block>
    <block type="math_atan2">
      <value name="X">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="Y">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
  </category>

  <category name="Text" categorystyle="text_category">
    <block type="term_print">
      <value name="text">
        <shadow type="text">
          <field name="TEXT">abc</field>
        </shadow>
      </value>
    </block>
    <block type="text"></block>
    <block type="text_multiline"></block>
    <block type="text_join"></block>
    <block type="text_append">
      <value name="TEXT">
        <shadow type="text"></shadow>
      </value>
    </block>
    <block type="text_length">
      <value name="VALUE">
        <shadow type="text">
          <field name="TEXT">abc</field>
        </shadow>
      </value>
    </block>
    <block type="text_isEmpty">
      <value name="VALUE">
        <shadow type="text">
          <field name="TEXT"></field>
        </shadow>
      </value>
    </block>
    <block type="text_indexOf">
      <value name="VALUE">
        <block type="variables_get">
          <field name="VAR">text</field>
        </block>
      </value>
      <value name="FIND">
        <shadow type="text">
          <field name="TEXT">abc</field>
        </shadow>
      </value>
    </block>
    <block type="text_charAt">
      <value name="VALUE">
        <block type="variables_get">
          <field name="VAR">text</field>
        </block>
      </value>
    </block>
    <block type="text_getSubstring">
      <value name="STRING">
        <block type="variables_get">
          <field name="VAR">text</field>
        </block>
      </value>
    </block>
    <block type="text_changeCase">
      <value name="TEXT">
        <shadow type="text">
          <field name="TEXT">abc</field>
        </shadow>
      </value>
    </block>
    <block type="text_trim">
      <value name="TEXT">
        <shadow type="text">
          <field name="TEXT">abc</field>
        </shadow>
      </value>
    </block>
    <block type="text_count">
      <value name="SUB">
        <shadow type="text"></shadow>
      </value>
      <value name="TEXT">
        <shadow type="text"></shadow>
      </value>
    </block>
    <block type="text_replace">
      <value name="FROM">
        <shadow type="text"></shadow>
      </value>
      <value name="TO">
        <shadow type="text"></shadow>
      </value>
      <value name="TEXT">
        <shadow type="text"></shadow>
      </value>
    </block>
    <block type="text_reverse">
      <value name="TEXT">
        <shadow type="text"></shadow>
      </value>
    </block>
  </category>

  <category name="Lists" categorystyle="list_category">
    <block type="lists_create_with">
      <mutation items="0"></mutation>
    </block>
    <block type="lists_create_with"></block>
    <block type="lists_repeat">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">5</field>
        </shadow>
      </value>
    </block>
    <block type="lists_length"></block>
    <block type="lists_isEmpty"></block>
    <block type="lists_indexOf">
      <value name="VALUE">
        <block type="variables_get">
          <field name="VAR">list</field>
        </block>
      </value>
    </block>
    <block type="lists_getIndex">
      <value name="VALUE">
        <block type="variables_get">
          <field name="VAR">list</field>
        </block>
      </value>
    </block>
    <block type="lists_setIndex">
      <value name="LIST">
        <block type="variables_get">
          <field name="VAR">list</field>
        </block>
      </value>
    </block>
    <block type="lists_getSublist">
      <value name="LIST">
        <block type="variables_get">
          <field name="VAR">list</field>
        </block>
      </value>
    </block>
    <block type="lists_split">
      <value name="DELIM">
        <shadow type="text">
          <field name="TEXT">,</field>
        </shadow>
      </value>
    </block>
    <block type="lists_sort"></block>
    <block type="lists_reverse"></block>
  </category>

  <category name="Variables" categorystyle="variable_category" custom="VARIABLE"></category>

  <category name="Functions" categorystyle="procedure_category" custom="PROCEDURE"></category>
  <category name="MQTT" colour="#5ba5a5">
    <block type="mqtt_config"></block>
    <block type="mqtt_on_connected"></block>
    <block type="mqtt_is_connect"></block>
    <block type="mqtt_publish"></block>
    <block type="mqtt_subscribe"></block>
    <block type="mqtt_get_topic"></block>
    <block type="mqtt_get_number"></block>
    <block type="mqtt_get_text"></block>
  </category>
  <category name="Kidbright Bot" colour="%{BKY_LOOPS_HUE}">
    <block type="delay"></block>
    <block type="tfjs_classification_init_model"></block>
    <block type="tfjs_classification_classify"></block>
    <block type="tfjs_classification_get_class_name"></block>
    <block type="tfjs_classification_get_class_index"></block>
    <block type="tfjs_classification_get_class_prob"></block>

    <label text="Simulator Robot" web-class="ioLabel"></label>

    <block type="move"></block>
    <block type="move_forward_in">
      <value name="speed">
        <shadow type="math_number">
          <field name="NUM">0.5</field>
        </shadow>
      </value>
      <value name="duration">
        <shadow type="math_number">
          <field name="NUM">500</field>
        </shadow>
      </value>
    </block>
    <block type="move_backward_in">
      <value name="speed">
        <shadow type="math_number">
          <field name="NUM">0.5</field>
        </shadow>
      </value>
      <value name="duration">
        <shadow type="math_number">
          <field name="NUM">500</field>
        </shadow>
      </value>
    </block>
    <block type="move_turnleft_in">
      <value name="speed">
        <shadow type="math_number">
          <field name="NUM">0.5</field>
        </shadow>
      </value>
      <value name="duration">
        <shadow type="math_number">
          <field name="NUM">500</field>
        </shadow>
      </value>
    </block>
    <block type="move_turnright_in">
      <value name="speed">
        <shadow type="math_number">
          <field name="NUM">0.5</field>
        </shadow>
      </value>
      <value name="duration">
        <shadow type="math_number">
          <field name="NUM">500</field>
        </shadow>
      </value>
    </block>
    <block type="stop_move"></block>
  </category>
</xml>`;

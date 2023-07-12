<template>
  <div class="full-content">
    <div class="hint">
      <b-avatar button @click="onReset" icon="arrow-repeat" class="mr-2" variant="primary" v-b-tooltip.hover.bottomright title="Reset to default"></b-avatar>
      <b-avatar button @click="onSave" icon="download" class="mr-2" variant="primary" v-b-tooltip.hover.bottomright title="Export model"></b-avatar>
      <b-avatar button @click="onLoad" icon="upload" class="mr-2" variant="primary" v-b-tooltip.hover.bottomright title="Import model"></b-avatar>
    </div>
    <baklava-editor :plugin="viewPlugin"></baklava-editor>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations , mapGetters } from 'vuex';
import { Editor, NodeBuilder }  from "@baklavajs/core"
import { ViewPlugin }           from "@baklavajs/plugin-renderer-vue"
import { Engine }               from "@baklavajs/plugin-engine"
import { InterfaceTypePlugin }  from "@baklavajs/plugin-interface-types"
import { OptionPlugin }         from "@baklavajs/plugin-options-vue"
export default {
  name: "MLModelDesigner",
  props: {},
  created() {
    this.editor.use(this.viewPlugin);
    this.editor.use(this.engine)
    this.editor.use(new OptionPlugin())
    this.editor.use(this.intfTypePlugin)
    this.intfTypePlugin.addType("number", "#00FF00");
    this.intfTypePlugin.addType("string", "#00FFFF");
    this.intfTypePlugin.addType("tensor", "#FFFFFF");
    this.intfTypePlugin.addType("array", "#FF00FF");
    this.viewPlugin.enableMinimap = false;
    // add node to editor
    for(let n of this.$nodes){
      if(n.category){
        this.editor.registerNodeType(n.config.name, n.node, n.category);
      }else{
        this.editor.registerNodeType(n.config.name, n.node);
      }
    }
    let model = JSON.parse(JSON.stringify(this.$store.getters["project/getModel"]));
    let res = this.editor.load(model);
    this.engine.events.calculated.addListener(this, (result) => {
      let source = "";
      for (const v of result.values()) {
        if (v) {
          source += v.join("\n", v);
        }
      }
      if(this.code != source){
        this.code = source;
        let nodes = JSON.parse(JSON.stringify(this.editor.save()));// this.editor.save();
        nodes.code = source;
        this.saveModel(nodes);
      }
    });
  },
  data() {
    return {
      editor: new Editor(),
      viewPlugin: new ViewPlugin(),
      engine: new Engine(true),
      intfTypePlugin: new InterfaceTypePlugin(),
    };
  },
  methods: {
    ...mapMutations("project",["saveModel"]),
    onLoad: async function(){
      try{
        let text = await this.$helper.upload("application/json");
        const graphObject = JSON.parse(text);
        this.editor.load(graphObject);
      }catch(err){
        console.log(err);
      }
    },
    onSave: function(){
      let graphJSON = this.editor.save();
      let jsonString = JSON.stringify(graphJSON);
      this.$helper.download("model.json",jsonString);
    },
    onReset: async function(){

      let extensionId = this.$store.state.project.project.extension.id;
      let targetExtension = this.$extensions.find(el=>el.id == extensionId);
      let model = JSON.parse(JSON.stringify(targetExtension.model));
      this.editor.load(model);
      //console.log(this.$store.state.project.project.extension.model);
      //console.log(this.$extensions.find(this.$store.project.project.id));
    },
  },
}
</script>
<style>
.dark-context-menu{
  width: 150px;
}
</style>
<style scoped>
  .hint {
      position: absolute;
      margin-left: 1rem;
      margin-top: 1rem;
      z-index: 5;
  }
  .full-content{
    width: 100%;
    height: 100%;
  }
</style>

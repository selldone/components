<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="s--form-builder widget-box">
    <s-widget-header :title="title" :icon="icon"></s-widget-header>
    <v-list-subheader>{{ hint }}</v-list-subheader>
    <draggable
      :list="structure"
      @update:model-value="(val) => $emit('update:structure', val)"
      :model-value="structure"
      @start="drag = true"
      @end="drag = false"
      tag="transition-group"
      :component-data="{
        tag: 'ul',
        type: 'transition-group',
        name: !drag ? 'scale' : 'fade',
      }"
      :animation="200"
      group="description"
      :disabled="false"
      ghostClass="ghost"
      style="list-style-type: none"
      handle=".drag--handle"
    >
      <template v-slot:item="{ element, index }">
        <s-form-builder-row
          :key="index"
          :item="element"
          :item-types="item_types"
          class="mt-6"
          @remove="removeField(index)"
          :collapse="drag"
        >
        </s-form-builder-row>
      </template>
    </draggable>

    <div class="text-end m-3">
      <v-menu :min-width="120">
        <template v-slot:activator="{ props }">
          <v-btn variant="flat" color="primary" v-bind="props">
            <v-icon start>add</v-icon>
            {{ $t("global.form_builder.add_item_action") }}
          </v-btn>
        </template>
        <v-list class="text-start">
          <v-list-item
            v-for="(item_type, index) in item_types"
            :key="index"
            @click="addField(item_type.value)"
            :prepend-icon="item_type.icon"
            :title="item_type.title"
          >
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <slot></slot>
  </div>
</template>

<script>
import SFormBuilderRow from "@components/ui/form/item/SFormBuilderRow.vue";
import draggable from "vuedraggable";

export default {
  name: "SFormBuilder",
  components: { draggable, SFormBuilderRow },
  props: {
    structure: {
      required: false,
      type: Array,
    },
    title: {
      required: false,
      type: String,
    },
    hasFile: {
      default: false,
      type: Boolean,
    },
    icon: {},
    hint: {},
  },

  data: () => ({
    show_hints: [],
    edit_name: null,
    drag: false,
  }),

  computed: {
    item_types() {
      return [
        {
          title: this.$t("global.form_builder.types.simple"),
          value: null,
          icon: "fa:fas fa-paragraph",
        },
        {
          title: this.$t("global.form_builder.types.selective"),
          value: "select",
          icon: "fa:fas fa-list-ul",
        },
        {
          title: this.$t("global.form_builder.types.switch"),
          value: "switch",
          icon: "fa:fas fa-toggle-on",
        },
        ...(this.hasFile
          ? [
              {
                title: this.$t("global.form_builder.types.file"),
                value: "file",
                icon: "fa:fas fa-file",
              },
            ]
          : []),

        {
          title: this.$t("global.commons.note"),
          value: "note",
          icon: "fa:fas fa-sticky-note",
        },
      ];
    },
  },
  created() {
    if (!this.structure || !Array.isArray(this.structure))
      this.$emit("update:structure", []);
  },
  methods: {
    addField(type) {
      //console.log('addField',type)
      this.structure.push({ name: "", title: "", type: type });
      this.$emit("update:structure", this.structure.slice());
      this.$forceUpdate(); // Force refresh component!
    },

    removeField(index) {
      this.structure.splice(index, 1);
      this.$emit("update:structure", this.structure.slice());
      this.$forceUpdate(); // Force refresh component!
    },
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--form-builder {
}
</style>

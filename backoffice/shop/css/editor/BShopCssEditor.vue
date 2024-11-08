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

<template>
  <div>
    <v-list-subheader>
      <div>
        <v-icon>warning_amber</v-icon>
        You can write pure CSS code here. We recommend that you do not use this
        option if you are not an expert in CSS.
      </div>
    </v-list-subheader>
    <prism-editor
      v-model="code"
      :highlight="highlighter"
      class="light-code scrollable-element-light mb-5"
      language="css"
      line-numbers
      :readonly="readOnly"
    />
    <div v-if="!code || !code.trim()" class="text-end">
      <v-btn
        class="my-1 tnt"
        color="primary"
        size="small"
        variant="text"
        @click="loadSample"
        >Load sample code
      </v-btn>
    </div>

    <u-widget-header class="mt-5" icon="support" title="Help"></u-widget-header>
    <v-list-subheader></v-list-subheader>
    <div class="border-between-vertical">
      <div v-for="item in list" :key="`${item.parent} ${item.path}`">
        <b class="d-block my-1 small text-muted">{{ item.title }}</b>

        <div v-copy="`${item.parent} .${item.path}`" class="my-1">
          {{ item.parent }} <b>.{{ item.path }}</b>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
//―――――――――――――――――――――― vue-prism-editor ――――――――――――――――――――
import "prismjs";
import "prismjs/themes/prism.css";

import "vue-prism-editor/dist/prismeditor.min.css";

import ShopCss from "@selldone/core-js/enums/shop/ShopCss";
import { PrismEditor } from "vue-prism-editor";

export default {
  name: "BShopCssEditor",
  components: { PrismEditor },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    readOnly: Boolean,
  },
  data: () => ({
    ShopCss: ShopCss,
    list: [],

    code: "\n\n\n\n\n\n",
  }),

  computed: {},

  watch: {
    code(val) {
      this.$emit("update:modelValue", val);
    },
  },

  created() {
    if (this.modelValue && this.isString(this.modelValue)) {
      this.code = this.modelValue;
    }
    this.$emit("update:modelValue", this.code);

    this.list = [];
    let level = 0;

    function add(obj, list, level, parent) {
      Object.keys(obj).forEach((key) => {
        const it = obj[key];

        list.push({ level: level, title: it.title, parent: parent, path: key });

        // Add children:
        if (it.children) {
          add(
            it.children,
            list,
            level++,
            parent ? `${parent} .${key}` : `.${key}`,
          );
        }
      });
    }

    add(ShopCss, this.list, level);
  },

  methods: {
    highlighter(code) {
      return Prism.highlight(code, Prism.languages.css, "css");
    },

    loadSample() {
      this.code = `.s--shop .s--storefront-products-listing .s--category-card
{
  text-shadow: 3px 3px 16px #ed960f;
  border-radius: 12px;
  border: solid 2px #ed960f;
  margin: 8px !important;
  flex-grow: 1 !important;
  max-width: unset !important;
}
`;
    },
  },
};
</script>

<style scoped></style>

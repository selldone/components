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
        Upload large js and CSS codes on an external file and add its path here.
        You can use public CDNs/Repositories.
      </div>
    </v-list-subheader>
    <prism-editor
      v-model="code"
      :highlight="highlighter"
      class="light-code scrollable-element-light mb-5"
      language="html"
      line-numbers
    />
  </div>
</template>

<script>
import { PrismEditor } from "vue-prism-editor";

export default {
  name: "BShopHtmlEditor",
  components: { PrismEditor },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
  },
  data: () => ({
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
  },

  methods: {
    highlighter(code) {
      return Prism.highlight(code, Prism.languages.html);
    },
  },
};
</script>

<style scoped></style>

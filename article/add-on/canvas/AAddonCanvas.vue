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
  <div
    :data="json_data"
    :class="{ 'a-article-addon--editable': editable }"
    class="image-overlay-canvas"
    contenteditable="false"
    spellcheck="false"
  >
    <a-addon-toolbar
      v-if="editable"
      :element="element"
      :title="$t('global.commons.canvas')"
      :edit-label="$t('global.article.inline_tools.canvas_settings')"
      edit-icon="tune"
      @click:edit="$refs.canvasEditor.toggleSettings()"
    >
    </a-addon-toolbar>

    <a-addon-canvas-editor
      ref="canvasEditor"
      v-model:image="bg"
      v-model:ratio="ratio"
      v-model:rects="rects"
      :editable="editable"
      :upload-url="uploadUrl"
      @change="onChange"
    >
    </a-addon-canvas-editor>
  </div>
</template>

<script lang="ts">
import AAddonCanvasEditor from "../../../article/add-on/canvas/editor/AAddonCanvasEditor.vue";
import AAddonToolbar from "../toolbar/AAddonToolbar.vue";
import { articleAddonContext } from "../toolbar/article-addon-context";

export default {
  name: "AAddonCanvas",
  components: { AAddonToolbar, AAddonCanvasEditor },
  props: {
    pack: {},
    editable: {
      type: Boolean,
      default: false,
    },
    uploadUrl: {
      required: false,
      default: "",
      type: String,
    },
    masterId: {
      /*Point which dialog open!*/
    },
  },

  data() {
    return {
      edit_mode: this.editable,

      rects: [],
      bg: null,
      ratio: 1,

      element: null,
    };
  },
  computed: {
    json_data() {
      return JSON.stringify({
        rects: this.rects,
        bg: this.bg,
        ratio: this.ratio,
      });
    },
  },

  created() {
    // Fix bug: (important)
    /*if (!this.$vuetify.theme) this.$vuetify.theme = {};
    if (!this.$vuetify.icons) this.$vuetify.icons = {};
    if (!this.$vuetify.display) this.$vuetify.display = {};
*/
    if (this.pack) {
      this.rects = this.pack.rects;
      this.bg = this.pack.bg;
      this.ratio = this.pack.ratio;
    }
    if (!this.rects) this.rects = [];
  },
  mounted() {
    this.element = this.$el;
  },
  methods: {
    onChange() {
      const context = this.editable && articleAddonContext(this.element);
      if (context) this.$nextTick(() => context.core.triggerInput());
    },
  },
};
</script>

<style lang="scss" scoped>
.image-overlay-canvas {
}
</style>

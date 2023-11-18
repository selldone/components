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
    class="images-compare"
    :data="json_data"
    spellcheck="false"
    contenteditable="false"
  >
    <s-article-editor-component-toolbar
      v-if="editable"
      @click:edit="showEdit()"
      :element="element"
      :title="$t('global.commons.images_compare')"
      edit-icon="add_photo_alternate"
    >
      <v-btn
        @click="showEdit('size')"
        text
        class="body-2 border-end pe-2 text-capitalize"
        >{{ $t("global.commons.max_height") }}: <b>{{ max_width }}</b></v-btn
      >
    </s-article-editor-component-toolbar>

    <vue-compare-image
      v-if="muted_images && show"
      style="direction: ltr; min-height: 64px"
      :style="{ 'max-width': `${max_width}` }"
      class="mx-auto"
      :left-image="muted_images.original"
      :right-image="muted_images.compare"
      :handle-size="40"
      :slider-line-width="2"
      hover
      :slider-position-percentage="0.5"
    />
  </div>
</template>

<script>

import SArticleEditorComponentToolbar from "../toolbar/SArticleEditorComponentToolbar.vue";
import VueCompareImage from "@components/ui/image-compare/VueCompareImage.vue";

export default {
  name: "SArticleImagesCompare",
  components: { SArticleEditorComponentToolbar, VueCompareImage },
  props: {
    images: {},
    editable: {
      type: Boolean,
      default: false,
    },
    uploadUrl: {
      required: false,
      default: "",
      type: String,
    },
    masterId: {/*Point which dialog open!*/ },
  },

  data() {
    return {
      edit_mode: this.editable,

      muted_images: {
        max_width: 100,
        dim: "em",
      },

      show: true,

      element:null,
    };
  },
  computed: {
    json_data() {
      return JSON.stringify(this.muted_images);
    },
    max_width() {
      if (!this.muted_images.max_width || !this.muted_images.dim)
        return "100em";
      return `${this.muted_images.max_width}${this.muted_images.dim}`;
    },
  },

  created() {
    // Fix bug: (important)
    if (!this.$vuetify.theme) this.$vuetify.theme = {};
    if (!this.$vuetify.icons) this.$vuetify.icons = {};
    if (!this.$vuetify.breakpoint) this.$vuetify.breakpoint = {};

    if (this.images) this.muted_images = this.images;

    if (!this.muted_images.dim) this.muted_images.dim = "em";
    this.dim = this.muted_images.dim;
  },
  mounted() {
    this.element=this.$el
  },
  methods: {
    showEdit(tab = null) {
      if (!this.editable) return;
      this.ShowImagesCompareGlobalDialog(
        Object.assign({}, this.muted_images),
        (val) => {
          this.muted_images = val;
          this.show = false;
          this.$nextTick(() => {
            this.show = true;
          });
        },
        () => {
          this.$el.remove();
        },
        tab,
          this.masterId
      );
    },
  },
};
</script>

<style lang="scss"></style>

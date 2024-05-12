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
    class="images-compare"
    contenteditable="false"
    spellcheck="false"
  >
    <a-addon-toolbar
      v-if="editable"
      :element="element"
      :title="$t('global.commons.images_compare')"
      edit-icon="add_photo_alternate"
      @click:edit="showEdit()"
    >
      <v-btn
        class="text-body-2 border-end pe-2 text-capitalize"
        variant="text"
        @click="showEdit('size')"
        >{{ $t("global.commons.max_height") }}: <b>{{ max_width }}</b></v-btn
      >
    </a-addon-toolbar>

    <vue-compare-image
      v-if="muted_images && show"
      :handle-size="40"
      :left-image="
        muted_images.original
          ? muted_images.original
          : require('../../../article/add-on/comparison/asset/image-placeholder.svg')
      "
      :right-image="
        muted_images.compare
          ? muted_images.compare
          : require('../../../article/add-on/comparison/asset/image-placeholder.svg')
      "
      :slider-line-width="2"
      :slider-position-percentage="0.5"
      :style="{ 'max-width': `${max_width}` }"
      class="mx-auto"
      hover
      style="direction: ltr; min-height: 64px"
    />
  </div>
</template>

<script>
import AAddonToolbar from "../toolbar/AAddonToolbar.vue";
import VueCompareImage from "../../../ui/image-compare/VueCompareImage.vue";
import { ArticleMixin } from "../../../mixin/ArticleMixin";

export default {
  name: "AAddonComparison",
  mixins: [ArticleMixin],
  components: { AAddonToolbar, VueCompareImage },
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
    masterId: {
      /*Point which dialog open!*/
    },
  },

  data() {
    return {
      edit_mode: this.editable,

      muted_images: {
        max_width: 20,
        dim: "em",
      },

      show: true,

      element: null,
    };
  },
  computed: {
    json_data() {
      return JSON.stringify(this.muted_images);
    },
    max_width() {
      if (!this.muted_images.max_width || !this.muted_images.dim) return "20em";
      return `${this.muted_images.max_width}${this.muted_images.dim}`;
    },
  },

  created() {
    // Fix bug: (important)
    /*   if (!this.$vuetify.theme) this.$vuetify.theme = {};
    if (!this.$vuetify.icons) this.$vuetify.icons = {};
    if (!this.$vuetify.display) this.$vuetify.display = {};*/

    if (this.images) this.muted_images = this.images;

    if (!this.muted_images.dim) this.muted_images.dim = "em";
    if (!this.muted_images.max_width) this.muted_images.max_width = 20;

    this.dim = this.muted_images.dim;
  },
  mounted() {
    this.element = this.$el;
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
        this.masterId,
      );
    },
  },
};
</script>

<style lang="scss"></style>

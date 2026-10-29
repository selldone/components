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
    v-intersect.once="onIntersect"
    :data="json_data"
    :class="{ 'a-article-addon--editable': editable }"
    class="flip-book"
    contenteditable="false"
    spellcheck="false"
  >
    <a-addon-toolbar
      v-if="editable"
      :element="element"
      :title="$t('global.commons.catalog')"
      edit-icon="add_photo_alternate"
      @click:edit="showEdit()"
    >
      <v-btn
        class="a-article-addon-tools__value"
        variant="text"
        :aria-label="$t('global.commons.max_height')"
        @click="showEdit('size')"
        ><v-icon size="16">height</v-icon>{{ max_height }}<v-icon size="12">arrow_drop_down</v-icon><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip">{{ $t('global.commons.max_height') }}</v-tooltip></v-btn
      >
    </a-addon-toolbar>

    <u-flipbook
      v-if="show"
      ref="flipbook"
      :pages="pages"
      :style="{ maxHeight: max_height }"
      class="flipbook"
    />
  </div>
</template>

<script lang="ts">
import UFlipbook from "./flipbook/UFlipbook.vue";
import AAddonToolbar from "../toolbar/AAddonToolbar.vue";
import { defineComponent } from "vue";
import { ArticleMixin } from "../../../mixin/article/ArticleMixin.ts";
import { articleAddonContext } from "../toolbar/article-addon-context";

export default defineComponent({
  name: "AAddonCatalog",
  mixins: [ArticleMixin],
  components: { AAddonToolbar,  UFlipbook },
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

      muted_pack: {
        max_height: 40,
        pages: [],
      },

      show: true,

      time: null,

      element: null,
    };
  },
  computed: {
    pages() {
      if (this.edit_mode && !this.muted_pack?.pages?.length) {
        return [
          require("../../../article/add-on/comparison/asset/image-placeholder.svg"),
        ];
      }
      return this.muted_pack?.pages;
    },
    json_data() {
      let time = this.time;
      return JSON.stringify(this.muted_pack);
    },

    max_height() {
      if (!this.muted_pack.max_height) return "100em";
      return `${this.muted_pack.max_height}em`;
    },
  },

  created() {
    // Fix bug: (important)
    /* if (!this.$vuetify.theme) this.$vuetify.theme = {};
    if (!this.$vuetify.icons) this.$vuetify.icons = {};
    if (!this.$vuetify.display) this.$vuetify.display = {};*/

    if (this.pack) this.muted_pack = this.pack;

    if (!this.muted_pack.pages || !Array.isArray(this.muted_pack.pages))
      this.muted_pack.pages = [];

    if (!this.muted_pack.max_height) this.muted_pack.max_height = 40;
  },
  mounted() {
    this.element = this.$el;
  },
  methods: {
    onIntersect(isIntersecting) { if (isIntersecting) this.onChange(); },
    onChange() {
      this.show = false;
      this.time = new Date();

      this.$nextTick(function () {
        this.show = true;
        this.$forceUpdate();
      });
    },

    showEdit(tab = null) {
      if (!this.editable || !articleAddonContext(this.element)) return;
      this.ShowFlipBookGlobalDialog(
        { ...this.muted_pack, pages: [...this.muted_pack.pages] },
        (val) => {
          const context = this.editable && articleAddonContext(this.element);
          if (!context) return;
          this.muted_pack = val;
          this.onChange();
          this.$nextTick(() => context.core.triggerInput());
        },
        () => {
          const context = this.editable && articleAddonContext(this.element);
          if (!context) return;
          context.element.remove();
          context.core.triggerInput();
        },
        tab,
        this.masterId,
      );
    },
  },
});
</script>

<style lang="scss">
.flipbook {
  width: 100%;
  height: 90vh;

  margin-bottom: 36px;

  .v-container {
    max-width: unset !important;
  }
}
</style>

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
    class="flip-book"
    :data="json_data"
    spellcheck="false"
    contenteditable="false"
    v-intersect:onec="onChange"
  >
    <s-article-editor-component-toolbar
      v-if="editable"
      @click:edit="showEdit()"
      :element="element"
      :title="$t('global.commons.catalog')"
      edit-icon="add_photo_alternate"
    >
      <v-btn
        @click="showEdit('size')"
        text
        class="body-2 border-end pe-2 text-capitalize"
        >{{ $t("global.commons.max_height") }}: <b>{{ max_height }}</b></v-btn
      >
    </s-article-editor-component-toolbar>

    <flipbook
      v-if="show"
      class="flipbook"
      :pages="muted_pack.pages"
      ref="flipbook"
      :style="{ maxHeight: max_height }"
      :zooms="null"
    />
  </div>
</template>

<script>
import Flipbook from "flipbook-vue";
import SArticleEditorComponentToolbar from "../toolbar/SArticleEditorComponentToolbar.vue";

export default {
  name: "SArticleFlipBook",
  components: { SArticleEditorComponentToolbar, Flipbook },
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

      element:null,


    };
  },
  computed: {
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
    if (!this.$vuetify.theme) this.$vuetify.theme = {};
    if (!this.$vuetify.icons) this.$vuetify.icons = {};
    if (!this.$vuetify.display) this.$vuetify.display = {};

    if (this.pack) this.muted_pack = this.pack;

    if (!this.muted_pack.pages || !Array.isArray(this.muted_pack.pages))
      this.muted_pack.pages = [];

    if (!this.muted_pack.max_height) this.muted_pack.max_height = 40;
  },
  mounted() {
    this.element=this.$el

  },
  methods: {
    onChange() {
      this.show = false;
      this.time = new Date();

      this.$nextTick(function () {
        this.show = true;
        this.$forceUpdate();
      });
    },

    showEdit(tab = null) {
      if (!this.editable) return;
      this.ShowFlipBookGlobalDialog(
        this.muted_pack,
        (val) => {
          this.muted_pack = val;
          this.onChange();
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

<style lang="scss">
.flipbook {
  width: 100%;
  height: 90vh;

  margin-bottom: 36px;
  .container {
    max-width: unset !important;
  }
}
</style>

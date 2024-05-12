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
    v-intersect:onec="onChange"
    :data="json_data"
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
        class="text-body-2 border-end pe-2 text-capitalize"
        variant="text"
        @click="showEdit('size')"
        >{{ $t("global.commons.max_height") }}: <b>{{ max_height }}</b></v-btn
      >
    </a-addon-toolbar>

    <flipbook
      v-if="show"
      ref="flipbook"
      :pages="pages"
      :style="{ maxHeight: max_height }"
      :zooms="null"
      class="flipbook"
    />
  </div>
</template>

<script>
import Flipbook from "flipbook-vue";
import AAddonToolbar from "../toolbar/AAddonToolbar.vue";
import { defineComponent } from "vue";
import { ArticleMixin } from "../../../mixin/ArticleMixin";

export default defineComponent({
  name: "AAddonCatalog",
  mixins: [ArticleMixin],
  components: { AAddonToolbar, Flipbook },
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
    pages(){
      if(this.edit_mode && !this.muted_pack?.pages?.length){
        return [
          require('../../../article/add-on/comparison/asset/image-placeholder.svg'),
        ];
      }
      return this.muted_pack?.pages
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

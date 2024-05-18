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
  <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Preview ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

  <div class="pa-2 text-center d-flex">
    <div
      style="
        max-width: 260px;
        width: 96%;
        background-color: #eee;
        border-radius: 12px 12px 24px 24px;
        min-height: 120px;
        overflow: hidden;
      "
      class="pa-3 d-block mx-auto"
    >
      <div class="small single-line">
        <v-avatar class="me-2 avatar-gradient -thin -category" size="24">
          <img
            v-if="category.icon"
            :src="getShopImagePath(category.icon, 64)"
          />
          <v-icon v-else>folder</v-icon>
        </v-avatar>

        <b>{{ category.title }}</b>
      </div>

      <div class="hr-dashed my-2"></div>
      <v-expand-transition>
        <div v-if="!engineCategories?.length && !engineTags?.length">
          <div class="typo-body op-0-5 py-5">Nothing set!</div>
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="engineCategories?.length">
          <products-dense-images-circles
            :ids="engineCategories.map((i) => 'c-' + i)"
            :max-count="limit"
            inline
          ></products-dense-images-circles>
        </div>
      </v-expand-transition>

      <v-expand-transition>
        <div v-if="engineTags?.length">
          <u-chip-tag
            v-for="item in engineTags.unique().limit(limit)"
            :key="item"
            :tag="item"
            size="x-small"
            style="margin: 1px"
          >
          </u-chip-tag>
          <v-icon v-if="engineTags?.length > limit" size="small"
            >more_horiz
          </v-icon>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script>
import ProductsDenseImagesCircles from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import UChipTag from "../../../../ui/chip/tag/UChipTag.vue";

export default {
  name: "BCategoryEnginePreview",
  components: {
    ProductsDenseImagesCircles,
    UChipTag,
  },
  emits: ["edit-engine"],
  props: {
    category: {
      required: true,
      type: Object,
    },
    engineCategories: {},
    engineTags: {},
    limit:{
      default:5
    }
  },

  data: () => ({}),
  computed: {},

  watch: {},

  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

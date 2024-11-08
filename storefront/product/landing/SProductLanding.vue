<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <LPageViewer
    v-if="page"
    :augment="augment"
    :initialPageData="page.content"
    :initial-page-css="page.css"
    :style="page.background"
  />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
import { AugmentHelper } from "@selldone/core-js/helper";

export default defineComponent({
  name: "SProductLanding",
  inject: ["$product"],
  components: {
    LPageViewer: defineAsyncComponent(
      () => import("@selldone/page-builder/page/viewer/LPageViewer.vue"),
    ),
  },

  computed: {
    // Custom internal page for the product
    page() {
      return this.$product?.page;
    },

    augment() {
      return AugmentHelper.MixAugments(
        this.$product?.augment,
        /*Flatten product - smart augment*/ AugmentHelper.ConvertToAugmentArray(
          { product: this.$product },
        ),
      );
    },
  },
});
</script>

<style scoped lang="scss"></style>

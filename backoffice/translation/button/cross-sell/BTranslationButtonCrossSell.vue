<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <b-translation-button
    v-model:translations="crossSell.translations"
    :default-value="crossSell[translationKey]"
    :label="label"
    :shop="shop"
    :translation-key="translationKey"
    :url="
      IS_VENDOR_PANEL
        ? window.VAPI.PUT_MY_VENDOR_CROSS_SELL_SET_TRANSLATIONS(
            $route.params.vendor_id,
            crossSell.product_id,
            crossSell.id,
            translationKey,
          )
        : window.API.PUT_CROSS_SELL_SET_TRANSLATIONS(
            shop.id,
            crossSell.product_id,
            crossSell.id,
            translationKey,
          )
    "
    is-string-mode
    @update:translations="
      (_translations) => {
        $emit('update:translations', _translations);
        $forceUpdate();
      }
    "
  ></b-translation-button>
</template>

<script lang="ts">
import BTranslationButton from "../../../translation/button/BTranslationButton.vue";

export default {
  name: "BTranslationButtonCrossSell",
  components: { BTranslationButton },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    crossSell: {
      required: true,
      type: Object,
    },
    translationKey: {
      required: true,
      type: String,
    },
    label: {},
  },
  data: () => ({}),
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  methods: {},
};
</script>

<style scoped></style>

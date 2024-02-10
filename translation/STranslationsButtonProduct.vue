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
  <s-translations-button
    v-model:translations="product.translations"
    :default-value="product[translationKey]"
    :is-product-spec-mode="isSpec"
    :is-string-mode="!isSpec"
    :label="label"
    :shop="shop"
    :translation-key="translationKey"
    :url="
      IS_VENDOR_PANEL
        ? window.VAPI.PUT_MY_VENDOR_PRODUCT_SET_TRANSLATIONS(
            $route.params.vendor_id,
            product.id,
            translationKey,
          )
        : window.API.PUT_PRODUCT_SET_TRANSLATIONS(
            shop.id,
            product.id,
            translationKey,
          )
    "
    @update:translations="
      (_translations) => {
        $emit('update:translations', _translations);
        $forceUpdate();
      }
    "
  ></s-translations-button>
</template>

<script>
import STranslationsButton from "@components/translation/STranslationsButton.vue";

export default {
  name: "STranslationsButtonProduct",
  components: { STranslationsButton },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    translationKey: {
      required: true,
      type: String,
    },
    label: {},

    isSpec: {
      default: false,
      type: Boolean,
    },
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

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
    :default-value="vendor[translationKey]"
    :label="label"
    :shop="shop"
    :translation-key="translationKey"
    v-model:translations="vendor.translations"
    :url="
      window.API.PUT_VENDOR_SET_TRANSLATIONS(shop.id, vendor.id, translationKey)
    "
    is-string-mode
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
  name: "STranslationsButtonVendor",
  components: { STranslationsButton },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
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
  computed: {},

  methods: {},
};
</script>

<style scoped></style>

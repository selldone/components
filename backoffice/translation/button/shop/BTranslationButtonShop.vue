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
    v-model:translations="shop.translations"
    :default-value="shop[translationKey]"
    :label="label"
    :shop="shop"
    :translation-key="translationKey"
    :url="window.API.PUT_SHOP_SET_TRANSLATIONS(shop.id, translationKey)"
    is-string-mode
    @update:translations="
      (_translations) => {
        $emit('update:translations', _translations);
        $forceUpdate();
      }
    "
  ></b-translation-button>
</template>

<script>
import BTranslationButton from "../../../translation/button/BTranslationButton.vue";

export default {
  name: "BTranslationButtonShop",
  components: { BTranslationButton },
  props: {
    shop: {
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

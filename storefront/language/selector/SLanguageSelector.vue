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
  <u-language-input
    v-if="is_multi_language"
    :available-languages="languages"
    :filled="filled"
    :flat="flat"
    :hide-details="hideDetails"
    :iconColor="iconColor"
    :iconOnly="iconOnly"
    :rounded="rounded"
    :solo="solo"
    :value="language"
    prepend-inner-icon="translate"
    @change="(lang) => (lang ? setCurrentLanguage(lang, true) : undefined)"
  />
</template>

<script>
import ULanguageInput from "@components/ui/language/input/ULanguageInput.vue";
import { ShopOptionsHelper } from "@core/helper/shop/ShopOptionsHelper";

export default {
  name: "SLanguageSelector",
  components: { ULanguageInput },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    solo: { type: Boolean, default: false },

    filled: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    iconOnly: { type: Boolean, default: false }, // Show circle button (shop top header)
    flat: { type: Boolean, default: false },
    iconColor: {},
  },

  data: () => ({}),

  computed: {
    language() {
      return this.getCurrentLanguage().code;
    },
    options() {
      return this.shop.options;
    },
    languages() {
      return ShopOptionsHelper.GetLanguages(this.shop);
    },

    is_multi_language() {
      return this.languages && this.languages.length;
    },
  },

  watch: {},

  created() {},
};
</script>

<style scoped></style>

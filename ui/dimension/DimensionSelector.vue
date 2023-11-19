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
  <v-select
    :value="value"
    @input="(val) => $emit('input', val)"
    :items="items"
    :label="label"
    :messages="messages"
    :color="color"
    :rounded="rounded"
    :outlined="outlined"
    :dark="dark"
    :disabled="disabled"
    :hide-details="hideDetails"
    :solo="solo"
    :dense="dense"
    :filled="filled"
    :flat="flat"
    @change="(val) => $emit('change', val)"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :clearable="clearable"
    :shaped="shaped"
    :height="height"
    :background-color="backgroundColor"
  >
    <template v-slot:append>
      <slot name="append"></slot>
    </template>
  </v-select>
</template>

<script>
export default {
  name: "DimensionSelector",

  props: {
    value: {},

    label: {},
    messages: {},
    color: {},
    height: {},
    dark: {
      default: false,
      type: Boolean,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    outlined: {
      default: false,
      type: Boolean,
    },

    disabled: {
      default: false,
      type: Boolean,
    },

    hideDetails: {
      default: false,
      type: Boolean,
    },

    hideText: {
      default: false,
      type: Boolean,
    },
    solo: {
      default: false,
      type: Boolean,
    },

    activeCurrencies: {
      require: false,
      type: Array,
    },
    dense: {
      default: false,
      type: Boolean,
    },
    filled: {
      default: false,
      type: Boolean,
    },
    shaped: {
      default: false,
      type: Boolean,
    },

    flat: {
      default: false,
      type: Boolean,
    },
    prependIcon: {},
    prependInnerIcon: {},
    clearable: {
      default: false,
      type: Boolean,
    },
    backgroundColor: {},
  },

  data: () => ({
    items: [
      "auto",
      "unset",
      "px",
      "em",
      "rem",
      "vh",
      "vw",
      "%",
      "mm",
      "cm",
      "in",
      "pt",
      "pc",
      "ex",
      "ch",
    ],
  }),

  computed: {},

  watch: {},
  created() {},
};
</script>

<style lang="scss"></style>

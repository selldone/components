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
    :bg-color="backgroundColor"
    :clearable="clearable"
    :color="color"
    :density="dense ? 'compact' : undefined"
    :disabled="disabled"
    :flat="flat"
    :hide-details="hideDetails"
    :items="items"
    :label="label"
    :messages="messages"
    :model-value="modelValue"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :rounded="rounded"
    :single-line="singleLine"
    :theme="dark ? 'dark' : 'light'"
    :variant="
      variant
        ? variant
        : solo
          ? 'solo'
          : filled
            ? 'filled'
            : outlined
              ? 'outlined'
              : 'underlined'
    "
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
        $emit('change', val);
      }
    "
    :menu-icon="menuIcon"
    @click:clear="$emit('click:clear')"
  >
    <template v-slot:append-inner>
      <slot name="append-inner"></slot>
    </template>
  </v-select>
</template>

<script lang="ts">
export default {
  name: "UDimensionInputUnit",
  emits: ["update:modelValue", "change", "click:clear"],
  props: {
    modelValue: {},

    label: {},
    messages: {},
    color: {},
    dark: {
      default: false,
      type: Boolean,
    },
    rounded: {},
    singleLine: Boolean,
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
    variant: {},

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
    menuIcon: {
      default: "$dropdown",
    },
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
      "fit-content",
      "max-content",
      "min-content",
    ],
  }),

  computed: {},

  watch: {},
  created() {},
};
</script>

<style lang="scss"></style>

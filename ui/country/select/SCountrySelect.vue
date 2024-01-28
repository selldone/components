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
  <v-autocomplete
    :label="label"
    :model-value="modelValue"
    @update:model-value="
      (val) => {
        $emit('update:modelValue', val);
        $emit('change', val);
      }
    "
    :items="countries"
    item-title="name"
    :item-value="itemValue"
    :messages="messages"
    :rounded="rounded"
    :return-object="returnObject"
    :disabled="disabled || !countries || !countries.length"
    :color="color"
    :flat="flat"
    :prepend-inner-icon="prependInnerIcon"
    :append-icon="appendIcon"
    :multiple="multiple"
    :chips="chips"
    :density="dense ? 'compact' : undefined"
    :rules="required ? [GlobalRules.required()] : []"
    :readonly="readonly"
    :error-messages="errorMessages"
    :loading="loading"
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
    :hide-details="hideDetails"
    :clearable="clearable"
    :placeholder="placeholder"
    :bg-color="transparent ? 'transparent' : undefined"
    :autocomplete="autocomplete"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" :title="item.raw.name" class="text-start">
        <template v-slot:prepend>
          <flag :iso="item.raw.alpha2" :squared="false" class="me-2" />
        </template>
      </v-list-item>
    </template>

    <template v-slot:chip="{ item, props }">
      <component :is="chips ? 'v-chip' : 'span'" class="m-1" v-bind="props">
        <flag :iso="item.raw.alpha2" :squared="false" />
        <span v-if="!noCountryName" class="px-3 small">{{
          item.raw.name
        }}</span>
      </component>
    </template>
    <template v-slot:prepend-inner>
      <slot name="prepend-inner"></slot>
      <!-- Show value if countries not loaded yet! -->
      <span
        v-if="modelValue && isString(modelValue) && !countries.length"
        class="single-line ms-1 me-2"
      >
        <flag :iso="modelValue" :squared="false" class="me-2" />
        {{ modelValue }}
      </span>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  name: "SCountrySelect",
  emits: ["change", "update:modelValue"],
  props: {
    modelValue: {},
    label: {},
    messages: {},
    errorMessages: {},
    color: {},
    placeholder: {},

    multiple: {
      default: false,
      type: Boolean,
    },
    required: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    dense: {
      default: false,
      type: Boolean,
    },

    chips: {
      default: false,
      type: Boolean,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    filled: {
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
    loading: {
      default: false,
      type: Boolean,
    },

    returnObject: {
      default: false,
      type: Boolean,
    },

    flat: {
      default: false,
      type: Boolean,
    },

    itemValue: {
      default: "code",
      type: String,
    },
    prependInnerIcon: {},
    appendIcon: {},

    noCountryName: {
      default: false,
      type: Boolean,
    },
    readonly: {
      default: false,
      type: Boolean,
    },
    variant: {},
    solo: {
      default: false,
      type: Boolean,
    },
    hideDetails: {
      default: false,
      type: Boolean,
    },
    filter: {
      type: Array,
    },
    clearable: {
      default: false,
      type: Boolean,
    },
    transparent: {
      default: false,
      type: Boolean,
    },
    autocomplete: {},
  },

  data: () => ({}),
  computed: {
    countries() {
      if (!this.$store.getters.getCountries) return null;

      if (this.filter) {
        return this.$store.getters.getCountries.filter((it) =>
          this.filter.includes(it.alpha2),
        );
      }
      return this.$store.getters.getCountries;
    },
  },
  watch: {},
  methods: {},
  created() {
    if (!this.countries || !this.countries.length) {
      this.fetchCountries();
    }
  },
};
</script>

<style scoped></style>

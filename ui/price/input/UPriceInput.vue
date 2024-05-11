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
  <v-text-field
    v-model="model"
    v-model:focused="focused"
    :bg-color="backgroundColor"
    :clearable="clearable"
    :density="dense ? 'compact' : undefined"
    :disabled="disabled"
    :error-messages="errorMessages"
    :flat="flat"
    :hide-details="hideDetails"
    :hint="hint"
    :label="label"
    :messages="messages"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :rounded="rounded"
    :rules="rules"
    :suffix="suffix ? suffix : currency_obj ? $t(currency_obj.name) : undefined"
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
    @blur="onBlur"
    @change="onChange"
    @focus="onFocus"
    @keyup="onKeyUp"
    @keydown.enter="$emit('enter')"
    @click:clear="$emit('click:clear')"
    :theme="dark ? 'dark' : 'light'"
  >
    <template v-slot:append-inner>
      <slot name="append-inner"></slot>
    </template>
  </v-text-field>
</template>

<script>
import { NumberHelper } from "@selldone/core-js/helper/number/NumberHelper";

function tryParseFloat(str, defaultValue) {
  let retValue = defaultValue;
  if (str !== null) {
    if (str.length > 0) {
      if (!isNaN(str)) {
        retValue = parseFloat(str);
      }
    }
  }
  return retValue;
}

export default {
  name: "UPriceInput",
  emits: ["update:modelValue", "blur", "change", "enter", "click:clear"],
  props: {
    modelValue: null,
    messages: {},
    errorMessages: null,
    allowNegative: {
      type: Boolean,
      default: false,
    },
    label: {},
    hint: {},
    suffix: {
      type: String,
      default: "",
    },
    thousandsSeparator: {
      type: String,
      default: ",",
    },
    decimalSeparator: {
      type: String,
      default: ".",
    },
    languageCode: {
      type: String,
      default: "en-US",
    },

    decimal: {
      type: Number,
      default: 6,
    },

    outlined: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    variant: {},
    dense: {
      type: Boolean,
      default: false,
    },

    clearable: {
      type: Boolean,
      default: false,
    },

    filled: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    rules: {},
    prependIcon: {},
    prependInnerIcon: {},

    backgroundColor: {},
    hideDetails: {
      type: Boolean,
      default: false,
    },
    currency: {},
    dark: Boolean,
  },
  data() {
    return {
      numberValue: this.modelValue,
      model: this.modelValue,
      isMasked: true,
      thousandsSeparatorRegex: new RegExp(`\\${this.thousandsSeparator}`, "g"),
      decimalSeparatorRegex: new RegExp(`\\${this.decimalSeparator}`, "g"),

      focused: false,
    };
  },

  computed: {
    currency_obj() {
      if (!this.currency) return null;
      return this.GetCurrency(this.currency);
    },
  },
  watch: {
    numberValue(v) {
      this.$emit("update:modelValue", v);
    },
    modelValue(v) {
      this.numberValue = v;
      if (!this.focused) {
        this.format();
      }
    },
  },
  created() {
    this.format();
  },
  methods: {
    onFocus() {
      this.isMasked = false;
      this.updateModel();
    },
    onBlur() {
      this.$emit("blur");
      this.isMasked = true;
      this.format();
    },
    onKeyUp() {
      this.updateNumberValue();
    },
    onChange() {
      this.$emit("change");
    },
    updateNumberValue() {
      let v = NumberHelper.toEnglishDigits(this.model);
      let parsed;
      v = v.replace(this.thousandsSeparatorRegex, "");
      if (this.decimalSeparator !== ".")
        v = v.replace(this.decimalSeparatorRegex, this.thousandsSeparator);
      const result = tryParseFloat(v);
      if (!result) parsed = 0;
      else parsed = result;
      if (!this.allowNegative && result < 0) parsed = 0;

      this.numberValue = parseFloat(
        parsed.toFixed(
          this.currency_obj ? this.currency_obj.floats : this.decimal,
        ),
      );
    },
    updateModel() {
      if (this.numberValue === null || this.numberValue === undefined) return;
      let v = this.numberValue.toString();
      v = v.replace(this.thousandsSeparatorRegex, this.decimalSeparator);
      this.model = v === "0" ? "" : v;
    },
    format() {
      if (this.numberValue === null) return;
      let v = this.numberValue;
      if (!v) v = "0";
      v = v.toLocaleString(this.languageCode, {
        style: "decimal",
        maximumFractionDigits: this.currency_obj
          ? this.currency_obj.floats
          : this.decimal,
      });

      if (
        v.length !== 1 &&
        v.slice(v.indexOf(this.decimalSeparator) + 1).length === 1
      )
        v += "0";
      this.model = v;

      // console.log(v);
    },
  },
};
</script>

<style lang="scss"></style>

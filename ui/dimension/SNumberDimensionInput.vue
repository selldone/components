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
  <s-dimension-selector
    v-if="no_number_cal"
    v-model="dim_val"
    :label="label"
    :suffix="suffix"
    :prependIcon="prependIcon"
    :hideDetails="hideDetails"
    :messages="messages"
    :filled="filled"
    :single-line="singleLine"
    :hide-details="hideDetails && !messages"
    :prepend-icon="prependIcon"
    :loading="loading"
    :solo="solo"
    :flat="flat"
    :readonly="readonly"
    :disabled="disabled || lock"
    :rounded="rounded"
    :background-color="backgroundColor"
  >
    <template v-slot:append>
      <div style="min-height: 38px"></div>
    </template>
  </s-dimension-selector>
  <s-number-input
    v-else
    v-model="number_val"
    :step="1"
    :decimal="3"
    :disabled="disabled"
    :min="-99999"
    :max="99999"
    :icon="icon"
    :textCenter="true"
    :clearable="clearable"
    @clear="dim_val = 'unset'"
    :readonly="readonly"
    :label="label"
    :suffix="suffix"
    :prependIcon="prependIcon"
    :hideDetails="hideDetails"
    :messages="messages"
    :filled="filled"
    :single-line="singleLine"
    :hide-details="hideDetails && !messages"
    :prepend-icon="prependIcon"
    :loading="loading"
    :solo="solo"
    :flat="flat"
    :rounded="rounded"
    @blur="$emit('blur')"
    :background-color="backgroundColor"
    :lock="lock"
  >
    <template v-slot:append>
      <s-dimension-selector
        v-model="dim_val"
        hide-details
        :readonly="readonly"
        :disabled="disabled || lock"
        :shaped="!rounded"
        :height="40"
        dense
        solo
        flat
        :style="{
          width: rounded && solo ? '110px' : '84px',
          marginTop:
            rounded && solo ? '-7px' : rounded && !solo ? '-14px' : undefined,
        }"
        :rounded="rounded && solo"
      >
      </s-dimension-selector>
    </template>
  </s-number-input>
</template>

<script>
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import SDimensionSelector from "./SDimensionSelector.vue";
export default {
  name: "SNumberDimensionInput",
  components: { SDimensionSelector, SNumberInput },
  props: {
    value: {},

    disabled: {
      default: false,
      type: Boolean,
    },

    label: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    suffix: {
      type: String,
      default: null,
    },
    prependIcon: {
      type: String,
      default: null,
    },

    hideDetails: {
      type: Boolean,
      default: false,
    },

    messages: {},

    filled: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {},
    singleLine: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    showButtons: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },

    clearable: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },

    alternativeButtonText: {},
    alternativeButtonValue: {},
    appendIcon: {},
    prependInnerIcon: {},

    lock: {
      // Has lock mode and the default is locked.
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      number_val: 0,
      dim_val: "px",
    };
  },

  computed: {
    gen_value() {
      if (this.dim_val === "auto") return "auto";
      if (this.dim_val === "unset") return "unset";

      if (!this.number_val || !this.dim_val)
        return "0" + (this.dim_val ? this.dim_val : "px");

      return `${this.number_val}${this.dim_val}`;
    },
    no_number_cal() {
      return this.noNumberVal(this.value);
    },
  },
  watch: {
    value: {
      handler: function (newVal, oldVal) {
        this.extractValue(newVal);
      },
    },

    gen_value(val) {
      this.$emit("input", val);

      this.$nextTick(() => {
        this.$emit("change", val);
      });
    },
  },
  created() {
    if (this.value) {
      this.extractValue(this.value);
    } else {
      this.dim_val = "unset";
    }
  },
  methods: {
    noNumberVal(value) {
      return ["auto", "unset"].includes(value);
    },

    extractValue(value) {
      if (this.noNumberVal(value)) {
        this.dim_val = value;
        return;
      }

      if (!value || !this.isString(value)) {
        this.number_val = null;
        this.dim_val = null;
        return;
      }
      let num = 0;
      let dim = "px";
      try {
        const split_string = value.match(/(-?\d+(\.\d+)?)([a-z]+)/i);

        // console.log("extractValue:", split_string);

        num = parseFloat(split_string[1]);
        dim = split_string[3];

        ////  console.log("Text:" + dim + " & Number:" + num);
      } catch (e) {
        // console.error(e);
      }

      this.number_val = num;
      this.dim_val = dim;
    },
  },
};
</script>

<style scoped lang="scss"></style>

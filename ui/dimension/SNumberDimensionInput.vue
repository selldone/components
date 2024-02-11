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
    :background-color="backgroundColor"
    :disabled="disabled || lock"
    :filled="filled"
    :flat="flat"
    :hide-details="hideDetails && !messages"
    :hideDetails="hideDetails"
    :label="label"
    :loading="loading"
    :messages="messages"
    :prepend-icon="prependIcon"
    :prependIcon="prependIcon"
    :readonly="readonly"
    :rounded="rounded"
    :single-line="singleLine"
    :solo="solo"
    :suffix="suffix"
  >
    <template v-slot:append-inner>
      <div style="min-height: 38px"></div>
    </template>
  </s-dimension-selector>
  <s-number-input
    v-else
    v-model="number_val"
    :background-color="backgroundColor"
    :clearable="clearable"
    :decimal="3"
    :disabled="disabled"
    :filled="filled"
    :flat="flat"
    :hide-details="hideDetails && !messages"
    :hideDetails="hideDetails"
    :icon="icon"
    :label="label"
    :loading="loading"
    :lock="lock"
    :max="99999"
    :messages="messages"
    :min="-99999"
    :prepend-icon="prependIcon"
    :prependIcon="prependIcon"
    :readonly="readonly"
    :rounded="rounded"
    :single-line="singleLine"
    :solo="solo"
    :step="1"
    :suffix="suffix"
    :textCenter="true"
    @blur="$emit('blur')"
    @clear="dim_val = 'unset'"
  >
    <template v-slot:append-inner>
      <s-dimension-selector
        v-model="dim_val"
        :disabled="disabled || lock"
        :height="40"
        :readonly="readonly"
        :rounded="rounded && solo"
        :shaped="!rounded"
        :style="{
          width: rounded && solo ? '110px' : '84px',
          marginTop:
            rounded && solo ? '-7px' : rounded && !solo ? '-14px' : undefined,
        }"
        dense
        flat
        hide-details
        solo
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

<style lang="scss" scoped></style>

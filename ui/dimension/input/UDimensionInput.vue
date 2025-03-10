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
  <u-dimension-input-unit
    v-if="no_number_cal"
    v-model="dim_val"
    :background-color="backgroundColor"
    :disabled="disabled || lock"
    :filled="filled"
    :flat="flat"
    :hide-details="hideDetails && !messages"
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
    :variant="variant"
    :dense="dense"
    :clearable="clearable"
    @click:clear="$emit('clear')"
  >
    <!--
    <template v-slot:append-inner>
      <div style="min-height: 38px"></div>
    </template>-->
  </u-dimension-input-unit>
  <div v-else class="d-flex align-center">
    <u-number-input
      v-model="number_val"
      :background-color="backgroundColor"
      :clearable="clearable"
      :decimal="3"
      :disabled="disabled"
      :filled="filled"
      :flat="flat"
      :hide-details="hideDetails && !messages"
      :icon="icon"
      :label="label"
      :loading="loading"
      :lock="lock"
      :max="99999"
      :messages="messages"
      :min="!onlyPositiveValue ? -99999 : 0"
      :prepend-icon="prependIcon"
      :prependIcon="prependIcon"
      :readonly="readonly"
      :rounded="rounded"
      :single-line="singleLine"
      :solo="solo"
      :step="1"
      :suffix="suffix"
      :textCenter="true"
      :variant="variant"
      class="-number-input flex-grow-1"
      @blur="$emit('blur')"
      @clear="
        dim_val = 'unset';
        $emit('clear');
      "
      :dense="dense"
    >
    </u-number-input>
    <u-dimension-input-unit
      v-model="dim_val"
      :disabled="disabled || lock"
      :filled="filled"
      :flat="flat"
      :hide-details="hideDetails && !messages"
      :readonly="readonly"
      :rounded="rounded"
      :single-line="singleLine"
      :solo="solo"
      :style="{
        /* width: rounded && solo ? '110px' : '84px',
          marginTop:
            rounded && solo ? '-7px' : rounded && !solo ? '-14px' : undefined,*/
      }"
      :variant="variant"
      style="width: 60px; max-width: 90px"
      :class="{ 'ms-1': rounded, '-move-end-icon': dense }"
      :dense="dense"
    >
    </u-dimension-input-unit>
  </div>
</template>

<script lang="ts">
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import UDimensionInputUnit from "./unit/UDimensionInputUnit.vue";
import { isString } from "lodash-es";

export default {
  name: "UDimensionInput",
  components: { UDimensionInputUnit, UNumberInput },
  emits: ["update:modelValue", "change", "clear"],
  props: {
    modelValue: {},

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

    rounded: {},
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

    variant: {},

    onlyPositiveValue: {
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
      if (this.dim_val === "fit-content") return "fit-content";
      if (this.dim_val === "max-content") return "max-content";
      if (this.dim_val === "min-content") return "min-content";

      if (!this.number_val || !this.dim_val)
        return "0" + (this.dim_val ? this.dim_val : "px");

      return `${this.number_val}${this.dim_val}`;
    },
    no_number_cal() {
      return this.noNumberVal(this.modelValue);
    },
  },
  watch: {
    modelValue: {
      handler: function (newVal, oldVal) {
        this.extractValue(newVal);
      },
    },

    gen_value(val) {
      this.$emit("update:modelValue", val);

      this.$nextTick(() => {
        this.$emit("change", val);
      });
    },
  },
  created() {
    if (this.modelValue) {
      this.extractValue(this.modelValue);
    } else {
      this.dim_val = "unset";
    }
  },
  methods: {
    noNumberVal(value) {
      return [
        "auto",
        "unset",
        "fit-content",
        "max-content",
        "min-content",
      ].includes(value);
    },

    extractValue(value) {
      if (this.noNumberVal(value)) {
        this.dim_val = value;
        return;
      }

      if (!value || !isString(value)) {
        this.number_val = null;
        this.dim_val = null;
        return;
      }

      let num = 0;
      let dim = "px";

      try {
        const regex = !this.onlyPositiveValue
          ? /(-?\d+(\.\d+)?)([a-z%]+)/i
          : /(\d+(\.\d+)?)([a-z%]+)/i;
        const split_string = value.match(regex);

        if (!split_string) {
          throw new Error("Invalid value");
        }

        num = parseFloat(split_string[1]);
        dim = split_string[3];
      } catch (e) {
        console.error("Invalid input format:", e);
        this.number_val = null;
        this.dim_val = null;
        return;
      }

      this.number_val = num;
      this.dim_val = dim;
    },
  },
};
</script>

<style lang="scss" scoped>
.-move-end-icon {
  ::v-deep(.v-select__menu-icon) {
    margin-inline-end: -14px !important;
    margin: 0;
  }
}

::v-deep(.-number-input) {
  .v-field {
    padding-left: 2px;
    padding-right: 2px;
    font-size: 14px;
  }
}
</style>

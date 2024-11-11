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
  <div class="d-flex align-center justify-center">
    <u-number-input
      v-model="h"
      :dense="dense"
      :max="23"
      :min="0"
      :title="$t('global.commons.hour')"
      :variant="variant"
      background-color="transparent"
      class="intim"
      hide-details
      placeholder="00"
      single-line
    >
    </u-number-input>
    :
    <u-number-input
      v-model="m"
      :dense="dense"
      :max="59"
      :min="0"
      :title="$t('global.commons.minute')"
      :variant="variant"
      background-color="transparent"
      class="intim"
      hide-details
      placeholder="00"
      single-line
    >
    </u-number-input>

    <v-slide-y-transition hide-on-leave>
      <img
        v-if="obj"
        :key="obj.value"
        :src="obj.icon"
        class="mx-1"
        height="20"
        width="20"
      />
    </v-slide-y-transition>
  </div>
</template>

<script lang="ts">
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import {isString} from "lodash-es";

export default {
  name: "UTimeInput",
  components: { UNumberInput },
  props: {
    modelValue: {},
    min: { type: String },
    max: { type: String },
    variant: {
      default: "underlined",
    },
    dense: Boolean,
  },

  data: () => ({
    h: 0,
    m: 0,
  }),

  computed: {
    out() {
      return this.h + ":" + this.m;
    },

    obj() {
      if (this.h < 8) return TimeSpans.Instant;
      else if (this.h < 14) return TimeSpans.Morning;
      else if (this.h < 20) return TimeSpans.Evening;
      return TimeSpans.Night;
    },
    max_array() {
      const arr = this.max?.split(":");
      return arr?.length === 2 ? arr : null;
    },

    min_array() {
      const arr = this.min?.split(":");
      return arr?.length === 2 ? arr : null;
    },

    max_h() {
      if (!this.max_array) return 23;
      return Math.min(23, this.max_array[0]);
    },

    max_m() {
      if (!this.max_array) return null;
      return Math.min(59, this.max_array[1]);
    },

    min_h() {
      if (!this.min_array) return 0;
      return Math.max(0, this.min_array[0]);
    },

    min_m() {
      if (!this.min_array) return 0;
      return Math.max(0, this.min_array[1]);
    },
  },
  watch: {
    modelValue() {
      this.assignValue();
    },

    out() {
      this.updateValue();
    },
  },

  created() {
    this.assignValue();
  },
  methods: {
    assignValue() {
      if (this.modelValue === this.out) return;
      if (!this.modelValue || !isString(this.modelValue)) {
        this.h = 0;
        this.m = 0;
        return;
      }
      const arr = this.modelValue.split(":");
      if (arr.length !== 2) {
        this.h = 0;
        this.m = 0;
        return;
      }
      this.h = parseInt(arr[0]);
      this.m = parseInt(arr[1]);

      if (this.max_h != null && this.h > this.max_h) this.h = this.max_h;
      if (this.max_m != null && this.m > this.max_m) this.m = this.max_m;

      if (this.min_h != null && this.h < this.min_h) this.h = this.min_h;
      if (this.min_m != null && this.m < this.min_m) this.h = this.min_m;
    },
    updateValue() {
      this.$emit("update:modelValue", this.out);
      this.$emit("change", this.out);
    },
  },
};
</script>

<style lang="scss" scoped>
.intim {
  width: 80px !important;
  max-width: 80px !important;
}
</style>

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
  <div class="d-flex align-center">
    <s-number-input
      v-model="h"
      solo
      hide-details
      flat
      placeholder="00"
      :min="0"
      :max="23"
      dense
      background-color="transparent"
      class="intim"
      :title="$t('global.commons.hour')"
    >
    </s-number-input>
    :
    <s-number-input
      v-model="m"
      solo
      hide-details
      flat
      placeholder="00"
      :min="0"
      :max="59"
      dense
      background-color="transparent"
      class="intim"
      :title="$t('global.commons.minute')"
    >
    </s-number-input>

    <v-slide-y-transition hide-on-leave>
      <img
        v-if="obj"
        :src="obj.icon"
        :key="obj.value"
        width="20"
        height="20"
        class="mx-1"
      />
    </v-slide-y-transition>
  </div>
</template>

<script>
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import { TimeSpans } from "@core/enums/logistic/TimeSpans";
export default {
  name: "TimeInput",
  components: { SNumberInput },
  props: {
    value: {},
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
  },
  watch: {
    value() {
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
      if (this.value === this.out) return;
      if (!this.value || !this.isString(this.value)) {
        this.h = 0;
        this.m = 0;
        return;
      }
      const arr = this.value.split(":");
      if (arr.length !== 2) {
        this.h = 0;
        this.m = 0;
        return;
      }
      this.h = parseInt(arr[0]);
      this.m = parseInt(arr[1]);
    },
    updateValue() {
      this.$emit("input", this.out);
      this.$emit("change", this.out);
    },
  },
};
</script>

<style lang="scss" scoped>
.intim {
  width: 52px !important;
  max-width: 52px !important;
}
</style>

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
      :max="23"
      :min="0"
      :title="$t('global.commons.hour')"
      background-color="transparent"
      class="intim"
      dense
      flat
      hide-details
      placeholder="00"
      solo
    >
    </s-number-input>
    :
    <s-number-input
      v-model="m"
      :max="59"
      :min="0"
      :title="$t('global.commons.minute')"
      background-color="transparent"
      class="intim"
      dense
      flat
      hide-details
      placeholder="00"
      solo
    >
    </s-number-input>

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

<script>
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import { TimeSpans } from "@core/enums/logistic/TimeSpans";

export default {
  name: "STimeInput",
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

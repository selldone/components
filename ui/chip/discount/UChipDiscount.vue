<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-chip
    v-if="percent || showZero"
    :color="color"
    :size="size"
    label
    style="line-height: normal"
    title="Discount percent"
    variant="flat"
    :class="{ disabled: finished }"
  >
    <v-icon start>fa:fas fa-percentage</v-icon>

    <div class="d-flex flex-column">
      <b>
        {{ numeralFormat(percent, "0.[0]") }}
      </b>
      <div style="font-size: 7px">
        <span v-if="finished">{{ $t("global.commons.finished") }}</span>

        <span v-else> {{ $t("global.commons.discount") }}</span>
      </div>
    </div>
  </v-chip>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DateConverter } from "@selldone/core-js";

export default defineComponent({
  name: "UChipDiscount",
  props: {
    percent: {},
    showZero: Boolean,
    size: {},
    color: {
      default: "#C2185B",
    },
    start: {},
    end: {},
  },

  computed: {
    now() {
      return new Date().getTime();
    },

    inBetween() {
      return DateConverter.inBetweenDates(
        new Date(),
        DateConverter.convertToLocalTime(this.start),
        DateConverter.convertToLocalTime(this.end),
      );
    },

    finished() {
      return (this.start || this.end) && !this.inBetween;
    },
  },
});
</script>

<style lang="scss" scoped></style>

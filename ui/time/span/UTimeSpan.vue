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
  <div class="s--time-span">
    <div class="d-flex align-center text-start pt-2">
      <small class="not-selectable">{{ $t("time_spans.days_range") }}</small>
      <v-spacer></v-spacer>

      <u-time-span-selector
        :date-range="date_range"
        :max-days="maxDays"
        variant="text"
        @select="setTimeSpan"
        size="small"
      ></u-time-span-selector>
    </div>

    <v-range-slider
      v-show="!loading"
      v-model="date_range"
      :max="maxDays"
      :step="1"
      :tick-size="8"
      color="amber"
      density="compact"
      hide-details
      min="0"
      thumb-color="#c27800"
      thumb-label
      @end="onChange"
    ></v-range-slider>
    <v-progress-linear
      v-show="loading"
      class="my-2"
      color="deep-purple-accent-4"
      height="6"
      indeterminate
      rounded
    ></v-progress-linear>

    <div
      :class="{ dense: dense, 'small-width': smallWidth }"
      class="d-flex not-selectable text-center"
    >
      <small>{{ getLocalTimeString(end_date, false, dense, true) }}</small>
      <v-spacer></v-spacer>
      <small>{{ getLocalTimeString(start_date, false, dense, true) }}</small>
    </div>

    <u-loading-progress v-if="softLoading"></u-loading-progress>
  </div>
</template>

<script>
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UTimeSpanSelector from "./selector/UTimeSpanSelector.vue";
import { throttle } from "lodash-es";

export default {
  name: "UTimeSpan",
  components: { UTimeSpanSelector },
  emits: [
    "onChange",
    "update:startDate",
    "update:endDate",
    "update:dateRange",
    "update:offset",
    "update:days",
  ],
  props: {
    startDate: {},
    endDate: {},
    dateRange: {},
    dark: {
      type: Boolean,
      default: false,
    },
    triggerOnEnd: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    softLoading: {
      type: Boolean,
      default: false,
    },
    offset: {},
    days: {},

    maxDays: {
      type: Number,
      default: 30,
    },
    originDate: {
      // For relative date!
      type: Date,
      default: () => {
        return new Date();
      },
    },
    dense: {
      type: Boolean,
      default: false,
    },
    smallWidth: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    date_range: [0, 30],
  }),
  computed: {
    start_date() {
      return DateConverter.GetStartOfDateBefore(
        this.date_range[1],
        this.originDate,
      );
    },
    end_date() {
      return DateConverter.GetEndOfDateBefore(
        this.date_range[0],
        this.originDate,
      );
    },
  },

  watch: {
    date_range: throttle(function (newVal, oldVal) {
      if (this.triggerOnEnd) return;
      this.emitValues();
    }, 800),
  },

  methods: {
    onChange() {
      if (!this.triggerOnEnd) return;
      this.emitValues();
    },

    emitValues() {
      //console.log('emitValues',this.date_range)
      const offset = this.date_range[0];
      const days = this.date_range[1] - this.date_range[0];

      this.$emit("update:startDate", this.start_date);
      this.$emit("update:endDate", this.end_date);

      this.$emit("update:offset", offset);
      this.$emit("update:days", days);

      this.$emit("update:dateRange", this.date_range);

      this.$emit("onChange", { offset: offset, days: days });
    },

    setTimeSpan(item) {
      this.date_range = [item.to, item.from];
      //  console.log("Timespan > Emit new value > this.date_range", this.date_range, "item", item);

      if (this.triggerOnEnd) {
        this.emitValues();
      }
    },
  },
  created() {
    if (this.offset !== undefined && this.days !== undefined) {
      /* console.log(
        "Timespan > Has initial value > this.offset",
        this.offset,
        "this.days",
        this.days
      );*/

      this.setTimeSpan({
        title: "time_spans.custom",
        from: this.offset + this.days,
        to: this.offset,
      });
    } else {
      this.setTimeSpan({ title: "time_spans.last_30", from: 30, to: 0 });
    }
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--time-span {
  position: relative;

  .dense {
    margin-top: -7px;
  }

  .small-width {
    font-size: 12px;
  }
}
</style>

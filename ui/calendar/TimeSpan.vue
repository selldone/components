<template>
  <div class="pt-2">
    <div class="d-flex mt-2 text-start">
      <small class="not-selectable">{{ $t("time_spans.days_range") }}:</small>
      <v-spacer></v-spacer>

      <time-spans-text-selector :date-range="date_range" :max-days="maxDays" @select="setTimeSpan"></time-spans-text-selector>
    </div>

    <v-range-slider
      v-show="!loading"
      :dark="dark"
      v-model="date_range"
      min="0"
      :max="maxDays"
      :tick-size="8"
      thumb-color="#c27800"
      dense
      hide-details
      color="amber"
      class="mx-auto"
      thumb-label
      :loading="softLoading"
      @change="onChange"
    ></v-range-slider>
    <v-progress-linear
      v-show="loading"
      color="deep-purple accent-4"
      class="my-2"
      indeterminate
      rounded
      height="6"
    ></v-progress-linear>

    <div class="d-flex not-selectable" :class="{ dense: dense }">
      <small>{{ getLocalTimeString(end_date, false, false, true) }}</small>
      <v-spacer></v-spacer>
      <small>{{ getLocalTimeString(start_date, false, false, true) }}</small>
    </div>
  </div>
</template>

<script>
import { DateConverter } from "@core/helper/date/DateConverter";
import TimeSpansTextSelector from "./TimeSpansTextSelector.vue";
import _ from "lodash-es";

export default {
  name: "TimeSpan",
  components: {TimeSpansTextSelector},
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
  },
  data: () => ({
    date_range: [0, 30],
  }),
  computed: {


    start_date() {
      return DateConverter.GetStartOfDateBefore(
        this.date_range[1],
        this.originDate
      );
    },
    end_date() {
      return DateConverter.GetEndOfDateBefore(
        this.date_range[0],
        this.originDate
      );
    },

  },

  watch: {
    /*  start_date(val) {
      this.$emit("update:startDate", val);
    },
    end_date(val) {
      this.$emit("update:endDate", val);
    },*/
    /*  date_range(val){

      },*/

    date_range: _.throttle(function (newVal, oldVal) {
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
      /* console.log(
        "Timespan > Emit new value > this.date_range",
        this.date_range,
        "item",
        item
      );*/

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

<style scoped lang="scss">
.dense {
  margin-top: -7px;
}
</style>

<template>
  <div>
    <p v-if="!small" class="text-center mt-2 mb-0">
      <small>{{ title }}</small>
    </p>

    <v-tooltip
      v-if="has_progress_to_end"
      bottom
      :color="SaminColorDarkDeep"
      dark
    >
      <template v-slot:activator="{ on }">
        <v-progress-linear
          class="my-1"
          :color="activeColor"
          :height="small ? 6 : 10"
          :value="passed_percent"
          striped
          rounded
          v-on="on"
        />
      </template>
      <p class="font-weight-bold">{{ title }}</p>
      <p v-if="!no_start_end" class="text-center small m-0">
        <span class="mx-2"> {{ getFromNowString(startTime) }}</span>
        <v-icon class="flip-image-rtl" color="#fff">forward</v-icon>
        <span class="mx-2"> {{ getFromNowString(endTime) }}</span>
      </p>
    </v-tooltip>

    <v-tooltip
      v-if="has_progress_to_start"
      bottom
      :color="SaminColorDarkDeep"
      dark
    >
      <template v-slot:activator="{ on }">
        <v-progress-linear
          class="my-1"
          :color="waitingColor"
          :height="small ? 6 : 10"
          :value="till_start_percent"
          striped
          rounded
          v-on="on"
        />
      </template>
      <p class="font-weight-bold">{{ title }}</p>
      <p v-if="!no_start_end" class="text-center small m-0">
        <span class="mx-2"> {{ getFromNowString(startTime) }}</span>
        <v-icon class="flip-image-rtl" color="#fff">forward</v-icon>
        <span class="mx-2"> {{ getFromNowString(endTime) }}</span>
      </p>
    </v-tooltip>

    <p v-if="!no_start_end && !small" class="text-center text-muted small m-0">
      <span class="mx-2"> {{ getFromNowString(startTime) }}</span>
      <v-icon class="flip-image-rtl">forward</v-icon>
      <span class="mx-2"> {{ getFromNowString(endTime) }}</span>
    </p>
  </div>
</template>

<script>
import { DateConverter } from "@core/helper/date/DateConverter";

export default {
  name: "TimeProgressBar",

  props: {
    createdTime: {},
    startTime: {},
    endTime: {},
    small: {
      default: false,
      type: Boolean,
    },

    ended: {
      type: Boolean,
      default: false,
    },
    activeColor:{default:'light-blue'},
    waitingColor:{default:'amber'},

  },
  computed: {
    has_progress_to_end() {
      return this.endTime && this.inBetween;
    },
    has_progress_to_start() {
      return this.now < this.start;
    },

    title() {
      if (this.no_start_end)
        return this.$t("time_progress_bar.title_no_start_end");
      if (this.now < this.start)
        return this.$t("time_progress_bar.title_before_start");
      else if (this.now > this.start && this.now < this.end)
        return this.$t("time_progress_bar.title_between_start_end");
      return this.$t("time_progress_bar.title_after_end");
    },

    finished() {
      return this.end && this.now > this.end;
    },

    no_start_end() {
      return !this.startTime && !this.endTime;
    },

    now() {
      return new Date().getTime();
    },

    start() {
      if (!this.startTime) return null;
      return this.convertToLocalTime(this.startTime).getTime();
    },

    end() {
      if (!this.endTime) return null;
      return this.convertToLocalTime(this.endTime).getTime();
    },
    created_at() {
      if (!this.createdTime) return null;
      return this.convertToLocalTime(this.createdTime).getTime();
    },

    passed_percent() {
      let start = this.start ? this.start : this.created_at;
      let end = this.end;

      return Math.round(((this.now - start) * 100) / (end - start));
    },
    till_start_percent() {
      // CREATED -------> (NOW) -------> START

      let created = this.created_at;
      let start = this.start;
      return Math.round(((this.now - created) * 100) / (start - created));
    },
    inBetween() {
      return DateConverter.inBetweenDates(
        new Date(),
        this.convertToLocalTime(this.startTime),
        this.convertToLocalTime(this.endTime)
      );
    },
  },

  watch: {
    finished(finished) {
      this.$emit("update:ended", finished);
    },
  },
  created() {
    this.$emit("update:ended", this.finished);
  },
  methods: {},
};
</script>

<style scoped></style>

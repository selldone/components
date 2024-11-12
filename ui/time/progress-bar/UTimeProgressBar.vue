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
  <div>
    <p v-if="!small" class="text-center mt-2 mb-0">
      <small>{{ title }}</small>
    </p>

    <v-tooltip
      v-if="has_progress_to_end"
      dark
      location="bottom"
    >
      <template v-slot:activator="{ props }">
        <v-progress-linear
          :bg-color="bgColor"
          :color="activeColor"
          :height="small ? 6 : 10"
          :model-value="passed_percent"
          class="my-1"
          rounded
          rounded-bar
          striped
          v-bind="props"
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
      dark
      location="bottom"
    >
      <template v-slot:activator="{ props }">
        <v-progress-linear
          :bg-color="bgColor"
          :color="waitingColor"
          :height="small ? 6 : 10"
          :model-value="till_start_percent"
          class="my-1"
          rounded
          rounded-bar
          striped
          v-bind="props"
        />
      </template>
      <p class="font-weight-bold">{{ title }}</p>
      <p v-if="!no_start_end" class="text-center small ma-0">
        <span class="mx-2"> {{ getFromNowString(startTime) }}</span>
        <v-icon class="flip-image-rtl" color="#fff">forward</v-icon>
        <span class="mx-2"> {{ getFromNowString(endTime) }}</span>
      </p>
    </v-tooltip>

    <p v-if="!no_start_end && !small" class="text-center text-muted small ma-0">
      <span class="mx-2"> {{ getFromNowString(startTime) }}</span>
      <v-icon class="flip-image-rtl">forward</v-icon>
      <span class="mx-2"> {{ getFromNowString(endTime) }}</span>
    </p>
  </div>
</template>

<script lang="ts">
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "UTimeProgressBar",
  mixins: [DateMixin],

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
    activeColor: { default: "light-blue" },
    waitingColor: { default: "amber" },
    bgColor: {},
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
      return DateConverter.convertToLocalTime(this.startTime).getTime();
    },

    end() {
      if (!this.endTime) return null;
      return DateConverter.convertToLocalTime(this.endTime).getTime();
    },
    created_at() {
      if (!this.createdTime) return null;
      return DateConverter.convertToLocalTime(this.createdTime).getTime();
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
        DateConverter.convertToLocalTime(this.startTime),
        DateConverter.convertToLocalTime(this.endTime),
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

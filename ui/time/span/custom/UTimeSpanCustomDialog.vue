<!--
  - Copyright (c) 2026. Selldone® Business OS™
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

<!--
  The Custom choice of a report period menu (UTimeSpanSelector): two calendar dates, checked
  against the menu's day limit, applied as the same {offset, days} window the presets use.
-->
<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="sd-modern-widget text-start u-time-span-custom">
      <v-card-title class="sd-modern-title-text">{{
        $t("time_spans.custom")
      }}</v-card-title>
      <v-card-text>
        <u-date-range-picker
          v-model:start="draft_start"
          v-model:end="draft_end"
          :start-label="$t('global.commons.start_date')"
          :end-label="$t('global.commons.end_date')"
          :min="min_date"
          :max="max_date"
        />
        <p
          v-if="draft_start && draft_end && !window"
          class="sd-modern-notice mt-3"
          role="alert"
        >
          {{ $t("time_spans.custom_invalid", { days: maxDays }) }}
        </p>
      </v-card-text>
      <v-card-actions class="sd-modern-actions">
        <v-spacer />
        <v-btn
          class="sd-modern-button sd-modern-button--secondary"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t("global.actions.cancel") }}
        </v-btn>
        <v-btn
          class="sd-modern-button sd-modern-button--primary"
          variant="flat"
          :disabled="!window"
          @click="apply"
        >
          {{ $t("global.actions.apply") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UDateRangePicker from "../../../date/range-picker/UDateRangePicker.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import { customRangeWindow } from "./customRange.ts";

export default {
  name: "UTimeSpanCustomDialog",
  components: { UDateRangePicker },
  emits: ["update:modelValue", "apply"],
  props: {
    modelValue: Boolean,
    /** The current period's first and last day, shown when the dialog opens. */
    start: {},
    end: {},
    maxDays: { type: Number, default: 90 },
  },
  data: () => ({
    draft_start: null,
    draft_end: null,
  }),
  computed: {
    min_date() {
      return DateConverter.GetStartOfDateBefore(this.maxDays - 1);
    },
    max_date() {
      return DateConverter.GetEndOfDateBefore(0);
    },
    window() {
      return customRangeWindow(this.draft_start, this.draft_end, this.maxDays);
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(open) {
        if (!open) return;
        this.draft_start = this.start;
        this.draft_end = this.end;
      },
    },
  },
  methods: {
    apply() {
      if (!this.window) return;
      this.$emit("apply", {
        ...this.window,
        start: this.draft_start,
        end: this.draft_end,
      });
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

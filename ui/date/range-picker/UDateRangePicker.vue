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
  <v-sheet class="d-flex align-items-stretch overflow-hidden py-2" rounded="xl">
    <u-date-input
      :allowedDates="allowedDates"
      :appendInnerIcon="startIcon"
      :events="events"
      :label="startLabel"
      :max="max"
      :min="min"
      :model-value="start"
      clearable
      date-only
      flat
      hide-details
      placeholder="Select date"
      type="date"
      variant="solo"
      @update:model-value="
        (v) => {
          $emit('update:start', v);
          $emit('change');
        }
      "
    ></u-date-input>
    <div class="mx-3" style="border: solid thin #eee"></div>
    <u-date-input
      :allowedDates="allowedDates"
      :appendInnerIcon="endIcon"
      :events="events"
      :label="endLabel"
      :max="max"
      :min="start"
      :model-value="end"
      clearable
      date-only
      flat
      hide-details
      placeholder="Select date"
      type="date"
      variant="solo"
      @update:model-value="
        (v) => {
          $emit('update:end', v);
          $emit('change');
        }
      "
    ></u-date-input>
  </v-sheet>
</template>

<script>
import { defineComponent } from "vue";
import UDateInput from "../../../ui/date/input/UDateInput.vue";

export default defineComponent({
  name: "UDateRangePicker",
  components: { UDateInput },
  props: {
    start: {},
    end: {},

    startLabel: {},
    endLabel: {},
    allowedDates: {},
    events: {},
    min: {},
    max: {},
    startIcon: {},
    endIcon: {},
  },
});
</script>

<style lang="scss" scoped></style>

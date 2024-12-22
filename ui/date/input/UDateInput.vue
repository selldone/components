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
  <!-- UDateInput -->

  <v-text-field
    :model-value="getLocalTimeString(modelValue, false, false, this.dateOnly)"
    :append-inner-icon="appendInnerIcon"
    :bg-color="backgroundColor"
    :class="{ pp: !disable }"
    :clearable="clearable"
    :color="color"
    :density="dense ? 'compact' : undefined"
    :disable="disable"
    :filled="filled"
    :flat="flat"
    :hide-details="hideDetails"
    :label="label"
    :messages="getFromNowString(modelValue)"
    :placeholder="placeholder"
    :prepend-inner-icon="prependInnerIcon"
    :rounded="rounded"
    :variant="
      variant ? variant : solo ? 'solo' : outlined ? 'outlined' : 'underlined'
    "
    class="pp"
    persistent-placeholder
    readonly
    v-bind="$attrs"
    @click="showDialog()"
    @click:clear="clear()"
    @click:append-inner.stop="showDialog()"
  >
    <template v-slot:prepend-inner>
      <slot name="prepend-inner"></slot>
    </template>
  </v-text-field>

  <v-dialog
    v-if="dialog"
    v-model="dialog"
    :fullscreen="$vuetify.display.smAndDown"
    max-width="860"
    scrollable
    theme="light"
  >
    <v-card class="text-start" rounded="xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2"> calendar_today</v-icon>
        {{ getLocalTimeString(date_time) }}
        <v-spacer></v-spacer>
        <v-btn
          v-if="clearable && modelValue"
          class="ma-1 tnt"
          color="red"
          rounded="xl"
          size="x-large"
          variant="text"
          @click="
            clear();
            dialog = false;
          "
        >
          <v-icon start>delete</v-icon>

          {{ $t("global.actions.clear") }}
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-0">
        <v-date-picker
          :key="`d-${date_key}`"
          v-model="date"
          :allowed-dates="allowedDates"
          :events="events"
          :max="max instanceof Date ? max.toISOString() : max"
          :min="min instanceof Date ? min.toISOString() : min"
          class="mx-auto"
          max-width="100%"
          show-adjacent-months
          width="400"
        ></v-date-picker>

        <template
          v-if="!dateOnly /** TODO: NOt added yet! I should add this!*/"
        >
          <div class="my-3 max-w-400 mx-auto">
            <u-time-input
              v-model="time"
              class="border rounded-xl"
              variant="flat"
            ></u-time-input>
          </div>

          <div class="d-flex align-stretch justify-start overflow-auto py-3" v-dragscroll="true">
            <u-date-clock
              v-for="(clock, index) in clocks"
              :key="index"
              :time="time_to_date"
              stop
              :city="clock.city"
              :flag="clock.flag"
              :target-timezone="clock.targetTimezone"
              class="ma-2"
              small
            ></u-date-clock>
          </div>
        </template>
      </v-card-text>
      <v-card-actions class="border-top">
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            size="x-large"
            variant="text"
            @click="
              date = new Date();
              time = new Date().toLocaleString('default', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: false,
              });
              date_key = Math.random();
            "
          >
            <v-icon start>today</v-icon>
            {{ $t("global.commons.now") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !date_time }"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="
              $emit('update:modelValue', date_time);

              dialog = false;
              $nextTick(() => {
                $emit('change', date_time);
              });
            "
          >
            <v-icon start>done</v-icon>

            <div>
              {{ $t("global.actions.set") }}
              <div class="small mt-1">
                {{ getFromNowString(date_time) }}
              </div>
            </div>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import UTimeInput from "../../../ui/time/input/UTimeInput.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import UDateClock from "@selldone/components-vue/ui/date/clock/UDateClock.vue";

export default {
  name: "UDateInput",
  mixins: [DateMixin],
  components: { UDateClock, UTimeInput },
  emits: ["update:modelValue", "change", "enter", "click:clear"],
  props: {
    modelValue: {},
    label: {},
    placeholder: {},
    color: {},
    backgroundColor: {},
    min: {},
    max: {},
    jumpMinute: {},
    disable: {}, // Disable date! Ex. "['1397/05/06', /1397\/05\/1(.*)/]" or "['1397/05/07', '1397/05/08', 'Friday']"  or function

    solo: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    format: {
      type: String,
      default: "YYYY-MM-DD HH:mm:ss",
    },

    type: {
      type: String,
      default: "datetime",
    },
    returnUtc: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },

    dense: {
      type: Boolean,
      default: false,
    },

    dateOnly: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    prependInnerIcon: {},
    appendInnerIcon: { default: "today" },
    variant: {},

    allowedDates: {},
    events: {},
  },

  data: () => ({
    date: null,
    time: null,
    dialog: false,

    date_key: 0, // To force update date picker when set now is clicked

    clocks: [
      {
        city: "Sydney",
        flag: "au",
        targetTimezone: "Australia/Sydney",
      },
      {
        city: "Los Angeles",
        flag: "us",
        targetTimezone: "America/Los_Angeles",
      },
      {
        city: "Paris",
        flag: "fr",
        targetTimezone: "Europe/Paris",
      },
      {
        city: "Tokyo",
        flag: "jp",
        targetTimezone: "Asia/Tokyo",
      },
      {
        city: "Berlin",
        flag: "de",
        targetTimezone: "Europe/Berlin",
      },
      {
        city: "Greenwich",
        flag: "gb",
        targetTimezone: "Etc/Greenwich",
      },
      {
        city: "New Delhi",
        flag: "in",
        targetTimezone: "Asia/Kolkata", // India Standard Time (UTC+5:30)
      },
    ],
  }),

  computed: {
    time_to_date(){
      const out= new Date(this.date)
      if (this.time) {
        const [hours, minutes] = this.time.split(":").map(Number); // Split the time string into hours and minutes and convert to numbers
        out.setHours(hours, minutes, 0, 0); // Set hours and minutes to the date object
      }
      return out;
    },


    date_time() {
      if (!this.date) return null;

      let combinedDateTime = new Date(this.date); // Clone the date to avoid modifying the original date

      if (this.time) {
        const [hours, minutes] = this.time.split(":").map(Number); // Split the time string into hours and minutes and convert to numbers
        combinedDateTime.setHours(hours, minutes, 0, 0); // Set hours and minutes to the date object
      }

      return combinedDateTime.toISOString(); // Return the combined date and time in ISO 8601 format

      // date time string assume as local time zone! So created date will be valid time data in UTC format.
    },
    min_time() {
      if (!this.min || !this.date) return null;
      let d1 = new Date(this.min);
      let d2 = new Date(this.date);
      if (d2.getTime() >= d1.getTime()) return null;

      // console.log('Selected date is before the min date!',d1,d2);
      return d1.toLocaleString("default", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
    },

    max_time() {
      if (!this.max || !this.date) return null;
      let d1 = new Date(this.max);
      let d2 = new Date(this.date);
      if (d2.getTime() <= d1.getTime()) return null;

      return d1.toLocaleString("default", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
    },

    language() {
      return this.getCurrentLanguage();
    },
  },
  watch: {},

  created() {},
  methods: {
    clear() {
      this.$emit("update:modelValue", null);
      this.$nextTick(() => {
        this.$emit("change", null);
      });
    },

    showDialog() {
      if (this.disable) return;

      // Set initial value:
      if (this.modelValue) {
        let date = new Date(this.modelValue); // Wed Nov 29 2023 18:00:00 GMT-0600

        this.date = date;

        this.time = date.toLocaleString("default", {
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        });
      } else {
        this.date = null;
        this.time = null;
      }

      this.dialog = true;
    },
  },
};
</script>

<style lang="scss"></style>

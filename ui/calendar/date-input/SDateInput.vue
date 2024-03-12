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
  <v-text-field
    v-bind="$attrs"
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
    :model-value="getLocalTimeString(modelValue, false, false, this.dateOnly)"
    :placeholder="placeholder"
    :prepend-inner-icon="prependInnerIcon"
    :rounded="rounded"
    :variant="
      variant ? variant : solo ? 'solo' : outlined ? 'outlined' : 'underlined'
    "
    append-inner-icon="today"
    class="pp"
    persistent-placeholder
    readonly
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
    max-width="700"
    scrollable
    theme="light"
  >
    <v-card
      :title="getLocalTimeString(date_time)"
      class="text-start"
      prepend-icon="calendar_today"
      rounded="xl"
    >
      <v-card-text>
        <v-row justify="space-around" no-gutters>
          <v-date-picker
            v-model="date"
            :max="max instanceof Date ? max.toISOString() : max"
            :min="min instanceof Date ? min.toISOString() : min"
            show-adjacent-months
          ></v-date-picker>

          <v-time-picker
            v-if="!dateOnly /** TODO: NOt added yet! I should add this!*/"
            v-model="time"
            :max="max_time"
            :min="min_time"
            ampm-in-title
          ></v-time-picker>
        </v-row>

        <div v-if="clearable" class="text-end">
          <v-btn
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
        </div>
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

<script>
export default {
  name: "SDateInput",
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
    variant: {},
  },

  data: () => ({
    date: null,
    time: null,
    dialog: false,
  }),

  computed: {
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

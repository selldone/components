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
    <v-text-field
      :rounded="rounded"
      :filled="filled"
      :density="dense ? 'compact' : undefined"
      :label="label"
      :placeholder="placeholder"
      :clearable="clearable"
      :color="color"
      :bg-color="backgroundColor"
      @click:clear="clear()"
      :class="{ pp: !disable }"
      @click="showDialog()"
      @click:append-inner.stop="showDialog()"
      readonly
      :model-value="getLocalTimeString(modelValue, false, false, this.dateOnly)"
      :disable="disable"
      :prepend-inner-icon="prependInnerIcon"
      persistent-placeholder
      class="pp"
      append-icon="today"
      :flat="flat"
      :hide-details="hideDetails"
      :variant="
        variant ? variant : solo ? 'solo' : outlined ? 'outlined' : 'underlined'
      "
    >
      <template v-slot:prepend-inner>
        <slot name="prepend-inner"></slot>
      </template>
    </v-text-field>

    <v-dialog
      v-if="dialog"
      v-model="dialog"
      max-width="700"
      scrollable
      :fullscreen="$vuetify.display.smAndDown"
    >
      <v-card class="text-start">
        <v-card-title >
         <v-row no-gutters align="center">
           {{ getLocalTimeString(date_time) }}
           <v-spacer></v-spacer>
           <v-btn
               v-if="clearable"
               color="red"
               variant="text" size="x-large"
               class="ma-1 tnt"
               @click="
              clear();
              dialog = false;
            "
           >
             <v-icon size="small" class="me-1">close</v-icon>

             {{ $t("global.actions.clear") }}
           </v-btn>
         </v-row>
        </v-card-title>

        <v-card-text>
          <v-row no-gutters justify="space-around">
            <v-date-picker
              v-model="date"


              :min="min instanceof Date ? min.toISOString() : min"
              :max="max instanceof Date ? max.toISOString() : max"
              class="picker-style"
            ></v-date-picker>

            <v-time-picker
              v-if="!dateOnly /** TODO: NOt added yet! I should add this!*/"
              v-model="time"
              class="picker-style"
              ampm-in-title
              :min="min_time"
              :max="max_time"
            ></v-time-picker>
            <v-col cols="12" class="text-end text-muted">
              {{ getFromNowString(date_time) }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="border-top">
          <div class="widget-buttons">
            <v-btn
              @click="dialog = false"
              variant="text"
              size="x-large"
              >{{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              size="x-large"
              @click="
                date = new Date().toISOString().slice(0, 10);
                time = new Date().toLocaleString('default', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: false,
                });
              "
              variant="text"
            >
              <v-icon class="me-1">today</v-icon>
              {{ $t("global.commons.now") }}
            </v-btn>
            <v-btn
              size="x-large"
              color="primary" variant="elevated"
              @click="
                $emit('update:modelValue', date_time);

                dialog = false;
                $nextTick(() => {
                  $emit('change', date_time);
                });
              "
              :class="{ disabled: !date_time }"
            >
              <v-icon class="me-1">done</v-icon>
              {{ $t("global.actions.set") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useDate } from 'vuetify'

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
      let str = "";
      if (this.date) str = this.date;
      if (this.time) str += " " + this.time;

      return new Date(str).toISOString(); // date time string assume as local time zone! So created date will be valid time data in UTC format.
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
        let date = new Date(this.modelValue);   // Wed Nov 29 2023 18:00:00 GMT-0600

        this.date = date.toISOString().slice(0, 10);

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

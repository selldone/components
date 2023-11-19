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
    <!--   date_time: {{date_time}}<br>
      value: {{value}}<br>
     <date-picker
              class="data-picker-field-rounded"
              :class="{ 'not-round': !rounded, dense: dense }"
              :value="value"
              :label="label"
              :placeholder="placeholder"
              :color="color"
              :min="min"
              :max="max"
              :disabled="disabled"
              :disable="disable"
              :type="type"
              :format="format"
              :display-format="displayFormat"
              :clearable="clearable"
              :locale="window.$language.local"
              :jump-minute="jumpMinute"
              :round-minute="!!jumpMinute"
              @change="$emit('change')"
              append-to="body"
  
      />-->
    <v-text-field
      :rounded="rounded"
      :filled="filled"
      :dense="dense"
      :label="label"
      :placeholder="placeholder"
      :clearable="clearable"
      :color="color"
      :background-color="backgroundColor"
      :dark="dark"
      :outlined="outlined"
      @click:clear="clear()"
      :class="{ pp: !disable }"
      @click.native="showDialog()"
      readonly
      :value="getLocalTimeString(value, false, false, this.dateOnly)"
      :disable="disable"
      :prepend-inner-icon="prependInnerIcon"
      persistent-placeholder
      class="pp"
      append-icon="today"
      :solo="solo"
      :flat="flat"
      :hide-details="hideDetails"
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
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card>
        <v-card-title>
          {{ getLocalTimeString(date_time) }}
          <v-spacer></v-spacer>
          <v-btn
            v-if="clearable"
            color="red"
            text
            class="ms-1"
            @click="
              clear();
              dialog = false;
            "
          >
            <v-icon small class="me-1">close</v-icon>

            {{ $t("global.actions.clear") }}</v-btn
          >
        </v-card-title>
        <v-card-subtitle class="text-start">
          {{ getFromNowString(date_time) }}
        </v-card-subtitle>
        <v-card-text>
          <v-row no-gutters justify="space-around">
            <v-date-picker
              v-model="date"
              :first-day-of-week="language.calendar.first_day_of_week"
              :locale="language.full_local"
              :min="min instanceof Date ? min.toISOString() : min"
              :max="max instanceof Date ? max.toISOString() : max"
              class="picker-style"
            ></v-date-picker>

            <v-time-picker
              v-if="!dateOnly"
              v-model="time"
              class="picker-style"
              ampm-in-title
              :min="min_time"
              :max="max_time"
            ></v-time-picker>
          </v-row>
        </v-card-text>
        <v-card-actions class="border-top">
          <div class="widget-buttons">
            <v-btn @click="dialog = false" class="tnt" text x-large>{{
              $t("global.actions.close")
            }}</v-btn>

            <v-btn
              x-large
              @click="
                date = new Date().toISOString().slice(0, 10);
                time = new Date().toLocaleString('default', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: false,
                });
              "
              class="tnt"
              text
            >
              <v-icon class="me-1">today</v-icon>
              {{ $t("global.commons.now") }}</v-btn
            >
            <v-btn
              x-large
              color="primary"
              @click="
                $emit('input', date_time);

                dialog = false;
                $nextTick(() => {
                  $emit('change', date_time);
                });
              "
              :class="{ disabled: !date_time }"
              class="tnt"
            >
              <v-icon class="me-1">done</v-icon>
              {{ $t("global.actions.set") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { DateConverter } from "@core/helper/date/DateConverter";

export default {
  name: "dateTimePickerGlobal",
  props: {
    value: {},
    label: {},
    placeholder: {},
    color: {},
    backgroundColor: {},
    min: {},
    max: {},
    jumpMinute: {},
    disable: {}, // Disable date! Ex. "['1397/05/06', /1397\/05\/1(.*)/]" or "['1397/05/07', '1397/05/08', 'Friday']"  or function

    /*range: {
      type: Boolean,
      default: false,
    },*/
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
      // if (!DateConverter.InSameDay(d1, d2)) return null;
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
      // if (!DateConverter.InSameDay(d1, d2)) return null;
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

    displayFormat() {
      return this.type === "date"
        ? window.$language.calendar.displayFormatDateOnly
        : window.$language.calendar.displayFormat;
    },
  },
  watch: {
    /* date_time(val) {
      if (this.returnUtc) {
        this.$emit("input", this.convertLocalTimeStringToUTCString(val));
      } else {
        this.$emit("input", val);
      }
    },*/
    /*   value(){
      this.refresh()
    },*/
    /*  value(val) {
      if(this.returnUtc){
        this.date_time =  this. convertUTCStringToLocalTimeString(val)
      }else {
        this.date_time = val;
      }
    }*/
  },

  created() {
    //this.refresh()
  },
  methods: {
    clear() {
      this.$emit("input", null);
      this.$nextTick(() => {
        this.$emit("change", null);
      });
    },

    showDialog() {
      if (this.disable) return;

      // Set initial value:
      if (this.value) {
        let date = new Date(this.value);
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
    /* setNewValue(val) {
      if (this.returnUtc) {
        this.$emit("input", this.convertLocalTimeStringToUTCString(val));
      } else {
        this.$emit("input", val);
      }
    },


    refresh(){
      if (this.returnUtc) {
        this.date_time = this.convertUTCStringToLocalTimeString(this.value);
      } else {
        this.date_time = this.value;
      }
    }*/
  },
};
</script>

<style lang="scss"></style>

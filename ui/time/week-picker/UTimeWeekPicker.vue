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
  <div v-if="modern" class="u-time-week-modern">
    <div class="u-time-week-modern__days" role="group" :aria-label="$t('service_design.refined.week_days')">
      <button
        v-for="day in modernDays"
        :key="day.value"
        type="button"
        :aria-pressed="selectedDay === day.value"
        :aria-label="`${$t(day.name)} · ${$t('service_design.refined.selected_hours', { count: hoursForDay(day.value).length })}`"
        @click="selectedDay = day.value"
      >
        <span>{{ shortDay(day) }}</span>
        <span v-if="hoursForDay(day.value).length" class="u-time-week-modern__day-dot" aria-hidden="true"></span>
      </button>
    </div>
    <div class="u-time-week-modern__caption" aria-live="polite">
      <span>{{ $t(WeekDaysSource[selectedDay].name) }}</span>
      <small>{{ $t('service_design.refined.selected_hours', { count: hoursForDay(selectedDay).length }) }}</small>
    </div>
    <div class="u-time-week-modern__hours" dir="ltr">
      <button
        v-for="hour in modernHours"
        :key="hour"
        type="button"
        :disabled="!editable || !isAllowed(selectedDay, hour)"
        :aria-pressed="hoursForDay(selectedDay).includes(hour)"
        :aria-current="isPointed(selectedDay, hour) ? 'true' : undefined"
        :aria-label="`${$t(WeekDaysSource[selectedDay].name)} · ${hourRange(hour)}`"
        :class="{ 'u-time-week-modern__hour--pointed': isPointed(selectedDay, hour) }"
        @click="toggleModernHour(hour)"
      >
        <v-icon v-if="isPointed(selectedDay, hour)" size="14" aria-hidden="true">check</v-icon>
        {{ hourRange(hour) }}
      </button>
    </div>
    <div class="u-time-week-modern__tools">
      <button v-if="editable" type="button" @click="setModernDay(true)">{{ $t('service_design.refined.all_hours') }}</button>
      <button v-if="editable" type="button" @click="setModernDay(false)">{{ $t('service_design.refined.clear_day') }}</button>
      <button type="button" :aria-expanded="showAllHours" @click="showAllHours = !showAllHours">
        {{ $t(showAllHours ? 'service_design.refined.show_daytime_hours' : 'service_design.refined.show_all_hours') }}
      </button>
    </div>
  </div>
  <div v-else class="t-w">
    <div class="t-d">
      <div class="th-h -name">
        <v-btn
          v-if="editable"
          icon
          size="small"
          title="Clear all"
          variant="text"
          @click="resetAll"
        >
          <v-icon size="small">restart_alt</v-icon>
        </v-btn>
      </div>
      <div v-for="h in 24" :key="h" class="th-h" v-text="h"></div>
    </div>

    <div
      v-for="day in WeekDays"
      :key="day.value"
      :class="{ 'pointer-event-none': !editable }"
      :style="{ '--dis-color': disColor, '--active-color': activeColor }"
      class="t-d"
      @click="onClick"
      @mousedown="onDragstart"
      @mousemove="onDragover"
      @mouseup="onDragend"
    >
      <div
        class="th-h -name"
        @click="toggleDay(day.value)"
        v-text="$t(day.name)"
      ></div>
      <div
        v-for="h in 24"
        :key="h"
        :class="{
          '-active':
            (modelValue &&
              modelValue[day.value] &&
              modelValue[day.value].includes(h)) ||
            inDragMode(day.value, h),
          '-now': isNow(day.value, h),
          '-green': isPointed(day.value, h),
          '-dis': !isAllowed(day.value, h),
        }"
        :day="day.value"
        :hour="h"
        class="t-h"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "UTimeWeekPicker",
  emits: ["update:modelValue", "change"],
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    modelValue: {},
    pointedTimeUtc: {},
    editable: {
      type: Boolean,
      default: false,
    },
    restrictions: {}, // Available times. Ex. {"Thursday": [ 14, ... ], "Friday": [ 14, ... ], "Saturday": [ 10 ] }
    disColor: {
      default: "#666",
    },
    activeColor: {
      default: "#0288d1",
    },
  },

  data: () => ({
    WeekDaysSource: WeekDays,
    selectedDay: "Monday",
    showAllHours: false,
    drag_day: null,
    drag_hour: null,
    drag_day_end: null,
    drag_hour_end: null,
  }),
  computed: {
    modernDays() {
      const days = Object.values(WeekDays);
      const first = this.day_offset;
      return [...days.slice(first), ...days.slice(0, first)];
    },
    modernHours() {
      return this.showAllHours
        ? [24, ...Array.from({ length: 23 }, (_, hour) => hour + 1)]
        : Array.from({ length: 12 }, (_, hour) => hour + 7);
    },
    day_offset() {
      return this.getCurrentLanguage().calendar.first_day_of_week;
    },

    WeekDays() {
      return Object.values(WeekDays).rotateRight(this.day_offset);
    },
  },
  watch: {},
  created() {
    if (!this.modelValue || !this.isObject(this.modelValue)) {
      this.$emit("update:modelValue", {});
      // Not emit change! only change by user interaction emit change!
    }
  },
  methods: {
    hoursForDay(day) {
      return Array.isArray(this.modelValue?.[day])
        ? [...new Set(this.modelValue[day].filter((hour) => Number.isInteger(hour) && hour >= 1 && hour <= 24))]
        : [];
    },
    shortDay(day) {
      return new Intl.DateTimeFormat(this.getCurrentLanguage().full_locale, { weekday: "short" })
        .format(new Date(2026, 10, 1 + day.day));
    },
    hourRange(hour) {
      // Native 24 means midnight on the selected day; other values are literal hours.
      const start = hour === 24 ? 0 : hour;
      return `${String(start).padStart(2, "0")}:00–${String(start + 1).padStart(2, "0")}:00`;
    },
    emitModernDay(hours) {
      const value = { ...(this.modelValue && typeof this.modelValue === "object" && !Array.isArray(this.modelValue) ? this.modelValue : {}), [this.selectedDay]: hours };
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
    },
    toggleModernHour(hour) {
      if (!this.editable || !this.isAllowed(this.selectedDay, hour)) return;
      const hours = this.hoursForDay(this.selectedDay);
      this.emitModernDay(hours.includes(hour) ? hours.filter((value) => value !== hour) : [...hours, hour].sort((a, b) => a - b));
    },
    setModernDay(available) {
      if (!this.editable) return;
      this.emitModernDay(available ? Array.from({ length: 24 }, (_, hour) => hour + 1).filter((hour) => this.isAllowed(this.selectedDay, hour)) : []);
    },
    onClick(e) {
      this.resetDrag();
      const day = e.target.getAttribute("day");
      const hour = parseInt(e.target.getAttribute("hour"));
      if (!day || !hour) return;

      if (!this.modelValue[day] || !Array.isArray(this.modelValue[day]))
        this.modelValue[day] = [hour];
      else if (!this.modelValue[day].includes(hour))
        this.modelValue[day].push(hour);
      else this.remove(this.modelValue[day], hour);

      const new_val = Object.assign(this.modelValue);
      this.$emit("update:modelValue", new_val);

      this.$forceUpdate();
      this.$emit("change", new_val);
      //console.log("onClick", day, hour, this.modelValue);
    },

    resetDrag() {
      this.drag_day = null;
      this.drag_hour = null;
      this.drag_day_end = null;
      this.drag_hour_end = null;
    },
    onDragstart(e) {
      const day = e.target.getAttribute("day");
      const hour = parseInt(e.target.getAttribute("hour"));
      if (!day || !hour) {
        this.resetDrag();
        return;
      }

      this.drag_day = day;
      this.drag_hour = hour;
      //  console.log("onDragstart", e,day,hour);
    },
    onDragover(e) {
      //console.log("onDragover", e.buttons);
      if (!e.buttons) {
        // Mouse button released!
        this.resetDrag();
      }

      if (!this.drag_day || !this.drag_hour) return;

      const day = e.target.getAttribute("day");
      const hour = parseInt(e.target.getAttribute("hour"));
      if (!day || !hour) return;

      this.drag_day_end = day;
      this.drag_hour_end = hour;
    },
    onDragend(e) {
      const day = e.target.getAttribute("day");
      const hour = parseInt(e.target.getAttribute("hour"));
      if (
        !this.drag_day ||
        !this.drag_hour ||
        !day ||
        !hour ||
        (this.drag_day === day && this.drag_hour === hour)
      )
        return; // Prevent onClick conflict!

      const i_1 = Object.keys(WeekDays).indexOf(this.drag_day);
      const i_2 = Object.keys(WeekDays).indexOf(day);

      const d_s = Math.min(i_1, i_2);
      const d_e = Math.max(i_1, i_2);

      const h_s = Math.min(hour, this.drag_hour);
      const h_e = Math.max(hour, this.drag_hour);

      for (let d = d_s; d <= d_e; d++) {
        const day = Object.keys(WeekDays)[d];
        for (let hour = h_s; hour <= h_e; hour++) {
          // Check allowed:
          if (!this.isAllowed(day, hour)) {
            //console.log('isAllowed' , false)
            continue;
          }

          if (!this.modelValue[day] || !Array.isArray(this.modelValue[day]))
            this.modelValue[day] = [hour];
          else if (!this.modelValue[day].includes(hour))
            this.modelValue[day].push(hour);
        }
      }

      const new_val = Object.assign(this.modelValue);

      this.$emit("update:modelValue", new_val);
      this.$forceUpdate();
      this.resetDrag();

      this.$emit("change", new_val);

      //console.log("onDragend", e,day,hour);
    },

    //------------------------------------------------
    inDragMode(day, hour) {
      if (
        !this.drag_day ||
        !this.drag_hour ||
        !this.drag_day_end ||
        !this.drag_hour_end
      )
        return false;

      const i_1 = Object.keys(WeekDays).indexOf(this.drag_day);
      const i_2 = Object.keys(WeekDays).indexOf(this.drag_day_end);

      const d_s = Math.min(i_1, i_2);
      const d_e = Math.max(i_1, i_2);

      const h_s = Math.min(this.drag_hour_end, this.drag_hour);
      const h_e = Math.max(this.drag_hour_end, this.drag_hour);

      const day_i = Object.keys(WeekDays).indexOf(day);

      return day_i >= d_s && day_i <= d_e && hour >= h_s && hour <= h_e;
    },
    //--------------------------------------------------------

    isNow(day, hour) {
      const date = new Date();
      const day_i = Object.keys(WeekDays).indexOf(day);

      return date.getDay() === day_i && date.getHours() === (this.modern && hour === 24 ? 0 : hour);
    },
    isPointed(day, hour) {
      // Green color!
      if (!this.pointedTimeUtc) return false;

      const date = DateConverter.convertToLocalTime(this.pointedTimeUtc);
      const day_i = Object.keys(WeekDays).indexOf(day);

      // console.log(date);
      return date.getDay() === day_i && date.getHours() === (this.modern && hour === 24 ? 0 : hour);
    },
    //--------------------------------------------------------
    toggleDay(day) {
      if (!this.editable) return;
      if (
        !this.modelValue[day] ||
        !Array.isArray(this.modelValue[day]) ||
        !this.modelValue[day].includes(1)
      ) {
        // toggle base on hour 1
        this.modelValue[day] = Array.from({ length: 24 }, (_, i) => i + 1);
      } else {
        this.modelValue[day] = null;
      }
      const new_val = Object.assign(this.modelValue);

      this.$emit("update:modelValue", new_val);
      this.$forceUpdate();
      this.$emit("change", new_val);
    },

    resetAll() {
      const new_val = {};

      this.$emit("update:modelValue", new_val);
      this.$forceUpdate();
      this.$emit("change", new_val);
    },

    //--------------------------------------------------------
    isAllowed(day, hour) {
      if (!this.restrictions) return true;
      if (this.modern) return Array.isArray(this.restrictions[day]) && this.restrictions[day].includes(hour);
      return this.restrictions[day] && this.restrictions[day].includes(hour);
    },
  },
};
</script>

<style lang="scss" scoped>
.u-time-week-modern {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;

  button { font-family: inherit; font-size: 12px; font-weight: 400; line-height: 18px; color: inherit; }
  button:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; margin-block-end: 16px; }
  &__days button { display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; min-width: 0; min-height: 40px; padding: 6px 2px; border-radius: 7px; background: transparent; }
  &__days button[aria-pressed="true"] { background: rgba(var(--v-theme-on-surface), .07); font-weight: 500; }
  &__day-dot { display: block; width: 3px; height: 3px; border-radius: 50%; background: currentColor; }
  &__caption { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-block-end: 12px; font-size: 12px; line-height: 18px; }
  &__caption small { font-size: 11px; color: rgba(var(--v-theme-on-surface), .65); }
  &__hours { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
  &__hours button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 40px; padding: 8px 4px; border: 1px solid rgba(var(--v-theme-on-surface), .12); border-radius: 7px; background: rgb(var(--v-theme-surface)); }
  &__hours button[aria-pressed="true"] { background: rgb(var(--v-theme-on-surface)); border-color: rgb(var(--v-theme-on-surface)); color: rgb(var(--v-theme-surface)); }
  &__hours button:disabled { opacity: .45; cursor: default; }
  &__hours &__hour--pointed { box-shadow: inset 0 0 0 2px rgb(var(--v-theme-primary)); }
  &__tools { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 16px; margin-block-start: 12px; }
  &__tools button { min-height: 34px; padding-block: 6px; color: rgb(var(--v-theme-primary)); background: transparent; }
  @media (max-width: 460px) { &__hours { grid-template-columns: repeat(2, minmax(0, 1fr)); } &__days button { font-size: 11px; } }
  @media (pointer: coarse) { button { min-height: 44px; } }
}

.t-w {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  overflow: auto;
  padding: 8px;
  @media only screen and (max-width: 600px) {
    flex-direction: unset;
  }

  .t-d {
    display: flex;
    flex-grow: 1;
    font-size: 11px;
    @media only screen and (max-width: 600px) {
      font-size: 9px;
      flex-direction: column;
    }

    .th-h,
    .t-h {
      height: 20px;
      background-color: #fafafa;
      margin: 1px;

      justify-content: center;
      display: flex;
      align-items: center;
      user-select: none;
      flex: 1 1 0px; // Make all same size!
    }

    .t-h {
      cursor: pointer;
      transition: all 0.4s ease-in-out;

      &:hover {
        background-color: #eee;
      }

      &.-active {
        background-color: var(--active-color);
        color: #fff;
      }

      &.-now,
      &.-green {
        position: relative;

        &:after {
          content: "●";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }

      &.-green {
        background-color: #4caf50;

        &:after {
          content: "✓";
        }
      }

      &.-dis {
        background-color: var(--dis-color);
        pointer-events: none;
      }
    }

    .th-h {
      background-color: #fff;
      font-weight: bold;
    }
  }

  .-name {
    cursor: pointer;
    padding: 0 2px;
    flex: 1 1 60px !important;
  }
}
</style>

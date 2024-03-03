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
  <div class="t-w">
    <div class="t-d">
      <div class="th-h -name">
        <v-btn
          v-if="editable"
          icon
          size="small"
          title="Clear all"
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

<script>
import { WeekDays } from "@core/enums/logistic/WeekDays";
import { DateConverter } from "@core/helper/date/DateConverter";

export default {
  name: "SWeekDayTimePicker",
  emits: ["update:modelValue", "change"],
  props: {
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
    drag_day: null,
    drag_hour: null,
    drag_day_end: null,
    drag_hour_end: null,
  }),
  computed: {
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

      return date.getDay() === day_i && date.getHours() === hour;
    },
    isPointed(day, hour) {
      // Green color!
      if (!this.pointedTimeUtc) return false;

      const date = DateConverter.convertToLocalTime(this.pointedTimeUtc);
      const day_i = Object.keys(WeekDays).indexOf(day);

      // console.log(date);
      return date.getDay() === day_i && date.getHours() === hour;
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
      return this.restrictions[day] && this.restrictions[day].includes(hour);
    },
  },
};
</script>

<style lang="scss" scoped>
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

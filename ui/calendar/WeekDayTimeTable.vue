<template>
  <div class="t-w">
    <div class="t-d">
      <div class="th-h -name">
        <v-btn v-if="editable" icon @click="resetAll" title="Clear all" small
          ><v-icon small>restart_alt</v-icon></v-btn
        >
      </div>
      <div v-for="h in 24" :key="h" class="th-h" v-text="h"></div>
    </div>

    <div
      v-for="day in WeekDays"
      :key="day.value"
      class="t-d "
      @click="onClick"
      @mousedown="onDragstart"
      @mouseup="onDragend"
      @mousemove="onDragover"
      :class="{'pointer-event-none':!editable}"
      :style="{'--dis-color':disColor,'--active-color':activeColor}"
    >
      <div
        class="th-h -name"
        v-text="$t(day.name)"
        @click="toggleDay(day.value)"
      ></div>
      <div
        v-for="h in 24"
        :key="h"
        class="t-h"
        :day="day.value"
        :hour="h"
        :class="{
          '-active':
            (value && value[day.value] && value[day.value].includes(h)) ||
            inDragMode(day.value, h),
          '-now': isNow(day.value, h),
          '-green': isPointed(day.value, h),
          '-dis':!isAllowed(day.value, h)
        }"
      ></div>
    </div>
  </div>
</template>

<script>
import { WeekDays } from "../../../../core/enums/logistic/WeekDays";
import { DateConverter } from "../../../../core/helper/date/DateConverter";

export default {
  name: "WeekDayTimeTable",
  props: {
    value: {

    },
    pointedTimeUtc: {},
    editable: {
      type: Boolean,
      default: false,
    },
    restrictions:{},  // Available times. Ex. {"Thursday": [ 14, ... ], "Friday": [ 14, ... ], "Saturday": [ 10 ] }
    disColor:{
      default:'#666'
    },
    activeColor:{
      default:'#0288d1'
    },
  },

  data: () => ({
   // WeekDays: WeekDays,

    drag_day: null,
    drag_hour: null,
    drag_day_end: null,
    drag_hour_end: null,
  }),
  computed: {
    day_offset(){
      return this.getCurrentLanguage().calendar.first_day_of_week
    },

    WeekDays(){
      return Object.values(WeekDays).rotateRight(this.day_offset)
    }
  },
  watch: {},
  created() {
    if (!this.value || !this.isObject(this.value)) {
      this.$emit("input", {});
      // Not emit change! only change by user interaction emit change!
    }
  },
  methods: {
    onClick(e) {
      this.resetDrag();
      const day = e.target.getAttribute("day");
      const hour = parseInt(e.target.getAttribute("hour"));
      if (!day || !hour) return;

      if (!this.value[day] || !Array.isArray(this.value[day]))
        this.value[day] = [hour];
      else if (!this.value[day].includes(hour)) this.value[day].push(hour);
      else this.remove(this.value[day], hour);

      const new_val=Object.assign(this.value);
      this.$emit("input",new_val );

      this.$forceUpdate();
      this.$emit('change',new_val)
      //console.log("onClick", day, hour, this.value);
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
          if(!this.isAllowed(day,hour)){
            //console.log('isAllowed' , false)
            continue;
          }

          if (!this.value[day] || !Array.isArray(this.value[day]))
            this.value[day] = [hour];
          else if (!this.value[day].includes(hour)) this.value[day].push(hour);
        }
      }

      const new_val=Object.assign(this.value);

      this.$emit("input", new_val);
      this.$forceUpdate();
      this.resetDrag();

      this.$emit('change',new_val)

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
      if(!this.editable)return;
      if (
        !this.value[day] ||
        !Array.isArray(this.value[day]) ||
        !this.value[day].includes(1)
      ) {
        // toggle base on hour 1
        this.value[day] = Array.from({ length: 24 }, (_, i) => i + 1);
      } else {
        this.value[day] = null;
      }
      const new_val=Object.assign(this.value);

      this.$emit("input", new_val);
      this.$forceUpdate();
      this.$emit('change',new_val)

    },

    resetAll() {
      const new_val={};

      this.$emit("input", new_val);
      this.$forceUpdate();
      this.$emit('change',new_val)

    },

    //--------------------------------------------------------
    isAllowed(day, hour) {

      if(!this.restrictions)return true;
      return this.restrictions[day] && this.restrictions[day].includes(hour)
    }

  },
};
</script>

<style scoped lang="scss">
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
        background-color:  var(--active-color);
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

      &.-dis{
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

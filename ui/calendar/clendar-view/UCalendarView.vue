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
    <v-sheet class="pb-6" color="transparent">
      <v-toolbar color="transparent" flat>
        <v-btn
          color="grey-darken-2"
          icon
          title="Previous month"
          variant="text"
          @click="$refs.calendar.prev()"
        >
          <v-icon>
            {{ $t("icons.navigate_before") }}
          </v-icon>
        </v-btn>

        <v-toolbar-title
          class="px-2 min-width-150 text-center font-weight-light"
        >
          {{
            $refs.calendar?.title
              ? $refs.calendar?.title
              : current_range_start_date?.printMonth()
          }}
        </v-toolbar-title>

        <v-btn
          color="grey-darken-2"
          icon
          title="Next month"
          variant="text"
          @click="$refs.calendar.next()"
        >
          <v-icon>
            {{ $t("icons.navigate_next") }}
          </v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          class="me-4 tnt"
          color="grey-darken-2"
          title="Show today!"
          variant="text"
          @click="calendar_value = null"
        >
          <v-icon class="me-1" color="#1976D2" size="x-small">circle</v-icon>
          Today
        </v-btn>

        <v-btn-toggle
          v-if="!dayLevel"
          v-model="type"
          class="m-1"
          mandatory
          rounded
          selected-class="blue-flat"
        >
          <v-btn
            v-for="(icon, val) in types"
            :key="val"
            :title="val"
            :value="val"
            color="#fff"
          >
            <v-icon size="small">{{ icon }}</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-toolbar>
      <v-calendar
        ref="calendar"
        v-model="calendar_value"
        :locale="getCurrentLanguage().full_locale"
        :type="type"
        :weekdays="weekday"
        class="s--calendar-table my-3"
        color="#1976D2"
        short-months
        multiple
        @update:modelValue="onChangeDaysRange"
        :events="events"


      >



        <template
          v-slot:day-label="{ past, date, present, future, day, month }"
        >
          <v-btn
            v-if="current_range_month === month"
            :class="{ pen: past }"
            :color="
              isReserved(date)
                ? '#1976D2'
                : past
                  ? 'transparent'
                  : notAvailable(date)
                    ? 'rgba(211,47,47,0.24)'
                    : 'transparent'
            "
            :style="{
              color: isReserved(date) ? '#fff' : past ? '#999' : '#555',
            }"
            :title="notAvailable(date) ? 'Unavailable' : 'Available'"
            size="small"
            variant="flat"
            @click="
              past ? undefined : viewDay({ past, date, present, future, day })
            "
          >
            {{ day }}
          </v-btn>
          <v-icon
            v-if="present"
            class="absolute-bottom-center"
            color="#1976D2"
            size="6"
            title="Today"
            >circle
          </v-icon>

          <small
            v-if="notAvailable(date)"
            class="absolute-top-center mt-n1 x-small"
            >Unavailable</small
          >
        </template>
      </v-calendar>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import { VCalendar } from 'vuetify/labs/VCalendar'
export default {
  name: "UCalendarView",
  components: {
    VCalendar,
  },
  props: {
    canDisable: { type: Boolean, default: false },
    dayLevel: { type: Boolean, default: false },

    disabled: {},

    newEvent: {},
  },

  data: () => ({
    reservations: [],

    WeekDays: WeekDays,

    type: "month",
    types: {
      month: "fa:fas fa-calendar-alt",
      week: "fa:fas fa-calendar-week",
      day: "fa:fas fa-calendar-day",
    },

    mode: "stack",

    calendar_value: null,

    current_range_month: null,
    current_range_start_date: null,

    //---------------------------------------------
    no_available: [],
  }),
  computed: {
    weekday() {
      const out = [0, 1, 2, 3, 4, 5, 6];

      return out.map((i) => {
        const d = i + this.getCurrentLanguage().calendar.first_day_of_week;
        return d >= 7 ? d - 7 : d;
      });
    },

    events() {
      const events = [];
      // Add new event:
      if (this.newEvent && this.newEvent.start_at && this.newEvent.end_at)
        events.unshift({
          title: this.newEvent.name,
          start: new Date(this.newEvent.start_at),
          end: new Date(this.newEvent.end_at),
          color: this.newEvent.color ? this.newEvent.color : "#2196f3",
          allDay: true,
        });

      return events;
    },
  },
  watch: {},
  created() {
    if (!this.disabled || !Array.isArray(this.disabled)) {
      this.$emit("update:disabled", []);
    } else {
      // Remove past dates:
      const filtered = this.disabled.filter((date) => {
        try {
          return (
            Date.parse(date) -
              Date.parse(DateConverter.GetStartOfDateBefore(0)) >=
            0
          );
        } catch (e) {
          console.error(e);
        }
        return false;
      });

      this.$emit("update:disabled", filtered);
    }
  },

  methods: {
    viewDay({ date, past, present, future }) {
      if (this.dayLevel) {
        // Make toggle disable easy in day mode!
        if (this.canDisable && !past) {
          this.toggleNotAvailable(date);
        }

        return;
      }

      this.calendar_value = date;
      this.type = "day";
    },

    onChangeDaysRange({ start, end }) {
      this.current_range_month = start.month;
      this.current_range_start_date = new Date(start.date);

      //console.log('start',start,'end',end)
    },
    //----------------------------------------------------------------
    isReserved(date) {
      const _start = new Date(date).setStart();
      const _end = new Date(date).setEnd();

      return this.events.some((event) => {
        return (
          DateConverter.inBetweenDates(_start, event.start, event.end) ||
          DateConverter.inBetweenDates(_end, event.start, event.end)
        );
      });
    },

    hasReservationStartDay(date) {
      const today = new Date(date);
      //const checkout_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0);


      return this.events.some((event) => {
        const found = DateConverter.InSameDay(event.end, today);
        //console.log('hasReservation',event.end,date)
        return found;
      });
    },
    hasReservationEndDay(date) {
      const today = new Date(date);
      return this.events.some((event) => {
        const found = DateConverter.InSameDay(event.start, today);
        return found;
      });
    },

    notAvailable(date) {
      return this.disabled && this.disabled.includes(date);
    },

    toggleNotAvailable(date) {
      if (!this.disabled) return;

      if (!this.notAvailable(date)) {
        //console.log("add notAvailable");

        if (this.disabled.length >= 30) {
          NotificationService.showErrorAlert(null, "Max disabled days is 30!");
          return;
        }

        this.disabled.push(date);
      } else {
        //console.log("remove notAvailable");

        this.disabled.sort();

        this.remove(this.disabled, date);
      }

      this.$emit("change", this.disabled);
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--calendar-table {
  min-height: 450px !important;
  background: transparent !important;
  border: unset !important;

  .-bg {
    width: 100%;

    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
    height: 100%;
    /*
    &.no-avail-bg {
      background-image: linear-gradient(
        45deg,
        #6666666d 25%,
        transparent 25%,
        transparent 50%,
        #6666666d 50%,
        #6666666d 75%,
        transparent 75%,
        #fff
      );
      background-size: 30px 30px;
      background-repeat: repeat;
    }*/
    &.past-bg {
      background: #eee;
    }

    &.reserved-bg,
    &.start-bg,
    &.end-bg,
    &.one-day-bg {
      background-color: #eee;
      height: 60%;
      top: 20%;
    }

    &.start-bg {
      width: 40%;
      border-radius: 8px 0 0 8px;
    }

    &.end-bg {
      width: 40%;
      right: 60%;
      border-radius: 0 8px 8px 0;
    }

    &.one-day-bg {
      right: 20%;
      left: 20%;
      width: 60%;
      border-radius: 8px;
    }
  }

  // Fix some issue:
  .v-calendar-weekly__head-weekday {
    padding: 8px 4px;
    border-right: unset !important;
  }

  .v-calendar-weekly__day-label {
    button {
      z-index: 10;
      font-size: 1.16rem;
      font-weight: 400;
    }
  }

  .v-calendar-weekly__day {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: unset !important;
  }

  .v-calendar-weekly__week:last-child {
    .v-calendar-weekly__day {
      border-bottom: unset !important;
    }
  }

  .v-calendar-weekly__week,
  .v-calendar-weekly__head {
    .v-outside {
      background: transparent !important;
    }
  }
}

.v-locale--is-rtl {
  .s--calendar-table {
    .-bg {
      right: unset;
      left: 0;

      &.start-bg {
        border-radius: 0 8px 8px 0;
      }

      &.end-bg {
        right: unset;
        left: 60%;
        border-radius: 8px 0 0 8px;
      }

      &.one-day-bg {
        right: 20%;
        left: 20%;
      }
    }
  }
}
</style>

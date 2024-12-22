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
  <div class="clock" :class="{'-small':small}">
    <!-- Display Flag and City Name -->
    <div class="clock__header flex items-center mb-4">
      <!-- Assuming you have a <flag> component; otherwise, revert to <img> -->
      <flag :iso="flag" :squared="false" class="me-2 clock__flag"></flag>

      <span class="clock__city text-lg font-semibold">{{ city }}</span>
    </div>

    <!-- Display Time Units -->
    <div class="clock__body grid grid-cols-3 gap-2">
      <div class="clock__col">
        <DigitalClockDigit :value="formattedTime.hours" :small="small" />
        <div class="clock__unit">Hours</div>
      </div>
      <div class="clock__col">
        <DigitalClockDigit :value="formattedTime.minutes" :small="small"  />
        <div class="clock__unit">Minutes</div>
      </div>
      <div class="clock__col">
        <DigitalClockDigit :value="formattedTime.seconds" :small="small"  />
        <div class="clock__unit">Seconds</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DigitalClockDigit from "./DigitalClockDigit.vue";

export default defineComponent({
  name: "UDateClock",
  components: {
    DigitalClockDigit,
  },
  props: {
    sourceTimezone: {
      type: String,
      default: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
      validator(value: string) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: value });
          return true;
        } catch {
          return false;
        }
      },
    },
    targetTimezone: {
      type: String,
      default: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
      validator(value: string) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: value });
          return true;
        } catch {
          return false;
        }
      },
    },
    city: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      required: true,
      validator(value: string) {
        return /^[A-Za-z]{2}$/.test(value);
      },
    },
    time: {
      type: [String, Number, Date],
      required: false,
      validator(value: string | number | Date) {
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
    },
    stop: {
      type: Boolean,
      default: false,
    },
    small:Boolean,
  },
  data() {
    return {
      internalTime: new Date(),
      timer: null as number | null,
    };
  },
  computed: {
    isLiveClock(): boolean {
      return !this.time && !this.stop;
    },
    effectiveTime(): Date {
      if (this.time) {
        const date = new Date(this.time);
        return !isNaN(date.getTime()) ? date : new Date();
      }
      return this.internalTime;
    },
    formattedTime() {
      if (!this.effectiveTime || isNaN(this.effectiveTime.getTime())) {
        return {
          hours: "00",
          minutes: "00",
          seconds: "00",
        };
      }

      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: this.targetTimezone,
      });

      const parts = formatter.formatToParts(this.effectiveTime);
      const getPart = (type: string) =>
          parts.find((p) => p.type === type)?.value || "00";

      return {
        hours: getPart("hour"),
        minutes: getPart("minute"),
        seconds: getPart("second"),
      };
    },
  },
  watch: {
    time: "handleTimeOrStopChange",
    stop: "handleTimeOrStopChange",
  },
  methods: {
    startTimer() {
      this.timer = window.setInterval(() => {
        this.internalTime = new Date();
      }, 1000);
    },
    stopTimer() {
      if (this.timer !== null) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    handleTimeOrStopChange() {


      if (this.time || this.stop) {
        this.stopTimer();
      } else if (!this.timer) {
        this.startTimer();
      }
    },
  },
  mounted() {
    if (this.isLiveClock) {
      this.startTimer();
    }
  },
  beforeUnmount() {
    this.stopTimer();
  },
});
</script>


<style scoped lang="scss">
.clock {
  background-color: #1a202c; /* Equivalent to bg-gray-900 */
  padding: 2rem; /* Equivalent to p-8 */
  margin-top: 3rem; /* Equivalent to mt-12 */
  border-radius: 0.5rem; /* Optional: Add border radius if needed */
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;


  &.-small{
    max-width: 200px;
    padding: 1rem;
    margin-top: 1rem;

    .clock__body {

    }
    .clock__unit {
      font-size: 7px;
    }
    .clock__col {
      padding: 0.4rem;
    }
  }
}

.clock__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem; /* Equivalent to mb-4 */
}

.clock__flag {
  width: 24px;
  height: 18px;
}

.clock__city {
  color: #cbd5e0; /* Equivalent to text-gray-400 */
  text-transform: capitalize;
}

.clock__body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem; /* Equivalent to gap-2 (0.5rem) */
}

.clock__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #4a5568; /* Equivalent to bg-gray-700 */
  border: 1px solid #4a5568; /* Equivalent to border-gray-600 */
  border-radius: 0.75rem; /* Equivalent to rounded-xl */
  padding: 1rem; /* Equivalent to py-4 */
}

.clock__unit {
  color: #cbd5e0; /* Equivalent to text-gray-400 */
  text-transform: uppercase;
  font-size: 0.75rem; /* Equivalent to text-xs */
  font-weight: 900; /* Equivalent to font-black */
  margin-top: 0.25rem; /* Equivalent to mt-1 */
}
</style>

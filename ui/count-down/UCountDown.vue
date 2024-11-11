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
  <ul v-if="end && diff > 0" class="vuejs-countdown" dir="ltr">
    <li v-if="days > 0">
      <p class="digit">
        {{ twoDigits(days) }}
      </p>
      <p class="text">
        {{ $t("global.count_down.days") }}
      </p>
    </li>
    <li>
      <p class="digit">
        {{ twoDigits(hours) }}
      </p>
      <p class="text">
        {{ $t("global.count_down.hours") }}
      </p>
    </li>
    <li>
      <p class="digit">
        {{ twoDigits(minutes) }}
      </p>
      <p class="text">
        {{ $t("global.count_down.minutes") }}
      </p>
    </li>
    <li>
      <p class="digit">
        {{ twoDigits(seconds) }}
      </p>
      <p class="text">
        {{ $t("global.count_down.seconds") }}
      </p>
    </li>
  </ul>
</template>

<script lang="ts">
export default {
  name: "UCountDown",
  emits: ["end"],
  props: {
    end: {},
    stop: {
      type: Boolean,
    },
  },
  data() {
    return {
      now: Math.trunc(new Date().getTime() / 1000),
      date: null,
      diff: 0,

      interval: null,
    };
  },
  computed: {
    seconds() {
      return Math.trunc(this.diff) % 60;
    },
    minutes() {
      return Math.trunc(this.diff / 60) % 60;
    },
    hours() {
      return Math.trunc(this.diff / 60 / 60) % 24;
    },
    days() {
      return Math.trunc(this.diff / 60 / 60 / 24);
    },

    end_date() {
      return this.end && new Date(this.end);
    },
  },
  watch: {
    now(value) {
      this.updateView();
    },

    end() {
      this.date = Math.trunc(this.end_date / 1000);
      this.init();
    },
  },
  created() {
    if (!this.end_date) return;

    this.init();
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    init() {
      if (this.interval) clearInterval(this.interval);
      this.interval = null;

      //   let endTime = this.deadline ? this.deadline : this.end;
      this.date = Math.trunc(this.end_date / 1000); // Math.trunc(Date.parse(endTime.replace(/-/g, "/")) / 1000);
      if (!this.date) {
        console.error("Invalid props value, correct the 'deadline' or 'end'");
        return;
      }

      this.now = Math.trunc(new Date().getTime() / 1000);
      this.updateView();

      this.interval = setInterval(() => {
        this.now = Math.trunc(new Date().getTime() / 1000);
      }, 1000);
    },
    twoDigits(value) {
      if (value.toString().length <= 1) {
        return "0" + value.toString();
      }
      return value.toString();
    },

    updateView() {
      this.diff = this.date - this.now;
      if (this.diff <= 0 || this.stop) {
        this.diff = 0;
        // Remove interval
        clearInterval(this.interval);
        this.$emit("end");
      }
    },
  },
};
</script>
<style lang="scss">
.vuejs-countdown {
  padding: 0 !important;
  margin: 0;
}

.vuejs-countdown li {
  display: inline-block;
  margin: 0 8px;
  text-align: center;
  position: relative;
}

.vuejs-countdown li p {
  margin: 0;
}

.vuejs-countdown li:after {
  content: ":";
  position: absolute;
  top: 0;
  right: -13px;
  font-size: 1.4rem;
}

.vuejs-countdown li:first-of-type {
  margin-left: 0;
}

.vuejs-countdown li:last-of-type {
  margin-right: 0;
}

.vuejs-countdown li:last-of-type:after {
  content: "";
}

.vuejs-countdown .digit {
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 0;

  @media only screen and (max-width: 600px) {
    font-size: 1.1rem;
  }
}

.vuejs-countdown .text {
  text-transform: capitalize;
  margin-bottom: 0;
  font-size: 9px;
  opacity: 0.8;
  font-weight: 500;
}
</style>

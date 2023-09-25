<template>
  <ul class="vuejs-countdown" dir="ltr">
    <li v-if="days > 0">
      <p class="digit">
        {{ days | twoDigits }}
      </p>
      <p class="text">
        {{ $t("global.count_down.days") }}
      </p>
    </li>
    <li>
      <p class="digit">
        {{ hours | twoDigits }}
      </p>
      <p class="text">
        {{ $t("global.count_down.hours") }}
      </p>
    </li>
    <li>
      <p class="digit">
        {{ minutes | twoDigits }}
      </p>
      <p class="text">
        {{ $t("global.count_down.minutes") }}
      </p>
    </li>
    <li>
      <p class="digit">
        {{ seconds | twoDigits }}
      </p>
      <p class="text">
        {{ $t("global.count_down.seconds") }}
      </p>
    </li>
  </ul>
</template>

<script>
let interval = null;
export default {
  name: "CountDown",
  filters: {
    twoDigits(value) {
      if (value.toString().length <= 1) {
        return "0" + value.toString();
      }
      return value.toString();
    }
  },
  props: {
    end: {
      type: Date
    },
    stop: {
      type: Boolean
    }
  },
  data() {
    return {
      now: Math.trunc(new Date().getTime() / 1000),
      date: null,
      diff: 0
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
    }
  },
  watch: {
    now(value) {
      this.updateView();
    },

    end() {
      this.date = Math.trunc(this.end / 1000);
    }
  },
  created() {
    if (!this.end) {
      throw new Error("Missing props 'deadline' or 'end'");
    }
    //   let endTime = this.deadline ? this.deadline : this.end;
    this.date = Math.trunc(this.end / 1000); // Math.trunc(Date.parse(endTime.replace(/-/g, "/")) / 1000);
    if (!this.date) {
      throw new Error("Invalid props value, correct the 'deadline' or 'end'");
    }

    this.now = Math.trunc(new Date().getTime() / 1000);
    this.updateView();
    interval = setInterval(() => {
      this.now = Math.trunc(new Date().getTime() / 1000);
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(interval);
  },
  methods: {
    updateView() {
      this.diff = this.date - this.now;
      if (this.diff <= 0 || this.stop) {
        this.diff = 0;
        // Remove interval
        clearInterval(interval);
        this.$emit('end');
      }
    }
  }
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

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
  <div :class="{ 'is-rtl': $vuetify.rtl }" class="root">
    <h3 class="progress-xyz-title">
      {{ title }}
    </h3>

    <div class="d-flex justify-content-between align-items-center mb-3">
      <v-btn
        :disabled="!previous"
        rounded
        variant="text"
        @click="$emit('previous')"
      >
        <v-icon> {{ $t("icons.chevron_back") }}</v-icon>
        {{ $t("global.actions.previous") }}
      </v-btn>

      <v-btn :disabled="!next" rounded variant="text" @click="$emit('next')">
        {{ $t("global.actions.next") }}

        <v-icon>{{ $t("icons.chevron_next") }}</v-icon>
      </v-btn>
    </div>

    <div class="progress-xyz">
      <div
        :style="{
          width: `${tweeningValue}%`,
          background: gradient ? gradient : color,
        }"
        class="progress-xyz-bar"
      >
        <span
          :style="{
            color: '#fff',
            'border-color': colorValue ? colorValue : color,
            background: colorValue ? colorValue : color,
          }"
          class="progress-xyz-icon"
          ><span>{{ Math.round(tweeningValue) }}</span
          >%</span
        >
      </div>

      <div
        :style="{ color: color, 'border-color': color }"
        class="progress-xyz-value"
      >
        <v-icon :color="color" size="small" style="margin-bottom: 6px">
          {{ icon }}
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script>
import TWEEN from "@tweenjs/tween.js";

export default {
  name: "ProgressXyzStepper",
  components: {},
  props: {
    modelValue: {},
    title: {
      required: false,
      type: String,
    },
    color: {
      required: false,
      type: String,
      default: "#f7810e",
    },
    colorValue: {
      required: false,
      type: String,
      default: "#f7810e",
    },
    gradient: {
      required: false,
      type: String,
    },
    icon: {
      required: false,
      type: String,
      default: "home",
    },
    next: {
      required: false,
      type: Boolean,
      default: false,
    },
    previous: {
      required: false,
      type: Boolean,
      default: false,
    },

    // How long the tween should take. (In milliseconds.)
    tweenDuration: {
      type: Number,
      default: 500,
    },
  },

  data() {
    return {
      tweeningValue: 0,
    };
  },

  watch: {
    modelValue(newVal, oldVal) {
      this.tween(oldVal, newVal);
    },
  },

  mounted() {
    this.tween(0, this.modelValue);
  },
  methods: {
    // This is our main logic block. It handles tweening from a start value to an end value.
    tween(start, end) {
      let frameHandler;

      // Handles updating the tween on each frame.
      const animate = function (currentTime) {
        TWEEN.update(currentTime);
        frameHandler = requestAnimationFrame(animate);
      };

      const myTween = new TWEEN.Tween({ tweeningValue: start })
        .to({ tweeningValue: end }, this.tweenDuration)
        // Be careful to not to do too much here! It will slow down the app.
        .onUpdate((object) => {
          this.tweeningValue = object.tweeningValue;
        })
        .onComplete(() => {
          // Make sure to clean up after ourselves.
          cancelAnimationFrame(frameHandler);
        })
        // This actually starts the tween.
        .start();

      frameHandler = requestAnimationFrame(animate);
    },
  },
};
</script>

<style lang="scss" scoped>
.root {
  padding: 0 32px 30px 32px;
}

.progress-xyz-title {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 30px;
}

.progress-xyz {
  height: 17px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  margin-bottom: 30px;
  margin-top: 30px;
  overflow: visible;
  position: relative;

  .progress-xyz-icon,
  .progress-xyz-value {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    line-height: 40px;
    background: #fff;
    border: 7px solid #1f75c4;
    font-size: 13px;
    font-weight: 600;
    color: #1f75c4;
    position: absolute;
    top: -17px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-xyz-value {
    left: -25px;
  }

  .progress-xyz-icon {
    right: -50px;
    transform: translate(-25px, 0);
  }
}

.is-rtl {
  .progress-xyz {
    .progress-xyz-value {
      right: -25px;
      left: auto;
    }

    .progress-xyz-icon {
      left: -50px;
      right: auto;

      transform: translate(25px, 0);
    }
  }
}

.progress-xyz .progress-xyz-bar {
  border-radius: 15px;
  box-shadow: none;
  position: relative;
  animation: animate-positive 2s;
  height: 17px;
  position: relative;
}

.progress-xyz .progress-xyz-icon {
  left: auto;
}

.progress-xyz.orange-bar .progress-xyz-icon,
.progress-xyz.orange-bar .progress-xyz-value {
  border: 7px solid #f7810e;
  color: #f7810e;
}

.progress-xyz.pink-bar .progress-xyz-icon,
.progress-xyz.pink-bar .progress-xyz-value {
  border: 7px solid #f2438f;
  color: #f2438f;
}

.progress-xyz.green-bar-bar .progress-xyz-icon,
.progress-xyz.green-bar-bar .progress-xyz-value {
  border: 7px solid #08a061;
  color: #08a061;
}

@-webkit-keyframes animate-positive {
  0% {
    width: 0;
  }
}

@keyframes animate-positive {
  0% {
    width: 0;
  }
}
</style>

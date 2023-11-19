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
  <v-progress-circular
    v-if="value > 0"
    :rotate="-90"
    :size="size"
    :width="width"
    :value="value"
    :color="color"
  >
    <slot></slot>
  </v-progress-circular>
</template>

<script>
export default {
  name: "timeLapse",
  props: {
    size: {
      default: 30,
    },
    width: {
      default: 6,
    },
    durationMs: {
      default: 7000,
    },
    color: {
      default: "primary",
    },
  },
  data() {
    return {
      interval: null,
      value: 100,
    };
  },
  beforeDestroy() {
    if (this.interval) clearInterval(this.interval);
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.value <= 0) {
        this.end();
      }
      this.value -= 2;
    }, this.durationMs/50);
  },
  methods: {
    end() {
      clearInterval(this.interval);
      this.interval = null;
      this.$emit('end')
    },
  },
};
</script>

<style scoped></style>

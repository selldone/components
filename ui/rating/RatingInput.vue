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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="d-flex align-center justify-center">
    <small class="m-0 float-end text-center" style="min-width: 74px">
      <v-icon :color="ticksColor[value_clone - 1]"
        >{{ tickIcons[value_clone - 1] }}
      </v-icon>
      <br />
      {{ ticksLabels[value_clone - 1] }}
    </small>

    <p class="m-0 small text-muted">{{ title }}:</p>

    <v-slider
      v-model="value_clone"
      :max="5"
      :min="1"
      color="blue-darken-3"
      hide-details
      reverse
      step="1"
      style="border-radius: 4px; max-width: 240px"
      thumb-color="blue darken-3"
      tick-size="4"
      ticks="always"
      track-color="#ddd"
      track-fill-color="blue darken-3"
      @change="$emit('input', value_clone)"
    />
  </div>
</template>

<script>
export default {
  name: "RatingInput",

  props: ["value", "title"],

  data: () => ({
    value_clone: 0,

    tickIcons: [
      "far fa-angry",
      "far fa-frown",
      "far fa-meh",
      "far fa-smile",
      "far fa-grin-stars",
    ],
    ticksColor: ["#D32F2F", "#E64A19", "#FFA000", "#0288D1", "#689F38"],
  }),
  computed: {
    ticksLabels() {
      return this.$tm("global.rating_labels");
    },
  },
  watch: {
    value(new_val) {
      this.value_clone = new_val;
    },
  },
  created() {
    this.value_clone = this.value;
  },
  methods: {},
};
</script>

<style scoped></style>

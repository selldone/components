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
  <div class="d-flex align-center">
    <small class="text-center" style="min-width: 74px">
      <v-icon v-if="value_clone" :color="ticksColor[value_clone - 1]"
        >{{ tickIcons[value_clone - 1] }}
      </v-icon>
      <v-icon v-else> question_mark </v-icon>
      <br />
      <span class="small">{{ ticksLabels[value_clone - 1] }}</span>
    </small>

    <p class="m-0 text-subtitle-2">{{ title }}</p>
    <v-spacer></v-spacer>

    <div style="width: 240px">
      <v-slider
        v-model="value_clone"
        :max="5"
        :min="min"
        color="primary"
        hide-details
        rounded
        show-ticks="always"
        step="1"
        thumb-color="primary"
        tick-size="4"
        track-color="#ddd"
        track-fill-color="primary"
        @update:model-value="$emit('update:modelValue', value_clone)"
        :aria-label="`${title}: ${modelValue}`"
        role="progressbar"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "URatingInput",
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    title: {},
    min: {
      default: 3,
    },
  },

  data: () => ({
    value_clone: 0,

    tickIcons: [
      "fa:far fa-angry",
      "fa:far fa-frown",
      "fa:far fa-meh",
      "fa:far fa-smile",
      "fa:far fa-grin-stars",
    ],
    ticksColor: ["#D32F2F", "#E64A19", "#FFA000", "#0288D1", "#689F38"],
  }),
  computed: {
    ticksLabels() {
      return this.$tm("global.rating_labels");
    },
  },
  watch: {
    modelValue(new_val) {
      this.value_clone = new_val;
    },
  },
  created() {
    this.value_clone = this.modelValue;
  },
  methods: {},
};
</script>

<style scoped></style>

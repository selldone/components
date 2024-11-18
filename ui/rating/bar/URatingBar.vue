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
  <v-row align="center" justify="center" no-gutters>
    <p
      :title="title"
      class="m-0 small op-0-8 text-truncate flex-grow-1"
      style="width: 40%"
    >
      {{ title }}
    </p>
    <div class="position-relative" style="max-width: 112px; width: 40%">
      <v-progress-linear
        v-model="rating_percent"
        class="m-1"
        color="#1976D2"
        rounded
        rounded-bar
        style="pointer-events: none"
        :aria-label="`${title}: ${rating_percent}`"
      />
      <v-avatar
        v-if="userRate"
        :style="{
          left: $vuetify.locale.isRtl
            ? undefined
            : `calc(${userRate * 20}% - 9px)`,
          right: !$vuetify.locale.isRtl
            ? undefined
            : `calc(${userRate * 20}% - 9px)`,
          top: '-4px',
        }"
        class="position-absolute"
        color="#1976D2"
        size="18"
      >
        <img :src="getUserAvatar(USER_ID())" style="padding: 2px" alt="User" />
      </v-avatar>
    </div>

    <small class="ms-4 d-none d-sm-block" style="width: 20%">{{ rating_name }}</small>
  </v-row>
</template>

<script lang="ts">
export default {
  name: "URatingBar",

  props: {
    value: {
      required: false,
      type: Number,
      default: 0,
    },
    max: {
      required: false,
      type: Number,
      default: 100,
    },
    title: {
      required: false,
      type: String,
    },
    userRate: {
      required: false,
    },
  },

  data: () => ({}),
  computed: {
    rating_percent() {
      if (!this.max) return 50;
      return (this.value * 100) / this.max;
    },

    rating_name() {
      if (this.rating_percent < 30) return this.$tm("surveys")[0];
      if (this.rating_percent < 50) return this.$tm("surveys")[1];
      if (this.rating_percent < 70) return this.$tm("surveys")[2];
      if (this.rating_percent < 90) return this.$tm("surveys")[3];
      return this.$tm("surveys")[4];
    },
  },
  watch: {},
};
</script>

<style scoped></style>

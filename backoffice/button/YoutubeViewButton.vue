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
    <a
      class="typo-body border rounded-18px d-flex align-center overflow-hidden d-block"
      href="https://youtu.be/8iWXswJxQ7Q"
      target="_blank"
    >
      <img
        class="m-2 me-4 rounded-lg"
        height="42"
        src="../../assets/guides/video-full-review.jpg"
        width="auto"
      />

      <div
        :class="{ 'text-wrap small': $vuetify.display.mdAndDown }"
        class="flex-grow-1 pe-2 text-black text-capitalize"
      >
        Selldone Fast Overview
        <v-icon class="mx-1" color="amber" size="small">star</v-icon>
      </div>
      <v-btn
        :min-width="$vuetify.display.smAndUp ? 150 : 64"
        class="tnt"
        color="#d22600"

        height="64"
        tile
        variant="flat"
      >
        <v-icon class="me-1" size="small">smart_display</v-icon>
        <span v-if="$vuetify.display.smAndUp">
          {{ $t("global.actions.watch_now") }}
        </span>
      </v-btn>
    </a>

    <div
      v-if="show && window.WELCOME_VIDEO_EMBED"
      class="py-10 text-center position-relative wembed"
    >
      <div class="mt-16" v-html="window.WELCOME_VIDEO_EMBED"></div>

      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="hide">
          <v-icon class="me-1">arrow_upward</v-icon>
          Hide the video
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "YoutubeViewButton",
  props: {},
  data: () => ({
    show: localStorage.getItem("welcome-video-hide") !== "true",
  }),

  methods: {
    hide() {
      this.show = false;
      localStorage.setItem("welcome-video-hide", "true");
    },
  },
};
</script>

<style lang="scss" scoped>
.small {
  font-size: 13px;
}

::v-deep(.wembed) {
  iframe {
    max-width: 100%;
  }
}
</style>

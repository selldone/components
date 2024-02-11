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
  <v-progress-linear
    :class="{ '-relative': relative }"
    :color="color"
    :height="height"
    :stream="stream"
    class="loader-to-bar"
    indeterminate
    rounded
    rounded-bar
  ></v-progress-linear>
</template>

<script>
import { SetupService } from "@core/server/SetupService";

export default {
  name: "SProgressLoading",
  props: {
    color: {
      default: "success",
    },
    relative: { type: Boolean },
    height: {},
    stream: Boolean,
  },
  computed: {
    animation() {
      return SetupService.MainServiceUrl() + "/animation/719-loading.json";
    },
  },
};
</script>

<style scoped></style>

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

<!--
Use case:

<v-img>
  ...
  <template v-slot:placeholder>
     <s-image-placeholder></s-image-placeholder>
  </template>
</v-img>

-->
<template>
  <v-progress-circular
    :bg-color="bgColor"
    :color="color"
    :size="size"
    class="center-absolute"
    indeterminate
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SImagePlaceholder",
  props: {
    color: {
      type: String,
      default: "#eee",
    },
    bgColor: {
      type: String,
    },
    size: {
      type: String,
    },
  },
  computed: {},
});
</script>

<style lang="scss" scoped></style>

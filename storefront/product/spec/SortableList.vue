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
  <ul class="list">
    <slot />
  </ul>
</template>

<script>
// ―――――――――――――――― A set of vue mixins to turn any list into an animated sortable list ――――――――――――――――
import { ContainerMixin, ElementMixin } from "vue-slicksort";

export default {
  name: "SortableList",
  mixins: [ContainerMixin]
};
</script>

<style scoped></style>

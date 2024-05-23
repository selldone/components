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
  <v-img
    :aspect-ratio="1.7"
    :height="height"
    :max-width="height * 1.7"
    :min-width="height * 1.7"
    :src="image"
    :style="{ 'background-color': color }"
    :width="height * 1.7"
    class="card-con"
    cover
  >
    <v-icon class="absolute-bottom-start" color="#fff" size="small"
      >notes
    </v-icon>

    <v-icon class="absolute-top-end" color="#fff" size="small">memory</v-icon>
  </v-img>
</template>

<script>
export default {
  name: "BGiftcardTypeIcon",
  props: {
    image: {},
    color: {},
    height: { default: 42 },
  },
};
</script>

<style lang="scss" scoped>
.card-con {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
</style>

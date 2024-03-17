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
  <ul class="s--cloud-tags-view">
    <li v-for="(tag, i) in tags" :key="i" :style="getStyle(tag, i)">
      {{ getName(tag) }}
    </li>
  </ul>
</template>

<script>
export default {
  name: "UTagsCloud",
  props: {
    tags: {},
  },
  methods: {
    getStyle(tag, i) {
      return {
        fontSize: 1 + Math.round(Math.random() * 10) / 10 + "rem",
        fontWeight: [300, 400, 500, 600, 700, 800][
          Math.floor(Math.random() * 6)
        ],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.s--cloud-tags-view {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  text-align: center;

  li {
    margin: 0 5px;
    display: inline-block;
    vertical-align: middle;
  }
}
</style>

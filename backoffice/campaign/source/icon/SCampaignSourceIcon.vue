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
  <img :height="size" :src="icon" :title="value" :width="size" />
</template>

<script>
import { Brands } from "@core/enums/social/Brands";

export default {
  name: "SCampaignSourceIcon",

  props: {
    value: {},
    size: {
      default: 16,
    },
  },

  computed: {
    icon() {
      if (this.value === "direct")
        return require("@components/assets/icons/direct-enter.svg");
      const found = this.value
        ? Brands.find(
            (item) => item.name.toLowerCase() === this.value.toLowerCase(),
          )
        : null;

      return found
        ? found.icon
        : require("@components/assets/trademark/default.svg");
    },
  },
  methods: {},
};
</script>

<style scoped></style>

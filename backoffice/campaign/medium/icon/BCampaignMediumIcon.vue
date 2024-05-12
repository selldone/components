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
  <img :height="size" :src="icon" :title="value" />
</template>

<script>
import { CampaignMedium } from "@selldone/core-js/enums/campaign/CampaignMedium";

export default {
  name: "BCampaignMediumIcon",

  props: {
    value: {},
    size: {
      default: 16,
    },
  },

  computed: {
    icon() {
      const found = this.value
        ? CampaignMedium.find(
            (item) => item.name.toLowerCase() === this.value.toLowerCase(),
          )
        : null;

      return found
        ? found.icon
        : require("@selldone/core-js/enums/campaign/assets/mediums/default.svg");
    },
  },
  methods: {},
};
</script>

<style scoped></style>

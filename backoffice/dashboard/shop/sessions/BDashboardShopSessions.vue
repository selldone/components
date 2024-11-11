<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <b-sessions-map
    :full-details="fullDetails"
    :shop="shop"
    :url="window.API.GET_SHOP_STATISTIC_SESSIONS(shop.id)"
    dat-key="sessions"
  ></b-sessions-map>
</template>

<script lang="ts">
import BSessionsMap from "../../../session/map/BSessionsMap.vue";

export default {
  name: "BDashboardShopSessions",
  components: {
    BSessionsMap,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    fullDetails: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({}),

  computed: {},

  watch: {},
  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped></style>

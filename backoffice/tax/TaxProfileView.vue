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
    <v-icon v-if="profile.icon" class="me-1">{{ profile.icon }}</v-icon>
    <b>{{ profile.name }}</b>

    <span v-if="profile.fix" class="ms-2">
      | <small>Goods:</small> <b>{{ profile.fix_vat }}%</b>
      <template v-if="profile.fix_shipping">
        | <small>Shipping:</small> <b>{{ profile.fix_shipping }}%</b></template
      >
    </span>
    <span v-else class="ms-2">
      | <v-icon small>share_location</v-icon> <small>Dynamic</small></span
    >

    <v-chip
      :color="profile.included ? '#FFC107' : '#8BC34A'"
      x-small
      label
      class="mx-2"
      >{{ profile.included ? "Included" : "Excluded" }}</v-chip
    >
  </div>
</template>

<script>
export default {
  name: "TaxProfileView",
  props: {
    shop: {
      required: true,
      type: Object,
    },

    profile: {
      required: true,
      type: Object,
    },
  },
  data: () => ({}),

  computed: {},

  watch: {},

  created() {},

  methods: {},
};
</script>

<style scoped></style>

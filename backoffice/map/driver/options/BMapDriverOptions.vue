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

<template>
  <v-expansion-panels v-if="driver">
    <v-expansion-panel elevation="0" rounded="xl">
      <v-expansion-panel-title>
        <v-icon class="me-2">settings</v-icon>
        More options
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <b-map-driver-mapbox-options
          v-if="driver === MapProviders.Mapbox.code"
        ></b-map-driver-mapbox-options>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BMapDriverMapboxOptions from "../../../map/driver/mapbox/options/BMapDriverMapboxOptions.vue";
import { Map } from "@selldone/core-js";

export default defineComponent({
  name: "BMapDriverOptions",
  data: () => ({
    MapProviders: Map.Providers,
  }),
  computed: {},
  components: { BMapDriverMapboxOptions },
  props: {
    driver: String,
  },
});
</script>

<style lang="scss" scoped></style>

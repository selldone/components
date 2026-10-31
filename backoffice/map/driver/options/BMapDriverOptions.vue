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
  <details v-if="driver" class="b-map-driver-options text-start">
    <summary>
      <v-icon size="16" aria-hidden="true">tune</v-icon
      ><span>{{ $t("map_channel.more_options") }}</span
      ><v-icon
        size="16"
        class="b-map-driver-options__chevron"
        aria-hidden="true"
        >expand_more</v-icon
      >
    </summary>
    <div class="b-map-driver-options__body">
      <b-map-driver-mapbox-options v-if="driver === MapProviders.Mapbox.code" />
    </div>
  </details>
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

<style lang="scss" scoped>
.b-map-driver-options {
  > summary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    list-style: none;
    font-size: 13px;
    line-height: 20px;
    cursor: pointer;
  }
  > summary::-webkit-details-marker {
    display: none;
  }
  > summary:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 4px;
  }
  &__chevron {
    margin-inline-start: 5px;
    transition: transform 0.15s;
  }
  &[open] > summary .b-map-driver-options__chevron {
    transform: rotate(180deg);
  }
  &__body {
    padding-top: 18px;
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .b-map-driver-options > summary {
    min-height: 44px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .b-map-driver-options__chevron {
    transition: none;
  }
}
</style>

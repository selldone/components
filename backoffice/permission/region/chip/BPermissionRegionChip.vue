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
  <v-chip
    :size="size"
    :color="enable ? 'green' : 'red'"
    :prepend-icon="region_object?.icon"
    :variant="variant"
    :density="density"
    :label="label"
    :append-icon="enable ? 'check' : 'close'"
  >
    {{ $t(region_object?.name) }} <b class="ms-1">{{ split[1] }}</b>
  </v-chip>
</template>

<script>
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BPermissionRegionChip",
  props: {
    region: {
      required: true,
      type: String,
    },
    enable: Boolean,
    variant: {},
    density: {},
    label: Boolean,
    size: {},
  },
  data: () => ({}),

  computed: {
    split() {
      return this.region.split("-");
    },
    region_object() {
      return ShopPermissionRegions[this.split[0]];
    },
  },
};
</script>

<style scoped></style>

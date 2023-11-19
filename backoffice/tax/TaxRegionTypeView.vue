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
  <span>
    <v-icon :color="type_obj?.color" class="me-1" size="12">circle</v-icon>
    {{ $t(type_obj?.title) }}
  </span>
</template>

<script>
import { TaxRegionTypes } from "@core/enums/tax/TaxRegionTypes";

export default {
  name: "TaxRegionTypeView",
  props: {
    type: { required: true },
  },
  computed: {
    type_obj() {
      return TaxRegionTypes[this.type];
    },
  },
};
</script>

<style scoped></style>

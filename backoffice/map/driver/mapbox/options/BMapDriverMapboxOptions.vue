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
  <div>
    <div class="py-3">
      <v-icon class="me-1">crisis_alert</v-icon>
      <b>Important!</b> If you have over 1K visitors daily or want more
      customization, please set <b>Mapbox Access Key</b> by adding a
      <v-chip
        :to="{ name: 'BPageShopSettingTheme', hash: '#code' }"
        color="primary"
        variant="text"
      >
        <v-icon start>code</v-icon>
        <b>Meta tag</b>
      </v-chip>
      like the following sample.
      <div class="my-2 bg-amber pa-2 rounded">
        <code v-copy v-text="sample_acc"></code>
      </div>
    </div>
    <div class="py-3">
      <v-icon class="me-1">style</v-icon>
      <b>Customize.</b> Please add a <b>style code</b> on the
      <v-chip
        :to="{ name: 'BPageShopSettingTheme', hash: '#code' }"
        color="primary"
        variant="text"
      >
        <v-icon start>code</v-icon>
        <b>Meta tag</b>
      </v-chip>
      to customize the map style.

      <div class="my-2 bg-amber pa-2 rounded">
        <code v-copy v-text="sample_style"></code>
      </div>
      <div class="mt-1 text-end">
        <v-btn
          class="tnt"
          href="https://docs.mapbox.com/api/maps/styles/#mapbox-styles"
          target="_blank"
          variant="elevated"
          >More styles...
          <v-icon end>open_in_new</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BMapDriverMapboxOptions",
  data: () => ({
    sample_acc: '<meta name="map-token" content="pk.eyJ1Ijoic...">',
    sample_style:
      '<meta name="map-style" content="mapbox://styles/mapbox/streets-v11">',
  }),
});
</script>

<style lang="scss" scoped></style>

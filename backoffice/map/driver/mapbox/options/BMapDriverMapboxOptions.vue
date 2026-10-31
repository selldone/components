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
  <div class="b-mapbox-options text-start">
    <h3>{{ $t("map_channel.custom_mapbox") }}</h3>
    <p>{{ $t("map_channel.custom_mapbox_help") }}</p>
    <div class="b-mapbox-options__sample">
      <span>{{ $t("map_channel.access_key") }}</span
      ><code v-copy dir="ltr" v-text="sample_acc"></code>
    </div>
    <div class="b-mapbox-options__sample">
      <span>{{ $t("map_channel.map_style") }}</span
      ><code v-copy dir="ltr" v-text="sample_style"></code>
    </div>
    <div class="b-mapbox-options__actions">
      <v-btn
        :to="{ name: 'BPageShopSettingTheme', hash: '#code' }"
        target="_blank"
        rel="noopener noreferrer"
        class="sd-modern-button sd-modern-button--inline"
        variant="text"
        color="primary"
        ><v-icon start aria-hidden="true">palette</v-icon
        >{{ $t("map_channel.theme_settings")
        }}<v-icon end aria-hidden="true">north_east</v-icon></v-btn
      >
      <v-btn
        href="https://docs.mapbox.com/api/maps/styles/#mapbox-styles"
        target="_blank"
        rel="noopener noreferrer"
        class="sd-modern-button sd-modern-button--inline"
        variant="text"
        color="primary"
        >{{ $t("map_channel.mapbox_docs")
        }}<v-icon end aria-hidden="true">north_east</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BMapDriverMapboxOptions",
  data: () => ({
    sample_acc: '<meta name="map-token" content="YOUR_PUBLIC_MAPBOX_KEY">',
    sample_style:
      '<meta name="map-style" content="mapbox://styles/mapbox/streets-v11">',
  }),
});
</script>

<style lang="scss" scoped>
.b-mapbox-options {
  h3 {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
  }
  > p {
    margin: 4px 0 14px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  &__sample {
    display: grid;
    gap: 5px;
    background: var(--sd-modern-inset);
    border-radius: 8px;
    padding: 10px 12px;
    margin-top: 8px;
  }
  &__sample > span {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__sample > code {
    font-size: 13px;
    line-height: 21px;
    overflow-wrap: anywhere;
    white-space: normal;
    color: rgb(var(--v-theme-on-surface));
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    margin-top: 10px;
  }
}
</style>

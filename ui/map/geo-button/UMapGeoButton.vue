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
    <!-- iOS -->
    <v-btn
      v-if="location && iphone"
      :href="`http://maps.apple.com/?sll=${location.lat},${location.lng}`"
      :icon="icon"
      :size="large ? 'large' : small ? 'small' : undefined"
      :variant="icon ? 'text' : text ? 'text' : 'flat'"
      class="rounded-8px tnt m-1"
      target="_blank"
      @click.stop
      ><v-icon class="me-1" color="blue">near_me</v-icon>
      {{ !icon ? $t("global.commons.navigation_app") : "" }}</v-btn
    >
    <!-- Android -->
    <v-btn
      v-else-if="location && android"
      :href="`maps://maps.google.com/maps?daddr=${location.lat},${location.lng}`"
      :icon="icon"
      :size="large ? 'large' : small ? 'small' : undefined"
      :variant="icon ? 'text' : text ? 'text' : 'flat'"
      class="rounded-8px tnt m-1"
      target="_blank"
      @click.stop
      ><v-icon class="me-1" color="green">near_me</v-icon>
      {{ !icon ? $t("global.commons.navigation_app") : "" }}</v-btn
    >
    <!-- Default -->
    <v-btn
      v-if="!onlyOne || (!iphone && !android)"
      :href="`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=${travelmode}`"
      :icon="icon"
      :size="large ? 'large' : small ? 'small' : undefined"
      :title="$t('global.commons.map')"
      :variant="icon ? 'text' : text ? 'text' : 'flat'"
      class="rounded-8px tnt m-1"
      target="_blank"
      @click.stop
      ><img height="20" src="../../../assets/icons/google-map.svg" width="20" />
      <span v-if="!icon" class="ms-1">{{
        $t("global.commons.navigation")
      }}</span>
    </v-btn>
  </span>
</template>

<script>
export default {
  name: "UMapGeoButton",
  props: {
    location: {
      require: true,
    },
    transportationType: {
      default: "Motorbike",
    },
    large: {
      default: false,
      Type: Boolean,
    },
    icon: {
      default: false,
      Type: Boolean,
    },
    text: {
      default: false,
      Type: Boolean,
    },
    onlyOne: {
      default: false,
      Type: Boolean,
    },

    small: {
      default: false,
      Type: Boolean,
    },
  },

  computed: {
    iphone() {
      return navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
    },
    android() {
      return navigator.userAgent.match(/android/i);
    },

    travelmode() {
      if (["Airplane", "Global"].includes(this.transportationType))
        return "transit";
      if (["Bicycle"].includes(this.transportationType)) return "bicycling";
      return "driving";
    },
  },
};
</script>

<style scoped></style>

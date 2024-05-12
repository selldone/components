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
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn class="px-2" v-bind="props" variant="outlined">
        Fulfilled

        <v-divider class="mx-2" vertical></v-divider>
        <v-icon size="small">expand_more</v-icon>
      </v-btn>
    </template>
    <v-list class="text-start">
      <v-list-item
        v-if="hasRefresh"
        prepend-icon="refresh"
        @click="$emit('refresh')"
      >
        <v-list-item-title
          >{{ $t("global.actions.refresh") }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="transportationOrder.label"
        :href="transportationOrder.label"
        prepend-icon="download"
        target="_blank"
      >
        <v-list-item-title>Download label</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="transportationOrder.qr_code"
        :href="transportationOrder.qr_code"
        prepend-icon="qr_code_scanner"
        target="_blank"
      >
        <v-list-item-title>QR Code</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="deliveryService.url"
        :href="deliveryService.url"
        prepend-icon="open_in_new"
        target="_blank"
      >
        <v-list-item-title>View & manage order</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="transportationOrder.track"
        :href="transportationOrder.track"
        prepend-icon="gps_fixed"
        target="_blank"
      >
        <v-list-item-title>{{ $t("global.actions.track") }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "DeliveryServiceFulfilledButton",
  props: {
    deliveryService: { type: Object, required: true },
    transportationOrder: { required: true },
    hasRefresh: { type: Boolean, default: false },
  },
};
</script>

<style scoped></style>

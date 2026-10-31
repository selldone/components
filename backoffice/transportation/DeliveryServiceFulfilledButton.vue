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
  <v-menu
    :content-class="modern ? 'rounded-lg sd-modern-menu text-start' : undefined"
    :min-width="modern ? 220 : undefined"
    :max-width="modern ? 'calc(100vw - 24px)' : undefined"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-if="modern"
        v-bind="props"
        icon
        variant="text"
        class="sd-modern-icon-button"
        :aria-label="$t('transportation_orders.provider_tools')"
        @click.stop
      >
        <v-icon size="18" aria-hidden="true">more_horiz</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
          >{{ $t("transportation_orders.provider_tools") }}</v-tooltip
        >
      </v-btn>
      <v-btn v-else class="px-2" v-bind="props" variant="outlined">
        Fulfilled

        <v-divider class="mx-2" vertical></v-divider>
        <v-icon size="small">expand_more</v-icon>
      </v-btn>
    </template>
    <v-list
      class="text-start"
      :class="{
        'sd-modern-menu__list delivery-service-fulfilled-button__list': modern,
      }"
      :density="modern ? 'compact' : undefined"
    >
      <v-list-item
        v-if="hasRefresh"
        prepend-icon="refresh"
        @click="$emit('refresh')"
      >
        <v-list-item-title
          >{{
            $t(
              modern
                ? "transportation_orders.refresh_provider"
                : "global.actions.refresh",
            )
          }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="transportationOrder.label"
        :href="transportationOrder.label"
        prepend-icon="download"
        target="_blank"
        :rel="modern ? 'noopener noreferrer' : undefined"
        :append-icon="modern ? 'north_east' : undefined"
      >
        <v-list-item-title>{{
          modern ? $t("transportation_orders.download_label") : "Download label"
        }}</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="transportationOrder.qr_code"
        :href="transportationOrder.qr_code"
        prepend-icon="qr_code_scanner"
        target="_blank"
        :rel="modern ? 'noopener noreferrer' : undefined"
        :append-icon="modern ? 'north_east' : undefined"
      >
        <v-list-item-title>{{
          modern ? $t("transportation_orders.qr_code") : "QR Code"
        }}</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="deliveryService.url"
        :href="deliveryService.url"
        :prepend-icon="modern ? 'open_in_browser' : 'open_in_new'"
        target="_blank"
        :rel="modern ? 'noopener noreferrer' : undefined"
        :append-icon="modern ? 'north_east' : undefined"
      >
        <v-list-item-title>{{
          modern
            ? $t("transportation_orders.manage_provider_order")
            : "View & manage order"
        }}</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="transportationOrder.track"
        :href="transportationOrder.track"
        prepend-icon="gps_fixed"
        target="_blank"
        :rel="modern ? 'noopener noreferrer' : undefined"
        :append-icon="modern ? 'north_east' : undefined"
      >
        <v-list-item-title>{{
          $t(
            modern
              ? "transportation_orders.tracking_link"
              : "global.actions.track",
          )
        }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
export default {
  name: "DeliveryServiceFulfilledButton",
  props: {
    modern: Boolean,
    deliveryService: { type: Object, required: true },
    transportationOrder: { required: true },
    hasRefresh: { type: Boolean, default: false },
  },
};
</script>

<style scoped lang="scss">
.delivery-service-fulfilled-button__list {
  :deep(.v-list-item-title) {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  :deep(.v-list-item__prepend .v-icon) {
    font-size: 18px;
  }

  :deep(.v-list-item__append .v-icon) {
    font-size: 16px;
  }
}

@media (max-width: 600px), (pointer: coarse) {
  .delivery-service-fulfilled-button__list :deep(.v-list-item) {
    min-height: 44px;
  }
}
</style>

<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <!-- ⬬⬬⬬⬬ Locations Error ⬬⬬⬬⬬ -->
  <v-row   v-if="no_location_error || invalid_location_error" no-gutters align="center" class="bg-red shadow-small">
    <v-list-item

      :subtitle="subtitle"
      :title="`Available locations error`"
      base-color="#fff"
      class="flex-grow-1"
    >
      <template v-slot:prepend>
        <v-icon class="blink-me-linear">report</v-icon>
      </template>
      <template v-slot:append> </template>
    </v-list-item>

    <div class="text-end flex-grow-1">
      <v-btn
        :to="{
          name: IS_VENDOR_PANEL
            ? 'Vendor_ProductInventoryPage'
            : 'BPageProductInventory',
        }"
        class="tnt ma-1"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -product me-1" size="24">
          <v-img :src="getShopImagePath(product.icon, 64)"></v-img>
        </v-avatar>

        Manage Locations
      </v-btn>
    </div>
  </v-row>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "BProductFlowErrorsLocation",
  components: {},
  props: {
    product: {
      required: true,
    },
  },
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    subtitle() {
      return this.no_location_error
        ? "You have activated a location restriction for purchasing the product, but currently, no country is listed under this restriction. As a result, this product is unavailable for purchase by anyone."
        : this.invalid_location_error
          ? "The location restriction settings for your product contain an error: certain locations listed do not have any associated ZIP codes. Consequently, users are unable to select a ZIP code, rendering the product unavailable for purchase."
          : "";
    },

    has_location() {
      return !!this.product.locations;
    },
    no_location_error() {
      return this.has_location && !Object.values(this.product.locations).length;
    },
    invalid_location_error() {
      return (
        this.has_location &&
        Object.values(this.product.locations).some((v) => !v.length)
      );
    },
  },
});
</script>

<style lang="scss" scoped></style>

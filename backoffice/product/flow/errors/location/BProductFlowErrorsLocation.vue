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
  <v-row
    v-if="no_location_error || invalid_location_error"
    align="center"
    :class="modern ? 'b-product-flow__alert' : 'bg-red shadow-small'"
    no-gutters
  >
    <v-list-item
      :subtitle="subtitle"
      :title="$t('product_flow.location_errors.title')"
      :base-color="modern ? undefined : '#fff'"
      class="flex-grow-1"
    >
      <template v-slot:prepend>
        <v-icon class="blink-me-linear">report</v-icon>
      </template>
      <template v-slot:append></template>
    </v-list-item>

    <div class="text-end flex-grow-1">
      <v-btn
        :to="{
          name: IS_VENDOR_PANEL
            ? 'Vendor_ProductInventoryPage'
            : 'BPageProductInventory',
        }"
        class="tnt ma-1"
        :class="{ 'sd-modern-button sd-modern-button--small': modern }"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -product me-1" size="24">
          <v-img :src="getShopImagePath($product.icon, 64)"></v-img>
        </v-avatar>

        {{ $t("product_flow.location_errors.manage_locations") }}
      </v-btn>
    </div>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BProductFlowErrorsLocation",
  components: {},
  inject: ["$shop", "$product"],

  props: { modern: { type: Boolean, default: false } },
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
        ? this.$t("product_flow.location_errors.no_location_error_subtitle")
        : this.invalid_location_error
          ? this.$t("product_flow.location_errors.invalid_location_error_subtitle")
          : "";
    },

    has_location() {
      return !!this.$product.locations;
    },
    no_location_error() {
      return (
        this.has_location && !Object.values(this.$product.locations).length
      );
    },
    invalid_location_error() {
      return (
        this.has_location &&
        Object.values(this.$product.locations).some((v) => !v.length)
      );
    },
  },
});
</script>

<style lang="scss" scoped></style>

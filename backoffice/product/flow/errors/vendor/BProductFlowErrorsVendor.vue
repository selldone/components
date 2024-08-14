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
  <!-- ⬬⬬⬬⬬ Location restriction error ⬬⬬⬬⬬ -->
  <v-row
    v-if="has_no_vendor"
    align="center"
    class="bg-red shadow-small"
    no-gutters
  >
    <v-list-item
      :title="$t('product_flow.vendor_errors.title')"
      base-color="#fff"
      class="flex-grow-1"
      :subtitle="$t('product_flow.vendor_errors.subtitle')"
    >
      <template v-slot:prepend>
        <v-icon class="blink-me-linear">report</v-icon>
      </template>
    </v-list-item>

    <div class="flex-grow-1 text-end">
      <v-btn
        v-if="!IS_VENDOR_PANEL"
        :to="{ name: 'BPageProductVendors' }"
        class="tnt ma-1"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -product me-1" size="24">
          <v-img :src="getShopImagePath(product.icon, 64)"></v-img>
        </v-avatar>
        {{ $t("product_flow.vendor_errors.manage_vendors") }}
      </v-btn>
    </div>
  </v-row>
</template>

<script>
import { defineComponent } from "vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

export default defineComponent({
  name: "BProductFlowErrorsVendor",
  components: {},
  props: {
    shop: {
      required: true,
    },
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

    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },
    has_no_vendor() {
      return (
        this.is_marketplace && !this.IS_VENDOR_PANEL && !this.vendors?.length
      );
    },
    vendor() {
      // Single vendor product mode. Vendors access only to their product in the vendor pane, so vendor is equal to product vendor!
      return this.product.vendor;
    },

    vendors() {
      // Multi vendors product mode.
      return this.product.vendors;
    },
  },
});
</script>

<style lang="scss" scoped></style>

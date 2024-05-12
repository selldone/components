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
  <!-- ⬬⬬⬬⬬ File Empty ⬬⬬⬬⬬ -->
  <v-row      v-if="isSubscription && !subscription_prices?.length" no-gutters align="center" class="bg-red shadow-small">
    <v-list-item

      base-color="#fff"
      class="flex-grow-1"
      subtitle="This product has no subscription pricing plans. You need to add at least one subscription pricing plan to make this product available for subscription purchase."
      title="Missing Subscription Pricing Plans"
    >
      <template v-slot:prepend>
        <v-icon class="blink-me-linear">report</v-icon>
      </template>
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

        Pricing Plans
      </v-btn>
    </div>
  </v-row>
</template>

<script>
import { defineComponent } from "vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default defineComponent({
  name: "BProductFlowErrorsSubscription",
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

    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },
    subscription_prices() {
      return this.product.subscription_prices;
    },
  },
});
</script>

<style lang="scss" scoped></style>

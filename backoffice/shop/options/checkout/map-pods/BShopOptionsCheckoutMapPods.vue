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
  <div class="overflow-x-auto">
    <v-row
      :style="{ minWidth: 3 * 115 + 'px' }"
      align="center"
      class="pa-9"
      justify="start"
      no-gutters
    >
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 1. Checkout ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div class="pod x-small">
        <v-icon>shopping_bag</v-icon>
        {{ $t("global.commons.checkout") }}

        <div>
          <img
            v-for="type in ProductType"
            :key="type.code"
            :src="type.basket"
            :title="$t(type.name)"
            height="14"
            width="14"
          />
        </div>
      </div>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Link ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div class="flex-grow-1 sph">
        <span class="dot -reverse"></span>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 2. Delivery ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <template v-if="has_delivery_physical || has_delivery_Service">
        <v-slide-y-transition leave-absolute>
          <div v-if="map" key="1" class="pod x-small">
            <v-icon>map</v-icon>
            Map & Auto fill address
            <div>
              <img
                v-if="has_delivery_physical"
                :src="ProductType.PHYSICAL.basket"
                :title="$t(ProductType.PHYSICAL.name)"
                height="14"
                width="14"
              />
              <img
                v-if="has_delivery_Service"
                :src="ProductType.SERVICE.basket"
                :title="$t(ProductType.SERVICE.name)"
                height="14"
                width="14"
              />
            </div>
          </div>
          <div v-else key="2" class="pod x-small">
            <v-icon>edit_location_alt</v-icon>
            Manually fill address

            <div>
              <img
                v-if="has_delivery_physical"
                :src="ProductType.PHYSICAL.basket"
                :title="$t(ProductType.PHYSICAL.name)"
                height="14"
                width="14"
              />
              <img
                v-if="has_delivery_Service"
                :src="ProductType.SERVICE.basket"
                :title="$t(ProductType.SERVICE.name)"
                height="14"
                width="14"
              />
            </div>
          </div>
        </v-slide-y-transition>
      </template>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Link ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div class="flex-grow-1 sph">
        <span class="dot -reverse"></span>
      </div>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 3. Payments ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div class="pod x-small">
        <v-icon>payments</v-icon>
        {{ $t("global.commons.payment") }}
      </div>
    </v-row>
  </div>
</template>

<script lang="ts">
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BShopOptionsCheckoutMapPods",
  props: {
    shop: { required: true },
    map: {},
  },
  data: () => ({
    ProductType: ProductType,
  }),

  computed: {
    has_delivery_physical() {
      return ShopOptionsHelper.AskShippingAddress(
        this.shop,
        ProductType.PHYSICAL.code,
      );
    },
    has_delivery_Service() {
      return ShopOptionsHelper.AskShippingAddress(
        this.shop,
        ProductType.SERVICE.code,
      );
    },
  },
};
</script>

<style scoped></style>

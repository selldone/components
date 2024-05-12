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
  <div>
    <!-- ===================== Gift card ==================== -->

    <v-row
      v-if="lottery.card_type_id"
      class="widget text-center my-3 py-3"
      no-gutters
      style="border-color: #03a9f4"
    >
      <div>
        <small>{{ $t("global.commons.gift_card") }}:</small><br />
        <span class="big-val"> {{ lottery.card_type.title }}</span>
      </div>

      <div>
        <small>{{ $t("global.commons.amount") }}:</small><br />
        <u-price
          :amount="lottery.card_type.amount"
          :currency="lottery.card_type.currency"
          large
        ></u-price>
      </div>
    </v-row>

    <!-- ===================== Product ==================== -->

    <s-shop-product-card
      v-else-if="lottery.product_id"
      :filter-variant="lottery.variant"
      :product="lottery.product"
      rounded
      class="my-3 mx-auto"
      is-insta
      style="max-width: 80%;max-height: 80%"
    />

    <!-- ===================== Discount ==================== -->

    <v-row
      v-else-if="lottery.discount"
      class="widget text-center my-3 py-3 d-flex align-center"
      no-gutters
      style="border-color: #c2185b"
    >
      <div class="w-50">
        <small>{{ $t("global.commons.discount") }}:</small><br />
        <span class="big-val"> {{ lottery.discount }}%</span>
      </div>

      <div class="w-50">
        <small>{{ $t("global.commons.discount_limit") }}:</small><br />
        <u-price
          :amount="lottery.discount_limit"
          :currency="lottery.currency"
          large
        ></u-price>
      </div>
    </v-row>

    <!-- ===================== Amount ==================== -->

    <div
      v-else-if="lottery.amount"
      class="widget text-center my-3 py-3"
      style="border-color: #689f38"
    >
      <small>{{ $t("global.commons.prize_amount") }}: </small><br />
      <u-price
        :amount="lottery.amount"
        :currency="lottery.currency"
        large
      ></u-price>
    </div>
  </div>
</template>

<script>
import SShopProductCard from "../../../storefront/product/card/SShopProductCard.vue";

export default {
  name: "SStorefrontLotteryPrizeDetail",
  components: { SShopProductCard },
  props: {
    lottery: {
      require: true,
    },
  },
};
</script>

<style scoped>
.big-val {
  font-size: 1.6rem;
}
</style>

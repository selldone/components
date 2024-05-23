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
  <s-widget
    :title="`
<span class='circle ${
      affiliate.enable ? 'bg-success' : 'bg-danger'
    } mr-sm' style='font-size: 6px;'></span>
${affiliate.name}
<small class='float-end ms-2'> @${affiliate.shop.name}</small>`"
    class="widget-hover pointer-pointer"
    custom-header
  >
    <div class="my-2 d-flex align-center">
      <v-avatar class="hover-scale avatar-gradient -thin -shop" size="24">
        <v-img :src="getShopIcon(affiliate.shop_id)" />
      </v-avatar>

      <b class="mx-2">{{ affiliate.shop.title }}</b>
      <v-spacer></v-spacer>
      <small>
        {{ getLocalTimeString(affiliate.created_at, true) }}
      </small>
    </div>

    <u-text-value-dashed>
      <template v-slot:label>
        {{ $t("global.commons.code") }}
      </template>
      {{ affiliate.code }}
    </u-text-value-dashed>

    <div class="mb-2">
      <v-icon class="me-2">link</v-icon>
      <span v-copy @click.stop
        >{{
          affiliate.shop.domain
            ? affiliate.shop.domain
            : `${window.URLS.MainServiceUrl()}/@${affiliate.shop.name}`
        }}?utm_affiliate={{ affiliate.code }}</span
      >
    </div>

    <v-row class="small" dense>
      <v-col v-if="affiliate.email">
        <v-icon>email</v-icon>
        {{ affiliate.email }}
      </v-col>
      <v-col v-if="affiliate.web">
        <v-icon>link</v-icon>
        {{ affiliate.web }}
      </v-col>
      <v-col v-if="affiliate.tel">
        <v-icon>local_phone</v-icon>
        {{ affiliate.tel }}
      </v-col>
      <v-col v-if="affiliate.address">
        <v-icon>near_me</v-icon>
        {{ affiliate.address }}
      </v-col>
      <v-col v-if="affiliate.bank">
        <v-icon>account_balance</v-icon>
        {{ affiliate.bank }}
      </v-col>
    </v-row>

    <products-dense-images-circles
      v-if="affiliate.products && Object.keys(affiliate.products).length"
      :ids="Object.keys(affiliate.products)"
    ></products-dense-images-circles>
    <span v-else>{{ $t("global.commons.apply_for_all_products") }}</span>

    <v-row class="d-flex text-center" dense justify="center">
      <v-col class="d-flex align-center" cols="12">
        <small>{{ $t("global.commons.balance") }}</small>
        <span class="dashed-flex-space"></span>
        <u-price
          :amount="affiliate.balance"
          :currency="affiliate.currency"
          class="text-success"
          x-large
        ></u-price>
      </v-col>

      <v-col
        v-if="affiliate.commission"
        class="border-end d-flex flex-column"
        cols="4"
      >
        <small>{{ $t("global.commons.per_product") }} </small>
        <v-icon color="#111">grain</v-icon>
      </v-col>
      <template v-else>
        <v-col class="border-end d-flex flex-column" cols="4">
          <small>{{ $t("global.commons.fix_commission") }} </small>
          <u-price
            :amount="affiliate.fix"
            :currency="affiliate.currency"
          ></u-price>
        </v-col>

        <v-col class="border-end d-flex flex-column" cols="4">
          <small>{{ $t("global.commons.percent_commission") }} </small>
          {{ affiliate.percent }}%
        </v-col>
      </template>

      <v-col class="d-flex flex-column" cols="4">
        <small>{{ $t("global.commons.total_payment") }} </small>
        <u-price
          :amount="affiliate.payment"
          :currency="affiliate.currency"
        ></u-price>
      </v-col>
    </v-row>
  </s-widget>
</template>

<script>
import { defineComponent } from "vue";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import UTextValueDashed from "../../../ui/text/value-dashed/UTextValueDashed.vue";

export default defineComponent({
  name: "BAffiliateCard",
  components: { UTextValueDashed, ProductsDenseImagesCircles },
  props: {
    affiliate: {
      require: true,
      type: Object,
    },
  },
});
</script>

<style lang="scss" scoped></style>

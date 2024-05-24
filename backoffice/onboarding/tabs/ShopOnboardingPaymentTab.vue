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
  <v-card color="transparent" flat>
    <v-card-text>
      <h2 class="mb-2">
        {{ $t("onboarding.payment.step1.title") }}
      </h2>

      <p class="typo-body">
        {{ $t("onboarding.payment.step1.msg") }}
      </p>

      <div>
        <v-chip v-for="item in shop.currencies" :key="item" color="transparent">
          <u-currency-icon
            :currency="item"
            class="ms-n1"
            gradient
            small
          ></u-currency-icon>

          <b class="small">{{ getCurrencyName(item) }}</b>
        </v-chip>
      </div>
      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopFinanceExchange' }"
          color="#000"

          size="x-large"
        >
          <v-icon class="me-1" size="small">currency_exchange</v-icon>

          {{ $t("onboarding.payment.step1.manage_currencies") }}
        </v-btn>
      </div>

      <hr />

      <h2 class="mt-5 mb-2">
        {{ $t("onboarding.payment.step2.title") }}
      </h2>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.payment.step2.msg") }}
        </p>

        <v-img
          :src="require('../assets/payment.svg')"
          class="m-2 imgi"

        ></v-img>
      </div>

      <div class="mb-3">
        <p class="font-weight-bold mb-1">
          {{ $t("onboarding.payment.step2.online_title") }}
        </p>
        <p>{{ $t("onboarding.payment.step2.online_msg") }}</p>
        <b-gateway-chips
          v-for="item in gateways_online"
          :key="item.id"
          :shop-gateway="item"
          class="m-1"
        >
        </b-gateway-chips>
      </div>
      <div class="widget-buttons">
        <v-btn
          v-if="!gateways_online.length"
          :to="{ name: 'BPageShopFinanceGateways' }"
          color="#000"

          size="x-large"
        >
          <v-icon class="me-1" size="small">add</v-icon>

          {{ $t("onboarding.payment.step2.add_online_gateway") }}
        </v-btn>
      </div>

      <div class="my-3">
        <p class="font-weight-bold mb-1">
          {{ $t("onboarding.payment.step2.cod_title") }}
        </p>
        <p>{{ $t("onboarding.payment.step2.cod_msg") }}</p>
        <b-gateway-chips
          v-for="item in gateways_cod"
          :key="item.id"
          :shop-gateway="item"
          class="m-1"
        >
        </b-gateway-chips>
      </div>

      <div class="my-3">
        <p class="font-weight-bold mb-1">
          {{ $t("onboarding.payment.step2.cash_title") }}
        </p>
        <p>{{ $t("onboarding.payment.step2.cash_msg") }}</p>
        <b-gateway-chips
          v-for="item in gateways_cash"
          :key="item.id"
          :shop-gateway="item"
          class="m-1"
        >
        </b-gateway-chips>
      </div>

      <div class="my-3">
        <p class="font-weight-bold mb-1">
          {{ $t("onboarding.payment.step2.dir_title") }}
        </p>
        <p>{{ $t("onboarding.payment.step2.dir_msg") }}</p>

        <b-gateway-chips
          v-for="item in gateways_dir"
          :key="item.id"
          :shop-gateway="item"
          class="m-1"
        >
        </b-gateway-chips>
      </div>

      <hr />

      <h2 class="mt-5 mb-2">
        <img
          :src="require('../../../assets/trademark/stripe.svg')"
          height="32"
        />
      </h2>
      <p class="typo-body" v-html="$t('onboarding.payment.step3.msg')"></p>

      <div class="p-3 svgs24">
        <span
          v-for="(val, key) in SVGs"
          :key="key"
          class="m-2"
          v-html="val"
        ></span>
      </div>
      <div class="widget-buttons">
        <v-btn
          :to="{ name: 'BPageShopFinanceGateways' }"
          color="#000"

          size="x-large"
        >
          <v-icon class="me-1">account_balance</v-icon>
          {{ $t("onboarding.payment.step3.my_gateways") }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import SVGs from "@selldone/core-js/enums/payment/stripe/SVGs";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import BGatewayChips from "../../gateway/chips/BGatewayChips.vue";

export default {
  name: "ShopOnboardingPaymentTab",
  components: {
    BGatewayChips,
    UCurrencyIcon,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    SVGs: SVGs,

    intro_dialog: false,
  }),

  computed: {
    last_data() {
      return this.timeSeries.lastDayData();
    },

    domains() {
      return this.shop.domains ? this.shop.domains : [];
    },
    shop_gateways() {
      return this.shop.shop_gateways;
    },
    gateways_cod() {
      return this.shop.shop_gateways.filter((i) => i.gateway.cod);
    },
    gateways_cash() {
      return this.shop.shop_gateways.filter((i) => i.gateway.cash);
    },

    gateways_dir() {
      return this.shop.shop_gateways.filter((i) => i.gateway.dir);
    },
    gateways_online() {
      return this.shop.shop_gateways.filter(
        (i) => !i.gateway.cod && !i.gateway.cash && !i.gateway.dir,
      );
    },
  },

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped></style>

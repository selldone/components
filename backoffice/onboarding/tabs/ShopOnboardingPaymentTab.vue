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
  <section v-if="modern" class="s-onboarding-payment text-start">
    <p class="s-onboarding-payment__description">
      {{ $t("onboarding.modern.payment.description") }}
    </p>

    <div class="s-onboarding-payment__rows">
      <section class="s-onboarding-payment__row">
        <div class="s-onboarding-payment__copy">
          <h3>{{ $t("onboarding.payment.step1.title") }}</h3>
          <p>{{ $t("onboarding.modern.payment.currencies_description") }}</p>
          <ul class="s-onboarding-payment__currencies">
            <li v-for="currency in shop.currencies" :key="currency">
              <u-currency-icon :currency="currency" small />
              <span>{{ currency }}</span>
              <span>{{ getCurrencyName(currency) }}</span>
            </li>
          </ul>
        </div>
        <v-btn
          :to="{ name: 'BPageShopFinanceExchange' }"
          target="_blank"
          rel="noopener noreferrer"
          :active="false"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
        >
          {{ $t("onboarding.payment.step1.manage_currencies") }}
          <v-icon end size="16">north_east</v-icon>
        </v-btn>
      </section>

      <section class="s-onboarding-payment__row">
        <div class="s-onboarding-payment__copy">
          <h3>{{ $t("onboarding.payment.step2.online_title") }}</h3>
          <p>{{ $t("onboarding.modern.payment.online_description") }}</p>
          <div v-if="gateways_online.length" class="s-onboarding-payment__gateways">
            <b-gateway-chips v-for="gateway in gateways_online.slice(0, 3)" :key="gateway.id" :shop-gateway="gateway" />
          </div>
          <details v-if="gateways_online.length > 3" class="s-onboarding-payment__more">
            <summary>{{ $t('onboarding.modern.payment.additional_gateways', { count: gateways_online.length - 3 }) }}</summary>
            <div class="s-onboarding-payment__gateways">
              <b-gateway-chips v-for="gateway in gateways_online.slice(3)" :key="gateway.id" :shop-gateway="gateway" />
            </div>
          </details>
        </div>
        <v-btn
          :to="{ name: 'BPageShopFinanceGateways' }"
          target="_blank"
          rel="noopener noreferrer"
          :active="false"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
        >
          {{ $t(gateways_online.length ? 'onboarding.modern.payment.manage_gateways' : 'onboarding.payment.step2.add_online_gateway') }}
          <v-icon end size="16">north_east</v-icon>
        </v-btn>
      </section>

      <details class="s-onboarding-payment__other">
        <summary>
          <div>
            <h3>{{ $t("onboarding.modern.payment.other_title") }}</h3>
            <p>{{ $t("onboarding.modern.payment.other_description") }}</p>
          </div>
          <v-icon size="18" aria-hidden="true">expand_more</v-icon>
        </summary>
        <section v-for="group in modernOtherGateways" :key="group.code" class="s-onboarding-payment__method">
          <h4>{{ $t(`onboarding.payment.step2.${group.code}_title`) }}</h4>
          <p>{{ $t(`onboarding.payment.step2.${group.code}_msg`) }}</p>
          <div v-if="group.gateways.length" class="s-onboarding-payment__gateways">
            <b-gateway-chips v-for="gateway in group.gateways" :key="gateway.id" :shop-gateway="gateway" />
          </div>
        </section>
        <v-btn
          :to="{ name: 'BPageShopFinanceGateways' }"
          target="_blank"
          rel="noopener noreferrer"
          :active="false"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
        >
          {{ $t("onboarding.payment.step3.my_gateways") }}
          <v-icon end size="16">north_east</v-icon>
        </v-btn>
      </details>
    </div>

    <aside class="s-onboarding-payment__note">
      <v-icon size="17" aria-hidden="true">info_outline</v-icon>
      <p>{{ $t("onboarding.modern.payment.setup_note") }}</p>
    </aside>

    <section class="s-onboarding-payment__stripe">
      <h3>
        <img :src="require('../../../assets/trademark/stripe.svg')" height="24" alt="Stripe" />
      </h3>
      <p v-html="$t('onboarding.payment.step3.msg')" />
      <div class="s-onboarding-payment__stripe-methods svgs24">
        <span v-for="(svg, key) in SVGs" :key="key" v-html="svg" />
      </div>
      <v-btn
        :to="{ name: 'BPageShopFinanceGateways' }"
        target="_blank"
        rel="noopener noreferrer"
        :active="false"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        variant="text"
      >
        <v-icon start size="17">account_balance</v-icon>
        {{ $t("onboarding.payment.step3.my_gateways") }}
        <v-icon end size="16">north_east</v-icon>
      </v-btn>
    </section>
  </section>
  <v-card v-else color="transparent" flat>
    <v-card-text>
      <u-widget-header
        :title="$t('onboarding.payment.step1.title')"
        icon="price_change"
      ></u-widget-header>

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

      <hr class="my-5" />

      <u-widget-header
        :title="$t('onboarding.payment.step2.title')"
        icon="payment"
      ></u-widget-header>

      <div class="d-flex align-center">
        <p class="typo-body flex-grow-1">
          {{ $t("onboarding.payment.step2.msg") }}
        </p>

        <v-img :src="require('../assets/payment.svg')" class="m-2 imgi"></v-img>
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
          alt="Stripe"
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

<script lang="ts">
import SVGs from "@selldone/core-js/enums/payment/stripe/SVGs";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import BGatewayChips from "../../gateway/chips/BGatewayChips.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "ShopOnboardingPaymentTab",
  mixins: [CurrencyMixin],

  components: {
    BGatewayChips,
    UCurrencyIcon,
  },
  props: {
    modern: { type: Boolean, default: false },
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
    modernOtherGateways() {
      return [
        { code: "cod", gateways: this.gateways_cod },
        { code: "cash", gateways: this.gateways_cash },
        { code: "dir", gateways: this.gateways_dir },
      ];
    },
  },

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped>
.s-onboarding-payment {
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.6;

  h3, h4 { margin: 0; font-size: 14px; font-weight: 500; line-height: 1.45; }
  p { margin: 5px 0 0; color: var(--sd-modern-muted); }
  &__description { max-width: 66ch; margin: 0 !important; }
  &__rows { margin-block-start: 18px; border-block-start: 1px solid var(--sd-modern-border); }
  &__row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px 16px;
    padding-block: 14px;
    border-block-end: 1px solid var(--sd-modern-border);

    > .v-btn { flex: 0 0 auto; }
  }
  &__copy { min-width: 0; }
  &__currencies {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;

    li { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
    li > span:last-child { color: var(--sd-modern-muted); }
  }
  &__gateways {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-start: 10px;

    :deep(.v-chip) { max-width: 100%; border: 1px solid var(--sd-modern-border); background: rgb(var(--v-theme-surface)) !important; color: rgb(var(--v-theme-on-surface)) !important; }
    :deep(.v-chip b) { font-size: 12px; font-weight: 400; }
  }
  &__other {
    border-block-end: 1px solid var(--sd-modern-border);
    padding-block: 14px;

    summary { display: flex; justify-content: space-between; align-items: center; gap: 12px; cursor: pointer; list-style: none; }
    summary::-webkit-details-marker { display: none; }
    summary > .v-icon { flex-shrink: 0; color: var(--sd-modern-muted); }
    summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; border-radius: 4px; }
    &[open] summary > .v-icon { transform: rotate(180deg); }
  }
  &__method { margin-block: 16px; }
  &__more {
    margin-block-start: 8px;
    font-size: 12px;
    color: var(--sd-modern-muted);

    summary { width: fit-content; cursor: pointer; }
    summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; border-radius: 4px; }
  }
  &__note {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-start: 18px;
    color: var(--sd-modern-muted);
    font-size: 12px;

    > .v-icon { flex: 0 0 17px; margin-block-start: 2px; }
    p { margin: 0; }
  }
  &__stripe { margin-block-start: 24px; padding-block-start: 20px; border-block-start: 1px solid var(--sd-modern-border); }
  &__stripe h3 { line-height: 1; }
  &__stripe-methods { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-block: 16px; }
  @media (max-width: 800px) {
    &__row { flex-wrap: wrap; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__other summary { min-height: 44px; }
    &__more summary { display: flex; align-items: center; min-height: 44px; }
  }
}
</style>

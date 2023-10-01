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
  <div id="payment-method-messaging-element" :title="getCountryName(countryCode)"></div>
</template>

<script>
import SetupService from "../../../../core/server/SetupService";
import { ProductType } from "../../../../core/enums/product/ProductType";

export default {
  name: "SStripeSplitPaymentInfo",
  components: {},
  props: {
    countryCode:{},
    dark: { type: Boolean },
    isFlat: { type: Boolean },
    product: {
      required: false,
      type: Object,
    },
    variant: {
      required: false,
      type: Object,
    },
    vendorProduct: {
      required: false,
      type: Object,
    },
    preferences: {},
    selectedVendorProduct: {},
    selectedSubscriptionPrice: { type: Object },

    basket: {
      required: false,
      type: Object,
    },
  },
  data: () => ({}),

  computed: {
    shop() {
      return this.getShop();
    },
    valuation() {
      return this.product.valuation;
    },

    price() {
      return this.basket
        ? this.basket.price +
            (this.basket.tax_included
              ? 0
              : this.basket
                  .tax) /*Consider basket price if product be in basket.*/
        : this.vendorProduct
        ? this.CalcPriceProductCurrentCurrency(
            this.shop,
            this.vendorProduct,
            null,
            this.preferences,
            this.valuation,
            null,
            null
          )
        : this.CalcPriceProductCurrentCurrency(
            this.shop,
            this.product,
            this.variant,
            this.preferences,
            this.valuation,
            null,
            null
          );
    },
  },
  watch: {
    price() {
      this.initExtraStripePaymentInfo();
    },
    countryCode() {
      this.initExtraStripePaymentInfo();
    },

    preferences: {
      handler() {
        this.initExtraStripePaymentInfo();
      },
      deep: true,
    },
  },
  created() {},

  mounted() {
    this.initExtraStripePaymentInfo();
  },

  methods: {
    initExtraStripePaymentInfo() {
      if (!Stripe) return;

      if (
        this.product?.type === ProductType.SUBSCRIPTION ||
        this.basket?.type === ProductType.SUBSCRIPTION
      )
        return;

      const currency = this.GetUserSelectedCurrency().code;

      const stripe_gateway = this.shop.gateways?.find(
        (g) => g.code === "stripe_" + currency.toLowerCase()
      );
      if (!stripe_gateway?.public?.key) return;

      const zeroDecimalCurrencies = [
        "BIF", // Burundian Franc
        "CLP", // Chilean Peso
        "DJF", // Djiboutian Franc
        "GNF", // Guinean Franc
        "JPY", // Japanese Yen
        "KMF", // Comorian Franc
        "KRW", // South Korean Won
        "MGA", // Malagasy Ariary
        "PYG", // Paraguayan Guaraní
        "RWF", // Rwandan Franc
        "UGX", // Ugandan Shilling
        "VND", // Vietnamese Đồng
        "VUV", // Vanuatu Vatu
        "XAF", // Central African Cfa Franc
        "XOF", // West African Cfa Franc
        "XPF", // Cfp Franc
      ];

      this.$nextTick(() => {
        const stripe = Stripe(stripe_gateway.public.key);

        const appearance = {
          theme: this.dark ? "night" : this.isFlat ? "flat" : "stripe", // can be night, stripe, flat
        };

        const elements = stripe.elements({ appearance });
        const options = {
          amount: Math.round(
            this.price * (zeroDecimalCurrencies.includes(currency) ? 1 : 100)
          ),
          currency: currency,
          paymentMethodTypes: ["klarna", "afterpay_clearpay", "affirm"],
          // the country that the end-buyer is in
          countryCode:this.countryCode?this.countryCode: this.basket?.receiver_info?.country
            ? this.basket.receiver_info.country
            : SetupService.DefaultCountry(),
        };

        const PaymentMessageElement = elements.create(
          "paymentMethodMessaging",
          options
        );
        PaymentMessageElement.mount("#payment-method-messaging-element");
      });
    },
  },
};
</script>

<style lang="scss"></style>

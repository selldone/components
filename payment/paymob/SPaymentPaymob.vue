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
  <div class="position-relative min-height-60vh my-5">
    <v-tabs v-model="tab" class="mx-n5" height="84" light stacked>
      <v-tabs-slider></v-tabs-slider>

      <v-tab
        v-for="item in tabs"
        :key="item.title"
        :tab-value="item.value"
        class="border mx-3 my-2 rounded-lg tnt"
        style="min-width: 120px"
      >
        {{ item.title }}
        <img
          :src="item.image"
          height="28"
          style="object-fit: contain"
          width="28"
        />
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item v-for="item in tabs" :key="item.title" :value="item.title">
        <v-card flat>
          <v-card-text>
            <iframe
              :src="item.url"
              :style="{ height: item.height }"
              style="border: none; border-radius: inherit"
              width="100%"
            ></iframe>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script>
export default {
  name: "SPaymentPaymob",

  props: {
    shopName: {},
    paymentToken: {
      require: true,
    },
    iframeCardId: {
      require: true,
    },
    iframeInstallmentId: {
      require: false,
    },
    iframeValuId: {
      require: false,
    },
    iframeForsaId: {
      require: false,
    },
  },
  data: () => ({
    busy: false,
    tab: "Card",
  }),
  computed: {
    card_iframe_url() {
      return (
        this.iframeCardId &&
        `https://accept.paymobsolutions.com/api/acceptance/iframes/${this.iframeCardId}?payment_token=${this.paymentToken}`
      );
    },
    installment_iframe_url() {
      return (
        this.iframeInstallmentId &&
        `https://accept.paymobsolutions.com/api/acceptance/iframes/${this.iframeInstallmentId}?payment_token=${this.paymentToken}`
      );
    },

    ValU_iframe_url() {
      return (
        this.iframeValuId &&
        `https://accept.paymobsolutions.com/api/acceptance/iframes/${this.iframeValuId}?payment_token=${this.paymentToken}`
      );
    },
    forsa_iframe_url() {
      return (
        this.iframeForsaId &&
        `https://accept.paymobsolutions.com/api/acceptance/iframes/${this.iframeForsaId}?payment_token=${this.paymentToken}`
      );
    },

    tabs() {
      const out = [];
      if (this.card_iframe_url)
        out.push({
          value: "Card",
          title: "Card",
          image: require("./assets/credit-cards.svg"),
          height: "60vh",
          url: this.card_iframe_url,
        });

      if (this.installment_iframe_url)
        out.push({
          value: "Instalment",
          title: "Instalment",
          image: require("./assets/installment.svg"),
          height: "60vh",
          url: this.installment_iframe_url,
        });

      if (this.ValU_iframe_url)
        out.push({
          value: "ValU",
          title: "ValU",
          image: require("./assets/valu.png"),
          height: "60vh",
          url: this.ValU_iframe_url,
        });
      if (this.forsa_iframe_url)
        out.push({
          value: "Forsa",
          title: "Forsa",
          image: require("./assets/forsa.png"),
          height: "60vh",
          url: this.forsa_iframe_url,
        });
      return out;
    },
  },

  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>

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
  <v-container fluid>
    <v-row class="text-start">
      <v-col cols="12">
        <h4>{{ $t("delivery_receipt.title") }}</h4>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.price") }}:</span>
        <u-price :amount="pricing.price" :currency="pricing.currency"></u-price>
      </v-col>
      <p />

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.sufficient_credit") }}:</span>
        <u-check :model-value="pricing.credit"></u-check>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.credit") }}:</span>
        <u-price
          :amount="pricing.user_credit"
          :currency="pricing.currency"
        ></u-price>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.delay") }}:</span>
        <b>
          {{ delay }}
        </b>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("delivery_receipt.has_return") }}:</span>
        <u-check :model-value="pricing.has_return"></u-check>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("delivery_receipt.cashed") }}:</span>
        <u-check :model-value="pricing.cashed"></u-check>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.sod") }}:</span>
        <u-check :model-value="pricing.pay_at_dest"></u-check>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default {
  name: "DeliveryReceiptWidget",

  props: {
    pricing: {
      required: true,
      type: Object,
    },
  },

  computed: {
    full_address() {
      return this.generateFullAddress(this.mapInfo);
    },

    location() {
      if (!this.mapInfo) return null;
      return this.mapInfo.location;
    },

    full_name() {
      if (!this.mapInfo) return null;
      return this.mapInfo.full_name;
    },
    phone() {
      if (!this.mapInfo) return null;
      return this.mapInfo.phone;
    },

    duration() {
      if (!this.pricing) return null;
      if (this.pricing.duration / 60 < 120)
        return (
          Math.round(this.pricing.duration / 60) +
          " " +
          this.$t("global.time.minutes")
        );
      return (
        Math.round(this.pricing.duration / (60 * 60)) +
        " " +
        this.$t("global.time.hours")
      );
    },

    delay() {
      if (!this.pricing) return null;
      if (this.pricing.delay / 60 < 120)
        return (
          Math.round(this.pricing.delay / 60) +
          " " +
          this.$t("global.time.minutes")
        );
      return (
        Math.round(this.pricing.delay / (60 * 60)) +
        " " +
        this.$t("global.time.hours")
      );
    },

    distance() {
      if (!this.pricing) return null;
      if (this.pricing.distance < 2000)
        return this.pricing.distance + " " + this.$t("global.distance.m");
      return (
        Math.round(this.pricing.distance / 1000) +
        " " +
        this.$t("global.distance.km")
      );
    },
  },

  watch: {},

  methods: {},
};
</script>

<style lang="scss" scoped>
h2 {
  font-size: 1.3rem;
  font-weight: 500;
}

.value {
  font-weight: 500;
  padding: 0 8px;
}
</style>

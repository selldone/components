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
        <h4>{{ $t("delivery_order.title") }}</h4>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.price") }}:</span>
        <u-price :amount="order.price" :currency="order.currency"></u-price>
      </v-col>
      <p />

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.sufficient_credit") }}:</span>
        <u-check :model-value="order.credit"></u-check>
      </v-col>
      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.duration") }}:</span>
        <b> {{ duration }}</b>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.credit") }}:</span>
        <u-price
          :amount="order.user_credit"
          :currency="order.currency"
        ></u-price>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.delay") }}:</span>
        <b>
          {{ delay }}
        </b>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("delivery_order.has_return") }}:</span>
        <u-check :model-value="order.has_return"></u-check>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("delivery_order.cashed") }}:</span>
        <u-check :model-value="order.cashed"></u-check>
      </v-col>

      <v-col cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.sod") }}:</span>
        <u-check :model-value="order.pay_at_dest"></u-check>
      </v-col>

      <v-col v-if="order.track" cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.track_order") }}:</span>
        <v-btn
          :href="order.track"
          color="blue"

          target="_blank"
          variant="flat"
        >
          <v-icon class="me-1">gps_fixed</v-icon>
          {{ $t("global.commons.track") }}
        </v-btn>
      </v-col>

      <v-col v-if="order.uid" cols="12" md="4" sm="6">
        <span>{{ $t("global.commons.code") }}:</span>
        <b>{{ order.uid }}</b>
      </v-col>

      <v-col v-if="courier" class="text-center widget" cols="12" lg="4" md="6">
        <span>{{ $t("global.commons.courier") }}:</span>

        <v-avatar v-if="courier.avatar" class="m-2" size="48">
          <v-img :src="courier.avatar" />
        </v-avatar>

        <p class="font-weight-black">{{ courier.name }}</p>
        <p v-copy>{{ courier.phone }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "DeliveryOrderWidget",

  props: {
    order: {
      required: true,
      type: Object,
    },
  },

  computed: {
    courier() {
      return this.order.courier;
    },

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
      if (!this.order) return null;
      if (this.order.duration / 60 < 120)
        return Math.round(this.order.duration / 60) + " دقیقه";
      return Math.round(this.order.duration / (60 * 60)) + " ساعت";
    },

    delay() {
      if (!this.order) return null;
      if (this.order.delay / 60 < 120)
        return Math.round(this.order.delay / 60) + " دقیقه";
      return Math.round(this.order.delay / (60 * 60)) + " ساعت";
    },

    distance() {
      if (!this.order) return null;
      if (this.order.distance < 2000) return this.order.distance + " متر";
      return Math.round(this.order.distance / 1000) + " کیلومتر";
    },
  },

  watch: {},
};
</script>

<style lang="scss" scoped></style>

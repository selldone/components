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
  <div
    :class="{ disabled: disabled, 'drop-hover': drop_over }"
    class="position-relative"
    @click="!disabled ? $emit('select') : ''"
    @dragend="drop_over = false"
    @dragleave="drop_over = false"
    @dragover="drop_over = !isOrigin"
    @drop="drop_over = false"
  >
    <u-button-circle
      v-if="!isOrigin"
      :tooltip="$t('global.actions.delete')"
      class="float-left"
      icon="clear"
      @click="$emit('clear')"
    />

    <img
      v-if="empty"
      class="center-absolute"
      height="128"
      src="../../assets/icons/destination.svg"
      width="128"
    />

    <div v-else-if="isOrigin">
      <h4>{{ title }}</h4>

      <div class="text-center py-3">
        <img height="48" src="../../assets/icons/warehouse.svg" width="48" />
      </div>

      <p>
        <small>
          <i v-if="full_name" class="fas fa-user-check text-success me-1" />
          {{ $t("global.commons.name") }}:</small
        >
        {{ full_name }}
      </p>
      <p>
        <small>
          <i
            v-if="full_address && location"
            class="fas fa-location-arrow text-success me-1"
          />
          {{ $t("global.commons.address") }}:</small
        >
        {{ full_address }}
      </p>

      <p>
        <small>
          <i v-if="phone" class="fas fa-phone text-success me-1" />

          {{ $t("global.commons.tel") }}:</small
        >
        {{ phone }}
      </p>
    </div>

    <div v-else>
      <h4>{{ title }}</h4>

      <v-row no-gutters>
        <p class="w-100">
          <small>{{ $t("global.commons.order") }}: </small>
          <b-order-button-basket
            v-if="order"
            :order="order"
            small
            variant="text"
          ></b-order-button-basket>
        </p>

        <p v-if="is_cod" class="w-100">
          <small>{{ $t("global.commons.cod") }}: </small>
          <img
            class="me-2"
            height="36"
            src="../../assets/icons/cod-payment.svg"
            width="36"
          />
          <u-price
            :amount="order.price"
            :currency="order.currency"
            :title="$t('global.commons.order_price')"
            class="text-success"
            large
          ></u-price>
        </p>

        <p v-if="order && order.delivery_price === -1" class="w-100">
          <small>{{ $t("global.commons.shipping_cost") }}: </small>
          <img
            class="me-2"
            height="36"
            src="../../assets/icons/sod.svg"
            width="36"
          />
          <span>{{ $t("global.commons.sod") }}</span>
        </p>

        <p class="w-100">
          <small>
            <i
              :class="{ 'text-success': location && mapInfo.address }"
              class="fas fa-location-arrow me-1"
            />
            {{ $t("global.commons.address") }}:</small
          >
          {{ full_address }}
        </p>

        <p class="w-50">
          <small
            ><i
              :class="{ 'text-success': full_name }"
              class="fas fa-user-check me-1"
            />
            {{ $t("global.commons.name") }}:</small
          >
          {{ full_name }}
        </p>

        <p class="w-50">
          <small>
            <i :class="{ 'text-success': phone }" class="fas fa-phone me-1" />
            {{ $t("global.commons.tel") }}:</small
          >
          {{ phone }}
        </p>

        <p class="w-50">
          <small>{{ $t("global.commons.price") }}:</small>
          <span v-if="hasPricing" class="value">
            <u-price
              :amount="pricing.price"
              :currency="pricing.currency"
            ></u-price>
          </span>
        </p>

        <p class="w-50">
          <small>{{ $t("global.commons.duration") }}:</small>
          <span v-if="duration" class="value">
            {{ duration }}
          </span>
        </p>

        <p class="w-50">
          <small>{{ $t("global.commons.priority") }}:</small>
          <span v-if="pricing" class="value">
            {{ pricing.priority }}
          </span>
        </p>

        <p class="w-50">
          <small>{{ $t("global.commons.distance") }}:</small>
          <span v-if="distance" class="value">
            {{ distance }}
          </span>
        </p>
      </v-row>
    </div>

    <u-map-geo-button v-if="location" :location="location"></u-map-geo-button>

    <v-img
      :src="require('../../assets/icons/location-placeholder.svg')"
      class="bg-drop"
    ></v-img>
  </div>
</template>

<script>
import UMapGeoButton from "../../ui/map/geo-button/UMapGeoButton.vue";
import BOrderButtonBasket from "../order/button/basket/BOrderButtonBasket.vue";
import { Basket } from "@selldone/core-js";
import BOrderButton from "@selldone/components-vue/backoffice/order/button/BOrderButton.vue";

export default {
  name: "MapLocationAddressWidget",
  components: { BOrderButton, BOrderButtonBasket, UMapGeoButton },
  props: {
    isOrigin: {
      required: false,
      type: Boolean,
      default: false,
    },

    title: {
      required: true,
      type: String,
    },

    order: {
      required: false,
      type: Object,
    },

    mapInfo: {
      required: false,
      type: Object,
    },

    pricing: {
      required: false,
      type: Object,
    },

    disabled: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    drop_over: false,
  }),
  computed: {
    empty() {
      if (this.isOrigin) return false;

      return !this.mapInfo || !Object.keys(this.mapInfo).length;
    },

    hasPricing() {
      return this.pricing && Object.keys(this.pricing).length;
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
      return this.mapInfo.name;
    },
    phone() {
      if (!this.mapInfo) return null;
      return this.mapInfo.phone;
    },

    duration() {
      if (!this.pricing || !this.pricing.hasOwnProperty("duration"))
        return null;
      if (this.pricing.duration / 60 < 120)
        return Math.round(this.pricing.duration / 60) + " min";
      return Math.round(this.pricing.duration / (60 * 60)) + " hour";
    },
    distance() {
      if (!this.pricing || !this.pricing.hasOwnProperty("distance"))
        return null;
      if (this.pricing.distance < 2000) return this.pricing.distance + " meter";
      return Math.round(this.pricing.distance / 1000) + " km";
    },

    is_cod() {
      if (!this.order) return false;
      return this.order.status === Basket.Status.COD.code;
    },
  },

  watch: {},
};
</script>

<style lang="scss" scoped>
h2 {
  font-size: 1.3rem;
  font-weight: 500;
}

.value {
  font-weight: 500;
}

.disabled {
  opacity: 0.1;
}

.bg-drop {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: none;
  pointer-events: none;
}

.drop-hover {
  .bg-drop {
    display: block;
  }
}
</style>

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
  <div :class="{ '-large': large }">
    <p class="font-weight-bold mb-2">
      {{ $t("global.basket_order_info_summery.address") }}
    </p>

    <div class="text-center">
      <v-avatar
        size="56"
        class="m-1 hover-scale force-top avatar-gradient -thin"
      >
        <img
          :src="
            userId
              ? getUserAvatar(userId)
              : require('@components/assets/icons/user.svg')
          "
        />
      </v-avatar>
    </div>

    <p class="mb-1" v-if="receiverInfo.name">
      <small>{{ $t("global.address_info.name") }}: </small>
      {{ receiverInfo.name }}
    </p>

    <p class="mb-1" v-if="receiverInfo.phone">
      <small>{{ $t("global.address_info.tel") }}: </small
      ><a class="link-dash p-0" :href="`tel:${receiverInfo.phone}`">{{
        receiverInfo.phone
      }}</a>
    </p>
    <p class="mb-1" v-if="receiverInfo.email">
      <small>{{ $t("global.address_info.email") }}: </small
      ><a class="link-dash p-0" :href="`mailto:${receiverInfo.email}`">{{
        receiverInfo.email
      }}</a>
    </p>
    <p class="mb-1" v-if="receiverInfo.country">
      <small>{{ $t("global.address_info.country") }}: </small>
      <flag :iso="receiverInfo.country" :squared="false" />
      {{ getCountryName(receiverInfo.country) }}
    </p>
    <p class="mb-1" v-if="receiverInfo.state">
      <small>{{ $t("global.address_info.state") }}: </small
      >{{ receiverInfo.state }}
      <span class="mx-2"
        ><small>{{ $t("global.address_info.city") }}: </small
        >{{ receiverInfo.city }}</span
      >
    </p>
    <p class="mb-1" v-if="receiverInfo.address">
      <small>{{ $t("global.address_info.address") }}: </small
      >{{ receiverInfo.address }}
    </p>
    <p class="mb-1" v-if="receiverInfo.no">
      <small>{{ $t("global.address_info.building_number") }}: </small
      >{{ receiverInfo.no }}
      <span class="mx-2"
        ><small>{{ $t("global.address_info.building_unit") }}: </small
        >{{ receiverInfo.unit }}</span
      >
    </p>

    <p class="mb-1" v-if="receiverInfo.postal">
      <small>{{ $t("global.address_info.postcode") }}: </small
      >{{ receiverInfo.postal }}
    </p>

    <p class="mb-1" v-if="receiverInfo.message">
      <small>{{ $t("global.address_info.note") }}: </small
      >{{ receiverInfo.message }}
    </p>

    <geo-navigation-button
      v-if="receiverInfo.location"
      :location="receiverInfo.location"
      :transportation-type="receiverInfo.type"
      :large="large"
    ></geo-navigation-button>

    <slot name="append-buttons"></slot>
  </div>
</template>

<script>
import GeoNavigationButton from "@components/map/GeoNavigationButton.vue";
export default {
  name: "receiverInfoWidget",
  components: { GeoNavigationButton },
  props: {
    userId: {
      require: true,
    },
    receiverInfo: {
      require: true,
      Type: Object,
    },
    large: {
      default: false,
      Type: Boolean,
    },
  },
};
</script>

<style scoped lang="scss">
.-large {
  font-size: 16px;
  .mb-1 {
    margin-bottom: 12px !important;
  }
}
</style>

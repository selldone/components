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
        class="m-1 hover-scale force-top avatar-gradient -thin"
        size="56"
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

    <p v-if="receiverInfo.name" class="mb-1">
      <small>{{ $t("global.address_info.name") }}: </small>
      {{ receiverInfo.name }}
    </p>

    <p v-if="receiverInfo.phone" class="mb-1">
      <small>{{ $t("global.address_info.tel") }}: </small
      ><a :href="`tel:${receiverInfo.phone}`" class="link-dash p-0">{{
        receiverInfo.phone
      }}</a>
    </p>
    <p v-if="receiverInfo.email" class="mb-1">
      <small>{{ $t("global.address_info.email") }}: </small
      ><a :href="`mailto:${receiverInfo.email}`" class="link-dash p-0">{{
        receiverInfo.email
      }}</a>
    </p>
    <p v-if="receiverInfo.country" class="mb-1">
      <small>{{ $t("global.address_info.country") }}: </small>
      <flag :iso="receiverInfo.country" :squared="false" />
      {{ getCountryName(receiverInfo.country) }}
    </p>
    <p v-if="receiverInfo.state" class="mb-1">
      <small>{{ $t("global.address_info.state") }}: </small
      >{{ receiverInfo.state }}
      <span class="mx-2"
        ><small>{{ $t("global.address_info.city") }}: </small
        >{{ receiverInfo.city }}</span
      >
    </p>
    <p v-if="receiverInfo.address" class="mb-1">
      <small>{{ $t("global.address_info.address") }}: </small
      >{{ receiverInfo.address }}
    </p>
    <p v-if="receiverInfo.no" class="mb-1">
      <small>{{ $t("global.address_info.building_number") }}: </small
      >{{ receiverInfo.no }}
      <span class="mx-2"
        ><small>{{ $t("global.address_info.building_unit") }}: </small
        >{{ receiverInfo.unit }}</span
      >
    </p>

    <p v-if="receiverInfo.postal" class="mb-1">
      <small>{{ $t("global.address_info.postcode") }}: </small
      >{{ receiverInfo.postal }}
    </p>

    <p v-if="receiverInfo.message" class="mb-1">
      <small>{{ $t("global.address_info.note") }}: </small
      >{{ receiverInfo.message }}
    </p>

    <s-geo-navigation-button
      v-if="receiverInfo.location"
      :large="large"
      :location="receiverInfo.location"
      :transportation-type="receiverInfo.type"
    ></s-geo-navigation-button>

    <slot name="append-buttons"></slot>
  </div>
</template>

<script>
import SGeoNavigationButton from "@components/map/geo-button/SGeoNavigationButton.vue";

export default {
  name: "SOrderReceiverInfoCard",
  components: { SGeoNavigationButton },
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

<style lang="scss" scoped>
.-large {
  font-size: 16px;

  .mb-1 {
    margin-bottom: 12px !important;
  }
}
</style>

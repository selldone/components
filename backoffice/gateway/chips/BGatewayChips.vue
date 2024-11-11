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
  <v-chip color="#fdfdfd" variant="flat">
    <v-img
      :class="{ 'img-grayscale': !shopGateway.enable }"
      :src="getShopImagePath(shopGateway.gateway.icon)"
      class="ms-n1"
      height="20"
      width="20"
    ></v-img>
    <b class="small ms-1">{{ shopGateway.gateway.name }}</b>

    <u-currency-icon
      :currency="shopGateway.gateway.currency"
      class="mx-1"
      small
    ></u-currency-icon>

    <v-icon
      :color="
        shopGateway.livemode && shopGateway.enable && shopGateway.gateway.enable
          ? 'green'
          : shopGateway.enable
            ? 'amber'
            : 'red'
      "
      :title="shopGateway.livemode ? 'Live' : 'Debug'"
      end
      size="small"
    >
      {{ shopGateway.livemode ? "lens" : "science" }}
    </v-icon>
  </v-chip>
</template>

<script lang="ts">
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";

export default {
  name: "BGatewayChips",
  components: { UCurrencyIcon },
  props: {
    shopGateway: {
      require: true,
    },
  },
};
</script>

<style scoped></style>

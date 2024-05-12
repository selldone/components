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
  <div class="typo-body">
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Partners License ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <!-- Stores -->
    <div v-if="showPlanStores" class="my-1">
      <v-icon class="me-1" style="color: currentColor">storefront</v-icon>

      <span
        ><b>{{ shopsCount }}</b> / {{ stores + giveaways }}</span
      >
      {{ $t("global.commons.shops") }}

      <span v-if="giveaways" class="ms-2 small" title="Giveaways">
        ( <v-icon class="me-1" size="small">celebration</v-icon>
        {{ giveaways }} )</span
      >
    </div>

    <!-- Custom domains -->
    <div v-if="false" class="my-1">
      <v-icon :color="checkColor" class="me-1">check_circle</v-icon>

      <v-icon v-if="domains >= 9999" style="color: currentColor"
        >all_inclusive
      </v-icon>
      <span v-else>{{ domains }}</span>
      {{ $t("price_list.domains") }}
    </div>

    <!-- Staff -->
    <div class="my-1">
      <v-icon :color="checkColor" class="me-1">check_circle</v-icon>

      <v-icon v-if="staff >= 9999" style="color: currentColor"
        >all_inclusive
      </v-icon>
      <span v-else>{{ staff }}</span>

      {{ $t("price_list.staff") }}
    </div>
    <!-- Fee -->
    <div v-if="fee" class="my-1">
      <v-icon :color="checkColor" class="me-1">check_circle</v-icon>

      <!--<span v-if="fee<2" class="me-1"><s style="text-decoration-thickness: 1px">{{ 2 }}%</s></span>-->
      <span>{{ fee }}%</span>

      {{ $t("global.commons.fee") }}

      <!--
      <v-chip dark color="#222" class="mx-1" small>
        <v-icon left small>arrow_downward</v-icon>
        {{fee_off}}% save</v-chip>-->
    </div>

    <!-- Community -->
    <div v-if="limits.community" class="my-1">
      <v-icon :color="checkColor" class="me-1">check_circle</v-icon>
      {{ $t("price_list.community_builder") }}
    </div>

    <!-- Marketplace -->
    <div v-if="limits.marketplace" class="my-1">
      <v-icon :color="checkColor" class="me-1">check_circle</v-icon>
      {{ $t("price_list.marketplace") }}
    </div>
  </div>
</template>

<script>
import { ShopLicense, ShopLicenseLimits } from "@selldone/core-js/enums/shop/ShopLicense";

export default {
  name: "BShopLicensePartnerOverrided",
  components: {},
  props: {
    client: {
      required: false,
      type: Object,
    },
    plan: {
      required: true,
      type: Object,
    },
    shopsCount: { default: 0 },
    showPlanStores: {
      type: Boolean,
      default: false,
    },
    checkColor: {
      default: "green",
    },
  },
  computed: {
    license_object() {
      return ShopLicense[this.plan.license];
    },
    limits() {
      return ShopLicenseLimits[this.plan.license];
    },
    domains() {
      return this.plan && this.plan.domains
        ? this.plan.domains
        : this.limits.domains;
    },
    staff() {
      return this.plan && this.plan.staff ? this.plan.staff : this.limits.staff;
    },

    stores() {
      return this.plan && this.plan.stores ? this.plan.stores : 1;
    },
    giveaways() {
      return this.client && this.client.giveaways ? this.client.giveaways : 0;
    },
    fee() {
      return this.plan && this.plan.fee
        ? this.plan.fee
        : this.license_object.wage_percent;
    },
    fee_off() {
      return this.plan && Math.round((100 * (2 - this.fee)) / 2);
    },
  },
};
</script>

<style scoped></style>

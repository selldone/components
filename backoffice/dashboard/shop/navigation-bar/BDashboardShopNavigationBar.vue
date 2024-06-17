<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <u-fade-scroll class="usn">
    <div class="d-flex align-center px-4 py-2" style="min-height: 64px">
      <div class="body-title me-3 d-flex" style="overflow: visible">
        <!-- Expert dashboard -->
        <template v-if="has_onboarding">
          <router-link
            :class="{
              'text-black font-weight-black': dashboard_query === 'setup',
            }"
            :to="{ query: { dashboard: 'setup' } }"
            class="small link"
          >
            <v-icon class="mx-1" size="small">auto_fix_high</v-icon>
            {{ !completed_setup ? $t("onboarding.name") : "" }}
          </router-link>
          <span class="mx-1">/</span>
        </template>

        <router-link
          :class="{ 'text-black font-weight-black': !dashboard_query }"
          :to="{ query: {} }"
          class="small link"
        >
          <v-icon class="mx-1" size="small">space_dashboard</v-icon>
          {{ $t("admin_shop.dashboard.title") }}
        </router-link>

        <!-- Expert dashboard -->
        <template v-if="has_contracts">
          <span class="mx-1">/</span>

          <router-link
            :class="{
              'text-black font-weight-black': dashboard_query === 'expert',
            }"
            :to="{ query: { dashboard: 'expert' } }"
            class="small link"
            >{{ $t("experts_common.contracts") }}
            <v-badge :content="contracts.length" inline color="red">

            </v-badge>
          </router-link>
        </template>

        <!-- Community dashboard -->
        <template v-if="has_community">
          <span class="mx-1">/</span>

          <router-link
            :class="{
              'text-black font-weight-black': dashboard_query === 'community',
            }"
            :to="{ query: { dashboard: 'community' } }"
            class="small link"
          >
            <v-icon class="mx-1" size="small">waving_hand</v-icon>

            {{ $t("global.commons.community") }}
          </router-link>
        </template>

        <!-- Technical dashboard -->
        <span class="mx-1">/</span>

        <router-link
          :class="{
            'text-black font-weight-black': dashboard_query === 'technical',
          }"
          :to="{ query: { dashboard: 'technical' } }"
          class="small link"
        >
          <v-icon class="mx-1" size="small">monitor_heart</v-icon>
          {{ $t("global.commons.technical") }}
        </router-link>

        <!-- Finance dashboard -->
        <span class="mx-1">/</span>

        <router-link
          :class="{
            'text-black font-weight-black': dashboard_query === 'finance',
          }"
          :to="{ query: { dashboard: 'finance' } }"
          class="small link"
        >
          <v-icon class="mx-1" size="small">savings</v-icon>
          {{ $t("global.commons.finance") }}
        </router-link>

        <!-- SEO dashboard -->
        <template v-if="shop.search_console">
          <span class="mx-1">/</span>

          <router-link
            :class="{
              'text-black font-weight-black': dashboard_query === 'seo',
            }"
            :to="{ query: { dashboard: 'seo' } }"
            class="small link"
          >
            <v-icon class="mx-1" size="small">track_changes</v-icon>
            {{ $t("global.commons.seo") }}
          </router-link>
        </template>
      </div>

      <v-spacer></v-spacer>
      <small class="absolute-top-end x-small me-7 mt-n1 hide-on-small-600"
        >{{ $t("admin_shop.dashboard.online_staff") }}
        <i class="fas fa-caret-down"></i
      ></small>

      <div class="d-flex flex-row">
        <v-tooltip
          v-for="online_staff in online_staffs"
          :key="online_staff.id"
          color="#000"
          content-class="bg-black rounded-pill"
          location="bottom"
        >
          <template v-slot:activator="{ props }">
            <v-badge bordered color="green" dot location="top end">
              <v-avatar
                class="mx-1 hover-scale-small avatar-gradient -thin -staff"
                size="32"
                v-bind="props"
              >
                <v-img :src="getUserAvatar(online_staff.id)"></v-img>
              </v-avatar>
            </v-badge>
          </template>

          <v-list-item
            :subtitle="online_staff.email"
            class="text-start my-2"
            density="compact"
          >
            <template v-slot:prepend>
              <v-avatar start :image="getUserAvatar(online_staff.id)" class="avatar-gradient -thin ">

              </v-avatar>
            </template>
            <template v-slot:title>
              <b>{{ online_staff.name }}</b>
              <v-chip class="ms-2" color="green" size="small">
                {{ $t("global.commons.online") }}
              </v-chip>
            </template>
          </v-list-item>
        </v-tooltip>
      </div>
    </div>
  </u-fade-scroll>
</template>

<script>
import { defineComponent } from "vue";
import UFadeScroll from "../../../../ui/fade-scroll/UFadeScroll.vue";

export default defineComponent({
  name: "BDashboardShopNavigationBar",
  components: { UFadeScroll },
  props: {
    shop: {
      type: Object,
      required: true,
    },
    timeSeriesShopData: {
      required: true,
      type: Object,
    },
  },
  computed: {
    dashboard_query() {
      return this.$route.query.dashboard;
    },
    has_onboarding() {
      return true;
    },
    last_data() {
      return this.timeSeriesShopData.lastDayData();
    },
    completed_setup() {
      return (
        this.last_data &&
        // Check products:
        this.last_data.total_products_physical +
          this.last_data.total_products_virtual +
          this.last_data.total_products_file +
          this.last_data.total_products_service >
          0 &&
        // Check domain:
        this.shop.domains.length &&
        // Check gateways:
        this.shop.shop_gateways &&
        this.shop.shop_gateways.length &&
        // Check delivery:
        this.shop.warehouse
      );
    },

    contracts() {
      return this.shop.contracts;
    },
    has_contracts() {
      return this.contracts && this.contracts.length;
    },

    has_community() {
      return this.shop.community && this.shop.community.enable;
    },

    online_staffs() {
      return this.shop.online_staffs;
    },
  },
});
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

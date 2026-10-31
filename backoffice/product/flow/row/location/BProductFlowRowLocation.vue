<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-row align="center" no-gutters>
    <v-list-item
      :prepend-icon="locations_count ? 'mode_of_travel' : 'public'"
      :title="
        $t(modern ? 'b_product_dashboard.flow.location_title' : 'product_flow.location.title', {
          status: locations_count
            ? $t(modern ? 'b_product_dashboard.flow.location_custom' : 'product_flow.location.status.has_restriction', {
                count: locations_count,
              })
            : $t(modern ? 'b_product_dashboard.flow.location_inherited' : 'product_flow.location.status.no_restriction'),
        })
      "
      class="flex-grow-1"
    >
      <v-list-item-subtitle v-if="shop_countries?.length">
        <span v-if="modern" class="sd-modern-status__dot sd-modern-status__dot--success" aria-hidden="true" />
        <v-icon v-else class="me-1" color="green">check_circle</v-icon>

        {{
          $t(modern ? 'b_product_dashboard.flow.store_countries' : "product_flow.location.available_countries_msg", {
            count: shop_countries.length,
            countries: shop_countries
              .map((i) => getCountryName(i))
              .join(", ")
              .limitWords(20),
          })
        }}
      </v-list-item-subtitle>
      <v-list-item-subtitle v-else-if="shop_countries">
        <span v-if="modern" class="sd-modern-status__dot sd-modern-status__dot--error" aria-hidden="true" />
        <v-icon v-else class="me-1" color="red">cancel</v-icon>
        {{ $t("product_flow.location.disable_for_all_countries_msg") }}
      </v-list-item-subtitle>

      <v-chip
        v-for="(zips, country) in locations"
        :key="country"
        class="ma-1"
        :color="modern ? undefined : '#fafafa'"
        :class="{ 'b-product-flow__location': modern }"
        size="small"
        variant="flat"
      >
        <v-avatar class="pen" start>
          <flag :iso="country" :squared="true" style="font-size: 24px" />
        </v-avatar>
        {{ getCountryName(country) }}

        <v-icon v-if="!isValidLocation(country)" color="red" end
          >warning
        </v-icon>

        <v-tooltip
          activator="parent"
          :content-class="modern ? 'sd-modern-tooltip text-start' : 'text-start'"
          :max-width="modern ? undefined : 360"
          :location="modern ? 'top' : 'bottom'"
        >
          {{ modern ? $t('b_product_dashboard.flow.available_in', { locations: zips.join(', ') }) : `Available in ${zips.join(", ")}` }}

          <div v-if="!isValidLocation(country)" class="mt-2">
            <v-icon
              v-if="!isValidLocation(country)"
              class="float-start me-1"
              color="red"
              >warning
            </v-icon>
            {{
              $t(
                "product_flow.location.location_is_not_in_permitted_shop_locations_msg",
                {
                  country: getCountryName(country),
                },
              )
            }}
          </div>
        </v-tooltip>
      </v-chip>
    </v-list-item>

    <div class="text-end flex-grow-1">
      <v-btn
        v-if="!IS_VENDOR_PANEL"
        :to="{ name: 'BPageShopSettingLocations' }"
        class="tnt ma-1"
        :class="{ 'sd-modern-button sd-modern-button--small': modern }"
        color="primary"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -shop me-1" size="24">
          <v-img :src="getShopImagePath($shop.icon, 64)"></v-img>
        </v-avatar>
        {{ $t("product_flow.location.shop_locations") }}
      </v-btn>
      <v-btn
        :to="{
          name: IS_VENDOR_PANEL
            ? 'Vendor_ProductInventoryPage'
            : 'BPageProductInventory',
        }"
        class="tnt ma-1"
        :class="{ 'sd-modern-button sd-modern-button--small': modern }"
        color="primary"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -product me-1" size="24">
          <v-img :src="getShopImagePath($product.icon, 64)"></v-img>
        </v-avatar>
        {{ $t("product_flow.location.product_locations") }}
      </v-btn>
    </div>
  </v-row>
</template>

<script lang="ts">
export default {
  name: "BProductFlowRowLocation",
  components: {},
  inject: ["$shop", "$product"],

  props: { modern: { type: Boolean, default: false } },

  data: function () {
    return {};
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    shop_countries() {
      return this.$shop.countries;
    },
    locations() {
      return this.$product.locations;
    },
    locations_count() {
      return this.locations && Object.values(this.locations).length;
    },
  },

  methods: {
    isValidLocation(country) {
      if (!this.shop_countries) return true;
      return this.shop_countries.includes(country);
    },
  },
};
</script>

<style lang="scss" scoped></style>

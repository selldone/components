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
  <v-container class="s--storefront-product-vendors-list">
    <v-row justify="start">
      <v-col
        v-for="vendor in vendors"
        :key="vendor.id"
        cols="12"
        lg="4"
        md="6"
        sm="12"
        xl="3"
      >
        <v-card
          :to="{
            name: window.$storefront.routes.SHOP_VENDOR_PAGE,
            params: { slug: slugify(vendor.name), vendor_id: vendor.id },
          }"
          class="vnd-card"
          rounded="lg"
          variant="outlined"
          @mouseenter="$emit('vendor-hover:enter', vendor)"
          @mouseleave="$emit('vendor-hover:leave', vendor)"
        >
          <v-img :aspect-ratio="2" :src="getShopImagePath(vendor.icon)"></v-img>

          <v-card-title style="min-height: 64px">
            {{ vendor.name }}
          </v-card-title>
          <v-card-subtitle style="min-height: 64px">
            {{ vendor.description?.limitWords(12) }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { debounce } from "lodash-es";

export default {
  name: "SStorefrontProductVendorsList",
  emits: ["fetch-vendors", "vendor-hover:enter", "vendor-hover:leave"],
  inject: ["$shop"],
  props: {
    locationBounds: {
      type: Array,
    },
  },

  data: () => ({
    busy: false,
    vendors: [],

    search: null,

    limit: 20,

    total: 0,
  }),

  watch: {
    //-------------------------------------------------------

    locationBounds: debounce(function (newVal, oldVal) {
      this.fetchData(false);
    }, 1500),
  },

  created() {
    this.fetchData();
  },

  methods: {
    fetchData(more = false) {
      this.busy = true;

      axios
        .get(window.XAPI.GET_VENDORS(this.$shop.name), {
          params: {
            offset: more ? this.vendors.length : 0,
            limit: this.limit,

            search: this.search,

            bounds: this.locationBounds, // Location constraints
          },
        })
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }
          this.total = data.total;

          if (more) {
            data.vendors.forEach((vendor) => {
              this.AddOrUpdateItemByID(this.vendors, vendor);
            });
          } else {
            this.vendors = data.vendors;
          }

          // Emit vendors (Used in map view show pins)
          this.$emit("fetch-vendors", {
            vendors: this.vendors,
            total: data.total,
          });
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-product-vendors-list {
  .vnd-card {
    min-height: 100%;
  }
}
</style>

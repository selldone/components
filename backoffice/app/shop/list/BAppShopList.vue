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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <v-container fluid grid-list-md>
      <v-row align="center" justify="center">
        <u-loading-ellipsis
          v-if="busy_fetch"
          css-mode
          light
        ></u-loading-ellipsis>

        <div v-else-if="!filtered_shop_apps || !filtered_shop_apps.length">
          <v-alert
            border="top"
            class="my-5"
            color="#0288D1"
            density="compact"
            elevation="2"
            type="info"
          >
            {{ $t("apps_list.nodata") }}
          </v-alert>
        </div>

        <b-app-shop-icon
          v-for="shop_app in filtered_shop_apps"
          :key="shop_app.id"
          :shop="shop"
          :shop-app="shop_app"
          :small="small"
          class="ma-2"
          @delete="DeleteItemByID(shop_apps, shop_app.id)"
        >
        </b-app-shop-icon>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import BAppShopIcon from "../../../app/shop/icon/BAppShopIcon.vue";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";

/**
 * <b-app-shop-list>
 */
export default {
  name: "BAppShopList",
  components: {ULoadingEllipsis, BAppShopIcon },
  props: {
    shop: {
      required: true,
    },
    selectedCategory: {
      required: false,
      type: String,
    },

    hasEditButton: {
      type: Boolean,
      default: false,
    },

    small: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    shop_apps: [],

    busy_fetch: false,

    categories: null,
  }),
  computed: {
    filtered_shop_apps() {
      if (!this.selectedCategory) return this.shop_apps;

      return this.shop_apps.filter((item) => {
        return item.app.category === this.selectedCategory;
      });
    },
  },

  watch: {
    "shop.id"() {
      this.fetchMyApps();
    },
  },
  created() {
    this.categories = this.$route.query.categories;
    this.fetchMyApps();
  },
  methods: {
    fetchMyApps() {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_APPS_ADMIN(this.shop.id), {
          params: {
            categories: this.categories,
          },
        })
        .then(({ data }) => {
          this.shop_apps = data.shop_apps;
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>

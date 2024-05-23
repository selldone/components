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
  <v-container class="text-center">
    <v-row
      align="center"
      class="thin-scroll"
      justify="center"
      style="min-height: 240px"
    >
      <component
        :is="link ? 'router-link' : 'div'"
        v-for="(shop, index) in shops"
        :key="shop.id"
        :class="{
          disabled:
            $route.name === 'BPageShopDashboard' &&
            getId($route.params.shop_id) === shop.id,
        }"
        :style="`animation-delay: ${30 * index}ms`"
        :to="
          link
            ? { name: linkPageName, params: { shop_id: shop.id } }
            : undefined
        "
        class="ma-3 zoomIn position-relative pointer-pointer"
        style="max-width: 96px"
        @click="$emit('select:shop', returnObject ? shop : shop.id)"
      >
        <v-card
          :color="dark ? '#222' : '#eee'"
          class="d-flex align-center justify-center rounded-2rem widget-hover position-relative"
          height="96"
          variant="outlined"
          width="96"
        >
          <img
            :src="
              shop.icon
                ? getShopImagePath(shop.icon, 96)
                : require('../../../assets/placeholders/shop/store.svg')
            "
            class="rounded-1-8rem"
            height="80"
            width="80"
            @click="selected_shop = shop.id"
          />
          <v-avatar
            :color="dark ? '#000' : '#fff'"
            class="absolute-bottom-end"
            size="30"
          >
            <v-avatar size="24">
              <v-img :src="getShopLicenseIcon(shop.license)"></v-img>
            </v-avatar>
          </v-avatar>
        </v-card>

        <v-progress-circular
          v-if="selected_shop === shop.id && hasLoading"
          class="position-absolute"
          color="blue"
          indeterminate
          size="48"
          style="top: 24px; left: 24px; z-index: 3"
        ></v-progress-circular>

        <div class="text-ellipsis">
          <v-icon
            v-if="!shop.shop_permissions || !shop.shop_permissions.length"
            :title="$t('shop_permissions.ADMIN.text')"
            class="me-1"
            color="amber"
            size="x-small"
            >fa:fas fa-crown
          </v-icon>

          <v-tooltip v-else :max-width="480" color="#111" location="bottom">
            <template v-slot:activator="{ props }">
              <v-icon class="me-1" color="#03A9F4" size="x-small" v-bind="props"
                >fa:fas fa-user
              </v-icon>
            </template>
            <div class="text-start">
              <p
                v-for="item in shop.shop_permissions"
                :key="item.level"
                class="m-1 text-ellipsis"
              >
                <img
                  :src="getShopPermissionObject(item.level).src"
                  class="me-2"
                  height="16"
                  width="16"
                />
                {{ $t(getShopPermissionObject(item.level).text) }}
                <br />
                <small>{{
                  $t(getShopPermissionObject(item.level).description)
                }}</small>
              </p>
            </div>
          </v-tooltip>

          <small>
            {{ shop.title }}
          </small>
        </div>
      </component>
    </v-row>

    <router-link
      v-if="USER() && !shops.length && home"
      :to="{ name: 'BPageShuttleShops' }"
    >
      <u-button-add
        :caption="$t('home.s1.domain_input.action')"
        class="max-width-field mx-auto"
        icon="add_business"
      >
      </u-button-add>
    </router-link>
  </v-container>
</template>

<script>
import { ShopPermissions } from "@selldone/core-js/enums/permission/ShopPermissions";
import UButtonAdd from "../../../ui/button/add/UButtonAdd.vue";

/**
 * <b-shops-abstract-list>
 */
export default {
  name: "BShopsAbstractList",
  components: { UButtonAdd },
  props: {
    link: {
      default: false,
      type: Boolean,
    },

    linkPageName: {},
    hasLoading: {
      default: true,
      type: Boolean,
    },
    returnObject: {
      default: false,
      type: Boolean,
    },
    dark: Boolean,
  },

  data() {
    return {
      selected_shop: null,
    };
  },
  computed: {
    home() {
      return this.$store.getters.getHome;
    },

    shops() {
      if (!this.home || !this.home.shops) return [];

      let i = 0;
      return this.home.shops.map((item) => {
        item.index = i++;
        return item;
      });
    },
  },

  watch: {
    $route() {
      this.selected_shop = null; //Reset at change route!
    },
  },
  created() {
    this.needHomeData();
  },
  methods: {
    getShopPermissionObject(level) {
      return ShopPermissions[level];
    },
  },
};
</script>

<style scoped></style>

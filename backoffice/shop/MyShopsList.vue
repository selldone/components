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
      justify="center"
      align="center"
      style="min-height: 240px"
      class="thin-scroll"
    >
      <component
        :is="link ? 'router-link' : 'div'"
        v-for="(shop, index) in shops"
        :key="shop.id"
        class="m-2 zoomIn position-relative pointer-pointer"
        style="max-width: 96px"
        :style="`animation-delay: ${30 * index}ms`"
        @click="$emit('select:shop', returnObject ? shop : shop.id)"
        :class="{
          disabled:
            $route.name === 'AdminShopDashboardPage' &&
            getId($route.params.shop_id) === shop.id,
        }"
        :to="
          link
            ? { name: linkPageName, params: { shop_id: shop.id } }
            : undefined
        "
      >
        <v-card
          width="96"
          height="96"
          class="d-flex align-center justify-center rounded-2rem widget-hover position-relative"
          variant="outlined" color="#999"
        >
          <img
            :src="
              shop.icon
                ? getShopImagePath(shop.icon, 96)
                : require('@components/assets/placeholders/shop/store.svg')
            "
            height="80"
            width="80"
            class="rounded-18px"
            @click="selected_shop = shop.id"
          />
          <v-avatar class="absolute-bottom-end" size="30" :color="dark?'#000':'#fff'">
            <v-avatar  size="24">
              <v-img :src="getShopLicenseIcon(shop.license)"></v-img>
            </v-avatar>
          </v-avatar>
        </v-card>

        <v-progress-circular
          v-if="selected_shop === shop.id && hasLoading"
          color="blue"
          indeterminate
          size="48"
          class="position-absolute"
          style="top: 24px; left: 24px"
        ></v-progress-circular>

        <div class="text-ellipsis">
          <v-icon
            v-if="!shop.shop_permissions || !shop.shop_permissions.length"
            size="x-small"
            color="amber"
            class="me-1"
            :title="$t('shop_permissions.ADMIN.text')"
            >fa:fas fa-crown</v-icon
          >

          <v-tooltip v-else location="bottom" :max-width="480" color="#111">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" size="x-small" color="#03A9F4" class="me-1"
                >fa:fas fa-user</v-icon
              >
            </template>
            <div class="text-start">
              <p
                v-for="item in shop.shop_permissions"
                :key="item.level"
                class="m-1 text-ellipsis"
              >
                <img
                  :src="getShopPermissionObject(item.level).src"
                  width="16"
                  height="16"
                  class="me-2"
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
      :to="{ name: 'ShopsListPage' }"
    >
      <s-add-button-green
        :caption="$t('home.s1.domain_input.action')"
        icon="add_business"
        class="max-width-field mx-auto"
      >
      </s-add-button-green>
    </router-link>
  </v-container>
</template>

<script>
import { ShopPermissions } from "@core/enums/permission/ShopPermissions";
import SAddButtonGreen from "@components/ui/button/add/SAddButtonGreen.vue";

export default {
  name: "MyShopsList",
  components: { SAddButtonGreen },
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
    dark:Boolean
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

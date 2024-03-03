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
  <v-list
    :density="$vuetify.display.smAndUp && 'compact'"
    class="s--shop-user-menu-list"
  >
    <v-list-item
      :to="{
        name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL,
      }"
      active-class="bg-primary text-white"
    >
      <template v-slot:prepend>
        <v-badge
          :content="numeralFormat(sum_orders_badges, '0a')"
          :model-value="sum_orders_badges > 0"
          color="red"
          overlap
        >
          <v-icon>history</v-icon>
        </v-badge>
      </template>

      <v-list-item-title>
        {{ $t("layout_shop.shop_menu.orders_history") }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item
      :to="{ name: window.$storefront.routes.USER_PROFILE_PAGE }"
      active-class="bg-primary text-white"
      prepend-icon="person"
    >
      <v-list-item-title>
        {{ $t("layout_shop.shop_menu.profile") }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item
      v-if="shop.community"
      :to="{ name: 'CommunityHomePage' }"
      active-class="bg-primary text-white"
      prepend-icon="forum"
    >
      <v-list-item-title>
        {{ $t("global.commons.community") }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item
      :to="{ name: window.$storefront.routes.USER_FAVORITES_PAGE }"
      active-class="bg-primary text-white"
      prepend-icon="favorite"
    >
      <v-list-item-title>
        {{ $t("layout_shop.shop_menu.favorites") }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item
      :to="{ name: window.$storefront.routes.USER_GIFTCARDS_PAGE }"
      active-class="bg-primary text-white"
      prepend-icon="card_giftcard"
    >
      <v-list-item-title>
        {{ $t("layout_shop.shop_menu.gift_cards") }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item
      :to="{
        name: window.$storefront.routes.USER_RETURN_REQUESTS,
      }"
      active-class="bg-primary text-white"
      prepend-icon="wifi_protected_setup"
    >
      <v-list-item-title>
        {{ $t("layout_shop.shop_menu.return_requests") }}
      </v-list-item-title>
    </v-list-item>

    <v-list-item
      v-if="total_items_in_carts"
      :to="{
        name: window.$storefront.routes.BASKET_PAGE,
        params: { type: current_product_type_in_basket },
      }"
      active-class="bg-primary text-white"
    >
      <template v-slot:prepend>
        <v-badge
          :content="numeralFormat(total_items_in_carts, '0a')"
          color="teal"
          overlap
        >
          <v-icon>shopping_cart</v-icon>
        </v-badge>
      </template>

      <v-list-item-title>
        {{ $t("layout_shop.shop_menu.basket") }}
      </v-list-item-title>
    </v-list-item>

    <template v-if="!navigation && shop.user_id === USER_ID()">
      <v-divider />

      <v-list-item
        :href="window.URLS.AdminShopsURL()"
        active-class="bg-primary text-white"
        target="_blank"
        prepend-icon="shop"
      >
        <v-list-item-title>
          {{ $t("layout_shop.user_menu.my_shops") }}
        </v-list-item-title>
        <v-list-item-action>
          <v-icon color="green" size="x-small">shield</v-icon>
        </v-list-item-action>
      </v-list-item>

      <v-list-item
        v-if="shop.user_id === USER_ID()"
        :href="window.URLS.AdminShopURL(shop.id)"
        active-class="bg-primary text-white"
        target="_blank"
        prepend-icon="settings"
      >
        <v-list-item-title>
          {{
            $t("layout_shop.user_menu.go_to_admin", {
              shop_name: shop.title,
            })
          }}
        </v-list-item-title>
        <v-list-item-action>
          <v-icon color="green" size="x-small">shield</v-icon>
        </v-list-item-action>
      </v-list-item>
    </template>

    <template v-if="!navigation">
      <v-divider class="mb-0" />

      <div class="text-center">
        <v-btn
          block
          class="tnt"
          color="#444"
          min-height="48"
          variant="text"
          @click="$emit('click:logout')"
        >
          {{
            $t("layout_shop.user_menu.exit_from", {
              shop_name: shop.title,
            })
          }}
          <v-icon class="ms-1" size="small"> logout</v-icon>
        </v-btn>
      </div>
    </template>
  </v-list>
</template>

<script>
export default {
  name: "SShopUserMenuList",
  components: {},
  emits: ["click:logout"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    navigation: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({}),

  computed: {
    sum_orders_badges() {
      let out = 0;
      if (!this.getOrdersState()) return out;

      this.getOrdersState().forEach((item) => {
        out += item.count;
      });

      return out;
    },

    total_items_in_carts() {
      return this.getTotalItemInBaskets();
    },
  },
};
</script>

<style scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-user-menu-list {
  padding-top: 0;
  padding-bottom: 0;
  background-color: transparent !important;
  text-align: start;
}
</style>

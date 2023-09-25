<template>
  <v-list :dense="$vuetify.breakpoint.smAndUp" class="s--shop-user-menu-list">
    <v-list-item
      :to="{
        name: 'HistoryOrdersPhysical',
      }"
      active-class="bg-primary text-white"
    >
      <v-list-item-icon>
        <v-badge
          color="red"
          overlap
          :value="sum_orders_badges > 0"
          :content="sum_orders_badges | numeralFormat('0a')"
        >
          <v-icon>history</v-icon>
        </v-badge>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ $t("layout_shop.shop_menu.orders_history") }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      :to="{ name: 'UserProfilePage' }"
      active-class="bg-primary text-white"
    >
      <v-list-item-icon>
        <v-icon>person</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ $t("layout_shop.shop_menu.profile") }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      v-if="shop.community"
      :to="{ name: 'CommunityHomePage' }"
      active-class="bg-primary text-white"
    >
      <v-list-item-icon>
        <v-icon>forum</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ $t("global.commons.community") }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      :to="{ name: 'UserFavoritesPage' }"
      active-class="bg-primary text-white"
    >
      <v-list-item-icon>
        <v-icon>favorite</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ $t("layout_shop.shop_menu.favorites") }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      :to="{ name: 'UserGiftCardsPage' }"
      active-class="bg-primary text-white"
    >
      <v-list-item-icon>
        <v-icon>card_giftcard</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ $t("layout_shop.shop_menu.gift_cards") }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      :to="{
        name: 'UserReturnRequests',
      }"
      active-class="bg-primary text-white"
    >
      <v-list-item-icon>
        <v-icon>wifi_protected_setup</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ $t("layout_shop.shop_menu.return_requests") }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      v-if="total_items_in_carts"
      :to="{
        name: 'BasketPage',
        params: { type: current_product_type_in_basket },
      }"
      active-class="bg-primary text-white"
    >
      <v-list-item-icon>
        <v-badge
          color="teal"
          overlap
          :content="total_items_in_carts | numeralFormat('0a')"
        >
          <v-icon>shopping_cart</v-icon>
        </v-badge>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ $t("layout_shop.shop_menu.basket") }}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <template v-if="!navigation && shop.user_id === USER_ID()">
      <v-divider />

      <v-list-item
        :href="window.URLS.AdminShopsURL()"
        target="_blank"
        active-class="bg-primary text-white"
      >
        <v-list-item-icon>
          <v-icon>shop</v-icon>
        </v-list-item-icon>
        <v-list-item-content class="text-start">
          <v-list-item-title>
            {{ $t("layout_shop.user_menu.my_shops") }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon color="green" x-small>shield</v-icon>
        </v-list-item-action>
      </v-list-item>

      <v-list-item
        v-if="shop.user_id === USER_ID()"
        :href="window.URLS.AdminShopURL(shop.id)"
        target="_blank"
        active-class="bg-primary text-white"
      >
        <v-list-item-icon>
          <v-icon> settings </v-icon>
        </v-list-item-icon>
        <v-list-item-content class="text-start">
          <v-list-item-title>
            {{
              $t("layout_shop.user_menu.go_to_admin", {
                shop_name: shop.title,
              })
            }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon color="green" x-small>shield</v-icon>
        </v-list-item-action>
      </v-list-item>
    </template>

    <template v-if="!navigation">
      <v-divider class="mb-0"/>

      <div class="text-center">
        <v-btn
          @click="$emit('click:logout')"
          text
          color="#444"
          class="tnt"
          block
          min-height="48"
        >
          {{
            $t("layout_shop.user_menu.exit_from", {
              shop_name: shop.title,
            })
          }}
          <v-icon class="ms-1" small> logout</v-icon>
        </v-btn>
      </div>
    </template>
  </v-list>
</template>

<script>
export default {
  name: "SShopUserMenuList",
  components: {},
  props: {
    value: {},
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
.s--shop-user-menu-list{
  padding-top: 0;
  padding-bottom: 0;
  background-color: transparent !important;
  text-align: start;

}
</style>

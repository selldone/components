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
  <!-- ―――――――――― Buttons ―――――――――― -->
  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Orders history ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

  <u-button-circle
    v-if="show_top_cart && !isMobile"
    :color="!dark ? '#333' : '#fff'"
    :to="{ name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL }"
    :tooltip="$t('global.commons.orders')"
    class="me-3 fadeIn delay_300"
    dense
    exact tile
    :src="dark?require('./assets/order-history-w.svg'):require('./assets/order-history.svg')"

  >
  </u-button-circle>

  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Basket Top Menu ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

  <u-button-circle
    v-if="show_top_cart && !isMobile"
    :badge-number="itemsCount"
    :color="!dark ? '#333' : '#fff'"
    :has-badge="itemsCount > 0"
    :tooltip="$t('basket_top_menu.basket')"
    badge-color="teal"
    class="me-3 fadeIn delay_300"
    dense
    :src="dark?require('./assets/shopping-bag-w.svg'):require('./assets/shopping-bag.svg')"
    tile
    persist-badge
    @click="show_basket = true"
  >
  </u-button-circle>

  <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Language (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
  <s-language-selector
    v-if="$shop"
    :iconColor="!dark ? '#333' : '#fff'"
    class="me-3"
    icon-only
  ></s-language-selector>

  <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select  Currency (in mobile mode) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
  <u-currency-selector
    v-if="
      /* isMobile &&*/ $shop && $shop.currencies && $shop.currencies.length > 1
    "
    :iconColor="!dark ? '#333' : '#fff'"
    :shop="$shop"
    class="me-3"
    dense
    hideDetails
    icon
    icon-only
    max-width="80px"
    outlined
    singleLine
    small
    @change="
      () => {
        onChangeUserSelectedCurrency();
      }
    "
  />

  <!-- ―――――――――― Shop Drawer ―――――――――― -->

  <teleport to="body">
    <v-navigation-drawer
      v-model="show_basket"
      :class="{ 'ma-2': show_basket }"
      :location="!$vuetify.locale.isRtl ? 'right' : undefined"
      :width="Math.min(640, window.innerWidth * 0.86)"
      class="s--storefront-primary-header-basket-navigation t-all-400"
      color="#fff"
      temporary
    >
      <div class="d-flex flex-column" style="min-height: 100%">
        <v-btn
          block
          class="tnt flex-grow-0 mb-2"
          size="x-large"
          variant="text"
          @click="show_basket = false"
          >{{ $t("global.actions.close") }}
          <v-icon class="ms-2">{{ $t("icons.long_end") }}</v-icon>
        </v-btn>

        <basket-top-menu
          ref="basket_menu"
          class="flex-grow-1"
          @close="show_basket = false"
        />
      </div>
    </v-navigation-drawer>
  </teleport>
</template>

<script lang="ts">
import SLanguageSelector from "@selldone/components-vue/storefront/language/selector/SLanguageSelector.vue";
import UCurrencySelector from "@selldone/components-vue/ui/currency/selector/UCurrencySelector.vue";
import { ShopOptionsHelper } from "@selldone/core-js";
import BasketTopMenu from "@selldone/components-vue/storefront/order/basket/BasketTopMenu.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import {EventBus} from "@selldone/core-js/events/EventBus";

export default {
  name: "SHeaderSectionButtons",
  components: {
    BasketTopMenu,
    UCurrencySelector,
    SLanguageSelector,
  },
  mixins: [TemplateMixin],
  inject: ["$shop"],

  props: {
    dark: Boolean,
  },
  data: () => ({
    show_basket: false,
  }),

  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    profile() {
      return this.user && this.user.profile;
    },

    theme() {
      if (!this.$shop) return null;
      return this.$shop.theme;
    },

    show_top_cart() {
      return this.USER() || ShopOptionsHelper.HasGuestCheckout(this.getShop());
    },
    itemsCount() {
      return this.getTotalItemInBaskets();
      /*  return this.current_basket && this.current_basket.items
            ? this.current_basket.items.length
            : 0;*/
    },
  },

  watch: {
    show_basket(value) {
      this.$store.commit("setForceHideNavigation", value);
    },
  },

  created() {},

  mounted() {
    //▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Event Bus ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆

    EventBus.$on("side-cart-menu-open", ({ open, type }) => {
      this.show_basket = open;
      if (type)
        // Select corresponding type:
        this.$refs.basket_menu.setType(type);
    });
  },
  beforeUnmount() {
    EventBus.$off("side-cart-menu-open");
  },

  methods: {},
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-primary-header-basket-navigation {
  padding: 8px;
  height: calc(100vh - 16px) !important;
  border-radius: 16px;
  border: solid thin #ddd !important;

  .v-navigation-drawer__border {
    display: none;
  }
}
</style>

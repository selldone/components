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
  <v-slide-y-reverse-transition>
    <router-link
      v-if="availableInBasketCount"
      :class="{ 'is-mobile': isMobile, '-up': bottom_nav_show }"
      :to="to"
      class="s--storefront-product-in-basket-indicator in-basket"
    >
      <p class="m-0">
        <i class="fas fa-shopping-basket me-2" />
        {{
          $t("layout_shop.item_in_basket_message", {
            count: availableInBasketCount,
          })
        }}
      </p>
    </router-link>
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "SStorefrontProductInBasketIndicator",
  mixins:[TemplateMixin],
  computed: {
    shop() {
      return this.getShop();
    },

    to() {
      return {
        name: window.$storefront.routes.BASKET_PAGE,
        params: { type: this.current_product_type_in_basket },
      };
    },

    availableInBasketCount() {
      if (
        this.$route.name !== window.$storefront.routes.PRODUCT_PAGE ||
        !this.getId(this.$route.params.product_id)
      )
        return null;

      let count = 0;
      let baskets = this.getBaskets();
      baskets.forEach((basket) => {
        if (
          basket &&
          // 🎗️ Subscription
          (basket.type !==
            ProductType.SUBSCRIPTION
              .code /*Basket for subscription doe not supported!*/ ||
            this.shop.ribbon?.cart) /*Or support cart mode for subscription*/
        )
          basket.items.forEach((item) => {
            if (
              item.product_id ===
              Number(this.getId(this.$route.params.product_id))
            )
              count += item.count;
          });
      });

      return count;
    },

    bottom_nav_show() {
      return this.$store.getters.getBottomNavShow;
    },
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

.s--storefront-product-in-basket-indicator {
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  user-select: none;
  position: fixed !important;
  border-radius: 0 !important;
  margin: 0 !important;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 80;
  color: white !important;
  font-size: 1rem;
  transition: all 0.35s linear;
  background: #2ab27b;
  min-height: 48px;

  p {
    padding: 10px;
  }

  &.is-mobile {
    p {
      font-size: 0.9rem;
      max-width: calc(100% - 80px);
    }
  }

  &:hover {
    opacity: 0.8;
  }

  &.-up {
    bottom: 92px;
    left: 8px;
    right: 8px;
    width: calc(100% - 16px);
    border-radius: 8px !important;
    border: 1px solid #249567;
    transition: all 0.35s;
  }
}
</style>

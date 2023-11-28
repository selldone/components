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
  <div v-if="cross_sells?.length" class="s--shop-product-cross-sell-list">
    <v-container fluid>
      <v-subheader> ● Order {{ product.title }} with </v-subheader>

      <fade-scroll v-model="index">
        <div class="-cards-wrap">
          <div
            v-for="cross_sell in cross_sells"
            :key="cross_sell.id"
            class="-card"
          >
            <v-avatar size="84" class="me-5" rounded
              ><img
                v-if="cross_sell.target.icon"
                :src="
                  getShopImagePath(
                    cross_sell.selected_variant?.image
                      ? cross_sell.selected_variant.image
                      : cross_sell.target.icon,
                    128
                  )
                "
              />
              <v-icon v-else>widgets</v-icon>

              <div
                v-if="cross_sell.discount && product.icon"
                class="-crossed-image"
                dir="ltr"
              >
                <v-icon class="-crossed-icon" color="#fff" small>add</v-icon>
                <v-avatar size="36" class="avatar-gradient -thin -current">
                  <img :src="getShopImagePath(product.icon, 128)" />
                </v-avatar>
              </div>
            </v-avatar>
            <div class="-content">
              <div v-if="cross_sell.message" class="mb-3">
                {{ cross_sell.message }}
              </div>
              <v-spacer></v-spacer>

              <b class="d-block">
                <router-link
                  :to="{
                    name: window.$storefront.routes.PRODUCT_PAGE,
                    params: { product_id: cross_sell.target?.id },
                  }"
                  :title="`${$t('global.actions.view_now')} ● ${cross_sell.target.title}`"
                >
                  {{ cross_sell.target.title }}
                </router-link>
              </b>

              <div class="d-flex align-center mt-2">
                <div class="d-flex flex-column me-3">
                  <price-view
                    :amount="cross_sell.target.price"
                    :currency="cross_sell.target.currency"
                    class="-price"
                  ></price-view>
                  <v-chip
                    v-if="cross_sell.discount"
                    color="#C2185B"
                    dark
                    label
                    class="pa-1"
                    small
                    ><b class="me-1">+ %{{ cross_sell.discount }}</b>
                    {{ $t("global.commons.discount_off") }}</v-chip
                  >
                </div>
                <v-spacer></v-spacer>
                <product-variants-view
                  v-if="cross_sell.target.product_variants"
                  :variants="cross_sell.target.product_variants"
                  class="mt-1 pa-0"
                  dense
                  small
                  :selected-variant="cross_sell.selected_variant"
                  @update:selected-variant="
                    (val) => {
                      cross_sell.selected_variant = val;
                      checkInBasket(cross_sell);
                      $forceUpdate();
                    }
                  "
                  selectable
                ></product-variants-view>
              </div>

              <v-spacer></v-spacer>

              <div class="text-end">
                <v-btn
                  v-if="
                    cross_sell.action ===
                      CrossSellActionType.ViewProduct.code ||
                    cross_sell.target.type === ProductType.SUBSCRIPTION.code
                  "
                  :href="getProductLink(shop,cross_sell.target_id)"
                  target="_blank"
                  depressed
                  rounded
                  class="tnt"
                  color="#eee"
                  >{{ $t("global.actions.view_now") }}
                  <v-icon right small>open_in_new</v-icon></v-btn
                >

                <v-btn
                  v-else
                  @click="addToCardCrossSelling(cross_sell)"
                  :loading="busy_add === cross_sell.target_id"
                  depressed
                  rounded
                  class="tnt"
                  :color="cross_sell.in_basket ? '#4CAF50' : '#eee'"
                  :dark="cross_sell.in_basket"
                  ><v-icon left small>{{
                    cross_sell.in_basket ? "local_mall" : "add"
                  }}</v-icon>
                  {{
                    cross_sell.in_basket
                      ? $t("global.commons.in_cart")
                      : $t("global.actions.add_to_cart")
                  }}
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </fade-scroll>
    </v-container>
  </div>
</template>

<script>
import ProductVariantsView from "@components/product/variant/ProductVariantsView.vue";
import FadeScroll from "@components/ui/fade-scroll/FadeScroll.vue";
import { BasketHelper } from "@core/helper/shop/BasketHelper";
import CrossSellActionType from "@core/enums/product/CrossSellActionType";
import {ShopOptionsHelper} from "@core/helper/shop/ShopOptionsHelper";

export default {
  name: "SShopProductCrossSellList",
  components: { FadeScroll, ProductVariantsView },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
    currentVariant: {},
  },

  data: () => ({
    index: 0,

    busy_add: null,
  }),

  computed: {
    CrossSellActionType() {
      return CrossSellActionType;
    },
    cross_sells() {
      return this.product.cross_sells;
    },
  },

  created() {
    this.cross_sells?.forEach((c) => {
      const product = c.target;
      // Autos elect a variant:
      if (product.product_variants?.length && !c.selected_variant) {
        c.selected_variant = product.product_variants[0];
        // console.log('Auto select variant',c.selected_variant)
      }

      // Check in basket:
      this.checkInBasket(c);
    });
  },
  methods: {
    /**
     * Check item is in basket or not.
     * @param cross_sell
     */
    checkInBasket(cross_sell) {
      cross_sell.in_basket = !!BasketHelper.FindItem(
        this.getBasket(cross_sell.target.type),
        cross_sell.target,
        cross_sell.selected_variant
      );
    },

    /**
     *
     * @param cross_sell
     */
    addToCardCrossSelling(cross_sell) {
      if (
          !this.USER() &&
          !ShopOptionsHelper.HasGuestCheckout(this.shop) /*🥶 Guest*/
      ) {
        this.NeedLogin();
        return;
      }

      if (cross_sell.in_basket) {
        // Just open side menu cart

        this.OpenCartSideMenu(true, cross_sell.target.type);
        return;
      }

      const product = cross_sell.target;
      const variant = cross_sell.selected_variant;

      this.busy_add = product.id;

      this.AddToBasket(
        this.shop.name,
        product,
        variant,
        1,
        (error) => {
          // ❌ Error Callback

          this.busy_add = null;
        },
        (basket) => {
          // ✅ Success Callback
          this.busy_add = null;
          this.checkInBasket(cross_sell);
          this.$forceUpdate();
          this.OpenCartSideMenu(true, basket.type);
        },
        null,
        null, // 🟣 Marketplace 🟣
        null // 🎗️ Subscription
      );
    },
  },
};
</script>

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-product-cross-sell-list {
  .-cards-wrap {
    display: flex;
    align-items: stretch;
  }
  .-card {
    border: solid thin #eee;
    display: flex;
    padding: 12px;
    width: 620px;
    min-width: 340px;
    max-width: 80%;

    min-height: 100%;
    margin: 0 12px;
    border-radius: 3px;
    text-align: start;
    background: #fff;
    align-items: center;

    .-content {
      display: flex;
      min-height: 100%;
      flex-direction: column;
      flex-grow: 1;
      a{
        color: currentColor;
        &:hover{
          color: var(--theme-info);
        }
      }
    }
    .-price {
      font-weight: 400;
      margin: 0;
      opacity: 0.8;
      min-width: 48px;
      font-size: 1.2rem;
    }

    .-crossed-image {
      position: absolute;
      bottom: 4px;
      right: 4px;
      display: flex;
      align-items: center;
      .-crossed-icon {
        bottom: 8px;
        left: 8px;
        background: #0b6aaa;
        z-index: 1;
        border-radius: 50%;
      }
    }
  }
}
</style>

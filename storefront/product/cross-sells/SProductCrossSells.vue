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
      <v-list-subheader>
        ● {{ $t("cross_selling.title", { product: product.title }) }}
      </v-list-subheader>

      <u-fade-scroll v-model="index">
        <div class="-cards-wrap">
          <div
            v-for="cross_sell in cross_sells"
            :key="cross_sell.id"
            class="-card"
          >
            <v-avatar class="me-5 align-self-start" rounded size="84"
              ><img
                v-if="cross_sell.target.icon"
                :src="
                  getShopImagePath(
                    cross_sell.selected_variant?.image
                      ? cross_sell.selected_variant.image
                      : cross_sell.target.icon,
                    128,
                  )
                "
              />
              <v-icon v-else>widgets</v-icon>

              <div
                v-if="cross_sell.discount && product.icon"
                class="-crossed-image"
                dir="ltr"
              >
                <v-icon class="-crossed-icon" color="#fff" size="small"
                  >add
                </v-icon>
                <v-avatar class="avatar-gradient -thin -current" size="36">
                  <img :src="getShopImagePath(product.icon, 128)" />
                </v-avatar>
              </div>
            </v-avatar>
            <div class="-content">
              <div v-if="cross_sell.message" class="mb-3">
                {{ cross_sell.message }}
              </div>

              <b class="d-block">
                <router-link
                  :title="`${$t('global.actions.view_now')} ● ${
                    cross_sell.target.title
                  }`"
                  :to="{
                    name: window.$storefront.routes.PRODUCT_PAGE,
                    params: { product_id: cross_sell.target?.id },
                  }"
                >
                  {{ cross_sell.target.title }}
                </router-link>
              </b>
              <v-spacer></v-spacer>

              <div class="d-flex align-center mt-2">
                <div class="d-flex flex-column me-3 ">
                  <u-price
                    :amount="cross_sell.target.price"
                    :currency="cross_sell.target.currency"
                    class="-price"
                  ></u-price>
                  <v-chip
                    v-if="cross_sell.discount"
                    class="pa-1"
                    color="#C2185B"
                    label
                    size="small"
                    variant="flat"
                    ><b class="me-1">+ %{{ cross_sell.discount }}</b>
                    {{ $t("global.commons.discount_off") }}
                  </v-chip>
                </div>
                <v-spacer></v-spacer>
                <product-variants-view
                  v-if="cross_sell.target.product_variants"
                  :selected-variant="cross_sell.selected_variant"
                  :variants="cross_sell.target.product_variants"
                  class="mt-1 pa-0"
                  dense
                  :limit="7"
                  selectable
                  small
                  @update:selected-variant="
                    (val) => {
                      cross_sell.selected_variant = val;
                      checkInBasket(cross_sell);
                      $forceUpdate();
                    }
                  "
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
                  :href="getProductLink(shop, cross_sell.target_id)"
                  class="tnt"
                  color="#eee"
                  rounded
                  target="_blank"
                  variant="flat"
                  >{{ $t("global.actions.view_now") }}
                  <v-icon end size="small">open_in_new</v-icon>
                </v-btn>

                <v-btn
                  v-else
                  :color="cross_sell.in_basket ? '#4CAF50' : '#eee'"
                  :loading="busy_add === cross_sell.target_id"
                  class="tnt"
                  rounded
                  variant="flat"
                  @click="addToCardCrossSelling(cross_sell)"
                >
                  <v-icon size="small" start
                    >{{ cross_sell.in_basket ? "local_mall" : "add" }}
                  </v-icon>
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
      </u-fade-scroll>
    </v-container>
  </div>
</template>

<script>
import ProductVariantsView from "../../../storefront/product/variant/ProductVariantsView.vue";
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import CrossSellActionType from "@selldone/core-js/enums/product/CrossSellActionType";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

export default {
  name: "SProductCrossSells",
  components: { UFadeScroll, ProductVariantsView },
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

  watch: {
    product() {
      this.autoSelectInitialVariants();
    },
  },

  created() {
    this.autoSelectInitialVariants();
  },
  methods: {
    autoSelectInitialVariants() {
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

    /**
     * Check item is in basket or not.
     * @param cross_sell
     */
    checkInBasket(cross_sell) {
      cross_sell.in_basket = !!BasketHelper.FindItem(
        this.getBasket(cross_sell.target.type),
        cross_sell.target,
        cross_sell.selected_variant,
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
        null, // 🎗️ Subscription
      );
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
    white-space: normal;

    .-content {
      display: flex;
      min-height: 100%;
      flex-direction: column;
      flex-grow: 1;

      a {
        color: currentColor;

        &:hover {
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

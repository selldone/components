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
  <div>
    <v-row
      align="center"
      justify="start"
      class="s--shop-basket-item"
      no-gutters
      dense
    >
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Product Info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <v-col
        cols="12"
        sm="12"
        md="12"
        lg="6"
        xl="6"
        class="text-start px-2 flex-grow-1"
      >
        <router-link
          :to="{
            name: window.$storefront.routes.PRODUCT_PAGE,
            params: { product_id: basketItem.product_id },
          }"
        >
          <v-img
            class="item-image rounded float-start me-2"
            height="84px"
            width="84px"
            min-height="42px"
            min-width="42px"
            aspect-ratio="1"
            :src="
              product?.icon
                ? getShopImagePath(
                    variant?.image ? variant.image : product.icon,
                    128,
                  )
                : getProductImage(basketItem.product_id)
            "
          />
        </router-link>

        <router-link
          class="shop-item-title"
          :to="{
            name: window.$storefront.routes.PRODUCT_PAGE,
            params: { product_id: basketItem.product_id },
          }"
        >
          {{ product.title }}

          <v-icon
            v-if="!product.original"
            class="ms-1"
            color="red"
            :title="$t('global.commons.fake')"
            >new_releases</v-icon
          >
        </router-link>
        <small> {{ product.title_en }}</small>
        <p class="mini-info">
          <!-- ▂▂▂▂▂▂▂▂▂▂▂ volume ▂▂▂▂▂▂▂▂▂▂▂ -->
          <span v-if="product.price_input === 'volume'"
            >{{ preferences?.dim_1 }} 🞬 {{ preferences?.dim_2 }} 🞬
            {{ preferences?.dim_3
            }}{{
              product.unit ? product.unit : $t("basket_items.items_unit")
            }}</span
          >
          <!-- ▂▂▂▂▂▂▂▂▂▂▂ area ▂▂▂▂▂▂▂▂▂▂▂ -->
          <span v-else-if="product.price_input === 'area'"
            >{{ preferences?.dim_1 }} 🞬 {{ preferences?.dim_2 }}
            {{
              product.unit ? product.unit : $t("basket_items.items_unit")
            }}</span
          >
          <!-- ▂▂▂▂▂▂▂▂▂▂▂ default ▂▂▂▂▂▂▂▂▂▂▂ -->
          <span v-else
            >{{ basketItem.count }}
            {{
              product.unit ? product.unit : $t("basket_items.items_unit")
            }}</span
          >

          <span v-if="lead_time > 0" class="mx-2">
            <i class="fas fa-hourglass small" />
            {{ lead_time }} {{ $t("basket_items.lead_unit") }}</span
          >
        </p>

        <variant-item-view-micro v-if="variant" :product-variant="variant" />

        <p class="offer" v-if="offer">
          <v-icon small color="#00a89a" class="me-1">fas fa-gift</v-icon>
          <span v-if="offer.percent !== 100">{{
            $t("basket_items.offer", {
              count: basketItem.offer_count,
              percent: offer.percent,
            })
          }}</span>
          <span v-else>{{
            $t("basket_items.offer_free", { count: basketItem.offer_count })
          }}</span>
        </p>
      </v-col>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <v-col xl="3" lg="3" md="6" sm="5" cols="6">
        <p v-if="basketItem.dis" class="discount-value">
          <price-view
            :amount="
              getBasketItemSumPriceDiscount(shop, basketItem) * basketItem.count
            "
            line-through
          ></price-view>
        </p>
        <p class="shop-item-price m-0">
          <price-view
            :amount="
              getBasketItemPrice(shop, basketItem) * basketItem.count -
              basketItem.offer_amount
            "
          ></price-view>
          <small v-if="subscription_price">/{{ subscription_period }}</small>
        </p>
        <div v-if="basketItem.cross_dis">
          <v-chip
            label
            color="green"
            dark
            small
            :title="$t('basket_page.cross_selling_discount')"
          >
            <v-icon small left>whatshot</v-icon>
            <price-view :amount="-basketItem.cross_dis"></price-view>
          </v-chip>
        </div>

        <v-flex v-if="Math.abs(price_error_percent) > 0.01">
          <p class="m-1 text-muted small">
            {{ $t("basket_items.price_changed") }}<br />

            <price-view
              class="font-weight-medium"
              :amount="current_item_price"
            ></price-view>
            <!-- Change percent labels -->
            <v-chip
              v-if="price_error_percent > 1"
              x-small
              color="red"
              dark
              label
              class="mx-2 p-1"
              ><v-icon small>arrow_drop_up</v-icon>
              {{ price_error_percent | numeralFormat("0,0") }}%</v-chip
            >
            <v-chip
              v-if="price_error_percent < -1"
              x-small
              color="green"
              dark
              label
              class="mx-2 p-1"
              ><v-icon small>arrow_drop_down</v-icon>
              {{ price_error_percent | numeralFormat("0,0") }}%</v-chip
            >
          </p>
          <v-btn
            class="mx-1"
            icon
            color="#8BC34A"
            @click="spinnerSelectAction(basketItem.count)"
          >
            <v-icon>check</v-icon>
          </v-btn>
          <v-btn
            class="mx-1"
            icon
            color="#C2185B"
            @click="spinnerSelectAction(0)"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-flex>
      </v-col>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Count ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <v-col cols="6" sm="7" md="6" lg="3" xl="3">
        <s-shop-basket-item-count-select
          :disabled="['area', 'volume'].includes(product.price_input)"
          v-model="basketItem.count"
          :max="available_quantity"
          @change="(count) => spinnerSelectAction(count)"
          :min="product?.limit_min ? product?.limit_min : 0"
          :loading="busy"
          class="my-1"
          :unit="product.unit"
          filled
          flat
          dark
          background-color="#111"
          :dense="$vuetify.breakpoint.smAndDown"
          :solo="$vuetify.breakpoint.xsOnly"
          :has-delete="$vuetify.breakpoint.smAndUp"
          @click:delete="buyRemoveAction()"
          :loading-delete="busy_delete"
        ></s-shop-basket-item-count-select>

        <p
          v-if="basketItem.count > available_quantity"
          class="m-1 text-danger small"
        ></p>
      </v-col>
    </v-row>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Service Form ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <service-order-view
      :basket="getBasket(product.type)"
      :product="product"
    ></service-order-view>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Product Input Form ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <basket-item-user-message-form
      :basket="getBasket(product.type)"
      :product="product"
      :variant-id="basketItem.variant_id"
    ></basket-item-user-message-form>
  </div>
</template>

<script>
import VariantItemViewMicro from "@components/product/variant/VariantItemViewMicro.vue";
import BasketItemUserMessageForm from "@components/order/product-input/BasketItemUserMessageForm.vue";
import { ProductType } from "@core/enums/product/ProductType";
import SShopBasketItemCountSelect from "./SShopBasketItemCountSelect.vue";
import ServiceOrderView from "@components/product/service/ServiceOrderView.vue";
import { ServiceTypes } from "@core/enums/product/ServiceTypes";
import BillingPeriod from "@core/enums/subscription/BillingPeriod";

export default {
  name: "SShopBasketItem",
  components: {
    ServiceOrderView,
    SShopBasketItemCountSelect,
    BasketItemUserMessageForm,
    VariantItemViewMicro,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    basketItem: {
      required: true,
      type: Object,
    },
  },

  data: function () {
    return {
      busy: false,
      busy_delete: false,
    };
  },
  computed: {
    product() {
      return this.basketItem.product;
    },
    variant() {
      return this.basketItem.variant;
    },
    preferences() {
      return this.basketItem.preferences;
    },

    extra_pricing() {
      return this.basketItem.extra_pricing;
    },
    subscription_price() {
      return this.basketItem.subscription_price;
    },

    offer() {
      return this.basketItem.offer;
    },

    available_quantity() {
      // File:
      if (this.product.type === ProductType.FILE.code) return 1;
      // Subscription:
      if (this.product.type === ProductType.SUBSCRIPTION.code) return 999;

      let N = this.product.quantity;

      let found_variant_original = this.variant;
      if (found_variant_original) {
        N = found_variant_original.quantity;
      }

      return N;
    },

    current_item_price() {
      // ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀
      if (this.basketItem.vendor_product) {
        return this.CalcPriceProductCurrentCurrency(
          this.shop,
          this.basketItem.vendor_product,
          null,
          this.preferences,
          this.product.valuation,
          this.subscription_price,
          this.extra_pricing, // 🌸 Add extra pricing 🌸
        );
      }

      return this.CalcPriceProductCurrentCurrency(
        this.shop,
        this.product,
        this.variant,
        this.preferences,
        this.product.valuation,
        this.subscription_price,
        this.extra_pricing, // 🌸 Add extra pricing 🌸
      );
    },

    price_error_percent() {
      if (this.is_booking) return 0; // Does not work for service!

      return (
        (100 *
          (this.current_item_price -
            this.getBasketItemPrice(this.shop, this.basketItem))) /
        (0.00001 + this.current_item_price)
      );
    },

    subscription_period() {
      return (
        this.subscription_price &&
        this.$t(BillingPeriod[this.subscription_price.period]?.title)
      );
    },

    is_booking() {
      return (
        this.product.type === ProductType.SERVICE.code &&
        this.product.outputs &&
        ServiceTypes[this.product.outputs.type]?.form.includes("booking")
      );
    },

    lead_time() {
      return this.leadProduct(this.product, this.variant);
    },
  },
  methods: {
    spinnerSelectAction(count) {
      //console.log('spinnerSelectAction',count)
      if (count) {
        this.buyAddAction(count);
      } else {
        this.buyRemoveAction();
      }
    },

    buyAddAction(count) {
      this.busy = true;
      this.AddToBasket(
        this.shop_name,
        this.product,
        this.variant,
        count,
        (error) => {
          this.busy = false;
        },
        (basket) => {
          this.busy = false;
        },
        this.preferences, // Should send! (Used for services)
        this.basketItem.vendor_product, // 🟣 Marketplace 🟣
        this.subscription_price, // 🎗️ Subscription
      );
    },

    buyRemoveAction() {
      this.busy_delete = true;

      let variant_id = this.variant ? this.basketItem.variant_id : null;

      this.RemoveFromBasket(
        this.basketItem.product_id,
        variant_id,
        (error) => {
          this.busy_delete = false;
        },
        (basket) => {
          this.busy_delete = false;
        },
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

.s--shop-basket-item {
  text-align: center;
  font-weight: 400;
  position: relative;

  //  margin: 2px 0px 10px 0px;
  padding: 6px 12px;
  min-height: 88px;

  &:hover {
    background: #fafafa;
  }

  .shop-item-title {
    display: block;
    margin: 0;
    min-height: 2em;
    cursor: pointer;
    font-weight: 500;
    color: currentColor;
  }

  .mini-info {
    font-size: 0.9em;
    color: #6c757d;
    margin: 0;
  }

  .item-image {
    cursor: pointer;
  }

  .shop-item-price {
    font-size: 1.2rem;
    font-weight: 500;
  }

  .select-order-count {
    margin-top: 8px;
    margin-left: auto;
    margin-right: auto;
    max-width: 160px;
    font-size: 20px;
  }

  .options {
    margin: 8px 6px;
    font-size: 16px;
  }

  .discount-value {
    color: #666;
  }
  .offer {
    color: #00a89a;
    font-size: 0.9rem;
    font-weight: 500;
    i {
      vertical-align: baseline;
    }
  }
}
</style>

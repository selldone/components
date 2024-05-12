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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ―――――――――― Basket Top Menu ―――――――――― -->

  <div class="shopping-basket d-flex flex-column">
    <div v-if="filtered_types.length > 1" class="text-center pt-2">
      <u-button-circle
        v-for="item in filtered_types"
        :key="item.code"
        :badge-number="getCount(item.code)"
        :disabled="!item.enable"
        :outline="type === item.code"
        :src="item.image"
        :tooltip="$t(item.name)"
        class="mb-6"
        has-badge
        persist-badge
        @click="type = item.code"
      />
    </div>

    <p v-if="!hasItemsInBasket" class="no-data text-center mt-3">
      {{ $t("basket_top_menu.basket_is_empty") }}
    </p>
    <template v-else>
      <div class="position-relative">
        <v-scale-transition group hide-on-leave origin="center">
          <div
            key="a"
            class="view-basket-btn"
            :class="{ pen: in_current_basket_page }"
            @click="
              $router.push({
                name: window.$storefront.routes.BASKET_PAGE,
                params: { type: type },
              })
            "
          >
            <h2 class="text-uppercase font-weight-medium">
              {{ $t("basket_top_menu.view_basket") }}
            </h2>

            <u-price
              :amount="total_price"
              :title="$t('basket_top_menu.total_price')"
              class="my-2"
              large
            ></u-price>
          </div>
        </v-scale-transition>

        <div
          v-if="current_basket.receiver_info?.country"
          class="text-start pa-3"
        >
          <flag
            :iso="current_basket.receiver_info.country"
            :squared="false"
            class="me-1"
          />
          <span class="me-2">{{
            getCountryName(current_basket.receiver_info.country)
          }}</span>

          {{
            MapHelper.GenerateFullAddressFromMapInfo(
              current_basket.receiver_info,
            )
          }}
        </div>
        <div style="background: #333; height: 3px" class="my-3"></div>

        <s-shop-basket-item
          v-for="(item, index) in show_items"
          :key="index"
          :basket-item="item"
          :shop="shop"
        ></s-shop-basket-item>
      </div>
      <v-spacer style="min-height: 164px"></v-spacer>

      <div>
        <s-widget-buttons auto-fixed-position>
          <v-btn
            v-if="!in_current_basket_page"
            @click="
              () => {
                $router.push({
                  name: window.$storefront.routes.BASKET_PAGE,
                  params: { type: type },
                });
                $emit('close');
              }
            "
            color="#000"
            variant="elevated"
            size="x-large"
          >
            <v-icon start>shopping_cart</v-icon>
            {{ $t("basket_top_menu.accept_and_pay") }}
          </v-btn>
        </s-widget-buttons>
      </div>
    </template>
  </div>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import SShopBasketItem from "../../../storefront/order/basket/SShopBasketItem.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BasketTopMenu",
  components: { SWidgetButtons, SShopBasketItem },
  props: {},
  data: () => ({
    menu: false,

    busy_remove: false,

    isSmallScreen: window.innerWidth < 600,

    types: ProductType,
    type: ProductType.PHYSICAL.code,
  }),
  computed: {
    MapHelper() {
      return MapHelper;
    },
    shop() {
      return this.getShop();
    },

    filtered_types() {
      return Object.values(ProductType).filter((type) => {
        return this.getCount(type.code);
      });
    },

    in_current_basket_page() {
      return (
        this.$route.name === window.$storefront.routes.BASKET_PAGE &&
        this.$route.params.type === this.type
      );
    },

    current_basket() {
      return this.getBasket(this.type);
    },

    show_items() {
      if (!this.current_basket || !this.current_basket.items) return [];
      return this.current_basket.items;
    },

    hasItemsInBasket() {
      return (
        this.current_basket &&
        this.current_basket.items &&
        this.current_basket.items.length
      );
    },

    total_price() {
      if (!this.current_basket) return 0;

      let total = 0;
      this.current_basket.items.forEach((item) => {
        total += item.count * this.getBasketItemPrice(this.shop, item);
      });
      return total;
    },
  },
  watch: {
    filtered_types() {
      this.correctType();
    },
  },

  created() {},

  methods: {
    /**
     * Externally call to set type
     * @param type
     */
    setType(type) {
      this.type = type;
    },
    correctType() {
      if (
        this.filtered_types.length &&
        !this.filtered_types.includes(this.type)
      ) {
        this.type = this.filtered_types[0].code;
      }
      //console.log('---correctType---','type',this.type)
    },

    getCount(type) {
      let basket = this.getBasket(type);
      return basket && basket.items ? basket.items.length : 0;
    },

    deleteItemFromBasket(item) {
      this.busy_remove = item.id;

      let variant_id = item.variant ? item.variant_id : null;

      this.RemoveFromBasket(
        item.product_id,
        variant_id,
        (error) => {
          this.busy_remove = null;
        },
        (basket) => {
          this.busy_remove = null;
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.shopping-basket {
  font-size: 0.857rem;
  font-weight: 500;
  //background: #fff;
  user-select: none;

  /*
  border-style: solid;
  border-width: 4px;
  border-color: #eee;*/
  text-align: end;

  .no-data {
    color: #6c757d;
    padding: 16px 4px;
  }

  .view-basket-btn {
    border-radius: 0;
    position: relative;
    cursor: pointer;
    text-align: start;
    padding: 8px 12px;
    align-items: center;

    transition: background-color 0.3s ease-in-out;

    &:hover {
      background: #f3f3f3;
    }

    .cap {
    }
  }

  .more-items-btn {
    color: #4d90fe;
    cursor: pointer;
    text-align: center;
    padding: 12px 12px;
    transition: background-color 0.3s ease-in-out;

    &:hover {
      background: #f3f3f3;
    }
  }
}

.shop-basket-btn {
  font-weight: 400;
  border-radius: 8px;

  .items-count {
    color: #fff;
  }
}
</style>

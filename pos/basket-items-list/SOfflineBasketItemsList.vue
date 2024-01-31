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
  <v-fade-transition group>
    <v-list-item
      v-for="(item, index) in items"
      :key="index"
      class="text-start row-hover border-bottom flex-wrap"
      style="cursor: default"
      dense
    >
      <v-list-item-avatar class="rounded-lg">
        <v-img
          :src="
            item.product.icon
              ? getShopImagePath(
                  item.variant?.image ? item.variant?.image : item.product.icon,
                  64
                )
              : getProductImage(item.product_id)
          "
          @click="goToProduct(item.product_id)"
        />
      </v-list-item-avatar>

      <v-list-item-content
        class=""
        :class="{ 'col-9 col-sm-4 col-md-3 col-lg-4 constrained': !viewOnly }"
      >
        <v-list-item-title class="ptitle">
          <component
            :is="!viewOnly ? 'router-link' : 'div'"
            :to="{
              name: 'BPageProductDashboard',
              params: { product_id: item.product.id },
            }"
            class="text-dark"
          >
            {{ item.product.title?.limitWords(7) }}

            <v-chip
              outlined
              v-if="!item.product.original"
              color="red"
              class="m-1 text-uppercase px-2"
              x-small
              pill
              >{{ $t("global.commons.fake") }}</v-chip
            >
            <v-chip
              outlined
              v-if="
                conditionObject(item.product.condition) &&
                item.product.condition !== ProductCondition.NEW.code
              "
              x-small
              class="m-1 text-uppercase px-2"
              pill
              >{{ $t(conditionObject.title) }}</v-chip
            >
          </component>
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ item.product.title_en?.limitWords(14) }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <variant-item-view-micro
            v-if="item.variant"
            :product-variant="item.variant"
          />
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-content
        v-if="viewOnly"
        style="max-width: max-content"
        class="text-center px-2 col-2 col-sm-4"
      >
        <b>{{ item.count }}</b>
      </v-list-item-content>

      <v-list-item-content
        v-if="!viewOnly"
        class="col-5 col-sm-3 col-md-3 col-lg-3"
      >
        <s-shop-basket-item-count-select
          v-model="item.count"
          :max="availableQuantity(item)"
          @change="(count) => spinnerSelectAction(item, count)"
          :min="0"
          :loading="busyAdd === item.product_id + '-' + item.variant_id"
          no-unit
          dark
          background-color="#111"
          filled
        ></s-shop-basket-item-count-select>
      </v-list-item-content>

      <v-list-item-content
        class="text-left px-3 col-5 col-sm-2 col-md-3 col-lg-3"
      >
        <div v-if="item.dis" class="text-muted">
          <price-view :amount="item.dis * item.count" line-through></price-view>
        </div>
        <div class="price">
          <price-view :amount="item.price * item.count"></price-view>
        </div>
      </v-list-item-content>

      <v-spacer v-if="!viewOnly"></v-spacer>

      <v-list-item-action v-if="!viewOnly" class="text-center m-0">
        <v-btn
          icon
          @click.stop="$emit('delete', item.id)"
          :loading="busyDelete === item.id"
          :caption="$t('global.actions.delete')"
          class="sub-caption -hover b-12px"
        >
          <v-icon> close </v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
  </v-fade-transition>
</template>

<script>
import VariantItemViewMicro from "@components/product/variant/VariantItemViewMicro.vue";
import { ProductType } from "@core/enums/product/ProductType";
import { ProductCondition } from "@core/enums/product/ProductCondition";
import SShopBasketItemCountSelect from "../../storefront/order/basket/SShopBasketItemCountSelect.vue";

export default {
  name: "SOfflineBasketItemsList",
  components: { SShopBasketItemCountSelect, VariantItemViewMicro },
  props: {
    basket: {
      required: true,
      type: Object,
    },
    busyDelete: {},
    busyAdd: {},
    viewOnly: {
      type: Boolean,
      default: false,
    },
  },

  data: function () {
    return {
      ProductCondition: ProductCondition,
    };
  },
  computed: {
    items() {
      return this.basket.items;
    },
  },
  methods: {
    conditionObject(condition) {
      return Object.values(ProductCondition).find(
        (item) => item.code === condition
      );
    },

    availableQuantity(basket_item) {
      // File:
      if (basket_item.product.type === ProductType.FILE.code) return 1;

      let N = basket_item.product.quantity;

      let found_variant_original = basket_item.variant;
      if (found_variant_original) {
        N = found_variant_original.quantity;
      }

      return N;
    },

    // ========== Actions ===========

    spinnerSelectAction(item, count) {
      //console.log("count : " + count);

      if (count) {
        this.$emit("add", {
          product_id: item.product_id,
          variant_id: item.variant_id,
          count,
        });
      } else {
        this.$emit("delete", item.id);
      }
    },
    orderCounts(product_item) {
      let N = Math.min(this.availableQuantity(product_item), 20);

      let foo = [];
      for (let i = 0; i <= N; i++) {
        foo.push(i);
      }
      return foo;
    },
  },
};
</script>

<style scoped lang="scss">
.price {
  font-weight: 600;
  font-size: 1.1rem;
}
.ptitle {
  font-size: 0.8rem;
  font-weight: 500;
  text-overflow: ellipsis;
  line-height: normal;
  white-space: normal;

  @media only screen and (max-width: 1280px) {
    font-size: 0.76rem;
  }

  @media only screen and (max-width: 960px) {
    font-size: 0.86rem;
  }
}

@media only screen and (max-width: 1530px) and (min-width: 1263px) {
  .constrained {
    max-width: 130px;
  }
}
</style>

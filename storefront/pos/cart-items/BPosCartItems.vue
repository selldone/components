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
      density="compact"
      style="cursor: default"
      lines="two"
    >
      <template v-slot:prepend>
        <v-avatar rounded="lg" variant="outlined" color="#eee">
          <v-img
            :src="
              item.product.icon
                ? getShopImagePath(
                    item.variant?.image
                      ? item.variant?.image
                      : item.product.icon,
                    64,
                  )
                : getProductImage(item.product_id)
            "
            @click="goToProduct(item.product_id)"
          />
        </v-avatar>
      </template>

      <v-row no-gutters align="center">
        <v-col
            cols="12"
            sm="6"
            md="6"

          :class="{ 'constrained': !viewOnly }"
        >
          <v-list-item-title class="ptitle">
            <component
              :is="!viewOnly ? 'router-link' : 'div'"
              :to="isAffiliatePos?{}:{
                name: 'BPageProductDashboard',
                params: { product_id: item.product.id },
              }"
              class="text-dark"
            >
              <b>{{ item.product.title?.limitWords(7) }}</b>

              <v-chip
                v-if="!item.product.original"
                class="m-1 text-uppercase px-2"
                color="red"
                pill
                size="x-small"
                variant="outlined"
                >{{ $t("global.commons.fake") }}
              </v-chip>
              <v-chip
                v-if="
                  conditionObject(item.product.condition) &&
                  item.product.condition !== ProductCondition.NEW.code
                "
                class="m-1 text-uppercase px-2"
                pill
                size="x-small"
                variant="outlined"
                >{{ $t(conditionObject.title) }}
              </v-chip>
            </component>
          </v-list-item-title>

          <v-list-item-subtitle class="small">
            {{ item.product.title_en }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <variant-item-view-micro
              v-if="item.variant"
              :product-variant="item.variant"
            />
          </v-list-item-subtitle>
        </v-col>

        <v-col
          class="text-center px-2 v-col-2 v-col-sm-4"
          cols="6"
          sm="4"
          md="3"
        >
          <b  v-if="viewOnly">{{ item.count }}</b>


            <s-shop-basket-item-count-select
                v-else
                v-model="item.count"
                :loading="busyAdd === item.product_id + '-' + item.variant_id"
                :max="availableQuantity(item)"
                :min="0"
                background-color="#111"
                dark
                filled
                no-unit
                @change="(count) => spinnerSelectAction(item, count)"
                rounded="lg"

            ></s-shop-basket-item-count-select>

        </v-col>



        <v-col
            cols="6"
            sm="2"
            md="3"


            class="text-left px-3">
          <div v-if="item.dis" class="text-muted">
            <price-view
              :amount="item.dis * item.count"
              line-through
            ></price-view>
          </div>
          <div class="price">
            <price-view :amount="item.price * item.count"></price-view>
          </div>
        </v-col>
      </v-row>

      <template v-slot:append>
        <v-list-item-action v-if="!viewOnly" class="text-center m-0">
          <v-btn
            :title="$t('global.actions.delete')"
            :loading="busyDelete === item.id"
            icon variant="text"
            @click.stop="$emit('delete', item.id)"
          >
            <v-icon> close</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-fade-transition>
</template>

<script>
import VariantItemViewMicro from "@components/storefront/product/variant/VariantItemViewMicro.vue";
import { ProductType } from "@core/enums/product/ProductType";
import { ProductCondition } from "@core/enums/product/ProductCondition";
import SShopBasketItemCountSelect from "../../order/basket/SShopBasketItemCountSelect.vue";

export default {
  name: "BPosCartItems",
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
    isAffiliatePos:Boolean
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
        (item) => item.code === condition,
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

<style lang="scss" scoped>
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

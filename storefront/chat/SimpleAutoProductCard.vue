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
    <component :is="to?'router-link':'div'" :to="to" :target="target"  v-if="product" class="widget widget-hover" @click="$emit('click')">
      <v-img
        width="100%"
        height="96"
        :src="getShopImagePath(product.icon)"
        :contain="isImageContain"
      >
      </v-img>
      <p class="font-weight-bold mt-1">{{ product.title }}</p>

      <p v-if="discount > 0">
        <price-view
          :amount="price + discount"
          class="discount-price text-muted"
          line-through
        ></price-view>

        <v-chip small color="red" dark class="mx-1 float-end"
          >{{ discount_percent  }} %
        </v-chip>
      </p>
      <p class="mt-2">
        <price-view :amount="price"></price-view>
      </p>

      <product-variants-view
        v-if="hasVariant"
        class="p-0"
        :variants="product.variants"
        small
        dense
      />

      <div v-if="badge || loading" class="blue-badge absolute-top-end">
        <v-progress-circular v-if="loading" indeterminate color="#fff">
        </v-progress-circular>
        <span v-else>{{ badge }}</span>
      </div>
    </component>

    <v-skeleton-loader
      v-else-if="busy"
      class="mx-auto mt-2 shadow-paper bg-white"
      min-height="120"
      type="card"
    ></v-skeleton-loader>

    <v-alert v-if="error_msg" type="error" color="red" dense>
      {{error_msg}}
    </v-alert>
  </div>
</template>

<script>
import ProductVariantsView from "@components/product/variant/ProductVariantsView.vue";

export default {
  name: "SimpleAutoProductCard",
  components: { ProductVariantsView },
  props: {
    // ------------ MOde Auto Fetch --------------

    shop: {
      require: true,
    },
    productId: {
      required: true,
    },

    badge: {},
    loading: {},
    target:{},
    to:{},


  },
  data() {
    return {
      busy: false,
      product: null,
      error_msg:null
    };
  },

  computed: {
    hasVariant() {
      return this.product.variants && this.product.variants.length;
    },

    price() {
      if (!this.product) return 0;

      return this.CalcPriceProductCurrentCurrency(this.shop, this.product, null);
    },
    discount_percent() {
      return this.discountProductPercent(this.shop, this.product, null);
    },

    discount() {
      return this.getProductDiscountAmount(this.shop, this.product, null);
    },
    isImageContain() {
      return this.product.style && this.product.style.contain;
    },
  },

  created() {
      this.busy = true;
      this.error_msg=null;

      axios
        .get(window.XAPI.GET_PRODUCT_INFO_CARD(this.shop.name, this.productId))
        .then(({ data }) => {
          if (!data.error) {
            this.product=data.product
          } else {
            this.showErrorAlert(null, data.error_msg);
            this.error_msg=data.error_msg;

          }
        })
        .catch((e) => {
          this.showLaravelError(e);
          this.error_msg='Product not found!';

        })
        .finally(() => {
          this.busy = false;
        });

  },
};
</script>

<style scoped lang="scss">
.widget {
  text-align: start;
  min-height: 100%;
  cursor: pointer;
  p {
    margin: 0;
    min-height: 21px;
  }
}
</style>

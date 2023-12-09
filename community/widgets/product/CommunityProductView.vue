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
  <!-- ---------------- Product Info ---------------- -->
  <div class="position-relative mh200 hide-scroll">
    <s-shop-product-main-card
      v-if="product && !busy"
      :product="product"
      :can-buy="product.shop_id === community.shop_id"
      show-cover
      vertical
      class="blur-animate"
      :class="{ 'blured-lg pointer-event-none': show_spec }"
    >
      <template slot="top-buttons">
        <div
          v-if="spec_array && spec_array.length"
          key="sp"
          class="widget-hover rounded-18px pointer-pointer p-2 widget text-center ms-2"
          @click="show_spec = !show_spec"
        >
          <v-img
            height="42"
            width="64"
            contain
            :src="require('@components/assets/icons/spec.svg')"
            class="mx-auto"
          ></v-img>
          <small>Spec</small>
        </div>
      </template>
    </s-shop-product-main-card>

    <v-skeleton-loader
      v-else-if="busy"
      class="mx-auto"
      max-width="300"
      type="card"
    ></v-skeleton-loader>

    <product-spec-view
      v-if="show_spec"
      :spec="spec_array"
      class="position-absolute w-100 h-100 bg-white overflow-y-auto"
      style="top: 0; left: 0; z-index: 10; opacity: 0.96"
    ></product-spec-view>

    <v-btn
      v-if="show_spec"
      class="absolute-top-end z99"
      @click="show_spec = false"
      large
      icon
      ><v-icon class="me-1">close</v-icon></v-btn
    >
  </div>
</template>

<script>
import SShopProductMainCard from "@components/product/info/SShopProductMainCard.vue";
import { SpecHelper } from "@core/helper/product/SpecHelper";
import {GtagEcommerce} from "@components/plugins/gtag/GtagEcommerce";
import ProductSpecView from "@components/storefront/product/spec/ProductSpecView.vue";

export default {
  name: "CommunityProductView",
  components: { ProductSpecView, SShopProductMainCard },
  props: {
    shop: {
      require: true,
      type: Object,
    },

    community: {
      require: true,
      type: Object,
    },

    productId: {},
  },

  data: () => ({
    busy: false,

    show_spec: false,

    //-------------------

    product: null,
    spec_array: null,
  }),

  watch: {
    productId() {
      this.getProductInfo(this.productId);
    },
  },

  computed: {},

  created() {
    if(this.productId)
    this.getProductInfo(this.productId);
  },

  methods: {
    //------------------------------------------------------------------

    getProductInfo(product_id) {

      // No change:
      if (this.product && this.product.id === product_id) return;

      this.product = null;
      this.spec_array = null;
      this.show_spec = false;

      if(!product_id)return;


      this.busy = true;


      axios
        .get(window.XAPI.GET_PRODUCT_INFO(this.shop.name, product_id), {
          params: {
            no_article: true,
          },
        })
        .then(({ data }) => {


          if(data.error){
            this.showErrorAlert(null,data.error_msg)
            return;
          }

          this.product = data.product;

          if (Array.isArray(this.product.spec))
            this.spec_array = this.product.spec;
          //Old version:
          else
            this.spec_array = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
              this.product.spec,
              this.product.spec_order
            );
          GtagEcommerce.MeasuringViewsOfProductDetails(
            this.shop,
            data.product,
              this.GetUserSelectedCurrency().code,
            "quick-view"
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>

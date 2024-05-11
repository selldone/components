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

<template>
  <!-- ---------------- Product Info ---------------- -->
  <div class="position-relative mh200 hide-scroll">
    <div v-if="product && !busy">
      <s-product-overview
        :can-buy="product.shop_id === community.shop_id"
        :product="product"
        class="blur-animate"
        show-cover
        vertical
      >
      </s-product-overview>

      <v-expansion-panels
        v-if="spec_array && Object.keys(spec_array).length > 0"
      >
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title>
            <div>
              <v-icon class="me-1">bubble_chart</v-icon>
              <b>{{ $t("product.spec") }} </b>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <b-product-spec-table :spec="spec_array"></b-product-spec-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <v-skeleton-loader
      v-else-if="busy"
      class="mx-auto"
      max-width="300"
      type="card"
    ></v-skeleton-loader>
  </div>
</template>

<script>
import SProductOverview from "@components/storefront/overview/SProductOverview.vue";
import { SpecHelper } from "@selldone/core-js/helper/product/SpecHelper.ts";
import { GtagEcommerce } from "@components/plugins/gtag/GtagEcommerce.ts";
import BProductSpecTable from "@components/storefront/product/spec/table/BProductSpecTable.vue";

export default {
  name: "CProductView",
  components: { BProductSpecTable, SProductOverview },
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
    if (this.productId) this.getProductInfo(this.productId);
  },

  methods: {
    //------------------------------------------------------------------

    getProductInfo(product_id) {
      // No change:
      if (this.product && this.product.id === product_id) return;

      this.product = null;
      this.spec_array = null;

      if (!product_id) return;

      this.busy = true;

      axios
        .get(window.XAPI.GET_PRODUCT_INFO(this.shop.name, product_id), {
          params: {
            no_article: true,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          this.product = data.product;

          if (Array.isArray(this.product.spec))
            this.spec_array = this.product.spec;
          //Old version:
          else
            this.spec_array = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
              this.product.spec,
              this.product.spec_order,
            );
          GtagEcommerce.MeasuringViewsOfProductDetails(
            this.shop,
            data.product,
            this.GetUserSelectedCurrency().code,
            "quick-view",
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

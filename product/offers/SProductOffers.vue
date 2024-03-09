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
  <v-expand-transition>
    <div v-if="hasOffer">
      <div class="s--shop-product-offers">
        <v-container
          v-for="offer in offers"
          :key="offer.id"
          class="-offer-item"
          fluid
        >
          <v-row align="center">
            <v-col class="text-start" cols="12" md="6" order="2" order-md="1">
              <v-list-subheader>
                ●
                {{
                  $t("product_info.offer_message", {
                    min_quantity: offer.min_quantity,
                    percent: offer.percent,
                  })
                }}
              </v-list-subheader>
              <h2 class="text-h3 line-height-normal font-weight-black">
                {{ offer.title }}
              </h2>

              <div class="mt-4">
                {{ offer.description }}
              </div>

              <products-dense-images-circles-links
                :ids="Object.keys(offer.get_products)"
                :size="$vuetify.display.smAndUp ? 84 : 46"
                :to-category="toCategory"
                :to-product="toProduct"
                class="flex-grow-1"
                link
              ></products-dense-images-circles-links>
            </v-col>
            <v-col cols="12" md="6" order="1" order-md="2">
              <div class="d-flex justify-center justify-md-end align-center">
                <v-sheet
                  class="pa-3 rounded-lg position-relative"
                  color="#6ac174"
                  dark
                >
                  <v-responsive
                    aspect-ratio="1"
                    class="d-flex align-center justify-center"
                    max-width="240"
                  >
                    <div class="-highlight">
                      <span class="text-h3 font-weight-black">
                        {{
                          offer.percent === 100
                            ? $t("product_info.get_free")
                            : $t("product_info.get_off", {
                                percent: offer.percent,
                              })
                        }}
                      </span>
                    </div>
                    <div>
                      {{
                        $t("product_info.up_to", { per_order: offer.per_order })
                      }}
                    </div>
                  </v-responsive>

                  <img
                    class="absolute-top-end"
                    height="32"
                    src="../../assets/icons/gift-w.svg"
                    width="32"
                  />
                </v-sheet>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </v-expand-transition>
</template>

<script>
import ProductsDenseImagesCirclesLinks from "@components/product/products-dense-images-circles/ProductsDenseImagesCirclesLinks.vue";

export default {
  name: "SProductOffers",
  components: { ProductsDenseImagesCirclesLinks },
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

  data: () => ({}),

  computed: {
    hasOffer() {
      return this.hasOfferThisProduct(
        this.product.id,
        this.currentVariant ? this.currentVariant.id : null,
      );
    },

    offers() {
      return this.getOffersBuyProduct(
        this.product.id,
        this.currentVariant ? this.currentVariant.id : null,
      );
    },
  },
  methods: {
    toProduct(product_id) {
      return {
        name: window.$storefront.routes.PRODUCT_PAGE,
        params: { product_id: product_id },
      };
    },
    toCategory(category_id) {
      return {
        name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
        params: { category_name: category_id },
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.s--shop-product-offers {
  .-offer-item:not(:first-child) {
    border-top: dotted #aaa thin;
    margin: 24px 0;
  }

  .-highlight {
    min-height: 96px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
  }
}
</style>

<template>
  <v-expand-transition>
    <div v-if="hasOffer">

      <div class="s--shop-product-offers">
        <v-container
          v-for="offer in offers"
          :key="offer.id"
          fluid
          class="-offer-item"
        >
          <v-row align="center">
            <v-col cols="12" md="6" class="text-start" order="2" order-md="1">
              <v-subheader>
                ●
                {{
                  $t("product_info.offer_message", {
                    min_quantity: offer.min_quantity,
                    percent: offer.percent,
                  })
                }}
              </v-subheader>
              <h2 class="display-2 line-height-normal font-weight-black">
                {{ offer.title }}
              </h2>

              <div class="mt-4">
                {{ offer.description }}
              </div>

              <products-dense-images-circles-links
                :to-product=" toProduct "
                :to-category="toCategory "
                :ids="Object.keys(offer.get_products)"
                link
                :size="$vuetify.breakpoint.smAndUp ? 84 : 46"
                class="flex-grow-1"
              ></products-dense-images-circles-links>
            </v-col>
            <v-col cols="12" md="6" order="1" order-md="2">
              <div class="d-flex justify-center justify-md-end align-center">
                <v-sheet
                  color="#6ac174"
                  dark
                  class="pa-3 rounded-lg position-relative"
                >
                  <v-responsive
                    aspect-ratio="1"
                    max-width="240"
                    class="d-flex align-center justify-center"
                  >
                    <div class="-highlight">
                      <span class="display-2 font-weight-black">
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
                    src="../../assets/icons/gift-w.svg"
                    width="32"
                    height="32"
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
import ProductsDenseImagesCirclesLinks from "@/Components/product/products-dense-images-circles/ProductsDenseImagesCirclesLinks.vue";

export default {
  name: "SShopProductOffers",
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
        this.currentVariant ? this.currentVariant.id : null
      );
    },

    offers() {
      return this.getOffersBuyProduct(
        this.product.id,
        this.currentVariant ? this.currentVariant.id : null
      );
    },
  },
  methods: {
      toProduct(product_id) {
          return {
              name: 'ProductPage',
              params: { product_id: product_id },
          };
      },
      toCategory(category_id){

              return {
                  name: 'ShopCategoryPage',
                  params: { category_name: category_id },
              };

      }

  },
};
</script>

<style scoped lang="scss">
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

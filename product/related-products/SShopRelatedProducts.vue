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
  <div v-if="products?.length > 0 || busy" class="s--shop-related-products">
    <v-container>
      <h2 class="font-weight-black display-3 text-start">
        {{ $t("product.related_products_title") }}
      </h2>
    </v-container>

    <div class="my-5 py-5">
      <fade-scroll show-arrow center stick-class="-product-card">
        <div class="-product-container">
          <div class="-product-card d-flex align-center flex-column pa-5">
            <div class="ma-auto">
              <h3 class="display-3 font-weight-thin mb-2 text-muted">
                {{ $t("related_products.card.title") }}
              </h3>

              <!-- related products with common tags -->

              <template v-if="product.tags?.length">
                <p>{{ $t("related_products.card.same_tags_subtitle") }}</p>
                <s-cloud-tags-view
                  :tags="product.tags"
                  class="my-3"
                ></s-cloud-tags-view>
              </template>

              <!-- load products in same category -->
              <template v-else>
                <p>{{ $t("related_products.card.same_category_subtitle") }}</p>
                <div v-if="category" class="text-center my-8">
                  <v-avatar
                    v-if="category.icon"
                    class="avatar-gradient -thin -shop mb-3"
                    size="96"
                  >
                    <img :src="getShopImagePath(category.icon)" />
                  </v-avatar>
                  <p>
                    <b>{{ category.title }}</b>
                  </p>
                  <i>{{ category.description }}</i>
                </div>
              </template>
            </div>
          </div>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ Products List ━━━━━━━━━━━━━━━━━━━━━━━━ -->

          <div
            class="-product-card -hover"
            v-for="item in products"
            :key="item.id"
            :class="{
              disabled: item.id === product.id,
            }"
          >
            <router-link
              :to="{ name: 'ProductPage', params: { product_id: item.id } }"
            >
              <v-img
                aspect-ratio="1"
                width="100%"
                fetchpriority="low"
                :src="getShopImagePath(item.icon)"
                :lazy-src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
                :contain="item.style && item.style.contain"
                :alt="item.title"
                class="-img-banner"
              >
                <template v-slot:placeholder>
                  <v-layout fill-height align-center justify-center ma-0>
                    <v-progress-circular
                      indeterminate
                      :color="SaminColorLight"
                    />
                  </v-layout>
                </template>
              </v-img>

              <div class="-card-title">
                <span class="flex-grow-1">{{ item.title }}</span>
                <span v-if="item.rate_count" class="-rate-view">
                  {{ item.rate | numeralFormat("0.0") }}

                  <v-rating
                    v-model="item.rate"
                    dir="ltr"
                    color="yellow darken-3"
                    background-color="grey darken-1"
                    empty-icon="$vuetify.icons.ratingFull"
                    half-increments
                    readonly
                    dense
                    :length="1"
                    class="d-inline"
                  />
                </span>
              </div>
            </router-link>

            <product-variants-view
              v-if="item.variants"
              :variants="item.variants"
              dense
              small
            ></product-variants-view>

            <div class="-card-content">
              <price-view
                large
                :amount="CalcPriceProductCurrentCurrency(getShop(), item)"
              ></price-view>
            </div>
          </div>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ Loading Placeholder ━━━━━━━━━━━━━━━━━━━━━━━━ -->
          <template v-if="busy">
            <div class="-product-card" v-for="i in 6" :key="'_' + i">
              <div class="pa-3">
                <v-skeleton-loader
                  max-width="100%"
                  height="600"
                  type="image,card-heading, paragraph"
                ></v-skeleton-loader>
              </div>
            </div>
          </template>
        </div>
      </fade-scroll>
    </div>
  </div>
</template>

<script>
import FadeScroll from "@/Components/ui/fade-scroll/FadeScroll.vue";
import ProductVariantsView from "@/Components/product/variant/ProductVariantsView.vue";
import SCloudTagsView from "@/Components/ui/tag/SCloudTagsView.vue";
import _ from "lodash-es";

export default {
  name: "SShopRelatedProducts",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    SCloudTagsView,
    ProductVariantsView,
    FadeScroll,
  },

  data: function () {
    return {
      products: [],
      busy: false,
    };
  },

  computed: {
    category() {
      return this.product.category;
    },
  },

  watch: {
    product() {
      this.fetch();
    },
  },
  created() {
    this.fetch();
    // this.product.tags = ["modern", "new_feature", "avangard", "detailed", "wireless", "gaming",];
  },

  methods: {
    // Delayed for better performance:
    fetch: _.debounce(function () {
      this.fetchRelatedProductsData(); // Show the related products list
    }, 3000),

    fetchRelatedProductsData() {
      if (!this.product) return;

      const handleSuccessResponse = ({ products }) => {
        this.products = products;
      };

      this.busy = true;
      window.$storefront.products
        .optimize(60)
        .fetchProducts(null, 0, 16, {
          product_id: this.getId(this.product.id),
          sort: "related", //random
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
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

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-related-products {
  --card-background: #fff;
  --card-width: 380px;
  --padding-x: 10vw; // 10vw: Add overscroll on sides

  min-height: 30vh;
  margin: 15vh 0 15vh 0;

  // Define breakpoint values
  $breakpoint-mobile: 480px;
  $breakpoint-tablet: 768px;
  $breakpoint-desktop: 1024px;

  // Mobile styles
  @media screen and (max-width: $breakpoint-tablet) {
    .-product-container {
      --padding-x: 0;
      --card-width: 75vw;
    }
  }

  // Tablet styles
  @media screen and (min-width: $breakpoint-tablet) and (max-width: $breakpoint-desktop /*- 1px*/) {
    .-product-container {
      --padding-x: 12px;
      --card-width: min(35vw, 380px);
    }
  }

  // Desktop styles
  @media screen and (min-width: $breakpoint-desktop) {
    .-product-container {
      --card-width: min(25vw, 380px);
    }
  }

  .-product-container {
    display: flex;
    flex-wrap: nowrap;
    padding: 36px var(--padding-x); // 10vw: Add overscroll on sides

    min-width: max-content;

    .-product-card {
      text-align: start;
      background: var(--card-background);
      border-radius: 6px;
      margin: 8px 12px;
      overflow: hidden;
      min-width: var(--card-width);
      max-width: var(--card-width);
      .-card-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        padding: 8px 28px 18px 28px;
        color: #222;
        font-size: 1.2rem;
      }
      .-card-content {
        padding: 0 28px 32px 28px;
      }
      transition: all 0.3s;

      .-rate-view {
        font-size: 0.8em;
        display: inline-flex;
        align-items: center;
        margin: 2px 4px auto 4px;
      }

      &.-hover:hover {
        transform: translateY(-20px);
      }
    }
  }
}
</style>

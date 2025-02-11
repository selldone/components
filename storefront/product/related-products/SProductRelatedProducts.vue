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
      <h2 class="font-weight-black text-h2 text-start">
        {{ $t("product.related_products_title") }}
      </h2>
    </v-container>

    <div class="my-5 py-5">
      <u-fade-scroll center show-arrow stick-class="-product-card">
        <div class="-product-container">
          <div class="-product-card d-flex align-center flex-column pa-5">
            <div class="ma-auto">
              <h3 class="text-h2 font-weight-thin mb-2 text-muted">
                {{ $t("related_products.card.title") }}
              </h3>

              <!-- related products with common tags -->

              <template v-if="$product.tags?.length">
                <p>{{ $t("related_products.card.same_tags_subtitle") }}</p>
                <u-tags-cloud :tags="$product.tags" class="my-3"></u-tags-cloud>
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
                    <img :src="getShopImagePath(category.icon)" :alt="`Category Image ${category.title}`" />
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

          <s-product-related-product-card
            v-for="item in products"
            :key="item.id"
            :class="{
              disabled: item.id === $product.id,
            }"
            :product="item"
          >
          </s-product-related-product-card>

          <!-- ━━━━━━━━━━━━━━━━━━━━━━━━ Loading Placeholder ━━━━━━━━━━━━━━━━━━━━━━━━ -->
          <template v-if="busy">
            <div v-for="i in 6" :key="'_' + i" class="-product-card">
              <div class="pa-3">
                <v-skeleton-loader
                  :type="['image', 'card', 'paragraph']"
                  height="600"
                  max-width="100%"
                ></v-skeleton-loader>
              </div>
            </div>
          </template>
        </div>
      </u-fade-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import UTagsCloud from "../../../ui/tag/cloud/UTagsCloud.vue";
import { debounce } from "lodash-es";
import SProductRelatedProductCard from "@selldone/components-vue/storefront/product/related-products/card/SProductRelatedProductCard.vue";

export default {
  name: "SProductRelatedProducts",

  inject: ["$shop", "$product"],

  props: {},
  components: {
    SProductRelatedProductCard,
    UTagsCloud,
    UFadeScroll,
  },

  data: function () {
    return {
      products: [],
      busy: false,
    };
  },

  computed: {
    category() {
      return this.$product.category;
    },
  },

  watch: {
    $product() {
      this.fetch();
    },
  },
  created() {
    this.fetch();
  },

  methods: {
    // Delayed for better performance:
    fetch: debounce(function () {
      this.fetchRelatedProductsData(); // Show the related products list
    }, 3000),

    fetchRelatedProductsData() {
      if (!this.$product) return;

      const handleSuccessResponse = ({ products }) => {
        this.products = products;
      };

      this.busy = true;
      window.$storefront.products
        .optimize(60)
        .list(null, 0, 16, {
          product_id: this.getId(this.$product.id),
          sort: "related", //random
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
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
      white-space: normal;
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

      .-img-banner {
        transition: all 0.3s ease;
      }

      &.-hover:hover {
        transform: translateY(-20px);
      }
    }
  }
}
</style>

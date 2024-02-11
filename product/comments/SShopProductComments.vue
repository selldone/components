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
  <div class="s--shop-product-comments">
    <!-- ▁▁▁▁▁▁ 🞇 Rating 🞇 ▁▁▁▁▁▁ -->

    <v-container
      v-if="product?.ratings?.length && product.rate_count"
      class="my-16"
    >
      <v-row align="center">
        <v-col cols="12" md="3" order="1" order-md="1" order-sm="2" sm="6">
          <div class="my-8">
            <span class="text-h1 font-weight-black">
              {{ numeralFormat(product.rate, "0.0") }}
            </span>
            <b class="mx-1">/ 5</b>
            <div class="mt-4">
              {{
                $t("rating.product_rating_message", {
                  rate: product.rate.toFixed(1),
                  rate_count: product.rate_count,
                })
              }}
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6" order="2" order-md="2" order-sm="1" sm="12">
          <s-shop-product-rating-view
            :product="product"
            class="my-8"
            dense
            style="font-size: 17px"
          />
        </v-col>

        <v-col cols="12" md="3" order="3" order-md="3" order-sm="3" sm="6">
          <v-sheet
            :color="SaminColorDarkDeep"
            :style="{
              fontSize: statement_size,
            }"
            class="my-8 bg-shade-dark pa-6 d-flex flex-column align-center rounded-lg mx-auto position-relative overflow-hidden line-height-normal"
            dark
            max-width="240"
            style="aspect-ratio: 1"
          >
            <v-rating
              v-model="product.rate"
              active-color="#AAA"
              class="absolute-top-center op-0-2"
              color="grey-darken-1"
              density="compact"
              half-increments
              readonly
              size="36"
            />

            <div class="ma-auto z1">
              <v-icon class="mb-2" color="#fff" size="x-large"
                >{{
                  product.rate > 4
                    ? "hotel_class"
                    : product.rate > 3.5
                      ? "star_rate"
                      : product.rate > 2.5
                        ? "star_half"
                        : "star_border"
                }}
              </v-icon>
              <div>{{ buyer_rating_statement }}</div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else-if="product.my_ratings">
      <s-shop-product-rating-view
        :product="product"
        class="my-8"
        dense
        style="font-size: 17px"
      />
    </v-container>

    <div v-if="product?.article_pack" class="s--product-section-comments">
      <s-expand-view max-height="80vh" min-height="30vh">
        <s-article-comments
          :article-id="product.article_pack.article.id"
          :article-user-id="product.user_id"
          class="min-height-20vh"
          for-product
          is-shop
        />
      </s-expand-view>
    </div>
  </div>
</template>

<script>
import SExpandView from "@components/ui/expand-view/SExpandView.vue";
import SArticleComments from "@components/article/comment/SArticleComments.vue";
import SShopProductRatingView from "@components/product/rating/SShopProductRatingView.vue";
import { FontSizeHelper } from "@core/helper/style/FontSizeHelper";

export default {
  name: "SShopProductComments",
  props: {
    shop: {
      require: true,
    },
    product: {
      require: true,
    },
  },
  components: {
    SShopProductRatingView,
    SArticleComments,
    SExpandView,
  },

  data: function () {
    return {};
  },

  computed: {
    buyer_rating_statement() {
      const rate = this.product.rate;
      if (rate < 1)
        return ""; // Invalid rate!
      else if (rate < 2)
        return this.$t("global.buyer_rating_statement.between1_2");
      else if (rate < 3)
        return this.$t("global.buyer_rating_statement.between2_3");
      else if (rate < 4)
        return this.$t("global.buyer_rating_statement.between3_4");
      else if (rate <= 5)
        return this.$t("global.buyer_rating_statement.between4_5");

      return "";
    },
    statement_size() {
      return FontSizeHelper.AutoSizeText(
        this.buyer_rating_statement,
        200,
        120,
        0.7,
      );
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.s--shop-product-comments {
  margin-top: 5vh;
  margin-bottom: 5vh;
}
</style>

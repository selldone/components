<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="s--shop-product-comments">
    <!-- ▁▁▁▁▁▁ 🞇 Rating 🞇 ▁▁▁▁▁▁ -->

    <v-container
      v-if="product?.ratings?.length && product.rate_count"
      class="my-16"
    >
      <v-row align="center">
        <v-col cols="12" sm="6" md="3" order="1" order-sm="2" order-md="1">
          <div class="my-8">
            <span class="display-4 font-weight-black">
              {{ product.rate | numeralFormat("0.0") }}
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
        <v-col cols="12" sm="12" md="6" order="2" order-sm="1" order-md="2">
          <s-shop-product-rating-view
            class="my-8"
            style="font-size: 17px"
            :product="product"
            dense
          />
        </v-col>

        <v-col cols="12" sm="6" md="3" order="3" order-sm="3" order-md="3">
          <v-sheet
            :color="SaminColorDarkDeep"
            dark
            class="my-8 bg-shade-dark pa-6 d-flex flex-column align-center rounded-lg mx-auto position-relative overflow-hidden line-height-normal"
            :style="{
              fontSize: statement_size,
            }"
            max-width="240"
            style="aspect-ratio: 1"
          >
            <v-rating
              v-model="product.rate"
              class="absolute-top-center op-0-2"
              color="#AAA"
              background-color="grey darken-1"
              empty-icon="$vuetify.icons.ratingFull"
              half-increments
              readonly
              size="36"
              dense
            />

            <div class="ma-auto z1">
              <v-icon color="#fff" x-large class="mb-2">{{
                product.rate > 4
                  ? "hotel_class"
                  : product.rate > 3.5
                  ? "star_rate"
                  : product.rate > 2.5
                  ? "star_half"
                  : "star_border"
              }}</v-icon>
              <div>{{ buyer_rating_statement }}</div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else-if="product.my_ratings">
      <s-shop-product-rating-view
        class="my-8"
        style="font-size: 17px"
        :product="product"
        dense
      />
    </v-container>

    <div v-if="product?.article_pack" class="s--product-section-comments">
      <expand-view max-height="80vh" min-height="30vh">
        <s-article-comments
          is-shop
          class="min-height-20vh"
          :article-user-id="product.user_id"
          :article-id="product.article_pack.article.id"
          for-product
        />
      </expand-view>
    </div>
  </div>
</template>

<script>
import ExpandView from "@components/ui/expand-view/ExpandView.vue";
import SArticleComments from "@components/article/comment/SArticleComments.vue";
import SShopProductRatingView from "@components/product/rating/SShopProductRatingView.vue";
import { FontSizeHelper } from "../../../../core/helper/style/FontSizeHelper";

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
    ExpandView,
  },

  data: function () {
    return {};
  },

  computed: {
    buyer_rating_statement() {
      const rate = this.product.rate;
      if (rate < 1) return ""; // Invalid rate!
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
        0.7
      );
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style scoped lang="scss">
.s--shop-product-comments {
  margin-top: 5vh;
  margin-bottom: 5vh;
}
</style>

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
  <div v-if="product.ratings?.length" class="s--shop-product-rating-view">
    <v-btn
      v-if="show_edit_btn"
      small
      icon
      @click="edit_mode = !edit_mode"
      title="Rate this product"
      class="absolute-top-end"
      ><v-icon small>{{ edit_mode ? "close" : "fas fa-poll-h" }}</v-icon></v-btn
    >

    <v-expand-transition>
      <div v-if="input_rating_mode" key="edit">
        <p class="small text-muted me-10">
          {{ $t("product_rating_view.message", { user: USER()?.name }) }}
        </p>
        <rating-input
          v-for="rating in product.ratings"
          :key="rating.id"
          v-model="user_rating[rating.id]"
          :title="rating.name"
        />

        <v-btn
          rounded
          color="blue"
          depressed
          dark
          @click="setMyRating"
          :loading="busy"
        >
          {{ $t("global.actions.submit") }}
        </v-btn>
      </div>
      <div v-else-if="product.rate_count" key="view">
        <div class="d-flex align-items-baseline justify-content-center">
          <v-rating
            v-model="product.rate"
            class="my-2 text-center"
            color="yellow darken-3"
            background-color="grey darken-1"
            empty-icon="$vuetify.icons.ratingFull"
            half-increments
            hover
            readonly
            :small="small"
            :dense="small || dense"
          />
          <small class="mx-2" v-if="product.rate_count"
            >({{ product.rate_count | numeralFormat("0,0") }})</small
          >
        </div>

        <rating-bar
          v-for="rating in product.ratings"
          :key="rating.id"
          :value="rating.value"
          :max="rating.count * 5"
          :title="rating.name"
          :user-rate="user_rating[rating.id]"
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import RatingBar from "@/Components/ui/rating/RatingBar.vue";
import RatingInput from "@/Components/ui/rating/RatingInput.vue";
export default {
  name: "SShopProductRatingView",
  components: { RatingInput, RatingBar },
  props: {
    product: {
      required: true,
      type: Object,
    },
    viewOnly: {
      required: false,
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    user_rating: {},

    busy: false,
    edit_mode: false,
  }),

  computed: {
    input_rating_mode() {
      return (
        !this.viewOnly &&
        this.product.my_ratings &&
        (this.product.my_ratings.length === 0 || this.edit_mode)
      );
    },
    show_edit_btn() {
      return !this.viewOnly && this.product.my_ratings;
    },
    rating_total_star() {
      let total = 0;
      let value = 0;

      for (let i = 0; i < this.product.ratings.length; i++) {
        total += Number(this.product.ratings[i].count);
        value += Number(this.product.ratings[i].value);
      }
      if (total === 0) return 2.5;

      return value / total;
    },
  },

  created() {
    if (this.product.my_ratings) {
      // not null => user can rate to this product.
      this.product.ratings.forEach((rating) => {
        let val = this.product.my_ratings.find(
          (item) => item.rate_id === rating.id
        );
        this.user_rating[rating.id] = val ? val.value : 3;
      });
    }
  },

  methods: {
    setMyRating() {
      this.busy = true;

      window.$storefront.products.rate.submitMyRate(this.product.id,this.user_rating)

        .then(({my_ratings,ratings,rate_count,rate}) => {
            this.showSuccessAlert(
              this.$t("product_rating_view.notification.title"),
              this.$t("product_rating_view.notification.message")
            );
            this.product.my_ratings = my_ratings;
            this.product.ratings = ratings;
            this.product.rate_count = rate_count;
            this.product.rate = rate;
            this.edit_mode = false;

            this.$forceUpdate(); // Force refresh component!

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

<style scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-rating-view{

}
/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-rating-view{
  position: relative;
  text-align: start;
}
</style>

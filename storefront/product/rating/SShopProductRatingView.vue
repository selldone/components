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
      class="absolute-top-end"
      icon
      variant="text"
      size="small"
      title="Rate this product"
      @click="edit_mode = !edit_mode"
    >
      <v-icon size="small"
        >{{ edit_mode ? "close" : "fa:fas fa-poll-h" }}
      </v-icon>
    </v-btn>

    <v-expand-transition>
      <div v-if="input_rating_mode" key="edit">
        <p class="small text-muted me-10">
          {{ $t("product_rating_view.message", { user: USER()?.name }) }}
        </p>
        <u-rating-input
          v-for="rating in product.ratings"
          :key="rating.id"
          v-model="user_rating[rating.id]"
          :title="rating.name"
          class="my-1"
        />

        <div class="text-end">
          <v-btn
            :loading="busy"
            color="primary"
            rounded
            variant="elevated"
            @click="setMyRating"
          >
            {{ $t("global.actions.submit") }}
          </v-btn>
        </div>
      </div>
      <div v-else-if="product.rate_count" key="view">
        <div class="d-flex align-center justify-center">
          <v-rating
            v-model="product.rate"
            :density="small || dense ? 'compact' : undefined"
            :small="small"
            active-color="yellow-darken-3"
            class="my-2 text-center"
            color="grey-darken-1"
            half-increments
            hover
            readonly
          />
          <small v-if="product.rate_count" class="mx-2"
            >({{ numeralFormat(product.rate_count, "0,0") }})</small
          >
        </div>

        <u-rating-bar
          v-for="rating in product.ratings"
          :key="rating.id"
          :max="rating.count * 5"
          :title="rating.name"
          :user-rate="user_rating[rating.id]"
          :value="rating.value"
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import URatingBar from "../../../ui/rating/bar/URatingBar.vue";
import URatingInput from "../../../ui/rating/input/URatingInput.vue";

export default {
  name: "SShopProductRatingView",
  components: { URatingInput, URatingBar },
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
          (item) => item.rate_id === rating.id,
        );
        this.user_rating[rating.id] = val ? val.value : 3;
      });
    }
  },

  methods: {
    setMyRating() {
      this.busy = true;

      window.$storefront.products.rate
        .submitMyRate(this.product.id, this.user_rating)

        .then(({ my_ratings, ratings, rate_count, rate }) => {
          this.showSuccessAlert(
            this.$t("product_rating_view.notification.title"),
            this.$t("product_rating_view.notification.message"),
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
.s--shop-product-rating-view {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-product-rating-view {
  position: relative;
  text-align: start;
}
</style>

<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <div class="widget-box">
    <s-widget-header
      :title="$t('add_product.rating_pros_cons.title')"
      icon="ballot"
    ></s-widget-header>
    <v-list-subheader
      >{{ $t("add_product.rating_pros_cons.message") }}
    </v-list-subheader>

    <div class="border-between-vertical my-3">
      <div
        v-for="item in product.ratings"
        :key="item.id"
        class="pa-2 d-flex align-center"
      >
        <strong>{{ item.name }}</strong>
        <v-spacer></v-spacer>
        <v-rating
          :model-value="item.value / item.count"
          active-color="yellow-accent-4"
          class="ms-2"
          color="#999"
          density="comfortable"
          half-increments
          readonly
          size="14"
        ></v-rating>

        <v-btn
          :loading="busy_delete_rating === item"
          :title="$t('global.actions.delete')"
          class="ms-2"
          color="red"
          icon
          variant="text"
          @click="deleteRatingField(item)"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </div>

    <v-combobox
      v-model="new_rating"
      :disabled="product.ratings.length >= 5"
      :items="items_select_rating"
      :label="$t('add_product.rating_pros_cons.rating_input')"
      :loading="busy_rating"
      :messages="$t('add_product.rating_pros_cons.rating_input_message')"
      :placeholder="$t('add_product.rating_pros_cons.rating_input_placeholder')"
      :suffix="product.ratings.length < 5 ? $t('global.actions.add') : ''"
      class="mb-3"
      item-title="name"
      item-value="id"
      variant="underlined"
      @update:model-value="addRatingField"
    >
    </v-combobox>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "BProductRatingInput",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    new_rating: null,
    busy_delete_rating: null,
    busy_rating: false,
    rating_name: "",
  }),

  computed: {
    items_select_rating() {
      return this.$tm("add_product.rating_pros_cons.suggestion_rating").filter(
        (item) => {
          return (
            !this.product.ratings ||
            !this.product.ratings.some((s) => s.name === item)
          );
        },
      );
    },
  },

  methods: {
    deleteRatingField(rating) {
      this.busy_delete_rating = rating;

      axios
        .delete(
          this.IS_VENDOR_PANEL
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_RATING(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.DELETE_PRODUCT_RATING(
                this.product.shop_id,
                this.product.id,
              ),
          {
            params: {
              id: rating.id,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.delete_rating_success",
                { rating_name: rating.name },
              ),
            );
            this.DeleteItemByID(this.product.ratings, data.id);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
          this.$forceUpdate(); // Update vue component!
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_rating = null;
        });
    },

    addRatingField(new_rating) {
      let rating_name = new_rating;
      // console.log("new_item", rating_name);
      if (!rating_name) return;

      this.busy_rating = true;

      axios
        .post(
          this.IS_VENDOR_PANEL
            ? window.VAPI.POST_MY_VENDOR_ADD_PRODUCT_RATING(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_ADD_PRODUCT_RATING(
                this.product.shop_id,
                this.product.id,
              ),
          {
            name: rating_name,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.add_rating_success",
                { rating_name: rating_name },
              ),
            );
            if (!this.product.ratings) this.product.ratings = [];

            this.AddOrUpdateItemByID(this.product.ratings, data.rating);

            this.new_rating = null;
            //this.rating_name = "";
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
          this.$forceUpdate(); // Update vue component!
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_rating = false;

          let foundIndex = this.product.ratings.findIndex(
            (element) => element === rating_name,
          );
          if (foundIndex >= 0) this.product.ratings.splice(foundIndex, 1);
        });
    },
  },
});
</script>

<style lang="scss" scoped></style>

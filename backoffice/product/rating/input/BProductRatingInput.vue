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
    <u-widget-header
      :title="$t('add_product.rating_pros_cons.title')"
      icon="ballot"
    ></u-widget-header>
    <v-list-subheader
      >{{ $t("add_product.rating_pros_cons.message") }}
    </v-list-subheader>

    <div class="border-between-vertical my-3">
      <div
        v-for="item in product.ratings"
        :key="item.id"
        class="px-2 d-flex align-center"
      >
        <strong>{{ item.name }}</strong>
        <v-spacer></v-spacer>
        <v-rating
          :model-value="item.value / item.count"
          active-color="yellow-accent-4"
          class="ms-2"
          color="#999"
          density="compact"
          half-increments
          readonly
          size="small"

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
      :messages="$t('add_product.rating_pros_cons.rating_input_message')"
      :placeholder="$t('add_product.rating_pros_cons.rating_input_placeholder')"
      class="mb-3"
      item-title="name"
      item-value="id"
      variant="underlined"
      @keydown.enter="addRatingField(new_rating)"
    >
      <template v-slot:append-inner>
        <v-slide-y-reverse-transition>
          <v-btn
            v-if="product.ratings.length < 5 && new_rating"
            :loading="busy_rating"
            @click="addRatingField(new_rating)"
            prepend-icon="add"
            size="small"
          >
            {{ $t("global.actions.add") }}
          </v-btn>
        </v-slide-y-reverse-transition>
      </template>
    </v-combobox>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default defineComponent({
  name: "BProductRatingInput",
  mixins:[],
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
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "add_product.rating_pros_cons.notifications.delete_rating_success",
                { rating_name: rating.name },
              ),
            );
            this.DeleteItemByID(this.product.ratings, data.id);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
          this.$forceUpdate(); // Update vue component!
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            NotificationService.showSuccessAlert(
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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
          this.$forceUpdate(); // Update vue component!
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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

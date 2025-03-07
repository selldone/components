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
  <v-row align="center" class="flex-grow-0" justify="space-around" no-gutters>
    <div
      v-if="!window.ExternalWidget"
      class="btn-fav border d-flex align-center"
    >
      <v-btn
        v-if="!existInComparisonList"
        :disabled="productsCountInComparisonList >= 10"
        class="pe-2"
        height="44"
        size="large"
        tile
        variant="text"
        @click="addToProductComparison($product, currentVariant)"
      >
        <v-icon start>add</v-icon>

        <div
          :class="{ small: $vuetify.display.xs }"
          class="single-line overflow-hidden d-block"
          style="max-width: 20vw"
        >
          {{
            productsCountInComparisonList >= 10
              ? $t("product_info.compare_limit")
              : $t("product_info.compare_add")
          }}
        </div>
      </v-btn>
      <v-btn
        v-else
        class="pe-2"
        color="success"
        height="44"
        size="large"
        tile
        variant="text"
        @click="removeFromProductComparison($product, currentVariant)"
      >
        <v-icon class="blink-me me-1" size="10">lens</v-icon>
        {{ $t("product_info.compare_be_in_list") }}
      </v-btn>

      <v-divider class="m-0" vertical></v-divider>
      <v-btn
        :color="inWishlist ? 'red' : '#444'"
        :loading="wishlist_busy"
        :title="inWishlist ? 'In my list' : 'Add to favorites'"
        icon
        min-width="54px"
        size="44"
        tile
        variant="text"
        @click.stop="toggleWishlist"
      >
        <v-icon>{{ inWishlist ? "favorite" : "favorite_border" }}</v-icon>
      </v-btn>

      <!-- 🞇 Direct Ask (WhatsApp,...) -->
      <s-storefront-social-buttons min-width="54px" product-only size="44" tile>
      </s-storefront-social-buttons>
    </div>

    <v-spacer></v-spacer>

    <!-- 🞇 Blog -->

    <a
      v-if="$product.blog"
      :href="$product.blog"
      class="elastic-button m-2"
      dir="ltr"
      rel="nofollow"
      target="_blank"
    >
      <div class="circle">
        <span class="icon arrow"></span>
      </div>
      <p class="button-text">
        {{ $t("product_info.external_link") }}
      </p>
    </a>
  </v-row>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SStorefrontSocialButtons from "../../../../storefront/social/SStorefrontSocialButtons.vue";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";

export default {
  name: "SProductSectionExtraButtons",
  mixins: [AuthMixin],

  components: { SStorefrontSocialButtons },
  inject: ["$shop", "$product"],

  props: {
    currentVariant: {},
  },

  data: () => ({
    // Wishlist
    wishlist_busy: false,
  }),

  computed: {
    //―――――――――――――――――――――― Product Comparison ――――――――――――――――――――

    existInComparisonList() {
      let list = this.$store.getters.getProductsComparison;
      if (!list) return false;

      return list.some((item) => {
        return (
          item.id === this.$product.id &&
          (!item.variant || item.variant.id === this.currentVariant?.id)
        );
      });
    },

    productsCountInComparisonList() {
      let list = this.$store.getters.getProductsComparison;
      return list ? list.length : 0;
    },

    inWishlist() {
      return !!this.$product.wishlist;
    },
  },
  methods: {
    //――――――――――――――――――――――― Star ―――――――――――――――――――――――

    toggleWishlist() {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }

      this.wishlist_busy = true;

      if (!this.inWishlist) {
        axios
          .put(
            window.XAPI.PUT_WISHLIST_PRODUCT(this.$shop.name, this.$product.id),
          )
          .then(({ data }) => {
            if (!data.error) {
              this.$product.wishlist = data.wishlist;
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            NotificationService.showLaravelError(error);
          })
          .finally(() => {
            this.wishlist_busy = false;
          });
      } else {
        axios
          .delete(
            window.XAPI.DELETE_WISHLIST_PRODUCT(
              this.$shop.name,
              this.$product.id,
            ),
          )
          .then(({ data }) => {
            if (!data.error) {
              this.$product.wishlist = null;
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            NotificationService.showLaravelError(error);
          })
          .finally(() => {
            this.wishlist_busy = false;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-fav {
  display: flex;
  // box-shadow: 0px 8px 20px 10px rgba(0, 0, 0, 0.2);
  border-radius: 26px;
  overflow: hidden;
}
</style>

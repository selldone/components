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
  <v-row no-gutters align="center" justify="space-around" class="flex-grow-0">
    <div
      v-if="!window.ExternalWidget"
      class="btn-fav border d-flex align-center"
    >
      <v-btn
        v-if="!existInComparisonList"
        :disabled="productsCountInComparisonList >= 10"
        @click="addToProductComparison(product, currentVariant)"
        tile
        text
        large
        class="pe-2"
      >
        <v-icon class="me-1">add</v-icon>

        <div
          style="max-width: 20vw"
          class="single-line overflow-hidden d-block"
          :class="{ small: $vuetify.breakpoint.xsOnly }"
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
        text
        tile
        large
        color="success"
        class="pe-2"
        @click="removeFromProductComparison(product, currentVariant)"
      >
        <v-icon size="10" class="blink-me me-1">lens</v-icon>
        {{ $t("product_info.compare_be_in_list") }}
      </v-btn>

      <v-divider vertical class="m-0"></v-divider>
      <v-btn
        icon
        tile
        :color="inWishlist ? 'red' : '#444'"
        large
        min-width="54px"
        @click.stop="toggleWishlist"
        :loading="wishlist_busy"
        :title="inWishlist ? 'In my list' : 'Add to favorites'"
      >
        <v-icon>{{ inWishlist ? "favorite" : "favorite_border" }}</v-icon>
      </v-btn>

      <!-- 🞇 Direct Ask (WhatsApp,...) -->
      <s-storefront-social-buttons
        :shop="shop"
        product-only
        tile
        large
        min-width="54px"
      >
      </s-storefront-social-buttons>
    </div>

    <v-spacer></v-spacer>

    <!-- 🞇 Blog -->

    <a
      v-if="product.blog"
      class="elastic-button m-2"
      :href="product.blog"
      target="_blank"
      rel="nofollow"
      dir="ltr"
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

<script>
import SStorefrontSocialButtons from "@components/storefront/social/SStorefrontSocialButtons.vue";
export default {
  name: "ProductSectionBoxExtraButtons",
  components: { SStorefrontSocialButtons },
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
          item.id === this.product.id &&
          (!item.variant || item.variant.id === this.currentVariant.id)
        );
      });
    },

    productsCountInComparisonList() {
      let list = this.$store.getters.getProductsComparison;
      return list ? list.length : 0;
    },

    inWishlist() {
      return this.product.wishlist ? true : false;
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
            window.XAPI.PUT_WISHLIST_PRODUCT(this.shop_name, this.product.id)
          )
          .then(({ data }) => {
            if (!data.error) {
              this.product.wishlist = data.wishlist;
            } else {
              this.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            this.showLaravelError(error);
          })
          .finally(() => {
            this.wishlist_busy = false;
          });
      } else {
        axios
          .delete(
            window.XAPI.DELETE_WISHLIST_PRODUCT(this.shop_name, this.product.id)
          )
          .then(({ data }) => {
            if (!data.error) {
              this.product.wishlist = null;
            } else {
              this.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            this.showLaravelError(error);
          })
          .finally(() => {
            this.wishlist_busy = false;
          });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.btn-fav {
  display: flex;
  // box-shadow: 0px 8px 20px 10px rgba(0, 0, 0, 0.2);
  border-radius: 26px;
  overflow: hidden;
}
</style>

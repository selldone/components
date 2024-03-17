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
  <div
    v-if="products && products.length"
    class="s--storefront-products-comparison-button"
  >
    <u-progress-radial
      :class="{ 'force-on-top': show, 'is-mobile': isMobile }"
      :completed-steps="products.length"
      :diameter="84"
      :inner-stroke-color="SaminColorDarkDeep"
      :stroke-width="10"
      :total-steps="10"
      class="widget-hover s--storefront-products-comparison-circle-progress"
      start-color="#C2185B"
      stop-color="#9C27B0"
      @click="!show ? showDialog() : (show = false)"
    >
      <v-icon :size="24">
        {{ show ? "close" : "search" }}
      </v-icon>
      <p class="m-0 x-small">
        {{ $t("product_comparison.action_button") }}
      </p>
    </u-progress-radial>

    <v-dialog v-model="show" fullscreen transition="dialog-bottom-transition">
      <v-card class="text-start">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2" color="#111">compare</v-icon>

          {{ $t("product_comparison.title") }}
          <v-spacer />

          <v-btn icon @click="show = false" variant="text">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <u-loading-progress v-if="busy"></u-loading-progress>

        <s-comparison-list
          v-if="!need_updates.length"
          :products="products"
          can-remove-from-list
          @close="show = false"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UProgressRadial from "@components/ui/progress/radial/UProgressRadial.vue";
import SComparisonList from "../list/SComparisonList.vue";

export default {
  name: "SComparisonButton",
  components: { SComparisonList, UProgressRadial },

  data: () => ({
    show: false,
    busy: false,
  }),

  computed: {
    products() {
      let list = this.$store.getters.getProductsComparison;
      return list ? list : [];
    },

    need_updates() {
      return this.products.filter((p) => p.need_update);
    },
  },

  mounted() {},
  methods: {
    showDialog() {
      if (this.need_updates.length) {
        const product_ids = [];
        this.need_updates.forEach((p) => {
          if (!product_ids.includes(p.id)) product_ids.push(p.id);
        });

        this.fetchProducts(product_ids);
      }

      this.show = true;
    },

    fetchProducts(product_ids) {
      if (this.busy) return;

      this.busy = true;

      axios
        .get(window.XAPI.GET_PRODUCTS_LIST(this.shop_name), {
          params: {
            list: product_ids,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            // Re add products:
            data.products.forEach((product) => {
              let variant = null;
              // AUto select first variant:
              if (product.product_variants && product.product_variants.length) {
                variant = product.product_variants[0];
              }
              // remove previous:
              this.removeFromProductComparison(product);
              // add new:
              this.addToProductComparison(product, variant);
            });
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
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
.s--storefront-products-comparison-button {
}

.s--storefront-products-comparison-circle-progress {
  user-select: none;
  position: fixed;
  bottom: 12px;
  left: 12px;
  z-index: 100;

  cursor: pointer;

  border-radius: 50%;
  background-color: var(--theme-dark);
  color: white;
  transition: transform 0.25s ease;
  transform: scale(0.7);

  &.is-mobile {
    bottom: 80px; // +55 px for bottom navigation
  }

  &:hover {
    transform: scale(1);
    z-index: 101;
  }

  &.force-on-top {
    z-index: 1000;

    &:hover {
      z-index: 1001;
    }
  }
}
</style>

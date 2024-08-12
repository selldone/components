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
  <div class="-product-card -hover">
    <router-link
      :to="{
        name: window.$storefront.routes.PRODUCT_PAGE,
        params: { product_id: product.id },
      }"
    >
      <v-img
        :alt="product.title"
        :cover="!product.style || !product.style.contain"
        :lazy-src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
        :src="getShopImagePath(product.icon)"
        aspect-ratio="1"
        class="-img-banner"
        fetchpriority="low"
        width="100%"
      >
        <template v-slot:placeholder>
          <v-progress-circular
            class="center-absolute"
            color="#333"
            indeterminate
          />
        </template>
      </v-img>

      <div class="-card-title">
        <span class="flex-grow-1">{{ product.title?.limitWords(8) }}</span>
        <span v-if="product.rate_count" class="-rate-view">
          {{ numeralFormat(product.rate, "0.0") }}

          <v-rating
            v-model="product.rate"
            :length="1"
            active-color="yellow-darken-3"
            class="d-inline"
            color="grey-darken-1"
            density="compact"
            dir="ltr"
            half-increments
            readonly
          />
        </span>
      </div>
    </router-link>

    <product-variants-view
      v-if="product.variants"
      :variants="product.variants"
      dense
      small
    ></product-variants-view>

    <div class="-card-content">
      <u-price :amount="price" large></u-price>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProductVariantsView from "@selldone/components-vue/storefront/product/variant/ProductVariantsView.vue";

export default defineComponent({
  name: "SProductRelatedProductCard",
  components: { ProductVariantsView },
  props: {
    product: {
      required: true,
      type: Object,
    },
  },

  computed: {
    price() {
      return this.CalcPriceProductCurrentCurrency(this.getShop(), this.product);
    },
  },
});
</script>

<style scoped lang="scss">
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
</style>

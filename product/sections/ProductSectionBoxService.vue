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
  <!-- █████████████████████ 🞇 Service █████████████████████ -->

  <div v-if="isService" style="min-height: 1rem" class="flex-grow-0">
    <service-order-view
      :basket="basket"
      :product="product"
      @update:preferences="(val) => $emit('update:preferences', val)"
    ></service-order-view>
  </div>
</template>

<script>
import ServiceOrderView from "../service/ServiceOrderView.vue";
import { ProductType } from "@core/enums/product/ProductType";
export default {
  name: "ProductSectionBoxService",
  components: {
    ServiceOrderView,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
    preferences: {},



  },

  data: () => ({


  }),

  computed: {
    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    basket() {
      return this.getBasket(this.product.type);
    },
  },
  methods: {},
};
</script>

<style scoped lang="scss"></style>

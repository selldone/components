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

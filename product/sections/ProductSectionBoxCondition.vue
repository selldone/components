<template>
  <div>
    <!-- █████████████████████ 🞇  Physical, Virtual, File █████████████████████ -->

    <div v-if="!isService" class="flex-grow-0">
      <div class="px-2 d-flex" style="min-height: 1rem">
        <span v-if="condition_object" class="flex-grow-1 me-1">
          <img
            :src="condition_object.icon"
            width="24"
            height="24"
            class="me-2 hover-scale z1 vertical-align-middle"
          />
          <span>{{ $t(condition_object.title) }}</span>
        </span>

        <span class="flex-grow-1">
          <v-icon v-if="product.warranty" color="#444" class="mx-2">
            verified_user
          </v-icon>
          <span v-if="product.warranty">{{ product.warranty }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ProductType } from "../../../../core/enums/product/ProductType";
import { ProductCondition } from "../../../../core/enums/product/ProductCondition";

export default {
  name: "ProductSectionBoxCondition",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    condition_object() {
      return Object.values(ProductCondition).find(
        (item) => item.code === this.product.condition
      );
    },
  },
  methods: {},
};
</script>

<style scoped lang="scss"></style>

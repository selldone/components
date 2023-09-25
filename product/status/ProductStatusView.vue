<template>
  <div class="inline-block text-center" :title="$t(status_obj.description)">
    <v-icon :color="status_obj.color" small>
      {{ status_obj.icon }}
    </v-icon>

    <span class="x-small d-block">
      {{ $t(status_obj.name) }}
    </span>
  </div>
</template>

<script>
import { ProductStatus } from "../../../../core/enums/product/ProductStatus";

export default {
  name: "ProductStatusView",
  props: {
    product: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      ProductStatus: ProductStatus,
    };
  },
  computed: {
    status_obj() {
      return ProductStatus[this.product.status];
    },
  },
};
</script>

<style scoped></style>

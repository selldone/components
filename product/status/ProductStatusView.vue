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
import { ProductStatus } from "@core/enums/product/ProductStatus";

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

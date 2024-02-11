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
  <div>
    <!-- █████████████████████ 🞇  Physical, Virtual, File █████████████████████ -->

    <div v-if="!isService" class="flex-grow-0">
      <div class="px-2 d-flex" style="min-height: 1rem">
        <span v-if="condition_object" class="flex-grow-1 me-1">
          <img
            :src="condition_object.icon"
            class="me-2 hover-scale z1 vertical-align-middle"
            height="24"
            width="24"
          />
          <span>{{ $t(condition_object.title) }}</span>
        </span>

        <span class="flex-grow-1">
          <v-icon v-if="product.warranty" class="mx-2" color="#444">
            verified_user
          </v-icon>
          <span v-if="product.warranty">{{ product.warranty }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ProductType } from "@core/enums/product/ProductType";
import { ProductCondition } from "@core/enums/product/ProductCondition";

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
        (item) => item.code === this.product.condition,
      );
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped></style>

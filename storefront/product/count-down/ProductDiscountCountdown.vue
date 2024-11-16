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
  <!--  ▃▃▃▃▃▃▃▃▃▃ Discount countdown ▃▃▃▃▃▃▃▃▃▃ -->
  <div v-if="hasDiscountCountDown">
    <img
      class="count-down-bg fadeIn delay_400"
      fetchpriority="high"
      src="../../../assets/icons/countdown-badge.svg"
      alt="Discount countdown"
    />

    <div class="count-down-container fadeIn delay_400">
      <u-count-down v-if="endOfDiscountDate" :end="endOfDiscountDate" />
      <p v-else class="discount-not-end">
        {{ $t("product_info.action") }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import UCountDown from "../../../ui/count-down/UCountDown.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import { PriceHelper } from "@selldone/core-js/helper";

export default {
  name: "ProductDiscountCountdown",
  mixins: [ProductMixin],
  inject: {
    $product: {},
    $variant: {
      default: null,
    },
  },
  components: { UCountDown },

  props: {},

  computed: {
    hasDiscountCountDown() {
      return PriceHelper.HasDiscountCountDownMode(this.$product, this.$variant);
    },
    endOfDiscountDate() {
      return PriceHelper.GetEndOfDiscountDate(this.$product, this.$variant);
    },
  },
};
</script>

<style lang="scss" scoped>
.count-down-bg {
  position: absolute;
  top: -10px;
  left: -10px;
  z-index: 3;
  width: 200px;
  pointer-events: none;

  transform: scaleX(-1);
}

.v-locale--is-rtl {
  .count-down-bg {
    right: -10px;
    left: unset;
    transform: unset;
  }

  .count-down-container {
    transform: rotate(42deg) translate(24%, -30%);
  }
}

.count-down-container {
  pointer-events: none;
  position: absolute;

  user-select: none;
  text-align: center;
  top: 0px;
  left: 0px;
  right: 0;
  z-index: 4;
  padding: 6px;
  color: #fff;

  transform: rotate(-42deg) translate(-24%, -30%);

  //  background: rgba(194, 24, 91, 0.8);
  transform-origin: center;
  width: 250px;

  ul {
    padding: 0;
  }

  .discount-not-end {
    font-weight: 500;
    font-size: 1.2rem;
  }
}
</style>

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
      src="@components/assets/icons/countdown-badge.svg"
      class="count-down-bg fadeIn delay_400"
      fetchpriority="high"
    />

    <div class="count-down-container fadeIn delay_400">
      <count-down v-if="endOfDiscountDate" :end="endOfDiscountDate" />
      <p v-else class="discount-not-end">
        {{ $t("product_info.action") }}
      </p>
    </div>
  </div>
</template>

<script>
import CountDown from "@components/ui/count-down/CountDown.vue";

export default {
  name: "ProductDiscountCountdown",
  components: { CountDown },

  props: {
    product: {
      required: true,
      type: Object,
    },
  },

  computed: {
    hasDiscountCountDown() {
      return this.HasDiscountCountDownMode(this.product, this.currentVariant);
    },
    endOfDiscountDate() {
      return this.GetEndOfDiscountDate(this.product, this.currentVariant);
    },
  },
};
</script>

<style scoped lang="scss">
.count-down-bg {
  position: absolute;
  top: -9px;
  left: -10px;
  z-index: 3;
  width: 200px;
  pointer-events: none;

  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);


}
.v-application--is-rtl {
  .count-down-bg {
    right: -10px;
    left: unset;
    -webkit-transform: unset;
    transform: unset;


  }

  .count-down-container {
    -ms-transform: rotate(42deg) translate(24%, -30%); /* IE 9 */
    -webkit-transform: rotate(42deg) translate(24%, -30%); /* Safari */
    transform: rotate(42deg) translate(24%, -30%); /* Standard syntax */
  }
}


.count-down-container {
  pointer-events: none;
  position: absolute;

  user-select: none;
  text-align: center;
  top: 1px;
  left: 1px;
  right: 0;
  z-index: 4;
  padding: 6px;
  color: #fff;

  -ms-transform: rotate(-42deg) translate(-24%, -30%);
  -webkit-transform: rotate(-42deg) translate(-24%, -30%);
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

<template>
  <!--  ▃▃▃▃▃▃▃▃▃▃ Discount countdown ▃▃▃▃▃▃▃▃▃▃ -->
  <div v-if="hasDiscountCountDown">
    <img
      src="@/Components/assets/icons/countdown-badge.svg"
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
import CountDown from "@/Components/ui/count-down/CountDown.vue";

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

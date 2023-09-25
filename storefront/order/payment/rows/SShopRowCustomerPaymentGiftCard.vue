<template>
  <tr class="s--shop-row-customer-payment-gift-card">
    <td>
      <v-icon v-if="sub" class="ms-5 flip-ltr" color="black">keyboard_return</v-icon>
      <img
        src="../../../../assets/icons/gift-card.svg"
        height="24"
        class="mx-2"
      />

      {{ $t("global.commons.gift_card") }}
    </td>
    <td class="text-left">
      <price-view
        :amount="-giftcard.amount"
        :currency="giftcard.currency"
      ></price-view>
    </td>
    <td class="subtitle-2">
      {{ formatCard(giftcard.number) }}
    </td>
  </tr>
</template>

<script>
export default {
  name: "SShopRowCustomerPaymentGiftCard",
  props: {
    giftcard: {
      require: true,
    },
    sub: {
      default: false,
      type:Boolean
    },
  },
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-row-customer-payment-gift-card{
  text-align: start;
}
</style>

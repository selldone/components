<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <tr class="text-start">
    <td>
      <img
        class="mx-2"
        height="24"
        src="../../../../../assets/icons/customer_wallet.svg"
      />

      {{ $t("global.commons.wallet") }}
    </td>
    <td class="text-left">
      <u-price
        :amount="-walletTransaction.amount"
        :currency="walletTransaction.currency"
      ></u-price>
    </td>
    <td>Paid by customer's wallet.</td>
    <td></td>
  </tr>
</template>

<script>
export default {
  name: "BOrderPaymentRowWallet",
  props: {
    walletTransaction: {
      require: true,
    },
  },
};
</script>

<style scoped></style>

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
  <span v-if="statusObject">
    <v-icon :color="status === 'Succeeded' ? 'green' : ''" class="me-1">{{
      statusObject.icon
    }}</v-icon>

    <small>{{ $t(statusObject.name) }}</small>
  </span>
</template>

<script>
import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";

export default {
  name: "SPaymentStatusView",
  props: {
    status: {
      require: true,
    },
  },
  computed: {
    statusObject() {
      return TransactionStatus[this.status];
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--payment-status-view {
}
</style>

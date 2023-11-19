<template>
  <span v-if="statusObject">
    <v-icon class="me-1" :color="status === 'Succeeded' ? 'green' : ''">{{
      statusObject.icon
    }}</v-icon>

    <small>{{ $t(statusObject.name) }}</small>
  </span>
</template>

<script>
import { TransactionStatus } from "@core/enums/payment/TransactionStatus";

export default {
  name: "PaymentStatusView",
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

<style scoped></style>

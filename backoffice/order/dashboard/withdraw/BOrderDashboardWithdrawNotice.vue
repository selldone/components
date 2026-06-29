<template>
  <v-alert
    class="mb-5 text-start"
    color="#D32F2F"
    icon="assignment_return"
    variant="tonal"
  >
    <div class="font-weight-bold mb-1">Customer withdrawal requested</div>
    <div>
      This order has been withdrawn by the customer on
      <b
        >{{ getFromNowString(basket.withdraw_at) }} |
        {{ getLocalTimeString(basket.withdraw_at) }}</b
      >.
    </div>
    <div v-if="isCanceled" class="mt-1">
      The order was automatically canceled because it had not been sent.
    </div>
    <div v-else class="mt-1">
      The order was already sent or is still active. Review fulfillment, return
      handling, and customer communication manually.
    </div>
  </v-alert>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default defineComponent({
  name: "BOrderDashboardWithdrawNotice",
  mixins: [DateMixin],
  props: {
    basket: {
      required: true,
      type: Object,
    },
  },

  computed: {
    isCanceled(): boolean {
      return (this.basket as any).status === "Canceled";
    },
  },
});
</script>

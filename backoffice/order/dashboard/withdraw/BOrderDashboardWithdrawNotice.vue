<template>
  <v-alert
    class="mb-5 text-start"
    :color="modern ? undefined : '#D32F2F'"
    :class="{ 'sd-modern-notice b-order-withdraw-notice--modern': modern }"
    icon="assignment_return"
    :variant="modern ? 'flat' : 'tonal'"
  >
    <template v-if="modern" #prepend><v-icon color="error" size="20">assignment_return</v-icon></template>
    <div class="font-weight-bold mb-1">{{ modern ? $t('process_center.modern.withdraw_title') : 'Customer withdrawal requested' }}</div>
    <div>
      {{ modern ? $t('process_center.modern.withdraw_at') : 'This order has been withdrawn by the customer on' }}
      <b
        >{{ getFromNowString(basket.withdraw_at) }} |
        {{ getLocalTimeString(basket.withdraw_at) }}</b
      >.
    </div>
    <div v-if="isCanceled" class="mt-1">
      {{ modern ? $t('process_center.modern.withdraw_canceled') : 'The order was automatically canceled because it had not been sent.' }}
    </div>
    <div v-else class="mt-1">
      {{ modern ? $t('process_center.modern.withdraw_review') : 'The order was already sent or is still active. Review fulfillment, return handling, and customer communication manually.' }}
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
    modern: {
      type: Boolean,
      default: false,
    },
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

<style scoped lang="scss">
.b-order-withdraw-notice--modern {
  color: rgb(var(--v-theme-on-surface));
  background: var(--sd-modern-inset);
  padding: 14px 16px;
  border: 0;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  :deep(.font-weight-bold) { font-weight: 500 !important; }
  b { font-weight: 500; text-wrap: balance; }
}
</style>

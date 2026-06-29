<template>
  <div v-if="visible"
       class="widget shadow my-3 mx-0 mx-md-3 border-top overflow-hidden"

  >
    <v-alert
      v-if="alreadyWithdrawn"
      class="text-start"
      color="info"
      icon="assignment_return"
      variant="tonal"
    >
      This order has been withdrawn by the customer.
    </v-alert>

    <div v-else>
      <u-widget-header icon="assignment_return" title="Order withdrawal" />

      <div class="mt-3 text-start">
        <p v-if="deadlineText" class="mb-2">
          You can withdraw this order until {{ deadlineText }}.
        </p>

        <p v-if="policyText" class="text-pre-wrap mb-3">
          {{ policyText }}
        </p>

        <v-alert
          v-if="!supportsAutomaticRefund"
          class="text-start"
          color="warning"
          icon="payments"
          variant="tonal"
        >
          Automatic refund is not supported for this payment method. Please
          contact the seller.
        </v-alert>

        <v-alert
          v-else-if="expired"
          class="text-start"
          color="warning"
          icon="timer_off"
          variant="tonal"
        >
          The withdrawal period for this order has expired.
        </v-alert>

        <v-btn
          v-else-if="canWithdraw"
          class="mt-2"
          :loading="busy"
          color="error"
          prepend-icon="assignment_return"
          variant="flat"
          @click="dialog = true"
        >
          Withdraw order
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="dialog" max-width="560">
      <v-card class="text-start">
        <v-card-title>Confirm order withdrawal</v-card-title>
        <v-card-text>
          <p>
            This action requests a full automatic refund for the paid amount. If
            the order has not been sent, it will be canceled automatically.
          </p>

          <v-checkbox
            v-model="confirmed"
            hide-details
            label="I confirm that I want to withdraw this order and request a full refund."
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            :disabled="!confirmed"
            :loading="busy"
            color="primary"
            @click="submitWithdrawOrder"
          >
            Confirm withdrawal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import CoreMixin from "@selldone/components-vue/mixin/CoreMixin.ts";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default defineComponent({
  name: "SShopCustomerOrderWithdraw",

  components: { UWidgetHeader },

  mixins: [CoreMixin],

  props: {
    order: {
      required: true,
      type: Object,
    },
    payment: {
      default: null,
      type: Object,
    },
  },

  emits: ["request:refresh"],

  data() {
    return {
      busy: false,
      confirmed: false,
      dialog: false,
    };
  },

  computed: {
    withdrawOrder(): Record<string, any> | null {
      return (this.order as any)?.withdraw_order || null;
    },

    visible(): boolean {
      return !!(
        this.withdrawOrder &&
        (this.withdrawOrder.enabled || this.policyText || this.alreadyWithdrawn)
      );
    },

    alreadyWithdrawn(): boolean {
      return !!(this.order as any)?.withdraw || !!this.withdrawOrder?.already_withdrawn;
    },

    policyText(): string | null {
      return this.withdrawOrder?.policy_text || null;
    },

    supportsAutomaticRefund(): boolean {
      return !!this.withdrawOrder?.payment_supports_auto_refund;
    },

    expired(): boolean {
      return !!this.withdrawOrder?.expired;
    },

    canWithdraw(): boolean {
      return !!(
        this.withdrawOrder?.enabled &&
        this.withdrawOrder?.eligible &&
        this.supportsAutomaticRefund &&
        !this.expired &&
        !this.alreadyWithdrawn
      );
    },

    deadlineText(): string | null {
      const deadline = this.withdrawOrder?.deadline_at;
      if (!deadline) return null;
      return new Date(deadline).toLocaleString();
    },
  },

  methods: {
    submitWithdrawOrder() {
      if (!this.confirmed) return;

      const shop = (this as any).getShop?.();
      const shopName = shop?.name || (this.order as any)?.shop?.name;

      this.busy = true;
      const url =
        this.withdrawOrder?.url ||
        window.XAPI.POST_ORDER_BASKET_WITHDRAW(shopName, (this.order as any).id);

      axios
        .post(url, { confirm: true })
        .then(({ data }: Record<string, any>) => {
          const { basket, payment, message } = data;
          if (basket) Object.assign(this.order as any, basket);
          if (payment && (this.order as any).payment) {
            Object.assign((this.order as any).payment, payment);
          }

          this.dialog = false;
          this.confirmed = false;
          NotificationService.showSuccessAlert(
            null,
            message || "Order withdrawal has been submitted.",
          );
          this.$emit("request:refresh");
        })
        .catch((error: unknown) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
});
</script>

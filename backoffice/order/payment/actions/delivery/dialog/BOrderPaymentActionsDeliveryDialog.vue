<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    content-class="rounded-t-xl"
    max-width="640"
    width="98vw"
    scrollable
  >
    <v-card rounded="t-xl" class="text-start">
      <v-card-title>
        <img :src="getShopImagePath(gateway?.icon)" class="me-2" height="24" />

        Customer Delivery Confirmation
      </v-card-title>

      <v-card-text>
        <p>
          Certain payment services require confirmation that the order has been
          delivered to the customer. We typically send this confirmation during
          the final step of order fulfillment when we receive the customer's
          delivery confirmation. However, if you need to perform this action
          manually, you can do so here.
        </p>

        <u-smart-verify
          v-model="confirmed"
          true-title="Verify Delivery"
          true-description="I confirm that the order has been delivered to the customer."
          class="mt-3"
        ></u-smart-verify>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            size="x-large"
            variant="elevated"
            color="primary"
            @click="confirmRefund"
            :loading="busy"
            :disabled="!confirmed"
          >
            <v-icon start>check</v-icon>
            Confirm Now
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import USmartVerify from "@selldone/components-vue/ui/smart/verify/USmartVerify.vue";

export default defineComponent({
  name: "BOrderPaymentActionsDeliveryDialog",
  components: { USmartVerify },
  emits: ["update:modelValue", "payment-delivery"],
  props: {
    modelValue: {},

    payment: {
      required: true,
      type: Object,
    },
    suggestedAmount: {
      default: 0,
      type: Number,
    },
  },

  data() {
    return {
      confirmed: false,
      busy: false,
    };
  },

  computed: {
    gateway() {
      return this.payment.gateway;
    },
  },

  watch: {},
  created() {
    this.amount_input = this.suggestedAmount;
  },

  methods: {
    confirmRefund() {
      this.busy = true;

      axios
        .post(
          window.API.POST_PAYMENT_GATEWAY_ACTIONS_DELIVERY(
            this.payment.shop_id,
            this.gateway.code,
            this.payment.id,
          ),
          {
            amount: this.amount_input,
          },
        )
        .then(({ data }) => {
          if (data.error) return this.showErrorAlert(null, data.error_msg);

          Object.assign(this.payment, data.payment);
          this.$emit("payment-delivery", data.amount);
          this.$emit("update:modelValue", false);

          this.showSuccessAlert(
            null,
            "The delivery confirmation has been sent to payment provider successfully.",
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
});
</script>

<style scoped lang="scss"></style>

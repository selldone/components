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

        {{ $t("payment_refund_dialog.title") }}
      </v-card-title>

      <v-card-text>
        <p class="mb-3">
          {{ $t("payment_refund_dialog.message") }}
        </p>
        <v-table density="compact">
          <template v-slot:default>
            <tbody>
              <tr>
                <td>{{ $t("payment_refund_dialog.payment_amount") }}</td>
                <td>
                  <u-price
                    :amount="payment.amount"
                    :currency="payment.currency"
                  ></u-price>
                </td>
              </tr>

              <tr>
                <td>{{ $t("payment_refund_dialog.total_refund_amount") }}</td>
                <td>
                  <u-price
                    :amount="payment.refund_amount"
                    :currency="payment.currency"
                  ></u-price>
                </td>
              </tr>

              <tr>
                <td>{{ $t("payment_refund_dialog.can_refund") }}</td>
                <td>
                  <u-price
                    :amount="max_amount"
                    :currency="payment.currency"
                  ></u-price>
                </td>
              </tr>

              <tr>
                <td>{{ $t("global.commons.payment_date") }}</td>
                <td>
                  <b>{{ getFromNowString(payment.payment_at) }}</b
                  ><br />
                  <small> {{ getLocalTimeString(payment.payment_at) }}</small>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>

        <u-price-input
          v-model="amount_input"
          :currency="payment.currency"
          variant="solo"
          :label="$t('payment_refund_dialog.refund_amount')"
          class="strong-field mt-5"
          @update:model-value="confirmed = false"
        ></u-price-input>

        <u-smart-verify
          v-model="confirmed"
          :true-title="$t('payment_refund_dialog.verify.title')"
          :true-description="$t('payment_refund_dialog.verify.description')"
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
            color="red"
            @click="confirmRefund"
            :loading="busy"
            :disabled="!amount_input || !confirmed || amount_input > max_amount"
          >
            <v-icon start>check</v-icon>

            {{ $t("payment_refund_dialog.action") }}

            <u-price
              v-if="amount_input"
              :amount="amount_input"
              :currency="payment.currency"
              class="ms-2"
            ></u-price>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import UPriceInput from "@selldone/components-vue/ui/price/input/UPriceInput.vue";
import USmartVerify from "@selldone/components-vue/ui/smart/verify/USmartVerify.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default defineComponent({
  name: "BOrderPaymentActionsRefundDialog",
  mixins: [DateMixin ],
  components: { USmartVerify, UPriceInput, UPrice },
  emits: ["update:modelValue", "payment-refunded"],
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
      amount_input: 0,
      confirmed: false,
      busy: false,
    };
  },

  computed: {
    gateway() {
      return this.payment.gateway;
    },

    max_amount() {
      return this.payment.amount - this.payment.refund_amount;
    },
  },

  watch: {
    modelValue(v) {
      if (!v) {
        this.amount_input = 0;
        this.confirmed = false;
      }
    },
  },
  created() {
    this.amount_input = this.suggestedAmount;
  },

  methods: {
    confirmRefund() {
      this.busy = true;

      axios
        .post(
          window.API.POST_PAYMENT_GATEWAY_ACTIONS_REFUND(
            this.payment.shop_id,
            this.gateway.code,
            this.payment.id,
          ),
          {
            amount: this.amount_input,
          },
        )
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);

          Object.assign(this.payment, data.payment);
          this.$emit("payment-refunded", data.amount);
          this.$emit("update:modelValue", false);

          NotificationService.showSuccessAlert(
            null,
            "The payment has been refunded successfully.",
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
});
</script>

<style scoped lang="scss"></style>

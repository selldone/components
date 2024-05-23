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
  <div class="widget shadow my-3 mx-1 mx-md-3 text-start" v-bind="$attrs">
    <!-- █████████████████████ Header █████████████████████ -->

    <s-widget-header
      :add-caption="
        IS_VENDOR_PANEL
          ? $t('order_vendor_payment.my_wallets')
          : $t('order_vendor_payment.vendor_wallets')
      "
      :title="$t('process_center.payment_widget.title')"
      :to="
        IS_VENDOR_PANEL
          ? {
              name: 'VPageVendorPayments',
            }
          : {
              name: 'BPageMarketplaceWallets',
              query: { vendor_id: vendorOrder.vendor_id },
            }
      "
      add-icon="open_in_new"
      add-text
      icon="payment"
      icon-color="#111"
      target="_blank"
    >
    </s-widget-header>
    <v-spacer></v-spacer>

    <!-- █████████████████████ Transactions █████████████████████ -->
    <v-list-subheader
      >{{ $t("order_vendor_payment.message") }}
    </v-list-subheader>

    <div class="max-widget-width mx-auto my-3">
      <u-pods-panel dense small>
        <u-pod-node
          :image="type.basket"
          :title="$t('global.commons.order')"
        ></u-pod-node>
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node icon="wallet" title="Vendor Wallet"></u-pod-node>
        <u-pod-wire color="#fff" forward></u-pod-wire>
        <u-pod-node
          color="#fff"
          icon="account_balance"
          title="Vendor Account"
        ></u-pod-node>
      </u-pods-panel>
    </div>

    <v-table class="rounded-lg bg-table-gray">
      <template v-slot:default>
        <tbody class="text-start">
          <template
            v-for="transaction in transactions"
            :key="'t' + transaction.id"
          >
            <tr>
              <td :title="$t('global.commons.amount')" class="min-width-150">
                <v-icon class="me-1" color="#333">wallet</v-icon>
                <u-price
                  :amount="transaction.amount"
                  :currency="transaction.currency"
                ></u-price>
              </td>
              <td :title="$t('global.commons.officer')">
                <v-avatar
                  v-if="transaction.officer_id"
                  class="avatar-gradient -thin -staff"
                  size="24"
                >
                  <v-img :src="getUserAvatar(transaction.officer_id)" />
                </v-avatar>
                <small v-else>System</small>
              </td>
              <td :title="$t('global.commons.note')" class="min-width-200">
                {{ transaction.note }}
              </td>

              <td v-if="IS_MARKETPLACE_OWNER" class="text-end">
                <v-btn
                  v-if="transaction.amount > 0"
                  color="nbt"
                  size="small"
                  @click="showRefundVendorOrderDialog()"
                >
                  <v-icon class="me-1" size="small"
                    >remove_shopping_cart
                  </v-icon>
                  Refund order
                </v-btn>
              </td>
            </tr>
          </template>
        </tbody>
      </template>
    </v-table>

    <!-- █████████████████████ Payments █████████████████████ -->
    <template v-if="payments?.length">
      <v-list-subheader class="mt-5"
        >This is a list of automatic payouts to your connected bank account.
        Please note that only automatic payouts will be displayed here, and
        manual payouts will not be shown.
      </v-list-subheader>

      <div class="max-widget-width mx-auto my-3">
        <u-pods-panel dense small>
          <u-pod-node
            :image="type.basket"
            :title="$t('global.commons.order')"
            color="#fff"
          ></u-pod-node>
          <u-pod-wire color="#fff" forward></u-pod-wire>
          <u-pod-node icon="wallet" title="Vendor Wallet"></u-pod-node>
          <u-pod-wire forward></u-pod-wire>
          <u-pod-node
            icon="account_balance"
            title="Vendor Account"
          ></u-pod-node>
        </u-pods-panel>
      </div>

      <v-table class="rounded-lg bg-table-gray">
        <template v-slot:default>
          <tbody class="text-start">
            <template v-for="payment in payments" :key="'p' + payment.id">
              <tr>
                <td :title="$t('global.commons.amount')" class="min-width-150">
                  <v-icon class="me-1" color="#333">account_balance</v-icon>
                  <u-price
                    :amount="payment.amount"
                    :currency="payment.currency"
                  ></u-price>
                </td>
                <td :title="$t('global.commons.officer')">
                  <v-avatar
                    v-if="payment.staff_id"
                    class="avatar-gradient -thin -staff"
                    size="24"
                  >
                    <v-img :src="getUserAvatar(payment.staff_id)" />
                  </v-avatar>
                  <small v-else>System</small>
                </td>
                <td
                  :title="$t('global.commons.note')"
                  class="min-width-200 py-1"
                >
                  {{ payment.note }}
                  <div v-if="payment.meta">
                    <v-chip
                      v-for="(value, key) in payment.meta"
                      :key="key"
                      :title="`Click to copy ${value}`"
                      class="ma-1 pa-1 ms-0"
                      color="#fafafa"
                      label
                      size="small"
                      variant="flat"
                      @click="copyToClipboard(payment.meta)"
                      ><small class="mx-1">{{ getName(key) }}: </small>
                      {{ value }}
                    </v-chip>
                  </div>
                </td>
                <td v-if="IS_MARKETPLACE_OWNER" class="text-end">
                  <v-btn
                    color="nbt"
                    size="small"
                    @click="showReversalDialog(payment)"
                  >
                    <v-icon class="me-1" size="small">move_up</v-icon>
                    Reversal transfer
                  </v-btn>
                </td>
              </tr>

              <tr
                v-for="(reversal, i) in payment.reversal_detail"
                :key="'p' + payment.id + '-' + i"
                title="Reversal transferred fund."
              >
                <td>
                  <v-icon class="me-1" color="#333">move_up</v-icon>
                  <u-price
                    :amount="-reversal.amount"
                    :currency="reversal.currency"
                  ></u-price>
                </td>
                <td>
                  <v-avatar
                    v-if="reversal.user_id"
                    class="avatar-gradient -thin -staff"
                    size="24"
                  >
                    <v-img :src="getUserAvatar(reversal.user_id)" />
                  </v-avatar>
                  <small v-else>System</small>
                </td>
                <td>
                  {{ reversal.reason }}
                </td>

                <td v-if="IS_MARKETPLACE_OWNER"></td>
              </tr>
            </template>
          </tbody>
        </template>
      </v-table>
    </template>
  </div>

  <!-- ███████████████████████ Reveal transfer fund (Payment)███████████████████████ -->
  <v-dialog
    v-model="dialog_reversal"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-vendor-payout-reverse
      v-if="dialog_reversal_pre"
      :payment="selected_payment_reversal"
      :shop="shop"
      @close="dialog_reversal = false"
      @payment="
        (payment) => {
          AddOrUpdateItemByID(vendorOrder.payments, payment);
        }
      "
    ></b-vendor-payout-reverse>
  </v-dialog>

  <!-- ███████████████████████ Refund vendor order (Transaction + Payment) ███████████████████████ -->
  <v-dialog
    v-model="dialog_refund"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-vendor-order-refund
      v-if="dialog_refund_pre"
      :shop="shop"
      :vendor-order="vendorOrder"
      @close="dialog_refund = false"
      @add:transaction="
        (transaction) => {
          AddOrUpdateItemByID(vendorOrder.transactions, transaction);
        }
      "
    ></b-vendor-order-refund>
  </v-dialog>
</template>

<script>
import BVendorPayoutReverse from "../../../vendor/payout/reverse/BVendorPayoutReverse.vue";
import BVendorOrderRefund from "../../../vendor/order/refund/BVendorOrderRefund.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BOrderVendorPaymentManagement",
  components: {
    UPodWire,
    UPodNode,
    UPodsPanel,
    BVendorOrderRefund,
    BVendorPayoutReverse,
  },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    vendorOrder: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      dialog_reversal: false,
      dialog_reversal_pre: false,
      selected_payment_reversal: null,

      dialog_refund: false,
      dialog_refund_pre: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
    IS_MARKETPLACE_OWNER() {
      return !this.IS_VENDOR_PANEL;
    },

    payments() {
      return this.vendorOrder.payments;
    },

    transactions() {
      return this.vendorOrder.transactions;
    },

    type() {
      return ProductType[this.vendorOrder.type];
    },
  },
  methods: {
    showReversalDialog(payment) {
      this.selected_payment_reversal = payment;
      this.dialog_reversal_pre = false;
      this.$nextTick(() => {
        this.dialog_reversal_pre = true;
        this.dialog_reversal = true;
      });
    },

    showRefundVendorOrderDialog() {
      this.dialog_refund_pre = false;
      this.$nextTick(() => {
        this.dialog_refund_pre = true;
        this.dialog_refund = true;
      });
    },
  },
};
</script>

<style scoped></style>

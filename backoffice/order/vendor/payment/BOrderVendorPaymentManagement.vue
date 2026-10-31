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
  <section v-if="modern" class="sd-modern-widget b-vendor-payment-modern text-start" v-bind="$attrs">
    <header class="b-vendor-payment-modern__header">
      <div class="b-vendor-payment-modern__heading">
        <b-vendor-order-icon name="wallet-cards" :size="20" />
        <div>
          <h2 class="sd-modern-title-text">{{ $t('process_center.payment_widget.title') }}</h2>
          <p class="sd-modern-subtitle">
            {{ $t('order_vendor_payment.modern.subtitle') }}
            <v-tooltip location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('order_vendor_payment.modern.help_title')">
                  <b-vendor-order-icon name="info" :size="14" />
                </v-btn>
              </template>
              {{ $t('order_vendor_payment.modern.help') }}
            </v-tooltip>
          </p>
        </div>
      </div>
      <v-btn
        :to="IS_VENDOR_PANEL ? { name: 'VPageVendorPayments' } : { name: 'BPageMarketplaceWallets', query: { vendor_id: vendorOrder.vendor_id } }"
        target="_blank"
        rel="noopener noreferrer"
        class="sd-modern-button sd-modern-button--inline b-vendor-payment-modern__wallet-link"
        color="primary"
        variant="text"
      >
        {{ $t(IS_VENDOR_PANEL ? 'order_vendor_payment.my_wallets' : 'order_vendor_payment.vendor_wallets') }}
        <b-vendor-order-icon name="arrow-up-right" :size="14" class="ms-1" />
      </v-btn>
    </header>

    <div class="b-vendor-payment-modern__flow" role="group" :aria-label="$t('order_vendor_payment.modern.help_title')">
      <div class="b-vendor-payment-modern__node">
        <span class="b-vendor-payment-modern__art"><img :src="type.basket" alt="" width="22" height="25" /></span>
        <span>{{ $t('global.commons.order') }}</span>
      </div>
      <span class="b-vendor-payment-modern__edge" aria-hidden="true" />
      <div class="b-vendor-payment-modern__node">
        <span class="b-vendor-payment-modern__art"><b-vendor-order-icon name="wallet-cards" :size="20" /></span>
        <span>{{ $t('order_vendor_payment.modern.vendor_wallet') }}</span>
      </div>
      <span class="b-vendor-payment-modern__edge" aria-hidden="true" />
      <div class="b-vendor-payment-modern__node">
        <span class="b-vendor-payment-modern__art"><b-vendor-order-icon name="landmark" :size="20" /></span>
        <span>{{ $t('order_vendor_payment.modern.vendor_account') }}</span>
      </div>
    </div>

    <table v-if="transactions?.length" class="sd-modern-table b-vendor-payment-modern__records">
      <colgroup><col /><col /><col /><col /><col v-if="IS_MARKETPLACE_OWNER" /></colgroup>
      <thead><tr>
        <th>{{ $t('global.commons.amount') }}</th><th>{{ $t('global.commons.officer') }}</th><th>{{ $t('global.commons.note') }}</th><th>{{ $t('global.sort.date') }}</th><th v-if="IS_MARKETPLACE_OWNER">{{ $t('global.commons.actions') }}</th>
      </tr></thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="'t' + transaction.id">
          <td :data-label="$t('global.commons.amount')"><u-price :amount="transaction.amount" :currency="transaction.currency" /></td>
          <td :data-label="$t('global.commons.officer')">
            <v-avatar v-if="transaction.officer_id" class="avatar-gradient -thin -staff" size="24"><v-img :src="getUserAvatar(transaction.officer_id)" /></v-avatar>
            <span v-else>{{ $t('global.commons.system') }}</span>
          </td>
          <td :data-label="$t('global.commons.note')">{{ transaction.note }}</td>
          <td :data-label="$t('global.sort.date')">{{ getFromNowString(transaction.created_at) }}<small>{{ getLocalTimeString(transaction.created_at) }}</small></td>
          <td v-if="IS_MARKETPLACE_OWNER" :data-label="$t('global.commons.actions')">
            <v-btn v-if="transaction.amount > 0" class="sd-modern-button sd-modern-button--compact" variant="outlined" @click="showRefundVendorOrderDialog()"><b-vendor-order-icon name="package-open" :size="16" class="me-2" />{{ $t('order_vendor_payment.refund_order_action') }}</v-btn>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="transactions?.length === 0" class="b-vendor-payment-modern__empty">{{ $t('order_vendor_payment.modern.empty') }}</p>

    <section v-if="payments?.length" class="b-vendor-payment-modern__payouts">
      <h3>{{ $t('order_vendor_payment.modern.payouts') }}</h3>
      <p class="sd-modern-subtitle">{{ $t('order_vendor_payment.modern.payouts_subtitle') }}</p>
      <table class="sd-modern-table b-vendor-payment-modern__records">
        <colgroup><col /><col /><col /><col /><col v-if="IS_MARKETPLACE_OWNER" /></colgroup>
        <thead><tr>
          <th>{{ $t('global.commons.amount') }}</th><th>{{ $t('global.commons.officer') }}</th><th>{{ $t('global.commons.note') }}</th><th>{{ $t('global.sort.date') }}</th><th v-if="IS_MARKETPLACE_OWNER">{{ $t('global.commons.actions') }}</th>
        </tr></thead>
        <tbody>
          <template v-for="payment in payments" :key="'p' + payment.id">
            <tr>
              <td :data-label="$t('global.commons.amount')"><u-price :amount="payment.amount" :currency="payment.currency" /></td>
              <td :data-label="$t('global.commons.officer')">
                <v-avatar v-if="payment.staff_id" class="avatar-gradient -thin -staff" size="24"><v-img :src="getUserAvatar(payment.staff_id)" /></v-avatar>
                <span v-else>{{ $t('global.commons.system') }}</span>
              </td>
              <td :data-label="$t('global.commons.note')">
                {{ payment.note }}
                <div v-if="payment.meta" class="b-vendor-payment-modern__metadata">
                  <button v-for="(value, key) in payment.meta" :key="key" type="button" :aria-label="$t('order_vendor_payment.modern.copy_metadata')" @click="copyToClipboard(payment.meta)">
                    <span>{{ getName(key) }}:</span> {{ value }}
                    <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('order_vendor_payment.modern.copy_metadata') }}</v-tooltip>
                  </button>
                </div>
              </td>
              <td :data-label="$t('global.sort.date')"><template v-if="payment.created_at">{{ getFromNowString(payment.created_at) }}<small>{{ getLocalTimeString(payment.created_at) }}</small></template><span v-else>—</span></td>
              <td v-if="IS_MARKETPLACE_OWNER" :data-label="$t('global.commons.actions')"><v-btn class="sd-modern-button sd-modern-button--compact" variant="outlined" @click="showReversalDialog(payment)"><b-vendor-order-icon name="rotate-ccw" :size="16" class="me-2" />{{ $t('order_vendor_payment.reversal_transfer_action') }}</v-btn></td>
            </tr>
            <tr v-for="(reversal, index) in payment.reversal_detail" :key="'p' + payment.id + '-r' + index">
              <td :data-label="$t('global.commons.amount')"><u-price :amount="-reversal.amount" :currency="reversal.currency" /><small>{{ $t('order_vendor_payment.modern.reversal') }}</small></td>
              <td :data-label="$t('global.commons.officer')">
                <v-avatar v-if="reversal.user_id" class="avatar-gradient -thin -staff" size="24"><v-img :src="getUserAvatar(reversal.user_id)" /></v-avatar>
                <span v-else>{{ $t('global.commons.system') }}</span>
              </td>
              <td :data-label="$t('global.commons.note')">{{ reversal.reason }}</td>
              <td :data-label="$t('global.sort.date')"><template v-if="reversal.date">{{ getFromNowString(reversal.date) }}<small>{{ getLocalTimeString(reversal.date) }}</small></template><span v-else>—</span></td>
              <td v-if="IS_MARKETPLACE_OWNER" />
            </tr>
          </template>
        </tbody>
      </table>
    </section>
  </section>
  <div v-else class="widget shadow my-3 mx-1 mx-md-3 text-start" v-bind="$attrs">
    <!-- █████████████████████ Header █████████████████████ -->

    <u-widget-header
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
    </u-widget-header>
    <v-spacer></v-spacer>

    <!-- █████████████████████ Vendor Wallet Transactions █████████████████████ -->
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


   <div class="position-relative">
     <u-arrow   v-if="$vuetify.display.mdAndUp" direction="down" class="position-absolute op-0-2" style="top:0;bottom: 0;right: -48px" :top-label="$t('global.commons.old')" :bottom-label="$t('global.commons.new')"></u-arrow>

     <v-table class="rounded-lg bg-table-gray ">

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
             <td class="min-width-200">
               {{ getFromNowString(transaction.created_at) }}<br />
               <small>
                 {{ getLocalTimeString(transaction.created_at) }}
               </small>
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

                 {{ $t("order_vendor_payment.refund_order_action") }}
               </v-btn>
             </td>

           </tr>
         </template>
         </tbody>
       </template>
     </v-table>
   </div>

    <!-- █████████████████████ Payments █████████████████████ -->
    <template v-if="payments?.length">
      <v-list-subheader class="mt-5">
        {{ $t("order_vendor_payment.automatic_payout_list.subtitle") }}
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
                  <small v-else>{{ $t("global.commons.system") }}</small>
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

                    {{ $t("order_vendor_payment.reversal_transfer_action") }}
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

<script lang="ts">
import BVendorPayoutReverse from "../../../vendor/payout/reverse/BVendorPayoutReverse.vue";
import BVendorOrderRefund from "../../../vendor/order/refund/BVendorOrderRefund.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import UArrow from "@selldone/components-vue/ui/arrow/UArrow.vue";
import BVendorOrderIcon from "../../../process-center/list/icon/BVendorOrderIcon.vue";

export default {
  name: "BOrderVendorPaymentManagement",
  mixins: [DateMixin],
  components: {
    BVendorOrderIcon,
    UArrow,
    UPodWire,
    UPodNode,
    UPodsPanel,
    BVendorOrderRefund,
    BVendorPayoutReverse,
  },
  props: {
    modern: { type: Boolean, default: false },
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

<style scoped lang="scss">
.b-vendor-payment-modern {
  &.sd-modern-widget { padding: 20px; margin-block-end: 18px; border-radius: 16px; font-family: inherit; font-size: 13px; line-height: 20px; }
  &__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-block-end: 15px; }
  &__heading { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
  &__heading > svg { margin-block-start: 2px; color: var(--sd-modern-muted); }
  h2.sd-modern-title-text { margin: 0; font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.25px; }
  .sd-modern-subtitle { margin: 5px 0 0; font-size: 12px; font-weight: 400; line-height: 18px; }
  &__wallet-link.sd-modern-button--inline { flex-shrink: 0; font-size: 12px; font-weight: 400; line-height: 18px; }
  &__flow { display: flex; align-items: center; justify-content: center; max-width: 425px; margin: 19px auto 21px; }
  &__node { display: flex; align-items: center; flex-direction: column; gap: 7px; min-width: 94px; font-size: 11px; line-height: 16px; text-align: center; }
  &__art { position: relative; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); }
  &__art::after { content: ''; position: absolute; inset: 0; border: 1px solid rgb(var(--v-theme-primary)); border-radius: inherit; pointer-events: none; }
  // Only the blue border counter-inverts; the tile follows the content surface.
  .smart-invert &__art::after { filter: invert(1); }
  &__art img { object-fit: contain; }
  &__edge { height: 1px; min-width: 16px; max-width: 70px; flex: 1; margin-block-end: 23px; background: var(--sd-modern-border); }
  &__records { width: 100%; table-layout: fixed; border-collapse: collapse; }
  &__records col:nth-child(1) { width: 19%; }
  &__records col:nth-child(2) { width: 14%; }
  &__records col:nth-child(3) { width: 43%; }
  &__records col:nth-child(4) { width: 24%; }
  &__records:has(col:nth-child(5)) { table-layout: auto; col { width: auto; } }
  &__records th { padding: 8px 10px !important; }
  &__records td { padding: 12px 10px !important; vertical-align: top; font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  &__records th:first-child, &__records td:first-child { padding-inline-start: 0 !important; }
  &__records th:last-child, &__records td:last-child { padding-inline-end: 0 !important; }
  &__records td small { display: block; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  &__records :deep(.u--price) { font-size: 12px; font-weight: 500; line-height: 19px; white-space: nowrap; }
  &__empty { margin: 0; padding: 16px 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  &__payouts { margin-block-start: 24px; }
  &__payouts h3 { margin: 0; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__payouts > .sd-modern-subtitle { margin-block-end: 12px; }
  &__metadata { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-block-start: 4px; }
  &__metadata button { display: inline-flex; align-items: baseline; gap: 4px; max-width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; overflow-wrap: anywhere; }
  &__metadata button > span { color: var(--sd-modern-muted); }
  &__metadata button:hover { text-decoration: underline; }
  &__metadata button:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }

  @media (max-width: 600px) {
    &.sd-modern-widget { padding: 18px 16px; }
    &__header { flex-wrap: wrap; gap: 10px; }
    &__header > .v-btn { margin-inline-start: 30px; }
    &__node { min-width: 73px; }
    &__edge { min-width: 7px; }
    &__records, &__records tbody { display: block; width: 100%; }
    &__records colgroup, &__records thead { display: none; }
    &__records tr { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 14px 0; border-block-end: 1px solid var(--sd-modern-border); }
    &__records td { display: block; padding: 0 !important; border: 0 !important; }
    &__records td:nth-child(3), &__records td:nth-child(4), &__records td:nth-child(5) { grid-column: 1 / -1; }
    &__records td[data-label]::before { content: attr(data-label); display: block; margin-block-end: 5px; }
    &__metadata button { min-height: 44px; }
  }
  @media (pointer: coarse) { &__metadata button { min-height: 44px; } }
}
</style>

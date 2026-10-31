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
  <div
    :class="modern ? ['sd-modern-widget b-order-cart-modern', { 'b-order-cart-modern--vendor': modernVendorPanel, 'b-order-cart-modern--pos': isPOS }] : { '-activated': in_this_step, 'widget shadow my-3 mx-1 mx-md-3': true }"
    class="text-start"
  >
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Header ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <u-widget-header
      :icon="modernVendorPanel ? undefined : 'shopping_basket'"
      :class="{ 'sd-modern-form-header b-order-cart-modern__header': modern }"
      :title="$t(modernVendorPanel ? 'vendor_fulfillment.items' : modern ? 'process_center.modern.basket_title' : 'process_center.basket_items')"
    >
      <template v-if="modernVendorPanel" #icon><b-vendor-order-icon name="shopping-basket" :size="20" class="b-order-cart-modern__vendor-heading-icon" /></template>
      <template v-slot:append-actions>
        <small
          :title="'Checkout date: ' + getLocalTimeString(basket.reserved_at)"
          class="text-capitalize my-auto"
        >
          {{ getFromNowString(basket.reserved_at) }}</small
        >
      </template>
    </u-widget-header>

    <p v-if="modern" class="sd-modern-subtitle b-order-cart-modern__subtitle">
      <span>{{ $t(isModernFulfillment ? 'process_center.modern.fulfillment_basket_subtitle' : modernVendorPanel ? 'vendor_fulfillment.items_subtitle' : isModernHyper ? 'process_center.modern.hyper_basket_subtitle' : isPOS ? 'process_center.modern.pos_basket_subtitle' : isFile ? 'process_center.modern.file_basket_subtitle' : isService ? 'process_center.modern.service_basket_subtitle' : isSubscription ? 'process_center.modern.subscription_basket_subtitle' : 'process_center.modern.basket_subtitle') }}</span>
      <v-tooltip location="top" content-class="sd-modern-tooltip text-start" :open-on-click="true">
        <template #activator="{ props }">
          <v-btn v-bind="props" :icon="modernVendorPanel ? true : 'info_outline'" variant="text" class="sd-modern-icon-button sd-modern-info-button b-order-cart-modern__help" :aria-label="$t(isModernHyper ? 'process_center.modern.hyper_basket_help' : 'process_center.modern.basket_help')"><b-vendor-order-icon v-if="modernVendorPanel" name="info" :size="14" /></v-btn>
        </template>
        {{ isModernFulfillment ? $t('process_center.modern.fulfillment_basket_help') : isModernHyper ? $t('process_center.modern.hyper_basket_help') : isPOS ? $t('process_center.modern.pos_basket_help') : isFile ? $t('process_center.modern.file_basket_help') : isService ? $t('process_center.modern.service_basket_help') : isSubscription ? $t('process_center.modern.subscription_basket_help') : $tm('process_center.basket_list.checklist').join(' ') }}
      </v-tooltip>
    </p>
    <v-list-subheader v-else class="px-0 text-start">
      <span v-html="$t('process_center.basket_list.message')"></span>
    </v-list-subheader>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Compact cart items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <component
      :is="modern ? 'button' : 'div'"
      :type="modern ? 'button' : undefined"
      :aria-expanded="modern ? force_show_items : undefined"
      :class="modern ? 'b-order-cart-modern__summary' : 'expand-button mb-2 mt-3 p-3 widget-hover rounded-xl position-relative pointer-pointer rounded-xl overflow-hidden'"
      @click="force_show_items = !force_show_items"
    >
      <span :class="modern ? 'b-order-cart-modern__summary-label' : 'absolute-top-end text-muted px-2 small'"
        ><b-vendor-order-icon v-if="modernVendorPanel" name="chevron-down" :size="15" :class="{ 'rotate-180': force_show_items }" />
        <v-icon v-else
          :class="{ 'rotate-180': force_show_items }"
          class="mx-1 transition-all-400"
          >expand_more</v-icon
        >

        {{ modernVendorPanel ? $t('vendor_fulfillment.items_toggle', { count: items.length }) : $t("process_center.basket_list.list_of_items") }}
      </span>

      <b-order-cart-items-circle
        v-if="!modernVendorPanel || !force_show_items"
        :class="modern ? 'b-order-cart-modern__preview' : 'd-flex overflow-auto pt-5 pb-2'"
        :delivery-state="basket.delivery_state"
        :items="items"
        :readonly="cartReadonly"
      >
      </b-order-cart-items-circle>
    </component>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ List of Cart Items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-expand-transition>
      <div v-show="force_show_items">
        <b-order-cart
          ref="basket_items_list"
          :checkable="!isActionDisabled && !cartReadonly"
          :is-role-panel="isRolePanel"
          :items="items"
          :readonly="cartReadonly"
          :select-all="initial_select_all"
          :shop="shop"
          :basket="basket"
          :type="basket.type"
          :modern="modern"
          @fetch-order="$emit('fetch-order')"
        />
      </div>
    </v-expand-transition>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Lottery Prize Items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-row
      v-if="lottery_order && lottery_order.product"
      align="center"
      class="lottery-prize"
      no-gutters
    >
      <v-col class="flex-grow-0 p-2">
        <router-link
          :to="
            isRolePanel
              ? {}
              : {
                  name: IS_VENDOR_PANEL
                    ? 'Vendor_ProductDashboard'
                    : 'BPageProductDashboard',
                  params: { product_id: lottery_order.product.id },
                }
          "
        >
          <v-img
            :src="getProductImage(lottery_order.product_id)"
            aspect-ratio="1"
            class="mx-2"
            max-height="84px"
            max-width="84px"
            min-height="42px"
            min-width="42px"
            style="border-radius: 50%"
          />
        </router-link>
      </v-col>
      <v-col class="p-2">
        <p class="font-weight-bold my-1">{{ lottery_order.product.title }}</p>
        <p class="m-0">
          {{ $t("process_center.basket_list.lottery_prize_inform") }}
        </p>

        <variant-item-view-micro
          v-if="lottery_order.variant"
          :product-variant="lottery_order.variant"
        ></variant-item-view-micro>
      </v-col>
      <v-col class="flex-grow-0 p-2">
        <v-icon>fa:fas fa-dice</v-icon>
      </v-col>
    </v-row>

    <v-expand-transition>
      <div
        v-if="
          !isModernHyper && checked &&
          payment &&
          (need_to_refund ||
            ((payment?.refund_amount || payment?.refunds?.length) && !busy))
        "
        class="text-start"
      >
        <!-- Refund/Charge Customer -->
        <v-row align="stretch" class="my-0">
          <v-col cols="12" sm="6">
            <v-card variant="flat" class="pa-2 h-100">
              <div class="text-subtitle-2 d-flex align-center text-uppercase">
                <img
                  class="me-2"
                  height="24"
                  src="../../../../assets/icons/refund-calculator.svg"
                  width="24"
                />

                {{
                  need_to_refund > 0
                    ? $t("process_center.basket_list.need_to_refund.title")
                    : need_to_refund < 0
                      ? $t("process_center.basket_list.need_payback.title")
                      : $t("process_center.basket_list.need_no_refund.title")
                }}
              </div>
              <small v-if="need_to_refund > 0">
                {{ $t("process_center.basket_list.need_to_refund.message") }}
              </small>
              <small v-else-if="need_to_refund < 0">
                {{ $t("process_center.basket_list.need_payback.message") }}
              </small>

              <u-pods-panel dense class="py-2" color="#000" dot-color="#FFC107">
                <template v-if="IS_MARKETPLACE">
                  <u-pod-node icon="storefront" title="Vendors"> </u-pod-node>

                  <u-pod-wire
                    :forward="need_to_refund > 0"
                    :backward="need_to_refund < 0"
                  >
                    <template v-slot:forward>
                      <u-price
                        :amount="Math.abs(need_to_refund)"
                        :currency="basket.currency"
                        compact
                        class="absolute-top-center mt-1"
                      ></u-price>
                    </template>
                    <template v-slot:backward>
                      <u-price
                        :amount="Math.abs(need_to_refund)"
                        :currency="basket.currency"
                        compact
                        class="absolute-top-center mt-1"
                      ></u-price>
                    </template>
                  </u-pod-wire>
                </template>

                <u-pod-node
                  :image="getShopImagePath(shop.icon, 96)"
                  :title="shop.title"
                >
                </u-pod-node>
                <u-pod-wire
                  :forward="need_to_refund > 0"
                  :backward="need_to_refund < 0"
                >
                  <template v-slot:forward>
                    <u-price
                      :amount="Math.abs(need_to_refund)"
                      :currency="basket.currency"
                      compact
                      class="absolute-top-center mt-1"
                    ></u-price>
                  </template>
                  <template v-slot:backward>
                    <u-price
                      :amount="Math.abs(need_to_refund)"
                      :currency="basket.currency"
                      compact
                      class="absolute-top-center mt-1"
                    ></u-price>
                  </template>
                </u-pod-wire>
                <u-pod-node
                  icon="person"
                  :image="getUserAvatar(basket.user_id)"
                  :title="basket.buyer?.name"
                >
                </u-pod-node>
              </u-pods-panel>

              <v-card-actions>
                <div>
                  <u-price
                    :amount="need_to_refund"
                    :currency="basket.currency"
                    large
                  ></u-price>
                  <div class="small">
                    {{ $t("global.commons.items") }}:
                    <u-price
                      :amount="need_to_refund_items"
                      :currency="basket.currency"
                    ></u-price>
                    /
                    {{ $t("global.commons.tax") }}:
                    <u-price
                      :amount="need_to_refund_tax"
                      :currency="basket.currency"
                    ></u-price>
                  </div>
                </div>
                <v-spacer></v-spacer>
                <div>
                  <b-order-payment-actions-refund-button
                    v-if="!isRolePanel && need_to_refund > 0"
                    :suggested-amount="refund_by_payment"
                    :payment="payment"
                  >
                  </b-order-payment-actions-refund-button>
                  <div v-if="refund_by_giftcards" class="small">
                    Refund giftcards:
                    <u-price
                      :amount="refund_by_giftcards"
                      :currency="basket.currency"
                    ></u-price>
                  </div>
                  <div class="small">
                    Refund payment:
                    <u-price
                      :amount="refund_by_payment"
                      :currency="basket.currency"
                    ></u-price>
                  </div>
                </div>
              </v-card-actions>
              <small>
                <v-icon class="me-1">warning_amber</v-icon>
                {{
                  $t(
                    "process_center.basket_list.need_to_refund.calculated_approximately",
                  )
                }}
              </small>
            </v-card>
          </v-col>
          <v-col v-if="gateway?.actions?.includes('refund')" cols="12" sm="6">
            <v-card variant="flat" class="pa-2 h-100">
              <div class="text-subtitle-2 d-flex align-center text-uppercase">
                <img
                  class="me-2"
                  height="24"
                  src="../../../../assets/icons/refund.svg"
                  width="24"
                />

                {{ $t("process_center.basket_list.total_refund.title") }}
              </div>
              <small>
                {{ $t("process_center.basket_list.total_refund.message") }}
              </small>

              <v-card-actions>
                <u-price
                  :amount="payment.refund_amount"
                  :currency="basket.currency"
                  large
                ></u-price>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Seller Actions ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
    <div v-if="modern && file_access_state" class="b-order-cart-modern__file-access">
      <v-icon size="20" aria-hidden="true">cloud_download</v-icon>
      <div>
        <p class="b-order-cart-modern__file-access-title">{{ $t(file_access_state === PhysicalOrderStates.ToCustomer.code ? 'process_center.modern.file_access_requested' : 'process_center.modern.file_access_ready') }}</p>
        <p>{{ $t(file_access_state === PhysicalOrderStates.ToCustomer.code ? 'process_center.modern.file_access_requested_message' : 'process_center.modern.file_access_ready_message') }}</p>
      </div>
    </div>

    <div v-if="!isModernHyper && !(modern && isPOS && readonly)" :class="{ 'b-order-cart-modern__actions': modern }" class="text-start">
      <p v-if="modern" class="b-order-cart-modern__guidance">
        {{ $t(isModernFulfillment ? 'process_center.modern.fulfillment_basket_guidance' : isFile ? 'process_center.modern.file_basket_guidance' : isService ? 'process_center.modern.service_basket_guidance' : isSubscription ? 'process_center.modern.subscription_basket_guidance' : 'process_center.modern.basket_guidance') }}
      </p>
      <v-btn
        v-if="!readonly"
        :class="{ disabled: isActionDisabled, 'sd-modern-button': modern, 'sd-modern-button--x-large': modern && in_this_step && !isConfirmDisabled, 'sd-modern-button--primary': modernVendorPanel && in_this_step && !isConfirmDisabled }"
        :disabled="modern ? isConfirmDisabled : undefined"
        :color="modern ? in_this_step && !isConfirmDisabled ? 'primary' : undefined : in_this_step ? 'primary' : '#000'"
        :loading="busy"
        :size="in_this_step && (!modern || !isConfirmDisabled) ? 'x-large' : undefined"
        :variant="modern ? in_this_step && !isConfirmDisabled ? 'flat' : 'outlined' : !in_this_step ? 'outlined' : 'elevated'"
        class="mt-2 tnt"
        rounded
        @click="orderConfirm"
      >
        <b-vendor-order-icon v-if="modernVendorPanel" :name="basket.delivery_state === PhysicalOrderStates.CheckQueue.code ? 'check' : 'save'" :size="in_this_step && !isConfirmDisabled ? 20 : 16" class="me-2" />
        <v-icon v-else-if="modern" start>{{ basket.delivery_state === PhysicalOrderStates.CheckQueue.code ? 'check' : 'save' }}</v-icon>
        <v-icon v-else-if="checked" start>check</v-icon>
        <v-icon v-else-if="in_this_step" :class="{ 'blink-me': !modern }" start
          >fiber_manual_record
        </v-icon>

        {{
          !isActionDisabled
            ? basket.delivery_state === PhysicalOrderStates.CheckQueue.code
              ? $t(modern ? 'process_center.modern.confirm_order' : 'process_center.basket_list.action')
              : $t("process_center.basket_list.apply_change_action")
            : $t("process_center.basket_list.cant_apply_change")
        }}
      </v-btn>

      <ul v-if="!modern" class="tips mt-4">
        <li
          v-for="item in $tm('process_center.basket_list.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import BOrderCart from "../../cart/BOrderCart.vue";
import VariantItemViewMicro from "../../../../storefront/product/variant/VariantItemViewMicro.vue";
import { Basket, BasketItem, PriceHelper } from "@selldone/core-js";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import BOrderPaymentActionsRefundButton from "@selldone/components-vue/backoffice/order/payment/actions/refund/button/BOrderPaymentActionsRefundButton.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import BVendorOrderIcon from "../../../process-center/list/icon/BVendorOrderIcon.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import UPodsPanel from "@selldone/components-vue/ui/pod/panel/UPodsPanel.vue";
import UPodNode from "@selldone/components-vue/ui/pod/node/UPodNode.vue";
import UPodCut from "@selldone/components-vue/ui/pod/cut/UPodCut.vue";
import UPodWire from "@selldone/components-vue/ui/pod/wire/UPodWire.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel.ts";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import BOrderCartItemsCircle from "@selldone/components-vue/backoffice/order/cart/items/circle/BOrderCartItemsCircle.vue";

export default {
  name: "BOrderDashboardCart",
  mixins: [DateMixin],
  inject: ["$vendor"],
  components: {
    BVendorOrderIcon,
    BOrderCartItemsCircle,
    UPodWire,
    UPodCut,
    UPodNode,
    UPodsPanel,
    UWidgetHeader,
    BOrderPaymentActionsRefundButton,
    UPrice,
    VariantItemViewMicro,
    BOrderCart,
  },
  emits: ["confirm-order","fetch-order"],
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
    readonly: {
      // For POS orders > Don't need to check items in the basket!
      default: false,
      type: Boolean,
    },

    isFulfillment: {
      // Drop shipping mode
      default: false,
      type: Boolean,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,
      force_show_items: this.modern && this.isRolePanel,
      busy: false,
    };
  },

  computed: {
    isModernFulfillment() {
      return this.modern && this.isFulfillment;
    },
    isModernHyper() {
      return this.modern && this.basket.type === "HYP" && !this.isFulfillment && !this.isRolePanel && !this.IS_VENDOR_PANEL;
    },
    modernVendorPanel() {
      return this.modern && !!this.IS_VENDOR_PANEL;
    },
    cartReadonly() {
      // Hyper records a purchase; it has no item-confirmation workflow.
      return this.isModernHyper || this.readonly || (this.isModernFulfillment && (this.busy || !!this.basket.reject || this.basket.status !== Basket.Status.Payed.code)) || (this.modernVendorPanel && (this.busy || !!this.basket.reject || ![Basket.Status.Payed.code, Basket.Status.COD.code].includes(this.basket.status)));
    },
    isPOS() {
      return this.basket.type === "POS";
    },
    isSubscription() {
      return this.basket.type === ProductType.SUBSCRIPTION.code && !this.isFulfillment;
    },
    isService() {
      return this.basket.type === ProductType.SERVICE.code && !this.isFulfillment;
    },
    isFile() {
      return this.basket.type === ProductType.FILE.code && !this.isFulfillment;
    },
    file_access_state() {
      if (!this.isFile || this.basket.status !== Basket.Status.Payed.code || this.basket.reject) return null;
      return [this.PhysicalOrderStates.PreparingOrder.code, this.PhysicalOrderStates.ToCustomer.code]
        .includes(this.basket.delivery_state) ? this.basket.delivery_state : null;
    },
    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    items() {
      if (this.isFulfillment) return this.basket.items;
      return this.basket.items.filter((item) => !item.fulfillment_id);
    },

    lottery_order() {
      return this.basket.lottery_order;
    },

    checked() {
      return [
        Basket.PhysicalOrderStates.OrderConfirm.code,
        Basket.PhysicalOrderStates.PreparingOrder.code,
        Basket.PhysicalOrderStates.SentOrder.code,
        Basket.PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    in_this_step() {
      return (
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.CheckQueue.code &&
        [Basket.Status.Payed.code, Basket.Status.COD.code].includes(
          this.basket.status,
        )
      );
    },

    initial_select_all() {
      return (
        this.basket.delivery_state === this.PhysicalOrderStates.CheckQueue.code
      );
    },
    isActionDisabled() {
      return (
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.SentOrder.code ||
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.ToCustomer.code
      );
    },
    isConfirmDisabled() {
      return this.cartReadonly || this.busy || this.isActionDisabled || !!this.basket.reject ||
        ![Basket.Status.Payed.code, Basket.Status.COD.code].includes(this.basket.status);
    },

    showItems() {
      if (this.force_show_items) return true;
      if (!this.basket) return false;
      return (
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.CheckQueue.code ||
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },

    payment() {
      return this.basket.payment;
    },
    gateway() {
      return this.payment?.gateway;
    },
    need_to_refund() {
      const sum = this.need_to_refund_items + this.need_to_refund_tax;

      return PriceHelper.FixPrecisionForCurrency(
        sum - this.payment.refund_amount,
        this.payment.currency,
      );
    },

    portion_unavailable() {
      const sum_unavailable_items = this.basket.items.reduce((acc, item) => {
        if (!item.check) {
          // Totally not available:
          acc += item.price * item.count;
        } else {
          // Partial not available:
          acc +=
            item.price * -(item.count_adjustment ? item.count_adjustment : 0); // Negative count_adjustment: means less will be shipped | Positive count_adjustment: means more will bve shipped
        }
        return acc;
      }, 0);
      const sum_all_items = this.basket.items.reduce((acc, item) => {
        acc += item.price * item.count;
        return acc;
      }, 0);
      return sum_unavailable_items / sum_all_items;
    },
    need_to_refund_items() {
      return this.basket.price * this.portion_unavailable;
    },

    tax_included() {
      return this.basket.tax_included;
    },
    need_to_refund_tax() {
      if (this.tax_included) return 0;
      return this.basket.tax * this.portion_unavailable;
    },

    sum_payment_giftcards() {
      return this.basket.gift_cards.sumByKey("amount");
    },
    refund_by_giftcards() {
      if (this.need_to_refund < this.sum_payment_giftcards)
        return this.need_to_refund;
      return this.sum_payment_giftcards;
    },
    refund_by_payment() {
      return this.need_to_refund - this.refund_by_giftcards;
    },
  },
  created() {
    if (this.modernVendorPanel) this.force_show_items = true;
  },
  methods: {
    orderConfirm() {
      if (this.modern && this.isConfirmDisabled) return;
      let list = [];
      this.busy = true;

      this.$refs.basket_items_list.getCheckedItems().forEach((item) => {
        list.push(item.id);
      });

      this.$emit("confirm-order", {
        list: list,
        callback: (success: boolean, items: BasketItem[]) => {
          this.busy = false;

          // Real time update!
          if (items) {
            this.items.forEach((item) => {
              const new_item = items.find((i) => i.id === item.id);
              item.check = new_item.check;
            });
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-order-cart-modern {
  &.sd-modern-widget { padding: 20px; margin-block-end: 18px; border-radius: 16px; font-family: inherit; font-size: 13px; line-height: 1.5; }
  &.disabled { opacity: 1 !important; }
  &__file-access { display: flex; align-items: flex-start; gap: 11px; margin-block-start: 16px; padding-block: 18px; border-block-start: 1px solid var(--sd-modern-border); font-size: 12px; line-height: 18px; }
  &__file-access > .v-icon { flex: none; color: var(--sd-modern-muted); }
  &__file-access > div { min-width: 0; }
  &__file-access p { margin: 4px 0 0; max-width: 620px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  &__file-access p.b-order-cart-modern__file-access-title { margin: 0; color: rgb(var(--v-theme-on-surface)); font-weight: 500; }
  &__file-access + &__actions { margin-block-start: 0; }

  &__header { margin-block-end: 0; }
  &__header :deep(h2) { font-family: inherit; font-size: 18px; font-weight: 500; line-height: 24px; }
  &__header :deep(small) { color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; }
  &__subtitle { display: flex; align-items: center; gap: 4px; margin: 4px 0 16px; font-size: 12px; line-height: 18px; }
  &__help { pointer-events: auto; }
  &__summary { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; width: 100%; min-height: 64px; padding: 10px 12px; color: inherit; font: inherit; text-align: start; background: var(--sd-modern-inset); border: 1px solid var(--sd-modern-border); border-radius: 10px; }
  &__summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__summary-label { order: 2; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex: 1; font-size: 12px; }
  &__summary-label > .v-icon { order: 2; }
  &__preview { display: flex; flex: 0 1 auto; flex-wrap: wrap; min-width: 0; max-width: 100%; padding-block: 0 !important; padding-inline-end: 18px; overflow: visible !important; }
  &__preview :deep(.v-badge) { flex: 0 0 auto; }
  &__preview :deep(.v-avatar) { width: 36px !important; height: 36px !important; min-width: 36px !important; }
  &__actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; padding-block-start: 16px; margin-block-start: 16px; border-block-start: 1px solid var(--sd-modern-border); }
  &__guidance { flex: 1 1 220px; margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  &__actions > .v-btn { margin: 0 !important; }
  // Keep disabled flat-button overlays from darkening the quiet neutral surface.
  &__actions > .v-btn--disabled :deep(.v-btn__overlay) { opacity: 0; }
  .lottery-prize { color: inherit; background: var(--sd-modern-inset); }
  @media (max-width: 600px) { &.sd-modern-widget { padding: 17px 13px; } &__summary { gap: 8px; } }
  @media (max-width: 600px) {
    &--pos :deep(.b-order-cart-table-modern.sd-modern-data-table .v-data-table__tr--mobile > td:has(.b-order-cart-table-modern__product)) { grid-template-columns: minmax(0, 1fr); align-items: stretch; gap: 6px; }
    &--pos :deep(.b-order-cart-table-modern.sd-modern-data-table .v-data-table__tr--mobile > td:has(.b-order-cart-table-modern__product) > .v-data-table__td-value) { width: 100%; }
  }
}

.lottery-prize {
  text-align: start;
  background-color: #0f75ac;
  // box-shadow: inset 0 -1em 2em rgb(50, 161, 225),0 5px 45px 4px rgba(40, 169, 238, 0.99) !important;
  color: #fff;
  border-radius: 12px;
  margin: 12px 0;
}

/*
.expanded{
  width: calc(100vw - 28px);
  max-width: calc(100vw - 28px);
  left: calc(-50vw + 50% + 14px);


  @media only screen and (min-width: 1700px) {
    width: calc(1600px);
    max-width: calc(1600px);
    left: calc(-800px + 50%);
  }
}*/
.b-order-cart-modern--vendor {
  .b-order-cart-modern__vendor-heading-icon { margin-inline-end: 10px; color: var(--sd-modern-muted); }
  .b-order-cart-modern__summary { min-height: 32px; padding: 5px 0; gap: 10px; border: 0; border-radius: 0; background: transparent; }
  .b-order-cart-modern__summary-label { flex: 0 1 auto; order: 0; justify-content: flex-start; gap: 6px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  .b-order-cart-modern__actions { justify-content: flex-start; gap: 12px; border: 0; padding-block-start: 0; margin-block-start: 18px; }
  .b-order-cart-modern__guidance { order: 1; flex: 0 1 430px; line-height: 19px; }
  @media (max-width: 700px) {
    &.sd-modern-widget { padding: 18px 16px; }
  }
}
</style>

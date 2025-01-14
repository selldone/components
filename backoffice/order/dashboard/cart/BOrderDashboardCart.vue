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
    :class="{ '-activated': in_this_step }"
    class="widget shadow my-3 mx-1 mx-md-3"
  >
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Header ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <u-widget-header
      icon="shopping_basket"
      :title="$t('process_center.basket_items')"
    >
      <template v-slot:append-actions>
        <small
          :title="'Checkout date: ' + getLocalTimeString(basket.reserved_at)"
          class="text-capitalize my-auto"
        >
          {{ getFromNowString(basket.reserved_at) }}</small
        >
      </template>
    </u-widget-header>

    <v-list-subheader class="px-0 text-start">
      <span v-html="$t('process_center.basket_list.message')"></span>
    </v-list-subheader>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Compact cart items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <div
      class="expand-button mb-2 mt-3 p-3 widget-hover rounded-xl position-relative pointer-pointer rounded-xl overflow-hidden"
      @click="force_show_items = !force_show_items"
    >
      <span class="absolute-top-end text-muted px-2 small"
        ><v-icon
          :class="{ 'rotate-180': force_show_items }"
          class="mx-1 transition-all-400"
          >expand_more</v-icon
        >

        {{ $t("process_center.basket_list.list_of_items") }}
      </span>

      <b-order-cart-items-circle
        class="d-flex overflow-auto pt-5 pb-2"
        :delivery-state="basket.delivery_state"
        :items="items"
        :readonly="readonly"
      >
      </b-order-cart-items-circle>
    </div>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ List of Cart Items ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-expand-transition>
      <div v-show="force_show_items">
        <b-order-cart
          ref="basket_items_list"
          :checkable="!isActionDisabled && !readonly"
          :is-role-panel="isRolePanel"
          :items="items"
          :readonly="readonly"
          :select-all="initial_select_all"
          :shop="shop"
          :basket="basket"
          :type="basket.type"
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
          checked &&
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
                    v-if="need_to_refund > 0"
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
    <div class="text-start">
      <v-btn
        v-if="!readonly"
        :class="{ disabled: isActionDisabled }"
        :color="in_this_step ? 'primary' : '#000'"
        :loading="busy"
        :size="in_this_step ? 'x-large' : undefined"
        :variant="!in_this_step ? 'outlined' : 'elevated'"
        class="mt-2 tnt"
        rounded
        @click="orderConfirm"
      >
        <v-icon v-if="checked" start>check</v-icon>
        <v-icon v-else-if="in_this_step" class="blink-me" start
          >fiber_manual_record
        </v-icon>

        {{
          !isActionDisabled
            ? basket.delivery_state === PhysicalOrderStates.CheckQueue.code
              ? $t("process_center.basket_list.action")
              : $t("process_center.basket_list.apply_change_action")
            : $t("process_center.basket_list.cant_apply_change")
        }}
      </v-btn>

      <ul class="tips mt-4">
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
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import UPodsPanel from "@selldone/components-vue/ui/pod/panel/UPodsPanel.vue";
import UPodNode from "@selldone/components-vue/ui/pod/node/UPodNode.vue";
import UPodCut from "@selldone/components-vue/ui/pod/cut/UPodCut.vue";
import UPodWire from "@selldone/components-vue/ui/pod/wire/UPodWire.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel.ts";
import BOrderCartItemsCircle from "@selldone/components-vue/backoffice/order/cart/items/circle/BOrderCartItemsCircle.vue";

export default {
  name: "BOrderDashboardCart",
  mixins: [DateMixin],
  inject: ["$vendor"],
  components: {
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
      force_show_items: false,
      busy: false,
    };
  },

  computed: {
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
  methods: {
    orderConfirm() {
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
</style>

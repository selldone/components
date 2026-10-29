<!-- Copyright (c) 2026. Selldone® Business OS™. All rights reserved. -->
<template>
  <v-theme-provider :theme="dark ? 'dark' : undefined">
    <article class="b-role-task" v-bind="$attrs">
      <header class="b-role-task__header">
        <div>
          <p class="b-role-task__eyebrow">{{ $t(roleObject.text) }}</p>
          <h2 dir="ltr">
            {{ ProductType.PHYSICAL.basket_code }}-{{ basket.id }}
          </h2>
        </div>
        <v-tooltip
          v-if="expandable"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
        >
          <template #activator="{ props }"
            ><v-btn
              v-bind="props"
              icon
              variant="text"
              class="sd-modern-icon-button"
              :aria-label="$t('role_workspace.expand_task')"
              @click="$emit('expand')"
              ><v-icon size="16">open_in_full</v-icon></v-btn
            ></template
          >
          {{ $t("role_workspace.expand_task") }}
        </v-tooltip>
      </header>
      <div class="b-role-task__progress">
        <s-order-delivery-status-stepper
          :dark="dark"
          :state="basket.delivery_state"
          :states="PhysicalOrderStates"
        />
        <p>{{ getDeliveryStateString(basket.delivery_state) }}</p>
      </div>
      <div class="b-role-task__context">
        <div>
          <u-price
            :amount="basket.price"
            :currency="basket.currency"
            class="b-role-task__amount"
          /><small>{{ getLocalTimeString(basket.reserved_at) }}</small>
        </div>
        <span class="sd-modern-status sd-modern-status--plain"
          ><span
            class="sd-modern-status__dot"
            :class="
              basket.status === 'Payed'
                ? 'bg-success'
                : basket.status === 'Canceled'
                  ? 'bg-error'
                  : 'bg-warning'
            "
          />{{ getStatusString(basket.status) }}</span
        >
      </div>
      <!-- Reuse the native role widgets: selections, validation, variants and receipts stay intact. -->
      <b-order-dashboard-cart
        v-if="role.level === ShopRoles.PhysicalOrdersChecking.code"
        :basket="basket"
        :shop="shop"
        modern
        is-role-panel
        :inert="
          !paid ||
          ![
            PhysicalOrderStates.CheckQueue.code,
            PhysicalOrderStates.OrderConfirm.code,
            PhysicalOrderStates.PreparingOrder.code,
          ].includes(basket.delivery_state)
        "
        @confirm-order="
          ({ list, callback }) =>
            $emit('update-state', {
              state: PhysicalOrderStates.OrderConfirm.code,
              list,
              callback,
            })
        "
        @fetch-order="$emit('fetch-order')"
      />
      <b-order-dashboard-preparing
        v-else-if="role.level === ShopRoles.PhysicalOrdersPackaging.code"
        :basket="basket"
        :shop="shop"
        modern
        is-role-panel
        :inert="
          !paid ||
          ![
            PhysicalOrderStates.OrderConfirm.code,
            PhysicalOrderStates.PreparingOrder.code,
          ].includes(basket.delivery_state)
        "
        @confirm-preparing="
          ({ delivery_info, callback }) =>
            $emit('update-state', {
              state: PhysicalOrderStates.PreparingOrder.code,
              delivery_info,
              callback,
            })
        "
      />
      <b-order-dashboard-delivery
        v-else-if="role.level === ShopRoles.PhysicalOrdersDelivery.code"
        :basket="basket"
        :shop="shop"
        modern
        is-role-panel
        :inert="!paid"
        @confirm-send="
          ({ callback }) =>
            $emit('update-state', {
              state: PhysicalOrderStates.SentOrder.code,
              callback,
            })
        "
        @confirm-received="
          ({ callback }) =>
            $emit('update-state', {
              state: PhysicalOrderStates.ToCustomer.code,
              callback,
            })
        "
        @fetch-order="$emit('fetch-order')"
      />
      <template v-else-if="role.level === ShopRoles.PhysicalOrdersSupport.code">
        <h3 class="b-role-task__section">
          {{ $t("global.basket_return_request_view.title") }}
        </h3>
        <s-order-basket-return
          :basket="basket"
          :role="role"
          modern
          is-role-panel
          @busy="$emit('busy', $event)"
        />
        <p
          v-if="!basket.items?.some((item) => item.return_request)"
          class="sd-modern-notice"
        >
          {{ $t("role_workspace.no_returns") }}
        </p>
      </template>
      <details
        v-if="role.level === ShopRoles.PhysicalOrdersChecking.code"
        class="b-role-task__payment"
        @toggle="payment_loaded = true"
      >
        <summary>{{ $t("role_workspace.payment_details") }}</summary>
        <b-order-dashboard-payment
          v-if="payment_loaded"
          :order="basket"
          :shop="shop"
          modern
          cod-enable
          is-role-panel
          @fetch-order="$emit('fetch-order')"
        />
      </details>
    </article>
  </v-theme-provider>
</template>
<script lang="ts">
import BOrderDashboardPayment from "../../../order/dashboard/payment/BOrderDashboardPayment.vue";
import BOrderDashboardCart from "../../../order/dashboard/cart/BOrderDashboardCart.vue";
import BOrderDashboardPreparing from "../../../order/dashboard/preparing/BOrderDashboardPreparing.vue";
import BOrderDashboardDelivery from "../../../order/dashboard/delivery/BOrderDashboardDelivery.vue";
import SOrderBasketReturn from "../../../../storefront/order/basket/return/SOrderBasketReturn.vue";
import SOrderDeliveryStatusStepper from "../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import { ShopRoles } from "@selldone/core-js/enums/staff/ShopRoles";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { Basket } from "@selldone/core-js";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
export default {
  name: "BRolePanelTask",
  inheritAttrs: false,
  mixins: [OrderMixin, DateMixin],
  components: {
    BOrderDashboardPayment,
    BOrderDashboardCart,
    BOrderDashboardPreparing,
    BOrderDashboardDelivery,
    SOrderBasketReturn,
    SOrderDeliveryStatusStepper,
  },
  emits: ["expand", "update-state", "fetch-order", "busy"],
  props: {
    dark: { type: Boolean, default: false },
    basket: { type: Object, required: true },
    role: { type: Object, required: true },
    shop: { type: Object, required: true },
    expandable: Boolean,
  },
  data: () => ({
    ShopRoles,
    ProductType,
    PhysicalOrderStates: Basket.PhysicalOrderStates,
    payment_loaded: false,
  }),
  computed: {
    roleObject() {
      return ShopRoles[this.role.level];
    },
    paid() {
      return (
        !this.basket.reject &&
        [Basket.Status.Payed.code, Basket.Status.COD.code].includes(
          this.basket.status,
        )
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.b-role-task {
  min-width: 0;
  padding: 20px;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.6;
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-block-end: 20px;
    h2 {
      margin: 3px 0 0;
      font-family: inherit;
      font-size: 19px;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: -0.3px;
      text-align: start;
    }
  }
  &__eyebrow {
    margin: 0 0 5px;
    color: var(--sd-modern-muted);
    font-size: 10px;
    line-height: 15px;
    letter-spacing: 0.65px;
    text-transform: uppercase;
  }
  &__progress {
    margin-block-end: 20px;
    text-align: center;
    p {
      font-size: 11px;
      margin: 7px 0 0;
      color: var(--sd-modern-muted);
    }
    :deep(.container-stepper > div) {
      background-color: var(--sd-modern-border) !important;
    }
    :deep(.container-stepper > div:nth-child(2)) {
      background-color: rgb(var(--v-theme-primary)) !important;
    }
    :deep(.progressbar li::before) {
      border: 1px solid rgba(var(--v-theme-on-surface), 0.22);
      background: rgb(var(--v-theme-surface));
    }
    :deep(.progressbar li.active::before) {
      border-color: rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-primary));
    }
    :deep(.progressbar li:not(.active) .v-icon) {
      color: var(--sd-modern-muted) !important;
    }
  }
  &__context {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding-block-end: 17px;
    margin-block-end: 18px;
    border-block-end: 1px solid var(--sd-modern-border);
    small {
      display: block;
      font-size: 10px;
      color: var(--sd-modern-muted);
      margin-block-start: 5px;
    }
  }
  &__amount {
    font-size: 19px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__section {
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    margin-block-end: 13px;
  }
  &__payment {
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block-start: 16px;
    margin-block-start: 20px;
    min-width: 0;
    summary {
      cursor: pointer;
      font-size: 12px;
      min-height: 44px;
      padding-block: 10px;
    }
    summary:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
    }
  }
  :deep(.b-order-cart-modern.sd-modern-widget),
  :deep(.b-order-preparation-modern.sd-modern-widget),
  :deep(.b-order-delivery-modern.sd-modern-widget),
  :deep(.b-order-payment--modern.sd-modern-widget) {
    padding: 0;
    border: 0;
    box-shadow: none;
    border-radius: 0;
    margin: 0;
  }
  :deep(.b-order-cart-modern__header h2),
  :deep(.b-order-preparation-modern__header h2),
  :deep(.b-order-delivery-modern__header h2) {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  }
  :deep(.b-order-preparation-modern__grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  :deep(.b-order-preparation-modern__package-picker) {
    grid-column: 1 / -1;
  }
  :deep(.b-order-preparation-modern__weight-field) {
    grid-column: 1;
    grid-row: 3;
  }
  :deep(.b-order-preparation-modern__width-field) {
    grid-column: 2;
    grid-row: 3;
  }
  :deep(.b-order-preparation-modern__length-field) {
    grid-column: 1;
    grid-row: 4;
  }
  :deep(.b-order-preparation-modern__height-field) {
    grid-column: 2;
    grid-row: 4;
  }
  :deep(.b-order-preparation-modern__weight-help) {
    grid-column: 1 / -1;
    grid-row: 5;
  }
  :deep(.b-order-preparation-modern__warnings) {
    grid-row: 6;
  }
  :deep(.b-order-preparation-modern__preview),
  :deep(.b-order-preparation-modern__box-empty) {
    grid-column: 1 / -1;
    grid-row: 7;
    justify-self: center;
  }
  :deep(.b-order-delivery-modern__details) {
    grid-template-columns: minmax(0, 1fr);
  }
  :deep(.b-order-delivery-modern__location),
  :deep(.b-order-delivery-modern__billing) {
    border-inline-start: 0;
    padding-inline-start: 0 !important;
  }
  @media (max-width: 600px) {
    padding: 16px;
  }
}
</style>

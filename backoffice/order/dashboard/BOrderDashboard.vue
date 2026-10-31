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
  <div v-bind="$attrs" :class="{ 'b-order-dashboard--modern text-start': modern, 'b-order-dashboard--vendor': modernVendorPanel, 'b-order-dashboard--fulfillment': isModernFulfillment, 'b-order-dashboard--workspace': modern && !modernVendorPanel && order_view_mode === 'workspace' }">
    <header v-if="modern" class="sd-modern-content sd-modern-header b-order-dashboard__heading">
      <div class="b-order-dashboard__identity">
        <div class="sd-modern-eyebrow b-order-dashboard__breadcrumb">
          <span v-if="modernVendorPanel" class="b-order-dashboard__vendor-type">
            <img :src="getProductTypeImage(type)" alt="" width="16" height="16" />
            {{ order_type }}
          </span>
          <router-link v-else :to="IS_VENDOR_PANEL ? {} : { name: root_baskets_name }">
            <img :src="getProductTypeImage(type)" alt="" width="16" height="16" />
            {{ order_type }}
          </router-link>
          <template v-if="!modernVendorPanel"><span>/</span><span>{{ order_code }}</span></template>
          <template v-if="basket.subscription_id">
            <span>/</span>
            <router-link :to="IS_VENDOR_PANEL ? {} : { name: ProductType.SUBSCRIPTION.order_page, params: { basket_id: basket.subscription_id } }">
              <img :src="ProductType.SUBSCRIPTION.image" alt="" width="16" height="16" />
              SN-{{ basket.subscription_id }}
            </router-link>
          </template>
        </div>
        <div class="b-order-dashboard__title-row">
          <h1 v-if="modernVendorPanel" class="sd-modern-title-text b-order-dashboard__vendor-code">
            <bdi>{{ getBasketOrderCode({ type: basket.type, id: basket.basket_id }) }}</bdi>
            <b-vendor-order-icon name="chevron-right" :size="16" aria-hidden="true" />
            <bdi>{{ getVendorOrderCode(basket) }}</bdi>
          </h1>
          <h1 v-else class="sd-modern-title-text">{{ $t("process_center.modern.overview") }}</h1>
          <span class="sd-modern-status sd-modern-status--plain">
            <span class="sd-modern-status__dot" :class="{ 'no-inv': !modernVendorPanel, 'sd-modern-status__dot--success': modernVendorPanel && isPayed, 'sd-modern-status__dot--warning': modernVendorPanel && (isCOD || isReserved), 'sd-modern-status__dot--error': modernVendorPanel && isCanceled }" :style="modernVendorPanel ? undefined : { backgroundColor: getStatusColor(basket.status) }" />
            {{ getStatusString(basket.status) }}
          </span>
        </div>
        <p v-if="modernVendorPanel" class="sd-modern-subtitle">{{ $t('vendor_fulfillment.checkout') }} · {{ basket.reserved_at ? getLocalTimeString(basket.reserved_at, false) : '—' }}</p>
        <p v-else class="sd-modern-subtitle">{{ $t(isModernFulfillment ? 'process_center.modern.fulfillment_overview_subtitle' : isModernHyper ? 'process_center.modern.hyper_overview_subtitle' : isAvocado ? "process_center.modern.avocado_overview_subtitle" : type === ProductType.FILE.code ? "process_center.modern.file_overview_subtitle" : type === ProductType.VIRTUAL.code ? "process_center.modern.virtual_overview_subtitle" : type === ProductType.SERVICE.code ? "process_center.modern.service_overview_subtitle" : type === ProductType.SUBSCRIPTION.code ? "process_center.modern.subscription_overview_subtitle" : "process_center.modern.overview_subtitle") }}</p>
      </div>
      <div class="b-order-dashboard__header-actions">
      <v-btn-toggle
        v-if="!modernVendorPanel"
        :model-value="order_view_mode"
        mandatory
        selected-class="b-order-dashboard__view-mode--active"
        class="b-order-dashboard__view-modes"
        role="group"
        :aria-label="$t('process_center.modern.display_mode')"
        @update:model-value="setOrderViewMode"
      >
        <v-tooltip v-for="mode in ['refined', 'workspace']" :key="mode" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :value="mode"
              :icon="mode === 'refined' ? 'view_agenda' : 'view_column'"
              :aria-label="$t('process_center.modern.view_' + mode)"
              :aria-pressed="order_view_mode === mode"
              class="sd-modern-icon-button"
              variant="text"
            ></v-btn>
          </template>
          {{ $t('process_center.modern.view_' + mode) }} · {{ $t('process_center.modern.view_' + mode + '_description') }}
        </v-tooltip>
      </v-btn-toggle>
      <v-btn
        v-if="!isHyper && basket.delivery_state !== PhysicalOrderStates.ToCustomer.code && (isCOD || isPayed || isReserved)"
        class="sd-modern-button sd-modern-button--compact sd-modern-button--inline b-order-dashboard__cancel"
        variant="text"
        color="error"
        :disabled="vendorReadOnly"
        @click="dialog_reject = true"
      >
        <b-vendor-order-icon v-if="modernVendorPanel" name="ban" :size="16" class="me-2" />
        <v-icon v-else size="16" class="me-2">gavel</v-icon>
        <u-count-down v-if="!!basket.reject_at" :end="endOfRejectPeriod" class="me-2" />
        {{ $t("process_order_page_dashboard.cancel_order_action") }}
      </v-btn>
      </div>
    </header>
    <v-toolbar v-else class="text-start" color="transparent" flat>
      <v-toolbar-title class="body-title">
        <router-link
          :to="IS_VENDOR_PANEL ? {} : { name: root_baskets_name }"
          class="text-uppercase"
        >
          <img :src="getProductTypeImage(type)" height="20" width="20" />
          {{ order_type }}
        </router-link>

        <!-- 🎗️ Created by a subscription basket -->
        <span
          v-if="basket.subscription_id"
          title="This order created by a subscription."
        >
          <span class="mx-1">/</span>
          <img :src="ProductType.SUBSCRIPTION.image" height="20" width="20" />
          <router-link
            :to="
              IS_VENDOR_PANEL
                ? {}
                : {
                    name: ProductType.SUBSCRIPTION.order_page,
                    params: { basket_id: basket.subscription_id },
                  }
            "
          >
            SN-{{ basket.subscription_id }}
          </router-link>
        </span>

        <span class="mx-1">/</span>

        <b>{{ order_code }}</b>

        <span class="mx-1">/</span>

        <span :style="{ color: getStatusColor(basket.status) }" class="me-1"
          ><v-icon class="me-1" size="14">{{
            getStatusIcon(basket.status)
          }}</v-icon>
          {{ getStatusString(basket.status) }}</span
        >
      </v-toolbar-title>



      <v-spacer />

      <v-btn
        v-if="
          !isHyper &&
          basket.delivery_state !== PhysicalOrderStates.ToCustomer.code &&
          (isCOD || isPayed || isReserved)
        "
        :size="!!basket.reject_at ? 'large' : undefined"
        :variant="!basket.reject_at ? 'text' : 'elevated'"
        class="tnt me-3"
        color="#F44336"
        rounded
        min-height="52"
        @click="dialog_reject = true"
      >
        <v-icon class="me-2" size="small">gavel</v-icon>
        <u-count-down
          v-if="!!basket.reject_at"
          :end="endOfRejectPeriod"
          class="mx-2"
        ></u-count-down>

        <span class="d-none d-sm-inline-block">{{
          $t("process_order_page_dashboard.cancel_order_action")
        }}</span>
      </v-btn>
    </v-toolbar>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Open basket inform! ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <template v-if="isOpen">
      <v-img
        :src="require('../../../assets/placeholders/image/relax-cat.png')"
        class="mx-auto my-4"
        max-height="40vh"
        max-width="320"
      ></v-img>

      <p class="font-weight-bold fadeInUp">
        {{ $t("process_order_page_dashboard.open_basket_cation") }}
      </p>
    </template>

    <v-container :class="{ disabled: rejected, 'sd-modern-content': modern }" class="px-0">
      <b-order-dashboard-withdraw-notice
        v-if="basket?.withdraw"
        :basket="basket"
        :modern="modern"
      />

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Delivery > State ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <s-order-delivery-state
        v-if="!isHyper && basket"
        :basket="basket"
        :is-avocado="isAvocado"
        :is-fulfillment="isFulfillment"
        :modern="modern"
        :offset="inFirstCheckState ? 0 : 1"
        :class="{ 'b-order-dashboard__vendor-progress': modernVendorPanel }"
        class="mx-auto"
      >
        <template v-if="modernVendorPanel" #stage-icon="{ stage }">
          <b-vendor-order-icon :name="stage.complete ? 'check' : ({ CheckQueue: 'shopping-basket', OrderConfirm: 'circle-check', PreparingOrder: 'package', SentOrder: 'truck', ToCustomer: 'check-check' })[stage.code]" :size="14" />
        </template>
        <template v-if="modernVendorPanel" #stage-detail="{ stage }">
          <small v-if="stage.code === 'CheckQueue' && basket.reserved_at">{{ getLocalTimeString(basket.reserved_at, false) }}</small>
          <small v-else-if="stage.code === 'ToCustomer' && basket.delivery_at">{{ getLocalTimeString(basket.delivery_at, false) }}</small>
          <span v-else hidden />
        </template>
      </s-order-delivery-state>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Pre Payment Slot ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <slot name="pre-payment"></slot>

      <b-order-dashboard-subscription
        v-if="isModernSubscription"
        :basket="basket"
        :shop="shop"
      />

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Payment > Normal ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <b-order-dashboard-payment
        v-if="basket && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
        :order="basket"
        :shop="shop"
        :modern="modern"
        :is-fulfillment="isFulfillment"
        :view-mode="order_view_mode"
        :cod-enable="!isModernAvocado && !isModernHyper"
        @fetch-order="$emit('fetch-order')"
      ></b-order-dashboard-payment>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Payment > Vendor ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <b-order-vendor-payment-management
        v-if="basket && IS_VENDOR_PANEL /*🟢 In Vendor Panel 🟢*/"
        :shop="shop"
        :vendor-order="basket"
        :modern="modern"
      ></b-order-vendor-payment-management>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ List > Items ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="!isAvocado && has_local_processing_items"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <b-order-dashboard-cart
          :basket="basket"
          :modern="modern"
          :class="{ disabled: !is_active_OrderBasketListWidget }"
          :is-fulfillment="isFulfillment"
          :readonly="isHyper || (modernVendorPanel && (vendorReadOnly || rejected || !is_active_OrderBasketListWidget))"
          :shop="shop"
          @confirm-order="
            ({ list, callback }) =>
              updateState(
                PhysicalOrderStates.OrderConfirm.code,
                list,
                callback,
                null,
              )
          "
          @fetch-order="$emit('fetch-order')"
        ></b-order-dashboard-cart>
      </v-lazy>
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ List > Drop Shipping Fulfillment (Middle Seller) ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="fulfillments && fulfillments.length"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <div>
          <b-order-dashboard-dropshipping-delivery
            v-if="basket.receiver_info"
            :basket="basket"
            :shop="shop"
          ></b-order-dashboard-dropshipping-delivery>

          <b-order-dashboard-dropshipping-fulfillment
            v-for="fulfillment in fulfillments"
            :key="fulfillment.id"
            :basket="basket"
            :fulfillment="fulfillment"
            :shop="shop"
            @confirm-fulfillment="
              ({ fulfillment, check, callback }) =>
                checkFulfillment(fulfillment, check, callback)
            "
            @fetch-order="$emit('fetch-order')"
          >
          </b-order-dashboard-dropshipping-fulfillment>
        </div>
      </v-lazy>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ 🦠 Connect Orders ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="has_connect_orders"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <b-order-connects-list
          :basket="basket"
          :shop="shop"
          @show-edit-address="showEditAddress"
        ></b-order-connects-list>
      </v-lazy>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ 🟣 Marketplace 🟣 List orders ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="vendor_orders && vendor_orders.length"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <div>
          <b-order-dashboard-vendor
            v-for="vendor_order in vendor_orders"
            :key="vendor_order.id"
            :basket="basket"
            :shop="shop"
            :vendor-order="vendor_order"
            @update-vendor-order-status="
              ({ vendor_order, delivery_state, callback }) =>
                updateVendorOrderStatus(vendor_order, delivery_state, callback)
            "
            @fetch-order="$emit('fetch-order')"
          >
          </b-order-dashboard-vendor>
        </div>
      </v-lazy>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Other sections ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <slot
        :deliveryReturn="deliveryReturn"
        :getDeliveryServiceOrderInfo="getDeliveryServiceOrderInfo"
        :setTracking="setTracking"
        :showEditAddress="showEditAddress"
        :updateState="updateState"
      ></slot>
    </v-container>
  </div>

  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog > ❌ Reject ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

  <v-dialog
    v-if="!isHyper && basket"
    v-model="dialog_reject"
    :fullscreen="!isModernCancellation"
    :max-width="isModernCancellation ? 560 : undefined"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start" :class="{ 'sd-modern-widget b-order-subscription-cancel': isModernCancellation }">
      <v-card-title class="d-flex align-center justify-start">
        <b-vendor-order-icon v-if="modernVendorPanel" name="ban" :size="20" />
        <span>{{ $t(isModernCancellation ? "process_order_page_dashboard.cancel_order_action" : "global.commons.reject") }} |
        {{ isModernFulfillment ? order_code : modernVendorPanel ? getVendorOrderCode(basket) : getBasketOrderCode(basket) }}</span>

        <v-avatar
          v-for="item in isModernFulfillment ? [] : basket.items"
          :key="item.id"
          class="ma-1 avatar-gradient -thin -gray"
          :image="isModernAvocado ? (item.image ? getShopImagePath(item.image) : require('../../../assets/icons/product-outline.svg')) : getProductImage(item.product_id)"
        >
        </v-avatar>
        <v-spacer v-if="isModernCancellation" />
        <v-tooltip v-if="isModernCancellation" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">
          <template #activator="{ props }">
            <v-btn v-bind="props" :icon="modernVendorPanel ? true : 'close'" variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" @click="dialog_reject = false"><b-vendor-order-icon v-if="modernVendorPanel" name="x" :size="16" /></v-btn>
          </template>
          {{ $t('global.actions.close') }}
        </v-tooltip>
      </v-card-title>

      <v-card-text>
        <div :class="isModernCancellation ? 'b-order-subscription-cancel__section' : 'widget-box -large mb-5'">
          <u-widget-header
            :class="{ 'sd-modern-form-header': isModernCancellation }"
            :title="$t('process_order_page_dashboard.reject_dialog.title')"
          >
          </u-widget-header>

          <p v-if="isModernCancellation" class="b-order-subscription-cancel__message">
            {{ $t(isModernFulfillment ? 'process_center.modern.fulfillment_cancel_help' : isModernAvocado ? 'process_center.modern.avocado_cancel_message' : 'process_order_page_dashboard.reject_dialog.message') }}
          </p>
          <v-list-subheader v-else>
            {{ $t("process_order_page_dashboard.reject_dialog.message") }}
          </v-list-subheader>

          <b-shop-customer-box
            :customer="basket.customer"
          ></b-shop-customer-box>

          <v-select
            v-if="isModernCancellation"
            v-model="reject_reason"
            :items="basketRejectReasons"
            :item-title="reason => $t(reason.title)"
            item-value="code"
            :label="$t('process_center.modern.subscription_cancel_reason')"
            :menu-props="{ contentClass: 'sd-modern-select-menu' }"
            :disabled="vendorReadOnly || busy_reject_order || busy_delete_reject"
            required
            aria-required="true"
            variant="underlined"
            hide-details="auto"
            class="sd-modern-underlined-field mt-3"
          />
          <u-smart-select
            v-else
            v-model="reject_reason"
            :items="basketRejectReasons"
            item-text="title"
            item-value="code"
            class="mt-3"
          >
          </u-smart-select>
        </div>

        <div v-if="!rejected" :class="isModernCancellation ? 'b-order-subscription-cancel__section' : 'widget-box -large mb-5'">
          <u-widget-header
            :class="{ 'sd-modern-form-header': isModernCancellation }"
            :title="
              $t('process_order_page_dashboard.reject_dialog.options.title')
            "
          >
          </u-widget-header>
          <p v-if="isModernCancellation" class="b-order-subscription-cancel__message">
            {{ $t("process_order_page_dashboard.reject_dialog.options.subtitle") }}
          </p>
          <v-list-subheader v-else>
            {{
              $t("process_order_page_dashboard.reject_dialog.options.subtitle")
            }}
          </v-list-subheader>

          <u-smart-switch
            v-model="reject_express"
            :true-title="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.true_title',
              )
            "
            :false-title="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.false_title',
              )
            "
            :true-description="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.true_description',
              )
            "
            :false-description="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.false_description',
              )
            "
            true-icon="flash_on"
            false-icon="timelapse"
            :border="isModernFulfillment"
            :class="{ 'sd-modern-smart-select': isModernFulfillment }"
            class="my-3"
          >
          </u-smart-switch>
        </div>

        <div v-if="isModernSubscription || isModernAvocado" class="sd-modern-notice b-order-subscription-cancel__notice">
          <v-icon size="18" aria-hidden="true">info_outline</v-icon>
          <p>{{ $t(isModernAvocado ? 'process_center.modern.avocado_cancel_help' : 'process_center.modern.subscription_cancel_help') }}</p>
        </div>

        <div v-if="rejected" :class="isModernCancellation ? 'b-order-subscription-cancel__actions' : 'widget-buttons'">
          <v-btn
            :loading="busy_delete_reject"
            :disabled="vendorReadOnly || (modernVendorPanel && (busy_reject_order || busy_delete_reject))"
            :color="isModernCancellation ? undefined : 'green-darken-1'"
            :size="isModernCancellation ? undefined : 'x-large'"
            :variant="isModernCancellation ? 'outlined' : 'flat'"
            :class="{ 'sd-modern-button': isModernCancellation }"
            @click="clearRejectOrder()"
          >
            <b-vendor-order-icon v-if="modernVendorPanel" name="rotate-ccw" :size="16" class="me-1" />
            <v-icon v-else class="me-1">settings_backup_restore</v-icon>
            {{
              $t(
                "process_order_page_dashboard.reject_dialog.dismiss_reject_action",
              )
            }}
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions>
        <div :class="isModernCancellation ? 'b-order-subscription-cancel__actions' : 'widget-buttons'">
          <v-btn :size="isModernCancellation ? undefined : 'x-large'" :class="{ 'sd-modern-button': isModernCancellation }" variant="text" @click="dialog_reject = false">
            <b-vendor-order-icon v-if="modernVendorPanel" name="x" :size="16" class="me-1" />
            <v-icon v-else start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !reject_reason, 'sd-modern-button sd-modern-button--danger': isModernCancellation }"
            :disabled="vendorReadOnly || (isModernCancellation ? !reject_reason || busy_reject_order || busy_delete_reject : false)"
            :loading="busy_reject_order"
            color="red-darken-1"
            :size="isModernCancellation ? undefined : 'x-large'"
            variant="elevated"
            @click="rejectOrder()"
            :prepend-icon="modernVendorPanel ? undefined : 'check'"
          >
            <b-vendor-order-icon v-if="modernVendorPanel" name="check" :size="16" class="me-1" />
            {{
              reject_express
                ? $t(
                    "process_order_page_dashboard.reject_dialog.confirm_now_action",
                  )
                : $t(
                    "process_order_page_dashboard.reject_dialog.confirm_in48h_action",
                  )
            }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import SOrderDeliveryState from "../../../storefront/order/delivery-state/SOrderDeliveryState.vue";

import UCountDown from "../../../ui/count-down/UCountDown.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import BOrderDashboardCart from "./cart/BOrderDashboardCart.vue";
import BOrderDashboardPayment from "./payment/BOrderDashboardPayment.vue";
import BOrderDashboardSubscription from "./subscription/BOrderDashboardSubscription.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BOrderDashboardDropshippingFulfillment from "../../order/dashboard/dropshipping/fulfillment/BOrderDashboardDropshippingFulfillment.vue";
import BOrderDashboardVendor from "../../order/dashboard/vendor/BOrderDashboardVendor.vue";
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import BOrderConnectsList from "../../order/connect/list/BOrderConnectsList.vue";

import BOrderDashboardDropshippingDelivery from "../../order/dashboard/dropshipping/delivery/BOrderDashboardDropshippingDelivery.vue";
import BOrderVendorPaymentManagement from "../../order/vendor/payment/BOrderVendorPaymentManagement.vue";
import { AvocadoItem, Basket, BasketItem, Order } from "@selldone/core-js";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import BShopCustomerBox from "@selldone/components-vue/backoffice/customer/box/BShopCustomerBox.vue";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import { BEventBusMixin } from "../../../utils/events/BEventBusMixin.ts";
import MapMixin from "@selldone/components-vue/mixin/map/MapMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import BOrderDashboardWithdrawNotice from "./withdraw/BOrderDashboardWithdrawNotice.vue";
import BVendorOrderIcon from "../../process-center/list/icon/BVendorOrderIcon.vue";
import { VendorMemberTypes } from "@selldone/core-js/models/shop/vendor/vendor_member.model.ts";
export default {
  name: "BOrderDashboard",
  mixins: [BEventBusMixin, MapMixin, OrderMixin, ProductMixin, DateMixin],
  components: {
    BVendorOrderIcon,
    BOrderDashboardSubscription,
    BOrderDashboardWithdrawNotice,
    USmartSwitch,
    BShopCustomerBox,
    UWidgetHeader,
    BOrderVendorPaymentManagement,
    BOrderDashboardDropshippingDelivery,

    BOrderConnectsList,
    USmartSelect,
    BOrderDashboardVendor,
    BOrderDashboardDropshippingFulfillment,
    UCountDown,
    BOrderDashboardCart,
    BOrderDashboardPayment,
    SOrderDeliveryState,
  },
  emits: ["fetch-order"],
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    vendor: {
      type: Object,
      default: null,
    },
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },

    isFulfillment: {
      // Drop shipping mode
      default: false,
      type: Boolean,
    },
    isAvocado: {
      // Avocado mode
      default: false,
      type: Boolean,
    },
    isHyper: {
      // Hyper mode
      default: false,
      type: Boolean,
    },
  },
  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

      ProductType: ProductType,

      center: { lat: 0, lng: 0 },
      location: null,

      dialog_reject: false,
      reject_reason: null,
      reject_express: false,
      basketRejectReasons: Object.values(Order.RejectReasons),

      busy_update_state: false,
      busy_reject_order: false,
      busy_delete_reject: false,
      order_view_mode: "refined",
    };
  },
  computed: {
    isModernFulfillment() {
      return this.modern && this.isFulfillment && !this.IS_VENDOR_PANEL;
    },
    isModernCancellation() {
      return this.isModernSubscription || this.isModernAvocado || this.modernVendorPanel || this.isModernFulfillment;
    },
    isModernAvocado() {
      return this.modern && this.isAvocado && this.type === "AVO" && !this.IS_VENDOR_PANEL && !this.isFulfillment;
    },
    isModernHyper() {
      return this.modern && this.isHyper && this.type === "HYP" && !this.IS_VENDOR_PANEL && !this.isFulfillment;
    },
    modernVendorPanel() {
      return this.modern && this.IS_VENDOR_PANEL && this.type === ProductType.PHYSICAL.code;
    },
    vendorReadOnly() {
      return this.modernVendorPanel && (!this.vendor ||
        typeof this.writeVendorAccess !== 'function' ||
        !this.writeVendorAccess(this.vendor, VendorMemberTypes.VendorMemberRegionCode.ORDERS));
    },
    isModernSubscription() {
      return this.modern && this.type === ProductType.SUBSCRIPTION.code &&
        !this.IS_VENDOR_PANEL && !this.isFulfillment && !this.isAvocado;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    type() {
      return this.basket.type;
    },
    order_code() {
      if (this.IS_VENDOR_PANEL) {
        // Vendor order code pattern: (Basket is Vendor order)
        return (
          this.getBasketOrderCode({
            type: this.basket.type,
            id: this.basket.basket_id,
          }) + ` ❯ ${this.getVendorOrderCode(this.basket)}`
        );
      }

      return this.getBasketOrderCode(this.basket);
      /*  if (this.type === ProductType.PHYSICAL.code)
        return `SM-${this.basket.id}`;
      else if (this.type === ProductType.VIRTUAL.code)
        return `SV-${this.basket.id}`;
      else if (this.type === ProductType.FILE.code)
        return `SF-${this.basket.id}`;
      else if (this.type === ProductType.SERVICE.code)
        return `SS-${this.basket.id}`;
      else if (this.isFulfillment) return `DS-${this.basket.id}`;

      return null;*/
    },
    order_type() {
      if (this.type === ProductType.PHYSICAL.code)
        return this.$t("global.commons.physical_orders");
      else if (this.type === ProductType.VIRTUAL.code)
        return this.$t("global.commons.virtual_orders");
      else if (this.type === ProductType.FILE.code)
        return this.$t("global.commons.file_orders");
      else if (this.type === ProductType.SERVICE.code)
        return this.$t("global.commons.service_orders");
      else if (this.type === ProductType.SUBSCRIPTION.code)
        return this.$t("global.commons.subscription_orders");
      else if (this.isFulfillment)
        return this.$t("global.commons.fulfillments");
      else if (this.isAvocado) return this.$t("global.commons.avocado_orders");
      else if (this.isHyper) return this.$t("global.commons.hyper_orders");
      else if (this.type === "POS") return this.$t("global.commons.pos_orders");
      else if (this.type === "BILL") return "⚠ Bill"; // TODO: Not used! deprecated!

      return null;
    },

    endOfRejectPeriod() {
      let date = DateConverter.convertToLocalTime(this.basket.reject_at);
      date.setHours(date.getHours() + 48);

      return date;
    },

    payment() {
      return this.basket.payment;
    },

    basketStatus() {
      return Basket.Status[this.basket.status];
    },

    rejected() {
      return this.basket && this.basket.reject;
    },
    inFirstCheckState() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.CheckQueue.code
      );
    },

    is_active_OrderBasketListWidget() {
      return (
        this.basket.status === Basket.Status.Payed.code ||
        this.basket.status === Basket.Status.COD.code
      );
    },

    fulfillments() {
      return this.basket.fulfillments;
    },

    vendor_orders() {
      return this.basket.vendor_orders /*Normal seller panel*/;
    },

    has_local_processing_items() {
      // Show all items in fulfillment mode!
      return (
        this.isFulfillment ||
        (this.basket && this.basket.items.some((item) => !item.fulfillment_id))
      );
    },

    isOpen() {
      return this.basket.status === Basket.Status.Open.code;
    },

    isReserved() {
      return this.basket.status === Basket.Status.Reserved.code;
    },

    isPayed() {
      return this.basket.status === Basket.Status.Payed.code;
    },

    isCOD() {
      return this.basket.status === Basket.Status.COD.code;
    },

    isCanceled() {
      return this.basket.status === Basket.Status.Canceled.code;
    },

    has_connect_orders() {
      return this.basket.connect_orders && this.basket.connect_orders.length;
    },

    root_baskets_name() {
      if (this.type === ProductType.PHYSICAL.code)
        return ProductType.PHYSICAL.process_page;
      else if (this.type === ProductType.VIRTUAL.code)
        return ProductType.VIRTUAL.process_page;
      else if (this.type === ProductType.FILE.code)
        return ProductType.FILE.process_page;
      else if (this.type === ProductType.SERVICE.code)
        return ProductType.SERVICE.process_page;
      else if (this.type === ProductType.SUBSCRIPTION.code)
        return ProductType.SUBSCRIPTION.process_page;
      else if (this.isFulfillment) return "BPageShopOrdersDropShipping";
      else if (this.isAvocado) return "BPageShopOrdersAvocado";
      else if (this.isHyper) return "BPageShopOrdersHyper";
      else if (this.type === "POS") return "BPageShopOrdersPos";

      return null;
    },
  },

  watch: {},
  created() {
    this.reject_reason = this.basket.reject;
  },
  mounted() {
    if (!this.modern || this.modernVendorPanel) return;
    try {
      const saved = localStorage.getItem("selldone.backoffice.order-dashboard.view-mode");
      if (saved === "refined" || saved === "workspace") this.order_view_mode = saved;
    } catch {
      // The default layout remains usable when browser storage is unavailable.
    }
  },
  unmounted() {},
  methods: {
    setOrderViewMode(mode) {
      if (!this.modern || this.modernVendorPanel || (mode !== "refined" && mode !== "workspace")) return;
      this.order_view_mode = mode;
      try {
        localStorage.setItem("selldone.backoffice.order-dashboard.view-mode", mode);
      } catch {
        // A storage restriction must not prevent changing the current layout.
      }
    },
    //―――――――――――――――― Order ▶ Update basket status ――――――――――――――――

    updateState(
      state,
      list,
      callback: (
        success: boolean,
        items: BasketItem[] | AvocadoItem[],
      ) => void = null,
      delivery_info = null,
    ) {
      if (this.vendorReadOnly) {
        if (callback) callback(false);
        return;
      }
      this.busy_update_state = true;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_UPDATE_MY_VENDOR_ORDER_STATE(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.POST_UPDATE_FULFILLMENT_ORDER_STATE(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.POST_UPDATE_AVOCADO_ORDER_STATE(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.POST_UPDATE_ORDER_STATE(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  ),
          {
            state: state,
            list: list,
            delivery_info: delivery_info,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            if (callback) callback(false);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.update_status_success",
              ),
            );

            this.basket.delivery_state = data.delivery_state;
            this.basket.delivery_at = data.delivery_at; // If existed!
            this.$emit("fetch-order"); //optional!

            // ☢ Remove basket from shipping que:
            if (this.basket.delivery_state !== "PreparingOrder") {
              const found_in_que =
                this.$store.getters.getOrderSendingQue &&
                this.$store.getters.getOrderSendingQue.find(
                  (b) =>
                    b.type === this.basket.type && b.type === this.basket.id,
                );
              if (found_in_que) {
                this.onDeleteLogisticSendingOrderQue(found_in_que);
              }
            }
            if (callback) callback(true, data.items);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          if (callback) callback(false);
        })
        .finally(() => {
          this.busy_update_state = false;
        });
    },
    //―――――――――――――――― Drop shipping ▶ Check fulfillment by middle seller ――――――――――――――――

    checkFulfillment(fulfillment, check, callback = null) {
      axios
        .put(
          window.API.PUT_CHECK_FULFILLMENT(
            this.$route.params.shop_id,
            this.$route.params.basket_id,
          ),
          {
            fulfillment_id: fulfillment.id,
            check: check,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.update_status_success",
              ),
            );

            fulfillment.check_at = data.check_at;
            this.$emit("fetch-order"); //optional!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          callback();
        });
    },

    //―――――――――――――――― Order ▶ Delivery return ――――――――――――――――

    deliveryReturn(state, list, callback = null, delivery_info = null) {
      if (this.vendorReadOnly) {
        if (callback) callback();
        return;
      }
      this.busy_update_state = true;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_UPDATE_MY_VENDOR_ORDER_DELIVERY_RETURN(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.POST_UPDATE_FULFILLMENT_ORDER_DELIVERY_RETURN(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.POST_UPDATE_AVOCADO_ORDER_DELIVERY_RETURN(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.POST_UPDATE_ORDER_DELIVERY_RETURN(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  ),
          {
            state: state,
            list: list,
            delivery_info: delivery_info,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.update_status_success",
              ),
            );
            this.basket.delivery_state = data.delivery_state;
            this.$emit("fetch-order"); //optional!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update_state = false;
          if (callback) callback();
        });
    },

    //―――――――――――――――― Order ▶ Reject order ――――――――――――――――

    rejectOrder() {
      if (this.vendorReadOnly) return;
      if ((this.isModernAvocado || this.isModernFulfillment) && (!this.dialog_reject || this.basket.delivery_state === this.PhysicalOrderStates.ToCustomer.code || !(this.isCOD || this.isPayed || this.isReserved) || !this.basketRejectReasons.some(reason => reason.code === this.reject_reason))) return;
      if (this.isModernCancellation && (!this.reject_reason || this.busy_reject_order || this.busy_delete_reject)) return;
      this.busy_reject_order = true;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_REJECT_MY_VENDOR_ORDER(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.PUT_REJECT_FULFILLMENT_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.PUT_REJECT_AVOCADO_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.PUT_REJECT_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  ),
          {
            reject: this.reject_reason,
            express: this.reject_express,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.reject_update_success",
              ),
            );
            this.basket.reject = data.reject;
            this.basket.reject_at = data.reject_at;
            this.dialog_reject = false;

            this.$emit("fetch-order"); // Force refresh order!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reject_order = false;
        });
    },
    //―――――――――――――――― Order ▶ Clear reject order ――――――――――――――――

    clearRejectOrder() {
      if (this.vendorReadOnly) return;
      if ((this.isModernAvocado || this.isModernFulfillment) && (!this.rejected || this.busy_reject_order || this.busy_delete_reject || this.isCanceled)) return;
      if (this.modernVendorPanel && (this.busy_reject_order || this.busy_delete_reject)) return;
      this.busy_delete_reject = true;
      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_REJECT_MY_VENDOR_ORDER(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.DELETE_REJECT_FULFILLMENT_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.DELETE_REJECT_AVOCADO_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.DELETE_REJECT_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.dismiss_reject_success",
              ),
            );
            this.basket.reject = data.reject;
            this.basket.reject_at = data.reject_at;
            this.dialog_reject = false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_reject = false;
        });
    },

    //―――――――――――――――― Delivery  ▶ Get delivery service order info ――――――――――――――――

    getDeliveryServiceOrderInfo(transportation_order, callback = null) {
      if (this.isFulfillment) return;

      if (!transportation_order.service) {
        NotificationService.showWarningAlert(
          null,
          "Delivery service order not exist!",
        );
        if (callback) callback();
        return;
      }
      axios
        .get(
          this.IS_VENDOR_PANEL
            ? window.VAPI.GET_MY_VENDOR_DELIVERY_SERVICE_ORDER_INFO(
                transportation_order.vendor_id,
                transportation_order.transportation_id,
                transportation_order.service.id,
                transportation_order.uid,
              )
            : window.API.GET_DELIVERY_SERVICE_ORDER_INFO(
                transportation_order.shop_id,
                transportation_order.transportation_id,
                transportation_order.service.id,
                transportation_order.uid,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            if (data.changed) {
              // Force refresh order completely:
              this.$emit("fetch-order"); //optional!
            } else if (data.tracking && data.tracking.history) {
              // Update shipping history:
              // console.log('history_changed',data.tracking.history)
              transportation_order.history = data.tracking.history;
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (callback) callback();
        });
    },
    //―――――――――――――――― Delivery  ▶ Set tracking info manually ――――――――――――――――

    setTracking(
      tracking_code,
      tracking_url,
      callback: (success: boolean) => void,
    ) {
      if (this.vendorReadOnly) {
        if (callback) callback(false);
        return;
      }
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_SET_TRACKING_MY_VENDOR_ORDER(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.PUT_SET_TRACKING_FULFILLMENT_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : // Avocado not have tracking!
                window.API.PUT_SET_TRACKING_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                ),
          {
            tracking_code: tracking_code,
            tracking_url: tracking_url,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            if (callback) callback(false);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.set_tracking_success",
              ),
            );
            this.basket.delivery_info = data.delivery_info;
            if (callback) callback(true);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          if (callback) callback(false);
        })
        .finally(() => {});
    },

    //―――――――――――――――― 🟣 Marketplace 🟣 ▶ Update delivery state manually by marketplace owner ――――――――――――――――

    updateVendorOrderStatus(vendor_order, delivery_state, callback = null) {
      axios
        .put(
          window.API.PUT_UPDATE_VENDOR_ORDER_BY_MARKETPLACE_OWNER(
            this.$route.params.shop_id,
            this.$route.params.basket_id,
          ),
          {
            vendor_id: vendor_order.id,
            delivery_state: delivery_state,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.vendor_order_status_update_success",
              ),
            );

            Object.assign(vendor_order, data.vendor_order);

            if (data.basket) {
              // In some case like marketplace with direct shipping mode, it could update delivery_state of the main order.
              Object.assign(this.basket, data.basket);
            }
            // vendor_order.delivery_state = data.vendor_order.delivery_state;
            this.$emit("fetch-order"); //optional!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          callback();
        });
    },

    //―――――――――――――――― Edit receiver info by seller ――――――――――――――――

    showEditAddress(callback) {
      // Fulfillment receiver data belongs to the reseller's retail basket, not this supplier order ID.
      if (this.isFulfillment) {
        if (callback) callback(false);
        return;
      }
      if (this.vendorReadOnly) {
        if (callback) callback(false);
        return;
      }
      const vendorContext = this.modernVendorPanel ? {
        vendorId: this.$route.params.vendor_id,
        orderId: this.$route.params.vendor_order_id,
        basketId: this.basket.id,
      } : null;
      const center =
        this.basket.receiver_info && this.basket.receiver_info.location
          ? Object.assign({}, this.basket.receiver_info.location)
          : null;
      const map_location = Object.assign({}, this.basket.receiver_info);
      this.showMap(
        center,
        "detail",
        map_location,
        (info) => {
          // Recheck access when saving a map opened before a permission change.
          if (this.vendorReadOnly || (vendorContext && (!this.modernVendorPanel ||
            vendorContext.vendorId !== this.$route.params.vendor_id ||
            vendorContext.orderId !== this.$route.params.vendor_order_id ||
            vendorContext.basketId !== this.basket.id))) {
            if (callback) callback(false);
            this.closeMap();
            return;
          }
          //  console.log("receiver_info", this.basket.receiver_info, ">>>", info);

          if (callback) callback(true);
          axios
            .put(
              this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.PUT_MY_VENDOR_UPDATE_ORDER_RECEIVER_INFO(
                    this.$route.params.vendor_id,
                    this.$route.params.vendor_order_id, // Vendor order id!
                  )
                : window.API.PUT_UPDATE_ORDER_RECEIVER_INFO(
                    this.shop.id,
                    this.basket.id,
                  ),
              {
                receiver_info: info,
              },
            )
            .then(({ data }) => {
              if (data.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
              } else {
                NotificationService.showSuccessAlert(
                  null,
                  this.$t(
                    "process_order_page_dashboard.notifications.shipping_address_update_success",
                  ),
                );
                Object.assign(this.basket.receiver_info, data.receiver_info);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              if (callback) callback(false);
            });

          this.closeMap();
        },
        false,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.b-order-subscription-cancel {
  &.sd-modern-widget { margin: 0; padding: 0; border-radius: 16px; font-family: inherit; font-size: 14px; line-height: 21px; }
  :deep(.v-card-title) { flex-wrap: wrap; gap: 8px; padding: 20px 20px 10px; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 24px; }
  :deep(.v-card-text) { padding: 12px 20px 20px; font-size: 14px; line-height: 21px; }
  :deep(.v-card-actions) { padding: 0 20px 20px; }
  &__section { margin-block-end: 24px; }
  &__section :deep(h2) { font-family: inherit; font-size: 16px; font-weight: 500; line-height: 24px; }
  &__message { margin-block: 8px 16px; font-size: 14px; line-height: 21px; }
  &__notice { margin-block: 16px; align-items: start; }
  &__notice p { margin: 0; font-size: 14px; line-height: 21px; }
  &__actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 10px; width: 100%; }
  :deep(.sd-modern-underlined-field .v-field__input) { font-family: inherit; font-size: 14px; line-height: 21px; }
}

.b-order-dashboard--modern {
  padding: 26px 22px 28px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;

  > .v-container { max-width: none; padding: 0 !important; margin-block: 0; }
  .b-order-dashboard__heading { margin-block-end: 22px; }
  .b-order-dashboard__identity { min-width: 0; }
  .b-order-dashboard__breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-end: 5px;
    font-size: 10px;
    font-weight: 400;
    line-height: 15px;
    letter-spacing: .65px;
    > a { display: inline-flex; align-items: center; gap: 5px; color: inherit; text-decoration: none; }
    > a:hover { color: rgb(var(--v-theme-primary)); }
  }
  .b-order-dashboard__title-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .sd-modern-title-text { font-family: inherit; font-size: 20px; font-weight: 500; line-height: 26px; letter-spacing: -.3px; }
  .sd-modern-subtitle { margin-block: 5px 0; font-size: 12px; font-weight: 400; line-height: 18px; }
  .b-order-dashboard__cancel { font-size: 12px; padding-inline: 8px; }
  .b-order-dashboard__header-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
  .b-order-dashboard__view-modes { height: auto; padding: 4px; gap: 4px; overflow: visible; border-radius: 11px; background: var(--sd-modern-inset); }
  .b-order-dashboard__view-modes .sd-modern-icon-button.v-btn {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
    &.b-order-dashboard__view-mode--active {
      position: relative;
      z-index: 1;
      background: rgb(var(--v-theme-surface));
      border-color: var(--sd-modern-border);
      box-shadow: var(--sd-modern-selected-shadow);
      :deep(.v-btn__overlay) { opacity: 0; }
    }
  }

  @media (max-width: 600px) {
    padding: 20px 10px;
    .b-order-dashboard__header-actions { width: 100%; justify-content: space-between; }
    .b-order-dashboard__cancel { min-height: 44px; }
  }
}

.b-order-dashboard--vendor {
  padding: 30px 26px 32px;
  > .sd-modern-content { width: min(1040px, 100%); margin-inline: auto; }
  .b-order-dashboard__heading { margin-block-end: 22px; }
  .b-order-dashboard__vendor-type { display: inline-flex; align-items: center; gap: 5px; }
  .b-order-dashboard__vendor-code { display: flex; align-items: center; gap: 9px; }
  .b-order-dashboard__vendor-code svg { color: var(--sd-modern-muted); }
  .v-locale--is-rtl & .b-order-dashboard__vendor-code svg { transform: scaleX(-1); }
  .b-order-dashboard__header-actions { align-self: center; }
  .b-order-dashboard__cancel { font-weight: 400; line-height: 18px; }
  .smart-invert & :deep(.sd-modern-button.text-error:not(.v-btn--disabled)) { filter: invert(1); }
  :deep(.sd-modern-button--inline) { font-weight: 400; }
  :deep(.sd-modern-button:not(.sd-modern-button--x-large, .sd-modern-button--inline, .sd-modern-button--compact)) { font-size: 13px; line-height: 20px; }
  .b-order-dashboard__vendor-progress {
    :deep(.b-order-delivery-state__steps) {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 0;
      padding: 18px 12px;
      margin-block: 0 18px;
      border-radius: 16px;
    }
    :deep(.b-order-delivery-state__steps > li) {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
      padding-inline: 5px;
      text-align: center;
      color: rgb(var(--v-theme-on-surface));
    }
    :deep(.b-order-delivery-state__steps > li:not(:last-child)::after) {
      content: '';
      position: absolute;
      height: 1px;
      inset-block-start: 14px;
      inset-inline-start: 50%;
      width: 100%;
      background: var(--sd-modern-border);
    }
    :deep(.b-order-delivery-state__steps > li.is-complete::after) { background: rgb(var(--v-theme-on-surface)); }
    :deep(.b-order-delivery-state__node) { position: relative; z-index: 1; flex: 0 0 28px; }
    :deep(.b-order-delivery-state__detail) { justify-content: center; }
    :deep(.b-order-delivery-state__detail > small) { font-size: 10px; line-height: 15px; }
  }
  @media (max-width: 600px) {
    padding: 25px 14px 24px;
    .b-order-dashboard__header-actions { width: auto; justify-content: flex-start; }
    .b-order-dashboard__vendor-code { gap: 7px; font-size: 19px; }
    .b-order-dashboard__vendor-progress {
      :deep(.b-order-delivery-state__steps) { padding: 15px 6px; }
      :deep(.b-order-delivery-state__steps > li) { padding-inline: 2px; gap: 5px; }
      :deep(.b-order-delivery-state__title) { font-size: 11px; line-height: 16px; overflow-wrap: anywhere; }
      :deep(.b-order-delivery-state__detail) { display: none; }
      :deep(.b-order-delivery-state__node) { width: 26px; height: 26px; flex-basis: 26px; }
      :deep(.b-order-delivery-state__steps > li:not(:last-child)::after) { inset-block-start: 13px; }
    }
  }
}
</style>

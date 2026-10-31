<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
    :class="[modern ? 'sd-modern-widget b-order-delivery-modern' : { '-activated': in_this_step, 'widget shadow my-3 mx-1 mx-md-3': true }, { 'b-order-delivery-vendor': modernVendorPanel, 'b-order-delivery-vendor--compact': modernVendorPanel && !vendorDeliveryExpanded }]"
    class="text-start"
    v-bind="$attrs"
  >
    <header v-if="modernVendorPanel" class="b-order-delivery-vendor__header">
      <div class="b-order-delivery-vendor__heading">
        <b-vendor-order-icon :name="is_pickup ? 'store' : 'truck'" :size="20" />
        <div>
          <h2>{{ $t(is_pickup ? 'global.commons.pickup' : 'vendor_fulfillment.delivery.title') }}</h2>
          <p class="sd-modern-subtitle">
            {{ $t(is_pickup ? 'vendor_fulfillment.delivery.pickup_subtitle' : 'vendor_fulfillment.delivery.subtitle') }}
            <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('process_center.modern.delivery_help')">
              <b-vendor-order-icon name="info" :size="14" />
              <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">
                {{ $t('vendor_fulfillment.delivery.help') }}
              </v-tooltip>
            </v-btn>
          </p>
        </div>
      </div>
      <v-btn class="sd-modern-button sd-modern-button--inline b-order-delivery-vendor__toggle" variant="text" :aria-expanded="vendorDeliveryExpanded" :aria-controls="'vendor-delivery-details-' + basket.id" @click="vendor_details_expanded = !vendorDeliveryExpanded">
        {{ $t('vendor_fulfillment.delivery.details') }}
        <b-vendor-order-icon name="chevron-down" :size="15" :class="{ 'b-order-delivery-vendor__chevron--expanded': vendorDeliveryExpanded }" />
      </v-btn>
    </header>
    <u-widget-header
      v-else
      :class="{ 'sd-modern-form-header b-order-delivery-modern__header': modern }"
      :title="
        is_pickup
          ? $t('global.commons.pickup')
          : $t('order_delivery.title')
      "
      :icon="is_pickup ? 'person_pin' : 'local_shipping'"
    >
      <template v-slot:actions>
        <img
          v-if="transportation_icon"
          :src="transportation_icon"
          height="24"
          width="24"
        />
      </template>
      <template v-if="modern && (basket.delivery_state === PhysicalOrderStates.CheckQueue.code || basket.delivery_state === PhysicalOrderStates.OrderConfirm.code)" #append-actions>
        <span class="b-order-delivery-modern__stage">{{ $t('process_center.modern.delivery_pending') }}</span>
      </template>
    </u-widget-header>

    <p v-if="modern && !modernVendorPanel" class="sd-modern-subtitle b-order-delivery-modern__subtitle">
      <span>{{ $t(isModernFulfillment ? 'process_center.modern.fulfillment_delivery_subtitle' : 'process_center.modern.delivery_subtitle') }}</span>
      <v-tooltip v-if="!is_pickup" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :open-on-click="true">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="info_outline" variant="text" class="sd-modern-icon-button sd-modern-info-button b-order-delivery-modern__help" :aria-label="$t('process_center.modern.delivery_help')"></v-btn>
        </template>
        {{ $tm('order_delivery.checklist').join(' ') }}
      </v-tooltip>
    </p>
    <v-list-subheader v-else-if="!modern"></v-list-subheader>

    <div :id="modernVendorPanel ? 'vendor-delivery-details-' + basket.id : undefined" class="text-start" :class="{ 'b-order-delivery-modern__body': modern }">
      <div v-if="!modern && has_eta_date && delivery_info.date">
        <div>
          {{
            is_pickup
              ? `${$t("global.commons.pickup")} · ${$t(
                  "global.commons.time",
                )}`
              : modern ? $t('process_center.modern.requested_time') : "The customer chooses a time to receive their order."
          }}
        </div>
        <div class="inline-block">
          <span class="text-h4 font-weight-light">
            {{
              has_eta_time
                ? getLocalTimeString(delivery_info.date)
                : getLocalDateString(delivery_info.date)
            }}
          </span>
          <div class="text-end text-muted">
            ● {{ getFromNowString(delivery_info.date) }}
          </div>
        </div>

        <div class="dashed-hr my-3 mx-n5"></div>
      </div>

      <!-- Step 4 : Delivery to the courier -->

      <!-- Send by delivery person or nothing! -->

      <div :class="{ 'b-order-delivery-modern__shipping': modern }">
      <header v-if="modern" v-show="!modernVendorPanel || vendorDeliveryExpanded" class="b-order-delivery-modern__shipping-heading">
        <h3 class="d-flex align-center ga-1">
          {{ $t('process_center.preparing.delivery_type') }}
          <v-tooltip v-if="!is_pickup" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true" :open-on-click="true">
            <template #activator="{ props }">
              <v-btn v-bind="props" :icon="modernVendorPanel ? true : 'info_outline'" variant="text" class="sd-modern-icon-button sd-modern-info-button b-order-delivery-modern__help" :aria-label="$t('process_center.modern.shipping_method_help_title')"><b-vendor-order-icon v-if="modernVendorPanel" name="info" :size="14" /></v-btn>
            </template>
            {{ $t('process_center.modern.shipping_method_help') }}
          </v-tooltip>
        </h3>
        <span v-if="transportation?.title" class="d-flex align-center ga-2"><img v-if="modernVendorPanel && transportation_icon" :src="transportation_icon" width="24" height="24" alt="" />{{ transportation.title }}</span>
      </header>
      <div :class="{ 'b-order-delivery-modern__courier': modern }">
      <template v-if="!is_pickup">
        <h3>
          <b-vendor-order-icon v-if="modernVendorPanel" name="user-round" :size="18" class="me-1" />
          <v-icon v-else class="me-1" :color="modern ? undefined : 'black'">{{ modern ? 'local_shipping' : 'looks_one' }}</v-icon>
          {{ $t(isModernFulfillment ? 'process_center.modern.fulfillment_manual_handoff' : modern ? 'process_center.modern.courier_title' : 'order_delivery.option_deliver_by_courier') }}
        </h3>
        <p class="my-2 text-muted" v-html="$t(modern ? 'process_center.modern.courier_subtitle' : 'order_delivery.message')"></p>
      </template>
      <p
        v-else
        class="my-2 text-muted"
        v-html="$t('order_delivery.pickup_ready_action_subtitle')"
      ></p>

      <u-dense-circles-users
        v-show="!modernVendorPanel || vendorDeliveryExpanded"
        v-if="
          !is_pickup &&
          transportation?.info?.user_ids &&
          Array.isArray(transportation.info.user_ids)
        "
        :ids="transportation.info.user_ids"
        :limit="20"
        color="#FFA000"
      ></u-dense-circles-users>

      <v-btn
        v-if="!modernVendorPanel || !checked"
        :class="{ disabled: !isActive, 'sd-modern-button': modern, 'sd-modern-button--x-large': modern && in_this_step && !isDeliveryActionDisabled && !in_send_que, 'sd-modern-button--primary': modernVendorPanel && in_this_step && !isDeliveryActionDisabled && !in_send_que }"
        :disabled="modern ? isDeliveryActionDisabled : undefined"
        :color="modern ? in_this_step && !isDeliveryActionDisabled && !in_send_que ? 'primary' : undefined : in_this_step ? 'primary' : '#000'"
        :loading="busy_sentOrder"
        :size="(modern ? in_this_step && !isDeliveryActionDisabled && !in_send_que : in_this_step && !in_send_que) ? 'x-large' : undefined"
        :variant="
          modern ? in_this_step && !isDeliveryActionDisabled && !in_send_que ? 'flat' : 'outlined' : in_this_step && !in_send_que
            ? 'elevated'
            : in_send_que
              ? 'flat'
              : 'outlined'
        "
        class="tnt text-start"
        rounded
        @click="sentOrder"
      >
        <b-vendor-order-icon v-if="modernVendorPanel" :name="is_pickup ? 'store' : 'truck'" :size="in_this_step && !isDeliveryActionDisabled ? 20 : 16" class="v-icon--start" />
        <v-icon v-else-if="modern" start>{{ is_pickup ? 'storefront' : 'local_shipping' }}</v-icon>
        <v-icon v-else-if="checked" start>check</v-icon>
        <v-icon v-else-if="in_this_step && !in_send_que" :class="{ 'blink-me': !modern }" start
          >fiber_manual_record
        </v-icon>

        <div>
          {{
            is_pickup
              ? $t("order_delivery.pickup_ready_action")
              : $t(modern ? 'process_center.modern.courier_action' : 'order_delivery.courier_action')
          }}
          <div v-if="!modern" class="small mt-1">
            {{
              is_pickup
                ? $t("order_delivery.pickup_ready_action_subtitle")
                : $t(modern ? 'process_center.modern.courier_subtitle' : 'order_delivery.courier_action_subtitle')
            }}
          </div>
        </div>
      </v-btn>
      <p v-if="modernVendorPanel && !checked" class="b-order-delivery-vendor__action-note">{{ $t(in_this_step ? 'vendor_fulfillment.delivery.ready_note' : 'vendor_fulfillment.delivery.prepare_first') }}</p>
      </div>

      <div class="dashed-hr my-3 mx-n5"></div>

      <!-- Send by delivery service -->

      <div v-if="!isRolePanel && !noService && transportation_services?.length && !is_pickup" v-show="!modernVendorPanel || vendorDeliveryExpanded" :class="{ 'b-order-delivery-modern__services': modern }">
        <div v-if="!IS_VENDOR_PANEL" :class="{ 'b-order-delivery-modern__queue': modern }">
          <h3 class="mt-5">
            <v-icon class="me-1" :color="modern ? undefined : 'black'">{{ modern ? 'playlist_add' : 'looks_two' }}</v-icon>
            {{ $t(modern ? 'process_center.modern.queue_title' : 'order_delivery.option_add_to_que') }}
          </h3>
          <p
            class="my-2 text-muted"
            v-html="$t(modern ? 'process_center.modern.queue_help' : 'order_delivery.message_add_to_service')"
          ></p>

          <s-dense-images-circles
            v-if="
              transportation?.info?.service_ids &&
              Array.isArray(transportation.info.service_ids)
            "
            :images="
              transportation.info.service_ids.map((k) =>
                DeliveryServiceHelper.GetDeliveryServiceIconById(k),
              )
            "
            :limit="20"
            color="#673AB7"
          ></s-dense-images-circles>

          <v-row align="center" no-gutters>
            <v-btn
              :class="{ disabled: !canAddToDeliveryQue || !isActive, 'sd-modern-button': modern, 'sd-modern-button--x-large': modern && in_this_step && canAddToDeliveryQue && !isDeliveryActionDisabled && !in_send_que }"
              :disabled="modern ? !canAddToDeliveryQue || isDeliveryActionDisabled : undefined"
              :size="(modern ? in_this_step && canAddToDeliveryQue && !isDeliveryActionDisabled && !in_send_que : in_this_step) ? 'x-large' : undefined"
              :variant="
                modern ? in_this_step && canAddToDeliveryQue && !isDeliveryActionDisabled && !in_send_que ? 'flat' : 'outlined' : in_this_step && !in_send_que
                  ? 'elevated'
                  : in_send_que
                    ? 'flat'
                    : 'outlined'
              "
              class="tnt text-start"
              :color="modern ? in_this_step && canAddToDeliveryQue && !isDeliveryActionDisabled && !in_send_que ? 'primary' : undefined : 'primary'"
              min-width="230"
              rounded
              @click="
                in_send_que
                  ? onDeleteLogisticSendingOrderQue(basket)
                  : onAddLogisticSendingOrderQue(basket)
              "
            >
              <v-icon start>{{ in_send_que ? "check" : "add" }}</v-icon>
              <div>
                {{
                  in_send_que
                    ? $t("order_delivery.in_que")
                    : $t("order_delivery.add_to_delivery_que_action")
                }}

                <div v-if="!modern" class="small mt-1">
                  {{
                    in_send_que
                      ? "Order is in the delivery queue."
                      : modern ? $t('process_center.modern.queue_help') : "Add the order to the delivery queue for batch shipping."
                  }}
                </div>
              </div>
            </v-btn>
            <v-spacer></v-spacer>
          </v-row>

          <div class="dashed-hr my-3 mx-n5"></div>
        </div>

        <!-- ========================================= Delivery Service ========================================= -->

        <div v-if="in_this_step && transportation_services?.length" :class="{ 'b-order-delivery-modern__instant': modern }">
          <h3 class="mt-5">
            <b-vendor-order-icon v-if="modernVendorPanel" name="zap" :size="18" class="me-1" />
            <v-icon v-else class="me-1" :color="modern ? undefined : 'black'">{{ modern ? 'bolt' : 'looks_3' }}</v-icon>
            {{ $t(modern ? 'process_center.modern.instant_title' : 'order_delivery.option_instant_shipping') }}
          </h3>
          <p v-if="modern" class="sd-modern-subtitle">{{ $t('process_center.modern.instant_help') }}</p>
          <div class="d-flex">
            <v-spacer></v-spacer>
            <v-select
              :disabled="modernVendorPanel && vendorProcessingBlocked"
              :class="{ 'b-order-delivery-modern__service-select': modern }"
              v-model="selected_transportation_service"
              v-intersect.quiet="autoSelectService(false)"
              :items="transportation_services"
              class="my-1"
              hide-details
              item-value="id"
              item-title="delivery_service.name"
              return-object
              rounded
              style="max-width: 230px"
              :variant="modern ? 'underlined' : 'solo'"
            >
              <template v-slot:selection="{ item }">
                <v-img
                  :src="getShopImagePath(item.raw.delivery_service.icon)"
                  class="me-1 flex-grow-0"
                  height="32"
                  width="32"
                ></v-img>
                {{ item.raw.delivery_service.name }}
              </template>

              <template v-slot:item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.delivery_service.name"
                  class="text-start"
                >
                  <template v-slot:prepend>
                    <v-img
                      :src="getShopImagePath(item.raw.delivery_service.icon)"
                      class="me-2"
                      height="32"
                      width="32"
                    ></v-img>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </div>
          <v-expand-transition>
            <div v-if="transportation && selected_transportation_service && (!modernVendorPanel || !vendorProcessingBlocked)">
              <b-transportation-service-labels
                :key="selected_transportation_service?.id"
                :modern="modern"
                :prominent-action="in_this_step && !isDeliveryActionDisabled"
                :auto-calculate-rates="in_this_step"
                :baskets="baskets"
                :transportation-service="selected_transportation_service"
                :delivery-service="
                  selected_transportation_service.delivery_service
                "
                :shop="shop"
                :vendor="vendor"
                :transportation="transportation"
                :warehouse="warehouse"
                order-page-mode
                @add:orders="
                  basket.delivery_state =
                    'SentOrder' /*Make sure change state to prevent auto get rates!*/;
                  $emit('fetch-order');
                "
              >
              </b-transportation-service-labels>
            </div>
          </v-expand-transition>
        </div>
      </div>
      </div>

      <ul v-if="!modern && !is_pickup" class="tips mt-4">
        <li v-for="item in $tm('order_delivery.checklist')" :key="item">
          {{ item }}
        </li>
      </ul>

      <v-row no-gutters :class="{ 'b-order-delivery-modern__details': modern }">
        <!-- ========================================= BILLING ========================================= -->

        <v-col
          v-if="billing"
          :class="modern ? 'b-order-delivery-modern__billing' : 'p-2 border-end-grater-md'"
          cols="12"
          md="4"
          sm="6"
        >
          <template v-if="isModernFulfillment">
            <h3 class="sd-modern-list-header b-order-delivery-modern__group-title">{{ $t('process_center.payment_widget.billing_details') }}</h3>
            <p v-if="!display_billing || !Object.keys(display_billing).length">—</p>
            <template v-else>
              <u-text-value-dashed v-if="typeof display_billing.business === 'boolean'">
                <template #label>{{ $t('global.commons.kind') }}</template>
                {{ $t(display_billing.business ? 'global.commons.business' : 'global.commons.personal') }}
              </u-text-value-dashed>
              <template v-for="[field, label] in [['name', 'global.commons.name'], ['country', 'global.commons.country'], ['state', 'global.commons.state'], ['address', 'global.commons.address'], ['tax_id', 'process_center.modern.fulfillment_tax_id']]" :key="field">
                <u-text-value-dashed v-if="display_billing[field]">
                  <template #label>{{ $t(label) }}</template>
                  <bdi>{{ field === 'country' ? getCountryName(display_billing[field]) : display_billing[field] }}</bdi>
                </u-text-value-dashed>
              </template>
            </template>
          </template>
          <p v-else-if="modern" :class="modernVendorPanel ? 'b-order-delivery-vendor__summary-title' : 'sd-modern-list-header'" class="b-order-delivery-modern__group-title"><b-vendor-order-icon v-if="modernVendorPanel" name="receipt-text" :size="19" />{{ $t('process_center.modern.bill_summary') }}</p>
          <s-order-bill-card
            v-if="!isModernFulfillment"
            :class="{ 'b-order-delivery-modern__bill-card': modern }"
            :basket="basket"
            :billing="display_billing"
          >
            <template v-if="modern" #billing-header>
              <h3 class="sd-modern-list-header b-order-delivery-modern__billing-heading">{{ $t('process_center.payment_widget.billing_details') }}</h3>
            </template>
          </s-order-bill-card>
          <v-btn
            v-if="modern && !IS_VENDOR_PANEL && !isRolePanel && !isModernFulfillment"
            :href="window.API.GET_ORDERS_PDF(shop.id, basket.id, OrderExportPdfType.RECEIPT, 'pdf')"
            class="sd-modern-button sd-modern-button--compact sd-modern-button--inline b-order-delivery-modern__receipt"
            color="primary"
            variant="text"
            target="_blank"
            rel="noopener noreferrer"
          >
            <v-icon start>download</v-icon>
            {{ $t('process_center.modern.download_receipt') }}
            <v-icon end>north_east</v-icon>
          </v-btn>
        </v-col>

        <v-col :md="billing ? 4 : 6" :class="modern ? 'b-order-delivery-modern__destination' : 'p-2'" cols="12" sm="6">
          <!-- ========================================= ADDRESS ========================================= -->

          <h3 v-if="modern" :class="modernVendorPanel ? 'b-order-delivery-vendor__summary-title' : 'sd-modern-list-header'" class="b-order-delivery-modern__group-title"><b-vendor-order-icon v-if="modernVendorPanel" name="map-pin" :size="19" />{{ is_pickup ? pickup_address_title : $t('process_center.modern.destination_title') }}</h3>

          <s-order-receiver-info-card
            :class="{ 'b-order-delivery-modern__receiver-card': modern, 'b-order-delivery-modern__receiver-card--pickup': modern && is_pickup }"
            :receiver-info="receiver_info"
            :hide-avatar="is_pickup"
            :title="is_pickup ? pickup_address_title : modern ? $t('process_center.modern.destination_title') : null"
            :user-id="is_pickup ? null : buyer ? buyer.id : basket.user_id"
          >
            <template v-if="!modern" v-slot:append-buttons>
              <v-btn
                v-if="!isRolePanel && !is_pickup"
                :loading="busy_edit"
                class="ms-1 rounded-lg"
                color="primary"
                variant="text"
                @click="
                  editAddress()
                "
              >
                <v-icon class="me-1" size="small">edit</v-icon>
                {{ $t("global.actions.edit_address") }}
              </v-btn>
            </template>
          </s-order-receiver-info-card>

          <p v-if="isModernFulfillment" class="sd-modern-notice mb-4"><v-icon size="17" aria-hidden="true">info_outline</v-icon><span class="sd-modern-notice__content">{{ $t('process_center.modern.fulfillment_receiver_managed_by_reseller') }}</span></p>

          <!-- ========================================= RECEIVER ========================================= -->

          <div :class="{ 'b-order-delivery-modern__contact': modern }">
          <p :class="modern ? 'b-order-delivery-modern__contact-title' : 'font-weight-bold mb-2 mt-5'">
            {{ $t("order_delivery.receiver") }}
          </p>

          <p class="mb-1" :class="{ 'b-order-delivery-modern__contact-name': modern }">
            <small
              v-if="!modern"
              >{{ $t("global.basket_order_info_summery.receiver") }} :
            </small>
            {{
              receiver_contact.full_name ||
              receiver_contact.name ||
              $t("global.commons.guest")
            }}
          </p>

          <div v-if="modern && ((!isRolePanel && !is_pickup && !isModernFulfillment) || receiver_contact.phone)" class="b-order-delivery-modern__contact-actions" role="group" :aria-label="$t('order_delivery.receiver')">
            <v-btn
              v-if="!isRolePanel && !is_pickup && !isModernFulfillment"
              :loading="busy_edit"
              :disabled="modernVendorPanel && vendorProcessingBlocked"
              class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
              color="primary"
              variant="text"
              @click="editAddress()"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="pencil" :size="16" class="v-icon--start" />
              <v-icon v-else start size="18">edit</v-icon>
              {{ $t('global.actions.edit_address') }}
            </v-btn>
            <div v-if="receiver_contact.phone" class="b-order-delivery-modern__contact-links">
              <v-tooltip location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">
                <template #activator="{ props }">
                  <v-btn v-bind="props" :href="`tel:${receiver_contact.phone}`" icon variant="text" class="sd-modern-icon-button" :aria-label="$t('process_center.modern.receiver_call')"><b-vendor-order-icon v-if="modernVendorPanel" name="phone" :size="16" /><v-icon v-else size="18" aria-hidden="true">phone</v-icon></v-btn>
                </template>
                {{ $t('process_center.modern.receiver_call') }}
              </v-tooltip>
              <v-tooltip v-if="!modernVendorPanel && !isModernFulfillment" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button" :aria-label="$t('process_center.modern.receiver_phone_copy')" @click.stop="copyToClipboard(receiver_contact.phone)"><v-icon size="18" aria-hidden="true">content_copy</v-icon></v-btn>
                </template>
                {{ $t('process_center.modern.receiver_phone_copy') }}
              </v-tooltip>
              <u-button-whatsapp :shop="shop" :user="receiver_contact" modern></u-button-whatsapp>
            </div>
          </div>

          <p v-if="receiver_contact.phone" class="mb-1" :class="{ 'b-order-delivery-modern__contact-phone': modern }">
            <small v-if="!modern">{{ $t("global.basket_order_info_summery.phone") }} : </small>
            <span v-if="modernVendorPanel || isModernFulfillment" v-copy dir="ltr">{{ receiver_contact.phone }}</span>
            <span v-else-if="modern">{{ receiver_contact.phone }}</span>
            <span v-else v-copy>{{ receiver_contact.phone }}</span>
            <u-button-whatsapp
              v-if="!modern"
              :shop="shop"
              :user="receiver_contact"
              class="ms-2"
            ></u-button-whatsapp>
          </p>

          <p class="mb-1" :class="{ 'b-order-delivery-modern__contact-date': modern }">
            <small
              >{{ $t("global.basket_order_info_summery.reserved_date") }} :
            </small>
            <span :title="getLocalTimeString(basket.reserved_at)">{{
              getFromNowString(basket.reserved_at)
            }}</span>
          </p>
          </div>
        </v-col>
        <!-- ========================================= MAP ========================================= -->

        <v-col
          :md="billing ? 4 : 6"
          :sm="billing ? 12 : 6"
          :class="modern ? 'b-order-delivery-modern__location' : 'p-2'"
          v-show="!modernVendorPanel || vendorDeliveryExpanded"
          cols="12"
        >
          <div v-if="modern" class="b-order-delivery-modern__requested">
            <h3 class="sd-modern-list-header b-order-delivery-modern__group-title">
              {{ is_pickup ? `${$t('global.commons.pickup')} · ${$t('global.commons.time')}` : $t('process_center.modern.requested_time') }}
              <v-tooltip v-if="!is_pickup" location="top" content-class="sd-modern-tooltip text-start" :open-on-click="true">
                <template #activator="{ props }">
                  <v-btn v-bind="props" :icon="modernVendorPanel ? true : 'info_outline'" variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('process_center.modern.requested_time_help')"><b-vendor-order-icon v-if="modernVendorPanel" name="info" :size="14" /></v-btn>
                </template>
                {{ $t('process_center.modern.requested_time_help') }}
              </v-tooltip>
            </h3>
            <div v-if="has_eta_date && delivery_info?.date" class="b-order-delivery-modern__eta">
              <div>{{ has_eta_time ? getLocalTimeString(delivery_info.date) : getLocalDateString(delivery_info.date) }}</div>
              <small>{{ getFromNowString(delivery_info.date) }}</small>
            </div>
            <template v-if="delivery_info?.custom">
              <div v-if="has_eta_weekday && days?.length" class="b-order-delivery-modern__preferences">
                <small>{{ $t('global.commons.days') }}: </small>
                <v-chip v-for="item in days" :key="item.value" size="x-small" variant="text">
                  <v-icon v-if="item.today" color="green" size="12" start>circle</v-icon>
                  {{ $t(item.name) }}
                </v-chip>
              </div>
              <div v-if="has_eta_timeframe && time_spans?.length" class="b-order-delivery-modern__preferences">
                <small>{{ $t('global.commons.time') }}: </small>
                <v-chip v-for="item in time_spans" :key="item.value" size="x-small" variant="text">
                  <img :src="item.icon" class="me-1" width="14" />
                  {{ $t(item.name) }}
                </v-chip>
              </div>
            </template>
            <p v-if="!has_requested_time" class="b-order-delivery-modern__empty">{{ $t(is_pickup ? 'process_center.modern.requested_pickup_time_empty' : 'process_center.modern.requested_time_empty') }}</p>
          </div>
          <p v-if="modern" class="sd-modern-list-header b-order-delivery-modern__group-title">{{ $t('process_center.modern.delivery_location') }}</p>
          <template v-if="receiver_info.location">
            <u-map-view
              v-if="$vuetify.display.smAndUp"
              v-model="receiver_info"
              :center="center"
              :marker-position="receiver_info.location"
              :zoom="15"
              class="overflow-hidden rounded-18px border"
              show-user-location
              :style="modern ? 'width: 100%; aspect-ratio: 1; max-height: 180px' : 'width: 100%; aspect-ratio: 1; max-height: 420px'"
            />
            <u-map-image
              v-else
              :location="receiver_info.location"
              :aspect-ratio="modern ? 16 / 9 : 1"
              class="overflow-hidden rounded-18px border"
              size="100%"
            >
            </u-map-image>
          </template>
          <p v-else-if="modern" class="b-order-delivery-modern__empty">{{ $t('process_center.modern.delivery_location_missing') }}</p>

          <div v-if="!is_pickup && (!modern || (delivery_info?.distance !== undefined && delivery_info?.distance !== null))" :class="{ 'b-order-delivery-modern__distance': modern }" class="d-flex align-center py-1 small">
            <b-vendor-order-icon v-if="modernVendorPanel" name="store" :size="16" />
            <v-icon v-else>warehouse</v-icon>
            <div
              style="height: 2px; background-color: #111"
              class="flex-grow-1 mx-1"
            ></div>
            <b
              >{{ delivery_info?.distance }}
              {{
                delivery_info?.distance_unit
                  ? delivery_info.distance_unit
                  : distance_unit
              }}</b
            >
            <div
              style="height: 2px; background-color: #111"
              class="flex-grow-1 mx-1"
            ></div>

            <b-vendor-order-icon v-if="modernVendorPanel" name="user-round" :size="16" />
            <v-icon v-else>face</v-icon>
          </div>

          <!-- =================== Preferences >  Preferred Delivery Time =================== -->
          <div v-if="!modern && delivery_info && delivery_info.custom">
            <p class="font-weight-bold mb-2 mt-5">
              {{
                is_pickup
                  ? `${$t("global.commons.pickup")} · ${$t(
                      "global.commons.time",
                    )}`
                  : $t(modern ? 'process_center.modern.requested_time' : 'order_delivery.preferred_delivery_time')
              }}
              <v-tooltip v-if="modern && !is_pickup" location="top" content-class="sd-modern-tooltip text-start" :open-on-click="true">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon="info_outline" variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('process_center.modern.requested_time_help')"></v-btn>
                </template>
                {{ $t('process_center.modern.requested_time_help') }}
              </v-tooltip>
            </p>

            <div v-if="has_eta_weekday && days" class="py-2">
              <small>{{ $t("global.commons.days") }}: </small>

              <v-chip
                v-for="item in days"
                :key="item.value"
                color="#fff"
                size="x-small"
                variant="flat"
                style="margin: 2px"
              >
                <v-icon v-if="item.today" color="green" size="12" start
                  >circle
                </v-icon>
                {{ $t(item.name) }}
              </v-chip>
            </div>
            <div v-if="has_eta_timeframe && time_spans" class="py-2">
              <small>{{ $t("global.commons.time") }}: </small>

              <v-chip
                v-for="item in time_spans"
                :key="item.value"
                color="#fff"
                size="x-small"
                variant="flat"
                style="margin: 2px"
              >
                <img :src="item.icon" class="me-1" width="14px" />

                {{ $t(item.name) }}
              </v-chip>
            </div>

            <div v-if="has_eta_date && delivery_info.date">
              <div>
                {{
                  has_eta_time
                    ? getLocalTimeString(delivery_info.date)
                    : getLocalDateString(delivery_info.date)
                }}
              </div>
              <small>● {{ getFromNowString(delivery_info.date) }}</small>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- ========================================= Tracking Code & URL ========================================= -->
      <v-expansion-panels
        v-if="delivery_info && !is_pickup"
        v-show="!modernVendorPanel || vendorDeliveryExpanded"
        v-model="track_expanded"
        :class="modern ? 'b-order-delivery-modern__tracking' : 'my-3 max-width-field-large mx-auto'"
      >
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title>
            <span>
              <b-vendor-order-icon v-if="modernVendorPanel" name="scan-line" :size="16" class="me-1" />
              <v-icon
                v-else-if="delivery_info.tracking_code || delivery_info.tracking_url"
                class="me-1"
                color="green"
                >check</v-icon
              >
              <v-icon v-else class="me-1">add_box</v-icon>
              {{ $t(modern ? 'process_center.modern.tracking_title' : 'order_delivery.tracking.title') }}
            </span>

            <v-spacer></v-spacer>

            <span v-if="modern" class="b-order-delivery-modern__track-context">{{ $t('process_center.modern.tracking_visible') }}</span>
            <b class="flex-grow-0 border-start ps-2">
              {{ delivery_info.tracking_code }}</b
            >
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="mb-3">
              {{ $t("order_delivery.tracking.message") }}
            </p>

            <div :class="{ 'b-order-delivery-modern__tracking-fields': modern }">
            <v-text-field
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="tracking_code"
              :readonly="isRolePanel || !active_track || vendorProcessingBlocked || fulfillmentProcessingBlocked"
              :label="$t('order_delivery.tracking.code')"
              :append-inner-icon="modernVendorPanel ? undefined : 'location_searching'"
              flat
              :variant="modern ? 'underlined' : 'solo-filled'"
              :placeholder="
                active_track
                  ? isModernFulfillment ? $t('process_center.modern.fulfillment_tracking_code_placeholder') : 'Enter code. e.g. ABC 100...'
                  : modern ? $t('process_center.modern.tracking_locked') : 'Empty... Can not edit after delivery!'
              "
              :persistent-placeholder="!active_track"
            ><template v-if="modernVendorPanel" #append-inner><b-vendor-order-icon name="scan-line" :size="16" /></template></v-text-field>

            <v-text-field
              :class="{ 'sd-modern-underlined-field': modern }"
              v-model="tracking_url"
              :readonly="isRolePanel || !active_track || vendorProcessingBlocked || fulfillmentProcessingBlocked"
              :label="$t(isModernFulfillment ? 'process_center.modern.fulfillment_tracking_url' : 'order_delivery.tracking.url')"
              :append-inner-icon="modernVendorPanel ? undefined : 'link'"
              flat
              :variant="modern ? 'underlined' : 'solo-filled'"
              :rules="[GlobalRules.url()]"
              :placeholder="
                active_track
                  ? isModernFulfillment ? 'https://' : 'Enter full address here. e.g. https://track...'
                  : modern ? $t('process_center.modern.tracking_locked') : 'Empty... Can not edit after delivery!'
              "
              :persistent-placeholder="!active_track"
            ><template v-if="modernVendorPanel" #append-inner><b-vendor-order-icon name="link" :size="16" /></template></v-text-field>

            <div v-if="!isRolePanel && active_track && !vendorProcessingBlocked" class="widget-buttons">
              <v-btn
                :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
                :loading="busy_set_tracking"
                color="primary"
                :size="modern ? undefined : 'x-large'"
                @click="setTracking"
              >
                <b-vendor-order-icon v-if="modernVendorPanel" name="save" :size="16" class="v-icon--start" />
                <v-icon v-else start>save</v-icon>
                {{ $t("global.actions.save") }}
              </v-btn>
            </div>
            </div>
            <p v-if="modernVendorPanel" class="sd-modern-subtitle">{{ $t('vendor_fulfillment.delivery.tracking_warning') }}</p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- ========================================= Delivery Timeline ========================================= -->

      <v-row
        v-if="transportation_order && !is_pickup"
        v-show="!modernVendorPanel || vendorDeliveryExpanded"
        :class="{ 'b-order-delivery-modern__timeline': modern }"
        align="center"
        class="my-0"
      >
        <div v-if="modernVendorPanel" class="b-order-delivery-vendor__history-heading"><b-vendor-order-icon name="history" :size="18" /><h3>{{ $t('vendor_fulfillment.delivery.history') }}</h3></div>
        <v-col class="d-flex justify-center" cols="12" order-sm="2" sm="6">
          <div
            class="d-flex flex-column align-center"
            :class="modern ? 'b-order-delivery-modern__courier-card' : 'border rounded-18px overflow-hidden'"
          >
            <template v-if="qrcode_value">
              <a
                :href="qrcode_value"
                class="widget-hover d-inline-block position-relative rounded-lg overflow-hidden"
                :class="modern ? 'b-order-delivery-modern__qr-link' : 'ma-1 mt-3'"
                style="line-height: 0"
                target="_blank"
              >
                <u-qrcode
                  :options="{ width: $vuetify.display.md ? 150 : 200 }"
                  :value="qrcode_value"
                  class="qrcode"
                />
                <v-avatar
                  v-if="
                    (transportation_order.service &&
                      transportation_order.track) ||
                    transportation_order.person
                  "
                  class="center-absolute avatar-gradient -thin -role"
                  color="#fff"
                  size="24"
                >
                  <img
                    v-if="transportation_order.service"
                    :src="
                      DeliveryServiceHelper.GetDeliveryServiceIconById(
                        transportation_order.service.service_id,
                      )
                    "
                  />
                  <img
                    v-else
                    :src="getUserAvatar(transportation_order.person.user_id)"
                  />
                </v-avatar>
                <v-tooltip
                  activator="parent"
                  :content-class="modern ? 'sd-modern-tooltip text-start' : 'text-start'"
                  :location="modern ? 'top' : undefined"
                  :max-width="modern ? undefined : 320"
                >
                  <template v-if="modern">{{ $t('process_center.modern.courier_qr_help') }}</template>
                  <template v-else>
                  Your courier can scan this QR code to get order information
                  and take action. Also you can track the order by scanning this
                  QR. <b>[Do not share it with customer]</b>
                  </template>
                </v-tooltip>
              </a>

              <v-list-subheader>
                <b-vendor-order-icon v-if="modernVendorPanel" name="scan-line" :size="16" class="me-1" />
                <v-icon v-else class="me-1">qr_code_scanner</v-icon>
                {{ modernVendorPanel ? $t('vendor_fulfillment.delivery.scan_qr') : 'Scan this QR code' }}
              </v-list-subheader>
            </template>

            <v-btn
              v-if="!isRolePanel && transportation_order.person"
              :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
              :to="
                IS_VENDOR_PANEL
                  ? {}
                  : {
                      name: 'BPageTransportationCouriers',
                      params: {
                        transportation_id:
                          transportation_order.transportation_id,
                      },
                    }
              "
              block
              class="tnt"
              color="primary"
              variant="text"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="user-round" :size="16" class="me-1" />
              <v-icon v-else class="me-1" size="small">delivery_dining</v-icon>
              {{ $t("order_delivery.manage_couriers") }}
            </v-btn>
            <v-btn
              v-else-if="!isRolePanel && transportation_order.service"
              :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
              :to="
                IS_VENDOR_PANEL
                  ? {
                      name: 'VPageTransportationServiceOrders',
                      params: {
                        transportation_id:
                          transportation_order.transportation_id,
                        service_id: transportation_order.service.id,
                      },
                    }
                  : {
                      name: 'BPageTransportationServiceOrders',
                      params: {
                        transportation_id:
                          transportation_order.transportation_id,
                        service_id: transportation_order.service.id,
                      },
                    }
              "
              block
              class="tnt"
              color="primary"
              variant="text"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="truck" :size="16" class="v-icon--start" />
              <v-icon v-else start>local_shipping</v-icon>
              {{ $t("order_delivery.manage_service") }}
            </v-btn>

            <v-btn
              v-if="qrcode_value"
              :class="{ 'sd-modern-button sd-modern-button--compact b-order-delivery-modern__qr-copy': modern }"
              class="tnt"
              @click="copyToClipboard(qrcode_value)"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="copy" :size="16" class="v-icon--start" />
              <v-icon v-else start>content_copy</v-icon>
              {{ modern ? $t('process_center.modern.courier_qr_copy') : 'Send the QR link to the courier.' }}
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" order-sm="1" sm="6">
          <delivery-timeline-transportation-order
            v-if="transportation_order"
            :delivery-info="delivery_info"
            :shop="shop"
            :transportation-order="transportation_order"
            :readonly="isRolePanel || vendorProcessingBlocked"
            @refresh-service="refreshDeliveryServiceOrder"
          >
          </delivery-timeline-transportation-order>
        </v-col>
      </v-row>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ To Buyer ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <!-- Step 5 : Delivery to the customer > Confirmed by the customer or the transportation system -->
      <div
        v-if="basket.delivery_state === PhysicalOrderStates.SentOrder.code"
        :class="{ 'b-order-delivery-modern__sent': modern }"
        class="pb-3"
      >
        <p
          v-if="!is_pickup"
          class="my-2 text-muted"
          v-html="$t('order_delivery.manual.message')"
        ></p>

        <div class="rounded-btns m-2">
          <v-btn
            :class="{ 'sd-modern-button': modern, 'sd-modern-button--x-large': modern && is_current_receipt_step && !busy_toCustomer, 'sd-modern-button--primary': modernVendorPanel && is_current_receipt_step && !busy_toCustomer }"
            :disabled="(isRolePanel || modernVendorPanel || isModernFulfillment) && (!is_current_receipt_step || busy_toCustomer)"
            :size="modern && is_current_receipt_step && !busy_toCustomer ? 'x-large' : undefined"
            class="m-1"
            :color="modern ? is_current_receipt_step && !busy_toCustomer ? 'primary' : undefined : 'primary'"
            rounded
            :variant="modern && !(is_current_receipt_step && !busy_toCustomer) ? 'outlined' : 'flat'"
            @click.stop="
              accept_action = false;
              dialog_received_by_customer = true;
            "
          >
            <b-vendor-order-icon v-if="modernVendorPanel" name="circle-check" :size="20" class="me-1" />
            <v-icon v-else class="mae-1">check</v-icon>
            {{
              is_pickup
                ? `${$t("global.commons.pickup")} · ${$t(
                    "global.actions.confirm",
                  )}`
                : $t(modern ? 'process_center.modern.confirm_delivered' : 'order_delivery.manual.action_received')
            }}
          </v-btn>

          <v-btn
            v-if="!isRolePanel"
            :disabled="(modernVendorPanel || isModernFulfillment) && (!is_current_receipt_step || busy_return)"
            :class="{ 'sd-modern-button': modern, 'sd-modern-button--x-large': modern && !modernVendorPanel && is_current_receipt_step && !busy_return }"
            :size="modern && !modernVendorPanel && is_current_receipt_step && !busy_return ? 'x-large' : undefined"
            class="ma-1"
            :color="modernVendorPanel ? 'error' : '#E64A19'"
            rounded
            :variant="modernVendorPanel || (modern && !(is_current_receipt_step && !busy_return)) ? 'outlined' : 'flat'"
            @click.stop="
              accept_action = false;
              dialog_returned_by_customer = true;
            "
          >
            <b-vendor-order-icon v-if="modernVendorPanel" name="package-open" :size="16" class="v-icon--start" />
            <v-icon v-else start>close</v-icon>
            {{
              is_pickup
                ? $t("global.commons.return")
                : $t(modern ? 'process_center.modern.delivery_return' : 'order_delivery.manual.action_returned')
            }}
          </v-btn>
        </div>

        <!-- Auto complete count down - 14 days after last updated_at -->
        <s-order-delivery-auto-complete
          v-if="!isModernFulfillment || basket.auto_complete_at"
          :basket="basket"
        ></s-order-delivery-auto-complete>

        <p v-if="!is_pickup && (!isModernFulfillment || basket.auto_complete_at)" class="mt-2">
          <b-vendor-order-icon v-if="modernVendorPanel" name="info" :size="14" class="me-1" />
          <i v-else class="fas fa-info-circle text-primary" />
          {{ $t("order_delivery.auto_complete_note") }}
        </p>
      </div>

      <v-alert
        v-if="basket.delivery_state === PhysicalOrderStates.ToCustomer.code"
        :class="modern ? 'sd-modern-notice b-order-delivery-modern__completed' : 'mt-2'"
        density="compact"
        :icon="modernVendorPanel ? false : 'check'"
        rounded="xl"
        :type="modern ? undefined : 'success'"
        :variant="modern ? 'flat' : 'tonal'"
      >
        <template v-if="modernVendorPanel" #prepend><b-vendor-order-icon name="circle-check" :size="20" /></template>
        <b>
          <span v-if="is_pickup">
            {{ $t("global.commons.pickup") }} ·
            {{ $t("global.commons.completed") }}
          </span>
          <span v-else v-html="$t('order_delivery.received.title')"></span>
        </b>
        <p
          :title="
            is_pickup
              ? $t('global.commons.complete_date')
              : $t('order_delivery.received.delivered_date')
          "
          class="small m-0"
        >
          <b-vendor-order-icon v-if="modernVendorPanel" name="clock" :size="14" class="me-1" />
          <v-icon v-else class="me-1" size="small">access_time</v-icon>

          <b> {{ getFromNowString(basket.delivery_at) }}</b>

          <span class="mx-2">●</span>
          {{ getLocalTimeString(basket.delivery_at) }}
        </p>
      </v-alert>
    </div>

    <!-- █████████████████████████ Dialog Delivery > Success █████████████████████████ -->

    <v-bottom-sheet
      v-model="dialog_received_by_customer"
      content-class="rounded-t-xl"
      max-width="98vw"
      width="640"
    >
      <v-card class="text-start" :class="{ 'b-order-delivery-dialog-modern': modern }" rounded="t-xl">
        <v-card-title class="text-wrap">
          <b-vendor-order-icon v-if="modernVendorPanel" name="circle-check" :size="20" class="me-2" />
          <v-icon v-else class="me-2">assignment_turned_in</v-icon>

          {{
            is_pickup
              ? `${$t("global.commons.pickup")} · ${$t(
                  "global.commons.confirmation",
                )}`
              : $t("process_center.delivered_dialog.title")
          }}
        </v-card-title>

        <v-card-text>
          {{
            is_pickup
              ? $t("global.commons.confirmation")
              : $t("process_center.delivered_dialog.message")
          }}

          <u-smart-verify
            v-model="accept_action"
            class="my-3"
            :true-title="
              is_pickup
                ? $t('global.commons.completed')
                : $t('order_delivery.verify_delivery_input.true_title')
            "
            :true-description="
              is_pickup
                ? $t('global.commons.pickup')
                : $t('order_delivery.verify_delivery_input.true_description')
            "
          ></u-smart-verify>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
              :size="modern ? undefined : 'x-large'"
              variant="text"
              @click="dialog_received_by_customer = false"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="x" :size="16" class="v-icon--start" />
              <v-icon v-else start>close</v-icon>
              {{ $t("global.actions.cancel") }}
            </v-btn>

            <v-btn
              :class="{ disabled: !accept_action, 'sd-modern-button': modern, 'sd-modern-button--x-large': modern && is_current_receipt_step && accept_action && !busy_toCustomer, 'sd-modern-button--primary': modernVendorPanel && is_current_receipt_step && accept_action && !busy_toCustomer }"
              :disabled="(isRolePanel || modernVendorPanel || isModernFulfillment) && (!is_current_receipt_step || !accept_action || busy_toCustomer)"
              :loading="busy_toCustomer"
              :color="modern ? is_current_receipt_step && accept_action && !busy_toCustomer ? 'primary' : undefined : 'primary'"
              :size="!modern || (is_current_receipt_step && accept_action && !busy_toCustomer) ? 'x-large' : undefined"
              :variant="modern ? is_current_receipt_step && accept_action && !busy_toCustomer ? 'flat' : 'outlined' : 'elevated'"
              @click="toCustomer()"
              :prepend-icon="modernVendorPanel ? undefined : 'where_to_vote'"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="circle-check" :size="is_current_receipt_step && accept_action && !busy_toCustomer ? 20 : 16" class="v-icon--start" />
              {{
                is_pickup
                  ? $t("global.actions.confirm")
                  : $t("process_center.delivered_dialog.confirm_action")
              }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- █████████████████████████ Dialog Delivery > Failed █████████████████████████ -->

    <v-bottom-sheet
      v-if="!isRolePanel"
      v-model="dialog_returned_by_customer"
      content-class="rounded-t-xl"
      max-width="98vw"
      width="640"
    >
      <v-card class="text-start" :class="{ 'b-order-delivery-dialog-modern': modern }" rounded="t-xl">
        <v-card-title class="text-wrap">
          <b-vendor-order-icon v-if="modernVendorPanel" name="package-open" :size="20" class="me-2" />
          <v-icon v-else class="me-2">assignment_return</v-icon>
          {{
            is_pickup
              ? `${$t("global.commons.pickup")} · ${$t(
                  "global.commons.return",
                )}`
              : $t("process_center.return_delivery_dialog.title")
          }}
        </v-card-title>

        <v-card-text>
          {{
            is_pickup
              ? $t("global.commons.confirmation")
              : $t("process_center.return_delivery_dialog.message")
          }}

          <u-smart-verify v-model="accept_action" class="my-3"></u-smart-verify>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
              :size="modern ? undefined : 'x-large'"
              variant="text"
              @click="dialog_returned_by_customer = false"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="x" :size="16" class="v-icon--start" />
              <v-icon v-else start>close</v-icon>
              {{ $t("global.actions.cancel") }}
            </v-btn>

            <v-btn
              :class="{ disabled: !accept_action, 'sd-modern-button': modern, 'sd-modern-button--x-large': modern && is_current_receipt_step && accept_action && !busy_return }"
              :loading="busy_return"
              :disabled="(modernVendorPanel || isModernFulfillment) && (!is_current_receipt_step || !accept_action || busy_return)"
              color="red-darken-1"
              :size="!modern || (is_current_receipt_step && accept_action && !busy_return) ? 'x-large' : undefined"
              :variant="modern && !(is_current_receipt_step && accept_action && !busy_return) ? 'outlined' : 'flat'"
              @click="returnDelivery()"
            >
              <b-vendor-order-icon v-if="modernVendorPanel" name="package-open" :size="is_current_receipt_step && accept_action && !busy_return ? 20 : 16" class="me-1" />
              <v-icon v-else class="me-1">airline_stops</v-icon>

              {{
                is_pickup
                  ? $t("global.actions.confirm")
                  : $t("process_center.return_delivery_dialog.confirm_action")
              }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import SOrderReceiverInfoCard from "../../../../storefront/order/receiver-info/card/SOrderReceiverInfoCard.vue";
import SOrderBillCard from "../../../../storefront/order/billing/card/SOrderBillCard.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import SOrderDeliveryAutoComplete from "../../../../storefront/order/auto-complete/SOrderDeliveryAutoComplete.vue";
import UButtonWhatsapp from "../../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import DeliveryTimelineTransportationOrder from "../../../../storefront/order/delivery/DeliveryTimelineTransportationOrder.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import { ETA } from "@selldone/core-js/enums/logistic/ETA";
import UDenseCirclesUsers from "../../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import SDenseImagesCircles from "../../../../ui/image/SDenseImagesCircles.vue";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";
import UMapImage from "@selldone/components-vue/ui/map/image/UMapImage.vue";
import {
  Basket,
  DeliveryServiceHelper,
  ShopOptionsHelper,
} from "@selldone/core-js";
import BTransportationServiceLabels from "@selldone/components-vue/backoffice/transportation/service/labels/BTransportationServiceLabels.vue";
import { BEventBusMixin } from "../../../../utils/events/BEventBusMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import { OrderExportPdfType } from "@selldone/core-js/enums/order/OrderExportPdfType.ts";
import BVendorOrderIcon from "../../../process-center/list/icon/BVendorOrderIcon.vue";
import { VendorMemberTypes } from "@selldone/core-js/models/shop/vendor/vendor_member.model";

export default {
  name: "BOrderDashboardDelivery",
  mixins: [BEventBusMixin, DateMixin],
  components: {
    BVendorOrderIcon,
    UWidgetHeader,
    UMapImage,
    UMapView,
    SDenseImagesCircles,
    UDenseCirclesUsers,
    USmartVerify,
    DeliveryTimelineTransportationOrder,
    BTransportationServiceLabels,
    UButtonWhatsapp,
    SOrderDeliveryAutoComplete,
    SOrderBillCard,
    UTextValueDashed,
    SOrderReceiverInfoCard,
  },
  emits: [
    "confirm-send",
    "confirm-received",
    "returned-delivery",
    "refresh-delivery-order",
    "set-tracking",
    "fetch-order",
    "show-edit-address",
  ],
  props: {
    modern: { type: Boolean, default: false },
    isFulfillment: { type: Boolean, default: false },
    shop: {
      require: true,
      type: Object,
    },
    vendor: {},
    basket: {
      require: true,
      type: Object,
    },

    noService: {
      default: false,
      type: Boolean,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,
      OrderExportPdfType,

      dialog_received_by_customer: false,

      center: { lat: 0, lng: 0 },

      busy_sentOrder: false,
      busy_toCustomer: false,

      dialog_returned_by_customer: false,
      busy_return: false,

      //-------------------
      tracking_code: null,
      tracking_url: null,
      busy_set_tracking: false,

      track_expanded: false,

      selected_transportation_service: null,

      //-------------------
      busy_edit: false,

      accept_action: false,
      vendor_details_expanded: null,
    };
  },

  computed: {
    isModernFulfillment() {
      return this.modern && this.isFulfillment;
    },
    fulfillmentProcessingBlocked() {
      return this.isModernFulfillment && (this.basket.status !== Basket.Status.Payed.code || !!this.basket.reject);
    },
    modernVendorPanel() {
      return this.modern && !!this.IS_VENDOR_PANEL;
    },
    vendorReadOnly() {
      if (!this.modernVendorPanel) return false;
      return !this.vendor || typeof this.writeVendorAccess !== "function" ||
        !this.writeVendorAccess(this.vendor, VendorMemberTypes.VendorMemberRegionCode.ORDERS);
    },
    vendorProcessingBlocked() {
      return this.modernVendorPanel && (this.vendorReadOnly || !!this.basket.reject ||
        ![Basket.Status.Payed.code, Basket.Status.COD.code].includes(this.basket.status));
    },
    vendorDeliveryExpanded() {
      return this.vendor_details_expanded ?? [
        Basket.PhysicalOrderStates.PreparingOrder.code,
        Basket.PhysicalOrderStates.SentOrder.code,
        Basket.PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    DeliveryServiceHelper() {
      return DeliveryServiceHelper;
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    has_shipping_services() {
      return (
        !this.IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/ ||
        !!this.shop.marketplace?.shipping
      ); /*Marketplace enable shipping for vendors*/
    },

    warehouse() {
      return this.IS_VENDOR_PANEL ? this.vendor.warehouse : this.shop.warehouse;
    },

    baskets() {
      return [this.basket];
    },
    buyer() {
      return this.basket.buyer;
    },
    in_send_que() {
      if (this.isModernFulfillment) return false;
      const list = this.$store.getters.getOrderSendingQue;
      return list && list.some((item) => item.id === this.basket.id);
    },
    checked() {
      return [
        Basket.PhysicalOrderStates.SentOrder.code,
        Basket.PhysicalOrderStates.ToCustomer.code,
      ].includes(this.basket.delivery_state);
    },
    in_this_step() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },
    active_track() {
      return (
        this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code ||
        this.basket.delivery_state === Basket.PhysicalOrderStates.SentOrder.code
      );
    },

    isActive() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },
    isDeliveryActionDisabled() {
      return this.fulfillmentProcessingBlocked || this.vendorProcessingBlocked || this.busy_sentOrder || !this.isActive || !!this.basket.reject ||
        ![Basket.Status.Payed.code, Basket.Status.COD.code].includes(this.basket.status);
    },
    is_current_receipt_step() {
      return !this.fulfillmentProcessingBlocked && !this.vendorProcessingBlocked && this.basket.delivery_state === Basket.PhysicalOrderStates.SentOrder.code &&
        !this.basket.reject && [Basket.Status.Payed.code, Basket.Status.COD.code].includes(this.basket.status);
    },
    canAddToDeliveryQue() {
      return (
        this.basket.delivery_state !==
        Basket.PhysicalOrderStates.ToCustomer.code
      );
    },

    receiver_info() {
      return this.basket.receiver_info
        ? this.basket.receiver_info
        : {} /*Fix bug when seller disable ask for shipping address*/;
    },

    receiver_contact() {
      if (this.is_pickup) {
        const customer = this.basket.customer || {};
        const buyer = this.buyer || {};
        const user = this.basket.user || {};
        return {
          full_name:
            customer.full_name || buyer.full_name || user.full_name || null,
          name: customer.name || buyer.name || user.name || null,
          phone: customer.phone || buyer.phone || user.phone || null,
        };
      }
      return {
        ...this.receiver_info,
        name:
          this.receiver_info.full_name ||
          this.buyer?.name ||
          this.receiver_info.name,
      };
    },

    delivery_info() {
      return this.basket.delivery_info;
    },
    time_spans() {
      if (!this.delivery_info || !this.delivery_info.time_spans) return null;
      let out = [];

      this.delivery_info.time_spans.forEach((time_span) => {
        out.push(TimeSpans[time_span]);
      });
      return out;
    },
    days() {
      if (!this.delivery_info || !this.delivery_info.days) return null;

      let out = [];
      const d = new Date();
      this.delivery_info.days.forEach((day) => {
        const it = WeekDays[day];
        if (it.day === d.getDay()) it.today = true;
        out.push(it);
      });
      return out;
    },

    is_pickup() {
      return (
        this.delivery_info &&
        this.delivery_info.type === ShopTransportations.Pickup.code
      );
    },

    pickup_address_title() {
      return `${this.$t("global.commons.pickup")} · ${this.$t(
        "global.commons.address",
      )}`;
    },

    billing() {
      return this.basket.billing
        ? this.basket.billing
        : {} /*Fix bug when seller disable ask for shipping address*/;
    },

    display_billing() {
      if (this.is_pickup && !this.billing.custom) return null;
      return this.billing;
    },

    transportation_order() {
      return this.basket.transportation_order;
    },

    qrcode_value() {
      if (!this.transportation_order) return null;

      if (this.transportation_order.service && this.transportation_order.track)
        return this.transportation_order.track;

      return this.transportation_order.secure_url;
    },

    transportations() {
      if (this.vendor) return this.vendor.transportations;
      return this.shop.transportations;
    },

    transportation_type() {
      if (!this.basket.delivery_info) return null;
      return this.basket.delivery_info.type;
    },

    transportation() {
      return (
        this.transportations &&
        this.transportations.find(
          (transportation) => transportation.type === this.transportation_type,
        )
      );
    },

    /*   delivery_services_id() {
         return this.transportation && this.transportation.info
           ? this.transportation.info.service_ids
           : [];
       },*/

    transportation_icon() {
      if (
        !this.transportation_type ||
        !ShopTransportations[this.transportation_type]
      )
        return null;
      return ShopTransportations[this.transportation_type].icon;
    },

    transportation_services() {
      return this.transportation?.transportation_services;

      /*   if (!this.shop.delivery_services) return [];
         return this.shop.delivery_services.filter((i) =>
           this.delivery_services_id.includes(i.id),
         );*/
    },

    has_eta_weekday() {
      return [ETA.weekday_timeframe.code, ETA.weekday.code].includes(
        this.transportation?.eta,
      );
    },
    has_eta_timeframe() {
      return [ETA.weekday_timeframe.code, ETA.timeframe.code].includes(
        this.transportation?.eta,
      );
    },

    has_eta_date() {
      return [ETA.date_time.code, ETA.date.code].includes(
        this.transportation?.eta,
      );
    },
    has_eta_time() {
      return [ETA.date_time.code].includes(this.transportation?.eta);
    },
    has_requested_time() {
      return !!((this.has_eta_date && this.delivery_info?.date) ||
        (this.delivery_info?.custom && ((this.has_eta_weekday && this.days?.length) ||
          (this.has_eta_timeframe && this.time_spans?.length))));
    },

    distance_unit() {
      return ShopOptionsHelper.GetDistanceUnit(this.shop);
    },
  },

  watch: {
    "basket.id"() {
      this.vendor_details_expanded = null;
      this.accept_action = false;
    },
    "basket.delivery_state"() {
      this.vendor_details_expanded = null;
      this.accept_action = false;
    },
    vendorReadOnly(readonly) {
      if (!readonly) return;
      this.accept_action = false;
      this.dialog_received_by_customer = false;
      this.dialog_returned_by_customer = false;
    },
    transportation_services() {
      this.autoSelectService(true);
    },
  },

  methods: {
    sentOrder() {
      if ((this.modern || this.isRolePanel) && this.isDeliveryActionDisabled) return;
      this.busy_sentOrder = true;

      this.$emit("confirm-send", {
        callback: () => {
          this.busy_sentOrder = false;
          // Remove from delivery service que:
          if (!this.isRolePanel && !this.modernVendorPanel && !this.isModernFulfillment) this.onDeleteLogisticSendingOrderQue(this.basket);
        },
      });
    },

    toCustomer() {
      if (this.isModernFulfillment && (!this.is_current_receipt_step || !this.accept_action || this.busy_toCustomer)) return;
      if (this.modernVendorPanel && (this.vendorProcessingBlocked || !this.is_current_receipt_step || !this.accept_action || this.busy_toCustomer)) return;
      if (this.isRolePanel && (!this.is_current_receipt_step || !this.accept_action || this.busy_toCustomer)) return;
      this.busy_toCustomer = true;

      this.$emit("confirm-received", {
        callback: () => {
          this.busy_toCustomer = false;
          this.dialog_received_by_customer = false;
        },
      });
    },
    returnDelivery() {
      // Role delivery supports handoff and verified receipt, not shop operations.
      if (this.isRolePanel) return;
      if (this.isModernFulfillment && (!this.is_current_receipt_step || !this.accept_action || this.busy_return)) return;
      if (this.modernVendorPanel && (this.vendorProcessingBlocked || !this.is_current_receipt_step || !this.accept_action || this.busy_return)) return;
      this.busy_return = true;

      this.$emit("returned-delivery", {
        callback: () => {
          this.busy_return = false;
          this.dialog_returned_by_customer = false;
        },
      });
    },

    refreshDeliveryServiceOrder(callback) {
      if (this.isRolePanel || this.vendorProcessingBlocked) return;
      this.$emit("refresh-delivery-order", { callback });
    },

    setTracking() {
      if (this.isModernFulfillment && (this.fulfillmentProcessingBlocked || !this.active_track || this.busy_set_tracking)) return;
      if (this.isRolePanel || this.vendorProcessingBlocked || (this.modernVendorPanel && (!this.active_track || this.busy_set_tracking))) return;
      this.busy_set_tracking = true;
      this.$emit("set-tracking", {
        tracking_code: this.tracking_code,
        tracking_url: this.tracking_url,
        callback: (success: boolean) => {
          this.busy_set_tracking = false;
          if (success) {
            this.track_expanded = false;
          }
        },
      });
    },

    editAddress() {
      // Fulfillments have no receiver-update endpoint; their ID must not reach the retail-order API.
      if (this.isModernFulfillment) return;
      if (this.isRolePanel || this.vendorProcessingBlocked) return;
      this.$emit('show-edit-address', (busy) => (this.busy_edit = busy));
    },

    autoSelectService(force) {
      if (
        this.isModernFulfillment ||
        this.isRolePanel ||
        this.vendorProcessingBlocked ||
        (this.selected_transportation_service && !force) ||
        !this.in_this_step ||
        !this.transportation_services?.length
      )
        return;

      this.selected_transportation_service = this.transportation_services[0];
    },
  },
  created() {
    Object.assign(this.center, this.receiver_info.location);

    if (this.delivery_info) {
      this.tracking_code = this.delivery_info.tracking_code;
      this.tracking_url = this.delivery_info.tracking_url;
    }
  },
};
</script>

<style lang="scss" scoped>
.b-order-delivery-modern {
  --order-delivery-inset: 20px;
  &.sd-modern-widget { padding: 20px var(--order-delivery-inset); margin-block-end: 18px; border-radius: 16px; font-family: inherit; font-size: 13px; line-height: 1.5; }

  &.disabled { opacity: 1 !important; }
  &__header { margin-block-end: 0; }
  &__header :deep(h2) { font-family: inherit; font-size: 18px; font-weight: 500; line-height: 24px; }
  &__stage { align-self: center; margin-inline-start: auto; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  &__subtitle { display: flex; align-items: center; gap: 4px; margin: 4px 0 20px; font-size: 12px; line-height: 18px; }
  &__help { pointer-events: auto; }
  &__body { display: flex; flex-direction: column; }
  &__details { order: -2; display: grid; grid-template-columns: minmax(0, 1.1fr) repeat(2, minmax(0, 1fr)); gap: 26px; margin: 0; }
  &__details > div { width: auto; max-width: none; padding: 0; min-width: 0; overflow-wrap: anywhere; }
  &__destination { order: -2; }
  &__location { order: -1; }
  &__location, &__billing { border-inline-start: 1px solid var(--sd-modern-border); padding-inline-start: 22px !important; }
  &__group-title { display: flex; align-items: center; gap: 6px; min-height: 32px; margin: 0 0 12px; }
  &__details :deep(p:not(.sd-modern-list-header)) { font-size: 12px; line-height: 20px; }
  &__details :deep(.s--value-dashed) { font-size: 12px; line-height: 18px; }
  &__receiver-card :deep(> p > small), &__bill-card :deep(.s--value-dashed > small), &__contact small, &__eta > small, &__preferences > small { font-size: 12px; font-weight: 400; }
  &__details :deep(.font-weight-bold), &__billing :deep(b) { font-weight: 500 !important; }
  &__billing :deep(.text-success) { color: inherit !important; font-size: 13px !important; font-weight: 500 !important; }
  &__receiver-card { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 7px 10px; align-items: start; }
  &__receiver-card :deep(> p) { grid-column: 2; margin: 0 !important; }
  &__receiver-card :deep(> p:first-child) { display: none; }
  &__receiver-card :deep(> div.text-center) { grid-column: 1; grid-row: 1 / span 3; text-align: start !important; }
  &__receiver-card :deep(.v-avatar) { width: 34px !important; height: 34px !important; margin: 0 !important; }
  &__receiver-card :deep(> .v-btn) { grid-column: 2; justify-self: start; margin-inline: 0 !important; }
  &__receiver-card--pickup { grid-template-columns: minmax(0, 1fr); }
  &__receiver-card--pickup :deep(> p) { grid-column: 1; }
  &__contact { display: grid; gap: 6px; margin-block-start: 16px; }
  &__contact > p { margin: 0 !important; }
  &__contact > p.b-order-delivery-modern__contact-title, &__contact > p.b-order-delivery-modern__contact-name { font-size: 13px; line-height: 20px; font-weight: 500; }
  &__contact-phone { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  &__contact-actions { --sd-modern-icon-button-size: 32px; display: flex; align-items: center; flex-wrap: wrap; gap: 9px; margin-block: 3px 0; }
  &__contact-links { display: flex; align-items: center; gap: 9px; }
  &__contact-date { color: var(--sd-modern-muted); }
  &__bill-card :deep(> b:first-child) { display: none !important; }
  &__bill-card :deep(.s--value-dashed) { padding-block: 4px; gap: 12px; }
  &__billing-heading { border-block-start: 1px solid var(--sd-modern-border); padding-block-start: 14px; margin: 14px 0 8px; }
  &__receipt { margin-block-start: 12px; }
  &__distance { margin-block-start: 4px; color: var(--sd-modern-muted); }
  &__distance > div { height: 1px !important; background: var(--sd-modern-border) !important; }
  &__distance b { font-weight: 400; }
  &__distance > .v-icon { font-size: 16px; }
  &__eta { font-size: 12px; line-height: 20px; }
  &__eta > small { color: var(--sd-modern-muted); }
  &__requested { margin-block-end: 16px; padding-block-end: 16px; border-block-end: 1px solid var(--sd-modern-border); }
  &__empty { margin: 7px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; }
  &__preferences { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-block-start: 6px; }
  &__preferences :deep(.v-chip) { background: transparent !important; color: inherit !important; }
  &__preferences :deep(.v-chip__underlay) { display: none; }
  &__shipping, &__tracking, &__timeline, &__sent { margin-inline: calc(-1 * var(--order-delivery-inset)); padding-inline: var(--order-delivery-inset); border-block-start: 1px solid var(--sd-modern-border); }
  &__shipping { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 20px 24px; padding-block: 20px; margin-block-start: 20px; }
  &__shipping-heading { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  &__shipping-heading > span { color: var(--sd-modern-muted); font-size: 12px; }
  &__shipping > .dashed-hr, &__queue > .dashed-hr { display: none; }
  &__services { display: contents; }
  &__courier, &__queue { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
  &__courier > .v-btn, &__queue > .v-row { margin-block-start: auto; }
  &__queue > .v-row { width: 100%; }
  // Keep disabled flat-button overlays from darkening the quiet neutral surface.
  &__courier > .v-btn--disabled :deep(.v-btn__overlay),
  &__queue > .v-row > .v-btn--disabled :deep(.v-btn__overlay) { opacity: 0; }
  &__instant { min-width: 0; }
  &__shipping h3 { margin: 0 !important; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  &__shipping h3 > .v-icon { color: var(--sd-modern-muted); font-size: 19px; }
  &__shipping p { margin-block: 6px 12px !important; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  &__shipping .v-btn { min-width: 0 !important; }
  &__instant { grid-column: 1 / -1; border-block-start: 1px solid var(--sd-modern-border); padding-block-start: 20px; }
  &__tracking { width: auto; margin-block: 0; border-radius: 0; }
  &__tracking :deep(.v-expansion-panel) { background: transparent; }
  &__tracking :deep(.v-expansion-panel-title) { min-height: 0; padding: 17px 0; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; }
  &__tracking:last-child { margin-block-end: -20px; }
  &__tracking :deep(.v-expansion-panel-text__wrapper) { padding: 0 0 16px; font-size: 12px; line-height: 18px; }
  &__tracking :deep(.v-field__input), &__service-select :deep(.v-field__input) { font-family: inherit; font-size: 13px; line-height: 20px; }
  &__tracking :deep(.v-label) { font-family: inherit; font-size: 12px; }
  &__track-context { margin-inline: 8px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; }
  &__tracking-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) auto; align-items: start; gap: 18px; }
  &__tracking-fields > .widget-buttons { justify-content: flex-end; margin: 16px 0 0; }
  &__tracking-fields > .widget-buttons > .v-btn { margin: 0; }
  &__timeline { margin-block: 0 !important; padding-block: 20px; font-size: 12px; }
  &__timeline > div { padding: 0; }
  &__courier-card { max-width: 100%; padding: 16px; gap: 8px; border: 1px solid var(--sd-modern-border); border-radius: 12px; }
  &__qr-link { max-width: 100%; margin: 0; }
  &__qr-link :deep(canvas), &__qr-link :deep(img) { max-width: 100%; height: auto; }
  &__courier-card > .v-list-subheader { min-height: 0; padding: 0; font-family: inherit; font-size: 13px; line-height: 20px; }
  &__courier-card > .v-btn { max-width: 100%; }
  &__qr-copy { white-space: normal; }
  &__qr-copy :deep(.v-btn__content) { white-space: normal; overflow-wrap: anywhere; }
  &__sent { padding-block-start: 18px; border-block-start: 1px solid var(--sd-modern-border); font-size: 12px; line-height: 18px; }
  &__sent > p { margin-block: 0 12px; }
  &__completed { padding: 12px; margin-block-start: 18px; background: var(--sd-modern-inset); color: rgb(var(--v-theme-on-surface)); font-size: 12px; line-height: 18px; }
  &__completed b { font-weight: 500; }

  @media (max-width: 900px) {
    &__details { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &__billing { grid-column: 1 / -1; padding-inline-start: 0 !important; padding-block-start: 18px !important; border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
  }
  @media (max-width: 600px) {
    --order-delivery-inset: 13px;
    &.sd-modern-widget { padding-block: 17px; }
    &__details, &__shipping { grid-template-columns: 1fr; gap: 18px; }
    &__location { padding-block-start: 18px !important; padding-inline-start: 0 !important; border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
    &__tracking-fields { grid-template-columns: minmax(0, 1fr); gap: 6px; }
    &__tracking-fields > .widget-buttons { margin-block-start: 0; }
    &__tracking :deep(.v-expansion-panel-title) { padding-block: 16px; }
    &__tracking:last-child { margin-block-end: -17px; }
    &__stage { margin-inline-start: 0; }
    &__tracking :deep(.v-field__input), &__service-select :deep(.v-field__input) { font-size: 16px; }
  }
}


.b-order-delivery-vendor {
  --order-delivery-inset: 20px;
  &.sd-modern-widget { padding: 20px; border-radius: 16px; margin-block-end: 18px; }
  &__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-block-end: 15px; }
  &__heading { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
  &__heading > .b-vendor-order-icon { margin-block-start: 2px; color: var(--sd-modern-muted); }
  &__heading h2 { margin: 0; font-family: inherit; font-size: 18px; line-height: 24px; font-weight: 500; letter-spacing: -0.25px; }
  &__heading .sd-modern-subtitle { margin-block-start: 5px; max-width: 650px; font-size: 12px; font-weight: 400; line-height: 18px; }
  &__toggle.sd-modern-button { flex-shrink: 0; min-height: 32px; padding: 5px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  &__toggle :deep(.v-btn__content) { gap: 6px; }
  &__chevron--expanded { transform: rotate(180deg); }
  &__action-note { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-order-delivery-modern__shipping { display: grid; grid-template-columns: 1fr; order: 0; gap: 16px; margin-block-start: 0; padding-block: 0; border-block-start: 0; }
  .b-order-delivery-modern__courier { flex-direction: row; align-items: center; flex-wrap: wrap; gap: 10px 14px; }
  .b-order-delivery-modern__courier > h3,
  .b-order-delivery-modern__courier > p:not(.b-order-delivery-vendor__action-note) { flex-basis: 100%; }
  .b-order-delivery-modern__courier > .v-btn { margin-block-start: 0; }
  .b-order-delivery-modern__courier > .b-order-delivery-vendor__action-note { margin: 0 !important; max-width: 340px; font-size: 12px; line-height: 19px; }
  &--compact .b-order-delivery-modern__courier > h3,
  &--compact .b-order-delivery-modern__courier > p:not(.b-order-delivery-vendor__action-note) { display: none; }
  .b-order-delivery-modern__details { order: 5; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; margin-block-start: 22px; padding-block-start: 22px; border-block-start: 1px solid var(--sd-modern-border); }
  .b-order-delivery-modern__destination,
  .b-order-delivery-modern__billing { order: 0; padding: 0 !important; border: 0; grid-column: auto; }
  .b-order-delivery-modern__destination { padding-inline-start: 22px !important; border-inline-start: 1px solid var(--sd-modern-border); }
  .b-order-delivery-modern__location { order: 1; grid-column: 1 / -1; padding-inline-start: 0 !important; padding-block-start: 18px !important; border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
  .b-order-delivery-modern__details .b-order-delivery-vendor__summary-title { font-family: inherit; font-size: 16px; line-height: 24px; font-weight: 500; margin-block-end: 14px; }
  .b-order-delivery-vendor__summary-title > .b-vendor-order-icon { color: var(--sd-modern-muted); }
  .b-order-delivery-modern__tracking { order: 1; margin-block-start: 16px; }
  .b-order-delivery-modern__tracking:last-child { margin-block-end: 0; }
  .b-order-delivery-modern__timeline { order: 2; }
  &__history-heading { display: flex; align-items: center; gap: 8px; flex-basis: 100%; margin-block-end: 14px; }
  &__history-heading h3 { font-family: inherit; font-size: 13px; line-height: 20px; font-weight: 500; margin: 0; }
  &__history-heading > .b-vendor-order-icon { color: var(--sd-modern-muted); }
  .b-order-delivery-modern__sent,
  .b-order-delivery-modern__completed { order: 3; }
  .b-order-delivery-modern__sent .rounded-btns { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 !important; }
  .b-order-delivery-modern__sent .rounded-btns > .v-btn { margin: 0 !important; }
  @media (max-width: 600px) {
    --order-delivery-inset: 16px;
    &.sd-modern-widget { padding: 18px 16px; }
    &__header { flex-wrap: wrap; gap: 10px; }
    &__toggle.sd-modern-button { min-height: 44px; margin-inline-start: 30px; }
    .b-order-delivery-modern__details { grid-template-columns: minmax(0, 1fr); gap: 18px; }
    .b-order-delivery-modern__destination { padding-inline-start: 0 !important; padding-block-start: 18px !important; border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
  }
}

.b-order-delivery-dialog-modern {
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  :deep(.v-card-title) { font-family: inherit; font-size: 18px; font-weight: 500; line-height: 24px; }
  :deep(.v-card-text) { font-size: 13px; line-height: 20px; }
  :deep(.widget-buttons) { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; padding: 0 12px 12px; }
}
</style>

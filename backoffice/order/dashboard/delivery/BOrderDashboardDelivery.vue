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
    :class="{ '-activated': in_this_step }"
    class="widget shadow my-3 mx-1 mx-md-3"
    v-bind="$attrs"
  >
    <div class="d-flex align-center">
      <h2>
        <v-icon class="me-1" color="#111">local_shipping</v-icon>
        {{ $t("order_delivery.title") }}

        <v-chip
          v-if="is_pickup"
          class="skew-n20 ms-2"
          color="success"
          label
          variant="elevated"
          >{{ $t("global.commons.pickup") }}
        </v-chip>
      </h2>
      <v-spacer></v-spacer>
      <img
        v-if="transportation_icon"
        :src="transportation_icon"
        height="24"
        width="24"
      />
    </div>
    <v-list-subheader></v-list-subheader>

    <div class="text-start">
      <div v-if="has_eta_date && delivery_info.date">
        <div>The customer chooses a time to receive their order.</div>
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

      <h3>
        <v-icon class="me-1" color="black">looks_one</v-icon>
        {{ $t("order_delivery.option_deliver_by_courier") }}
      </h3>
      <p class="my-2 text-muted" v-html="$t('order_delivery.message')"></p>

      <u-dense-circles-users
        v-if="
          transportation?.info?.user_ids &&
          Array.isArray(transportation.info.user_ids)
        "
        :ids="transportation.info.user_ids"
        :limit="20"
        color="#FFA000"
      ></u-dense-circles-users>

      <v-btn
        :class="{ disabled: !isActive }"
        :color="in_this_step ? 'primary' : '#000'"
        :loading="busy_sentOrder"
        :size="in_this_step && !in_send_que ? 'x-large' : undefined"
        :variant="
          in_this_step && !in_send_que
            ? 'elevated'
            : in_send_que
              ? 'flat'
              : 'outlined'
        "
        class="tnt text-start"
        rounded
        @click="sentOrder"
      >
        <v-icon v-if="checked" start>check</v-icon>
        <v-icon v-else-if="in_this_step && !in_send_que" class="blink-me" start
          >fiber_manual_record
        </v-icon>

        <div>
          {{
            is_pickup
              ? $t("order_delivery.pickup_action")
              : $t("order_delivery.courier_action")
          }}
          <div class="small mt-1">
            {{
              is_pickup
                ? $t("order_delivery.pickup_action_subtitle")
                : $t("order_delivery.courier_action_subtitle")
            }}
          </div>
        </div>
      </v-btn>

      <div class="dashed-hr my-3 mx-n5"></div>

      <!-- Send by delivery service -->

      <div
        v-if="
          !noService &&
          delivery_services_id &&
          delivery_services_id.length &&
          !is_pickup
        "
      >
        <h3 class="mt-5">
          <v-icon class="me-1" color="black">looks_two</v-icon>
          {{ $t("order_delivery.option_add_to_que") }}
        </h3>
        <p
          class="my-2 text-muted"
          v-html="$t('order_delivery.message_add_to_service')"
        ></p>

        <s-dense-images-circles
          v-if="
            transportation?.info?.service_ids &&
            Array.isArray(transportation.info.service_ids)
          "
          :images="
            transportation.info.service_ids.map((k) =>
              getDeliveryServiceIcon(k),
            )
          "
          :limit="20"
          color="#673AB7"
        ></s-dense-images-circles>

        <v-row align="center" no-gutters>
          <v-btn
            :class="{ disabled: !canAddToDeliveryQue || !isActive }"
            :size="in_this_step ? 'x-large' : undefined"
            :variant="
              in_this_step && !in_send_que
                ? 'elevated'
                : in_send_que
                  ? 'flat'
                  : 'outlined'
            "
            class="tnt text-start"
            color="primary"
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

              <div class="small mt-1">
                {{
                  in_send_que
                    ? "Order is in the delivery queue."
                    : "Add the order to the delivery queue for batch shipping."
                }}
              </div>
            </div>
          </v-btn>
          <v-spacer></v-spacer>
        </v-row>

        <div class="dashed-hr my-3 mx-n5"></div>

        <!-- ========================================= Delivery Service ========================================= -->

        <template
          v-if="in_this_step && delivery_services && delivery_services.length"
        >
          <h3 class="mt-5">
            <v-icon class="me-1" color="black">looks_3</v-icon>
            {{ $t("order_delivery.option_instant_shipping") }}
          </h3>
          <div class="d-flex">
            <v-spacer></v-spacer>
            <v-select
              v-model="delivery_service"
              v-intersect.quiet="autoSelectService()"
              :items="delivery_services"
              class="my-1"
              hide-details
              item-value="id"
              return-object
              rounded
              style="max-width: 230px"
              variant="solo"
            >
              <template v-slot:selection="{ item }">
                <v-img
                  :src="getShopImagePath(item.raw.icon)"
                  class="me-1 flex-grow-0"
                  height="32"
                  width="32"
                ></v-img>
                {{ item.raw.name }}
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item
                  :title="item.raw.name"
                  class="text-start"
                  v-bind="props"
                >
                  <template v-slot:prepend>
                    <v-img
                      :src="getShopImagePath(item.raw.icon)"
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
            <div v-if="transportation && delivery_service">
              <b-transportation-service-labels
                :auto-calculate-rates="in_this_step"
                :baskets="baskets"
                :delivery-service="delivery_service"
                :shop="shop"
                :transportation="transportation"
                :warehouse="shop.warehouse"
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
        </template>
      </div>

      <ul class="tips mt-4">
        <li v-for="item in $tm('order_delivery.checklist')" :key="item">
          {{ item }}
        </li>
      </ul>

      <v-row no-gutters>
        <!-- ========================================= BILLING ========================================= -->

        <v-col
          v-if="billing"
          class="p-2 border-end-grater-md"
          cols="12"
          md="4"
          sm="6"
        >
          <s-order-bill-card
            :basket="basket"
            :billing="billing"
          ></s-order-bill-card>
        </v-col>

        <v-col :md="billing ? 4 : 6" class="p-2" cols="12" sm="6">
          <!-- ========================================= ADDRESS ========================================= -->

          <s-order-receiver-info-card
            :receiver-info="receiver_info"
            :user-id="buyer ? buyer.id : basket.user_id"
          >
            <template v-slot:append-buttons>
              <v-btn
                :loading="busy_edit"
                class="ms-1 rounded-lg"
                color="primary"
                variant="text"
                @click="
                  $emit('show-edit-address', (busy) => (busy_edit = busy))
                "
              >
                <v-icon class="me-1" size="small">edit</v-icon>
                {{ $t("global.actions.edit_address") }}
              </v-btn>
            </template>
          </s-order-receiver-info-card>

          <!-- ========================================= RECEIVER ========================================= -->

          <p class="font-weight-bold mb-2 mt-5">
            {{ $t("order_delivery.receiver") }}
            <span v-if="is_pickup" class="mx-2">
              (<v-icon class="me-1" color="#333" size="small">pin_drop</v-icon>
              {{ $t("global.commons.pickup") }})</span
            >
          </p>

          <p class="mb-1">
            <small
              >{{ $t("global.basket_order_info_summery.receiver") }} :
            </small>
            {{
              receiver_info.full_name
                ? receiver_info.full_name
                : buyer
                  ? buyer.name
                  : $t("global.commons.guest")
            }}
          </p>

          <p v-if="receiver_info.phone" class="mb-1">
            <small>{{ $t("global.basket_order_info_summery.phone") }} : </small>
            <span v-copy>{{ receiver_info.phone }}</span>
            <u-button-whatsapp
              :shop="shop"
              :user="receiver_info"
              class="ms-2"
            ></u-button-whatsapp>
          </p>

          <p class="mb-1">
            <small
              >{{ $t("global.basket_order_info_summery.reserved_date") }} :
            </small>
            <span :title="getLocalTimeString(basket.reserved_at)">{{
              getFromNowString(basket.reserved_at)
            }}</span>
          </p>
        </v-col>
        <!-- ========================================= MAP ========================================= -->

        <v-col
          :md="billing ? 4 : 6"
          :sm="billing ? 12 : 6"
          class="p-2"
          cols="12"
        >
          <template v-if="receiver_info.location">
            <u-map-view
              v-if="$vuetify.display.smAndUp"
              v-model="receiver_info"
              :center="center"
              :marker-position="receiver_info.location"
              :zoom="15"
              class="overflow-hidden rounded-18px border"
              show-user-location
              style="width: 100%; aspect-ratio: 1; max-height: 420px"
            />
            <u-map-image
              v-else
              :location="receiver_info.location"
              aspect-ratio="1"
              class="overflow-hidden rounded-18px border"
              size="100%"
            >
            </u-map-image>
          </template>

          <!-- =================== Preferences >  Preferred Delivery Time =================== -->
          <div v-if="delivery_info && delivery_info.custom">
            <p class="font-weight-bold mb-2 mt-5">
              {{ $t("order_delivery.preferred_delivery_time") }}
            </p>

            <div v-if="has_eta_weekday && days" class="py-2">
              <small>{{ $t("global.commons.days") }}: </small>

              <v-chip
                v-for="item in days"
                :key="item.value"
                color="#fff"
                size="small"
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
                size="small"
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
        v-if="delivery_info"
        v-model="track_expanded"
        class="my-3 max-width-field-large mx-auto"
      >
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title>
            <span>
              <v-icon
                v-if="delivery_info.tracking_code || delivery_info.tracking_url"
                class="me-1"
                color="green"
                >check</v-icon
              >
              <v-icon v-else class="me-1">add_box</v-icon>
              {{ $t("order_delivery.tracking.title") }}
            </span>

            <v-spacer></v-spacer>

            <b class="flex-grow-0 border-start ps-2">
              {{ delivery_info.tracking_code }}</b
            >
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="mb-3">
              {{ $t("order_delivery.tracking.message") }}
            </p>

            <v-text-field
              v-model="tracking_code"
              :disabled="!active_track"
              :label="$t('order_delivery.tracking.code')"
              append-inner-icon="location_searching"
              flat
              variant="solo-filled"
            />

            <v-text-field
              v-model="tracking_url"
              :disabled="!active_track"
              :label="$t('order_delivery.tracking.url')"
              append-inner-icon="link"
              flat
              variant="solo-filled"
            />

            <div class="widget-buttons">
              <v-btn
                :disabled="!active_track"
                :loading="busy_set_tracking"
                color="primary"
                size="x-large"
                @click="setTracking"
              >
                <v-icon start>save</v-icon>
                {{ $t("global.actions.save") }}
              </v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- ========================================= Delivery Timeline ========================================= -->

      <v-row v-if="transportation_order" align="center" class="my-0">
        <v-col class="d-flex justify-center" cols="12" order-sm="2" sm="6">
          <div
            class="d-flex flex-column align-center border rounded-18px overflow-hidden"
          >
            <template v-if="qrcode_value">
              <a
                :href="qrcode_value"
                class="widget-hover d-inline-block position-relative rounded-lg ma-1 mt-3 overflow-hidden"
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
                      getDeliveryServiceIcon(
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
                  content-class="text-start"
                  max-width="320"
                >
                  Your courier can scan this QR code to get order information
                  and take action. Also you can track the order by scanning this
                  QR. <b>[Do not share it with customer]</b>
                </v-tooltip>
              </a>

              <v-list-subheader>
                <v-icon class="me-1">qr_code_scanner</v-icon>
                Scan this QR code
              </v-list-subheader>
            </template>

            <v-btn
              v-if="transportation_order.person"
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
              <v-icon class="me-1" size="small">delivery_dining</v-icon>
              {{ $t("order_delivery.manage_couriers") }}
            </v-btn>
            <v-btn
              v-else-if="transportation_order.service"
              :to="
                IS_VENDOR_PANEL
                  ? {}
                  : {
                      name: 'BPageTransportationServiceOrders',
                      params: {
                        transportation_id:
                          transportation_order.transportation_id,
                        delivery_service_id:
                          transportation_order.service.service_id,
                      },
                    }
              "
              block
              class="tnt"
              color="primary"
              variant="text"
            >
              <v-icon start>local_shipping</v-icon>
              {{ $t("order_delivery.manage_service") }}
            </v-btn>

            <v-btn
              v-if="qrcode_value"
              class="tnt"
              @click="copyToClipboard(qrcode_value)"
            >
              <v-icon start>content_copy</v-icon>
              Send the QR link to the courier.
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" order-sm="1" sm="6">
          <delivery-timeline-transportation-order
            v-if="transportation_order"
            :delivery-info="delivery_info"
            :shop="shop"
            :transportation-order="transportation_order"
            @refresh-service="refreshDeliveryServiceOrder"
          >
          </delivery-timeline-transportation-order>
        </v-col>
      </v-row>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ To Buyer ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <!-- Step 5 : Delivery to the customer > Confirmed by the customer or the transportation system -->
      <div
        v-if="basket.delivery_state === PhysicalOrderStates.SentOrder.code"
        class="pb-3"
      >
        <p
          class="my-2 text-muted"
          v-html="$t('order_delivery.manual.message')"
        ></p>

        <div class="rounded-btns m-2">
          <v-btn
            class="m-1"
            color="primary"
            rounded
            variant="flat"
            @click.stop="
              accept_action = false;
              dialog_received_by_customer = true;
            "
          >
            <v-icon class="mae-1">check</v-icon>
            {{ $t("order_delivery.manual.action_received") }}
          </v-btn>

          <v-btn
            class="ma-1"
            color="#E64A19"
            rounded
            variant="flat"
            @click.stop="
              accept_action = false;
              dialog_returned_by_customer = true;
            "
          >
            <v-icon start>close</v-icon>
            {{ $t("order_delivery.manual.action_returned") }}
          </v-btn>
        </div>

        <!-- Auto complete count down - 14 days after last updated_at -->
        <s-order-delivery-auto-complete
          :basket="basket"
        ></s-order-delivery-auto-complete>

        <p class="mt-2">
          <i class="fas fa-info-circle text-primary" />
          {{ $t("order_delivery.auto_complete_note") }}
        </p>
      </div>

      <v-alert
        v-if="basket.delivery_state === PhysicalOrderStates.ToCustomer.code"
        class="mt-2"
        density="compact"
        icon="check"
        rounded="xl"
        type="success"
        variant="tonal"
      >
        <b>
          <span v-html="$t('order_delivery.received.title')"></span>
        </b>
        <p
          :title="$t('order_delivery.received.delivered_date')"
          class="small m-0"
        >
          <v-icon class="me-1" size="small">access_time</v-icon>

          <b> {{ getFromNowString(basket.delivery_at) }}</b>

          <span class="mx-2">●</span>
          {{ getLocalTimeString(basket.delivery_at) }}
        </p>
      </v-alert>
    </div>
  </div>

  <!-- █████████████████████████ Dialog Delivery > Success █████████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_received_by_customer"
    content-class="rounded-t-xl"
    inset
    max-width="640"
    width="98vw"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title class="text-wrap">
        <v-icon class="me-2">assignment_turned_in</v-icon>

        {{ $t("process_center.delivered_dialog.title") }}
      </v-card-title>

      <v-card-text>
        {{ $t("process_center.delivered_dialog.message") }}

        <u-smart-verify v-model="accept_action" class="my-3"></u-smart-verify>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_received_by_customer = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            :class="{ disabled: !accept_action }"
            :loading="busy_toCustomer"
            color="primary"
            size="x-large"
            variant="flat"
            @click="toCustomer()"
          >
            <v-icon class="me-1">where_to_vote</v-icon>

            {{ $t("process_center.delivered_dialog.confirm_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>

  <!-- █████████████████████████ Dialog Delivery > Failed █████████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_returned_by_customer"
    content-class="rounded-t-xl"
    inset
    max-width="640"
    width="98vw"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title class="text-wrap">
        <v-icon class="me-2">assignment_return</v-icon>
        {{ $t("process_center.return_delivery_dialog.title") }}
      </v-card-title>

      <v-card-text>
        {{ $t("process_center.return_delivery_dialog.message") }}

        <u-smart-verify v-model="accept_action" class="my-3"></u-smart-verify>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_returned_by_customer = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            :class="{ disabled: !accept_action }"
            :loading="busy_return"
            color="red-darken-1"
            size="x-large"
            variant="flat"
            @click="returnDelivery()"
          >
            <v-icon class="me-1">airline_stops</v-icon>

            {{ $t("process_center.return_delivery_dialog.confirm_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import SOrderReceiverInfoCard from "../../../../storefront/order/receiver-info/card/SOrderReceiverInfoCard.vue";
import SOrderBillCard from "../../../../storefront/order/billing/card/SOrderBillCard.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import SOrderDeliveryAutoComplete from "../../../../storefront/order/auto-complete/SOrderDeliveryAutoComplete.vue";
import UButtonWhatsapp from "../../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import BTransportationServiceLabels from "../../../transportation/service/labels/BTransportationServiceLabels.vue";
import DeliveryTimelineTransportationOrder from "../../../../storefront/order/delivery/DeliveryTimelineTransportationOrder.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import { ETA } from "@selldone/core-js/enums/logistic/ETA";
import _ from "lodash-es";
import UDenseCirclesUsers from "../../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import SDenseImagesCircles from "../../../../ui/image/SDenseImagesCircles.vue";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";
import UMapImage from "@selldone/components-vue/ui/map/image/UMapImage.vue";
import { Basket } from "@selldone/core-js";

export default {
  name: "BOrderDashboardDelivery",
  components: {
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
    shop: {
      require: true,
      type: Object,
    },
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
      dialog_received_by_customer: false,

      PhysicalOrderStates: Basket.PhysicalOrderStates,

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

      delivery_service: null,

      //-------------------
      busy_edit: false,

      accept_action: false,
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

    baskets() {
      return [this.basket];
    },
    buyer() {
      return this.basket.buyer;
    },
    in_send_que() {
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
        this.delivery_info.type === ShopTransportations.Pickup.code &&
        this.receiver_info.pickup
      );
    },

    billing() {
      return this.basket.billing
        ? this.basket.billing
        : {} /*Fix bug when seller disable ask for shipping address*/;
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

    delivery_services_id() {
      return this.transportation && this.transportation.info
        ? this.transportation.info.service_ids
        : [];
    },

    transportation_icon() {
      if (
        !this.transportation_type ||
        !ShopTransportations[this.transportation_type]
      )
        return null;
      return ShopTransportations[this.transportation_type].icon;
    },

    delivery_services() {
      if (!this.shop.delivery_services) return [];
      return this.shop.delivery_services.filter((i) =>
        this.delivery_services_id.includes(i.id),
      );
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
  },

  watch: {
    delivery_services() {
      this.autoSelectService();
    },
  },

  methods: {
    sentOrder() {
      this.busy_sentOrder = true;

      this.$emit("confirm-send", {
        callback: () => {
          this.busy_sentOrder = false;
          // Remove from delivery service que:
          this.onDeleteLogisticSendingOrderQue(this.basket);
        },
      });
    },

    toCustomer() {
      this.busy_toCustomer = true;

      this.$emit("confirm-received", {
        callback: () => {
          this.busy_toCustomer = false;
          this.dialog_received_by_customer = false;
        },
      });
    },
    returnDelivery() {
      this.busy_return = true;

      this.$emit("returned-delivery", {
        callback: () => {
          this.busy_return = false;
          this.dialog_returned_by_customer = false;
        },
      });
    },

    refreshDeliveryServiceOrder(callback) {
      this.$emit("refresh-delivery-order", { callback });
    },

    setTracking() {
      this.busy_set_tracking = true;
      this.$emit("set-tracking", {
        tracking_code: this.tracking_code,
        tracking_url: this.tracking_url,
        callback: () => {
          this.busy_set_tracking = false;
          this.track_expanded = false;
        },
      });
    },

    autoSelectService() {
      if (
        !this.in_this_step ||
        !this.delivery_services ||
        !this.delivery_services.length ||
        (this.delivery_service &&
          this.delivery_services_id.includes(this.delivery_service.id))
      )
        return;
      this.delivery_service = null;
      _.delay(() => {
        this.delivery_service = this.delivery_services[0];
      }, 1000);
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

<style scoped></style>

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
    v-if="modern && noDelivery"
    class="sd-modern-widget b-order-service-location-modern text-start"
  >
    <u-widget-header
      class="sd-modern-form-header b-order-service-location-modern__header"
      icon="pin_drop"
      :title="$t('process_center.modern.service_location_title')"
    ></u-widget-header>
    <p class="sd-modern-subtitle b-order-service-location-modern__subtitle">
      {{ $t("process_center.modern.service_location_subtitle") }}
    </p>

    <div class="b-order-service-location-modern__details">
      <!-- ========================================= ADDRESS & CONTACT ========================================= -->
      <section class="b-order-service-location-modern__destination">
        <h3
          class="sd-modern-list-header b-order-service-location-modern__group-title"
        >
          {{ $t("process_center.modern.destination_title") }}
        </h3>
        <s-order-receiver-info-card
          class="b-order-service-location-modern__receiver-card"
          :receiver-info="receiver_info"
          :user-id="basket.user_id"
        ></s-order-receiver-info-card>

        <div class="b-order-service-location-modern__contact">
          <h3 class="b-order-service-location-modern__contact-title">
            {{ $t("order_delivery.receiver") }}
          </h3>
          <p>
            {{
              receiver_info.full_name ||
              receiver_info.name ||
              $t("process_center.modern.service_contact_name_empty")
            }}
          </p>
          <div
            v-if="receiver_info.phone"
            class="b-order-service-location-modern__contact-actions"
            role="group"
            :aria-label="$t('order_delivery.receiver')"
          >
            <bdi dir="ltr">{{ receiver_info.phone }}</bdi>
            <v-tooltip
              location="top"
              content-class="sd-modern-tooltip text-start"
              :open-on-focus="true"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :href="`tel:${receiver_info.phone}`"
                  icon
                  variant="text"
                  class="sd-modern-icon-button"
                  :aria-label="$t('process_center.modern.service_contact_call')"
                  ><v-icon size="18" aria-hidden="true">phone</v-icon></v-btn
                >
              </template>
              {{ $t("process_center.modern.service_contact_call") }}
            </v-tooltip>
            <v-tooltip
              location="top"
              content-class="sd-modern-tooltip text-start"
              :open-on-focus="true"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  class="sd-modern-icon-button"
                  :aria-label="$t('process_center.modern.service_contact_copy')"
                  @click.stop="copyToClipboard(receiver_info.phone)"
                  ><v-icon size="18" aria-hidden="true"
                    >content_copy</v-icon
                  ></v-btn
                >
              </template>
              {{ $t("process_center.modern.service_contact_copy") }}
            </v-tooltip>
            <u-button-whatsapp
              :shop="shop"
              :user="service_contact"
              modern
            ></u-button-whatsapp>
          </div>
          <p
            v-if="basket.reserved_at"
            class="b-order-service-location-modern__purchase-date"
          >
            {{ $t("global.basket_order_info_summery.reserved_date") }} ·
            {{ getLocalTimeString(basket.reserved_at) }}
          </p>
        </div>
      </section>

      <!-- ========================================= MAP ========================================= -->
      <section class="b-order-service-location-modern__location">
        <h3
          class="sd-modern-list-header b-order-service-location-modern__group-title"
        >
          {{ $t("process_center.modern.service_location_title") }}
        </h3>
        <u-map-view
          v-if="receiver_info.location"
          v-model="receiver_info"
          :center="center"
          :marker-position="receiver_info.location"
          :zoom="15"
          class="b-order-service-location-modern__map overflow-hidden border"
          show-user-location
        />
        <p v-else class="b-order-service-location-modern__empty">
          {{ $t("process_center.modern.delivery_location_missing") }}
        </p>
      </section>

      <!-- ========================================= BILLING ========================================= -->
      <section class="b-order-service-location-modern__billing">
        <h3
          class="sd-modern-list-header b-order-service-location-modern__group-title"
        >
          {{ $t("process_center.modern.bill_summary") }}
        </h3>
        <s-order-bill-card
          class="b-order-service-location-modern__bill-card"
          :basket="basket"
          :billing="billing"
        >
          <template #billing-header>
            <h3
              class="sd-modern-list-header b-order-service-location-modern__billing-heading"
            >
              {{ $t("process_center.payment_widget.billing_details") }}
            </h3>
          </template>
        </s-order-bill-card>
        <v-btn
          v-if="!IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
          :href="
            window.API.GET_ORDERS_PDF(
              shop.id,
              basket.id,
              OrderExportPdfType.RECEIPT,
              'pdf',
            )
          "
          class="sd-modern-button sd-modern-button--compact sd-modern-button--inline b-order-service-location-modern__receipt"
          color="primary"
          variant="text"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-icon start>download</v-icon>
          {{ $t("process_center.modern.download_receipt") }}
          <v-icon end>north_east</v-icon>
        </v-btn>
      </section>
    </div>
  </div>
  <div
    v-else
    :class="{ '-activated': in_this_step }"
    class="widget shadow m-3 text-start"
  >
    <div v-if="!noDelivery" class="d-flex text-muted small">
      <span>
        <v-icon size="small">fa:fas fa-shipping-fast</v-icon>
        {{ $t("order_delivery.title") }}
      </span>
      <v-spacer></v-spacer>
    </div>

    <div v-if="!noDelivery">
      <!-- Step 4 : Delivery & Shipping-->

      <!-- Send by delivery person or nothing! -->

      <p class="mt-2" v-html="$t('order_delivery.message')"></p>

      <v-btn
        :class="{ disabled: !isActive }"
        :color="in_this_step ? 'primary' : 'success'"
        :loading="busy_sentOrder"
        :size="in_this_step && !in_send_que ? 'x-large' : undefined"
        :variant="in_send_que ? 'flat' : 'outlined'"
        rounded
        @click="sentOrder"
      >
        <v-icon v-if="checked" class="me-2" color="green">check</v-icon>
        <v-icon
          v-else-if="in_this_step && !in_send_que"
          class="me-2 blink-me"
          size="small"
          >fiber_manual_record
        </v-icon>

        {{ $t("order_delivery.service_action") }}
      </v-btn>

      <ul class="tips mt-4">
        <li v-for="item in $tm('order_delivery.checklist')" :key="item">
          {{ item }}
        </li>
      </ul>
    </div>
    <v-row no-gutters>
      <!-- ========================================= BILLING ========================================= -->

      <v-col class="p-2 border-end-grater-md" cols="12" md="4" sm="6">
        <s-order-bill-card
          :basket="basket"
          :billing="billing"
        ></s-order-bill-card>
      </v-col>

      <v-col class="p-2" cols="12" md="4" sm="6">
        <!-- ========================================= ADDRESS ========================================= -->

        <s-order-receiver-info-card
          :receiver-info="receiver_info"
          :user-id="basket.user_id"
        >
        </s-order-receiver-info-card>

        <!-- ========================================= RECEIVER ========================================= -->

        <p class="font-weight-bold mb-2 mt-5">
          {{ $t("order_delivery.receiver") }}
        </p>

        <p class="mb-1">
          <small
            >{{ $t("global.basket_order_info_summery.receiver") }} :
          </small>
          {{ receiver_info.full_name }}
        </p>

        <p class="mb-1">
          <small>{{ $t("global.basket_order_info_summery.phone") }} : </small>
          {{ receiver_info.phone }}
        </p>

        <p class="mb-1">
          <small
            >{{ $t("global.basket_order_info_summery.reserved_date") }} :
          </small>
          {{ getLocalTimeString(basket.reserved_at) }}
        </p>
      </v-col>
      <!-- ========================================= MAP ========================================= -->

      <v-col class="p-2" cols="12" md="4" sm="12">
        <u-map-view
          v-model="receiver_info"
          :center="center"
          :marker-position="receiver_info.location"
          :zoom="15"
          class="overflow-hidden rounded-18px border"
          show-user-location
          style="width: 100%; height: 300px"
        />
      </v-col>
    </v-row>

    <template v-if="!noDelivery">
      <!-- ========================================= Tracking Code & URL ========================================= -->
      <v-expansion-panels
        v-model="track_expanded"
        class="my-3 max-width-field-large mx-auto"
      >
        <v-expansion-panel>
          <v-expansion-panel-title>
            <span>
              <v-icon
                v-if="delivery_info.tracking_code || delivery_info.tracking_url"
                class="me-1"
                color="green"
                >check</v-icon
              >
              <v-icon v-else class="me-1">add</v-icon>
              {{ $t("order_delivery.tracking.title") }}
            </span>

            <v-spacer></v-spacer>

            <b class="flex-grow-0 border-start ps-2">
              {{ delivery_info.tracking_code }}</b
            >
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p>
              {{ $t("order_delivery.tracking.message") }}
            </p>

            <v-text-field
              v-model="tracking_code"
              :disabled="!active_track"
              :label="$t('order_delivery.tracking.code')"
              append-icon="location_searching"
              rounded
              variant="filled"
            />

            <v-text-field
              v-model="tracking_url"
              :disabled="!active_track"
              :label="$t('order_delivery.tracking.url')"
              append-icon="link"
              rounded
              variant="filled"
            />

            <v-btn
              :disabled="!active_track"
              :loading="busy_set_tracking"
              color="success"
              variant="flat"
              @click="setTracking"
              >{{ $t("global.actions.save") }}
            </v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ To Buyer ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <!-- Step 5 : تحویل به مشتری > توسط مشتری یا سیستم حمل و نقل تایید می گردد-->
      <div v-if="basket.delivery_state === PhysicalOrderStates.SentOrder.code">
        <p v-html="$t('order_delivery.manual.message')"></p>

        <div class="rounded-btns m-2">
          <v-btn
            :loading="!!dialog_received_by_customer"
            class="m-1"
            color="blue"
            rounded
            variant="flat"
            @click.stop="dialog_received_by_customer = true"
          >
            <v-icon class="me-1">check</v-icon>
            {{ $t("order_delivery.manual.action_received") }}
          </v-btn>

          <v-btn
            :loading="!!dialog_returned_by_customer"
            class="m-1"
            color="#E64A19"
            rounded
            variant="flat"
            @click.stop="dialog_returned_by_customer = true"
          >
            <v-icon start>close</v-icon>
            {{ $t("order_delivery.manual.action_returned") }}
          </v-btn>
        </div>

        <p class="mt-2">
          <i class="fas fa-info-circle text-primary" />
          {{ $t("order_delivery.manual.message") }}
        </p>
      </div>

      <v-alert
        v-if="basket.delivery_state === PhysicalOrderStates.ToCustomer.code"
        class="mt-2"
        density="compact"
        icon="check"
        type="success"
      >
        <p class="m-0">
          <span v-html="$t('order_delivery.received.title')"></span>
        </p>
        <p class="small m-0">
          {{ $t("order_delivery.received.delivered_date") }}
          :
          {{ getLocalTimeString(basket.delivery_at) }}
          <span class="mx-4 small">
            <v-icon size="small">access_time</v-icon>
            {{ getFromNowString(basket.delivery_at) }}
          </span>
        </p>
      </v-alert>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog Success ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-dialog v-model="dialog_received_by_customer" max-width="640">
        <v-card class="text-start">
          <v-card-title>
            {{ $t("process_center.delivered_dialog.title") }}
          </v-card-title>

          <v-card-text class="p-2">
            {{ $t("process_center.delivered_dialog.message") }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog_received_by_customer = false">
              {{ $t("global.actions.cancel") }}
            </v-btn>

            <v-btn
              :loading="busy_toCustomer"
              color="primary"
              variant="elevated"
              @click="toCustomer()"
              prepend-icon="done_all"
            >
              {{ $t("process_center.delivered_dialog.confirm_action") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog Failed ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-dialog v-model="dialog_returned_by_customer" max-width="640">
        <v-card class="text-start">
          <v-card-title>
            {{ $t("process_center.return_delivery_dialog.title") }}
          </v-card-title>

          <v-card-text class="p-2">
            {{ $t("process_center.return_delivery_dialog.message") }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog_returned_by_customer = false">
              {{ $t("global.actions.cancel") }}
            </v-btn>

            <v-btn
              :loading="busy_return"
              color="green-darken-1"
              variant="flat"
              @click="returnDelivery()"
            >
              {{ $t("process_center.return_delivery_dialog.confirm_action") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script lang="ts">
import SOrderReceiverInfoCard from "../../../../storefront/order/receiver-info/card/SOrderReceiverInfoCard.vue";
import SOrderBillCard from "../../../../storefront/order/billing/card/SOrderBillCard.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { Basket } from "@selldone/core-js";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";
import { BEventBusMixin } from "../../../../utils/events/BEventBusMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import UButtonWhatsapp from "@selldone/components-vue/ui/button/whatsapp/UButtonWhatsapp.vue";
import { OrderExportPdfType } from "@selldone/core-js/enums/order/OrderExportPdfType.ts";

export default {
  name: "BOrderDashboardServiceLocation",
  mixins: [BEventBusMixin, DateMixin],
  components: {
    UWidgetHeader,
    UButtonWhatsapp,
    UMapView,
    SOrderBillCard,
    SOrderReceiverInfoCard,
  },
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

    noService: {
      default: false,
      type: Boolean,
    },

    noDelivery: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      OrderExportPdfType,
      PhysicalOrderStates: Basket.PhysicalOrderStates,

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
    service_contact() {
      return {
        ...this.receiver_info,
        name: this.receiver_info.full_name || this.receiver_info.name || "",
      };
    },
    isPhysical() {
      return this.basket.type === ProductType.PHYSICAL.code;
    },

    isService() {
      return this.basket.type === ProductType.SERVICE.code;
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
        this.isPhysical &&
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
      return this.basket.receiver_info;
    },

    delivery_info() {
      return this.basket.delivery_info;
    },

    billing() {
      return this.basket.billing;
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
        callback: (success: boolean) => {
          this.busy_set_tracking = false;
          if (success) {
            this.track_expanded = false;
          }
        },
      });
    },
  },
  created() {
    Object.assign(this.center, this.receiver_info.location);

    this.tracking_code = this.delivery_info?.tracking_code;
    this.tracking_url = this.delivery_info?.tracking_url;
  },
};
</script>

<style lang="scss" scoped>
.b-order-service-location-modern {
  &.sd-modern-widget {
    padding: 20px;
    margin-block-end: 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
  }
  &__header {
    margin-block-end: 0;
  }
  &__header :deep(h2) {
    font-family: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
  }
  &__header :deep(h2 > .v-icon) {
    font-size: 20px;
  }
  &__subtitle {
    margin: 4px 0 20px;
    font-size: 12px;
    line-height: 18px;
  }
  &__details {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 0.9fr);
    gap: 22px;
  }
  &__details > section {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__location,
  &__billing {
    padding-inline-start: 20px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  &__group-title {
    margin: 0 0 12px;
  }
  &__receiver-card :deep(> p:first-child),
  &__bill-card :deep(> b:first-child) {
    display: none !important;
  }
  &__receiver-card {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 7px 10px;
    align-items: start;
  }
  &__receiver-card :deep(> p) {
    grid-column: 2;
    margin: 0 !important;
    font-size: 12px;
    line-height: 18px;
  }
  &__receiver-card :deep(> p > small) {
    font-size: inherit;
    font-weight: 400;
    color: var(--sd-modern-muted);
  }
  &__receiver-card :deep(> div.text-center) {
    grid-column: 1;
    grid-row: 1 / span 3;
    text-align: start !important;
  }
  &__receiver-card :deep(.v-avatar) {
    width: 34px !important;
    height: 34px !important;
    margin: 0 !important;
  }
  &__receiver-card :deep(> .v-btn) {
    grid-column: 2;
    justify-self: start;
    margin-inline: 0 !important;
    padding-inline: 0;
    background: transparent;
    box-shadow: none;
    font-size: 12px;
  }
  &__contact {
    display: grid;
    gap: 8px;
    margin-block-start: 16px;
  }
  &__contact > p {
    margin: 0;
  }
  &__contact-title {
    margin: 0;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
  }
  &__contact-actions {
    --sd-modern-icon-button-size: 32px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
  }
  &__purchase-date {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    text-wrap: balance;
  }
  &__map {
    width: 100%;
    height: 220px;
    border-radius: 10px;
  }
  &__empty {
    margin: 0;
    color: var(--sd-modern-muted);
  }
  &__bill-card :deep(.s--value-dashed) {
    padding-block: 4px;
    gap: 12px;
    font-size: 12px;
    line-height: 18px;
  }
  &__bill-card :deep(.s--value-dashed > small) {
    font-size: 12px;
    font-weight: 400;
  }
  &__bill-card :deep(.text-success) {
    color: inherit !important;
    font-size: 13px !important;
    font-weight: 500 !important;
  }
  &__billing-heading {
    border-block-start: 1px solid var(--sd-modern-border);
    padding-block-start: 14px;
    margin: 14px 0 8px;
  }
  &__receipt {
    margin-block-start: 12px;
  }
  @media (max-width: 850px) {
    &__details {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__billing {
      grid-column: 1 / -1;
      border-inline-start: 0;
      padding-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
      padding-block-start: 18px;
    }
  }
  @media (max-width: 599px) {
    &__details {
      grid-template-columns: minmax(0, 1fr);
    }
    &__location {
      border-inline-start: 0;
      padding-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
      padding-block-start: 18px;
    }
  }
}
</style>

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
import { BEventBusMixin } from "@app-backoffice/mixins/event-bus/BEventBusMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BOrderDashboardServiceLocation",
  mixins: [BEventBusMixin, DateMixin],
  components: {
    UMapView,
    SOrderBillCard,
    SOrderReceiverInfoCard,
  },
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

    noDelivery: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

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
    };
  },

  computed: {
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

    this.tracking_code = this.delivery_info.tracking_code;
    this.tracking_url = this.delivery_info.tracking_url;
  },
};
</script>

<style scoped></style>

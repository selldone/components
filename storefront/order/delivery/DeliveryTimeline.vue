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
  <v-timeline dense class="text-start">
    <!-- ------------- Send ------------- -->

    <v-timeline-item v-if="sendAt" small color="blue" icon="play_arrow">
      <small>{{ $t("global.commons.send_date") }}:</small>
      {{ getFromNowString(sendAt) }}

      <br />
      <small>{{ getLocalTimeString(sendAt) }}</small>
    </v-timeline-item>

    <!-- ------------- Delivering ------------- -->

    <v-timeline-item
      v-if="sendAt && status === 'PENDING'"
      small
      color="blue"
      icon="move_down"
      :fill-dot="!person && !service"
    >
      <v-row no-gutters>
        <img
          v-if="transportationObj"
          :src="transportationObj.icon"
          width="24"
          height="24"
          class="me-1"
        />
        {{ $t("global.commons.deliver_in_process") }}
        <v-icon class="mx-1 blink-me" color="#aaa" small>lens</v-icon>

        <v-spacer></v-spacer>
        <div v-if="service">
          <v-icon
            v-if="!service.enable"
            class="blink-me ms-1"
            color="red"
            title="Delivery service not enable"
            >error_outline</v-icon
          >
          <v-chip
            v-if="!service.livemode"
            color="amber"
            class="ms-1"
            outlined
            x-small
            >{{ $t("global.commons.debug") }}</v-chip
          >
        </div>

        <v-icon
          v-if="person && !person.enable"
          class="mx-1 blink-me"
          color="red"
          title="Courier not enable"
          >error_outline</v-icon
        >
      </v-row>
    </v-timeline-item>

    <!-- ------------- Person ------------- -->

    <v-timeline-item v-if="person" small>
      <template v-slot:icon>
        <v-avatar size="36" class="avatar-gradient -thin -role">
          <img :src="getUserAvatar(person.user_id)" />
        </v-avatar>
      </template>

      <div v-if="person.user" class="flex-grow-1">
        {{ person.user.name }}
        <br />
        <a :href="`tel:${person.user.phone}`" class="link-dash"
          ><v-icon class="me-1" small>phone</v-icon> {{ person.user.phone }}</a
        >
      </div>
    </v-timeline-item>

    <!-- ------------- Service ------------- -->

    <v-timeline-item v-if="deliveryService" small>
      <template v-slot:icon>
        <v-avatar size="36" class="avatar-gradient -thin -delivery-service">
          <v-img :src="getShopImagePath(deliveryService.icon)" />
        </v-avatar>
      </template>

      <delivery-service-rate-view v-if="rate" :rate="rate">
      </delivery-service-rate-view>
      <div class="flex-grow-1 d-flex align-center py-1">
        {{ deliveryService.name }}
        <span class="dashed-flex-space"></span>

        <v-btn
          text
          small
          color="primary"
          :loading="busy"
          @click="
            busy = true;
            $emit('refresh-service', () => {
              busy = false;
            });
          "
          ><v-icon class="me-1" small>refresh</v-icon>
          {{ $t("global.actions.check") }}</v-btn
        >
      </div>
      <div
        v-if="transportationOrder && transportationOrder.track"
        class="flex-grow-1 d-flex align-center py-1"
      >
        {{ $t("global.commons.track") }}
        <span class="dashed-flex-space"></span>

        <v-btn
          icon
          color="primary"
          target="_blank"
          :href="transportationOrder.track"
          ><v-icon small>gps_fixed</v-icon>
        </v-btn>
      </div>
      <div
        v-if="transportationOrder && transportationOrder.label"
        class="flex-grow-1 d-flex align-center py-1"
      >
        {{ $t("global.commons.label") }}
        <span class="dashed-flex-space"></span>

        <v-btn
          icon
          color="primary"
          target="_blank"
          :href="transportationOrder.label"
          ><v-icon small>download</v-icon>
        </v-btn>
      </div>
    </v-timeline-item>

    <!-- ------------- Shipping History ------------- -->
    <v-timeline-item
      v-for="(record, i) in history"
      :key="i"
      small
      :icon="
        record.status === 'RETURNED'
          ? 'rotate_right'
          : record.status === 'CANCELED'
          ? 'sync_problem'
          : record.status === 'DELIVERED'
          ? 'check'
          : 'arrow_drop_down'
      "
      class="fadeInUp"
      :color="
        record.status === 'RETURNED'
          ? 'amber'
          : record.status === 'CANCELED'
          ? 'red'
          : record.status === 'DELIVERED'
          ? 'success'
          : 'black'
      "
    >
      <b class="me-2">{{ getFromNowString(record.date) }}</b>
      <small>{{ getLocalTimeString(record.date) }}</small>
      <div>
        {{ record.detail }}
      </div>
      <div v-if="record.location" class="small font-weight-bold">
        <flag
          v-if="record.location.country"
          :iso="record.location.country"
          class="me-1"
        ></flag>
        {{ record.location.state }} > {{ record.location.city }}
        <span v-if="record.location.zip">({{ record.location.zip }})</span>
      </div>
    </v-timeline-item>

    <!-- ------------- Payment ------------- -->

    <v-timeline-item v-if="paymentAt" small color="green" icon="check">
      <img
        src="../../../assets/icons/cod-payment.svg"
        width="24"
        height="24"
        class="me-1"
      />

      <img
        v-if="person || service"
        src="../../../assets/icons/wire.svg"
        width="12"
        height="12"
        class="ms-1 me-2"
      />

      <small>{{ $t("global.commons.payment_date") }}:</small>
      {{ getFromNowString(paymentAt) }}

      <br />
      <small>{{ getLocalTimeString(paymentAt) }}</small>
    </v-timeline-item>

    <!-- ------------- Delivered ------------- -->

    <v-timeline-item v-if="deliverAt" small color="green" icon="check">
      <img
        src="../../../assets/icons/delivered.svg"
        width="24"
        height="24"
        class="me-1"
      />

      <img
        v-if="person || service"
        src="../../../assets/icons/wire.svg"
        width="12"
        height="12"
        class="me-1"
      />

      <small>{{ $t("global.commons.deliver_date") }}:</small>
      {{ getFromNowString(deliverAt) }}

      <br />
      <small>{{ getLocalTimeString(deliverAt) }}</small>

      <span class="mx-2 small font-weight-bold"
        >( <v-icon small>timelapse</v-icon> {{ $t("global.commons.duration") }}
        <v-icon>{{ $t("icons.arrow_small_end") }}</v-icon>
        {{ getDurationOtherTimeString(sendAt, deliverAt) }} )</span
      >
    </v-timeline-item>

    <!-- ------------- Return ------------- -->

    <v-timeline-item v-if="returnAt" small color="amber" icon="keyboard_return">
      <small>{{ $t("global.commons.return_date") }}:</small>
      {{ getFromNowString(returnAt) }}

      <br />
      <small>{{ getLocalTimeString(returnAt) }}</small>
    </v-timeline-item>

    <!-- ------------- Canceled ------------- -->
    <v-timeline-item
      v-if="status === 'CANCELED'"
      small
      color="red"
      icon="close"
    >
      <small>{{ $t("global.commons.cancel_date") }}:</small>
      {{ getFromNowString(updatedAt) }}<br />
      <small>{{ getLocalTimeString(updatedAt) }}</small>
    </v-timeline-item>
  </v-timeline>
</template>

<script>
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";
import DeliveryServiceRateView from "@components/storefront/order/delivery/DeliveryServiceRateView.vue";

export default {
  name: "DeliveryTimeline",
  components: { DeliveryServiceRateView },
  props: {
    sendAt: {},
    returnAt: {},
    paymentAt: {},
    deliverAt: {},
    updatedAt: {},

    status: {}, // Delivery Order Status
    transportationType: {},

    person: {},
    service: {},

    deliveryService: {},
    rate: {},
    transportationOrder: {},

    history: {}, // History of shipping (Shippo) Structure: array of {date: Date, detail:string, location:{city,state,zip,country}, status:TransportationOrderStatus}
  },

  data: function () {
    return {
      busy_info_order: false,
      busy: false,
    };
  },

  computed: {
    transportationObj() {
      return ShopTransportations[this.transportationType];
    },
  },

  methods: {},
};
</script>

<style scoped></style>

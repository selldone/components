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
  <delivery-timeline
    :deliver-at="transportationOrder.deliver_at"
    :delivery-service="
      transportationOrder.service &&
      delivery_services &&
      delivery_services.find(
        (i) => i.id === transportationOrder.service.service_id,
      )
    "
    :history="transportationOrder.history"
    :payment-at="transportationOrder.payment_at"
    :person="transportationOrder.person"
    :rate="transportationOrder.rate"
    :return-at="transportationOrder.return_at"
    :send-at="transportationOrder.send_at"
    :service="transportationOrder.service"
    :status="transportationOrder.status"
    :transportation-order="transportationOrder"
    :transportation-type="deliveryInfo ? deliveryInfo.type : null"
    :updated-at="transportationOrder.updated_at"
    @refresh-service="(callback) => $emit('refresh-service', callback)"
  >
  </delivery-timeline>
</template>

<script>
import DeliveryTimeline from "@components/storefront/order/delivery/DeliveryTimeline.vue";

export default {
  name: "DeliveryTimelineTransportationOrder",
  components: { DeliveryTimeline },
  props: {
    shop: { required: true },
    transportationOrder: { required: true },
    deliveryInfo: {},
  },

  data: function () {
    return {
      busy_info_order: false,
      busy: false,
    };
  },

  computed: {
    delivery_services() {
      return this.shop.delivery_services;
    },
  },

  methods: {},
};
</script>

<style scoped></style>

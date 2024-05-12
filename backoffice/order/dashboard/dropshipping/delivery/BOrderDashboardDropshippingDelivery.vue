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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-if="receiver_info" class="widget shadow my-3 mx-1 mx-md-3 text-start">
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
        </s-order-receiver-info-card>

        <!-- ========================================= RECEIVER ========================================= -->

        <p class="font-weight-bold mb-2 mt-5">
          {{ $t("order_delivery.receiver") }}
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
            class="ms-1"
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

      <v-col :md="billing ? 4 : 6" :sm="billing ? 12 : 6" class="p-2" cols="12">
        <u-map-view
          v-if="receiver_info.location"
          v-model="receiver_info"
          :center="center"
          :marker-position="receiver_info.location"
          :zoom="15"
          class="overflow-hidden rounded-18px border"
          show-user-location
          style="width: 100%; height: 300px"
        />

        <!-- =================== Preferences >  Preferred Delivery Time =================== -->
        <div v-if="delivery_info && delivery_info.custom">
          <p class="font-weight-bold mb-2 mt-5">
            {{ $t("order_delivery.preferred_delivery_time") }}
          </p>

          <div v-if="days" class="py-2">
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
          <div v-if="time_spans" class="py-2">
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
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import SOrderReceiverInfoCard from "../../../../../storefront/order/receiver-info/card/SOrderReceiverInfoCard.vue";
import SOrderBillCard from "../../../../../storefront/order/billing/card/SOrderBillCard.vue";
import UButtonWhatsapp from "../../../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";

export default {
  name: "BOrderDashboardDropshippingDelivery",
  components: {
    UButtonWhatsapp,
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
  },
  data: function () {
    return {
      center: { lat: 0, lng: 0 },
    };
  },
  computed: {
    buyer() {
      return this.basket.buyer;
    },
    billing() {
      return this.basket.billing;
    },
    receiver_info() {
      return this.basket.receiver_info;
    },
    delivery_info() {
      return this.basket.delivery_info;
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
    time_spans() {
      if (!this.delivery_info || !this.delivery_info.time_spans) return null;
      let out = [];

      this.delivery_info.time_spans.forEach((time_span) => {
        out.push(TimeSpans[time_span]);
      });
      return out;
    },
  },

  watch: {},
  created() {
    if (this.receiver_info && this.receiver_info.location)
      Object.assign(this.center, this.receiver_info.location);
  },
  unmounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped></style>

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
  <div class="s--basket-vendor-order-item">
    <!-- ------------------ Vendor Info ------------------ -->
    <v-row v-if="vendor" class="mb-0">
      <v-col class="text-start d-flex align-center" cols="12" md="6">
        <u-avatar-folder
          :src="getShopImagePath(vendor.icon, 128)"
          is-purple
          class="me-1"
          :size="64"
          side-icon="storefront"
          elevated
        >
        </u-avatar-folder>
        <b>{{ vendor.name }}</b>
      </v-col>
      <v-col cols="12" md="6">
        <s-order-delivery-status-stepper
          :state="vendorOrder.delivery_state"
          :states="orders_states"
          class="my-1"
          color="#000"
          dark-color="#000"
          show-caption
        />
      </v-col>
    </v-row>

    <v-row v-if="has_delivery_info">
      <v-col class="border-end-grater-md" cols="12" md="4" sm="6">
        <v-chip
          v-if="is_pickup"
          class="skew-n20 ms-2"
          color="success"
          label
          variant="elevated"
          >{{ $t("global.commons.pickup") }}
        </v-chip>

        <!-- ========================================= Items ========================================= -->

        <div class="mb-2 mt-2 px-2 position-relative">
          <span class="absolute-top-end text-muted px-2 small"
            ><v-icon class="mx-1 t-all-400" size="12">fa:fas fa-angle-up</v-icon
            >{{ $t("global.commons.fulfillment") }}
          </span>
          <div class="d-flex flex-wrap pt-8 pb-2">
            <v-badge
              v-for="item in items"
              :key="item.id"
              :color="item.check ? 'green' : 'amber'"
              class="m-2"
            >
              <template v-slot:badge>{{ item.count }}</template>
              <v-avatar class="border">
                <v-img :src="getProductImage(item.product_id)" />
              </v-avatar>
            </v-badge>
          </div>
        </div>

        <p class="text-start mt-2 text-muted small" title="About the vendor.">
          {{ vendor?.description }}
        </p>
      </v-col>

      <!-- ========================================= ADDRESS ========================================= -->

      <v-col class=" " cols="12" md="4" sm="6">
        <p class="font-weight-bold">
          {{ $t("global.basket_order_info_summery.address") }}
          <span v-if="is_pickup" class="mx-2"
            >({{ $t("global.commons.pickup") }})</span
          >
        </p>

        <p v-if="receiver_info.name" class="mb-1">
          <small>{{ $t("order_page.delivery.name") }} : </small
          >{{ receiver_info.name }}
        </p>

        <p v-if="receiver_info.phone" class="mb-1">
          <small>{{ $t("order_page.delivery.tel") }} : </small
          >{{ receiver_info.phone }}
        </p>
        <p v-if="receiver_info.email" class="mb-1">
          <small>{{ $t("order_page.delivery.email") }} : </small
          >{{ receiver_info.email }}
        </p>
        <p v-if="receiver_info.country" class="mb-1">
          <small>{{ $t("order_page.delivery.country") }} : </small>
          <flag :iso="receiver_info.country" :squared="false" />
          {{ getCountryName(receiver_info.country) }}
        </p>
        <p v-if="receiver_info.state" class="mb-1">
          <small>{{ $t("order_page.delivery.state") }} : </small
          >{{ receiver_info.state }}
          <span class="mx-2"
            ><small>{{ $t("order_page.delivery.city") }} : </small
            >{{ receiver_info.city }}</span
          >
        </p>
        <p v-if="receiver_info.address" class="mb-1">
          <small>{{ $t("order_page.delivery.address") }} : </small
          >{{ receiver_info.address }}
        </p>
        <p v-if="receiver_info.no" class="mb-1">
          <small>{{ $t("order_page.delivery.building_no") }} : </small
          >{{ receiver_info.no }}
          <span class="mx-2"
            ><small>{{ $t("order_page.delivery.unit_no") }} : </small
            >{{ receiver_info.unit }}</span
          >
        </p>
        <p v-if="receiver_info.postal" class="mb-1">
          <small>{{ $t("order_page.delivery.postal_code") }} : </small
          >{{ receiver_info.postal }}
        </p>

        <p v-if="receiver_info.postal" class="mb-1">
          <small>{{ $t("order_page.delivery.description") }} : </small
          >{{ receiver_info.message }}
        </p>

        <p v-if="is_pickup" class="mb-1">
          <small>
            <v-icon class="me-1" size="small">pin_drop</v-icon>
            {{ $t("global.commons.pickup") }}:
          </small>
          <u-map-geo-button :location="receiver_info.location" class="ma-1">
          </u-map-geo-button>
        </p>

        <!-- ========================================= RECEIVER ========================================= -->

        <p class="font-weight-bold">
          {{ $t("global.basket_order_info_summery.receiver") }}
        </p>

        <p v-if="receiver_info.name" class="mb-1">
          <small>{{ $t("global.commons.name") }} : </small>
          {{ receiver_info.name }}
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

      <v-col class="" cols="12" md="4" sm="12">
        <u-map-image
          :location="receiver_info.location"
          aspect-ratio="1"
          class="overflow-hidden rounded-18px border"
          size="100%"
        >
        </u-map-image>

        <div
          v-if="
            delivery_info &&
            (delivery_info.tracking_code || delivery_info.tracking_url)
          "
        >
          <hr />
          <div v-if="delivery_info.tracking_code" class="mb-3">
            <small>{{ $t("order_page.delivery.tracking_code") }} : </small>
            <span v-copy class="font-weight-bold">{{
              delivery_info.tracking_code
            }}</span>

            <div>
              <v-btn
                v-if="delivery_info.tracking_url"
                :href="delivery_info.tracking_url"
                class="ms-2"
                target="_blank"
              >
                <v-icon class="me-1">gps_fixed</v-icon>
                {{ $t("order_page.delivery.tracking_url") }}
              </v-btn>
            </div>
          </div>
        </div>

        <div>
          <delivery-timeline-transportation-order
            v-if="transportation_order"
            :delivery-info="delivery_info"
            :transportation-order="transportation_order"
          >
          </delivery-timeline-transportation-order>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import SOrderDeliveryStatusStepper from "@selldone/components-vue/storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import { Basket } from "@selldone/core-js/models";
import UMapView from "@selldone/components-vue/ui/map/view/UMapView.vue";
import DeliveryTimelineTransportationOrder from "@selldone/components-vue/storefront/order/delivery/DeliveryTimelineTransportationOrder.vue";
import UMapGeoButton from "@selldone/components-vue/ui/map/geo-button/UMapGeoButton.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations.ts";
import UMapImage from "@selldone/components-vue/ui/map/image/UMapImage.vue";

export default {
  name: "SBasketVendorOrderItem",
  mixins: [TemplateMixin, DateMixin],

  components: {
    UMapImage,
    UMapGeoButton,
    DeliveryTimelineTransportationOrder,
    UMapView,
    SOrderDeliveryStatusStepper,
    UAvatarFolder,
  },
  inject: ["$shop"],
  props: {
    basket: {
      require: true,
      type: Object,
    },
    vendorOrder: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {};
  },

  computed: {
    vendor() {
      return this.vendorOrder.vendor;
    },

    type() {
      return this.vendorOrder.type; // Equal to basket type!
    },

    orders_states() {
      if (this.type === ProductType.PHYSICAL.code) {
        return Basket.PhysicalOrderStates;
      } else if (this.type === ProductType.VIRTUAL.code) {
        return Basket.VirtualOrderStates;
      } else if (this.type === ProductType.FILE.code) {
        return Basket.FileOrderStates;
      } else if (this.type === ProductType.SERVICE.code) {
        return Basket.ServiceOrderStates;
      } else if (this.type === ProductType.SUBSCRIPTION.code) {
        return Basket.SubscriptionOrderStates;
      }
      return null;
    },

    items() {
      return this.basket?.items.filter(
        (item) => item.vendor_id === this.vendor.id,
      );
    },
    isPhysical() {
      return this.basket.type === ProductType.PHYSICAL.code;
    },

    isService() {
      return this.basket.type === ProductType.SERVICE.code;
    },

    isVirtual() {
      return this.basket.type === ProductType.VIRTUAL.code;
    },
    isSubscription() {
      return this.basket.type === ProductType.SUBSCRIPTION.code;
    },
    has_delivery_info() {
      return this.isPhysical || this.isService || this.isSubscription;
    },
    receiver_info() {
      return this.vendorOrder.receiver_info
        ? this.vendorOrder.receiver_info
        : {} /*Fix bug when seller disable ask for shipping address*/;
    },

    is_pickup() {
      return (
        this.delivery_info &&
        this.delivery_info.type === ShopTransportations.Pickup.code
      );
    },
    delivery_info() {
      return this.vendorOrder.delivery_info;
    },

    transportation_order() {
      return this.vendorOrder.transportation_order;
    },
  },
  methods: {},
  created() {},
};
</script>

<style scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--basket-vendor-order-item {
  text-align: start;
}
</style>

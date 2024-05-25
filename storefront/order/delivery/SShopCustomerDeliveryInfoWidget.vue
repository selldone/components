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
    class="s--shop-customer-delivery-info-widget widget shadow my-3 mx-0 mx-md-3"
  >
    <h2 class="d-flex align-center">
      <v-icon class="me-1" color="#111"
        >{{
          has_goods_delivery ? "local_shipping" : "switch_access_shortcut_add"
        }}
      </v-icon>
      {{ $t("order_page.delivery.title") }}

      <v-chip
        v-if="is_pickup"
        class="skew-n20 ms-2"
        color="success"
        label
        variant="flat"
        >{{ $t("global.commons.pickup") }}
      </v-chip>

      <v-spacer></v-spacer>
    </h2>

    <v-list-subheader class="px-0">
      {{ $t("order_page.delivery.subtitle") }}
    </v-list-subheader>

    <div v-if="canConfirmReceived" class="mt-3 mb-5 p-2">
      <div class="widget-buttons">
        <v-btn
          :loading="busy_receive"
          color="primary"
          size="x-large"
          @click="confirmReceivedOrder"
        >
          <v-icon class="me-1 blink-me" size="small">lens</v-icon>
          {{ $t("order_page.delivery.confirm_received_action") }}
        </v-btn>
      </div>
      <p v-if="has_goods_delivery" class="text-start">
        <i class="fas fa-info-circle text-primary" />
        {{ $t("order_page.delivery.confirm_received_info") }}
      </p>

      <!-- Auto complete count down - 2 days after last updated_at -->
      <s-order-delivery-auto-complete
        :basket="basket"
      ></s-order-delivery-auto-complete>
    </div>

    <v-row v-if="has_delivery_info">
      <!-- ========================================= BILLING ========================================= -->

      <v-col class="border-end-grater-md" cols="12" md="4" sm="6">
        <v-slide-y-transition hide-on-leave>
          <div v-if="!edit_billing">
            <s-order-bill-card
              :basket="basket"
              :billing="billing"
            ></s-order-bill-card>
            <div class="d-flex justify-end my-2">
              <v-btn
                v-if="can_edit_address"
                :loading="busy_edit_receiver"
                class="nbt"
                variant="flat"
                @click="showEditBilling()"
              >
                <v-icon start>edit</v-icon>
                {{ $t("global.actions.edit") }}
              </v-btn>
            </div>
          </div>
          <div v-else>
            <div class="spacer-line-dotted mt-5 mb-2"></div>

            <u-smart-toggle
              v-model="same_billing"
              :false-title="$t('basket_page.custom_billing_info')"
              :true-title="$t('basket_page.same_billing_address')"
              class="my-3"
              color="success"
            ></u-smart-toggle>

            <v-expand-transition>
              <div v-if="!same_billing">
                <v-text-field
                  v-model="billing_name"
                  :label="$t('global.address_info.name')"
                  :placeholder="$t('global.placeholders.name')"
                  flat
                  variant="outlined"
                ></v-text-field>

                <v-text-field
                  v-model="billing_address"
                  :label="$t('global.address_info.address')"
                  :placeholder="$t('global.placeholders.address')"
                  flat
                  variant="outlined"
                ></v-text-field>
              </div>
            </v-expand-transition>

            <div class="widget-buttons">
              <v-btn
                prepend-icon="close"
                size="x-large"
                variant="text"
                @click="edit_billing = false"
                >{{ $t("global.actions.close") }}
              </v-btn>
              <v-btn
                :loading="busy_edit_billing"
                color="success"
                prepend-icon="save"
                size="x-large"
                variant="elevated"
                @click="onClickSetBilling"
                >{{ $t("global.actions.save") }}
              </v-btn>
            </div>
          </div>
        </v-slide-y-transition>
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

        <div
          v-if="can_edit_address && !is_pickup"
          class="d-flex justify-end my-2"
        >
          <v-btn
            :loading="busy_edit_receiver"
            class="nbt"
            variant="flat"
            @click="showEditAddress"
          >
            <v-icon start>edit</v-icon>
            {{ $t("global.actions.edit") }}
          </v-btn>
        </div>

        <p v-else-if="is_pickup" class="mb-1">
          <small>
            <v-icon class="me-1" size="small">pin_drop</v-icon>
            {{ $t("global.commons.pickup") }}:
          </small>
          <u-map-geo-button :location="receiver_info.location" class="my-1">
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
        <u-map-view
          v-if="receiver_info.location"
          v-model="receiver_info"
          :center="center"
          :class="{ blurred: busy_edit_receiver }"
          :marker-position="receiver_info.location"
          :zoom="15"
          class="blur-animate rounded-28px overflow-hidden"
          show-user-location
          style="width: 100%; height: 350px"
        />

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

        <delivery-timeline-transportation-order
          v-if="transportation_order"
          :delivery-info="delivery_info"
          :shop="getShop()"
          :transportation-order="transportation_order"
        >
        </delivery-timeline-transportation-order>
      </v-col>
    </v-row>

    <v-alert
      v-if="basket.delivery_state === PhysicalOrderStates.ToCustomer.code"
      class="mt-2"
      icon="check"
      type="success"
    >
      <p class="m-0">
        <span>
          {{ $t("order_page.delivery.order_delivered") }}
        </span>
      </p>
      <p :title="$t('order_page.delivery.delivery_time')" class="small m-0">
        <v-icon class="me-1" size="small">access_time</v-icon>

        <b> {{ getFromNowString(basket.delivery_at) }}</b>

        <span class="mx-2">●</span>
        {{ getLocalTimeString(basket.delivery_at) }}
      </p>
    </v-alert>

    <!-- ********************** انتخاب آدرس گیرنده **********************  -->
    <v-dialog
      v-if="has_address"
      v-model="map_dialog"
      :scrim="false"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-sheet color="#fff" height="100%" width="100%">
        <u-map-view
          v-if="map_dialog"
          v-model="receiver_info_edit"
          v-model:center="center_edit"
          :address-type="$t('global.receiver_info.map.address_type')"
          :color="SaminColorDark"
          :confirm-text="$t('global.receiver_info.map.confirm')"
          :delay-load="1000"
          :hide="!map_dialog"
          :receptor-type="$t('global.receiver_info.map.receptor_type')"
          :title="$t('global.receiver_info.map.title')"
          :zoom="17"
          can-select-address
          has-address-book
          has-bottom-bar
          has-top-bar
          startup-mode="default"
          style="width: 100%; height: 100%"
          @clickSetLocation="onClickSetLocation"
          @close="map_dialog = false"
        />
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script>
import SOrderBillCard from "../../../storefront/order/billing/card/SOrderBillCard.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SOrderDeliveryAutoComplete from "../../../storefront/order/auto-complete/SOrderDeliveryAutoComplete.vue";
import DeliveryTimelineTransportationOrder from "../../../storefront/order/delivery/DeliveryTimelineTransportationOrder.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import UMapGeoButton from "../../../ui/map/geo-button/UMapGeoButton.vue";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import { Basket } from "@selldone/core-js";

export default {
  name: "SShopCustomerDeliveryInfoWidget",
  components: {
    USmartToggle,
    UMapGeoButton,
    DeliveryTimelineTransportationOrder,
    SOrderDeliveryAutoComplete,
    SOrderBillCard,
  },
  props: {
    basket: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

      center: { lat: 0, lng: 0 },

      //--------------------------
      map_dialog: false,
      receiver_info_edit: null,
      center_edit: null,
      busy_edit_receiver: false,

      //-------------------------
      edit_billing: false,
      busy_edit_billing: false,

      same_billing: true,
      billing_name: null,
      billing_address: null,

      tax_regions: [],
      last_country_regions: null,
      busy_regions: false,

      busy_receive: false,
    };
  },

  computed: {
    isPhysical() {
      return this.basket.type === ProductType.PHYSICAL.code;
    },

    isService() {
      return this.basket.type === ProductType.SERVICE.code;
    },

    isVirtual() {
      return this.basket.type === ProductType.VIRTUAL.code;
    },

    isAvocado() {
      return this.basket.type === "AVO";
    },

    isSubscription() {
      return this.basket.type === ProductType.SUBSCRIPTION.code;
    },

    has_goods_delivery() {
      return this.isPhysical || this.isSubscription;
    },
    has_address() {
      return this.isPhysical || this.isService || this.isSubscription;
    },
    has_delivery_info() {
      return (
        this.isPhysical ||
        this.isService ||
        (this.isAvocado && this.receiver_info) ||
        this.isSubscription
      );
    },

    canConfirmReceived() {
      if (this.has_goods_delivery) {
        return (
          this.basket.delivery_state ===
          Basket.PhysicalOrderStates.SentOrder.code
        );
      } else if (this.isVirtual) {
        return (
          this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code
        );
      }

      return false;
    },

    receiver_info() {
      return this.basket.receiver_info
        ? this.basket.receiver_info
        : {} /*Fix bug when seller disable ask for shipping address*/;
    },

    is_pickup() {
      return (
        this.delivery_info &&
        this.delivery_info.type === ShopTransportations.Pickup.code &&
        this.receiver_info.pickup
      );
    },

    delivery_info() {
      return this.basket.delivery_info;
    },

    billing() {
      return this.basket.billing
        ? this.basket.billing
        : {} /*Fix bug when seller disable ask for shipping address*/;
    },

    can_edit_address() {
      return (
        this.basket.delivery_state !==
          Basket.PhysicalOrderStates.SentOrder.code &&
        this.basket.delivery_state !==
          Basket.PhysicalOrderStates.ToCustomer.code
      );
    },

    transportation_order() {
      return this.basket.transportation_order;
    },
  },
  methods: {
    showEditAddress() {
      this.map_dialog = true;
      this.receiver_info_edit = Object.assign({}, this.receiver_info);
      this.center_edit = Object.assign({}, this.center);
    },
    onClickSetLocation(info) {
      this.busy_edit_receiver = true;

      axios
        .put(
          window.XAPI.PUT_ORDER_EDIT_RECEIVER_INFO(
            this.shop_name,
            this.$route.params.basket_id,
          ),
          {
            receiver_info: info,

            code: this.basket.code /*🥶 Guest*/,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.basket.receiver_info = data.receiver_info;
            this.center = Object.assign({}, this.center_edit);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit_receiver = false;
        });

      this.map_dialog = false;
    },

    showEditBilling() {
      this.same_billing = !this.billing.custom;
      this.billing_name = this.billing.name;
      this.billing_address = this.billing.address;

      this.edit_billing = true;
    },

    onClickSetBilling() {
      this.busy_edit_billing = true;

      axios
        .put(
          window.XAPI.PUT_ORDER_EDIT_BILLING(
            this.shop_name,
            this.$route.params.basket_id,
          ),
          {
            custom: !this.same_billing,
            name: this.billing_name,
            address: this.billing_address,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.basket.billing = data.billing;
            this.edit_billing = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit_billing = false;
        });
    },

    confirmReceivedOrder() {
      const shop_name = this.shop_name;
      const basket_id = this.$route.params.basket_id;

      this.busy_receive = true;

      axios
        .post(
          window.XAPI.POST_ORDER_BASKET_CONFIRM_RECEIVED(shop_name, basket_id),
          {},
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("order_page.delivery.notifications.confirm_delivery"),
            );
            this.basket.delivery_state = data.delivery_state;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_receive = false;
        });
    },
  },
  created() {
    if (this.receiver_info)
      Object.assign(this.center, this.receiver_info.location);
  },
};
</script>

<style scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-customer-delivery-info-widget {
  text-align: start;
}
</style>

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
  <div class="s--shop-customer-delivery-info-widget widget shadow my-3 mx-0 mx-md-3">
    <h2 class="d-flex align-center">
      <v-icon class="me-1" color="#111">{{has_goods_delivery?'local_shipping':'switch_access_shortcut_add'}}</v-icon>
      {{ $t("physical_order_page.delivery.title") }}

      <v-chip v-if="is_pickup" class="skew-n20 ms-2"  color="success" dark label>{{$t('global.commons.pickup')}}</v-chip>


      <v-spacer></v-spacer>
    </h2>

    <v-subheader class="px-0">
      {{ $t("physical_order_page.delivery.subtitle") }}
    </v-subheader>

    <div v-if="canConfirmReceived" class="mt-3 mb-5 p-2">
      <div class="widget-buttons">
        <v-btn
          x-large
          color="primary"
          dark
          @click="confirmReceivedOrder"
          :loading="busy_receive"
        >
          <v-icon small class="me-1 blink-me">lens</v-icon>
          {{ $t("physical_order_page.delivery.confirm_received_action") }}
        </v-btn>
      </div>
      <p v-if="has_goods_delivery" class="text-start">
        <i class="fas fa-info-circle text-primary" />
        {{ $t("physical_order_page.delivery.confirm_received_info") }}
      </p>

      <!-- Auto complete count down - 2 days after last updated_at -->
      <basket-auto-complete-count-down
        :basket="basket"
      ></basket-auto-complete-count-down>
    </div>

    <v-row v-if="has_delivery_info ">
      <!-- ========================================= BILLING ========================================= -->

      <v-col cols="12" sm="6" md="4" class="border-end-grater-md">
        <div v-if="!edit_billing">
          <basket-billing-widget
            :basket="basket"
            :billing="billing"
          ></basket-billing-widget>
          <div class="d-flex justify-end">
            <v-btn
              v-if="can_edit_address"
              depressed
              @click="showEditBilling()"
              :loading="busy_edit_receiver"
              class="nbt"
              ><v-icon small class="me-1">edit</v-icon>
              {{ $t("global.actions.edit") }}</v-btn
            >
          </div>
        </div>
        <div v-else>
          <div class="spacer-line-dotted mt-5 mb-2"></div>

          <v-checkbox
            class="text-start-dir"
            v-model="same_billing"
            dense
            color="success"
            :label="
              same_billing
                ? $t('basket_page.same_billing_address')
                : $t('basket_page.custom_billing_info')
            "
          ></v-checkbox>

          <v-expand-transition>
            <div v-if="!same_billing">
              <v-text-field
                v-model="billing_name"
                :label="$t('global.address_info.name')"
                dense
                flat
              ></v-text-field>

              <v-text-field
                v-model="billing_address"
                :label="$t('global.address_info.address')"
                dense
                flat
              ></v-text-field>
            </div>
          </v-expand-transition>

          <v-btn text class="m-1" @click="edit_billing = false">{{
            $t("global.actions.close")
          }}</v-btn>
          <v-btn
            depressed
            color="success"
            @click="onClickSetBilling"
            class="m-1"
            :loading="busy_edit_billing"
            >{{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-col>

      <!-- ========================================= ADDRESS ========================================= -->

      <v-col cols="12" sm="6" md="4" class=" ">
        <p class="font-weight-bold">
          {{ $t("global.basket_order_info_summery.address") }}
          <span v-if="is_pickup" class="mx-2">({{$t('global.commons.pickup')}})</span>
        </p>

        <p class="mb-1" v-if="receiver_info.name">
          <small>{{ $t("physical_order_page.delivery.name") }} : </small
          >{{ receiver_info.name }}
        </p>

        <p class="mb-1" v-if="receiver_info.phone">
          <small>{{ $t("physical_order_page.delivery.tel") }} : </small
          >{{ receiver_info.phone }}
        </p>
        <p class="mb-1" v-if="receiver_info.email">
          <small>{{ $t("physical_order_page.delivery.email") }} : </small
          >{{ receiver_info.email }}
        </p>
        <p class="mb-1" v-if="receiver_info.country">
          <small>{{ $t("physical_order_page.delivery.country") }} : </small>
          <flag :iso="receiver_info.country" :squared="false" />
          {{ getCountryName(receiver_info.country) }}
        </p>
        <p class="mb-1" v-if="receiver_info.state">
          <small>{{ $t("physical_order_page.delivery.state") }} : </small
          >{{ receiver_info.state }}
          <span class="mx-2"
            ><small>{{ $t("physical_order_page.delivery.city") }} : </small
            >{{ receiver_info.city }}</span
          >
        </p>
        <p class="mb-1" v-if="receiver_info.address">
          <small>{{ $t("physical_order_page.delivery.address") }} : </small
          >{{ receiver_info.address }}
        </p>
        <p class="mb-1" v-if="receiver_info.no">
          <small>{{ $t("physical_order_page.delivery.building_no") }} : </small
          >{{ receiver_info.no }}
          <span class="mx-2"
            ><small>{{ $t("physical_order_page.delivery.unit_no") }} : </small
            >{{ receiver_info.unit }}</span
          >
        </p>
        <p class="mb-1" v-if="receiver_info.postal">
          <small>{{ $t("physical_order_page.delivery.postal_code") }} : </small
          >{{ receiver_info.postal }}
        </p>

        <p class="mb-1" v-if="receiver_info.postal">
          <small>{{ $t("physical_order_page.delivery.description") }} : </small
          >{{ receiver_info.message }}
        </p>

        <div     v-if="can_edit_address && !is_pickup" class="d-flex justify-end">
          <v-btn

            depressed
            @click="showEditAddress"
            :loading="busy_edit_receiver"
            class="nbt"
            ><v-icon small class="me-1">edit</v-icon>
            {{ $t("global.actions.edit") }}</v-btn
          >
        </div>

        <p v-else-if="is_pickup" class="mb-1" >
          <small><v-icon small class="me-1">pin_drop</v-icon>
            {{$t('global.commons.pickup')}}: </small
          >                   <geo-navigation-button  class="my-1" :location="receiver_info.location">  </geo-navigation-button>

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

      <v-col cols="12" sm="12" md="4" class="">
        <s-map-view
            v-if="receiver_info.location"
          v-model="receiver_info"
          :zoom="15"
          :center="center"
          style="width: 100%; height: 350px"
          :marker-position="receiver_info.location"
          show-user-location
          class="blur-animate rounded-28px overflow-hidden"
          :class="{ blured: busy_edit_receiver }"
        />

        <div
          v-if="
            delivery_info &&
            (delivery_info.tracking_code || delivery_info.tracking_url)
          "
        >
          <hr />
          <div v-if="delivery_info.tracking_code" class="mb-3">
            <small
              >{{ $t("physical_order_page.delivery.tracking_code") }} :
            </small>
            <span class="font-weight-bold" v-copy>{{
              delivery_info.tracking_code
            }}</span>

            <div>
              <v-btn
                v-if="delivery_info.tracking_url"
                :href="delivery_info.tracking_url"
                target="_blank"
                class="ms-2"
                ><v-icon class="me-1">gps_fixed</v-icon>
                {{ $t("physical_order_page.delivery.tracking_url") }}</v-btn
              >
            </div>
          </div>
        </div>

        <delivery-timeline-transportation-order
          v-if="transportation_order"
          :shop="getShop()"
          :transportation-order="transportation_order"
          :delivery-info="delivery_info"
        >
        </delivery-timeline-transportation-order>
      </v-col>
    </v-row>

    <v-alert
      icon="check"
      v-if="basket.delivery_state === PhysicalOrderStates.ToCustomer.code"
      type="success"
      class="mt-2"
    >
      <p class="m-0">
        <span>
          {{ $t("physical_order_page.delivery.order_delivered") }}
        </span>
      </p>
      <p class="small m-0" :title="$t('physical_order_page.delivery.delivery_time')">

        <v-icon small class="me-1">access_time</v-icon>

        <b> {{ getFromNowString(basket.delivery_at) }}</b>

        <span class="mx-2">●</span>
        {{ getLocalTimeString(basket.delivery_at) }}
      </p>
    </v-alert>

    <!-- ********************** انتخاب آدرس گیرنده **********************  -->
    <v-dialog
      v-if="has_address"
      v-model="map_dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-sheet color="#fff" width="100%" height="100%">
        <s-map-view
          v-if="map_dialog"
          v-model="receiver_info_edit"
          :color="SaminColorDark"
          :center.sync="center_edit"
          :hide="!map_dialog"
          :zoom="17"
          style="width: 100%; height: 100%"
          startup-mode="default"
          has-top-bar
          can-select-address
          has-bottom-bar
          has-address-book
          :title="$t('global.receiver_info.map.title')"
          :confirm-text="$t('global.receiver_info.map.confirm')"
          :address-type="$t('global.receiver_info.map.address_type')"
          :receptor-type="$t('global.receiver_info.map.receptor_type')"
          @close="map_dialog = false"
          @clickSetLocation="onClickSetLocation"
          :delay-load="1000"
        />
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script>
import { PhysicalOrderStates } from "@core/enums/basket/PhysicalOrderStates";
import BasketBillingWidget from "../../../../Applications/Backoffice/pages/shop/widgets/order-billing/BasketBillingWidget.vue";
import { ProductType } from "@core/enums/product/ProductType";
import BasketAutoCompleteCountDown from "../../../../Applications/Backoffice/components/order/BasketAutoCompleteCountDown.vue";
import DeliveryTimelineTransportationOrder from "@components/storefront/order/delivery/DeliveryTimelineTransportationOrder.vue";
import {ShopTransportations} from "@core/enums/logistic/ShopTransportations";
import GeoNavigationButton
  from "@components/map/GeoNavigationButton.vue";

export default {
  name: "SShopCustomerDeliveryInfoWidget",
  components: {
    GeoNavigationButton,
    DeliveryTimelineTransportationOrder,
    BasketAutoCompleteCountDown,
    BasketBillingWidget,
  },
  props: {
    basket: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      PhysicalOrderStates: PhysicalOrderStates,

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
      return this.basket.type === 'AVO';
    },

    isSubscription() {
      return this.basket.type === ProductType.SUBSCRIPTION.code;
    },


    has_goods_delivery(){
      return this.isPhysical || this.isSubscription
    },
    has_address(){
      return this.isPhysical || this.isService || this.isSubscription
    },
    has_delivery_info(){
      return this.isPhysical || this.isService || (this.isAvocado && this.receiver_info) || this.isSubscription
    },



    canConfirmReceived() {
      if (this.has_goods_delivery) {
        return (
          this.basket.delivery_state === PhysicalOrderStates.SentOrder.code
        );
      } else if (this.isVirtual) {
        return (
          this.basket.delivery_state === PhysicalOrderStates.PreparingOrder.code
        );
      }

      return false;
    },

    receiver_info() {
      return this.basket.receiver_info?this.basket.receiver_info:{}/*Fix bug when seller disable ask for shipping address*/;
    },

    is_pickup() {
      return this.delivery_info && this.delivery_info.type===ShopTransportations.Pickup.code && this.receiver_info.pickup;
    },

    delivery_info() {
      return this.basket.delivery_info;
    },

    billing() {
      return this.basket.billing?this.basket.billing:{}/*Fix bug when seller disable ask for shipping address*/;
    },

    can_edit_address() {
      return (
        this.basket.delivery_state !== PhysicalOrderStates.SentOrder.code &&
        this.basket.delivery_state !== PhysicalOrderStates.ToCustomer.code
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
            this.$route.params.basket_id
          ),
          {
            receiver_info: info,

            code:this.basket.code/*🥶 Guest*/,
          }
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
            this.$route.params.basket_id
          ),
          {
            custom: !this.same_billing,
            name: this.billing_name,
            address: this.billing_address,
          }
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
          {}
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t(
                "physical_order_page.delivery.notifications.confirm_delivery"
              )
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
.s--shop-customer-delivery-info-widget{
  text-align: start;
}
</style>

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
  <div>
    <v-alert v-if="valid_origin" density="compact" type="error">
      <div>
        {{ $t("shipping.errors.warehouse_error") }}
      </div>
      <ul>
        <li v-if="!warehouse.location">
          {{ $t("shipping.errors.set_origin") }}
        </li>
        <li v-if="!warehouse.country">
          {{ $t("shipping.errors.set_country") }}
        </li>
        <li v-if="!warehouse.address">
          {{ $t("shipping.errors.set_address") }}
        </li>
        <li v-if="!warehouse.postal">{{ $t("shipping.errors.set_zip") }}</li>
      </ul>
      <v-spacer></v-spacer>
      <v-btn
        :to="{ name: 'BPageShopLogisticWarehouse' }"
        class="m-2"
        variant="outlined"
        >{{ $t("shipping.set_warehouse") }}
      </v-btn>
    </v-alert>

    <u-text-value-dashed v-else class="text-start text-subtitle-2">
      <template v-slot:label>
        <v-icon class="me-1" size="small">fa:fas fa-truck-pickup</v-icon>
        {{ $t("shipping.pickup_location") }}
      </template>
      <span >{{ origin_address }}</span>

      <v-btn
        v-if="orderPageMode"
        :disabled="busy_rates"
        class="tnt ms-1"
        color="primary"
        size="small"
        variant="text"
        @click="calculateRates()"
      >
        <v-icon class="me-1" size="small">refresh</v-icon>
        {{ $t("shipping.refresh_rates") }}
      </v-btn>
    </u-text-value-dashed>

    <div class="position-relative" style="height: 12px">
      <u-loading-progress v-if="busy_rates"></u-loading-progress>
    </div>
    <!-- ――――――――――――――――――――――― Table ――――――――――――――――――――――― -->
    <v-data-table
      v-model:page="page"
      :disable-sort="orderPageMode"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="baskets"
      :items-per-page="10"
      class="bg-transparent mb-5"
      density="compact"
      hide-default-footer
      item-key="id"
      style="min-height: 120px"
    >
      <!-- ――――――――― Order ID ――――――――― -->

      <template v-slot:item.id="{ item }">
        <div class="min-width-200 d-flex align-center py-1">
          <div>
            <b-order-button
              :order="item"
              class="font-weight-black"
              text
            ></b-order-button>

            <div class="text-muted text-center">
              {{
                getLocalTimeStringSmall(
                  item.reserved_at ? item.reserved_at : item.created_at,
                )
              }}
            </div>
          </div>

          <products-dense-images-circles
            v-if="item.items"
            :ids="getProductsIDs(item)"
            big-scale
            class="py-1"
            style="vertical-align: super; display: inline"
          ></products-dense-images-circles>
        </div>
      </template>

      <!-- ――――――――― Customer ――――――――― -->

      <template v-slot:item.user_id="{ item }">
        <div v-if="item.buyer" class="d-flex align-center small py-1">
          <v-avatar
            class="avatar-gradient -thin -customer me-1 hover-scale"
            color="#fafafa"
            size="36"
          >
            <v-img :src="getUserAvatar(item.buyer.id)"></v-img>
          </v-avatar>
          <div>
            <div class="font-weight-bold">
              {{ item.buyer.name }}
            </div>

            <template v-if="item.buyer.phone">
              {{ item.buyer.phone }}
              <u-button-whatsapp
                :shop="shop"
                :user="item.buyer"
                class="mx-1"
                small
              ></u-button-whatsapp>
            </template>

            <template v-if="item.buyer.email">
              <v-btn
                :title="$t('global.commons.email') + ' : ' + item.buyer.email"
                class="ms-1"
                color="#333"
                icon
                size="small"
                @click.stop="copyToClipboard(item.buyer.email)"
              >
                <v-icon size="18">email</v-icon>
              </v-btn>
            </template>
          </div>
        </div>
      </template>

      <!-- ――――――――― Price & Payment ――――――――― -->

      <template v-slot:item.price="{ item }">
        <div class="d-flex align-center">
          <!-- Status > Payment -->
          <s-order-status-view
            :status="item.status"
            class="mt-3 inline-block"
          ></s-order-status-view>
          <span class="dashed-flex-space"></span>

          <!-- Show normal pricing -->
          <u-price :amount="item.price" :currency="item.currency"></u-price>
        </div>

        <div class="d-flex align-center text-muted small py-1">
          <div>
            <v-icon size="x-small">local_shipping</v-icon>
            <span class="mx-1"
              >{{ $t("admin_shop.orders.physical.delivery") }}:</span
            >

            <span v-if="item.delivery_price < 0">{{
              $t("admin_shop.orders.physical.not_paid")
            }}</span>
            <span v-else-if="item.delivery_price === 0">{{
              $t("global.commons.free")
            }}</span>
            <u-price
              v-else
              :amount="item.delivery_price"
              :currency="item.currency"
            ></u-price>
          </div>

          <v-spacer></v-spacer>

          <div v-if="item.discount">
            <span class="me-1"
              >{{ $t("admin_shop.orders.physical.discount") }}:</span
            >

            <u-price
              :amount="item.discount"
              :currency="item.currency"
            ></u-price>
          </div>
        </div>
      </template>

      <!-- Country -->
      <template v-slot:item.country="{ item }">
        <flag
          :iso="item.country"
          :squared="false"
          :title="getCountryName(item.country)"
        />
      </template>

      <!-- ――――――――― Package ――――――――― -->

      <template v-slot:item.package="{ item }">
        <div v-if="item.delivery_info">
          <div class="single-line">
            <i class="fas fa-ruler-combined me-1" />
            {{ item.delivery_info.volume.width }}
            <i class="fas fa-times mx-2" />{{
              item.delivery_info.volume.length
            }}
            <i class="fas fa-times mx-2" />{{
              item.delivery_info.volume.height
            }}
            {{ size_unit }}
          </div>

          <div class="single-line">
            <i class="fas fa-weight-hanging me-1" />
            {{ item.delivery_info.weight }} {{ mass_unit }}
          </div>
        </div>
      </template>

      <!-- ――――――――― Address ――――――――― -->

      <!-- Status > Delivery -->
      <template v-slot:item.receiver_info="{ item }">
        <div @mouseenter="setActivator($refs['ad-' + item.id], item)">
          <div v-if="item.receiver_info" class="d-flex align-center">
            <flag :iso="item.receiver_info.country" class="me-1"></flag>
            <span class="dashed-flex-space"></span>
            <span>{{ getShortAddress(item.receiver_info) }}</span>
          </div>
          <div :ref="'ad-' + item.id" class="py-1">
            {{ item.receiver_info.address }}
          </div>
        </div>
      </template>

      <!-- ――――――――― Rates ――――――――― -->
      <template v-slot:item.rates="{ item }">
        <v-select
          v-if=" pricingResponse?.shipments"
          v-model="item.rate"
          :items="getRates(item)"
          type="string"
          class="min-width-100 max-w-400 my-1"
          flat
          hide-details
          item-value="uid"
          item-title="provider"
          placeholder="out of range!"
          return-object
          variant="solo"
          density="compact"
        >
          <template v-slot:item="{ item, props }">
            <v-list-item v-bind="props" title="">
              <b-transportation-service-rate
                :rate="item.raw"
              ></b-transportation-service-rate>
            </v-list-item>
          </template>

          <template v-slot:selection="{ item }">
            <b-transportation-service-rate
              :rate="item.raw"
            ></b-transportation-service-rate>
          </template>
        </v-select>
        <div v-else class="min-width-100 py-2 text-center text-muted">
          {{ $t("shipping.no_rate") }}
        </div>

        <v-expansion-panels
          v-if="getErrors(item)"
          class="my-1 auto-small-expansion"
        >
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title
              class="pa-1 text-primary font-weight-bold"
              style="min-height: 24px"
            >
              {{ $t("shipping.view_messages") }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul
                class="text-red small font-weight-bold py-1 max-w-300 text-start"
              >
                <li v-for="(msg, i) in getErrors(item)" :key="i">
                  {{ msg }}
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>

      <!-- ――――――――― Actions ――――――――― -->

      <template v-slot:item.action="{ item }">
        <div class="pa-1">
          <v-btn
            v-if="!transportation_orders.some((i) => i.basket_id === item.id)"
            :disabled="!item.rate"
            :loading="busy_request && busy_request.includes(item.id)"
            color="primary"
            @click.stop="requestService([item.id], item.rate)"
          >
            <v-icon start>add</v-icon>
            {{
              item?.rate?.action ? item.rate.action : $t("global.actions.buy")
            }}
          </v-btn>

          <delivery-service-fulfilled-button
            v-else
            :deliveryService="deliveryService"
            :transportation-order="
              transportation_orders.find((i) => i.basket_id === item.id)
            "
          >
          </delivery-service-fulfilled-button>
        </div>
      </template>

      <template v-slot:item.clear="{ item }">
        <v-btn icon variant="text" @click="remove(baskets, item)">
          <v-icon>close</v-icon>
        </v-btn>
      </template>

      <template v-slot:bottom>
        <v-pagination
          v-if="pageCount > 1"
          v-model="page"
          :length="pageCount"
          rounded
        />
      </template>
    </v-data-table>

    <!-- ----------------------------------- Receiver Info Details Menu ----------------------------------- -->
    <v-menu
      v-if="!orderPageMode"
      :activator="activator"
      :open-delay="200"
      location="top"
      max-width="360"
      open-on-hover
    >
      <v-sheet class="p-3" rounded="xl">
        <s-order-receiver-info-card
          v-if="activator_item && activator_item.receiver_info"
          :receiver-info="activator_item.receiver_info"
          :userId="activator_item.user_id"
          class="text-start"
        >
        </s-order-receiver-info-card>
        <span v-else>{{ $t("shipping.not_set_yet") }}</span>
      </v-sheet>
    </v-menu>
  </div>
</template>

<script>
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import ProductsDenseImagesCircles from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import UButtonWhatsapp from "../../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import SOrderStatusView from "../../../../storefront/order/order-status/SOrderStatusView.vue";
import BOrderButton from "../../../order/button/BOrderButton.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import SOrderReceiverInfoCard from "../../../../storefront/order/receiver-info/card/SOrderReceiverInfoCard.vue";
import DeliveryServiceFulfilledButton from "../../../transportation/DeliveryServiceFulfilledButton.vue";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import BTransportationServiceRate from "../../../transportation/service/rate/BTransportationServiceRate.vue";
import _ from "lodash-es";

export default {
  name: "BTransportationServiceLabels",
  components: {
    BTransportationServiceRate,
    UTextValueDashed,
    DeliveryServiceFulfilledButton,
    SOrderReceiverInfoCard,
    BOrderButton,

    SOrderStatusView,
    UButtonWhatsapp,
    ProductsDenseImagesCircles,
  },
  props: {
    shop: { type: Object, required: true },
    warehouse: { type: Object, required: true },
    transportation: { type: Object, required: true },
    deliveryService: { type: Object, required: true },
    baskets: {},
    busyRates: {
      type: Boolean,
      default: false,
    },
    orderPageMode: {
      type: Boolean,
      default: false,
    },
    autoCalculateRates: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    busy_rates: false,
    busy_add_order: false,
    busy_info_order: false,

    pricingResponse: null,

    transportation_orders: [],

    page: 1,

    //------------------------------ Receiver info detail menu
    activator: null,
    activator_item: null,

    busy_request: null,

    //------------------------------
  }),
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    valid_origin() {
      return (
        !this.warehouse ||
        !this.warehouse.location ||
        !this.warehouse.country ||
        !this.warehouse.address ||
        !this.warehouse.postal
      );
    },
    origin_address() {
      return MapHelper.GenerateFullAddressFromMapInfo(this.warehouse);
    },
    //------------------------------
    headers() {
      return [
        ...(this.orderPageMode
          ? []
          : [
              {
                title: "",
                align: "center",
                sortable: false,
                value: "clear",
              },

              {
                title: this.$t("admin_shop.orders.physical.table.order_number"),
                align: "start",
                sortable: true,
                value: "id",
              },
              {
                title: this.$t("global.commons.customer"),
                align: "start",
                sortable: true,
                value: "user_id",
                width: 250,
              },
              {
                title: this.$t(
                  "admin_shop.orders.physical.table.payment_status",
                ),
                align: "center",
                value: "price",
                sortable: true,
              },
            ]),

        {
          title: this.$t("global.commons.package"),
          align: "start",
          value: "package",
          sortable: false,
        },

        {
          title: this.$t("global.commons.address"),
          align: "start",
          value: "receiver_info",
          sortable: true,
        },

        {
          title: "",
          align: "center",
          value: "basket_item_returns",
          sortable: false,
        },

        {
          title: this.$t("global.commons.shipping_rates"),
          align: "start",
          sortable: false,
          value: "rates",
        },

        {
          title: "",
          align: "center",
          sortable: false,
          value: "action",
        },
      ];
    },

    //------------------------------

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

    //------------------------------

    config() {
      return {
        headers: {
          Authorization: this.token,
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json; charset=utf-8",
        },
      };
    },

    sum_weight_baskets() {
      let out = 0;

      this.baskets.forEach((basket) => {
        out += basket && basket.delivery_info ? basket.delivery_info.weight : 0;
      });
      return out;
    },

    sum_volume_baskets() {
      let out = { width: 0, length: 0, height: 0 };

      this.baskets.forEach((basket) => {
        if (!basket || !basket.delivery_info || !basket.delivery_info.volume)
          return;
        const volume = basket.delivery_info.volume;
        out.width = Math.max(out.width, volume.width);
        out.length = Math.max(out.length, volume.length);
        out.height = Math.max(out.height, volume.height);
      });

      return out;
    },

    // -----------------------------------------------------------
    send_orders_list() {
      return this.$store.getters.getOrderSendingQue;
    },

    send_orders_list_filtered() {
      if (!this.send_orders_list) return [];

      return this.send_orders_list.filter((basket) => {
        return (
          !basket.delivery_info.type ||
          (basket.delivery_info.type === this.transportation.type &&
            (!basket.delivery_service_id ||
              basket.delivery_service_id === this.service.id))
        );
      });
    },
    // -----------------------------------------------------------
  },

  watch: {
    baskets() {
      // console.log('baskets change')

      if (this.autoCalculateRates) this.autoGetRate();
    },
    transportation() {
      //  console.log('transportation change')

      if (this.autoCalculateRates) this.autoGetRate();
    },
    deliveryService() {
      // console.log('deliveryService change')
      if (this.autoCalculateRates) this.autoGetRate();
    },
  },

  created() {},

  unmounted() {},
  mounted() {
    if (this.autoCalculateRates) this.autoGetRate();
  },
  methods: {
    getShortAddress(receiver_info) {
      if (receiver_info.state && receiver_info.city)
        return `${receiver_info.state} > ${receiver_info.city}`;
      else if (receiver_info.city) return receiver_info.city;
      else receiver_info.state;
    },

    autoGetRate: _.debounce(
      function () {
        console.log("Auto get rates...");
        this.calculateRates();
      },
      250,
      { maxWait: 1000, trailing: true },
    ),

    // ――――――――――――――――――――――― External Function: Calculate Price ―――――――――――――――――――――――

    /**
     *
     *  transport_type => motorbike | cargo | cargo_s | motor_taxi | car
     */
    calculateRates() {
      if (!this.baskets || !this.baskets.length) return;
      this.$emit("update:busyRates", true);
      this.busy_rates = true;

      const order_ids = [];
      this.baskets.forEach((destination) => {
        if (destination) order_ids.push(destination.id);
      });

      axios
        .get(
          window.API.GET_DELIVERY_SERVICE_PRICE(
            this.shop.id,
            this.transportation.id,
            this.deliveryService.id,
          ),
          {
            params: {
              order_ids: order_ids,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.pricingResponse = data.price;

            // Auto assign the first rate for each order:
            this.baskets.forEach((baske) => {
              const rates = this.getRates(baske);
              if (rates.length) baske.rate = rates[0];
            });
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.$emit("update:busyRates", false);
          this.busy_rates = false;
        });
    },

    // ――――――――――――――――――――――― External Function: Buy service ―――――――――――――――――――――――

    requestServiceBatch() {
      const order_ids = [];
      this.baskets.forEach((basket) => {
        if (basket) order_ids.push(basket.id);
      });
      this.requestService(order_ids, this.pricingResponse.batch);
    },

    requestService(order_ids, rate) {
      this.busy_add_order = true;
      this.busy_request = order_ids;

      axios
        .post(
          window.API.POST_DELIVERY_SERVICE_ADD_ORDER(
            this.shop.id,
            this.transportation.id,
            this.deliveryService.id,
          ),
          {
            order_ids: order_ids,
            rate: rate,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            data.transportation_orders.forEach((transportation_order) => {
              this.AddOrUpdateItemByID(
                this.transportation_orders,
                transportation_order,
              );
            });

            this.baskets.forEach((basket) => {
              if (basket) this.onDeleteLogisticSendingOrderQue(basket);
            });
            this.$emit("add:orders", {
              transportation_orders: data.transportation_orders,
            });
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_order = false;
          this.busy_request = null;
        });
    },

    // --------------------------------------------------------------------

    getProductsIDs(basket) {
      //console.log('basket',basket)
      const out = [];
      basket.items.forEach((item) => {
        if (!out.includes("" + item.product_id)) out.push("" + item.product_id);
      });

      return out;
    },

    // --------------------------------------------------------------------

    getRates(item) {
      if (!this.pricingResponse) return [];

      const found = this.pricingResponse.shipments.find(
        (s) => s.order.id === item.id && s.order.type === item.type,
      );
      return found ? found.rates : [];
    },
    getErrors(item) {
      if (!this.pricingResponse) return null;
      const found = this.pricingResponse.shipments.find(
        (s) => s.order.id === item.id && s.order.type === item.type,
      );
      return found && found.error_msgs && found.error_msgs.length
        ? found.error_msgs
        : null;
    },

    convert_estimated_minutes(d) {
      return DateConverter.SecondsToString(d * 60);
    },

    // --------------------- Receiver info detail menu ---------------------
    setActivator(node, item) {
      //console.log("setActivator", node);
      this.activator = node;
      this.activator_item = item;
    },
  },
};
</script>

<style lang="scss" scoped></style>

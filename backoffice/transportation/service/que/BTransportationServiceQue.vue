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
  <div
    v-if="has_orders_in_que"
    :class="{ hiding: hiding && !mouse_over }"
    class="send-orders-list"
    @mouseenter="mouse_over = true"
    @mouseleave="mouse_over = false"
    v-bind="$attrs"
  >
    <v-row align="center" no-gutters class="px-2 bg-gray">
      <v-btn class="ma-1" icon variant="text" @click="loadFromLocalStorage">
        <v-icon> refresh</v-icon>
      </v-btn>

      <v-spacer></v-spacer>

      <v-chip
        v-if="filter_transportation_type || filter_delivery_service_id"
        :variant="!show_all ? 'tonal' : 'elevated'"
        class="ma-1"
        color="primary"
        size="small"
        label
        @click="show_all = !show_all"
        >{{ $t("global.commons.all") }}
      </v-chip>

      <v-chip
        @click="toggleShow"
        :variant="hiding ? 'tonal' : 'elevated'"
        class="ma-1"
        color="primary"
        size="small"
        label
        :prepend-icon="hiding ? 'arrow_back' : 'fa:fas fa-map-pin'"
        >Pin
      </v-chip>
    </v-row>

    <!-- ======================= Send Orders Que ======================= -->
    <v-list
      class="border-between-vertical w-100 overflow-auto"
      density="compact"
      elevation="0"
      lines="three"
      variant="text"
      style="flex-grow: 1; overflow: auto; height: 100%"
    >
      <u-drag
        v-for="basket in send_orders_list_filtered"
        :key="basket.id"
        :drag-image-html="`${$t('global.commons.order')} ${getBasketOrderCode(basket)}`"
        :drag-image-src="require('../../../../assets/icons/basket-yellow.svg')"
        :transfer-data="{ basket: basket }"
        drag-image-color="#FFA000"
      >
        <v-list-item
          :class="{
            '-selected': getId($route.params.basket_id) === basket.id,
          }"
          :dark="getId($route.params.basket_id) === basket.id"
          :to="
            getDeliveryServiceID(basket) &&
            getShopTransportationForBasketDeliveryTypeID(basket)
              ? {
                  name: 'BPageTransportationServiceDashboard',
                  params: {
                    transportation_id:
                      getShopTransportationForBasketDeliveryTypeID(basket),
                    delivery_service_id: getDeliveryServiceID(basket),
                  },
                }
              : getBasketOrderProcessTo(basket)
          "
          class="border-bottom bg-white text-start"
          ripple
        >
          <template v-slot:title>
            <v-row align="center" justify="space-between" no-gutters>
              <b-order-button-basket
                :order="basket"
                class="me-1"
              ></b-order-button-basket>

              <u-map-geo-button
                v-if="basket.receiver_info.location"
                :icon="true"
                :location="basket.receiver_info.location"
                :only-one="true"
                :transportation-type="basket.delivery_info.type"
                @click.stop
              ></u-map-geo-button>

              <v-btn
                icon
                size="small"
                variant="text"
                @click.prevent="deleteItemFromLogisticSendingOrderQue(basket)"
              >
                <v-icon>close</v-icon>
                <v-tooltip activator="parent">
                  Remove from the list.
                </v-tooltip>
              </v-btn>
            </v-row>
          </template>

          <div class="mt-1">
            <v-chip
              v-if="basket.status === 'COD'"
              class="ma-1"
              color="#000"
              variant="flat"
              size="x-small"
            >
              <v-avatar
                start
                :image="require('../../../../assets/icons/pos.svg')"
              >
              </v-avatar>
              {{ $t("global.commons.cod") }}
            </v-chip>

            <v-chip
              v-if="basket.delivery_info.weight"
              :title="$t('global.commons.weight')"
              class="ma-1"
              prepend-icon="scale"
              color="#000"
              variant="flat"
              size="x-small"
            >
              {{ basket.delivery_info.weight }} {{ mass_unit }}
            </v-chip>

            <v-chip
              v-if="basket.delivery_info.volume"
              :title="$t('global.commons.size')"
              class="ma-1"
              prepend-icon="straighten"
              color="#000"
              variant="flat"
              size="x-small"
            >
              {{ basket.delivery_info.volume.width }}
              <i class="fas fa-times mx-2" />{{
                basket.delivery_info.volume.length
              }}
              <i class="fas fa-times mx-2" />{{
                basket.delivery_info.volume.height
              }}
              {{ size_unit }}
            </v-chip>

            <v-chip
              v-if="basket.delivery_info.distance"
              :title="$t('global.commons.distance')"
              class="ma-1"
              prepend-icon="near_me"
              color="#000"
              variant="flat"
              size="x-small"
            >
              {{ numeralFormat(basket.delivery_info.distance, "0,0.[0]") }}

              <span class="small">Km</span>
            </v-chip>
          </div>

          <v-row no-gutters align="center">
            <s-dense-images-circles
              :images="basket.items?.map((i) => getProductImage(i.product_id))"
              :limit="5"
            ></s-dense-images-circles>
            <v-spacer></v-spacer>
            <v-btn
              class="m-1"
              color="#fff"
              icon
              size="32"
              variant="elevated"
              @click.prevent
            >
              <v-img
                :height="24"
                :src="getSuggestedTransportTypeImage(basket)"
                :width="24"
              />
            </v-btn>
            <img
              class="mx-1"
              height="10"
              src="../../../../assets/icons/wire.svg"
              width="10"
            />
            <v-btn
              class="m-1"
              color="#fff"
              icon
              size="32"
              variant="elevated"
              @click.prevent="showSelectDeliveryService(basket)"
            >
              <v-img
                v-if="getDeliveryServiceID(basket)"
                :height="24"
                :src="getDeliveryServiceIcon(getDeliveryServiceID(basket))"
                :width="24"
              />
              <v-icon v-else>help_outline</v-icon>

              <v-tooltip>Change Service</v-tooltip>
            </v-btn>
          </v-row>
        </v-list-item>
      </u-drag>

      <div style="height: 200px"></div>
    </v-list>

    <!-- ======================= Footer ======================= -->

    <v-row
      style="position: absolute; bottom: 0; left: 0; width: 100%"
      class="border-top bg-white"
      no-gutters
    >
      <v-btn
        v-for="transportation in transportations"
        :key="transportation.type"
        :to="{
          name: 'BPageTransportationServices',
          params: { transportation_id: transportation.id },
        }"
        variant="flat"
        class="ma-1"
        size="small"
      >
        <img
          :src="getTransportationImage(transportation.type)"
          height="24"
          width="24"
        />
      </v-btn>
    </v-row>
  </div>

  <!-- ======================= Dialog Select Delivery Service ======================= -->
  <v-bottom-sheet v-model="show_delivery_services" max-width="640" scrollable>
    <v-card v-if="selected_basket_service" class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-2">local_shipping</v-icon>
        Select delivery service
      </v-card-title>
      <v-card-text>
        <p class="mb-3">
          In the shipping service panel, you can select a service to generate
          labels, manage parcels, and, if supported by delivery services,
          process batch orders for sending.
        </p>
        <v-list class="border-between-vertical overflow-visible pb-12" lines="two">
          <v-list-item
            v-for="service in getDeliveryServices(selected_basket_service)"
            :key="service.id"
            @click="setDeliveryServiceID(selected_basket_service, service.id)"
            :prepend-avatar="getShopImagePath(service.icon)"
            :title="service.name"
            :subtitle="service.description"
            class="row-hover"
          >
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="show_delivery_services = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { ImageStore } from "@selldone/core-js/enums/logistic/ImageStore";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import BOrderButtonBasket from "../../../order/button/basket/BOrderButtonBasket.vue";
import UMapGeoButton from "../../../../ui/map/geo-button/UMapGeoButton.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import UFadeScroll from "../../../../ui/fade-scroll/UFadeScroll.vue";
import SDenseImagesCircles from "../../../../ui/image/SDenseImagesCircles.vue";
import UDrag from "../../../../ui/drag/core/UDrag.vue";

export default {
  name: "BTransportationServiceQue",
  components: {
    UDrag,
    SDenseImagesCircles,
    UFadeScroll,
    UMapGeoButton,
    BOrderButtonBasket,
  },
  props: {
    shop: {
      type: Object,
      require: true,
    },
    autoShow: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    hiding: true,

    mouse_over: false,

    //------------------------

    busy: false,

    selected_basket_service: null,
    show_delivery_services: false,

    //------------------------
    show_all: false,

    filter_transportation_type: null,
    filter_delivery_service_id: null,
  }),
  computed: {
    has_orders_in_que() {
      return this.send_orders_list && this.send_orders_list.length;
    },
    delivery_services() {
      return this.shop.delivery_services;
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },

    send_orders_list() {
      return this.$store.getters.getOrderSendingQue;
    },

    send_orders_list_filtered() {
      if (!this.send_orders_list) return [];

      if (this.show_all) return this.send_orders_list;

      if (!this.filter_transportation_type && !this.filter_delivery_service_id)
        return this.send_orders_list;

      return this.send_orders_list.filter((basket) => {
        console.log(
          "filter",
          basket.delivery_info.type,
          this.filter_transportation_type,
          basket.delivery_info.type === this.filter_transportation_type,
        );

        return (
          !basket.delivery_info.type ||
          !this.filter_transportation_type ||
          (basket.delivery_info.type === this.filter_transportation_type &&
            (!this.filter_delivery_service_id ||
              !basket.delivery_service_id ||
              basket.delivery_service_id === this.filter_delivery_service_id))
        );
      });
    },

    transportations() {
      return this.shop.transportations;
    },

    transportation_que_path() {
      return `shop/${this.shop.id}/transportation:order-que`;
    },
  },

  watch: {},

  created() {
    this.hiding =
      this.$vuetify.display.smAndDown ||
      !localStorage.getItem("transportation:persist");
  },

  mounted() {
    this.loadFromLocalStorage();

    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    //――――――――――――――――――――――― Filter ―――――――――――――――――――――――

    this.EventBus.$on(
      "transportation.set-filter",
      ({ type, delivery_service_id }) => {
        console.log("transportation.set-filter", type, delivery_service_id);
        this.filter_transportation_type = type;
        this.filter_delivery_service_id = delivery_service_id;
      },
    );

    //――――――――――――――――――――――― Add Item ―――――――――――――――――――――――

    this.EventBus.$on("transportation.add-new-sending", ({ basket }) => {
      this.AddLogisticSendingOrderQue(basket);
    });

    //――――――――――――――――――――――― Delete Item ―――――――――――――――――――――――

    this.EventBus.$on("transportation.delete-sending", ({ basket }) => {
      this.deleteItemFromLogisticSendingOrderQue(basket);
    });
  },

  beforeUnmount() {
    this.EventBus.$off("transportation.set-filter");
    this.EventBus.$off("transportation.add-new-sending");
    this.EventBus.$off("transportation.delete-sending");
  },

  methods: {
    //―――――――――――――――――――――――  ―――――――――――――――――――――――

    getTransportationImage(type) {
      if (!type || !ShopTransportations[type]) return null;
      return ShopTransportations[type].icon;
    },

    getSuggestedTransportTypeImage(basket) {
      if (basket.delivery_info.type) {
        return ShopTransportations[basket.delivery_info.type].icon;
      }
      return ImageStore.box;
    },

    toggleShow() {
      this.hiding = !this.hiding;
      if (!this.hiding) {
        localStorage.setItem("transportation:persist", "true");
      } else {
        localStorage.removeItem("transportation:persist");
      }
    },

    getShopTransportationForBasketDeliveryType(basket) {
      return this.transportations.find(
        (transportation) => transportation.type === basket.delivery_info.type,
      );
    },
    getShopTransportationForBasketDeliveryTypeID(basket) {
      const transportation =
        this.getShopTransportationForBasketDeliveryType(basket);
      return transportation ? transportation.id : null;
    },
    getDeliveryServices(basket) {
      const transportation =
        this.getShopTransportationForBasketDeliveryType(basket);
      const service_ids =
        transportation && transportation.info
          ? transportation.info.service_ids
          : [];

      return this.delivery_services.filter((i) => service_ids.includes(i.id));
    },

    getDeliveryServiceID(basket) {
      if (!basket) return null;
      return basket.delivery_service_id; // Assign when add to que
    },
    setDeliveryServiceID(basket, service_id) {
      basket.delivery_service_id = service_id;
      this.show_delivery_services = false;
      this.saveOrdersQue();
    },

    showSelectDeliveryService(basket) {
      // Auto select first service if count in one:

      this.selected_basket_service = basket;
      this.show_delivery_services = true;
    },

    getOrdersIds(basket_ids) {
      let out = [];
      basket_ids.forEach((basket_id) => {
        if (basket_id >= 0) out.push(basket_id);
      });
      return out;
    },

    //―――――――――――――――――――――― Logistic > Order sending que ――――――――――――――――――――

    loadFromLocalStorage() {
      try {
        let orders_que = JSON.parse(
          localStorage.getItem(this.transportation_que_path),
        );
        // Sync data from server:
        this.$store.commit("setOrderSendingQue", orders_que);
      } catch (e) {
        //console.error(e)
        this.$store.commit("setOrderSendingQue", []);
      }
    },

    deleteItemFromLogisticSendingOrderQue(item) {
      this.loadFromLocalStorage();

      let list = this.send_orders_list;
      this.DeleteItemByID(list, item.id);
      this.$store.commit("setOrderSendingQue", list);

      this.saveOrdersQue();
    },

    AddLogisticSendingOrderQue(basket) {
      this.loadFromLocalStorage();

      if (!basket.delivery_info) basket.delivery_info = {}; // ERROR!!!
      if (!basket.receiver_info) basket.delivery_info = {}; // ERROR!!!

      let list = this.send_orders_list;

      this.AddOrUpdateItemByID(list, basket);
      this.$store.commit("setOrderSendingQue", list);

      // Request select delivery service:
      if (!basket.delivery_service_id) this.showSelectDeliveryService(basket);

      this.saveOrdersQue();
    },
    saveOrdersQue() {
      const list = [];

      this.send_orders_list.forEach((item) => {
        list.push({
          id: item.id,
          type: item.type,
          delivery_state: item.delivery_state,
          price: item.price,
          discount: item.discount,
          currency: item.currency,
          delivery_info: item.delivery_info,
          receiver_info: item.receiver_info,
          billing: item.billing,
          delivery_service_id: item.delivery_service_id,
          shop_id: item.shop_id,
          user_id: item.user_id,
          status: item.status,
          delivery_at: item.delivery_at,
          delivery_price: item.delivery_price,
          tax: item.tax,
          tax_shipping: item.tax_shipping,
          tax_included: item.tax_included,

          reserved_at: item.reserved_at,
          created_at: item.created_at,

          buyer: item.buyer,

          items: item.items.map(function (it) {
            return { product_id: it.product_id };
          }),
        });
      });

      console.log("list", list);

      localStorage.setItem(this.transportation_que_path, JSON.stringify(list));
    },
  },
};
</script>

<style lang="scss" scoped>
.send-orders-list {
  position: fixed;
  left: -4px;
  bottom: 12px;
  top: 12px;
  background: white;
  border-radius: 0 18px 18px 0;
  width: 320px;
  --background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  box-shadow:
    inset 0 -3em 3em rgba(0, 0, 0, 0.01),
    0 5px 50px 4px rgba(166, 166, 166, 0.37) !important;

  z-index: 10;
  transition: all 0.4s ease-in-out;

  .toggle-btn {
    transition-delay: 0.2s;
  }

  &.hiding {
    transform: translateX(calc(-100% + 52px));

    @media only screen and (max-width: 1800px) {
      transform: translateY(calc(100% - 52px)) translateX(calc(-100% + 52px));
      border-radius: 40px;
    }

    .toggle-btn {
      transform: rotate(180deg);
    }
  }
}

.transportation-item {
  background: var(--theme-dark);
  color: white;
  border-radius: 8px;
  padding: 4px;
  margin: 6px;

  p {
    margin: 1px;
  }

  li {
    cursor: pointer;
    font-weight: 500;
    margin-right: 16px;
    padding: 1px 6px;

    &:hover {
      font-weight: 700;
      background: var(--theme-light);
    }
  }
}

.-selected {
  background-color: #1976d2 !important;
  color: white !important;
}
</style>

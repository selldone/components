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
  <div>
    <u-loading-progress
      v-if="busy_fetch || busy_info_order"
    ></u-loading-progress>

    <v-data-table
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="transportation_orders"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      class="bg-transparent"
      density="compact"
      hide-default-footer
      item-key="id"
    >
      <template v-slot:item.address="{ item }">
        <div class="min-width-200 text-start">
          <div v-if="item.basket.user">
            <v-avatar :size="24" class="avatar-gradient -thin me-2">
              <v-img :src="getUserAvatar(item.basket.user.id)" />
            </v-avatar>
            <b class="me-2">{{ item.basket.user.name }}</b>
            <u-button-whatsapp
              :shop="shop"
              :user="item.basket.user"
            ></u-button-whatsapp>
          </div>

          <div class="single-line max-w-300">
            <flag
              :iso="item.basket.receiver_info.country"
              :squared="false"
              class="me-1"
            />
            <span>{{ generateFullAddress(item.basket.receiver_info) }}</span>
          </div>

          <div>
            <i class="fas fa-phone me-1"></i>
            <span v-copy>{{ item.basket.receiver_info.phone }}</span>
          </div>
        </div>
      </template>

      <template v-slot:item.receiver_info="{ item }">
        <div class="min-width-75">
          <v-btn
            v-if="
              item.basket.receiver_info && item.basket.receiver_info.location
            "
            :href="`https://www.google.com/maps/dir/?api=1&destination=${item.basket.receiver_info.location.lat},${item.basket.receiver_info.location.lng}`"
            icon
            target="_blank"
            title="Google map"
            variant="text"
          >
            <v-icon>map</v-icon>
          </v-btn>

          <v-btn
            v-if="item.track"
            :href="item.track"
            color="primary"
            icon
            target="_blank"
            title="Tracking page"
            variant="text"
          >
            <v-icon>gps_fixed</v-icon>
          </v-btn>
        </div>

        <small>{{ item.distance }} Km</small>
      </template>

      <template v-slot:item.basket_id="{ item }">
        <div v-if="item.basket.items">
          <products-dense-images-circles
            :ids="getProductsIDs(item.basket)"
          ></products-dense-images-circles>
        </div>
        <b-order-button-basket
          :order="item.basket"
          class="mb-1"
          text
        ></b-order-button-basket>
      </template>

      <template v-slot:item.person_id="{ item }">
        <div v-if="item.person" class="min-width-75">
          <v-avatar
            :size="38"
            class="hover-scale force-top avatar-gradient -thin -role"
          >
            <v-img :src="getUserAvatar(item.person.user_id)" />
          </v-avatar>
        </div>
      </template>

      <template v-slot:item.service_id="{ item }">
        <div v-if="item.service" class="d-flex flex-column align-center">
          <v-avatar :size="38" class="hover-scale force-top" tile>
            <v-img :src="getDeliveryServiceIcon(item.service.service_id)" />
          </v-avatar>
          <v-chip
            v-if="!item.service.livemode"
            class="my-1"
            color="amber"
            size="x-small"
            variant="flat"
          >
            {{ $t("global.commons.debug") }}
          </v-chip>
          <v-chip
            v-else
            class="my-1"
            color="success"
            size="x-small"
            variant="flat"
          >
            {{ $t("global.commons.live") }}
          </v-chip>
        </div>
      </template>

      <template v-slot:item.delivery_price="{ item }">
        <div class="py-1 min-width-250 text-start">
          <div v-if="item.basket.delivery_price > 0" class="min-width-100">
            <small>{{ $t("global.commons.shipping_cost") }}: </small>
            <u-price
              :amount="item.basket.delivery_price"
              :currency="item.basket.currency"
            ></u-price>
          </div>
          <div v-else-if="item.basket.delivery_price === 0" >
            <v-chip size="small" variant="flat" color="#000">{{ $t("global.commons.free") }}</v-chip>
          </div>
          <div v-else-if="item.basket.delivery_price === -1" >
            <v-chip size="small" variant="flat" color="#000">{{ $t("global.commons.sod") }}</v-chip>

          </div>

          <div v-if="item.basket.tax_shipping">
            <small>{{ $t("global.commons.shipping_tax") }}: </small>
            <u-price
              :amount="item.basket.tax_shipping"
              :currency="item.basket.currency"
            ></u-price>
          </div>

          <hr v-if="item.rate || item.amount" class="my-1" />
          <b-transportation-service-rate
            v-if="item.rate"
            :rate="item.rate"
          ></b-transportation-service-rate>

          <u-price
            v-else-if="item.amount"
            :amount="item.amount"
            :currency="item.currency"
          ></u-price>
        </div>
      </template>

      <template v-slot:item.send_at="{ item }">
        <div v-if="item.send_at" class="min-width-200">
          <small>{{ $t("global.commons.send_date") }}:</small>
          {{ getFromNowString(item.send_at) }}<br />
          <small>{{ getLocalTimeString(item.send_at) }}</small>
        </div>
      </template>

      <template v-slot:item.label="{ item }">
        <v-btn
          v-if="item.label"
          :href="item.label"
          icon
          target="_blank"
          variant="text"
        >
          <v-icon>download</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.status="{ item }">
        <div class="min-width-200">
          <div
            v-if="item.status === 'PENDING'"
            class="d-flex align-items-center"
          >
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  :loading="busy_transportation === item"
                  class="me-2"
                  color="primary"
                  v-bind="props"
                >
                  {{ $t("global.actions.change_state") }}

                  <v-divider class="mx-2" vertical></v-divider>
                  <v-icon size="small">expand_more</v-icon>
                </v-btn>
              </template>
              <v-list class="text-start">
                <v-list-item
                  @click="updateTransportationOrderStatus(item, 'DELIVERED')"
                >
                  <template v-slot:prepend>
                    <v-icon color="green">check</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("global.commons.delivered") }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="updateTransportationOrderStatus(item, 'RETURNED')"
                >
                  <template v-slot:prepend>
                    <v-icon color="amber">keyboard_return</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("global.commons.returned") }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="updateTransportationOrderStatus(item, 'CANCELED')"
                >
                  <template v-slot:prepend>
                    <v-icon color="red">close</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("global.commons.canceled") }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <delivery-service-fulfilled-button
              v-if="service"
              :deliveryService="service"
              :transportation-order="item"
              has-refresh
              @refresh="getOrderInfo(item)"
            >
            </delivery-service-fulfilled-button>
          </div>

          <div v-else-if="item.status === 'DELIVERED'">
            <v-icon class="me-1" color="success" size="small"
              >fiber_manual_record
            </v-icon>
            {{ $t("global.commons.delivered") }}

            <div v-if="item.deliver_at">
              <small>{{ $t("global.commons.deliver_date") }}:</small>
              {{ getFromNowString(item.deliver_at) }}<br />
              <small>{{ getLocalTimeString(item.deliver_at) }}</small>
            </div>
          </div>
          <div v-else-if="item.status === 'RETURNED'">
            <v-icon class="me-1" color="amber" size="small"
              >fiber_manual_record
            </v-icon>

            {{ $t("global.commons.returned") }}

            <div v-if="item.return_at">
              <small>{{ $t("global.commons.return_date") }}:</small>
              {{ getFromNowString(item.return_at) }}<br />
              <small>{{ getLocalTimeString(item.return_at) }}</small>
            </div>
          </div>
          <div v-else-if="item.status === 'CANCELED'">
            <v-icon class="me-1" color="red" size="small"
              >fiber_manual_record
            </v-icon>

            {{ $t("global.commons.canceled") }}
          </div>

          <div v-if="item.payment_at">
            <img
              class="me-1"
              height="24"
              src="../../../../assets/icons/pos.svg"
              width="24"
            />

            {{ $t("global.commons.payment") }}

            <div>
              <small>{{ $t("global.commons.payment_date") }}:</small>
              {{ getFromNowString(item.payment_at) }}<br />
              <small>{{ getLocalTimeString(item.payment_at) }}</small>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table>
  </div>
</template>
<script>
import BOrderButtonBasket from "../../../order/button/basket/BOrderButtonBasket.vue";
import DeliveryServiceFulfilledButton from "../../../transportation/DeliveryServiceFulfilledButton.vue";
import UButtonWhatsapp from "../../../../ui/button/whatsapp/UButtonWhatsapp.vue";
import ProductsDenseImagesCircles from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import BTransportationServiceRate from "../../../transportation/service/rate/BTransportationServiceRate.vue";

export default {
  name: "BTransportationServiceOrders",
  components: {
    BTransportationServiceRate,
    ProductsDenseImagesCircles,
    UButtonWhatsapp,
    DeliveryServiceFulfilledButton,
    BOrderButtonBasket,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },

    service: {
      require: false,
    },
    transportation: {
      require: true,
    },
    person: {
      require: false,
    },
  },
  data() {
    return {
      transportation_orders: [],

      busy_fetch: false,

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      sortBy: [{ key: null, order: "desc" }],

      //------------
      busy_transportation: null,

      busy_info_order: false,
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    headers() {
      return [
        {
          title: this.$t("global.commons.address"),
          align: "start",
          sortable: false,
          value: "address",
        },

        {
          title: this.$t("global.commons.location"),
          align: "center",
          sortable: false,
          value: "receiver_info",
        },

        {
          title: this.$t("global.sort.order"),
          align: "center",
          sortable: true,
          value: "basket_id",
        },
        ...(!this.service && !this.person // Not needed show these rows on service or person orders list!
          ? [
              {
                title: this.$t("global.sort.delivery_person"),
                align: "center",
                sortable: true,
                value: "person_id",
              },
              {
                title: this.$t("global.sort.delivery_service"),
                align: "center",
                sortable: true,
                value: "service_id",
              },
            ]
          : []),

        {
          title: this.$t("global.commons.shipping"),
          align: "center",
          sortable: false,
          value: "delivery_price",
        },

        {
          title: this.$t("global.sort.date"),
          align: "start",
          sortable: true,
          value: "send_at",
        },
        {
          title: this.$t("global.commons.label"),
          align: "center",
          value: "label",
          sortable: false,
        },

        {
          title: this.$t("global.commons.status"),
          align: "start",
          sortable: true,
          value: "status",
        },
      ];
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchOrders(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },
  },

  mounted() {},
  created() {},

  methods: {
    //――――――――――――――――――――――― Fetch transportation orders ―――――――――――――――――――――――

    fetchOrders(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_TRANSPORTATION_ORDERS(this.shop.id), {
          params: {
            transportation_id: this.transportation.id,
            service_id: this.service ? this.service.id : null,
            person_id: this.person ? this.person.id : null,

            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,
          },
        })
        .then(({ data }) => {
          this.totalItems = data.total;
          this.transportation_orders = data.transportation_orders;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    //――――――――――――――――――――――― Update transportation status ―――――――――――――――――――――――

    updateTransportationOrderStatus(transportation_order, status) {
      this.openDangerAlert(
        status,
        `Are you sure to change the delivery state to ${status}?`,
        "Yes, Set it!",
        () => {
          this.busy_transportation = transportation_order;
          axios
            .post(
              window.API.POST_TRANSPORTATION_ORDER_STATUS(
                this.shop.id,
                transportation_order.transportation_id,
                transportation_order.id,
              ),
              {
                status: status,
              },
            )
            .then(({ data }) => {
              if (data.error) {
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.showSuccessAlert(
                  null,
                  this.$t("transportation_orders.notifications.success_update"),
                );
                transportation_order.status = data.status;
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_transportation = null;
            });
        },
      );
    },

    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Get Order Info ⬬⬬⬬⬬⬬⬬⬬⬬⬬
    getOrderInfo(transportation_order) {
      this.busy_info_order = true;

      axios
        .get(
          window.API.GET_DELIVERY_SERVICE_ORDER_INFO(
            this.shop.id,
            transportation_order.transportation_id,
            transportation_order.service.service_id,
            transportation_order.uid,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            if (data.changed) {
              const { sortBy, page, itemsPerPage } = this.options;
              this.fetchOrders(
                page,
                sortBy[0]?.key,
                sortBy[0]?.order === "desc",
              );
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_info_order = false;
        });
    },

    getProductsIDs(basket) {
      //console.log('basket',basket)
      const out = [];
      basket.items.forEach((item) => {
        if (!out.includes("" + item.product_id)) out.push("" + item.product_id);
      });

      return out;
    },
  },
};
</script>

<style lang="scss" scoped></style>

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

<template>
  <s-widget-box
    :active="true"
    :src="require('../../../../assets/icons/store.svg')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-green mr-sm' style='font-size: 6px;'></span>  ${$t(
      'admin_shop.dashboard.active_orders.title',
    )}<span class='fw-normal ml-xs small'> ${$t(
      'admin_shop.dashboard.active_orders.title_small',
    )}</span>  </h5>`"
    class="s--shop-dashboard-orders"
  >
    <!-- Actions -->
    <template v-slot:actions>
      <div class="pb-2">
        <h2 class="text-h3 me-2 font-weight-black">
          {{
            numeralFormat(
              totalPendingOrders + totalPendingOrders_Avocado,
              "0,0",
            )
          }}
        </h2>
        <small>{{
          $t("admin_shop.dashboard.active_orders.pending_orders")
        }}</small>
      </div>

      <u-fade-scroll
        :show-arrow="$vuetify.display.smAndUp"
        drag-scroll
        small-arrow
        stick-class="-card"
      >
        <div class="d-flex">
          <!-- ██████████████████████████ Online Baskets > Full Funnel ██████████████████████████ -->

          <v-card
            class="text-center me-4 pa-2 -card flex-0-0"
            color="#fafafa"
            flat
            max-width="420"
            min-width="250"
            rounded="lg"
            width="90%"
          >
            <u-chart-funnel-simple
              :colors="available_types.map((t) => t.colors)"
              :labels="[
                $t('global.commons.leads'),
                $t('global.commons.new_carts'),
                $t('global.commons.checkouts'),
                $t('global.commons.sells'),
              ]"
              :sub-labels="available_types.map((t) => $t(t.name))"
              :value="funnel_value"
              :width="$vuetify.display.xs?240:320"
              class="mx-auto"
              display-percentage
              height="280"
            >
            </u-chart-funnel-simple>

            <u-time-span
              v-model:end-date="end_date"
              v-model:start-date="start_date"
              :max-days="max_days_data_exist"
              :origin-date="origin_date_data_exist"
              class="mt-5 mb-2"
              @onChange="calculate_funnel()"
            ></u-time-span>
          </v-card>

          <!-- ██████████████████████████ Online Baskets ██████████████████████████ -->

          <v-card
            v-for="item in available_types"
            :key="item.code"
            :class="{ disabled: !item.enable }"
            class="me-4 pa-2 -card"
            color="#fafafa"
            flat
            max-width="420"
            min-width="300"
            rounded="lg"
            style="--background: #fafafa"
            width="90%"
          >
            <div class="d-flex justify-space-between align-center">
              <h2 class="text-h3 me-2 font-weight-black">
                {{ numeralFormat(getTotalPendingOrders(item), "0,0") }}
              </h2>
              <b class="text-muted">{{ $t(item.name) }}</b>
            </div>

            <div class="p-2">
              <v-btn
                :to="{ name: item.process_page }"
                class="nbt m-1"
                min-width="200"
                size="small"
              >
                <img :src="item.image" class="me-1" height="18" />
                {{
                  $t(
                    `admin_shop.dashboard.active_orders.${item.code.toLowerCase()}`,
                  )
                }}
                <v-icon
                  v-if="getTotalPendingOrders(item)"
                  class="ms-1 blink-me"
                  color="success"
                  size="x-small"
                  >lens
                </v-icon>
              </v-btn>

              <v-btn
                class="nbt m-1"
                size="small"
                @click="
                  show_extra = selected_type !== item.code || !show_extra;
                  selected_type = item.code;
                "
              >
                <v-icon size="small"
                  >{{
                    selected_type === item.code && show_extra
                      ? "close"
                      : "waterfall_chart"
                  }}
                </v-icon>
              </v-btn>
            </div>

            <orders-que
              :order-que="orderQue"
              :type="item.code"
              class="my-3"
            ></orders-que>

            <time-series-inline-chart
              :chart-id="'sell_products_chart_' + item.code"
              :colors="[item.color]"
              :days="timeSeries.days"
              :height="70"
              :keys="['sell_products_' + item.code.toLowerCase()]"
              :offset-day="timeSeries.offset"
              :time-series="timeSeries"
              :value-titles="[
                $t('admin_shop.dashboard.customers.orders_count') +
                  ' | ' +
                  $t(item.name) +
                  ' ',
              ]"
              chart-group="sell-products-chart"
              class="w-100 pointer-pointer"
              type="bar"
              @click="
                show_extra = selected_type !== item.code || !show_extra;
                selected_type = item.code;
              "
            ></time-series-inline-chart>

            <u-chart-bar
              :colors="['#ddd', '#FFA000', '#0097A7', '#8BC34A', '#7C4DFF']"
              :dataset="
                getArrayOfKeys(
                  `view_products_${item.code.toLowerCase()}`,
                  `order_${item.code.toLowerCase()}_added`,
                  `order_${item.code.toLowerCase()}_checkout`,
                  `sell_products_${item.code.toLowerCase()}`,
                  `send_products_${item.code.toLowerCase()}`,
                )
              "
              :end-date="timeSeries.endDate"
              :height="130"
              :labels="labels"
              :start-date="timeSeries.startDate"
              class="mt-5"
              legend
              narrow
            >
              <template v-slot:title> Performance</template>
            </u-chart-bar>
          </v-card>

          <!-- ██████████████████████████ Avocado ██████████████████████████ -->
          <v-card
            v-if="has_avocado && avocadoQue"
            key="avocado"
            class="me-4 pa-2 -card"
            color="#fafafa"
            flat
            max-width="420"
            min-width="300"
            rounded="lg"
            style="--background: #fafafa"
            width="90%"
          >
            <div class="d-flex justify-space-between align-center">
              <h2 class="text-h3 me-2 font-weight-black">
                {{ numeralFormat(totalPendingOrders_Avocado, "0,0") }}
              </h2>
              <b class="text-muted">{{ $t("global.commons.avocado") }}</b>
            </div>

            <div class="p-2">
              <v-btn
                :to="{ name: 'BPageShopOrdersAvocado' }"
                class="nbt m-1"
                min-width="200"
                size="small"
              >
                <img
                  class="me-1"
                  height="18"
                  src="../../../../assets/icons/avocado.svg"
                />
                {{ $t(`avocado_orders.avocado`) }}
                <v-icon
                  v-if="totalPendingOrders_Avocado"
                  class="ms-1 blink-me"
                  color="success"
                  size="x-small"
                  >lens
                </v-icon>
              </v-btn>

              <v-btn
                class="nbt m-1"
                size="small"
                @click="
                  show_extra = selected_type !== 'avocado' || !show_extra;
                  selected_type = 'avocado';
                "
              >
                <v-icon size="small"
                  >{{
                    selected_type === "avocado" && show_extra
                      ? "close"
                      : "waterfall_chart"
                  }}
                </v-icon>
              </v-btn>
            </div>

            <orders-que
              :order-que="avocadoQue"
              class="my-3"
              type="AVO"
            ></orders-que>

            <time-series-inline-chart
              :chart-id="'sell_products_chart_avocado'"
              :colors="['#5dad11', '#34e397']"
              :days="timeSeries.days"
              :height="70"
              :keys="['sell_avocados']"
              :offset-day="timeSeries.offset"
              :time-series="timeSeries"
              :value-titles="[
                $t('admin_shop.dashboard.customers.orders_count') +
                  ' | ' +
                  'Avocado' +
                  ' ',
              ]"
              chart-group="sell-products-chart"
              class="w-100 pointer-pointer"
              type="bar"
              @click="
                show_extra = selected_type !== 'avocado' || !show_extra;
                selected_type = 'avocado';
              "
            ></time-series-inline-chart>

            <u-chart-bar
              :colors="['#ddd', '#03A9F4', '#34e397']"
              :dataset="
                getArrayOfKeys(
                  `view_avocados`,
                  `request_avocados`,
                  `sell_avocados`,
                )
              "
              :end-date="timeSeries.endDate"
              :height="130"
              :labels="[
                $t('global.commons.views'),
                $t('global.commons.request'),
                $t('global.commons.sell'),
              ]"
              :start-date="timeSeries.startDate"
              class="mt-5"
              legend
              narrow
            >
              <template v-slot:title> Performance</template>
            </u-chart-bar>
          </v-card>

          <!-- ██████████████████████████ Hyper ██████████████████████████ -->
          <v-card
            v-if="has_hyper"
            key="hyper"
            class="me-4 pa-2 -card"
            color="#fafafa"
            flat
            max-width="420"
            min-width="300"
            rounded="lg"
            style="--background: #fafafa"
            width="90%"
          >
            <div class="d-flex justify-space-between align-center">
              <h2 class="text-h3 me-2 font-weight-black">
                {{ numeralFormat(todayOrders_Hyper, "0,0") }}
              </h2>
              <b class="text-muted">{{ $t("global.commons.hyper") }}</b>
            </div>

            <div class="p-2">
              <v-btn
                :to="{ name: 'BPageShopOrdersHyper' }"
                class="nbt m-1"
                min-width="200"
                size="small"
              >
                <img
                  class="me-1"
                  height="18"
                  src="../../../../assets/icons/hyper.svg"
                />
                {{ $t(`avocado_orders.hyper`) }}
              </v-btn>

              <v-btn
                class="nbt m-1"
                size="small"
                @click="
                  show_extra = selected_type !== 'hyper' || !show_extra;
                  selected_type = 'hyper';
                "
              >
                <v-icon size="small"
                  >{{
                    selected_type === "hyper" && show_extra
                      ? "close"
                      : "waterfall_chart"
                  }}
                </v-icon>
              </v-btn>
            </div>

            <orders-que
              :order-que="avocadoQue"
              class="my-3"
              type="AVO"
            ></orders-que>

            <time-series-inline-chart
              :chart-id="'sell_products_chart_avocado'"
              :colors="['#cb1f1f', '#cb0b7e']"
              :days="timeSeries.days"
              :height="70"
              :keys="['hyper_pays']"
              :offset-day="timeSeries.offset"
              :time-series="timeSeries"
              :value-titles="[
                $t('admin_shop.dashboard.customers.orders_count') +
                  ' | ' +
                  'Hyper' +
                  ' ',
              ]"
              chart-group="sell-products-chart"
              class="w-100 pointer-pointer"
              type="bar"
              @click="
                show_extra = selected_type !== 'hyper' || !show_extra;
                selected_type = 'hyper';
              "
            ></time-series-inline-chart>

            <u-chart-bar
              :colors="['#ddd', '#FBC02D', '#FF5252', '#34e397']"
              :dataset="
                getArrayOfKeys(
                  `hyper_views`,
                  `hyper_new_carts`,
                  `hyper_checkouts`,
                  'hyper_pays',
                )
              "
              :end-date="timeSeries.endDate"
              :height="130"
              :labels="[
                $t('global.commons.views'),
                $t('global.commons.new_carts'),
                $t('global.commons.checkouts'),
                $t('global.commons.pays'),
              ]"
              :start-date="timeSeries.startDate"
              class="mt-5"
              legend
              narrow
            >
              <template v-slot:title> Performance</template>
            </u-chart-bar>
          </v-card>
        </div>
      </u-fade-scroll>
    </template>

    <!-- ██████████████████████████ Extra Charts ██████████████████████████ -->

    <v-expand-transition>
      <div v-if="show_extra">
        <b-dashboard-shop-orders-avocado
          v-if="selected_type === 'avocado'"
          :shop="shop"
          :time-series="timeSeries"
          class="border mt-5"
        >
        </b-dashboard-shop-orders-avocado>

        <b-dashboard-shop-orders-hyper
          v-else-if="selected_type === 'hyper'"
          :shop="shop"
          :time-series="timeSeries"
          class="border mt-5"
        >
        </b-dashboard-shop-orders-hyper>

        <b-dashboard-shop-orders-basket
          v-else
          :time-series="timeSeries"
          :type="selected_type"
          class="border mt-5"
        >
        </b-dashboard-shop-orders-basket>
      </div>
    </v-expand-transition>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UTimeSpan from "../../../../ui/time/span/UTimeSpan.vue";
import UChartFunnelSimple from "../../../../ui/chart/funnel/simple/UChartFunnelSimple.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UFadeScroll from "../../../../ui/fade-scroll/UFadeScroll.vue";
import UChartBar from "../../../../ui/chart/bar/UChartBar.vue";
import TimeSeriesInlineChart from "../../../chart/TimeSeriesInlineChart.vue";
import OrdersQue from "../../../order-que/OrdersQue.vue";
import BDashboardShopOrdersHyper from "../../../dashboard/shop/orders/hyper/BDashboardShopOrdersHyper.vue";
import BDashboardShopOrdersAvocado from "../../../dashboard/shop/orders/avocado/BDashboardShopOrdersAvocado.vue";
import BDashboardShopOrdersBasket from "../../../dashboard/shop/orders/basket/BDashboardShopOrdersBasket.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

export default {
  name: "BDashboardShopOrders",
  components: {
    BDashboardShopOrdersHyper,
    BDashboardShopOrdersAvocado,
    UChartBar,
    UFadeScroll,
    BDashboardShopOrdersBasket,
    UChartFunnelSimple,
    UTimeSpan,
    TimeSeriesInlineChart,
    OrdersQue,
    SWidgetBox,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },

    orderQue: {
      required: true,
      type: Array,
    },
    avocadoQue: {},
  },

  data: () => ({
    funnel_value: [0, 0, 0, 0, 0],

    start_date: null,
    end_date: null,

    selected_type: null,
    show_extra: false,
  }),

  computed: {
    labels() {
      return [
        this.$t("global.commons.view"),
        this.$t("global.commons.new_carts"),
        this.$t("global.commons.checkout"),
        this.$t("global.commons.paid"),
        this.$t("global.commons.delivered"),
      ];
    },
    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },
    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    hasInsufficientData() {
      return this.timeSeries.raw_data.length > 1;
    },

    //▘▘▘▘▘▘▘▘▘▘▘▘▘   Total pending orders  ▘▘▘▘▘▘▘▘▘▘▘▘▘

    totalPendingOrders() {
      let out = 0;
      this.orderQue.forEach((item) => (out += item.count));
      return out;
    },

    max_days_data_exist() {
      return this.timeSeries.days ? this.timeSeries.days : 30;
    },
    origin_date_data_exist() {
      let date = new Date();
      if (this.timeSeries.offset)
        date.setDate(date.getDate() - this.timeSeries.offset);
      return date;
    },

    has_avocado() {
      return this.shop.avocado && this.shop.avocado.enable;
    },

    totalPendingOrders_Avocado() {
      let out = 0;
      this.avocadoQue?.forEach((item) => (out += item.count));
      return out;
    },

    has_hyper() {
      return this.shop.hyper && this.shop.hyper.enable;
    },
    todayOrders_Hyper() {
      return this.timeSeries.todayData()?.hyper_pays; // Today hyper sells
    },
  },
  created() {
    this.calculate_funnel();
  },
  methods: {
    getTotalPendingOrders(type) {
      let out = 0;
      this.orderQue
        .filter((item) => item.type === type.code)
        .forEach((item) => (out += item.count));
      return out;
    },

    getSellsProductArray(type) {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          out.push(item[`sell_products_${type.code.toLowerCase()}`]);
        });
      return out;
    },

    //------------------------------------------
    sumInTimeSpan(key) {
      return this.timeSeries.totalOf(key, this.start_date, this.end_date);
    },
    calculate_funnel() {
      const sub_view_physical = this.sumInTimeSpan("view_products_physical");
      const sub_view_virtual = this.sumInTimeSpan("view_products_virtual");
      const sub_view_file = this.sumInTimeSpan("view_products_file");
      const sub_view_service = this.sumInTimeSpan("view_products_service");
      const sub_view_subscription = this.sumInTimeSpan(
        "view_products_subscription",
      );

      const sum_vies =
        sub_view_physical +
        sub_view_virtual +
        sub_view_file +
        sub_view_service +
        sub_view_subscription;

      const sum_new_visitors = this.sumInTimeSpan("new_visitors");
      const sum_returning_visitors = this.sumInTimeSpan("returning_visitors");

      let sum_visitors = sum_new_visitors + sum_returning_visitors;
      if (sum_visitors <= 0) sum_visitors = 1;

      this.funnel_value = [
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [Math.round((sum_visitors * sub_view_physical) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [Math.round((sum_visitors * sub_view_virtual) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [Math.round((sum_visitors * sub_view_file) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [Math.round((sum_visitors * sub_view_service) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [Math.round((sum_visitors * sub_view_subscription) / sum_vies)]
            : []),
        ],
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [this.sumInTimeSpan("order_physical_added")]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [this.sumInTimeSpan("order_virtual_added")]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [this.sumInTimeSpan("order_file_added")]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [this.sumInTimeSpan("order_service_added")]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [this.sumInTimeSpan("order_subscription_added")]
            : []),
        ],
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [this.sumInTimeSpan("order_physical_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [this.sumInTimeSpan("order_virtual_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [this.sumInTimeSpan("order_file_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [this.sumInTimeSpan("order_service_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [this.sumInTimeSpan("order_subscription_checkout")]
            : []),
        ],
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [this.sumInTimeSpan("sell_products_physical")]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [this.sumInTimeSpan("sell_products_virtual")]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [this.sumInTimeSpan("sell_products_file")]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [this.sumInTimeSpan("sell_products_service")]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [this.sumInTimeSpan("sell_products_subscription")]
            : []),
        ],
      ];

      // console.log("funnel_value", this.funnel_value);
    },


    getArray(key) {
      return this.timeSeries
        .arrayOfForceInterpolateByLastValue(key, false, "created_at")
        .map((val) => [val >= 0 ? val : 0]);
    },
    getArrayOfKeys(...keys) {
      const raw_arrays = keys.map((k) => this.getArray(k));
      let merged = raw_arrays[0].map((_, i) =>
        raw_arrays.map((arr) => arr[i][0]),
      );
      return merged;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-dashboard-orders {
  border-top: thick #673ab7 solid;
  position: relative;
}
</style>

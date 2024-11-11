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
  <s-widget-box
    :active="true"
    :title="`<h5 class='align-items-center pb-1'>  ${$t(
      'global.commons.orders',
    )} | ${type}  </h5>`"
    icon="shopping_bag"
  >
    <template v-slot:actions>
      <h3>
        <img :src="image" class="me-1" height="36" width="36" />
        {{ title }}
      </h3>
      <v-row>
        <v-col cols="12" lg="9" order-lg="2">
          <v-row dense>
            <v-col cols="4">
              <h3>{{ numeralFormat(all_added, "0.[000] a") }}</h3>
              <p class="small m-0">{{ $t("global.commons.new_carts") }}</p>
              <p class="small m-0 op-0-8 text-truncate">
                <up-down-icon :value="all_added_grow_week"></up-down-icon>
                {{ numeralFormat(all_added_grow_week, "0.[0]") }}%
                {{ $t("shop_visitors_widget.from_previous_7_days") }}
              </p>
            </v-col>
            <v-col cols="4">
              <h3>{{ numeralFormat(all_checkout, "0.[000] a") }}</h3>
              <p class="small m-0">{{ $t("global.commons.checkout") }}</p>
              <p class="small m-0 op-0-8 text-truncate">
                <up-down-icon :value="all_checkout_grow_week"></up-down-icon>
                {{ numeralFormat(all_checkout_grow_week, "0.[0]") }}%
                {{ $t("shop_visitors_widget.from_previous_7_days") }}
              </p>
            </v-col>
            <v-col cols="4">
              <h3>{{ numeralFormat(all_payed, "0.[000] a") }}</h3>
              <p class="small m-0">{{ $t("global.commons.paid") }}</p>
              <p class="small m-0 op-0-8 text-truncate">
                <up-down-icon :value="all_payed_grow_week"></up-down-icon>
                {{ numeralFormat(all_payed_grow_week, "0.[0]") }}%
                {{ $t("shop_visitors_widget.from_previous_7_days") }}
              </p>
            </v-col>
          </v-row>

          <apexchart
            :options="options"
            :series="series"
            class="mt-3 mx-n6 mx-sm-0"
            height="250"
            type="area"
            width="100%"
          />
        </v-col>

        <v-col cols="12" lg="3" order-lg="1">
          <apexchart
            :height="240"
            :options="options_pie"
            :series="series_pie"
            type="donut"
            width="100%"
          />
          <u-time-span
            v-model:end-date="end_date"
            v-model:start-date="start_date"
          ></u-time-span>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import SWidgetBox from "../../../../../ui/widget/box/SWidgetBox.vue";
import UpDownIcon from "../../../../../ui/icon/UpDownIcon.vue";
import UTimeSpan from "../../../../../ui/time/span/UTimeSpan.vue";
import numeral from "numeral";

export default {
  name: "BDashboardShopOrdersBasket",
  components: { SWidgetBox, UpDownIcon, UTimeSpan },
  props: {
    timeSeries: {
      required: true,
      type: Object,
    },
    type: { required: true },
    title: {},
  },

  data: () => ({
    start_date: null,
    end_date: null,
  }),

  computed: {
    image() {
      if (this.type === ProductType.PHYSICAL.code)
        return ProductType.PHYSICAL.basket;
      else if (this.type === ProductType.VIRTUAL.code)
        return ProductType.VIRTUAL.basket;
      else if (this.type === ProductType.FILE.code)
        return ProductType.FILE.basket;
      else if (this.type === ProductType.SERVICE.code)
        return ProductType.SERVICE.basket;
      else if (this.type === ProductType.SUBSCRIPTION.code)
        return ProductType.SUBSCRIPTION.basket;

      return null;
    },

    column_name() {
      if (this.type === ProductType.PHYSICAL.code) return "physical";
      else if (this.type === ProductType.VIRTUAL.code) return "virtual";
      else if (this.type === ProductType.FILE.code) return "file";
      else if (this.type === ProductType.SERVICE.code) return "service";
      else if (this.type === ProductType.SUBSCRIPTION.code)
        return "subscription";

      return null;
    },

    all_added_pie() {
      return this.timeSeries.totalOf(
        `order_${this.column_name}_added`,
        this.start_date,
        this.end_date,
      );
    },
    all_checkout_pie() {
      return this.timeSeries.totalOf(
        `order_${this.column_name}_checkout`,
        this.start_date,
        this.end_date,
      );
    },
    all_payed_pie() {
      return this.timeSeries.totalOf(
        `sell_products_${this.column_name}`,
        this.start_date,
        this.end_date,
      );
    },

    all_delivered_pie() {
      return this.timeSeries.totalOf(
        `send_products_${this.column_name}`,
        this.start_date,
        this.end_date,
      );
    },

    series_pie() {
      return [
        this.all_added_pie -
          (this.all_checkout_pie + this.all_payed_pie + this.all_delivered_pie),

        this.all_checkout_pie,
        this.all_payed_pie,
        this.all_delivered_pie,
      ];
    },

    options_pie() {
      return {
        chart: {
          fontFamily: "var(--font)",
        },
        title: {
          text: this.$t("global.commons.status"),
          align: "center",
          margin: 4,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize: "12px",
            color: "#263238",
          },
        },

        colors: ["#FFA000", "#0097A7", "#8BC34A", "#7C4DFF"],

        labels: [
          this.$t("global.commons.new_carts"),
          this.$t("global.commons.checkout"),
          this.$t("global.commons.paid"),
          this.$t("global.commons.delivered"),
        ],
        legend: {
          position: "bottom",
        },

        dataLabels: {
          enabled: true,
        },

        plotOptions: {
          pie: {
            donut: {
              size: "23%",
            },
          },
        },
      };
    },

    lastDayData() {
      return this.timeSeries.lastDayData();
    },

    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },
    lastWeekData() {
      return this.timeSeries.lastWeekData();
    },

    previousWeekData() {
      return this.timeSeries.previousWeekData();
    },

    options() {
      return {
        theme: {
          mode: "light",
          palette: "palette1",
        },

        chart: {
          height: 350,
          type: "area",
          stacked: false,

          fontFamily: "var(--font)",
        },
        colors: ["#ddd", "#FFA000", "#0097A7", "#8BC34A", "#7C4DFF"],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: false,
          width: 3,
          curve: "straight",
        },
        markers: {
          size: 0,
        },

        fill: {
          type: "solid",
          opacity: 0.7,
          /* gradient: {
            opacityFrom: 0.75,
            opacityTo: 0.8,
          }*/
        },
        legend: {
          position: "bottom",
          horizontalAlign: "center",
        },
        xaxis: {
          type: "datetime",
          labels: {
            format: undefined,
            formatter: function (value, timestamp, index) {
              return DateConverter.ConvertTimestampToShortString(value);
            },
          },
          categories: this.timeSeries.arrayOfTimeAbsolute("created_at"),
        },
        tooltip: {
          //   intersect: true,
          //  shared: false,
          x: {
            formatter: function (value, timestamp, index) {
              return DateConverter.ConvertTimestampToShortString(value, false);
            },
          },

          y: {
            formatter: function (value, timestamp, index) {
              return numeral(value).format("0.[0]a");
            },
          },
        },

        grid: {
          show: true,
          strokeDashArray: [2, 3],
          position: "back",
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
      };
    },

    series() {
      let series = [
        {
          name: this.$t("global.commons.view"),
          data: this.timeSeries.arrayOf(
            `view_products_${this.column_name}`,
            true,
            "created_at",
          ),
        },

        {
          name: this.$t("global.commons.new_carts"),
          data: this.timeSeries.arrayOf(
            `order_${this.column_name}_added`,
            true,
            "created_at",
          ),
        },
        {
          name: this.$t("global.commons.checkout"),
          data: this.timeSeries.arrayOf(
            `order_${this.column_name}_checkout`,
            true,
            "created_at",
          ),
        },
        {
          name: this.$t("global.commons.paid"),
          data: this.timeSeries.arrayOf(
            `sell_products_${this.column_name}`,
            true,
            "created_at",
          ),
        },

        {
          name: this.$t("global.commons.delivered"),
          data: this.timeSeries.arrayOf(
            `send_products_${this.column_name}`,
            true,
            "created_at",
          ),
        },
      ];

      return series;
    },

    //new_visitors:

    all_added() {
      return this.getSumByKey(`order_${this.column_name}_added`);
    },
    all_added_grow_week() {
      let _new = this.getSumByKey(`order_${this.column_name}_added`, 0, 7);
      let _old = this.getSumByKey(`order_${this.column_name}_added`, 7, 7);

      if (_old === 0) _old = 0.001;

      return (100 * (_new - _old)) / _old;
    },

    // returning_visitors:

    all_checkout() {
      return this.getSumByKey(`order_${this.column_name}_checkout`);
    },
    all_checkout_grow_week() {
      let _new = this.getSumByKey(`order_${this.column_name}_checkout`, 0, 7);
      let _old = this.getSumByKey(`order_${this.column_name}_checkout`, 7, 7);

      if (_old === 0) _old = 0.001;

      return (100 * (_new - _old)) / _old;
    },

    // page_views:

    all_payed() {
      return this.getSumByKey(`sell_products_${this.column_name}`);
    },
    all_payed_grow_week() {
      let _new = this.getSumByKey(`sell_products_${this.column_name}`, 0, 7);
      let _old = this.getSumByKey(`sell_products_${this.column_name}`, 7, 7);

      if (_old === 0) _old = 0.001;

      return (100 * (_new - _old)) / _old;
    },
  },
  methods: {
    getSumByKey(key, offset = null, days = null) {
      let start = null;
      let end = null;

      if (offset != null && days != null) {
        start = offset + days;
        end = offset;
      }

      return this.timeSeries.totalOf(
        key,
        DateConverter.GetStartOfDateBefore(start),
        DateConverter.GetEndOfDateBefore(end),
      );
    },
  },
  created() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

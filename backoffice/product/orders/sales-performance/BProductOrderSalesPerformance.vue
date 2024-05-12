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
    :icon-to="IS_VENDOR_PANEL ? undefined : { name: 'BPageProductOrders' }"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
      'product_sell_widget.title',
    )}  </h5>`"
    icon="shopping_basket"
  >
    <template v-slot:actions>
      <v-row>
        <v-col cols="12" lg="10" md="9" order-lg="2">
          <apexchart
            :options="options"
            :series="series"
            class="mt-3 mx-n4 mx-sm-0"
            height="180"
            type="area"
            width="100%"
          />
        </v-col>

        <v-col
          class="d-flex flex-wrap text-center"
          cols="12"
          lg="2"
          md="3"
          order-lg="1"
        >
          <div class="flex-grow-1 min-width-150">
            <h3 class="text-h3 font-weight-black">
              {{ numeralFormat(all_views, "0.[00] a") }}
            </h3>
            <p class="small m-0">{{ $t("global.commons.total_views") }}</p>
            <p class="small m-0 op-0-8 text-truncate">
              <up-down-icon :value="all_views_grow_week"></up-down-icon>
              {{ numeralFormat(all_views_grow_week, "0.[0]a") }}%
              {{ $t("global.commons.from_previous_n_days", { days: 7 }) }}
            </p>
          </div>

          <div class="flex-grow-1 min-width-150">
            <h3 class="text-h3 mt-2 font-weight-black">
              {{ numeralFormat(all_sells, "0.[00] a") }}
            </h3>
            <p class="small m-0">{{ $t("global.commons.total_sales") }}</p>
            <p class="small m-0 op-0-8 text-truncate">
              <up-down-icon :value="all_sells_grow_week"></up-down-icon>
              {{ numeralFormat(all_sells_grow_week, "0.[0]a") }}%
              {{ $t("global.commons.from_previous_n_days", { days: 7 }) }}
            </p>
          </div>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

import numeral from "numeral";
import UpDownIcon from "../../../../ui/icon/UpDownIcon.vue";

export default {
  name: "BProductOrderSalesPerformance",
  components: { UpDownIcon, SWidgetBox },
  props: {
    product: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    start_date: null,
    end_date: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    options() {
      return {
        theme: {
          mode: "light",
          palette: "palette1",
        },

        chart: {
          //  height: 200,
          type: "area",
          stacked: true,

          //    background: this.SaminColorDarkDeep,
          fontFamily: "var(--font)",
        },
        colors: ["#388E3C", "#FFA000"],
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
          //borderColor: this.SaminColorLight,
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
          name: this.$t("global.commons.sales"),
          data: this.timeSeries.arrayOf("sell", true, "created_at"),
        },
        {
          name: this.$t("global.commons.views"),
          data: this.timeSeries.arrayOf("views", true, "created_at"),
        },
      ];

      return series;
    },

    all_sells() {
      return this.getSumByKey("sell");
    },
    all_views() {
      return this.getSumByKey("views");
    },

    all_sells_grow_week() {
      let _new = this.getSumByKey("sell", 0, 7);
      let _old = this.getSumByKey("sell", 7, 7);
      if (_old === 0) _old = 0.001;
      return (100 * (_new - _old)) / _old;
    },
    all_views_grow_week() {
      let _new = this.getSumByKey("views", 0, 7);
      let _old = this.getSumByKey("views", 7, 7);
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

      // console.log('start',DateConverter.GetStartOfDateBefore(start),'end',DateConverter.GetStartOfDateBefore(end))

      return this.timeSeries.totalOf(
        key,
        DateConverter.GetStartOfDateBefore(start),
        DateConverter.GetEndOfDateBefore(end),
      );
    },
  },
  created() {},
  mounted() {},
  beforeUnmount() {},
};
</script>

<style lang="scss" scoped>
h6 {
  font-size: 1.5rem;
  font-weight: 400;
}
</style>

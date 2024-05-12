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
    :icon-to="{
      name:IS_VENDOR_PANEL?'Vendor_AddProduct': 'BPageProductEdit',
      params: { product_id: product.id },
      hash: '#rating',
    }"
    :sub-title="$t('product_admin.dashboard.survey.title_small')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
      'product_admin.dashboard.survey.title',
    )}  </h5>`"
    icon="fa:fas fa-poll"
  >
    <template v-slot:actions>
      <template v-if="product_ratings_wit_value?.length">
        <s-shop-product-rating-view :product="product" class="mb-3" view-only />

        <apexchart
          :options="radar_chart_options"
          :series="radar_series"
          type="radar"
        ></apexchart>
      </template>
      <div v-else class="pa-3 text-muted text-center">
        Users have not rated this product yet.
      </div>
    </template>

    <v-spacer></v-spacer>
    <v-container class="text-center" fluid>
      <v-row align="start">
        <v-col cols="12" sm="4">
          <div class="text-h4 mt-7">
            {{ numeralFormat(product.rate_count, "0,0.[0]a") }}
          </div>
          <small>
            <i class="fas fa-users" />
            {{ $t("product_admin.dashboard.survey.total_participation") }}
          </small>
          <v-tooltip activator="parent" max-width="360">
            Total count of raters for the product.
          </v-tooltip>
        </v-col>

        <v-col cols="12" sm="4">
          <v-rating
            v-model="todayData.rating_star"
            :readonly="true"
            active-color="yellow-darken-3"
            class="mb-2"
            color="grey-darken-1"
            density="compact"
            dir="ltr"
            half-increments
            hover
            size="small"
          />

          <div class="text-h4">
            {{ numeralFormat(todayData.ratings, "0,0.[0]a") }}
          </div>
          <small>
            <i class="fas fa-calendar-day" />
            {{ $t("product_admin.dashboard.survey.today_participation") }}
          </small>
        </v-col>

        <v-col cols="12" sm="4">
          <v-rating
            v-model="lastWeekData.rating_star"
            :readonly="true"
            active-color="yellow-darken-3"
            class="mb-2"
            color="grey-darken-1"
            density="compact"
            dir="ltr"
            half-increments
            hover
            size="small"
          />

          <div class="text-h4">
            {{ numeralFormat(lastWeekData.ratings, "0,0.[0]a") }}
          </div>
          <small>
            <i class="fas fa-calendar-week" />
            {{ $t("product_admin.dashboard.survey.last7days_participation") }}
          </small>
        </v-col>
      </v-row>
    </v-container>

    <apexchart
      :options="options"
      :series="series"
      class="mt-1 mx-n6 mx-sm-0"
      dir="ltr"
      height="200"
      type="line"
      width="100%"
    />
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import SShopProductRatingView from "../../../../storefront/product/rating/SShopProductRatingView.vue";

import numeral from "numeral";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "BProductRatingCharts",
  components: { SShopProductRatingView, SWidgetBox },
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
    series: [
      {
        type: "line",
        name: "",
        data: [],
      },

      {
        type: "column",
        name: "",
        data: [],
      },
    ],

    radar_series: [
      {
        name: "Ratings",
        data: [],
      },
    ],
    radar_chart_options: {
      toolbar: {
        show: false, // Optionally hide the toolbar
      },

      chart: {
        id: "vuechart-example",
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            // Check if the screen width is small, adjust 768 to your requirement
            if (window.innerWidth <= 768) {
              return val.length > 8 ? val.substring(0, 8) + "..." : val;
            }
            return val;
          },
        },
      },
      labels: [],

      yaxis: {
        show: false,
        max: 100,
      },

      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          borderRadius: 2,
        },
      },

      fill: {
        type: "solid",
      },
    },
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
          this.$route.params.vendor_id &&
          this.$route.matched.some((record) => record.meta.vendor)
      );
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

    options() {
      return {
        colors: ["#345", "#FFA000"],

        chart: {
          stacked: false,

          zoom: {
            enabled: true,
          },

          // 🞇 Toolbar (for line)
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
              customIcons: [],
            },
          },

          fontFamily: "var(--font)",
        },

        // 🞇 Stroke chart
        stroke: {
          curve: "smooth",
          colors: "#345",
          width: 2,
          dashArray: 0,
        },

        // 🞇 Bar chart
        plotOptions: {
          bar: {
            horizontal: false,
            endingShape: "flat",
            columnWidth: "50%",
            distributed: false,
            colors: {
              ranges: [
                {
                  from: 0,
                  to: 2.5,
                  color: "#FFC107",
                },
                {
                  from: 2.5,
                  to: 5,
                  color: "#FFA000",
                },
              ],
              backgroundBarColors: [],
              backgroundBarOpacity: 1,
            },
            dataLabels: {
              position: "top",
              maxItems: 100,
              hideOverflowingLabels: true,
            },
          },
        },

        xaxis: {
          categories: [],
          tickAmount: 4,
          type: "datetime",
          labels: {
            show: true,
            rotate: -45,
            rotateAlways: false,
            hideOverlappingLabels: true,
            showDuplicates: false,
            trim: true,
            minHeight: undefined,
            maxHeight: 60,
            style: {
              colors: [],
              fontSize: "10px",
            },
            offsetX: 0,
            offsetY: 0,
            format: undefined,
            formatter: function (value, timestamp, index) {
              return DateConverter.ConvertTimestampToShortString(value);
            },
          },
        },

        tooltip: {
          x: {
            formatter: function (value, timestamp, index) {
              return DateConverter.ConvertTimestampToShortString(value);
            },
          },

          y: {
            formatter: function (value, timestamp, index) {
              return numeral(value).format("0.[0]a");
            },
          },
        },

        yaxis: [
          // 🞧 Y axis ▶ ratings
          {
            seriesName: this.$t(
              "product_admin.dashboard.survey.chart.participate",
            ),
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t(
                "product_admin.dashboard.survey.chart.participate_title",
              ),
            },

            labels: {
              formatter: function (value, timestamp, index) {
                return numeral(value).format("0.[0]a");
              },
            },
          },
          // 🞧 Y axis ▶ rating value
          {
            opposite: true,
            seriesName: "score",
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t("product_admin.dashboard.survey.chart.score"),
            },

            labels: {
              formatter: function (value, timestamp, index) {
                return numeral(value).format("0.[0]a");
              },
            },
          },
        ],
      };
    },

    product_ratings() {
      return this.product.ratings;
    },
    product_ratings_wit_value() {
      return this.product_ratings.filter((item) => item.count > 0);
    },
  },

  created() {
    this.options.xaxis.categories =
      this.timeSeries.arrayOfTimeAbsolute("created_at");

    this.series[0].data = this.timeSeries.arrayOf(
      "ratings",
      true,
      "created_at",
    );
    this.series[0].name = this.$t(
      "product_admin.dashboard.survey.chart.participate",
    );

    this.series[1].data = this.timeSeries.arrayOf(
      "rating_star",
      true,
      "created_at",
    );
    this.series[1].name = this.$t("product_admin.dashboard.survey.chart.score");

    this.loadRadarData();
  },
  mounted() {},
  beforeUnmount() {},

  methods: {
    loadRadarData() {
      if (!this.product_ratings_wit_value.length) return;

      this.radar_series[0].data = this.product_ratings_wit_value.map(
        (item) => (item.value / item.count) * 20,
      );

      this.radar_chart_options.xaxis.categories =
        this.product_ratings_wit_value.map((item) => item.name);
    },
  },
};
</script>

<style scoped></style>

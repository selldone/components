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
  <component
    :is="modern ? 'section' : 's-widget-box'"
    :class="{
      'b-product-analytics b-product-ratings-modern sd-modern-widget text-start':
        modern,
    }"
    :icon-to="{
      name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
      params: { product_id: product.id },
      hash: '#rating',
    }"
    :sub-title="
      modern ? undefined : $t('product_admin.dashboard.survey.title_small')
    "
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
            'product_admin.dashboard.survey.title',
          )}  </h5>`
    "
    :icon="modern ? undefined : 'fa:fas fa-poll'"
  >
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="18" aria-hidden="true">star_outline</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("b_product_dashboard.analytics.ratings_title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("b_product_dashboard.analytics.ratings_subtitle") }}
            <v-btn
              icon
              variant="text"
              class="sd-modern-info-button"
              :aria-label="$t('b_product_dashboard.analytics.recorded_score')"
              ><v-icon size="14">info_outline</v-icon
              ><v-tooltip
                activator="parent"
                location="top"
                open-on-focus
                open-on-click
                content-class="sd-modern-tooltip text-start"
                >{{
                  $t("b_product_dashboard.analytics.rating_score_scope")
                }}</v-tooltip
              ></v-btn
            >
          </p>
        </div>
      </div>
      <v-btn
        :to="{
          name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
          params: { product_id: product.id },
          hash: '#rating',
        }"
        variant="text"
        class="sd-modern-button sd-modern-button--small"
        >{{ $t("b_product_dashboard.analytics.rating_criteria") }}</v-btn
      >
    </header>
    <div :class="{ 'b-product-ratings-modern__criteria': modern }">
      <template v-if="product_ratings_wit_value?.length">
        <s-shop-product-rating-view :product="product" class="mb-3" view-only />

        <apexchart
          :options="modern ? modernRadarOptions : radar_chart_options"
          :series="modern ? modernRadarSeries : radar_series"
          :height="modern ? 250 : undefined"
          type="radar"
          dir="ltr"
        ></apexchart>
      </template>
      <div v-else class="pa-3 text-muted text-center">
        {{ $t("product_admin.dashboard.survey.users_not_rated_msg") }}
      </div>
    </div>

    <v-spacer></v-spacer>
    <v-container
      :class="modern ? 'b-product-ratings-modern__stats pa-0' : 'text-center'"
      fluid
    >
      <v-row align="start">
        <v-col cols="12" sm="4">
          <div
            :class="modern ? 'b-product-ratings-modern__value' : 'text-h4 mt-7'"
          >
            {{ numeralFormat(product.rate_count, "0,0.[0]a") }}
          </div>
          <small>
            <i class="fas fa-users" />
            {{ $t("product_admin.dashboard.survey.total_participation") }}
          </small>
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
          >
            {{
              $t("product_admin.dashboard.survey.total_participation_tooltip")
            }}
          </v-tooltip>
        </v-col>

        <v-col cols="12" sm="4">
          <v-rating
            v-if="!modern"
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

          <div :class="modern ? 'b-product-ratings-modern__value' : 'text-h4'">
            {{ numeralFormat(todayData.ratings, "0,0.[0]a") }}
          </div>
          <small>
            <i class="fas fa-calendar-day" />
            {{ $t("product_admin.dashboard.survey.today_participation") }}
          </small>
          <p v-if="modern && todayData.ratings" class="sd-modern-subtitle">
            {{ $t("b_product_dashboard.analytics.recorded_score") }}:
            {{ numeralFormat(todayData.rating_star, "0.[00]") }}
          </p>
        </v-col>

        <v-col cols="12" sm="4">
          <v-rating
            v-if="!modern"
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

          <div :class="modern ? 'b-product-ratings-modern__value' : 'text-h4'">
            {{ numeralFormat(lastWeekData.ratings, "0,0.[0]a") }}
          </div>
          <small>
            <i class="fas fa-calendar-week" />
            {{ $t("product_admin.dashboard.survey.last7days_participation") }}
          </small>
          <p v-if="modern && lastWeekData.ratings" class="sd-modern-subtitle">
            {{ $t("b_product_dashboard.analytics.recorded_score") }}:
            {{ numeralFormat(lastWeekData.rating_star, "0.[00]") }}
          </p>
        </v-col>
      </v-row>
    </v-container>

    <apexchart
      :options="options"
      :series="modern ? modernSeries : series"
      :class="modern ? '' : 'mt-1 mx-n6 mx-sm-0'"
      dir="ltr"
      height="200"
      type="line"
      width="100%"
    />
  </component>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import SShopProductRatingView from "../../../../storefront/product/rating/SShopProductRatingView.vue";

import numeral from "numeral";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "BProductRatingCharts",
  components: { SShopProductRatingView, SWidgetBox },
  props: {
    modern: Boolean,
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
    modernRadarSeries() {
      return [
        {
          name: this.$t("b_product_dashboard.analytics.rating_criteria"),
          data: this.product_ratings_wit_value.map(
            (item) => (item.value / item.count) * 20,
          ),
        },
      ];
    },
    modernRadarOptions() {
      return {
        chart: {
          fontFamily: "var(--font)",
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        colors: ["#1685e6"],
        stroke: { width: 2 },
        fill: { opacity: 0.12 },
        markers: { size: 2 },
        plotOptions: { radar: { size: this.$vuetify.display.xs ? 58 : 80 } },
        xaxis: {
          categories: this.product_ratings_wit_value.map((item) => item.name),
          labels: {
            show: !this.$vuetify.display.xs,
            style: { fontSize: "11px" },
          },
        },
        yaxis: { min: 0, max: 100, tickAmount: 4, show: false },
        dataLabels: { enabled: false },
        tooltip: {
          y: {
            formatter: (value) => numeral(value).format("0.[0]") + " / 100",
          },
        },
      };
    },
    modernSeries() {
      return [
        {
          type: "column",
          name: this.$t("product_admin.dashboard.survey.chart.participate"),
          data: this.timeSeries.raw_data.map((row) => [
            DateConverter.convertToLocalTime(row.created_at, true)?.getTime(),
            row.ratings,
          ]),
        },
        {
          type: "line",
          name: this.$t("b_product_dashboard.analytics.recorded_score"),
          data: this.timeSeries.raw_data.map((row) => [
            DateConverter.convertToLocalTime(row.created_at, true)?.getTime(),
            row.ratings > 0 ? row.rating_star : null,
          ]),
        },
      ];
    },
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
      if (this.modern)
        return {
          chart: {
            background: "transparent",
            fontFamily: "var(--font)",
            stacked: false,
            zoom: { enabled: false },
            toolbar: { show: false },
          },
          colors: ["#ffb11c", "#456071"],
          stroke: { width: [0, 2], curve: "straight" },
          markers: { size: [0, 2] },
          fill: { type: "solid", opacity: [0.8, 1] },
          dataLabels: { enabled: false },
          plotOptions: { bar: { columnWidth: "55%", borderRadius: 1 } },
          legend: { position: "bottom", fontSize: "11px", fontWeight: 400 },
          xaxis: {
            type: "datetime",
            tickAmount: 3,
            labels: {
              style: { fontSize: "11px" },
              formatter: (value) =>
                DateConverter.ConvertTimestampToShortString(value),
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
          },
          yaxis: [
            {
              seriesName: this.$t(
                "product_admin.dashboard.survey.chart.participate",
              ),
              min: 0,
              labels: {
                style: { fontSize: "11px" },
                formatter: (value) => numeral(value).format("0,0"),
              },
            },
            {
              seriesName: this.$t(
                "b_product_dashboard.analytics.recorded_score",
              ),
              opposite: true,
              min: 0,
              max: Math.max(
                5,
                ...this.timeSeries.raw_data.map(
                  (row) => Number(row.rating_star) || 0,
                ),
              ),
              labels: {
                style: { fontSize: "11px" },
                formatter: (value) => numeral(value).format("0.[0]"),
              },
            },
          ],
          tooltip: {
            shared: true,
            intersect: false,
            x: {
              formatter: (value) =>
                DateConverter.ConvertTimestampToShortString(value),
            },
            y: {
              formatter: (value) =>
                value == null ? "—" : numeral(value).format("0,0.[00]"),
            },
          },
          grid: { borderColor: "rgba(128,128,128,.18)", strokeDashArray: 4 },
        };
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
      return this.product.ratings || [];
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

<style scoped lang="scss">
.b-product-ratings-modern {
  &__criteria {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    align-items: center;
  }
  &__criteria > * {
    min-width: 0;
  }
  &__stats {
    margin-block: 16px;
  }
  &__value {
    font-size: 22px;
    font-weight: 400;
    line-height: 30px;
  }
  small {
    font-size: 12px;
    color: var(--sd-modern-muted);
    line-height: 19px;
  }
  :deep(.u--rating-bar) {
    font-size: 12px;
  }
}
</style>

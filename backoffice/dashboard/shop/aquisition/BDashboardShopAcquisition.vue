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
    :icon-to="{ name: 'BPageShopCrmReport' }"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
      'shop_visitors_widget.title',
    )}  </h5>`"
    icon="fa:fas fa-users"
  >
    <template v-slot:actions>
      <v-row>
        <v-col cols="12" lg="9" order-lg="2">
          <v-row class="text-center border-between" dense>
            <v-col cols="4">
              <h2 class="text-h5 text-sm-h4 font-weight-black">
                {{ numeralFormat(all_new_visitors, "0.[0] a") }}
              </h2>
              <p class="small m-0">
                {{ $t("shop_visitors_widget.new_visitors") }}
              </p>
              <p class="small m-0 op-0-8 text-truncate">
                <up-down-icon
                  :value="all_new_visitors_grow_week"
                ></up-down-icon>
                {{ numeralFormat(all_new_visitors_grow_week, "0.[0]") }}%
                {{ $t("shop_visitors_widget.from_previous_7_days") }}
              </p>
            </v-col>
            <v-col cols="4">
              <h2 class="text-h5 text-sm-h4 font-weight-black">
                {{ numeralFormat(all_returning_visitors, "0.[0] a") }}
              </h2>
              <p class="small m-0">
                {{ $t("shop_visitors_widget.returning_visitors") }}
              </p>
              <p class="small m-0 op-0-8 text-truncate">
                <up-down-icon
                  :value="all_returning_visitors_grow_week"
                ></up-down-icon>
                {{ numeralFormat(all_returning_visitors_grow_week, "0.[0]") }}%
                {{ $t("shop_visitors_widget.from_previous_7_days") }}
              </p>
            </v-col>
            <v-col cols="4">
              <h2 class="text-h5 text-sm-h4 font-weight-black">
                {{ numeralFormat(all_page_views, "0.[0] a") }}
              </h2>
              <p class="small m-0">
                {{ $t("shop_visitors_widget.page_views") }}
              </p>
              <p class="small m-0 op-0-8 text-truncate">
                <up-down-icon :value="all_page_views_grow_week"></up-down-icon>
                {{ numeralFormat(all_page_views_grow_week, "0.[0]") }}%
                {{ $t("shop_visitors_widget.from_previous_7_days") }}
              </p>
            </v-col>
          </v-row>

          <div style="min-height: 250px">
            <apexchart
              :options="options"
              :series="series"
              class="mt-3 mx-n2 mx-sm-0"
              height="250"
              type="area"
              width="100%"
            />
          </div>
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
            small-width
          ></u-time-span>
        </v-col>

        <v-col cols="12" order="3" sm="8" class="text-body-2">
          <p class="font-weight-bold">   {{ $t("global.commons.channels_overview") }}</p>

          <b-session-chart-sankey
            v-if="socials && Object.keys(socials).length"
            :Social="calcTotalSocials"
            :direct="calcTotalDirect"
            :other="calcTotalOther"
            :search="calcTotalOrganicSearch"
            :social-details="calSocialDetails"
            height="150px"
          ></b-session-chart-sankey>
        </v-col>

        <v-col class="text-body-2" cols="12" order="4" sm="4">
          <p class="font-weight-bold">
            {{ $t("global.commons.acquisition_channel") }}
          </p>
          <div class="overflow-auto thin-scroll" style="max-height: 150px">
            <div
              v-for="(item, i) in sorted_socials"
              :key="i"
              class="my-1 d-flex"
            >
              <span class="text-capitalize">
                <b-campaign-source-icon
                  :value="item.key"
                  class="me-1"
                  height="15"
                  width="15"
                />
                {{ item.key }}</span
              >
              <div class="dashed-flex-space"></div>
              <b>{{ numeralFormat(item.value, "0,0.[0]a") }}</b>
            </div>
          </div>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

import numeral from "numeral";
import UTimeSpan from "../../../../ui/time/span/UTimeSpan.vue";
import UpDownIcon from "../../../../ui/icon/UpDownIcon.vue";
import BSessionChartSankey from "../../../session/chart/sankey/BSessionChartSankey.vue";
import { CampaignHelper } from "@selldone/core-js/helper/campaign/CampaignHelper";
import BCampaignSourceIcon from "../../../campaign/source/icon/BCampaignSourceIcon.vue";
import { ChartAnnotations } from "../../../../ui/chart/helper/ChartAnnotations";

export default {
  name: "BDashboardShopAcquisition",
  components: {
    BCampaignSourceIcon,
    BSessionChartSankey,
    UpDownIcon,
    UTimeSpan,
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
  },

  data: () => ({
    start_date: null,
    end_date: null,
    has_annotaion: true,
  }),

  computed: {
    sorted_socials() {
      const out = [];

      Object.keys(this.socials).forEach((i) => {
        out.push({ key: i, value: this.socials[i] });
      });
      out.sortByKey("value");
      return out;
    },

    socials() {
      return this.timeSeries.socialTotalKeys();
    },

    calcTotalSocials() {
      return CampaignHelper.GetTotalSocials({ social: this.socials });
    },
    calcTotalOrganicSearch() {
      return CampaignHelper.GetTotalOrganicSearch({ social: this.socials });
    },

    calcTotalDirect() {
      return CampaignHelper.GetTotalDirects({ social: this.socials });
    },
    calcTotalOther() {
      return CampaignHelper.GetTotalOther({
        social: this.socials,
        sessions: this.all_new_visitors + this.all_returning_visitors,
      });
    },
    calSocialDetails() {
      return CampaignHelper.GetSocialsOnly({ social: this.socials }, 5);
    },
    //-------------------------------
    all_views() {
      return this.timeSeries.totalOf("views", this.start_date, this.end_date);
    },
    all_view_products_physical() {
      return this.timeSeries.totalOf(
        "view_products_physical",
        this.start_date,
        this.end_date,
      );
    },
    all_view_products_virtual() {
      return this.timeSeries.totalOf(
        "view_products_virtual",
        this.start_date,
        this.end_date,
      );
    },
    all_view_products_file() {
      return this.timeSeries.totalOf(
        "view_products_file",
        this.start_date,
        this.end_date,
      );
    },
    all_view_products_service() {
      return this.timeSeries.totalOf(
        "view_products_service",
        this.start_date,
        this.end_date,
      );
    },
    series_pie() {
      return [
        this.all_view_products_physical,
        this.all_view_products_virtual,
        this.all_view_products_file,
        this.all_view_products_service,
        this.all_views -
          (this.all_view_products_physical +
            this.all_view_products_virtual +
            this.all_view_products_file +
            this.all_view_products_service),
      ];
    },

    options_pie() {
      return {
        chart: {
          fontFamily: "var(--font)",
        },
        title: {
          text: this.$t("shop_visitors_widget.page_views"),
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

        colors: [
          ProductType.PHYSICAL.color,
          ProductType.VIRTUAL.color,
          ProductType.FILE.color,
          ProductType.SERVICE.color,
          "#444",
        ],

        labels: [
          this.$t("global.product_types.physical"),
          this.$t("global.product_types.virtual"),
          this.$t("global.product_types.file"),
          this.$t("global.product_types.service"),
          this.$t("shop_visitors_widget.other_pages"),
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

    has_amp() {
      return (
        this.shop.options &&
        this.shop.options.some((e) => e.code === "amp" && e.value === true)
      );
    },

    maxPoints() {
      let maxPoints = [];
      if (this.annotationMaxOn || true) {
        // Create max points annotations:
        maxPoints = ChartAnnotations.CreateMaxPoints(
          this.timeSeries,
          ["page_views", "new_visitors", "returning_visitors"],
          [
            this.$t("shop_visitors_widget.page_views"),
            this.$t("shop_visitors_widget.new_visitors"),
            this.$t("shop_visitors_widget.returning_visitors"),
          ],
          ["#FFA000", "#C2185B", "#1976D2"],
        );
      }
      return maxPoints;
    },

    options() {
      return {
        annotations: this.has_annotaion
          ? {
              points: this.maxPoints,
            }
          : undefined,

        theme: {
          mode: "light",
          palette: "palette1",
        },

        chart: {
          height: 350,
          type: "area",
          stacked: false,

          //    background: this.SaminColorDarkDeep,
          fontFamily: "var(--font)",

          /*  events:
            {



              dataPointMouseEnter: function(event, chartContext, config) {
                console.log('dataPointMouseEnter',event)
              },

            }
,*/
        },
        colors: this.has_amp
          ? ["#FFA000", "#444", "#C2185B", "#1976D2"]
          : ["#FFA000", "#C2185B", "#1976D2"],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: false,
          width: 0,
          curve: "straight",
        },
        markers: {
          size: 0,
        },
        /*  markers: {
          size: 0,
          colors: undefined,
          strokeColors: '#fff',
          strokeWidth: 2,
          strokeOpacity: 0.9,
          fillOpacity: 1,
          discrete: [],
          shape: "circle",
          radius: 2,
          offsetX: 0,
          offsetY: 0,
          onClick: undefined,
          onDblClick: undefined,
          hover: {
            size: undefined,
            sizeOffset: 3
          }
        },*/

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
          // categories: this.timeSeries.arrayOfTimeAbsolute("created_at"),
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
          name: this.$t("shop_visitors_widget.page_views"),
          data: this.timeSeries.arrayOf("page_views", true, "created_at"),
        },

        {
          name: this.$t("shop_visitors_widget.new_visitors"),
          data: this.timeSeries.arrayOf("new_visitors", true, "created_at"),
        },

        {
          name: this.$t("shop_visitors_widget.returning_visitors"),
          data: this.timeSeries.arrayOf(
            "returning_visitors",
            true,
            "created_at",
          ),
        },
      ];

      if (this.has_amp) {
        series.insert(1, {
          name: this.$t("shop_visitors_widget.amp"),
          data: this.timeSeries.arrayOf("amp", true, "created_at"),
        });
      }

      return series;
    },

    //new_visitors:

    all_new_visitors() {
      return this.getSumByKey("new_visitors");
    },
    all_new_visitors_grow_week() {
      let _new = this.getSumByKey("new_visitors", 0, 7);
      let _old = this.getSumByKey("new_visitors", 7, 7);

      if (_old === 0) _old = 0.001;

      return (100 * (_new - _old)) / _old;
    },

    // returning_visitors:

    all_returning_visitors() {
      return this.getSumByKey("returning_visitors");
    },
    all_returning_visitors_grow_week() {
      let _new = this.getSumByKey("returning_visitors", 0, 7);
      let _old = this.getSumByKey("returning_visitors", 7, 7);

      if (_old === 0) _old = 0.001;

      return (100 * (_new - _old)) / _old;
    },

    // page_views:

    all_page_views() {
      return this.getSumByKey("page_views");
    },
    all_page_views_grow_week() {
      let _new = this.getSumByKey("page_views", 0, 7);
      let _old = this.getSumByKey("page_views", 7, 7);

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

  beforeUnmount() {},
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

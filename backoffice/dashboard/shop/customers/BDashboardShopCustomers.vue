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
    :color="SaminColorDarkDeep"
    :icon-to="{ name: 'BPageShopCrmReport' }"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
      'admin_shop.dashboard.customers.title',
    )}   <span class='fw-normal ml-xs small'> ${$t(
      'admin_shop.dashboard.customers.title_small',
    )} </span>  </h5>`"
    dark
    extended
    icon="call_split"
    icon-color="#fff"
  >
    <template v-slot:actions>
      <v-container fluid>
        <div v-if="lastdayData" class="text-start">
          <span class="text-h2 me-3 font-weight-black">{{
            numeralFormat(lastdayData.users, "0,0.[00]a")
          }}</span>
          <div v-if="has_todayData && has_yesterdayData" class="mt-1">
            <small class="me-1"
              >{{ $t("admin_shop.dashboard.customers.new_users") }}:</small
            >
            <b>{{ numeralFormat(todayData.users_add, "0,0.[00]a") }}</b>
            <up-down-icon :value="todayData.users_add"></up-down-icon>
          </div>
        </div>

        <apexchart
          :options="options"
          :series="series"
          class="mt-3 mx-n6 mx-sm-0"
          dir="ltr"
          height="210"
          type="line"
          width="100%"
        />

        <v-row class="mt-2 small" dense justify="space-around">
          <v-col
            v-for="level in levels"
            :key="level.code"
            class="text-center"
            cols="6"
            lg="2"
            md="4"
          >
            <img
              :class="{ 'img-grayscale': !level.club }"
              :src="level.icon"
              :title="
                level.club && level.club.description
                  ? level.club.description
                  : $t(level.name)
              "
              class="pointer-pointer"
              height="32"
              width="32"
              @click="$router.push({ name: 'BPageShopCrmClub' })"
            />
            <p class="m-1 text-subtitle-2">{{ $t(level.name) }}</p>
            <!-- Club info -->
            <template v-if="level.club">
              <div class="d-flex">
                <div class="w-50">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.monthly")
                  }}</small>
                  <u-price
                    :amount="level.club.monthly"
                    :currency="level.club.currency"
                    class="single-line"
                  ></u-price>
                </div>
                <div class="w-50">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.annually")
                  }}</small>
                  <u-price
                    :amount="level.club.annually"
                    :currency="level.club.currency"
                    class="single-line"
                  ></u-price>
                </div>
              </div>
              <div class="d-flex mt-2">
                <div class="w-50">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.discount")
                  }}</small>
                  <b>%{{ level.club.percent }}</b>
                </div>

                <div class="w-50">
                  <span v-if="level.club.limit" class="text-subtitle-2 d-block">
                    <small class="d-block op-0-6"
                      >{{ $t("global.commons.limit") }}
                    </small>
                    <u-price
                      :amount="level.club.limit"
                      :currency="level.club.currency"
                      class="single-line"
                    ></u-price>
                  </span>
                </div>
              </div>
              <div class="d-flex mt-2">
                <div class="w-100">
                  <small class="d-block op-0-6">{{
                    $t("global.commons.users")
                  }}</small>
                  <b> {{ level.club.count }}</b>
                </div>
              </div>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-slot:bottom>
      <v-row class="border-between text-center mx-0 mt-2 mb-0">
        <v-col cols="4" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(lastDayData.users, "0,0a") }}
          </h4>
          <div class="d-flex align-center justify-center mt-2">
            <v-icon class="me-1" size="x-small">fa:fas fa-users</v-icon>
            <small>
              {{ $t("admin_shop.dashboard.customers.total_customers") }}
            </small>
          </div>
        </v-col>

        <v-col cols="4" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(change_today, "0,0a") }}

            <up-down-icon :value="change_today" size="24" small></up-down-icon>
          </h4>
          <div class="d-flex align-center justify-center mt-2">
            <v-icon class="me-1" size="x-small">fa:fas fa-calendar-day</v-icon>
            <small>
              {{ $t("admin_shop.dashboard.customers.new_customers_today") }}
            </small>
          </div>
        </v-col>

        <v-col cols="4" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(change_week, "0,0a") }}
            <up-down-icon :value="change_week" size="24"></up-down-icon>
          </h4>
          <div class="d-flex align-center justify-center mt-2">
            <v-icon class="me-1" size="x-small">fa:fas fa-calendar-week</v-icon>
            <small>
              {{ $t("admin_shop.dashboard.customers.new_customers_week") }}
            </small>
          </div>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import _ from "lodash-es";

import numeral from "numeral";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UpDownIcon from "../../../../ui/icon/UpDownIcon.vue";
import { Club } from "@selldone/core-js";

export default {
  name: "BDashboardShopCustomers",
  components: {
    UpDownIcon,
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
    funnel_value: [0, 0, 0, 0],
    //funnel_value:[50,10,5,20],

    start_date: null,
    end_date: null,
  }),

  computed: {
    has_todayData() {
      return !_.isEmpty(this.todayData);
    },

    has_yesterdayData() {
      return !_.isEmpty(this.yesterdayData);
    },

    change_today() {
      if (!this.todayData) return 0;
      return this.todayData.users_add;
    },

    change_week() {
      if (!this.lastWeekData) return 0;
      return this.lastWeekData.users_add;
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
    lastDayData() {
      return this.timeSeries.lastDayData();
    },
    lastdayData() {
      return this.timeSeries.lastdayData();
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
          mode: "dark",
          palette: "palette1",
        },

        legend: {
          show: window.innerWidth > 720,
          position: "bottom",
          horizontalAlign: "center",
        },

        colors: ["#ffffff", "#8BC34A"],

        chart: {
          background: this.SaminColorDarkDeep,

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
        /*  markers: {
          size: 2
        },*/
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.1,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            colorStops: [],
          },
        },

        // 🞇 Stroke chart
        stroke: {
          curve: "smooth",
          colors: "#ffffff",
          width: 2,
          dashArray: 0,
        },

        // 🞇 Bar chart
        plotOptions: {
          bar: {
            horizontal: false,
            endingShape: "flat",
            columnWidth:
              window.innerWidth > 1280
                ? "25%"
                : window.innerWidth > 720
                  ? "50%"
                  : "90%",
            distributed: false,
            colors: {
              ranges: [
                {
                  from: -100000,
                  to: -10,
                  color: "#D32F2F",
                },
                {
                  from: -9,
                  to: 0,
                  color: "#E91E63",
                },
              ],
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
              try {
                return DateConverter.ConvertTimestampToShortString(timestamp);
              } catch (e) {
                // console.error(e);

                return "";
              }
            },
          },
        },

        tooltip: {
          x: {
            formatter: function (value, timestamp, index) {
              try {
                return DateConverter.ConvertTimestampToShortString(
                  value,
                  false,
                );
              } catch (e) {
                // console.error(e);
                return "";
              }
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
              "admin_shop.dashboard.customers.chart.new_customers",
            ),
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t(
                "admin_shop.dashboard.customers.chart.new_customers",
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
            seriesName: this.$t(
              "admin_shop.dashboard.customers.chart.customers",
            ),
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t("admin_shop.dashboard.customers.chart.customers"),
            },

            labels: {
              formatter: function (value, timestamp, index) {
                return numeral(value).format("0.[0]a");
              },
            },
          },
        ],
        grid: {
          show: true,
          borderColor: this.SaminColorLight,
          strokeDashArray: [2, 3],
          position: "back",
          xaxis: {
            lines: {
              show: false,
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

    clubs() {
      return this.shop.clubs;
    },
    levels() {
      let out = [];
      for (let key in Club.Levels) {
        let level = Club.Levels[key];

        if (this.clubs) {
          const club = this.clubs.find((club) => club.level === level.code);
          level.club = club;
        }

        out.push(level);
      }
      return out;
    },
  },

  watch: {},

  methods: {
    sumInTimeSpan(key) {
      return this.timeSeries.totalOf(key, this.start_date, this.end_date);
    },
    calculate_funnel() {
      this.funnel_value = [
        [
          this.sumInTimeSpan("view_products_physical"),
          this.sumInTimeSpan("view_products_virtual"),
          this.sumInTimeSpan("view_products_file"),
          this.sumInTimeSpan("view_products_service"),
        ],
        [
          this.sumInTimeSpan("order_physical_added"),
          this.sumInTimeSpan("order_virtual_added"),
          this.sumInTimeSpan("order_file_added"),
          this.sumInTimeSpan("order_service_added"),
        ],
        [
          this.sumInTimeSpan("order_physical_checkout"),
          this.sumInTimeSpan("order_virtual_checkout"),
          this.sumInTimeSpan("order_file_checkout"),
          this.sumInTimeSpan("order_service_checkout"),
        ],
        [
          this.sumInTimeSpan("sell_products_physical"),
          this.sumInTimeSpan("sell_products_virtual"),
          this.sumInTimeSpan("sell_products_file"),
          this.sumInTimeSpan("sell_products_service"),
        ],
      ];

      //console.log("funnel_value", this.funnel_value);
    },
  },

  created() {
    this.calculate_funnel();
    this.options.xaxis.categories =
      this.timeSeries.arrayOfTimeAbsolute("created_at");

    this.series[0].data = this.timeSeries.arrayOf("users", true, "created_at");
    this.series[0].name = this.$t(
      "admin_shop.dashboard.customers.chart.customers",
    );

    this.series[1].data = this.timeSeries.arrayOf(
      "users_add",
      true,
      "created_at",
    );
    /*
        this.timeSeries.arrayOfDiffByPrevious(
      "users",
      true,
      "created_at"
    );*/
    this.series[1].name = this.$t(
      "admin_shop.dashboard.customers.chart.new_customers",
    );
  },
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

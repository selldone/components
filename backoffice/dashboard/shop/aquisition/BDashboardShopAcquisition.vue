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
  <!-- ━━━━━━━━━━━━━━━━━━ BDashboardShopAcquisition ━━━━━━━━━━━━━━━━━━ -->
  <component
    :is="modern ? 'div' : 's-widget-box'"
    :active="modern ? undefined : true"
    :icon-to="modern ? undefined : { name: 'BPageShopCrmReport' }"
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
            'shop_visitors_widget.title',
          )}  </h5>`
    "
    :icon="modern ? undefined : 'fa:fas fa-users'"
    class="b-dashboard-acquisition text-start"
    :class="{ 'b-dashboard-acquisition--modern': modern }"
  >
    <v-row :class="{ 'b-dashboard-acquisition__layout': modern }">
      <v-col
        cols="12"
        lg="9"
        :order-lg="modern ? undefined : 2"
        :class="{ 'sd-modern-widget b-dashboard-acquisition__trend': modern }"
      >
        <header v-if="modern" class="sd-modern-header">
          <div class="sd-modern-title">
            <span
              class="sd-modern-icon sd-modern-icon--plain"
              aria-hidden="true"
            >
              <v-icon icon="insights" size="20" />
            </span>
            <div>
              <div class="d-flex align-center ga-1">
                <h2 class="sd-modern-title-text">
                  {{
                    $t(
                      "admin_shop.dashboard.modern.acquisition_analytics_title",
                    )
                  }}
                </h2>
                <v-btn
                  class="sd-modern-icon-button sd-modern-info-button"
                  icon
                  variant="text"
                  :aria-label="$t('shop_visitors_widget.title')"
                >
                  <v-icon icon="info_outline" size="16" aria-hidden="true" />
                  <v-tooltip
                    activator="parent"
                    location="top"
                    :max-width="360"
                    open-on-click
                    open-on-focus
                    interactive
                    content-class="sd-modern-tooltip text-start"
                  >
                    {{
                      $t("admin_shop.dashboard.modern.acquisition_detail_help")
                    }}
                  </v-tooltip>
                </v-btn>
              </div>
              <p class="sd-modern-subtitle">
                {{ $t("admin_shop.dashboard.modern.acquisition_subtitle") }}
              </p>
            </div>
          </div>
          <v-btn
            :to="{ name: 'BPageShopCrmReport' }"
            class="sd-modern-icon-button"
            variant="text"
            icon
            :aria-label="$t('shop_visitors_widget.title')"
          >
            <v-icon icon="arrow_outward" size="18" />
            <v-tooltip
              activator="parent"
              location="top"
              :open-on-focus="true"
              content-class="sd-modern-tooltip text-start"
            >
              {{ $t("shop_visitors_widget.title") }}
            </v-tooltip>
          </v-btn>
        </header>
        <dl
          v-if="modern"
          class="sd-modern-stat-grid b-dashboard-acquisition__stats"
        >
          <div v-for="metric in modern_metrics" :key="metric.key">
            <dt class="sd-modern-label">{{ $t(metric.label) }}</dt>
            <dd class="b-dashboard-acquisition__value">
              {{ numeralFormat(metric.total, "0.[0] a") }}
            </dd>
            <dd
              v-if="metric.comparison.available"
              class="b-dashboard-acquisition__comparison"
            >
              <up-down-icon
                :value="metric.comparison.value ?? metric.comparison.change"
                small
              />
              <span>{{
                metric.comparison.new_activity
                  ? $t("admin_shop.dashboard.modern.new_activity")
                  : numeralFormat(metric.comparison.value, "0.[0]") + "%"
              }}</span>
              <span>{{
                $t(
                  metric.comparison.days === 1
                    ? "admin_shop.dashboard.modern.comparison_previous_day"
                    : "admin_shop.dashboard.modern.comparison_previous_days",
                  { days: metric.comparison.days },
                )
              }}</span>
            </dd>
          </div>
        </dl>
        <v-row v-else class="text-center border-between" dense>
          <v-col cols="4">
            <h2 class="text-h5 text-sm-h4 font-weight-black">
              {{ numeralFormat(all_new_visitors, "0.[0] a") }}
            </h2>
            <p class="small m-0">
              {{ $t("shop_visitors_widget.new_visitors") }}
            </p>
            <p class="small m-0 op-0-8 text-truncate">
              <up-down-icon :value="all_new_visitors_grow_week"></up-down-icon>
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
            :key="modern ? chartThemeKey : 'legacy-trend'"
            class="mt-3 mx-n2 mx-sm-0"
            height="250"
            type="area"
            width="100%"
          />
        </div>
      </v-col>

      <v-col
        cols="12"
        lg="3"
        :order-lg="modern ? undefined : 1"
        :class="{
          'sd-modern-widget b-dashboard-acquisition__composition': modern,
        }"
      >
        <header v-if="modern" class="sd-modern-header">
          <div class="sd-modern-title">
            <span
              class="sd-modern-icon sd-modern-icon--plain"
              aria-hidden="true"
              ><v-icon icon="donut_small" size="20"
            /></span>
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.page_composition_title") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{
                  $t("admin_shop.dashboard.modern.page_composition_subtitle")
                }}
              </p>
            </div>
          </div>
        </header>
        <apexchart
          :height="240"
          :options="options_pie"
          :series="series_pie"
          :key="modern ? chartThemeKey : 'legacy-pages'"
          type="donut"
          width="100%"
          :class="{ 'b-dashboard-acquisition__composition-chart': modern }"
        />
        <u-time-span
          v-model:end-date="end_date"
          v-model:start-date="start_date"
          :color="modern ? 'on-surface' : undefined"
          :class="{ 'b-dashboard-acquisition__composition-range': modern }"
          small-width
        ></u-time-span>
        <div v-if="modern && has_amp" class="b-dashboard-acquisition__amp">
          <span
            ><v-icon icon="bolt" size="16" aria-hidden="true" />{{
              $t("shop_visitors_widget.amp")
            }}</span
          >
          <span>{{
            numeralFormat(
              timeSeries.totalOf("amp", start_date, end_date),
              "0,0.[0]a",
            )
          }}</span>
        </div>
      </v-col>

      <component
        :is="modern ? 'section' : 'div'"
        :class="{
          'sd-modern-widget b-dashboard-acquisition__flow-layout': modern,
        }"
        :style="modern ? undefined : { display: 'contents' }"
      >
        <header v-if="modern" class="sd-modern-header">
          <div class="sd-modern-title">
            <span
              class="sd-modern-icon sd-modern-icon--plain"
              aria-hidden="true"
              ><v-icon icon="alt_route" size="20"
            /></span>
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.channel_flow_title") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{ $t("admin_shop.dashboard.modern.channel_flow_help") }}
              </p>
            </div>
          </div>
        </header>
        <v-col
          cols="12"
          order="3"
          :md="modern ? 8 : undefined"
          :sm="modern ? 12 : 8"
          class="text-body-2"
          :class="{ 'b-dashboard-acquisition__flow': modern }"
        >
          <component
            v-if="!modern"
            :is="modern ? 'h3' : 'p'"
            :class="modern ? 'sd-modern-eyebrow' : 'font-weight-bold'"
          >
            {{ $t("global.commons.channels_overview") }}
          </component>

          <div :class="{ 'b-dashboard-acquisition__sankey': modern }">
            <b-session-chart-sankey
              v-if="socials && Object.keys(socials).length"
              :Social="calcTotalSocials"
              :direct="calcTotalDirect"
              :other="calcTotalOther"
              :search="calcTotalOrganicSearch"
              :social-details="calSocialDetails"
              :height="modern ? '260px' : '150px'"
            ></b-session-chart-sankey>
            <p v-else-if="modern" class="sd-modern-empty-state" role="status">
              {{ $t("global.commons.no_data") }}
            </p>
          </div>
        </v-col>
        <!-- ━━━━━━━━━━━━━━━━━━ Channels ━━━━━━━━━━━━━━━━━━ -->

        <v-col
          class="text-body-2"
          cols="12"
          order="4"
          :md="modern ? 4 : undefined"
          :sm="modern ? 12 : 4"
          :class="{ 'b-dashboard-acquisition__sources': modern }"
        >
          <component
            :is="modern ? 'h3' : 'p'"
            :class="modern ? 'sd-modern-eyebrow' : 'font-weight-bold'"
          >
            {{ $t("global.commons.acquisition_channel") }}
          </component>
          <div
            class="overflow-auto thin-scroll pe-3"
            :style="{ maxHeight: modern ? '300px' : '150px' }"
          >
            <div
              v-for="(item, i) in sorted_socials"
              :key="i"
              :class="
                modern ? 'b-dashboard-acquisition__source' : 'my-1 d-flex'
              "
            >
              <span
                class="text-capitalize"
                :class="{ 'd-inline-flex align-center': modern }"
              >
                <b-campaign-source-icon
                  :value="item.key"
                  class="me-1"
                  :size="modern ? 20 : 15"
                  alt=""
                />
                {{ item.key }}</span
              >
              <div class="dashed-flex-space"></div>
              <component
                :is="modern ? 'span' : 'b'"
                :class="{ 'b-dashboard-acquisition__source-count': modern }"
                >{{ numeralFormat(item.value, "0,0.[0]a") }}</component
              >
            </div>
          </div>
        </v-col>
      </component>
    </v-row>
  </component>
</template>

<script lang="ts">
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
import pagesIcon from "../../../../assets/icons/pages.svg";
import { getPeriodComparison } from "../performance/periodComparison.ts";

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
    modern: Boolean,
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
    modern_metrics() {
      return [
        {
          key: "new_visitors",
          label: "shop_visitors_widget.new_visitors",
          total: this.all_new_visitors,
        },
        {
          key: "returning_visitors",
          label: "shop_visitors_widget.returning_visitors",
          total: this.all_returning_visitors,
        },
        {
          key: "page_views",
          label: "shop_visitors_widget.page_views",
          total: this.all_page_views,
        },
      ].map((metric) => ({
        ...metric,
        comparison: getPeriodComparison(
          this.timeSeries,
          (row) => row[metric.key],
        ),
      }));
    },
    chartThemeKey() {
      return this.$vuetify.theme.name + "-" + this.$i18n.locale;
    },
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
          background: "transparent",
        },
        theme: this.modern
          ? { mode: this.$vuetify.theme.current.dark ? "dark" : "light" }
          : undefined,
        title: {
          text: this.modern
            ? undefined
            : this.$t("shop_visitors_widget.page_views"),
          align: "center",
          margin: 4,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize: "12px",
            color: this.modern
              ? "rgba(var(--v-theme-on-surface), 0.66)"
              : "#263238",
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
          fontSize: this.modern ? "12px" : undefined,
          fontWeight: this.modern ? 400 : undefined,
          markers: this.modern
            ? {
                customHTML: [
                  ProductType.PHYSICAL.image,
                  ProductType.VIRTUAL.image,
                  ProductType.FILE.image,
                  ProductType.SERVICE.image,
                  pagesIcon,
                ].map(
                  (image) => () =>
                    `<img class="b-dashboard-acquisition__legend-icon" src="${image}" alt="" aria-hidden="true">`,
                ),
              }
            : undefined,
        },

        dataLabels: {
          enabled: true,
        },

        plotOptions: {
          pie: {
            donut: {
              size: this.modern ? "64%" : "23%",
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

      if (!this.modern) return maxPoints;
      // Keep narrow annotations inside the plot; native series names remain in the legend and tooltip.
      return maxPoints.map((point) => ({
        ...point,
        label: {
          ...point.label,
          ...(this.$vuetify.display?.smAndDown
            ? { text: numeral(point.y).format("0,0") }
            : {}),
          style: { ...point.label?.style, fontSize: "11px", fontWeight: 400 },
        },
      }));
    },

    options() {
      return {
        annotations: this.has_annotaion
          ? {
              points: this.maxPoints,
            }
          : undefined,

        theme: {
          mode:
            this.modern && this.$vuetify.theme.current.dark ? "dark" : "light",
          palette: "palette1",
        },

        chart: {
          height: 350,
          type: "area",
          stacked: false,
          background: "transparent", // Set the background to transparent
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
          show: this.modern,
          width: this.modern ? 2 : 0,
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
          opacity: this.modern ? 0.08 : 0.7,
          /* gradient: {
            opacityFrom: 0.75,
            opacityTo: 0.8,
          }*/
        },
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          fontSize: this.modern ? "12px" : undefined,
          fontWeight: this.modern ? 400 : undefined,
          markers: this.modern
            ? {
                size: 8,
                customHTML: (this.has_amp
                  ? ["visibility", "bolt", "person_add", "history"]
                  : ["visibility", "person_add", "history"]
                ).map(
                  (icon) => () =>
                    `<span class="material-icons b-dashboard-acquisition__trend-icon" aria-hidden="true">${icon}</span>`,
                ),
              }
            : undefined,
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
            formatter: (value) =>
              numeral(value).format(this.modern ? "0,0" : "0.[0]a"),
          },
        },

        grid: {
          show: true,
          strokeDashArray: [2, 3],
          position: "back",
          xaxis: {
            lines: {
              show: !this.modern,
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
.b-dashboard-acquisition--modern {
  min-width: 0;

  .b-dashboard-acquisition__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
    align-items: stretch;
    gap: 20px;
    margin: 0;
  }

  .b-dashboard-acquisition__layout > .v-col-12 {
    min-width: 0;
    width: 100%;
    max-width: none;
    order: initial;
  }

  .b-dashboard-acquisition__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .b-dashboard-acquisition__stats dt {
    font-size: 12px;
    font-weight: 400;
  }

  .b-dashboard-acquisition__comparison {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 3px 5px;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.6;
  }

  .b-dashboard-acquisition__value {
    margin: 7px 0 6px;
    font-size: clamp(21px, 2.2vw, 28px);
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.4px;
    font-variant-numeric: tabular-nums;
  }

  .sd-modern-title-text {
    font-weight: 500;
  }

  .b-dashboard-acquisition__composition {
    display: flex;
    flex-direction: column;
  }

  .b-dashboard-acquisition__composition-range {
    order: 1;
  }

  .b-dashboard-acquisition__composition-chart {
    order: 2;
    margin-block-start: 16px;
  }

  .b-dashboard-acquisition__amp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    order: 3;
    margin-block-start: 16px;
    padding: 12px 0;
    border-block-start: 1px solid var(--sd-modern-border);
    font-size: 13px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  .b-dashboard-acquisition__amp > span:first-child {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .b-dashboard-acquisition__flow-layout {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 0 28px;
  }

  .b-dashboard-acquisition__flow-layout > .sd-modern-header {
    grid-column: 1 / -1;
  }

  .b-dashboard-acquisition__flow-layout > .v-col-12 {
    width: 100%;
    max-width: none;
    min-width: 0;
    order: initial;
    padding: 0;
  }

  .b-dashboard-acquisition__sources > .sd-modern-eyebrow {
    font-weight: 500;
  }

  .b-dashboard-acquisition__sankey {
    max-width: 100%;
    overflow-x: auto;
    margin-block-start: 0;
  }

  :deep(.snaky-chart) {
    min-width: 440px;
  }

  :deep(.snaky-chart .d2b-sankey-nodes text) {
    fill: rgb(var(--v-theme-on-surface));
    font-size: 12px;
  }

  .b-dashboard-acquisition__source {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 13px;
    font-weight: 400;
  }

  .b-dashboard-acquisition__source:last-child {
    border: 0;
  }

  .b-dashboard-acquisition__source-count {
    margin-inline-start: auto;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .b-dashboard-acquisition__source .dashed-flex-space {
    display: none;
  }

  :deep(.b-dashboard-acquisition__legend-icon) {
    width: 16px;
    height: 16px;
    object-fit: contain;
    vertical-align: middle;
  }

  :deep(.b-dashboard-acquisition__trend-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 16px;
    vertical-align: middle;
  }

  @media (max-width: 1050px) {
    .b-dashboard-acquisition__layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 700px) {
    .b-dashboard-acquisition__flow-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }

    .b-dashboard-acquisition__flow-layout > .sd-modern-header {
      margin-block-end: 0;
    }

    .b-dashboard-acquisition__stats {
      gap: 12px;
    }
  }
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

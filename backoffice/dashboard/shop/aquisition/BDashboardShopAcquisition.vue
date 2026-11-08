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
    ref="reportRoot"
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
    :class="{
      'b-dashboard-acquisition--modern': modern,
      'b-dashboard-acquisition--report': modern && report,
      'b-dashboard-acquisition--summary': modern && summary,
    }"
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
                      report && summary
                        ? "shop_crm_report.acquisition_summary_title"
                        : "admin_shop.dashboard.modern.acquisition_analytics_title",
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
          <slot v-if="report" name="period" />
          <v-btn
            v-if="!report"
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
            <apexchart
              v-if="report && summary"
              :options="report_summary_options"
              :series="[
                {
                  name: $t(metric.label),
                  data: reportMetricData(metric.key),
                },
              ]"
              :aria-label="$t(metric.label)"
              height="42"
              type="area"
              width="100%"
            />
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

        <div
          v-if="modern && report && !summary"
          class="b-dashboard-acquisition__report-plots"
        >
          <section>
            <h3>{{ $t("shop_crm_report.visitors_title") }}</h3>
            <p class="b-dashboard-acquisition__scope">
              {{ $t("shop_crm_report.shop_period") }}
            </p>
            <apexchart
              :options="report_plot_options.visitors"
              :series="report_series.visitors"
              :key="chartThemeKey + '-visitors'"
              height="300"
              type="area"
              width="100%"
            />
          </section>
          <section>
            <h3>{{ $t("shop_crm_report.page_views_title") }}</h3>
            <p class="b-dashboard-acquisition__scope">
              {{ $t("shop_crm_report.shop_period") }}
            </p>
            <apexchart
              :options="report_plot_options.views"
              :series="report_series.views"
              :key="chartThemeKey + '-views'"
              height="300"
              type="area"
              width="100%"
            />
          </section>
        </div>
        <div v-else-if="!summary" style="min-height: 250px">
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
        v-if="!summary"
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
        <!-- Modern: a leader-line donut of page types behind a preset menu; Custom opens the shared date dialog. -->
        <template v-if="modern">
          <div class="b-dashboard-acquisition__composition-period">
            <span
              >{{ getLocalDateString(start_date) }} –
              {{ getLocalDateString(end_date) }}</span
            >
            <u-time-span-selector
              :date-range="composition_range"
              :max-days="30"
              variant="text"
              button-class="sd-modern-button sd-modern-button--inline sd-modern-button--secondary"
              menu-class="sd-modern-select-menu"
              @select="selectCompositionRange"
            />
          </div>
          <div class="b-dashboard-acquisition__composition-body">
            <u-chart-donut-leader
              :slices="composition_slices"
              :unit="$t('shop_visitors_widget.page_views')"
              :aria-label="
                $t('admin_shop.dashboard.modern.page_composition_title') +
                ': ' +
                composition_slices
                  .map(
                    (slice) =>
                      `${slice.label} ${numeralFormat(slice.value, '0,0')}`,
                  )
                  .join(', ')
              "
              class="b-dashboard-acquisition__composition-donut"
            />
            <ul class="b-dashboard-acquisition__composition-legend">
              <li v-for="slice in composition_slices" :key="slice.key">
                <span
                  class="b-dashboard-acquisition__composition-swatch"
                  :style="{ background: slice.color }"
                  aria-hidden="true"
                />
                <img :src="slice.image" alt="" width="16" height="16" />
                <span class="b-dashboard-acquisition__composition-name">{{
                  slice.label
                }}</span>
                <span class="b-dashboard-acquisition__composition-count">{{
                  numeralFormat(slice.value, "0,0.[0]a")
                }}</span>
                <span class="b-dashboard-acquisition__composition-share">{{
                  composition_total
                    ? numeralFormat(
                        (100 * slice.value) / composition_total,
                        "0.[0]",
                      ) + "%"
                    : "—"
                }}</span>
              </li>
            </ul>
          </div>
          <p
            v-if="report"
            class="b-dashboard-acquisition__scope b-dashboard-acquisition__composition-scope"
          >
            {{ $t("shop_crm_report.composition_scope") }}
          </p>
          <u-time-span-custom-dialog
            v-model="composition_dialog"
            :start="start_date"
            :end="end_date"
            :max-days="30"
            @apply="applyCompositionRange"
          />
        </template>
        <template v-else>
          <div>
            <apexchart
              :height="240"
              :options="options_pie"
              :series="series_pie"
              key="legacy-pages"
              type="donut"
              width="100%"
            />
          </div>
          <u-time-span
            v-model:end-date="end_date"
            v-model:start-date="start_date"
            small-width
          ></u-time-span>
        </template>
      </v-col>

      <component
        v-if="!summary"
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
        <p
          v-if="modern && report"
          class="b-dashboard-acquisition__scope b-dashboard-acquisition__flow-scope"
        >
          {{ $t("shop_crm_report.source_scope") }}
        </p>
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
              ref="reportFlow"
              v-if="
                modern
                  ? has_channel_data
                  : socials && Object.keys(socials).length
              "
              :modern="modern"
              :Social="calcTotalSocials"
              :direct="calcTotalDirect"
              :other="calcTotalOther"
              :search="calcTotalOrganicSearch"
              :social-details="calSocialDetails"
              :height="modern ? (report ? '260px' : flow_height) : '150px'"
            ></b-session-chart-sankey>
            <u-chart-placeholder
              v-else-if="modern"
              kind="flow"
              :text="$t('admin_shop.dashboard.modern.placeholder_flow')"
              :min-height="220"
              class="b-dashboard-acquisition__flow-empty"
            />
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
            :style="{
              maxHeight: modern ? (report ? '300px' : '264px') : '150px',
            }"
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
              <span
                v-if="modern && report"
                class="b-dashboard-acquisition__source-share"
                :aria-label="$t('shop_crm_report.source_share')"
                >{{
                  all_new_visitors + all_returning_visitors > 0
                    ? numeralFormat(
                        (100 * item.value) /
                          (all_new_visitors + all_returning_visitors),
                        "0.[0]",
                      ) + "%"
                    : "—"
                }}</span
              >
            </div>
            <p
              v-if="modern && !sorted_socials.length"
              class="sd-modern-empty-state"
            >
              {{ $t("global.commons.no_data") }}
            </p>
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
import UTimeSpanSelector from "../../../../ui/time/span/selector/UTimeSpanSelector.vue";
import UTimeSpanCustomDialog from "../../../../ui/time/span/custom/UTimeSpanCustomDialog.vue";
import UChartDonutLeader from "../../../../ui/chart/donut-leader/UChartDonutLeader.vue";
import UChartPlaceholder from "../../../../ui/chart/placeholder/UChartPlaceholder.vue";
import { REST_COLOR } from "../../../../ui/chart/donut-leader/donutSlices.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BDashboardShopAcquisition",
  mixins: [DateMixin],
  components: {
    BCampaignSourceIcon,
    BSessionChartSankey,
    UpDownIcon,
    UTimeSpan,
    UTimeSpanSelector,
    UTimeSpanCustomDialog,
    UChartDonutLeader,
    UChartPlaceholder,
    SWidgetBox,
  },
  props: {
    modern: Boolean,
    report: Boolean,
    summary: Boolean,
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
    report_resize_observer: null,
    start_date: null,
    end_date: null,
    has_annotaion: true,
    // Modern page-view composition: a preset [to, from] in days before today, or Custom dates.
    composition_range: [0, 30],
    composition_dialog: false,
  }),

  computed: {
    report_summary_options() {
      return {
        chart: {
          sparkline: { enabled: true },
          background: "transparent",
          fontFamily: "var(--font)",
          redrawOnParentResize: true,
          redrawOnWindowResize: true,
        },
        theme: { mode: this.$vuetify.theme.current.dark ? "dark" : "light" },
        colors: [this.$vuetify.theme.current.colors.primary],
        stroke: { curve: "straight", width: 1.5 },
        fill: { type: "solid", opacity: 0.06 },
        dataLabels: { enabled: false },
        xaxis: { type: "datetime" },
        tooltip: {
          x: {
            formatter: (value) =>
              DateConverter.ConvertTimestampToShortString(value, false),
          },
          y: { formatter: (value) => numeral(value).format("0,0") },
        },
      };
    },
    report_series() {
      const plot = (key) => ({
        name: this.$t("shop_visitors_widget." + key),
        data: this.reportMetricData(key),
      });
      return {
        visitors: ["new_visitors", "returning_visitors"].map(plot),
        views: ["page_views"].map(plot),
      };
    },
    report_plot_options() {
      const options = this.options;
      const plot = (colors, icons) => ({
        ...options,
        annotations: undefined,
        chart: {
          ...options.chart,
          events: undefined,
          redrawOnParentResize: true,
          redrawOnWindowResize: true,
        },
        colors,
        xaxis: {
          ...options.xaxis,
          labels: { ...options.xaxis.labels, trim: false, rotate: 0 },
        },
        grid: {
          ...options.grid,
          padding: { top: 14, right: 24, bottom: 12, left: 24 },
        },
        legend: {
          ...options.legend,
          markers: {
            customHTML: icons.map(
              (icon) => () =>
                `<span class="material-icons b-dashboard-acquisition__trend-icon" aria-hidden="true">${icon}</span>`,
            ),
          },
        },
      });
      return {
        visitors: plot(["#C2185B", "#1976D2"], ["person_add", "history"]),
        views: plot(["#FFA000"], ["visibility"]),
      };
    },
    has_channel_data() {
      return Object.values(this.socials || {}).some(
        (value) =>
          typeof value === "number" && Number.isFinite(value) && value > 0,
      );
    },
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
    // The dashboard flow grows with its end branches (organic search, direct, other and up to
    // five networks), so a few channels never stretch into tall bands.
    flow_height() {
      const leaves = [
        this.calcTotalOrganicSearch,
        this.calcTotalDirect,
        this.calcTotalOther,
        ...Object.values(this.calSocialDetails),
      ].filter((value) => Number(value) > 0).length;
      return `${Math.min(260, Math.max(140, 40 + 28 * leaves))}px`;
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
    // Dashboard donut: page views by product type in their identity colors, then other pages.
    composition_slices() {
      const types = ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE"].map(
        (code) => ProductType[code],
      );
      return [
        ...types.map((type) => ({
          key: type.code,
          label: this.$t(`global.product_types.${type.code.toLowerCase()}`),
          color: type.color,
          image: type.image,
        })),
        {
          key: "OTHER",
          label: this.$t("shop_visitors_widget.other_pages"),
          color: REST_COLOR,
          image: pagesIcon,
        },
      ].map((slice, index) => {
        const value = Number(this.series_pie[index]);
        return {
          ...slice,
          // Other pages are views minus product views; a negative gap is no page view.
          value: Number.isFinite(value) && value > 0 ? value : 0,
        };
      });
    },
    composition_total() {
      return this.composition_slices.reduce(
        (sum, slice) => sum + slice.value,
        0,
      );
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

    maxPoints() {
      const labels = [
        this.$t("shop_visitors_widget.page_views"),
        this.$t("shop_visitors_widget.new_visitors"),
        this.$t("shop_visitors_widget.returning_visitors"),
      ];
      const colors = ["#FFA000", "#C2185B", "#1976D2"];
      const maxPoints = ChartAnnotations.CreateMaxPoints(
        this.timeSeries,
        ["page_views", "new_visitors", "returning_visitors"],
        labels,
        colors,
      );

      if (!this.modern) return maxPoints;
      // Keep narrow annotations inside the plot; native series names remain in the legend and tooltip.
      return maxPoints.map((point) => ({
        ...point,
        id: `b-dashboard-acquisition__maximum-point-${point.marker.strokeColor.slice(1)}`,
        seriesIndex: colors.indexOf(point.marker.strokeColor),
        label: {
          ...point.label,
          text:
            (this.$vuetify.display?.smAndDown
              ? ""
              : labels[colors.indexOf(point.marker.strokeColor)] + ": ") +
            numeral(point.y).format("0.[0]a").toUpperCase(),
          textAnchor: "middle",
          offsetX: 0,
          style: {
            ...point.label?.style,
            fontSize: "11px",
            fontWeight: 400,
            cssClass: "b-dashboard-acquisition__maximum-label",
          },
        },
      }));
    },

    endpointPoints() {
      if (!this.modern) return [];
      const keys = ["page_views", "new_visitors", "returning_visitors"];
      const icons = ["\ue8f4", "\ue7fe", "\ue889"];
      const colors = ["#FFA000", "#C2185B", "#1976D2"];
      return keys.flatMap((key, seriesIndex) => {
        let last = null;
        this.timeSeries.raw_data.forEach((row) => {
          if (row[key] == null || row[key] === "") return;
          const x = DateConverter.convertToLocalTime(
            row.created_at,
            true,
          )?.getTime();
          const y = Number(row[key]);
          if (Number.isFinite(x) && Number.isFinite(y) && (!last || x > last.x))
            last = { x, y };
        });
        if (!last) return [];
        return [
          {
            ...last,
            seriesIndex,
            marker: {
              size: 10,
              fillColor: "rgb(var(--v-theme-surface))",
              strokeColor: colors[seriesIndex],
              strokeWidth: 2,
              offsetX: 0,
              offsetY: 0,
              cssClass: "b-dashboard-acquisition__endpoint",
            },
            label: { text: "" },
            customSVG: {
              SVG: `<text y="0" dy=".35em" text-anchor="middle" font-family="Material Icons" font-size="12" fill="${colors[seriesIndex]}" aria-hidden="true">${icons[seriesIndex]}</text>`,
              cssClass: "b-dashboard-acquisition__endpoint",
              offsetX: 0,
              offsetY: 0,
            },
          },
        ];
      });
    },

    options() {
      return {
        annotations:
          this.has_annotaion || this.modern
            ? {
                points: [
                  ...(this.has_annotaion ? this.maxPoints : []),
                  ...this.endpointPoints,
                ],
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
          // Modern charts keep no zoom/pan/download toolbar; the footer exports the data.
          toolbar: { show: !this.modern },
          zoom: { enabled: !this.modern },

          events: this.modern
            ? {
                mounted: this.separateEndpointMarkers,
                updated: this.separateEndpointMarkers,
              }
            : undefined,

          /*  events:
            {



              dataPointMouseEnter: function(event, chartContext, config) {
                console.log('dataPointMouseEnter',event)
              },

            }
,*/
        },
        colors: ["#FFA000", "#C2185B", "#1976D2"],
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
                customHTML: ["visibility", "person_add", "history"].map(
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
          padding: this.modern
            ? { top: 14, right: 16, bottom: 12, left: 12 }
            : undefined,
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
      return [
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
    reportMetricData(key) {
      return (this.timeSeries.raw_data || []).flatMap((row) => {
        const timestamp = DateConverter.convertToLocalTime(
          row.created_at,
          true,
        )?.getTime();
        if (!Number.isFinite(timestamp)) return [];
        return [
          [
            timestamp,
            typeof row[key] === "number" && Number.isFinite(row[key])
              ? row[key]
              : null,
          ],
        ];
      });
    },
    separateEndpointMarkers(chart) {
      if (!this.modern) return;
      this.spaceMaximumLabels(chart);
      const root = chart.el;
      const markers = root.querySelectorAll(
        ".apexcharts-point-annotation-marker.b-dashboard-acquisition__endpoint",
      );
      const symbols = root.querySelectorAll(
        ".apexcharts-point-annotations-custom-svg.b-dashboard-acquisition__endpoint",
      );
      root
        .querySelectorAll(".b-dashboard-acquisition__endpoint-leader")
        .forEach((line) => line.remove());
      const positions = [];
      markers.forEach((marker, index) => {
        const x = Number(marker.getAttribute("cx"));
        const y = Number(marker.getAttribute("cy"));
        const width = chart.w.layout.gridWidth;
        const direction = x >= width / 2 ? -1 : 1;
        let offset = 0;
        // Native pixel centers keep close series readable without changing their data or y position.
        while (
          positions.some(
            (point) => Math.hypot(x + offset - point.x, y - point.y) < 24,
          )
        )
          offset += direction * 24;
        positions.push({ x: x + offset, y });
        marker.setAttribute("transform", `translate(${offset}, 0)`);
        symbols[index]?.setAttribute(
          "transform",
          `translate(${x + offset}, ${y})`,
        );
        if (offset) {
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          line.setAttribute(
            "class",
            "b-dashboard-acquisition__endpoint b-dashboard-acquisition__endpoint-leader",
          );
          line.setAttribute(
            "d",
            `M ${x} ${y} H ${x + offset - direction * 10}`,
          );
          line.setAttribute("stroke", marker.getAttribute("stroke"));
          line.setAttribute("stroke-width", "1");
          line.setAttribute("opacity", "0.55");
          line.setAttribute("fill", "none");
          line.setAttribute("aria-hidden", "true");
          marker.parentNode.insertBefore(line, marker.parentNode.firstChild);
        }
      });
    },
    spaceMaximumLabels(chart) {
      const root = chart.el;
      const labels = [
        ...root.querySelectorAll(
          ".apexcharts-point-annotation-label.b-dashboard-acquisition__maximum-label",
        ),
      ];
      root
        .querySelectorAll(".b-dashboard-acquisition__maximum-leader")
        .forEach((line) => line.remove());
      const width = chart.w.layout.gridWidth;
      if (!Number.isFinite(width) || width <= 0) return;
      labels.forEach((label) => {
        const id = [...label.classList].find((name) =>
          name.startsWith("b-dashboard-acquisition__maximum-point-"),
        );
        const background = id && root.querySelector(`rect.${id}`);
        const marker =
          id && root.querySelector(`.apexcharts-point-annotation-marker.${id}`);
        if (!background || !marker) return;
        const box = background.getBBox();
        // Keep each caption over its real peak, moving inward only to avoid clipping.
        const center = Math.max(
          box.width / 2 + 4,
          Math.min(
            width - box.width / 2 - 4,
            Number(marker.getAttribute("cx")),
          ),
        );
        const offset = center - box.x - box.width / 2;
        label.setAttribute("transform", `translate(${offset}, 0)`);
        background.setAttribute("transform", `translate(${offset}, 0)`);
        if (Math.abs(offset) < 1) return;
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        line.setAttribute("class", "b-dashboard-acquisition__maximum-leader");
        line.setAttribute(
          "d",
          `M ${marker.getAttribute("cx")} ${marker.getAttribute("cy")} L ${center} ${box.y + box.height}`,
        );
        line.setAttribute("stroke", marker.getAttribute("stroke"));
        line.setAttribute("stroke-width", "1");
        line.setAttribute("stroke-dasharray", "2 3");
        line.setAttribute("opacity", "0.35");
        line.setAttribute("fill", "none");
        line.setAttribute("aria-hidden", "true");
        marker.parentNode.insertBefore(line, marker.parentNode.firstChild);
      });
    },
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
    // Presets set the page-view range directly; Custom opens the shared date dialog.
    selectCompositionRange(item) {
      if (item.title === "time_spans.custom") {
        this.composition_dialog = true;
        return;
      }
      this.composition_range = [item.to, item.from];
      this.start_date = DateConverter.GetStartOfDateBefore(item.from);
      this.end_date = DateConverter.GetEndOfDateBefore(item.to);
    },
    applyCompositionRange({ offset, days }) {
      this.composition_range = [offset, offset + days];
      this.start_date = DateConverter.GetStartOfDateBefore(offset + days);
      this.end_date = DateConverter.GetEndOfDateBefore(offset);
    },
  },
  created() {
    if (this.modern && !this.summary)
      this.selectCompositionRange({
        title: "time_spans.last_30",
        from: 30,
        to: 0,
      });
  },
  mounted() {
    if (!this.report || this.summary || typeof ResizeObserver === "undefined")
      return;
    const root = this.$refs.reportRoot?.$el || this.$refs.reportRoot;
    if (root?.nodeType !== 1) return;
    let previousWidth = 0;
    this.report_resize_observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0 && width !== previousWidth) {
        previousWidth = width;
        this.$refs.reportFlow?.refreshChart();
      }
    });
    this.report_resize_observer.observe(root);
  },

  beforeUnmount() {
    this.report_resize_observer?.disconnect();
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-acquisition--modern.b-dashboard-acquisition--report {
  font-size: 13px;
  line-height: 1.5;

  .b-dashboard-acquisition__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }
  .sd-modern-widget {
    --sd-modern-font-body: 13px;
    --sd-modern-font-small: 12px;
    padding: 22px;
    font-size: 13px;
    line-height: 1.5;
  }
  .sd-modern-header {
    margin-block-end: 17px;
  }
  .sd-modern-title-text {
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
  }
  .sd-modern-subtitle {
    font-size: 12px;
    line-height: 18px;
  }
  .b-dashboard-acquisition__value {
    font-size: 27px;
    font-weight: 600;
    line-height: 36px;
    letter-spacing: 0;
    margin-block: 3px;
  }
  .b-dashboard-acquisition__report-plots {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 25px;
    margin-block-start: 24px;
  }
  .b-dashboard-acquisition__report-plots > section {
    min-width: 0;
  }
  .b-dashboard-acquisition__report-plots :deep(.apexcharts-toolbar) {
    --sd-report-chart-tool-size: 36px;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 4px;
    padding: 0;
    background: transparent;
    backdrop-filter: none;
  }
  .b-dashboard-acquisition__report-plots
    :deep(.apexcharts-toolbar > [class*="-icon"]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 var(--sd-report-chart-tool-size);
    width: var(--sd-report-chart-tool-size);
    height: var(--sd-report-chart-tool-size);
    padding: 0;
    margin: 0;
    border: 1px solid var(--sd-modern-border);
    border-radius: 9px;
    color: rgb(var(--v-theme-on-surface)) !important;
    background: rgb(var(--v-theme-surface));
  }
  .b-dashboard-acquisition__report-plots
    :deep(.apexcharts-toolbar > [class*="-icon"] svg) {
    width: 18px;
    height: 18px;
  }
  .b-dashboard-acquisition__report-plots
    :deep(.apexcharts-toolbar > .apexcharts-selected) {
    border-color: rgb(var(--v-theme-primary));
    background: var(--sd-modern-inset);
  }
  @media (max-width: 600px), (pointer: coarse) {
    .b-dashboard-acquisition__report-plots :deep(.apexcharts-toolbar) {
      --sd-report-chart-tool-size: 44px;
    }
  }
  .b-dashboard-acquisition__report-plots > section + section {
    padding-inline-start: 25px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  .b-dashboard-acquisition__report-plots h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .b-dashboard-acquisition__scope {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  // The ring beside its legend; the dashboard card stacks them.
  .b-dashboard-acquisition__composition-body {
    display: grid;
    grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1fr);
    align-items: center;
    gap: 16px 28px;
  }
  .b-dashboard-acquisition__composition-donut {
    margin-block: 0;
  }
  .b-dashboard-acquisition__composition-scope {
    margin-block-start: 12px;
  }
  .b-dashboard-acquisition__flow-scope {
    grid-column: 1 / -1;
    margin-block: -8px 17px;
  }
  .b-dashboard-acquisition__source {
    font-size: 12px;
  }
  .b-dashboard-acquisition__source-share {
    color: var(--sd-modern-muted);
    font-size: 11px;
    min-width: 42px;
    text-align: end;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 780px) {
    .b-dashboard-acquisition__report-plots,
    .b-dashboard-acquisition__composition-body {
      grid-template-columns: minmax(0, 1fr);
      gap: 23px;
    }
    .b-dashboard-acquisition__report-plots > section + section {
      padding-inline-start: 0;
      padding-block-start: 20px;
      border-inline-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
  @media (max-width: 520px) {
    .sd-modern-widget {
      padding: 17px 15px;
    }
    .b-dashboard-acquisition__stats {
      grid-template-columns: minmax(0, 1fr);
      gap: 15px;
    }
    .b-dashboard-acquisition__stats > div + div {
      padding-block-start: 15px;
      border-block-start: 1px solid var(--sd-modern-border);
    }
  }
}

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

  // Page-view donut: dates under the header, the ring, then every page type.
  .b-dashboard-acquisition__composition-period {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-block: -8px 4px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }

  .b-dashboard-acquisition__composition-donut {
    max-width: 380px;
    margin: 4px auto 8px;
  }

  .b-dashboard-acquisition__composition-legend {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    font-variant-numeric: tabular-nums;

    li {
      display: grid;
      grid-template-columns: 8px 16px minmax(0, 1fr) auto 44px;
      align-items: center;
      gap: 8px;
      min-height: 30px;
      border-block-start: 1px solid var(--sd-modern-border);
    }

    img {
      object-fit: contain;
    }
  }

  .b-dashboard-acquisition__composition-swatch {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .b-dashboard-acquisition__composition-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .b-dashboard-acquisition__composition-share {
    color: var(--sd-modern-muted);
    text-align: end;
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

  :deep(.b-dashboard-acquisition__endpoint) {
    pointer-events: none;
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

  // Dashboard list: dense rows; more than eight sources scroll inside the list.
  &:not(.b-dashboard-acquisition--report) .b-dashboard-acquisition__source {
    min-height: 32px;
    padding-block: 5px;
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

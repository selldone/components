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
  <div
    v-if="
      modern || (social_keys?.length > 2 && timeSeries.raw_data?.length > 5)
    "
    class="b-dashboard-channels text-start"
    :class="{ 'b-dashboard-channels--modern': modern }"
  >
    <component
      :is="modern ? 'section' : 's-widget-box'"
      :title="
        modern
          ? undefined
          : `<h5 class='align-items-center pb-1'>    <span class='circle bg-teal mx-sm' style='font-size: 6px;'></span> ${$t('admin_shop.dashboard.channels.title')}  </h5><span class='fw-normal ml-xs small'> ${$t(
              'admin_shop.dashboard.channels.subtitle',
            )} </span> `
      "
      :icon="modern ? undefined : 'diversity_1'"
      :class="modern ? 'sd-modern-widget' : 'overflow-hidden'"
    >
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain" aria-hidden="true">
            <v-icon icon="stacked_line_chart" size="20" />
          </span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.channels.title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.channel_history_help") }}
            </p>
          </div>
        </div>
      </header>
      <div
        v-if="social_keys?.length && timeSeries.raw_data?.length"
        ref="chart"
        :class="modern ? 'b-dashboard-channels__chart' : 'mx-n5'"
      >
        <!-- Native paths are drawn on creation; keep them in sync with plot size. -->
        <u-chart-funnel
          :key="modern ? `${width}-${height}` : undefined"
          id="fun-data"
          :modern="modern"
          :animated="!modern"
          :dark="modern && $vuetify.theme.current.dark"
          :colors="colors"
          direction="horizontal"
          :display-percentage="false"
          gradient-direction="vertical"
          :height="height"
          :labels="labels"
          :sub-label-images="subLabelImages"
          :sub-labels="subLabels"
          :values="values"
          :width="width"
          class="mt-3"
          :hover-opacity-effect="!modern"
        />
      </div>
      <!-- Day details live in the chart's hover; below it, what the period says about each channel. -->
      <section
        v-if="modern && social_keys?.length && timeSeries.raw_data?.length"
        class="b-dashboard-channels__insights"
      >
        <dl class="sd-modern-stat-grid b-dashboard-channels__kpis">
          <div>
            <dt class="sd-modern-label">
              {{ $t("admin_shop.dashboard.modern.channel_insights_sessions") }}
            </dt>
            <dd class="b-dashboard-channels__kpi-value">
              {{ numeralFormat(channel_total, "0,0.[0]a") }}
            </dd>
            <dd class="b-dashboard-channels__kpi-note">
              <template v-if="total_comparison.available">
                <up-down-icon :value="total_comparison.value ?? 1" small />
                <span>{{ comparisonText(total_comparison) }}</span>
              </template>
            </dd>
          </div>
          <div v-if="top_channel">
            <dt class="sd-modern-label">
              {{ $t("admin_shop.dashboard.modern.channel_insights_top") }}
            </dt>
            <dd
              class="b-dashboard-channels__kpi-value b-dashboard-channels__source"
            >
              <img :src="top_channel.image" width="20" height="20" alt="" />{{
                top_channel.label
              }}
            </dd>
            <dd class="b-dashboard-channels__kpi-note">
              {{ percent(top_channel.value / channel_total) }} ·
              {{ numeralFormat(top_channel.value, "0,0.[0]a") }}
            </dd>
          </div>
          <div>
            <dt class="sd-modern-label">
              {{ $t("admin_shop.dashboard.modern.channel_insights_rising") }}
            </dt>
            <template v-if="rising_channel">
              <dd
                class="b-dashboard-channels__kpi-value b-dashboard-channels__source"
              >
                <img
                  :src="rising_channel.image"
                  width="20"
                  height="20"
                  alt=""
                />{{ rising_channel.label }}
              </dd>
              <dd class="b-dashboard-channels__kpi-note">
                <up-down-icon :value="1" small />
                <span>{{ comparisonText(rising_channel.comparison) }}</span>
              </dd>
            </template>
            <dd v-else class="b-dashboard-channels__kpi-note">
              {{ $t("admin_shop.dashboard.modern.channel_insights_none") }}
            </dd>
          </div>
          <div v-if="peak_day">
            <dt class="sd-modern-label">
              {{ $t("admin_shop.dashboard.modern.channel_insights_peak") }}
            </dt>
            <dd class="b-dashboard-channels__kpi-value">
              {{ getLocalTimeString(peak_day.date, false, true) }}
            </dd>
            <dd class="b-dashboard-channels__kpi-note">
              {{ numeralFormat(peak_day.total, "0,0") }}
              {{ $t("global.commons.sessions") }}
            </dd>
          </div>
        </dl>
        <div class="b-dashboard-channels__insight-grid">
          <section>
            <header class="b-dashboard-channels__insight-head">
              <h3 class="sd-modern-eyebrow">
                {{ $t("admin_shop.dashboard.modern.channel_insights_share") }}
              </h3>
            </header>
            <u-chart-donut-leader
              :slices="share_slices"
              :unit="$t('global.commons.sessions')"
              class="b-dashboard-channels__donut"
            />
            <ul class="b-dashboard-channels__shares">
              <li v-for="slice in share_slices" :key="slice.key">
                <span
                  class="b-dashboard-channels__swatch"
                  :style="{ background: slice.color }"
                  aria-hidden="true"
                />
                <span class="b-dashboard-channels__source"
                  ><img
                    v-if="slice.image"
                    :src="slice.image"
                    width="16"
                    height="16"
                    alt=""
                  />{{ slice.label }}</span
                >
                <span class="b-dashboard-channels__muted">{{
                  numeralFormat(slice.value, "0,0.[0]a")
                }}</span>
                <span>{{ percent(slice.share) }}</span>
                <span
                  v-if="
                    slice.comparison?.available &&
                    slice.comparison.value !== null
                  "
                  class="b-dashboard-channels__change"
                  :title="comparisonText(slice.comparison)"
                  ><up-down-icon :value="slice.comparison.value" small />{{
                    numeralFormat(Math.abs(slice.comparison.value), "0.[0]")
                  }}%</span
                >
                <span v-else class="b-dashboard-channels__muted">—</span>
              </li>
            </ul>
          </section>
          <section class="sd-modern-chart-colors">
            <header class="b-dashboard-channels__insight-head">
              <h3 class="sd-modern-eyebrow">
                {{ $t("admin_shop.dashboard.modern.channel_insights_daily") }}
              </h3>
              <span class="b-dashboard-channels__key" aria-hidden="true"
                ><i class="-solid" />{{ $t("global.commons.sessions")
                }}<i class="-dashed" />{{
                  $t("admin_shop.dashboard.modern.channel_insights_average")
                }}</span
              >
            </header>
            <apexchart
              :key="chart_theme_key"
              :options="daily_options"
              :series="daily_series"
              :aria-label="
                $t('admin_shop.dashboard.modern.channel_insights_daily')
              "
              height="250"
              type="line"
              width="100%"
            />
          </section>
        </div>
      </section>
      <u-chart-placeholder
        v-else-if="modern"
        kind="stream"
        :text="$t('admin_shop.dashboard.modern.channel_history_empty')"
        :min-height="height"
        class="b-dashboard-channels__empty"
      />
    </component>
  </div>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UChartFunnel from "@selldone/components-vue/ui/chart/funnel/UChartFunnel.vue";
import { Brands } from "@selldone/core-js/enums/social/Brands.ts";
import { colorSet3, ShadeColor } from "@selldone/core-js/helper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import directIcon from "../../../../assets/icons/direct-enter.svg";
import defaultSourceIcon from "../../../../assets/trademark/default.svg";
import UpDownIcon from "../../../../ui/icon/UpDownIcon.vue";
import UChartDonutLeader from "../../../../ui/chart/donut-leader/UChartDonutLeader.vue";
import UChartPlaceholder from "../../../../ui/chart/placeholder/UChartPlaceholder.vue";
import { foldSlices } from "../../../../ui/chart/donut-leader/donutSlices.ts";
import { getPeriodComparison } from "../performance/periodComparison.ts";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import numeral from "numeral";

export default {
  name: "BDashboardShopChannels",
  mixins: [DateMixin, CurrencyMixin],
  components: {
    UChartFunnel,
    UChartDonutLeader,
    UChartPlaceholder,
    UpDownIcon,
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

  mounted() {
    this.revealLatestDay();
  },

  watch: {
    // New data, a size remount (chart key) and a direction flip (resets the scroll) can each
    // move the latest day out of view.
    values: { handler: "revealLatestDay", flush: "post" },
    height: { handler: "revealLatestDay", flush: "post" },
    "$vuetify.locale.isRtl": { handler: "revealLatestDay", flush: "post" },
  },

  computed: {
    // ━━━━━━━━━━ Insights: the period by channel ━━━━━━━━━━
    channels() {
      return this.social_keys.map((key, index) => ({
        key,
        label: this.subLabels[index],
        image: this.subLabelImages[index],
        // The same color as the channel's band in the chart above.
        color: this.colors[index % this.colors.length][0],
        value: this.values.reduce((sum, day) => sum + (day[index] || 0), 0),
        comparison: getPeriodComparison(this.timeSeries, (row) =>
          Number(row.social?.[key] || 0),
        ),
      }));
    },
    channel_total() {
      return this.channels.reduce((sum, channel) => sum + channel.value, 0);
    },
    total_comparison() {
      return getPeriodComparison(this.timeSeries, (row) =>
        this.social_keys.reduce(
          (sum, key) => sum + Number(row.social?.[key] || 0),
          0,
        ),
      );
    },
    top_channel() {
      const top = [...this.channels].sort((a, b) => b.value - a.value)[0];
      return top?.value > 0 ? top : null;
    },
    // The largest recorded rise among channels that matter (at least 2% of the sessions).
    rising_channel() {
      return (
        this.channels
          .filter(
            (channel) =>
              channel.comparison.available &&
              channel.comparison.value > 0 &&
              channel.value >= 0.02 * this.channel_total,
          )
          .sort((a, b) => b.comparison.value - a.comparison.value)[0] || null
      );
    },
    daily_totals() {
      return (this.timeSeries.raw_data || []).map((row, index) => ({
        date: row.created_at,
        total: (this.values[index] || []).reduce(
          (sum, value) => sum + value,
          0,
        ),
      }));
    },
    peak_day() {
      const peak = [...this.daily_totals].sort((a, b) => b.total - a.total)[0];
      return peak?.total > 0 ? peak : null;
    },
    share_slices() {
      return foldSlices(this.channels, (count) =>
        this.$t("admin_shop.dashboard.modern.channel_insights_more", { count }),
      );
    },
    daily_series() {
      const points = this.daily_totals.map((day) => [
        DateConverter.convertToLocalTime(day.date)?.getTime(),
        day.total,
      ]);
      // Trailing average of up to seven recorded days, from the seventh day on.
      const average = points.map(([time], index) => {
        if (index < 6) return [time, null];
        const week = points.slice(index - 6, index + 1);
        return [
          time,
          Math.round(week.reduce((sum, [, value]) => sum + value, 0) / 7),
        ];
      });
      return [
        {
          name: this.$t("global.commons.sessions"),
          type: "area",
          data: points,
        },
        {
          name: this.$t("admin_shop.dashboard.modern.channel_insights_average"),
          type: "line",
          data: average,
        },
      ];
    },
    chart_theme_key() {
      return this.$vuetify.theme.name + "-" + this.$i18n.locale;
    },
    daily_options() {
      const colors = this.$vuetify.theme.current.colors;
      const muted = this.$vuetify.theme.current.dark ? "#a6a9b2" : "#6b6f78";
      return {
        chart: {
          type: "line",
          background: "transparent",
          fontFamily: "inherit",
          toolbar: { show: false },
          zoom: { enabled: false },
          // No entry tween: Apex writes NaN paths when it animates series with gaps.
          animations: { enabled: false },
          parentHeightOffset: 0,
        },
        theme: { mode: this.$vuetify.theme.current.dark ? "dark" : "light" },
        colors: [colors.primary, muted],
        stroke: { curve: "smooth", width: [2, 2], dashArray: [0, 5] },
        fill: {
          type: ["gradient", "solid"],
          gradient: { opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 100] },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        markers: { size: 0, hover: { size: 4 } },
        grid: {
          borderColor: "rgba(127, 127, 127, 0.18)",
          strokeDashArray: 4,
          padding: { left: 4, right: 8 },
        },
        xaxis: {
          type: "datetime",
          labels: {
            datetimeUTC: false,
            style: { colors: muted, fontSize: "11px" },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: muted, fontSize: "11px" },
            formatter: (value) => numeral(value).format("0.[0]a"),
          },
        },
        tooltip: {
          shared: true,
          x: { formatter: (value) => this.getLocalDateString(new Date(value)) },
          y: {
            formatter: (value) =>
              value == null ? "—" : numeral(value).format("0,0"),
          },
        },
      };
    },
    // ━━━━━━━━━━ Chart ━━━━━━━━━━
    socials() {
      return this.timeSeries.socialTotalKeys();
    },

    social_keys() {
      return Object.keys(this.socials);
    },
    subLabels() {
      return this.social_keys.map((key) => this.getName(key));
    },
    subLabelImages() {
      return this.social_keys.map((key) => {
        const found = Brands.find(
          (item) => item.name.toLowerCase() === key.toLowerCase(),
        );

        return (
          found?.icon ||
          (this.modern
            ? key.toLowerCase() === "direct"
              ? directIcon
              : defaultSourceIcon
            : undefined)
        );
      });
    },

    labels() {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          out.push(this.getLocalTimeString(item.created_at, false, true));
        });

      return out;
    },

    values() {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          const social = item.social;

          let _arr = [];

          this.social_keys.forEach((_key) => {
            let _value = social && social[_key] ? social[_key] : 0;

            _arr.push(this.truncate(_value, 0));
          });

          out.push(_arr);
        });

      return out;
    },

    height() {
      if (this.modern) return this.$vuetify.display.smAndDown ? 260 : 300;
      return 150 + this.social_keys.length * 30;
    },
    width() {
      if (!this.timeSeries.raw_data) return 500;
      const days = this.timeSeries.raw_data.length;
      const width = 500 + 45 * days;
      return this.modern ? Math.min(width, Math.max(640, 56 * days)) : width;
    },
    colors() {
      return colorSet3.map((color) => [color, ShadeColor(color, -20)]);
    },
  },
  methods: {
    percent(fraction) {
      return `${numeral(100 * (fraction || 0)).format("0.[0]")}%`;
    },
    comparisonText(comparison) {
      const change = comparison.new_activity
        ? this.$t("admin_shop.dashboard.modern.new_activity")
        : `${numeral(Math.abs(comparison.value ?? 0)).format("0.[0]")}%`;
      return `${change} ${this.$t(
        comparison.days === 1
          ? "admin_shop.dashboard.modern.comparison_previous_day"
          : "admin_shop.dashboard.modern.comparison_previous_days",
        { days: comparison.days },
      )}`;
    },
    // Keep the latest day visible in the scrolling chart.
    revealLatestDay() {
      const container = this.$refs.chart?.querySelector(
        ".u--chart-funnel > .--container",
      );
      const days = container?.querySelectorAll(".--segment-container");
      const day = days?.[days.length - 1];
      if (!day) return;
      const view = container.getBoundingClientRect();
      const rect = day.getBoundingClientRect();
      if (rect.left < view.left) container.scrollLeft -= view.left - rect.left;
      else if (rect.right > view.right)
        container.scrollLeft += rect.right - view.right;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.b-dashboard-channels--modern {
  min-width: 0;

  .sd-modern-title-text {
    font-weight: 500;
  }

  // Insights under the chart: four figures, then shares beside the daily trend.
  .b-dashboard-channels__insights {
    margin-block-start: 16px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-dashboard-channels__kpis {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin: 0 0 24px;
    padding: 0;
    border: 0;

    dd {
      margin: 0;
    }
  }

  .b-dashboard-channels__kpi-value {
    margin-block: 6px 4px !important;
    font-size: 22px;
    font-weight: 500;
    line-height: 1.3;
    font-variant-numeric: tabular-nums;
  }

  .b-dashboard-channels__kpi-value.b-dashboard-channels__source {
    font-size: 18px;
  }

  .b-dashboard-channels__kpi-note {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 18px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .b-dashboard-channels__source {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .b-dashboard-channels__source > img {
    flex: 0 0 auto;
    object-fit: contain;
  }

  .b-dashboard-channels__insight-grid {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 28px;
  }

  .b-dashboard-channels__insight-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin-block-end: 8px;
  }

  .b-dashboard-channels__key {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--sd-modern-muted);
    font-size: 11px;

    i {
      width: 16px;
      margin-inline-start: 8px;
      border-block-start: 2px solid rgb(var(--v-theme-primary));
    }

    i.-dashed {
      border-block-start: 2px dashed var(--sd-modern-muted);
    }
  }

  .b-dashboard-channels__donut {
    max-width: 380px;
    margin: 0 auto 8px;
  }

  .b-dashboard-channels__shares {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    font-variant-numeric: tabular-nums;

    li {
      display: grid;
      grid-template-columns: 8px minmax(0, 1fr) auto 44px 56px;
      align-items: center;
      gap: 8px;
      min-height: 30px;
      border-block-start: 1px solid var(--sd-modern-border);

      > :nth-child(n + 3) {
        text-align: end;
      }
    }
  }

  .b-dashboard-channels__swatch {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .b-dashboard-channels__muted {
    color: var(--sd-modern-muted);
  }

  .b-dashboard-channels__change {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    font-size: 12px;
  }

  // Smart invert: the key's sample line keeps the chart's own colors.
  .smart-invert & .b-dashboard-channels__key i {
    filter: invert(1);
  }

  @media (max-width: 960px) {
    .b-dashboard-channels__kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .b-dashboard-channels__insight-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .b-dashboard-channels__chart {
    min-width: 0;
    margin-inline: -8px;
  }

  :deep(.u--chart-funnel) {
    width: var(--width);
    max-width: 100%;
  }

  // Long ranges keep their day width and scroll inside the card.
  :deep(.u--chart-funnel.-modern > .--container) {
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  // The scroll edge would clip an outside focus ring.
  :deep(.u--chart-funnel.-modern .--segment-container:focus-visible) {
    outline-offset: -2px;
  }

  :deep(.u--chart-funnel > .--legend) {
    gap: 8px 20px;
    margin-block: 12px 8px;
    font-size: 12px;
  }

  :deep(.u--chart-funnel .--l-item-title) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  :deep(.u--chart-funnel .--l-item-title img) {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  :deep(.u--chart-funnel .--l-item) {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 400;
  }

  :deep(.u--chart-funnel .--label-value),
  :deep(.u--chart-funnel .--label-title) {
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
  }

  :deep(.u--chart-funnel .--label-value) {
    font-size: 13px;
    font-weight: 400;
  }

  :deep(.u--chart-funnel .u--hover-label .--label) {
    font-size: 12px;
  }

  :deep(.u--chart-funnel .u--hover-container) {
    color: rgb(var(--v-theme-on-surface));
    background: rgba(var(--v-theme-surface), 0.96);
    border-color: var(--sd-modern-border);
    text-shadow: none;
  }

  :deep(.u--chart-funnel .u--hover-container .--percent) {
    color: rgb(var(--v-theme-on-surface));
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-dashboard-channels--modern :deep(.u--chart-funnel .t-all-400) {
    transition: none !important;
  }
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

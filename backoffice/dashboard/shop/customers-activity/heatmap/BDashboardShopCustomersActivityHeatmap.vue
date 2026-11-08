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

<!--
  When customers are active: one activity at a time on a weekday × hour grid, each cell shaded
  by its count in that activity's color. The details disclosure keeps every exact counter
  reachable by keyboard.
-->
<template>
  <div
    v-intersect.once="onIntersect"
    class="b-customer-activity-heatmap text-start"
    :class="{ 'b-customer-activity-heatmap--report': report }"
  >
    <v-btn-toggle
      v-model="key_selected"
      :aria-label="$t('shop_crm_report.activity_type')"
      class="sd-modern-segmented b-customer-activity-heatmap__types"
      mandatory
      variant="text"
    >
      <v-btn
        v-for="item in keys"
        :key="item.code"
        :value="item.code"
        size="small"
      >
        <img :src="item.image" width="18" height="18" alt="" />
        {{ activityLabel(item) }}
      </v-btn>
    </v-btn-toggle>
    <div v-if="fetch_error" class="sd-modern-notice" role="alert">
      <v-icon size="18" aria-hidden="true">error_outline</v-icon>
      <span>{{ $t("shop_crm_report.activity_error") }}</span>
      <v-btn
        class="sd-modern-button"
        variant="text"
        @click="fetchActivityTimeline"
      >
        {{ $t("geo_map.live.retry") }}
      </v-btn>
    </div>
    <template v-else-if="!busy && series">
      <u-chart-placeholder
        v-if="!max_value"
        kind="bars"
        :title="$t('admin_shop.dashboard.modern.placeholder_title')"
        :text="$t('shop_crm_report.placeholder_activity')"
        :min-height="260"
      />
      <template v-else>
        <!-- Cells and key swatches share the country map's colors, so Smart invert treats them alike. -->
        <div dir="ltr">
          <apexchart
            :key="chart_key"
            :options="chartOptions"
            :series="series"
            :height="report ? 320 : 280"
            type="heatmap"
          />
        </div>
        <div class="b-customer-activity-heatmap__key" aria-hidden="true">
          <span>{{ $t("shop_crm_report.fewer") }}</span>
          <span
            v-for="range in heat_ranges.slice(1)"
            :key="range.from"
            class="b-customer-activity-heatmap__swatch"
            :style="{ background: range.color }"
          />
          <span>{{ $t("shop_crm_report.more") }}</span>
        </div>
      </template>
    </template>
    <u-loading-ellipsis
      v-else
      class="ma-auto"
      height="320px"
    ></u-loading-ellipsis>
    <details
      v-if="timeline && !fetch_error"
      class="b-customer-activity-heatmap__details"
    >
      <summary>{{ $t("shop_crm_report.inspect_hourly") }}</summary>
      <div class="b-customer-activity-heatmap__inspectors">
        <label>
          {{ $t("shop_crm_report.weekday") }}
          <select v-model.number="selected_day">
            <option v-for="day in days" :key="day.day" :value="day.day">
              {{ $t(day.name) }}
            </option>
          </select>
        </label>
        <label>
          {{ $t("shop_crm_report.recorded_hour") }}
          <select v-model.number="selected_hour">
            <option v-for="hour in 24" :key="hour" :value="hour - 1">
              {{ hourLabel(hour - 1) }}
            </option>
          </select>
        </label>
      </div>
      <dl aria-live="polite" class="b-customer-activity-heatmap__counts">
        <div v-for="item in keys" :key="item.code">
          <dt>
            <img :src="item.image" width="16" height="16" alt="" />{{
              activityLabel(item)
            }}
          </dt>
          <dd>{{ $n(hourly_counts[item.code]) }}</dd>
        </div>
      </dl>
      <p class="sd-modern-help">{{ $t("shop_crm_report.activity_help") }}</p>
    </details>
  </div>
</template>

<script lang="ts">
import ULoadingEllipsis from "../../../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import UChartPlaceholder from "../../../../../ui/chart/placeholder/UChartPlaceholder.vue";
import { UserActivityKeys } from "@selldone/core-js/enums/user/UserActivityKeys";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { mix } from "chroma-js";

// Four steps of the activity's color over the surface; zero cells stay neutral.
const HEAT_STEPS = [0.22, 0.42, 0.66, 1];

export default {
  name: "BDashboardShopCustomersActivityHeatmap",
  components: {
    ULoadingEllipsis,
    UChartPlaceholder,
  },
  props: {
    modern: Boolean,
    report: Boolean,
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    timeline: null,
    busy: false,
    fetch_error: false,
    selected_day: 0,
    selected_hour: 0,

    key_selected: "products_views",
    keys: UserActivityKeys,

    days: [
      { day: 0, name: WeekDays.Sunday.name },
      { day: 1, name: WeekDays.Monday.name },
      { day: 2, name: WeekDays.Tuesday.name },
      { day: 3, name: WeekDays.Wednesday.name },
      { day: 4, name: WeekDays.Thursday.name },
      { day: 5, name: WeekDays.Friday.name },
      { day: 6, name: WeekDays.Saturday.name },
    ],
  }),

  computed: {
    selected_key() {
      return (
        this.keys.find((item) => item.code === this.key_selected) ||
        this.keys[0]
      );
    },
    hourly_counts() {
      return Object.fromEntries(
        this.keys.map((item) => [
          item.code,
          this.countAt(this.selected_day, this.selected_hour, item.code),
        ]),
      );
    },
    max_value() {
      return Math.max(
        0,
        ...(this.timeline || []).map(
          (row) => Number(row[this.key_selected]) || 0,
        ),
      );
    },
    theme_colors() {
      const theme = this.$vuetify.theme;
      // Vuetify generates on-surface in the resolved theme, not every raw theme.
      const colors =
        theme.computedThemes?.[theme.name]?.colors || theme.current.colors;
      const surface =
        colors.surface || (theme.current.dark ? "#212121" : "#FFFFFF");
      const onSurface =
        colors["on-surface"] || (theme.current.dark ? "#FFFFFF" : "#000000");
      return {
        surface,
        onSurface,
        empty: mix(surface, onSurface, 0.045).hex(),
      };
    },
    // Count ranges of the grid: zero, then four equal bands up to the busiest cell.
    heat_ranges() {
      const ranges = [{ from: 0, to: 0, color: this.theme_colors.empty }];
      let from = 1;
      HEAT_STEPS.forEach((step, index) => {
        const to = Math.ceil(
          (this.max_value * (index + 1)) / HEAT_STEPS.length,
        );
        if (to < from) return;
        ranges.push({
          from,
          to,
          color: mix(
            this.theme_colors.surface,
            this.selected_key.color,
            step,
          ).hex(),
        });
        from = to + 1;
      });
      return ranges;
    },
    chart_key() {
      return `${this.key_selected}:${this.$vuetify.theme.name}:${this.$i18n?.locale}`;
    },
    chartOptions() {
      const label = {
        fontSize: "12px",
        fontWeight: 400,
        fontFamily: "var(--font)",
      };
      const hourTicks = (step) => ({
        xaxis: { labels: { formatter: (value) => this.hourTick(value, step) } },
      });
      return {
        chart: {
          type: "heatmap",
          background: "transparent",
          fontFamily: "var(--font)",
          foreColor: this.theme_colors.onSurface,
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: false },
          redrawOnParentResize: true,
        },
        theme: { mode: this.$vuetify.theme.current.dark ? "dark" : "light" },
        colors: [this.selected_key.color],
        plotOptions: {
          heatmap: {
            radius: 3,
            enableShades: false,
            colorScale: { ranges: this.heat_ranges },
          },
        },
        dataLabels: { enabled: false },
        stroke: { width: 2, colors: [this.theme_colors.surface] },
        legend: { show: false },
        grid: {
          show: false,
          padding: { top: 0, right: 8, bottom: 0, left: 8 },
        },
        xaxis: {
          type: "category",
          tickPlacement: "on",
          axisBorder: { show: false },
          axisTicks: { show: false },
          tooltip: { enabled: false },
          labels: {
            rotate: 0,
            rotateAlways: false,
            hideOverlappingLabels: false,
            trim: false,
            formatter: (value) => this.hourTick(value, 4),
            style: label,
          },
          title: {
            text: this.$t("shop_crm_report.recorded_hour"),
            style: { fontSize: "11px", fontWeight: 400 },
          },
        },
        yaxis: { labels: { style: label } },
        tooltip: {
          theme: this.$vuetify.theme.current.dark ? "dark" : "light",
          x: { formatter: (value) => this.hourLabel(Number(value)) },
          y: { formatter: (value) => this.$n(value) },
        },
        responsive: [
          { breakpoint: 600, options: hourTicks(6) },
          { breakpoint: 380, options: hourTicks(8) },
        ],
      };
    },
    // Apex draws the first series at the bottom; the week reads Sunday to Saturday from the top.
    series() {
      if (!this.timeline) return null;
      return [...this.days].reverse().map((day) => ({
        name: this.$t(day.name),
        data: Array.from({ length: 24 }, (_, hour) => ({
          x: String(hour).padStart(2, "0"),
          y: this.countAt(day.day, hour, this.key_selected),
        })),
      }));
    },
  },

  methods: {
    activityLabel(item) {
      return this.$t(
        item.code === "buys" ? "shop_crm_report.purchase_actions" : item.name,
      );
    },
    countAt(day, hour, key) {
      const record = this.timeline?.find(
        (item) => item.day === day && item.hour === hour,
      );
      const value = Number(record?.[key]);
      return Number.isFinite(value) ? value : 0;
    },
    hourLabel(hour) {
      return (
        String(hour).padStart(2, "0") +
        ":00–" +
        String(hour).padStart(2, "0") +
        ":59"
      );
    },
    hourTick(value, step) {
      const hour = Number(value);
      return Number.isInteger(hour) && hour % step === 0
        ? String(hour).padStart(2, "0") + ":00"
        : "";
    },

    onIntersect(isIntersecting) {
      if (isIntersecting) {
        this.fetchActivityTimeline();
      }
    },

    fetchActivityTimeline() {
      this.busy = true;
      this.fetch_error = false;
      axios
        .get(window.API.GET_SHOP_STATISTIC_TIMELINE(this.shop.id))
        .then(({ data }) => {
          this.timeline = data.timeline;
        })
        .catch(() => {
          this.fetch_error = true;
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-customer-activity-heatmap {
  min-width: 0;
  font-family: inherit;
  font-size: 13px;

  .b-customer-activity-heatmap__types {
    margin-block-end: 14px;
  }

  .b-customer-activity-heatmap__key {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;

    > span:first-child {
      margin-inline-end: 4px;
    }
    > span:last-child {
      margin-inline-start: 4px;
    }
  }

  .b-customer-activity-heatmap__swatch {
    width: 18px;
    height: 8px;
    border-radius: 2px;
  }

  .b-customer-activity-heatmap__details {
    margin-block-start: 12px;
    font-size: 12px;

    summary {
      width: fit-content;
      padding-block: 8px;
      color: var(--sd-modern-muted);
    }
  }

  .b-customer-activity-heatmap__inspectors {
    display: flex;
    gap: 12px 20px;
    flex-wrap: wrap;
    margin-block: 8px 12px;

    label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    select {
      padding: 6px 0;
      min-height: 36px;
      color: inherit;
      font: inherit;
      border: 0;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    option {
      background: rgb(var(--v-theme-surface));
    }
  }

  .b-customer-activity-heatmap__counts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 22px;
    margin: 0 0 10px;

    > div {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    dt {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--sd-modern-muted);
    }
    dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
  }

  :deep(.apexcharts-tooltip) {
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    border-color: var(--sd-modern-border);
    border-radius: 10px;
    font-family: inherit;
  }

  @media (max-width: 600px), (pointer: coarse) {
    .b-customer-activity-heatmap__inspectors select {
      min-height: 44px;
      font-size: 16px;
    }
  }
}
</style>

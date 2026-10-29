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
  <div
    v-intersect.once="onIntersect"
    class="b-customer-activity-heatmap text-start"
    :class="{
      'b-customer-activity-heatmap--modern': modern,
      'b-customer-activity-heatmap--report': modern && report,
    }"
  >
    <div v-if="modern" class="b-customer-activity-heatmap__filters">
      <label v-for="item in keys" :key="item.code">
        <input v-model="keys_selected" type="checkbox" :value="item.code" />
        <img :src="item.image" width="18" height="18" alt="" />
        <span>{{ activityLabel(item) }}</span>
      </label>
    </div>
    <v-btn-toggle
      v-else
      v-model="keys_selected"
      class="mb-3"
      multiple
      rounded="xl"
      style="height: 64px"
      variant="flat"
    >
      <v-btn
        v-for="item in keys"
        :key="item.code"
        :title="$t(item.name)"
        :value="item.code"
        size="small"
        stacked
      >
        <img :src="item.image" class="mx-2" width="24px" />
        <div class="mt-1 tnt">
          <v-icon
            :color="keys_selected.includes(item.code) ? item.color : '#333'"
            class="me-1"
            size="10"
            >circle
          </v-icon>
          {{ $t(item.name) }}
        </div>
      </v-btn>
    </v-btn-toggle>
    <div v-if="modern && fetch_error" class="sd-modern-notice" role="alert">
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
    <apexchart
      v-else-if="!busy && series"
      :key="modern ? $vuetify.theme.current.dark : 'legacy'"
      :options="chartOptions"
      :series="series"
      :height="modern && report ? 350 : modern ? 300 : 350"
      type="bubble"
    />
    <u-loading-ellipsis
      v-else
      class="ma-auto"
      height="350px"
    ></u-loading-ellipsis>
    <details
      v-if="modern && timeline && !fetch_error"
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
import { UserActivityKeys } from "@selldone/core-js/enums/user/UserActivityKeys";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";

export default {
  name: "BDashboardShopCustomersActivityHeatmap",
  components: {
    ULoadingEllipsis,
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

    keys_selected: ["products_views", "add_baskets", "remove_baskets", "buys"],
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
    hourly_counts() {
      const record = this.timeline?.find(
        (item) =>
          item.day === this.selected_day && item.hour === this.selected_hour,
      );
      return Object.fromEntries(
        this.keys.map((item) => [item.code, record?.[item.code] ?? 0]),
      );
    },
    colors() {
      let out = [];
      UserActivityKeys.filter((item) =>
        this.keys_selected.includes(item.code),
      ).forEach((item) => out.push(item.color));
      return out;
    },
    chartOptions() {
      return {
        chart: {
          height: 350,
          type: "bubble",
          fontFamily: "var(--font)",
          ...(this.modern
            ? {
                foreColor:
                  this.$vuetify.theme.computedThemes?.[this.$vuetify.theme.name]
                    ?.colors?.["on-surface"] ||
                  this.$vuetify.theme.current.colors["on-surface"] ||
                  (this.$vuetify.theme.current.dark ? "#FFFFFF" : "#000000"),
                animations: { enabled: false },
              }
            : {}),
        },
        ...(this.modern
          ? {
              theme: {
                mode: this.$vuetify.theme.current.dark ? "dark" : "light",
              },
              tooltip: {
                theme: this.$vuetify.theme.current.dark ? "dark" : "light",
                ...(this.report
                  ? {
                      x: {
                        formatter: (value) =>
                          this.hourLabel(Math.round(Number(value))),
                      },
                    }
                  : {}),
              },
            }
          : {}),
        colors: this.colors,

        legend: {
          show: true,
          position: "bottom",
          horizontalAlign: "center",

          offsetX: 0,
          offsetY: 0,
        },

        dataLabels: {
          enabled: false,
        },
        fill: {
          opacity: 0.8,
        },
        grid: {
          borderColor: this.modern
            ? "rgba(var(--v-theme-on-surface), .10)"
            : "rgba(0,0,0,0.3)",
          strokeDashArray: this.modern ? 3 : 7,

          xaxis: {
            lines: {
              show: !(this.modern && this.report),
            },
          },

          padding: {
            top: this.modern && this.report ? 52 : 10,
            right: 10,
            bottom: 20,
            left: 10,
          },
        },

        xaxis: {
          min: -1,
          max: 24,
          rotate: -45,
          rotateAlways: false,
          type: "numeric",
          forceNiceScale: true,
          // Keep hourly positions exact while the formatter reduces visible labels.
          tickAmount: this.modern && this.report ? 25 : 12,
          labels: {
            hideOverlappingLabels: true,
            formatter: (value) => {
              if (this.modern && this.report)
                return this.reportHourLabel(value, 4);
              if (value < 0 || value > 23) return "";
              let i = Math.round(value);
              return (i % 12 || 12) + (i < 12 ? "AM" : "PM");
            },

            offsetX: 0,
            offsetY: 0,
            ...(this.modern && this.report
              ? {
                  rotate: 0,
                  rotateAlways: false,
                  trim: false,
                  style: {
                    fontSize: "12px",
                    fontWeight: 400,
                    fontFamily: "var(--font)",
                  },
                }
              : {}),
          },
          ...(this.modern
            ? {
                title: {
                  text: this.$t("shop_crm_report.recorded_hour"),
                  style: { fontSize: "11px", fontWeight: 400 },
                },
              }
            : {}),
        },

        yaxis: {
          type: "numeric",
          reversed: true,
          min: 0,
          max: 6,
          tickAmount: this.modern && this.report ? 6 : 7,
          decimalsInFloat: 0,
          floating: false,
          forceNiceScale: true,
          labels: {
            ...(this.modern && this.report
              ? {
                  minWidth: 60,
                  maxWidth: 74,
                  style: {
                    fontSize: "12px",
                    fontWeight: 400,
                    fontFamily: "var(--font)",
                  },
                }
              : {}),
            formatter: (value) => {
              value = Math.round(value);
              return this.days[value] ? this.$t(this.days[value].name) : value;
            },
          },
        },
        ...(this.modern && this.report
          ? {
              responsive: [
                {
                  breakpoint: 380,
                  options: {
                    chart: { height: 400 },
                    grid: { padding: { top: 104 } },
                    xaxis: {
                      labels: {
                        formatter: (value) => this.reportHourLabel(value, 8),
                      },
                    },
                  },
                },
                {
                  breakpoint: 600,
                  options: {
                    chart: { height: 400 },
                    grid: { padding: { top: 104 } },
                    xaxis: {
                      labels: {
                        formatter: (value) => this.reportHourLabel(value, 6),
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      };
    },
    series() {
      if (!this.timeline) return null;

      let out = [];
      UserActivityKeys.filter((item) =>
        this.keys_selected.includes(item.code),
      ).forEach((item) => {
        out.push({
          name: this.activityLabel(item),
          data: this.getDataSeries(item.code),
        });
      });

      return out;
    },
  },

  created() {},
  methods: {
    activityLabel(item) {
      return this.$t(
        this.modern && item.code === "buys"
          ? "shop_crm_report.purchase_actions"
          : item.name,
      );
    },
    hourLabel(hour) {
      return (
        String(hour).padStart(2, "0") +
        ":00–" +
        String(hour).padStart(2, "0") +
        ":59"
      );
    },
    reportHourLabel(value, step) {
      const numeric = Number(value),
        hour = Math.round(numeric);
      if (
        !Number.isFinite(numeric) ||
        Math.abs(numeric - hour) > 0.000001 ||
        hour < 0 ||
        hour > 23 ||
        hour % step !== 0
      )
        return "";
      return String(hour).padStart(2, "0") + ":00";
    },
    getDataSeries(key) {
      let series = [];
      this.days.forEach((item_day) => {
        let i = 0;
        while (i < 24) {
          const item = this.timeline.find(
            (item) => item.day === item_day.day && item.hour === i,
          );
          if (item && item[key]) series.push([item.hour, item.day, item[key]]);

          i++;
        }
      });

      return series;
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
.b-customer-activity-heatmap--modern.b-customer-activity-heatmap--report {
  :deep(.apexcharts-toolbar) {
    --sd-report-chart-tool-size: 36px;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 4px;
    padding: 0;
    background: transparent;
    backdrop-filter: none;
  }
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
  :deep(.apexcharts-toolbar > [class*="-icon"] svg) {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
  :deep(.apexcharts-toolbar > .apexcharts-selected) {
    border-color: rgb(var(--v-theme-primary));
    background: var(--sd-modern-inset);
  }
  @media (max-width: 600px), (pointer: coarse) {
    :deep(.apexcharts-toolbar) {
      --sd-report-chart-tool-size: 44px;
    }
  }
}
.b-customer-activity-heatmap--modern {
  min-width: 0;
  font-family: inherit;
  font-size: 13px;

  .b-customer-activity-heatmap__filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 18px;
    margin-block-end: 16px;

    label {
      display: flex;
      align-items: center;
      gap: 7px;
      min-height: 36px;
      font-size: 12px;
    }

    input {
      accent-color: rgb(var(--v-theme-on-surface));
    }
    img {
      object-fit: contain;
    }
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

  :deep(.apexcharts-tooltip),
  :deep(.apexcharts-menu) {
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    border-color: var(--sd-modern-border);
    border-radius: 10px;
    font-family: inherit;
  }

  @media (max-width: 600px), (pointer: coarse) {
    .b-customer-activity-heatmap__filters label,
    .b-customer-activity-heatmap__inspectors select {
      min-height: 44px;
    }
    .b-customer-activity-heatmap__inspectors select {
      font-size: 16px;
    }
  }
}
</style>

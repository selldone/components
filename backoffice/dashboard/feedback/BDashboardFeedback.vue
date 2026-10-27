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
  <section
    v-if="modern"
    class="b-dashboard-feedback-detail sd-modern-widget text-start"
  >
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="20" aria-hidden="true">favorite_border</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("widgets.overview.title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.modern.engagement_subtitle") }}
          </p>
        </div>
      </div>
      <v-btn-toggle
        v-model="result_period"
        mandatory
        rounded="xl"
        variant="text"
        class="b-dashboard-feedback-modern__period"
        selected-class="b-dashboard-feedback-modern__selected"
      >
        <v-btn
          v-for="period in ['day', 'week', 'month']"
          :key="period"
          :value="period"
          size="small"
        >
          {{ $t(`global.commons.${period}`) }}
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{
              $t(
                period === "day"
                  ? "widgets.overview.report_today"
                  : period === "week"
                    ? "widgets.overview.report_last7days"
                    : "widgets.overview.report_last30days",
              )
            }}</v-tooltip
          >
        </v-btn>
      </v-btn-toggle>
    </header>
    <p class="sd-modern-subtitle b-dashboard-feedback-detail__scope">
      {{
        $t(
          result_period === "day"
            ? "widgets.overview.report_today"
            : result_period === "week"
              ? "widgets.overview.report_last7days"
              : "widgets.overview.report_last30days",
        )
      }}
    </p>
    <div class="b-dashboard-feedback-detail__metrics">
      <section v-for="item in types" :key="item.key">
        <h3>
          <i :class="item.icon" class="me-1" aria-hidden="true" />{{
            $t(item.name)
          }}
        </h3>
        <p class="b-dashboard-feedback-detail__value">
          {{ numeralFormat(selected_period_data?.[item.key] ?? 0, "0.[0]a") }}
        </p>
        <u-chart-bar
          :colors="[item.color]"
          :dataset="getArray(item.key)"
          :end-date="timeSeries.endDate"
          :start-date="timeSeries.startDate"
          :height="45"
          :show-title="false"
          hide-dates
          dense
          narrow
          fit
        />
      </section>
    </div>
    <apexchart
      :options="engagement_options"
      :series="engagement_series"
      type="line"
      height="260"
      width="100%"
      dir="ltr"
    />
    <p class="sd-modern-subtitle">
      {{ $t("admin_shop.dashboard.modern.engagement_history_scope") }}
    </p>
  </section>
  <s-widget-box
    v-else
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span> ${$t(
            'widgets.overview.title',
          )} </h5>`
    "
    extended
    :icon="modern ? undefined : 'favorite'"
    :sub-title="modern ? undefined : $t('widgets.overview.title_small')"
    :class="{
      'b-dashboard-feedback-modern sd-modern-widget text-start': modern,
    }"
    :color="modern ? 'rgb(var(--v-theme-surface))' : undefined"
    :dark="modern && $vuetify.theme.current.dark"
  >
    <template v-slot:actions>
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="favorite_border" size="20" aria-hidden="true"
          /></span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("widgets.overview.title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("widgets.overview.title_small") }}
            </p>
          </div>
        </div>
      </header>
      <div :class="{ 'b-dashboard-feedback-modern__charts': modern }">
        <div v-for="item in available_types" :key="item.key" class="mt-2">
          <u-chart-bar
            :colors="[item.color]"
            :dataset="getArray(item.key)"
            :end-date="timeSeries.endDate"
            :height="50"
            :start-date="timeSeries.startDate"
            narrow
          >
            <template v-slot:title>
              <i
                :class="item.icon"
                :style="{ color: item.color }"
                class="me-1"
              />
              {{ $t(item.name) }}
            </template>
          </u-chart-bar>
        </div>
      </div>
    </template>

    <template v-slot:bottom>
      <v-container
        :class="
          modern
            ? 'b-dashboard-feedback-modern__summary text-start'
            : 'text-center'
        "
        fluid
      >
        <div class="mb-3 d-flex align-center flex-wrap ga-3">
          <span class="text-muted">
            {{
              result_period === "day"
                ? $t("widgets.overview.report_today")
                : result_period === "week"
                  ? $t("widgets.overview.report_last7days")
                  : $t("widgets.overview.report_last30days")
            }}
          </span>
          <v-spacer></v-spacer>

          <v-btn-toggle
            v-model="result_period"
            density="compact"
            mandatory
            rounded="xl"
            :selected-class="
              modern ? 'b-dashboard-feedback-modern__selected' : 'black-flat'
            "
            :variant="modern ? 'text' : 'outlined'"
            :class="{ 'b-dashboard-feedback-modern__period': modern }"
          >
            <v-btn size="small" value="day">
              <v-icon> fa:fas fa-calendar-day</v-icon>
              <span v-if="modern" class="ms-2">{{
                $t("global.commons.day")
              }}</span>
              <v-tooltip activator="parent">{{
                $t("widgets.overview.report_today")
              }}</v-tooltip>
            </v-btn>
            <v-btn size="small" value="week">
              <v-icon> fa:fas fa-calendar-week</v-icon>
              <span v-if="modern" class="ms-2">{{
                $t("global.commons.week")
              }}</span>
              <v-tooltip activator="parent">{{
                $t("widgets.overview.report_last7days")
              }}</v-tooltip>
            </v-btn>
            <v-btn size="small" value="month">
              <v-icon> fa:fas fa-calendar</v-icon>
              <span v-if="modern" class="ms-2">{{
                $t("global.commons.month")
              }}</span>
              <v-tooltip activator="parent">{{
                $t("widgets.overview.report_last30days")
              }}</v-tooltip>
            </v-btn>
          </v-btn-toggle>
        </div>

        <div
          v-if="modern"
          class="sd-modern-stat-grid b-dashboard-feedback-modern__stats"
        >
          <div v-for="item in types" :key="item.key">
            <p class="sd-modern-eyebrow">
              <i :class="item.icon" class="me-1" aria-hidden="true" />{{
                $t(item.name)
              }}
            </p>
            <div class="b-dashboard-feedback-modern__value">
              {{
                numeralFormat(selected_period_data?.[item.key] ?? 0, "0.[0]a")
              }}
              <up-down-icon :value="upDownState(item.key)" />
            </div>
          </div>
        </div>
        <v-row v-else align="center" dense justify="center">
          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-comments text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.comments
                    : result_period === "week"
                      ? lastWeekData.comments
                      : lastMonthData.comments,
                  "0.[0]a",
                )
              }}

              <up-down-icon :value="upDownState('comments')"></up-down-icon>
            </p>

            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.comments") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-heart text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.likes
                    : result_period === "week"
                      ? lastWeekData.likes
                      : lastMonthData.likes,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('likes')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small> {{ $t("widgets.overview.likes") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-star text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.favorites
                    : result_period === "week"
                      ? lastWeekData.favorites
                      : lastMonthData.favorites,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('favorites')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.favorites") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-bolt text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.powers
                    : result_period === "week"
                      ? lastWeekData.powers
                      : lastMonthData.powers,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('powers')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.powers") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-eye text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.views
                    : result_period === "week"
                      ? lastWeekData.views
                      : lastMonthData.views,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('views')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.views") }} </small>
            </p>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../ui/widget/box/SWidgetBox.vue";
import UChartBar from "../../../ui/chart/bar/UChartBar.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UpDownIcon from "../../../ui/icon/UpDownIcon.vue";

export default {
  name: "BDashboardFeedback",
  components: {
    UpDownIcon,
    UChartBar,
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    result_period: "day",

    types: [
      {
        name: "widgets.overview.wishlist",
        key: "wishlist",
        color: "#7B1FA2",
        icon: "fas fa-plus-circle",
        permanent: true,
      },

      {
        name: "widgets.overview.comments",
        key: "comments",
        color: "#1976D2",
        icon: "fas fa-comments",
        permanent: true,
      },
      {
        name: "widgets.overview.likes",
        key: "likes",
        color: "#F44336",
        icon: "fas fa-heart",
      },
      {
        name: "widgets.overview.favorites",
        key: "favorites",
        color: "#FFA000",
        icon: "fas fa-star",
        permanent: true,
      },
      {
        name: "widgets.overview.powers",
        key: "powers",
        color: "#689F38",
        icon: "fas fa-bolt",
      },
      {
        name: "widgets.overview.views",
        key: "views",
        color: "#455A64",
        icon: "fas fa-eye",
        permanent: true,
      },
    ],
  }),

  computed: {
    engagement_series() {
      return this.types.map((item) => ({
        name: this.$t(item.name),
        data: this.timeSeries.arrayOfForceInterpolateZero(
          item.key,
          true,
          "created_at",
        ),
      }));
    },
    engagement_options() {
      return {
        chart: {
          type: "line",
          background: "transparent",
          fontFamily: "var(--font)",
          foreColor: this.$vuetify.theme.current.colors["on-surface"],
          zoom: { enabled: true },
          toolbar: { show: true },
        },
        theme: { mode: this.$vuetify.theme.current.dark ? "dark" : "light" },
        colors: this.types.map((item) => item.color),
        stroke: { width: 2, curve: "straight" },
        markers: { size: 0 },
        dataLabels: { enabled: false },
        legend: { show: true, position: "bottom", fontWeight: 400 },
        xaxis: {
          type: "datetime",
          labels: {
            formatter: (value) =>
              DateConverter.ConvertTimestampToShortString(value),
          },
        },
        yaxis: {
          labels: { formatter: (value) => this.numeralFormat(value, "0.[0]a") },
        },
        tooltip: {
          x: {
            formatter: (value) =>
              DateConverter.ConvertTimestampToShortString(value),
          },
        },
        grid: {
          borderColor: "var(--sd-modern-border)",
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } },
        },
      };
    },
    selected_period_data() {
      return this.result_period === "day"
        ? this.todayData
        : this.result_period === "week"
          ? this.lastWeekData
          : this.lastMonthData;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    available_types() {
      return this.types.filter(
        (item) => item.permanent || this.getArray(item.key).some((x) => x > 0),
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
    previousWeekData() {
      return this.timeSeries.previousWeekData();
    },

    lastMonthData() {
      return this.timeSeries.lastMonthData();
    },
  },
  methods: {
    upDownState(key) {
      if (this.result_period === "day") {
        return (
          (this.todayData ? this.todayData[key] : 0) -
          (this.yesterdayData ? this.yesterdayData[key] : 0)
        );
      } else if (this.result_period === "week") {
        return (
          (this.lastWeekData ? this.lastWeekData[key] : 0) -
          (this.previousWeekData ? this.previousWeekData[key] : 0)
        );
      }
    },

    getArray(key) {
      return this.timeSeries
        .arrayOfForceInterpolateZero(key)
        .map((val) => [val >= 0 ? val : 0]);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-feedback-detail {
  font-family: inherit;
  min-width: 0;
  max-width: 100%;
  container: dashboard-engagement / inline-size;
  &__scope {
    margin-block: 0 14px;
  }
  &__metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-block-end: 16px;
  }
  &__metrics > section {
    min-width: 0;
  }
  &__metrics :deep(.x--chart-bar) {
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }
  &__metrics h3 {
    font: inherit;
    font-size: 12px;
    font-weight: 400;
    color: var(--sd-modern-muted);
  }
  &__value {
    margin-block: 6px 4px;
    font-size: 24px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  @container dashboard-engagement (min-width: 420px) {
    &__metrics {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }
  }
  @container dashboard-engagement (min-width: 840px) {
    &__metrics {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }
  }
}
.b-dashboard-feedback-modern {
  :deep(> .widget-body) {
    margin: 0 !important;
  }
  &__charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 28px;
  }
  &__charts > * {
    min-width: 0;
  }
  &__summary {
    padding-inline: 0;
  }
  &__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    padding-block-end: 0;
  }
  &__value {
    margin-block-start: 8px;
    font-size: 24px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  &__period {
    border-radius: 10px !important;
  }
  &__period :deep(.v-btn) {
    min-height: 40px;
    padding-inline: 12px;
    font-size: 13px;
    text-transform: none;
  }
  &__selected {
    background: var(--sd-modern-inset);
  }
  @media (max-width: 600px) {
    &__charts {
      grid-template-columns: minmax(0, 1fr);
    }
    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__period :deep(.v-btn) {
      min-height: 44px;
    }
  }
}
</style>

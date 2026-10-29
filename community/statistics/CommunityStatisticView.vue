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
  <div v-if="modern" class="c-community-statistic-modern text-start">
    <div
      class="c-community-statistic-modern__overview"
      :class="{
        'c-community-statistic-modern__overview--with-aside': $slots.aside,
      }"
    >
      <section
        class="sd-modern-widget c-community-statistic-modern__activity"
        :aria-busy="loading"
        :aria-label="$t('community.community.modern.activity')"
      >
        <header class="sd-modern-header">
          <div class="sd-modern-title">
            <v-icon icon="show_chart" size="19" aria-hidden="true" />
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("community.community.modern.activity") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{ $t("community.community.modern.selected_period") }}
                <v-btn
                  icon="info_outline"
                  variant="text"
                  class="sd-modern-icon-button sd-modern-info-button"
                  :aria-label="$t('community.community.modern.period_help')"
                >
                  <v-icon icon="info_outline" aria-hidden="true" />
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-on-focus
                    open-on-click
                    content-class="sd-modern-tooltip text-start"
                    >{{
                      $t("community.community.modern.period_help")
                    }}</v-tooltip
                  >
                </v-btn>
              </p>
            </div>
          </div>
          <v-menu :close-on-content-click="false">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :disabled="!timeSeries || loading"
                variant="text"
                class="sd-modern-button sd-modern-button--compact c-community-statistic-modern__period-button"
                prepend-icon="calendar_today"
                append-icon="expand_more"
                >{{ period_label }}</v-btn
              >
            </template>
            <div
              class="sd-modern-widget c-community-statistic-modern__period-menu text-start"
            >
              <u-time-span
                v-if="timeSeries"
                v-model:days="timeSeries.days"
                v-model:offset="timeSeries.offset"
                :max-days="90"
                :loading="loading"
                color="grey"
                dense
                trigger-on-end
                @onChange="({ offset, days }) => timeSeries.fetch(offset, days)"
              />
            </div>
          </v-menu>
        </header>

        <div v-if="loadError" class="sd-modern-notice" role="alert">
          <v-icon icon="cloud_off" size="20" aria-hidden="true" />
          <div>
            <p>{{ $t("community.community.modern.analytics_error") }}</p>
            <v-btn
              variant="text"
              class="sd-modern-button sd-modern-button--inline"
              @click="$emit('retry')"
            >
              {{ $t("community.community.modern.retry") }}
            </v-btn>
          </div>
        </div>
        <template v-else>
          <div class="c-community-statistic-modern__primary-metrics">
            <div v-for="item in primary_metrics" :key="item.key">
              <span class="c-community-statistic-modern__label">{{
                item.title
              }}</span>
              <strong class="c-community-statistic-modern__metric-value">{{
                format_total(item.key)
              }}</strong>
            </div>
          </div>
          <u-loading-progress v-if="loading" />
          <div
            v-else-if="timeSeries && activity_available"
            class="c-community-statistic-modern__activity-chart"
            dir="ltr"
            role="group"
            :aria-label="
              $t('community.community.modern.activity') +
              ': ' +
              time_span_string
            "
          >
            <span class="c-community-statistic-modern__chart-unit">{{
              $t("community.community.modern.count_per_day")
            }}</span>
            <apexchart
              :key="chart_theme"
              :options="activity_options"
              :series="activity_series"
              type="line"
              dir="ltr"
              height="210px"
            />
          </div>
          <p
            v-else-if="!loading"
            class="sd-modern-subtitle c-community-statistic-modern__unavailable"
            role="status"
          >
            {{ $t("community.community.modern.analytics_unavailable") }}
          </p>
          <p
            v-if="timeSeries && !loading"
            class="c-community-statistic-modern__range"
          >
            {{ time_span_string }}
          </p>
          <div class="c-community-statistic-modern__secondary-metrics">
            <div v-for="item in secondary_metrics" :key="item.key">
              <span class="c-community-statistic-modern__label">{{
                item.title
              }}</span>
              <strong class="c-community-statistic-modern__metric-value">{{
                format_total(item.key)
              }}</strong>
              <svg
                v-if="timeSeries && !loading"
                class="c-community-statistic-modern__sparkline"
                viewBox="0 0 58 18"
                role="img"
                :aria-label="item.title + ': ' + time_span_string"
              >
                <title>{{ item.title }} · {{ time_span_string }}</title>
                <path :d="sparkline_path(item.key)" />
              </svg>
            </div>
          </div>
        </template>
      </section>
      <aside v-if="$slots.aside" class="c-community-statistic-modern__aside">
        <slot name="aside" />
      </aside>
    </div>

    <div
      v-if="timeSeries && !loadError && !loading"
      class="c-community-statistic-modern__breakdowns"
    >
      <section
        v-for="group in breakdowns"
        :key="group.key"
        class="sd-modern-widget c-community-statistic-modern__breakdown"
      >
        <header class="sd-modern-header">
          <div class="sd-modern-title">
            <v-icon :icon="group.icon" size="19" aria-hidden="true" />
            <div>
              <h2 class="sd-modern-title-text">{{ group.title }}</h2>
              <p class="sd-modern-subtitle">
                {{ $t("community.community.modern.selected_period") }}
              </p>
            </div>
          </div>
        </header>
        <dl class="c-community-statistic-modern__bars">
          <div
            v-for="item in group.items"
            :key="item.key"
            class="c-community-statistic-modern__bar-row"
          >
            <dt>
              <v-icon :icon="item.icon" size="16" aria-hidden="true" />{{
                item.title
              }}
            </dt>
            <dd class="c-community-statistic-modern__bar" aria-hidden="true">
              <span
                :style="{ width: bar_width(item.key, group.items) + '%' }"
              />
            </dd>
            <dd class="c-community-statistic-modern__bar-value">
              {{ format_total(item.key) }}
            </dd>
          </div>
        </dl>
        <details
          class="sd-modern-disclosure c-community-statistic-modern__trends"
          @toggle="open_trends[group.key] = $event.target.open"
        >
          <summary>{{ $t("community.community.modern.daily_trends") }}</summary>
          <component
            v-if="
              open_trends[group.key] &&
              group.items.every((item) => metric_total(item.key) !== null)
            "
            :is="group.key === 'reactions' ? 'u-chart-line' : 'u-chart-area'"
            :key="chart_theme"
            :time-series="timeSeries"
            :keys="group.items.map((item) => item.key)"
            :labels-data="group.items.map((item) => item.title)"
            :colors="chart_colors"
            :dark="$vuetify.theme.current.dark"
            :annotation-max-on="false"
            :has-grid="true"
            :stroke-width="2"
            :opacity="0.16"
            :y-label="group.title"
            y-format="0,0"
            height="240px"
          />
          <p
            v-else-if="open_trends[group.key]"
            class="sd-modern-subtitle"
            role="status"
          >
            {{ $t("community.community.modern.analytics_unavailable") }}
          </p>
        </details>
      </section>
    </div>
  </div>
  <v-container v-else class="text-start">
    <h2 class="fadeIn">{{ title }}</h2>

    <u-time-span
      ref="timespan"
      v-model:days="timeSeries.days"
      v-model:offset="timeSeries.offset"
      :loading="timeSeries.busy"
      :max-days="90"
      class="fadeIn delay_100"
      dense
      style="min-width: 300px; width: 50%"
      trigger-on-end
      @onChange="({ offset, days }) => timeSeries.fetch(offset, days)"
    ></u-time-span>

    <v-row>
      <v-col v-if="isCommunity" class="fadeIn delay_200" cols="6" md="3" sm="4">
        {{ $t("community.commons.categories") }}

        <small class="d-block">{{ $t("community.commons.total") }}</small>
        <h3>{{ numeralFormat(target.total_categories, "0.[0]a") }}</h3>
      </v-col>
      <v-col
        v-if="isCommunity || isCategory"
        class="fadeIn delay_300"
        cols="6"
        md="3"
        sm="4"
      >
        {{ $t("community.commons.topics") }}
        <small class="d-block">{{ $t("community.commons.total") }}</small>

        <h3>{{ numeralFormat(target.total_topics, "0.[0]a") }}</h3>
      </v-col>
      <v-col class="fadeIn delay_400" cols="6" md="3" sm="4">
        {{ $t("community.commons.posts") }}
        <small class="d-block">{{ $t("community.commons.total") }}</small>

        <h3>{{ numeralFormat(target.total_posts, "0.[0]a") }}</h3>
      </v-col>
      <v-col class="fadeIn delay_500" cols="6" md="3" sm="4">
        {{ $t("community.commons.comments") }}
        <small class="d-block">{{ $t("community.commons.total") }}</small>

        <h3>{{ numeralFormat(target.total_comments, "0.[0]a") }}</h3>
      </v-col>

      <v-col cols="12">
        <hr />
      </v-col>

      <v-col
        v-for="(item, i) in keys"
        :key="item.key"
        :style="{ 'animation-delay': 500 + i * 50 + 'ms' }"
        class="fadeIn"
        cols="12"
        lg="3"
        md="4"
        sm="6"
      >
        {{ item.title }}
        <small class="d-block">Total in {{ time_span_string }}</small>
        <h3>{{ timeSeries.totalOf(item.key) }}</h3>
        <trend-sparkline
          :auto-draw="false"
          :reverse="item.reverse"
          :value="timeSeries.arrayOfForceInterpolateZero(item.key)"
          fill
          height="32"
          smooth="10"
        ></trend-sparkline>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <div
          v-intersect.once="
            (isIntersecting) => OnIntersectLoad(isIntersecting, 1)
          "
          class="mh250 border rounded-18px p-2"
        >
          <u-chart-line
            v-if="IsLoaded(1)"
            :colors="['#C2185B', '#03A9F4', '#009688', '#FFC107', '#673AB7']"
            :keys="['likes', 'smiles', 'claps', 'ideas', 'disagrees']"
            :labels-data="[
              '❤ ' + $t('community.post_reaction.LIKE'),
              '😊 ' + $t('community.post_reaction.SMILE'),
              '👏 ' + $t('community.post_reaction.CLAP'),
              '💡 ' + $t('community.post_reaction.IDEA'),
              '😡 ' + $t('community.post_reaction.DISAGREE'),
            ]"
            :time-series="timeSeries"
            :y-label="$t('community.commons.user_reactions')"
            height="240px"
          />
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div
          v-intersect.once="
            (isIntersecting) => OnIntersectLoad(isIntersecting, 2)
          "
          class="mh250 border rounded-18px p-2"
        >
          <u-chart-area
            v-if="IsLoaded(2)"
            :colors="['#C2185B', '#03A9F4', '#009688', '#FFC107', '#673AB7']"
            :keys="['texts', 'videos', 'links', 'images', 'voices', 'products']"
            :labels-data="[
              $t('community.commons.text'),
              $t('community.commons.video'),
              $t('community.commons.link'),
              $t('community.commons.image'),
              $t('community.commons.voice'),
              $t('community.commons.product'),
            ]"
            :opacity="0.5"
            :time-series="timeSeries"
            class="fadeIn"
            height="240px"
            y-label="Media types"
          ></u-chart-area>
        </div>
      </v-col>
    </v-row>
    <div style="height: 5vh"></div>
  </v-container>
</template>

<script lang="ts">
import UTimeSpan from "../../ui/time/span/UTimeSpan.vue";
import UChartArea from "../../ui/chart/area/UChartArea.vue";
import UChartLine from "../../ui/chart/line/UChartLine.vue";
import TrendSparkline from "./TrendSparkline.vue";
import chroma from "chroma-js";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import { IntersectMixin } from "../../mixin/IntersectMixin";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "CommunityStatisticView",
  mixins: [IntersectMixin, DateMixin],

  components: { UTimeSpan, UChartArea, UChartLine, TrendSparkline },
  emits: ["retry"],
  props: {
    modern: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    loadError: { type: Boolean, default: false },
    title: {},

    community: { required: true, type: Object },
    category: {},
    topic: {},

    timeSeries: {
      require: true,
    },

    isCommunity: {
      type: Boolean,
      default: false,
    },
    isCategory: {
      type: Boolean,
      default: false,
    },
    isTopic: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      intersects: [], // Intersects keeper.
      open_trends: { reactions: false, media: false },
    };
  },

  created() {},

  computed: {
    target() {
      return this.isCommunity
        ? this.community
        : this.isCategory
          ? this.category
          : this.isTopic
            ? this.topic
            : this.community;
    },

    time_span_string() {
      if (!this.timeSeries) return "";
      if (this.modern) {
        return (
          this.getLocalTimeString(
            this.timeSeries.startDate,
            false,
            true,
            true,
          ) +
          " – " +
          this.getLocalTimeString(this.timeSeries.endDate, false, true, true)
        );
      }
      return (
        this.getFromNowString(
          DateConverter.GetStartOfDateBefore(this.timeSeries.offset),
        ) +
        " ~ " +
        this.getFromNowString(
          DateConverter.GetStartOfDateBefore(this.timeSeries.days),
        )
      );
    },
    keys() {
      const out = [
        { key: "posts", title: this.$t("community.commons.posts") },
        { key: "comments", title: this.$t("community.commons.comments") },
        { key: "impressions", title: this.$t("community.commons.impressions") },
        { key: "reactions", title: this.$t("community.commons.reactions") },
        { key: "saves", title: this.$t("community.commons.saves") },
        { key: "embeds", title: this.$t("community.commons.embeds") },
        { key: "shares", title: this.$t("community.commons.shares") },
        {
          key: "reports",
          title: this.$t("community.commons.reports"),
          reverse: true,
        },
      ];

      if (this.isCommunity || this.isCategory)
        out.unshift({
          key: "topics",
          title: this.$t("community.commons.topics"),
        });

      return out;
    },
    primary_metrics() {
      return this.keys.filter((item) =>
        ["topics", "posts", "comments"].includes(item.key),
      );
    },
    secondary_metrics() {
      return this.keys
        .filter((item) => !["topics", "posts", "comments"].includes(item.key))
        .map((item) =>
          item.key === "reports"
            ? { ...item, title: this.$t("community.community.modern.reports") }
            : item,
        );
    },
    activity_available() {
      return this.activity_series.some((series) =>
        series.data.some((point) => Number.isFinite(point[1])),
      );
    },
    period_label() {
      if (!this.timeSeries) return this.$t("time_spans.last_7");
      const { offset, days } = this.timeSeries;
      if (offset === 0 && [7, 14, 30, 90].includes(days))
        return this.$t("time_spans.last_" + days);
      if (offset === 0 && days === 0) return this.$t("time_spans.today");
      if (offset === 1 && days === 0) return this.$t("time_spans.yesterday");
      return this.$t("time_spans.custom");
    },
    chart_theme() {
      return this.$vuetify.theme.name + "-" + this.$i18n.locale;
    },
    chart_colors() {
      const theme =
        this.$vuetify.theme.computedThemes[this.$vuetify.theme.name].colors;
      return [
        theme.primary,
        theme.secondary,
        theme["on-surface"],
        theme.success,
        theme.warning,
        theme.info,
      ];
    },
    activity_series() {
      return ["posts", "comments"].map((key) => ({
        name: this.$t("community.commons." + key),
        data: this.daily_values(key),
      }));
    },
    activity_options() {
      const theme =
        this.$vuetify.theme.computedThemes[this.$vuetify.theme.name].colors;
      const values = this.activity_series
        .flatMap((series) => series.data.map((point) => point[1]))
        .filter(Number.isFinite);
      const minimum = Math.min(0, ...values);
      const maximum = Math.max(1, ...values);
      const step = Math.max(1, Math.ceil((maximum - minimum) / 4));
      const min = Math.floor(minimum / step) * step;
      const max = Math.ceil(maximum / step) * step;
      return {
        chart: {
          fontFamily: "var(--font)",
          foreColor: chroma.mix(theme.surface, theme["on-surface"], 0.66).hex(),
          animations: { enabled: false },
          toolbar: { show: false },
          zoom: { enabled: false },
          background: "transparent",
        },
        colors: this.chart_colors.slice(0, 2),
        stroke: { width: [2, 1.8], curve: "straight", dashArray: [0, 5] },
        markers: { size: 0, hover: { size: 4 } },
        dataLabels: { enabled: false },
        grid: {
          borderColor: chroma
            .mix(theme.surface, theme["on-surface"], 0.09)
            .hex(),
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
        },
        legend: {
          position: "top",
          horizontalAlign: "left",
          fontSize: "11px",
          fontWeight: 400,
          markers: { size: 3 },
          itemMargin: { horizontal: 10, vertical: 5 },
        },
        xaxis: {
          type: "datetime",
          tickAmount: 3,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            rotate: 0,
            hideOverlappingLabels: true,
            style: { fontSize: "11px" },
            formatter: (value) =>
              DateConverter.ConvertTimestampToShortString(value),
          },
        },
        yaxis: {
          min,
          max,
          tickAmount: (max - min) / step,
          decimalsInFloat: 0,
          labels: {
            style: { fontSize: "11px" },
            formatter: (value) => this.numeralFormat(value, "0,0"),
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          theme: this.$vuetify.theme.current.dark ? "dark" : "light",
          x: {
            formatter: (value) =>
              DateConverter.ConvertTimestampToShortString(value),
          },
          y: {
            formatter: (value) =>
              value == null ? "—" : this.numeralFormat(value, "0,0"),
          },
        },
      };
    },
    breakdowns() {
      return [
        {
          key: "reactions",
          icon: "sentiment_satisfied",
          title: this.$t("community.community.modern.reaction_breakdown"),
          items: [
            {
              key: "likes",
              title: this.$t("community.post_reaction.LIKE"),
              icon: "thumb_up",
            },
            {
              key: "smiles",
              title: this.$t("community.post_reaction.SMILE"),
              icon: "sentiment_satisfied",
            },
            {
              key: "claps",
              title: this.$t("community.post_reaction.CLAP"),
              icon: "celebration",
            },
            {
              key: "ideas",
              title: this.$t("community.post_reaction.IDEA"),
              icon: "lightbulb",
            },
            {
              key: "disagrees",
              title: this.$t("community.post_reaction.DISAGREE"),
              icon: "thumb_down",
            },
          ],
        },
        {
          key: "media",
          icon: "perm_media",
          title: this.$t("community.community.modern.content_types"),
          items: [
            {
              key: "texts",
              title: this.$t("community.commons.text"),
              icon: "notes",
            },
            {
              key: "videos",
              title: this.$t("community.commons.video"),
              icon: "videocam",
            },
            {
              key: "links",
              title: this.$t("community.commons.link"),
              icon: "link",
            },
            {
              key: "images",
              title: this.$t("community.commons.image"),
              icon: "image",
            },
            {
              key: "voices",
              title: this.$t("community.commons.voice"),
              icon: "mic",
            },
            {
              key: "products",
              title: this.$t("community.commons.product"),
              icon: "inventory_2",
            },
          ],
        },
      ];
    },
  },
  methods: {
    daily_values(key) {
      if (!this.timeSeries) return [];
      const records = new Map(
        this.timeSeries.raw_data.map((item) => [
          DateConverter.convertToLocalTime(
            item.created_at,
            true,
          )?.toDateString(),
          item,
        ]),
      );
      return this.timeSeries
        .arrayOfForceInterpolateZero(key, true, "created_at")
        .map(([date]) => {
          const record = records.get(new Date(date).toDateString());
          // Daily record gaps are zero events; explicit unknown fields stay gaps.
          return [
            date,
            record ? (Number.isFinite(record[key]) ? record[key] : null) : 0,
          ];
        });
    },
    sparkline_path(key) {
      const values = this.daily_values(key).map((point) => point[1]);
      const known = values.filter(Number.isFinite);
      if (!known.length) return "";
      const min = Math.min(...known),
        max = Math.max(...known);
      let connected = false;
      return values
        .map((value, index) => {
          if (!Number.isFinite(value)) {
            connected = false;
            return "";
          }
          const x =
            values.length === 1 ? 29 : 2 + (index * 54) / (values.length - 1);
          const y = max === min ? 9 : 16 - ((value - min) * 14) / (max - min);
          const command = connected ? "L" : "M";
          connected = true;
          return command + x.toFixed(2) + "," + y.toFixed(2);
        })
        .join(" ");
    },
    metric_total(key) {
      if (!this.timeSeries || this.loading || this.loadError) return null;
      // An absent day is zero activity; an explicitly missing field remains unknown.
      if (this.timeSeries.raw_data?.some((item) => !Number.isFinite(item[key])))
        return null;
      return this.timeSeries.totalOf(key);
    },
    format_total(key) {
      const value = this.metric_total(key);
      return value === null ? "—" : this.numeralFormat(value, "0,0");
    },
    bar_width(key, items) {
      const maximum = Math.max(
        0,
        ...items.map((item) => this.metric_total(item.key) ?? 0),
      );
      return maximum ? ((this.metric_total(key) ?? 0) / maximum) * 100 : 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.c-community-statistic-modern {
  min-width: 0;
  font-size: 13px;
  line-height: 1.5;

  &__overview {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
    gap: 18px;
  }
  &__overview--with-aside {
    grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr);
  }
  &__activity,
  &__breakdown {
    min-width: 0;
    padding: 24px;
    border: 0;
    border-radius: 15px;
  }
  &__aside {
    min-width: 0;
    display: grid;
    gap: 18px;
  }
  .sd-modern-header {
    flex-wrap: nowrap;
    gap: 12px;
    margin-block-end: 21px;
  }
  .sd-modern-title {
    gap: 9px;
  }
  .sd-modern-title > .v-icon {
    display: inline-flex;
    flex: 0 0 19px;
    width: 19px !important;
    min-width: 19px;
    max-width: 19px;
    height: 19px;
    color: var(--sd-modern-muted);
    margin-block-start: 2px;
  }
  .sd-modern-title-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: -0.15px;
  }
  .sd-modern-subtitle {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 4px;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
  }
  &__period-button {
    flex-shrink: 0;
    color: rgb(var(--v-theme-on-surface));
  }
  &__primary-metrics,
  &__secondary-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  &__primary-metrics {
    margin-block-end: 18px;
  }
  &__label {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  &__metric-value {
    display: block;
    margin-block-start: 5px;
    font-size: 26px;
    line-height: 1.2;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__activity-chart {
    position: relative;
    min-width: 0;
    margin-inline: -12px;
  }
  &__chart-unit {
    position: absolute;
    top: 15px;
    right: 12px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
    pointer-events: none;
  }
  &__range {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
  }
  &__secondary-metrics {
    gap: 18px 12px;
    padding-block-start: 20px;
    margin-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__secondary-metrics &__metric-value {
    font-size: 19px;
  }
  &__sparkline {
    display: block;
    width: 58px;
    height: 18px;
    margin-block-start: 5px;
    color: rgb(var(--v-theme-on-surface));
    opacity: 0.55;
  }
  &__sparkline path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.3px;
  }
  &__unavailable {
    min-height: 150px;
    justify-content: center;
  }
  &__breakdowns {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 18px;
    margin-block-start: 18px;
  }
  &__bars {
    margin: 0;
  }
  &__bar-row {
    display: grid;
    grid-template-columns: minmax(97px, 0.7fr) minmax(0, 1fr) minmax(32px, auto);
    align-items: center;
    gap: 12px;
    margin-block-start: 13px;
    font-size: 11px;
    line-height: 1.5;
  }
  &__bar-row dt {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__bar-row dt .v-icon {
    color: var(--sd-modern-muted);
  }
  &__bar-row dd {
    margin: 0;
  }
  &__bar {
    height: 5px;
    overflow: hidden;
    background: var(--sd-modern-inset);
    border-radius: 2px;
  }
  &__bar span {
    display: block;
    height: 100%;
    background: rgb(var(--v-theme-primary));
    opacity: 0.7;
  }
  &__bar-value {
    text-align: end;
    font-variant-numeric: tabular-nums;
    color: var(--sd-modern-muted);
  }
  &__trends {
    padding-block-start: 12px;
    margin-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__trends summary {
    min-height: 32px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.5;
    cursor: pointer;
  }
  :deep(.apexcharts-text) {
    fill: rgb(var(--v-theme-on-surface));
    font-family: var(--font) !important;
    font-size: 11px;
  }
  :deep(.apexcharts-legend-text) {
    color: rgb(var(--v-theme-on-surface)) !important;
    font-family: var(--font) !important;
    font-size: 11px !important;
    font-weight: 400 !important;
  }
  @media (max-width: 900px) {
    &__overview {
      grid-template-columns: minmax(0, 1fr);
    }
    &__aside {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
  }
  @media (max-width: 600px) {
    &__activity,
    &__breakdown {
      padding: 19px;
    }
    .sd-modern-header {
      flex-wrap: wrap;
    }
    &__period-button {
      margin-inline-start: auto;
    }
    &__aside,
    &__breakdowns {
      grid-template-columns: minmax(0, 1fr);
    }
    &__bar-row {
      grid-template-columns: minmax(80px, 0.7fr) minmax(0, 1fr) minmax(
          28px,
          auto
        );
      gap: 9px;
    }
    &__primary-metrics &__metric-value {
      font-size: 23px;
    }
  }
}
.c-community-statistic-modern__period-menu {
  width: min(360px, calc(100vw - 32px));
  padding: 20px;
  font-size: 12px;
  :deep(.s--time-span small) {
    font-size: 11px;
  }
}
</style>

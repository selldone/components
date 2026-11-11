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
  <section
    v-if="blog"
    class="s-article-search-blog text-start"
    :aria-busy="busy"
    :aria-label="$t('global.article.search_console.title')"
  >
    <header class="s-article-search-blog__header">
      <img
        src="../../assets/trademark/google.svg"
        alt=""
        width="24"
        height="24"
      />
      <div class="s-article-search-blog__heading">
        <h2>{{ $t("global.article.search_console.title") }}</h2>
        <p>{{ $t("global.article.search_console.subtitle") }}</p>
        <p
          v-if="
            typeof start === 'string' && typeof end === 'string' && start && end
          "
          class="s-article-search-blog__period"
        >
          {{ start.slice(0, 10) }} – {{ end.slice(0, 10) }}
        </p>
      </div>
      <v-btn
        variant="text"
        class="s-article-search-blog__button"
        prepend-icon="arrow_back"
        @click="$emit('close')"
        >{{ $t("global.article.search_console.back_to_article") }}</v-btn
      >
    </header>
    <u-loading-progress v-if="busy" class="s-article-search-blog__progress" />
    <div
      v-if="(!article?.id || busy) && !has_data"
      class="s-article-search-blog__state"
      role="status"
    >
      <p>{{ $t("global.article.search_console.loading") }}</p>
    </div>
    <div v-else-if="error" class="s-article-search-blog__state" role="status">
      <v-icon icon="warning_amber" size="26" aria-hidden="true" />
      <h3>{{ $t("global.article.search_console.unavailable_title") }}</h3>
      <p>{{ $t("global.article.search_console.unavailable_message") }}</p>
      <details v-if="error_detail">
        <summary>{{ $t("global.article.search_console.details") }}</summary>
        <p>{{ error_detail }}</p>
      </details>
      <v-btn
        variant="outlined"
        class="s-article-search-blog__button"
        prepend-icon="refresh"
        :disabled="busy"
        @click="fetch()"
        >{{ $t("global.article.search_console.retry") }}</v-btn
      >
    </div>
    <template v-else-if="has_data">
      <p v-if="page" class="s-article-search-blog__page">
        <span>{{ $t("global.article.search_console.page") }}</span>
        <span dir="ltr">{{ page }}</span>
      </p>
      <div
        class="s-article-search-blog__metrics"
        role="group"
        :aria-label="$t('global.article.search_console.daily_trend')"
      >
        <button
          v-for="metric in blogMetrics"
          :key="metric.key"
          type="button"
          class="s-article-search-blog__metric"
          :aria-pressed="blogMetric === metric.key"
          @click="blogMetric = metric.key"
        >
          <span class="s-article-search-blog__metric-label">{{
            metric.label
          }}</span>
          <span class="s-article-search-blog__metric-value">{{
            formatMetric(blogTotals[metric.key], metric.key)
          }}</span>
          <apexchart
            v-if="blogDays.length"
            type="line"
            height="28"
            :options="metric.sparkOptions"
            :series="metric.series"
            aria-hidden="true"
          />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            >{{
              $t(`global.article.search_console.metric_${metric.key}_help`)
            }}</v-tooltip
          >
        </button>
      </div>
      <p class="s-article-search-blog__footnote">
        {{ $t("global.article.search_console.returned_days") }}
      </p>
      <div class="s-article-search-blog__chart-heading">
        <h3>
          {{ $t("global.article.search_console.daily_trend") }} ·
          {{ selectedBlogMetric.label }}
        </h3>
      </div>
      <div
        v-if="blogDays.length"
        class="s-article-search-blog__trend"
        dir="ltr"
        role="img"
        :aria-label="`${$t('global.article.search_console.daily_trend')} · ${selectedBlogMetric.label}`"
      >
        <apexchart
          :key="`${blogMetric}:${blogChartRevision}`"
          type="line"
          height="220"
          :options="blogTrendOptions"
          :series="selectedBlogMetric.series"
        />
      </div>
      <p v-else class="s-article-search-blog__empty" role="status">
        {{ $t("global.article.search_console.daily_empty") }}
      </p>
      <section class="s-article-search-blog__distribution">
        <header class="s-article-search-blog__section-header">
          <div>
            <h3>{{ $t("global.article.search_console.distribution") }}</h3>
            <p>{{ $t("global.article.search_console.distribution_hint") }}</p>
          </div>
          <label class="s-article-search-blog__select"
            ><span class="s-article-search-blog__sr">{{
              $t("global.article.search_console.distribution_dimension")
            }}</span
            ><select v-model="blogDistribution">
              <option value="countries">
                {{ $t("global.article.search_console.countries") }}
              </option>
              <option value="appearance">
                {{ $t("global.article.search_console.appearance") }}
              </option>
            </select></label
          >
        </header>
        <div
          v-if="blogShares.total > 0"
          class="s-article-search-blog__distribution-body"
        >
          <svg
            class="s-article-search-blog__donut"
            viewBox="0 0 360 192"
            direction="ltr"
            role="img"
            :aria-label="`${$t('global.article.search_console.listed_clicks')}: ${blogShares.total}`"
          >
            <g transform="rotate(-90 180 96)">
              <circle
                v-for="arc in blogArcs"
                :key="arc.index"
                cx="180"
                cy="96"
                r="46"
                fill="none"
                stroke-width="18"
                :stroke="arc.color"
                :stroke-dasharray="arc.dash"
                :stroke-dashoffset="arc.offset"
              >
                <title>
                  {{ arc.label }} · {{ formatMetric(arc.value, "clicks") }} ·
                  {{ formatMetric(arc.share, "ctr") }}
                </title>
              </circle>
            </g>
            <g
              v-for="callout in blogCallouts"
              :key="callout.index"
              class="s-article-search-blog__callout"
            >
              <polyline :points="callout.points" fill="none" />
              <circle
                :cx="callout.dot[0]"
                :cy="callout.dot[1]"
                :fill="callout.color"
                r="2.5"
              />
              <text
                :x="callout.x"
                :y="callout.y - 4"
                :text-anchor="callout.anchor"
              >
                {{ callout.label }}
              </text>
              <text
                :x="callout.x"
                :y="callout.y + 11"
                :text-anchor="callout.anchor"
                class="s-article-search-blog__donut-percent"
              >
                {{ formatMetric(callout.share, "ctr") }}
              </text>
            </g>
            <text x="180" y="98" class="s-article-search-blog__donut-total">
              {{ formatMetric(blogShares.total, "clicks") }}
            </text>
            <text x="180" y="115" class="s-article-search-blog__donut-unit">
              {{ $t("global.article.search_console.clicks") }}
            </text>
          </svg>
          <ul class="s-article-search-blog__shares">
            <li v-for="(row, index) in blogShares.rows" :key="index">
              <div class="s-article-search-blog__share-label">
                <span>{{ rowLabel(row, blogDistribution) }}</span
                ><span
                  >{{ formatMetric(row.value, "clicks") }} ·
                  {{ formatMetric(row.share, "ctr") }}</span
                >
              </div>
              <span
                class="s-article-search-blog__share-track"
                aria-hidden="true"
                ><span
                  :style="{
                    width: `${row.share * 100}%`,
                    background: row.color,
                  }"
              /></span>
            </li>
          </ul>
        </div>
        <p v-else class="s-article-search-blog__empty" role="status">
          {{ $t("global.article.search_console.distribution_empty") }}
        </p>
      </section>
      <div
        class="s-article-search-blog__tabs"
        role="group"
        :aria-label="$t('global.article.search_console.distribution_dimension')"
      >
        <button
          v-for="(dimension, index) in ['queries', 'countries', 'appearance']"
          :key="dimension"
          type="button"
          :aria-pressed="tab === index"
          @click="tab = index"
        >
          {{
            $t(
              `global.article.search_console.${dimension === "queries" ? "keywords" : dimension}`,
            )
          }}
        </button>
      </div>
      <div
        class="s-article-search-blog__table-scroll"
        role="region"
        tabindex="0"
        :aria-label="key_title"
      >
        <table class="s-article-search-blog__table">
          <thead>
            <tr>
              <th>{{ key_title }}</th>
              <th>{{ $t("global.article.search_console.clicks") }}</th>
              <th>{{ $t("global.article.search_console.impressions") }}</th>
              <th>{{ $t("global.article.search_console.ctr") }}</th>
              <th>{{ $t("global.article.search_console.position") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in blogSource" :key="index">
              <td dir="auto">
                {{ rowLabel(row, ["queries", "countries", "appearance"][tab]) }}
              </td>
              <td>{{ formatMetric(row.clicks, "clicks") }}</td>
              <td>{{ formatMetric(row.impressions, "impressions") }}</td>
              <td>{{ formatMetric(row.ctr, "ctr") }}</td>
              <td>{{ formatMetric(row.position, "position") }}</td>
            </tr>
            <tr v-if="!blogSource.length">
              <td colspan="5" class="s-article-search-blog__empty">
                {{ $t("global.article.search_console.empty_dimension") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="s-article-search-blog__footnote">
        {{
          $t("global.article.search_console.rows_returned", {
            count: blogSource.length,
          })
        }}<template v-if="blogRowLimit">
          ·
          {{
            $t("global.article.search_console.row_limit", {
              limit: blogRowLimit,
            })
          }}</template
        >
      </p>
    </template>
    <div v-else class="s-article-search-blog__state" role="status">
      <v-icon icon="search_off" size="26" aria-hidden="true" />
      <h3>{{ $t("global.article.search_console.empty_title") }}</h3>
      <p>{{ $t("global.article.search_console.empty_message") }}</p>
    </div>
  </section>
  <template v-else>
  <div class="text-start position-relative" :class="workspace ? 's-article-search-console--workspace' : 'pa-3'" :aria-busy="workspace ? busy : undefined">
    <b v-if="!workspace" class="small pen"
      ><img height="16" src="../../assets/trademark/google.svg" width="16" />
      Google Search</b
    >

    <u-loading-progress v-if="busy"></u-loading-progress>
    <p v-if="workspace && busy && !has_data" class="s-article-search-console__loading" role="status">{{ $t('global.article.search_console.loading') }}</p>

    <div v-if="workspace && error" class="s-article-search-console__notice sd-modern-notice" role="status">
      <v-icon icon="warning_amber" size="19" aria-hidden="true" />
      <div class="s-article-search-console__notice-copy">
        <h3>{{ $t('global.article.search_console.unavailable_title') }}</h3>
        <p>{{ $t(can_connect ? 'global.article.search_console.connect_message' : 'global.article.search_console.unavailable_message') }}</p>
        <details v-if="error_detail" class="s-article-search-console__details"><summary>{{ $t('global.article.search_console.details') }}</summary><p>{{ error_detail }}</p></details>
      </div>
      <div class="s-article-search-console__notice-actions">
        <v-btn v-if="can_connect" :to="{ name: 'BPageShopSettingSeo' }" class="sd-modern-button sd-modern-button--compact" variant="text" color="primary" prepend-icon="cable">{{ $t('global.article.search_console.connect') }}</v-btn>
        <v-btn class="sd-modern-button sd-modern-button--compact" variant="outlined" :disabled="busy" prepend-icon="refresh" @click="fetch()">{{ $t('global.article.search_console.retry') }}</v-btn>
      </div>
    </div>

    <div v-if="busy && (!workspace || !has_data)">
      <v-skeleton-loader
        class="mt-2"
        :type="['table-thead', 'table', 'card']"
      ></v-skeleton-loader>
    </div>
    <div
      v-else-if="!workspace && error"
      class="d-flex flex-column align-center justify-center py-16 text-center"
    >
      <v-icon size="x-large">warning_amber</v-icon>
      <div class="my-3" v-html="error_msg"></div>
      <v-btn
        v-if="
          shop &&
          $route.params.shop_id /*Must be in the panel!*/ &&
          !shop.search_console
        "
        :to="{ name: 'BPageShopSettingSeo' }"
        class="tnt"
        color="primary"
      >
        <v-icon class="me-1" size="small">cable</v-icon>
        Connect to Search Console
      </v-btn>
    </div>
    <div v-if="!error && (!busy || (workspace && has_data)) && (!workspace || has_data)" :class="workspace ? 's-article-search-console__data' : 'mt-2'">
      <div v-if="!workspace || page || (start && end)" :class="workspace ? 's-article-search-console__page' : 'small mb-2'">
        <span v-if="!workspace || page">
        <v-icon class="me-1" size="small">link</v-icon>
        {{ workspace ? $t('global.article.search_console.page') : 'Page' }}: <b>{{ page }}</b>
        </span>
        <span v-if="workspace && start && end">{{ $t('global.article.search_console.period') }}: {{ start }} – {{ end }}</span>

        <flag
          v-for="(c, index) in (workspace ? countries?.slice(0, 5) : countries?.limit(5))"
          :key="'c' + c.keys"
          :iso="c.keys.toUpperCase()"
          :squared="false"
          :title="`#${index + 1} Country: ${getCountryName(c.keys)}`"
          class="mx-1 hover-scale"
        />
      </div>

      <!-- ------------------- History ------------------- -->

      <div style="min-height: 220px">
        <apexchart
          :options="chartOptionsHistory"
          :series="seriesHistory"
          height="220"
          type="area"
        ></apexchart>
      </div>

      <v-tabs
        v-model="tab"
        :align-tabs="workspace ? 'start' : 'center'"
        center-active
        class="my-2"
        :class="{ 's-article-search-console__tabs': workspace }"
        :grow="!workspace"
        :hide-slider="!workspace"
      >
        <v-tab>
          <v-icon class="me-1" size="small">search</v-icon>
          {{ workspace ? $t('global.article.search_console.keywords') : 'Keywords' }}
        </v-tab>
        <v-tab>
          <v-icon class="me-1" size="small">public</v-icon>
          {{ workspace ? $t('global.article.search_console.countries') : 'Countries' }}
        </v-tab>
        <v-tab>
          <v-icon class="me-1" size="small">grade</v-icon>
          {{ workspace ? $t('global.article.search_console.appearance') : 'Appearance' }}
        </v-tab>
      </v-tabs>

      <v-table class="thin-scroll" :class="{ 'sd-modern-table sd-modern-table--dense s-article-search-console__table': workspace }" fixed-header height="350" density="compact">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>{{ key_title }}</th>
              <th>
                <v-icon class="me-1" size="small">visibility</v-icon>
                {{ workspace ? $t('global.article.search_console.impressions') : 'Impressions' }}
              </th>
              <th>
                <v-icon class="me-1" size="small">ads_click</v-icon>
                {{ workspace ? $t('global.article.search_console.clicks') : 'Clicks' }}
              </th>
              <th>
                <v-icon class="me-1" size="small">bolt</v-icon>
                {{ workspace ? $t('global.article.search_console.ctr') : 'CTR' }}
              </th>
              <th>
                <v-icon class="me-1" size="small">radar</v-icon>
                {{ workspace ? $t('global.article.search_console.position') : 'Position' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="workspace && !source?.length"><td colspan="6" class="s-article-search-console__empty-row">{{ $t('global.article.search_console.empty_dimension') }}</td></tr>
            <tr v-for="(item, i) in source" :key="i">
              <td class="text-muted text-center">{{ i + 1 }}</td>
              <td>
                <!-- Country -->
                <template v-if="tab === 1">
                  <flag
                    :iso="item.keys.toUpperCase()"
                    :squared="false"
                    class="me-2"
                  />
                  <small>{{ getCountryName(item.keys) }}</small>
                </template>

                <!-- Appearance -->
                <template v-else-if="tab === 2">
                  <div class="key-block text-capitalize">
                    {{ getName(item.keys.toLowerCase()) }}
                  </div>
                </template>

                <!-- Keywords -->
                <template v-else>
                  <div class="key-block">
                    {{ decodeURIComponent(item.keys) }}
                  </div>
                </template>
              </td>
              <td>{{ numeralFormat(item.impressions, "0.[0]a") }}</td>
              <td>{{ numeralFormat(item.clicks, "0.[0]a") }}</td>
              <td>
                <div>
                  {{ numeralFormat(item.ctr, "%0.[00]") }}
                  <span class="mx-1">
                    <u-progress-score
                      :size="16"
                      :value="$SEO.CTRScore(item.ctr)"
                      :width="2"
                    ></u-progress-score
                  ></span>
                </div>
              </td>
              <td>{{ numeralFormat(item.position, "0.[0]") }}</td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </div>
    <div v-if="workspace && !busy && !error && !has_data" class="s-article-search-console__empty sd-modern-empty-state" role="status">
      <v-icon icon="search_off" size="26" aria-hidden="true" />
      <h3>{{ $t('global.article.search_console.empty_title') }}</h3>
      <p>{{ $t('global.article.search_console.empty_message') }}</p>
    </div>
  </div>
  </template>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import numeral from "numeral";
import UProgressScore from "../../ui/progress/score/UProgressScore.vue";
import {
  searchNumber,
  searchDays,
  searchTotals,
  searchPoints,
  searchShares,
} from "./article-search-console";

export default {
  name: "SArticleSearchConsole",
  components: { UProgressScore },
  emits: ["close"],
  props: {
    blog: { type: Boolean, default: false },
    workspace: { type: Boolean, default: false },
    shop: { required: false, type: Object },
    article: { required: true, type: Object },
  },
  data() {
    return {
      queries: null,
      date: null,
      countries: null,
      appearance: null,

      domain: null,
      page: null,
      start: null,
      end: null,
      queries_limit: null,
      countries_limit: null,
      cache: false,

      error: false,
      error_msg: false,

      //---------------------------
      busy: false,

      tab: 0,
      blogMetric: "clicks",
      blogDistribution: "countries",
      blogChartRevision: 0,

      seriesHistory: [],
      chartOptionsHistory: {},
    };
  },

  computed: {
    blogDays() {
      return searchDays(this.date);
    },
    blogTotals() {
      return searchTotals(this.blogDays);
    },
    blogMetrics() {
      return ["clicks", "impressions", "ctr", "position"].map((key) => ({
        key,
        label: this.$t(`global.article.search_console.${key}`),
        series: [
          {
            name: this.$t(`global.article.search_console.${key}`),
            data: searchPoints(this.blogDays, key, this.start, this.end),
          },
        ],
        sparkOptions: this.blogChartOptions(key, true),
      }));
    },
    selectedBlogMetric() {
      return (
        this.blogMetrics.find((metric) => metric.key === this.blogMetric) ||
        this.blogMetrics[0]
      );
    },
    blogTrendOptions() {
      return this.blogChartOptions(this.blogMetric);
    },
    blogShares() {
      return searchShares(this[this.blogDistribution]);
    },
    blogSource() {
      return Array.isArray(this.source)
        ? this.source.filter((row) => row && typeof row === "object")
        : [];
    },
    blogRowLimit() {
      return this.tab === 0
        ? this.queries_limit
        : this.tab === 1
          ? this.countries_limit
          : null;
    },
    blogArcs() {
      if (!(this.blogShares.total > 0)) return [];
      const circumference = Math.PI * 92;
      let offset = 0;
      const rows = this.blogShares.rows.filter((row) => row.value > 0);
      return rows.map((row, index) => {
        const length = circumference * row.share;
        const arc = {
          ...row,
          index,
          label: this.rowLabel(row, this.blogDistribution),
          mid: (offset + length / 2) / circumference,
          dash: `${Math.max(length - (rows.length > 1 ? 2.5 : 0), 0.5)} ${circumference}`,
          offset: -offset,
        };
        offset += length;
        return arc;
      });
    },
    blogCallouts() {
      const picked = [...this.blogArcs]
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .filter((arc) => arc.share >= 0.03)
        .map((arc) => {
          const angle = arc.mid * 2 * Math.PI - Math.PI / 2,
            cos = Math.cos(angle),
            sin = Math.sin(angle);
          return {
            ...arc,
            side: cos >= 0 ? 1 : -1,
            dot: [180 + 58 * cos, 96 + 58 * sin],
            elbow: [180 + 69 * cos, 96 + 69 * sin],
            y: 96 + 69 * sin,
          };
        });
      for (const side of [1, -1]) {
        const rows = picked
          .filter((callout) => callout.side === side)
          .sort((a, b) => a.y - b.y);
        rows.forEach((row, index) => {
          if (index) row.y = Math.max(row.y, rows[index - 1].y + 30);
        });
        const overflow = rows.length
          ? Math.max(0, rows[rows.length - 1].y - 174)
          : 0;
        rows.forEach((row) => (row.y = Math.max(22, row.y - overflow)));
      }
      return picked.map((row) => ({
        ...row,
        x: 180 + row.side * 93,
        anchor: row.side > 0 ? "start" : "end",
        label: row.label.length > 15 ? row.label.slice(0, 14) + "…" : row.label,
        points: [row.dot, row.elbow, [180 + row.side * 89, row.y]]
          .map((point) => point.join(","))
          .join(" "),
      }));
    },
    can_connect() {
      return !!(
        this.shop &&
        this.$route.params.shop_id &&
        !this.shop.search_console
      );
    },
    error_detail() {
      return typeof this.error_msg === "string"
        ? this.error_msg.slice(0, 4000)
        : "";
    },
    has_data() {
      return [this.queries, this.date, this.countries, this.appearance].some(
        (rows) => Array.isArray(rows) && rows.length > 0,
      );
    },
    audit_scope() {
      return `${this.shop?.id ?? "admin"}:${this.article?.id ?? ""}`;
    },
    url() {
      return window.location.href;
    },

    source() {
      switch (this.tab) {
        case 0:
          return this.queries;
        case 1:
          return this.countries;
        case 2:
          return this.appearance;
      }
      return this.countries;
    },

    key_title() {
      if (this.workspace || this.blog)
        return this.$t(
          `global.article.search_console.${["keyword", "country", "appearance"][this.tab] || "country"}`,
        );
      switch (this.tab) {
        case 0:
          return "Keyword";
        case 1:
          return "Country";
        case 2:
          return "Appearance";
      }
      return "";
    },
  },
  watch: {
    date() {
      // The installed chart wrapper strips formatter functions during option updates.
      if (this.blog) this.blogChartRevision++;
    },
    audit_scope() {
      if (this.workspace || this.blog) this.fetch();
    },
  },
  created() {
    this._auditRequest = 0;
    this.fetch();
  },
  beforeUnmount() {
    this._auditUnmounted = true;
    this._auditRequest++;
  },
  methods: {
    formatMetric(value, key) {
      const number = searchNumber(value);
      if (
        number === null ||
        (key === "position" && number < 1) ||
        (key === "ctr" && number > 1)
      )
        return "—";
      return numeral(number).format(
        key === "ctr" ? "0.[00]%" : key === "position" ? "0.[0]" : "0,0.[0]a",
      );
    },
    rowLabel(row, dimension) {
      const key =
        typeof row.keys === "string"
          ? row.keys
          : Array.isArray(row.keys)
            ? row.keys.join(" · ")
            : "—";
      if (dimension === "countries") return this.getCountryName(key) || key;
      if (dimension === "appearance") return this.getName(key.toLowerCase());
      try {
        return decodeURIComponent(key);
      } catch {
        return key;
      }
    },
    blogChartOptions(key, spark = false) {
      return {
        chart: {
          type: "line",
          sparkline: { enabled: spark },
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: false },
          fontFamily: "inherit",
          background: "transparent",
        },
        colors: ["#7655c9"],
        stroke: { width: spark ? 1.3 : 2, curve: "straight" },
        markers: { size: this.blogDays.length === 1 && !spark ? 3 : 0 },
        dataLabels: { enabled: false },
        legend: { show: false },
        grid: {
          show: !spark,
          borderColor: "var(--article-search-border)",
          strokeDashArray: 0,
          padding: { left: 8, right: 8 },
        },
        xaxis: {
          type: "datetime",
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            datetimeUTC: true,
            style: { colors: "var(--article-search-muted)", fontSize: "11px" },
          },
        },
        yaxis: {
          min: key === "position" ? undefined : 0,
          labels: {
            style: { colors: "var(--article-search-muted)", fontSize: "11px" },
            formatter: (value) => this.formatMetric(value, key),
          },
        },
        tooltip: {
          enabled: !spark,
          x: { format: "dd MMM yyyy" },
          y: { formatter: (value) => this.formatMetric(value, key) },
        },
        noData: { text: this.$t("global.article.search_console.daily_empty") },
      };
    },
    fetch() {
      if (this._auditUnmounted) return;
      const request = (this._auditRequest = (this._auditRequest || 0) + 1),
        scope = this.audit_scope;
      const current = () =>
        !this._auditUnmounted &&
        request === this._auditRequest &&
        (!(this.workspace || this.blog) || scope === this.audit_scope);
      if ((this.workspace || this.blog) && this._auditScope !== scope) {
        for (const key of [
          "queries",
          "date",
          "countries",
          "appearance",
          "domain",
          "page",
          "start",
          "end",
          "queries_limit",
          "countries_limit",
        ])
          this[key] = null;
        this.seriesHistory = [];
        this.chartOptionsHistory = {};
        this._auditScope = scope;
      }
      if (this.blog && !this.article?.id) {
        this.busy = false;
        return;
      }
      this.busy = true;

      this.error = false;
      this.error_msg = null;

      axios
        .get(
          this.shop
            ? window.ARTICLE_API.GET_ARTICLE_SEO_AUDIT(
                this.shop.id,
                this.article.id,
              )
            : window.ADMIN_API.GET_ARTICLE_SEO_AUDIT(this.article.id),
        )
        .then(({ data }) => {
          if (!current()) return;
          if (
            this.blog &&
            (!data ||
              typeof data !== "object" ||
              Array.isArray(data) ||
              (!data.error &&
                !["queries", "date", "countries", "appearance"].some((key) =>
                  Array.isArray(data[key]),
                )))
          ) {
            this.error = true;
            return;
          }
          if (data.error) {
            this.error = data.error;
            this.error_msg = data.error_msg;
          } else {
            this.queries = data.queries;
            this.date = data.date;
            this.countries = data.countries;
            this.appearance = data.appearance;

            this.domain = data.domain;
            this.page = data.page;
            this.start = data.start;
            this.end = data.end;
            this.queries_limit = data.queries_limit;
            this.countries_limit = data.countries_limit;
            this.cache = data.cache;

            if (!this.blog) this.initHistoryChart();
          }
        })
        .catch((error) => {
          if (!current()) return;
          if (this.workspace || this.blog) {
            this.error = true;
            this.error_msg =
              typeof error?.response?.data?.error_msg === "string"
                ? error.response.data.error_msg
                : null;
          } else NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (current()) this.busy = false;
        });
    },

    initHistoryChart() {
      this.seriesHistory = [
        {
          name: "Impressions",
          data: this.arrOf("impressions"),
        },
        {
          name: "Position",
          data: this.arrOf("position"),
        },
        {
          name: "CTR",
          data: this.arrOf("ctr"),
        },
        {
          name: "Clicks",
          data: this.arrOf("clicks"),
        },
      ];
      this.chartOptionsHistory = {
        chart: {
          type: "area",
          fontFamily: "var(--font)",
          height: 220,
          stacked: false,
          events: {
            /*   selection: function (chart, e) {
              console.log(new Date(e.xaxis.min));
            },*/
          },
        },
        colors: ["#e3e3e3", "rgba(225,4,96,0.41)", "#FFA000", "#1976D2"],

        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 0,
          curve: "smooth",
        },
        fill: {
          type: "color",
        },
        legend: {
          position: "bottom",
          horizontalAlign: this.$vuetify.locale.isRtl ? "right" : "left",
        },
        xaxis: {
          type: "datetime",
          formatter: function (value, timestamp, index) {
            return DateConverter.ConvertTimestampToShortString(value);
          },
        },
        yaxis: [
          {
            seriesName: "Impressions",
            labels: {
              formatter: function (val, i) {
                return numeral(val).format("0.[0]a");
              },
            },
            show: false,
          },
          {
            seriesName: "Position",
            opposite: true,
            min: 0,
            max: 200,
            labels: {
              formatter: function (val, i) {
                return numeral(val).format("0.[0]a");
              },
            },
            show: false,
          },
          {
            seriesName: "CTR",
            min: 0,
            max: 100,
            labels: {
              formatter: function (val, i) {
                return numeral(val).format("0.[0]a");
              },
            },
            show: false,
          },
          {
            seriesName: "Clicks",
            labels: {
              formatter: function (val, i) {
                return numeral(val).format("0.[0]a");
              },
            },
          },
        ],

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

        title: {
          text: "Performance",
          floating: true,
          offsetY: 0,
          align: "center",
          style: {
            color: "#444",
          },
        },
      };
    },

    arrOf(key) {
      const out = (this.date || []).map((h) => {
        return {
          x: new Date(h.keys).getTime(),
          y: h[key] ? h[key] : 0,
        };
      });
      // console.log("out", out);
      return out;
    },
  },
};
</script>

<style lang="scss" scoped>
.s-article-search-blog {
  --article-search-ink: rgb(var(--v-theme-on-surface));
  --article-search-muted: rgba(var(--v-theme-on-surface), 0.66);
  --article-search-border: rgba(var(--v-theme-on-surface), 0.1);
  --article-search-inset: rgba(var(--v-theme-on-surface), 0.035);
  position: relative;
  min-width: 0;
  padding: 24px;
  border-radius: 14px;
  color: var(--article-search-ink);
  background: rgb(var(--v-theme-surface));
  font-family: inherit;
  font-size: 12px;
  line-height: 1.7;

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-block-end: 20px;
  }
  &__header > img {
    flex: none;
    margin-block-start: 4px;
  }
  &__heading {
    flex: 1;
    min-width: 0;
  }
  &__heading h2 {
    margin: 0 !important;
    font-size: 18px !important;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.25px;
  }
  &__heading p,
  &__section-header p {
    margin: 5px 0 0;
    color: var(--article-search-muted);
    font-size: 12px;
    line-height: 1.7;
  }
  &__heading &__period {
    font-size: 11px;
  }
  &__button.v-btn {
    min-height: 36px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
    text-transform: none;
    letter-spacing: 0;
  }
  &__progress {
    position: absolute;
    inset: 0 0 auto;
  }
  h3 {
    margin: 0 !important;
    font-size: 14px !important;
    font-weight: 600;
    line-height: 1.4;
  }
  &__page {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
    margin: 0 0 14px;
    color: var(--article-search-muted);
    overflow-wrap: anywhere;
  }
  &__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    padding-block: 18px;
    border-block: 1px solid var(--article-search-border);
  }
  &__metric {
    display: block;
    min-width: 0;
    padding: 0 0 10px;
    border: 0;
    border-block-end: 2px solid transparent;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
  }
  &__metric[aria-pressed="true"] {
    border-block-end-color: #7655c9;
  }
  &__metric:focus-visible,
  &__tabs button:focus-visible,
  &__select select:focus-visible,
  &__table-scroll:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__metric-label {
    display: block;
    color: var(--article-search-muted);
    font-size: 11px;
  }
  &__metric-value {
    display: block;
    margin-block: 6px;
    font-size: 24px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    line-height: 1.4;
  }
  &__footnote {
    margin: 12px 0 0;
    color: var(--article-search-muted);
    font-size: 11px;
    line-height: 1.7;
  }
  &__chart-heading {
    margin-block: 22px 8px;
  }
  &__trend {
    min-width: 0;
    min-height: 220px;
  }
  &__trend :deep(.apexcharts-tooltip) {
    border-color: var(--article-search-border);
    background: rgb(var(--v-theme-surface));
    color: var(--article-search-ink);
    box-shadow: 0 4px 16px rgba(var(--v-theme-on-surface), 0.1);
  }
  &__trend :deep(.apexcharts-tooltip-title) {
    border-color: var(--article-search-border);
    background: var(--article-search-inset);
  }
  &__distribution {
    margin-block-start: 22px;
    padding-block-start: 22px;
    border-block-start: 1px solid var(--article-search-border);
  }
  &__section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    margin-block-end: 14px;
  }
  &__select select {
    max-width: 100%;
    min-height: 36px;
    padding: 6px 10px;
    border: 1px solid var(--article-search-border);
    border-radius: 7px;
    background: rgb(var(--v-theme-surface));
    color: inherit;
    font: inherit;
  }
  &__distribution-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: 28px;
  }
  &__donut {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  &__callout polyline {
    stroke: var(--article-search-muted);
    stroke-width: 1;
    opacity: 0.6;
  }
  &__callout text {
    fill: var(--article-search-ink);
    font-size: 12px;
    font-weight: 500;
  }
  &__callout &__donut-percent {
    fill: var(--article-search-muted);
    font-size: 11px;
    font-weight: 400;
  }
  &__donut-total {
    fill: var(--article-search-ink);
    text-anchor: middle;
    font-size: 20px;
    font-weight: 500;
  }
  &__donut-unit {
    fill: var(--article-search-muted);
    text-anchor: middle;
    font-size: 11px;
  }
  &__shares {
    display: grid;
    gap: 12px;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__share-label {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-block-end: 6px;
  }
  &__share-label > span:first-child {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__share-label > span:last-child {
    flex: none;
    color: var(--article-search-muted);
    font-variant-numeric: tabular-nums;
  }
  &__share-track {
    display: block;
    height: 4px;
    border-radius: 2px;
    background: var(--article-search-inset);
    overflow: hidden;
  }
  &__share-track > span {
    display: block;
    height: 100%;
  }
  &__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-block-start: 22px;
    border-block-end: 1px solid var(--article-search-border);
  }
  &__tabs button {
    min-height: 36px;
    padding: 10px 12px;
    border: 0;
    border-block-end: 2px solid transparent;
    background: transparent;
    color: var(--article-search-muted);
    font: inherit;
  }
  &__tabs button[aria-pressed="true"] {
    border-block-end-color: #7655c9;
    color: var(--article-search-ink);
  }
  &__table-scroll {
    max-width: 100%;
    margin-block-start: 12px;
    overflow-x: auto;
  }
  &__table {
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    text-align: start;
    font-size: 12px;
  }
  &__table th,
  &__table td {
    padding: 12px 8px;
    border-block-end: 1px solid var(--article-search-border);
    text-align: end;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  &__table th {
    color: var(--article-search-muted);
    font-size: 11px;
    font-weight: 500;
  }
  &__table th:first-child,
  &__table td:first-child {
    min-width: 145px;
    max-width: 440px;
    padding-inline-start: 0;
    text-align: start;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  &__state {
    padding: 70px 20px;
    text-align: center;
  }
  &__state > .v-icon {
    margin-block-end: 14px;
    color: var(--article-search-muted);
  }
  &__state > p {
    margin: 6px 0 0;
    color: var(--article-search-muted);
  }
  &__state > .v-btn {
    margin-block-start: 20px;
  }
  &__state details {
    max-width: 640px;
    margin: 18px auto 0;
    color: var(--article-search-muted);
  }
  &__state details p {
    margin: 8px 0 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  &__state summary {
    width: fit-content;
    min-height: 36px;
    margin-inline: auto;
  }
  &__empty {
    margin: 0;
    padding-block: 24px;
    color: var(--article-search-muted);
  }
  &__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (max-width: 700px) {
    padding: 20px 14px;
    &__header {
      flex-wrap: wrap;
    }
    &__heading {
      flex-basis: calc(100% - 38px);
    }
    &__header > .v-btn {
      margin-inline-start: 38px;
    }
    &__metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__distribution-body {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }
  }
  @media (pointer: coarse), (max-width: 600px) {
    &__button.v-btn,
    &__tabs button,
    &__select select,
    &__state summary {
      min-height: 44px;
    }
    &__select select {
      font-size: 16px;
    }
  }
}
.s-article-search-console--workspace {
  min-width: 0;
  font-family: inherit;
  font-size: 12px;
  line-height: 19px;
  .s-article-search-console__loading { margin: 0 0 12px; color: var(--sd-modern-muted); }
  .s-article-search-console__notice { display: flex; align-items: flex-start; gap: 12px; padding: 16px; margin-block-end: 18px; }
  .s-article-search-console__notice > .v-icon { flex-shrink: 0; margin-block-start: 2px; }
  .s-article-search-console__notice-copy { min-width: 0; flex: 1; }
  .s-article-search-console__notice h3, .s-article-search-console__empty h3 { margin: 0 0 4px; font-size: 13px !important; font-weight: 500; line-height: 20px; } // Legacy article headings declare their size with !important.
  .s-article-search-console__notice p, .s-article-search-console__empty p { margin: 0; color: rgb(var(--v-theme-on-surface)); font-size: 12px; line-height: 19px; }
  .s-article-search-console__notice-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; align-self: center; }
  .s-article-search-console__details { margin-block-start: 8px; color: var(--sd-modern-muted); }
  .s-article-search-console__details summary { width: fit-content; cursor: pointer; }
  .s-article-search-console__details p { margin-block-start: 7px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .s-article-search-console__page { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-block-end: 12px; overflow-wrap: anywhere; color: var(--sd-modern-muted); }
  .s-article-search-console__page b { font-weight: 400; }
  .s-article-search-console__tabs { border-block-end: 1px solid var(--sd-modern-border); }
  .s-article-search-console__tabs :deep(.v-tab) { font-family: inherit; font-size: 12px; font-weight: 400; letter-spacing: 0; text-transform: none; }
  .s-article-search-console__table { font-family: inherit; font-size: 12px; }
  .s-article-search-console__table td { font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  .s-article-search-console__table .s-article-search-console__empty-row { text-align: center; padding: 28px 16px; color: var(--sd-modern-muted); }
  .s-article-search-console__empty { padding: 32px 20px; }
  .s-article-search-console__empty > .v-icon { color: var(--sd-modern-muted); margin-block-end: 8px; }
}
@media (max-width: 680px) {
  .s-article-search-console--workspace .s-article-search-console__notice { flex-wrap: wrap; }
  .s-article-search-console--workspace .s-article-search-console__notice-actions { width: 100%; padding-inline-start: 31px; }
}
@media (max-width: 680px), (pointer: coarse) {
  .s-article-search-console--workspace .s-article-search-console__details summary { box-sizing: border-box; min-width: 44px; min-height: 44px; padding-block: 12px; }
}
</style>

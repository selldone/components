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

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import numeral from "numeral";
import UProgressScore from "../../ui/progress/score/UProgressScore.vue";

export default {
  name: "SArticleSearchConsole",
  components: { UProgressScore },
  props: {
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

      seriesHistory: [],
      chartOptionsHistory: {},
    };
  },

  computed: {
    can_connect() {
      return !!(this.shop && this.$route.params.shop_id && !this.shop.search_console);
    },
    error_detail() { return typeof this.error_msg === 'string' ? this.error_msg.slice(0, 4000) : ''; },
    has_data() { return [this.queries, this.date, this.countries, this.appearance].some((rows) => Array.isArray(rows) && rows.length > 0); },
    audit_scope() { return `${this.shop?.id ?? 'admin'}:${this.article.id}`; },
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
      if (this.workspace) return this.$t(`global.article.search_console.${['keyword', 'country', 'appearance'][this.tab] || 'country'}`);
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
    audit_scope() { if (this.workspace) this.fetch(); },
  },
  created() {
    this._auditRequest = 0;
    this.fetch();
  },
  beforeUnmount() { this._auditUnmounted = true; this._auditRequest++; },
  methods: {
    fetch() {
      if (this._auditUnmounted) return;
      const request = this._auditRequest = (this._auditRequest || 0) + 1, scope = this.audit_scope;
      const current = () => !this._auditUnmounted && request === this._auditRequest && (!this.workspace || scope === this.audit_scope);
      if (this.workspace && this._auditScope !== scope) {
        for (const key of ['queries', 'date', 'countries', 'appearance', 'domain', 'page', 'start', 'end', 'queries_limit', 'countries_limit']) this[key] = null;
        this.seriesHistory = [];
        this.chartOptionsHistory = {};
        this._auditScope = scope;
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

            this.initHistoryChart();
          }
        })
        .catch((error) => {
          if (!current()) return;
          if (this.workspace) {
            this.error = true;
            this.error_msg = typeof error?.response?.data?.error_msg === 'string' ? error.response.data.error_msg : null;
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

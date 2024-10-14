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
  <div class="text-start position-relative pa-3">
    <b class="small pen"
      ><img height="16" src="../../assets/trademark/google.svg" width="16" />
      Google Search</b
    >

    <u-loading-progress v-if="busy"></u-loading-progress>

    <div v-if="busy">
      <v-skeleton-loader
        class="mt-2"
        :type="['table-thead', 'table', 'card']"
      ></v-skeleton-loader>
    </div>
    <div
      v-else-if="error"
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
    <div v-else class="mt-2">
      <div class="small mb-2">
        <v-icon class="me-1" size="small">link</v-icon>
        Page: <b>{{ page }}</b>

        <flag
          v-for="(c, index) in countries?.limit(5)"
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
        align-tabs="center"
        center-active
        class="my-2"
        grow
        hide-slider
      >
        <v-tab>
          <v-icon class="me-1" size="small">search</v-icon>
          Keywords
        </v-tab>
        <v-tab>
          <v-icon class="me-1" size="small">public</v-icon>
          Countries
        </v-tab>
        <v-tab>
          <v-icon class="me-1" size="small">grade</v-icon>
          Appearance
        </v-tab>
      </v-tabs>

      <v-table class="thin-scroll" fixed-header height="350" density="compact">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>{{ key_title }}</th>
              <th>
                <v-icon class="me-1" size="small">visibility</v-icon>
                Impressions
              </th>
              <th>
                <v-icon class="me-1" size="small">ads_click</v-icon>
                Clicks
              </th>
              <th>
                <v-icon class="me-1" size="small">bolt</v-icon>
                CTR
              </th>
              <th>
                <v-icon class="me-1" size="small">radar</v-icon>
                Position
              </th>
            </tr>
          </thead>
          <tbody>
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
  </div>
</template>

<script>
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import numeral from "numeral";
import UProgressScore from "../../ui/progress/score/UProgressScore.vue";

export default {
  name: "SArticleSearchConsole",
  components: { UProgressScore },
  props: {
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
  created() {
    this.fetch();
  },
  methods: {
    fetch() {
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
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
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
      const out = this.date.map((h) => {
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

<style scoped></style>

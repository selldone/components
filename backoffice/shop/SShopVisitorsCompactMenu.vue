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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-menu :close-on-content-click="false" open-on-hover  z-index="100">
    <template v-slot:activator="{ props }">
      <div v-bind="props">
        <h6 class="single-line">
          <span :title="'Unique visitors: ' + total_visitors">
            <i class="fas fa-users" />

            {{ numeralFormat(total_visitors, "0.[0]a") }}
          </span>
          <i class="fas fa-long-arrow-alt-right mx-1" />

          <span :title="'Page views: ' + page_views">
            <i class="fas fa-mouse" />
            {{ numeralFormat(page_views, "0.[0]a") }}
          </span>
        </h6>

        <p class="text-muted mb-0">
          <small>{{ $t("user_dashboard.shops.shop_card.page_views") }}</small>

          <s-donut-chart
            :sections="pie_values"
            :size="24"
            unit="px"
            :thickness="40"
            class="d-inline-block ms-2"
            style="vertical-align: middle"
            :has-legend="false"
            :total="total_visitors ? total_visitors : 1"
            :background="dark ? SaminColorDark : '#fff'"
          >
          </s-donut-chart>
        </p>
      </div>
    </template>

    <v-card class="p-2" max-width="320" rounded="xl">
      <apexchart
        v-if="has_visitors"
        :width="300"
        :height="200"
        type="donut"
        :options="options_visitors"
        :series="series_visitors"
      />
      <p v-else class="m-2 text-muted">No data</p>
    </v-card>
  </v-menu>
</template>

<script>
import SDonutChart from "@components/chart/donut/SDonutChart.vue";

export default {
  name: "SShopVisitorsCompactMenu",
  components: { SDonutChart },
  props: {
    lastData: {
      required: true,
      type: Object,
    },
    dark: Boolean,
  },

  data() {
    return {
      options_visitors: {
        chart: {
          fontFamily: "var(--font)",
        },
        colors: ["#FFA000", "#C2185B"],
        labels: [
          this.$t("shop_visitors_widget.returning_visitors"),
          this.$t("shop_visitors_widget.new_visitors"),
        ],
        legend: {
          position: "bottom",
        },

        dataLabels: {
          enabled: true,
          formatter: function (value, timestamp, index) {
            return Math.round(value) + "%";
          },
        },

        plotOptions: {
          pie: {
            donut: {
              size: "30%",
            },
          },
        },
      },
    };
  },

  computed: {
    pie_values() {
      return [
        {
          value: this.returning_visitors,
          label: "Returning",
          color: "#FFA000",
        },
        {
          value: this.new_visitors,
          label: "New",
          color: "#C2185B",
        },
      ];
    },

    series_visitors() {
      return [this.returning_visitors, this.new_visitors];
    },

    views() {
      return this.lastData.views ? this.lastData.views : 0;
    },

    new_visitors() {
      return this.lastData.new_visitors ? this.lastData.new_visitors : 0;
    },

    returning_visitors() {
      return this.lastData.returning_visitors
        ? this.lastData.returning_visitors
        : 0;
    },
    total_visitors() {
      return this.new_visitors + this.returning_visitors;
    },

    page_views() {
      return this.lastData.page_views ? this.lastData.page_views : 0;
    },

    has_visitors() {
      return this.returning_visitors || this.new_visitors;
    },
  },
  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>

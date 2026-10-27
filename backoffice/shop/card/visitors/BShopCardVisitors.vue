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
  <v-menu :close-on-content-click="false" open-on-hover z-index="100">
    <template v-slot:activator="{ props }">
      <component
        :is="modern ? 'button' : 'div'"
        v-bind="props"
        :type="modern ? 'button' : undefined"
        :class="{ 'b-shop-card-visitors--modern': modern }"
        :aria-label="modern ? modern_summary_label : undefined"
      >
        <v-tooltip
          v-if="modern"
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
          >{{ $t("user_dashboard.shops.modern.visitor_details") }}</v-tooltip
        >
        <span v-if="modern" class="b-shop-card-visitors__caption">
          {{ $t("user_dashboard.shops.modern.unique_visitors") }}
        </span>
        <h6 :class="{ 'single-line': !modern }">
          <span
            :title="
              modern
                ? $t('user_dashboard.shops.modern.unique_visitors') +
                  ': ' +
                  (total_visitors === null ? '—' : total_visitors)
                : 'Unique visitors: ' + total_visitors
            "
          >
            <i v-if="!modern" class="fas fa-users" />

            {{
              total_visitors === null
                ? "—"
                : numeralFormat(total_visitors, "0a")
            }}
          </span>
          <i
            v-if="!modern"
            class="fas fa-long-arrow-alt-right mx-1 flip-rtl small"
          />

          <span
            v-if="!modern"
            :title="
              modern
                ? $t('user_dashboard.shops.shop_card.page_views') +
                  ': ' +
                  (page_views === null ? '—' : page_views)
                : 'Page views: ' + page_views
            "
          >
            <i class="fas fa-mouse" />
            {{ page_views === null ? "—" : numeralFormat(page_views, "0a") }}
          </span>
        </h6>

        <p v-if="!modern" class="text-muted mb-0">
          <small>{{ $t("user_dashboard.shops.shop_card.page_views") }}</small>

          <u-chart-donut
            :background="dark ? ThemeColorDark : '#fff'"
            :has-legend="false"
            :sections="pie_values"
            :size="24"
            :thickness="40"
            :total="total_visitors ? total_visitors : 1"
            class="d-inline-block ms-2"
            style="vertical-align: middle"
            unit="px"
          >
          </u-chart-donut>
        </p>
      </component>
    </template>

    <v-card
      class="p-2"
      :class="{ 'sd-modern-widget text-start': modern }"
      max-width="320"
      rounded="xl"
    >
      <apexchart
        v-if="has_visitors"
        :height="200"
        :options="options_visitors"
        :series="series_visitors"
        :width="modern ? '100%' : 300"
        type="donut"
      />
      <p v-else class="m-2 text-muted">
        {{ modern ? $t("global.commons.no_data") : "No data" }}
      </p>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import UChartDonut from "../../../../ui/chart/donut/UChartDonut.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "BShopCardVisitors",
  mixins: [TemplateMixin],

  components: { UChartDonut },
  props: {
    modern: Boolean,
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
    modern_summary_label() {
      return `${this.$t("user_dashboard.shops.modern.visitor_details")}, ${this.$t("user_dashboard.shops.modern.unique_visitors")}: ${this.total_visitors === null ? "—" : this.total_visitors}, ${this.$t("user_dashboard.shops.shop_card.page_views")}: ${this.page_views === null ? "—" : this.page_views}`;
    },
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
      if (this.modern) return this.observed("new_visitors");
      return this.lastData.new_visitors ? this.lastData.new_visitors : 0;
    },

    returning_visitors() {
      if (this.modern) return this.observed("returning_visitors");
      return this.lastData.returning_visitors
        ? this.lastData.returning_visitors
        : 0;
    },
    total_visitors() {
      if (
        this.modern &&
        (this.new_visitors === null || this.returning_visitors === null)
      )
        return null;
      return this.new_visitors + this.returning_visitors;
    },

    page_views() {
      if (this.modern) return this.observed("page_views");
      return this.lastData.page_views ? this.lastData.page_views : 0;
    },

    has_visitors() {
      if (this.modern && this.total_visitors === null) return false;
      return this.returning_visitors || this.new_visitors;
    },
  },
  mounted() {},

  methods: {
    observed(key) {
      const value = this.lastData[key];
      return (typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "")) &&
        Number.isFinite(Number(value))
        ? Number(value)
        : null;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shop-card-visitors--modern {
  font-family: inherit;
  font-weight: 400;
  line-height: inherit;
  text-align: start;
  border: 0;
  padding: 0;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  .b-shop-card-visitors__caption {
    display: block;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 11px;
    font-weight: 400;
    margin-bottom: 3px;
  }
  h6 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    font-family: inherit;
    font-size: 22px;
    font-weight: 400;
    line-height: 1.25;
    letter-spacing: -0.3px;
    margin: 0;
    font-variant-numeric: tabular-nums;
    > span {
      white-space: nowrap;
    }
  }
  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 4px;
  }
  @media (max-width: 799px), (pointer: coarse) {
    min-height: 44px;
  }
}
</style>

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
  <component
    :is="modern ? 'section' : 's-widget-box'"
    :class="{
      'b-product-analytics b-product-inventory-modern sd-modern-widget text-start':
        modern,
    }"
    :icon="
      modern
        ? undefined
        : isFile
          ? 'storage'
          : isSubscription
            ? 'subscriptions'
            : 'fa:fas fa-boxes'
    "
    :sub-title="
      modern
        ? undefined
        : isSubscription
          ? $t('product_admin.dashboard.inventory.subscribers_title_small')
          : $t('product_admin.dashboard.inventory.title_small')
    "
    :title="
      modern
        ? undefined
        : isSubscription
          ? `<h5 class='align-items-center pb-1'>    <span class='circle bg-pink-soft mr-sm' style='font-size: 6px;'></span>  ${$t(
              'product_admin.dashboard.inventory.subscribers_title',
            )}</h5>`
          : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
              'product_admin.dashboard.inventory.title',
            )}</h5>`
    "
    extended
  >
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="18" aria-hidden="true">inventory_2</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{
              $t(
                isSubscription
                  ? "product_admin.dashboard.inventory.subscribers_title"
                  : "product_admin.dashboard.inventory.title",
              )
            }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("b_product_dashboard.analytics.inventory_subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        :to="{ name: 'BPageProductInventory' }"
        variant="text"
        class="sd-modern-button sd-modern-button--small"
        >{{ $t("global.commons.manage")
        }}<v-icon size="16" class="ms-1">arrow_forward</v-icon></v-btn
      >
    </header>
    <h2
      :class="
        modern
          ? 'b-product-inventory-modern__value'
          : 'text-h3 font-weight-black'
      "
    >
      <v-icon v-if="isFile" :title="$t('global.commons.infinite')" size="large"
        >all_inclusive
      </v-icon>

      <span
        v-else-if="isSubscription"
        :class="
          !modern && product.subscribers_count
            ? 'bg-pink-soft text-gradient'
            : ''
        "
        >{{ numeralFormat(product.subscribers_count, "0,0.[0] a") }}</span
      >
      <span v-else>{{ numeralFormat(product.quantity, "0,0.[0] a") }}</span>
    </h2>

    <div
      ref="chart"
      class="scrollable-element-light"
      style="overflow-x: auto; overflow-y: hidden; display: flex"
    >
      <u-chart-funnel
        :animated="!modern"
        :key="modern ? chartWidth : undefined"
        :modern="modern"
        :sparse-labels="modern"
        :colors="colors"
        :direction="direction"
        :display-percentage="false"
        :gradient-direction="gradientDirection"
        :height="140"
        :labels="labels"
        :sub-labels="subLabels"
        :values="values"
        :width="modern ? chartWidth : widthFunnelFinance"
        class=""
        dense
        sub-label-value="value"
        :no-legend="!modern"
      />
    </div>
    <v-row class="text-center mt-2">
      <v-col cols="12" sm="4">
        <h4 :class="modern ? 'b-product-inventory-modern__metric' : 'text-h4'">
          {{ numeralFormat(product.sells, "0,0") }}
        </h4>
        <small>
          <v-icon class="me-1">fa:fas fa-cash-register</v-icon>
          {{ $t("product_admin.dashboard.inventory.total_sell") }}
        </small>
      </v-col>

      <v-col cols="12" sm="4">
        <h4 :class="modern ? 'b-product-inventory-modern__metric' : 'text-h4'">
          {{ numeralFormat(totalSellsFor30days, "0,0") }}
        </h4>
        <component :is="modern ? 'button' : 'small'" :type="modern ? 'button' : undefined" :class="{ 'b-product-inventory-modern__period': modern }" :aria-label="modern ? periodSalesScope : undefined" @click="periodScopeOpen = true" @keydown.esc="periodScopeOpen = false">
          <v-icon class="me-1">fa:fas fa-calendar</v-icon>
          {{
            modern ? $t("b_product_dashboard.analytics.period_sales") + " · " + compactPeriod : periodSalesScope
          }}
          <v-tooltip v-if="modern" v-model="periodScopeOpen" activator="parent" location="top" open-on-focus :open-on-click="false" content-class="sd-modern-tooltip text-start">{{ periodSalesScope }}</v-tooltip>
        </component>
      </v-col>

      <v-col cols="12" sm="4">
        <h4 :class="modern ? 'b-product-inventory-modern__metric' : 'text-h4'">
          {{ numeralFormat(todayData.sell, "0,0") }}
        </h4>
        <small>
          <v-icon class="me-1">fa:fas fa-calendar-day</v-icon>
          {{ $t("product_admin.dashboard.inventory.total_sell_today") }}
        </small>
      </v-col>
    </v-row>
  </component>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UChartFunnel from "../../../../ui/chart/funnel/UChartFunnel.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BProductInventoryAbstractView",
  mixins: [DateMixin],

  components: { UChartFunnel, SWidgetBox },
  props: {
    modern: Boolean,
    product: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    chartWidth: 600,
    chartObserver: null,
    chartFrame: null,
    periodScopeOpen: false,
    colors: [
      ["#0288D1", "#303F9F"], // color set for "Buy" segment
      ["#AFB42B", "#00796B"], // color set for "Buy" segment
    ],
    direction: "horizontal",
    gradientDirection: "horizontal",
  }),

  mounted() {
    if (!this.modern || !this.$refs.chart) return;
    let pendingWidth = this.chartWidth;
    this.chartObserver = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      if (width <= 0) return;
      pendingWidth = width;
      if (this.chartFrame !== null || width === this.chartWidth) return;
      // Funnel geometry updates belong after ResizeObserver delivery.
      this.chartFrame = requestAnimationFrame(() => {
        this.chartFrame = null;
        if (pendingWidth !== this.chartWidth) this.chartWidth = pendingWidth;
      });
    });
    this.chartObserver.observe(this.$refs.chart);
  },
  beforeUnmount() {
    this.chartObserver?.disconnect();
    if (this.chartFrame !== null) cancelAnimationFrame(this.chartFrame);
    this.chartFrame = null;
  },

  computed: {
    compactPeriod() {
      try {
        const start = new Date(this.timeSeries.startDate);
        const end = new Date(this.timeSeries.endDate);
        const locale = window.$language?.full_locale;
        const calendar = window.$language?.calendar.calendar;
        const years = new Intl.DateTimeFormat(locale, { calendar, year: "numeric" });
        return new Intl.DateTimeFormat(locale, {
          calendar, month: "short", day: "numeric",
          ...(years.format(start) !== years.format(end) ? { year: "numeric" } : {}),
        }).formatRange(start, end);
      } catch {
        return this.getLocalDateString(this.timeSeries.startDate) + " – " + this.getLocalDateString(this.timeSeries.endDate);
      }
    },
    periodSalesScope() {
      return this.$t("product_admin.dashboard.inventory.total_sell_timespan", {
        start: this.getLocalDateString(this.timeSeries.startDate),
        end: this.getLocalDateString(this.timeSeries.endDate),
      });
    },
    isFile() {
      return this.product.type === ProductType.FILE.code;
    },

    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },

    subLabels() {
      return this.$tm("product_admin.dashboard.inventory.chart.labels");
    },

    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    widthFunnelFinance() {
      if (!this.timeSeries.count) return 200;
      return 200 + 50 * this.timeSeries.count;
    },

    labels() {
      let out = [];
      this.timeSeries.raw_data.forEach((item) => {
        out.push(this.getLocalTimeString(item.created_at, false, true));
      });

      return out;
    },

    values() {
      let out = [];

      this.timeSeries.raw_data.forEach((item) => {
        let count = item.count ? item.count : 0;
        let sell = item.sell ? item.sell : 0;

        out.push([count, sell]);
      });

      return out;
    },

    totalSellsFor30days() {
      return this.timeSeries.totalOf("sell");
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-inventory-modern {
  &__value {
    margin: 0 0 12px;
    font-size: 26px;
    font-weight: 500;
    line-height: 36px;
  }
  &__metric {
    margin: 0;
    font-size: 22px;
    font-weight: 400;
    line-height: 30px;
  }
  &__period {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: help;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--sd-modern-muted);
    font: inherit;
    font-size: 12px;
    line-height: 19px;
    text-align: start;
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }
  small {
    font-size: 12px;
    line-height: 19px;
    color: var(--sd-modern-muted);
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__period { min-height: 44px; }
  }
}
</style>

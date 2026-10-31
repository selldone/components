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
  <component
    :is="modern ? 'section' : 's-widget-box'"
    :class="{
      'b-product-analytics b-product-orders-modern sd-modern-widget text-start':
        modern,
    }"
    :color="modern ? undefined : ThemeColorDark"
    :sub-title="
      modern ? undefined : $t('product_admin.dashboard.orders.title_small')
    "
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-amber mr-sm' style='font-size: 6px;'></span>  ${$t(
            'product_admin.dashboard.orders.title',
          )} </h5>`
    "
    :dark="!modern"
    :icon="modern ? undefined : 'ring_volume'"
    icon_color="#fff"
  >
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="18" aria-hidden="true">shopping_bag</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("b_product_dashboard.analytics.orders_title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("b_product_dashboard.analytics.queue_scope") }}
          </p>
        </div>
      </div>
      <v-btn
        :to="{ name: 'BPageProductOrders' }"
        variant="text"
        class="sd-modern-button sd-modern-button--small"
        >{{ $t("global.commons.orders")
        }}<v-icon size="16" class="ms-1">arrow_forward</v-icon></v-btn
      >
    </header>
    <h2
      :class="
        modern ? 'b-product-orders-modern__value' : 'text-h3 font-weight-black'
      "
    >
      {{ numeralFormat(totalPendingOrders, "0,0.[0] a") }}
    </h2>

    <div class="my-2 small">
      {{ $t("product_admin.dashboard.orders.physical_orders_title") }}
    </div>

    <orders-que
      :order-que="orderQue"
      :type="product.type"
      :dark="!modern"
      :modern="modern"
    ></orders-que>

    <v-spacer></v-spacer>
    <component :is="modern ? 'button' : 'div'" :type="modern ? 'button' : undefined" class="my-2 small" :class="{ 'b-product-orders-modern__period': modern }" :aria-label="modern ? periodFulfillmentScope : undefined" @click="periodScopeOpen = true" @keydown.esc="periodScopeOpen = false">
      {{
        modern ? $t(isFile ? "b_product_dashboard.analytics.period_downloads" : "b_product_dashboard.analytics.period_shipments") + " · " + compactPeriod : periodFulfillmentScope
      }}
      <v-tooltip v-if="modern" v-model="periodScopeOpen" activator="parent" location="top" open-on-focus :open-on-click="false" content-class="sd-modern-tooltip text-start">{{ periodFulfillmentScope }}</v-tooltip>
    </component>

    <time-series-inline-chart
      :colors="[productType.color]"
      :height="80"
      :keys="['send']"
      :time-series="timeSeries"
      :value-titles="[
        (isFile
          ? $t('global.actions.download')
          : $t('global.delivery_state.to_customer')) + ' : ',
      ]"
      class="w-100 pointer-pointer"
      :dark="!modern"
      :glow="!modern"
      :flat-color="modern"
      start-zero-category-bug
      type="bar"
    ></time-series-inline-chart>
  </component>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import OrdersQue from "../../../order-que/OrdersQue.vue";
import TimeSeriesInlineChart from "../../../chart/TimeSeriesInlineChart.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BProductOrdersAbstractView",
  mixins: [TemplateMixin, DateMixin],

  components: { TimeSeriesInlineChart, OrdersQue, SWidgetBox },
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

    orderQue: {
      required: true,
      type: Array,
    },
  },

  data: () => ({ ProductType: ProductType, periodScopeOpen: false }),

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
    periodFulfillmentScope() {
      return this.$t(this.isFile ? "product_admin.dashboard.orders.downloads_count_in_period" : "product_admin.dashboard.orders.send_count_in_period", {
        start: this.getLocalDateString(this.timeSeries.startDate),
        end: this.getLocalDateString(this.timeSeries.endDate),
      });
    },
    productType() {
      return ProductType[this.product.type];
    },
    isFile() {
      return this.product.type === ProductType.FILE.code;
    },

    totalPendingOrders() {
      let out = 0;
      this.orderQue.forEach((item) => (out += item.count));
      return out;
    },
  },

  methods: {},
};
</script>

<style scoped lang="scss">
.b-product-orders-modern {
  &__period {
    display: inline-flex;
    white-space: nowrap;
    cursor: help;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }
  &__value {
    margin: 0;
    font-size: 26px;
    font-weight: 500;
    line-height: 36px;
  }
  .small {
    font-size: 12px;
    line-height: 19px;
    color: var(--sd-modern-muted);
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__period { min-height: 44px; }
  }
}
</style>

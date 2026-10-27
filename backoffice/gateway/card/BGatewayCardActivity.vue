<template>
  <div class="b-gateway-card-activity text-start">
    <div class="b-gateway-card-activity__plots">
      <div class="b-gateway-card-activity__metric">
        <span class="b-gateway-card-activity__label">{{
          $t("shop_gateway.dashboard.gateway_data_widget.modern.paid_amount")
        }}</span>
        <strong class="b-gateway-card-activity__value">
          <u-price :amount="totals.amount" :currency="currency" />
        </strong>
        <apexchart
          :key="chartKey + '-amount'"
          type="bar"
          height="82"
          width="100%"
          :options="amountOptions"
          :series="amountSeries"
          dir="ltr"
        />
      </div>
      <div class="b-gateway-card-activity__metric">
        <span class="b-gateway-card-activity__label">{{
          $t(
            "shop_gateway.dashboard.gateway_data_widget.modern.successful_payments",
          )
        }}</span>
        <strong class="b-gateway-card-activity__value">{{
          $n(totals.success)
        }}</strong>
        <apexchart
          :key="chartKey + '-count'"
          type="line"
          height="82"
          width="100%"
          :options="countOptions"
          :series="countSeries"
          dir="ltr"
        />
      </div>
    </div>
    <div class="b-gateway-card-activity__caption">
      <span>{{
        $t("widget_shop_gateway.modern.period", { days: $n(30) })
      }}</span>
      <span class="b-gateway-card-activity__legend">
        <span
          ><i aria-hidden="true" />{{
            $t(
              "shop_gateway.dashboard.gateway_data_widget.modern.created_payments",
            )
          }}</span
        >
        <span
          ><i class="b-gateway-card-activity__dash" aria-hidden="true" />{{
            $t(
              "shop_gateway.dashboard.gateway_data_widget.modern.successful_payments",
            )
          }}</span
        >
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import chroma from "chroma-js";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "BGatewayCardActivity",
  mixins: [CurrencyMixin],
  props: {
    dataPack: { type: Array, default: () => [] },
    currency: { type: String, required: true },
  },
  computed: {
    chartKey() {
      return (
        this.$vuetify.theme.name + "-" + this.$i18n.locale + "-" + this.currency
      );
    },
    daily() {
      // This list endpoint supplies day offsets for the last 30 days, not the dashboard's selected range.
      return Array.from({ length: 30 }, (_, index) => {
        const day = index - 29;
        const record = this.dataPack.find((row) => Number(row.day) === day);
        const value = (key) => {
          const amount = Number(record?.[key] ?? 0);
          return Number.isFinite(amount) ? amount : 0;
        };
        return {
          day,
          amount: value("amount"),
          count: value("count"),
          success: value("success"),
        };
      });
    },
    totals() {
      return this.daily.reduce(
        (total, row) => ({
          amount: total.amount + row.amount,
          success: total.success + row.success,
        }),
        { amount: 0, success: 0 },
      );
    },
    chartColors() {
      const colors =
        this.$vuetify.theme.computedThemes[this.$vuetify.theme.name].colors;
      return {
        primary: colors.primary,
        secondary: chroma
          .mix(colors.surface, colors["on-surface"], 0.58, "rgb")
          .hex(),
        grid: chroma
          .mix(colors.surface, colors["on-surface"], 0.09, "rgb")
          .hex(),
        text: chroma
          .mix(colors.surface, colors["on-surface"], 0.66, "rgb")
          .hex(),
      };
    },
    amountSeries() {
      return [
        {
          name: this.$t(
            "shop_gateway.dashboard.gateway_data_widget.modern.paid_amount",
          ),
          data: this.daily.map((row) => [row.day, row.amount]),
        },
      ];
    },
    countSeries() {
      return ["count", "success"].map((key, index) => ({
        name: this.$t(
          "shop_gateway.dashboard.gateway_data_widget.modern." +
            (index ? "successful_payments" : "created_payments"),
        ),
        data: this.daily.map((row) => [row.day, row[key]]),
      }));
    },
    amountOptions() {
      return this.chartOptions(true);
    },
    countOptions() {
      return this.chartOptions(false);
    },
  },
  methods: {
    chartOptions(amount) {
      const dark = this.$vuetify.theme.current.dark;
      return {
        chart: {
          background: "transparent",
          fontFamily: "var(--font)",
          foreColor: this.chartColors.text,
          sparkline: { enabled: true },
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: false },
          accessibility: {
            enabled: true,
            description: (amount ? this.amountSeries : this.countSeries)
              .map((series) => series.name)
              .join(", "),
            keyboard: { enabled: true, navigation: { enabled: true } },
          },
        },
        theme: { mode: dark ? "dark" : "light" },
        colors: [this.chartColors.primary, this.chartColors.secondary],
        grid: {
          show: true,
          borderColor: this.chartColors.grid,
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } },
          padding: { left: 0, right: 0, top: 8, bottom: 0 },
        },
        plotOptions: { bar: { columnWidth: "62%", borderRadius: 1 } },
        stroke: {
          width: amount ? 0 : [1.8, 1.5],
          curve: "straight",
          dashArray: amount ? 0 : [0, 4],
        },
        fill: { opacity: 1 },
        markers: { size: 0, hover: { size: 3 } },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
          type: "numeric",
          labels: { show: false },
          axisBorder: { show: false },
          crosshairs: { width: 1 },
        },
        yaxis: { show: false, tickAmount: 2, ...(amount ? {} : { min: 0 }) },
        tooltip: {
          shared: true,
          intersect: false,
          theme: dark ? "dark" : "light",
          x: {
            formatter: (day) =>
              Number(day) === 0
                ? this.$t("inline_chart.today")
                : this.$t("widget_shop_gateway.modern.days_ago", {
                    days: this.$n(Math.abs(Number(day))),
                  }),
          },
          y: {
            formatter: (value) =>
              amount
                ? this.FormatNumberCurrency(value, this.currency) +
                  " " +
                  this.currency
                : this.$n(value),
          },
        },
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.b-gateway-card-activity {
  margin-block-start: 16px;
  &__plots {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  &__metric {
    min-width: 0;
  }
  &__label {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__value {
    display: block;
    margin-block-start: 4px;
    font-size: 18px;
    font-weight: 550;
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
    :deep(.u--price),
    :deep(.u--price .small) {
      font-size: inherit !important;
      font-weight: inherit;
      white-space: normal;
    }
  }
  &__caption {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-block: 8px 14px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    flex-wrap: wrap;
  }
  &__legend {
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
    > span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    i {
      width: 11px;
      border-block-start: 2px solid rgb(var(--v-theme-primary));
    }
  }
  &__legend &__dash {
    border-block-start: 2px dashed var(--sd-modern-muted);
  }
  :deep(.apexcharts-canvas) {
    max-width: 100%;
  }
}

@media (max-width: 360px) {
  .b-gateway-card-activity__plots {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
}
</style>

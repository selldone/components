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
  <div v-if="modern" class="b-product-currency-flow text-start">
    <div class="b-product-currency-flow__summary">
      <p v-if="periodLabel" class="sd-modern-subtitle">
        {{
          $t("admin_shop.dashboard.modern.finance_recorded_period", {
            period: periodLabel,
          })
        }}
      </p>
      <div class="b-product-currency-flow__total" aria-live="polite">
        <u-price
          v-if="estimatedTotal !== null"
          :amount="estimatedTotal"
          :currency="selected_currency"
        />
        <span v-else>—</span>
        <small>{{
          $t("admin_shop.dashboard.modern.finance_estimated_total", {
            currency: selected_currency,
          })
        }}</small>
      </div>
    </div>
    <div class="b-product-currency-flow__controls">
      <label class="b-product-currency-flow__display">
        <span class="b-product-currency-flow__caption">{{
          $t("admin_shop.dashboard.modern.finance_display_currency")
        }}</span>
        <select v-model="selected_currency">
          <option
            v-for="currency in availableCurrencies"
            :key="currency.code"
            :value="currency.code"
          >
            {{ currency.code }}
          </option>
        </select>
      </label>
      <fieldset class="b-product-currency-flow__sources">
        <legend class="b-product-currency-flow__caption">
          {{ $t("admin_shop.dashboard.modern.finance_include_currencies") }}
        </legend>
        <div class="b-product-currency-flow__options">
          <label
            v-for="currency in sourceCurrencies"
            :key="currency.code"
            :class="{ '-selected': enable_currencies.includes(currency.code) }"
          >
            <u-currency-icon
              :currency="currency"
              flag-only
              small
              aria-hidden="true"
            />
            <bdi>{{ currency.code }}</bdi>
            <input
              v-model="enable_currencies"
              type="checkbox"
              :value="currency.code"
            />
          </label>
        </div>
      </fieldset>
    </div>
    <div ref="modernChart" class="b-product-currency-flow__chart">
      <apexchart
        v-if="
          hasSignedAmounts && !estimateUnavailable && enable_currencies.length
        "
        :options="signedOptions"
        :series="signedSeries"
        type="bar"
        height="180"
        width="100%"
        dir="ltr"
      />
      <u-chart-funnel
        v-else-if="
          hasInsufficientData &&
          !estimateUnavailable &&
          enable_currencies.length
        "
        :key="chartWidth"
        :actual-value="(row, col) => amount_sell_values[row][col]"
        :modern="true"
        sparse-labels
        :animated="false"
        :colors="colors_sell"
        :direction="direction"
        :display-percentage="false"
        :gradient-direction="gradientDirection"
        :height="160"
        :label-value-currency="selected_currency"
        :labels="labels"
        :sub-label-value="financeKey"
        :sub-labels="enable_currencies"
        :values="amount_sell_values_noramized"
        :width="chartWidth"
        is-currency
      >
        <template #series-identity="{ label, size }">
          <u-currency-icon
            :currency="label"
            flag-only
            class="b-product-currency-flow__identity"
            :style="{
              width: size + 'px',
              minWidth: size + 'px',
              height: size + 'px',
            }"
          />
        </template>
      </u-chart-funnel>
      <p v-else class="sd-modern-subtitle">
        {{
          $t(
            !enable_currencies.length
              ? "b_product_dashboard.analytics.select_currency"
              : estimateUnavailable
                ? "b_product_dashboard.analytics.rate_unavailable"
                : "b_product_dashboard.analytics.no_finance",
          )
        }}
      </p>
    </div>
    <p class="sd-modern-subtitle">
      {{ $t("b_product_dashboard.analytics.estimate_scope") }}
    </p>
  </div>
  <div v-else>
    <v-row v-if="multiCurrency" class="justify-content-between mb-3" no-gutters>
      <!-- Actions > Amount Chart > Select to currency -->

      <v-col class="p-1" cols="12" sm="6">
        <small class="d-block">
          {{ $t("admin_shop.dashboard.finance.currency_convert_to") }}
        </small>

        <v-btn-toggle
          v-model="selected_currency"
          class="rounded-toggles"
          density="compact"
          mandatory
          rounded
          selected-class="dark-flat"
          style="height: auto"
        >
          <v-btn
            v-for="_currency in availableCurrencies"
            :key="_currency.code"
            :height="52"
            :value="_currency.code"
            variant="text"
          >
            <div>
              <u-currency-icon
                :currency="_currency"
                flag
                small
              ></u-currency-icon>
              <small class="d-block mt-1">{{ _currency.code }}</small>
            </div>
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <!-- Actions > Amount Chart > Select active currencies -->

      <v-col class="p-1" cols="12" sm="6">
        <small class="d-block">
          {{ $t("admin_shop.dashboard.finance.active_currencies") }}
        </small>
        <v-btn-toggle
          v-model="enable_currencies"
          class="rounded-toggles"
          density="compact"
          mandatory
          multiple
          rounded
          selected-class="dark-flat"
          style="height: auto"
        >
          <v-btn
            v-for="_currency in availableCurrencies"
            :key="_currency.code"
            :height="52"
            :value="_currency.code"
            variant="flat"
          >
            <div>
              <u-currency-icon
                :currency="_currency"
                flag
                small
              ></u-currency-icon>
              <small class="d-block mt-1">{{ _currency.code }}</small>
            </div>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <div v-if="hasInsufficientData">
      <u-chart-funnel
        id="fun-finance"
        :actualValue="(row, col) => amount_sell_values[row][col]"
        :animated="true"
        :class="`mb-3 funnel-chart-finance funnel-dense ${
          bordered ? 'bordered' : ''
        }`"
        :colors="colors_sell"
        :direction="direction"
        :display-percentage="false"
        :gradient-direction="gradientDirection"
        :height="height"
        :labelValueCurrency="selected_currency"
        :labels="labels"
        :sub-label-value="financeKey"
        :sub-labels="enable_currencies"
        :values="amount_sell_values_noramized"
        :width="widthFunnelFinance"
        filter-zeros
        is-currency
      />
    </div>
    <p v-else class="text-muted py-4 px-2 text-center text-uppercase">
      {{ $t("error.not_fount_data") }}
    </p>
  </div>
</template>

<script lang="ts">
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import UChartFunnel from "../../../../ui/chart/funnel/UChartFunnel.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { PriceHelper } from "@selldone/core-js/helper";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "SChartFunnelFinance",
  mixins: [DateMixin, CurrencyMixin],
  components: { UChartFunnel, UCurrencyIcon },
  props: {
    modern: Boolean,
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },

    financeKey: {
      // sell   pay   discount
      required: true,
      type: String,
    },

    bordered: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    chartWidth: 700,
    chartObserver: null,
    chartFrame: null,
    //----------------------------
    enable_currencies: [],
    gradientDirection: "vertical",
    height: 150,
    direction: "horizontal",
    selected_currency: null,
  }),
  computed: {
    periodLabel() {
      if (!this.labels.length) return "";
      return this.labels.length === 1
        ? this.labels[0]
        : this.labels[0] + " – " + this.labels.at(-1);
    },
    estimatedTotal() {
      if (!this.enable_currencies.length || this.estimateUnavailable)
        return null;
      const values = this.amount_sell_values_noramized.flat();
      return values.length && values.every(Number.isFinite)
        ? values.reduce((total, value) => total + value, 0)
        : null;
    },
    sourceCurrencies() {
      const codes = new Set(
        this.timeSeries.raw_data.flatMap(
          (row) => row.finances?.map((finance) => finance.currency) || [],
        ),
      );
      return this.availableCurrencies.filter((currency) =>
        codes.has(currency.code),
      );
    },
    estimateUnavailable() {
      return this.enable_currencies.some(
        (currency) => this.conversionRate(currency) === null,
      );
    },
    hasSignedAmounts() {
      return (
        this.modern &&
        this.amount_sell_values.some((row) => row.some((value) => value < 0))
      );
    },
    signedSeries() {
      return this.enable_currencies.map((currency, index) => ({
        name: currency,
        data: this.timeSeries.raw_data.map((row, i) => [
          DateConverter.convertToLocalTime(row.created_at, true)?.getTime(),
          this.amount_sell_values_noramized[i]?.[index] ?? null,
        ]),
      }));
    },
    signedOptions() {
      return {
        chart: {
          background: "transparent",
          fontFamily: "var(--font)",
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        colors: this.enable_currencies.map(
          (currency) => Currency[currency].gradient[0],
        ),
        dataLabels: { enabled: false },
        xaxis: {
          type: "datetime",
          tickAmount: 3,
          labels: {
            formatter: (value) => this.getLocalTimeString(value, false, true),
          },
        },
        yaxis: {
          title: { text: this.selected_currency },
          labels: {
            formatter: (value) =>
              this.FormatNumberCurrency(value, this.selected_currency),
          },
        },
        legend: { position: "bottom", fontWeight: 400 },
        tooltip: {
          x: {
            formatter: (value) => this.getLocalTimeString(value, false, true),
          },
          y: {
            formatter: (value, { seriesIndex, dataPointIndex }) => {
              const currency = this.enable_currencies[seriesIndex];
              const nativeValue =
                this.amount_sell_values[dataPointIndex]?.[seriesIndex];
              const original =
                this.FormatNumberCurrency(nativeValue, currency) +
                " " +
                currency;
              return currency === this.selected_currency
                ? original
                : original +
                    " (≈ " +
                    this.FormatNumberCurrency(value, this.selected_currency) +
                    " " +
                    this.selected_currency +
                    ")";
            },
          },
        },
      };
    },
    availableCurrencies() {
      let out = [];
      for (let key in Currency) {
        let item = Currency[key];
        if (
          item.enable &&
          this.shop.currencies &&
          this.shop.currencies.includes(key)
        )
          out.push(item);
      }
      return out;
    },

    multiCurrency() {
      return this.availableCurrencies.length > 1;
    },

    hasInsufficientData() {
      return this.timeSeries.raw_data && this.timeSeries.raw_data.length > 1;
    },
    widthFunnelFinance() {
      if (!this.timeSeries.raw_data) return 500;
      return 500 + 45 * this.timeSeries.raw_data.length;
    },
    labels() {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          out.push(this.getLocalTimeString(item.created_at, false, true));
        });

      return out;
    },

    amount_sell_values() {
      if (this.modern)
        return this.timeSeries.raw_data.map((row) =>
          this.enable_currencies.map((currency) =>
            this.findFinanceSellValueByCurrency(row.finances, currency),
          ),
        );
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          let pack = [];
          this.enable_currencies.forEach((currency) => {
            const floats = this.GetUserSelectedCurrencyFloats(
              this.selected_currency,
            );

            //   console.log('currency',currency,'this.selected_currency',this.selected_currency)

            let val = this.findFinanceSellValueByCurrency(
              item.finances,
              currency,
            );

            val = this.truncate(val + 0.0001, Number.parseInt(floats));

            pack.push(val);
          });
          out.push(pack);
        });

      return out;
    },

    amount_sell_values_noramized() {
      if (this.modern)
        return this.amount_sell_values.map((row) =>
          row.map((value, index) => {
            const rate = this.conversionRate(this.enable_currencies[index]);
            return rate === null ? null : value * rate;
          }),
        );
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          let pack = [];
          this.enable_currencies.forEach((currency) => {
            const floats = this.GetUserSelectedCurrencyFloats(
              this.selected_currency,
            );

            //   console.log('currency',currency,'this.selected_currency',this.selected_currency)

            try {
              const rate = PriceHelper.getBuyRateValue(
                this.shop,
                currency,
                this.selected_currency,
              );

              if (!rate) {
                pack.push(0.0001 /*Fix funnel bug in set zero!*/); // Error in exchange rate!
                return;
              }

              let val =
                this.findFinanceSellValueByCurrency(item.finances, currency) *
                rate;

              val = this.truncate(
                val + 0.0001 /*Fix funnel bug in set zero!*/,
                Number.parseInt(floats),
              );
              //console.log(currency, "->", val);

              pack.push(val);
            } catch (e) {
              pack.push(0 /*Fix funnel bug in set zero!*/); // Error in exchange rate!
            }
          });
          out.push(pack);
        });

      return out;
    },

    colors_sell() {
      let out = [];
      this.enable_currencies.forEach((currency) => {
        out.push(Currency[currency].gradient);
        //   out.push(Currency[currency].gradient);
      });

      return out;
    },
  },
  created() {
    this.enable_currencies = [...this.shop.currencies];
    // console.log('this.enable_currencies',this.enable_currencies)

    this.selected_currency = this.GetUserSelectedCurrency()
      ? this.GetUserSelectedCurrency().code
      : null;

    if (
      !this.selected_currency || // is Null!
      !this.availableCurrencies.some(
        // Or not exist in shop currencies!
        (it) =>
          this.modern
            ? it.code === this.selected_currency
            : it.code !== this.selected_currency,
      )
    )
      this.selected_currency = this.availableCurrencies.length
        ? this.availableCurrencies[0].code
        : SetupService.DefaultCurrency();

    // Auto height calculation:
    this.height = this.enable_currencies.length * 45;
    this.height =
      this.height > 400 ? 400 : this.height < 150 ? 150 : this.height;
    if (this.modern)
      this.enable_currencies = this.sourceCurrencies.map(
        (currency) => currency.code,
      );
  },
  mounted() {
    if (!this.modern || !this.$refs.modernChart) return;
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
    this.chartObserver.observe(this.$refs.modernChart);
  },
  beforeUnmount() {
    this.chartObserver?.disconnect();
    if (this.chartFrame !== null) cancelAnimationFrame(this.chartFrame);
    this.chartFrame = null;
  },
  methods: {
    conversionRate(currency) {
      if (currency === this.selected_currency) return 1;
      try {
        const rate = PriceHelper.getBuyRateValue(
          this.shop,
          currency,
          this.selected_currency,
        );
        return Number.isFinite(rate) && rate > 0 ? rate : null;
      } catch {
        return null;
      }
    },
    //---------------------------
    findFinanceSellValueByCurrency(finances, currency) {
      if (!finances) return 0;
      let item = finances.find((item) => {
        return item.currency === currency;
      });
      // console.log('item',item)
      const out = item ? item[this.financeKey] : 0;
      //  console.log('out',out)
      return out;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-currency-flow {
  min-width: 0;
  &__summary {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px 24px;
    margin-block-end: 20px;
  }
  &__summary > p {
    flex: 1 1 200px;
    margin: 0;
    font-size: 12px;
  }
  &__total {
    margin-inline-start: auto;
    text-align: end;
    font-size: 21px;
    font-weight: 400;
    line-height: 26px;
    font-variant-numeric: tabular-nums;
  }
  &__total small {
    display: block;
    margin-block-start: 3px;
    font-size: 11px;
    font-weight: 400;
    color: var(--sd-modern-muted);
  }
  &__total :deep(.u--price) {
    font-family: inherit;
    font-size: inherit;
    font-weight: 400 !important;
    line-height: inherit;
  }
  &__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 16px 24px;
    margin-block-end: 16px;
  }
  &__caption {
    display: block;
    margin-block-end: 6px;
    font-size: 11px;
    line-height: 16px;
    color: var(--sd-modern-muted);
    letter-spacing: 0.35px;
  }
  &__display {
    flex: 0 0 auto;
  }
  select {
    min-height: 36px;
    background: var(--sd-modern-inset);
    color: rgb(var(--v-theme-on-surface));
    padding: 6px 10px;
    border-radius: 7px;
    font-size: 12px;
  }
  option {
    background: rgb(var(--v-theme-surface));
  }
  &__sources {
    flex: 1 1 300px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  &__options {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
  &__options label {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 6px 8px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__options label.-selected {
    border-color: var(--sd-modern-border);
    background: var(--sd-modern-inset);
    color: rgb(var(--v-theme-on-surface));
  }
  &__options label:hover {
    background: var(--sd-modern-inset);
  }
  input {
    accent-color: rgb(var(--v-theme-on-surface));
    width: 13px;
    height: 13px;
    margin: 0;
  }
  &__chart {
    min-width: 0;
  }
  &__identity :deep(.-flag),
  &__identity :deep(img) {
    width: 100%;
    height: 100%;
    margin: 0 !important;
  }
  @media (max-width: 600px), (pointer: coarse) {
    select,
    &__options label {
      min-height: 44px;
    }
    select {
      font-size: 16px;
    }
  }
  @media (max-width: 600px) {
    &__summary > p {
      flex-basis: 100%;
    }
    &__total {
      margin-inline-start: 0;
      text-align: start;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

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
  <div>
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

    <div
      v-if="hasInsufficientData"
      class="funnel-scroll scrollable-element-light thin-scroll"
    >
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

<script>
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { SetupService } from "@selldone/core-js/server/SetupService";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import UChartFunnel from "../../../../ui/chart/funnel/UChartFunnel.vue";

export default {
  name: "SChartFunnelFinance",
  components: { UChartFunnel, UCurrencyIcon },
  props: {
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
    //----------------------------
    enable_currencies: [],
    gradientDirection: "vertical",
    height: 150,
    direction: "horizontal",
    selected_currency: null,
  }),
  computed: {
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
              const rate = this.getBuyRateValue(
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
              pack.push(0.0001 /*Fix funnel bug in set zero!*/); // Error in exchange rate!
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
        (it) => it.code !== this.selected_currency,
      )
    )
      this.selected_currency = this.availableCurrencies.length
        ? this.availableCurrencies[0].code
        : SetupService.DefaultCurrency();

    // Auto height calculation:
    this.height = this.enable_currencies.length * 45;
    this.height =
      this.height > 400 ? 400 : this.height < 150 ? 150 : this.height;
  },
  methods: {
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
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

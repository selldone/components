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
  <div>
    <v-row v-if="multiCurrency" class="justify-content-between mb-3">
      <!-- Actions > Amount Chart > Select to currency -->

      <v-col cols="12" sm="6">
        <small class="d-block">
          {{ $t("admin_shop.dashboard.finance.currency_convert_to") }}
        </small>

        <v-btn-toggle
          v-model="selected_currency"
          class="rounded-toggles"
          mandatory
          rounded
          selected-class="black-flat"
          style="height: auto"
        >
          <v-btn
            v-for="_currency in availableCurrencies"
            :key="_currency.code"
            :height="52"
            :value="_currency.code"
            variant="text"
          >
            <u-currency-icon :currency="_currency" flag small></u-currency-icon>
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <!-- Actions > Amount Chart > Select active currencies -->

      <v-col cols="12" sm="6">
        <small class="d-block"
          >{{ $t("admin_shop.dashboard.finance.active_currencies") }}
        </small>
        <v-btn-toggle
          v-model="enable_currencies"
          class="rounded-toggles"
          mandatory
          multiple
          rounded
          selected-class="black-flat"
          style="height: auto"
        >
          <v-btn
            v-for="_currency in availableCurrencies"
            :key="_currency.code"
            :height="52"
            :value="_currency.code"
            variant="flat"
          >
            <u-currency-icon :currency="_currency" flag small></u-currency-icon>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <div v-if="hasInsufficientData">
      <u-chart-funnel
        id="fun-finance"
        :animated="true"
        :class="`mb-3 funnel-chart-finance ${bordered ? 'bordered' : ''}`"
        :colors="colors_sell"
        :direction="direction"
        :display-percentage="false"
        :gradient-direction="gradientDirection"
        :height="height"
        :labels="labels"
        :sub-labels="enable_currencies"
        :values="amount_sell_values"
        :width="widthFunnelFinance"
        sub-label-value=""
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
import UCurrencyIcon from "../../ui/currency/icon/UCurrencyIcon.vue";
import UChartFunnel from "../../ui/chart/funnel/UChartFunnel.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import {PriceHelper} from "@selldone/core-js/helper";

export default {
  name: "FunnelPayment",
  mixins: [DateMixin, CurrencyMixin],
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
      return this.timeSeries.raw_data.length > 1;
    },
    widthFunnelFinance() {
      if (!this.timeSeries.raw_data) return 500;
      return 500 + 100 * this.timeSeries.raw_data.length;
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

            try {
              let val =
                this.findFinanceSellValueByCurrency(item.payment, currency) *
                  PriceHelper.getBuyRateValue(
                  this.shop,
                  currency,
                  this.selected_currency,
                );

              val = this.truncate(val + 0.0001, Number.parseInt(floats));

              pack.push(val);
            } catch (e) {
              pack.push(0);
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
  },
  methods: {
    //---------------------------
    findFinanceSellValueByCurrency(finances, currency) {
      return finances && finances[currency] ? finances[currency] : 0;
    },
  },
};
</script>

<style scoped></style>

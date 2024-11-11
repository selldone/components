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
  <s-widget-box
    :active="true"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
      'gift_card.dashboard.amount_widget.title',
    )} <span class='fw-normal mx-xs small'> ${$t(
      'gift_card.dashboard.amount_widget.title_small',
    )} </span>  </h5>`"
    extended
    icon="fa:fas fa-money-check-alt"
  >
    <template v-slot:actions>
      <u-chart-area
        :colors="['#00796B']"
        :keys="['amount_payed']"
        :labels-data="[
          $t('gift_card.dashboard.amount_widget.chart_amount_pay.label'),
        ]"
        :opacity="0.7"
        :time-series="timeSeries"
        :value-postfix="giftCardType.currency"
        :y-format="GetUserSelectedCurrencyFormat(giftCardType.currency)"
        :y-label="`${$t(
          'gift_card.dashboard.amount_widget.chart_amount_pay.y',
        )} ${getCurrencyName(giftCardType.currency)}`"
        chart-group="usage"
        chart-id="amount_payed"
        type="bar"
      />
      <u-chart-area
        :colors="['#8BC34A']"
        :keys="['buys']"
        :labels-data="[
          $t('gift_card.dashboard.amount_widget.chart_buys.label'),
        ]"
        :opacity="0.7"
        :time-series="timeSeries"
        :y-label="$t('gift_card.dashboard.amount_widget.chart_buys.y')"
        chart-group="usage"
        chart-id="buys"
        type="bar"
        value-postfix="x"
        y-format="0a"
      />
    </template>

    <template v-slot:bottom>
      <v-row class="text-center my-0">
        <v-col cols="12" sm="4">
          <u-price
            :amount="giftCardType.amount_payed"
            :currency="giftCardType.currency"
            class="mt-2"
            large
          ></u-price>

          <p class="text-muted mb-0">
            <small
              ><i class="fas fa-calendar-check text-muted me-1" />
              {{ $t("gift_card.dashboard.amount_widget.total_buy") }}</small
            >
          </p>
        </v-col>

        <v-col cols="12" sm="4">
          <u-price
            :amount="totalPayment30Days"
            :currency="giftCardType.currency"
            class="mt-2"
            large
          ></u-price>

          <p class="text-muted mb-0">
            <small>
              <i class="fas fa-calendar text-muted me-1" />{{
                $t("gift_card.dashboard.amount_widget.total_pay_30days")
              }}
            </small>
          </p>
        </v-col>

        <v-col cols="12" sm="4">
          <u-price
            :amount="todayData.amount_payed"
            :currency="giftCardType.currency"
            class="mt-2"
            large
          ></u-price>

          <p class="text-muted mb-0">
            <small
              ><i class="fas fa-calendar-day text-muted me-1" />{{
                $t("gift_card.dashboard.amount_widget.total_pay_today")
              }}
            </small>
          </p>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

import UChartArea from "../../../../ui/chart/area/UChartArea.vue";

export default {
  name: "BGiftcardStatisticsPayment",
  components: { UChartArea, SWidgetBox },
  props: {
    giftCardType: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    currencyObject() {
      return this.GetCurrency(this.giftCardType.currency);
    },

    totalPayment30Days() {
      return this.timeSeries.totalOf("amount_payed");
    },

    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },
    lastWeekData() {
      return this.timeSeries.lastWeekData();
    },

    previousWeekData() {
      return this.timeSeries.previousWeekData();
    },
  },
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
h6 {
  font-size: 1.5rem;
  font-weight: 400;
}
</style>

<style lang="scss"></style>

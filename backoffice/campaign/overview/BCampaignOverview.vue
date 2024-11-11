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
  <s-widget
    :class="{
      'widget-hover pointer-pointer': !viewOnly,
      'view-only': viewOnly,
    }"
    :title="
      `
<span class='circle ${
        campaign.enable ? 'bg-success' : 'bg-danger'
      } me-1' style='font-size: 6px;'></span>
<span>${campaign.name}</span>` +
      (campaign.auto
        ? `<span class='badge -green'>${$t('global.commons.default')}</span>`
        : '')
    "
    custom-header
    @click="
      viewOnly
        ? undefined
        : $router.push({
            name: 'BPageCampaignDashboard',
            params: { campaign_id: campaign.id },
          })
    "
  >
    <!-- Top End Buttons -->
    <div v-if="hasButtons" class="absolute-top-end text-center">
      <v-btn
        class="mx-1"
        icon
        @click.stop="
          $router.push({
            name: 'BPageCampaignSetting',
            params: { campaign_id: campaign.id },
          })
        "
      >
        <v-icon size="small"> edit</v-icon>
      </v-btn>
      <v-btn
        class="mx-1"
        color="red"
        icon
        @click.stop="$emit('click:delete', campaign)"
      >
        <v-icon size="small"> delete</v-icon>
      </v-btn>
    </div>

    <!-- Play / Pause Mode & Create dates -->
    <div class="d-flex align-items-center">
      <v-icon
        v-if="campaign.enable"
        :color="campaign.ended ? 'red' : 'blue'"
        class="me-2"
        size="x-large"
      >
        {{ campaign.ended ? "pause_circle_filled" : "play_circle_filled" }}
      </v-icon>
      <v-icon
        v-else
        class="me-2"
        color="warning"
        size="x-large"
        title="Disabled"
      >
        error
      </v-icon>

      <div class="flex-grow-1">
        <p class="m-1 small">
          {{ $t("global.commons.create_date") }}:
          <b>{{ getLocalTimeString(campaign.created_at, true) }}</b>
        </p>

        <p class="m-1 small">
          {{ $t("global.commons.update_date") }}:
          <b>{{ getLocalTimeString(campaign.updated_at, true) }}</b>
        </p>
      </div>
    </div>
    <hr class="my-5" />

    <!-- Progress bar -->
    <u-time-progress-bar
        v-if="campaign.start_at || campaign.end_at"
      v-model:ended="campaign.ended"
      :created-time="campaign.created_at"
      :end-time="campaign.end_at"
      :start-time="campaign.start_at"
      style="min-height: 64px"
    ></u-time-progress-bar>

    <!-- Start End dates -->
    <p v-if="campaign.start_at" class="mt-2">
      <small>{{ $t("global.commons.start_date") }}:</small>
      {{ getLocalTimeString(campaign.start_at) }}
    </p>

    <p v-if="campaign.end_at">
      <small>{{ $t("global.commons.end_date") }}:</small>
      {{ getLocalTimeString(campaign.end_at) }}
    </p>

    <v-row class="text-center" dense>
      <!-- Charts -->

      <v-col :md="extended ? 3 : 6" cols="6">
        <b-session-devices-pie
          :desktop="campaign.desktop"
          :full-details="true"
          :mobile="campaign.mobile"
          :tablet="campaign.tablet"
        ></b-session-devices-pie>

        <b-session-chart-sankey
          v-if="campaign.sessions"
          :Social="calcTotalSocials(campaign)"
          :direct="calcTotalDirect(campaign)"
          :other="calcTotalOther(campaign)"
          :search="calcTotalOrganicSearch(campaign)"
          height="120px"
          class="small"
        ></b-session-chart-sankey>
      </v-col>
      <v-col :md="extended ? 3 : 6" cols="6">
        <u-chart-funnel-conversion
          :height="250"
          :keys="funnel_keys"
          :labels="[
            $t('global.commons.sessions'),
            $t('global.commons.product_views'),
            $t('global.commons.add_to_carts'),
            $t('global.commons.checkouts'),
            $t('global.commons.payments'),
          ]"
          :model="campaign"
          :width="120"
          class="overflow-visible"
          dense
          no-legend
        ></u-chart-funnel-conversion>
      </v-col>

      <!-- Socials -->

      <v-col :md="extended ? 3 : 6" cols="6">
        <u-chart-radar
          :full-details="false"
          :social="campaign.social"
          class="only_social"
        ></u-chart-radar>
      </v-col>

      <!-- Map -->
      <v-col :md="extended ? 3 : 6" cols="6">
        <u-map-countries-heatmap
          :country-data="
            campaign.last_data && Object.keys(campaign.last_data).length
              ? campaign.last_data
              : { base: 0 }
          "
          class="mx-2 my-3"
          country-stroke-color="#ddd"
          default-country-fill-color="#fafafa"
          has-tooltip
          high-color="#512DA8"
          low-color="#eee"
          style="height: 200px"
        >
        </u-map-countries-heatmap>
      </v-col>

      <!-- Payments -->

      <v-col :md="extended ? 3 : 6" cols="6">
        <small>{{ $t("global.commons.total_sell") }}</small
        ><br />

        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <div v-bind="props">
              <u-price
                :amount="calcTotalAmount(campaign.payment)"
                :large="$vuetify.display.smAndUp"
                class="text-success"
              ></u-price>
            </div>
          </template>

          <!-- Payment details -->
          <v-table v-if="campaign.payment" dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-center">
                    <span class="small">{{
                      $t("user_dashboard.shops.shop_card.currency")
                    }}</span>
                  </th>
                  <th class="text-start p-0">
                    <span class="small">
                      <i class="fas fa-money-bill-wave-alt me-1" />
                      {{ $t("user_dashboard.shops.shop_card.payments") }}</span
                    >
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(amount, currency) in campaign.payment"
                  :key="currency"
                >
                  <td class="text-center">
                    <u-currency-icon :currency="GetCurrency(currency)" small />
                  </td>

                  <td class="text-start p-0">
                    <u-price :amount="amount" :currency="currency"></u-price>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-menu>
      </v-col>

      <v-col :md="extended ? 3 : 6" cols="6">
        <small>{{ $t("global.commons.orders") }}</small
        ><br />

        <span class="font-weight-bold" style="font-size: 1.6rem">{{
          numeralFormat(campaign.orders, "0.[000] a")
        }}</span>
      </v-col>

      <!-- Landing / Discount code / ... -->

      <v-col :md="extended ? 2 : 4" class="border-end" cols="4">
        <small>{{ $t("global.commons.landing_page") }} :</small><br />
        <v-icon :color="campaign.page_id ? 'success' : 'red'">
          {{ campaign.page_id ? "check" : "close" }}
        </v-icon>
      </v-col>

      <v-col :md="extended ? 2 : 4" class="border-end" cols="4">
        <small>{{ $t("global.commons.discount_code") }} :</small><br />
        <v-icon :color="campaign.discount_id ? 'success' : 'red'">
          {{ campaign.discount_id ? "check" : "close" }}
        </v-icon>
      </v-col>
      <v-col v-if="!extended" cols="4"></v-col>
    </v-row>
  </s-widget>
</template>

<script lang="ts">
import UChartFunnelConversion from "../../../ui/chart/funnel/conversion/UChartFunnelConversion.vue";
import BSessionChartSankey from "../../session/chart/sankey/BSessionChartSankey.vue";
import BSessionDevicesPie from "../../session/devices/pie/BSessionDevicesPie.vue";
import UChartRadar from "../../../ui/chart/radar/UChartRadar.vue";
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { CampaignHelper } from "@selldone/core-js/helper/campaign/CampaignHelper";
import UMapCountriesHeatmap from "../../../ui/map/countries/heatmap/UMapCountriesHeatmap.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";

export default {
  name: "BCampaignOverview",
  components: {
    UCurrencyIcon,
    UMapCountriesHeatmap,
    UTimeProgressBar,
    UChartRadar,
    BSessionDevicesPie,
    BSessionChartSankey,
    UChartFunnelConversion,
  },
  props: {
    campaign: { require: true },
    hasButtons: {
      default: false,
      type: Boolean,
    },
    viewOnly: {
      default: false,
      type: Boolean,
    },
    extended: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      funnel_keys: ["sessions", "products", "add_carts", "buys", "orders"],
    };
  },

  methods: {
    calcTotalAmount(payment) {
      return CampaignHelper.GetTotalAmount(
        this.shop,
        this.GetUserSelectedCurrency().code,
        payment,
      );
    },
    calcTotalSocials(campaign) {
      return CampaignHelper.GetTotalSocials(campaign);
    },
    calcTotalOrganicSearch(campaign) {
      return CampaignHelper.GetTotalOrganicSearch(campaign);
    },

    calcTotalDirect(campaign) {
      return CampaignHelper.GetTotalDirects(campaign);
    },

    calcTotalOther(campaign) {
      return CampaignHelper.GetTotalOther(campaign);
    },
  },
};
</script>

<style lang="scss" scoped>
.view-only {
  background: transparent !important;
  box-shadow: none !important;
}
</style>

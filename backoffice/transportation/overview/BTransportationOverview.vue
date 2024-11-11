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
  <div class="text-start">
    <!-- Top End Buttons -->
    <div v-if="showButtons" class="absolute-top-end text-center">
      <v-btn
        class="mx-1"
        icon
        variant="text"
        @click.stop="
          $router.push({
            name: 'BPageTransportationSetting',
            params: { transportation_id: transportation.id },
          })
        "
      >
        <v-icon size="small"> edit</v-icon>
      </v-btn>
    </div>

    <!-- Play / Pause Mode & Create dates -->
    <div class="d-flex align-items-center">
      <img
        :class="{ 'img-grayscale': !transportation.enable }"
        :src="
          transportation.logo
            ? getShopImagePath(transportation.logo)
            : transportationObj.icon
        "
        class="me-2"
        height="48"
        width="48"
      />

      <div class="flex-grow-1">
        <p class="m-1 small">
          {{ $t("global.commons.distance") }}:
          <b
            >{{ numeralFormat(transportation.distance, "0,0") }}
            {{ distance_unit }}</b
          >
        </p>

        <p class="m-1 small">
          {{ $t("global.commons.weight") }}:
          <b
            >{{ numeralFormat(transportation.max_weight, "0,0") }}
            {{ mass_unit }}</b
          >
        </p>
        <p class="m-1 small">
          {{ $t("global.commons.size") }}:
          <span dir="ltr">
            <b :title="$t('global.commons.width')"
              >{{ numeralFormat(transportation.max_w, "0,0") }} {{ size_unit }}
            </b>
            <v-icon class="mx-1" size="small">fa:fas fa-times</v-icon>
            <b :title="$t('global.commons.length')"
              >{{ numeralFormat(transportation.max_l, "0,0") }} {{ size_unit }}
            </b>
            <v-icon class="mx-1" size="small">fa:fas fa-times</v-icon>
            <b :title="$t('global.commons.height')"
              >{{ numeralFormat(transportation.max_h, "0,0") }} {{ size_unit }}
            </b></span
          >
        </p>
      </div>
    </div>
    <hr class="my-3" />
    <p class="mb-1">
      <small class="me-1">{{ $t("global.commons.days") }}:</small>
      <b>{{
        transportation.days.map((it) => $t(WeekDays[it].name)).join(" , ")
      }}</b>
    </p>
    <p class="mb-1">
      <small class="me-1">{{ $t("global.commons.timespan") }}:</small>
      <img
        v-for="timespan in transportation.time_spans"
        :key="timespan"
        :src="TimeSpans[timespan].icon"
        :title="$t(TimeSpans[timespan].name)"
        class="mx-2"
        height="24"
        width="24"
      />
    </p>
    <p class="mb-1">
      <small class="me-1">{{ $t("global.commons.holiday") }}:</small>
      <u-check :model-value="transportation.holidays" read-only></u-check>
    </p>
    <hr class="my-3" />

    <div class="d-flex">
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.cod") }}:</small>
        <v-chip
          v-if="transportation.cod"
          prepend-icon="monetization_on"
          append-icon="check_circle"
          variant="elevated"
          color="#1976D2"
          size="small"
        >
          COD
        </v-chip>
        <u-check v-else :model-value="transportation.cod" read-only></u-check>
      </p>
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.sod") }}:</small>
        <u-check :model-value="transportation.sod" read-only></u-check>
      </p>
    </div>

    <div v-if="!transportation.sod" class="d-flex">
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.free_shipping") }}:</small>
        <u-check
          :model-value="transportation.free_shipping"
          read-only
        ></u-check>
      </p>
      <p v-if="transportation.free_shipping" class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.min_purchase") }}:</small>
        <u-price
          :amount="transportation.free_shipping_limit"
          :currency="transportation.currency"
        >
        </u-price>
      </p>
    </div>
    <div v-else style="min-height: 26px"></div>

    <div
      v-if="showButtons || user_ids?.length"
      style="border-radius: 12px; border: solid thin #aaa"
      class="mt-1 mx-n1 pa-1 d-flex align-stretch"
    >
      <div class="flex-grow-1">
        <small>
          <v-icon class="me-1">people</v-icon>
          {{ $t("global.commons.delivery_persons") }}:</small
        >
        <u-dense-circles-users
          :add="showButtons"
          :ids="user_ids"
          :limit="10"
          @click:add="
            $router.push({
              name: 'BPageTransportationCouriers',
              params: { transportation_id: transportation.id },
            })
          "
        ></u-dense-circles-users>
      </div>

      <div v-if="showButtons" class="flex-grow-0" style="width: 72px">
        <v-btn
          :outlined="outlined"
          @click.stop
          :to="{
            name: 'BPageTransportationCouriers',
            params: { transportation_id: transportation.id },
          }"
          color="#111"
          size="x-large"
          variant="flat"
          stacked
          class="text-wrap tnt text-center px-1"
          density="compact"
          min-width="0"
          height="100%"
          rounded="e-lg"
        >
          <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
          <span style="font-size: 8px">
            {{ $t("transportation_page.go_to_courier_list") }}</span
          >
        </v-btn>
      </div>
    </div>

    <div
      v-if="showButtons || service_ids?.length"
      style="border-radius: 12px; border: solid thin #aaa"
      class="mt-1 mx-n1 pa-1 d-flex align-stretch"
    >
      <div class="flex-grow-1">
        <small>
          <v-icon class="me-1">business</v-icon>
          {{ $t("global.commons.delivery_services") }}:</small
        >

        <div style="padding: 11px">
          <img
            v-for="id in service_ids"
            :key="id"
            :src="getDeliveryServiceIcon(id, IMAGE_SIZE_SMALL)"
            class="me-2"
            height="32"
            width="32"
          />
          <v-btn
            v-if="showButtons"
            :size="32"
            @click.stop
            :to="{
              name: 'BPageTransportationServices',
              params: { transportation_id: transportation.id },
            }"
            class="ms-2 hover-scale-small"
            color="success"
            icon
            variant="flat"
          >
            <v-icon size="20">add</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-if="showButtons" class="flex-grow-0" style="width: 72px">
        <v-btn
          :outlined="outlined"
          @click.stop
          :to="{
            name: 'BPageTransportationServices',
            params: { transportation_id: transportation.id },
          }"
          color="#111"
          size="x-large"
          variant="flat"
          stacked
          class="text-wrap tnt text-center px-1"
          density="compact"
          min-width="0"
          height="100%"
          rounded="e-lg"
        >
          <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
          <span style="font-size: 8px">
            {{ $t("transportation_page.go_to_service_list") }}</span
          >
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import UDenseCirclesUsers from "../../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

export default {
  name: "BTransportationOverview",
  components: {
    UDenseCirclesUsers,
  },
  props: {
    shop: { require: true },

    transportation: { require: true },
    outlined: { type: Boolean, default: false },
    showButtons: { type: Boolean, default: true },
  },

  data() {
    return {
      WeekDays: WeekDays,
      TimeSpans: TimeSpans,
    };
  },

  computed: {
    transportationObj() {
      return ShopTransportations[this.transportation.type];
    },
    info() {
      return this.transportation.info;
    },
    user_ids() {
      return this.info?.user_ids ? this.info.user_ids : [];
    },
    service_ids() {
      return this.info?.service_ids ? this.info.service_ids : [];
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    distance_unit() {
      return ShopOptionsHelper.GetDistanceUnit(this.shop);
    },
    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>

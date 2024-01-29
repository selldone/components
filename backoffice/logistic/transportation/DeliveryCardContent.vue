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
  <div class="text-start">
    <!-- Top End Buttons -->
    <div v-if="showButtons" class="absolute-top-end text-center">
      <v-btn
        class="mx-1"
        icon
        @click.stop="
          $router.push({
            name: 'AdminShopTransportationPage_Setting',
            params: { transportation_id: transportation.id },
          })
        "
      >
        <v-icon small> edit </v-icon>
      </v-btn>
    </div>

    <!-- Play / Pause Mode & Create dates -->
    <div class="d-flex align-items-center">
      <img
        class="me-2"
        :src="
          transportation.logo
            ? getShopImagePath(transportation.logo)
            : transportationObj.icon
        "
        width="48"
        height="48"
        :class="{ 'img-grayscale': !transportation.enable }"
      />

      <div class="flex-grow-1">
        <p class="m-1 small">
          {{ $t("global.commons.distance") }}:
          <b>{{   numeralFormat(transportation.distance,"0,0") }} Km</b>
        </p>

        <p class="m-1 small">
          {{ $t("global.commons.weight") }}:
          <b>{{  numeralFormat(transportation.max_weight ,"0,0") }} Kg</b>
        </p>
        <p class="m-1 small">
          {{ $t("global.commons.size") }}:
          <span dir="ltr">
            <b :title="$t('global.commons.width')"
              >{{   numeralFormat(transportation.max_w,"0,0") }} cm
            </b>
            <v-icon class="mx-1" small>fa:fas fa-times</v-icon>
            <b :title="$t('global.commons.length')"
              >{{  numeralFormat(transportation.max_l,"0,0") }} cm
            </b>
            <v-icon class="mx-1" small>fa:fas fa-times</v-icon>
            <b :title="$t('global.commons.height')"
              >{{  numeralFormat(transportation.max_h,"0,0") }} cm
            </b></span
          >
        </p>
      </div>
    </div>
    <hr />
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
        width="24"
        height="24"
        class="mx-2"
        :src="TimeSpans[timespan].icon"
        :title="$t(TimeSpans[timespan].name)"
      />
    </p>
    <p class="mb-1">
      <small class="me-1">{{ $t("global.commons.holiday") }}:</small>
      <s-check :value="transportation.holidays"></s-check>
    </p>
    <hr />

    <div class="d-flex">
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.cod") }}:</small>
        <img
          v-if="transportation.cod"
          src="../../../assets/icons/pos.svg"
          width="24"
          height="24"
          class="ms-1"
        /><s-check v-else :value="transportation.cod"></s-check>
      </p>
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.sod") }}:</small>
        <s-check :value="transportation.sod"></s-check>
      </p>
    </div>

    <div class="d-flex" v-if="!transportation.sod">
      <p class="mb-1 w-50">
        <small class="me-1">{{ $t("global.commons.free_shipping") }}:</small>
        <s-check :value="transportation.free_shipping"></s-check>
      </p>
      <p class="mb-1 w-50" v-if="transportation.free_shipping">
        <small class="me-1">{{ $t("global.commons.min_purchase") }}:</small>
        <price-view
          :amount="transportation.free_shipping_limit"
          :currency="transportation.currency"
        >
        </price-view>
      </p>
    </div>
    <div v-else style="min-height: 26px"></div>

    <hr />

    <div v-if="showButtons || user_ids?.length">
      <small>
        <v-icon class="me-1">people</v-icon>
        {{ $t("global.commons.delivery_persons") }}:</small
      >
      <s-dense-images-circles-users
        :ids="user_ids"
        :limit="10"
        :add="showButtons"
        @click:add="
          $router.push({
            name: 'AdminShopTransportationPage_Persons',
            params: { transportation_id: transportation.id },
          })
        "
      ></s-dense-images-circles-users>
    </div>

    <div v-if="showButtons" class="widget-buttons">
      <v-btn
        x-large
        color="#111"
        dark
        :outlined="outlined"
        depressed
        :to="{
          name: 'AdminShopTransportationPage_Persons',
          params: { transportation_id: transportation.id },
        }"
      >
        {{ $t("transportation_page.go_to_courier_list") }}
        <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
      </v-btn>
    </div>

    <hr />

    <div v-if="showButtons || service_ids?.length">
      <small>
        <v-icon class="me-1">business</v-icon>
        {{ $t("global.commons.delivery_services") }}:</small
      >
      <div style="padding: 11px">
        <img
          v-for="id in service_ids"
          :key="id"
          :src="getDeliveryServiceIcon(id, IMAGE_SIZE_SMALL)"
          width="32"
          height="32"
          class="me-2"
        />
        <v-btn
          v-if="showButtons"
          icon
          class="ms-2"
          color="success"
          dark
          depressed
          :to="{
            name: 'AdminShopTransportationPage_Services',
            params: { transportation_id: transportation.id },
          }"
          ><v-icon>add</v-icon></v-btn
        >
      </div>

      <div v-if="showButtons" class="widget-buttons">
        <v-btn
          x-large
          color="#111"
          dark
          :outlined="outlined"
          depressed
          :to="{
            name: 'AdminShopTransportationPage_Services',
            params: { transportation_id: transportation.id },
          }"
        >
          {{ $t("transportation_page.go_to_service_list") }}
          <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";
import { WeekDays } from "@core/enums/logistic/WeekDays";
import { TimeSpans } from "@core/enums/logistic/TimeSpans";
import SDenseImagesCirclesUsers from "@components/user/dense-circles/SDenseImagesCirclesUsers.vue";
export default {
  name: "DeliveryCardContent",
  components: {
    SDenseImagesCirclesUsers,
  },
  props: {
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
  },

  methods: {},
};
</script>

<style scoped lang="scss"></style>

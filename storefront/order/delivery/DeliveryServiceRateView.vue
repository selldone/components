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
  <div
    class="d-flex align-center w-100 text-start"
    :class="{ 'bg-gray': selected }"
  >
    <v-img
      width="36"
      height="36"
      contain
      class="me-2 flex-grow-0"
      :src="rate.icon"
    ></v-img>

    <div class="flex-grow-1">
      <div class="d-flex align-items-center">
        <b> {{ rate.provider }}</b>
        <v-spacer></v-spacer>
        <v-chip
          v-if="!rate.live"
          class="float-end"
          x-small
          outlined
          color="amber"
        >
          {{ $t("global.commons.debug") }}
        </v-chip>
      </div>
      <div class="small d-flex align-center mt-1">
        <price-view
          :amount="rate.amount_local"
          :currency="rate.currency_local"
          class="text-nowrap"
        ></price-view>
        <v-spacer></v-spacer>
        <span class="ms-2 small">
          {{
            rate.duration_terms
              ? rate.duration_terms
              : rate.estimated_minutes
              ? convert_estimated_minutes(rate.estimated_minutes)
              : "-"
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { DateConverter } from "@core/helper/date/DateConverter";

export default {
  name: "DeliveryServiceRateView",
  props: {
    rate: { required: true },
    selected: { default: false, type: Boolean },
  },
  methods: {
    convert_estimated_minutes(d) {
      return DateConverter.SecondsToString(d * 60);
    },
  },
};
</script>

<style scoped></style>

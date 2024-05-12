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
    :class="{ 'widget-hover pointer-pointer': true }"
    :title="
      `
<span class='circle ${
        transportation.enable ? 'bg-success' : 'bg-danger'
      } me-1' style='font-size: 6px;'></span>
<span>${$t(transportationObj.name)}</span>` +
      (transportation.title
        ? ` <span class='typo-body'> / ${transportation.title}</span>`
        : '')
    "
    class="text-start"
    custom-header
    @click="
      $router.push({
        name: 'BPageTransportationDashboard',
        params: { transportation_id: transportation.id },
      })
    "
  >
    <u-ribbon v-if="transportationObj.pickup" green>
      <v-icon dark size="small">add_location_alt</v-icon>
      {{ $t("global.commons.pickup") }}
    </u-ribbon>

    <p>{{ $t(transportationObj.description) }}</p>

    <b-transportation-overview
      :outlined="outlined"
      :transportation="transportation"
    >
    </b-transportation-overview>
  </s-widget>
</template>

<script>
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";

import BTransportationOverview from "../../transportation/overview/BTransportationOverview.vue";
import URibbon from "../../../ui/ribbon/URibbon.vue";

export default {
  name: "BTransportationCard",
  components: {
    URibbon,
    BTransportationOverview,
  },
  props: {
    transportation: { require: true },
    outlined: { type: Boolean, default: false },
  },

  data() {
    return {};
  },

  computed: {
    transportationObj() {
      return ShopTransportations[this.transportation.type];
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>

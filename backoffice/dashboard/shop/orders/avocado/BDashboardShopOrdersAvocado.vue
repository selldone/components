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
    :src="require('../../../../../assets/icons/avocado.svg')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-green mr-sm' style='font-size: 6px;'></span>  ${$t(
      'avocado_orders.title',
    )}<span class='fw-normal ml-xs small'> ${$t(
      'avocado_orders.title_small',
    )}</span>  </h5>`"
    extended
  >
    <u-chart-area
      :colors="['#ddd', '#03A9F4', '#34e397']"
      :keys="['view_avocados', 'request_avocados', 'sell_avocados']"
      :labels-data="[
        $t('global.commons.view'),
        $t('global.commons.request'),
        $t('global.commons.sell'),
      ]"
      :time-series="timeSeries"
      :y-label="$t('global.commons.count')"
      height="200px"
    ></u-chart-area>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../../ui/widget/box/SWidgetBox.vue";
import UChartArea from "../../../../../ui/chart/area/UChartArea.vue";

export default {
  name: "BDashboardShopOrdersAvocado",
  components: { UChartArea, SWidgetBox },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {},
  methods: {},
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

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
    :src="
      modern ? undefined : require('../../../../../assets/icons/avocado.svg')
    "
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-green mr-sm' style='font-size: 6px;'></span>  ${$t(
            'avocado_orders.title',
          )}<span class='fw-normal ml-xs small'> ${$t(
            'avocado_orders.title_small',
          )}</span>  </h5>`
    "
    extended
    :class="{
      'b-dashboard-orders-avocado sd-modern-widget text-start': modern,
    }"
    :color="modern ? 'rgb(var(--v-theme-surface))' : undefined"
    :dark="modern && $vuetify.theme.current.dark"
  >
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain">
          <img
            :src="require('../../../../../assets/icons/avocado.svg')"
            width="20"
            height="20"
            alt=""
          />
        </span>
        <div>
          <h3 class="sd-modern-title-text">{{ $t("avocado_orders.title") }}</h3>
          <p class="sd-modern-subtitle">
            {{ $t("avocado_orders.title_small") }}
          </p>
        </div>
      </div>
    </header>
    <u-chart-area
      :dark="modern && $vuetify.theme.current.dark"
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

<script lang="ts">
import SWidgetBox from "../../../../../ui/widget/box/SWidgetBox.vue";
import UChartArea from "../../../../../ui/chart/area/UChartArea.vue";

export default {
  name: "BDashboardShopOrdersAvocado",
  components: { UChartArea, SWidgetBox },
  props: {
    modern: { type: Boolean, default: false },
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
.b-dashboard-orders-avocado :deep(> .widget-body) {
  margin-block-start: 0;
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

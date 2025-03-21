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
  <div v-if="social_keys?.length > 2 && timeSeries.raw_data?.length > 5">
    <s-widget-box
      :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-teal mx-sm' style='font-size: 6px;'></span> ${$t('admin_shop.dashboard.channels.title')}  </h5><span class='fw-normal ml-xs small'> ${$t(
        'admin_shop.dashboard.channels.subtitle',
      )} </span> `"
      icon="diversity_1"
      class="overflow-hidden"
    >
      <div class="mx-n5">
        <u-chart-funnel
          id="fun-data"
          :animated="true"
          :colors="colors"
          direction="horizontal"
          :display-percentage="false"
          gradient-direction="vertical"
          :height="height"
          :labels="labels"
          :sub-label-images="subLabelImages"
          :sub-labels="subLabels"
          :values="values"
          :width="width"
          class="mt-3"
          hover-opacity-effect
        />
      </div>
    </s-widget-box>
  </div>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UChartFunnel from "@selldone/components-vue/ui/chart/funnel/UChartFunnel.vue";
import { Brands } from "@selldone/core-js/enums/social/Brands.ts";
import { colorSet3, ShadeColor } from "@selldone/core-js/helper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "BDashboardShopChannels",
  mixins: [DateMixin, CurrencyMixin],
  components: {
    UChartFunnel,
    SWidgetBox,
  },
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

  data() {
    return {};
  },

  created() {},

  computed: {
    socials() {
      return this.timeSeries.socialTotalKeys();
    },

    social_keys() {
      return Object.keys(this.socials);
    },
    subLabels() {
      return this.social_keys.map((key) => this.getName(key));
    },
    subLabelImages() {
      return this.social_keys.map((key) => {
        const found = Brands.find(
          (item) => item.name.toLowerCase() === key.toLowerCase(),
        );

        return found?.icon;
      });
    },

    labels() {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          out.push(this.getLocalTimeString(item.created_at, false, true));
        });

      return out;
    },

    values() {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          const social = item.social;

          let _arr = [];

          this.social_keys.forEach((_key) => {
            let _value = social && social[_key] ? social[_key] : 0;

            _arr.push(this.truncate(_value, 0));
          });

          out.push(_arr);
        });

      return out;
    },

    height() {
      return 150 + this.social_keys.length * 30;
    },
    width() {
      if (!this.timeSeries.raw_data) return 500;
      return 500 + 45 * this.timeSeries.raw_data.length;
    },
    colors() {
      return colorSet3.map((color) => [color, ShadeColor(color, -20)]);
    },
  },
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

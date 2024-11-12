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
    <div
      v-if="hasInsufficientData"
    >
      <u-chart-funnel
        id="fun-data"
        :animated="true"
        :class="`mb-3 funnel-chart-finance funnel-dense ${
          bordered ? 'bordered' : ''
        }`"
        :colors="colors"
        :direction="direction"
        :display-percentage="false"
        :gradient-direction="gradientDirection"
        :height="height"
        :labels="labels"
        :sub-label-images="subLabelImages"
        :sub-labels="subLabels"
        :values="values"
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
import UChartFunnel from "../../../../ui/chart/funnel/UChartFunnel.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "SChartFunnelData",
  mixins: [DateMixin],
  components: { UChartFunnel },
  props: {
    timeSeries: {
      required: true,
      type: Object,
    },

    colors: {
      required: true,
      type: Array,
    },

    subLabels: {
      required: true,
      type: Array,
    },
    subLabelImages: Array,
    keys: {
      required: true,
      type: Array,
    },

    bordered: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    gradientDirection: "vertical",
    height: 150,
    direction: "horizontal",
  }),
  computed: {
    hasInsufficientData() {
      return this.timeSeries.raw_data.length > 1;
    },

    widthFunnelFinance() {
      if (!this.timeSeries.raw_data) return 500;
      return 500 + 45 * this.timeSeries.raw_data.length;
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
          let _arr = [];
          this.keys.forEach((_key) => {
            let _value = item[_key] ? item[_key] : 0.0001;

            _arr.push(this.truncate(_value, 0));
          });

          out.push(_arr);
        });

      return out;
    },
  },

  created() {
    // Auto height calculation:
    this.height = this.keys.length * 50;
    this.height =
      this.height > 460 ? 460 : this.height < 150 ? 150 : this.height;
  },
  methods: {},
};
</script>

<style scoped></style>

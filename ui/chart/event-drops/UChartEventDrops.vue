<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <div class="u--chart-event-drops">
    <div ref="chart" class="--chart"></div>
    <v-row v-if="legend" class="text-subtitle-2">
      <v-col cols="12" sm="4">
        {{ $t("global.commons.end") }}:
        <span id="zoomEnd">{{ getLocalDateString(zoomEnd) }}</span>
      </v-col>
      <v-col cols="12" sm="4">
        {{ $t("global.commons.count") }}:
        <span id="numberCommits">{{ numberCommits }}</span>
      </v-col>
      <v-col cols="12" sm="4">
        {{ $t("global.commons.start") }}:
        <span id="zoomStart">{{ getLocalDateString(zoomStart) }}</span>
      </v-col>
    </v-row>

    <div
      v-if="tooltip_show && hasTooltipSlot"
      class="tooltip"
      :style="{ left: tooltip_x, top: tooltip_y }"
    >
      <slot
        name="tooltip"
        :item="current_item.item"
        :date="current_item.date"
        :value="current_item.value"
      ></slot>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import * as d3 from "d3";
import eventDrops from "./core";

export default defineComponent({
  name: "UChartEventDrops",
  props: {
    dataset: {
      /**
       * Format: {name:string, data:{date,item,value}[]}
       * value is optional!
       */
    },
    legend: Boolean,
  },
  data() {
    return {
      numberCommits: 0,
      zoomStart: "",
      zoomEnd: "",
      chart: null,
      tooltip_x: 0,
      tooltip_y: 0,
      tooltip_show: false,
      current_item: null,
    };
  },
  computed: {
    hasTooltipSlot() {
      // Check if 'tooltip' slot is provided
      return !!this.$slots.tooltip;
    },
  },
  watch: {
    dataset() {
      this.update();
    },
  },
  mounted() {
    if (!this.dataset) return;

    this.chart = eventDrops({
      d3,
      zoom: {
        onZoomEnd: this.updateCommitsInformation,
      },
      drop: {
        date: (d) => new Date(d.date),
        onMouseOver: this.handleMouseOver,
        onMouseOut: this.handleMouseOut,
      },
      rtl:this.$vuetify.locale.isRtl
    });

    this.update();
  },
  methods: {
    update() {
      // console.log("dataset", this.dataset);

      d3.select(this.$refs.chart).data([this.dataset]).call(this.chart);

      this.updateCommitsInformation();
    },
    updateCommitsInformation() {
      const filteredData = this.chart
        .filteredData()
        .reduce((total, repo) => total.concat(repo.data), []);

      this.numberCommits = filteredData.length;
      this.zoomStart = this.chart.scale().domain()[0];
      this.zoomEnd = this.chart.scale().domain()[1];
    },
    handleMouseOver(event, item) {
      if (!this.hasTooltipSlot) return;
      this.tooltip_show = true;
      this.current_item = item;

      // Calculate tooltip position based on nearest item and chart elements
      const chartRect = this.$el.getBoundingClientRect();

      const scrollX = window.pageXOffset; // Get current scroll position
      const scrollY = window.pageYOffset; // Get current scroll position

      this.tooltip_x = `${event.pageX - 30 - chartRect.x - scrollX}px`;
      this.tooltip_y = `${event.pageY + 20 - chartRect.y - scrollY}px`;
    },
    handleMouseOut() {
      this.tooltip_show = false;
    },
  },
});
</script>

<style lang="scss">
.u--chart-event-drops {
  position: relative;
  text-align: start;


  @media only screen and (max-width: 1850px) {
    overflow: auto;
    .--chart {
      min-width: 400px;
    }
  }



  .tooltip {
    position: absolute;
    text-align: start;
    max-width: 360px;
    height: auto;
    pointer-events: none;
  }

  .y-tick {
    stroke: black;
    fill: none;
    stroke-width: 1px;
  }

  .axis g.tick line {
    stroke: #777;
    fill: none;
    stroke-width: 1px;
  }

  .line-separator,
  .x-axis {
    stroke: #777;
    fill: none;
    stroke-width: 1px;
  }

  .drop-line:last-child .line-separator {
    display: none;
  }

  text {
    stroke: none;
    fill: black;
  }

  .line-label {
    font-size: 12px;
  }

  .start,
  .end {
    font-size: 12px;
    opacity: 0.7;
  }
  svg text{
    font-family: var(--font) !important;
  }
}
</style>

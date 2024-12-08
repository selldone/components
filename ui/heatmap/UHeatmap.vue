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
  <canvas
    @click="_draw($event, 'click')"
    @mousemove="_draw($event, 'mousemove')"
    @touchmove="_draw($event, 'touchmove')"
    v-resize="onResize"
    ref="h_canvas"
    style="
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
    "
  ></canvas>
</template>
<script lang="ts">
import debounce from "lodash-es/debounce";
import { heatmapFactory } from "@selldone/components-vue/ui/heatmap/core/core.ts";

export default {
  name: "UHeatmap",
  components: {},
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },

    drawingMode: {
      // Can be 'line' or 'line-vertical'
      type: String,
      default: null,
    },

    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    dataset: {
      type: Array,
      default() {
        return [];
      },
    },
    clickDrawable: {
      type: Boolean,
      default: false,
    },
    moveDrawable: {
      type: Boolean,
      default: false,
    },
    drawValue: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      defaultOptions: {},
    };
  },
  computed: {
    mOptions() {
      return {
        ...this.defaultOptions,
        ...this.options,
        drawingMode: this.drawingMode,
      };
    },
  },
  mounted() {
    this.heatmap = heatmapFactory.create(this.$refs.h_canvas, this.mOptions);

    this.heatmap.setDataMax(this.max);
    this.heatmap.setDataMin(this.min);

    this.heatmap.setData(this.dataset);
  },
  beforeUnmount() {},
  watch: {
    mOptions(val) {
      this.heatmap && this.heatmap.configure(val);
    },
    min(val) {
      this.heatmap && this.heatmap.setDataMin(val);
    },
    max(val) {
      this.heatmap && this.heatmap.setDataMax(val);
    },
    dataset(val) {
      if (!this.heatmap) return;
      this.heatmap.setDataMax(this.max);
      this.heatmap.setDataMin(this.min);

      this.heatmap.setData(this.dataset);
    },
  },
  methods: {
    _draw: debounce(function (e, type) {
      if (type === "click" && !this.clickDrawable) return;
      if ((type === "mousemove" || type === "touchmove") && !this.moveDrawable)
        return;

      let x = e.layerX;
      let y = e.layerY;

      if (e.touches && this.$el) {
        const { offsetLeft = 0, offsetTop = 0 } = this.$el;
        x = e.touches[0].pageX - offsetLeft;
        y = e.touches[0].pageY - offsetTop;
      }
      const xField = this.mOptions["xField"] || "x";
      const yField = this.mOptions["yField"] || "y";
      const valueField = this.mOptions["valueField"] || "value";
      if (this.heatmap) {
        const point = {
          [xField]: x,
          [yField]: y,
          [valueField]: this.drawValue,
        };
        // console.log("Draw", point);

        this.heatmap.addData(point);
        this.$emit("change", this.heatmap.getData().data);
      }
    }, 15),
    addData(val) {
      return this.heatmap && this.heatmap.addData(val);
    },
    getValueAt(val) {
      return this.heatmap && this.heatmap.getValueAt(val);
    },
    getData() {
      return this.heatmap && this.heatmap.getData();
    },
    getDataURL() {
      return this.heatmap && this.heatmap.getDataURL();
    },
    repaint() {
      return this.heatmap && this.heatmap.repaint();
    },
    onResize: debounce(function () {
      //console.log("Resize -> ", this.$el.clientWidth, this.$el.clientHeight);
      this.heatmap.repaint();
    }, 500),
  },
};
</script>

<style></style>

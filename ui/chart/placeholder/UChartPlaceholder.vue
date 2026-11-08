<!--
  Stands in for a dashboard chart that has no data yet: a faded gray drawing of the chart's
  shape, so the card keeps its size and the reader sees what will appear, with a short note
  that nothing is recorded yet. The drawing is decorative and holds no numbers.
-->
<template>
  <div
    class="u-chart-placeholder"
    :class="`u-chart-placeholder--${kind}`"
    :style="{ minHeight: minHeight ? `${minHeight}px` : undefined }"
  >
    <svg
      class="u-chart-placeholder__art"
      :viewBox="art.box"
      :preserveAspectRatio="kind === 'donuts' ? 'xMidYMid meet' : 'none'"
      aria-hidden="true"
      focusable="false"
    >
      <path v-for="(d, index) in art.bands" :key="'b' + index" :d="d" />
      <rect
        v-for="(rect, index) in art.bars"
        :key="'r' + index"
        :x="rect[0]"
        :y="rect[1]"
        :width="rect[2]"
        :height="rect[3]"
        rx="2"
      />
      <circle
        v-for="(ring, index) in art.rings"
        :key="'c' + index"
        :cx="ring[0]"
        :cy="ring[1]"
        :r="ring[2]"
        :stroke-dasharray="ring[3]"
        class="u-chart-placeholder__ring"
      />
    </svg>
    <div class="u-chart-placeholder__note" role="status">
      <strong>{{
        title || $t("admin_shop.dashboard.modern.placeholder_title")
      }}</strong>
      <span v-if="text">{{ text }}</span>
    </div>
  </div>
</template>

<script lang="ts">
// Static shapes per chart kind, in their own coordinate box.
const ART = {
  // Sessions on the left splitting into four channels on the right.
  flow: {
    box: "0 0 400 160",
    bars: [
      [0, 16, 12, 128],
      [388, 8, 12, 18],
      [388, 40, 12, 56],
      [388, 110, 12, 14],
      [388, 136, 12, 16],
    ],
    bands: [
      "M12 16 C200 16 200 8 388 8 L388 26 C200 26 200 34 12 34 Z",
      "M12 36 C200 36 200 40 388 40 L388 96 C200 96 200 92 12 92 Z",
      "M12 94 C200 94 200 110 388 110 L388 124 C200 124 200 108 12 108 Z",
      "M12 110 C200 110 200 136 388 136 L388 152 C200 152 200 126 12 126 Z",
    ],
    rings: [],
  },
  // Two part-to-whole rings side by side.
  donuts: {
    box: "0 0 400 160",
    bars: [],
    bands: [],
    rings: [
      [62, 80, 46, "120 12 60 12 40 12"],
      [338, 80, 46, "90 12 80 12 50 12"],
    ],
  },
  // Stages narrowing from the first to the last.
  funnel: {
    box: "0 0 400 160",
    bars: [
      [0, 8, 400, 26],
      [0, 46, 300, 26],
      [0, 84, 220, 26],
      [0, 122, 150, 26],
    ],
    bands: [],
    rings: [],
  },
  // Daily bars over the period.
  bars: {
    box: "0 0 400 160",
    bars: [
      36, 52, 44, 68, 60, 84, 72, 96, 88, 110, 98, 120, 104, 128, 116, 136,
    ].map((height, index) => [index * 25 + 3, 160 - height, 19, height]),
    bands: [],
    rings: [],
  },
  // A short list: an icon, a title and its detail, and a progress track per row.
  rows: {
    box: "0 0 400 160",
    bars: [14, 66, 118].flatMap((y) => [
      [0, y, 18, 18],
      [30, y, 170, 8],
      [30, y + 13, 110, 6],
      [250, y + 6, 150, 6],
    ]),
    bands: [],
    rings: [],
  },
  // Stacked daily bands over the period.
  stream: {
    box: "0 0 400 160",
    bars: [],
    bands: [
      "M0 70 C60 40 100 60 150 50 C210 38 250 70 300 56 C340 46 370 52 400 48 L400 72 C370 76 340 70 300 80 C250 92 210 64 150 76 C100 86 60 70 0 92 Z",
      "M0 92 C60 70 100 86 150 76 C210 64 250 92 300 80 C340 70 370 76 400 72 L400 100 C370 104 340 98 300 108 C250 118 210 96 150 104 C100 112 60 100 0 116 Z",
      "M0 116 C60 100 100 112 150 104 C210 96 250 118 300 108 C340 98 370 104 400 100 L400 118 C370 122 340 118 300 124 C250 132 210 116 150 122 C100 128 60 120 0 132 Z",
    ],
    rings: [],
  },
};

export default {
  name: "UChartPlaceholder",
  props: {
    /** The chart it stands in for: flow, donuts, funnel, bars, rows or stream. */
    kind: { type: String, default: "flow" },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    minHeight: { type: Number, default: 0 },
  },
  computed: {
    art() {
      return ART[this.kind] || ART.flow;
    },
  },
};
</script>

<style lang="scss" scoped>
.u-chart-placeholder {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 140px;
  padding: 12px 0;
}

.u-chart-placeholder__art {
  position: absolute;
  inset: 12px 0;
  width: 100%;
  height: calc(100% - 24px);
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.08;

  path,
  rect {
    fill: currentColor;
  }
}

// Rings and list rows keep a readable size however tall the card grows.
.u-chart-placeholder--donuts .u-chart-placeholder__art,
.u-chart-placeholder--rows .u-chart-placeholder__art {
  inset-block: 50% auto;
  height: min(180px, calc(100% - 24px));
  transform: translateY(-50%);
}

// The note sits between the two rings.

.u-chart-placeholder--donuts .u-chart-placeholder__note {
  max-width: min(220px, 50%);
}

.u-chart-placeholder__ring {
  fill: none;
  stroke: currentColor;
  stroke-width: 16;
}

.u-chart-placeholder__note {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 2px;
  max-width: min(320px, 90%);
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(var(--v-theme-surface), 0.86);
  color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
  font-size: 12px;
  line-height: 1.5;
  text-align: center;

  strong {
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    font-weight: 500;
  }
}
</style>

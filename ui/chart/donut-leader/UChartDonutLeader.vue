<!--
  The shop dashboard's leader-line donut for library widgets (the app keeps its own copy,
  BShopDashboardDonut). A part-to-whole on the modern tokens: a few slices, each one dash of
  the ring with a 2px gap; the largest slices are named
  outside the ring on leader lines, every slice keeps a hover title, and the total sits in the
  middle. A slice with an `image` (an avatar or a logo) shows it as a small circle between
  its leader line and its label. The drawing stays left to right in every language so labels
  follow their lines.
-->
<template>
  <svg
    :aria-label="ariaLabel || summary"
    :class="{ 'b-donut--pre-inverted': preInverted }"
    class="b-donut"
    dir="ltr"
    role="img"
    :viewBox="ringOnly ? RING_BOX : '0 0 360 180'"
  >
    <circle :cx="CX" :cy="CY" :r="R" class="b-donut__track" />
    <g :transform="`rotate(-90 ${CX} ${CY})`">
      <circle
        v-for="arc in arcs"
        :key="arc.key"
        :cx="CX"
        :cy="CY"
        :r="R"
        :stroke="arc.color"
        :stroke-dasharray="arc.dash"
        :stroke-dashoffset="arc.offset"
        class="b-donut__arc"
      >
        <title>
          {{ arc.label }} · {{ arc.percent }} · {{ format(arc.value) }}
        </title>
      </circle>
    </g>

    <!-- Leader lines: out of the ring, then along to the label. -->
    <g v-for="callout in callouts" :key="callout.key" class="b-donut__callout">
      <polyline :points="callout.points" />
      <circle
        :cx="callout.dot[0]"
        :cy="callout.dot[1]"
        :fill="callout.color"
        class="b-donut__dot"
        r="2.5"
      />
      <template v-if="callout.image">
        <clipPath :id="callout.clip">
          <circle :cx="callout.image_x" :cy="callout.y + 3" r="8" />
        </clipPath>
        <image
          :clip-path="`url(#${callout.clip})`"
          :href="callout.image"
          :x="callout.image_x - 8"
          :y="callout.y - 5"
          class="b-donut__image"
          height="16"
          preserveAspectRatio="xMidYMid slice"
          width="16"
        />
      </template>
      <text
        :text-anchor="callout.anchor"
        :x="callout.x"
        :y="callout.y - 4"
        class="b-donut__label"
      >
        {{ callout.text }}
      </text>
      <text
        :text-anchor="callout.anchor"
        :x="callout.x"
        :y="callout.y + 11"
        class="b-donut__value"
      >
        {{ callout.percent }}
      </text>
    </g>

    <text :x="CX" :y="CY + 4" class="b-donut__total">{{ format(total) }}</text>
    <text v-if="unit" :x="CX" :y="CY + 20" class="b-donut__unit">
      {{ unit }}
    </text>
  </svg>
</template>

<script lang="ts">
const CX = 180;
const CY = 90;
const R = 46;
const STROKE = 18;
const OUTER = R + STROKE / 2;
// Just the ring and its total, for a compact card with its own legend beside it.
const RING_BOX = `${CX - OUTER - 1} ${CY - OUTER - 1} ${2 * OUTER + 2} ${2 * OUTER + 2}`;
const CIRCUMFERENCE = 2 * Math.PI * R;
// Labels on one side stay at least this far apart, inside the 180px box.
const LABEL_GAP = 30;
const LABEL_MIN_Y = 16;
const LABEL_MAX_Y = 164;
const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const round = (n: number) => Math.round(n * 100) / 100;
const percentText = (fraction: number) =>
  `${Math.round(fraction * 1000) / 10}%`;
const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;
// Clip ids stay unique when several donuts share a page.
let instances = 0;

export default {
  name: "UChartDonutLeader",
  props: {
    /** { key, label, value, color, image? } drawn clockwise from the top. */
    slices: { type: Array, default: () => [] },
    /** How many of the largest slices are named on leader lines. */
    labels: { type: Number, default: 3 },
    unit: { type: String, default: "" },
    format: { type: Function, default: (value) => compact.format(value || 0) },
    ariaLabel: { type: String, default: "" },
    /** The colors already account for Smart invert (the AI agents scheme): no counter filter. */
    preInverted: { type: Boolean, default: false },
    /** Draw only the ring and its total, without leader lines; the caller lists the slices. */
    ringOnly: { type: Boolean, default: false },
  },

  data: () => ({ CX, CY, R, RING_BOX, uid: ++instances }),

  computed: {
    total() {
      return this.slices.reduce((sum, slice) => sum + (slice.value || 0), 0);
    },
    arcs() {
      const total = this.total;
      if (!total) return [];
      const shown = this.slices.filter((slice) => slice.value > 0);
      const gap = shown.length > 1 ? 2.5 : 0;
      let start = 0;
      return shown.map((slice) => {
        const length = (CIRCUMFERENCE * slice.value) / total;
        const arc = {
          ...slice,
          percent: percentText(slice.value / total),
          mid: (start + length / 2) / CIRCUMFERENCE,
          dash: `${Math.max(length - gap, 0.5)} ${CIRCUMFERENCE}`,
          offset: -start,
        };
        start += length;
        return arc;
      });
    },
    callouts() {
      if (this.ringOnly) return [];
      const picked = [...this.arcs]
        .sort((a, b) => b.value - a.value)
        .slice(0, this.labels)
        .filter((arc) => arc.value / this.total >= 0.03)
        .map((arc) => {
          const angle = arc.mid * 2 * Math.PI - Math.PI / 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          return {
            ...arc,
            side: cos >= 0 ? 1 : -1,
            dot: [CX + (OUTER + 3) * cos, CY + (OUTER + 3) * sin],
            elbow: [CX + (OUTER + 14) * cos, CY + (OUTER + 14) * sin],
            y: CY + (OUTER + 14) * sin,
          };
        });

      // Space the labels of each side top to bottom, then pull the column back into the box.
      [1, -1].forEach((side) => {
        const column = picked
          .filter((callout) => callout.side === side)
          .sort((a, b) => a.y - b.y);
        column.forEach((callout, i) => {
          if (i && callout.y - column[i - 1].y < LABEL_GAP)
            callout.y = column[i - 1].y + LABEL_GAP;
        });
        const overflow = column.length
          ? column[column.length - 1].y - LABEL_MAX_Y
          : 0;
        column.forEach((callout) => {
          if (overflow > 0) callout.y -= overflow;
          callout.y = Math.max(callout.y, LABEL_MIN_Y);
        });
      });

      return picked.map((callout, index) => {
        const end = CX + callout.side * (OUTER + 34);
        const bend = [callout.elbow[0] + callout.side * 8, callout.y];
        // An image sits at the line's end and the label moves past it.
        const image = callout.image || null;
        return {
          key: callout.key,
          color: callout.color,
          percent: callout.percent,
          text: truncate(String(callout.label), image ? 13 : 15),
          dot: callout.dot.map(round),
          points: [callout.dot, callout.elbow, bend, [end, callout.y]]
            .map((point) => point.map(round).join(","))
            .join(" "),
          anchor: callout.side > 0 ? "start" : "end",
          x: round(end + callout.side * (image ? 24 : 4)),
          y: round(callout.y),
          image,
          image_x: round(end + callout.side * 12),
          clip: `u-donut-leader-${this.uid}-${index}`,
        };
      });
    },
    summary() {
      return this.arcs.map((arc) => `${arc.label} ${arc.percent}`).join(", ");
    },
  },
};
</script>

<style lang="scss" scoped>
.b-donut {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.b-donut__track,
.b-donut__arc {
  fill: none;
  stroke-width: 18;
}

.b-donut__track {
  stroke: var(--sd-modern-border);
}

.b-donut__callout polyline {
  fill: none;
  stroke: var(--sd-modern-muted);
  stroke-width: 1;
  opacity: 0.6;
}

.b-donut__label {
  fill: rgb(var(--v-theme-on-surface));
  font-size: 12px;
  font-weight: 500;
}

.b-donut__value {
  fill: var(--sd-modern-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.b-donut__total {
  fill: rgb(var(--v-theme-on-surface));
  font-size: 20px;
  font-weight: 600;
  text-anchor: middle;
}

.b-donut__unit {
  fill: var(--sd-modern-muted);
  font-size: 11px;
  text-anchor: middle;
}

// Smart invert turns the whole window; slices keep their identity colors like the charts,
// unless the caller gives them pre-inverted. Avatars and logos always show their own colors.
// Scoped descendant selectors only: `:global(.smart-invert) .x` would invert the whole layout.
.smart-invert .b-donut:not(.b-donut--pre-inverted) .b-donut__arc,
.smart-invert .b-donut:not(.b-donut--pre-inverted) .b-donut__dot,
.smart-invert .b-donut__image {
  filter: invert(1);
}
</style>

<template>
  <div v-if="content.length" class="api-doc-content text-start">
    <template v-for="(block, blockIndex) in content" :key="blockIndex">
      <figure
        :ref="(el) => setFigure(blockIndex, el)"
        class="api-doc-content__flow sd-modern-illustration"
        :class="{
          'api-doc-content__flow--armed': block.animated && !played[blockIndex],
          'api-doc-content__flow--play': block.animated && played[blockIndex],
        }"
      >
        <figcaption class="api-doc-content__caption">
          <span class="api-doc-content__eyebrow">{{
            $t("api_docs_unified.illustration")
          }}</span>
          <h2>{{ block.title }}</h2>
          <p>{{ block.description }}</p>
        </figcaption>

        <div
          :ref="(el) => setStage(blockIndex, el)"
          class="api-doc-content__stage"
          :class="`api-doc-content__stage--${layouts[blockIndex].kind}`"
          :style="{
            '--doc-flow-columns': layouts[blockIndex].columns,
            '--doc-flow-rows': layouts[blockIndex].rows,
            '--doc-flow-step': `${steps[blockIndex]}s`,
            '--doc-flow-gutter': `${stageGutter(blockIndex)}px`,
            '--doc-flow-gap-extra': `${(layouts[blockIndex].stacked || 0) * 28}px`,
          }"
        >
          <svg
            class="api-doc-content__wires"
            :viewBox="`0 0 ${sizes[blockIndex]?.w || 1} ${sizes[blockIndex]?.h || 1}`"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker
                :id="`${uid}-head-${blockIndex}`"
                orient="auto"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                overflow="visible"
              >
                <path class="api-doc-content__head" d="M0 0 L8 4 L0 8 Z" />
              </marker>
            </defs>
            <path
              v-for="(wire, wireIndex) in wires[blockIndex] || []"
              :key="`wire-${wireIndex}`"
              class="api-doc-content__wire"
              :d="wire.d"
              :marker-end="`url(#${uid}-head-${blockIndex})`"
              :style="{
                '--doc-flow-length': wire.length,
                '--doc-flow-stage': wire.stage,
              }"
            />
            <circle
              v-for="(wire, wireIndex) in wires[blockIndex] || []"
              :key="`pulse-${wireIndex}`"
              class="api-doc-content__pulse"
              r="3.5"
              :style="{
                'offset-path': `path('${wire.d}')`,
                '--doc-flow-stage': wire.stage,
                '--doc-flow-travel': `${wire.travel}s`,
              }"
            />
          </svg>

          <button
            v-for="(node, index) in block.nodes"
            :key="node.id"
            :ref="(el) => setTile(blockIndex, node.id, el)"
            type="button"
            class="api-doc-content__tile"
            :class="{
              'api-doc-content__tile--target': arrivals[blockIndex]?.[node.id],
            }"
            :style="tileStyle(blockIndex, node.id)"
            :aria-describedby="
              node.description ? `${uid}-${blockIndex}-${index}` : undefined
            "
          >
            <span class="api-doc-content__tile-head">
              <v-icon
                v-if="node.icon"
                class="api-doc-content__icon"
                size="18"
                aria-hidden="true"
                >{{ node.icon }}</v-icon
              >
              <strong>{{ node.label }}</strong>
              <span class="api-doc-content__index" aria-hidden="true">{{
                index + 1
              }}</span>
            </span>
            <span v-if="node.caption" class="api-doc-content__tile-caption">{{
              node.caption
            }}</span>
            <span
              v-if="node.outcome"
              class="api-doc-content__outcome"
              :class="`api-doc-content__outcome--${node.outcome.tone}`"
            >
              <span class="api-doc-content__dot" aria-hidden="true"></span
              >{{ node.outcome.label }}
            </span>
            <span
              v-if="node.description"
              :id="`${uid}-${blockIndex}-${index}`"
              class="api-doc-content__sr"
              >{{ node.description }}</span
            >
            <v-tooltip
              v-if="node.description"
              activator="parent"
              location="top"
              open-on-focus
              open-on-click
              content-class="sd-modern-tooltip text-start"
              :text="node.description"
            />
          </button>

          <template v-for="(wire, wireIndex) in wires[blockIndex] || []">
            <span
              v-if="wire.label"
              :key="`pill-${wireIndex}`"
              class="api-doc-content__pill"
              :class="{ 'api-doc-content__pill--end': wire.align === 'end' }"
              aria-hidden="true"
              :style="{
                left: `${wire.mid.x}px`,
                top: `${wire.horizontal ? wire.mid.y - 16 : wire.mid.y}px`,
              }"
              >{{ wire.label }}</span
            >
          </template>
        </div>

        <p
          v-if="legend(block)"
          class="api-doc-content__legend"
          aria-hidden="true"
        >
          <span v-if="block.animated"
            ><span
              class="api-doc-content__dot api-doc-content__dot--data"
            ></span
            >{{ legendLabel("data") }}</span
          >
          <span v-for="tone in legend(block)" :key="tone"
            ><span
              class="api-doc-content__dot"
              :class="`api-doc-content__dot--${tone}`"
            ></span
            >{{ legendLabel(tone) }}</span
          >
        </p>

        <details class="api-doc-content__text">
          <summary>{{ $t("api_docs_unified.flow_text_version") }}</summary>
          <ol class="api-doc-content__accessible-nodes">
            <li v-for="node in block.nodes" :key="node.id">
              {{ node.label
              }}<template v-if="node.description"
                >: {{ node.description }}</template
              ><template v-if="node.outcome">
                ({{ node.outcome.label }})</template
              >
            </li>
          </ol>
          <ul v-if="block.edges.length" class="api-doc-content__connections">
            <li v-for="(edge, index) in block.edges" :key="index">
              <span>{{ nodeLabel(block, edge.from) }}</span>
              <v-icon
                size="13"
                class="api-doc-content__direction"
                aria-hidden="true"
                >arrow_forward</v-icon
              >
              <span>{{ nodeLabel(block, edge.to) }}</span>
              <span
                v-if="edge.label"
                class="api-doc-content__connection-label"
                >{{ edge.label }}</span
              >
            </li>
          </ul>
        </details>
      </figure>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  connectorPath,
  edgeStages,
  laneGutter,
  layoutFlow,
  narrowThreshold,
  motionStep,
  type ApiDocFlowBlock,
  type ApiDocFlowBox,
  type ApiDocFlowLayout,
  type ApiDocFlowTone,
} from "./flow-content";

interface Wire {
  d: string;
  mid: { x: number; y: number };
  horizontal: boolean;
  length: number;
  align?: "end";
  label: string;
  stage: number;
  travel: number;
}

/** Template refs arrive as elements or component instances; only real elements can be measured. */
const asElement = (el: unknown): HTMLElement | null =>
  el &&
  typeof el === "object" &&
  typeof (el as HTMLElement).getBoundingClientRect === "function"
    ? (el as HTMLElement)
    : null;
let instances = 0;

export default defineComponent({
  name: "SArticleFlow",
  props: {
    block: { type: Object as PropType<ApiDocFlowBlock>, required: true },
    legendLabels: {
      type: Object as PropType<
        Partial<Record<ApiDocFlowTone | "data", string>>
      >,
      default: () => ({}),
    },
  },
  data() {
    return {
      uid: `api-doc-flow-${++instances}`,
      narrow: {} as Record<number, boolean>,
      sizes: {} as Record<number, { w: number; h: number }>,
      wires: {} as Record<number, Wire[]>,
      played: {} as Record<number, boolean>,
      figures: {} as Record<number, HTMLElement | null>,
      stages: {} as Record<number, HTMLElement | null>,
      tiles: {} as Record<number, Record<string, HTMLElement | null>>,
      flips: {} as Record<number, number[]>,
      resize: null as ResizeObserver | null,
      intersection: null as IntersectionObserver | null,
      direction: null as MutationObserver | null,
    };
  },
  computed: {
    content(): ApiDocFlowBlock[] {
      // Both callers validate first; a second normalization must not alter canonical article text.
      return [this.block];
    },
    flows(): ApiDocFlowBlock[] {
      return this.content.filter(
        (block): block is ApiDocFlowBlock => block.type === "flow",
      );
    },
    layouts(): Record<number, ApiDocFlowLayout> {
      const out: Record<number, ApiDocFlowLayout> = {};
      this.content.forEach((block, index) => {
        if (block.type === "flow")
          out[index] = layoutFlow(block, this.narrow[index] === true);
      });
      return out;
    },
    steps(): Record<number, number> {
      const out: Record<number, number> = {};
      this.content.forEach((block, index) => {
        if (block.type !== "flow") return;
        const stages = edgeStages(block, this.layouts[index]);
        out[index] = motionStep(Math.max(0, ...stages) + 1);
      });
      return out;
    },
    /** Per tile: the stage and travel time of the edge that reaches it, for the arrival highlight. */
    arrivals(): Record<
      number,
      Record<string, { stage: number; travel: number }>
    > {
      const out: Record<
        number,
        Record<string, { stage: number; travel: number }>
      > = {};
      this.content.forEach((block, index) => {
        if (block.type !== "flow") return;
        const stages = edgeStages(block, this.layouts[index]);
        const map: Record<string, { stage: number; travel: number }> =
          Object.create(null);
        block.edges.forEach((edge, edgeIndex) => {
          const current = map[edge.to];
          const candidate = {
            stage: stages[edgeIndex],
            travel: this.travelTime(index, edgeIndex),
          };
          if (!current || candidate.stage < current.stage)
            map[edge.to] = candidate;
        });
        out[index] = map;
      });
      return out;
    },
  },
  watch: {
    content() {
      this.$nextTick(() => this.measure());
    },
  },
  mounted() {
    if (typeof ResizeObserver !== "undefined") {
      this.resize = new ResizeObserver(() => this.measure());
    }
    if (typeof IntersectionObserver !== "undefined") {
      // The story plays once, when the reader reaches the figure; before that the wires stay hidden.
      this.intersection = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const index = Number(
              (entry.target as HTMLElement).dataset.flowIndex,
            );
            // Fonts and the writing direction may have settled since mount: measure right before playing.
            this.measure();
            this.played[index] = true;
            this.intersection?.unobserve(entry.target);
          }
        },
        { threshold: 0.2 },
      );
    }
    if (
      typeof MutationObserver !== "undefined" &&
      typeof document !== "undefined"
    ) {
      // The language switch flips dir on an ancestor without resizing the stage; the wires must follow the tiles.
      this.direction = new MutationObserver(() =>
        this.$nextTick(() => this.measure()),
      );
      this.direction.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["dir"],
        subtree: true,
      });
    }
    // Function refs run before mounted, so register the already-rendered elements too.
    for (const stage of Object.values(this.stages))
      if (stage) this.resize?.observe(stage);
    for (const figure of Object.values(this.figures))
      if (figure) this.intersection?.observe(figure);
    this.$nextTick(() => this.measure());
  },
  beforeUnmount() {
    this.resize?.disconnect();
    this.intersection?.disconnect();
    this.direction?.disconnect();
  },
  methods: {
    setFigure(index: number, el: unknown) {
      const element = asElement(el);
      this.figures[index] = element;
      if (!element) return;
      element.dataset.flowIndex = String(index);
      if (this.intersection) this.intersection.observe(element);
      else if (typeof IntersectionObserver === "undefined")
        this.played[index] = true;
    },
    setStage(index: number, el: unknown) {
      const element = asElement(el);
      this.stages[index] = element;
      if (element && this.resize) this.resize.observe(element);
    },
    setTile(index: number, id: string, el: unknown) {
      (this.tiles[index] ||= Object.create(null))[id] = asElement(el);
    },
    nodeLabel(block: ApiDocFlowBlock, id: string) {
      return block.nodes.find((node) => node.id === id)?.label || id;
    },
    legendLabel(tone: ApiDocFlowTone | "data") {
      return (
        this.legendLabels[tone] ||
        this.$t(`api_docs_unified.flow_legend_${tone}`)
      );
    },
    legend(block: ApiDocFlowBlock): ApiDocFlowTone[] | null {
      const tones = (
        ["error", "warning", "success"] as ApiDocFlowTone[]
      ).filter((tone) =>
        block.nodes.some((node) => node.outcome?.tone === tone),
      );
      return tones.length || block.animated ? tones : null;
    },
    tileStyle(index: number, id: string) {
      const cell = this.layouts[index]?.cells.find((item) => item.id === id);
      const arrival = this.arrivals[index]?.[id];
      return {
        gridColumn: cell ? `${cell.column + 1}` : undefined,
        gridRow: cell ? `${cell.row + 1} / span ${cell.span}` : undefined,
        "--doc-flow-stage": arrival?.stage ?? 0,
        "--doc-flow-travel": `${arrival?.travel ?? 0.6}s`,
      };
    },
    /** A link that changes rows travels longer than a neighbour link; both stay inside the story budget. */
    travelTime(index: number, edgeIndex: number): number {
      const block = this.content[index];
      if (!block || block.type !== "flow") return 0.6;
      const edge = block.edges[edgeIndex];
      const cells = this.layouts[index]?.cells || [];
      const from = cells.find((cell) => cell.id === edge.from);
      const to = cells.find((cell) => cell.id === edge.to);
      return from &&
        to &&
        from.row !== to.row &&
        this.layouts[index].kind === "rail"
        ? 0.9
        : 0.6;
    },
    /** Narrow columns reserve their bypass lanes at the inline end so a skip link never crosses a tile. */
    stageGutter(index: number): number {
      const layout = this.layouts[index];
      return layout ? laneGutter(layout) : 0;
    },
    measure() {
      this.content.forEach((block, index) => {
        if (block.type !== "flow") return;
        const stage = this.stages[index];
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        // Stack in one column when the wide layout has no readable room per column (see narrowThreshold).
        const wasNarrow = this.narrow[index] === true;
        const narrow =
          rect.width > 0 && rect.width < narrowThreshold(block, wasNarrow);
        // A layout that keeps flipping (the container resizes with the column) stays as it is and is drawn.
        const now = Date.now();
        const recent = (this.flips[index] || []).filter((at) => now - at < 500);
        if (narrow !== wasNarrow && recent.length < 3) {
          this.flips[index] = [...recent, now];
          this.narrow[index] = narrow;
          // The layout changes the grid; measure again once the tiles have moved.
          this.$nextTick(() => this.measure());
          return;
        }
        const rtl =
          typeof getComputedStyle === "function" &&
          getComputedStyle(stage).direction === "rtl";
        const boxes: Record<string, ApiDocFlowBox> = {};
        for (const node of block.nodes) {
          const tile = this.tiles[index]?.[node.id];
          if (!tile) continue;
          const box = tile.getBoundingClientRect();
          boxes[node.id] = {
            x: box.left - rect.left,
            y: box.top - rect.top,
            w: box.width,
            h: box.height,
          };
        }
        const stages = edgeStages(block, this.layouts[index]);
        this.sizes[index] = {
          w: Math.max(1, Math.round(rect.width)),
          h: Math.max(1, Math.round(rect.height)),
        };
        this.wires[index] = block.edges.flatMap((edge, edgeIndex) => {
          const from = boxes[edge.from];
          const to = boxes[edge.to];
          if (!from || !to) return [];
          const connector = connectorPath(from, to, {
            rtl,
            layered: this.layouts[index].kind === "layered",
            lane: this.layouts[index].edgeLanes?.[edgeIndex] ?? -1,
            stack: this.layouts[index].edgeStacks?.[edgeIndex] ?? 0,
          });
          return [
            {
              ...connector,
              label: edge.label,
              stage: stages[edgeIndex],
              travel: this.travelTime(index, edgeIndex),
            },
          ];
        });
      });
    },
  },
});
</script>

<style scoped lang="scss">
.api-doc-content {
  --doc-flow-accent-rgb: var(--sd-modern-illustration-accent-rgb, 147, 66, 193);
  --doc-flow-wire: rgba(var(--v-theme-on-surface), 0.28);
  display: grid;
  gap: 16px;
  min-width: 0;
  margin-block: 0;
  color: rgb(var(--v-theme-on-surface));

  &__flow {
    min-width: 0;
    margin: 0;
    padding: 20px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 18px;
    background: rgba(var(--v-theme-on-surface), 0.018);
  }

  &__caption {
    // Native article headings use !important; the embedded figure keeps its own measured typography.
    h2 {
      margin-block: 4px 6px !important;
      margin-inline: 0 !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      line-height: 1.5 !important;
    }
    p {
      margin: 0 !important;
      font-size: 13px !important;
      line-height: 1.7 !important;
      color: rgba(var(--v-theme-on-surface), 0.72);
    }
  }

  &__eyebrow {
    font-size: 11px;
    line-height: 1.5;
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  // The stage is a grid of opaque tiles; the wires and pills are drawn over it from the measured tile boxes.
  &__stage {
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--doc-flow-columns, 1), minmax(0, 1fr));
    column-gap: clamp(40px, 9%, 100px);
    // A narrow column adds room for the pills stacked in each gap and for the bypass lanes at the inline end.
    row-gap: calc(104px + var(--doc-flow-gap-extra, 0px));
    margin-top: 18px;
    padding: 2px;
    padding-inline-end: calc(2px + var(--doc-flow-gutter, 0px));
    min-width: 0;
  }
  &__stage--layered {
    row-gap: 24px;
  }
  &__stage--layered &__tile {
    align-self: center;
  }

  &__wires {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    fill: none;
    stroke: var(--doc-flow-wire);
    stroke-width: 1.5;
    stroke-linecap: round;
    pointer-events: none;
  }
  &__head {
    fill: var(--doc-flow-wire);
    stroke: none;
  }
  &__wire {
    stroke-dasharray: var(--doc-flow-length);
    stroke-dashoffset: 0;
  }
  &__pulse {
    fill: rgb(var(--doc-flow-accent-rgb));
    stroke: none;
    opacity: 0;
    offset-rotate: 0deg;
  }

  &__tile {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    min-height: 84px;
    padding: 10px 12px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.14);
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: help;
    transition: border-color 0.16s ease;
    &:hover {
      border-color: rgba(var(--v-theme-on-surface), 0.32);
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__tile-head {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    strong {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      font-weight: 600;
      line-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &__icon {
    flex: none;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    color: rgb(var(--doc-flow-accent-rgb));
    background: rgba(var(--doc-flow-accent-rgb), 0.08);
  }
  &__index {
    flex: none;
    font-size: 10px;
    line-height: 14px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-variant-numeric: tabular-nums;
  }
  &__tile-caption {
    font-size: 11.5px;
    line-height: 16px;
    color: rgba(var(--v-theme-on-surface), 0.68);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: ltr;
    text-align: start;
    unicode-bidi: plaintext;
  }
  &__outcome {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 10.5px;
    line-height: 14px;
    color: rgba(var(--v-theme-on-surface), 0.68);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  // Outcome tone is carried by a small dot beside readable text, never by a coloured surface.
  &__dot {
    flex: none;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(var(--v-theme-on-surface), 0.4);
  }
  &__outcome--success &__dot,
  &__dot--success {
    background: rgb(var(--v-theme-success));
  }
  &__outcome--error &__dot,
  &__dot--error {
    background: rgb(var(--v-theme-error));
  }
  &__outcome--warning &__dot,
  &__dot--warning {
    background: rgb(var(--v-theme-warning));
  }
  &__dot--data {
    width: 8px;
    height: 8px;
    background: rgb(var(--doc-flow-accent-rgb));
  }
  &__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__pill {
    position: absolute;
    z-index: 2;
    transform: translate(-50%, -50%);
    max-width: 170px;
    padding: 2px 8px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    font-size: 11px;
    line-height: 14px;
    color: rgba(var(--v-theme-on-surface), 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }
  // A bypass pill ends at its lane and extends over the gap, never over a tile.
  &__pill--end {
    transform: translate(-100%, -50%);
  }

  &__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin: 14px 0 0;
    font-size: 11px;
    line-height: 15px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    > span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  &__text {
    margin-top: 10px;
    > summary {
      width: fit-content;
      padding: 6px;
      margin-inline-start: -6px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1.6;
      color: rgba(var(--v-theme-on-surface), 0.7);
    }
    > summary:hover {
      background: rgba(var(--v-theme-on-surface), 0.04);
    }
    > summary:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
    }
  }
  &__accessible-nodes {
    margin: 8px 0 0;
    padding-inline-start: 20px;
    font-size: 12px;
    line-height: 1.7;
    color: rgba(var(--v-theme-on-surface), 0.78);
  }
  &__connections {
    display: grid;
    gap: 6px;
    padding: 0;
    margin: 10px 0 0;
    list-style: none;
  }
  &__connections li {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 12px;
    line-height: 1.6;
  }
  &__connection-label {
    flex-basis: 100%;
    color: rgba(var(--v-theme-on-surface), 0.65);
  }
  &__direction {
    align-self: center;
  }

  // One automatic story: each stage draws its wire, sends a data dot along it and lights the next tile.
  &__flow--armed &__wire {
    stroke-dashoffset: var(--doc-flow-length);
  }
  &__flow--play &__wire {
    stroke-dashoffset: var(--doc-flow-length);
    animation: api-doc-wire-draw 0.55s ease-out both;
    animation-delay: calc(0.2s + var(--doc-flow-stage) * var(--doc-flow-step));
  }
  &__flow--play &__pulse {
    animation: api-doc-pulse-travel var(--doc-flow-travel) ease-in-out both;
    animation-delay: calc(0.3s + var(--doc-flow-stage) * var(--doc-flow-step));
  }
  &__flow--play &__tile--target {
    animation: api-doc-tile-arrive 0.7s ease both;
    animation-delay: calc(
      0.3s + var(--doc-flow-stage) * var(--doc-flow-step) +
        var(--doc-flow-travel)
    );
  }
}

:global([dir="rtl"]) .api-doc-content__direction {
  transform: rotate(180deg);
}

@keyframes api-doc-wire-draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes api-doc-pulse-travel {
  0% {
    offset-distance: 0%;
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  88% {
    opacity: 1;
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
  }
}
@keyframes api-doc-tile-arrive {
  0% {
    border-color: rgba(var(--v-theme-on-surface), 0.14);
  }
  40% {
    border-color: rgb(var(--doc-flow-accent-rgb));
    box-shadow: 0 0 0 3px rgba(var(--doc-flow-accent-rgb), 0.14);
  }
  100% {
    border-color: rgba(var(--v-theme-on-surface), 0.14);
    box-shadow: none;
  }
}

:global([dir="rtl"]) .api-doc-content__pill--end {
  transform: translate(0, -50%);
}

@media (max-width: 640px) {
  .api-doc-content {
    &__flow {
      padding: 16px;
    }
    &__stage {
      row-gap: calc(56px + var(--doc-flow-gap-extra, 0px));
    }
    &__pill:not(.api-doc-content__pill--end) {
      transform: translate(8px, -50%);
    }
  }
  :global([dir="rtl"]) .api-doc-content__pill:not(.api-doc-content__pill--end) {
    transform: translate(calc(-100% - 8px), -50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .api-doc-content__flow--armed .api-doc-content__wire,
  .api-doc-content__flow--play .api-doc-content__wire,
  .api-doc-content__flow--play .api-doc-content__pulse,
  .api-doc-content__flow--play .api-doc-content__tile--target {
    animation: none;
  }
  .api-doc-content__flow--armed .api-doc-content__wire,
  .api-doc-content__flow--play .api-doc-content__wire {
    stroke-dashoffset: 0;
  }
  .api-doc-content__flow--play .api-doc-content__pulse {
    opacity: 0;
  }
  .api-doc-content__tile {
    transition: none;
  }
}
</style>

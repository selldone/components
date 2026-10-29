<template>
  <div
    ref="diagram"
    class="b-checkout-flow-diagram text-start"
    :class="{ 'b-checkout-flow-diagram--ready': ready }"
    :role="$slots.node ? 'group' : 'img'"
    :aria-label="description"
  >
    <div
      class="b-checkout-flow-diagram__canvas"
      :style="{ width: layout.width + 'px', height: layout.height + 'px' }"
    >
      <svg
        class="b-checkout-flow-diagram__paths"
        :viewBox="`0 0 ${layout.width} ${Math.max(1, layout.height)}`"
        aria-hidden="true"
      >
        <g
          v-for="edge in layout.edges"
          :key="edge.key"
          :class="{
            'b-checkout-flow-diagram__edge--emphasis': edge.emphasized,
          }"
        >
          <path class="b-checkout-flow-diagram__curve" :d="edge.path" />
          <path :d="edge.head" />
        </g>
      </svg>
      <TransitionGroup
        tag="div"
        name="checkout-step-flow"
        class="b-checkout-flow-diagram__grid"
        :style="{ gridTemplateColumns: `repeat(${layout.columns}, 128px)` }"
      >
        <div
          v-for="node in layout.nodes"
          :key="node.id"
          :data-step-id="node.id"
          class="b-checkout-flow-diagram__node"
          :class="{
            'b-checkout-flow-diagram__node--emphasis': node.id === emphasis,
            'b-checkout-flow-diagram__node--custom': !!$slots.node,
          }"
          :style="{ gridColumn: node.column + 1, gridRow: node.row + 1 }"
        >
          <slot name="node" :node="node">
            <v-icon v-if="node.icon">{{ node.icon }}</v-icon>
            <span class="b-checkout-flow-diagram__title">{{ node.title }}</span>
            <span v-if="node.caption" class="b-checkout-flow-diagram__caption">{{
              node.caption
            }}</span>
            <span
              v-if="node.baskets?.length"
              class="b-checkout-flow-diagram__baskets"
              ><img
                v-for="basket in node.baskets"
                :key="basket.src"
                :src="basket.src"
                :alt="basket.alt"
                width="12"
                height="12"
            /></span>
          </slot>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BShopCheckoutFlowDiagram",
  props: {
    steps: { type: Array, required: true },
    emphasis: { type: String, default: null },
  },
  data: () => ({
    availableWidth: 128,
    resizeObserver: null,
    ready: false,
  }),
  computed: {
    description() {
      return this.steps
        .map((step) =>
          [
            step.title,
            step.caption,
            step.baskets?.map((basket) => basket.alt).join(", "),
          ]
            .filter(Boolean)
            .join(" · "),
        )
        .join(" → ");
    },
    layout() {
      const columns = Math.min(
        this.steps.length || 1,
        Math.max(1, Math.floor((this.availableWidth + 40) / 168)),
      );
      const rows = Math.ceil(this.steps.length / columns);
      const nodes = this.steps.map((step, index) => {
        const row = Math.floor(index / columns);
        const column =
          row % 2 ? columns - 1 - (index % columns) : index % columns;
        return { ...step, row, column, x: column * 168, y: row * 120 };
      });
      const edges = nodes.slice(0, -1).map((from, index) => {
        const to = nodes[index + 1];
        // Keep dashes clear of the straight terminal shaft and arrowhead.
        const shaftLength = 12, dashGap = 4;
        let path, head;
        if (from.row === to.row) {
          const direction = to.column > from.column ? 1 : -1;
          const startX = from.x + (direction > 0 ? 128 : 0);
          const endX = to.x + (direction > 0 ? 0 : 128);
          const y = from.y + 40;
          const dashEndX = endX - direction * (shaftLength + dashGap);
          const middleX = (startX + dashEndX) / 2;
          path = `M${startX} ${y} C${startX + direction * 8} ${y} ${startX + direction * 4} ${y - 12} ${middleX} ${y - 12} S${dashEndX - direction * 8} ${y} ${dashEndX} ${y}`;
          head = `M${endX - direction * shaftLength} ${y} L${endX} ${y} M${endX - direction * 6} ${y - 4} L${endX} ${y} L${endX - direction * 6} ${y + 4}`;
        } else {
          const startX = from.x + 64,
            startY = from.y + 80;
          const endX = to.x + 64,
            endY = to.y;
          const dashEndY = endY - shaftLength - dashGap;
          const middleY = (startY + dashEndY) / 2;
          path = `M${startX} ${startY} C${startX + 18} ${startY + 6} ${endX - 18} ${middleY - 6} ${endX} ${middleY} S${endX} ${dashEndY - 6} ${endX} ${dashEndY}`;
          head = `M${endX} ${endY - shaftLength} L${endX} ${endY} M${endX - 4} ${endY - 6} L${endX} ${endY} L${endX + 4} ${endY - 6}`;
        }
        return {
          key: `${from.id}-${to.id}`,
          path,
          head,
          emphasized:
            !!this.emphasis &&
            (from.id === this.emphasis || to.id === this.emphasis),
        };
      });
      return {
        columns,
        rows,
        nodes,
        edges,
        width: columns * 128 + (columns - 1) * 40,
        height: rows ? rows * 80 + (rows - 1) * 40 : 0,
      };
    },
  },
  mounted() {
    this.measureWidth();
    this.resizeObserver = new ResizeObserver(this.measureWidth);
    this.resizeObserver.observe(this.$refs.diagram);
  },
  beforeUnmount() {
    this.resizeObserver?.disconnect();
  },
  methods: {
    measureWidth() {
      const width = this.$refs.diagram?.getBoundingClientRect().width;
      if (width && width !== this.availableWidth) {
        // Resize directly into the new rows; animate only changes to step order.
        this.ready = false;
        this.availableWidth = width;
        this.$nextTick(() => {
          this.ready = true;
        });
      } else if (!this.ready) {
        this.ready = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-checkout-flow-diagram {
  min-width: 0;
  width: 100%;
  padding-block: 14px;

  &__canvas {
    position: relative;
    margin-inline: auto;
  }
  &__grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-auto-rows: 80px;
    gap: 40px;
  }
  &__node {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 128px;
    height: 80px;
    padding: 6px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    text-align: center;
  }
  &__node > .v-icon {
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
    color: var(--sd-modern-muted);
    font-size: 18px !important;
  }
  &__node--custom {
    padding: 0;
  }
  &__node--emphasis {
    position: relative;
    z-index: 1;
    border-color: rgb(var(--v-theme-primary));
    box-shadow:
      0 4px 14px rgba(var(--v-theme-primary), 0.12),
      inset 0 0 0 1px rgb(var(--v-theme-primary));
  }
  &__node--emphasis > .v-icon {
    color: rgb(var(--v-theme-primary));
  }
  &__title {
    max-width: 100%;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  &__caption {
    max-width: 100%;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  &__baskets {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }
  &__baskets img {
    display: block;
    width: 12px;
    height: 12px;
    object-fit: contain;
  }
  &__paths {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    color: var(--sd-modern-muted);
    pointer-events: none;
  }
  &__paths path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  &__curve {
    stroke-dasharray: 3 4;
  }
  &__edge--emphasis {
    color: rgb(var(--v-theme-primary));
  }
  &:dir(rtl) &__paths {
    transform: scaleX(-1);
  }
  &--ready .checkout-step-flow-move {
    transition: transform 520ms cubic-bezier(0.22, 0.7, 0.25, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    &--ready .checkout-step-flow-move {
      transition: none;
    }
  }
}
</style>

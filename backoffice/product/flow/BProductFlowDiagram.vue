<template>
  <div ref="diagram" class="b-product-flow-diagram text-start" role="group" :aria-label="description">
    <div class="b-product-flow-diagram__grid" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
      <button
        v-for="node in nodes"
        :key="node.id"
        :data-flow-step="node.id"
        type="button"
        class="b-product-flow-diagram__node"
        :style="{ gridColumn: node.column + 1, gridRow: node.row + 1 }"
        :aria-label="node.title"
      >
        <img v-if="node.image" :src="node.image" alt="" width="26" height="26" />
        <v-icon v-else size="24" aria-hidden="true">{{ node.icon }}</v-icon>
        <span>{{ node.title }}</span>
        <v-tooltip activator="parent" location="top" open-on-click :open-on-focus="true" content-class="sd-modern-tooltip text-start">
          {{ node.help }}
        </v-tooltip>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { useLocale, useTheme } from "vuetify";
import type LeaderLine from "vue3-leaderline";

type Step = { id: string; title: string; help: string; icon?: string; image?: string; backward?: boolean };
const props = defineProps<{ steps: Step[] }>();
const diagram = ref<HTMLElement>();
const availableWidth = ref(124);
const { isRtl } = useLocale();
const theme = useTheme();
const id = useId();
const rowLengths = computed(() => {
  const count = props.steps.length;
  const capacity = Math.max(1, Math.floor((availableWidth.value + 20) / 120));
  const rows = Math.ceil(count / capacity);
  // Balance the actual steps across rows rather than leaving a short trailing row.
  return Array.from({ length: rows }, (_, row) => Math.floor(count / rows) + (row < count % rows ? 1 : 0));
});
const columns = computed(() => rowLengths.value[0] || 1);
const nodes = computed(() => {
  let index = 0, column = 0;
  return rowLengths.value.flatMap((length, row) => Array.from({ length }, (_, offset) => {
    const node = { ...props.steps[index++], row, column };
    if (offset < length - 1) column += row % 2 ? -1 : 1;
    return node;
  }));
});
const description = computed(() => props.steps.map(step => step.title).join(" → "));
let Line: typeof LeaderLine | undefined;
let mounted = false;
let frame = 0;
let sequence = 0;
let observer: ResizeObserver | undefined;
let appearanceObserver: MutationObserver | undefined;
const connectors: { from: HTMLElement; to: HTMLElement; backward: boolean; line: LeaderLine; svg: SVGElement }[] = [];

function removeLines() {
  for (const { line } of connectors) line.remove();
  connectors.length = 0;
}

function positionLines() {
  frame = 0;
  const root = diagram.value;
  if (!mounted || !root) return;
  if (!root.getClientRects().length) {
    for (const { svg } of connectors) svg.style.visibility = "hidden";
    return;
  }
  const width = root.getBoundingClientRect().width;
  if (width && width !== availableWidth.value) {
    availableWidth.value = width;
    nextTick(schedulePosition);
    return;
  }
  if (!Line) return;
  const elements = [...root.querySelectorAll<HTMLElement>("[data-flow-step]")];
  if (connectors.length !== Math.max(0, elements.length - 1) || connectors.some((edge, index) => edge.from !== elements[index] || edge.to !== elements[index + 1])) {
    removeLines();
    elements.slice(0, -1).forEach((from, index) => {
      const to = elements[index + 1], backward = !!props.steps[index + 1].backward;
      const lineId = `${id}-product-flow-${++sequence}`;
      const line = new Line!(from, to, {
        lineId, path: "fluid", size: 1.6,
        startPlug: backward ? "arrow1" : "disc", endPlug: "arrow1",
        color: getComputedStyle(root).color,
      });
      const svg = document.getElementById(lineId) as SVGElement | null;
      if (!svg) { line.remove(); return; }
      svg.setAttribute("aria-hidden", "true");
      Object.assign(svg.style, { pointerEvents: "none", opacity: "0.5", visibility: "hidden" });
      connectors.push({ from, to, backward, line, svg });
    });
  }

  const bounds = root.getBoundingClientRect();
  let top = Math.max(bounds.top, 0), bottom = Math.min(bounds.bottom, window.innerHeight);
  let left = Math.max(bounds.left, 0), right = Math.min(bounds.right, document.documentElement.clientWidth);
  for (let parent = root.parentElement; parent && parent !== document.scrollingElement; parent = parent.parentElement) {
    const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
    if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { left = Math.max(left, box.left); right = Math.min(right, box.right); }
    if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) { top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom); }
  }
  const boundary = root.closest<HTMLElement>(".s--card-window-content");
  // The library's body-level SVG sits outside Smart invert, so it needs that boundary's conversion once.
  const filter = boundary ? getComputedStyle(boundary).filter : "none";
  for (const { from, to, backward, line, svg } of connectors) {
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const sameRow = Math.abs(a.top - b.top) < 5, forward = b.left > a.left;
    line.setOptions({
      color: getComputedStyle(root).color,
      startPlug: backward ? "arrow1" : "disc",
      startSocket: sameRow ? forward ? "right" : "left" : "bottom",
      endSocket: sameRow ? forward ? "left" : "right" : "top",
      startSocketGravity: sameRow ? [forward ? 15 : -15, -8] : [12, 18],
      endSocketGravity: sameRow ? [forward ? -15 : 15, -8] : [12, -18],
    });
    line.position();
    Object.assign(svg.style, {
      position: "fixed", transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
      zIndex: "1", filter, visibility: right > left && bottom > top ? "visible" : "hidden",
    });
    const box = svg.getBoundingClientRect();
    svg.style.clipPath = `inset(${Math.max(0, top - box.top)}px ${Math.max(0, box.right - right)}px ${Math.max(0, box.bottom - bottom)}px ${Math.max(0, left - box.left)}px)`;
  }
}

function schedulePosition() {
  if (mounted && !frame) frame = requestAnimationFrame(positionLines);
}

onMounted(async () => {
  mounted = true;
  const root = diagram.value;
  if (!root) return;
  observer = new ResizeObserver(schedulePosition);
  observer.observe(root);
  if (root.parentElement) observer.observe(root.parentElement);
  appearanceObserver = new MutationObserver(schedulePosition);
  for (let parent = root.parentElement; parent; parent = parent.parentElement) {
    appearanceObserver.observe(parent, { attributes: true, attributeFilter: ["class", "style"] });
  }
  document.addEventListener("scroll", schedulePosition, { capture: true, passive: true });
  window.addEventListener("resize", schedulePosition, { passive: true });
  schedulePosition();
  try {
    const module = await import("vue3-leaderline");
    await nextTick();
    if (!mounted) return;
    Line = module.default;
    schedulePosition();
  } catch (error) {
    console.warn("Product flow connectors could not be drawn.", error);
  }
});

watch([() => props.steps, isRtl, theme.current], async () => {
  removeLines();
  await nextTick();
  schedulePosition();
}, { deep: true, flush: "post" });

onBeforeUnmount(() => {
  mounted = false;
  if (frame) cancelAnimationFrame(frame);
  observer?.disconnect();
  appearanceObserver?.disconnect();
  document.removeEventListener("scroll", schedulePosition, true);
  window.removeEventListener("resize", schedulePosition);
  removeLines();
});
</script>

<style scoped lang="scss">
.b-product-flow-diagram {
  min-width: 0;
  color: rgba(var(--v-theme-on-surface), .55);
  padding-block: 24px 8px;

  &__grid { display: grid; gap: 36px 20px; }
  &__node {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    min-height: 92px;
    padding: 12px 8px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    text-align: center;
    overflow-wrap: anywhere;

    img { object-fit: contain; }
    &:hover { background: color-mix(in srgb, rgb(var(--v-theme-surface)) 97%, rgb(var(--v-theme-on-surface))); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }
}
</style>

<template>
  <span ref="anchor" class="b-transportation-flow-lines" aria-hidden="true" />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { useLocale, useTheme } from "vuetify";
import type LeaderLine from "vue3-leaderline";

type Socket = "top" | "bottom" | "left" | "right";
type Edge = { from: string; to: string; startSocket?: Socket; endSocket?: Socket; dash?: boolean };
const props = withDefaults(defineProps<{
  edges: Edge[];
  direction?: "vertical" | "horizontal";
  active?: boolean;
}>(), { direction: "vertical", active: true });
const anchor = ref<HTMLElement>();
const { isRtl } = useLocale();
const theme = useTheme();
const id = useId();
let root: HTMLElement | null = null;
let Line: typeof LeaderLine | undefined;
let mounted = false;
let frame = 0;
let sequence = 0;
let observer: ResizeObserver | undefined;
const connectors: { key: string; from: HTMLElement; to: HTMLElement; edge: Edge; line: LeaderLine; svg: SVGElement }[] = [];

function hideLines() {
  for (const { svg } of connectors) svg.style.visibility = "hidden";
}

function removeLines() {
  for (const { line } of connectors) line.remove();
  connectors.length = 0;
}

function positionLines() {
  frame = 0;
  if (!root || !Line || !props.active || !root.getClientRects().length) {
    hideLines();
    return;
  }
  const overlay = root.closest<HTMLElement>(".v-overlay");
  if (overlay && !overlay.classList.contains("v-overlay--active")) {
    hideLines();
    return;
  }

  const nodes = new Map<string, HTMLElement>();
  for (const element of root.querySelectorAll<HTMLElement>("[data-flow-node]")) {
    nodes.set(element.dataset.flowNode!, element);
  }
  const pairs: { key: string; from: HTMLElement; to: HTMLElement; edge: Edge }[] = [];
  for (const edge of props.edges) {
    const from = nodes.get(edge.from), to = nodes.get(edge.to);
    if (!from || !to || !from.getClientRects().length || !to.getClientRects().length) continue;
    pairs.push({ key: JSON.stringify(edge), from, to, edge });
  }
  if (pairs.length !== connectors.length || pairs.some((pair, index) =>
    pair.key !== connectors[index]?.key || pair.from !== connectors[index]?.from || pair.to !== connectors[index]?.to)) {
    removeLines();
    observer?.disconnect();
    observer?.observe(root);
    if (root.parentElement) observer?.observe(root.parentElement);
    for (const pair of pairs) {
      const lineId = `${id}-transportation-path-${++sequence}`;
      const line = new Line(pair.from, pair.to, {
        lineId, path: "fluid", size: 2.2,
        startPlug: "behind", endPlug: "arrow1", endPlugSize: 1.25,
        color: getComputedStyle(root).color,
      });
      const svg = document.getElementById(lineId) as SVGElement | null;
      if (!svg) { line.remove(); continue; }
      svg.setAttribute("aria-hidden", "true");
      Object.assign(svg.style, { pointerEvents: "none", opacity: "0.6", visibility: "hidden" });
      connectors.push({ ...pair, line, svg });
      observer?.observe(pair.from);
      observer?.observe(pair.to);
    }
  }

  const bounds = root.getBoundingClientRect();
  let top = Math.max(bounds.top, 0), bottom = Math.min(bounds.bottom, window.innerHeight);
  let left = Math.max(bounds.left, 0), right = Math.min(bounds.right, document.documentElement.clientWidth);
  // LeaderLine renders in body; intersect its clip with nested scrolling canvases too.
  // The document scroller is already bounded by the viewport above; its box moves with window scroll.
  for (let parent = root.parentElement; parent && parent !== document.scrollingElement; parent = parent.parentElement) {
    const style = getComputedStyle(parent);
    const box = parent.getBoundingClientRect();
    if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
      left = Math.max(left, box.left);
      right = Math.min(right, box.right);
    }
    if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
      top = Math.max(top, box.top);
      bottom = Math.min(bottom, box.bottom);
    }
  }
  const horizontal = props.direction === "horizontal";
  const layer = overlay ? Number.parseInt(getComputedStyle(overlay).zIndex, 10) || 0 : 0;
  for (const { edge, line, svg } of connectors) {
    line.setOptions({
      color: getComputedStyle(root).color,
      dash: edge.dash || false,
      startSocket: edge.startSocket || (horizontal ? isRtl.value ? "left" : "right" : "bottom"),
      endSocket: edge.endSocket || (horizontal ? isRtl.value ? "right" : "left" : "top"),
      startSocketGravity: 20,
      endSocketGravity: 20,
    });
    line.position();
    Object.assign(svg.style, {
      position: "fixed", transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
      zIndex: String(layer + 1), visibility: right > left && bottom > top ? "visible" : "hidden",
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
  root = anchor.value?.parentElement || null;
  if (!root) return;
  observer = new ResizeObserver(schedulePosition);
  observer.observe(root);
  if (root.parentElement) observer.observe(root.parentElement);
  document.addEventListener("scroll", schedulePosition, { capture: true, passive: true });
  window.addEventListener("resize", schedulePosition, { passive: true });
  try {
    const module = await import("vue3-leaderline");
    await nextTick();
    if (!mounted) return;
    Line = module.default;
    schedulePosition();
  } catch (error) {
    console.warn("Transportation flow paths could not be drawn.", error);
  }
});

watch([() => props.edges, () => props.active, () => props.direction, isRtl, theme.current], async () => {
  if (!props.active) hideLines();
  await nextTick();
  schedulePosition();
}, { deep: true, flush: "post" });

onBeforeUnmount(() => {
  mounted = false;
  if (frame) cancelAnimationFrame(frame);
  observer?.disconnect();
  document.removeEventListener("scroll", schedulePosition, true);
  window.removeEventListener("resize", schedulePosition);
  removeLines();
});
</script>

<style scoped>
.b-transportation-flow-lines { display: none; }
</style>

<template>
  <section class="sd-modern-widget b-dropshipping-workflow text-start" :aria-labelledby="titleId">
    <header class="b-dropshipping-workflow__header">
      <h2 :id="titleId" class="sd-modern-title-text">{{ $t(`${copy}.title`) }}</h2>
      <span class="b-dropshipping-workflow__label">{{ $t(`${copy}.illustration`) }}</span>
    </header>

    <div class="b-dropshipping-workflow__steps" role="group" :aria-labelledby="titleId">
      <button
        v-for="step in steps"
        :key="step.id"
        type="button"
        class="sd-modern-button b-dropshipping-workflow__step"
        :aria-pressed="selected === step.id"
        :aria-controls="captionId"
        @pointerenter="select(step.id)"
        @focus="select(step.id)"
        @click="select(step.id)"
      >
        <v-icon size="16" aria-hidden="true">{{ step.icon }}</v-icon>
        <span>{{ $t(`${copy}.steps.${step.id}.label`) }}</span>
      </button>
    </div>

    <figure class="sd-modern-illustration b-dropshipping-workflow__story" :aria-describedby="summaryId">
      <div ref="stage" class="b-dropshipping-workflow__stage" :class="{ 'b-dropshipping-workflow__stage--compact': compact }" aria-hidden="true">
        <svg class="b-dropshipping-workflow__wires" :viewBox="`0 0 ${layout?.width || 1} ${layout?.height || 1}`" fill="none" focusable="false">
          <defs>
            <marker :id="arrowId" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
              <path d="m1 1 6 3-6 3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            </marker>
          </defs>
          <g class="b-dropshipping-workflow__connections">
            <path v-for="route in routes" :key="`${route.from}-${route.to}`" :d="route.d" :marker-end="`url(#${arrowId})`" />
          </g>
          <g v-if="moving" :key="motionId" class="b-dropshipping-workflow__packets" :style="{ visibility: packetsStarted ? 'visible' : 'hidden' }">
            <circle v-for="route in routes" :key="`${route.from}-${route.to}`" r="3">
              <animateMotion ref="motionElements" :path="route.d" begin="indefinite" dur="2.4s" repeatCount="1" fill="freeze" />
            </circle>
          </g>
        </svg>

        <div
          v-for="node in nodes"
          :key="node.id"
          ref="nodeElements"
          class="b-dropshipping-workflow__node"
          :data-node="node.id"
          :data-active="activeNodes.has(node.id)"
        >
          <div class="b-dropshipping-workflow__identity">
            <svg class="sd-modern-illustration__icon" width="18" height="18" viewBox="0 0 24 24" focusable="false">
              <path v-for="(path, index) in node.symbol" :key="index" :d="path" />
            </svg>
            <span>{{ $t(`${copy}.nodes.${node.label}`) }}</span>
          </div>
          <small v-if="node.id === 'a'" dir="ltr">AE · SA</small>
          <small v-else-if="node.id === 'b'" dir="ltr">AE · KW</small>
          <small v-else>{{ $t(`${copy}.nodes.${node.id === 'customer' ? (selected === 'delivery' ? 'delivery_hint' : 'payment_hint') : node.hint}`) }}</small>
        </div>
      </div>
      <figcaption :id="captionId" class="b-dropshipping-workflow__caption">
        <h3>{{ $t(`${copy}.steps.${selected}.title`) }}</h3>
        <p>{{ $t(`${copy}.steps.${selected}.body`) }}</p>
      </figcaption>
    </figure>
    <p :id="summaryId" class="b-dropshipping-workflow__summary">{{ $t(`${copy}.summary`) }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { dropshippingWorkflowRoutes, type NodeBox, type WorkflowLayout, type WorkflowNode, type WorkflowStep } from "./dropshippingWorkflowRoutes";

const copy = "product_add_dropshipping_shops.modern.workflow";
const id = useId();
const titleId = `${id}-title`, captionId = `${id}-caption`, summaryId = `${id}-summary`, arrowId = `${id}-arrow`;
const steps: { id: WorkflowStep; icon: string }[] = [
  { id: "setup", icon: "warehouse" },
  { id: "access", icon: "key" },
  { id: "products", icon: "add_box" },
  { id: "payment", icon: "credit_card" },
  { id: "settlement", icon: "account_balance_wallet" },
  { id: "delivery", icon: "local_shipping" },
];
const warehouse = ["M3 21V8l9-5 9 5v13M2 21h20M7 21V11h10v10M7 15h10M7 18h10"];
const nodes: { id: WorkflowNode; label: string; hint?: string; symbol: string[] }[] = [
  { id: "a", label: "supplier_a", symbol: warehouse },
  { id: "b", label: "supplier_b", symbol: warehouse },
  { id: "store", label: "store", hint: "store_hint", symbol: ["M4 10v11h16V10M3 4h18l1 6c-1 3-4 3-5 0-1 3-4 3-5 0-1 3-4 3-5 0-1 3-4 3-5 0l1-6ZM9 21v-7h6v7"] },
  { id: "customer", label: "customer", symbol: ["M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2"] },
  { id: "wallet", label: "accounts", hint: "accounts_hint", symbol: ["M20 7H5a2 2 0 0 1 0-4h13v4M3 5v14a2 2 0 0 0 2 2h15V7M20 11h-5v6h5M16 14h1"] },
];

const stage = ref<HTMLElement | null>(null);
const nodeElements = ref<HTMLElement[]>([]);
const compact = ref(false);
const layout = ref<WorkflowLayout | null>(null);
const selected = ref<WorkflowStep>("setup");
const routes = computed(() => layout.value ? dropshippingWorkflowRoutes(layout.value, selected.value) : []);
const activeNodes = computed(() => new Set(routes.value.flatMap((route) => [route.from, route.to])));
const moving = ref(false);
const packetsStarted = ref(false);
const motionElements = ref<SVGAnimationElement[]>([]);
const motionId = ref(0);
let observer: ResizeObserver | undefined;
let reducedMotion: MediaQueryList | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let frame = 0;
let disposed = false;

function select(step: WorkflowStep) {
  if (selected.value !== step) selected.value = step;
}

async function measure() {
  if (!stage.value || disposed) return;
  const narrow = stage.value.clientWidth <= 620;
  if (compact.value !== narrow) {
    compact.value = narrow;
    await nextTick();
  }
  if (!stage.value || disposed || nodeElements.value.length !== nodes.length) return;
  const bounds = stage.value.getBoundingClientRect();
  const boxes = {} as Record<WorkflowNode, NodeBox>;
  for (const node of nodeElements.value) {
    const box = node.getBoundingClientRect();
    boxes[node.dataset.node as WorkflowNode] = {
      left: box.left - bounds.left, right: box.right - bounds.left,
      top: box.top - bounds.top, bottom: box.bottom - bounds.top,
    };
  }
  if (!bounds.width || !bounds.height) return;
  layout.value = { width: bounds.width, height: bounds.height, compact: compact.value, rtl: getComputedStyle(stage.value).direction === "rtl", nodes: boxes };
}

function scheduleMeasure() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => { void measure(); });
}

function stopMotion() {
  clearTimeout(timer);
  timer = undefined;
  moving.value = false;
  packetsStarted.value = false;
}

async function playMotion() {
  stopMotion();
  if (disposed || document.hidden || reducedMotion?.matches || !routes.value.length) return;
  const currentMotion = ++motionId.value;
  moving.value = true;
  await nextTick();
  if (disposed || !moving.value || currentMotion !== motionId.value || document.hidden || reducedMotion?.matches) return;
  // An SVG's clock keeps advancing between steps; start each new packet at the current time.
  motionElements.value.forEach((animation) => animation.beginElement?.());
  packetsStarted.value = true;
  timer = setTimeout(stopMotion, 2400);
}

function onVisibilityChange() {
  if (document.hidden) stopMotion();
}

function onMotionPreferenceChange() {
  if (reducedMotion?.matches) stopMotion();
}

watch(selected, async () => {
  await nextTick();
  await measure();
  playMotion();
});

onMounted(async () => {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.addEventListener("change", onMotionPreferenceChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", stopMotion);
  observer = new ResizeObserver(scheduleMeasure);
  if (stage.value) observer.observe(stage.value);
  nodeElements.value.forEach((node) => observer?.observe(node));
  await measure();
  playMotion();
});

onBeforeUnmount(() => {
  disposed = true;
  stopMotion();
  cancelAnimationFrame(frame);
  observer?.disconnect();
  reducedMotion?.removeEventListener("change", onMotionPreferenceChange);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("pagehide", stopMotion);
});
</script>

<style scoped lang="scss">
.b-dropshipping-workflow {
  container-type: inline-size;
  padding: 20px 22px;
  border-radius: 16px;
  font-family: inherit;
  letter-spacing: 0;

  &__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
  &__header h2 { margin: 0; font-size: 17px; font-weight: 500; line-height: 24px; }
  &__label { color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; letter-spacing: .05em; }
  &__steps { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; margin-bottom: 16px; }
  &__step.sd-modern-button { display: flex; align-items: flex-start; gap: 7px; min-width: 0; min-height: 44px; height: auto; padding: 10px 9px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: inherit; font: inherit; font-size: 12px; font-weight: 400; line-height: 18px; text-align: start; letter-spacing: 0; cursor: pointer; }
  &__step > .v-icon { flex: 0 0 auto; margin-top: 1px; color: var(--sd-modern-muted); }
  &__step[aria-pressed="true"] { border-color: var(--dropshipping-primary-ink, rgb(var(--v-theme-primary))); background: var(--sd-modern-inset); }
  &__step[aria-pressed="true"] > .v-icon { color: var(--dropshipping-primary-ink, rgb(var(--v-theme-primary))); }
  &__step:focus-visible { outline: 2px solid var(--dropshipping-primary-ink, rgb(var(--v-theme-primary))); outline-offset: 3px; }
  &__story { --workflow-art-ink: color-mix(in srgb, rgb(var(--sd-modern-illustration-accent-rgb)) var(--dropshipping-art-mix, 100%), rgb(var(--v-theme-on-surface))); display: grid; grid-template-columns: minmax(0, 1fr) 230px; align-items: center; gap: 22px; margin: 0; }
  &__stage { position: relative; isolation: isolate; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 1fr); grid-template-rows: repeat(2, minmax(82px, auto)); gap: 24px 64px; min-width: 0; padding: 32px 24px 40px; }
  &__node { z-index: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 0; padding: 12px; border: 1px solid var(--sd-modern-border); border-radius: 14px; background: rgb(var(--v-theme-surface)); }
  &__node[data-active="true"] { border-color: color-mix(in srgb, var(--workflow-art-ink) 58%, transparent); }
  &__node[data-node="a"] { grid-column: 1; grid-row: 1; }
  &__node[data-node="b"] { grid-column: 1; grid-row: 2; }
  &__node[data-node="store"] { grid-column: 2; grid-row: 1 / 3; align-self: center; min-height: 106px; border-radius: 18px; }
  &__node[data-node="customer"] { grid-column: 3; grid-row: 1; }
  &__node[data-node="wallet"] { grid-column: 3; grid-row: 2; }
  &__identity { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 500; line-height: 18px; }
  &__identity > svg { color: var(--workflow-art-ink); }
  &__identity > span { min-width: 0; overflow-wrap: anywhere; }
  &__node small { color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 16px; overflow-wrap: anywhere; }
  &__wires { position: absolute; z-index: 0; inset: 0; width: 100%; height: 100%; overflow: visible; color: var(--workflow-art-ink); pointer-events: none; }
  &__connections { opacity: .68; }
  &__connections > path { stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  &__packets { fill: currentColor; }
  &__caption { min-width: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__caption h3 { margin: 0 0 5px; color: rgb(var(--v-theme-on-surface)); font-size: 14px; font-weight: 500; line-height: 21px; }
  &__caption p { margin: 0; }
  &__summary { margin: 8px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }

  &__stage--compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: minmax(82px, auto) auto minmax(82px, auto);
    gap: 48px 24px;
    padding: 24px 20px 32px;

    .b-dropshipping-workflow__node[data-node="a"] { grid-column: 1; grid-row: 1; }
    .b-dropshipping-workflow__node[data-node="b"] { grid-column: 2; grid-row: 1; }
    .b-dropshipping-workflow__node[data-node="store"] { grid-column: 1 / 3; grid-row: 2; justify-self: center; width: min(190px, 100%); min-height: 94px; }
    .b-dropshipping-workflow__node[data-node="customer"] { grid-column: 1; grid-row: 3; }
    .b-dropshipping-workflow__node[data-node="wallet"] { grid-column: 2; grid-row: 3; }
  }
}

@container (max-width: 920px) {
  .b-dropshipping-workflow__story { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .b-dropshipping-workflow__caption { padding: 0 4px 8px; }
}
@container (max-width: 620px) {
  .b-dropshipping-workflow__steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .b-dropshipping-workflow__step.sd-modern-button { min-height: 54px; padding: 8px 6px; }
  .b-dropshipping-workflow__header { align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .b-dropshipping-workflow__packets { display: none; }
}
</style>

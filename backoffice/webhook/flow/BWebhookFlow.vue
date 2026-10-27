<template>
  <div
    ref="root"
    class="b-webhook-flow text-start"
    role="group"
    :aria-label="
      $t(`${prefix}.flow.description`, {
        event: $t(`${prefix}.events.${eventCode}.title`),
      })
    "
  >
    <div ref="eventNode" class="b-webhook-flow__node">
      <v-icon size="20" aria-hidden="true">{{
        WebhookTypes[eventCode]?.icon || "webhook"
      }}</v-icon>
      <div>
        <small>{{ $t(`${prefix}.flow.triggers`) }}</small>
        <strong>{{ $t(`${prefix}.events.${eventCode}.title`) }}</strong>
      </div>
    </div>
    <div
      ref="requestNode"
      class="b-webhook-flow__node b-webhook-flow__node--request"
    >
      <v-icon size="20" aria-hidden="true">sync_alt</v-icon>
      <div>
        <small>{{ $t(`${prefix}.flow.request`) }}</small>
        <strong>POST</strong>
      </div>
    </div>
    <div ref="endpointNode" class="b-webhook-flow__node">
      <v-icon size="20" aria-hidden="true">dns</v-icon>
      <div>
        <small>{{ $t(`${prefix}.flow.endpoint`) }}</small>
        <strong :dir="url ? 'ltr' : undefined">{{
          url || $t(`${prefix}.flow.empty_url`)
        }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { useLocale, useTheme } from "vuetify";
import WebhookTypes from "@selldone/core-js/enums/webhook/WebhookTypes";
import type LeaderLine from "vue3-leaderline";

const props = withDefaults(
  defineProps<{ eventCode: string; url?: string; active?: boolean }>(),
  { url: "", active: true },
);
const prefix = "admin_shop.automation.webhooks";
const { isRtl } = useLocale();
const theme = useTheme();
const id = useId();
const root = ref<HTMLElement>();
const eventNode = ref<HTMLElement>();
const requestNode = ref<HTMLElement>();
const endpointNode = ref<HTMLElement>();
const connectors: { line: LeaderLine; svg: SVGElement }[] = [];
let mounted = false;
let frame = 0;
let observer: ResizeObserver | undefined;
let overlayContent: HTMLElement | null = null;

function hideLines() {
  for (const { svg } of connectors) svg.style.visibility = "hidden";
}

function positionLines() {
  frame = 0;
  const element = root.value;
  const overlay = element?.closest<HTMLElement>(".v-overlay");
  if (
    !element ||
    !props.active ||
    !element.getClientRects().length ||
    (overlay && !overlay.classList.contains("v-overlay--active"))
  ) {
    hideLines();
    return;
  }
  const bounds = element.getBoundingClientRect();
  const scrollBounds =
    element.closest(".v-card-text")?.getBoundingClientRect() || bounds;
  const top = Math.max(bounds.top, scrollBounds.top, 0);
  const right = Math.min(
    bounds.right,
    scrollBounds.right,
    document.documentElement.clientWidth,
  );
  const bottom = Math.min(
    bounds.bottom,
    scrollBounds.bottom,
    window.innerHeight,
  );
  const left = Math.max(bounds.left, scrollBounds.left, 0);
  const stacked = window.matchMedia("(max-width: 600px)").matches;
  const color = getComputedStyle(element).color;
  const layer = overlay
    ? Number.parseInt(getComputedStyle(overlay).zIndex, 10) || 0
    : 0;

  for (const { line, svg } of connectors) {
    line.setOptions({
      color,
      startSocket: stacked ? "bottom" : isRtl.value ? "left" : "right",
      endSocket: stacked ? "top" : isRtl.value ? "right" : "left",
      startSocketGravity: stacked ? 26 : 42,
      endSocketGravity: stacked ? 26 : 42,
    });
    line.position();
    // LeaderLine owns body-level SVGs; clip them to this flow and its dialog scroll area.
    Object.assign(svg.style, {
      position: "fixed",
      transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
      zIndex: String(layer + 1),
      visibility: right > left && bottom > top ? "visible" : "hidden",
    });
    const box = svg.getBoundingClientRect();
    svg.style.clipPath = `inset(${Math.max(0, top - box.top)}px ${Math.max(0, box.right - right)}px ${Math.max(0, box.bottom - bottom)}px ${Math.max(0, left - box.left)}px)`;
  }
}

function schedulePosition() {
  if (mounted && !frame) frame = requestAnimationFrame(positionLines);
}

defineExpose({ reposition: schedulePosition });

onMounted(async () => {
  mounted = true;
  observer = new ResizeObserver(schedulePosition);
  for (const element of [root.value, root.value?.parentElement]) {
    if (element) observer.observe(element);
  }
  overlayContent =
    root.value?.closest<HTMLElement>(".v-overlay__content") || null;
  overlayContent?.addEventListener("transitionend", schedulePosition);
  document.addEventListener("scroll", schedulePosition, {
    capture: true,
    passive: true,
  });
  window.addEventListener("resize", schedulePosition, { passive: true });

  try {
    const { default: Line } = await import("vue3-leaderline");
    await nextTick();
    if (!mounted) return;
    const pairs = [
      [eventNode.value, requestNode.value],
      [requestNode.value, endpointNode.value],
    ];
    for (const [index, [start, end]] of pairs.entries()) {
      if (!start || !end) continue;
      const lineId = `${id}-webhook-flow-${index}`;
      const line = new Line(start, end, {
        lineId,
        path: "fluid",
        size: 1.8,
        startPlug: "behind",
        endPlug: "arrow1",
        color: getComputedStyle(root.value!).color,
      });
      const svg = document.getElementById(lineId) as SVGElement | null;
      if (!svg) {
        line.remove();
        continue;
      }
      svg.setAttribute("aria-hidden", "true");
      Object.assign(svg.style, {
        pointerEvents: "none",
        opacity: "0.45",
        visibility: "hidden",
      });
      connectors.push({ line, svg });
    }
    schedulePosition();
  } catch (error) {
    console.warn("Webhook flow connectors could not be drawn.", error);
  }
});

watch(
  () => props.active,
  async (active) => {
    if (!active) hideLines();
    else {
      await nextTick();
      schedulePosition();
    }
  },
  { flush: "sync" },
);
watch(
  [() => props.eventCode, () => props.url, isRtl, theme.current],
  async () => {
    await nextTick();
    schedulePosition();
  },
);

onBeforeUnmount(() => {
  mounted = false;
  if (frame) cancelAnimationFrame(frame);
  observer?.disconnect();
  overlayContent?.removeEventListener("transitionend", schedulePosition);
  document.removeEventListener("scroll", schedulePosition, true);
  window.removeEventListener("resize", schedulePosition);
  for (const { line } of connectors) line.remove();
});
</script>

<style lang="scss" scoped>
.b-webhook-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px;
  align-items: start;
  min-width: 0;
  padding-block: 4px 12px;
  color: rgb(var(--v-theme-on-surface));

  &__node {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 88px;
    padding: 14px 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));

    > .v-icon {
      flex: 0 0 20px;
      color: var(--sd-modern-muted);
    }
    > div {
      min-width: 0;
    }
    small,
    strong {
      display: block;
      font-family: inherit;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }
    small {
      margin-block-end: 4px;
      color: var(--sd-modern-muted);
      font-size: 11px;
      font-weight: 400;
      line-height: 1.6;
    }
    strong {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.6;
      text-align: start;
    }
    &--request {
      margin-block-start: 28px;
    }
  }
}

@media (max-width: 600px) {
  .b-webhook-flow {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
    padding-block-end: 4px;

    &__node {
      width: calc(100% - 24px);

      &--request {
        margin-block-start: 0;
        margin-inline-start: 24px;
      }
    }
  }
}
</style>

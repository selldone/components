<template>
  <figure
    ref="root"
    class="b-email-send-flow text-start"
    :style="{ '--email-flow-columns': steps.length }"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`" class="sd-modern-eyebrow">
      {{ $t("email_builder.workspace.flow_title") }}
    </figcaption>
    <ol class="b-email-send-flow__steps">
      <li v-for="step in steps" :key="step.id" class="b-email-send-flow__step">
        <button
          type="button"
          class="b-email-send-flow__node"
          :data-flow-node="step.id"
          :aria-label="$t(`email_builder.workspace.${step.title}`)"
        >
          <u-pod-node
            :icon="step.icon"
            :image="step.image"
            :color="
              step.operation
                ? 'rgb(var(--v-theme-primary))'
                : 'var(--sd-modern-border)'
            "
            icon-color="rgb(var(--v-theme-on-surface))"
          />
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            :open-on-click="true"
            :persistent="false"
            content-class="sd-modern-tooltip text-start"
          >
            {{ $t(`email_builder.workspace.${step.help}`) }}
          </v-tooltip>
        </button>
        <div class="b-email-send-flow__copy">
          <h4>{{ $t(`email_builder.workspace.${step.title}`) }}</h4>
          <p>{{ $t(`email_builder.workspace.${step.body}`) }}</p>
          <span
            v-if="step.status"
            class="sd-modern-status sd-modern-status--plain"
          >
            <span
              class="sd-modern-status__dot"
              :class="`sd-modern-status__dot--${step.tone}`"
              aria-hidden="true"
            />
            {{ $t(`email_builder.workspace.${step.status}`) }}
          </span>
        </div>
      </li>
    </ol>
  </figure>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
} from "vue";
import { useLocale, useTheme } from "vuetify";
import type LeaderLine from "vue3-leaderline";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";

type EmailState = { approve?: string; in_que?: boolean; sent?: boolean };
type Step = {
  id: string;
  icon?: string;
  image?: string;
  title: string;
  body: string;
  help: string;
  operation?: boolean;
  status?: string;
  tone?: string;
};
const props = withDefaults(
  defineProps<{
    email?: EmailState | null;
    scheduleAt?: string | null;
    scheduleEnabled?: boolean;
    provider?: { icon?: string } | null;
    active?: boolean;
  }>(),
  {
    email: null,
    scheduleAt: null,
    scheduleEnabled: false,
    provider: null,
    active: true,
  },
);
const id = `email-send-flow-${useId()}`;
const root = ref<HTMLElement>();
const { isRtl } = useLocale();
const theme = useTheme();
const steps = computed<Step[]>(() => {
  const reviewStatus =
    props.email?.approve === "ACCEPT"
      ? { status: "accepted", tone: "success" }
      : props.email?.approve === "REJECT"
        ? { status: "rejected", tone: "error" }
        : props.email?.in_que && props.email?.approve === "PENDING"
          ? { status: "pending", tone: "warning" }
          : {};
  const result: Step[] = [
    {
      id: "draft",
      icon: "mail_outline",
      title: "flow_draft",
      body: "flow_draft_body",
      help: "flow_draft_help",
      operation: true,
    },
    {
      id: "review",
      icon: "fact_check",
      title: "flow_review",
      body: "flow_review_body",
      help: "flow_review_help",
      operation: true,
      ...reviewStatus,
    },
  ];
  if (props.scheduleEnabled && props.scheduleAt) {
    result.push({
      id: "schedule",
      icon: "schedule",
      title: "flow_schedule",
      body: "flow_schedule_body",
      help: "flow_schedule_help",
    });
  }
  result.push(
    {
      id: "provider",
      icon: props.provider?.icon ? undefined : "outgoing_mail",
      image: props.provider?.icon,
      title: "flow_provider",
      body: "flow_provider_body",
      help: "flow_provider_help",
      operation: true,
    },
    {
      id: "recipients",
      icon: "groups",
      title: "flow_audience",
      body: "flow_audience_body",
      help: "flow_audience_help",
      ...(props.email?.sent ? { status: "sent", tone: "success" } : {}),
    },
  );
  return result;
});

const connectors: {
  from: HTMLElement;
  to: HTMLElement;
  line: LeaderLine;
  svg: SVGElement;
}[] = [];
let Line: typeof LeaderLine | undefined;
let mounted = false;
let frame = 0;
let sequence = 0;
let observer: ResizeObserver | undefined;
let overlayContent: HTMLElement | null = null;

function hideLines() {
  for (const { svg } of connectors) svg.style.visibility = "hidden";
}

function removeLines() {
  for (const { line } of connectors) line.remove();
  connectors.length = 0;
}

function positionLines() {
  frame = 0;
  const element = root.value;
  const overlay = element?.closest<HTMLElement>(".v-overlay");
  if (
    !Line ||
    !element ||
    !props.active ||
    !element.getClientRects().length ||
    (overlay && !overlay.classList.contains("v-overlay--active"))
  ) {
    hideLines();
    return;
  }
  const nodes = Array.from(
    element.querySelectorAll<HTMLElement>("[data-flow-node]"),
  );
  const pairs = nodes
    .slice(0, -1)
    .map((from, index) => ({ from, to: nodes[index + 1] }));
  if (
    pairs.length !== connectors.length ||
    pairs.some(
      (pair, index) =>
        pair.from !== connectors[index]?.from ||
        pair.to !== connectors[index]?.to,
    )
  ) {
    removeLines();
    observer?.disconnect();
    observer?.observe(element);
    for (const { from, to } of pairs) {
      const lineId = `${id}-path-${++sequence}`;
      const line = new Line(from, to, {
        lineId,
        path: "fluid",
        size: 1.8,
        startPlug: "behind",
        endPlug: "arrow1",
        endPlugSize: 1.15,
        color: getComputedStyle(element).color,
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
      connectors.push({ from, to, line, svg });
      observer?.observe(from);
      observer?.observe(to);
    }
  }

  const bounds = element.getBoundingClientRect();
  let top = Math.max(bounds.top, 0),
    bottom = Math.min(bounds.bottom, window.innerHeight);
  let left = Math.max(bounds.left, 0),
    right = Math.min(bounds.right, document.documentElement.clientWidth);
  // LeaderLine owns body-level SVGs; keep paths inside this flow and its scrolling ancestors.
  for (
    let parent = element.parentElement;
    parent && parent !== document.scrollingElement;
    parent = parent.parentElement
  ) {
    const style = getComputedStyle(parent),
      box = parent.getBoundingClientRect();
    if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
      left = Math.max(left, box.left);
      right = Math.min(right, box.right);
    }
    if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
      top = Math.max(top, box.top);
      bottom = Math.min(bottom, box.bottom);
    }
  }
  const stacked = window.matchMedia("(max-width: 600px)").matches;
  const layer = overlay
    ? Number.parseInt(getComputedStyle(overlay).zIndex, 10) || 0
    : 0;
  for (const { line, svg } of connectors) {
    line.setOptions({
      color: getComputedStyle(element).color,
      startSocket: stacked ? "bottom" : isRtl.value ? "left" : "right",
      endSocket: stacked ? "top" : isRtl.value ? "right" : "left",
      startSocketGravity: stacked ? 24 : 32,
      endSocketGravity: stacked ? 24 : 32,
    });
    line.position();
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

onMounted(async () => {
  mounted = true;
  observer = new ResizeObserver(schedulePosition);
  if (root.value) observer.observe(root.value);
  overlayContent =
    root.value?.closest<HTMLElement>(".v-overlay__content") || null;
  overlayContent?.addEventListener("transitionend", schedulePosition);
  document.addEventListener("scroll", schedulePosition, {
    capture: true,
    passive: true,
  });
  window.addEventListener("resize", schedulePosition, { passive: true });
  try {
    const module = await import("vue3-leaderline");
    await nextTick();
    if (!mounted) return;
    Line = module.default;
    schedulePosition();
  } catch (error) {
    console.warn("Email flow connectors could not be drawn.", error);
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
watch([steps, isRtl, theme.current], async () => {
  await nextTick();
  schedulePosition();
});

onBeforeUnmount(() => {
  mounted = false;
  if (frame) cancelAnimationFrame(frame);
  observer?.disconnect();
  overlayContent?.removeEventListener("transitionend", schedulePosition);
  document.removeEventListener("scroll", schedulePosition, true);
  window.removeEventListener("resize", schedulePosition);
  removeLines();
});
</script>

<style scoped lang="scss">
.b-email-send-flow {
  margin: 24px 0 0;
  min-width: 0;
  color: rgb(var(--v-theme-on-surface));

  &__steps {
    display: grid;
    grid-template-columns: repeat(var(--email-flow-columns), minmax(0, 1fr));
    gap: 18px;
    list-style: none;
    margin: 18px 0 0;
    padding: 0 0 4px;
  }
  &__step {
    min-width: 0;
    &:nth-child(even) {
      padding-block-start: 20px;
    }
  }
  &__node {
    display: block;
    width: 60px;
    height: 60px;
    padding: 0;
    border: 0;
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    color: inherit;
    cursor: help;
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 4px;
    }
    :deep(.pod) {
      --pod-size: 60px;
      --pod-icon-size: 24px;
      --pod-border-radius: 14px;
      --pod-shadow: 0 3px 10px rgba(var(--v-theme-on-surface), 0.07);
      border-width: 1.5px;
      background: rgb(var(--v-theme-surface));
      color: rgb(var(--v-theme-on-surface));
      > small {
        display: none !important;
      }
      > .mb-1 {
        margin-bottom: 0 !important;
      }
    }
    &:hover :deep(.pod) {
      background: color-mix(
        in srgb,
        rgb(var(--v-theme-surface)),
        rgb(var(--v-theme-on-surface)) 3%
      );
    }
  }
  &__copy {
    min-width: 0;
    margin-block-start: 12px;
    h4 {
      margin: 0;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      overflow-wrap: anywhere;
    }
    p {
      margin: 4px 0 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      font-weight: 400;
      line-height: 19px;
      overflow-wrap: anywhere;
    }
    .sd-modern-status {
      margin-block-start: 7px;
      font-size: 11px;
      line-height: 18px;
    }
  }
  @media (max-width: 600px) {
    &__steps {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
    }
    &__step {
      display: grid;
      grid-template-columns: 60px minmax(0, 1fr);
      align-items: center;
      gap: 16px;
      &:nth-child(even) {
        padding-block-start: 0;
        margin-inline-start: 18px;
      }
    }
    &__copy {
      margin-block-start: 0;
    }
  }
}
</style>

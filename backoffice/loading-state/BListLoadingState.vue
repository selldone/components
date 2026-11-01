<template>
  <div
    ref="root"
    class="b-list-loading-state text-start"
    :class="{ 'b-list-loading-state--compact': compact, 'b-list-loading-state--paused': !motionVisible }"
    :data-loading-kind="resolvedKind"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <svg v-if="compact" class="b-list-loading-state__compact-art" viewBox="0 0 48 16" fill="none" aria-hidden="true" focusable="false">
      <path class="b-list-loading-state__wire" d="M2 8h44" />
      <circle class="b-list-loading-state__packet b-list-loading-state__packet--compact" r="2.5" />
    </svg>
    <div v-else class="b-list-loading-state__art sd-modern-illustration" aria-hidden="true">
      <svg class="b-list-loading-state__wires" viewBox="0 0 320 160" fill="none" focusable="false">
        <path class="b-list-loading-state__wire" d="M82 80h24c28 0 23-42 58-42h18" />
        <path class="b-list-loading-state__wire" d="M82 80h100" />
        <path class="b-list-loading-state__wire" d="M82 80h24c28 0 23 42 58 42h18" />
        <circle class="b-list-loading-state__packet b-list-loading-state__packet--top" r="3" />
        <circle class="b-list-loading-state__packet b-list-loading-state__packet--bottom" r="3" />
      </svg>
      <div class="b-list-loading-state__server">
        <svg viewBox="0 0 24 24" fill="none" focusable="false"><rect x="3" y="3" width="18" height="7" rx="2" /><rect x="3" y="14" width="18" height="7" rx="2" /><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6" /></svg>
        <span class="b-list-loading-state__server-lights"><i /><i /></span>
      </div>
      <div v-for="row in 3" :key="row" class="b-list-loading-state__row" :class="`b-list-loading-state__row--${row}`">
        <svg class="b-list-loading-state__symbol" viewBox="0 0 24 24" fill="none" focusable="false">
          <template v-if="symbol === 'catalog'"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" /></template>
          <template v-else-if="symbol === 'order'"><path d="M6 6h12l2 15H4L6 6Zm3 1V6a3 3 0 0 1 6 0v1" /></template>
          <template v-else-if="symbol === 'people'"><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3" /></template>
          <template v-else-if="symbol === 'ticket'"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Zm12-2v3m0 3v2m0 3v3" /></template>
          <template v-else-if="symbol === 'mail'"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></template>
          <template v-else-if="symbol === 'delivery'"><path d="M2 5h13v13H2V5Zm13 5h4l3 4v4h-7M5 18a2 2 0 1 0 4 0m8 0a2 2 0 1 0 4 0" /></template>
          <template v-else-if="symbol === 'location'"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></template>
          <template v-else-if="symbol === 'connection'"><circle cx="6" cy="12" r="3" /><rect x="16" y="3" width="6" height="6" rx="1.5" /><rect x="16" y="15" width="6" height="6" rx="1.5" /><path d="M9 12h3a2 2 0 0 0 2-2V8a2 2 0 0 1 2-2m-2 4v6a2 2 0 0 0 2 2" /></template>
          <template v-else-if="symbol === 'payment'"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h3" /></template>
          <template v-else><path d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6" /></template>
        </svg>
        <span class="b-list-loading-state__row-lines"><b /><i /></span>
      </div>
    </div>
    <div class="b-list-loading-state__copy">
      <component :is="compact ? 'span' : 'h3'" v-if="displayTitle" class="b-list-loading-state__title">{{ displayTitle }}</component>
      <p v-if="displayDescription" class="b-list-loading-state__description">{{ displayDescription }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";

const symbolByKind = {
  product: "catalog", category: "catalog", order: "order", customer: "people",
  content: "records", discount: "ticket", campaign: "mail", affiliate: "people",
  shipping: "delivery", location: "location", domain: "connection", payment: "payment",
  automation: "connection", team: "people", app: "connection", log: "records", records: "records",
};

/** Mount only for an actual pending read; the list owner retains data, permissions and recovery. */
export default defineComponent({
  name: "BListLoadingState",
  props: {
    kind: { type: String, default: "records" },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    compact: { type: Boolean, default: false },
  },
  setup() {
    const root = ref<HTMLElement | null>(null);
    const inViewport = ref(false);
    const documentVisible = ref(false);
    let observer: IntersectionObserver | undefined;
    const updateVisibility = () => { documentVisible.value = !document.hidden; };

    onMounted(() => {
      if (typeof document === "undefined") return;
      updateVisibility();
      document.addEventListener("visibilitychange", updateVisibility);
      if (typeof IntersectionObserver === "undefined") {
        inViewport.value = true;
        return;
      }
      observer = new IntersectionObserver(entries => {
        inViewport.value = entries.some(entry => entry.isIntersecting);
      });
      if (root.value) observer.observe(root.value);
    });
    onBeforeUnmount(() => {
      observer?.disconnect();
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", updateVisibility);
    });
    return { root, motionVisible: computed(() => inViewport.value && documentVisible.value) };
  },
  computed: {
    resolvedKind(): keyof typeof symbolByKind {
      return Object.prototype.hasOwnProperty.call(symbolByKind, this.kind)
        ? this.kind as keyof typeof symbolByKind : "records";
    },
    symbol() { return symbolByKind[this.resolvedKind]; },
    displayTitle() { return this.title ?? this.$t(`dashboard_loading_state.${this.compact ? "refreshing" : this.resolvedKind}`); },
    displayDescription() { return this.compact ? "" : this.description ?? this.$t("dashboard_loading_state.description"); },
  },
});
</script>

<style lang="scss" scoped>
.b-list-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 300px;
  padding: 22px 8px 28px;
  color: var(--sd-modern-text, rgb(var(--v-theme-on-surface)));
  font-family: inherit;

  &__art { position: relative; direction: ltr; width: 320px; max-width: 100%; aspect-ratio: 2; flex: 0 0 auto; margin-block-end: 12px; pointer-events: none; }
  &__wires { position: absolute; inset: 0; width: 100%; height: 100%; }
  &__wire { stroke: rgba(var(--v-theme-on-surface), .12); stroke-width: 1.6; stroke-linecap: round; }
  &__packet { fill: rgba(var(--sd-modern-illustration-accent-rgb, 147, 66, 193), .8); offset-distance: 56%; opacity: .6; animation: list-loading-transit 2.9s linear infinite; }
  &__packet--top { offset-path: path("M82 80H106C134 80 129 38 164 38H182"); }
  &__packet--bottom { offset-path: path("M82 80H106C134 80 129 122 164 122H182"); animation-delay: -1.4s; }
  &__server, &__row { position: absolute; box-sizing: border-box; display: flex; align-items: center; background: rgb(var(--v-theme-surface)); border: 1px solid rgba(var(--v-theme-on-surface), .12); color: rgba(var(--v-theme-on-surface), .32); }
  &__server { inset-inline-start: 7.5%; top: 29%; width: 18.75%; height: 42%; flex-direction: column; justify-content: center; gap: 7px; border-radius: 12px; }
  &__server > svg { width: 26px; height: 26px; }
  &__server > svg, &__symbol { stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  &__server-lights { display: flex; gap: 4px; }
  &__server-lights i { width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: .65; }
  &__row { inset-inline-start: 56.875%; width: 35.625%; height: 20%; gap: 8px; padding-inline: 9px; border-radius: 8px; }
  &__row--1 { top: 13.75%; }
  &__row--2 { top: 40%; }
  &__row--3 { top: 66.25%; }
  &__symbol { width: 16px; height: 16px; flex: 0 0 16px; }
  &__row-lines { flex: 1; min-width: 0; }
  &__row-lines b, &__row-lines i { display: block; height: 3px; border-radius: 2px; background: rgba(var(--v-theme-on-surface), .08); }
  &__row-lines b { width: 92%; margin-block-end: 5px; }
  &__row-lines i { width: 62%; }
  &__copy { max-width: 100%; text-align: center; }
  &__title { margin: 0; font-family: inherit; font-size: 17px; font-weight: 500; line-height: 25px; letter-spacing: normal; overflow-wrap: anywhere; }
  &__description { max-width: 420px; margin: 7px 0 0; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); font-family: inherit; font-size: 13px; font-weight: 400; line-height: 22px; overflow-wrap: anywhere; }
  &__compact-art { width: 44px; height: 16px; flex: 0 0 44px; pointer-events: none; }
  &__packet--compact { offset-path: path("M2 8H46"); }
  &--compact { flex-direction: row; justify-content: flex-start; gap: 7px; width: auto; min-height: 0; padding: 0; }
  &--compact &__title { font-size: 12px; font-weight: 400; line-height: 20px; }
  &--compact &__copy { min-width: 0; text-align: start; }
  &--paused &__packet { animation-play-state: paused; }
  &:dir(rtl) &__art, &:dir(rtl) &__compact-art { transform: scaleX(-1); }

  @media (prefers-reduced-motion: reduce) {
    &__packet { animation: none; offset-distance: 56%; opacity: .6; }
  }
}
@keyframes list-loading-transit {
  0% { offset-distance: 0%; opacity: 0; }
  12%, 86% { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
</style>

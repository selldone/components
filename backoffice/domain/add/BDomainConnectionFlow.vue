<template>
  <div ref="canvas" class="b-domain-connection-flow text-start">
    <svg
      class="b-domain-connection-flow__paths"
      :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
      aria-hidden="true"
      focusable="false"
    >
      <g v-for="edge in edges" :key="edge.key">
        <path :d="edge.path" />
        <path :d="edge.head" />
      </g>
    </svg>
    <div
      class="b-domain-connection-flow__nodes"
      :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 128px))` }"
    >
      <button
        v-for="(node, index) in nodes"
        :key="node.id"
        type="button"
        :data-node="node.id"
        class="b-domain-connection-flow__node"
        :class="{ 'b-domain-connection-flow__node--optional': node.optional }"
        :style="nodePlacement(index)"
        :aria-label="node.caption ? `${node.title} · ${node.caption}` : node.title"
      >
        <img
          v-if="node.id === 'store'"
          :src="require('@selldone/components-vue/assets/selldone-logo/selldone.svg')"
          alt=""
          width="24"
          height="24"
        />
        <img v-else-if="node.image" :src="node.image" alt="" width="24" height="24" />
        <v-icon v-else size="22" aria-hidden="true">{{ node.icon }}</v-icon>
        <span class="b-domain-connection-flow__title">{{ node.title }}</span>
        <bdi v-if="node.caption" class="b-domain-connection-flow__caption" :dir="node.id === 'domain' ? 'ltr' : undefined">{{ node.caption }}</bdi>
        <v-tooltip
          activator="parent"
          location="top"
          open-on-focus
          open-on-click
          content-class="sd-modern-tooltip text-start"
        >{{ node.help }}</v-tooltip>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BDomainConnectionFlow",
  props: {
    domain: { type: String, default: "" },
    image: { type: String, default: null },
    secure: { type: Boolean, default: false },
  },
  data: () => ({ availableWidth: 0, canvasWidth: 1, canvasHeight: 1, edges: [], resizeObserver: null }),
  computed: {
    nodes() {
      const t = (key) => this.$t(`domains_modern.connection.${key}`);
      return [
        { id: "domain", title: t("domain"), caption: this.domain, image: this.image, icon: "language", help: t("flowDomainHelp") },
        ...(this.secure ? [{ id: "optional", title: "CDN", caption: this.$t("global.commons.optional"), icon: "dns", optional: true, help: t("flowOptionalHelp") }] : []),
        { id: "cdn", title: this.secure ? t("secure") : "CDN", caption: "HTTPS", icon: this.secure ? "cloud" : "dns", help: t(this.secure ? "flowSecureHelp" : "flowDirectHelp") },
        { id: "store", title: "Selldone", help: t("flowStoreHelp") },
      ];
    },
    columns() {
      if (this.availableWidth >= this.nodes.length * 128 + (this.nodes.length - 1) * 44) return this.nodes.length;
      return this.availableWidth >= 300 ? 2 : 1;
    },
  },
  watch: {
    nodes: { deep: true, handler() { this.$nextTick(this.measure); } },
    "$vuetify.locale.isRtl"() { this.$nextTick(this.measure); },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.measure);
    this.resizeObserver.observe(this.$refs.canvas);
    this.measure();
  },
  beforeUnmount() { this.resizeObserver?.disconnect(); },
  methods: {
    nodePlacement(index) {
      const row = Math.floor(index / this.columns);
      return { gridRow: row + 1, gridColumn: (row % 2 ? this.columns - 1 - index % this.columns : index % this.columns) + 1 };
    },
    measure() {
      const canvas = this.$refs.canvas;
      if (!canvas?.clientWidth) return;
      this.availableWidth = Math.max(0, canvas.clientWidth - 24);
      this.$nextTick(this.drawEdges);
    },
    drawEdges() {
      const canvas = this.$refs.canvas;
      if (!canvas?.clientWidth) return;
      const origin = canvas.getBoundingClientRect();
      this.canvasWidth = canvas.clientWidth;
      this.canvasHeight = Math.max(1, canvas.clientHeight);
      const points = {};
      canvas.querySelectorAll("[data-node]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        points[element.dataset.node] = { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height };
      });
      this.edges = this.nodes.slice(0, -1).map((node, index) => {
        const a = points[node.id], b = points[this.nodes[index + 1].id];
        if (!a || !b) return null;
        if (Math.abs(a.y - b.y) < 5) {
          const direction = b.x > a.x ? 1 : -1;
          const sx = direction > 0 ? a.x + a.w : a.x, sy = a.y + a.h / 2;
          const ex = direction > 0 ? b.x - 5 : b.x + b.w + 5, ey = b.y + b.h / 2;
          return {
            key: `${node.id}-${this.nodes[index + 1].id}`,
            path: `M${sx} ${sy} C${sx + direction * 14} ${sy - 13},${ex - direction * 14} ${ey - 13},${ex - direction * 5} ${ey}`,
            head: `M${ex - direction * 5} ${ey - 3.5} L${ex} ${ey} L${ex - direction * 5} ${ey + 3.5}`,
          };
        }
        const sx = a.x + a.w / 2, sy = a.y + a.h, ex = b.x + b.w / 2, ey = b.y - 5;
        return {
          key: `${node.id}-${this.nodes[index + 1].id}`,
          path: `M${sx} ${sy} C${sx} ${sy + 16},${ex} ${ey - 20},${ex} ${ey - 5}`,
          head: `M${ex - 3.5} ${ey - 5} L${ex} ${ey} L${ex + 3.5} ${ey - 5}`,
        };
      }).filter(Boolean);
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-connection-flow {
  contain: inline-size;
  position: relative;
  min-width: 0;
  padding: 12px;
  margin-block: 18px 22px;

  &__nodes { position: relative; z-index: 1; display: grid; gap: 44px; align-items: stretch; justify-content: center; }
  &__node {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    min-height: 104px;
    min-width: 0;
    padding: 14px 10px;
    border: 1.5px solid rgb(var(--v-theme-primary));
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    text-align: center;
    cursor: help;
  }
  &__node--optional { border-style: dashed; }
  &__node img { object-fit: contain; border-radius: 5px; }
  &__node > .v-icon { color: var(--sd-modern-muted); }
  &__node:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; }
  &__title { font-size: 13px; font-weight: 500; line-height: 20px; overflow-wrap: anywhere; }
  &__caption { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; max-width: 100%; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; overflow-wrap: anywhere; }
  &__paths { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
  &__paths path { fill: none; stroke: rgba(var(--v-theme-on-surface), .38); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
  @media (hover: hover) { &__node:hover { background: color-mix(in srgb, rgb(var(--v-theme-surface)) 97%, rgb(var(--v-theme-on-surface))); } }
}
</style>

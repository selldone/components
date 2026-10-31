<template>
  <div ref="canvas" class="b-domain-workspace-flow text-start">
    <svg
      class="b-domain-workspace-flow__paths"
      :viewBox="`0 0 ${width} ${height}`"
      aria-hidden="true"
      focusable="false"
    >
      <path v-for="edge in edges" :key="edge.key" :d="edge.path" />
    </svg>
    <div
      class="b-domain-workspace-flow__nodes"
      :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 190px))` }"
    >
      <button
        v-for="(node, index) in nodes"
        :key="node.id"
        type="button"
        :data-node="node.id"
        :style="placement(index)"
        class="b-domain-workspace-flow__node"
        @click="$emit('navigate', node.section, node.setting)"
      >
        <img
          v-if="node.id === 'store' && !external"
          :src="
            require('@selldone/components-vue/assets/selldone-logo/selldone.svg')
          "
          width="24"
          height="24"
          alt=""
        />
        <v-icon v-else size="22" aria-hidden="true">{{ node.icon }}</v-icon>
        <bdi v-if="node.id === 'domain'" dir="ltr">{{ node.title }}</bdi
        ><strong v-else>{{ node.title }}</strong>
        <span>{{ node.caption }}</span>
        <v-tooltip
          activator="parent"
          location="top"
          open-on-focus
          content-class="sd-modern-tooltip text-start"
          >{{ node.help }}</v-tooltip
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import DomainMixin from "@selldone/components-vue/mixin/domain/DomainMixin.ts";

export default {
  name: "BDomainWorkspaceFlow",
  mixins: [DomainMixin],
  props: {
    shop: { type: Object, required: true },
    item: { type: Object, required: true },
  },
  emits: ["navigate"],
  data: () => ({
    availableWidth: 0,
    width: 1,
    height: 1,
    edges: [],
    observer: null,
  }),
  computed: {
    external() {
      return !!this.item.domain?.externally_hosted;
    },
    nodes() {
      const t = (key) => this.$t(`domains_modern.${key}`);
      return [
        {
          id: "domain",
          title:
            this.item.domain?.domain ||
            this.item.url.replace(/^https?:\/\//, ""),
          caption: t(this.item.enable ? "list.enabled" : "list.disabled"),
          icon: "language",
          section: "settings",
          setting: "access",
          help: t("map.accessTip"),
        },
        {
          id: "connection",
          title: t(
            this.external
              ? "connection.verification"
              : this.item.official
                ? "map.hosted"
                : this.item.domain?.ssl_proxy
                  ? "connection.secure"
                  : "connection.direct",
          ),
          caption: t(
            this.external
              ? "map.external"
              : this.item.official
                ? "map.selldone"
                : this.item.domain?.ssl_proxy
                  ? "connection.sslSecure"
                  : "connection.sslOwn",
          ),
          icon: this.external ? "fact_check" : "cloud",
          section: "connection",
          help: t(this.external ? "map.verifyHelp" : "map.connectionHelp"),
        },
        {
          id: "store",
          title: t(this.external ? "connection.external" : "connection.hosted"),
          caption: t(
            this.external
              ? "connection.sslExternalHint"
              : "connection.illustration.hostedBySelldone",
          ),
          icon: this.external ? "open_in_new" : "storefront",
          section: "storefront",
          help: t(
            this.external ? "map.externalHomeTip" : "connection.hostingHelp",
          ),
        },
        {
          id: "home",
          title: t("list.home"),
          caption: this.external
            ? t("map.externalHome")
            : this.GetDomainHomeName(
                this.item.primary || !this.item.domain?.home
                  ? this.shop.home
                  : this.item.domain.home,
              ),
          icon: this.external ? "web" : "home",
          section: "storefront",
          help: t(
            this.external
              ? "map.externalHomeTip"
              : this.item.official
                ? "map.inheritedTip"
                : "map.homeTip",
          ),
        },
      ];
    },
    columns() {
      return this.availableWidth >= 740
        ? 4
        : this.availableWidth >= 310
          ? 2
          : 1;
    },
  },
  watch: {
    nodes: {
      deep: true,
      handler() {
        this.$nextTick(this.measure);
      },
    },
    "$vuetify.locale.isRtl"() {
      this.$nextTick(this.measure);
    },
  },
  mounted() {
    this.observer = new ResizeObserver(this.measure);
    this.observer.observe(this.$refs.canvas);
    this.measure();
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
  methods: {
    placement(index) {
      const row = Math.floor(index / this.columns);
      return {
        gridRow: row + 1,
        gridColumn:
          (row % 2
            ? this.columns - 1 - (index % this.columns)
            : index % this.columns) + 1,
      };
    },
    measure() {
      if (!this.$refs.canvas?.clientWidth) return;
      this.availableWidth = this.$refs.canvas.clientWidth - 20;
      this.$nextTick(this.draw);
    },
    draw() {
      const canvas = this.$refs.canvas;
      if (!canvas?.clientWidth) return;
      const origin = canvas.getBoundingClientRect(),
        points = {};
      this.width = canvas.clientWidth;
      this.height = canvas.clientHeight;
      canvas.querySelectorAll("[data-node]").forEach((element) => {
        const box = element.getBoundingClientRect();
        points[element.dataset.node] = {
          x: box.left - origin.left,
          y: box.top - origin.top,
          w: box.width,
          h: box.height,
        };
      });
      this.edges = this.nodes
        .slice(0, -1)
        .map((node, index) => {
          const a = points[node.id],
            b = points[this.nodes[index + 1].id];
          if (!a || !b) return null;
          const horizontal = Math.abs(a.y - b.y) < 5,
            direction = b.x > a.x ? 1 : -1;
          const sx = horizontal
            ? direction > 0
              ? a.x + a.w
              : a.x
            : a.x + a.w / 2;
          const sy = horizontal ? a.y + a.h / 2 : a.y + a.h;
          const ex = horizontal
            ? direction > 0
              ? b.x
              : b.x + b.w
            : b.x + b.w / 2;
          const ey = horizontal ? b.y + b.h / 2 : b.y;
          return {
            key: node.id,
            path: horizontal
              ? `M${sx} ${sy} C${sx + direction * 14} ${sy - 14},${ex - direction * 14} ${ey - 14},${ex} ${ey}`
              : `M${sx} ${sy} C${sx} ${sy + 18},${ex} ${ey - 18},${ex} ${ey}`,
          };
        })
        .filter(Boolean);
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-workspace-flow {
  contain: inline-size;
  position: relative;
  min-width: 0;
  margin-block: 25px;
  padding: 8px 10px;
  &__nodes {
    position: relative;
    display: grid;
    justify-content: center;
    gap: 34px;
  }
  &__node {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 112px;
    min-width: 0;
    gap: 6px;
    padding: 12px;
    border: 1.5px solid rgb(var(--v-theme-primary));
    border-radius: 15px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font-family: inherit;
    font-size: 13px;
    line-height: 21px;
    text-align: center;
    cursor: pointer;
  }
  &__node > strong {
    font-size: 13px;
    font-weight: 500;
  }
  &__node > span {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__node > bdi,
  &__node > strong,
  &__node > span {
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  &__node > .v-icon {
    color: var(--sd-modern-muted);
  }
  &__node > img {
    object-fit: contain;
  }
  &__node:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 4px;
  }
  &__paths {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }
  &__paths path {
    fill: none;
    stroke: rgba(var(--v-theme-on-surface), 0.3);
    stroke-width: 1.4;
    stroke-linecap: round;
  }
  @media (hover: hover) {
    &__node:hover {
      background: color-mix(
        in srgb,
        rgb(var(--v-theme-surface)) 97%,
        rgb(var(--v-theme-on-surface))
      );
    }
  }
  @media (max-width: 500px) {
    &__nodes {
      gap: 24px;
    }
    &__node {
      padding: 12px 8px;
    }
  }
}
</style>

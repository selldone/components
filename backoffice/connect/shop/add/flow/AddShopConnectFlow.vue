<template>
  <div
    class="b-shop-connect-flow text-start"
    :class="{ 'b-shop-connect-flow--vertical': vertical }"
    role="group"
    :aria-label="$t(`shop_connect.settings_flow.${kind}_title`)"
    :aria-describedby="`${diagramId}-description`"
  >
    <div class="b-shop-connect-flow__toolbar">
      <v-menu
        v-if="kind === 'orders'"
        location="bottom start"
        content-class="sd-modern-menu"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="sd-modern-button sd-modern-button--compact sd-modern-button--inline b-shop-connect-flow__payment"
            variant="text"
            :aria-label="`${$t('shop_connect.settings_flow.example_payment')}: ${selectedPaymentTitle}`"
          >
            <span class="b-shop-connect-flow__payment-label"
              >{{ $t("shop_connect.settings_flow.example_short") }}:</span
            >
            <span class="b-shop-connect-flow__payment-value">{{
              selectedPaymentTitle
            }}</span>
            <v-icon size="16" aria-hidden="true">expand_more</v-icon>
          </v-btn>
        </template>
        <v-list
          class="sd-modern-menu__list b-shop-connect-flow__payment-menu text-start"
          density="compact"
          role="menu"
          :aria-label="$t('shop_connect.settings_flow.example_payment')"
        >
          <v-list-item
            v-for="payment in paymentExamples"
            :key="payment.value"
            :title="payment.title"
            :active="samplePayment === payment.value"
            role="menuitemradio"
            :aria-checked="samplePayment === payment.value"
            @click="samplePayment = payment.value"
          >
            <template #append>
              <v-icon
                size="14"
                aria-hidden="true"
                :style="{ opacity: samplePayment === payment.value ? 1 : 0 }"
                >check</v-icon
              >
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        class="sd-modern-button sd-modern-button--compact sd-modern-button--inline b-shop-connect-flow__preview"
        variant="text"
        :disabled="paused"
        @click="previewFlow"
      >
        <v-icon start size="16" aria-hidden="true">play_arrow</v-icon>
        {{ $t("shop_connect.settings_flow.preview") }}
      </v-btn>
    </div>
    <div ref="canvas" class="b-shop-connect-flow__canvas" dir="ltr">
      <svg
        class="b-shop-connect-flow__paths"
        :viewBox="`0 0 ${bounds.width} ${bounds.height}`"
        aria-hidden="true"
      >
        <defs>
          <marker
            v-for="state in ['active', 'idle']"
            :id="`${diagramId}-${state}`"
            :key="state"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path
              class="b-shop-connect-flow__arrow"
              :class="{
                'b-shop-connect-flow__arrow--active': state === 'active',
              }"
              d="M1 1 L7 4 L1 7"
            />
          </marker>
        </defs>
        <g v-for="edge in edges" :key="edge.key">
          <path
            class="b-shop-connect-flow__curve"
            :class="{ 'b-shop-connect-flow__curve--active': edge.active }"
            :d="edge.path"
            :marker-end="`url(#${diagramId}-${edge.active ? 'active' : 'idle'})`"
          />
          <circle
            v-if="previewing && edge.active"
            :key="`${edge.key}-${previewRun}`"
            class="b-shop-connect-flow__packet"
            r="3"
          >
            <animateMotion
              :path="edge.path"
              dur="1.3s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>
        </g>
      </svg>
      <u-pods-panel
        dense
        class="b-shop-connect-flow__panel"
        :class="`b-shop-connect-flow__panel--${kind}`"
        color="var(--sd-modern-border)"
      >
        <figure
          v-for="node in nodes"
          :key="node.key"
          class="b-shop-connect-flow__node"
          :class="{
            'b-shop-connect-flow__node--inactive': !node.active,
            'b-shop-connect-flow__node--center': typeof node.row === 'string',
          }"
          :style="{ gridColumn: node.column, gridRow: node.row }"
        >
          <u-pod-node
            :circle-pod="node.key === 'core' || node.key === 'rules'"
            :data-flow-node="node.key"
            :class="{ 'b-shop-connect-flow__pod--active': node.active }"
          >
            <v-avatar
              v-if="node.identity"
              size="24"
              class="hover-scale"
              aria-hidden="true"
            >
              <v-img
                v-if="node.identity === 'provider' ? connect.icon : shop.icon"
                :src="
                  getShopImagePath(
                    node.identity === 'provider' ? connect.icon : shop.icon,
                    64,
                  )
                "
                alt=""
              />
              <v-icon v-else size="22">{{
                node.identity === "provider" ? "extension" : "storefront"
              }}</v-icon>
            </v-avatar>
            <v-icon v-else size="22" aria-hidden="true">{{ node.icon }}</v-icon>
          </u-pod-node>
          <figcaption>{{ node.title }}</figcaption>
        </figure>
      </u-pods-panel>
    </div>
    <p
      :id="`${diagramId}-description`"
      class="b-shop-connect-flow__caption"
      aria-live="polite"
    >
      {{ caption }}
    </p>
    <p
      v-if="kind === 'orders' && autoConfirm && !paused"
      class="b-shop-connect-flow__note"
    >
      <v-icon size="14" aria-hidden="true">info_outline</v-icon>
      {{ $t("shop_connect.edit.confirm.tips") }}
    </p>
  </div>
</template>

<script lang="ts">
import { useId } from "vue";
import UPodsPanel from "../../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../../ui/pod/node/UPodNode.vue";

type FlowNode = {
  key: string;
  title: string;
  icon?: string;
  identity?: string;
  column: number | string;
  row: number | string;
  active: boolean;
};
type FlowLink = { key: string; from: string; to: string; active: boolean };

export default {
  name: "AddShopConnectFlow",
  components: { UPodsPanel, UPodNode },
  props: {
    kind: { type: String, required: true },
    shop: { type: Object, required: true },
    connect: { type: Object, required: true },
    enabled: { type: Boolean, default: true },
    overwrite: { type: Boolean, default: false },
    autoConfirm: { type: Boolean, default: false },
    shipping: { type: Boolean, default: false },
    limited: { type: Boolean, default: true },
    importZero: { type: Boolean, default: false },
    sidePanel: { type: Boolean, default: false },
  },
  setup: () => ({ diagramId: `shop-connect-policy-${useId()}` }),
  data: () => ({
    samplePayment: "live",
    bounds: { width: 1, height: 1 },
    edges: [] as { key: string; path: string; active: boolean }[],
    observer: null as ResizeObserver | null,
    orientationMedia: null as MediaQueryList | null,
    vertical: false,
    previewing: false,
    previewRun: 0,
    previewTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  }),
  computed: {
    paused() {
      return (
        !this.enabled && (this.kind === "catalog" || this.kind === "orders")
      );
    },
    isOrderAutomatic() {
      return this.autoConfirm && this.samplePayment === "live";
    },
    paymentExamples() {
      return ["live", "cod", "gift", "debug"].map((value) => ({
        value,
        title: this.$t(`shop_connect.settings_flow.${value}_payment`),
      }));
    },
    selectedPaymentTitle() {
      return this.paymentExamples.find(
        (payment) => payment.value === this.samplePayment,
      )?.title;
    },
    horizontalNodes(): FlowNode[] {
      const label = (key: string) =>
        this.$t(`shop_connect.settings_flow.${key}`);
      const provider = {
        key: "provider",
        title: this.connect.name,
        identity: "provider",
      };
      if (this.kind === "orders") {
        return [
          {
            key: "order",
            title: label("shop_order"),
            icon: "shopping_bag",
            column: 1,
            row: "1 / span 2",
            active: !this.paused,
          },
          {
            key: "rules",
            title: label("payment_rules"),
            icon: "account_tree",
            column: 2,
            row: "1 / span 2",
            active: !this.paused,
          },
          {
            key: "automatic",
            title: label("auto_confirm"),
            icon: "bolt",
            column: 3,
            row: 1,
            active: !this.paused && this.isOrderAutomatic,
          },
          {
            key: "manual",
            title: label("manual_review"),
            icon: "person_outline",
            column: 3,
            row: 2,
            active: !this.paused && !this.isOrderAutomatic,
          },
          {
            ...provider,
            column: 4,
            row: "1 / span 2",
            active: !this.paused && this.isOrderAutomatic,
          },
        ];
      }
      if (this.kind === "shipping") {
        return [
          {
            key: "checkout",
            title: label("checkout"),
            icon: "shopping_cart",
            column: 1,
            row: "1 / span 2",
            active: true,
          },
          {
            ...provider,
            title: this.$t("shop_connect.settings_flow.provider_rates", {
              provider: this.connect.name,
            }),
            column: 2,
            row: 1,
            active: this.shipping,
          },
          {
            key: "shop",
            title: label("shop_rules"),
            identity: "shop",
            column: 2,
            row: 2,
            active: !this.shipping,
          },
          {
            key: "quote",
            title: label("shipping_cost"),
            icon: "receipt_long",
            column: 3,
            row: "1 / span 2",
            active: true,
          },
        ];
      }
      return [
        { ...provider, column: 1, row: 1, active: !this.paused },
        {
          key: "core",
          title: "Connect OS",
          icon: "sync",
          column: 2,
          row: 1,
          active: !this.paused,
        },
        {
          key: "shop",
          title: label("shop_catalog"),
          identity: "shop",
          column: 3,
          row: 1,
          active: !this.paused,
        },
      ];
    },
    nodes(): FlowNode[] {
      if (!this.vertical) return this.horizontalNodes;
      if (this.kind === "orders") {
        const positions: Record<string, Pick<FlowNode, "column" | "row">> = {
          order: { column: "1 / span 2", row: 1 },
          rules: { column: "1 / span 2", row: 2 },
          automatic: { column: 1, row: 3 },
          manual: { column: 2, row: 3 },
          provider: { column: "1 / span 2", row: 4 },
        };
        return this.horizontalNodes.map((node) => ({
          ...node,
          ...positions[node.key],
        }));
      }
      if (this.kind === "shipping") {
        const positions: Record<string, Pick<FlowNode, "column" | "row">> = {
          checkout: { column: "1 / span 2", row: 1 },
          provider: { column: 1, row: 2 },
          shop: { column: 2, row: 2 },
          quote: { column: "1 / span 2", row: 3 },
        };
        return this.horizontalNodes.map((node) => ({
          ...node,
          ...positions[node.key],
        }));
      }
      return this.horizontalNodes.map((node, index) => ({
        ...node,
        column: 1,
        row: index + 1,
      }));
    },
    links(): FlowLink[] {
      if (this.kind === "orders") {
        return [
          { key: "payment", from: "order", to: "rules", active: !this.paused },
          {
            key: "automatic",
            from: "rules",
            to: "automatic",
            active: !this.paused && this.isOrderAutomatic,
          },
          {
            key: "manual",
            from: "rules",
            to: "manual",
            active: !this.paused && !this.isOrderAutomatic,
          },
          {
            key: "automatic-provider",
            from: "automatic",
            to: "provider",
            active: !this.paused && this.isOrderAutomatic,
          },
          {
            key: "manual-provider",
            from: "manual",
            to: "provider",
            // Manual review stops here until the merchant actually approves it.
            active: false,
          },
        ];
      }
      if (this.kind === "shipping") {
        return [
          {
            key: "provider",
            from: "checkout",
            to: "provider",
            active: this.shipping,
          },
          {
            key: "provider-quote",
            from: "provider",
            to: "quote",
            active: this.shipping,
          },
          { key: "shop", from: "checkout", to: "shop", active: !this.shipping },
          {
            key: "shop-quote",
            from: "shop",
            to: "quote",
            active: !this.shipping,
          },
        ];
      }
      return [
        {
          key: "provider-core",
          from: "provider",
          to: "core",
          active: !this.paused,
        },
        { key: "core-shop", from: "core", to: "shop", active: !this.paused },
      ];
    },
    caption() {
      const label = (key: string) =>
        this.$t(`shop_connect.settings_flow.${key}`, {
          provider: this.connect.name,
        });
      if (this.paused) return label("paused");
      if (this.kind === "orders")
        return label(this.isOrderAutomatic ? "orders_auto" : "orders_manual");
      if (this.kind === "shipping")
        return label(this.shipping ? "shipping_provider" : "shipping_shop");
      if (this.kind === "catalog")
        return label(this.overwrite ? "catalog_update" : "catalog_preserve");
      const mode = label(
        this.limited || !this.connect.enable ? "import_limited" : "import_all",
      );
      const stock = label(
        this.importZero
          ? "import_keep_stock"
          : this.overwrite
            ? "import_remove_stock"
            : "import_skip_stock",
      );
      return `${mode} ${stock}`;
    },
    stateKey() {
      return [
        this.kind,
        this.enabled,
        this.overwrite,
        this.autoConfirm,
        this.shipping,
        this.limited,
        this.importZero,
        this.samplePayment,
      ].join(":");
    },
  },
  watch: {
    sidePanel() {
      this.$nextTick(this.measure);
    },
    stateKey() {
      this.$nextTick(this.measure);
      this.previewFlow();
    },
    nodes() {
      this.$nextTick(this.measure);
    },
  },
  mounted() {
    this.orientationMedia = window.matchMedia("(min-width: 1100px)");
    this.orientationMedia.addEventListener("change", this.measure);
    this.observer = new ResizeObserver(this.measure);
    this.observer.observe(this.$refs.canvas);
    this.measure();
  },
  beforeUnmount() {
    this.orientationMedia?.removeEventListener("change", this.measure);
    this.observer?.disconnect();
    clearTimeout(this.previewTimer);
  },
  methods: {
    measure() {
      const canvas = this.$refs.canvas as HTMLElement | undefined;
      if (!canvas?.isConnected) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const vertical = this.sidePanel && !!this.orientationMedia?.matches;
      if (vertical !== this.vertical) {
        this.vertical = vertical;
        this.$nextTick(this.measure);
        return;
      }
      const nodes = new Map(
        this.nodes.map((node) => [
          node.key,
          canvas
            .querySelector(`[data-flow-node="${node.key}"]`)
            ?.getBoundingClientRect(),
        ]),
      );
      if ([...nodes.values()].some((node) => !node)) return;
      this.bounds = { width: rect.width, height: rect.height };
      this.edges = this.links
        .map((link, index) => {
          const from = nodes.get(link.from)!,
            to = nodes.get(link.to)!;
          if (this.vertical) {
            const x1 = (from.left + from.right) / 2 - rect.left,
              y1 = from.bottom - rect.top + 2;
            const x2 = (to.left + to.right) / 2 - rect.left,
              y2 = to.top - rect.top - 3;
            const gap = Math.max(0, y2 - y1),
              middle = (y1 + y2) / 2;
            const bend =
              x1 === x2 ? (index % 2 ? -1 : 1) * Math.min(18, gap * 0.2) : 0;
            return {
              key: link.key,
              active: link.active,
              path: `M${x1} ${y1} C${x1 + bend} ${middle} ${x2 + bend} ${middle} ${x2} ${y2}`,
            };
          }
          const x1 = from.right - rect.left + 2,
            y1 = (from.top + from.bottom) / 2 - rect.top;
          const x2 = to.left - rect.left - 3,
            y2 = (to.top + to.bottom) / 2 - rect.top;
          const gap = Math.max(0, x2 - x1),
            middle = (x1 + x2) / 2;
          const bend =
            y1 === y2 ? (index % 2 ? -1 : 1) * Math.min(18, gap * 0.2) : 0;
          return {
            key: link.key,
            active: link.active,
            path: `M${x1} ${y1} C${middle} ${y1 + bend} ${middle} ${y2 + bend} ${x2} ${y2}`,
          };
        })
        .sort((a, b) => Number(a.active) - Number(b.active));
    },
    previewFlow() {
      clearTimeout(this.previewTimer);
      if (
        this.paused ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        this.previewing = false;
        return;
      }
      this.previewRun += 1;
      this.previewing = true;
      this.previewTimer = setTimeout(() => {
        this.previewing = false;
      }, 1300);
    },
  },
};
</script>

<style scoped lang="scss">
.b-shop-connect-flow {
  min-width: 0;
  padding-block-start: 14px;
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px 20px;
    min-height: 32px;
  }
  &__payment {
    max-width: 100%;
    min-width: 0;
    margin-inline-end: auto;
    :deep(.v-btn__content) {
      min-width: 0;
      gap: 6px;
      white-space: nowrap;
    }
  }
  &__payment-label {
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 400;
  }
  &__payment-value {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    font-weight: 400;
  }
  &__payment-menu.sd-modern-menu__list {
    min-width: 180px;
    max-width: calc(100vw - 32px);
    :deep(.v-list-item) {
      min-height: 36px;
    }
    :deep(.v-list-item-title) {
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
    }
  }
  &__preview {
    flex: 0 0 auto;
  }
  &__canvas {
    position: relative;
    max-width: 780px;
    margin: 14px auto 0;
    min-width: 0;
  }
  &__paths {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }
  &__curve,
  &__arrow {
    fill: none;
    stroke: rgba(var(--v-theme-on-surface), 0.25);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  &__curve--active,
  &__arrow--active {
    stroke: rgb(var(--v-theme-primary));
  }
  &__packet {
    fill: rgb(var(--v-theme-primary));
  }
  &__panel {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: center;
    gap: 8px;
    margin: 0 !important;
    padding: 10px 0 !important;
    overflow: visible;
    &--orders {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    &--orders,
    &--shipping {
      row-gap: 18px;
    }
    :deep(.pod) {
      --pod-size: 72px;
      --pod-border-radius: 16px;
      --pod-shadow: 0 3px 12px rgba(var(--v-theme-on-surface), 0.07);
      flex: 0 0 auto;
      width: min(var(--pod-size), 100%);
      height: auto;
      padding: 6px;
      border: 1px solid var(--sd-modern-border);
      background: rgb(var(--v-theme-surface));
      color: rgb(var(--v-theme-on-surface));
      transition: border-color 160ms ease;
    }
    :deep(.pod > small) {
      display: none !important;
    }
    :deep(.pod.b-shop-connect-flow__pod--active) {
      border-color: rgba(var(--v-theme-primary), 0.35);
    }
  }
  &__node {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: start;
    min-width: 0;
    margin: 0;
    figcaption {
      max-width: 100%;
      min-height: 30px;
      margin-block-start: 7px;
      font-size: 11px;
      font-weight: 400;
      line-height: 15px;
      text-align: center;
      overflow-wrap: anywhere;
      color: rgb(var(--v-theme-on-surface));
    }
    &--inactive figcaption {
      color: var(--sd-modern-muted);
    }
    &--center {
      align-self: center;
    }
  }
  &__caption {
    margin: 12px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
  }
  &__note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin: 7px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
    > .v-icon {
      margin-block-start: 2px;
    }
  }
  &--vertical {
    .b-shop-connect-flow__panel {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 26px;
      &--orders,
      &--shipping {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: 18px;
      }
      :deep(.pod) {
        --pod-size: 52px;
        --pod-border-radius: 13px;
      }
    }
    .b-shop-connect-flow__node {
      display: grid;
      grid-template-columns: 52px minmax(0, 110px);
      align-items: center;
      align-self: center;
      justify-self: center;
      column-gap: 10px;
      width: 100%;
      max-width: 172px;
      figcaption {
        min-height: 0;
        margin: 0;
        text-align: start;
      }
    }
  }
  @media (max-width: 600px) {
    &__node figcaption {
      min-height: 45px;
    }
    &__panel :deep(.pod) {
      --pod-size: 60px;
      --pod-border-radius: 13px;
    }
    &__panel--orders :deep(.pod) {
      --pod-size: 44px;
    }
    &__toolbar {
      gap: 8px;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    &__payment {
      min-height: 44px;
    }
    &__payment-menu.sd-modern-menu__list :deep(.v-list-item) {
      min-height: 44px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &__packet {
      display: none;
    }
    &__panel :deep(.pod),
    :deep(.hover-scale) {
      transition: none !important;
      transform: none !important;
    }
  }
}
</style>

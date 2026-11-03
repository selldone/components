<template>
  <div
    class="b-domain-workspace-flow text-start"
    :class="{
      'b-domain-workspace-flow--stopped': !external && !item.enable,
      'b-domain-workspace-flow--external': external,
      'b-domain-workspace-flow--unknown': scenario === 'unknown',
    }"
    :style="{
      '--domain-serving-row': scenario === 'direct' ? 3 : 4,
      '--domain-group-extra': groupSpacing + 'px',
      '--domain-flow-tail': flowTail + 'px',
    }"
  >
    <s-article-flow
      :block="flow"
      :rail-columns="nodes.length"
      interactive
      @select="selectNode"
      @measure="updateGroupGeometry"
    >
      <template #caption />
      <template #node-icon="{ node }">
        <span
          v-if="node.id !== 'client'"
          class="b-domain-workspace-flow__action-outline no-inv"
          aria-hidden="true"
        />
        <span
          v-if="node.id === 'client'"
          class="b-domain-workspace-flow__client-icon"
        >
          <v-icon size="30" aria-hidden="true">person_outline</v-icon>
        </span>
        <img
          v-else-if="
            node.id === 'store' &&
            customLayout?.image_url &&
            failedLayoutImage !== customLayout.image_url
          "
          :src="customLayout.image_url"
          class="b-domain-workspace-flow__layout-image"
          width="28"
          height="28"
          alt=""
          decoding="async"
          @error="failedLayoutImage = customLayout.image_url"
        />
        <v-icon
          v-else-if="node.id === 'store' && maintenanceEnabled"
          size="28"
          aria-hidden="true"
          >construction</v-icon
        >
        <v-icon
          v-else-if="node.id === 'store' && customLayout"
          size="28"
          aria-hidden="true"
          >layers</v-icon
        >
        <span
          v-else-if="node.id === 'store' && !external"
          class="b-domain-workspace-flow__logo"
          :style="{ maskImage: `url(${SelldoneLogo})` }"
          aria-hidden="true"
        />
        <v-icon
          v-else
          class="b-domain-workspace-flow__node-icon"
          size="20"
          aria-hidden="true"
          >{{ node.icon }}</v-icon
        >
      </template>
      <template #stage-decoration="{ boxes, layout, size }">
        <div
          class="b-domain-workspace-flow__decorations"
          :data-columns="layout.columns"
        >
          <section
            v-for="group in measuredGroups(boxes)"
            :key="group.id"
            class="b-domain-workspace-flow__group"
            :style="group.style"
            :aria-label="group.title"
            :data-group="group.id"
          >
            <div
              class="b-domain-workspace-flow__group-title"
              aria-hidden="true"
            >
              <v-icon size="16">{{ group.icon }}</v-icon
              ><span>{{ group.title }}</span>
            </div>
            <div class="b-domain-workspace-flow__group-footer">
              <component
                :is="group.action ? 'button' : 'div'"
                v-if="group.certificate"
                :type="group.action ? 'button' : undefined"
                class="b-domain-workspace-flow__certificate"
                :class="{
                  'b-domain-workspace-flow__certificate--action': group.action,
                }"
                @click="group.action && selectNode('connection')"
              >
                <span
                  v-if="group.action"
                  class="b-domain-workspace-flow__action-outline no-inv"
                  aria-hidden="true"
                />
                <v-icon class="no-inv" size="14" aria-hidden="true"
                  >lock_outline</v-icon
                >
                <span
                  >{{ group.certificate }}<small>{{ group.owner }}</small></span
                >
              </component>
              <p v-else>{{ group.note }}</p>
              <button
                v-if="group.id === 'delivery' && scenario === 'unknown'"
                type="button"
                class="b-domain-workspace-flow__provider-check sd-modern-button text-primary no-inv"
                :disabled="!providerCheckAllowed || providerChecking"
                :aria-label="t('refresh_provider')"
                :aria-busy="providerChecking"
                @click="$emit('refresh-provider')"
              >
                <v-icon size="16" aria-hidden="true">refresh</v-icon>
                <span>{{ t("refresh_provider") }}</span>
              </button>
            </div>
          </section>
          <template
            v-for="check in measuredDnsCheck(boxes, layout)"
            :key="check.d"
          >
            <svg
              class="b-domain-workspace-flow__dns-wire"
              :viewBox="'0 0 ' + (size?.w || 1) + ' ' + (size?.h || 1)"
              aria-hidden="true"
              focusable="false"
            >
              <path :d="check.d" />
              <path class="b-domain-workspace-flow__dns-head" :d="check.head" />
            </svg>
            <span
              class="b-domain-workspace-flow__dns-label"
              :style="check.label"
            >
              {{ external ? "TXT" : t("dns_check") }}
            </span>
            <button
              v-if="external"
              type="button"
              class="b-domain-workspace-flow__ownership"
              :style="check.actor"
              @click="selectNode('dns')"
            >
              <v-icon size="18" aria-hidden="true">fact_check</v-icon>
              <strong>{{ t("ownership_check") }}</strong>
              <span>{{ t("ownership_meta") }}</span>
              <v-tooltip
                activator="parent"
                location="top"
                open-on-focus
                content-class="sd-modern-tooltip text-start"
                :text="t('ownership_help')"
              />
            </button>
          </template>
        </div>
      </template>
    </s-article-flow>
    <p class="b-domain-workspace-flow__status">
      <v-icon size="16" aria-hidden="true">{{
        !external && !item.enable ? "info_outline" : "arrow_forward"
      }}</v-icon>
      <span>{{
        t(
          external
            ? "status_external"
            : item.enable
              ? "status_enabled"
              : "status_disabled",
        )
      }}</span>
    </p>
    <div
      class="b-domain-workspace-flow__detail"
      role="status"
      aria-live="polite"
    >
      <v-icon size="18" aria-hidden="true">info_outline</v-icon>
      <div>
        <strong>{{ selectedNode.title }}</strong>
        <p>{{ selectedNode.help }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DomainMixin from "@selldone/components-vue/mixin/domain/DomainMixin.ts";
import SArticleFlow from "@selldone/components-vue/article/add-on/flowchart/SArticleFlow.vue";
import SelldoneLogo from "@selldone/components-vue/assets/selldone-logo/selldone.svg";
import { resolveDomainProvider } from "../provider/domain-provider.ts";
import {
  connectorPath,
  type ApiDocFlowBox,
} from "../../../article/add-on/flowchart/flow-content";

const CDN_PROVIDERS = [
  "cloudflare",
  "cloudfront",
  "fastly",
  "akamai",
  "bunny",
  "arvancloud",
];

export default {
  name: "BDomainWorkspaceFlow",
  components: { SArticleFlow },
  setup: () => ({ SelldoneLogo }),
  mixins: [DomainMixin],
  props: {
    shop: { type: Object, required: true },
    item: { type: Object, required: true },
    providerChecking: { type: Boolean, default: false },
    providerCheckAllowed: { type: Boolean, default: false },
  },
  emits: ["navigate", "refresh-provider"],
  data: () => ({
    selected: "connection",
    failedLayoutImage: null,
    groupSpacing: 0,
    flowTail: 132,
  }),
  computed: {
    maintenanceEnabled() {
      const summary = this.item.maintenance_summary || this.item.domain?.maintenance_summary;
      return !this.item.official && !!this.item.domain?.id && !this.external && summary?.supported === true && summary.enabled === true;
    },
    external() {
      return !!this.item.domain?.externally_hosted;
    },
    provider() {
      return resolveDomainProvider(this.item);
    },
    customLayout() {
      const summary =
        this.item.layout_summary || this.item.domain?.layout_summary;
      return !this.external && !this.maintenanceEnabled &&
        ["private", "official"].includes(summary?.effective_mode)
        ? summary
        : null;
    },
    // A saved origin-certificate choice is not evidence of a CDN or certificate health.
    scenario() {
      if (this.external) return "external";
      if (this.provider.id === "selldone") return "direct";
      return CDN_PROVIDERS.includes(this.provider.id) ? "cdn" : "unknown";
    },
    selldoneTls() {
      return (
        !this.external &&
        (!!this.item.official || this.item.domain?.ssl_proxy === true)
      );
    },
    connectionNode() {
      const key =
        this.scenario === "external"
          ? "external_help"
          : this.scenario === "cdn"
            ? "cdn_help"
            : this.scenario === "direct"
              ? "direct_help"
              : "unknown_help";
      return {
        id: "connection",
        title:
          this.scenario === "unknown" && this.provider.name
            ? this.provider.name
            : this.t(
                this.external
                  ? "external_provider"
                  : this.scenario === "cdn"
                    ? "cdn_edge"
                    : this.scenario === "direct"
                      ? "https"
                      : "unknown_provider",
              ),
        caption:
          this.scenario === "unknown" && this.provider.kind !== "not_checked"
            ? this.$t(
                `domains_modern.provider.${this.provider.id === "unknown" ? "unknown" : "detected"}`,
                { provider: this.provider.name },
              )
            : this.t(
                this.external
                  ? "external_serves"
                  : this.scenario === "cdn"
                    ? "cdn_request"
                    : "unknown_connection",
              ),
        icon: this.external
          ? "dns"
          : this.scenario === "cdn"
            ? "cloud_queue"
            : "help_outline",
        section: "connection",
        help:
          this.scenario === "direct" && !this.selldoneTls
            ? this.$t("domains_modern.connection.sslOwnHint")
            : this.t(key),
      };
    },
    nodes() {
      const client = {
        id: "client",
        title: this.t("client"),
        caption: this.t("browser"),
        icon: "person_outline",
        help: `${this.t("client_help")} ${this.item.domain?.domain || this.item.url}`,
      };
      const dns = {
        id: "dns",
        title: this.t("dns"),
        caption: this.t(
          this.item.official || this.external ? "dns_builtin" : "dns_records",
        ),
        icon: "dns",
        section: "connection",
        help: this.t(
          this.item.official
            ? "dns_builtin_help"
            : this.external
              ? "dns_external_help"
              : "dns_help",
        ),
      };
      const storefront = {
        id: "store",
        title: this.maintenanceEnabled
          ? this.$t('domains_modern.maintenance.page_title')
          : this.customLayout
          ? this.customLayout.name ||
            this.customLayout.package ||
            this.$t("domain_layouts.unavailable")
          : this.t(this.external ? "external_page" : "storefront"),
        caption: this.maintenanceEnabled
          ? this.$t(this.item.enable ? 'domains_modern.maintenance.all_paths' : 'domains_modern.maintenance.configured_disabled')
          : this.external
          ? this.t("external_home")
          : this.GetDomainHomeName(
              this.item.primary || !this.item.domain?.home
                ? this.shop.home
                : this.item.domain.home,
            ),
        icon: this.maintenanceEnabled ? "construction" : this.external ? "web" : "storefront",
        section: this.maintenanceEnabled ? "settings" : "storefront",
        setting: this.maintenanceEnabled ? "access" : undefined,
        help: this.maintenanceEnabled
          ? this.$t('domains_modern.maintenance.flow_help')
          : this.t(this.external ? "external_page_help" : "storefront_help"),
      };
      if (this.external) return [client, dns, this.connectionNode, storefront];
      const access = {
        id: "domain",
        title: this.t("access"),
        caption: this.t("address_settings"),
        icon: "verified_user",
        section: "settings",
        setting: "access",
        help: this.t(
          this.item.enable ? "access_enabled_help" : "access_disabled_help",
        ),
        outcome: {
          label: this.$t(
            `domains_modern.list.${this.item.enable ? "enabled" : "disabled"}`,
          ),
          tone: this.item.enable ? "success" : "error",
        },
      };
      return [
        client,
        dns,
        ...(this.scenario === "direct" ? [] : [this.connectionNode]),
        access,
        storefront,
      ];
    },
    groups() {
      if (this.external)
        return [
          {
            id: "external",
            title: this.t("external_hosting"),
            icon: "dns",
            nodes: ["connection", "store"],
            certificate: this.t("https"),
            owner: this.t("externally_managed"),
          },
        ];
      const groups = [];
      if (this.scenario !== "direct")
        groups.push({
          id: "delivery",
          title: this.t(this.scenario === "cdn" ? "cdn" : "delivery_path"),
          icon: this.scenario === "cdn" ? "cloud_queue" : "account_tree",
          nodes: ["connection"],
          ...(this.scenario === "cdn"
            ? {
                certificate: this.t("public_https"),
                owner: this.t("cdn_managed"),
              }
            : { note: this.t("unknown_note") }),
        });
      groups.push({
        id: "selldone",
        title: this.t(
          this.scenario === "direct" ? "selldone_edge" : "selldone_servers",
        ),
        icon: "dns",
        nodes: ["domain", "store"],
        ...(this.selldoneTls
          ? {
              certificate: this.t(
                this.scenario === "cdn" ? "origin_certificate" : "https",
              ),
              owner: this.t("selldone_managed"),
              action: true,
            }
          : this.scenario === "direct"
            ? {
                certificate: this.t("https"),
                owner: this.t("externally_managed"),
                action: true,
              }
            : { note: this.t("hosted_here") }),
      });
      return groups;
    },
    selectedNode() {
      return (
        this.nodes.find((node) => node.id === this.selected) ||
        this.connectionNode
      );
    },
    flow() {
      return {
        type: "flow",
        title: "",
        description: "",
        animated: true,
        nodes: this.nodes.map((node) => ({
          id: node.id,
          label: node.title,
          caption: node.caption,
          description: node.help,
          icon: node.icon,
          outcome: node.outcome || null,
        })),
        edges: this.nodes.slice(1).map((node, index) => ({
          from: this.nodes[index].id,
          to: node.id,
          label:
            index === 0
              ? this.t("dns_query")
              : this.nodes[index].id === "dns"
                ? this.t("dns_resolved")
                : this.nodes[index].id === "connection"
                  ? this.t("request")
                  : "",
        })),
      };
    },
  },
  methods: {
    t(key) {
      return this.$t(`domains_modern.request_flow.${key}`);
    },
    measuredGroups(boxes) {
      const groups = this.groups.flatMap((group) => {
        const members = group.nodes.map((id) => boxes[id]);
        if (members.some((box) => !box?.w || !box?.h)) return [];
        const x = Math.min(...members.map((box) => box.x)) - 14;
        const y = Math.min(...members.map((box) => box.y)) - 44;
        const right = Math.max(...members.map((box) => box.x + box.w)) + 14;
        const bottom =
          Math.max(...members.map((box) => box.y + box.h)) +
          (group.id === "delivery" && this.scenario === "unknown" ? 112 : 80);
        return [
          {
            ...group,
            box: { x, y, w: right - x, h: bottom - y },
          },
        ];
      });
      const height = Math.max(0, ...groups.map((group) => group.box.h));
      return groups.map((group) => ({
        ...group,
        box: { ...group.box, h: height },
        style: {
          left: `${group.box.x}px`,
          top: `${group.box.y}px`,
          width: `${group.box.w}px`,
          height: `${height}px`,
        },
      }));
    },
    updateGroupGeometry({ boxes, layout }: {
      boxes: Record<string, ApiDocFlowBox>;
      layout: { columns: number };
    }) {
      const groups = this.measuredGroups(boxes);
      const delivery = groups.find((group) => group.id === "delivery");
      const naturalHeight = boxes.connection?.h + 44 +
        (this.scenario === "unknown" ? 112 : 80);
      // Reserve the equal-height card's extra space in the native grid before its next row.
      this.groupSpacing = layout.columns === 1 && delivery
          ? Math.max(0, delivery.box.h - naturalHeight)
          : 0;
      const tilesBottom = Math.max(0,
        ...Object.values(boxes).map((box) => box.y + box.h));
      const groupsBottom = Math.max(tilesBottom,
        ...groups.map((group) => group.box.y + group.box.h));
      const labelHeight = this.$el
        ?.querySelector(".b-domain-workspace-flow__dns-label")
        ?.getBoundingClientRect().height || 19;
      // The return lane and its label must finish before the status paragraph starts.
      this.flowTail = Math.max(132, Math.ceil(groupsBottom - tilesBottom +
        (layout.columns === 1 ? 20 : 25 + labelHeight / 2 + 20)));
    },
    measuredDnsCheck(boxes, layout) {
      if (this.item.official || !boxes.dns?.w || !boxes.store?.w) return [];
      const dns = boxes.dns;
      const store = boxes.store;
      const rtl = this.$el?.matches(":dir(rtl)") === true;
      const end = rtl ? dns.x : dns.x + dns.w;
      const sideLabel = {
        left: end + "px",
        top: dns.y - 16 + "px",
        transform: rtl ? "translateY(-100%)" : "translate(-100%, -100%)",
      };
      const sideHead =
        "M" +
        end +
        "," +
        (dns.y + dns.h / 2) +
        " l" +
        (rtl ? -6 : 6) +
        ",-4 v8 Z";
      if (this.external) {
        // Ownership checks are separate from the external website's delivery path.
        const actor = {
          x: rtl ? dns.x : dns.x + dns.w - 164,
          y: store.y + store.h + 112,
          w: 164,
          h: 60,
        };
        return [
          {
            d: connectorPath(actor, dns, { rtl, lane: 0 }).d,
            head: sideHead,
            label: sideLabel,
            actor: {
              left: actor.x + "px",
              top: actor.y + "px",
              width: actor.w + "px",
            },
          },
        ];
      }
      const groups = this.measuredGroups(boxes);
      const source = groups.find((group) => group.id === "selldone")?.box;
      if (!source) return [];
      if (layout.columns === 1) {
        return [
          {
            d: connectorPath(source, dns, { rtl, lane: 0 }).d,
            head: sideHead,
            label: sideLabel,
          },
        ];
      }
      const startX = source.x + source.w / 2;
      const endX = dns.x + dns.w / 2;
      const startY = source.y + source.h;
      const endY = dns.y + dns.h;
      const laneY = Math.max(endY, ...groups.map((group) => group.box.y + group.box.h)) + 25;
      return [
        {
          d:
            "M" +
            startX +
            "," +
            startY +
            " V" +
            laneY +
            " H" +
            endX +
            " V" +
            endY,
          head: "M" + endX + "," + endY + " l-4,6 h8 Z",
          label: {
            left: (startX + endX) / 2 + "px",
            top: laneY + "px",
            transform: "translate(-50%, -50%)",
          },
        },
      ];
    },
    selectNode(id) {
      const node =
        id === "connection"
          ? this.connectionNode
          : this.nodes.find((node) => node.id === id);
      if (id === "home") {
        this.$emit("navigate", "storefront", undefined);
        return;
      }
      if (!node) return;
      this.selected = id;
      if (node.section) this.$emit("navigate", node.section, node.setting);
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-workspace-flow {
  contain: inline-size;
  min-width: 0;
  margin-block: 24px 0;

  :deep(.api-doc-content__flow) {
    padding: 0;
    border: 0;
    background: transparent;
  }
  :deep(.api-doc-content__stage) {
    column-gap: 40px;
    row-gap: 148px;
    padding: 56px 14px var(--domain-flow-tail);
    margin-top: 0;
  }
  &--external :deep(.api-doc-content__stage) {
    padding-bottom: 200px;
  }
  :deep(.api-doc-content__stage:has([data-columns="5"])) {
    grid-template-columns: 80px 120px 140px repeat(2, minmax(0, 1fr));
  }
  :deep(.api-doc-content__stage:has([data-columns="4"])) {
    grid-template-columns: 94px 135px repeat(2, minmax(0, 1fr));
  }
  :deep(.api-doc-content__stage:has([data-columns="3"])) {
    grid-template-columns: 112px repeat(2, minmax(0, 1fr));
  }
  // Keep the narrow ownership pair together; shared arrows measure these final tile boxes.
  :deep(.api-doc-content__stage:has([data-columns="1"])) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 28px;
    row-gap: 104px;
    padding-inline-end: 36px;
  }
  :deep(
    .api-doc-content__stage:has([data-columns="1"]) .api-doc-content__tile
  ) {
    grid-column: 1 / -1 !important;
  }
  &:not(.b-domain-workspace-flow--external) {
    .b-domain-workspace-flow__decorations[data-columns="1"]
      [data-group="delivery"]
      .b-domain-workspace-flow__group-footer:has(
        .b-domain-workspace-flow__certificate
      ) {
      inset-inline-start: auto;
      inset-inline-end: 12px;
      inline-size: calc(50% - 24px);
    }
    .b-domain-workspace-flow__decorations[data-columns="1"]
      [data-group="selldone"]
      .b-domain-workspace-flow__group-title {
      inset-inline-start: auto;
      inset-inline-end: 12px;
      inline-size: calc(50% - 12px);
    }
    :deep(
      .api-doc-content__stage:has([data-columns="1"])
        .api-doc-content__tile[data-node-id="connection"]
    ) {
      margin-block-end: calc(44px + var(--domain-group-extra));
    }
    // The unknown-provider footer includes the additional refresh action.
    &.b-domain-workspace-flow--unknown :deep(
      .api-doc-content__stage:has([data-columns="1"])
        .api-doc-content__tile[data-node-id="connection"]
    ) {
      margin-block-end: calc(76px + var(--domain-group-extra));
    }
    :deep(
      .api-doc-content__stage:has([data-columns="1"])
        .api-doc-content__tile[data-node-id="domain"]
    ),
    :deep(
      .api-doc-content__stage:has([data-columns="1"])
        .api-doc-content__tile[data-node-id="store"]
    ) {
      grid-row: var(--domain-serving-row) !important;
    }
    :deep(
      .api-doc-content__stage:has([data-columns="1"])
        .api-doc-content__tile[data-node-id="domain"]
    ) {
      grid-column: 1 !important;
    }
    :deep(
      .api-doc-content__stage:has([data-columns="1"])
        .api-doc-content__tile[data-node-id="store"]
    ) {
      grid-column: 2 !important;
    }
  }
  :deep(
    .api-doc-content__stage:has([data-columns="1"])
      .api-doc-content__tile[data-node-id="client"]
  ) {
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 3px 13px;
  }
  :deep(
    .api-doc-content__stage:has([data-columns="1"])
      .api-doc-content__tile[data-node-id="client"]
      .api-doc-content__tile-head
  ) {
    display: contents;
  }
  :deep(
    .api-doc-content__stage:has([data-columns="1"])
      .b-domain-workspace-flow__client-icon
  ) {
    grid-row: 1 / span 2;
  }
  :deep(
    .api-doc-content__stage:has([data-columns="1"])
      .api-doc-content__tile[data-node-id="client"]
      strong
  ),
  :deep(
    .api-doc-content__stage:has([data-columns="1"])
      .api-doc-content__tile[data-node-id="client"]
      .api-doc-content__tile-caption
  ) {
    grid-column: 2;
    align-self: end;
    text-align: start;
  }
  :deep(
    .api-doc-content__stage:has([data-columns="1"])
      .api-doc-content__tile[data-node-id="client"]
      .api-doc-content__tile-caption
  ) {
    align-self: start;
  }
  // These tiles open their settings; retain the existing blue action borders during arrival.
  :deep(.api-doc-content__tile) {
    border-color: transparent !important;
    cursor: pointer;
    min-height: 108px;
  }
  &__action-outline {
    position: absolute;
    inset: -1px;
    border: 1px solid rgb(var(--v-theme-primary));
    border-radius: inherit;
    pointer-events: none;
  }
  // Counter-invert only the action outline; surfaces and text follow the selected appearance.
  :deep(.api-doc-content__tile:not([data-node-id="client"]):focus-visible),
  &__certificate--action:focus-visible {
    outline: none;
    .b-domain-workspace-flow__action-outline {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
  :deep(.api-doc-content__tile-head) {
    flex-wrap: wrap;
    gap: 8px;
    border-radius: inherit;
  }
  :deep(.api-doc-content__tile-head strong) {
    flex-basis: 100%;
  }
  :deep(.api-doc-content__index),
  :deep(.api-doc-content__legend) {
    display: none;
  }
  :deep(.api-doc-content__tile[data-node-id="client"]) {
    align-self: center;
    padding: 4px 0;
    min-height: 0;
    border-color: transparent !important;
    background: transparent;
    cursor: help;
  }
  :deep(
    .api-doc-content__tile[data-node-id="client"] .api-doc-content__tile-head
  ) {
    flex-direction: column;
    align-items: center;
  }
  :deep(
    .api-doc-content__tile[data-node-id="client"]
      .api-doc-content__tile-head
      strong
  ),
  :deep(
    .api-doc-content__tile[data-node-id="client"] .api-doc-content__tile-caption
  ) {
    text-align: center;
  }
  &__client-icon {
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
  }
  :deep(.api-doc-content__tile-head strong),
  :deep(.api-doc-content__tile-caption) {
    white-space: normal;
    overflow-wrap: anywhere;
  }
  &__decorations {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  &__group {
    position: absolute;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    border-radius: 16px;
    background: color-mix(
      in srgb,
      rgb(var(--v-theme-on-surface)) 3%,
      rgb(var(--v-theme-surface))
    );
  }
  &__group-title {
    position: absolute;
    inset-block-start: 12px;
    inset-inline: 12px;
    display: flex;
    align-items: flex-start;
    gap: 7px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    .v-icon {
      flex: none;
      color: rgba(var(--v-theme-on-surface), 0.65);
    }
  }
  &__group-footer {
    position: absolute;
    inset-block-end: 12px;
    inset-inline: 12px;
    font-size: 11px;
    line-height: 17px;
    color: rgba(var(--v-theme-on-surface), 0.68);
    p {
      margin: 0;
    }
  }
  &__provider-check {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 7px;
    padding: 5px 0;
    min-height: 44px;
    color: rgb(var(--v-theme-primary));
    font: inherit;
    text-align: start;
    cursor: pointer;
    pointer-events: auto;
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
  &__dns-wire {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    fill: none;
    stroke: var(--doc-flow-wire);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }
  &__dns-head {
    fill: var(--doc-flow-wire);
    stroke: none;
  }
  &__dns-label {
    position: absolute;
    max-width: 180px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgb(var(--v-theme-surface));
    color: rgba(var(--v-theme-on-surface), 0.68);
    font-size: 10px;
    line-height: 15px;
    text-align: center;
  }
  &__ownership {
    position: absolute;
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    gap: 3px 7px;
    min-height: 60px;
    padding: 10px;
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.35);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font-size: 11px;
    line-height: 16px;
    text-align: start;
    cursor: pointer;
    pointer-events: auto;
    strong {
      font-weight: 500;
    }
    span {
      grid-column: 2;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
  &__certificate {
    display: flex;
    gap: 5px;
    align-items: flex-start;
    width: 100%;
    color: inherit;
    font: inherit;
    text-align: start;
    .v-icon {
      flex: none;
      color: rgb(var(--sd-modern-illustration-accent-rgb, 147, 66, 193));
    }
    small {
      display: block;
      font: inherit;
    }
  }
  &__certificate--action {
    position: relative;
    pointer-events: auto;
    padding: 8px;
    border: 1px solid transparent;
    border-radius: 9px;
    background: rgb(var(--v-theme-surface));
    cursor: pointer;
  }
  &__status {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 0;
    font-size: 12px;
    line-height: 20px;
    color: rgba(var(--v-theme-on-surface), 0.68);
    .v-icon {
      flex: none;
      margin-block-start: 2px;
    }
  }
  &__detail {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    gap: 9px;
    margin-top: 18px;
    padding-top: 17px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    color: rgba(var(--v-theme-on-surface), 0.68);
    font-size: 12px;
    line-height: 20px;
    strong {
      display: block;
      margin-bottom: 4px;
      color: rgb(var(--v-theme-on-surface));
      font-size: 13px;
      font-weight: 500;
    }
    p {
      margin: 0;
    }
  }
  &--stopped :deep(.api-doc-content__tile[data-node-id="store"]) {
    opacity: 0.62;
  }
  &--stopped :deep(.api-doc-content__wire:last-of-type) {
    animation: none;
    stroke-dashoffset: 0;
    stroke-dasharray: 4 4;
    opacity: 0.62;
  }
  &--stopped :deep(.api-doc-content__pulse:last-of-type) {
    animation: none;
    opacity: 0;
  }
  &__logo {
    flex: none;
    width: 26px;
    height: 26px;
    background: currentColor;
    mask-position: center;
    mask-size: contain;
    mask-repeat: no-repeat;
  }
  &__layout-image {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    object-fit: contain;
    transform: none;
    transition: none;
  }
  @media (max-width: 719px) {
    :deep(
      .api-doc-content__tile[data-node-id="client"] .api-doc-content__tile-head
    ) {
      align-items: flex-start;
    }
    :deep(
      .api-doc-content__tile[data-node-id="client"]
        .api-doc-content__tile-head
        strong
    ),
    :deep(
      .api-doc-content__tile[data-node-id="client"]
        .api-doc-content__tile-caption
    ) {
      text-align: start;
    }
  }
}
</style>

<template>
  <div class="b-domain-flow text-start">
    <p class="b-domain-flow__hosting">
      {{ $t(isExternal ? 'domains_modern.map.externalSummary' : 'domains_modern.map.hostedSummary') }}
      <template v-if="!isOfficial && !isExternal"> · SSL: {{ $t(item.domain.ssl_proxy ? 'domains_modern.map.selldoneEdge' : 'domains_modern.map.externalEdge') }}</template>
    </p>
    <div class="b-domain-flow__intro">
      <div><h4>{{ $t('domains_modern.map.title') }}</h4><p>{{ $t('domains_modern.map.intro') }}</p></div>
      <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('domains_modern.map.mapHelp')">
        <v-icon size="14">info_outline</v-icon>
        <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('domains_modern.map.mapHelp') }}</v-tooltip>
      </v-btn>
    </div>

    <div ref="canvas" class="b-domain-flow__canvas">
      <svg class="b-domain-flow__paths" :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`" aria-hidden="true">
        <g v-for="edge in edges" :key="edge.key">
          <path :d="edge.path" :class="{ 'b-domain-flow__recovery-path': edge.recovery }" />
          <path :d="edge.head" />
        </g>
      </svg>
      <div class="b-domain-flow__stages" :style="{ gridTemplateColumns: `repeat(${columns}, 128px)` }">
        <div v-for="(stage, index) in stages" :key="stage.main.id" class="b-domain-flow__stage" :style="stagePlacement(index)">
          <template v-for="(node, level) in [stage.main, stage.child]" :key="node?.id || 'empty'">
            <template v-if="node">
              <div v-if="level" class="b-domain-flow__relationship"><span>{{ $t(`domains_modern.map.${stage.relationship}`) }}</span></div>
              <component
                :is="node.href ? 'a' : 'button'"
                :type="node.href ? undefined : 'button'"
                :href="node.href"
                :target="node.href ? '_blank' : undefined"
                :rel="node.href ? 'noopener noreferrer' : undefined"
                :disabled="node.disabled || undefined"
                :data-node="node.id"
                class="b-domain-flow__node"
                :class="{ 'b-domain-flow__node--secondary': level, 'b-domain-flow__node--unavailable': node.id === 'live' && !item.enable, 'b-domain-flow__node--selected': active === node.id }"
                :aria-haspopup="node.href || (node.id === 'home' && isOfficial) ? undefined : 'dialog'"
                @click.stop="activate(node.id, $event)"
              >
                <v-icon size="18" aria-hidden="true">{{ node.icon }}</v-icon>
                <span class="b-domain-flow__node-title">{{ node.title }}<v-icon v-if="node.href" size="12" aria-hidden="true">north_east</v-icon></span>
                <span class="b-domain-flow__node-state"><span v-if="node.positive || node.warning" class="b-domain-flow__dot" :class="node.warning ? 'bg-warning' : 'bg-success'" aria-hidden="true" />{{ node.caption }}</span>
                <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ node.help }}</v-tooltip>
              </component>
            </template>
          </template>
        </div>
      </div>
    </div>

    <div v-if="item.official !== 'local'" class="b-domain-flow__preferences">
      <div class="b-domain-flow__preference">
        <u-smart-toggle
          class="b-domain-flow__preference-control" role="checkbox"
          :model-value="item.primary" :true-title="$t('domains_modern.map.primary')"
          :readonly="item.primary || readOnly || busyUpdate" :loading="busyUpdate"
          :aria-checked="!!item.primary" :aria-disabled="item.primary || readOnly || busyUpdate"
          :tabindex="item.primary || readOnly || busyUpdate ? -1 : 0" false-gray
          @update:model-value="updateValue('primary', $event)"
          @keydown.enter.prevent="updateValue('primary', !item.primary)"
          @keydown.space.prevent="updateValue('primary', !item.primary)"
        />
        <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('domains_modern.map.primaryTip')">
          <v-icon size="14">info_outline</v-icon>
          <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('domains_modern.map.primaryTip') }}</v-tooltip>
        </v-btn>
      </div>
      <div class="b-domain-flow__preference">
        <u-smart-toggle
          class="b-domain-flow__preference-control" role="checkbox"
          :model-value="item.indexed" :true-title="$t('domains_modern.map.search')"
          :readonly="readOnly || busyUpdate" :loading="busyUpdate"
          :aria-checked="!!item.indexed" :aria-disabled="readOnly || busyUpdate"
          :tabindex="readOnly || busyUpdate ? -1 : 0" false-gray
          @update:model-value="updateValue('indexed', $event)"
          @keydown.enter.prevent="updateValue('indexed', !item.indexed)"
          @keydown.space.prevent="updateValue('indexed', !item.indexed)"
        />
        <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('domains_modern.map.searchTip')">
          <v-icon size="14">info_outline</v-icon>
          <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('domains_modern.map.searchTip') }}</v-tooltip>
        </v-btn>
      </div>
    </div>

    <v-dialog :model-value="!!active" max-width="430" scrollable @update:model-value="!$event && closeDialog()">
      <v-card class="b-domain-flow__dialog sd-modern-widget text-start" :aria-label="dialogTitle">
        <header class="b-domain-flow__dialog-heading">
          <div><div class="b-domain-flow__dialog-address"><bdi dir="ltr">{{ item.domain?.domain || item.url }}</bdi></div><h3>{{ dialogTitle }}</h3></div>
          <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" @click="closeDialog">
            <v-icon size="16">close</v-icon>
            <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
          </v-btn>
        </header>
        <v-card-text class="b-domain-flow__dialog-body">
          <template v-if="active === 'access' || active === 'search'">
            <v-checkbox-btn :model-value="active === 'access' ? item.enable : item.indexed" :label="$t(active === 'access' ? 'domains_modern.map.enableLabel' : 'domains_modern.map.searchLabel')" :disabled="readOnly || busyUpdate" @update:model-value="updateValue(active === 'access' ? 'enable' : 'indexed', $event)" />
            <p>{{ $t(active === 'access' ? 'domains_modern.map.enableHelp' : 'domains_modern.map.searchHelp') }}</p>
            <v-progress-linear v-if="busyUpdate" indeterminate color="primary" height="2" class="mt-3" />
          </template>
          <template v-else-if="active === 'repair'">
            <p>{{ $t('domains_modern.map.repairHelp') }}</p>
            <div class="sd-modern-notice b-domain-flow__notice">{{ $t('domains_modern.map.repairTip') }}</div>
            <div class="b-domain-flow__repair-action"><v-btn color="primary" variant="flat" class="sd-modern-button" prepend-icon="build" :disabled="readOnly || busyRepair" :loading="busyRepair" @click="performRepair">{{ $t('domains_modern.map.repairAction') }}</v-btn></div>
          </template>
          <template v-else-if="active === 'connection'">
            <div class="b-domain-flow__facts">
              <div><span>{{ $t('domains_modern.map.siteHosting') }}</span><span>{{ $t(isExternal ? 'domains_modern.map.external' : 'domains_modern.map.selldone') }}</span></div>
              <div v-if="!isExternal"><span>{{ $t('domains_modern.map.provider') }}</span><span>{{ $t(isOfficial ? 'domains_modern.map.hosted' : item.domain.ssl_proxy ? 'domains_modern.map.selldoneEdge' : 'domains_modern.map.externalEdge') }}</span></div>
            </div>
            <p>{{ $t(isExternal ? 'domains_modern.map.verifyHelp' : 'domains_modern.map.connectionHelp') }}</p>
          </template>
          <p v-else-if="active === 'home'">{{ $t(isExternal ? 'domains_modern.map.externalHomeTip' : 'domains_modern.map.homeTip') }}</p>
          <p v-else-if="active === 'live'">{{ $t('domains_modern.map.liveOff') }}</p>
        </v-card-text>
        <v-card-actions class="b-domain-flow__dialog-actions"><v-btn variant="text" class="sd-modern-button" @click="closeDialog">{{ $t('global.actions.close') }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import DomainMixin from "@selldone/components-vue/mixin/domain/DomainMixin.ts";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BDomainFlowMap",
  mixins: [DomainMixin],
  components: { USmartToggle },
  props: {
    item: { type: Object, required: true },
    shop: { type: Object, required: true },
    readOnly: { type: Boolean, default: false },
    busyUpdate: { type: Boolean, default: false },
    busyRepair: { type: Boolean, default: false },
  },
  emits: ["update-domain", "edit-domain", "settings", "home", "default-home", "sitemap", "repair"],
  data: () => ({ availableWidth: 628, canvasWidth: 1, canvasHeight: 1, edges: [], resizeObserver: null, active: null, dialogActivator: null }),
  computed: {
    isExternal() { return !!this.item.domain?.externally_hosted; },
    isOfficial() { return !!this.item.official; },
    homeValue() { return this.item.primary || !this.item.domain?.home ? this.shop.home : this.item.domain.home; },
    certificateExpired() {
      const expiry = this.item.certificate?.["Expiry Date"];
      return !!(expiry && DateConverter.convertToLocalTime(expiry)?.isBeforeToday());
    },
    columns() {
      const fitting = Math.floor((this.availableWidth + 28) / 156);
      return fitting >= 4 ? 4 : fitting >= 2 ? 2 : 1;
    },
    stages() {
      const t = (key) => this.$t(`domains_modern.map.${key}`);
      const node = (id, title, caption, icon, help, extra = {}) => ({ id, title: t(title), caption: t(caption), icon, help: t(help), ...extra });
      const connectionCaption = this.isExternal ? t('external') : this.item.error || (!this.item.ssl && !this.isOfficial) ? this.$t('domains_modern.list.attention') : this.certificateExpired ? t('edgeExpired') : t(this.isOfficial ? 'hosted' : this.item.domain.ssl_proxy ? 'selldoneEdge' : 'externalEdge');
      return [
        { main: node('access', 'access', this.item.enable ? 'enabled' : 'disabled', 'language', 'accessTip', { positive: !!this.item.enable }), child: !this.isOfficial ? node('settings', 'settings', 'settingsState', 'tune', this.isExternal ? 'externalSettingsTip' : 'settingsTip', { disabled: this.readOnly }) : null, relationship: 'configure' },
        { main: node('connection', this.isExternal ? 'ownership' : 'connection', 'hosted', this.isExternal ? 'fact_check' : 'verified_user', 'connectionTip', { caption: connectionCaption, warning: !this.isExternal && (!!this.item.error || !this.item.ssl || this.certificateExpired) }), child: !this.isExternal ? node('repair', 'repair', 'repairState', 'build', 'repairTip') : null, relationship: 'recover' },
        { main: node('home', 'home', 'external', this.isExternal ? 'open_in_new' : 'home', this.isExternal ? 'externalHomeTip' : this.isOfficial ? 'inheritedTip' : 'homeTip', { caption: this.isExternal ? t('externalHome') : this.GetDomainHomeName(this.homeValue) }), child: node('live', 'live', this.item.enable ? 'liveState' : 'liveOff', 'open_in_new', 'liveTip', { href: this.item.enable ? this.item.url : undefined }), relationship: 'opens' },
        { main: this.item.official === 'local' ? node('sitemap', 'sitemap', 'sitemapState', 'account_tree', 'sitemapTip') : node('search', 'search', this.item.indexed ? 'indexed' : 'notIndexed', 'search', 'searchTip', { positive: !!this.item.indexed }), child: this.item.official !== 'local' && !this.isExternal ? node('sitemap', 'sitemap', 'sitemapState', 'account_tree', 'sitemapTip') : null, relationship: 'discover' },
      ];
    },
    dialogTitle() {
      const title = this.stages.flatMap((stage) => [stage.main, stage.child]).find((node) => node?.id === this.active)?.title;
      return title || '';
    },
  },
  watch: {
    stages: { deep: true, handler() { this.$nextTick(this.measure); } },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.measure);
    this.resizeObserver.observe(this.$refs.canvas);
    this.measure();
  },
  beforeUnmount() { this.resizeObserver?.disconnect(); },
  methods: {
    stagePlacement(index) {
      const row = Math.floor(index / this.columns);
      return { gridRow: row + 1, gridColumn: (row % 2 ? this.columns - 1 - index % this.columns : index % this.columns) + 1 };
    },
    activate(id, event) {
      if (id === 'live' && this.item.enable) return;
      if (id === 'settings') { if (!this.readOnly && this.item.domain) this.$emit('settings'); return; }
      if (id === 'connection' && !this.isOfficial && !this.readOnly) { this.$emit('edit-domain'); return; }
      if (id === 'home' && !this.isExternal) {
        if (this.isOfficial) { this.$emit('default-home'); return; }
        if (!this.readOnly) { this.$emit('home'); return; }
      }
      if (id === 'sitemap') { if (!this.isExternal) this.$emit('sitemap'); return; }
      if (id === 'search' && this.item.official === 'local') return;
      if (id === 'repair' && this.isExternal) return;
      this.dialogActivator = event?.currentTarget;
      this.active = id;
    },
    updateValue(param, value) {
      if (this.readOnly || this.busyUpdate || typeof value !== 'boolean' || !['enable', 'indexed', 'primary'].includes(param)) return;
      if (this.item.official === 'local' && param !== 'enable') return;
      if (param === 'primary' && (this.item.primary || value !== true)) return;
      this.$emit('update-domain', { param, value });
    },
    performRepair() {
      if (this.readOnly || this.busyRepair || this.isExternal) return;
      this.$emit('repair');
    },
    closeDialog() {
      this.active = null;
      this.$nextTick(() => this.dialogActivator?.focus());
    },
    measure() {
      const canvas = this.$refs.canvas;
      if (!canvas?.clientWidth) return;
      this.availableWidth = canvas.clientWidth - 34;
      this.$nextTick(this.drawEdges);
    },
    drawEdges() {
      const canvas = this.$refs.canvas;
      if (!canvas?.clientWidth) return;
      const origin = canvas.getBoundingClientRect();
      this.canvasWidth = canvas.clientWidth;
      this.canvasHeight = Math.max(1, canvas.clientHeight);
      const points = {};
      canvas.querySelectorAll('[data-node]').forEach((element) => {
        const rect = element.getBoundingClientRect();
        points[element.dataset.node] = { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height };
      });
      const main = this.stages.map((stage) => stage.main.id);
      const links = main.slice(0, -1).map((id, index) => [id, main[index + 1], false]);
      this.stages.forEach((stage) => { if (stage.child) links.push([stage.main.id, stage.child.id, stage.child.id === 'repair']); });
      const rtl = getComputedStyle(canvas).direction === 'rtl';
      this.edges = links.map(([from, to, recovery]) => {
        const a = points[from], b = points[to];
        if (!a || !b) return null;
        let path, head;
        if (Math.abs(a.y - b.y) < 5) {
          const direction = b.x > a.x ? 1 : -1, sx = direction > 0 ? a.x + a.w : a.x, sy = a.y + a.h / 2, ex = direction > 0 ? b.x - 5 : b.x + b.w + 5;
          path = `M${sx} ${sy} C${sx + direction * 11} ${sy - 15},${ex - direction * 11} ${sy - 15},${ex - direction * 5} ${sy}`;
          head = `M${ex - direction * 5} ${sy - 3.5} L${ex} ${sy} L${ex - direction * 5} ${sy + 3.5}`;
        } else if (Math.abs(a.x - b.x) < 5 && b.y - a.y < 180) {
          const sx = a.x + a.w / 2, sy = a.y + a.h, ex = b.x + b.w / 2, ey = b.y - 5, lineEnd = ey - (recovery ? 8 : 4);
          path = `M${sx} ${sy} C${sx} ${sy + 12},${ex} ${lineEnd - 12},${ex} ${lineEnd}`;
          head = `M${ex - 3.5} ${ey - 5} L${ex} ${ey} L${ex + 3.5} ${ey - 5}`;
        } else {
          const sx = rtl ? a.x : a.x + a.w, sy = a.y + a.h / 2, ex = rtl ? b.x - 5 : b.x + b.w + 5, ey = b.y + b.h / 2, side = rtl ? Math.min(a.x, b.x) - 13 : Math.max(a.x + a.w, b.x + b.w) + 13, direction = rtl ? 1 : -1;
          path = `M${sx} ${sy} C${side} ${sy},${side} ${sy + 12},${side} ${sy + 20} L${side} ${ey - 20} C${side} ${ey - 8},${side} ${ey},${ex - direction * 5} ${ey}`;
          head = `M${ex - direction * 5} ${ey - 3.5} L${ex} ${ey} L${ex - direction * 5} ${ey + 3.5}`;
        }
        return { key: `${from}-${to}`, path, head, recovery };
      }).filter(Boolean);
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-flow {
  min-width: 0;
  &__hosting { margin: 5px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  &__intro { display: flex; align-items: flex-start; gap: 10px; border-block-start: 1px solid var(--sd-modern-border); margin-top: 24px; padding-top: 22px; }
  &__intro h4 { margin: 0; font-family: inherit; font-size: 16px; line-height: 24px; font-weight: 500; }
  &__intro p { margin: 5px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  // Measure the table's available width without fixed node tracks widening its intrinsic size.
  &__canvas { contain: inline-size; position: relative; min-width: 0; margin-top: 22px; padding: 14px 17px 8px; }
  &__stages { position: relative; z-index: 1; display: grid; gap: 38px 28px; justify-content: center; align-items: start; }
  &__stage { width: 128px; display: flex; flex-direction: column; align-items: stretch; }
  &__node { box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 128px; height: 80px; padding: 10px 8px; gap: 4px; border: 1px solid var(--sd-modern-border); border-radius: 12px; background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); font-family: inherit; text-decoration: none; text-align: center; box-shadow: 0 2px 5px rgba(var(--v-theme-on-surface), .05); cursor: pointer; transition: border-color .16s, box-shadow .16s; }
  &__node > .v-icon { flex: 0 0 18px; width: 18px; height: 18px; font-size: 18px !important; color: var(--sd-modern-muted); }
  &__node-title { display: flex; align-items: center; gap: 3px; max-width: 100%; font-size: 12px; line-height: 17px; font-weight: 500; overflow-wrap: anywhere; }
  &__node-title .v-icon { width: 12px; height: 12px; font-size: 12px !important; }
  &__node-state { display: flex; align-items: center; justify-content: center; gap: 5px; max-width: 100%; color: var(--sd-modern-muted); font-size: 11px; line-height: 16px; font-weight: 400; }
  &__dot { width: 5px; height: 5px; flex: 0 0 5px; border-radius: 50%; }
  &__node--secondary { background: color-mix(in srgb, rgb(var(--v-theme-surface)) 97%, rgb(var(--v-theme-on-surface))); box-shadow: none; }
  &__node--unavailable, &__node:disabled { opacity: .63; box-shadow: none; }
  &__node:disabled { cursor: default; }
  &__node:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; }
  &__node--selected { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
  &__relationship { display: flex; align-items: center; justify-content: center; height: 43px; position: relative; font-size: 10px; line-height: 15px; color: var(--sd-modern-muted); pointer-events: none; }
  &__relationship span { max-width: 120px; padding: 1px 5px; background: rgb(var(--v-theme-surface)); text-align: center; }
  &__preferences { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 20px; padding-top: 16px; border-block-start: 1px solid var(--sd-modern-border); }
  &__preference { display: flex; align-items: center; gap: 8px; min-width: 0; padding-inline-end: 16px; }
  &__preference + &__preference { padding-inline: 16px 0; border-inline-start: 1px solid var(--sd-modern-border); }
  &__preference-control { flex: 1; min-width: 0; border-radius: 10px; }
  &__preference-control :deep(b) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; }
  &__preference-control:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__paths { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
  &__paths path { fill: none; stroke: rgba(var(--v-theme-on-surface), .36); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
  &__paths .b-domain-flow__recovery-path { stroke-dasharray: 3 4; }
  &__dialog.sd-modern-widget { padding: 22px; border-radius: 16px; }
  &__dialog-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  &__dialog-address { font-size: 10px; line-height: 15px; color: var(--sd-modern-muted); overflow-wrap: anywhere; }
  &__dialog-heading h3 { margin: 5px 0 0; font-family: inherit; font-size: 16px; font-weight: 500; line-height: 24px; }
  &__dialog-body.v-card-text { padding: 18px 0 0; font-family: inherit; font-size: 13px; line-height: 20px; }
  &__dialog-body p { margin: 5px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  &__dialog-body :deep(.v-label) { font-family: inherit; font-size: 13px; line-height: 20px; font-weight: 400; white-space: normal; }
  &__dialog-actions.v-card-actions { justify-content: flex-end; padding: 22px 0 0; }
  &__repair-action { display: flex; justify-content: flex-end; margin-top: 22px; }
  &__notice { display: block; margin-top: 16px; padding: 12px; font-size: 12px; line-height: 19px; }
  &__facts > div { display: flex; justify-content: space-between; gap: 12px; border-block-end: 1px solid var(--sd-modern-border); padding: 11px 0; font-size: 12px; line-height: 19px; }
  &__facts > div > :first-child { color: var(--sd-modern-muted); }
  @media (hover: hover) { &__node:not(:disabled):hover { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 4px 12px rgba(var(--v-theme-on-surface), .05); } }
  @media (max-width: 600px) {
    &__dialog.sd-modern-widget { padding: 18px; }
    &__preferences { grid-template-columns: minmax(0, 1fr); }
    &__preference { padding-inline: 0; }
    &__preference + &__preference { padding-inline: 0; margin-top: 12px; padding-top: 12px; border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
  }
  @media (prefers-reduced-motion: reduce) { &__node { transition: none; } }
}
</style>

<template>
  <figure class="b-domain-storefront-preview text-start">
    <figcaption>{{ $t('domains_modern.home.preview_title') }}</figcaption>
    <div class="b-domain-storefront-preview__browser">
      <div class="b-domain-storefront-preview__address">
        <span aria-hidden="true">•••</span><bdi dir="ltr">{{ address }}</bdi>
      </div>
      <div class="b-domain-storefront-preview__identity">
        <v-avatar v-if="shop.icon" size="25"><v-img :src="getShopImagePath(shop.icon, 64)" alt="" /></v-avatar>
        <v-icon v-else size="21" aria-hidden="true">{{ maintenanceEnabled ? 'construction' : 'storefront' }}</v-icon>
        <strong>{{ storefrontTitle }}</strong>
      </div>
      <p>{{ homeLabel }}</p>
      <b-domain-customer-preview :kind="kind" />
    </div>
    <p class="b-domain-storefront-preview__note">
      <template v-if="maintenanceEnabled">
        {{ $t(!domainEnabled ? 'domains_modern.maintenance.preview_disabled' : maintenanceSummary.has_html === false ? 'domains_modern.maintenance.preview_unavailable' : 'domains_modern.maintenance.preview_active') }}
        <span v-if="!domainEnabled && maintenanceSummary.has_html === false"> {{ $t('domains_modern.maintenance.missing_html') }}</span>
      </template>
      <template v-else-if="layoutCaption !== null">{{ layoutCaption }}</template>
      <template v-else>
        {{ $t(`domains_modern.workspace.previewArt.${kind}Summary`) }}
        {{ $t('domains_modern.workspace.previewArt.note') }}
      </template>
    </p>
  </figure>
</template>

<script lang="ts">
import { StripTags } from '@selldone/core-js/helper/html/HtmlHelper';
import DomainMixin from '@selldone/components-vue/mixin/domain/DomainMixin.ts';
import BDomainCustomerPreview from './BDomainCustomerPreview.vue';

export default {
  name: 'BDomainStorefrontPreview',
  mixins: [DomainMixin],
  components: { BDomainCustomerPreview },
  props: {
    shop: { type: Object, required: true },
    address: { type: String, default: '' },
    home: { type: [String, Number], default: null },
    external: { type: Boolean, default: false },
    // Omitted by native home-choice previews; explicit null means assignment details are unavailable.
    layoutSummary: { type: Object, default: undefined },
    maintenanceSummary: { type: Object, default: null },
    domainEnabled: { type: Boolean, default: true },
  },
  computed: {
    maintenanceEnabled() {
      return !this.external && this.maintenanceSummary?.supported === true && this.maintenanceSummary.enabled === true;
    },
    layoutCaption() {
      if (this.layoutSummary === undefined) return null;
      const t = (key, values = {}) => this.$t(`domains_modern.workspace.previewLayout.${key}`, values);
      const summary = this.layoutSummary;
      if (this.external || summary?.reason === 'externally_hosted') return t('external');
      if (!summary || !['standard', 'official', 'private'].includes(summary.effective_mode)) return t('unknown');
      const name = typeof summary.name === 'string' ? summary.name.trim() : '';
      const label = summary.effective_mode === 'standard'
        ? t('standard', { name: name || this.$t('domain_layouts.standard') })
        : name ? t('custom', { name }) : t('customUnnamed');
      return [label,
        summary.inherited === true || summary.mode === 'inherit' ? t('inherited') : '',
        summary.available === false ? t('unavailable') : '',
      ].filter(Boolean).join(' ');
    },
    kind() {
      if (this.external) return 'external';
      if (this.maintenanceEnabled) return 'maintenance';
      const home = this.home || 'shop';
      if (String(home).startsWith('/')) return 'static';
      return ['shop', 'avocado', 'hyper', 'community', 'blog', 'map'].includes(home) ? home : 'landing';
    },
    homeLabel() {
      if (this.maintenanceEnabled) return this.$t('domains_modern.maintenance.page_title');
      return this.external ? this.$t('domains_modern.map.externalHome') : this.GetDomainHomeName(this.home || 'shop');
    },
    storefrontTitle() {
      return StripTags(this.shop.title || this.shop.name || '');
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-storefront-preview {
  min-width: 0;
  margin: 16px 0 0;
  > figcaption {
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__browser {
    margin-top: 8px;
    padding: 14px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: var(--sd-modern-inset);
  }
  &__address {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 10px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--sd-modern-border);
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
  }
  &__address > bdi { min-width: 0; overflow-wrap: anywhere; }
  &__identity { display: flex; align-items: center; gap: 8px; min-width: 0; }
  &__identity strong {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    overflow-wrap: anywhere;
  }
  &__browser > p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  &__note {
    margin: 10px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
}
</style>

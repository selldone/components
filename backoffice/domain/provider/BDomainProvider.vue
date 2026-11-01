<template>
  <v-tooltip v-model="help" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">
    <template #activator="{ props }">
      <button v-bind="props" type="button" class="b-domain-provider" :aria-label="$t('domains_modern.provider.label', { provider: providerName })" @click.stop="help = true" @keydown.esc.stop="help = false">
        <svg v-if="provider.id === 'selldone'" class="b-domain-provider__selldone" viewBox="0 0 28 22" aria-hidden="true">
          <path d="M7.5 18.5h13a5.2 5.2 0 0 0 .6-10.4A7.2 7.2 0 0 0 7.5 6.8a5.9 5.9 0 0 0 0 11.7Z" />
          <image :href="provider.logo" class="no-inv" x="10.5" y="6" width="8" height="11" />
        </svg>
        <img v-else-if="provider.logo" class="b-domain-provider__logo no-inv" :src="provider.logo" alt="" />
        <v-icon v-else class="b-domain-provider__unknown" size="22" aria-hidden="true">cloud_queue</v-icon>
      </button>
    </template>
    <div>{{ description }}</div>
    <div v-if="provider.checkedAt" class="b-domain-provider__checked"><time :datetime="provider.checkedAt">{{ $t('domains_modern.provider.checked_at', { date: getLocalTimeStringSmall(provider.checkedAt) }) }}</time></div>
  </v-tooltip>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

const providers = {
  selldone: { name: "Selldone", logo: require("../../../assets/trademark/selldone.svg") },
  cloudflare: { name: "Cloudflare", logo: require("../../../assets/trademark/cloudflare.svg") },
  google_cloud: { name: "Google Cloud", logo: require("../../../assets/trademark/google-cloud.svg") },
  cloudfront: { name: "CloudFront" },
  fastly: { name: "Fastly" },
  akamai: { name: "Akamai" },
  azure: { name: "Azure" },
  vercel: { name: "Vercel" },
  bunny: { name: "Bunny" },
  arvancloud: { name: "ArvanCloud" },
  unknown: { name: "" },
};

export default {
  name: "BDomainProvider",
  mixins: [DateMixin],
  props: { item: { type: Object, default: null } },
  data: () => ({ help: false }),
  computed: {
    provider() {
      if (["local", "sub"].includes(this.item?.official)) {
        return { ...providers.selldone, id: "selldone", kind: "builtin", checkedAt: null };
      }
      const saved = this.item?.connection_provider ?? this.item?.domain?.connection_provider ?? this.item?.domain?.info?.connection_provider;
      const timestamp = typeof saved?.checked_at === "string" && saved.checked_at.length <= 35 ? saved.checked_at.match(/^([1-9]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:0\d|1[0-3]):[0-5]\d|[+-]14:00)$/) : null;
      const validDate = timestamp && Number(timestamp[3]) <= new Date(Date.UTC(Number(timestamp[1]), Number(timestamp[2]), 0)).getUTCDate();
      if (!saved || typeof saved.id !== "string" || !Object.hasOwn(providers, saved.id) ||
        !["destination", "response_headers"].includes(saved.source) ||
        (saved.source === "destination") !== (saved.id === "selldone") ||
        !validDate || !Number.isFinite(Date.parse(saved.checked_at))) {
        return { ...providers.unknown, id: "unknown", kind: "not_checked", checkedAt: null };
      }
      return {
        ...providers[saved.id], id: saved.id, checkedAt: saved.checked_at,
        kind: saved.id === "unknown" ? "unknown" : saved.source === "destination" ? "direct" : "detected",
      };
    },
    providerName() {
      return this.provider.id === "unknown" ? this.$t("domains_modern.provider.unknown_name") : this.provider.name;
    },
    description() {
      return this.$t(`domains_modern.provider.${this.provider.kind}`, { provider: this.providerName });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-domain-provider {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  padding: 2px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66));
  cursor: help;
  vertical-align: middle;

  &:hover { color: rgb(var(--v-theme-on-surface)); }
  &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  &__logo { display: block; width: 22px; height: 20px; object-fit: contain; }
  &__selldone { display: block; width: 24px; height: 20px; overflow: visible; }
  &__selldone > path { fill: none; stroke: currentColor; stroke-width: 1.25; stroke-linejoin: round; }
  &__checked { margin-block-start: 4px; font-size: 12px; line-height: 18px; }

  @media (max-width: 699px), (pointer: coarse) {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
  }
}
</style>

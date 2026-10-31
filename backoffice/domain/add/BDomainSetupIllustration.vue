<template>
  <figure class="sd-modern-illustration b-domain-art text-start">
    <figcaption class="b-domain-art__caption">
      <span class="b-domain-art__label">{{ $t('domains_modern.connection.illustration.label') }}</span>
      <strong>{{ $t(`domains_modern.connection.illustration.${variant}Title`) }}</strong>
      <p>{{ $t(`domains_modern.connection.illustration.${variant}Summary`) }}</p>
    </figcaption>

    <div :key="variant" class="b-domain-art__stage" aria-hidden="true">
      <div v-if="kind === 'hosting'" class="b-domain-art__hosting" :class="{ 'b-domain-art__hosting--external': external }">
        <div v-if="!external" class="b-domain-art__layouts b-domain-art__source">
          <div v-for="layout in ['standardLayout', 'customLayout']" :key="layout" class="b-domain-art__layout">
            <div class="b-domain-art__browser-bar"><i /><i /><i /></div>
            <span>{{ $t(`domains_modern.connection.illustration.${layout}`) }}</span>
            <div class="b-domain-art__layout-preview" :class="{ 'b-domain-art__layout-preview--custom': layout === 'customLayout' }"><i /><i /><i /></div>
          </div>
        </div>
        <div v-else class="b-domain-art__code b-domain-art__source">
          <div class="b-domain-art__browser-bar"><i /><i /><i /><code>storefront</code></div>
          <svg class="sd-modern-illustration__icon b-domain-art__code-icon" width="28" height="28" viewBox="0 0 24 24" focusable="false"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-5 2 2-16" /></svg>
          <strong>{{ $t('domains_modern.connection.illustration.yourCode') }}</strong>
          <div class="b-domain-art__code-lines"><i /><i /><i /></div>
          <span class="sd-modern-illustration__action b-domain-art__deploy">{{ $t('domains_modern.connection.illustration.deploy') }}<svg class="sd-modern-illustration__icon" width="15" height="15" viewBox="0 0 24 24" focusable="false"><path d="M12 19V5m-6 6 6-6 6 6" /></svg></span>
        </div>

        <svg class="b-domain-art__hosting-wire b-domain-art__wire" viewBox="0 0 56 166" preserveAspectRatio="none" focusable="false">
          <path v-if="!external" pathLength="1" d="M0 38C30 38 22 83 56 83M0 128C30 128 22 83 56 83" />
          <path v-else pathLength="1" d="M0 83C34 83 26 38 56 38M0 83C34 83 26 128 56 128" />
        </svg>
        <svg class="b-domain-art__hosting-wire--narrow b-domain-art__wire" viewBox="0 0 320 42" preserveAspectRatio="none" focusable="false">
          <path v-if="!external" pathLength="1" d="M80 0C80 22 160 18 160 42M240 0C240 22 160 18 160 42" />
          <path v-else pathLength="1" d="M160 0C160 22 80 18 80 42M160 0C160 22 240 18 240 42" />
        </svg>

        <div v-if="!external" class="b-domain-art__hosted b-domain-art__destination">
          <img :src="require('@selldone/components-vue/assets/selldone-logo/selldone.svg')" width="30" height="30" alt="" />
          <strong>{{ $t('domains_modern.connection.illustration.hostedBySelldone') }}</strong>
          <div class="b-domain-art__store-preview"><i /><i /><i /></div>
          <span class="b-domain-art__result"><svg class="sd-modern-illustration__icon" width="16" height="16" viewBox="0 0 24 24" focusable="false"><path d="m5 12 4 4L19 6" /></svg>{{ $t('domains_modern.connection.illustration.noServer') }}</span>
        </div>
        <div v-else class="b-domain-art__destinations b-domain-art__destination">
          <div class="b-domain-art__host-choice"><img :src="require('@selldone/components-vue/assets/trademark/cloudflare.svg')" alt="" width="28" height="24" /><strong>Cloudflare Pages</strong></div>
          <div class="b-domain-art__host-choice"><svg class="sd-modern-illustration__icon" width="25" height="25" viewBox="0 0 24 24" focusable="false"><rect x="4" y="3" width="16" height="7" rx="2" /><rect x="4" y="14" width="16" height="7" rx="2" /><path d="M8 6.5h.01M8 17.5h.01M12 6.5h4M12 17.5h4" /></svg><strong>{{ $t('domains_modern.connection.illustration.yourServer') }}</strong></div>
        </div>
      </div>

      <div v-else class="b-domain-art__traffic">
        <div class="b-domain-art__traffic-node b-domain-art__source">
          <svg class="sd-modern-illustration__icon b-domain-art__domain-icon" width="27" height="27" viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5h14M5 17.5h14" /></svg>
          <strong>{{ $t('domains_modern.connection.illustration.yourDomain') }}</strong>
        </div>
        <svg class="b-domain-art__traffic-wire b-domain-art__wire" viewBox="0 0 32 32" focusable="false"><path pathLength="1" d="M0 16C10 5 22 5 32 16" /></svg>
        <div class="b-domain-art__edge b-domain-art__destination">
          <img v-if="secure" :src="require('@selldone/components-vue/assets/selldone-logo/selldone.svg')" alt="" width="28" height="28" />
          <img v-else :src="require('@selldone/components-vue/assets/trademark/cloudflare.svg')" alt="" width="32" height="26" />
          <strong>{{ secure ? 'Selldone' : $t('domains_modern.connection.illustration.yourCdn') }}</strong>
          <span class="b-domain-art__ssl"><svg class="sd-modern-illustration__icon" width="15" height="15" viewBox="0 0 24 24" focusable="false"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3" /></svg>{{ $t('domains_modern.connection.illustration.sslCdn') }}</span>
          <small v-if="secure">{{ $t('domains_modern.connection.illustration.managedCertificate') }}</small>
          <small v-else>Cloudflare</small>
        </div>
        <svg class="b-domain-art__traffic-wire b-domain-art__wire b-domain-art__wire--late" viewBox="0 0 32 32" focusable="false"><path pathLength="1" d="M0 16C10 27 22 27 32 16" /></svg>
        <div class="b-domain-art__traffic-node b-domain-art__destination b-domain-art__destination--last">
          <img :src="require('@selldone/components-vue/assets/selldone-logo/selldone.svg')" alt="" width="27" height="27" />
          <strong>Selldone</strong>
          <span>{{ $t('domains_modern.connection.illustration.storefront') }}</span>
        </div>
      </div>
    </div>
  </figure>
</template>

<script lang="ts">
export default {
  name: 'BDomainSetupIllustration',
  props: {
    kind: { type: String, default: 'hosting' },
    external: { type: Boolean, default: false },
    secure: { type: Boolean, default: false },
  },
  computed: {
    variant() {
      return this.kind === 'connection' ? (this.secure ? 'secure' : 'direct') : (this.external ? 'external' : 'hosted');
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-art {
  margin: 16px 0 0;
  min-width: 0;
  container-type: inline-size;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: var(--sd-modern-font-small, 13px);
  line-height: 21px;

  &__caption { margin: 0; }
  &__label { display: block; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; margin-bottom: 3px; }
  &__caption > strong { display: block; font-size: 13px; font-weight: 500; line-height: 21px; }
  &__caption p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; font-weight: 400; line-height: 21px; }
  &__stage { margin-top: 13px; padding: 18px; background: var(--sd-modern-inset); border-radius: 14px; pointer-events: none; }
  &__stage strong { font-size: 12px; font-weight: 500; line-height: 19px; }
  &__stage img { object-fit: contain; flex: 0 0 auto; }
  &__hosting { display: grid; grid-template-columns: minmax(0,1fr) 56px minmax(0,1fr); align-items: center; max-width: 500px; margin-inline: auto; }
  &__layouts, &__destinations { display: grid; gap: 10px; min-width: 0; }
  &__layout, &__code, &__hosted, &__host-choice, &__traffic-node, &__edge { position: relative; z-index: 1; min-width: 0; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); }
  &__layout { border-radius: 14px; padding: 9px 12px; }
  &__layout > span { font-size: 11px; line-height: 18px; }
  &__browser-bar { display: flex; align-items: center; gap: 3px; min-height: 7px; margin-bottom: 7px; }
  &__browser-bar > i { width: 3px; height: 3px; border-radius: 50%; background: rgba(var(--v-theme-on-surface), .2); }
  &__browser-bar code { margin-inline-start: auto; background: transparent; color: var(--sd-modern-muted); font-size: 10px; line-height: 16px; }
  &__layout-preview { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 4px; margin-top: 6px; }
  &__layout-preview > i { height: 16px; border-radius: 3px; background: rgba(var(--sd-modern-illustration-accent-rgb), .13); }
  &__layout-preview--custom { grid-template-columns: 2fr 1fr; }
  &__layout-preview--custom > i:first-child { grid-row: span 2; height: auto; }
  &__layout-preview--custom > i:not(:first-child) { height: 6px; background: rgba(var(--sd-modern-illustration-highlight-rgb), .18); }
  &__hosting-wire { width: 100%; height: 166px; }
  &__hosting-wire--narrow { display: none; }
  &__wire { overflow: visible; fill: none; color: rgba(var(--sd-modern-illustration-accent-rgb), .65); }
  &__wire path { stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; vector-effect: non-scaling-stroke; stroke-dasharray: 1; animation: domain-art-route 1.2s ease .35s both; }
  &__hosted { display: flex; flex-direction: column; align-items: center; gap: 10px; border-radius: 18px; padding: 17px 12px; text-align: center; }
  &__hosted > strong { max-width: 100%; overflow-wrap: anywhere; }
  &__store-preview { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 5px; width: 80%; }
  &__store-preview > i { height: 24px; border-radius: 4px; background: rgba(var(--sd-modern-illustration-accent-rgb), .13); }
  &__result { display: flex; align-items: center; justify-content: center; gap: 5px; max-width: 100%; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); animation: domain-art-reveal .5s ease 1.9s both; }
  &__result .sd-modern-illustration__icon { flex: 0 0 auto; color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__code { padding: 12px; border-radius: 18px; }
  &__code > strong { display: block; margin-block: 7px; }
  &__code-icon { color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__code-lines { display: grid; gap: 6px; margin-block: 10px 14px; }
  &__code-lines > i { width: 78%; height: 3px; border-radius: 2px; background: rgba(var(--sd-modern-illustration-accent-rgb), .2); }
  &__code-lines > i:nth-child(2) { width: 93%; margin-inline-start: 7%; }
  &__code-lines > i:nth-child(3) { width: 62%; }
  &__deploy { display: flex; justify-content: center; align-items: center; gap: 8px; width: max-content; max-width: 100%; padding: 5px 11px; border-radius: 9px; font-size: 11px; line-height: 18px; }
  &__host-choice { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 12px 10px; border-radius: 14px; text-align: center; min-height: 77px; }
  &__host-choice > .sd-modern-illustration__icon { color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__traffic { display: grid; grid-template-columns: minmax(0,1fr) 32px minmax(0,1.25fr) 32px minmax(0,1fr); align-items: center; max-width: 500px; margin-inline: auto; }
  &__traffic-node, &__edge { display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 7px; min-height: 118px; padding: 14px 9px; border-radius: 14px; text-align: center; overflow-wrap: anywhere; }
  &__traffic-node > span, &__edge > small { color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__domain-icon { color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__traffic-wire { width: 100%; height: 32px; }
  &__ssl { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px; font-size: 11px; line-height: 18px; }
  &__ssl .sd-modern-illustration__icon { color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__source { animation: domain-art-reveal .45s ease both; }
  &__destination { animation: domain-art-reveal .7s ease 1.05s both; }
  &__destination--last { animation-delay: 1.6s; }
  &__wire--late path { animation-delay: 1s; }
  &:dir(rtl) &__hosting-wire, &:dir(rtl) &__traffic-wire { transform: scaleX(-1); }

  @container (max-width: 420px) {
    &__stage { padding: 14px; }
    &__hosting { grid-template-columns: minmax(0,1fr); }
    &__layouts, &__destinations { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 9px; }
    &__layout { padding-inline: 9px; }
    &__hosting-wire { display: none; }
    &__hosting-wire--narrow { display: block; width: 100%; height: 42px; }
    &__hosted { padding-block: 14px; }
    &__store-preview { max-width: 150px; }
    &__traffic { grid-template-columns: minmax(0,1fr) 20px minmax(0,1.2fr) 20px minmax(0,1fr); }
    &__traffic-node, &__edge { padding: 12px 5px; min-height: 128px; }
    &__stage strong { font-size: 11px; line-height: 18px; }
  }
  @media (prefers-reduced-motion: reduce) {
    &__source, &__destination, &__result, &__wire path { animation: none; opacity: 1; transform: none; stroke-dashoffset: 0; }
  }
}
@keyframes domain-art-reveal { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@keyframes domain-art-route { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
</style>

<template>
  <figure class="sd-modern-illustration b-domain-search-art text-start">
    <figcaption class="b-domain-search-art__caption">
      <div class="b-domain-search-art__caption-meta">
        <span>{{ $t('domains_modern.workspace.indexingIllustration.label') }}</span>
        <span v-if="!unavailable" class="b-domain-search-art__preference">{{ $t(`domains_modern.workspace.indexingIllustration.${pending ? 'draftLabel' : 'savedLabel'}`) }}</span>
      </div>
      <strong>{{ $t(`domains_modern.workspace.indexingIllustration.${allowed ? 'enabledTitle' : 'disabledTitle'}`) }}</strong>
      <p>{{ $t(`domains_modern.workspace.indexingIllustration.${allowed ? 'enabledDescription' : 'disabledDescription'}`) }}</p>
    </figcaption>

    <!-- This depicts an indexing preference, never a live crawler or search result. -->
    <div :key="allowed" class="b-domain-search-art__stage" :class="{ 'b-domain-search-art__stage--excluded': !allowed, 'b-domain-search-art__stage--complete': animationComplete }" aria-hidden="true">
      <div class="b-domain-search-art__scene">
        <div class="b-domain-search-art__engine b-domain-search-art__source">
          <div class="b-domain-search-art__google">
            <img :src="require('@selldone/components-vue/assets/trademark/google.svg')" alt="" width="27" height="27" />
            <span>Google</span>
          </div>
          <strong>{{ $t('domains_modern.workspace.indexingIllustration.crawler') }}</strong>
          <div class="b-domain-search-art__query">
            <svg class="sd-modern-illustration__icon" width="15" height="15" viewBox="0 0 24 24" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
            <i />
          </div>
          <span class="b-domain-search-art__engine-caption">{{ $t('domains_modern.workspace.indexingIllustration.searchResults') }}</span>
        </div>

        <div class="b-domain-search-art__bridge">
          <svg class="b-domain-search-art__wire b-domain-search-art__wire--wide" viewBox="0 0 90 80" preserveAspectRatio="none" focusable="false">
            <path v-if="allowed" pathLength="1" d="M0 40C20 40 20 20 45 20S70 40 90 40" />
            <path v-else pathLength="1" d="M0 40C15 40 20 20 29 20M61 20C70 20 75 40 90 40" />
          </svg>
          <svg class="b-domain-search-art__wire b-domain-search-art__wire--narrow" viewBox="0 0 80 76" preserveAspectRatio="none" focusable="false">
            <path v-if="allowed" pathLength="1" d="M40 0C40 18 24 20 24 38S40 58 40 76" />
            <path v-else pathLength="1" d="M40 0C40 15 24 18 24 22M24 54C24 58 40 61 40 76" />
          </svg>
          <span class="b-domain-search-art__gate">
            <svg v-if="allowed" class="sd-modern-illustration__icon" width="20" height="20" viewBox="0 0 24 24" focusable="false"><path d="m5 12 4 4L19 6" /></svg>
            <svg v-else class="sd-modern-illustration__icon" width="20" height="20" viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="9" /><path d="m6 6 12 12" /></svg>
          </span>
          <span class="b-domain-search-art__gate-label">{{ $t(`domains_modern.workspace.indexingIllustration.${allowed ? 'allowed' : 'excluded'}`) }}</span>
        </div>

        <div class="b-domain-search-art__store b-domain-search-art__destination" @animationend.self="animationComplete = true">
          <div class="b-domain-search-art__browser-bar"><i /><i /><i /><span dir="ltr">shop.example</span></div>
          <div class="b-domain-search-art__store-heading">
            <svg class="sd-modern-illustration__icon" width="20" height="20" viewBox="0 0 24 24" focusable="false"><path d="M3 10h18l-2-6H5l-2 6Zm1 0v10h16V10M9 20v-6h6v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></svg>
            <strong>{{ $t('domains_modern.workspace.indexingIllustration.storefront') }}</strong>
          </div>
          <div class="b-domain-search-art__products"><i /><i /><i /></div>
          <div class="b-domain-search-art__pages">
            <svg class="sd-modern-illustration__icon" width="15" height="15" viewBox="0 0 24 24" focusable="false"><path d="M8 3h8l4 4v14H8V3Zm8 0v5h4M4 7v14M11 12h6M11 16h6" /></svg>
            <span>{{ $t('domains_modern.workspace.indexingIllustration.pages') }}</span>
          </div>
        </div>
      </div>
    </div>
    <p class="b-domain-search-art__note">{{ $t(`domains_modern.workspace.indexingIllustration.${unavailable ? 'unavailableCaption' : pending ? 'draftCaption' : 'savedCaption'}`) }}</p>
  </figure>
</template>

<script lang="ts">
export default {
  name: 'BDomainSearchIllustration',
  props: {
    indexed: { type: Boolean, default: false },
    pending: { type: Boolean, default: false },
    unavailable: { type: Boolean, default: false },
  },
  data: () => ({ animationComplete: false }),
  computed: {
    allowed() {
      return this.indexed && !this.unavailable;
    },
  },
  watch: {
    allowed() {
      this.animationComplete = false;
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-search-art {
  min-width: 0;
  margin: 0;
  container-type: inline-size;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: var(--sd-modern-font-small, 13px);
  line-height: 21px;

  &__caption-meta { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; margin-bottom: 5px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__preference { font-size: 12px; }
  &__caption > strong { display: block; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__caption > p, &__note { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small, 13px); line-height: 21px; }
  &__stage { margin-top: 16px; padding: 24px 16px; border-radius: 14px; background: var(--sd-modern-inset); pointer-events: none; }
  &__scene { display: grid; grid-template-columns: minmax(0,1fr) 80px minmax(0,1.1fr); align-items: center; max-width: 510px; margin-inline: auto; }
  &__engine, &__store { min-width: 0; position: relative; z-index: 1; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); }
  &__engine { padding: 16px 12px; border-radius: 18px; text-align: center; }
  &__google { display: flex; justify-content: center; align-items: center; gap: 7px; margin-bottom: 9px; font-size: 13px; line-height: 21px; }
  &__google img { flex: 0 0 auto; object-fit: contain; }
  &__engine > strong, &__store-heading > strong { display: block; font-size: 12px; font-weight: 500; line-height: 19px; overflow-wrap: anywhere; }
  &__query { display: flex; align-items: center; gap: 7px; margin-top: 13px; padding: 7px; border-radius: 7px; background: var(--sd-modern-inset); color: var(--sd-modern-muted); }
  &__query > i { flex: 1; height: 3px; border-radius: 3px; background: rgba(var(--v-theme-on-surface), .16); }
  &__engine-caption { display: block; margin-top: 6px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__bridge { position: relative; align-self: stretch; min-height: 148px; }
  &__wire { position: absolute; inset-inline: 0; inset-block-start: calc(50% - 40px); width: 100%; height: 80px; fill: none; color: rgba(var(--sd-modern-illustration-accent-rgb), .65); }
  &__wire path { stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; vector-effect: non-scaling-stroke; stroke-dasharray: 1; animation: domain-search-route .85s ease .35s both; }
  &__wire--narrow { display: none; }
  &__gate { position: absolute; z-index: 1; inset-inline-start: calc(50% - 16px); inset-block-start: calc(50% - 36px); display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: rgb(var(--v-theme-surface)); border: 1px solid rgba(var(--sd-modern-illustration-accent-rgb), .3); color: rgb(var(--sd-modern-illustration-accent-rgb)); animation: domain-search-reveal .4s ease .85s both; }
  &__gate-label { position: absolute; inset-inline: 3px; inset-block-start: calc(50% + 7px); text-align: center; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; overflow-wrap: anywhere; animation: domain-search-reveal .4s ease .85s both; }
  &__stage--excluded &__wire { color: rgba(var(--v-theme-on-surface), .24); }
  &__stage--excluded &__gate { border-color: var(--sd-modern-border); color: rgb(var(--v-theme-on-surface)); }
  &__store { padding: 11px 12px 13px; border-radius: 14px; }
  &__browser-bar { display: flex; align-items: center; gap: 3px; margin-bottom: 12px; }
  &__browser-bar > i { width: 3px; height: 3px; flex: 0 0 auto; border-radius: 50%; background: rgba(var(--v-theme-on-surface), .22); }
  &__browser-bar > span { margin-inline-start: auto; min-width: 0; overflow-wrap: anywhere; color: var(--sd-modern-muted); font-size: 9px; line-height: 15px; }
  &__store-heading { display: flex; align-items: center; gap: 7px; }
  &__store-heading > svg { color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__products { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 5px; margin-block: 13px; }
  &__products > i { height: 30px; border-radius: 4px; background: rgba(var(--sd-modern-illustration-accent-rgb), .13); }
  &__products > i:nth-child(2) { background: rgba(var(--sd-modern-illustration-highlight-rgb), .16); }
  &__pages { display: flex; align-items: center; gap: 6px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__note { margin-top: 12px; }
  &__source { animation: domain-search-reveal .45s ease both; }
  &__destination { animation: domain-search-reveal .5s ease 1.15s both; }
  &__stage--complete &__source, &__stage--complete &__destination, &__stage--complete &__gate, &__stage--complete &__gate-label, &__stage--complete &__wire path { animation: none; opacity: 1; translate: 0 0; stroke-dashoffset: 0; }
  &:dir(rtl) &__wire--wide { transform: scaleX(-1); }

  @container (max-width: 370px) {
    &__stage { padding: 18px; }
    &__scene { grid-template-columns: minmax(0,1fr); max-width: 270px; }
    &__engine { display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 7px 12px; text-align: start; padding: 13px 15px; }
    &__google { grid-row: span 2; flex-direction: column; gap: 3px; margin: 0; }
    &__query { margin: 0; }
    &__engine-caption { display: none; }
    &__bridge { min-height: 76px; }
    &__wire--wide { display: none; }
    &__wire--narrow { display: block; width: 80px; height: 76px; inset-inline-start: calc(50% - 40px); inset-block-start: 0; }
    &__gate { inset-inline-start: calc(50% - 32px); inset-block-start: 22px; }
    &__gate-label { inset-inline-start: calc(50% + 13px); inset-inline-end: 0; inset-block-start: 20px; text-align: start; }
    &__store { padding: 12px 15px; }
    &__products { margin-block: 10px; }
    &__products > i { height: 35px; }
    &:dir(rtl) &__wire--narrow { transform: scaleX(-1); }
  }
  @media (prefers-reduced-motion: reduce) {
    &__source, &__destination, &__gate, &__gate-label, &__wire path { animation: none; opacity: 1; transform: none; stroke-dashoffset: 0; }
  }
}
@keyframes domain-search-reveal { from { opacity: 0; translate: 0 4px; } to { opacity: 1; translate: 0 0; } }
@keyframes domain-search-route { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
</style>

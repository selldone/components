<template>
  <div class="sd-modern-illustration b-domain-customer-preview" :class="{ 'b-domain-customer-preview--complete': complete }" :data-kind="mode" aria-hidden="true">
    <div class="b-domain-customer-preview__scene" @animationend.self="complete = true">
      <template v-if="mode === 'shop'">
        <div class="b-domain-customer-preview__collection">
          <div><span>{{ $t('domains_modern.workspace.previewArt.collection') }}</span><strong>{{ $t('domains_modern.workspace.previewArt.explore') }}</strong></div>
          <svg class="b-domain-customer-preview__collection-drawing" viewBox="0 0 100 70" focusable="false"><path class="b-domain-customer-preview__sand" d="M20 60V27a25 25 0 0 1 50 0v33Z" /><path class="b-domain-customer-preview__sage" d="m50 60 8-31h23l8 31Z" /><path d="M65 31v-9a5 5 0 0 1 10 0v9M10 61h84" /></svg>
        </div>
        <div class="b-domain-customer-preview__categories"><span>{{ $t('domains_modern.workspace.previewArt.categories') }}</span><i /><i /><i /><i /></div>
        <div class="b-domain-customer-preview__products">
          <div v-for="product in ['bag', 'lamp', 'headphones']" :key="product" class="b-domain-customer-preview__product b-domain-customer-preview__detail">
            <div class="b-domain-customer-preview__product-image">
              <svg v-if="product === 'bag'" viewBox="0 0 64 72" focusable="false"><path class="b-domain-customer-preview__sand" d="m15 26-4 35a4 4 0 0 0 4 4h34a4 4 0 0 0 4-4l-4-35Z" /><path d="M23 29V19a9 9 0 0 1 18 0v10M19 34v20M45 34v20" /><path class="b-domain-customer-preview__stitch" d="M18 59h28" /></svg>
              <svg v-else-if="product === 'lamp'" viewBox="0 0 64 72" focusable="false"><path class="b-domain-customer-preview__rose" d="m23 12-10 25h38L41 12Z" /><path d="M32 37v25M20 64h24M25 67h14M47 38v9" /><path class="b-domain-customer-preview__stitch" d="M24 19h16" /></svg>
              <svg v-else viewBox="0 0 64 72" focusable="false"><path d="M14 37v-9a18 18 0 0 1 36 0v9M20 34v-6a12 12 0 0 1 24 0v6" /><rect class="b-domain-customer-preview__sage" x="9" y="34" width="13" height="25" rx="6" /><rect class="b-domain-customer-preview__sage" x="42" y="34" width="13" height="25" rx="6" /><path d="M14 42v9M50 42v9" /></svg>
            </div>
            <i class="b-domain-customer-preview__title-line" /><i class="b-domain-customer-preview__price-line" />
          </div>
        </div>
      </template>

      <template v-else-if="mode === 'blog'">
        <div class="b-domain-customer-preview__section-title"><strong>{{ $t('domains_modern.workspace.previewArt.journal') }}</strong><span>01 — 03</span></div>
        <div class="b-domain-customer-preview__editorial b-domain-customer-preview__detail">
          <svg class="b-domain-customer-preview__landscape" viewBox="0 0 280 96" preserveAspectRatio="xMidYMid slice" focusable="false"><rect class="b-domain-customer-preview__sage" width="280" height="96" /><circle class="b-domain-customer-preview__sand" cx="209" cy="28" r="16" /><path class="b-domain-customer-preview__hill" d="M0 73 71 25l69 55 37-32 103 48H0Z" /><path class="b-domain-customer-preview__hill-front" d="m0 96 101-41 74 27 105-23v37Z" /></svg>
          <strong>{{ $t('domains_modern.workspace.previewArt.story') }}</strong><div class="b-domain-customer-preview__copy-lines"><i /><i /></div>
        </div>
        <div class="b-domain-customer-preview__article-list b-domain-customer-preview__detail"><div v-for="article in 2" :key="article"><span>{{ article === 1 ? '01' : '02' }}</span><div class="b-domain-customer-preview__copy-lines"><i /><i /></div><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" width="14" height="14" focusable="false"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></div></div>
      </template>

      <template v-else-if="mode === 'community'">
        <div class="b-domain-customer-preview__section-title"><strong>{{ $t('domains_modern.workspace.previewArt.discussion') }}</strong><span class="b-domain-customer-preview__member-dots"><i /><i /><i /></span></div>
        <div class="b-domain-customer-preview__discussions">
          <div v-for="thread in 3" :key="thread" class="b-domain-customer-preview__thread b-domain-customer-preview__detail">
            <svg class="b-domain-customer-preview__avatar" viewBox="0 0 36 36" width="30" height="30" focusable="false"><circle :class="thread === 2 ? 'b-domain-customer-preview__sage' : 'b-domain-customer-preview__sand'" cx="18" cy="18" r="18" /><circle cx="18" cy="13" r="5" /><path d="M7 31a11 11 0 0 1 22 0" /></svg>
            <div class="b-domain-customer-preview__message"><div class="b-domain-customer-preview__copy-lines"><i /><i /></div><span class="b-domain-customer-preview__replies"><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" width="12" height="12" focusable="false"><path d="M20 14a3 3 0 0 1-3 3H9l-5 4V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z" /></svg><i /><i /></span></div>
          </div>
        </div>
      </template>

      <template v-else-if="mode === 'map'">
        <div class="b-domain-customer-preview__section-title"><strong>{{ $t('domains_modern.workspace.previewArt.nearby') }}</strong><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" width="17" height="17" focusable="false"><circle cx="12" cy="12" r="7" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg></div>
        <div class="b-domain-customer-preview__map b-domain-customer-preview__detail">
          <svg viewBox="0 0 280 176" preserveAspectRatio="xMidYMid slice" focusable="false"><rect class="b-domain-customer-preview__map-ground" width="280" height="176" /><path class="b-domain-customer-preview__park" d="M184 4h69l20 39-30 32-67-16ZM8 113l42-17 44 31-6 45H8Z" /><path class="b-domain-customer-preview__road-edge" d="m-10 57 100 29 94-49 107 41M77-10l32 83-7 113M200 58l-11 128" /><path class="b-domain-customer-preview__road" d="m-10 57 100 29 94-49 107 41M77-10l32 83-7 113M200 58l-11 128" /><g v-for="[x,y] in [[61,48],[155,109],[224,36]]" :key="x" :transform="`translate(${x} ${y})`"><path class="b-domain-customer-preview__pin" d="M0 20s-11-12-11-19a11 11 0 0 1 22 0C11 8 0 20 0 20Z" /><circle cx="0" cy="1" r="4" /></g></svg>
          <span class="sd-modern-illustration__action b-domain-customer-preview__map-action">{{ $t('domains_modern.workspace.previewArt.explore') }}</span>
        </div>
      </template>

      <template v-else-if="mode === 'avocado'">
        <div class="b-domain-customer-preview__request b-domain-customer-preview__detail">
          <div class="b-domain-customer-preview__section-title"><strong>{{ $t('domains_modern.workspace.previewArt.products') }}</strong><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" width="19" height="19" focusable="false"><path d="M5 3h14v18H5V3Zm4 5h6m-6 4h6m-6 4h3" /></svg></div>
          <div class="b-domain-customer-preview__request-field"><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" width="17" height="17" focusable="false"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8m-9 5v9" /></svg><i /></div>
          <div class="b-domain-customer-preview__request-details"><div class="b-domain-customer-preview__copy-lines"><i /><i /><i /></div></div>
          <span class="sd-modern-illustration__action b-domain-customer-preview__action">{{ $t('global.actions.send') }}<svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" width="14" height="14" focusable="false"><path d="m4 4 17 8-17 8 4-8-4-8Zm4 8h13" /></svg></span>
        </div>
      </template>

      <template v-else-if="mode === 'hyper'">
        <div class="b-domain-customer-preview__section-title"><strong>{{ $t('domains_modern.workspace.previewArt.order') }}</strong><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" width="18" height="18" focusable="false"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" /></svg></div>
        <div class="b-domain-customer-preview__order-list"><div v-for="item in 3" :key="item" class="b-domain-customer-preview__order-item b-domain-customer-preview__detail"><span class="b-domain-customer-preview__order-product"><svg viewBox="0 0 32 32" width="27" height="27" focusable="false"><path :class="item === 2 ? 'b-domain-customer-preview__sage' : 'b-domain-customer-preview__sand'" d="m8 11-2 16h20l-2-16ZM12 11V7a4 4 0 0 1 8 0v4" /></svg></span><div class="b-domain-customer-preview__copy-lines"><i /><i /></div><span class="b-domain-customer-preview__quantity">−<b>{{ item === 2 ? '2' : '1' }}</b>+</span></div></div>
        <div class="b-domain-customer-preview__total"><span>{{ $t('domains_modern.workspace.previewArt.total') }}</span><i class="b-domain-customer-preview__price-line" /></div>
        <span class="sd-modern-illustration__action b-domain-customer-preview__action">{{ $t('domains_modern.workspace.previewArt.order') }}</span>
      </template>

      <template v-else>
        <div class="b-domain-customer-preview__page-hero b-domain-customer-preview__detail" :class="{ 'b-domain-customer-preview__page-hero--landing': mode === 'landing' }">
          <div><span>{{ $t(`domains_modern.workspace.previewArt.${mode === 'landing' ? 'collection' : 'custom'}`) }}</span><strong>{{ $t(`domains_modern.workspace.previewArt.${mode === 'external' ? 'code' : 'story'}`) }}</strong><div class="b-domain-customer-preview__copy-lines"><i /><i /></div><span v-if="mode === 'landing'" class="sd-modern-illustration__action b-domain-customer-preview__action">{{ $t('domains_modern.workspace.previewArt.explore') }}</span></div>
          <svg v-if="mode === 'landing'" class="b-domain-customer-preview__page-art" viewBox="0 0 80 100" focusable="false"><path class="b-domain-customer-preview__sand" d="M10 90V35a30 30 0 0 1 60 0v55Z" /><circle class="b-domain-customer-preview__sage" cx="49" cy="62" r="21" /><path d="M6 91h68M39 63h21M49 52v21" /></svg>
          <svg v-else class="sd-modern-illustration__icon b-domain-customer-preview__page-art" viewBox="0 0 24 24" focusable="false"><path v-if="mode === 'external'" d="m8 6-6 6 6 6m8-12 6 6-6 6m-5 2 2-16" /><path v-else d="M6 2h9l5 5v15H6V2Zm9 0v6h5M10 12h6m-6 4h6" /></svg>
        </div>
        <div class="b-domain-customer-preview__page-content b-domain-customer-preview__detail"><div class="b-domain-customer-preview__copy-lines"><i /><i /><i /></div><div class="b-domain-customer-preview__page-tile"><i /><i /><i /></div></div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BDomainCustomerPreview',
  props: { kind: { type: String, default: 'shop' } },
  data: () => ({ complete: false }),
  computed: {
    mode() {
      return ['shop', 'blog', 'community', 'map', 'avocado', 'hyper', 'landing', 'static', 'external'].includes(this.kind) ? this.kind : 'shop';
    },
  },
};
</script>

<style scoped lang="scss">
.b-domain-customer-preview {
  --preview-sand: 196, 153, 112;
  --preview-sage: 121, 151, 133;
  min-width: 0;
  width: 100%;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-size: 11px;
  line-height: 17px;
  pointer-events: none;
  user-select: none;

  &__scene { min-width: 0; animation: customer-preview-scene .85s ease both; }
  &__scene > * + * { margin-block-start: 10px; }
  &__scene svg:not(.sd-modern-illustration__icon) { display: block; fill: none; stroke: rgba(var(--v-theme-on-surface), .64); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  &__scene strong { font-size: 12px; font-weight: 500; line-height: 18px; overflow-wrap: anywhere; }
  &__sand { fill: rgba(var(--preview-sand), .55); stroke: none; }
  &__sage { fill: rgba(var(--preview-sage), .55); stroke: none; }
  &__rose { fill: rgba(var(--sd-modern-illustration-highlight-rgb), .45); stroke: none; }
  &__stitch { opacity: .45; }
  &__collection { display: grid; grid-template-columns: minmax(0,1fr) clamp(45px,30%,90px); align-items: center; gap: 8px; min-height: 78px; padding: 10px 12px; border-radius: 14px; background: rgba(var(--preview-sand), .13); }
  &__collection > div > span, &__page-hero > div > span:first-child { display: block; margin-bottom: 3px; color: var(--sd-modern-muted); font-size: 10px; }
  &__collection-drawing { width: 100%; height: auto; max-height: 63px; }
  &__categories { display: flex; align-items: center; gap: 7px; color: var(--sd-modern-muted); font-size: 10px; line-height: 17px; }
  &__categories > span { margin-inline-end: auto; }
  &__categories > i { width: 17px; height: 17px; border-radius: 50%; border: 4px solid rgb(var(--v-theme-surface)); background: rgba(var(--preview-sage), .45); outline: 1px solid var(--sd-modern-border); }
  &__categories > i:nth-child(3) { background: rgba(var(--preview-sand), .55); }
  &__categories > i:nth-child(4) { background: rgba(var(--sd-modern-illustration-accent-rgb), .25); }
  &__products { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7px; }
  &__product { min-width: 0; padding: 5px 5px 8px; border: 1px solid var(--sd-modern-border); border-radius: 10px; background: rgb(var(--v-theme-surface)); }
  &__product-image { display: grid; place-items: center; height: 76px; margin-bottom: 8px; border-radius: 7px; background: var(--sd-modern-inset); }
  &__product-image svg { width: 56px; height: 66px; max-width: 100%; }
  &__title-line, &__price-line { display: block; width: 80%; height: 3px; margin-inline: 2px; border-radius: 2px; background: rgba(var(--v-theme-on-surface), .4); }
  &__price-line { width: 35%; height: 3px; margin-top: 6px; background: rgba(var(--v-theme-on-surface), .22); }
  &__section-title { display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 22px; }
  &__section-title > span { color: var(--sd-modern-muted); font-size: 9px; }
  &__copy-lines { display: grid; gap: 5px; width: 100%; min-width: 0; }
  &__copy-lines > i { display: block; height: 3px; width: 94%; border-radius: 2px; background: rgba(var(--v-theme-on-surface), .23); }
  &__copy-lines > i:first-child { width: 75%; background: rgba(var(--v-theme-on-surface), .4); }
  &__copy-lines > i:last-child { width: 58%; }
  &__editorial { padding-bottom: 10px; border-bottom: 1px solid var(--sd-modern-border); }
  &__landscape { width: 100%; height: 84px; margin-bottom: 8px; border-radius: 10px; overflow: hidden; }
  &__landscape > * { stroke: none; }
  &__hill { fill: rgba(var(--preview-sage), .75); }
  &__hill-front { fill: rgba(var(--v-theme-on-surface), .18); }
  &__editorial .b-domain-customer-preview__copy-lines { margin-top: 7px; }
  &__article-list { display: grid; gap: 11px; }
  &__article-list > div { display: flex; align-items: center; gap: 9px; min-height: 22px; }
  &__article-list > div > span { font-size: 10px; color: var(--sd-modern-muted); }
  &__member-dots { display: flex; padding-inline-end: 3px; }
  &__member-dots > i { width: 17px; height: 17px; border: 2px solid rgb(var(--v-theme-surface)); border-radius: 50%; background: rgba(var(--preview-sage), .5); margin-inline-end: -3px; }
  &__member-dots > i:nth-child(2) { background: rgba(var(--preview-sand), .6); }
  &__discussions { display: grid; gap: 10px; }
  &__thread { display: flex; align-items: flex-start; gap: 9px; padding: 11px 10px; border-radius: 14px; border: 1px solid var(--sd-modern-border); background: rgb(var(--v-theme-surface)); }
  &__avatar { flex: 0 0 auto; }
  &__avatar > circle:not(:first-child), &__avatar > path { fill: rgba(var(--v-theme-on-surface), .33); stroke: none; }
  &__message { flex: 1; min-width: 0; padding-top: 2px; }
  &__replies { display: flex; align-items: center; gap: 4px; margin-top: 8px; color: var(--sd-modern-muted); }
  &__replies > i { width: 12px; height: 2px; border-radius: 2px; background: rgba(var(--v-theme-on-surface), .23); }
  &__map { position: relative; border-radius: 12px; overflow: hidden; }
  &__map > svg { width: 100%; height: auto; }
  &__map-ground { fill: var(--sd-modern-inset); stroke: none; }
  &__park { fill: rgba(var(--preview-sage), .23); stroke: none; }
  &__road-edge { stroke: rgba(var(--v-theme-on-surface), .12); stroke-width: 15px; }
  &__road { stroke: rgb(var(--v-theme-surface)); stroke-width: 11px; }
  &__pin { fill: rgb(var(--sd-modern-illustration-accent-rgb)); stroke: rgb(var(--v-theme-surface)); }
  &__map g > circle { fill: rgb(var(--v-theme-surface)); stroke: none; }
  &__map-action { position: absolute; inset-inline-end: 10px; inset-block-end: 10px; padding: 5px 10px; border-radius: 9px; }
  &__request { padding: 13px; border-radius: 18px; border: 1px solid var(--sd-modern-border); background: rgb(var(--v-theme-surface)); }
  &__request-field { display: flex; align-items: center; gap: 8px; padding: 10px; margin-block: 13px 9px; border-radius: 7px; background: var(--sd-modern-inset); color: var(--sd-modern-muted); }
  &__request-field > i { width: 63%; height: 3px; border-radius: 2px; background: rgba(var(--v-theme-on-surface), .28); }
  &__request-details { min-height: 69px; padding: 12px 10px; border: 1px solid var(--sd-modern-border); border-radius: 7px; }
  &__request-details .b-domain-customer-preview__copy-lines { gap: 8px; }
  &__action { display: flex; align-items: center; justify-content: center; gap: 7px; padding: 6px 11px; margin-top: 12px; border-radius: 9px; width: max-content; max-width: 100%; font-size: 10px; line-height: 17px; overflow-wrap: anywhere; }
  &__order-list { display: grid; gap: 0; }
  &__order-item { display: flex; align-items: center; gap: 8px; padding-block: 8px; border-bottom: 1px solid var(--sd-modern-border); }
  &__order-product { display: grid; place-items: center; width: 39px; height: 39px; flex: 0 0 auto; border-radius: 8px; background: var(--sd-modern-inset); }
  &__quantity { display: flex; align-items: center; gap: 7px; color: var(--sd-modern-muted); font-size: 11px; }
  &__quantity > b { font-weight: 400; color: rgb(var(--v-theme-on-surface)); }
  &__total { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  &__total .b-domain-customer-preview__price-line { max-width: 35px; margin: 0; }
  &__page-hero { display: grid; grid-template-columns: minmax(0,1fr) clamp(32px,28%,72px); align-items: center; gap: 13px; min-height: 133px; padding: 14px; border-radius: 14px; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); }
  &__page-hero--landing { background: rgba(var(--preview-sand), .12); }
  &__page-hero .b-domain-customer-preview__copy-lines { margin-top: 10px; }
  &__page-art { width: 100%; height: 92px; color: rgba(var(--sd-modern-illustration-accent-rgb), .55); }
  &__page-content { display: grid; grid-template-columns: minmax(0,1.1fr) minmax(0,1fr); align-items: center; gap: 15px; padding: 6px 2px 3px; }
  &__page-content .b-domain-customer-preview__copy-lines { gap: 8px; }
  &__page-tile { display: flex; align-items: flex-end; justify-content: center; gap: 5px; height: 50px; padding: 8px; border-radius: 8px; background: rgba(var(--preview-sage), .14); }
  &__page-tile > i { width: 13px; height: 21px; border-radius: 3px; background: rgba(var(--preview-sage), .4); }
  &__page-tile > i:nth-child(2) { height: 32px; background: rgba(var(--preview-sand), .5); }
  &__detail { animation: customer-preview-detail .45s ease .12s both; }
  &__detail:nth-child(2) { animation-delay: .22s; }
  &__detail:nth-child(3) { animation-delay: .32s; }
  &--complete &__scene, &--complete &__detail { animation: none; opacity: 1; translate: 0 0; }
  &:dir(rtl) &__article-list .sd-modern-illustration__icon, &:dir(rtl) &__request .b-domain-customer-preview__action .sd-modern-illustration__icon { transform: scaleX(-1); }
  @media (prefers-reduced-motion: reduce) {
    &__scene, &__detail { animation: none; opacity: 1; translate: 0 0; }
  }
}
@keyframes customer-preview-scene { from { opacity: .3; translate: 0 4px; } to { opacity: 1; translate: 0 0; } }
@keyframes customer-preview-detail { from { opacity: 0; translate: 0 3px; } to { opacity: 1; translate: 0 0; } }
</style>

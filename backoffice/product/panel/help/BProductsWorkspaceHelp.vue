<template>
  <v-dialog
    :model-value="modelValue"
    :aria-labelledby="`${$.uid}-catalog-help-title`"
    fullscreen
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #activator="{ props }">
      <slot name="activator" :props="props" />
    </template>
    <v-card class="b-products-help sd-modern-canvas text-start" :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'">
      <header class="b-products-help__header">
        <div class="b-products-help__header-inner">
          <v-icon size="24" aria-hidden="true">tips_and_updates</v-icon>
          <h1 :id="`${$.uid}-catalog-help-title`">{{ $t('product_panel.workspace.help.title') }}</h1>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button"
            :aria-label="$t('global.actions.close')"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon aria-hidden="true">close</v-icon>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
          </v-btn>
        </div>
      </header>
      <div class="b-products-help__scroll" role="region" tabindex="0" :aria-labelledby="`${$.uid}-catalog-help-title`">
        <main class="b-products-help__content">
          <p class="b-products-help__intro">{{ $t('product_panel.workspace.help.subtitle') }}</p>
          <p class="sd-modern-notice sd-modern-notice--plain b-products-help__permission"><v-icon size="18" aria-hidden="true">info_outline</v-icon><span class="sd-modern-notice__content">{{ $t('product_panel.workspace.help.permission_note') }}</span></p>
          <div class="sd-modern-widget b-products-help__lessons">
            <section class="b-products-help__lesson">
              <h2><span class="b-products-help__number" aria-hidden="true">01</span>{{ $t('product_panel.workspace.help.photos.title') }}</h2>
              <p>{{ $t('product_panel.workspace.help.photos.body') }}</p>
              <figure class="sd-modern-illustration b-products-help__figure b-products-help__figure--photos">
                <span class="b-products-help__figure-label">{{ $t('product_panel.workspace.help.illustration') }}</span>
                <div class="b-products-help__stage b-products-help__photo-flow" aria-hidden="true">
                  <div class="b-products-help__mini b-products-help__photo-source">
                    <svg class="sd-modern-illustration__icon b-products-help__source-icon" viewBox="0 0 24 24" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m3 16 5-5 4 4 3-3 6 6" /></svg>
                    <span dir="ltr">photo.jpg</span>
                    <strong>{{ $t('product_panel.workspace.help.photos.drop') }}</strong>
                  </div>
                  <svg class="sd-modern-illustration__icon b-products-help__arrow" viewBox="0 0 24 24" focusable="false"><path d="M3 12h18m-6-6 6 6-6 6" /></svg>
                  <div class="b-products-help__photo-outcomes">
                    <div class="b-products-help__mini b-products-help__photo-result">
                      <div class="b-products-help__image b-products-help__image--empty">
                        <svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 12h8m-4-4v8" /></svg>
                        <div class="b-products-help__image b-products-help__photo-main">
                          <svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m3 16 5-5 4 4 3-3 6 6" /></svg>
                        </div>
                      </div>
                      <div><strong class="b-products-help__condition">{{ $t('product_panel.workspace.help.photos.empty') }}</strong><span>{{ $t('product_panel.workspace.help.photos.main') }}</span></div>
                    </div>
                    <div class="b-products-help__mini b-products-help__photo-result">
                      <div class="b-products-help__image b-products-help__image--existing">
                        <svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m3 16 6-6 5 5 3-3 4 4" /></svg>
                      </div>
                      <div class="b-products-help__gallery-copy">
                        <strong class="b-products-help__condition">{{ $t('product_panel.workspace.help.photos.existing') }}</strong>
                        <span>{{ $t('product_panel.workspace.help.photos.gallery') }}</span>
                      </div>
                      <div class="b-products-help__gallery">
                        <span class="b-products-help__thumbnail"><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m3 16 6-6 5 5 3-3 4 4" /></svg></span>
                        <span class="b-products-help__thumbnail b-products-help__gallery-new"><svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m3 16 5-5 4 4 3-3 6 6" /></svg></span>
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption>{{ $t('product_panel.workspace.help.photos.caption') }}</figcaption>
              </figure>
            </section>
            <section class="b-products-help__lesson">
              <h2><span class="b-products-help__number" aria-hidden="true">02</span>{{ $t('product_panel.workspace.help.importing.title') }}</h2>
              <p>{{ $t('product_panel.workspace.help.importing.body') }}</p>
              <figure class="sd-modern-illustration b-products-help__figure b-products-help__figure--importing">
                <span class="b-products-help__figure-label">{{ $t('product_panel.workspace.help.illustration') }}</span>
                <div class="b-products-help__stage b-products-help__import-flow" aria-hidden="true">
                  <div class="b-products-help__mini b-products-help__file">
                    <svg class="sd-modern-illustration__icon b-products-help__source-icon" viewBox="0 0 24 24" focusable="false"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 13h8M8 17h8m-4-4v4" /></svg>
                    <div class="b-products-help__file-copy"><span dir="ltr">products.xlsx</span><span class="b-products-help__formats" dir="ltr">.xlsx / .csv</span></div>
                  </div>
                  <svg class="sd-modern-illustration__icon b-products-help__arrow" viewBox="0 0 24 24" focusable="false"><path d="M3 12h18m-6-6 6 6-6 6" /></svg>
                  <div class="b-products-help__mini b-products-help__review">
                    <svg class="sd-modern-illustration__icon b-products-help__source-icon" viewBox="0 0 24 24" focusable="false"><path d="m3 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2M10 6h11M10 12h11M10 18h11" /></svg>
                    <div class="b-products-help__review-copy">
                      <strong>{{ $t('product_panel.workspace.help.importing.review') }}</strong>
                      <div class="b-products-help__sheet"><span v-for="cell in 9" :key="cell" /></div>
                    </div>
                    <div class="sd-modern-illustration__action b-products-help__import-action">{{ $t('product_panel.workspace.help.importing.action') }}</div>
                  </div>
                  <svg class="sd-modern-illustration__icon b-products-help__arrow" viewBox="0 0 24 24" focusable="false"><path d="M3 12h18m-6-6 6 6-6 6" /></svg>
                  <div class="b-products-help__mini b-products-help__queued">
                    <svg class="sd-modern-illustration__icon b-products-help__source-icon" viewBox="0 0 24 24" focusable="false"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
                    <strong>{{ $t('product_panel.workspace.help.importing.result') }}</strong>
                  </div>
                </div>
                <figcaption>{{ $t('product_panel.workspace.help.importing.caption') }}</figcaption>
              </figure>
            </section>
            <section class="b-products-help__lesson">
              <h2><span class="b-products-help__number" aria-hidden="true">03</span>{{ $t('product_panel.workspace.help.sorting.title') }}</h2>
              <p>{{ $t('product_panel.workspace.help.sorting.body') }}</p>
              <figure class="sd-modern-illustration b-products-help__figure b-products-help__figure--sorting">
                <span class="b-products-help__figure-label">{{ $t('product_panel.workspace.help.illustration') }}</span>
                <div class="b-products-help__stage" aria-hidden="true">
                  <div class="b-products-help__metric">
                    <svg class="sd-modern-illustration__icon" viewBox="0 0 24 24" focusable="false"><path d="M5 4v16m-3-3 3 3 3-3M12 6h9M12 12h6M12 18h3" /></svg>
                    {{ $t('product_panel.workspace.help.sorting.metric') }}
                  </div>
                  <div class="b-products-help__sort-flow">
                    <div class="b-products-help__sort-before">
                      <strong class="b-products-help__condition">{{ $t('product_panel.workspace.help.sorting.before') }}</strong>
                      <div class="b-products-help__sample-prices" dir="ltr"><span>$24</span><span>$12</span><span>$18</span></div>
                    </div>
                    <svg class="sd-modern-illustration__icon b-products-help__arrow" viewBox="0 0 24 24" focusable="false"><path d="M3 12h18m-6-6 6 6-6 6" /></svg>
                    <div class="b-products-help__mini b-products-help__sort-result">
                      <strong class="b-products-help__condition">{{ $t('product_panel.workspace.help.sorting.after') }}</strong>
                      <div class="b-products-help__sample-row"><span class="b-products-help__sample-mark" /><span>{{ $t('product_panel.workspace.help.sample_product') }}</span><span dir="ltr">$12</span></div>
                      <div class="b-products-help__sample-row"><span class="b-products-help__sample-mark" /><span>{{ $t('product_panel.workspace.help.sample_product') }}</span><span dir="ltr">$18</span></div>
                      <div class="b-products-help__sample-row"><span class="b-products-help__sample-mark" /><span>{{ $t('product_panel.workspace.help.sample_product') }}</span><span dir="ltr">$24</span></div>
                    </div>
                  </div>
                </div>
                <figcaption>{{ $t('product_panel.workspace.help.sorting.caption') }}</figcaption>
              </figure>
            </section>
            <section class="b-products-help__lesson b-products-help__quick">
              <h2><span class="b-products-help__number" aria-hidden="true">04</span>{{ $t('product_panel.workspace.help.quick_title') }}</h2>
              <ul>
                <li><v-icon size="20" aria-hidden="true">check_box</v-icon><span>{{ $t('product_panel.workspace.help.quick_tips.select') }}</span></li>
                <li><v-icon size="20" aria-hidden="true">ads_click</v-icon><span>{{ $t('product_panel.workspace.help.quick_tips.context') }}</span></li>
                <li><v-icon size="20" aria-hidden="true">drive_file_move</v-icon><span>{{ $t('product_panel.workspace.help.quick_tips.move') }}</span></li>
                <li><v-icon size="20" aria-hidden="true">account_tree</v-icon><span>{{ $t('product_panel.workspace.help.quick_tips.arrange') }}</span></li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: "BProductsWorkspaceHelp",
  props: { modelValue: { type: Boolean, default: false } },
  emits: ["update:modelValue"],
};
</script>

<style lang="scss" scoped>
.b-products-help.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0 !important;
  border-radius: 0 !important;
  color: rgb(var(--v-theme-on-surface));
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 23px;
}
.b-products-help {
  &__header { position: sticky; inset-block-start: 0; z-index: 1; flex: 0 0 auto; background: rgb(var(--v-theme-surface)); border-block-end: 1px solid var(--sd-modern-border); }
  &__header-inner { display: flex; align-items: center; gap: 12px; max-width: 880px; margin-inline: auto; padding: 16px 24px; }
  &__header h1 { flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500; line-height: 28px; }
  &__scroll { flex: 1; min-height: 0; overflow-y: auto; }
  &__scroll:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }
  &__content { width: 100%; max-width: 880px; margin-inline: auto; padding: 24px; }
  &__intro { max-width: 75ch; margin: 0 0 16px; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-body, 14px); line-height: 23px; }
  &__permission { gap: 9px; margin: 0 0 22px; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small, 13px); line-height: 21px; }
  &__lessons.sd-modern-widget { margin: 0; padding: 0 28px; border-radius: 18px; }
  &__lesson { min-width: 0; padding-block: 26px; }
  &__lesson + &__lesson { border-block-start: 1px solid var(--sd-modern-border); }
  &__lesson h2 { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; font-size: 18px; font-weight: 500; line-height: 26px; }
  &__number { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 8px; background: var(--sd-modern-inset); color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small, 13px); font-weight: 400; line-height: 20px; font-variant-numeric: tabular-nums; }
  &__lesson > p { margin: 0 0 20px; font-size: var(--sd-modern-font-body, 14px); line-height: 23px; }
  &__quick ul { list-style: none; margin: 0; padding: 0; }
  &__quick li { display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 12px; padding-block: 14px; font-size: var(--sd-modern-font-body, 14px); line-height: 23px; }
  &__quick li + li { border-block-start: 1px solid var(--sd-modern-border); }
  &__quick li .v-icon { margin-block-start: 2px; color: var(--sd-modern-muted); }
  &__figure { min-width: 0; margin: 0; container: catalog-help-art / inline-size; }
  &__figure-label { display: block; margin-block-end: 8px; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small, 13px); line-height: 20px; }
  &__figure figcaption { margin-block-start: 12px; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-body, 14px); line-height: 23px; }
  &__stage { min-width: 0; padding: 20px; border-radius: 16px; overflow: hidden; background: var(--sd-modern-inset); font-size: var(--sd-modern-font-small, 13px); line-height: 21px; pointer-events: none; user-select: none; }
  &__mini { min-width: 0; padding: 14px; border: 1px solid var(--sd-modern-border); border-radius: 12px; background: rgb(var(--v-theme-surface)); }
  &__mini strong { font-weight: 500; }
  &__photo-flow, &__import-flow, &__sort-flow { display: grid; grid-template-columns: minmax(0, 1fr); }
  &__photo-source { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; min-height: 40px; padding: 0; border: 0; background: transparent; animation: catalog-help-drop 1.1s ease-out both; }
  &__photo-source .b-products-help__source-icon { width: 20px; height: 20px; }
  &__photo-source strong { color: var(--sd-modern-muted); font-weight: 400; }
  &__source-icon { width: 24px; height: 24px; color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__arrow { width: 24px; height: 32px; justify-self: center; color: rgb(var(--sd-modern-illustration-accent-rgb)); transform: rotate(90deg); stroke-dasharray: 42; animation: catalog-help-route 1.8s ease-out both; }
  &__photo-outcomes { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
  &__condition { display: block; margin: 0 0 2px; }
  &__photo-result { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 12px; }
  &__photo-result > div:nth-child(2) > span { color: var(--sd-modern-muted); }
  &__image { position: relative; display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid var(--sd-modern-border); border-radius: 50%; background: rgb(var(--v-theme-surface)); color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  &__image > svg { width: 26px; height: 26px; }
  &__image--empty { border-style: dashed; color: var(--sd-modern-muted); }
  &__photo-main { position: absolute; inset: -1px; animation: catalog-help-photo 3.2s ease-out both; }
  &__image--existing { color: var(--sd-modern-muted); }
  &__gallery-copy { min-width: 0; }
  &__gallery { display: flex; gap: 4px; }
  &__thumbnail { display: grid; place-items: center; width: 26px; height: 26px; border: 1px solid var(--sd-modern-border); border-radius: 6px; background: rgb(var(--v-theme-surface)); color: var(--sd-modern-muted); }
  &__thumbnail svg { width: 16px; height: 16px; }
  &__gallery-new { color: rgb(var(--sd-modern-illustration-highlight-rgb)); animation: catalog-help-photo 3.2s ease-out both; }
  &__import-flow > .b-products-help__arrow { width: 18px; height: 18px; justify-self: start; margin-inline-start: 18px; }
  &__file, &__review, &__queued { display: grid; grid-template-columns: 24px minmax(0, 1fr); align-items: center; gap: 12px; min-height: 62px; padding: 12px 14px; }
  &__file-copy { display: flex; flex-direction: column; align-items: flex-start; }
  &__formats { color: var(--sd-modern-muted); }
  &__review { grid-template-columns: 24px minmax(0, 1fr) auto; }
  &__review-copy { min-width: 0; }
  &__sheet { display: grid; grid-template-columns: repeat(3, 32px); gap: 3px; margin-block-start: 6px; animation: catalog-help-sheet 2.5s ease-out both; }
  &__sheet span { height: 5px; border-radius: 2px; background: rgba(var(--sd-modern-illustration-accent-rgb), .17); }
  &__import-action { padding: 6px 10px; border-radius: 9px; text-align: center; animation: catalog-help-press 3s ease-out both; }
  &__queued { animation: catalog-help-queue 3.8s ease-out both; }
  &__metric { display: inline-flex; align-items: center; gap: 8px; margin-block-end: 14px; padding: 0; color: inherit; background: transparent; }
  &__metric svg { width: 18px; height: 18px; }
  &__sort-before { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  &__sample-prices { display: flex; gap: 16px; font-variant-numeric: tabular-nums; }
  &__sample-row { display: grid; grid-template-columns: 9px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding-block: 8px; border-block-start: 1px solid var(--sd-modern-border); }
  &__sample-row > span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__sample-mark { width: 8px; height: 8px; border-radius: 2px; background: rgba(var(--sd-modern-illustration-accent-rgb), .3); }
  &__sort-result > .b-products-help__condition { margin-block-end: 8px; }
  &__sort-result { animation: catalog-help-photo 3.2s ease-out both; }
  @media (max-width: 530px) {
    &__header-inner { padding: 14px 16px; }
    &__content { padding: 20px 16px; }
    &__lessons.sd-modern-widget { padding-inline: 16px; }
    &__lesson { padding-block: 22px; }
    &__stage { padding: 14px; }
  }
  @container catalog-help-art (max-width: 480px) {
    &__photo-source strong { flex-basis: 100%; text-align: center; }
    &__photo-result { grid-template-columns: 48px minmax(0, 1fr); }
    &__gallery { grid-column: 2; }
    &__review { grid-template-columns: 24px minmax(0, 1fr); }
    &__import-action { grid-column: 2; justify-self: start; }
    &__sort-before { flex-direction: column; align-items: flex-start; }
  }
  @media (prefers-reduced-motion: reduce) {
    &__stage *, &__stage *::before, &__stage *::after { animation: none !important; transition: none !important; }
  }
}

@keyframes catalog-help-drop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@keyframes catalog-help-route { 0% { opacity: .2; stroke-dashoffset: 42; } 100% { opacity: 1; stroke-dashoffset: 0; } }
@keyframes catalog-help-photo { 0%, 40% { opacity: 0; } 75%, 100% { opacity: 1; } }
@keyframes catalog-help-sheet { 0%, 20% { opacity: .2; transform: scaleX(.8); } 70%, 100% { opacity: 1; transform: none; } }
@keyframes catalog-help-press { 0%, 65%, 85%, 100% { transform: none; } 75% { transform: scale(.97); } }
@keyframes catalog-help-queue { 0%, 70% { opacity: 0; } 90%, 100% { opacity: 1; } }
</style>

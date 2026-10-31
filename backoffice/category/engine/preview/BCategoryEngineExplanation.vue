<!-- Copyright (c) 2026. Selldone® Business OS™. All rights reserved. -->
<template>
  <figure class="b-category-engine-explanation text-start">
    <div class="b-category-engine-explanation__location">
      <v-avatar size="32" class="b-category-engine-explanation__identity">
        <img v-if="locationIcon" :src="getShopImagePath(locationIcon, 64)" alt="" />
        <v-icon v-else size="22" aria-hidden="true">{{ category.id === 'root' ? 'home' : 'folder' }}</v-icon>
      </v-avatar>
      <div>
        <span>{{ $t('category_engine_editor.preview.current_location') }}</span>
        <strong>{{ category.id === 'root' ? $t('category_engine_editor.preview.root') : category.title }}</strong>
        <span>{{ shop.title }}</span>
      </div>
    </div>

    <!-- These bounded file/folder samples explain inclusion, not live products or their order. -->
    <div class="b-category-engine-explanation__stage sd-modern-illustration" aria-hidden="true">
      <div class="b-category-engine-explanation__group" data-engine-items="existing">
        <div class="b-category-engine-explanation__items">
          <div v-for="(kind, index) in ['folder', 'folder', 'note']" :key="index" class="b-category-engine-explanation__item">
            <v-icon size="48">{{ kind }}</v-icon>
            <span class="b-category-engine-explanation__thumbnail"><v-icon size="14">{{ kind === 'folder' ? 'photo' : 'inventory_2' }}</v-icon></span>
          </div>
          <v-icon size="20" class="b-category-engine-explanation__more">more_horiz</v-icon>
        </div>
        <svg class="b-category-engine-explanation__brace" viewBox="0 0 280 30" preserveAspectRatio="none" fill="none" focusable="false">
          <path d="M8 2V8Q8 16 18 16H120Q140 16 140 28Q140 16 160 16H262Q272 16 272 8V2" />
        </svg>
        <p>{{ $t('category_engine_editor.preview.existing') }}</p>
      </div>

      <span class="b-category-engine-explanation__plus">+</span>

      <div class="b-category-engine-explanation__group b-category-engine-explanation__group--added" data-engine-items="added">
        <template v-if="hasSources">
          <div class="b-category-engine-explanation__items">
            <div v-for="index in 3" :key="index" class="b-category-engine-explanation__item">
              <v-icon size="48">note</v-icon>
              <span class="b-category-engine-explanation__thumbnail"><v-icon size="14">inventory_2</v-icon></span>
            </div>
            <v-icon size="20" class="b-category-engine-explanation__more">more_horiz</v-icon>
          </div>
          <svg class="b-category-engine-explanation__brace" viewBox="0 0 280 30" preserveAspectRatio="none" fill="none" focusable="false">
            <path d="M8 2V8Q8 16 18 16H120Q140 16 140 28Q140 16 160 16H262Q272 16 272 8V2" />
          </svg>
          <p>{{ $t('category_engine_editor.preview.added') }}</p>
        </template>
        <p v-else class="b-category-engine-explanation__empty">{{ $t('category_engine_editor.preview.choose_sources') }}</p>
      </div>
    </div>

    <figcaption>
      <span class="b-category-engine-explanation__illustration">{{ $t('category_engine_editor.preview.illustration') }}</span>
      {{ $t(hasSources ? 'category_engine_editor.preview.caption' : 'category_engine_editor.preview.empty_caption') }}
    </figcaption>
  </figure>
</template>

<script lang="ts">
export default {
  name: "BCategoryEngineExplanation",
  props: {
    shop: { type: Object, required: true },
    category: { type: Object, required: true },
    hasSources: Boolean,
  },
  computed: {
    locationIcon() {
      return this.category.id === "root" ? this.shop.icon : this.category.icon;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-category-engine-explanation {
  margin: 0;
  font-size: 14px;
  line-height: 23px;
  color: rgb(var(--v-theme-on-surface));

  &__location {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-block: 16px;
    padding: 12px 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    > .v-avatar { flex: 0 0 auto; }
    > div { min-width: 0; }
    span { display: block; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
    strong { display: block; font-weight: 500; overflow-wrap: anywhere; }
  }

  &__identity img { width: 100%; height: 100%; object-fit: cover; }

  &__stage {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    border-radius: 18px;
    background: var(--sd-modern-inset);
  }

  &__group {
    min-width: 0;
    p { margin: 6px 0 0; text-align: center; font-size: 13px; line-height: 20px; }
  }

  &__items {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 64px;
  }

  &__item {
    position: relative;
    display: inline-flex;
    flex: 0 0 48px;
    > .v-icon { color: rgba(var(--v-theme-on-surface), .18); }
  }

  &__thumbnail {
    position: absolute;
    inset-block-start: 14px;
    inset-inline-start: 14px;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    border: 1px solid rgba(var(--v-theme-on-surface), .4);
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
  }

  &__group--added {
    .b-category-engine-explanation__item > .v-icon { color: rgba(var(--sd-modern-illustration-accent-rgb), .2); }
    .b-category-engine-explanation__brace { color: rgb(var(--sd-modern-illustration-accent-rgb)); }
  }

  &__more { flex: 0 0 auto; color: var(--sd-modern-muted); }
  &__plus { align-self: start; margin-block-start: 19px; text-align: center; color: var(--sd-modern-muted); font-size: 22px; }
  &__brace { display: block; width: 100%; height: 30px; color: var(--sd-modern-muted); }
  &__brace path { stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
  &__empty { padding: 12px; color: var(--sd-modern-muted); }
  figcaption { margin-block-start: 14px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  &__illustration { display: block; margin-block-end: 4px; font-weight: 500; }

  @media (max-width: 600px) {
    &__stage { grid-template-columns: minmax(0, 1fr); gap: 10px; padding: 16px 12px; }
    &__plus { margin: 0; align-self: center; }
    &__location { padding: 12px; }
  }
}
</style>

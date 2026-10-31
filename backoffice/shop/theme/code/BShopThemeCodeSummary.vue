<template>
  <article class="b-shop-theme-code-summary text-start">
    <v-icon :icon="section.field === 'css' ? 'css' : 'code'" size="19" aria-hidden="true" />
    <div class="b-shop-theme-code-summary__details">
      <h3>{{ $t(section.title) }}</h3>
      <p>{{ $t(section.description) }}</p>
      <div class="b-shop-theme-code-summary__meta">
        <span class="b-shop-theme-code-summary__status">
          <span class="b-shop-theme-code-summary__dot" aria-hidden="true"></span>
          {{ $t(section.hasCode ? 'shop_theme.studio.code_present' : 'shop_theme.studio.code_empty') }}
        </span>
        <span v-if="section.hasCode">{{ $t('shop_theme.studio.code_size', { characters: section.characters, kilobytes: section.kilobytes }) }}</span>
      </div>
    </div>
    <v-btn variant="text" class="sd-modern-button b-shop-theme-code-summary__edit" :disabled="disabled"
           :aria-label="$t('shop_theme.studio.edit_code_label', { section: $t(section.title) })" @click="$emit('edit', $event)">
      <v-icon start size="16" aria-hidden="true">{{ section.readOnly ? 'visibility' : 'edit' }}</v-icon>
      {{ $t(section.readOnly ? 'shop_theme.studio.view_code' : section.hasCode ? 'shop_theme.studio.edit_code' : 'shop_theme.studio.add_code') }}
    </v-btn>
  </article>
</template>

<script lang="ts">
export default {
  name: 'BShopThemeCodeSummary',
  emits: ['edit'],
  props: {
    section: { type: Object, required: true },
    disabled: Boolean,
  },
};
</script>

<style scoped lang="scss">
.b-shop-theme-code-summary {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: start;
  gap: 14px;
  padding-block: 24px;

  & + & { border-block-start: 1px solid var(--sd-modern-border); }
  > .v-icon { margin-block-start: 2px; color: var(--sd-modern-muted); }
  &__details { min-width: 0; }
  h3 { margin: 0; font-size: 15px; font-weight: 500; line-height: 23px; }
  p { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__meta { display: flex; flex-wrap: wrap; gap: 7px 16px; margin-block-start: 13px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; font-variant-numeric: tabular-nums; }
  &__status { display: inline-flex; align-items: center; gap: 7px; }
  &__dot { width: 5px; height: 5px; flex: 0 0 5px; border-radius: 50%; background: var(--sd-modern-muted); }
  &__edit { margin-block-start: -5px; }

  @media (max-width: 600px) {
    grid-template-columns: 20px minmax(0, 1fr);
    gap: 10px;
    &__edit { grid-column: 2; justify-self: start; margin-block-start: 2px; }
  }
}
</style>

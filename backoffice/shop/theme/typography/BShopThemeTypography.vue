<!--
  - Copyright (c) 2025. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->
<template>
  <section class="b-shop-theme-typography text-start" aria-labelledby="shop-theme-typography-title">
    <header class="b-shop-theme-typography__heading">
      <h2 id="shop-theme-typography-title">{{ $t('shop_theme.typography') }}</h2>
      <p>{{ $t('b_shop_theme_typography.main_font.subtitle') }}</p>
    </header>

    <div class="b-shop-theme-typography__panel sd-modern-widget">
      <div class="b-shop-theme-typography__layout">
        <div class="b-shop-theme-typography__controls">
          <p id="shop-theme-font-source" class="b-shop-theme-typography__label">
            {{ $t('b_shop_theme_typography.main_font.source_title') }}
          </p>
          <u-smart-select
            class="sd-modern-smart-select b-shop-theme-typography__sources"
            :model-value="activeFontSource"
            :items="fontSources"
            aria-labelledby="shop-theme-font-source"
            item-value="id"
            item-text="title"
            border accessible force-show-all
            :disabled="!can_edit"
            :readonly="!can_edit"
            @update:model-value="setFontSource"
          />

          <div v-if="activeFontSource === 'uploaded'" class="b-shop-theme-typography__fields">
            <label for="shop-theme-uploaded-font" class="b-shop-theme-typography__label">
              {{ $t('b_shop_theme_typography.main_font.custom_font') }}
            </label>
            <v-autocomplete
              id="shop-theme-uploaded-font"
              class="b-shop-theme-typography__field"
              clearable
              :disabled="!can_edit || !customFonts.length"
              :items="customFonts"
              item-title="name"
              item-value="id"
              :messages="$t(customFonts.length
                ? 'b_shop_theme_typography.main_font.managed_message'
                : 'b_shop_theme_typography.custom_fonts.empty_title')"
              :model-value="selectedCustomFontId"
              density="compact"
              persistent-placeholder
              variant="outlined"
              @update:model-value="selectCustomFont"
            >
              <template #selection="{ internalItem: item }">
                <span :style="customFontPreviewStyle(item.raw)">{{ item.raw.name }}</span>
              </template>
              <template #item="{ internalItem: item, props }">
                <v-list-item v-bind="props" class="text-start">
                  <template #prepend>
                    <v-avatar class="me-2 rounded-lg" :style="customFontPreviewStyle(item.raw)">Aa</v-avatar>
                  </template>
                  <template #title>
                    <span :style="customFontPreviewStyle(item.raw)">{{ item.raw.name }}</span>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </div>
          <div v-else class="b-shop-theme-typography__fields">
            <label for="shop-theme-external-font" class="b-shop-theme-typography__label">
              {{ $t('b_shop_theme_typography.inputs.font_family.label') }}
            </label>
            <v-text-field
              id="shop-theme-external-font"
              class="b-shop-theme-typography__field"
              :model-value="fontFamily"
              @update:model-value="setExternalFontFamily"
              @blur="fixFontFamily"
              persistent-placeholder
              placeholder="'Maven Pro', sans-serif"
              :disabled="!can_edit"
              variant="outlined"
              density="compact"
              hide-details
              dir="ltr"
            />
            <a class="b-shop-theme-typography__font-link"
               :href="font_family_name ? `https://fonts.google.com/?query=${encodeURIComponent(font_family_name)}` : 'https://fonts.google.com'"
               target="_blank" rel="noopener noreferrer">
              <span>{{ $t('b_shop_theme_typography.main_font.browse_fonts') }}<v-icon size="13" aria-hidden="true">north_east</v-icon></span>
            </a>
            <div class="b-shop-theme-typography__font-resource">
              <slot name="font-resource" />
            </div>
          </div>
        </div>

        <figure class="b-shop-theme-typography__preview">
          <figcaption>
            <span>{{ $t('b_shop_theme_typography.main_font.preview') }}</span>
            <span>{{ selectedCustomFont?.name || font_family_name || $t('b_shop_theme_typography.main_font.default_family') }}</span>
          </figcaption>
          <div class="b-shop-theme-typography__specimen"
               :style="{ fontFamily: selectedCustomFont ? customFontFamilyValue(selectedCustomFont) : fontFamily || undefined }">
            <p class="b-shop-theme-typography__sample-title">{{ $t('b_shop_theme_typography.main_font.preview_title') }}</p>
            <p class="b-shop-theme-typography__sample-body">{{ $t('b_shop_theme_typography.main_font.preview_body') }}</p>
            <div class="b-shop-theme-typography__characters" dir="ltr">Aa Bb Cc · 0123456789</div>
          </div>
          <p v-if="activeFontSource === 'external'" class="b-shop-theme-typography__preview-note">
            {{ $t('b_shop_theme_typography.main_font.preview_note') }}
          </p>
        </figure>
      </div>

      <details v-if="activeFontSource === 'uploaded' && selectedCustomFont" class="b-shop-theme-typography__details">
        <summary>
          <v-icon size="16" aria-hidden="true">code</v-icon>
          <span>{{ $t('b_shop_theme_typography.main_font.details') }}</span>
          <v-icon size="16" aria-hidden="true">expand_more</v-icon>
        </summary>
        <dl>
          <dt>{{ $t('b_shop_theme_typography.inputs.font_family.label') }}</dt>
          <dd><code dir="ltr">{{ fontFamily }}</code></dd>
        </dl>
        <div class="b-shop-theme-typography__font-resource">
          <slot name="font-resource" />
        </div>
      </details>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";
import { FontLoader } from "@selldone/core-js/helper/font/FontLoader.ts";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";

type FontSource = "uploaded" | "external";

export default defineComponent({
  name: "BShopThemeTypography",
  components: { USmartSelect },

  emits: ["update:fontFamily", "update:fontRes"],
  props: {
    fontFamily: {},
    fontRes: {},
    readOnly: Boolean,
    customFonts: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    fontSource: null as FontSource | null,
    uploadedFontId: null as number | null,
    externalDraft: { fontFamily: null, fontRes: null } as {
      fontFamily: unknown;
      fontRes: unknown;
    },
  }),

  computed: {
    can_edit(): boolean {
      return !this.readOnly && this.writeShopAccess(ShopPermissionRegions.SETTINGS.code);
    },
    activeFontSource(): FontSource {
      return this.fontSource || (this.selectedCustomFont || (!this.fontFamily && !this.fontRes) ? "uploaded" : "external");
    },
    fontSources() {
      return [
        { id: "uploaded", title: this.$t("b_shop_theme_typography.main_font.source_uploaded") },
        { id: "external", title: this.$t("b_shop_theme_typography.main_font.source_external") },
      ];
    },
    font_family_name() {
      if (!this.fontFamily) return null;
      return String(this.fontFamily)
        .split(",")[0]
        .trim()
        .replace(/^['"]|['"]$/g, "");
    },
    selectedCustomFont() {
      const family = this.primaryFontFamily(this.fontFamily);
      if (!family) return null;

      return (
        this.customFonts.find(
          (font) =>
            this.primaryFontFamily(font?.family) === family ||
            this.primaryFontFamily(
              FontLoader.GetCustomFontFamilyValue(font),
            ) === family,
        ) || null
      );
    },
    selectedCustomFontId() {
      return this.selectedCustomFont?.id ?? null;
    },
  },
  watch: {
    customFonts: {
      deep: true,
      handler() {
        if (this.selectedCustomFont)
          this.applyCustomFont(this.selectedCustomFont);
      },
    },
  },
  methods: {
    setFontSource(source: FontSource) {
      if (!this.can_edit || !["uploaded", "external"].includes(source) || source === this.activeFontSource) return;

      if (this.activeFontSource === "external") {
        this.externalDraft = { fontFamily: this.fontFamily, fontRes: this.fontRes };
      } else {
        this.uploadedFontId = this.selectedCustomFontId;
      }
      this.fontSource = source;

      if (source === "uploaded") {
        const font = this.customFonts.find((font) => Number(font?.id) === this.uploadedFontId);
        if (font) {
          this.applyCustomFont(font);
          return;
        }
        this.$emit("update:fontFamily", null);
        this.$emit("update:fontRes", null);
      } else {
        this.$emit("update:fontFamily", this.externalDraft.fontFamily);
        this.$emit("update:fontRes", this.externalDraft.fontRes);
      }
    },
    setExternalFontFamily(value: unknown) {
      if (this.can_edit && this.activeFontSource === "external") this.$emit("update:fontFamily", value);
    },
    fixFontFamily() {
      if (!this.can_edit) return;
      const value = String(this.fontFamily || "")
        .replace(/^\s*font-family\s*:/i, "")
        .replace(/;\s*$/, "")
        .trim();
      this.$emit("update:fontFamily", value || null);
    },
    selectCustomFont(id) {
      if (!this.can_edit) return;
      const normalizedId = id == null ? null : Number(id);
      if (normalizedId == null) {
        if (this.selectedCustomFont) {
          this.$emit("update:fontFamily", null);
          this.$emit("update:fontRes", null);
        }
        return;
      }

      const font = this.customFonts.find(
        (item) => Number(item?.id) === normalizedId,
      );
      if (!font) return;

      this.applyCustomFont(font);
    },
    applyCustomFont(font) {
      if (!this.can_edit) return;
      this.$emit("update:fontFamily", this.customFontFamilyValue(font));
      this.$emit("update:fontRes", FontLoader.BuildCustomFontResource(font));
    },
    customFontFamilyValue(font) {
      return FontLoader.GetCustomFontFamilyValue(font);
    },
    customFontPreviewStyle(font) {
      return { fontFamily: this.customFontFamilyValue(font) };
    },
    primaryFontFamily(value) {
      return String(value || "")
        .replace(/^\s*font-family\s*:/i, "")
        .split(",")[0]
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .toLocaleLowerCase();
    },
  },
});
</script>

<style scoped lang="scss">
.b-shop-theme-typography {
  min-width: 0;
  container-type: inline-size;

  &__heading {
    margin-block-end: 15px;
    h2 { margin: 0; font-family: inherit; font-size: 24px; font-weight: 650; line-height: 30px; letter-spacing: -.6px; }
    p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 19.5px; }
  }
  &__panel.sd-modern-widget { padding: clamp(16px, 2.4vw, 24px); }
  &__layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr); gap: clamp(14px, 2.4vw, 26px); }
  &__controls { min-width: 0; padding-block: 3px; }
  &__label { display: block; margin: 0 0 7px; font-size: 13px; font-weight: 600; line-height: 19.5px; }
  &__sources.sd-modern-smart-select {
    :deep(.rounded-card) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5px;
      padding: 4px;
      background: rgba(var(--v-theme-on-surface), .045);
      border-color: transparent !important;
      border-radius: 11px !important;
    }
    :deep(.rounded-card > .pp[role="radio"]) {
      min-width: 0;
      padding: 0 7px !important;
      background-color: transparent !important;
      border: 0 !important;
      border-radius: 8px !important;
    }
    :deep(.rounded-card > .pp[aria-checked="true"]) {
      background-color: rgb(var(--v-theme-surface)) !important;
      box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), .1);
    }
    :deep(.mnh) { justify-content: center; min-height: 34px; gap: 7px; overflow-wrap: anywhere; }
    :deep(.mnh > div) { flex-grow: 0 !important; margin-inline: 0 !important; }
    :deep(.mnh > div:first-child > .text-center) { width: 19px !important; }
    :deep(.mnh > div:first-child .v-icon) { font-size: 17px; }
    :deep(.circle-check) { width: 15px; height: 15px; }
    :deep([aria-checked="true"] b) { font-weight: 600; }
  }
  &__fields { margin-block-start: 20px; }
  &__field {
    --v-input-control-height: 42px;
    :deep(.v-field) { border-radius: 9px; font-family: inherit; font-size: 14px; }
    :deep(.v-field__input) { font-size: inherit; }
    :deep(.v-field:not(.v-field--focused):not(.v-field--error) .v-field__outline) {
      --v-field-border-opacity: 1;
      color: var(--sd-modern-border);
    }
    :deep(.v-input__details) { padding: 8px 0 0; }
    :deep(.v-messages) { color: var(--sd-modern-muted); font-size: 12px; }
    :deep(.v-messages__message) { line-height: 18px; }
  }
  &__font-link {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    color: rgb(var(--v-theme-primary));
    font-size: 12px;
    text-decoration: none;
    span { display: inline-flex; align-items: center; gap: 4px; border-block-end: 1px solid currentColor; }
  }
  &__preview {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 26px;
    min-width: 0;
    min-height: 250px;
    margin: 0;
    padding: clamp(15px, 2.2vw, 24px);
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), .045);
    figcaption {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 3px 12px;
      color: var(--sd-modern-muted);
      font-size: 12px;
      line-height: 18px;
      overflow-wrap: anywhere;
      span + span { color: rgb(var(--v-theme-on-surface)); font-weight: 600; }
    }
  }
  &__specimen { overflow-wrap: anywhere; }
  &__sample-title { max-inline-size: 11ch; margin: 0; font-size: clamp(28px, 4.25vw, 45px); font-weight: 700; line-height: 1.04; letter-spacing: -.055em; }
  &__sample-body { margin: 12px 0 0; font-size: 13px; line-height: 1.45; }
  &__characters { margin-block-start: 15px; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; letter-spacing: .035em; }
  &__preview-note { margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 18px; }
  &__details {
    margin-block-start: 14px;
    border-block-start: 1px solid var(--sd-modern-border);
    font-size: 13px;
    line-height: 19.5px;
    &:not([open]) { margin-block-end: -11px; }
    > summary {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 42px;
      padding: 6px 2px 0;
      list-style: none;
      cursor: pointer;
      &::-webkit-details-marker { display: none; }
      &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; border-radius: 4px; }
      span { flex: 1; min-inline-size: 0; overflow-wrap: anywhere; }
    }
    &[open] > summary > .v-icon:last-child { transform: rotate(180deg); }
    dl { display: grid; grid-template-columns: minmax(100px, .52fr) minmax(0, 1fr); gap: 9px 16px; margin: 9px 0 0; }
    dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
  }
  &__font-resource {
    :deep(.b-shop-theme-code-summary) { grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 8px; padding-block: 8px 0; }
    :deep(.b-shop-theme-code-summary > .v-icon) { display: none; }
    :deep(.b-shop-theme-code-summary h3) { font-size: 13px; font-weight: 600; line-height: 19.5px; }
    :deep(.b-shop-theme-code-summary p) { margin-block-start: 2px; line-height: 18px; }
    :deep(.b-shop-theme-code-summary__meta) { margin-block-start: 4px; gap: 4px 10px; }
    :deep(.b-shop-theme-code-summary__edit) { grid-column: auto; margin-block-start: -3px; }
  }

  @container (max-width: 525px) {
    &__layout { grid-template-columns: minmax(0, 1fr); gap: 18px; }
    &__preview { min-height: 216px; gap: 20px; }
  }
  @container (max-width: 330px) {
    &__font-resource {
      :deep(.b-shop-theme-code-summary) { grid-template-columns: minmax(0, 1fr); }
      :deep(.b-shop-theme-code-summary__edit) { justify-self: start; }
    }
  }
  @media (pointer: coarse) {
    &__sources.sd-modern-smart-select :deep(.mnh),
    &__font-link,
    &__details > summary { min-height: 44px; }
  }
}
</style>

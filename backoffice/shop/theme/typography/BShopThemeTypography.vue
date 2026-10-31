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
  <div class="b-shop-theme-typography sd-modern-widget text-start">
    <u-widget-header
      class="sd-modern-form-header"
      icon="format_size"
      :title="$t('b_shop_theme_typography.main_font.title')"
    ></u-widget-header>

    <p class="sd-modern-subtitle b-shop-theme-typography__subtitle">
      {{ $t("b_shop_theme_typography.main_font.subtitle") }}
    </p>

    <u-smart-select
      class="sd-modern-smart-select sd-modern-smart-select--columns b-shop-theme-typography__sources"
      :model-value="activeFontSource"
      :items="fontSources"
      :aria-label="$t('b_shop_theme_typography.main_font.source_title')"
      item-value="id"
      item-text="title"
      item-description="description"
      item-icon="icon"
      border accessible force-show-all
      :disabled="!can_edit"
      :readonly="!can_edit"
      @update:model-value="setFontSource"
    />

    <div class="b-shop-theme-typography__layout">
      <section class="b-shop-theme-typography__controls">
        <h3 class="b-shop-theme-typography__section-title">
          {{ $t('b_shop_theme_typography.main_font.source_title') }}
        </h3>
        <p class="b-shop-theme-typography__guidance">
          {{ $t(activeFontSource === 'uploaded'
            ? 'b_shop_theme_typography.main_font.uploaded_help'
            : 'b_shop_theme_typography.main_font.external_help') }}
        </p>
        <template v-if="activeFontSource === 'uploaded'">
        <v-autocomplete
          v-if="customFonts.length"
          class="sd-modern-underlined-field"
          clearable
          :disabled="!can_edit"
          :items="customFonts"
          item-title="name"
          item-value="id"
          :label="$t('b_shop_theme_typography.main_font.custom_font')"
          :messages="$t('b_shop_theme_typography.main_font.custom_font_message')"
          :model-value="selectedCustomFontId"
          persistent-placeholder
          prepend-inner-icon="font_download"
          variant="underlined"
          @update:model-value="selectCustomFont"
        >
          <template #selection="{ item }">
            <span :style="customFontPreviewStyle(item.raw)">{{ item.raw.name }}</span>
          </template>
          <template #item="{ item, props }">
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

        <v-btn class="sd-modern-button b-shop-theme-typography__add-font"
               variant="outlined" prepend-icon="add" :disabled="!can_edit" @click="addCustomFont">
          {{ $t('b_shop_theme_typography.custom_fonts.actions.add') }}
        </v-btn>
        <p v-if="selectedCustomFont" class="b-shop-theme-typography__managed">
          <v-icon size="18" aria-hidden="true">link</v-icon>
          {{ $t('b_shop_theme_typography.main_font.managed_message') }}
        </p>
        </template>
        <template v-else>
          <v-text-field
            class="sd-modern-underlined-field"
            :model-value="fontFamily"
            @update:model-value="setExternalFontFamily"
            :label="$t('b_shop_theme_typography.inputs.font_family.label')"
            :messages="$t('b_shop_theme_typography.inputs.font_family.message')"
            persistent-placeholder
            placeholder="'Maven Pro', sans-serif"
            @blur="fixFontFamily"
            variant="underlined"
            :disabled="!can_edit"
            dir="ltr"
          >
            <template #append-inner>
              <v-tooltip v-if="font_family_name" location="top" content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }">
                  <v-btn v-bind="props"
                         :href="`https://fonts.google.com/?query=${encodeURIComponent(font_family_name)}`"
                         class="sd-modern-icon-button sd-modern-input-action"
                         icon="north_east" variant="text" target="_blank" rel="noopener noreferrer"
                         :aria-label="$t('shop_theme.studio.find_font')" />
                </template>
                {{ $t('shop_theme.studio.find_font') }}
              </v-tooltip>
            </template>
          </v-text-field>
          <div class="b-shop-theme-typography__family-help">
            <div class="b-shop-theme-typography__examples">
              <p class="b-shop-theme-typography__example-label">{{ $t('b_shop_theme_typography.main_font.family_examples') }}</p>
              <code dir="ltr">'Maven Pro', sans-serif</code>
            </div>
            <a class="sd-modern-inline-action" href="https://fonts.google.com"
               target="_blank" rel="noopener noreferrer">
              Google Fonts<v-icon size="14" class="ms-1" aria-hidden="true">north_east</v-icon>
            </a>
          </div>
        </template>
      </section>

      <section class="b-shop-theme-typography__preview">
        <div class="b-shop-theme-typography__preview-label">
          {{ $t('b_shop_theme_typography.main_font.preview') }}
        </div>
        <div class="b-shop-theme-typography__specimen"
             :style="{ fontFamily: selectedCustomFont ? customFontFamilyValue(selectedCustomFont) : fontFamily || undefined }">
          <h3>{{ $t('b_shop_theme_typography.main_font.preview_title') }}</h3>
          <p>{{ $t('b_shop_theme_typography.main_font.preview_body') }}</p>
          <div class="b-shop-theme-typography__characters" dir="ltr">Aa Bb Cc · 0123456789</div>
        </div>
        <div class="b-shop-theme-typography__preview-family">
          {{ selectedCustomFont?.name || font_family_name || $t('b_shop_theme_typography.main_font.default_family') }}
        </div>
        <p class="b-shop-theme-typography__preview-note">
          {{ $t('b_shop_theme_typography.main_font.preview_note') }}
        </p>
      </section>
    </div>

    <details v-if="activeFontSource === 'uploaded' && selectedCustomFont" class="b-shop-theme-typography__examples b-shop-theme-typography__family-metadata">
      <summary>{{ $t('b_shop_theme_typography.custom_fonts.css_name') }}</summary>
      <v-text-field
                    class="sd-modern-underlined-field"
                    :model-value="fontFamily"
                    :label="$t('b_shop_theme_typography.inputs.font_family.label')"
                    :disabled="!can_edit"
                    readonly variant="underlined" dir="ltr" />
    </details>

    <div v-if="activeFontSource === 'external' || selectedCustomFont" class="b-shop-theme-typography__font-resource">
      <slot name="font-resource" />
    </div>
  </div>
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

  emits: ["update:fontFamily", "update:fontRes", "add-font"],
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
    ShopPermissionRegions: ShopPermissionRegions,
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
        { id: "uploaded", title: this.$t('b_shop_theme_typography.main_font.source_uploaded'), description: this.$t('b_shop_theme_typography.main_font.source_uploaded_description'), icon: "font_download" },
        { id: "external", title: this.$t('b_shop_theme_typography.main_font.source_external'), description: this.$t('b_shop_theme_typography.main_font.source_external_description'), icon: "language" },
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
    addCustomFont() {
      if (this.can_edit) this.$emit("add-font");
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

  &__subtitle { padding: 0; margin-block: 0 20px; min-height: 0; }
  &__sources { margin-bottom: 28px; }
  &__layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .9fr); align-items: start; gap: 32px; }
  &__controls { min-width: 0; }
  &__section-title { margin: 0 0 16px; font-size: 14px; font-weight: 500; line-height: 21px; }
  &__guidance { margin: 0 0 18px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__add-font { margin-top: 12px; }
  &__managed { display: flex; align-items: flex-start; gap: 8px; margin: 16px 0 0; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  &__managed .v-icon { flex-shrink: 0; margin-top: 1px; }
  &__family-help { display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; margin-top: 8px; }
  &__family-help > a { flex-shrink: 0; font-size: 12px; }
  &__preview { min-width: 0; padding: 24px; background: var(--sd-modern-inset); border-radius: 16px; }
  &__preview-label { margin-bottom: 24px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  &__specimen h3 { margin: 0; font-family: inherit; font-size: 30px; font-weight: 500; line-height: 1.25; letter-spacing: -.5px; overflow-wrap: anywhere; }
  &__specimen p { margin: 14px 0 24px; font-size: 14px; line-height: 1.7; }
  &__characters { color: var(--sd-modern-muted); font-size: 15px; line-height: 24px; overflow-wrap: anywhere; }
  &__preview-family { margin-top: 24px; font-size: 12px; font-weight: 500; line-height: 19px; overflow-wrap: anywhere; }
  &__preview-note { margin: 6px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__family-metadata { margin-top: 16px; }
  &__font-resource { margin-top: 28px; }
  &__examples > summary { width: fit-content; min-height: 44px; padding-block: 12px; cursor: pointer; font-size: 12px; font-weight: 500; line-height: 20px; }
  &__examples > summary:focus-visible { border-radius: 4px; outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__examples { min-width: 0; }
  &__example-label { margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  code { display: block; margin-block: 6px 12px; padding: 10px 12px; background: var(--sd-modern-inset); border-radius: 8px; font-size: 12px; line-height: 20px; overflow-wrap: anywhere; white-space: normal; }

  @media (max-width: 700px) {
    &__layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    &__preview { padding: 20px; }
  }
}
</style>

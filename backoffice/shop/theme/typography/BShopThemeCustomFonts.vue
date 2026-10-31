<!--
  - Copyright (c) 2026. Selldone® Business OS™
  -
  - Shop custom font manager.
  -->
<template>
  <div class="b-shop-theme-fonts sd-modern-widget text-start">
    <u-widget-header
      class="sd-modern-form-header"
      icon="font_download"
      :title="$t('b_shop_theme_typography.custom_fonts.title')"
    >
      <template #append-title>
        <span class="sd-modern-status sd-modern-status--plain ms-2">
          {{ quota.used }} / {{ quota.limit }}
        </span>
      </template>
      <template #append-actions>
        <v-btn :disabled="!can_add" :loading="busy_fetch" color="primary"
               class="sd-modern-button sd-modern-button--primary b-shop-theme-fonts__add" prepend-icon="add"
               @click="openCreateDialog">
          {{ $t('b_shop_theme_typography.custom_fonts.actions.add') }}
        </v-btn>
      </template>
    </u-widget-header>

    <p class="sd-modern-subtitle b-shop-theme-fonts__subtitle">
      {{ $t("b_shop_theme_typography.custom_fonts.subtitle") }}
    </p>
    <p class="b-shop-theme-fonts__quota">
      {{ quota_caption }}
      <span v-if="!can_write"> · {{ $t('error.no_write_access') }}</span>
      <span v-else-if="!can_add"> · {{ $t('b_shop_theme_typography.custom_fonts.quota_reached') }}</span>
    </p>

    <u-loading-progress v-if="busy_fetch" />

    <v-list
      v-else-if="fonts.length"
      class="b-shop-theme-fonts__list border-between-vertical bg-transparent"
      lines="three"
    >
      <v-list-item
        v-for="font in fonts"
        :key="font.id"
        :class="{ 'sd-modern-clickable-item': can_write, disabled: busy_delete === font.id }"
        @click="can_write ? openEditDialog(font) : undefined"
      >
        <template #prepend>
          <v-avatar
            class="me-2 rounded-lg"
            color="grey-lighten-4"
            :style="fontPreviewStyle(font)"
          >
            Aa
          </v-avatar>
        </template>

        <template #title>
          <div class="d-flex align-center flex-wrap ga-1">
            <span class="b-shop-theme-fonts__name">{{ font.name }}</span>
            <v-chip
              v-for="(face, faceIndex) in font.faces || []"
              :key="`${font.id}-${face.weight}-${face.style}-${faceIndex}`"
              label
              size="x-small"
              variant="text"
            >
              {{ face.weight }}
              <span v-if="face.style && face.style !== 'normal'" class="ms-1">
                {{ fontStyleTitle(face.style) }}
              </span>
            </v-chip>
          </div>
        </template>

        <template #subtitle>
          <div class="b-shop-theme-fonts__sample" :style="fontPreviewStyle(font)">
            {{ $t('b_shop_theme_typography.main_font.preview_title') }}
          </div>
          <div class="b-shop-theme-fonts__metadata">
            <span v-for="format in fontFormats(font)" :key="format">
              {{ format.toUpperCase() }}
            </span>
          </div>
          <details class="b-shop-theme-fonts__css" @click.stop @keydown.stop>
            <summary>{{ $t('b_shop_theme_typography.custom_fonts.css_name') }}</summary>
            <p>{{ $t('b_shop_theme_typography.custom_fonts.css_name_hint') }}</p>
            <code v-copy="cssFamily(font.family, font.fallback)" dir="ltr">
              {{ cssFamily(font.family, font.fallback) }}
            </code>
          </details>
        </template>

        <template #append>
          <u-smart-menu
            :items="fontMenuItems(font)"
            :loading="busy_delete === font.id"
            @click.stop
          />
        </template>
      </v-list-item>
    </v-list>

    <div v-else class="sd-modern-empty-state text-center">
      <v-icon class="op-0-3" size="36">font_download</v-icon>
      <h3 class="font-weight-light mt-2">
        {{ $t("b_shop_theme_typography.custom_fonts.empty_title") }}
      </h3>
      <p class="mb-0 mt-1">
        {{ $t("b_shop_theme_typography.custom_fonts.empty_description") }}
      </p>
    </div>
  </div>

  <!-- █████████████████ Dialog > Add / Edit custom font █████████████████ -->
  <v-bottom-sheet
    v-model="dialog"
    content-class="font-dialog-sheet"
    max-width="900"
    :fullscreen="$vuetify.display.xs"
    scrollable
    width="100%"
    aria-labelledby="custom-font-dialog-title"
    aria-describedby="custom-font-dialog-description"
    @after-leave="dialogTrigger?.focus()"
  >
    <v-card class="b-shop-theme-fonts-dialog font-dialog-card sd-modern-widget text-start" rounded="t-xl">
      <div class="font-dialog-header">
        <div class="font-dialog-icon" aria-hidden="true">
          <v-icon size="22">font_download</v-icon>
        </div>
        <div class="flex-grow-1 min-width-0">
          <h2 id="custom-font-dialog-title" class="font-dialog-title">
            {{
              editing
                ? $t("b_shop_theme_typography.custom_fonts.dialog.edit_title")
                : $t("b_shop_theme_typography.custom_fonts.dialog.add_title")
            }}
          </h2>
          <p id="custom-font-dialog-description" class="font-dialog-subtitle">
            {{ $t("b_shop_theme_typography.custom_fonts.dialog.subtitle") }}
          </p>
        </div>
        <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }">
            <v-btn v-bind="props" :aria-label="$t('global.actions.close')"
                   class="sd-modern-icon-button" icon="close" variant="text"
                   @click="dialog = false" />
          </template>
          {{ $t('global.actions.close') }}
        </v-tooltip>
      </div>

      <v-card-text class="font-dialog-body">
        <section class="font-dialog-section">
          <h3 class="font-section-title font-family-heading">
            {{ $t('b_shop_theme_typography.custom_fonts.dialog.family_title') }}
          </h3>
          <v-row class="font-family-controls" dense>
            <v-col cols="12" sm="7">
              <v-text-field
                v-model="form.name"
                bg-color="surface"
                :counter="80"
                density="comfortable"
                :disabled="busy_save"
                :label="$t('b_shop_theme_typography.custom_fonts.inputs.name')"
                :messages="
                  $t('b_shop_theme_typography.custom_fonts.inputs.name_message')
                "
                persistent-placeholder
                prepend-inner-icon="text_fields"
                rounded="lg"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" sm="5">
              <v-select
                v-model="form.fallback"
                bg-color="surface"
                density="comfortable"
                :disabled="busy_save"
                :items="font_fallbacks"
                :label="
                  $t('b_shop_theme_typography.custom_fonts.inputs.fallback')
                "
                :messages="
                  $t(
                    'b_shop_theme_typography.custom_fonts.inputs.fallback_message',
                  )
                "
                persistent-placeholder
                prepend-inner-icon="font_download_off"
                rounded="lg"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <details v-if="form.family" class="font-css-details">
            <summary>{{ $t('b_shop_theme_typography.custom_fonts.css_name') }}</summary>
            <p>{{ $t('b_shop_theme_typography.custom_fonts.css_name_hint') }}</p>
            <div class="font-css-token">
              <div class="font-css-token__content min-width-0">
                <code dir="ltr">{{ cssFamily(form.family, form.fallback) }}</code>
              </div>
              <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }">
                  <v-btn v-bind="props" v-copy="cssFamily(form.family, form.fallback)"
                         class="sd-modern-icon-button" icon="content_copy" variant="text"
                         :aria-label="$t('global.actions.copy')" />
                </template>
                {{ $t('global.actions.copy') }}
              </v-tooltip>
            </div>
          </details>
        </section>

        <section class="font-dialog-section font-faces-section">
          <div class="font-faces-header">
            <div class="min-width-0">
              <h3 class="font-section-title">
                {{ $t("b_shop_theme_typography.custom_fonts.faces.title") }}
              </h3>
              <div class="font-section-subtitle">
                {{ $t("b_shop_theme_typography.custom_fonts.faces.subtitle") }}
              </div>
            </div>
            <v-btn
              class="sd-modern-button"
              :disabled="busy_save || form.faces.length >= 18"
              prepend-icon="add"
              size="small"
              variant="outlined"
              @click="addFace"
            >
              {{
                $t("b_shop_theme_typography.custom_fonts.actions.add_weight")
              }}
            </v-btn>
          </div>

          <p class="font-upload-note">
            <v-icon aria-hidden="true" size="18">upload_file</v-icon>
            <span>
              {{ $t('b_shop_theme_typography.custom_fonts.file_hint', {
                size: readableFileSize(max_file_size),
                formats: allowed_formats.map((format) => format.toUpperCase()).join(', '),
              }) }}
            </span>
          </p>

          <section
            v-for="(face, index) in form.faces"
            :key="face.key"
            class="font-face-row"
            :aria-label="$t('b_shop_theme_typography.custom_fonts.faces.face', { index: index + 1 })"
          >
            <div class="font-face-row__header">
              <div class="d-flex align-center ga-2 min-width-0">
                <span class="font-face-index" aria-hidden="true">Aa</span>
                <div class="min-width-0">
                  <h4 class="font-face-title">
                    {{ $t('b_shop_theme_typography.custom_fonts.faces.face', { index: index + 1 }) }}
                  </h4>
                  <div class="font-face-summary">
                    {{ face.weight }} · {{ fontStyleTitle(face.style) }}
                  </div>
                </div>
              </div>
              <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
                <template #activator="{ props }">
                  <v-btn v-bind="props" :aria-label="$t('global.actions.delete')"
                         :disabled="busy_save || form.faces.length <= 1"
                         class="sd-modern-icon-button" icon="delete_outline" variant="text"
                         @click="removeFace(index)" />
                </template>
                {{ $t('global.actions.delete') }}
              </v-tooltip>
            </div>

            <div class="font-face-controls">
              <div class="font-face-control">
                <label :for="`font-weight-${face.key}`" class="font-control-label">
                  {{ $t('b_shop_theme_typography.custom_fonts.inputs.weight') }}
                </label>
                <v-select
                  :id="`font-weight-${face.key}`"
                  v-model="face.weight"
                  bg-color="surface"
                  class="font-weight-select"
                  density="compact"
                  :disabled="busy_save"
                  hide-details
                  :items="font_weights"
                  :aria-label="
                    $t('b_shop_theme_typography.custom_fonts.inputs.weight')
                  "
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="format_size"
                  rounded="lg"
                  variant="outlined"

                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props" :prepend-icon="item.raw.icon" />
                  </template>
                </v-select>
              </div>

              <div class="font-face-control">
                <div :id="`font-style-${face.key}`" class="font-control-label">
                  {{ $t('b_shop_theme_typography.custom_fonts.inputs.style') }}
                </div>
                <v-btn-toggle
                  v-model="face.style"
                  role="group"
                  :aria-labelledby="`font-style-${face.key}`"
                  class="font-style-toggle"
                  density="compact"
                  :disabled="busy_save"
                  mandatory
                  rounded="lg"
                >
                  <v-btn
                    v-for="style in font_styles"
                    :key="style.value"
                    :value="style.value"
                    :aria-pressed="face.style === style.value"
                    variant="text"
                  >
                    <v-icon start>{{ style.icon }}</v-icon>
                    {{ style.title }}
                  </v-btn>
                </v-btn-toggle>
              </div>

              <div class="font-face-control font-face-files">
                <v-file-input
                  :accept="file_accept"
                  bg-color="surface"
                  chips
                  density="compact"
                  :disabled="busy_save"
                  :error-messages="face.error ? [face.error] : []"
                  :label="
                    $t('b_shop_theme_typography.custom_fonts.inputs.files')
                  "
                  :hint="$t('b_shop_theme_typography.custom_fonts.faces.files_hint')"
                  persistent-hint
                  multiple
                  prepend-icon=""
                  prepend-inner-icon="attach_file"
                  rounded="lg"
                  show-size
                  variant="outlined"
                  :model-value="face.new_files"
                  @update:model-value="(files) => onFilesChanged(face, files)"
                >
                  <template #selection>
                    <v-tooltip v-for="file in face.new_files" :key="file.name"
                               location="top" content-class="sd-modern-tooltip text-start">
                      <template #activator="{ props }">
                        <v-chip v-bind="props" tabindex="0" size="small">
                          {{ file.name }} ({{ readableFileSize(file.size) }})
                        </v-chip>
                      </template>
                      {{ file.name }}
                    </v-tooltip>
                  </template>
                </v-file-input>
              </div>
            </div>

            <div v-if="face.files.length" class="font-stored-files">
              <v-tooltip
                v-for="file in face.files"
                :key="file.id"
                location="top"
                content-class="sd-modern-tooltip text-start"
              >
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    tabindex="0"
                    :disabled="busy_save"
                    closable
                    label
                    size="small"
                    variant="outlined"
                    @click:close="removeStoredFile(face, file)"
                  >
                    <v-icon size="small" start>description</v-icon>
                    <span class="font-stored-file-name">{{ file.original_name || String(file.format).toUpperCase() }}</span>
                    <small class="ms-1 text-medium-emphasis">
                      {{ String(file.format || "").toUpperCase() }}
                      <template v-if="file.size">
                        · {{ readableFileSize(file.size) }}
                      </template>
                    </small>
                  </v-chip>
                </template>
                {{ file.original_name || String(file.format).toUpperCase() }}
              </v-tooltip>
            </div>
          </section>
        </section>

        <div
          v-if="form_error"
          class="sd-modern-notice mt-4"
          role="alert"
        >
          <v-icon color="error" aria-hidden="true">error_outline</v-icon>
          <span>{{ form_error }}</span>
        </div>
      </v-card-text>

      <div class="font-dialog-footer">
        <p>{{ $t('b_shop_theme_typography.custom_fonts.dialog.save_hint') }}</p>
        <div class="font-dialog-actions">
          <v-btn
            class="sd-modern-button"
            :disabled="busy_save"
            variant="text"
            @click="dialog = false"
          >
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            :loading="busy_save"
            :prepend-icon="editing ? 'save' : 'add'"
            variant="flat"
            @click="saveFont"
          >
            {{
              editing
                ? $t("global.actions.save_changes")
                : $t("global.actions.create")
            }}
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";
import { FontLoader } from "@selldone/core-js/helper/font/FontLoader.ts";

const MAX_FONT_FILE_SIZE = 2 * 1024 * 1024;
const STANDARD_FONT_FORMATS = ["woff2", "woff", "ttf", "otf"];

type StoredFontFile = {
  id: number;
  format: string;
  original_name?: string | null;
  url?: string | null;
  size?: number | null;
};

type EditableFace = {
  key: string;
  id?: number | null;
  weight: number;
  style: "normal" | "italic";
  files: StoredFontFile[];
  new_files: File[];
  error: string | null;
};

export default defineComponent({
  name: "BShopThemeCustomFonts",
  components: { ULoadingProgress, USmartMenu, UWidgetHeader },
  emits: ["update:modelValue", "delete"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      fonts: [] as any[],
      quota: {
        used: 0,
        limit: 0,
        remaining: 0,
        can_add: false,
        max_file_size: MAX_FONT_FILE_SIZE,
        allowed_formats: [...STANDARD_FONT_FORMATS],
      },
      busy_fetch: false,
      busy_save: false,
      busy_delete: null as number | null,
      dialog: false,
      dialogTrigger: null as HTMLElement | null,
      editing: false,
      form_error: null as string | null,
      form: {
        id: null as number | null,
        name: "",
        fallback: "sans-serif",
        family: null as string | null,
        faces: [] as EditableFace[],
      },
    };
  },
  computed: {
    can_write(): boolean {
      return this.writeShopAccess(ShopPermissionRegions.SETTINGS.code);
    },
    can_add(): boolean {
      return (
        this.can_write &&
        this.quota.can_add !== false &&
        this.quota.limit > this.fonts.length
      );
    },
    quota_caption(): string {
      return this.$t("b_shop_theme_typography.custom_fonts.quota", {
        used: this.quota.used,
        limit: this.quota.limit,
      });
    },
    allowed_formats(): string[] {
      const formats = Array.isArray(this.quota.allowed_formats)
        ? this.quota.allowed_formats
        : STANDARD_FONT_FORMATS;
      return formats
        .map((format) => String(format).toLowerCase())
        .filter((format) => STANDARD_FONT_FORMATS.includes(format));
    },
    max_file_size(): number {
      const serverLimit =
        Number(this.quota.max_file_size) || MAX_FONT_FILE_SIZE;
      return Math.min(serverLimit, MAX_FONT_FILE_SIZE);
    },
    file_accept(): string {
      return [
        ...this.allowed_formats.map((format) => `.${format}`),
        "font/woff2",
        "font/woff",
        "font/ttf",
        "font/otf",
        "application/font-woff",
        "application/x-font-ttf",
        "application/x-font-opentype",
      ].join(",");
    },
    font_weights() {
      return Array.from({ length: 9 }, (_, index) => {
        const value = (index + 1) * 100;
        return {
          value,
          icon:
            value >= 700
              ? "format_bold"
              : value === 400
                ? "text_fields"
                : "format_size",
          title: `${value}${
            value === 400
              ? ` · ${this.$t("b_shop_theme_typography.custom_fonts.weights.regular")}`
              : value === 700
                ? ` · ${this.$t("b_shop_theme_typography.custom_fonts.weights.bold")}`
                : ""
          }`,
        };
      });
    },
    font_styles() {
      return [
        {
          value: "normal",
          icon: "text_fields",
          title: this.$t("b_shop_theme_typography.custom_fonts.styles.normal"),
        },
        {
          value: "italic",
          icon: "format_italic",
          title: this.$t("b_shop_theme_typography.custom_fonts.styles.italic"),
        },
      ];
    },
    font_fallbacks() {
      return ["sans-serif", "serif", "monospace", "system-ui", "cursive"];
    },
  },
  created() {
    this.fonts = Array.isArray(this.modelValue) ? [...this.modelValue] : [];
    this.loadFontCatalog();
    this.fetchFonts();
  },
  methods: {
    fetchFonts() {
      this.busy_fetch = true;
      axios
        .get(window.API.GET_SHOP_FONTS(this.shop.id))
        .then(({ data }) => {
          if (data?.error || data?.success === false) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.fonts = Array.isArray(data?.fonts) ? data.fonts : [];
          this.applyQuota(data?.quota);
          this.syncFonts();
          this.loadFontCatalog();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy_fetch = false;
        });
    },
    applyQuota(quota: any) {
      if (quota && typeof quota === "object") {
        this.quota = { ...this.quota, ...quota };
      }
      this.quota.used = Number(this.quota.used ?? this.fonts.length);
      if (!Number.isFinite(this.quota.used))
        this.quota.used = this.fonts.length;
      this.quota.remaining = Math.max(0, this.quota.limit - this.quota.used);
      this.quota.can_add = this.quota.remaining > 0;
    },
    syncFonts() {
      this.quota.used = this.fonts.length;
      this.quota.remaining = Math.max(0, this.quota.limit - this.quota.used);
      this.quota.can_add = this.quota.remaining > 0;
      this.shop.custom_fonts = [...this.fonts];
      this.$emit("update:modelValue", [...this.fonts]);
    },
    loadFontCatalog() {
      FontLoader.LoadCustomFonts(this.fonts);
    },
    openCreateDialog() {
      if (!this.can_add) return;
      this.dialogTrigger = typeof document === "undefined" ? null : document.activeElement as HTMLElement;
      this.editing = false;
      this.form_error = null;
      this.form = {
        id: null,
        name: "",
        fallback: "sans-serif",
        family: null,
        faces: [this.createFace(400, "normal")],
      };
      this.dialog = true;
    },
    openEditDialog(font: any) {
      if (!this.can_write) return;
      this.dialogTrigger = typeof document === "undefined" ? null : document.activeElement as HTMLElement;
      this.editing = true;
      this.form_error = null;
      this.form = {
        id: Number(font.id),
        name: font.name || "",
        fallback: font.fallback || "sans-serif",
        family: font.family || null,
        faces:
          Array.isArray(font.faces) && font.faces.length
            ? font.faces.map((face) =>
                this.createFace(
                  Number(face.weight) || 400,
                  face.style === "italic" ? "italic" : "normal",
                  face,
                ),
              )
            : [this.createFace(400, "normal")],
      };
      this.dialog = true;
    },
    createFace(
      weight = 400,
      style: "normal" | "italic" = "normal",
      face: any = null,
    ): EditableFace {
      return {
        key: `${face?.id || "new"}-${Date.now()}-${Math.random()}`,
        id: face?.id || null,
        weight,
        style,
        files: Array.isArray(face?.sources)
          ? face.sources.map((file) => ({ ...file }))
          : Array.isArray(face?.files)
            ? face.files.map((file) => ({ ...file }))
            : [],
        new_files: [],
        error: null,
      };
    },
    addFace() {
      const used = new Set(
        this.form.faces.map((face) => `${face.weight}-${face.style}`),
      );
      const weights = [400, 700, 300, 500, 600, 200, 800, 100, 900];
      const next = ["normal", "italic"]
        .flatMap((style) => weights.map((weight) => ({ weight, style })))
        .find(({ weight, style }) => !used.has(`${weight}-${style}`));

      if (next) {
        this.form.faces.push(
          this.createFace(next.weight, next.style as "normal" | "italic"),
        );
      }
    },
    removeFace(index: number) {
      if (this.form.faces.length > 1) this.form.faces.splice(index, 1);
    },
    removeStoredFile(face: EditableFace, file: StoredFontFile) {
      face.files = face.files.filter((item) => item.id !== file.id);
      face.error = this.validateFaceFiles(face);
    },
    onFilesChanged(face: EditableFace, files: File[] | File | null) {
      face.new_files = Array.isArray(files) ? files : files ? [files] : [];
      face.error = this.validateFaceFiles(face);
    },
    validateFiles(files: File[]): string | null {
      const formats = new Set<string>();
      for (const file of files) {
        const format = this.fileFormat(file);
        if (!format || !this.allowed_formats.includes(format)) {
          return this.$t("b_shop_theme_typography.custom_fonts.errors.format", {
            name: file.name,
          });
        }
        if (file.size > this.max_file_size) {
          return this.$t("b_shop_theme_typography.custom_fonts.errors.size", {
            name: file.name,
            size: this.readableFileSize(this.max_file_size),
          });
        }
        if (formats.has(format)) {
          return this.$t(
            "b_shop_theme_typography.custom_fonts.errors.duplicate_format",
            {
              format: format.toUpperCase(),
            },
          );
        }
        formats.add(format);
      }
      return null;
    },
    validateFaceFiles(face: EditableFace): string | null {
      const validationError = this.validateFiles(face.new_files);
      if (validationError) return validationError;

      const formats = new Set<string>();
      const combinedFormats = [
        ...face.files.map((file) => String(file.format || "").toLowerCase()),
        ...face.new_files.map((file) => this.fileFormat(file)),
      ].filter(Boolean);
      for (const format of combinedFormats) {
        if (formats.has(format)) {
          return this.$t(
            "b_shop_theme_typography.custom_fonts.errors.duplicate_format",
            { format: format.toUpperCase() },
          );
        }
        formats.add(format);
      }
      return null;
    },
    validateForm(): boolean {
      this.form_error = null;
      if (!this.form.name?.trim()) {
        this.form_error = this.$t(
          "b_shop_theme_typography.custom_fonts.errors.name_required",
        );
        return false;
      }
      if (this.form.name.trim().length > 80) {
        this.form_error = this.$t(
          "b_shop_theme_typography.custom_fonts.errors.name_length",
        );
        return false;
      }
      if (!this.form.faces.length) {
        this.form_error = this.$t(
          "b_shop_theme_typography.custom_fonts.errors.face_required",
        );
        return false;
      }

      const pairs = new Set<string>();
      for (const face of this.form.faces) {
        const pair = `${face.weight}-${face.style}`;
        if (pairs.has(pair)) {
          this.form_error = this.$t(
            "b_shop_theme_typography.custom_fonts.errors.duplicate_face",
          );
          return false;
        }
        pairs.add(pair);

        face.error = this.validateFaceFiles(face);
        if (face.error) return false;
        if (!face.files.length && !face.new_files.length) {
          face.error = this.$t(
            "b_shop_theme_typography.custom_fonts.errors.file_required",
          );
          return false;
        }
      }
      return true;
    },
    buildFormData(): FormData {
      const formData = new FormData();
      formData.append("name", this.form.name.trim());
      formData.append("fallback", this.form.fallback || "sans-serif");
      const faces = this.form.faces.map((face, faceIndex) => {
        const files = face.new_files.map((file, fileIndex) => {
          const key = `font_face_${faceIndex}_${fileIndex}`;
          formData.append(key, file, file.name);
          return { key, format: this.fileFormat(file) };
        });
        return {
          ...(face.id ? { id: face.id } : {}),
          weight: Number(face.weight),
          style: face.style,
          keep_file_ids: face.files.map((file) => file.id),
          files,
        };
      });
      formData.append("faces", JSON.stringify(faces));
      return formData;
    },
    saveFont() {
      if (this.busy_save || !this.can_write || !this.validateForm()) return;
      this.busy_save = true;
      const formData = this.buildFormData();
      const request =
        this.editing && this.form.id
          ? (() => {
              formData.append("_method", "PUT");
              return axios.post(
                window.API.PUT_SHOP_FONT(this.shop.id, this.form.id),
                formData,
              );
            })()
          : axios.post(window.API.POST_SHOP_FONT(this.shop.id), formData);

      request
        .then(({ data }) => {
          if (data?.error || data?.success === false) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          if (Array.isArray(data?.fonts)) {
            this.fonts = data.fonts;
          } else if (data?.font) {
            const index = this.fonts.findIndex(
              (font) => font.id === data.font.id,
            );
            if (index >= 0) this.fonts.splice(index, 1, data.font);
            else this.fonts.unshift(data.font);
          }
          this.applyQuota(data?.quota);
          this.syncFonts();
          this.loadFontCatalog();
          this.dialog = false;
          NotificationService.showSuccessAlert(
            null,
            this.$t(
              this.editing
                ? "b_shop_theme_typography.custom_fonts.notifications.updated"
                : "b_shop_theme_typography.custom_fonts.notifications.created",
            ),
          );
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy_save = false;
        });
    },
    deleteFont(font: any) {
      if (!this.can_write || !font?.id) return;
      NotificationService.openDangerAlert(
        this.$t("b_shop_theme_typography.custom_fonts.delete.title"),
        this.$t("b_shop_theme_typography.custom_fonts.delete.message", {
          name: font.name,
        }),
        this.$t("global.actions.delete"),
        () => {
          this.busy_delete = font.id;
          axios
            .delete(window.API.DELETE_SHOP_FONT(this.shop.id, font.id))
            .then(({ data }) => {
              if (data?.error || data?.success === false) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }
              this.fonts = this.fonts.filter((item) => item.id !== font.id);
              this.applyQuota(data?.quota);
              this.syncFonts();
              this.loadFontCatalog();
              this.$emit("delete", font);
              NotificationService.showSuccessAlert(
                null,
                this.$t(
                  "b_shop_theme_typography.custom_fonts.notifications.deleted",
                ),
              );
            })
            .catch((error) => NotificationService.showLaravelError(error))
            .finally(() => {
              this.busy_delete = null;
            });
        },
      );
    },
    fontMenuItems(font: any) {
      return [
        {
          title: this.$t("global.actions.edit"),
          icon: "edit",
          disabled: !this.can_write,
          click: () => this.openEditDialog(font),
        },
        {
          title: this.$t("global.actions.delete"),
          icon: "delete",
          disabled: !this.can_write,
          click: () => this.deleteFont(font),
        },
      ];
    },
    fileFormat(file: File): string {
      const extension = file.name?.split(".").pop()?.toLowerCase();
      if (extension && STANDARD_FONT_FORMATS.includes(extension))
        return extension;
      const mime: Record<string, string> = {
        "font/woff2": "woff2",
        "font/woff": "woff",
        "application/font-woff": "woff",
        "font/ttf": "ttf",
        "application/x-font-ttf": "ttf",
        "font/otf": "otf",
        "application/x-font-opentype": "otf",
      };
      return mime[file.type] || "";
    },
    fontFormats(font: any): string[] {
      return Array.from(
        new Set(
          (font.faces || []).flatMap((face) =>
            (face.sources || face.files || []).map((file) =>
              String(file.format || "").toLowerCase(),
            ),
          ),
        ),
      ).filter(Boolean) as string[];
    },
    fontPreviewStyle(font: any) {
      return { fontFamily: this.fontFamilyValue(font?.family, font?.fallback) };
    },
    fontStyleTitle(style: string): string {
      return this.$t(
        `b_shop_theme_typography.custom_fonts.styles.${style === "italic" ? "italic" : "normal"}`,
      );
    },
    fontFamilyValue(
      family: string | null | undefined,
      fallback = "sans-serif",
    ): string | undefined {
      if (!family) return undefined;
      return `'${String(family).replace(/'/g, "\\'")}', ${fallback || "sans-serif"}`;
    },
    cssFamily(
      family: string | null | undefined,
      fallback = "sans-serif",
    ): string {
      return family
        ? `font-family: ${this.fontFamilyValue(family, fallback)};`
        : "";
    },
    readableFileSize(bytes: number): string {
      const value = Number(bytes) || 0;
      if (value < 1024) return `${value} B`;
      if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KiB`;
      return `${(value / (1024 * 1024)).toFixed(value % (1024 * 1024) ? 1 : 0)} MiB`;
    },
  },
});
</script>

<style lang="scss" scoped>
.b-shop-theme-fonts {
  min-width: 0;
  &__subtitle { padding: 0; margin: 0; min-height: 0; }
  &__quota { margin: 8px 0 20px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__list :deep(.v-list-item) { padding: 16px 12px; }
  &__list :deep(.v-list-item-subtitle) { display: block; opacity: 1; -webkit-line-clamp: unset; }
  &__name { font-size: 14px; font-weight: 500; line-height: 21px; overflow-wrap: anywhere; }
  &__sample { margin-top: 6px; color: rgb(var(--v-theme-on-surface)); font-size: 18px; line-height: 28px; overflow-wrap: anywhere; }
  &__metadata { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  &__css { margin-top: 4px; }
  &__css > summary { width: fit-content; min-height: 32px; padding-block: 6px; cursor: pointer; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; }
  &__css > summary:focus-visible { border-radius: 4px; outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__css p { margin: 4px 0 8px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__css code { display: block; padding: 8px 12px; color: inherit; background: var(--sd-modern-inset); border-radius: 8px; font-size: 12px; line-height: 20px; overflow-wrap: anywhere; white-space: normal; }

  @media (max-width: 600px), (pointer: coarse) {
    &__css > summary { min-height: 44px; padding-block: 12px; }
  }
  @media (max-width: 600px) { &__add { margin-block-start: 12px; } }
}

.b-shop-theme-fonts-dialog {
  --sd-modern-border: rgba(var(--v-theme-on-surface), .09);
  --sd-modern-muted: rgba(var(--v-theme-on-surface), .66);
  &.font-dialog-card {
    display: grid !important;
    flex: none !important;
    grid-template-rows: auto minmax(0, 1fr) auto;
    max-height: calc(100dvh - 24px) !important;
    min-height: 0;
    overflow: hidden;
    padding: 0;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
    border-end-start-radius: 0 !important;
    border-end-end-radius: 0 !important;
  }
  .font-dialog-header { display: flex; align-items: flex-start; gap: 12px; padding: 22px 24px 20px; border-block-end: 1px solid var(--sd-modern-border); }
  .font-dialog-icon { display: grid; flex: 0 0 24px; height: 27px; place-items: center; color: var(--sd-modern-muted); }
  .font-dialog-title { margin: 0; font-family: inherit; font-size: 19px; font-weight: 500; line-height: 27px; }
  .font-dialog-subtitle, .font-section-subtitle { margin: 6px 0 0; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small, 13px); line-height: 21px; white-space: normal; }
  .font-dialog-body { min-height: 0; padding: 24px !important; overflow-y: auto !important; overscroll-behavior: contain; background: var(--sd-modern-inset); }
  .font-dialog-section { min-width: 0; }
  .font-section-title { margin: 0; font-family: inherit; font-size: 15px; font-weight: 500; line-height: 23px; }
  .font-family-heading { margin-block-end: 18px; }
  .font-family-controls { row-gap: 12px; }
  .font-dialog-section :deep(.v-field__input), .font-dialog-section :deep(.v-field-label) { font-family: inherit; font-size: var(--sd-modern-font-body, 14px); line-height: 22px; }
  .font-dialog-section :deep(.v-input__details) { padding-inline: 0; font-size: var(--sd-modern-font-small, 13px); line-height: 20px; }
  .font-dialog-section :deep(.v-messages) { font-size: inherit; line-height: inherit; }
  .font-dialog-section :deep(.v-messages__message) { line-height: 20px; }
  .font-css-details { margin-top: 10px; }
  .font-css-details > summary { width: fit-content; min-height: 44px; padding-block: 12px; cursor: pointer; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .font-css-details > summary:focus-visible { border-radius: 4px; outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  .font-css-details > p { margin: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .font-css-token { display: flex; align-items: center; gap: 12px; min-width: 0; margin-top: 10px; padding: 11px 12px; background: rgb(var(--v-theme-surface)); border-radius: 10px; }
  .font-css-token__content { flex: 1 1 auto; }
  .font-css-token__content code { display: block; color: inherit; font-size: 13px; overflow-wrap: anywhere; white-space: normal; }
  .font-faces-section { margin-block-start: 28px; }
  .font-faces-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .font-faces-header > .v-btn { flex-shrink: 0; }
  .font-upload-note { display: flex; align-items: flex-start; gap: 8px; margin: 12px 0 18px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .font-upload-note > .v-icon { flex-shrink: 0; margin-top: 2px; }
  .font-face-row { min-width: 0; margin-block-start: 12px; padding: 18px; background: rgb(var(--v-theme-surface)); border: 1px solid var(--sd-modern-border); border-radius: 12px; }
  .font-face-row__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
  .font-face-index { display: inline-grid; width: 40px; height: 40px; flex: 0 0 40px; place-items: center; color: var(--sd-modern-muted); font-size: 17px; background: var(--sd-modern-inset); border-radius: 10px; }
  .font-face-title { margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
  .font-face-summary { margin-top: 2px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  .font-face-controls { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px 20px; }
  .font-face-control { min-width: 0; }
  .font-control-label { display: block; margin-bottom: 8px; color: inherit; font-size: 13px; font-weight: 400; line-height: 20px; }
  .font-face-files { grid-column: 1 / -1; }
  .font-weight-select :deep(.v-field__input) { min-height: 44px; }
  .font-style-toggle { width: 100%; height: 44px !important; gap: 4px; padding: 3px; background: var(--sd-modern-inset); border: 1px solid var(--sd-modern-border); }
  .font-style-toggle :deep(.v-btn) { min-width: 0; height: 36px !important; flex: 1 1 0; color: var(--sd-modern-muted); font-family: inherit; font-size: 13px; font-weight: 400; letter-spacing: 0; text-transform: none; border-radius: 7px !important; }
  .font-style-toggle :deep(.v-btn--active) { color: rgb(var(--v-theme-on-surface)) !important; background: rgb(var(--v-theme-surface)) !important; box-shadow: var(--sd-modern-selected-shadow); --v-activated-opacity: 0; }
  .font-stored-files { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .font-stored-files :deep(.v-chip) { max-width: 100%; min-width: 0; color: inherit; background: var(--sd-modern-inset); border-color: var(--sd-modern-border); }
  .font-stored-files :deep(.v-chip__content) { min-width: 0; }
  .font-stored-files small { flex-shrink: 0; font-size: 13px; }
  .font-stored-file-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .font-face-files :deep(.v-file-input .v-field__input) { min-width: 0; overflow: hidden; }
  .font-face-files :deep(.v-chip) { max-width: 100%; }
  .font-face-files :deep(.v-chip__content) { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .font-dialog-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 16px 24px max(18px, env(safe-area-inset-bottom)); background: rgb(var(--v-theme-surface)); border-block-start: 1px solid var(--sd-modern-border); }
  .font-dialog-footer > p { margin: 0; max-width: 390px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .font-dialog-actions { display: flex; flex: 0 0 auto; gap: 10px; }
  .font-dialog-actions .sd-modern-button { min-height: 44px; margin: 0; padding-inline: 18px; font-size: 13px; }
  .min-width-0 { min-width: 0; }

  @media (max-width: 600px) {
    &.font-dialog-card { height: 100dvh !important; max-height: 100dvh !important; }
    .font-dialog-header { gap: 10px; padding: 18px 16px; }
    .font-dialog-title { font-size: 17px; line-height: 25px; }
    .font-dialog-body { padding: 20px 16px !important; }
    .font-faces-header { flex-wrap: wrap; gap: 12px; }
    .font-face-row { padding: 16px; }
    .font-face-controls { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    .font-dialog-footer { display: grid; grid-template-columns: minmax(0, 1fr); justify-content: stretch; gap: 12px; padding: 12px 16px max(12px, env(safe-area-inset-bottom)); }
    .font-dialog-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .font-style-toggle { height: 52px !important; }
    .font-style-toggle :deep(.v-btn) { height: 44px !important; }
    .font-weight-select :deep(.v-field__input) { min-height: 52px; }
    .font-faces-header > .v-btn { min-height: 44px; }
  }
}
</style>

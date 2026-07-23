<!--
  - Copyright (c) 2026. Selldone® Business OS™
  -
  - Shop custom font manager.
  -->
<template>
  <div class="widget-box mb-5">
    <u-widget-header
      :add-caption="$t('b_shop_theme_typography.custom_fonts.actions.add')"
      :add-loading="busy_fetch"
      :add-sub-caption="quota_caption"
      :disabled="!can_add"
      :disabled-access="!can_write"
      :disabled-reason="
        $t('b_shop_theme_typography.custom_fonts.quota_reached')
      "
      icon="font_download"
      :title="$t('b_shop_theme_typography.custom_fonts.title')"
      @click:add="openCreateDialog"
    >
      <template #append-title>
        <v-chip class="ms-2" label size="x-small" variant="tonal">
          {{ quota.used }} / {{ quota.limit }}
        </v-chip>
      </template>
    </u-widget-header>

    <v-list-subheader>
      {{ $t("b_shop_theme_typography.custom_fonts.subtitle") }}
    </v-list-subheader>

    <u-loading-progress v-if="busy_fetch" />

    <v-list
      v-else-if="fonts.length"
      class="border-between-vertical bg-transparent"
      lines="three"
    >
      <v-list-item
        v-for="font in fonts"
        :key="font.id"
        :class="{ 'row-hover': can_write, disabled: busy_delete === font.id }"
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
            <b :style="fontPreviewStyle(font)">{{ font.name }}</b>
            <v-chip
              v-for="(face, faceIndex) in font.faces || []"
              :key="`${font.id}-${face.weight}-${face.style}-${faceIndex}`"
              label
              size="x-small"
              variant="tonal"
            >
              {{ face.weight }}
              <span v-if="face.style && face.style !== 'normal'" class="ms-1">
                {{ fontStyleTitle(face.style) }}
              </span>
            </v-chip>
          </div>
        </template>

        <template #subtitle>
          <div class="mt-1">
            <code
              v-copy="cssFamily(font.family, font.fallback)"
              class="d-inline-block text-start"
              dir="ltr"
              @click.stop
              >{{ cssFamily(font.family, font.fallback) }}</code
            >

            <div class="d-flex flex-wrap ga-1 mt-1">
              <v-chip
                v-for="format in fontFormats(font)"
                :key="format"
                label
                size="x-small"
              >
                {{ format.toUpperCase() }}
              </v-chip>
            </div>
          </div>
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

    <div v-else class="py-8 text-center text-medium-emphasis">
      <v-icon class="op-0-3" size="64">font_download</v-icon>
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
    attach
    content-class="font-dialog-sheet"
    max-width="780"
    scrollable
    width="98vw"
  >
    <v-card class="font-dialog-card text-start" rounded="t-xl">
      <div class="font-dialog-header">
        <div class="font-dialog-icon" aria-hidden="true">
          <v-icon size="22">font_download</v-icon>
        </div>
        <div class="flex-grow-1 min-width-0">
          <div class="font-dialog-title">
            {{
              editing
                ? $t("b_shop_theme_typography.custom_fonts.dialog.edit_title")
                : $t("b_shop_theme_typography.custom_fonts.dialog.add_title")
            }}
          </div>
          <div class="font-dialog-subtitle">
            {{ $t("b_shop_theme_typography.custom_fonts.dialog.subtitle") }}
          </div>
        </div>
        <v-btn
          :aria-label="$t('global.actions.close')"
          class="font-dialog-close"
          icon="close"
          size="small"
          variant="text"
          @click="dialog = false"
        />
      </div>

      <v-divider />

      <v-card-text class="font-dialog-body">
        <section class="font-dialog-section">
          <v-row dense>
            <v-col cols="12" sm="7">
              <v-text-field
                v-model="form.name"
                bg-color="white"
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
                bg-color="white"
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

          <div v-if="form.family" class="font-css-token">
            <div class="font-css-token__content min-width-0">
              <div class="font-css-token__label">
                {{ $t("b_shop_theme_typography.custom_fonts.css_name") }}
              </div>
              <code dir="ltr">{{ cssFamily(form.family, form.fallback) }}</code>
            </div>
            <v-btn
              v-copy="cssFamily(form.family, form.fallback)"
              icon="content_copy"
              size="small"
              variant="text"
            />
          </div>
        </section>

        <div class="font-upload-note">
          <v-icon aria-hidden="true" size="19">info</v-icon>
          <span>
            {{
              $t("b_shop_theme_typography.custom_fonts.file_hint", {
                size: readableFileSize(max_file_size),
                formats: allowed_formats
                  .map((format) => format.toUpperCase())
                  .join(", "),
              })
            }}
          </span>
        </div>

        <section class="font-dialog-section font-faces-section">
          <div class="font-faces-header">
            <div class="min-width-0">
              <div class="font-section-title">
                {{ $t("b_shop_theme_typography.custom_fonts.faces.title") }}
              </div>
              <div class="font-section-subtitle">
                {{ $t("b_shop_theme_typography.custom_fonts.faces.subtitle") }}
              </div>
            </div>
            <v-btn
              class="font-add-face-btn"
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

          <div
            v-for="(face, index) in form.faces"
            :key="face.key"
            class="font-face-row"
          >
            <div class="font-face-row__header">
              <div class="d-flex align-center ga-2 min-width-0">
                <span class="font-face-index">{{ index + 1 }}</span>
                <div class="font-face-summary">
                  {{ face.weight }} · {{ fontStyleTitle(face.style) }}
                </div>
              </div>
              <v-btn
                :aria-label="$t('global.actions.delete')"
                :disabled="busy_save || form.faces.length <= 1"
                icon="delete_outline"
                size="x-small"
                variant="text"
                @click="removeFace(index)"
              />
            </div>

            <v-row align="start" dense>
              <v-col cols="12" sm="5" md="3">
                <v-select
                  v-model="face.weight"
                  bg-color="white"
                  class="font-weight-select"
                  density="compact"
                  :disabled="busy_save"
                  hide-details
                  :items="font_weights"
                  :label="
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
              </v-col>

              <v-col cols="12" sm="7" md="4">

                <v-btn-toggle
                  v-model="face.style"
                  class="font-style-toggle"
                  color="black"
                  density="compact"
                  :disabled="busy_save"
                  mandatory
                  rounded="lg"
                >
                  <v-btn
                    v-for="style in font_styles"
                    :key="style.value"
                    :value="style.value"
                    variant="text"
                  >
                    <v-icon start>{{ style.icon }}</v-icon>
                    {{ style.title }}
                  </v-btn>
                </v-btn-toggle>
              </v-col>

              <v-col cols="12" md="5">
                <v-file-input
                  :accept="file_accept"
                  bg-color="white"
                  chips
                  density="compact"
                  :disabled="busy_save"
                  :error-messages="face.error ? [face.error] : []"
                  :label="
                    $t('b_shop_theme_typography.custom_fonts.inputs.files')
                  "
                  multiple
                  prepend-icon=""
                  prepend-inner-icon="attach_file"
                  rounded="lg"
                  show-size
                  variant="outlined"
                  :model-value="face.new_files"
                  @update:model-value="(files) => onFilesChanged(face, files)"
                />
              </v-col>
            </v-row>

            <div v-if="face.files.length" class="font-stored-files">
              <v-chip
                v-for="file in face.files"
                :key="file.id"
                :disabled="busy_save"
                closable
                label
                size="small"
                variant="outlined"
                @click:close="removeStoredFile(face, file)"
              >
                <v-icon size="small" start>description</v-icon>
                {{ file.original_name || String(file.format).toUpperCase() }}
                <small class="ms-1 text-medium-emphasis">
                  {{ String(file.format || "").toUpperCase() }}
                  <template v-if="file.size">
                    · {{ readableFileSize(file.size) }}
                  </template>
                </small>
              </v-chip>
            </div>
          </div>
        </section>

        <v-alert
          v-if="form_error"
          class="mt-4"
          density="compact"
          type="error"
          variant="tonal"
        >
          {{ form_error }}
        </v-alert>
      </v-card-text>

      <div class="font-dialog-footer">
        <v-btn
          :disabled="busy_save"
          size="large"
          variant="text"
          @click="dialog = false"
        >
          {{ $t("global.actions.cancel") }}
        </v-btn>
        <v-btn
          class="font-dialog-save"
          :loading="busy_save"
          :prepend-icon="editing ? 'save' : 'add'"
          size="large"
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
            size: readableFileSize(this.max_file_size),
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
      if (!this.can_write || !this.validateForm()) return;
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
.font-dialog-card {
  overflow: hidden;
  background: #fff;
  color: #141414;
  border: 1px solid #e7e7e9;
  box-shadow: 0 -16px 50px rgba(0, 0, 0, 0.12) !important;
}

.font-dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: #fff;
}

.font-dialog-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  color: #111;
  background: #f3f3f4;
  border: 1px solid #e6e6e8;
  border-radius: 12px;
}

.font-dialog-title {
  overflow: hidden;
  color: #111;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-dialog-subtitle,
.font-section-subtitle {
  margin-top: 3px;
  color: #6b6b72;
  font-size: 0.78rem;
  line-height: 1.5;
}

.font-dialog-close {
  color: #555 !important;
  background: #f6f6f7;
}

.font-dialog-body {
  padding: 24px !important;
  background: #fbfbfc;
}

.font-dialog-section {
  padding: 18px;
  background: #fff;
  border: 1px solid #e7e7e9;
  border-radius: 14px;
}

.font-css-token {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  margin-top: 10px;
  padding: 11px 12px;
  background: #f7f7f8;
  border: 1px solid #e7e7e9;
  border-radius: 10px;
}

.font-css-token__content {
  flex: 1 1 auto;
}

.font-css-token__content code {
  display: block;
  overflow: hidden;
  color: #222;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-css-token__label,
.font-control-label {
  margin-bottom: 4px;
  color: #77777e;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.2;
}

.font-upload-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 14px 0;
  padding: 11px 13px;
  color: #44444a;
  font-size: 0.78rem;
  line-height: 1.55;
  background: #f1f1f2;
  border-radius: 11px;
}

.font-upload-note .v-icon {
  margin-top: 1px;
  color: #222;
}

.font-faces-section {
  padding: 0;
  overflow: hidden;
}

.font-faces-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid #ececef;
}

.font-section-title {
  color: #151515;
  font-size: 0.9rem;
  font-weight: 700;
}

.font-add-face-btn {
  flex: 0 0 auto;
  color: #151515;
  border-color: #cfcfd3;
  border-radius: 9px;
}

.font-face-row {
  padding: 14px 18px 16px;
  background: #fff;
  border-bottom: 1px solid #ececef;
}

.font-face-row:last-child {
  border-bottom: 0;
}

.font-face-row__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  margin-bottom: 9px;
}

.font-face-index {
  display: inline-grid;
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  place-items: center;
  color: #555;
  font-size: 0.7rem;
  font-weight: 700;
  background: #f1f1f2;
  border-radius: 7px;
}

.font-face-summary {
  overflow: hidden;
  color: #28282b;
  font-size: 0.78rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-style-toggle {
  width: 100%;
  height: 40px !important;
  padding: 3px;
  background: #f2f2f3;
  border: 1px solid #dedee1;
}

.font-style-toggle :deep(.v-btn) {
  min-width: 0;
  height: 32px !important;
  flex: 1 1 0;
  color: #626269;
  font-size: 0.75rem;
  letter-spacing: 0;
  text-transform: none;
  border-radius: 7px !important;
}

.font-style-toggle :deep(.v-btn--active) {
  color: #111 !important;
  background: #fff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.font-stored-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.font-stored-files :deep(.v-chip) {
  max-width: 100%;
  color: #333;
  background: #fafafa;
  border-color: #dedee1;
}

.font-dialog-footer {
  position: sticky;
  z-index: 2;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 13px 24px;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #e7e7e9;
  backdrop-filter: blur(12px);
}

.font-dialog-save {
  min-width: 140px;
  color: #fff !important;
  background: #111 !important;
  border-radius: 10px;
  box-shadow: none !important;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 600px) {
  .font-dialog-header,
  .font-dialog-body,
  .font-dialog-footer {
    padding-inline: 16px !important;
  }

  .font-dialog-body {
    padding-block: 16px !important;
  }

  .font-dialog-section {
    padding: 14px;
  }

  .font-faces-section {
    padding: 0;
  }

  .font-faces-header {
    align-items: flex-start;
    padding: 14px;
  }

  .font-face-row {
    padding-inline: 14px;
  }

  .font-dialog-footer > .v-btn {
    flex: 1 1 0;
  }

  .font-dialog-save {
    min-width: 0;
  }
}
</style>

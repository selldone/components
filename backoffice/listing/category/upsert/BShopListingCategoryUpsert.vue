<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card
    class="text-start h-100"
    :theme="modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined"
    :class="{ 'sd-modern-canvas b-listing-category-editor': modern }"
    flat
  >
    <header
      v-if="modern"
      class="sd-modern-header b-listing-category-editor__header"
    >
      <div class="sd-modern-title">
        <v-icon
          class="sd-modern-icon sd-modern-icon--plain"
          size="24"
          aria-hidden="true"
          >{{ isEdit ? "folder_open" : "create_new_folder" }}</v-icon
        >
        <div>
          <h1 class="sd-modern-title-text">
            {{
              $t(
                isEdit
                  ? "shop_listing.categories.edit_title"
                  : "shop_listing.categories.add_title",
              )
            }}
          </h1>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.category_editor.subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        v-if="hasClose"
        icon
        variant="text"
        class="sd-modern-icon-button"
        :aria-label="$t('global.actions.close')"
        :disabled="busy_save"
        @click="requestClose"
        ><v-icon size="18" aria-hidden="true">close</v-icon
        ><v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          >{{ $t("global.actions.close") }}</v-tooltip
        ></v-btn
      >
    </header>
    <v-card-text
      class="text-start position-relative"
      :class="modern ? 'b-listing-category-editor__body' : 'pt-6'"
    >
      <div
        v-if="modern && form_error"
        class="sd-modern-notice mb-5"
        role="alert"
      >
        <v-icon color="error" size="20" aria-hidden="true">error_outline</v-icon
        ><span class="sd-modern-notice__content">{{ form_error }}</span>
      </div>
      <v-form
        ref="form"
        lazy-validation
        :class="{ 'b-listing-category-editor__layout': modern }"
      >
        <v-tabs
          v-if="modern"
          v-model="tab"
          show-arrows
          density="comfortable"
          align-tabs="start"
          :direction="$vuetify.display.mdAndUp ? 'vertical' : 'horizontal'"
          :aria-orientation="
            $vuetify.display.mdAndUp ? 'vertical' : 'horizontal'
          "
          hide-slider
          class="sd-modern-section-nav b-listing-category-editor__nav"
          :aria-label="$t('shop_listing.category_editor.sections')"
        >
          <v-tab
            v-for="section in sections"
            :key="section.value"
            :value="section.value"
            :id="`listing-category-tab-${section.value}`"
            :aria-controls="`listing-category-section-${section.value}`"
            :aria-current="tab === section.value ? 'location' : undefined"
            class="sd-modern-section-nav__item text-none"
            ><v-icon size="18" aria-hidden="true">{{ section.icon }}</v-icon
            ><span>{{ section.title }}</span></v-tab
          >
        </v-tabs>
        <!-- Sections remain mounted so navigation retains fields, builder and file choices. -->
        <div
          :class="{
            'sd-modern-form b-listing-category-editor__sections': modern,
          }"
        >
          <!-- ========================= General ========================= -->
          <section
            v-show="!modern || tab === 'general'"
            :role="modern ? 'tabpanel' : undefined"
            :id="modern ? 'listing-category-section-general' : undefined"
            :aria-labelledby="
              modern ? 'listing-category-tab-general' : undefined
            "
            :class="
              modern
                ? 'sd-modern-widget b-listing-category-editor__widget'
                : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :title="
                modern
                  ? $t('global.commons.general')
                  : $t(
                      isEdit
                        ? 'shop_listing.categories.edit_title'
                        : 'shop_listing.categories.add_title',
                    )
              "
              :icon="modern ? 'tune' : 'folder'"
            />
            <p v-if="modern" class="sd-modern-subtitle">
              {{ $t("shop_listing.category_editor.general_subtitle") }}
            </p>
            <v-list-subheader v-else
              >Category identity, hierarchy, and basic visibility
              settings.</v-list-subheader
            >
            <div
              :class="{
                'sd-modern-form-grid sd-modern-underlined-field b-listing-category-editor__fields':
                  modern,
              }"
            >
              <v-text-field
                v-model="form.title"
                :label="`${$t('global.sort.title')}*`"
                :rules="[GlobalRules.required()]"
                messages=" "
                variant="underlined"
                :disabled="fieldsDisabled"
              />
              <v-text-field
                v-model="form.slug"
                :label="$t('global.commons.slug')"
                :hint="
                  modern
                    ? undefined
                    : 'Optional. If empty, backend generates a unique slug.'
                "
                :messages="
                  modern
                    ? $t('shop_listing.category_editor.slug_hint')
                    : undefined
                "
                persistent-hint
                variant="underlined"
                :disabled="fieldsDisabled"
              />
              <!-- Parent category -->
              <b-listing-category-input
                v-model="form.parent_id"
                :return-object="false"
                :label="$t('shop_listing.categories.parent')"
                variant="underlined"
                clearable
                :disabled="fieldsDisabled"
              />
              <v-text-field
                v-model="form.sort_order"
                type="number"
                :label="$t('global.sort.order')"
                variant="underlined"
                :disabled="fieldsDisabled"
              />
            </div>
            <u-smart-toggle
              v-model="form.is_active"
              :true-title="
                modern ? $t('shop_listing.modern.active') : undefined
              "
              :true-description="
                modern
                  ? $t('shop_listing.category_editor.active_hint')
                  : 'Active'
              "
              :border="modern"
              :accessible="modern"
              false-gray
              :disabled="fieldsDisabled"
              :class="{ 'b-listing-category-editor__visibility': modern }"
            />
            <div
              :class="{
                'sd-modern-form-grid sd-modern-underlined-field b-listing-category-editor__fields':
                  modern,
              }"
            >
              <v-text-field
                v-model="form.price_format"
                :label="$t('shop_listing.categories.price_format')"
                :hint="
                  modern
                    ? undefined
                    : 'Example: per night, per hour, fixed, ...'
                "
                :messages="
                  modern
                    ? $t('shop_listing.category_editor.price_format_hint')
                    : undefined
                "
                persistent-hint
                variant="underlined"
                :disabled="fieldsDisabled"
              />
              <v-text-field
                v-model="form.design_id"
                type="number"
                :label="$t('shop_listing.categories.design_id')"
                :hint="
                  modern
                    ? undefined
                    : 'Optional design/template ID (can be null).'
                "
                :messages="
                  modern
                    ? $t('shop_listing.category_editor.design_hint')
                    : undefined
                "
                persistent-hint
                variant="underlined"
                :disabled="fieldsDisabled"
              />
            </div>
          </section>
          <!-- ========================= Description ========================= -->
          <section
            v-show="!modern || tab === 'description'"
            :role="modern ? 'tabpanel' : undefined"
            :id="modern ? 'listing-category-section-description' : undefined"
            :aria-labelledby="
              modern ? 'listing-category-tab-description' : undefined
            "
            :class="
              modern
                ? 'sd-modern-widget b-listing-category-editor__widget'
                : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :title="$t('global.commons.description')"
              icon="notes"
            />
            <p v-if="modern" class="sd-modern-subtitle">
              {{ $t("shop_listing.category_editor.description_subtitle") }}
            </p>
            <v-list-subheader v-else
              >Short explanation for users and SEO.</v-list-subheader
            >
            <v-textarea
              v-model="form.description"
              :label="$t('global.commons.description')"
              :class="{
                'sd-modern-underlined-field b-listing-category-editor__fields':
                  modern,
              }"
              variant="underlined"
              auto-grow
              rows="3"
              :disabled="fieldsDisabled"
            />
          </section>
          <!-- ========================= Category Form Schema ========================= -->
          <section
            v-show="!modern || tab === 'fields'"
            :role="modern ? 'tabpanel' : undefined"
            :id="modern ? 'listing-category-section-fields' : undefined"
            :aria-labelledby="
              modern ? 'listing-category-tab-fields' : undefined
            "
            :class="
              modern
                ? 'sd-modern-widget b-listing-category-editor__widget'
                : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :title="$t('shop_listing.categories.form_schema')"
              icon="schema"
            />
            <p v-if="modern" class="sd-modern-subtitle">
              {{ $t("shop_listing.category_editor.fields_subtitle") }}
            </p>
            <v-list-subheader v-else
              >Optional category-level form fields. These fields extend/override
              the listing form schema. Leave empty if this category does not
              need extra fields.</v-list-subheader
            >
            <div
              v-if="modern && !Array.isArray(form.form_schema)"
              class="sd-modern-notice"
              role="status"
            >
              <v-icon size="20" aria-hidden="true">data_object</v-icon>
              <div class="sd-modern-notice__content">
                {{ $t("shop_listing.category_editor.preserved_fields")
                }}<v-btn
                  class="sd-modern-button sd-modern-button--inline mt-2"
                  variant="text"
                  :disabled="fieldsDisabled"
                  @click="clearFields"
                  >{{ $t("shop_listing.category_editor.clear_fields") }}</v-btn
                >
              </div>
            </div>
            <s-form-builder
              v-else
              v-model:structure="form.form_schema"
              :modern="modern"
              :title="modern ? $t('shop_listing.items.form_fields') : undefined"
              :read-only="modern && fieldsDisabled"
              class="mb-2"
              hasKeyValue
              icon="input"
            />
            <small v-if="!modern" class="text-muted d-block"
              >Stored as an array/object (NOT a JSON string). Backend will save
              it into category.form_schema.</small
            >
          </section>
          <!-- ========================= Media ========================= -->
          <section
            v-show="!modern || tab === 'media'"
            :role="modern ? 'tabpanel' : undefined"
            :id="modern ? 'listing-category-section-media' : undefined"
            :aria-labelledby="modern ? 'listing-category-tab-media' : undefined"
            :class="
              modern
                ? 'sd-modern-widget b-listing-category-editor__widget'
                : 'widget-box mb-5'
            "
          >
            <u-widget-header
              :class="{ 'sd-modern-form-header': modern }"
              :title="$t('global.commons.media')"
              icon="photo_library"
            />
            <p v-if="modern" class="sd-modern-subtitle">
              {{ $t("shop_listing.category_editor.media_subtitle") }}
            </p>
            <v-list-subheader v-else
              >Upload cover image and optional icon image (stored by backend as
              thumbnails).</v-list-subheader
            >
            <div
              :class="{
                'sd-modern-form-grid b-listing-category-editor__fields sd-modern-underlined-field':
                  modern,
              }"
            >
              <div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    class="me-2"
                    :size="modern ? 20 : undefined"
                    aria-hidden="true"
                    >emoji_symbols</v-icon
                  >
                  <h3
                    :class="
                      modern
                        ? 'b-listing-category-editor__media-label'
                        : 'font-weight-bold'
                    "
                  >
                    {{
                      modern
                        ? $t("shop_listing.category_editor.icon_image")
                        : "Icon image"
                    }}
                  </h3>
                </div>
                <v-file-input
                  v-model="icon_file"
                  accept="image/*"
                  show-size
                  clearable
                  prepend-icon="photo_camera"
                  :label="
                    modern
                      ? $t('shop_listing.category_editor.upload_icon')
                      : 'Upload icon image'
                  "
                  variant="underlined"
                  :disabled="fieldsDisabled"
                />
                <div v-if="previewIcon" class="mt-3">
                  <v-avatar
                    :image="previewIcon"
                    class="rounded-lg"
                    :size="100"
                  />
                </div>
              </div>
              <hr v-if="!modern" class="my-3" />
              <div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    class="me-2"
                    :size="modern ? 20 : undefined"
                    aria-hidden="true"
                    >image</v-icon
                  >
                  <h3
                    :class="
                      modern
                        ? 'b-listing-category-editor__media-label'
                        : 'font-weight-bold'
                    "
                  >
                    {{
                      modern
                        ? $t("shop_listing.category_editor.cover_image")
                        : "Cover image"
                    }}
                  </h3>
                </div>
                <v-file-input
                  v-model="photo_file"
                  accept="image/*"
                  show-size
                  clearable
                  prepend-icon="photo_camera"
                  :label="
                    modern
                      ? $t('shop_listing.category_editor.upload_cover')
                      : 'Upload cover image'
                  "
                  variant="underlined"
                  :disabled="fieldsDisabled"
                />
                <div v-if="previewCover" class="mt-3">
                  <v-avatar
                    :image="previewCover"
                    class="rounded-lg"
                    :size="100"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </v-form>
      <v-alert
        v-if="!modern && form_error"
        type="error"
        variant="tonal"
        class="mb-4"
        border="start"
        >{{ form_error }}</v-alert
      >
    </v-card-text>
    <v-card-actions
      :class="{
        'sd-modern-form-actions b-listing-category-editor__footer': modern,
      }"
    >
      <s-widget-buttons :auto-fixed-position="!hasClose">
        <v-btn
          v-if="!modern && hasClose"
          class="mx-1"
          size="x-large"
          variant="text"
          :disabled="busy_save"
          @click="requestClose"
          ><v-icon start>close</v-icon>{{ $t("global.actions.close") }}</v-btn
        >
        <v-btn
          :loading="busy_save"
          :disabled="modern && !canWrite"
          :class="
            modern
              ? 'sd-modern-button sd-modern-button--primary b-listing-category-editor__submit'
              : 'mx-1'
          "
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          variant="elevated"
          @click="save"
          ><v-icon start aria-hidden="true">{{
            modern && !isEdit ? "add" : "save"
          }}</v-icon
          >{{
            $t(
              modern
                ? isEdit
                  ? "shop_listing.item_editor.save_changes"
                  : "shop_listing.category_editor.create"
                : "global.actions.save",
            )
          }}</v-btn
        >
      </s-widget-buttons>
    </v-card-actions>
    <v-dialog
      v-if="modern"
      v-model="discard_dialog"
      max-width="440"
      :persistent="busy_save"
      :theme="USER()?.preferences?.dark ? 'dark' : 'light'"
      aria-labelledby="listing-category-discard-title"
      aria-describedby="listing-category-discard-message"
    >
      <v-card
        class="sd-modern-widget b-listing-category-editor__confirmation text-start"
        ><h2 id="listing-category-discard-title" class="sd-modern-title-text">
          {{ $t("shop_listing.item_editor.discard_title") }}
        </h2>
        <p id="listing-category-discard-message" class="sd-modern-subtitle">
          {{ $t("shop_listing.item_editor.discard_message") }}
        </p>
        <div class="sd-modern-actions">
          <v-btn
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            autofocus
            :disabled="busy_save"
            @click="discard_dialog = false"
            >{{ $t("shop_listing.item_editor.keep_editing") }}</v-btn
          ><v-btn
            class="sd-modern-button sd-modern-button--inline"
            color="primary"
            variant="flat"
            :disabled="busy_save"
            @click="discardChanges"
            >{{ $t("shop_listing.item_editor.discard") }}</v-btn
          >
        </div></v-card
      >
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import BListingCategoryInput from "@selldone/components-vue/backoffice/listing/category/input/BListingCategoryInput.vue";
import SFormBuilder from "@selldone/components-vue/ui/form/SFormBuilder.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BShopListingCategoryUpsert",
  inject: ["$shop"],
  components: {
    SFormBuilder,
    BListingCategoryInput,
    USmartToggle,
    SWidgetButtons,
  },
  props: {
    modern: { type: Boolean, default: false },
    category: { type: Object, default: null },
    hasClose: { type: Boolean, default: false },
  },
  emits: ["add", "edit", "close", "saved"],
  data: () => ({
    tab: "general",
    busy_save: false,
    photo_file: null as any,
    icon_file: null as any,
    previewCover: "",
    previewIcon: "",
    form_error: "",
    initial_form: null as any,
    discard_dialog: false,
    saved_category: null as any,
    form: {
      title: "",
      slug: "",
      description: "",
      parent_id: null as number | null,
      design_id: null as number | null,
      price_format: "",
      sort_order: 0,
      is_active: true,
      icon: "",
      // Keep category-level schema as an array/object in the local form.
      form_schema: [] as any,
    },
  }),
  computed: {
    shop(): any {
      return (this as any).$shop;
    },
    effectiveCategory(): any {
      return this.saved_category || this.category;
    },
    effectiveCategoryId(): number | null {
      return this.effectiveCategory?.id || null;
    },
    isEdit(): boolean {
      return !!this.effectiveCategoryId;
    },
    canWrite(): boolean {
      return (
        !this.$route?.params?.vendor_id &&
        !this.$route?.matched?.some((record: any) => record?.meta?.vendor) &&
        this.writeShopAccess(ShopPermissionRegions.CATEGORIES.code)
      );
    },
    fieldsDisabled(): boolean {
      return this.busy_save || (this.modern && !this.canWrite);
    },
    isSaving(): boolean {
      return this.busy_save;
    },
    hasUnsavedChanges(): boolean {
      return (
        this.modern &&
        ((this.initial_form !== null &&
          this.formSignature(this.form) !==
            this.formSignature(this.initial_form)) ||
          !!this.selectedFile(this.photo_file) ||
          !!this.selectedFile(this.icon_file))
      );
    },
    sections(): any[] {
      return [
        {
          value: "general",
          title: this.$t("global.commons.general"),
          icon: "tune",
        },
        {
          value: "description",
          title: this.$t("global.commons.description"),
          icon: "notes",
        },
        {
          value: "fields",
          title: this.$t("shop_listing.category_editor.fields_tab"),
          icon: "schema",
        },
        {
          value: "media",
          title: this.$t("global.commons.media"),
          icon: "photo_library",
        },
      ];
    },
  },
  watch: {
    category: {
      immediate: true,
      handler(category: any) {
        this.saved_category = null;
        this.initForm(category);
        this.initial_form = JSON.parse(JSON.stringify(this.form));
        this.discard_dialog = false;
        this.tab = "general";
      },
    },
    photo_file(file: any) {
      this.releasePreview(this.previewCover);
      this.previewCover = this.makePreview(file, this.effectiveCategory?.image);
    },
    icon_file(file: any) {
      this.releasePreview(this.previewIcon);
      this.previewIcon = this.makePreview(file, this.effectiveCategory?.icon);
    },
  },
  beforeUnmount() {
    this.releasePreview(this.previewCover);
    this.releasePreview(this.previewIcon);
  },
  methods: {
    requestClose() {
      if (this.busy_save) return;
      if (this.hasUnsavedChanges) {
        this.discard_dialog = true;
        return;
      }
      this.$emit("close");
    },
    discardChanges() {
      if (this.busy_save) return;
      this.discard_dialog = false;
      this.$emit("close");
    },
    selectedFile(value: any) {
      return Array.isArray(value) ? value[0] || null : value;
    },
    releasePreview(value: string) {
      if (value?.startsWith("blob:")) URL.revokeObjectURL(value);
    },
    makePreview(value: any, fallbackPath?: string) {
      const file = this.selectedFile(value);
      if (file && typeof file === "object") {
        try {
          return URL.createObjectURL(file);
        } catch {
          return "";
        }
      }
      return fallbackPath ? this.getShopImagePath(fallbackPath) : "";
    },
    formSignature(form: any = this.form): string {
      return JSON.stringify(
        {
          title: (form.title || "").trim(),
          slug: (form.slug || "").trim(),
          description: (form.description || "").trim(),
          parent_id: form.parent_id ? String(form.parent_id) : null,
          design_id: form.design_id ? String(form.design_id) : null,
          price_format: (form.price_format || "").trim(),
          sort_order: parseInt(String(form.sort_order || 0), 10) || 0,
          is_active: !!form.is_active,
          icon: (form.icon || "").trim(),
          form_schema: this.modern
            ? form.form_schema
            : Array.isArray(form.form_schema)
              ? form.form_schema
              : [],
        },
        (_key, value) =>
          value && typeof value === "object" && !Array.isArray(value)
            ? Object.fromEntries(
                Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
              )
            : value,
      );
    },
    initForm(category: any | null) {
      this.form_error = "";
      this.releasePreview(this.previewCover);
      this.releasePreview(this.previewIcon);
      this.photo_file = null;
      this.icon_file = null;
      this.form = {
        title: category?.title || "",
        slug: category?.slug || "",
        description: category?.description || "",
        parent_id: category?.parent_id ?? null,
        design_id: category?.design_id ?? null,
        price_format: category?.price_format || "",
        sort_order: category?.sort_order ?? 0,
        is_active: category ? !!category.is_active : true,
        icon: category?.icon || "",
        // The builder edits a copy; cancelling must not mutate a category in the list.
        form_schema: JSON.parse(JSON.stringify(category?.form_schema || [])),
      };
      this.previewCover = category?.image
        ? this.getShopImagePath(category.image)
        : "";
      this.previewIcon = category?.icon
        ? this.getShopImagePath(category.icon)
        : "";
    },
    validateForm() {
      if (!(this.form.title || "").trim())
        throw new Error(
          this.modern
            ? this.$t("shop_listing.category_editor.title_required")
            : "Title is required.",
        );
    },
    clearFields() {
      if (!this.fieldsDisabled) this.form.form_schema = [];
    },
    async save(): Promise<boolean> {
      const shopId = this.shop?.id;
      if (!shopId || this.busy_save || (this.modern && !this.canWrite))
        return false;
      this.form_error = "";
      try {
        (this.$refs.form as any)?.validate?.();
        this.validateForm();
      } catch (error: any) {
        if (this.modern) this.tab = "general";
        this.form_error =
          error?.message ||
          (this.modern
            ? this.$t("shop_listing.item_editor.invalid_form")
            : "Invalid form.");
        return false;
      }
      const submitted = JSON.parse(JSON.stringify(this.form));
      const photo = this.selectedFile(this.photo_file),
        icon = this.selectedFile(this.icon_file),
        categoryId = this.effectiveCategoryId;
      // Always send multipart: supports optional files + arrays.
      const fd = new FormData();
      fd.append("title", (submitted.title || "").trim());
      fd.append("slug", (submitted.slug || "").trim()); // empty => backend generates
      fd.append("description", (submitted.description || "").trim());
      // 🧩 Edit omission preserves state; explicit empty fields clear selected relations.
      if (submitted.parent_id)
        fd.append("parent_id", String(submitted.parent_id));
      else if (categoryId) fd.append("parent_id", "");
      if (submitted.design_id)
        fd.append("design_id", String(submitted.design_id));
      else if (categoryId) fd.append("design_id", "");
      fd.append("price_format", (submitted.price_format || "").trim());
      fd.append(
        "sort_order",
        String(parseInt(String(submitted.sort_order || 0), 10) || 0),
      );
      fd.append("is_active", submitted.is_active ? "true" : "false");
      fd.append("icon", (submitted.icon || "").trim());
      // Keep stored object schemas intact; clearing still submits an explicit empty array.
      fd.append(
        "form_schema",
        JSON.stringify(
          this.modern
            ? submitted.form_schema
            : Array.isArray(submitted.form_schema)
              ? submitted.form_schema
              : [],
        ),
      );
      if (photo) fd.append("photo", photo);
      if (icon) fd.append("icon_photo", icon);
      // Recheck the current permission at the write boundary.
      if (this.modern && !this.canWrite) return false;
      this.busy_save = true;
      try {
        const { data } = await axios.post(
          categoryId
            ? window.API.POST_SHOP_LISTING_CATEGORY_EDIT(shopId, categoryId)
            : window.API.POST_SHOP_LISTING_CATEGORY_ADD(shopId),
          fd,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        if (data?.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          return false;
        }
        const saved = data.category || data.result || data;
        if (!saved?.id) {
          NotificationService.showErrorAlert(
            null,
            this.modern
              ? this.$t("shop_listing.category_editor.invalid_response")
              : "Invalid server response.",
          );
          return false;
        }
        if (this.modern) {
          this.saved_category = { ...this.effectiveCategory, ...saved };
          if (
            !submitted.slug &&
            this.form.slug === submitted.slug &&
            saved.slug
          )
            this.form.slug = saved.slug;
          if (!submitted.slug && saved.slug) submitted.slug = saved.slug;
          this.initial_form = submitted;
          if (this.selectedFile(this.photo_file) === photo)
            this.photo_file = null;
          if (this.selectedFile(this.icon_file) === icon) this.icon_file = null;
        }
        if (this.hasUnsavedChanges) this.$emit("saved", saved);
        else this.$emit(categoryId ? "edit" : "add", saved);
        NotificationService.showSuccessAlert(
          null,
          this.modern
            ? this.$t(
                categoryId
                  ? "shop_listing.category_editor.updated"
                  : "shop_listing.category_editor.created",
              )
            : categoryId
              ? "Category updated successfully."
              : "Category created successfully.",
        );
        return true;
      } catch (error: any) {
        NotificationService.showLaravelError(error);
        return false;
      } finally {
        this.busy_save = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-listing-category-editor {
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  &__header,
  &__body,
  &__footer {
    width: min(1040px, 100%);
    margin-inline: auto;
  }
  &__header {
    padding: 28px 32px 20px;
    align-items: flex-start;
  }
  &__header .sd-modern-title-text {
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    letter-spacing: 0;
  }
  &__header .sd-modern-subtitle {
    margin-block-start: 5px;
    font-size: 13px;
    line-height: 21px;
  }
  &__header .sd-modern-icon {
    margin-block-start: 3px;
  }
  &__body {
    padding: 4px 32px 28px !important;
  }
  &__layout {
    display: grid;
    grid-template-columns: 164px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  &__nav {
    min-width: 0;
    align-self: start;
  }
  &__sections {
    width: 100%;
    min-width: 0;
    margin: 0;
  }
  &__widget {
    padding: 24px;
    border: 0;
    border-radius: 16px;
  }
  &__widget > .sd-modern-subtitle {
    margin-block: 5px 24px;
    font-size: 13px;
    line-height: 21px;
  }
  &__fields {
    margin-block-start: 24px;
  }
  &__visibility {
    margin-block: 24px;
  }
  &__media-label {
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
  }
  &__footer {
    flex: 0 0 auto;
    padding: 16px 32px 24px;
  }
  &__footer :deep(.widget-buttons) {
    justify-content: flex-end;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 8px 0;
  }
  &__submit {
    flex: 0 1 auto !important;
    min-width: 184px;
    padding-inline: 24px !important;
  }
  &__confirmation {
    padding: 24px;
  }
  &__confirmation h2 {
    font-size: 20px;
    line-height: 28px;
    font-weight: 500;
  }
  &__confirmation p {
    margin-block: 12px 24px;
    font-size: 13px;
    line-height: 21px;
  }
  &__confirmation .sd-modern-actions {
    justify-content: flex-end;
  }
  @media (max-width: 959px) {
    &__layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
    }
    &__sections {
      max-width: 760px;
      margin-inline: auto;
    }
  }
  @media (max-width: 600px) {
    &__header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      padding: 22px 16px 16px;
    }
    &__body {
      padding: 0 16px 20px !important;
    }
    &__widget {
      padding: 20px 18px;
    }
    &__footer {
      padding: 14px 16px 20px;
    }
    &__footer :deep(.widget-buttons) {
      padding: 0;
    }
    &__submit {
      width: 100%;
    }
  }
}
</style>

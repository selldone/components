<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card class="text-start h-100" flat>
    <v-card-text class="text-start position-relative pt-6">
      <v-form ref="form" lazy-validation>
        <!-- ========================= General ========================= -->
        <div class="widget-box mb-5">
          <u-widget-header
            :title="
              isEdit
                ? $t('shop_listing.categories.edit_title')
                : $t('shop_listing.categories.add_title')
            "
            icon="folder"
          />

          <v-list-subheader>
            Category identity, hierarchy, and basic visibility settings.
          </v-list-subheader>

          <v-text-field
            v-model="form.title"
            :label="`${$t('global.sort.title')}*`"
            :rules="[GlobalRules.required()]"
            messages=" "
            variant="underlined"
            :disabled="busy_save"
          />

          <v-text-field
            v-model="form.slug"
            :label="$t('global.commons.slug')"
            hint="Optional. If empty, backend generates a unique slug."
            persistent-hint
            variant="underlined"
            :disabled="busy_save"
          />

          <!-- Parent category -->
          <b-listing-category-input
            v-model="form.parent_id"
            :return-object="false"
            :label="$t('shop_listing.categories.parent')"
            variant="underlined"
            clearable
            :disabled="busy_save"
          />

          <v-text-field
            v-model="form.sort_order"
            type="number"
            :label="$t('global.sort.order')"
            variant="underlined"
            :disabled="busy_save"
          />

          <u-smart-toggle
            v-model="form.is_active"
            trueDescription="Active"
            false-gray
            :disabled="busy_save"
          />

          <v-text-field
            v-model="form.price_format"
            :label="$t('shop_listing.categories.price_format')"
            hint="Example: per night, per hour, fixed, ..."
            persistent-hint
            variant="underlined"
            :disabled="busy_save"
          />

          <v-text-field
            v-model="form.design_id"
            type="number"
            :label="$t('shop_listing.categories.design_id')"
            hint="Optional design/template ID (can be null)."
            persistent-hint
            variant="underlined"
            :disabled="busy_save"
          />
        </div>

        <!-- ========================= Description ========================= -->
        <div class="widget-box mb-5">
          <u-widget-header :title="$t('global.commons.description')" icon="notes" />
          <v-list-subheader>Short explanation for users and SEO.</v-list-subheader>

          <v-textarea
            v-model="form.description"
            :label="$t('global.commons.description')"
            variant="underlined"
            auto-grow
            rows="3"
            :disabled="busy_save"
          />
        </div>

        <!-- ========================= Category Form Schema ========================= -->
        <div class="widget-box mb-5">
          <u-widget-header :title="$t('shop_listing.categories.form_schema')" icon="schema" />
          <v-list-subheader>
            Optional category-level form fields. These fields extend/override the listing form schema.
            Leave empty if this category does not need extra fields.
          </v-list-subheader>

          <s-form-builder
            v-model:structure="form.form_schema"
            class="mb-2"
            hasKeyValue
            icon="input"
          />

          <small class="text-muted d-block">
            Stored as an array/object (NOT a JSON string). Backend will save it into category.form_schema.
          </small>
        </div>

        <!-- ========================= Media ========================= -->
        <div class="widget-box mb-5">
          <u-widget-header :title="$t('global.commons.media')" icon="photo_library" />
          <v-list-subheader>
            Upload cover image and optional icon image (stored by backend as thumbnails).
          </v-list-subheader>

          <div class="d-flex align-center mb-2">
            <v-icon class="me-2">emoji_symbols</v-icon>
            <div class="font-weight-bold">Icon image</div>
          </div>

          <v-file-input
            v-model="icon_file"
            accept="image/*"
            show-size
            clearable
            prepend-icon="photo_camera"
            label="Upload icon image"
            variant="underlined"
            :disabled="busy_save"
          />

          <div v-if="previewIcon" class="mt-3">
            <v-avatar :image="previewIcon" class="rounded-lg" :size="100" />
          </div>

          <hr class="my-3" />

          <div class="d-flex align-center mb-2">
            <v-icon class="me-2">image</v-icon>
            <div class="font-weight-bold">Cover image</div>
          </div>

          <v-file-input
            v-model="photo_file"
            accept="image/*"
            show-size
            clearable
            prepend-icon="photo_camera"
            label="Upload cover image"
            variant="underlined"
            :disabled="busy_save"
          />

          <div v-if="previewCover" class="mt-3">
            <v-avatar :image="previewCover" class="rounded-lg" :size="100" />
          </div>
        </div>
      </v-form>

      <v-alert
        v-if="form_error"
        type="error"
        variant="tonal"
        class="mb-4"
        border="start"
      >
        {{ form_error }}
      </v-alert>
    </v-card-text>

    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="!hasClose">
        <v-btn
          v-if="hasClose"
          class="mx-1"
          size="x-large"
          variant="text"
          :disabled="busy_save"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :loading="busy_save"
          class="mx-1"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="save"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import BListingCategoryInput from "@selldone/components-vue/backoffice/listing/category/input/BListingCategoryInput.vue";
import SFormBuilder from "@selldone/components-vue/ui/form/SFormBuilder.vue";

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
    category: { type: Object, default: null },
    hasClose: { type: Boolean, default: false },
  },

  emits: ["add", "edit", "close"],

  data: () => ({
    busy_save: false,

    photo_file: null as any,
    icon_file: null as any,

    previewCover: "" as string,
    previewIcon: "" as string,

    form_error: "",

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

      // New: category-level schema (object/array)
      form_schema: [] as any[],
    },
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    isEdit(): boolean {
      return !!this.category?.id;
    },
  },

  watch: {
    category: {
      immediate: true,
      handler(newVal: any) {
        this.initForm(newVal);
      },
    },

    photo_file(newVal: any) {
      this.previewCover = this.makePreview(newVal, this.category?.image);
    },

    icon_file(newVal: any) {
      this.previewIcon = this.makePreview(newVal, this.category?.icon);
    },
  },

  methods: {
    makePreview(file: any, fallbackPath?: string) {
      if (file && typeof file === "object") {
        try {
          return URL.createObjectURL(file);
        } catch {
          return "";
        }
      }
      if (fallbackPath) return this.getShopImagePath(fallbackPath);
      return "";
    },

    initForm(category: any | null) {
      this.form_error = "";

      // reset file inputs
      this.photo_file = null;
      this.icon_file = null;

      if (!category) {
        this.form = {
          title: "",
          slug: "",
          description: "",

          parent_id: null,
          design_id: null,

          price_format: "",
          sort_order: 0,
          is_active: true,

          icon: "",

          form_schema: [],
        };

        this.previewCover = "";
        this.previewIcon = "";
        return;
      }

      this.form = {
        title: category.title || "",
        slug: category.slug || "",
        description: category.description || "",

        parent_id: category.parent_id ?? null,
        design_id: category.design_id ?? null,

        price_format: category.price_format || "",
        sort_order: category.sort_order ?? 0,
        is_active: !!category.is_active,

        icon: category.icon || "",

        // Keep as object/array (NOT string)
        form_schema: Array.isArray(category.form_schema) ? category.form_schema : (category.form_schema || []),
      };

      this.previewCover = category.image ? this.getShopImagePath(category.image) : "";
      this.previewIcon = category.icon ? this.getShopImagePath(category.icon) : "";
    },

    validateForm() {
      const title = (this.form.title || "").trim();
      if (!title) throw new Error("Title is required.");
    },

    save() {
      const shopId = this.shop?.id;
      if (!shopId) return;

      this.form_error = "";

      try {
        (this.$refs.form as any)?.validate?.();
        this.validateForm();
      } catch (e: any) {
        this.form_error = e?.message || "Invalid form.";
        return;
      }

      // Always send multipart: supports optional files + arrays.
      const fd = new FormData();

      fd.append("title", (this.form.title || "").trim());
      fd.append("slug", (this.form.slug || "").trim()); // can be empty => backend will generate
      fd.append("description", (this.form.description || "").trim());

      // hierarchy
      if (this.form.parent_id) fd.append("parent_id", String(this.form.parent_id));
      if (this.form.design_id) fd.append("design_id", String(this.form.design_id));

      // settings
      fd.append("price_format", (this.form.price_format || "").trim());
      fd.append("sort_order", String(parseInt(String(this.form.sort_order || 0), 10) || 0));
      fd.append("is_active", this.form.is_active ? "true" : "false");

      // icon string field (optional)
      fd.append("icon", (this.form.icon || "").trim());

      // category-level schema:
      // Backend accepts array directly OR JSON string.
      // In multipart, safest is to send JSON string.
      fd.append("form_schema", JSON.stringify(Array.isArray(this.form.form_schema) ? this.form.form_schema : []));

      // files
      if (this.photo_file) fd.append("photo", this.photo_file);
      if (this.icon_file) fd.append("icon_photo", this.icon_file);

      this.busy_save = true;

      const request = this.isEdit
        ? axios.post(window.API.POST_SHOP_LISTING_CATEGORY_EDIT(shopId, this.category.id), fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        : axios.post(window.API.POST_SHOP_LISTING_CATEGORY_ADD(shopId), fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      request
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          const saved = data.category || data.result || data;

          if (!saved?.id) {
            NotificationService.showErrorAlert(null, "Invalid server response.");
            return;
          }

          if (this.isEdit) {
            this.$emit("edit", saved);
            NotificationService.showSuccessAlert(null, "Category updated successfully.");
          } else {
            this.$emit("add", saved);
            NotificationService.showSuccessAlert(null, "Category created successfully.");
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_save = false));
    },
  },
};
</script>

<style lang="scss" scoped></style>

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
            :title="isEdit ? $t('shop_listing.companies.edit_title') : $t('shop_listing.companies.add_title')"
            icon="business"
          />

          <v-list-subheader>
            Companies can be assigned to listing items. Save will create/update the company.
            If you selected a logo, it will be uploaded.
          </v-list-subheader>

          <v-text-field
            v-model="form.name"
            :label="`${$t('global.sort.title')}*`"
            :rules="[GlobalRules.required()]"
            messages=" "
            variant="underlined"
            :disabled="busy_save"
          />

          <v-textarea
            v-model="form.description"
            :label="$t('global.commons.description')"
            variant="underlined"
            auto-grow
            rows="3"
            :disabled="busy_save"
          />

          <v-text-field
            v-model="form.website"
            :label="$t('global.commons.website')"
            variant="underlined"
            :disabled="busy_save"
          />

          <v-text-field
            v-model="form.email"
            :label="$t('global.commons.email')"
            variant="underlined"
            :disabled="busy_save"
          />

          <v-text-field
            v-model="form.tel"
            :label="$t('global.commons.tel')"
            variant="underlined"
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
        </div>

        <!-- ========================= Media ========================= -->
        <div class="widget-box mb-5">
          <u-widget-header :title="$t('global.commons.media')" icon="photo_library" />
          <v-list-subheader>
            Optional company logo (recommended square).
          </v-list-subheader>

          <v-file-input
            v-model="logo_file"
            accept="image/*"
            show-size
            clearable
            prepend-icon="photo_camera"
            label="Upload company logo"
            variant="underlined"
            :disabled="busy_save"
          />

          <div v-if="previewLogo" class="mt-3">
            <v-avatar :image="previewLogo" class="rounded-lg" :size="110" />
          </div>
        </div>
      </v-form>

      <v-alert v-if="form_error" type="error" variant="tonal" class="mb-4" border="start">
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

export default {
  name: "BShopListingCompanyUpsert",

  inject: ["$shop"],

  components: {
    USmartToggle,
    SWidgetButtons,
  },

  props: {
    company: { type: Object, default: null },
    hasClose: { type: Boolean, default: false },
  },

  emits: ["add", "edit", "close"],

  data: () => ({
    busy_save: false,
    form_error: "",

    logo_file: null as any,
    previewLogo: "" as string,

    form: {
      name: "",
      description: "",
      website: "",
      email: "",
      tel: "",
      sort_order: 0,
      is_active: true,
    },
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    isEdit(): boolean {
      return !!(this as any).company?.id;
    },

    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // Standard detection requested
      // @ts-ignore
      return (
        this.$route?.params?.vendor_id &&
        // @ts-ignore
        this.$route?.matched?.some((record: any) => record?.meta?.vendor)
      );
    },

    vendorIdSafe(): number | null {
      if (!this.IS_VENDOR_PANEL) return null;
      // @ts-ignore
      const raw = this.$route?.params?.vendor_id;
      const id = raw !== null && raw !== undefined ? parseInt(String(raw), 10) : 0;
      return id > 0 ? id : null;
    },
  },

  watch: {
    company: {
      immediate: true,
      handler(val: any) {
        this.initForm(val);
      },
    },

    logo_file(newVal: any) {
      this.previewLogo = this.makePreview(newVal, (this as any).company?.logo);
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

    initForm(company: any | null) {
      this.form_error = "";
      this.logo_file = null;

      if (!company) {
        this.form = {
          name: "",
          description: "",
          website: "",
          email: "",
          tel: "",
          sort_order: 0,
          is_active: true,
        };
        this.previewLogo = "";
        return;
      }

      this.form = {
        name: company.name || "",
        description: company.description || "",
        website: company.website || "",
        email: company.email || "",
        tel: company.tel || "",
        sort_order: company.sort_order ?? 0,
        is_active: company.is_active !== undefined ? !!company.is_active : true,
      };

      this.previewLogo = company.logo ? this.getShopImagePath(company.logo) : "";
    },

    validateForm() {
      const name = (this.form.name || "").trim();
      if (!name) throw new Error("Name is required.");
    },

    buildFormData(): FormData {
      const fd = new FormData();

      fd.append("name", (this.form.name || "").trim());
      fd.append("description", (this.form.description || "").trim() || "");

      fd.append("website", (this.form.website || "").trim() || "");
      fd.append("email", (this.form.email || "").trim() || "");
      fd.append("tel", (this.form.tel || "").trim() || "");

      fd.append("sort_order", String(parseInt(String(this.form.sort_order || 0), 10) || 0));
      fd.append("is_active", this.form.is_active ? "true" : "false");

      if (this.logo_file) {
        // Backend supports "logo_photo" (and also accepts "photo").
        fd.append("logo_photo", this.logo_file);
      }

      return fd;
    },

    save() {
      // Vendor panel: use VAPI
      if (this.IS_VENDOR_PANEL) {
        const vendorId = this.vendorIdSafe;
        if (!vendorId) return;

        this.form_error = "";

        try {
          (this.$refs.form as any)?.validate?.();
          this.validateForm();
        } catch (e: any) {
          this.form_error = e?.message || "Invalid form.";
          return;
        }

        const fd = this.buildFormData();

        this.busy_save = true;

        const request = this.isEdit
          ? axios.post(window.VAPI.POST_MY_VENDOR_LISTING_COMPANY_EDIT(vendorId, (this as any).company.id), fd, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          : axios.post(window.VAPI.POST_MY_VENDOR_LISTING_COMPANY_ADD(vendorId), fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });

        request
          .then(({ data }) => {
            if (data?.error) {
              NotificationService.showErrorAlert(null, data.error_msg);
              return;
            }

            const saved = data.company || data.result || data;
            if (!saved?.id) {
              NotificationService.showErrorAlert(null, "Invalid server response.");
              return;
            }

            if (this.isEdit) {
              this.$emit("edit", saved);
              NotificationService.showSuccessAlert(null, "Company updated successfully.");
            } else {
              this.$emit("add", saved);
              NotificationService.showSuccessAlert(null, "Company created successfully.");
            }
          })
          .catch((error) => NotificationService.showLaravelError(error))
          .finally(() => (this.busy_save = false));

        return;
      }

      // Backoffice shop: use API
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

      const fd = this.buildFormData();

      this.busy_save = true;

      const request = this.isEdit
        ? axios.post(window.API.POST_SHOP_LISTING_COMPANY_EDIT(shopId, (this as any).company.id), fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        : axios.post(window.API.POST_SHOP_LISTING_COMPANY_ADD(shopId), fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      request
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          const saved = data.company || data.result || data;
          if (!saved?.id) {
            NotificationService.showErrorAlert(null, "Invalid server response.");
            return;
          }

          if (this.isEdit) {
            this.$emit("edit", saved);
            NotificationService.showSuccessAlert(null, "Company updated successfully.");
          } else {
            this.$emit("add", saved);
            NotificationService.showSuccessAlert(null, "Company created successfully.");
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_save = false));
    },
  },
};
</script>

<style lang="scss" scoped></style>

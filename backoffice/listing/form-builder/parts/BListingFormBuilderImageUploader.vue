<template>
  <div class="sld-bfb-up">
    <div class="sld-bfb-up__row">
      <div class="sld-bfb-up__preview">
        <div class="sld-bfb-up__box">
          <u-loading-progress v-if="busy" />

          <img v-if="valueSafe" :src="getShopImagePath(valueSafe)" class="sld-bfb-up__img" alt="uploaded" />
          <div v-else class="sld-bfb-up__empty">
            <v-icon size="38" class="text-muted">image</v-icon>
          </div>
        </div>
      </div>

      <div class="sld-bfb-up__meta">
        <div class="font-weight-black">{{ labelSafe }}</div>
        <div v-if="hintSafe" class="text-muted small mt-1">
          {{ hintSafe }}
        </div>

        <div class="mt-3 d-flex flex-wrap gap-2">
          <v-btn size="small" variant="outlined" :disabled="busy" @click="pickFile">
            <v-icon start>upload</v-icon>
            Upload image
          </v-btn>

          <v-btn v-if="valueSafe" size="small" variant="text" :disabled="busy" @click="clear">
            <v-icon start>delete</v-icon>
            Remove
          </v-btn>
        </div>

        <input
          ref="file"
          class="d-none"
          type="file"
          accept="image/*"
          @change="onFileChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BListingFormBuilderImageUploader",

  inject: ["$shop"],

  props: {
    modelValue: { type: String, default: null },
    label: { type: String, default: "Image" },
    hint: { type: String, default: "" },
  },

  emits: ["update:modelValue"],

  data: () => ({
    busy: false,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopId(): number {
      const id = parseInt(String((this as any).shop?.id || 0), 10);
      return Number.isFinite(id) && id > 0 ? id : 0;
    },

    valueSafe(): string {
      return String((this as any).modelValue || "").trim();
    },

    labelSafe(): string {
      return String((this as any).label || "Image");
    },

    hintSafe(): string {
      return String((this as any).hint || "").trim();
    },
  },

  methods: {
    pickFile() {
      (this.$refs.file as HTMLInputElement | undefined)?.click?.();
    },

    clear() {
      (this as any).$emit("update:modelValue", null);
    },

    async onFileChange(e: any) {
      const file: File | null = e?.target?.files?.[0] || null;
      e.target.value = "";

      if (!file) return;
      if (!(this as any).shopId) {
        NotificationService.showErrorAlert(null, "Shop is not available.");
        return;
      }

      const form = new FormData();
      form.append("file", file);

      (this as any).busy = true;

      try {
        const { data } = await axios.post(
          // ✅ Add this to window.API in your project:
          // POST_SHOP_LISTING_FORM_BUILDER_UPLOAD_IMAGE(shop_id)
          window.API.POST_SHOP_LISTING_FORM_BUILDER_UPLOAD_IMAGE((this as any).shopId),
          form,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        if (data?.error) {
          NotificationService.showErrorAlert(null, data.error_msg || "Upload failed.");
          return;
        }

        const saved = String(data?.path || data?.url || "").trim();
        if (!saved) {
          NotificationService.showErrorAlert(null, "Invalid upload response.");
          return;
        }

        (this as any).$emit("update:modelValue", saved);
        NotificationService.showSuccessAlert(null, "Image uploaded.");
      } catch (err: any) {
        NotificationService.showLaravelError(err);
      } finally {
        (this as any).busy = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-up {
  &__row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 14px;
    align-items: center;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  }

  &__box {
    width: 140px;
    height: 110px;
    border-radius: 16px;
    overflow: hidden;

    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(20, 20, 20, 0.08);

    position: relative;
    display: grid;
    place-items: center;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__empty {
    padding: 10px;
  }
}
</style>
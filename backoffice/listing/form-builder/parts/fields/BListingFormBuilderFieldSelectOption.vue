<template>
  <v-card class="sld-bfb-opt" rounded="xl" variant="outlined">
    <v-card-text class="pa-3">
      <div class="d-flex align-center mb-2">
        <div class="font-weight-black">Option</div>
        <v-spacer />
        <v-btn icon variant="text" @click="$emit('remove')">
          <v-icon>close</v-icon>
        </v-btn>
      </div>

      <v-text-field v-model="titleProxy" label="Title" variant="outlined" density="comfortable" />
      <v-text-field v-model="valueProxy" label="Value (stored)" variant="outlined" density="comfortable" class="mt-2" />
      <v-text-field v-model="subtitleProxy" label="Subtitle (optional)" variant="outlined" density="comfortable" class="mt-2" />

      <div class="mt-3">
        <b-listing-form-builder-image-uploader
          v-model="imageProxy"
          label="Option image (optional)"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import BListingFormBuilderImageUploader from "../BListingFormBuilderImageUploader.vue";

export default {
  name: "BListingFormBuilderFieldSelectOption",

  components: { BListingFormBuilderImageUploader },

  props: { modelValue: { type: Object, required: true } },
  emits: ["update:modelValue", "remove"],

  computed: {
    titleProxy: {
      get(): string {
        return String((this as any).modelValue?.title ?? "");
      },
      set(v: any) {
        (this as any).patch({ title: String(v ?? "") });
      },
    },
    valueProxy: {
      get(): string {
        return String((this as any).modelValue?.value ?? "");
      },
      set(v: any) {
        (this as any).patch({ value: String(v ?? "") });
      },
    },
    subtitleProxy: {
      get(): string {
        return String((this as any).modelValue?.subtitle ?? "");
      },
      set(v: any) {
        (this as any).patch({ subtitle: String(v ?? "") });
      },
    },
    imageProxy: {
      get(): any {
        return (this as any).modelValue?.image ?? null;
      },
      set(v: any) {
        (this as any).patch({ image: v || null });
      },
    },
  },

  methods: {
    patch(p: any) {
      const cur = (this as any).modelValue || {};
      (this as any).$emit("update:modelValue", { ...cur, ...p });
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-opt {
  border-color: rgba(0, 0, 0, 0.12);
}
</style>
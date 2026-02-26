<template>
  <div class="sld-onb-field">
    <v-file-input
      :label="label"
      :multiple="multiple"
      :accept="accept"
      variant="outlined"
      density="comfortable"
      prepend-icon=""
      prepend-inner-icon="photo_camera"
      :model-value="internalFiles"
      @update:modelValue="onUpdate"
    />

    <div v-if="hint" class="text-muted mt-1" style="font-size: 12px">
      {{ hint }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingFieldMedia",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    label(): string {
      return this.field?.title ? String(this.field.title) : "Upload";
    },

    accept(): string {
      return this.field?.accept ? String(this.field.accept) : "image/*";
    },

    multiple(): boolean {
      return this.field?.multiple !== undefined ? !!this.field.multiple : true;
    },

    hint(): string {
      const maxFiles = this.field?.maxFiles;
      if (maxFiles === null || maxFiles === undefined) return "";
      return `Max files: ${maxFiles}`;
    },

    internalFiles(): any {
      // v-file-input expects File[]
      return Array.isArray(this.modelValue) ? this.modelValue : [];
    },
  },

  methods: {
    onUpdate(v: any) {
      // In production, you should upload files and return URLs/paths.
      // Here we just keep the File list in memory.
      this.$emit("update:modelValue", Array.isArray(v) ? v : []);
    },
  },
};
</script>

<style scoped>
.sld-onb-field {
  width: 100%;
}
</style>

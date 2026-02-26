<template>
  <div class="sld-onb-field">
    <v-textarea
      :model-value="modelValueSafe"
      :label="label"
      :placeholder="placeholder"
      variant="outlined"
      auto-grow
      :rows="rows"
      density="comfortable"
      :counter="maxLength"
      :maxlength="maxLength"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingFieldTextarea",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    modelValueSafe(): string {
      return this.modelValue === null || this.modelValue === undefined
        ? ""
        : String(this.modelValue);
    },

    label(): string {
      return this.field?.title ? String(this.field.title) : "";
    },

    placeholder(): string {
      return this.field?.placeholder ? String(this.field.placeholder) : "";
    },

    maxLength(): number | null {
      const v = this.field?.maxLength;
      const n = v === null || v === undefined ? null : parseInt(String(v), 10);
      return Number.isFinite(n as number) ? (n as number) : null;
    },

    rows(): number {
      const n = parseInt(String(this.field?.rows ?? 4), 10);
      return Number.isFinite(n) && n > 0 ? n : 4;
    },
  },
};
</script>

<style scoped>
.sld-onb-field {
  width: 100%;
}
</style>

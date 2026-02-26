<template>
  <div class="sld-onb-field">
    <v-text-field
      :model-value="modelValueSafe"
      label="Title"
      placeholder="Write a short, clear title"
      variant="outlined"
      density="comfortable"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingOfficialTitle",

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
  },
};
</script>

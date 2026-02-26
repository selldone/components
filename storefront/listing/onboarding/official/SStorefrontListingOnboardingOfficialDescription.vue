<template>
  <div class="sld-onb-field">
    <v-textarea
      :model-value="modelValueSafe"
      label="Description"
      placeholder="Share what makes your place special"
      variant="outlined"
      auto-grow
      rows="5"
      density="comfortable"
      counter="500"
      maxlength="500"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingOfficialDescription",

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

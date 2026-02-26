<template>
  <div class="sld-onb-field">
    <v-alert type="info" variant="tonal" border="start" class="mb-3">
      Opening hours can be a structured object. This is a lightweight editor placeholder.
    </v-alert>

    <v-textarea
      :model-value="text"
      label="Opening hours"
      placeholder="e.g. Mon-Fri 09:00-17:00\nSat 10:00-14:00"
      variant="outlined"
      auto-grow
      rows="5"
      density="comfortable"
      @update:modelValue="(v) => $emit('update:modelValue', String(v || ''))"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingOfficialOpeningHours",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    text(): string {
      if (this.modelValue === null || this.modelValue === undefined) return "";
      if (typeof this.modelValue === "string") return this.modelValue;
      try {
        return JSON.stringify(this.modelValue, null, 2);
      } catch {
        return String(this.modelValue);
      }
    },
  },
};
</script>

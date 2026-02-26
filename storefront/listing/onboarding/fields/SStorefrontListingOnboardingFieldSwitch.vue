<template>
  <div class="sld-onb-field">
    <v-switch
      :model-value="!!modelValue"
      :label="label"
      inset
      density="comfortable"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <div v-if="hint" class="text-muted mt-1" style="font-size: 12px">
      {{ hint }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingFieldSwitch",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    label(): string {
      return this.field?.title ? String(this.field.title) : "";
    },

    hint(): string {
      const yes = this.field?.trueLabel ? String(this.field.trueLabel) : "";
      const no = this.field?.falseLabel ? String(this.field.falseLabel) : "";
      if (yes && no) return `Yes: ${yes} • No: ${no}`;
      return "";
    },
  },
};
</script>

<style scoped>
.sld-onb-field {
  width: 100%;
}
</style>

<template>
  <div class="sld-onb-field">
    <v-text-field
      :model-value="modelValueSafe"
      type="number"
      :label="label"
      :placeholder="placeholder"
      variant="outlined"
      density="comfortable"
      :min="min"
      :max="max"
      :step="step"
      @update:modelValue="onInput"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingFieldNumber",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    modelValueSafe(): any {
      return this.modelValue === null || this.modelValue === undefined ? "" : this.modelValue;
    },

    label(): string {
      return this.field?.title ? String(this.field.title) : "";
    },

    placeholder(): string {
      return this.field?.placeholder ? String(this.field.placeholder) : "";
    },

    min(): any {
      return this.field?.min ?? undefined;
    },

    max(): any {
      return this.field?.max ?? undefined;
    },

    step(): any {
      return this.field?.step ?? 1;
    },
  },

  methods: {
    onInput(v: any) {
      if (v === "" || v === null || v === undefined) {
        this.$emit("update:modelValue", null);
        return;
      }
      const n = Number(v);
      this.$emit("update:modelValue", Number.isFinite(n) ? n : null);
    },
  },
};
</script>

<style scoped>
.sld-onb-field {
  width: 100%;
}
</style>

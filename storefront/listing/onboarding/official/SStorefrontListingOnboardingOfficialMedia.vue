<template>
  <div class="sld-onb-field">
    <v-file-input
      :model-value="internalFiles"
      label="Photos"
      multiple
      accept="image/*"
      variant="outlined"
      density="comfortable"
      prepend-icon=""
      prepend-inner-icon="photo_library"
      @update:modelValue="onUpdate"
    />
    <div class="text-muted mt-1" style="font-size: 12px">
      Add at least 5 photos for best results.
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingOfficialMedia",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    internalFiles(): any {
      return Array.isArray(this.modelValue) ? this.modelValue : [];
    },
  },

  methods: {
    onUpdate(v: any) {
      this.$emit("update:modelValue", Array.isArray(v) ? v : []);
    },
  },
};
</script>

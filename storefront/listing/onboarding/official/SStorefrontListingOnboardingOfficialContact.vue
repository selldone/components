<template>
  <div class="sld-onb-field">
    <v-text-field
      :model-value="tel"
      label="Phone"
      placeholder="+1 555 123 4567"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="call"
      @update:modelValue="(v) => patch({ tel: String(v || '') })"
    />

    <v-text-field
      :model-value="email"
      label="Email"
      placeholder="you@example.com"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="email"
      @update:modelValue="(v) => patch({ email: String(v || '') })"
    />

    <v-text-field
      :model-value="website"
      label="Website"
      placeholder="https://"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="language"
      @update:modelValue="(v) => patch({ website: String(v || '') })"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingOfficialContact",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    obj(): any {
      return this.modelValue && typeof this.modelValue === "object" ? this.modelValue : {};
    },

    tel(): string {
      return this.obj.tel ? String(this.obj.tel) : "";
    },

    email(): string {
      return this.obj.email ? String(this.obj.email) : "";
    },

    website(): string {
      return this.obj.website ? String(this.obj.website) : "";
    },
  },

  methods: {
    patch(p: any) {
      this.$emit("update:modelValue", { ...this.obj, ...(p || {}) });
    },
  },
};
</script>

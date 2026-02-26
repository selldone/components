<template>
  <div class="sld-onb-field">
    <v-text-field
      :model-value="address"
      label="Address"
      placeholder="Enter your address"
      variant="outlined"
      prepend-inner-icon="place"
      density="comfortable"
      @update:modelValue="onUpdateAddress"
    />

    <div class="sld-onb-map">
      <div class="sld-onb-map__badge">
        <v-icon size="18">map</v-icon>
        <span>Map preview</span>
      </div>
    </div>

    <div class="text-muted mt-2" style="font-size: 12px">
      In production, you can connect this to your preferred map provider.
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingFieldMap",

  props: {
    field: { type: Object, required: true },
    modelValue: { default: null },
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  computed: {
    address(): string {
      const v = this.modelValue;
      if (typeof v === "string") return v;
      if (v && typeof v === "object") return String(v.address || "");
      return "";
    },
  },

  methods: {
    onUpdateAddress(v: any) {
      const next = {
        ...(this.modelValue && typeof this.modelValue === "object" ? this.modelValue : {}),
        address: String(v || ""),
      };
      this.$emit("update:modelValue", next);
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-onb-field {
  width: 100%;
}

.sld-onb-map {
  height: 280px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.03),
    rgba(0, 0, 0, 0.03) 10px,
    rgba(0, 0, 0, 0.015) 10px,
    rgba(0, 0, 0, 0.015) 20px
  );
  position: relative;
  overflow: hidden;

  &__badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 6px 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
  }
}
</style>

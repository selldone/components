<template>
  <div class="sld-onb-field">
    <v-row dense>
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="country_code"
          label="Country code"
          placeholder="US"
          variant="outlined"
          density="comfortable"
          @update:modelValue="(v) => patch({ country_code: String(v || '') })"
        />
      </v-col>

      <v-col cols="12" md="8">
        <v-text-field
          :model-value="city"
          label="City"
          placeholder="City"
          variant="outlined"
          density="comfortable"
          @update:modelValue="(v) => patch({ city: String(v || '') })"
        />
      </v-col>
    </v-row>

    <v-text-field
      :model-value="address"
      label="Address"
      placeholder="Enter your address"
      variant="outlined"
      prepend-inner-icon="place"
      density="comfortable"
      @update:modelValue="(v) => patch({ address: String(v || '') })"
    />

    <div class="sld-onb-map">
      <div class="sld-onb-map__badge">
        <v-icon size="18">my_location</v-icon>
        <span>Pin location</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingOfficialLocation",

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

    country_code(): string {
      return this.obj.country_code ? String(this.obj.country_code) : "";
    },

    city(): string {
      return this.obj.city ? String(this.obj.city) : "";
    },

    address(): string {
      return this.obj.address ? String(this.obj.address) : "";
    },
  },

  methods: {
    patch(p: any) {
      this.$emit("update:modelValue", { ...this.obj, ...(p || {}) });
    },
  },
};
</script>

<style lang="scss" scoped>
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

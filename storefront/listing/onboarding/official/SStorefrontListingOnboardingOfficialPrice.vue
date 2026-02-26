<template>
  <div class="sld-onb-field">
    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          :model-value="price"
          type="number"
          label="Price"
          placeholder="0"
          variant="outlined"
          density="comfortable"
          @update:modelValue="(v) => patch({ price: toNumberOrNull(v) })"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          :model-value="price_to"
          type="number"
          label="Price to (optional)"
          placeholder="0"
          variant="outlined"
          density="comfortable"
          @update:modelValue="(v) => patch({ price_to: toNumberOrNull(v) })"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          :model-value="currency"
          label="Currency"
          placeholder="USD"
          variant="outlined"
          density="comfortable"
          @update:modelValue="(v) => patch({ currency: String(v || '') })"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          :model-value="price_unit"
          label="Unit"
          placeholder="per night / per item"
          variant="outlined"
          density="comfortable"
          @update:modelValue="(v) => patch({ price_unit: String(v || '') })"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingOnboardingOfficialPrice",

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

    price(): any {
      return this.obj.price ?? null;
    },

    price_to(): any {
      return this.obj.price_to ?? null;
    },

    currency(): string {
      return this.obj.currency ? String(this.obj.currency) : "";
    },

    price_unit(): string {
      return this.obj.price_unit ? String(this.obj.price_unit) : "";
    },
  },

  methods: {
    toNumberOrNull(v: any) {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    },

    patch(p: any) {
      this.$emit("update:modelValue", { ...this.obj, ...(p || {}) });
    },
  },
};
</script>

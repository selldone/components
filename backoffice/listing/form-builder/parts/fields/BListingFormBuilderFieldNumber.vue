<template>
  <div class="sld-bfb-fcfg" :class="{ 'sd-modern-underlined-field': listingFormBuilderModern }">
    <v-text-field v-model="nameProxy" :label="$t('shop_listing.form_builder.field_key')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
    <v-text-field v-model="titleProxy" :label="$t('shop_listing.form_builder.label')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
    <div class="sld-bfb-row">
      <v-text-field v-model="minProxy" type="number" :label="$t('shop_listing.form_builder.min')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
      <v-text-field v-model="maxProxy" type="number" :label="$t('shop_listing.form_builder.max')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
      <v-text-field v-model="stepProxy" type="number" :label="$t('shop_listing.form_builder.increment')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
    </div>
    <u-smart-toggle v-if="listingFormBuilderModern" v-model="requiredProxy" accessible border false-gray class="sd-modern-smart-select" :true-title="$t('shop_listing.form_builder.required')" :false-title="$t('shop_listing.form_builder.optional')" />
    <v-switch v-else v-model="requiredProxy" :label="$t('shop_listing.form_builder.required')" inset />
  </div>
</template>

<script lang="ts">
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
export default {
  name: "BListingFormBuilderFieldNumber",
  components: { USmartToggle },
  inject: { listingFormBuilderModern: { default: false } },
  props: { modelValue: { type: Object, required: true } },
  emits: ["update:modelValue"],

  computed: {
    nameProxy: {
      get(): string {
        return String((this as any).modelValue?.name ?? "");
      },
      set(v: any) {
        (this as any).patch({ name: String(v ?? "") });
      },
    },
    titleProxy: {
      get(): string {
        return String((this as any).modelValue?.title ?? "");
      },
      set(v: any) {
        (this as any).patch({ title: String(v ?? "") });
      },
    },
    minProxy: {
      get(): any {
        const v = (this as any).modelValue?.min;
        return v === null || v === undefined ? "" : String(v);
      },
      set(v: any) {
        (this as any).patch({ min: v === "" ? null : Number(v) });
      },
    },
    maxProxy: {
      get(): any {
        const v = (this as any).modelValue?.max;
        return v === null || v === undefined ? "" : String(v);
      },
      set(v: any) {
        (this as any).patch({ max: v === "" ? null : Number(v) });
      },
    },
    stepProxy: {
      get(): any {
        const v = (this as any).modelValue?.step;
        return v === null || v === undefined ? "" : String(v);
      },
      set(v: any) {
        const n = Number(v);
        (this as any).patch({ step: v === "" ? 1 : (Number.isFinite(n) ? n : 1) });
      },
    },
    requiredProxy: {
      get(): boolean {
        return !!((this as any).modelValue?.required ?? false);
      },
      set(v: any) {
        (this as any).patch({ required: !!v });
      },
    },
  },

  methods: {
    patch(p: any) {
      const cur = (this as any).modelValue || {};
      (this as any).$emit("update:modelValue", { ...cur, ...p });
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-fcfg {
  display: grid;
  gap: 10px;
  min-width: 0;
}
.sld-bfb-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  min-width: 0;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}
.sld-bfb-fcfg.sd-modern-underlined-field { gap: 26px; }
</style>
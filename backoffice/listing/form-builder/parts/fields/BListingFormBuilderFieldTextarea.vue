<template>
  <div class="sld-bfb-fcfg" :class="{ 'sd-modern-underlined-field': listingFormBuilderModern }">
    <v-text-field v-model="nameProxy" :label="$t('shop_listing.form_builder.field_key')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
    <v-text-field v-model="titleProxy" :label="$t('shop_listing.form_builder.label')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
    <v-textarea v-model="placeholderProxy" :label="$t('shop_listing.form_builder.placeholder')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" rows="2" auto-grow />
    <u-smart-toggle v-if="listingFormBuilderModern" v-model="requiredProxy" accessible border false-gray class="sd-modern-smart-select" :true-title="$t('shop_listing.form_builder.required')" :false-title="$t('shop_listing.form_builder.optional')" />
    <v-switch v-else v-model="requiredProxy" :label="$t('shop_listing.form_builder.required')" inset />
  </div>
</template>

<script lang="ts">
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
export default {
  name: "BListingFormBuilderFieldTextarea",
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
    placeholderProxy: {
      get(): string {
        return String((this as any).modelValue?.placeholder ?? "");
      },
      set(v: any) {
        (this as any).patch({ placeholder: String(v ?? "") });
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
.sld-bfb-fcfg.sd-modern-underlined-field { gap: 26px; }
</style>
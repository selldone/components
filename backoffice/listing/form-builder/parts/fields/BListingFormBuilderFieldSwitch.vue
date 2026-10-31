<template>
  <div class="sld-bfb-fcfg" :class="{ 'sd-modern-underlined-field': listingFormBuilderModern }">
    <v-text-field v-model="nameProxy" :label="$t('shop_listing.form_builder.field_key')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
    <v-text-field v-model="titleProxy" :label="$t('shop_listing.form_builder.label')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" />
    <v-textarea v-model="hintTrueProxy" :label="$t('shop_listing.form_builder.hint_on')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" rows="2" auto-grow />
    <v-textarea v-model="hintFalseProxy" :label="$t('shop_listing.form_builder.hint_off')" :variant="listingFormBuilderModern ? 'underlined' : 'outlined'" density="comfortable" rows="2" auto-grow />
    <u-smart-toggle v-if="listingFormBuilderModern" v-model="defaultProxy" accessible border false-gray class="sd-modern-smart-select" :true-title="$t('shop_listing.form_builder.default_on')" :false-title="$t('shop_listing.form_builder.default_on')" />
    <v-switch v-else v-model="defaultProxy" :label="$t('shop_listing.form_builder.default_on')" inset />
  </div>
</template>

<script lang="ts">
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
export default {
  name: "BListingFormBuilderFieldSwitch",
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
    hintTrueProxy: {
      get(): string {
        return String((this as any).modelValue?.hint_true ?? "");
      },
      set(v: any) {
        (this as any).patch({ hint_true: String(v ?? "") });
      },
    },
    hintFalseProxy: {
      get(): string {
        return String((this as any).modelValue?.hint_false ?? "");
      },
      set(v: any) {
        (this as any).patch({ hint_false: String(v ?? "") });
      },
    },
    defaultProxy: {
      get(): boolean {
        return !!((this as any).modelValue?.default ?? false);
      },
      set(v: any) {
        (this as any).patch({ default: !!v });
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
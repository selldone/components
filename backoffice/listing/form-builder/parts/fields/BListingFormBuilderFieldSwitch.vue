<template>
  <div class="sld-bfb-fcfg">
    <v-text-field v-model="nameProxy" label="Field key (name)" variant="outlined" density="comfortable" />
    <v-text-field v-model="titleProxy" label="Label" variant="outlined" density="comfortable" />
    <v-textarea v-model="hintTrueProxy" label="Hint (when ON)" variant="outlined" density="comfortable" rows="2" auto-grow />
    <v-textarea v-model="hintFalseProxy" label="Hint (when OFF)" variant="outlined" density="comfortable" rows="2" auto-grow />
    <v-switch v-model="defaultProxy" label="Default ON" inset />
  </div>
</template>

<script lang="ts">
export default {
  name: "BListingFormBuilderFieldSwitch",
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
}
</style>
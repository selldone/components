<template>
  <div class="sld-bfb-fcfg">
    <v-text-field v-model="nameProxy" label="Field key (name)" variant="outlined" density="comfortable" />
    <v-text-field v-model="titleProxy" label="Label" variant="outlined" density="comfortable" />
    <v-textarea v-model="hintProxy" label="Hint" variant="outlined" density="comfortable" rows="2" auto-grow />
    <v-switch v-model="requiredProxy" label="Required" inset />
  </div>
</template>

<script lang="ts">
export default {
  name: "BListingFormBuilderFieldMap",
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
    hintProxy: {
      get(): string {
        return String((this as any).modelValue?.hint ?? "");
      },
      set(v: any) {
        (this as any).patch({ hint: String(v ?? "") });
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
}
</style>
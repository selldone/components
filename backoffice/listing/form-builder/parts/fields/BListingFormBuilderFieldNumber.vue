<template>
  <div class="sld-bfb-fcfg">
    <v-text-field v-model="nameProxy" label="Field key (name)" variant="outlined" density="comfortable" />
    <v-text-field v-model="titleProxy" label="Label" variant="outlined" density="comfortable" />
    <div class="sld-bfb-row">
      <v-text-field v-model="minProxy" type="number" label="Min" variant="outlined" density="comfortable" />
      <v-text-field v-model="maxProxy" type="number" label="Max" variant="outlined" density="comfortable" />
      <v-text-field v-model="stepProxy" type="number" label="Step" variant="outlined" density="comfortable" />
    </div>
    <v-switch v-model="requiredProxy" label="Required" inset />
  </div>
</template>

<script lang="ts">
export default {
  name: "BListingFormBuilderFieldNumber",
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
}
.sld-bfb-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}
</style>
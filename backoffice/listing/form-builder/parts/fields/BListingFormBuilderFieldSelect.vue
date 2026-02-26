<template>
  <div class="sld-bfb-fcfg">
    <v-text-field v-model="nameProxy" label="Field key (name)" variant="outlined" density="comfortable" />
    <v-text-field v-model="titleProxy" label="Label" variant="outlined" density="comfortable" />

    <div class="d-flex align-center mt-1">
      <v-switch v-model="multipleProxy" label="Multiple" inset />
      <v-spacer />
      <v-switch v-model="requiredProxy" label="Required" inset />
    </div>

    <v-text-field
      v-if="variantSafe === 'grid'"
      v-model.number="columnsProxy"
      label="Grid columns"
      type="number"
      min="1"
      max="6"
      variant="outlined"
      density="comfortable"
      hint="How many columns to show on desktop"
      persistent-hint
    />

    <v-divider class="my-2" />

    <div class="d-flex align-center">
      <div class="font-weight-black">Options</div>
      <v-spacer />
      <v-btn size="small" variant="text" @click="addOption">
        <v-icon start>add</v-icon>
        Add option
      </v-btn>
    </div>

    <div v-if="!optionsSafe.length" class="text-muted">
      No options yet.
    </div>

    <div v-else class="sld-bfb-opts">
      <b-listing-form-builder-field-select-option
        v-for="(opt, i) in optionsSafe"
        :key="`opt_${i}`"
        :model-value="opt"
        @update:modelValue="updateOption(i, $event)"
        @remove="removeOption(i)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import BListingFormBuilderFieldSelectOption from "./BListingFormBuilderFieldSelectOption.vue";

export default {
  name: "BListingFormBuilderFieldSelect",
  components: { BListingFormBuilderFieldSelectOption },

  props: { modelValue: { type: Object, required: true } },
  emits: ["update:modelValue"],

  computed: {
    variantSafe(): string {
      return String((this as any).modelValue?.variant ?? "grid");
    },

    optionsSafe(): any[] {
      const v = (this as any).modelValue?.options;
      return Array.isArray(v) ? v : [];
    },

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
    multipleProxy: {
      get(): boolean {
        return !!((this as any).modelValue?.multiple ?? false);
      },
      set(v: any) {
        (this as any).patch({ multiple: !!v });
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

    columnsProxy: {
      get(): number {
        const n = parseInt(String((this as any).modelValue?.columns ?? 3), 10);
        return Number.isFinite(n) && n > 0 ? n : 3;
      },
      set(v: any) {
        const n = parseInt(String(v ?? 3), 10);
        const clamped = Number.isFinite(n) ? Math.min(Math.max(n, 1), 6) : 3;
        (this as any).patch({ columns: clamped });
      },
    },
  },

  methods: {
    patch(p: any) {
      const cur = (this as any).modelValue || {};
      (this as any).$emit("update:modelValue", { ...cur, ...p });
    },

    addOption() {
      const next = [...this.optionsSafe, { title: "", value: "", subtitle: "", image: null }];
      this.patch({ options: next });
    },

    updateOption(i: number, v: any) {
      const next = this.optionsSafe.slice();
      next[i] = v;
      this.patch({ options: next });
    },

    removeOption(i: number) {
      const next = this.optionsSafe.slice();
      next.splice(i, 1);
      this.patch({ options: next });
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-fcfg {
  display: grid;
  gap: 10px;
}
.sld-bfb-opts {
  display: grid;
  gap: 10px;
}
</style>
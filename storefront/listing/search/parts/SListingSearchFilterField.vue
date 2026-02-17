<template>
  <div class="sld-filter">
    <div class="sld-filter-label">
      {{ filterLabel }}
    </div>

    <!-- select / key_value -->
    <v-select
      v-if="isSelectType"
      :model-value="value"
      :items="optionsSafe"
      variant="solo"
      bg-color="transparent"
      density="comfortable"
      hide-details
      flat
      clearable
      class="sld-input"
      :multiple="isMultiple"
      :chips="isMultiple"
      :closable-chips="isMultiple"
      @update:modelValue="setValue"
    />

    <!-- switch -->
    <v-switch
      v-else-if="isSwitchType"
      :model-value="!!value"
      hide-details
      inset
      density="compact"
      class="sld-switch"
      @update:modelValue="setValue"
    />

    <!-- text -->
    <v-text-field
      v-else
      :model-value="value"
      variant="solo"
      bg-color="transparent"
      density="comfortable"
      hide-details
      flat
      clearable
      class="sld-input"
      @update:modelValue="setValue"
      @keydown.enter.prevent="$emit('enter')"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SListingSearchFilterField",

  props: {
    filter: { type: Object, required: true },
    modelValue: { type: Object, default: () => ({}) },
  },

  emits: ["update:modelValue", "enter"],

  computed: {
    key(): string {
      return String((this as any).filter?.key || "").trim();
    },

    filterLabel(): string {
      const f: any = (this as any).filter;
      return String(f?.label || f?.key || "Filter");
    },

    type(): string {
      const raw = (this as any).filter?.type;
      const t = String(raw ?? "select").trim().toLowerCase().replace(/-/g, "_");
      if (t === "key_value") return "key_value";
      if (t === "switch") return "switch";
      if (t === "text") return "text";
      return "select";
    },

    isMultiple(): boolean {
      return !!(this as any).filter?.multiple;
    },

    isSelectType(): boolean {
      return this.type === "select" || this.type === "key_value";
    },

    isSwitchType(): boolean {
      return this.type === "switch";
    },

    value(): any {
      const obj: any = (this as any).modelValue || {};
      return Object.prototype.hasOwnProperty.call(obj, this.key) ? obj[this.key] : null;
    },

    optionsSafe(): any[] {
      const f: any = (this as any).filter;
      const opts = Array.isArray(f?.options) ? f.options : [];
      return opts
        .map((x: any) => String(x ?? "").trim())
        .filter((x: string) => x.length)
        .map((x: string) => ({ title: x, value: x }));
    },
  },

  methods: {
    setValue(v: any) {
      const obj: any = (this as any).modelValue && typeof (this as any).modelValue === "object" ? (this as any).modelValue : {};
      this.$emit("update:modelValue", { ...obj, [this.key]: v });
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-filter {
  min-width: 0;
  width: 100%;
}

.sld-filter-label {
  font-size: 12px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.52);
  margin-bottom: 6px;
}

.sld-input {
  width: 100%;
}

.sld-switch {
  margin-left: -6px;
}
</style>

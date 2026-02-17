<template>
  <div class="sld-block">
    <div class="sld-label">Filters</div>

    <div class="sld-filters">
      <s-listing-search-filter-field
        v-for="f in filtersSafe"
        :key="String(f.key)"
        :filter="f"
        :model-value="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        @enter="$emit('enter')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import SListingSearchFilterField from "./SListingSearchFilterField.vue";

export default {
  name: "SListingSearchFilters",
  components: { SListingSearchFilterField },

  props: {
    modelValue: { type: Object, default: () => ({}) },
    filters: { type: Array, default: () => [] },
  },

  emits: ["update:modelValue", "enter"],

  computed: {
    filtersSafe(): any[] {
      return Array.isArray(this.filters) ? this.filters : [];
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-block {
  min-width: 0;
}

.sld-label {
  font-size: 13px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 8px;
}

.sld-filters {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
</style>

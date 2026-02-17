<template>
  <div class="sld-block">
    <div class="sld-label">Search</div>

    <v-text-field
      :model-value="modelValue"
      :placeholder="placeholder"
      prepend-inner-icon="search"
      variant="solo"
      bg-color="transparent"
      density="comfortable"
      hide-details
      flat
      class="sld-input"
      @update:modelValue="$emit('update:modelValue', $event)"
      @keydown.enter.prevent="$emit('enter')"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SListingSearchText",
  props: {
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "" },
  },
  emits: ["update:modelValue", "enter"],
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

.sld-input {
  width: 100%;
}
</style>

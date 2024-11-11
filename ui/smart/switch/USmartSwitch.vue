<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <u-smart-select
    :border="border"
    :class="{ 'v-theme--dark': dark }"
    :clearable="clearable"
    :color="falseGray && !localModelValue ? '#666' : color"
    :dark="dark"
    :disabled="disabled"
    :force-show-all="forceShowAll"
    :hint="hint"
    :items="items"
    :label="label"
    :loading="loading"
    :model-value="localModelValue"
    :readonly="readonly"
    item-description="description"
    item-icon="icon"
    item-text="title"
    item-value="id"
    @change="handleChange"
    @update:model-value="updateModelValue"
  >
  </u-smart-select>
</template>

<script lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import USmartSelect from "../select/USmartSelect.vue";

export default {
  name: "USmartSwitch",
  emits: ["update:modelValue", "change"],
  components: { USmartSelect },
  props: {
    modelValue: {},
    label: {},
    hint: {},
    trueTitle: {},
    falseTitle: {},
    trueDescription: {},
    falseDescription: {},
    trueIcon: {},
    falseIcon: {},
    forceShowAll: { default: true, type: Boolean },
    disabled: { default: false, type: Boolean },
    falseGray: { default: false, type: Boolean },
    border: { default: false, type: Boolean },
    trueDisabled: { default: false, type: Boolean },
    falseDisabled: { default: false, type: Boolean },
    readonly: { default: false, type: Boolean },
    color: { default: "primary" },
    dark: { default: false, type: Boolean },
    clearable: { default: false, type: Boolean },
    loading: { default: false, type: Boolean },
  },
  setup(props, { emit }) {
    const localModelValue = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newVal) => {
        localModelValue.value = newVal;
      },
    );

    const updateModelValue = (newVal) => {
      localModelValue.value = newVal;
      emit("update:modelValue", newVal);
    };

    const handleChange = (val) => {
      nextTick(() => {
        emit("change", val);
      });
    };

    const items = computed(() => [
      {
        id: true,
        title: props.trueTitle,
        icon: props.trueIcon,
        description: props.trueDescription,
        disabled: props.trueDisabled,
      },
      {
        id: false,
        title: props.falseTitle,
        icon: props.falseIcon,
        description: props.falseDescription,
        disabled: props.falseDisabled,
      },
    ]);

    return {
      localModelValue,
      updateModelValue,
      handleChange,
      items,
    };
  },
};
</script>

<style lang="scss" scoped></style>

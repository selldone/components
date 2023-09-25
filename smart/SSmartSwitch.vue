<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <s-smart-select
    :value="value"
    @input="(val) => $emit('input', val)"
    :items="items"
    item-value="id"
    item-text="title"
    item-description="description"
    item-icon="icon"
    :label="label"
    :hint="hint"
    :force-show-all="forceShowAll"
    @change="(val) => $nextTick(() => {$emit('change', val)})"
    :disabled="disabled"
    :color="falseGray && !value ? '#666' : color"
    :readonly="readonly"
    :dark="dark"
    :border="border"
    :clearable="clearable"
    :class="{ 'theme--dark': dark }"
    :loading="loading"
  >
  </s-smart-select>
</template>

<script>
import SSmartSelect from "./SSmartSelect.vue";

export default {
  name: "SSmartSwitch",
  components: { SSmartSelect },
  props: {
    value: {},

    label: {},
    hint: {},

    trueTitle: {},
    falseTitle: {},

    trueDescription: {},
    falseDescription: {},

    trueIcon: {},
    falseIcon: {},
    forceShowAll: {
      default: true,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    falseGray: {
      default: false,
      type: Boolean,
    },
    border: {
      default: false,
      type: Boolean,
    },

    trueDisabled: {
      default: false,
      type: Boolean,
    },
    falseDisabled: {
      default: false,
      type: Boolean,
    },
    readonly: {
      default: false,
      type: Boolean,
    },
    color: { default: "primary" },
    dark: {
      default: false,
      type: Boolean,
    },

    clearable: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    items() {
      return [
        {
          id: true,
          title: this.trueTitle,
          icon: this.trueIcon,
          description: this.trueDescription,
          disabled: this.trueDisabled,
        },
        {
          id: false,
          title: this.falseTitle,
          icon: this.falseIcon,
          description: this.falseDescription,
          disabled: this.falseDisabled,
        },
      ];
    },
  },
};
</script>

<style scoped lang="scss"></style>

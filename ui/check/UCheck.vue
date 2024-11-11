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
  <span :class="{ pen: readOnly }">
    <v-icon
      v-if="checked"
      :color="trueColor"
      :size="size ? size : small ? 'small' : undefined"
      @click.stop="set(false)"
      class="hover-scale-small"
      key="1"
    >
      {{ trueIcon }}
    </v-icon>
    <v-icon
      v-else
      :color="falseColor"
      :size="size ? size : small ? 'small' : undefined"
      @click.stop="set(true)"
      class="hover-scale-small"
      key="2"
    >
      {{ falseIcon }}
    </v-icon>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UCheck",
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    size: {},
    trueColor: { default: "green" },
    falseColor: { default: "red" },
    small: {
      type: Boolean,
      default: false,
    },
    trueIcon: { default: "check" },
    falseIcon: { default: "close" },

    readOnly: Boolean,
  },
  data: () => ({
    checked: false,
  }),

  watch: {
    modelValue(val) {
      this.checked = val;
    },
  },

  created() {
    this.checked = this.modelValue;
  },
  methods: {
    set(checked) {
      this.checked = checked;
      this.$emit("update:modelValue", checked);
    },
  },
});
</script>

<style scoped></style>

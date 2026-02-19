<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <div class="text-start">
    <v-combobox
      v-bind="$attrs"
      :model-value="proxy"
      multiple
      chips
      closable-chips
      clearable
      :label="resolvedLabel"
      :variant="variant"
      prepend-inner-icon="link"
      hide-selected
      @update:model-value="onUpdate"
      messages="Add one or more URLs. Press Enter after each link."
    >
      <template #chip="{ item, props }">
        <v-chip
          v-bind="props"
          label
          size="small"
          class="ma-1"
        >
          {{ item.raw }}
        </v-chip>
      </template>
    </v-combobox>


  </div>
</template>

<script lang="ts">
export default {
  name: "BListingLinksInput",
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    variant: {
      type: String,
      default: "underlined",
    },
    autoHttps: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    resolvedLabel(): string {
      if (this.label) return this.label;
      // @ts-ignore
      return typeof this.$t === "function" ? this.$t("global.commons.links") : "Links";
    },

    proxy(): string[] {
      const v: any = this.modelValue;
      if (!v) return [];
      if (Array.isArray(v)) return v.map((x) => String(x)).filter((x) => x.trim().length);
      return [];
    },
  },

  methods: {
    normalizeLink(url: string): string | null {
      let u = String(url || "").trim();
      if (!u) return null;

      // split pasted multi-line into first line is handled by v-combobox automatically,
      // but we still normalize final array.
      u = u.replace(/\s+/g, " ").trim();

      if (this.autoHttps) {
        const hasProtocol = /^https?:\/\//i.test(u);
        if (!hasProtocol && /^[a-z0-9.-]+\.[a-z]{2,}/i.test(u)) {
          u = "https://" + u;
        }
      }

      return u;
    },

    onUpdate(list: any[]) {
      const out: string[] = [];

      (Array.isArray(list) ? list : []).forEach((x) => {
        const n = this.normalizeLink(String(x));
        if (!n) return;
        if (!out.includes(n)) out.push(n);
      });

      this.$emit("update:modelValue", out);
    },
  },
};
</script>

<style scoped></style>

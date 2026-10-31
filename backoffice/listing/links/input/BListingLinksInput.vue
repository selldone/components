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
  <div
    class="text-start"
    :class="modern ? 'b-listing-links-input--modern' : undefined"
  >
    <v-combobox
      v-bind="$attrs"
      :class="
        modern ? 'sd-modern-underlined-field v-input-auto-height' : undefined
      "
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
      :messages="
        modern
          ? $t('shop_listing.item_editor.links_hint')
          : 'Add one or more URLs. Press Enter after each link.'
      "
    >
      <template #chip="{ item, props, index }">
        <v-chip
          v-bind="props"
          label
          size="small"
          :class="modern ? 'b-listing-links-input__chip' : 'ma-1'"
        >
          <span
            v-if="modern"
            v-overflow-check="(clipped) => (clippedLinks[index] = clipped)"
            class="b-listing-links-input__url"
            :tabindex="clippedLinks[index] ? 0 : undefined"
            @keydown.enter.stop
            @keydown.space.stop
          >
            {{ item.raw }}
            <v-tooltip
              activator="parent"
              :disabled="!clippedLinks[index]"
              location="top"
              open-on-focus
              open-on-click
              content-class="sd-modern-tooltip text-start"
              >{{ item.raw }}</v-tooltip
            >
          </span>
          <template v-else>{{ item.raw }}</template>
        </v-chip>
      </template>
    </v-combobox>
  </div>
</template>

<script lang="ts">
export default {
  name: "BListingLinksInput",
  directives: {
    overflowCheck: {
      mounted(element, binding) {
        const state = { notify: binding.value, observer: null, measure: null };
        state.measure = () =>
          state.notify(element.scrollWidth > element.clientWidth + 1);
        state.observer = new ResizeObserver(state.measure);
        state.observer.observe(element);
        element._listingLinkOverflow = state;
        state.measure();
      },
      updated(element, binding) {
        const state = element._listingLinkOverflow;
        state.notify = binding.value;
        state.measure();
      },
      beforeUnmount(element) {
        element._listingLinkOverflow.observer.disconnect();
        delete element._listingLinkOverflow;
      },
    },
  },
  emits: ["update:modelValue"],
  props: {
    modern: { type: Boolean, default: false },
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

  data: () => ({ clippedLinks: [] as boolean[] }),

  computed: {
    resolvedLabel(): string {
      if (this.label) return this.label;
      // @ts-ignore
      return typeof this.$t === "function"
        ? this.$t("global.commons.links")
        : "Links";
    },

    proxy(): string[] {
      const v: any = this.modelValue;
      if (!v) return [];
      if (Array.isArray(v))
        return v.map((x) => String(x)).filter((x) => x.trim().length);
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

<style scoped>
.b-listing-links-input--modern {
  min-width: 0;
}
.b-listing-links-input__chip {
  max-width: calc(100% - 4px);
  margin-block: 2px;
  margin-inline-end: 4px;
  font-size: 13px;
  font-weight: 400;
}
.b-listing-links-input__chip :deep(.v-chip__content) {
  min-width: 0;
}
.b-listing-links-input__chip :deep(.v-chip__close) {
  flex-shrink: 0;
}
.b-listing-links-input__url {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 20px;
}
.b-listing-links-input__url:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}
</style>

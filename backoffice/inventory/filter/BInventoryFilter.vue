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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-select
    ref="select"
    :class="{ 'b-inventory-filter--modern': modern }"
    :menu-icon="modern ? '' : undefined"
    :menu-props="modern ? modernMenuProps : undefined"
    :list-props="modern ? modernListProps : undefined"
    :no-auto-scroll="modern || undefined"
    :disabled="disabled"
    :readonly="readonly"
    :density="dense ? 'compact' : undefined"
    :flat="flat"
    :items="[
      ...Object.values(ProductType).map((t) => {
        return { value: t.code, obj: t, ...(modern ? { title: $t(t.name) } : {}) };
      }),
      ...Object.values(ProductStatus).map((t) => {
        return { value: t.code, obj: t, ...(modern ? { title: $t(t.name) } : {}) };
      }),
    ]"
    :model-value="modelValue"
    :placeholder="$t(modern ? 'inventory_filter.all_products' : 'inventory_filter.placeholder')"
    :aria-label="$t('inventory_filter.placeholder')"
    :single-line="modern"
    :variant="variant"
    bg-color="transparent"
    chips
    clearable
    hide-details
    item-value="value"
    multiple
    :prepend-inner-icon="modern ? undefined : 'filter_alt'"
    @update:model-value="updateValue"
  >
    <template v-if="modern" v-slot:prepend-inner><b-inventory-list-icon name="list-filter" /></template>
    <template v-if="modern" v-slot:append-inner><b-inventory-list-icon name="chevron-down" class="b-inventory-filter__chevron" /></template>
    <template v-if="modern" #menu-header>
      <div class="b-inventory-filter__header">
        <h2>{{ $t("inventory_filter.modern.title") }}</h2>
        <v-btn
          class="b-inventory-filter__clear"
          variant="text"
          color="primary"
          :disabled="filterDisabled || filterReadonly || !modelValue?.length"
          @click.stop="clearFilters"
        >{{ $t("inventory_filter.modern.clear_all") }}</v-btn>
        <v-btn class="sd-modern-icon-button b-inventory-filter__close" icon variant="text" :aria-label="$t('global.actions.close')" @click.stop="closeMenu">
          <v-icon size="16">close</v-icon>
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t("global.actions.close") }}</v-tooltip>
        </v-btn>
      </div>
    </template>
    <template v-if="modern" #prepend-item>
      <div class="b-inventory-filter__group" style="grid-column: 1; grid-row: 1" role="presentation">{{ $t("global.commons.product_type") }}</div>
      <div class="b-inventory-filter__group" style="grid-column: 2; grid-row: 1" role="presentation">{{ $t("global.commons.status") }}</div>
      <span class="b-inventory-filter__divider" aria-hidden="true" />
      <!-- Render all ten native choices; linear virtual scrolling cannot model two columns. -->
      <v-list-item
        v-for="(item, index) in select?.filteredItems || []"
        :key="item.value"
        v-bind="item.props"
        :value="item.value"
        :disabled="filterDisabled || filterReadonly || item.props.disabled"
        :aria-selected="!!modelValue?.includes(item.value)"
        :aria-posinset="index + 1"
        :aria-setsize="10"
        :data-filter-value="item.value"
        :style="{ gridColumn: index < 5 ? 1 : 2, gridRow: index % 5 + 2 }"
        :class="{ 'b-inventory-filter__option--last': index === 4 || index === 9 }"
        class="b-inventory-filter__option text-start"
        role="option"
        @click="toggleModernItem(item)"
      >
        <template #prepend>
          <v-checkbox-btn
            :model-value="!!modelValue?.includes(item.value)"
            :disabled="filterDisabled || filterReadonly || item.props.disabled"
            class="b-inventory-filter__checkbox"
            color="primary"
            density="compact"
            :ripple="false"
            tabindex="-1"
            aria-hidden="true"
          />
        </template>
        <template #title>
          <span class="b-inventory-filter__identity">
            <img v-if="item.raw.obj.image" :src="item.raw.obj.image" alt="" width="18" height="18" />
            <span v-else class="b-inventory-filter__status-icon" aria-hidden="true">
              <span class="sd-modern-status__dot" :class="statusDotClass(item.value)" />
            </span>
            <span>{{ $t(item.raw.obj.name) }}</span>
          </span>
        </template>
      </v-list-item>
    </template>
    <template v-if="modern" #menu-footer>
      <div class="b-inventory-filter__footer">
        <span>{{ $t("inventory_filter.modern.immediate") }}</span>
        <v-btn class="sd-modern-button sd-modern-button--primary b-inventory-filter__done" color="primary" variant="elevated" @click.stop="closeMenu">{{ $t("global.actions.done") }}</v-btn>
      </div>
    </template>
    <template v-slot:item="{ item, props }">
      <v-list-item v-if="!modern" class="d-flex align-center text-start" v-bind="props">
        <template v-slot:title>
          <span style="display: inline-block; min-width: 58px"
            ><v-img
              v-if="item.raw.obj.image"
              :src="item.raw.obj.image"
              class="me-2"
              height="16"
              width="16"
            ></v-img>
            <v-icon v-else class="me-2" size="small">{{
              item.raw.obj.icon
            }}</v-icon></span
          >

          {{ $t(item.raw.obj.name) }}
        </template>
      </v-list-item>
    </template>

    <template v-slot:chip="{ item, index, props }">
      <template v-if="modern && modelValue?.length > 1">
        <span v-if="index === 0" class="b-inventory-filter__summary">{{
          $t("inventory_filter.modern.active_count", { count: modelValue.length })
        }}</span>
      </template>
      <v-chip
        v-else
        v-bind="props"
        :disabled="modern && (filterDisabled || filterReadonly) ? true : props.disabled"
        :size="modern ? 'small' : dense ? 'x-small' : undefined"
        :class="modern ? 'b-inventory-filter__chip no-inv ma-1' : 'ma-1 font-weight-bold'"
        :label="modern"
        :closable="!modern || !(filterDisabled || filterReadonly)"
        :color="modern ? 'primary' : '#fafafa'"
        :theme="modern ? undefined : 'light'"
        variant="flat"
      >
        <v-img
          v-if="item.raw.obj.image"
          :src="item.raw.obj.image"
          class="me-1"
          height="16"
          width="16"
        ></v-img>
        <v-icon v-else class="me-1" size="small" start
          >{{ item.raw.obj.icon }}
        </v-icon>
        {{ $t(item.raw.obj.name) }}
      </v-chip>
    </template>
  </v-select>
</template>

<script lang="ts">
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import {ProductType} from "@selldone/core-js/enums/product/ProductType.ts";
import BInventoryListIcon from "../list/icon/BInventoryListIcon.vue";
import { ref } from "vue";
import { useForm } from "vuetify/lib/composables/form.js";

export default {
  name: "BInventoryFilter",
  components: { BInventoryListIcon },
  emits: ["update:modelValue", "change"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modelValue: {},
    dense: { type: Boolean },
    variant: {
      default: "underlined",
    },
    flat: Boolean,
    modern: Boolean,
    disabled: { type: Boolean, default: null },
    readonly: { type: Boolean, default: null },
  },
  setup(props) {
    const select = ref(null);
    const { isDisabled, isReadonly } = useForm(props);
    return { select, filterDisabled: isDisabled, filterReadonly: isReadonly };
  },
  data: function () {
    return {
      ProductType: ProductType,

      ProductStatus: ProductStatus,
    };
  },

  computed: {
    modernMenuProps() {
      const mobile = this.$vuetify.display.xs;
      return {
        contentClass: "b-inventory-filter__menu sd-modern-widget text-start",
        width: mobile ? "100vw" : 548,
        minWidth: 0,
        maxWidth: mobile ? "100vw" : "calc(100vw - 32px)",
        maxHeight: mobile ? "calc(100dvh - 12px)" : "calc(100dvh - 32px)",
        closeOnContentClick: false,
        ...(mobile ? { locationStrategy: "static", scrollStrategy: "block", scrim: true } : {}),
        contentProps: {
          style: {
            padding: "0",
            border: "1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), .09))",
            borderRadius: mobile ? "16px 16px 0 0" : "14px",
            boxShadow: mobile ? "0 -6px 24px rgba(var(--v-theme-on-surface), .12)" : "0 10px 32px rgba(var(--v-theme-on-surface), .12)",
            ...(mobile ? { position: "fixed", insetInline: "0", top: "auto", bottom: "0", margin: "0", borderBottom: "0" } : {}),
          },
        },
      };
    },
    modernListProps() {
      return {
        class: "b-inventory-filter__options",
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gridTemplateRows: "auto repeat(5, minmax(42px, auto))",
          columnGap: "14px",
          padding: "0 15px 10px",
        },
      };
    },
  },
  watch: {},
  created() {},
  methods: {
    updateValue(value) {
      if (this.modern && (this.filterDisabled || this.filterReadonly)) return;
      this.$emit("update:modelValue", value);
      this.$nextTick(() => this.$emit("change", value));
    },
    toggleModernItem(item) {
      if (this.filterDisabled || this.filterReadonly || item.props.disabled) return;
      this.select?.select(item, null);
    },
    clearFilters() {
      if (this.filterDisabled || this.filterReadonly) return;
      this.updateValue([]);
    },
    closeMenu() {
      if (this.select) this.select.menu = false;
    },
    statusDotClass(value) {
      if (value === "Open") return "sd-modern-status__dot--success";
      if (value === "Close" || value === "Rejected") return "sd-modern-status__dot--error";
      if (value === "Pending") return "sd-modern-status__dot--warning";
      return "";
    },
  },
};
</script>

<style lang="scss" scoped>
.b-inventory-filter__chip.v-chip {
  height: 26px;
  padding-inline: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0;
  :deep(.v-chip__content) { font: inherit; }
  :deep(.v-icon) { color: inherit; }
}
.b-inventory-filter__summary { font-size: 13px; font-weight: 400; line-height: 20px; white-space: nowrap; }
.b-inventory-filter--modern.v-select--active-menu :deep(.b-inventory-filter__chevron) { transform: rotate(180deg); }

.b-inventory-filter__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 15px 12px;
  h2 { flex: 1; min-width: 0; margin: 0; font-size: 14px; font-weight: 500; line-height: 21px; }
}
.b-inventory-filter__clear.v-btn {
  height: auto;
  min-width: 0;
  padding: 4px 0;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 19px;
  letter-spacing: 0;
  text-transform: none;
}
.b-inventory-filter__close { --sd-modern-icon-button-size: 32px; }
.b-inventory-filter__group {
  padding: 2px 9px 6px;
  color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66));
  font-size: 12px;
  font-weight: 400;
  line-height: 19px;
}
.b-inventory-filter__divider {
  grid-column: 2;
  grid-row: 1 / span 6;
  justify-self: start;
  width: 1px;
  margin-inline-start: -7px;
  background: var(--sd-modern-border, rgba(var(--v-theme-on-surface), .09));
  pointer-events: none;
}
.b-inventory-filter__option.v-list-item {
  min-width: 0;
  min-height: 42px;
  padding: 8px 9px;
  border-block-end: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), .09));
  border-radius: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  &.b-inventory-filter__option--last { border-block-end: 0; }
  :deep(.v-list-item-title) { font: inherit; line-height: inherit; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item__overlay) { border-radius: 6px; }
  :deep(.v-list-item__prepend > .v-list-item__spacer) { width: 10px; }
}
.b-inventory-filter__option ~ :deep(.v-virtual-scroll__spacer) { display: none; }
.b-inventory-filter__checkbox { --v-selection-control-size: 18px; pointer-events: none; }
.b-inventory-filter__checkbox :deep(.v-icon) { font-size: 18px; }
.b-inventory-filter__identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  img { flex-shrink: 0; object-fit: contain; }
}
.b-inventory-filter__status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  .sd-modern-status__dot { width: 7px; height: 7px; }
}
.b-inventory-filter__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 15px;
  border-block-start: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), .09));
  > span { color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .66)); font-size: 12px; line-height: 19px; }
}
.b-inventory-filter__done.v-btn { height: auto; min-height: 34px; min-width: 66px; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; line-height: 20px; }
@media (max-width: 599px), (pointer: coarse) {
  .b-inventory-filter__option.v-list-item { min-height: 44px; }
  .b-inventory-filter__clear.v-btn, .b-inventory-filter__done.v-btn { min-height: 44px; }
  .b-inventory-filter__close { --sd-modern-icon-button-size: 44px; }
}
</style>

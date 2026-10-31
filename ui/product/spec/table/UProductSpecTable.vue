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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="u--product-spec-table" :class="{ 'u-product-spec-table--modern text-start': modern }">
    <template v-if="modern">
      <div v-if="!spec.length" class="u-product-spec-table__empty sd-modern-widget">
        <b-product-edit-info-icon name="ListTree" :size="24" />
        <h3>{{ $t('add_product.spec_modern.empty') }}</h3>
        <p>{{ $t('add_product.spec_modern.empty_help') }}</p>
      </div>
      <b-product-spec-row
        v-if="modernGroups[0]?.key === 'ungrouped'"
        modern
        :item="{ group: $t('add_product.spec_modern.ungrouped') }"
        :group-items="modernGroups[0].items"
        :collapse="!expandedGroups.includes('ungrouped')"
        :group-end="!expandedGroups.includes('ungrouped')"
        @update:collapse="toggleGroup('ungrouped')"
      />
      <!-- Keep every flat entry mounted: Sortable's indices include collapsed siblings. -->
      <draggable
        :model-value="spec"
        :item-key="getRowKey"
        handle=".u-product-spec-table__handle"
        :disabled="!canEdit"
        :animation="200"
        :delay="150"
        delay-on-touch-only
        ghost-class="u-product-spec-table__ghost"
        tag="div"
        @start="drag = true"
        @end="drag = false"
        @update:model-value="updateModernSpec"
      >
        <template #item="{ element, index }">
          <b-product-spec-row
            v-show="!modernRows[index]?.hidden"
            modern
            :item="element"
            :editable="editable"
            :read-only="readOnly"
            :group-items="modernRows[index]?.group.items || []"
            :group-first="modernRows[index]?.first"
            :group-end="modernRows[index]?.last"
            :collapse="!expandedGroups.includes(modernRows[index]?.group.key)"
            @update:collapse="toggleGroup(modernRows[index].group.key)"
            @delete="deleteModernRow(element)"
            @change="$emit('change')"
            @arrange="showOrderDialog"
          />
        </template>
      </draggable>

      <v-dialog v-model="dialog_sort" max-width="610" scrollable>
        <v-card class="u-product-spec-table__order sd-modern-widget text-start">
          <div class="u-product-spec-table__order-heading">
            <h2>{{ $t('add_product.spec_modern.arrange_order') }}</h2>
            <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="dialog_sort = false"><b-product-edit-info-icon name="X" :size="18" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn>
          </div>
          <p>{{ $t('add_product.spec_modern.order_help') }}</p>
          <div class="u-product-spec-table__order-list">
            <div v-for="(item, index) in spec" :key="getRowKey(item)" class="u-product-spec-table__order-row">
              <span><small v-if="!Array.isArray(item)">{{ $t('add_product.spec_modern.heading') }} · </small>{{ Array.isArray(item) ? item[0] : item.group }}</span>
              <v-btn class="sd-modern-icon-button" icon variant="outlined" :disabled="!canEdit || index === 0" :aria-label="$t('add_product.spec_modern.move_up') + ' · ' + (Array.isArray(item) ? item[0] : item.group)" @click="moveRow(index, -1)"><b-product-edit-info-icon name="ArrowUp" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.move_up') }}</v-tooltip></v-btn>
              <v-btn class="sd-modern-icon-button" icon variant="outlined" :disabled="!canEdit || index === spec.length - 1" :aria-label="$t('add_product.spec_modern.move_down') + ' · ' + (Array.isArray(item) ? item[0] : item.group)" @click="moveRow(index, 1)"><b-product-edit-info-icon name="ArrowDown" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_modern.move_down') }}</v-tooltip></v-btn>
            </div>
          </div>
          <div class="u-product-spec-table__order-footer"><v-btn class="sd-modern-button" variant="outlined" @click="dialog_sort = false">{{ $t('global.actions.close') }}</v-btn></div>
        </v-card>
      </v-dialog>
    </template>
    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Edit Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <template v-else-if="editable">
      <u-smart-toggle
        v-model="auto_save"
        :true-title="$t('spec_view.auto_save_input')"
        color="green"
        :true-description="$t('spec_view.auto_save_input_message')"
        false-gray
      ></u-smart-toggle>

      <draggable
        :class="{ 'border-between-vertical': editable }"
        :component-data="{
          tag: 'ul',
          type: 'transition-group',
          name: drag ? 'fade' : undefined,
        }"
        :model-value="spec"
        :press-delay="150"
        style="list-style-type: none"
        tag="transition-group"
        v-bind="dragOptions"
        @end="drag = false"
        @start="drag = true"
        @update:modelValue="
          (list) => {
            $emit('update', list);
            if (auto_save) $emit('save', list);
          }
        "
      >
        <template v-slot:item="{ element, index }">
          <b-product-spec-row
            v-if="element"
            :class="{
              '-border': !(
                index >= spec.length - 1 ||
                element.group /*It's group!*/ ||
                spec[index + 1].group
              ) /*Next is group so it's last item!*/,
            }"
            :editable="editable"
            :item="element"
            :minimize="drag"
            @delete="
              () => {
                $emit('click-delete', element);
                if (auto_save) $emit('save', list);
              }
            "
          />
        </template>
      </draggable>
    </template>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ View Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-container v-else fluid>
      <v-row no-gutters>
        <v-col
          v-for="(item, index) in spec_grouped"
          :key="'g' + index"
          cols="12"
          md="6"
        >
          <b-product-spec-row
            v-if="item.group"
            :collapse="collapses.includes(index)"
            :item="item.group"
            @update:collapse="collapses.toggle(index)"
          />
          <v-expand-transition>
            <div v-if="!collapses.includes(index)" class="-list-items">
              <b-product-spec-row
                v-for="(item, j) in item.items"
                :key="j"
                :item="item"
                dense-values
              />
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import BProductSpecRow from "../../../../storefront/product/spec/BProductSpecRow.vue";

import USmartToggle from "../../../smart/toggle/USmartToggle.vue";
import { defineAsyncComponent, markRaw } from "vue";
import BProductEditInfoIcon from "../../../../backoffice/product/edit/info/BProductEditInfoIcon.vue";

export default {
  name: "UProductSpecTable",
  components: {
    BProductEditInfoIcon,
    USmartToggle,
    BProductSpecRow,
    draggable: defineAsyncComponent(() => import("vuedraggable")),
  },

  emits: ["update", "save", "click-delete", "change", "autoSave"],
  props: {
    modern: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    autoSave: Boolean,
    spec: {
      required: true,
      type: Array,
    },
    editable: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    auto_save: true,
    drag: false,

    collapses: [],
    expandedGroups: [],
    dialog_sort: false,
    // Presentation identities never become part of the persisted specification array.
    rowKeys: markRaw({ entries: new WeakMap(), next: 0 }),
  }),

  computed: {
    canEdit() {
      return this.editable && !this.readOnly;
    },
    modernGroups() {
      const groups = [];
      let group = null;
      this.spec.forEach((item, index) => {
        if (!Array.isArray(item)) {
          group = { key: this.getRowKey(item), heading: item, items: [], indices: [] };
          groups.push(group);
        } else {
          if (!group) {
            group = { key: 'ungrouped', heading: null, items: [], indices: [] };
            groups.push(group);
          }
          group.items.push(item);
          group.indices.push(index);
        }
      });
      return groups;
    },
    modernRows() {
      const rows = [];
      this.modernGroups.forEach((group) => {
        const collapsed = !this.expandedGroups.includes(group.key);
        if (group.heading) rows[this.spec.indexOf(group.heading)] = { group, hidden: false, first: false, last: collapsed || !group.items.length };
        group.indices.forEach((index, position) => {
          rows[index] = { group, hidden: collapsed, first: position === 0, last: position === group.items.length - 1 };
        });
      });
      return rows;
    },
    dragOptions() {
      return {
        animation: 200,
        //   group: "description",
        disabled: !this.editable,
        ghostClass: "ghost",
      };
    },

    spec_grouped() {
      if (!this.spec?.length) return [];
      let out = [];

      let group = { group: null, items: [] };

      if (!this.spec[0].group) {
        out.push(group);
      }

      this.spec.forEach((it) => {
        if (!it) return;

        if (it.group) {
          group = { group: it, items: [] };
          out.push(group);
        } else {
          group.items.push(it);
        }
      });

      if (out.length === 1 && !out.some((x) => x.group)) {
        // No grouping! So split to two group.
        const items = out[0].items;

        const break_index = Math.floor(items.length / 2);
        if (break_index >= 3) {
          // At least 10x items!
          const items_1 = items.slice(0, break_index);
          const items_2 = items.slice(break_index + 1);
          out = [
            { group: null, items: items_1 },
            { group: null, items: items_2 },
          ];
        }
      }

      return out;
    },
  },

  watch: {
    spec() {
      this.collapses = [];
      if (this.modern) {
        const available = this.modernGroups.map((group) => group.key);
        const retained = this.expandedGroups.filter((key) => available.includes(key));
        if (this.expandedGroups.length && !retained.length && available.length) retained.push(available[0]);
        this.expandedGroups = retained;
      }
    },
    'spec.length'(length, previous) {
      if (this.modern && length > previous) {
        const group = this.modernGroups.at(-1);
        if (group && !this.expandedGroups.includes(group.key)) this.expandedGroups.push(group.key);
      }
    },
    readOnly(value) {
      if (value) this.dialog_sort = false;
    },
    auto_save(val) {
      this.$emit("autoSave", val);
    },
  },
  created() {
    this.auto_save = this.autoSave;
    if (this.modern && this.modernGroups.length) this.expandedGroups = [this.modernGroups[0].key];
  },

  methods: {
    getRowKey(item) {
      if (!this.rowKeys.entries.has(item)) this.rowKeys.entries.set(item, `spec-${++this.rowKeys.next}`);
      return this.rowKeys.entries.get(item);
    },
    toggleGroup(key) {
      const index = this.expandedGroups.indexOf(key);
      if (index < 0) this.expandedGroups.push(key);
      else this.expandedGroups.splice(index, 1);
    },
    updateModernSpec(list) {
      if (!this.canEdit) return;
      this.$emit('update', list);
      this.$emit('change');
      if (this.autoSave) this.$emit('save', list);
    },
    deleteModernRow(item) {
      if (!this.canEdit) return;
      this.$emit('click-delete', item);
      this.$emit('change');
      if (this.autoSave) this.$emit('save', this.spec);
    },
    moveRow(index, offset) {
      if (!this.canEdit || index < 0 || index >= this.spec.length || index + offset < 0 || index + offset >= this.spec.length) return;
      const list = this.spec.slice();
      const [item] = list.splice(index, 1);
      list.splice(index + offset, 0, item);
      this.updateModernSpec(list);
    },
    showOrderDialog() {
      if (this.modern && this.canEdit) this.dialog_sort = true;
    },
  },
};
</script>

<style lang="scss">
.u--product-spec-table {
  font-size: 13px;

  .list-item {
    // Change default items style
    border-radius: 0;
    background: none;
  }

  .-border {
    border-bottom: solid thin #ccc;
  }

  .-list-items {
    > :not(:last-child) {
      border-bottom: solid 1px #ccc;
    }
  }
}
</style>

<style lang="scss" scoped>
.u-product-spec-table--modern {
  min-width: 0;
  .u-product-spec-table__empty { box-sizing: border-box; padding: 36px 23px; text-align: center; border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 16px; background: rgb(var(--v-theme-surface)); }
  .u-product-spec-table__empty > svg { color: rgba(var(--v-theme-on-surface), .5); }
  .u-product-spec-table__empty h3 { margin: 12px 0 4px; font-size: 14px; font-weight: 600; line-height: 21px; }
  .u-product-spec-table__empty p { margin: 0; font-size: 12px; line-height: 18px; opacity: .6; }
  :deep(.u-product-spec-table__ghost) { opacity: .35; }
}
.u-product-spec-table__order.sd-modern-widget {
  box-sizing: border-box;
  padding: 23px;
  border-radius: 18px !important;
  .u-product-spec-table__order-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  h2 { margin: 0; font-size: 18px; font-weight: 500; line-height: 26px; }
  p { margin-block: 8px 20px; font-size: 13px; line-height: 20px; opacity: .65; }
  .u-product-spec-table__order-list { overflow-y: auto; min-height: 0; }
  .u-product-spec-table__order-row { display: flex; align-items: center; gap: 8px; padding-block: 10px; border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); font-size: 14px; line-height: 21px; }
  .u-product-spec-table__order-row > span { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .u-product-spec-table__order-row small { font-size: 12px; opacity: .6; }
  .sd-modern-icon-button { box-sizing: border-box; width: 32px; min-width: 32px; height: 32px; flex: 0 0 32px; padding: 0; border-radius: 8px; }
  .u-product-spec-table__order-footer { display: flex; justify-content: flex-end; padding-top: 20px; }
  .u-product-spec-table__order-footer .sd-modern-button { border: 1px solid var(--sd-modern-border); color: rgb(var(--v-theme-on-surface)); }
  @media (max-width: 680px), (pointer: coarse) {
    padding: 18px;
    .sd-modern-icon-button { width: 44px; min-width: 44px; height: 44px; flex-basis: 44px; }
  }
}
</style>

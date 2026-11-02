<template>
  <section class="b-language-workspace text-start" :aria-label="$t('shop_languages.override_title')">
    <div class="sd-modern-list-toolbar b-language-workspace__toolbar">
      <v-autocomplete v-model="category" :items="category_options" item-title="title" item-value="value"
                      :aria-label="$t('shop_languages.override_category')" :label="$t('shop_languages.override_category')"
                      class="b-language-workspace__category" variant="plain" single-line hide-details
                      :disabled="disabled" />
      <v-text-field v-model="search" :placeholder="$t('shop_languages.override_search')"
                    :aria-label="$t('shop_languages.override_search')" prepend-inner-icon="search"
                    class="b-language-workspace__search" variant="plain" single-line hide-details clearable
                    :disabled="disabled" />
    </div>

    <v-table class="sd-modern-table b-language-workspace__table" density="compact" fixed-header>
      <thead>
        <tr>
          <th>{{ $t('shop_languages.override_record') }}</th>
          <th>{{ $t('shop_languages.override_default') }}</th>
          <th>{{ $t('shop_languages.override_custom') }}</th>
          <th class="b-language-workspace__action-column text-end">{{ $t('shop_languages.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in page_data.rows" :key="row.key" class="b-language-workspace__row">
          <td :data-label="$t('shop_languages.override_record')">
            <bdi v-copy="row.path_label" class="b-language-workspace__name" dir="ltr">{{ row.path[row.path.length - 1] }}</bdi>
            <span v-if="row.path.length > 1" v-copy="row.path_label" class="b-language-workspace__path" dir="ltr">{{ row.path_label }}</span>
          </td>
          <td :data-label="$t('shop_languages.override_default')">
            <p class="b-language-workspace__preview" :dir="language_direction">{{ row.original }}</p>
          </td>
          <td :data-label="$t('shop_languages.override_custom')">
            <p v-if="row.custom" class="b-language-workspace__preview" :dir="language_direction">{{ row.custom }}</p>
            <span v-else class="b-language-workspace__fallback">{{ $t('shop_languages.override_default_value') }}</span>
            <span v-if="row.custom" class="sd-modern-status sd-modern-status--plain b-language-workspace__state" :class="{ 'b-language-workspace__state--invalid': row.invalid_params }">
              <v-icon v-if="row.invalid_params" color="error" size="15" aria-hidden="true">error_outline</v-icon>
              <span v-else-if="row.custom" class="b-language-workspace__custom-dot" aria-hidden="true" />
              {{ $t(row.invalid_params ? 'shop_languages.override_params_mismatch' : row.custom ? 'shop_languages.override_customized' : 'shop_languages.override_default_value') }}
            </span>
          </td>
          <td class="b-language-workspace__row-action">
            <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
              <template #activator="{ props }">
                <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon :disabled="disabled"
                       :aria-label="`${$t(readOnly ? 'shop_languages.view_translations' : 'shop_languages.override_edit')}: ${row.path_label}`"
                       :data-record="row.key" @click="openRecord(row)">
                  <v-icon aria-hidden="true">{{ readOnly ? 'visibility' : 'edit' }}</v-icon>
                </v-btn>
              </template>
              {{ $t(readOnly ? 'shop_languages.view_translations' : 'shop_languages.override_edit') }}
            </v-tooltip>
          </td>
        </tr>
        <tr v-if="!page_data.total">
          <td colspan="4">
            <div class="sd-modern-empty-state b-language-workspace__empty">
              <v-icon size="28" aria-hidden="true">search_off</v-icon>
              <h3>{{ $t('shop_languages.override_empty_title') }}</h3>
              <p>{{ $t('shop_languages.override_empty_description') }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <footer class="sd-modern-table-footer b-language-workspace__footer">
      <p class="sd-modern-page-summary" role="status" aria-live="polite">
        {{ $t('shop_languages.override_results_summary', { start: $n(page_data.total ? (page - 1) * page_size + 1 : 0), end: $n(Math.min(page * page_size, page_data.total)), total: $n(page_data.total) }) }}
      </p>
      <div class="b-language-workspace__page-size">
        <span>{{ $t('shop_languages.override_page_size') }}</span>
        <v-select v-model="page_size" :items="[25, 50]" :aria-label="$t('shop_languages.override_page_size')"
                  hide-details variant="plain" single-line :disabled="disabled" />
      </div>
      <v-pagination v-model="page" :length="page_count" :total-visible="$vuetify.display.xs ? 3 : 5" class="sd-modern-pagination"
                    density="compact" :disabled="disabled" />
    </footer>

    <v-dialog :model-value="!!selected" max-width="700" :aria-label="$t(readOnly ? 'shop_languages.view_translations' : 'shop_languages.override_edit')" @update:model-value="!$event && closeRecord()">
      <v-card v-if="selected" class="sd-modern-widget b-language-workspace__editor text-start" rounded="lg">
        <header class="b-language-workspace__editor-heading">
          <div>
            <h2>{{ $t(readOnly ? 'shop_languages.view_translations' : 'shop_languages.override_edit') }}</h2>
            <bdi class="b-language-workspace__editor-path" dir="ltr">{{ selected.path_label }}</bdi>
          </div>
          <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-icon-button" variant="text" icon
                     :aria-label="$t('global.actions.close')" @click="closeRecord">
                <v-icon aria-hidden="true">close</v-icon>
              </v-btn>
            </template>
            {{ $t('global.actions.close') }}
          </v-tooltip>
        </header>
        <div class="b-language-workspace__original">
          <h3 class="sd-modern-eyebrow">{{ $t('shop_languages.override_default') }}</h3>
          <p v-copy :dir="language_direction">{{ selected.original }}</p>
        </div>
        <v-textarea v-model="input" :dir="language_direction" :label="$t('shop_languages.override_translated')"
                    class="sd-modern-underlined-field b-language-workspace__input" variant="underlined" auto-grow
                    rows="3" max-rows="12" :readonly="readOnly || disabled" :placeholder="selected.original"
                    :messages="$t('shop_languages.override_description')" />
        <div v-if="!input_valid" class="sd-modern-notice b-language-workspace__validation" role="alert">
          <v-icon color="error" size="18" aria-hidden="true">error_outline</v-icon>
          <div class="sd-modern-notice__content">
            {{ $t('shop_languages.override_missing_params', { params: missing_params_label }) }}
          </div>
        </div>
        <div class="b-language-workspace__editor-actions">
          <v-btn v-if="!input_valid && !readOnly" class="sd-modern-button" variant="outlined" :disabled="disabled" @click="autoFix">
            <v-icon start size="17" aria-hidden="true">auto_fix_high</v-icon>{{ $t('shop_languages.override_auto_fix') }}
          </v-btn>
          <v-spacer />
          <v-btn class="sd-modern-button" variant="text" @click="closeRecord">{{ $t('global.actions.close') }}</v-btn>
          <v-btn v-if="!readOnly" class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat"
                 :disabled="disabled || !input_valid" data-action="apply-translation" @click="applyRecord">
            <v-icon start size="17" aria-hidden="true">check</v-icon>{{ $t('shop_languages.override_apply') }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import { markRaw, toRaw } from "vue";
import { Language } from "@selldone/core-js/enums/language/Language";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

const owns = (value, key) => value !== null && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, key);
const valueAt = (root, path) => path.reduce((value, key) => owns(value, key) ? value[key] : undefined, root);
const parameters = (value) => typeof value === "string" ? value.match(/[^{\}]+(?=})/g) || [] : [];

// Only paths for the visible page are copied; the source and override trees stay sparse/raw.
function visitStrings(value, path, visit) {
  if (typeof value === "string") return visit(path, value) !== false;
  if (!value || typeof value !== "object") return true;
  for (const key in value) {
    if (!owns(value, key)) continue;
    path.push(key);
    const keep_scanning = visitStrings(value[key], path, visit);
    path.pop();
    if (!keep_scanning) return false;
  }
  return true;
}

export default {
  name: "BLanguageOverrideWorkspace",
  props: {
    structure: Object,
    modelValue: Object,
    to: { type: String, required: true },
    readOnly: Boolean,
    disabled: Boolean,
  },
  emits: ["update:modelValue", "changed"],
  data: () => ({ category: 0, category_entries: [], search: "", active_search: "", search_timer: null, page: 1, page_size: 25, revision: 0, selected: null, input: "" }),
  computed: {
    language_direction() { return Language[this.to]?.dir || "ltr"; },
    category_options() {
      return [{ value: 0, title: `${this.$t('shop_languages.override_all_categories')} · ${this.$n(this.total_records)}` },
        ...this.category_entries.map(entry => ({ value: entry.value, title: `${entry.key} · ${this.$n(entry.count)}` }))];
    },
    total_records() { return this.category_entries.reduce((sum, entry) => sum + entry.count, 0) + this.root_string_count; },
    root_string_count() {
      let count = 0;
      const structure = toRaw(this.structure);
      for (const key in structure) if (owns(structure, key) && typeof structure[key] === "string") count++;
      return count;
    },
    page_data() {
      void this.revision;
      const structure = toRaw(this.structure), overrides = toRaw(this.modelValue);
      const category = this.category_entries.find(entry => entry.value === this.category);
      const prefix = category ? [category.key] : [];
      const source = category ? valueAt(structure, prefix) : structure;
      const query = this.active_search.trim().toLocaleLowerCase();
      const start = (this.page - 1) * this.page_size, end = start + this.page_size;
      const rows = [];
      let total = 0;
      visitStrings(source, prefix, (path, original) => {
        const override = valueAt(overrides, path);
        const custom = typeof override === "string" ? override : "";
        if (query && !`${path.join('.')} ${original} ${custom}`.toLocaleLowerCase().includes(query)) return;
        if (total >= start && total < end) {
          const translated_params = parameters(custom);
          rows.push(markRaw({ key: JSON.stringify(path), path: [...path], path_label: path.join('.'), original, custom,
            invalid_params: !!custom && parameters(original).some(param => !translated_params.includes(param)) }));
        }
        total++;
        if (!query && total >= end) return false;
      });
      return { rows, total: query ? total : category ? category.count : this.total_records };
    },
    page_count() { return Math.max(1, Math.ceil(this.page_data.total / this.page_size)); },
    missing_params() {
      if (!this.selected || !this.input) return [];
      const translated = parameters(this.input);
      return parameters(this.selected.original).filter(param => !translated.includes(param));
    },
    input_valid() { return !this.missing_params.length; },
    missing_params_label() { return this.missing_params.map(param => `{${param}}`).join(', '); },
  },
  watch: {
    structure: { immediate: true, handler() { this.resetStructure(); } },
    modelValue() { this.revision++; this.page = 1; this.closeRecord(); },
    to() { this.closeRecord(); },
    category() { this.page = 1; },
    page_size() { this.page = 1; },
    search(value) {
      clearTimeout(this.search_timer);
      this.search_timer = setTimeout(() => { this.active_search = value || ""; this.page = 1; }, 180);
    },
    readOnly(value) { if (value) this.closeRecord(); },
    disabled(value) { if (value) this.closeRecord(); },
  },
  beforeUnmount() { clearTimeout(this.search_timer); },
  methods: {
    resetStructure() {
      clearTimeout(this.search_timer);
      this.search = ""; this.active_search = ""; this.category = 0; this.page = 1; this.closeRecord();
      const entries = [], structure = toRaw(this.structure);
      for (const key in structure) {
        if (!owns(structure, key) || !structure[key] || typeof structure[key] !== "object") continue;
        let count = 0;
        visitStrings(structure[key], [], () => count++);
        if (count) entries.push({ key, count, value: entries.length + 1 });
      }
      this.category_entries = markRaw(entries);
    },
    openRecord(row) {
      if (this.disabled) return;
      const original = valueAt(toRaw(this.structure), row.path);
      if (typeof original !== "string") return;
      const custom = valueAt(toRaw(this.modelValue), row.path);
      this.selected = markRaw({ path: [...row.path], path_label: row.path.join('.'), original });
      this.input = typeof custom === "string" ? custom : "";
    },
    closeRecord() { this.selected = null; this.input = ""; },
    applyRecord() {
      if (this.readOnly || this.disabled || !this.selected || !this.input_valid) return;
      const path = this.selected.path;
      if (typeof valueAt(toRaw(this.structure), path) !== "string") return;
      const root = toRaw(this.modelValue);
      if (!root || typeof root !== "object") return;
      let target = root;
      for (let index = 0; index < path.length - 1; index++) {
        const key = path[index];
        if (!owns(target, key) || !target[key] || typeof target[key] !== "object") {
          const child = Array.isArray(valueAt(toRaw(this.structure), path.slice(0, index + 1))) ? [] : {};
          Object.defineProperty(target, key, { value: child, enumerable: true, writable: true, configurable: true });
        }
        target = target[key];
      }
      // defineProperty treats __proto__ as a data key instead of a prototype setter.
      Object.defineProperty(target, path[path.length - 1], { value: this.input, enumerable: true, writable: true, configurable: true });
      this.revision++;
      this.$emit("update:modelValue", root);
      this.$emit("changed");
      this.closeRecord();
      if (this.page > this.page_count) this.page = this.page_count;
    },
    autoFix() {
      if (this.readOnly || this.disabled || !this.selected) return;
      const original = parameters(this.selected.original), translated = parameters(this.input);
      if (!original.length || original.length !== translated.length) {
        NotificationService.showErrorAlert(null, this.$t("shop_languages.override_params_mismatch"));
        return;
      }
      let index = 0;
      this.input = this.input.replace(/\{([^{}]+)\}/g, () => `{${original[index++]}}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-language-workspace {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.6;
  &__toolbar { flex: 0 0 auto; flex-wrap: wrap; justify-content: space-between; margin-block-end: 12px; }
  &__category { flex: 0 1 280px; min-width: 200px; }
  &__search { flex: 0 1 310px; min-width: 220px; }
  &__table { flex: 1; min-height: 0; width: 100%; background: transparent; }
  &__table :deep(.v-table__wrapper) { min-height: 0; overflow: auto; }
  &__table :deep(table) { table-layout: fixed; width: 100%; }
  &__table :deep(th:first-child) { width: 25%; }
  &__table :deep(th:last-child) { width: 84px; }
  &__table :deep(tbody > tr > td) { vertical-align: top; padding: 16px 12px; overflow-wrap: anywhere; }
  &__name { display: block; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__path { display: block; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; overflow-wrap: anywhere; }
  &__preview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; white-space: pre-wrap; font-size: 14px; line-height: 23px; margin: 0; }
  &__fallback { color: var(--sd-modern-muted); font-size: 13px; line-height: 23px; }
  &__state { margin-block-start: 6px; color: var(--sd-modern-muted); font-size: 12px; }
  &__state--invalid { font-size: 13px; }
  &__custom-dot { width: 5px; height: 5px; border-radius: 50%; background: rgb(var(--v-theme-primary)); }
  &__row-action { text-align: end; }
  &__footer { flex: 0 0 auto; padding-block-start: 18px; gap: 14px; }
  &__page-size { display: flex; align-items: center; gap: 10px; color: var(--sd-modern-muted); font-size: 12px; }
  &__page-size > .v-input { width: 65px; flex: 0 0 65px; font-size: 12px; }
  &__empty { padding: 46px 12px; }
  &__empty h3 { margin-block: 10px 5px; font-size: 18px; font-weight: 500; }
  &__empty p { font-size: 13px; }
  @media (max-width: 650px), (max-height: 700px) {
    display: block;
    overflow: visible;
    &__toolbar { position: sticky; inset-block-start: 0; z-index: 2; padding-block: 8px; background: rgb(var(--v-theme-surface)); }
    &__table :deep(.v-table__wrapper) { overflow: visible; }
    &__footer { position: sticky; inset-block-end: 0; z-index: 2; padding-block: 12px; background: rgb(var(--v-theme-surface)); }
  }
  @media (max-width: 650px) {
    &__category, &__search { flex-basis: 100%; min-width: 0; }
    &__table :deep(thead) { display: none; }
    &__table :deep(tbody > tr.b-language-workspace__row) { display: grid; grid-template-columns: minmax(0, 1fr) 44px; padding: 12px; gap: 0 12px; border-block-end: 1px solid var(--sd-modern-border); }
    &__table :deep(tbody > tr.b-language-workspace__row > td) { display: block; height: auto !important; padding: 8px 0 !important; border: 0 !important; }
    &__table :deep(tbody > tr.b-language-workspace__row > td[data-label]) { grid-column: 1; }
    &__table :deep(td[data-label]::before) { content: attr(data-label); display: block; margin-block-end: 4px; }
    &__row-action { grid-column: 2; grid-row: 1; }
    &__footer > .v-pagination { flex-basis: 100%; }
  }
}
.b-language-workspace__editor {
  &-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-block-end: 24px; }
  &-heading h2 { margin: 0 0 6px; font-size: 18px; line-height: 26px; font-weight: 600; }
  &-path { display: block; color: var(--sd-modern-muted); overflow-wrap: anywhere; font-size: 12px; line-height: 20px; }
  .b-language-workspace__original { margin-block-end: 22px; }
  .b-language-workspace__original p { margin-block-start: 8px; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; line-height: 23px; }
  .b-language-workspace__input { font-size: 14px; }
  .b-language-workspace__validation { margin-block-start: 18px; }
  &-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-block-start: 24px; }
  @media (max-width: 600px) { padding: 20px; }
}
</style>

<template>
  <div class="u-data-sheet-anchor">
    <v-dialog v-model="fullscreen" :theme="fullscreenTheme" fullscreen eager :transition="false">
      <div ref="fullscreenTarget" class="sd-modern-canvas u-data-sheet-fullscreen-target"></div>
    </v-dialog>

    <Teleport :to="fullscreenTarget || 'body'" :disabled="!fullscreen">
      <v-theme-provider :theme="fullscreen ? fullscreenTheme : undefined">
      <section
        ref="sheet"
        class="u-data-sheet text-start"
        :class="{ 'u-data-sheet--fullscreen': fullscreen }"
        :aria-label="$t('global.data_sheet.title')"
        :aria-busy="loading"
      >
        <div v-if="$slots.header" class="u-data-sheet__header">
          <slot name="header"></slot>
        </div>

        <div class="u-data-sheet__toolbar sd-modern-list-toolbar">
          <span class="u-data-sheet__view">
            <v-icon size="18" aria-hidden="true">table_view</v-icon>
            {{ $t('global.data_sheet.title') }}
          </span>
          <v-btn
            class="sd-modern-button"
            variant="outlined"
            prepend-icon="view_column"
            @click="openColumns"
          >
            {{ $t('global.data_sheet.columns') }}
            <span class="u-data-sheet__count">{{ $n(visibleColumns.length) }}</span>
          </v-btn>
          <span class="u-data-sheet__extra-count">
            {{ $t('global.data_sheet.extra_fields', { count: $n(extraColumnCount) }) }}
          </span>
          <v-text-field
            :model-value="search"
            :placeholder="$t('global.data_sheet.search')"
            :aria-label="$t('global.data_sheet.search')"
            class="u-data-sheet__search"
            variant="plain"
            single-line
            hide-details
            clearable
            prepend-inner-icon="search"
            @update:model-value="$emit('update:search', $event || '')"
          ></v-text-field>
          <v-btn
            class="sd-modern-icon-button u-data-sheet__fullscreen-button"
            variant="text"
            icon
            :aria-label="$t(fullscreen ? 'global.data_sheet.exit_fullscreen' : 'global.data_sheet.enter_fullscreen')"
            @click="fullscreen = !fullscreen"
          >
            <v-icon size="18">{{ fullscreen ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
              {{ $t(fullscreen ? 'global.data_sheet.exit_fullscreen' : 'global.data_sheet.enter_fullscreen') }}
            </v-tooltip>
          </v-btn>
        </div>

        <div v-if="storageNotice" class="sd-modern-notice u-data-sheet__storage-notice" role="status">
          <v-icon size="17" aria-hidden="true">info_outline</v-icon>
          <span>{{ $t(`global.data_sheet.${storageNotice}`) }}</span>
        </div>

        <div class="u-data-sheet__formula">
          <span class="u-data-sheet__coordinate" dir="ltr">{{ selectedCoordinate || '—' }}</span>
          <v-icon size="17" aria-hidden="true">segment</v-icon>
          <span class="u-data-sheet__formula-value" :class="{ 'u-data-sheet__muted': !selected }" dir="auto">
            {{ selected ? selectedPreview : $t('global.data_sheet.select_cell') }}
          </span>
          <span class="u-data-sheet__readonly">
            <v-icon size="14" aria-hidden="true">lock_outline</v-icon>
            {{ $t('global.data_sheet.read_only') }}
          </span>
        </div>

        <div ref="scroll" class="u-data-sheet__scroll">
          <div v-if="error" class="sd-modern-empty-state u-data-sheet__empty" role="alert">
            <v-icon size="30" aria-hidden="true">cloud_off</v-icon>
            <h2 class="sd-modern-title-text">{{ $t('global.data_sheet.error_title') }}</h2>
            <p class="u-data-sheet__muted">{{ error }}</p>
            <v-btn class="sd-modern-button" variant="outlined" prepend-icon="refresh" @click="$emit('retry')">
              {{ $t('global.data_sheet.retry') }}
            </v-btn>
          </div>
          <div v-else-if="!loading && !items.length" class="sd-modern-empty-state u-data-sheet__empty" role="status">
            <v-icon size="30" aria-hidden="true">table_view</v-icon>
            <h2 class="sd-modern-title-text">
              {{ $t(search ? 'global.data_sheet.no_results' : 'global.data_sheet.empty_title') }}
            </h2>
            <p class="u-data-sheet__muted">
              {{ $t(search ? 'global.data_sheet.no_results_hint' : 'global.data_sheet.empty_hint') }}
            </p>
            <v-btn v-if="search" class="sd-modern-button" variant="outlined" @click="$emit('update:search', '')">
              {{ $t('global.data_sheet.clear_search') }}
            </v-btn>
            <slot v-else name="empty"></slot>
          </div>
          <table v-else class="u-data-sheet__table" :style="{ width: `${tableWidth}px` }" :aria-label="$t('global.data_sheet.title')">
            <colgroup>
              <col :style="{ width: `${indexWidth}px` }" />
              <col v-for="column in visibleColumns" :key="column.key" :style="{ width: `${columnWidth(column)}px` }" />
              <col v-if="$slots.actions" style="width: 54px" />
            </colgroup>
            <thead>
              <tr>
                <th class="u-data-sheet__index" scope="col" :aria-label="$t('global.data_sheet.row_number')">#</th>
                <th
                  v-for="(column, columnIndex) in visibleColumns"
                  :key="column.key"
                  scope="col"
                  :class="{ 'u-data-sheet__fixed': column.fixed, 'u-data-sheet__extra-head': column.path }"
                  :style="column.fixed ? { insetInlineStart: `${indexWidth}px` } : undefined"
                  :aria-sort="sortState(column)"
                >
                  <span class="u-data-sheet__letter" dir="ltr">{{ columnLetter(columnIndex) }}</span>
                  <div class="u-data-sheet__column-heading">
                    <v-icon v-if="column.icon" size="15" :class="{ 'u-data-sheet__extra-symbol': column.path }" aria-hidden="true">{{ column.icon }}</v-icon>
                    <button v-if="column.sortable && !column.path" type="button" class="u-data-sheet__heading-label sd-modern-list-header" @click="sortColumn(column)">
                      {{ column.title }}
                      <v-icon v-if="sortBy[0]?.key === column.key" size="13" aria-hidden="true">{{ sortBy[0].order === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</v-icon>
                    </button>
                    <span v-else class="u-data-sheet__heading-label sd-modern-list-header">{{ column.title }}</span>
                    <v-btn
                      class="sd-modern-icon-button u-data-sheet__column-menu"
                      variant="text"
                      icon
                      :aria-label="`${$t('global.data_sheet.column_settings')}: ${column.title}`"
                      @click="openColumn(column)"
                    >
                      <v-icon size="16">expand_more</v-icon>
                      <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
                        {{ column.path ? extraPath(column.path) : $t('global.data_sheet.column_settings') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                  <button
                    type="button"
                    class="u-data-sheet__resize"
                    :aria-label="$t('global.data_sheet.resize_column', { name: column.title })"
                    @pointerdown="startResize($event, column)"
                    @keydown.left.prevent="resizeKey(column, -16)"
                    @keydown.right.prevent="resizeKey(column, 16)"
                  ></button>
                </th>
                <th v-if="$slots.actions" class="u-data-sheet__actions" scope="col">
                  <span class="u-data-sheet__letter">···</span>
                </th>
              </tr>
            </thead>
            <tbody v-if="loading" :aria-label="$t('global.data_sheet.loading')">
              <tr v-for="placeholder in 8" :key="placeholder" aria-hidden="true">
                <td class="u-data-sheet__index">{{ $n(rowOffset + placeholder) }}</td>
                <td v-for="column in visibleColumns" :key="column.key" :class="{ 'u-data-sheet__fixed': column.fixed }" :style="column.fixed ? { insetInlineStart: `${indexWidth}px` } : undefined">
                  <span class="u-data-sheet__skeleton"></span>
                </td>
                <td v-if="$slots.actions" class="u-data-sheet__actions"></td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(item, itemIndex) in items" :key="item[rowKey] ?? itemIndex">
                <td class="u-data-sheet__index">{{ $n(rowOffset + itemIndex + 1) }}</td>
                <td
                  v-for="column in visibleColumns"
                  :key="column.key"
                  :class="{ 'u-data-sheet__fixed': column.fixed }"
                  :style="column.fixed ? { insetInlineStart: `${indexWidth}px` } : undefined"
                >
                  <button
                    type="button"
                    class="u-data-sheet__cell"
                    :class="{ 'u-data-sheet__cell--selected': selected?.row === (item[rowKey] ?? itemIndex) && selected?.column === column.key }"
                    :aria-label="$t('global.data_sheet.view_value', { name: column.title })"
                    @click="inspectCell(item, itemIndex, column)"
                  >
                    <slot :name="`cell-${column.key}`" :item="item" :value="cellValue(item, column).value">
                      <span v-if="column.raw" class="u-data-sheet__raw-value">
                        <v-icon size="16" aria-hidden="true">data_object</v-icon>
                        {{ objectSummary(cellValue(item, column).value) }}
                      </span>
                      <span v-else-if="Array.isArray(cellValue(item, column).value)" class="u-data-sheet__json-value">
                        <v-icon size="14" aria-hidden="true">list</v-icon>
                        {{ $t('global.data_sheet.array_items', { count: $n(cellValue(item, column).value.length) }) }}
                      </span>
                      <span v-else-if="cellValue(item, column).value && typeof cellValue(item, column).value === 'object'" class="u-data-sheet__json-value">
                        {{ $t('global.data_sheet.types.object') }}
                      </span>
                      <span v-else :class="{ 'u-data-sheet__muted': !cellValue(item, column).exists || cellValue(item, column).value === null }" dir="auto">
                        {{ displayValue(cellValue(item, column)) }}
                      </span>
                    </slot>
                  </button>
                </td>
                <td v-if="$slots.actions" class="u-data-sheet__actions"><slot name="actions" :item="item"></slot></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="$slots.footer" class="u-data-sheet__footer"><slot name="footer"></slot></div>

        <v-dialog
          :model-value="!!panel"
          :attach="$refs.sheet"
          contained
          scrollable
          :max-width="410"
          :transition="false"
          :content-props="panelContentProps"
          @update:model-value="!$event && closePanel()"
        >
          <v-card class="u-data-sheet__panel text-start" rounded="0">
            <header class="u-data-sheet__panel-heading">
              <div>
                <h2 class="sd-modern-title-text">{{ panelTitle }}</h2>
                <p v-if="panelSubtitle" class="sd-modern-subtitle" dir="auto">{{ panelSubtitle }}</p>
              </div>
              <v-btn class="sd-modern-icon-button" variant="text" icon :aria-label="$t('global.data_sheet.close')" @click="closePanel">
                <v-icon size="18">close</v-icon>
                <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>{{ $t('global.data_sheet.close') }}</v-tooltip>
              </v-btn>
            </header>
            <v-card-text class="u-data-sheet__panel-body">
              <template v-if="panel === 'columns'">
                <v-text-field v-model="keySearch" :placeholder="$t('global.data_sheet.find_key')" :aria-label="$t('global.data_sheet.find_key')" variant="underlined" single-line hide-details prepend-inner-icon="search" class="u-data-sheet__key-search"></v-text-field>
                <div class="u-data-sheet__key-heading">
                  <span class="sd-modern-eyebrow">{{ $t('global.data_sheet.extra_data') }}</span>
                  <span class="u-data-sheet__muted">{{ $t('global.data_sheet.keys_this_page', { count: $n(keyDiscovery.keys.length) }) }}</span>
                </div>
                <p v-if="loading" class="u-data-sheet__muted">{{ $t('global.data_sheet.loading') }}</p>
                <p v-else-if="!filteredKeys.length" class="u-data-sheet__muted">{{ $t(keySearch ? 'global.data_sheet.no_key_matches' : 'global.data_sheet.no_keys') }}</p>
                <label v-for="key in filteredKeys" :key="key.key" class="u-data-sheet__key-row">
                  <input type="checkbox" :checked="draftKeys.includes(key.key)" @change="toggleDraft(key.key, ($event.target as HTMLInputElement).checked)" />
                  <span class="u-data-sheet__key-copy">
                    <span class="u-data-sheet__key-title"><span dir="auto">{{ key.label }}</span><span class="u-data-sheet__type">{{ key.types.map(type => typeLabel(type)).join(' · ') }}</span></span>
                    <span class="u-data-sheet__path" dir="ltr">{{ extraPath(key.path) }}</span>
                    <span class="u-data-sheet__key-example"><span dir="auto">{{ formatSheetValue(key.sample) }}</span><span>{{ $n(key.count) }}/{{ $n(availableItems.length) }}</span></span>
                  </span>
                </label>
                <div v-if="missingDraftCount" class="sd-modern-notice u-data-sheet__notice" role="status">
                  <v-icon size="17" aria-hidden="true">info_outline</v-icon>
                  <span class="sd-modern-notice__content">{{ $t('global.data_sheet.selected_missing', { count: $n(missingDraftCount) }) }}</span>
                </div>
                <details class="u-data-sheet__standard-fields">
                  <summary>{{ $t('global.data_sheet.standard_fields') }}</summary>
                  <label v-for="column in columns" :key="column.key" class="u-data-sheet__key-row">
                    <input type="checkbox" :checked="draftKeys.includes(column.key)" :disabled="column.fixed" @change="toggleDraft(column.key, ($event.target as HTMLInputElement).checked)" />
                    <span>{{ column.title }}<span v-if="column.fixed" class="u-data-sheet__muted"> · {{ $t('global.data_sheet.frozen') }}</span></span>
                  </label>
                </details>
                <div class="sd-modern-notice u-data-sheet__notice">
                  <v-icon size="17" aria-hidden="true">manage_search</v-icon>
                  <span class="sd-modern-notice__content">{{ $t('global.data_sheet.page_scope_hint', { count: $n(availableItems.length) }) }}<template v-if="keyDiscovery.truncated"> {{ $t('global.data_sheet.key_discovery_limited') }}</template></span>
                </div>
              </template>

              <template v-else-if="panel === 'column' && editingColumn">
                <div class="u-data-sheet__path" dir="ltr">{{ editingColumn.path ? extraPath(editingColumn.path) : editingColumn.key }}</div>
                <v-text-field v-model="columnLabel" :label="$t('global.data_sheet.column_label')" variant="underlined" maxlength="120" hide-details class="u-data-sheet__setting-field"></v-text-field>
                <p class="u-data-sheet__muted u-data-sheet__setting-hint">{{ $t('global.data_sheet.source_unchanged') }}</p>
                <v-select v-model="columnSize" :label="$t('global.data_sheet.width')" :items="widthOptions" variant="underlined" hide-details class="u-data-sheet__setting-field"></v-select>
                <v-btn class="sd-modern-button sd-modern-button--inline" variant="text" prepend-icon="fit_screen" @click="fitColumn(editingColumn)">{{ $t('global.data_sheet.fit_content') }}</v-btn>
                <p class="u-data-sheet__setting-label">{{ $t('global.data_sheet.position') }}</p>
                <div class="u-data-sheet__setting-actions">
                  <v-btn class="sd-modern-button" variant="outlined" prepend-icon="arrow_back" :disabled="!canMove(editingColumn, -1)" @click="moveColumn(editingColumn, -1)">{{ $t('global.data_sheet.move_start') }}</v-btn>
                  <v-btn class="sd-modern-button" variant="outlined" append-icon="arrow_forward" :disabled="!canMove(editingColumn, 1)" @click="moveColumn(editingColumn, 1)">{{ $t('global.data_sheet.move_end') }}</v-btn>
                </div>
                <v-btn v-if="!editingColumn.fixed && !editingColumn.raw" class="sd-modern-button sd-modern-button--inline u-data-sheet__hide-column" variant="text" prepend-icon="visibility_off" @click="hideColumn(editingColumn)">{{ $t('global.data_sheet.hide_column') }}</v-btn>
                <div v-if="editingColumn.fixed" class="sd-modern-notice u-data-sheet__notice"><v-icon size="17" aria-hidden="true">push_pin</v-icon>{{ $t('global.data_sheet.frozen') }}</div>
              </template>

              <template v-else-if="panel === 'value' && selectedCell">
                <div class="u-data-sheet__path" dir="ltr">{{ selectedColumn?.path ? extraPath(selectedColumn.path) : selectedColumn?.raw ? extraDataKey : selectedColumn?.key }}</div>
                <div class="u-data-sheet__value-type">{{ typeLabel(sheetValueType(selectedCell.value, selectedCell.exists)) }}</div>
                <div v-if="selectedColumn?.raw && selectedCell.value && typeof selectedCell.value === 'object' && !Array.isArray(selectedCell.value)" class="u-data-sheet__value-tabs" role="tablist" :aria-label="$t('global.data_sheet.extra_data')">
                  <button type="button" role="tab" :aria-selected="valueTab === 'fields'" @click="valueTab = 'fields'">{{ $t('global.data_sheet.fields') }}</button>
                  <button type="button" role="tab" :aria-selected="valueTab === 'json'" @click="valueTab = 'json'">{{ $t('global.data_sheet.raw_json') }}</button>
                </div>
                <dl v-if="selectedColumn?.raw && valueTab === 'fields' && selectedCell.value && typeof selectedCell.value === 'object' && !Array.isArray(selectedCell.value)" class="u-data-sheet__field-values">
                  <div v-for="(value, key) in selectedCell.value" :key="key"><dt dir="auto">{{ key }}</dt><dd dir="auto">{{ formatSheetValue(value, { pretty: true, maxLength: Infinity }) }}</dd></div>
                </dl>
                <pre v-else class="u-data-sheet__full-value" dir="auto">{{ displayValue(selectedCell, true) }}</pre>
              </template>
            </v-card-text>
            <footer class="u-data-sheet__panel-footer">
              <template v-if="panel === 'columns'">
                <span class="u-data-sheet__muted">{{ $t('global.data_sheet.selected_columns', { count: $n(draftKeys.length) }) }}</span>
                <v-btn class="sd-modern-button sd-modern-button--primary" variant="flat" prepend-icon="view_column" @click="applyColumns">{{ $t('global.data_sheet.apply_columns') }}</v-btn>
              </template>
              <v-btn v-else-if="panel === 'column'" class="sd-modern-button sd-modern-button--primary" variant="flat" prepend-icon="check" @click="applyColumn">{{ $t('global.data_sheet.apply_view') }}</v-btn>
              <template v-else-if="panel === 'value'">
                <span class="u-data-sheet__muted">{{ $t('global.data_sheet.original_value') }}</span>
                <v-btn class="sd-modern-button" variant="outlined" prepend-icon="content_copy" :disabled="!selectedCell?.exists" @click="copySelected">{{ $t('global.data_sheet.copy_value') }}</v-btn>
              </template>
            </footer>
            <p v-if="copyFeedback" class="u-data-sheet__copy-feedback" role="status">{{ copyFeedback }}</p>
          </v-card>
        </v-dialog>
      </section>
      </v-theme-provider>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from "vue";
import {
  discoverSheetKeys,
  formatSheetValue,
  readSheetPath,
  restoreSheetLayout,
  sheetPathLabel,
  sheetValueType,
  type SheetLayout,
} from "./data-sheet";

type SheetColumn = {
  key: string;
  title: string;
  icon?: string;
  width?: number;
  fixed?: boolean;
  visible?: boolean;
  sortable?: boolean;
  getValue?: (item: Record<string, any>) => unknown;
  path?: string[];
  raw?: boolean;
};
const RAW_KEY = "__sheet_extra_data__";

export default defineComponent({
  name: "UDataSheet",
  props: {
    items: { type: Array as PropType<Record<string, any>[]>, default: () => [] },
    columns: { type: Array as PropType<SheetColumn[]>, required: true },
    loading: Boolean,
    error: { type: String, default: null },
    search: { type: String, default: "" },
    extraDataKey: { type: String, default: "data" },
    rowKey: { type: String, default: "id" },
    rowOffset: { type: Number, default: 0 },
    sortBy: { type: Array as PropType<{ key: string; order: string }[]>, default: () => [] },
    storageKey: { type: String, default: "" },
  },
  emits: ["update:search", "sort", "retry"],
  data: () => ({
    layout: [] as SheetLayout[],
    fullscreen: false,
    fullscreenTheme: undefined as "dark" | undefined,
    fullscreenTarget: null as HTMLElement | null,
    narrow: false,
    observer: null as ResizeObserver | null,
    panel: "" as "" | "columns" | "column" | "value",
    keySearch: "",
    draftKeys: [] as string[],
    editingKey: "",
    columnLabel: "",
    columnSize: 170,
    selected: null as { row: string | number; column: string; rowIndex: number } | null,
    valueTab: "fields",
    copyFeedback: "",
    panelActivator: null as HTMLElement | null,
    resizeCleanup: null as (() => void) | null,
    storageMounted: false,
    storageReady: false,
    storageScope: "",
    storageNotice: "",
    storageBaseline: "",
  }),
  computed: {
    availableItems(): Record<string, any>[] { return this.loading || this.error ? [] : this.items; },
    keyDiscovery() { return discoverSheetKeys(this.availableItems, this.extraDataKey); },
    filteredKeys() {
      const search = this.keySearch.trim().toLocaleLowerCase();
      return this.keyDiscovery.keys.filter(key => this.extraPath(key.path).toLocaleLowerCase().includes(search));
    },
    definitions(): SheetColumn[] {
      const extras = this.layout.filter(column => column.path).map(column => {
        const current = this.keyDiscovery.keys.find(key => key.key === column.key);
        const leaf = column.path?.at(-1) ?? this.extraDataKey;
        const title = leaf.replace(/[_-]/g, " ").replace(/^./u, first => first.toUpperCase());
        return { key: column.key, path: column.path, title: current?.label || title || sheetPathLabel(column.path || []), icon: "data_object", width: column.width };
      });
      return [...this.columns, ...extras, { key: RAW_KEY, title: this.$t("global.data_sheet.raw_data"), icon: "data_object", width: 120, raw: true }];
    },
    visibleColumns(): SheetColumn[] {
      return this.layout.filter(layout => layout.visible).map(layout => {
        const definition = this.definitions.find(column => column.key === layout.key);
        return definition ? { ...definition, width: layout.width, title: layout.title || definition.title } : null;
      }).filter(Boolean) as SheetColumn[];
    },
    extraColumnCount(): number { return this.visibleColumns.filter(column => column.path).length; },
    indexWidth(): number { return 40; },
    tableWidth(): number { return this.indexWidth + this.visibleColumns.reduce((sum, column) => sum + this.columnWidth(column), 0) + (this.$slots.actions ? 54 : 0); },
    editingColumn(): SheetColumn | undefined { return this.visibleColumns.find(column => column.key === this.editingKey); },
    missingDraftCount(): number {
      return this.layout.filter(column => column.path && this.draftKeys.includes(column.key) && !this.keyDiscovery.keys.some(key => key.key === column.key)).length;
    },
    selectedColumn(): SheetColumn | undefined { return this.visibleColumns.find(column => column.key === this.selected?.column); },
    selectedItem(): Record<string, any> | undefined {
      if (!this.selected) return undefined;
      return this.availableItems.find((item, index) => (item[this.rowKey] ?? index) === this.selected!.row);
    },
    selectedCell(): { exists: boolean; value: any } | null {
      return this.selectedItem && this.selectedColumn ? this.cellValue(this.selectedItem, this.selectedColumn) : null;
    },
    selectedPreview(): string { return this.selectedCell ? this.displayValue(this.selectedCell) : ""; },
    selectedCoordinate(): string {
      if (!this.selected) return "";
      const index = this.visibleColumns.findIndex(column => column.key === this.selected!.column);
      return index < 0 ? "" : `${this.columnLetter(index)}${this.rowOffset + this.selected.rowIndex + 1}`;
    },
    panelTitle(): string {
      if (this.panel === "columns") return this.$t("global.data_sheet.choose_columns");
      if (this.panel === "column") return this.$t("global.data_sheet.column_settings");
      return this.selectedColumn?.title || this.$t("global.data_sheet.extra_data");
    },
    panelSubtitle(): string {
      if (this.panel === "columns") return this.$t("global.data_sheet.choose_columns_hint");
      if (this.panel === "value") return String(this.selectedItem?.name || this.selectedItem?.[this.rowKey] || "");
      return "";
    },
    panelContentProps() {
      return { style: { insetInlineEnd: "0px", insetBlock: "0px", margin: "0px", height: "100%", maxHeight: "100%", maxWidth: "100%", width: this.narrow ? "100%" : "410px" } };
    },
    widthOptions() {
      return [
        { title: this.$t("global.data_sheet.compact"), value: 120 },
        { title: this.$t("global.data_sheet.regular"), value: 170 },
        { title: this.$t("global.data_sheet.wide"), value: 260 },
      ];
    },
  },
  watch: {
    columns: {
      immediate: true,
      handler(columns: SheetColumn[]) {
        if (this.storageMounted && !this.storageReady) { this.loadLayoutScope(); return; }
        for (const column of columns) {
          if (!this.layout.some(layout => layout.key === column.key)) this.layout.push({ key: column.key, width: column.width || 170, visible: column.fixed || column.visible !== false });
        }
        if (!this.layout.some(column => column.key === RAW_KEY)) this.layout.push({ key: RAW_KEY, width: 120, visible: true });
      },
    },
    items() { this.clearSelection(); },
    loading(value: boolean) { if (value) this.clearSelection(); },
    error(value: string | null) { if (value) this.clearSelection(); },
    storageKey() { if (this.storageMounted) this.loadLayoutScope(); },
    async fullscreen(value: boolean) {
      this.closePanel();
      // The legacy inverted window no longer surrounds content after Teleport.
      this.fullscreenTheme = value && (this.$refs.sheet as HTMLElement | undefined)?.closest(".smart-invert") ? "dark" : undefined;
      if (value) { await nextTick(); this.fullscreenTarget = this.$refs.fullscreenTarget as HTMLElement; }
    },
  },
  async mounted() {
    this.storageMounted = true;
    this.loadLayoutScope();
    this.fullscreenTarget = this.$refs.fullscreenTarget as HTMLElement;
    await nextTick();
    const sheet = this.$refs.sheet as HTMLElement;
    this.narrow = sheet.clientWidth < 650;
    this.observer = new ResizeObserver(entries => { this.narrow = entries[0].contentRect.width < 650; });
    this.observer.observe(sheet);
  },
  beforeUnmount() { this.storageReady = false; this.observer?.disconnect(); this.resizeCleanup?.(); },
  methods: {
    formatSheetValue,
    sheetValueType,
    defaultLayout() {
      return [
        ...this.columns.map(column => ({ key: column.key, visible: !!column.fixed || column.visible !== false, width: column.width || 170, fixed: column.fixed })),
        { key: RAW_KEY, visible: true, width: 120, raw: true },
      ];
    },
    layoutPayload(layout = this.layout): string {
      return JSON.stringify({ version: 1, columns: layout.map(({ key, visible, width, title, path }) => ({ key, visible, width, title, path })) });
    },
    loadLayoutScope() {
      this.storageReady = false;
      this.resizeCleanup?.();
      this.clearSelection(); this.closePanel();
      const defaults = this.defaultLayout();
      this.layout = defaults.map(({ key, visible, width }) => ({ key, visible, width }));
      this.storageScope = this.storageKey;
      this.storageNotice = "";
      if (!this.columns.length) return;
      if (this.storageKey) {
        try {
          const raw = window.localStorage.getItem(this.storageKey);
          if (raw !== null) {
            const restored = raw.length * 3 <= 65536 ? restoreSheetLayout(JSON.parse(raw), defaults) : null;
            if (restored) this.layout = restored;
            else this.storageNotice = "storage_restore_failed";
          }
        } catch { this.storageNotice = "storage_restore_failed"; }
      }
      // Restoration never writes: malformed or future-version preferences remain intact until an explicit edit.
      this.storageBaseline = this.layoutPayload();
      this.storageReady = true;
    },
    persistLayout() {
      if (!this.storageReady || !this.storageKey || this.storageScope !== this.storageKey) return;
      try {
        const columns = this.layout.map(({ key, visible, width, title, path }) => ({ key, visible, width, title, path }));
        const restored = restoreSheetLayout({ version: 1, columns }, this.defaultLayout());
        if (!restored) { this.storageNotice = "storage_unavailable"; return; }
        const payload = this.layoutPayload(restored);
        if (payload === this.storageBaseline) return;
        window.localStorage.setItem(this.storageKey, payload);
        this.storageBaseline = payload;
        this.storageNotice = "";
      } catch { this.storageNotice = "storage_unavailable"; }
    },
    typeLabel(type: string): string { return this.$t(`global.data_sheet.types.${type}`); },
    extraPath(path: string[]): string {
      const label = sheetPathLabel(path);
      return this.extraDataKey + (label ? (label.startsWith("[") ? "" : ".") + label : "");
    },
    columnLetter(index: number): string {
      let result = "";
      do { result = String.fromCharCode(65 + index % 26) + result; index = Math.floor(index / 26) - 1; } while (index >= 0);
      return result;
    },
    columnWidth(column: SheetColumn): number { return column.fixed && this.narrow ? Math.min(column.width || 224, 180) : column.width || 170; },
    cellValue(item: Record<string, any>, column: SheetColumn): { exists: boolean; value: any } {
      const extra = readSheetPath(item, [this.extraDataKey]);
      if (column.path) return extra.exists ? readSheetPath(extra.value, column.path) : { exists: false, value: undefined };
      if (column.raw) return extra;
      if (column.getValue) return { exists: true, value: column.getValue(item) };
      return readSheetPath(item, [column.key]);
    },
    displayValue(cell: { value: unknown; exists: boolean }, full = false): string {
      if (!cell.exists) return full ? this.$t("global.data_sheet.missing") : "—";
      if (cell.value === "") return full ? this.$t("global.data_sheet.empty_string") : '""';
      return formatSheetValue(cell.value, { exists: cell.exists, pretty: full, maxLength: full ? Infinity : 200 });
    },
    objectSummary(value: unknown): string {
      if (Array.isArray(value)) return this.$t("global.data_sheet.array_items", { count: this.$n(value.length) });
      if (value && typeof value === "object") return this.$t("global.data_sheet.object_keys", { count: this.$n(Object.keys(value).length) });
      return formatSheetValue(value);
    },
    sortState(column: SheetColumn): "ascending" | "descending" | undefined {
      if (!column.sortable || column.path) return undefined;
      return this.sortBy[0]?.key === column.key ? (this.sortBy[0].order === "asc" ? "ascending" : "descending") : undefined;
    },
    sortColumn(column: SheetColumn) {
      if (column.sortable && !column.path) this.$emit("sort", { key: column.key, order: this.sortBy[0]?.key === column.key && this.sortBy[0].order === "asc" ? "desc" : "asc" });
    },
    openColumns() {
      this.rememberPanelActivator();
      this.draftKeys = this.layout.filter(column => column.visible).map(column => column.key);
      this.keySearch = "";
      this.panel = "columns";
      this.copyFeedback = "";
    },
    toggleDraft(key: string, checked: boolean) {
      if (checked && !this.draftKeys.includes(key)) this.draftKeys.push(key);
      else if (!checked) this.draftKeys = this.draftKeys.filter(value => value !== key);
    },
    applyColumns() {
      for (const key of this.keyDiscovery.keys) {
        if (this.draftKeys.includes(key.key) && !this.layout.some(column => column.key === key.key)) this.layout.splice(Math.max(0, this.layout.findIndex(column => column.key === RAW_KEY)), 0, { key: key.key, path: key.path, width: 170, visible: true });
      }
      for (const column of this.layout) column.visible = column.key === RAW_KEY || !!this.columns.find(base => base.key === column.key)?.fixed || this.draftKeys.includes(column.key);
      if (!this.layout.some(column => column.visible && column.key === this.selected?.column)) this.selected = null;
      this.persistLayout();
      this.closePanel();
    },
    openColumn(column: SheetColumn) {
      this.rememberPanelActivator();
      this.editingKey = column.key;
      this.columnLabel = column.title;
      this.columnSize = column.width || 170;
      this.panel = "column";
      this.copyFeedback = "";
    },
    applyColumn() {
      const layout = this.layout.find(column => column.key === this.editingKey);
      if (layout) {
        const title = this.columnLabel.trim().slice(0, 120);
        layout.title = title && title !== this.definitions.find(column => column.key === this.editingKey)?.title ? title : undefined;
        layout.width = this.columnSize;
      }
      this.persistLayout();
      this.closePanel();
    },
    canMove(column: SheetColumn, offset: number): boolean {
      const index = this.visibleColumns.findIndex(value => value.key === column.key);
      const neighbor = this.visibleColumns[index + offset];
      return !column.fixed && !!neighbor && !neighbor.fixed;
    },
    moveColumn(column: SheetColumn, offset: number) {
      if (!this.canMove(column, offset)) return;
      const visibleIndex = this.visibleColumns.findIndex(value => value.key === column.key);
      const neighbor = this.visibleColumns[visibleIndex + offset];
      const from = this.layout.findIndex(value => value.key === column.key), to = this.layout.findIndex(value => value.key === neighbor.key);
      [this.layout[from], this.layout[to]] = [this.layout[to], this.layout[from]];
      this.persistLayout();
    },
    hideColumn(column: SheetColumn) {
      const layout = this.layout.find(value => value.key === column.key);
      if (layout && !column.fixed && !column.raw) layout.visible = false;
      this.persistLayout();
      this.clearSelection(); this.closePanel();
    },
    fitColumn(column: SheetColumn) {
      const context = document.createElement("canvas").getContext("2d");
      if (!context) return;
      const element = this.$refs.sheet as HTMLElement;
      context.font = `13px ${getComputedStyle(element).fontFamily}`;
      const labels = [column.title, ...this.availableItems.map(item => this.displayValue(this.cellValue(item, column)))];
      const width = Math.max(110, Math.min(420, Math.ceil(Math.max(...labels.map(label => context.measureText(label).width))) + 44));
      const layout = this.layout.find(value => value.key === column.key);
      if (layout) layout.width = width;
      this.persistLayout();
      this.closePanel();
    },
    resizeBy(column: SheetColumn, delta: number) {
      const layout = this.layout.find(value => value.key === column.key);
      if (layout) layout.width = Math.min(480, Math.max(95, layout.width + delta));
    },
    resizeKey(column: SheetColumn, delta: number) {
      this.resizeBy(column, delta * (getComputedStyle(this.$refs.sheet as HTMLElement).direction === "rtl" ? -1 : 1));
      this.persistLayout();
    },
    startResize(event: PointerEvent, column: SheetColumn) {
      event.preventDefault(); this.resizeCleanup?.();
      const handle = event.currentTarget as HTMLElement, start = event.clientX, width = column.width || 170, scope = this.storageScope;
      const rtl = getComputedStyle(this.$refs.sheet as HTMLElement).direction === "rtl";
      handle.setPointerCapture(event.pointerId);
      const move = (moveEvent: PointerEvent) => { if (scope !== this.storageKey || scope !== this.storageScope) return; const layout = this.layout.find(value => value.key === column.key); if (layout) layout.width = Math.min(480, Math.max(95, width + (moveEvent.clientX - start) * (rtl ? -1 : 1))); };
      const stop = (endEvent?: PointerEvent) => { handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", stop); handle.removeEventListener("pointercancel", stop); this.resizeCleanup = null; if (endEvent?.type === "pointerup" && scope === this.storageKey) this.persistLayout(); };
      handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", stop, { once: true }); handle.addEventListener("pointercancel", stop, { once: true }); this.resizeCleanup = stop;
    },
    inspectCell(item: Record<string, any>, rowIndex: number, column: SheetColumn) {
      this.rememberPanelActivator();
      this.selected = { row: item[this.rowKey] ?? rowIndex, column: column.key, rowIndex };
      this.valueTab = "fields"; this.copyFeedback = ""; this.panel = "value";
    },
    clearSelection() { this.selected = null; if (this.panel === "value") this.closePanel(); },
    rememberPanelActivator() {
      this.panelActivator = typeof document === "undefined" ? null : document.activeElement as HTMLElement;
    },
    closePanel() {
      if (!this.panel) return;
      const activator = this.panelActivator;
      this.panel = "";
      this.copyFeedback = "";
      nextTick(() => {
        if (activator?.isConnected) activator.focus();
        else (this.$refs.sheet as HTMLElement | undefined)?.querySelector<HTMLElement>(".u-data-sheet__toolbar .v-btn")?.focus();
      });
    },
    async copySelected() {
      if (!this.selectedCell?.exists) return;
      try {
        const value = this.selectedCell.value;
        await navigator.clipboard.writeText(typeof value === "string" ? value : formatSheetValue(value, { pretty: true, maxLength: Infinity }));
        this.copyFeedback = this.$t("global.data_sheet.copied");
      } catch { this.copyFeedback = this.$t("global.data_sheet.copy_failed"); }
    },
  },
});
</script>

<style lang="scss" scoped>
.u-data-sheet-anchor { min-width: 0; }
.u-data-sheet-fullscreen-target { min-height: 100%; background: rgb(var(--v-theme-surface)); }
.u-data-sheet {
  position: relative; min-width: 0; overflow: hidden; background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface));
  font-size: var(--sd-modern-font-small, 13px); line-height: 20px;
  &__header { padding: 24px 24px 20px; }
  &__toolbar { margin-inline: 24px; padding-block: 12px; gap: 12px; display: flex; align-items: center; flex-wrap: wrap; border-block: 1px solid var(--sd-modern-border); }
  &__toolbar > .v-btn--variant-outlined { border-color: var(--sd-modern-border); }
  &__view { display: flex; align-items: center; gap: 7px; white-space: nowrap; font-weight: 500; padding-inline-end: 12px; border-inline-end: 1px solid var(--sd-modern-border); }
  &__count { margin-inline-start: 7px; color: var(--sd-modern-muted); font-size: 12px; }
  &__extra-count { color: var(--sd-modern-muted); font-size: 12px; }
  &__search { margin-inline-start: auto; max-width: 240px; min-width: 130px; }
  &__fullscreen-button { flex: 0 0 auto; }
  &__storage-notice { margin: 16px 24px; display: flex; align-items: start; gap: 9px; }
  &__storage-notice > .v-icon { flex: 0 0 auto; margin-top: 2px; }
  &__formula { display: flex; align-items: center; gap: 12px; padding: 10px 24px; min-height: 44px; border-bottom: 1px solid var(--sd-modern-border); }
  &__coordinate { min-width: 42px; border-inline-end: 1px solid var(--sd-modern-border); color: var(--sd-modern-muted); font-size: 12px; }
  &__formula-value { min-width: 0; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  &__readonly { display: inline-flex; align-items: center; gap: 5px; color: var(--sd-modern-muted); white-space: nowrap; font-size: 12px; }
  &__muted { color: var(--sd-modern-muted); }
  &__scroll { min-width: 0; overflow: auto; max-height: 615px; scrollbar-width: thin; }
  &__table { table-layout: fixed; min-width: 100%; border-collapse: separate; border-spacing: 0; }
  &__table th, &__table td { padding: 0; border-inline-end: 1px solid var(--sd-modern-border); border-bottom: 1px solid var(--sd-modern-border); background: rgb(var(--v-theme-surface)); position: relative; text-align: start; }
  &__table th { height: 55px; position: sticky; top: 0; z-index: 3; background: color-mix(in srgb, rgb(var(--v-theme-surface)) 97%, rgb(var(--v-theme-on-surface))); font-weight: 400; }
  &__table td { height: 48px; }
  &__index { position: sticky !important; inset-inline-start: 0; text-align: center !important; color: var(--sd-modern-muted); font-size: 11px; z-index: 2; width: 40px; background: color-mix(in srgb, rgb(var(--v-theme-surface)) 97%, rgb(var(--v-theme-on-surface))) !important; }
  &__table th.u-data-sheet__index { z-index: 5; }
  &__fixed { position: sticky !important; z-index: 2; box-shadow: 3px 0 5px rgba(var(--v-theme-on-surface), .035); }
  &__table th.u-data-sheet__fixed { z-index: 4; }
  &__extra-head { box-shadow: inset 0 2px rgb(var(--v-theme-info)); }
  &__extra-symbol { color: rgb(var(--v-theme-info)); }
  &__letter { position: absolute; inset-inline-start: 12px; top: 5px; font-size: 10px; line-height: 14px; color: var(--sd-modern-muted); }
  &__column-heading { display: flex; gap: 7px; align-items: center; padding-block: 16px 2px; padding-inline: 12px 8px; min-width: 0; }
  &__heading-label { min-width: 0; flex: 1; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; text-align: start; display: flex; align-items: center; gap: 3px; }
  &__heading-label:focus-visible, &__cell:focus-visible, &__resize:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }
  &__column-menu { flex: 0 0 auto; }
  &__resize { position: absolute; inset-inline-end: -3px; inset-block: 0; width: 6px; cursor: col-resize; touch-action: none; z-index: 6; }
  &__resize:hover { background: rgb(var(--v-theme-primary)); }
  &__cell { display: block; width: 100%; min-height: 48px; height: 100%; padding: 6px 12px; text-align: start; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: var(--sd-modern-font-small, 13px); line-height: 20px; font-variant-numeric: tabular-nums; }
  &__cell:hover { background: rgba(var(--v-theme-on-surface), .025); }
  &__cell--selected { background: rgba(var(--v-theme-primary), .055); box-shadow: inset 0 0 0 2px rgb(var(--v-theme-primary)); }
  &__json-value { display: inline-flex; align-items: center; gap: 4px; color: rgb(var(--v-theme-info)); background: rgba(var(--v-theme-info), .055); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
  &__raw-value { display: inline-flex; align-items: center; gap: 5px; color: rgb(var(--v-theme-primary)); }
  &__actions { width: 54px; position: sticky !important; inset-inline-end: 0; z-index: 2; text-align: center !important; border-inline-end: 0 !important; }
  &__table th.u-data-sheet__actions { z-index: 4; }
  &__skeleton { display: block; margin: 18px 12px; height: 11px; width: 65%; border-radius: 4px; background: rgba(var(--v-theme-on-surface), .08); }
  &__empty { min-height: 350px; padding: 48px 24px; }
  &__empty p { margin: 8px 0 16px; }
  &__footer { padding: 16px 24px; }
  &__panel { height: 100%; border-inline-start: 1px solid var(--sd-modern-border); background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); font-size: var(--sd-modern-font-small, 13px); }
  &__panel-heading { display: flex; align-items: start; gap: 12px; padding: 24px 22px 18px; border-bottom: 1px solid var(--sd-modern-border); }
  &__panel-heading > div { min-width: 0; flex: 1; }
  &__panel-heading .sd-modern-subtitle { margin-top: 5px; }
  &__panel-heading > .v-btn { flex: 0 0 auto; }
  &__panel-body { padding: 20px 22px !important; font-size: var(--sd-modern-font-small, 13px) !important; line-height: 21px !important; }
  &__panel-footer { padding: 16px 22px; border-top: 1px solid var(--sd-modern-border); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  &__panel-footer > span { font-size: 12px; }
  &__panel-footer > .v-btn:only-child { margin-inline-start: auto; }
  &__key-search { margin-bottom: 20px; }
  &__key-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; font-size: 12px; }
  &__key-row { display: flex; align-items: start; gap: 11px; padding-block: 12px; border-bottom: 1px solid var(--sd-modern-border); cursor: pointer; }
  &__key-row input { flex: 0 0 auto; width: 16px; height: 16px; margin-top: 3px; accent-color: rgb(var(--v-theme-primary)); }
  &__key-row input:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__key-copy { min-width: 0; flex: 1; }
  &__key-title { display: flex; justify-content: space-between; gap: 12px; }
  &__type { font-size: 11px; color: var(--sd-modern-muted); }
  &__path { display: block; font-family: monospace; font-size: 12px; color: var(--sd-modern-muted); margin-top: 3px; overflow-wrap: anywhere; }
  &__key-example { display: flex; justify-content: space-between; gap: 12px; margin-top: 6px; color: var(--sd-modern-muted); font-size: 12px; }
  &__key-example > span:first-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  &__key-example > span:last-child { white-space: nowrap; }
  &__notice { display: flex; flex-wrap: nowrap; align-items: start; gap: 9px; margin-top: 20px; font-size: var(--sd-modern-font-small, 13px); }
  &__notice .v-icon { flex: 0 0 auto; margin-top: 2px; }
  &__standard-fields { margin-top: 20px; }
  &__standard-fields summary { cursor: pointer; min-height: 32px; }
  &__setting-field { margin-top: 22px; }
  &__setting-hint { font-size: 12px; margin-top: 7px; }
  &__setting-label { margin-block: 24px 10px; }
  &__setting-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  &__hide-column { margin-top: 24px; }
  &__value-type { color: var(--sd-modern-muted); margin-top: 14px; font-size: 12px; }
  &__value-tabs { display: flex; gap: 4px; padding: 4px; margin-block: 18px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .035); }
  &__value-tabs button { padding: 7px 12px; border-radius: 6px; flex: 1; color: var(--sd-modern-muted); }
  &__value-tabs button[aria-selected="true"] { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); box-shadow: 0 2px 5px rgba(var(--v-theme-on-surface), .08); }
  &__full-value { margin-top: 16px; padding: 16px; border: 1px solid var(--sd-modern-border); border-radius: 9px; background: rgba(var(--v-theme-on-surface), .025); font: inherit; line-height: 22px; white-space: pre-wrap; overflow-wrap: anywhere; user-select: text; }
  &__field-values { margin: 0; }
  &__field-values > div { padding-block: 12px; border-bottom: 1px solid var(--sd-modern-border); }
  &__field-values dt { font-weight: 500; }
  &__field-values dd { margin: 5px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  &__copy-feedback { padding: 0 22px 16px; margin: 0; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small, 13px); }
  &--fullscreen { min-height: 100vh; }
  &--fullscreen .u-data-sheet__scroll { max-height: calc(100vh - 280px); }
}
@media (max-width: 650px) {
  .u-data-sheet {
    &__header { padding: 20px 16px 16px; }
    &__toolbar { margin-inline: 16px; }
    &__view { border: 0; padding-inline-end: 0; }
    &__extra-count { display: none; }
    &__fullscreen-button { margin-inline-start: auto; }
    &__storage-notice { margin-inline: 16px; }
    &__search { flex-basis: 100%; order: 5; max-width: none; margin-inline-start: 0; }
    &__formula { padding-inline: 16px; gap: 8px; }
    &__readonly { font-size: 11px; }
    &__scroll { max-height: 520px; }
    &__column-heading { padding-inline-end: 5px; gap: 5px; }
    &__footer { padding-inline: 16px; }
    &__panel-heading, &__panel-body, &__panel-footer { padding-inline: 16px !important; }
    &__key-row { min-height: 52px; }
    &__standard-fields summary { min-height: 44px; }
    &__value-tabs button { min-height: 44px; }
  }
}
@media (pointer: coarse) { .u-data-sheet__cell { min-height: 48px; } }
</style>

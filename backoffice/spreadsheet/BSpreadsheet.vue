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
  <div
    class="s--spreadsheet"
    :class="{ 'b-spreadsheet--modern text-start': modern }"
  >
    <header v-if="modern && items?.length" class="b-spreadsheet__heading">
      <div>
        <h3>{{ $t("importer.spreadsheet.preview_title") }}</h3>
        <p>{{ $t("importer.spreadsheet.edit_help") }}</p>
      </div>
      <div class="b-spreadsheet__view-controls">
        <span class="sd-modern-page-summary">
          {{
            $t("importer.spreadsheet.row_range", {
              from: $n((page - 1) * item_per_page + 1),
              to: $n(Math.min(page * item_per_page, items.length)),
              total: $n(items.length),
            })
          }}
        </span>
        <u-smart-toggle
          v-if="headers?.some((header) => !cols.includes(header))"
          v-model="show_all"
          accessible
          :true-title="$t('importer.spreadsheet.show_all_columns')"
          color="success"
          false-gray
        />
      </div>
    </header>
    <v-row
      v-if="
        !modern ||
        (items?.length && selected_row !== null && selected_col !== null)
      "
      align="start"
      class="my-3 b-spreadsheet__toolbar"
      no-gutters
      :style="modern ? undefined : 'min-height: 80px'"
    >
      <v-col cols="12" :md="modern ? 12 : 8" :sm="modern ? 12 : 6">
        <b-spreadsheet-value-input
          v-if="paged_items?.length"
          :key="`i-${selected_row}-${selected_col}`"
          :col="selected_col"
          :headers="headers"
          :label="input_label"
          :model-value="paged_items[selected_row]?.[selected_col]"
          :row="selected_row"
          :rowValue="paged_items[selected_row]"
          :styler="styler"
          :modern="modern"
          @update:model-value="
            (v) => (paged_items[selected_row][selected_col] = v)
          "
        ></b-spreadsheet-value-input>
      </v-col>
      <v-col v-if="!modern" class="d-flex justify-end" cols="12" md="4" sm="6">
        <u-smart-toggle
          v-if="items && items.length"
          v-model="show_all"
          :accessible="modern"
          :true-title="$t('global.actions.show_all')"
          color="success"
          false-gray
        ></u-smart-toggle>
      </v-col>
    </v-row>

    <v-table
      v-if="headers?.length"
      :class="
        modern
          ? 'sd-modern-table sd-modern-table--dense b-spreadsheet__table'
          : 'bordered-table'
      "
    >
      <template v-slot:default>
        <caption v-if="modern" class="b-spreadsheet__caption">
          {{
            $t("importer.spreadsheet.preview_title")
          }}
        </caption>
        <thead>
          <tr>
            <th v-if="modern" scope="col" class="b-spreadsheet__row-number">
              {{ $t("importer.spreadsheet.row") }}
            </th>
            <b-spreadsheet-header-column
              v-for="(header, index) in headers"
              :key="index"
              :class="show_all || cols.includes(header) ? '' : 'no-display'"
              :styler="styler"
              :header="header"
              :modern="modern"
            ></b-spreadsheet-header-column>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, row) in paged_items"
            :key="'r-' + row"
            :class="{ 'border-top-2px': !modern && !isVariant(item) }"
          >
            <th v-if="modern" scope="row" class="b-spreadsheet__row-number">
              {{ $n((page - 1) * item_per_page + row + 1) }}
            </th>
            <td
              v-for="(val, col) in item"
              :key="'c-' + col"
              :class="{
                'no-display': !show_all && !cols.includes(headers[col]),
                'not-valid': !validate(row, col, val),
                'b-spreadsheet__cell--selected':
                  modern && selected_row === row && selected_col === col,
              }"
              :tabindex="modern ? 0 : undefined"
              :aria-label="
                modern
                  ? $t('importer.spreadsheet.cell_label', {
                      column: headers[col],
                      row: $n((page - 1) * item_per_page + row + 1),
                    })
                  : undefined
              "
              :aria-invalid="
                modern && !validate(row, col, val) ? 'true' : undefined
              "
              :title="modern ? String(val ?? '') : undefined"
              @click="selectCell(row, col)"
              @keydown.enter.self.prevent="modern && selectCell(row, col)"
              @keydown.space.self.prevent="modern && selectCell(row, col)"
            >
              <b-spreadsheet-value-cell
                v-model="paged_items[row][col]"
                :col="col"
                :headers="headers"
                :row="row"
                :row-value="item"
                :styler="styler"
                @show-faqs="showFaqs"
                @show-structure-data="showStructureData"
                @show-html="showHtml"
              ></b-spreadsheet-value-cell>
              <span
                v-if="modern && !validate(row, col, val)"
                class="b-spreadsheet__invalid"
              >
                <v-icon size="14" color="error" aria-hidden="true"
                  >error_outline</v-icon
                >
                {{ $t("importer.spreadsheet.invalid_value") }}
              </span>
            </td>
          </tr>
        </tbody>
      </template>
    </v-table>

    <div v-if="modern && pages_count > 1" class="sd-modern-table-footer my-5">
      <span class="sd-modern-page-summary"
        >{{ $t("global.commons.page") }}
        <bdi>{{ $n(page) }} / {{ $n(pages_count) }}</bdi></span
      >
      <v-pagination
        v-model="page"
        :length="pages_count"
        class="sd-modern-pagination"
        rounded="circle"
        variant="text"
      />
    </div>
    <v-pagination
      v-else-if="!modern && pages_count > 1"
      v-model="page"
      :length="pages_count"
      class="my-5"
      rounded="circle"
      variant="text"
    ></v-pagination>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Article ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-dialog
      v-model="dialog_html"
      max-width="1600"
      scrollable
      @click:outside="selected_html = null"
    >
      <v-card class="master-article-container">
        <v-card-text class="samin-article-widget article">
          <s-article-editor
            v-if="selected_html"
            :body="selected_html"
            :edit="false"
            :enable-title="false"
            :only-view="true"
            class="p-lg-5 p-md-4 p-3 samin-article-content"
            style="display: inline-block"
          >
          </s-article-editor>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
              dialog_html = false;
              selected_html = null;
            "
            >{{ $t("global.actions.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ FAQ ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-dialog
      v-model="dialog_faqs"
      max-width="1600"
      scrollable
      @click:outside="selected_faqs = null"
    >
      <v-card>
        <v-card-text v-if="selected_faqs">
          <s-article-faqs :faqs="selected_faqs"></s-article-faqs>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
              dialog_faqs = false;
              selected_faqs = null;
            "
            >{{ $t("global.actions.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Structured Data ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-dialog
      v-model="dialog_structures"
      max-width="1600"
      scrollable
      @click:outside="selected_structures = null"
    >
      <v-card>
        <v-card-text v-if="selected_structures">
          <s-article-structured-data
            :value="selected_structures"
          ></s-article-structured-data>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
              dialog_structures = false;
              selected_structures = null;
            "
            >{{ $t("global.actions.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import SArticleEditor from "../../article/SArticleEditor.vue";
import SArticleFaqs from "../../article/faq/SArticleFaqs.vue";
import SArticleStructuredData from "../../article/SArticleStructuredData.vue";
import USmartToggle from "../../ui/smart/toggle/USmartToggle.vue";
import BSpreadsheetValueInput from "../spreadsheet/value/input/BSpreadsheetValueInput.vue";
import BSpreadsheetValueCell from "../spreadsheet/value/cell/BSpreadsheetValueCell.vue";
import BSpreadsheetHeaderColumn from "@selldone/components-vue/backoffice/spreadsheet/header/column/BSpreadsheetHeaderColumn.vue";

export default {
  name: "BSpreadsheet",
  components: {
    BSpreadsheetHeaderColumn,
    BSpreadsheetValueCell,
    BSpreadsheetValueInput,
    USmartToggle,
    SArticleStructuredData,
    SArticleFaqs,
    SArticleEditor,
  },
  props: {
    modern: { type: Boolean, default: false },
    styler: { require: true },
    cols: { require: true },

    headers: {},
    items: {},
  },

  data: () => ({
    //-------------------
    show_all: false,

    page: 1,

    item_per_page: 10,

    // Selection:
    selected_row: null,
    selected_col: null,

    //--------------------
    dialog_html: false,
    selected_html: null,

    dialog_faqs: false,
    selected_faqs: null,

    dialog_structures: false,
    selected_structures: null,
    /*
      dialog_extra:false,
      selected_extra:null,
  */
  }),

  computed: {
    pages_count() {
      return this.items ? Math.ceil(this.items.length / this.item_per_page) : 1;
    },
    input_label() {
      if (
        this.modern &&
        this.selected_row !== null &&
        this.selected_col !== null
      ) {
        return this.$t("importer.spreadsheet.cell_label", {
          column: this.headers[this.selected_col],
          row: this.$n(
            (this.page - 1) * this.item_per_page + this.selected_row + 1,
          ),
        });
      }
      return this.selected_row !== null &&
        this.selected_col !== null &&
        this.paged_items[this.selected_row] &&
        this.headers[this.selected_col] &&
        this.headers
        ? `[${this.paged_items[this.selected_row][0]}] 🠦 [${
            this.headers[this.selected_col]
          }]`
        : null;
    },

    paged_items() {
      return this.items
        ? this.items.slice(
            (this.page - 1) * this.item_per_page,
            this.page * this.item_per_page,
          )
        : [];
    },
  },
  watch: {
    page() {
      // Don't watch items! All time changed when a column value has been changed by the user.
      this.selected_row = null;
      this.selected_col = null;
    },
  },

  created() {},
  methods: {
    goFirst() {
      // console.log('goFirst! reset!')
      this.selected_row = null;
      this.selected_col = null;
      this.page = 1;
    },
    showPagedData() {
      // console.log('showPagedData! reset!')
      this.selected_row = null;
      this.selected_col = null;
      this.page = 1;
    },

    selectCell(row, col) {
      this.selected_row = row;
      this.selected_col = col;
    },

    isVariant(item) {
      const index_type = this.headers.indexOf("Type");
      return item[index_type] === "VARIANT";
    },

    validate(row, col, val) {
      const style = this.styler[this.headers[col]];

      if (!style) return true; // No validation!

      const item = this.paged_items[row];
      if (
        (style.onlyProduct && this.isVariant(item)) ||
        (style.onlyVariant && !this.isVariant(item))
      ) {
        return true;
      } // No validation! (Disabled)

      // Nullable for variant:
      if (style.required && !val) return false;

      // Nullable for variant:
      if (!style.required_variant && this.isVariant(item) && !val) return true;
      // Nullable for product:
      if (!style.required_product && !this.isVariant(item) && !val) return true;

      //Required for Variant:
      if (style.required_variant && this.isVariant(item) && !val) return false;

      //Required for product:
      if (style.required_product && !this.isVariant(item) && !val) return false;

      if (style.type === "enum") {
        return style.list.some((it) => it.code === val);
      }

      if (style.is_parent && val) {
        const index_name = this.headers.indexOf("Name");
        const index_title = this.headers.indexOf("Title");

        return this.items.some((it) => {
          return it[index_name] === val || it[index_title] === val;
        });
      }

      return true;
    },
    showStructureData({ structure_data, row, col }) {
      this.selected_row = row;
      this.selected_col = col;
      this.dialog_structures = true;
      this.selected_structures = JSON.parse(structure_data);
    },
    showHtml({ html, row, col }) {
      this.selected_row = row;
      this.selected_col = col;
      this.dialog_html = true;
      this.selected_html = html;
    },

    showFaqs({ faqs, row, col }) {
      this.selected_row = row;
      this.selected_col = col;
      this.dialog_faqs = true;
      this.selected_faqs = JSON.parse(faqs);
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--spreadsheet {
  th {
    white-space: nowrap;
  }

  td {
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &:hover {
      background-color: #fafafa;
      cursor: text !important;
    }
  }

  .label-in {
    color: #0f75ac;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 3px;
  }

  .no-display {
    display: none !important;
  }

  .not-valid {
    position: relative;

    &:after {
      background-color: rgba(230, 74, 25, 0.83);
      width: 100%;
      height: 100%;
      content: "Not Valid!";
      color: #fff;
      line-height: 3.5rem;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 0 12px;
      text-align: center;
    }
  }

  img {
    object-fit: cover;
  }
}
</style>

<style lang="scss" scoped>
.b-spreadsheet--modern {
  min-width: 0;

  .b-spreadsheet__heading,
  .b-spreadsheet__view-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .b-spreadsheet__heading {
    margin-block: 24px 12px;
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
      letter-spacing: 0;
    }
    p {
      margin: 3px 0 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 21px;
    }
  }
  .b-spreadsheet__toolbar {
    margin-block: 0 16px !important;
  }
  .b-spreadsheet__view-controls :deep(.s--smart-toggle b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .b-spreadsheet__caption {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .b-spreadsheet__table :deep(table) {
    min-width: 640px;
  }
  .b-spreadsheet__table :deep(thead > tr > th) {
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-spreadsheet__table :deep(tbody > tr > td),
  .b-spreadsheet__table :deep(tbody > tr > th) {
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  .b-spreadsheet__row-number {
    width: 48px;
    color: var(--sd-modern-muted);
    font-variant-numeric: tabular-nums;
  }
  td {
    cursor: text;
    &:hover {
      background: var(--sd-modern-inset);
    }
    &:focus-visible,
    &.b-spreadsheet__cell--selected {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
      background: var(--sd-modern-inset);
    }
  }
  .not-valid::after {
    content: none;
  }
  .b-spreadsheet__invalid {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-block-start: 3px;
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    line-height: 20px;
  }
}
</style>

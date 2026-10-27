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
  <div :class="{ 'b-spreadsheet-inventory--modern text-start': modern, 'b-spreadsheet-inventory--empty': modern && !items?.length }">
    <div class="b-spreadsheet-inventory__file-area">
      <template v-if="modern && !items?.length">
        <v-icon class="b-spreadsheet-inventory__upload-icon" size="28" aria-hidden="true">upload_file</v-icon>
        <h3>{{ $t('importer.inventory.drop_title') }}</h3>
        <p>{{ $t('importer.inventory.drop_message') }}</p>
      </template>
    <v-file-input
      v-if="!converted_file"
      v-model="input_files"
      :disabled="!canSelectFile"
      accept=".csv,.xls,.xlsx"
      append-icon="attach"
      hide-details
      :label="modern ? $t(items?.length ? 'importer.inventory.file_input_label' : 'importer.inventory.choose_file') : 'Select inventory .csv / .xlsx file...'"
      :aria-label="modern ? $t(items?.length ? 'importer.inventory.file_input_label' : 'importer.inventory.choose_file') : undefined"
      :prepend-icon="modern ? '' : undefined"
      :single-line="modern"
      show-size
      variant="outlined"
      @update:model-value="selectFile"
    >
      <template v-slot:prepend-inner>
        <img
          class="me-3"
          :height="modern && !items?.length ? 16 : 24"
          src="../../../assets/file/excel.svg"
          :width="modern && !items?.length ? 16 : 24"
          alt=""
        />
        <span v-if="modern && !items?.length" class="b-spreadsheet-inventory__choose-label">{{ $t('importer.inventory.choose_file') }}</span>
      </template>
    </v-file-input>
    </div>

    <b-spreadsheet
      v-show="!modern || !!headers?.length"
      ref="sheet"
      :cols="cols"
      :headers="headers"
      :items="items"
      :modern="modern"
      :styler="styler"
    ></b-spreadsheet>

    <import-invalid-character-error-dialog v-model="invalid_char">
    </import-invalid-character-error-dialog>
  </div>
</template>

<script lang="ts">
import {
  InventoryCsvFormat,
  InventoryCsvHeaders,
  InventoryCsvStyler,
} from "@selldone/core-js";
import BSpreadsheet from "../BSpreadsheet.vue";
import ImportInvalidCharacterErrorDialog from "../../spreadsheet/dialog/ImportInvalidCharacterErrorDialog.vue";
import SpreadsheetMixin from "../../spreadsheet/mixins/SpreadsheetMixin";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

const Papa = require("papaparse");

export default {
  name: "BSpreadsheetInventory",
  mixins: [SpreadsheetMixin ],

  emits: ["update:valid", "update:totalItems", "update:importType"],
  components: {
    ImportInvalidCharacterErrorDialog,
    BSpreadsheet,
  },
  props: {
    modern: { type: Boolean, default: false },
    canSelectFile: {
      type: Boolean,
      default: true,
    },
    totalItems: {},
  },

  data: () => ({
    styler: InventoryCsvStyler,
    cols: InventoryCsvHeaders,

    headers: null,
    items: null,

    inventory_import_type: null,

    input_files: null,
  }),

  computed: {},
  watch: {
    items() {
      this.$emit("update:totalItems", this.items ? this.items.length : 0);
    },
  },

  created() {},

  methods: {
    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * 🛑 DO NOT CHANGE IT!
     * This function is called externally.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * Triggered by the parent component to get a chunk of data for transmission to the server.
     * This function processes a dataset, splitting it into chunks based on the specified size.
     * It handles variant types and ensures that the data is correctly segmented.
     *
     * @param callback - Function to be called with each chunk of data.
     * @param chunk_size - The size of each data chunk; defaults to 100.
     * @param delay - The delay between processing each chunk; defaults to 3000ms.
     * @param onError - Callback function to be executed in case of an error.
     * @return {Promise<boolean>} - Returns a promise that resolves to true when data processing is complete.
     *
     * The function begins by verifying that necessary data (items and headers) is present.
     * If not, it invokes the onError callback and returns false. It then calculates the
     * dataset size and identifies indexes of products, excluding variants. For each chunk,
     * it slices the data and invokes the callback function with the current chunk, the progress,
     * and a flag indicating if it is the end of the data. The function returns true upon
     * successful completion of all data chunks.
     */
    async generateInventoryJson(
      callback,
      chunk_size = 100,
      delay = 3000,
      onError,
    ) {
      if (!this.items || !this.headers) {
        onError();

        return false;
      }

      const dataset_size = this.items.length;
      const index_type = this.headers.indexOf("Type");

      let products_indexes = [];
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (item[index_type] !== "VARIANT") {
          products_indexes.push(i);
        }
      }
      // Set last item: (If is variant!)
      if (this.items[this.items.length - 1][index_type] === "VARIANT") {
        products_indexes.push(this.items.length - 1);
      }

      console.log("products_indexes", products_indexes);

      // Chunk by products:
      for (let i = 0; i <= products_indexes.length / chunk_size; i++) {
        let is_end = false;

        const start_index = i * chunk_size;
        let end_index = (i + 1) * chunk_size;
        if (end_index >= products_indexes.length) {
          is_end = true;
          end_index = products_indexes.length - 1;
        }

        const start = products_indexes[start_index];
        const end = products_indexes[end_index];

        if (start === undefined || end === undefined) break; // Make sure start & end is valid!

        console.log("i", i, "start", start, "end", end, "is_end", is_end);

        await callback(
          [this.headers, ...this.items.slice(start, end + 1)], // +1 : end of slice in js
          is_end ? 100 : (100 * end) / dataset_size,
          is_end,
        );
        //  await new Promise((res) => setTimeout(res, delay));

        if (is_end) break; // Make sure loop ended!
      }

      return true;
    },
    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * 🛑 DO NOT CHANGE IT!
     * This function is called by {@link SpreadsheetMixin}.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * Triggered when a CSV file is received, either directly from the user or from the server
     * following the conversion of an Excel file to CSV. The function parses the CSV file and
     * handles different scenarios based on the file content.
     *
     * The function uses the 'Papa.parse' method to parse the CSV file. Upon successful parsing,
     * it checks if the file format is valid. If it is a product CSV, it processes the file
     * accordingly. If it's identified as a category CSV, it saves the temporary data and
     * navigates to the 'BPageShopClassificationImporter'. In case of invalid format or parsing
     * error, it shows an error alert and updates the component state.
     *
     * Note: This function directly affects the UI by triggering alerts and routing based on the
     * file content and format.
     */
    parseFile() {
      const config = {
        complete: (results, file) => {
          //  console.log("Parsing complete:", results, file);
          NotificationService.showSuccessAlert(null, "Load CSV file completed.");
          this.loadCsvToSheet(results);

          this.inventory_import_type =
            InventoryCsvFormat.GetInventoryImportType(this.headers);
          this.$emit("update:importType", this.inventory_import_type);

          let valid = InventoryCsvFormat.CheckValidFile(
            this.headers,
            this.inventory_import_type,
          );

          if (!valid) {
            NotificationService.showErrorAlert(
              null,
              "Invalid file format!<hr>" + InventoryCsvFormat.LastError,
            );
          }

          this.$emit("update:valid", valid);
        },
        error: () => {
          NotificationService.showErrorAlert(null, "Parsing error!");
          this.$emit("update:valid", false);

          this.file = null;
          this.converted_file = false;
        },
      };

      Papa.parse(this.file, config);
    },
    loadCsvToSheet({ data, errors, meta }) {
      this.headers = null;
      this.items = null;

      this.$nextTick(() => {
        this.$refs.sheet.goFirst();
      });

      if (!data || !data.length) {
        NotificationService.showErrorAlert(null, "Can not read this file!");
      }

      const sheet = data;

      if (sheet.length > 0) this.headers = sheet[0];
      if (sheet.length > 1) {
        this.items = sheet.slice(1).filter((it) => {
          // AUTO FIX 1 : Filter empty rows!
          //console.log('filter',it)
          return it.length > 1 && it.some((x) => x.length); // Remove empty rows
        });
      }

      // Check invalid character UTF8:
      function hasInvalidChar(arr) {
        if (Array.isArray(arr)) return arr.some((i) => hasInvalidChar(i));
        else if (typeof arr === "string") return arr.includes("���");
        return false;
      }

      this.invalid_char = hasInvalidChar(sheet);

      // Update after change prop:
      this.$nextTick(() => {
        this.$refs.sheet.showPagedData();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-spreadsheet-inventory--modern {
  min-width: 0;
  --sd-modern-font-body: 12px;

  .b-spreadsheet-inventory__file-area { min-width: 0; }
  :deep(.s--spreadsheet) { min-width: 0; }
  :deep(.v-file-input .v-field) { font-family: inherit; font-size: 13px; }
}

.b-spreadsheet-inventory--empty {
  .b-spreadsheet-inventory__file-area {
    border: 1px dashed var(--sd-modern-border);
    border-radius: 12px;
    padding: 30px 20px;
    text-align: center;
  }

  .b-spreadsheet-inventory__upload-icon { display: block; margin: 0 auto 10px; color: var(--sd-modern-muted); }
  h3 { margin: 0; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 1.5; }
  p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 1.5; }

  :deep(.v-file-input) { display: inline-flex; max-width: 100%; margin-block-start: 15px; }
  :deep(.v-file-input .v-field) {
    min-height: 36px;
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    border-radius: 9px;
    --v-field-padding-start: 13px;
    --v-field-padding-end: 13px;
  }
  :deep(.v-file-input .v-field__input) { width: 0; min-width: 0; min-height: 36px; padding: 0; }
  :deep(.v-file-input .v-field-label) { display: none; }
  :deep(.v-file-input .v-field__prepend-inner) { align-items: center; padding: 0; }
  :deep(.v-file-input .v-field__prepend-inner img) { margin-inline-end: 7px !important; }
  .b-spreadsheet-inventory__choose-label { font-family: inherit; font-size: 12px; font-weight: 500; line-height: 20px; white-space: nowrap; }
  :deep(.v-file-input .v-field__outline) { display: none; }
  :deep(.v-file-input .v-field--focused) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
}

@media (max-width: 599px), (pointer: coarse) {
  .b-spreadsheet-inventory--empty {
    .b-spreadsheet-inventory__file-area { padding-inline: 14px; }
    :deep(.v-file-input .v-field), :deep(.v-file-input .v-field__input) { min-height: 44px; }
  }
}
</style>

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
  <div
    class="b-spreadsheet-categories text-start"
    :class="{ 'b-spreadsheet-categories--modern': modern }"
    :aria-busy="converting_file"
  >
    <v-file-input
      v-model="input_files"
      :disabled="!canSelectFile"
      :loading="parse_state === 'reading'"
      accept=".csv,.xls,.xlsx"
      :prepend-icon="modern ? '' : undefined"
      clearable
      hide-details
      :label="
        modern
          ? $t('importer.category_workspace.file_label')
          : 'Select categories .csv / .xls / .xlsx file'
      "
      :single-line="modern"
      :center-affix="modern ? true : undefined"
      :aria-label="
        modern
          ? `${$t('importer.category_workspace.file_label')}${file ? ': ' + file.name : ''}`
          : undefined
      "
      :class="{ 'b-spreadsheet-categories__file': modern }"
      show-size
      :variant="modern ? 'plain' : 'outlined'"
      @update:model-value="selectFile"
    >
      <template v-if="modern" #selection="{ totalBytesReadable }">
        <span class="b-spreadsheet-categories__selection">
          <bdi class="b-spreadsheet-categories__filename" :title="file?.name">{{
            file?.name
          }}</bdi>
          <bdi class="b-spreadsheet-categories__size">{{
            totalBytesReadable
          }}</bdi>
        </span>
      </template>
      <template #prepend-inner>
        <img
          :class="{ 'me-3': !modern }"
          height="24"
          src="../../../assets/file/excel.svg"
          width="24"
          alt=""
        />
      </template>
    </v-file-input>

    <p
      v-if="modern && !converting_file"
      class="b-spreadsheet-categories__file-message"
      :role="
        ['error', 'invalid', 'empty'].includes(parse_state) ? 'alert' : 'status'
      "
      aria-live="polite"
    >
      <v-icon
        v-if="['error', 'invalid', 'empty'].includes(parse_state)"
        size="16"
        aria-hidden="true"
        >info_outline</v-icon
      >
      <span>{{ $t("importer.category_workspace." + fileMessage) }}</span>
    </p>

    <b-spreadsheet-conversion-progress

      v-if="converting_file"

      :filename="file?.name"

    />

    <b-spreadsheet
      v-show="!converting_file"
      ref="sheet"
      :cols="cols"
      :headers="headers"
      :items="items"
      :modern="modern"
      :styler="styler"
    ></b-spreadsheet>
  </div>
</template>

<script lang="ts">
import {
  CategoriesCsvFormat,
  CategoriesCsvHeaders,
  CategoriesCsvStyler,
} from "@selldone/core-js";
import { ProductsCsvFormat } from "@selldone/core-js";
import BSpreadsheet from "../BSpreadsheet.vue";
import SpreadsheetMixin from "../mixins/SpreadsheetMixin";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { TemporaryDataHelper } from "../../../utils/temporary-data/TemporaryDataHelper";

const Papa = require("papaparse");

export default {
  name: "BSpreadsheetCategories",
  mixins: [SpreadsheetMixin],

  components: {
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
    styler: CategoriesCsvStyler,
    cols: CategoriesCsvHeaders,

    headers: null,
    items: null,

    input_files: null,
    parse_state: "idle",
    parse_version: 0,
  }),

  computed: {
    fileMessage() {
      return {
        idle: "file_hint",
        reading: "reading_file",
        ready: "file_ready",
        empty: "empty_file",
        invalid: "invalid_format",
        error: "parsing_error",
      }[this.parse_state];
    },
  },
  watch: {
    items() {
      this.$emit("update:totalItems", this.items ? this.items.length : 0);
    },
  },

  created() {},
  beforeUnmount() {
    this.parse_version++;
  },

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
    async generateCategoriesJson(
      callback,
      chunk_size = 100,
      delay = 3000,
      onError,
    ) {
      if (
        this.converting_file ||
        !this.items?.length ||
        !this.headers ||
        this.parse_state !== "ready"
      ) {
        onError();

        return false;
      }

      const dataset_size = this.items.length;

      // Chunk categories:
      for (let i = 0; i < dataset_size / chunk_size; i++) {
        let is_end = false;

        const start = i * chunk_size;
        let end = (i + 1) * chunk_size;

        if (end >= dataset_size) {
          is_end = true;
          end = dataset_size /*- 1*/;
        }

        await callback(
          [this.headers, ...this.items.slice(start, end)],
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
      // Temporary route data changes before this importer unmounts.
      if (
        this.preventClearTemporaryDataFlag &&
        TemporaryDataHelper.Get(this)?.file === this.file
      )
        return;
      let file = this.file;
      // Conversion returns CSV text; the native picker still needs a real File.
      if (typeof file === "string") {
        const selected = Array.isArray(this.input_files)
          ? this.input_files[0]
          : this.input_files;
        const name =
          selected?.name?.replace(/\.xlsx?$/i, ".csv") || "categories.csv";
        file = new File([file], name, { type: "text/csv" });
        this.file = file;
      }
      if (!file) {
        this.resetToDefault();
        return;
      }
      const version = ++this.parse_version;
      this.input_files = file;
      this.parse_state = "reading";
      this.preventClearTemporaryDataFlag = false;
      this.headers = null;
      this.items = null;
      this.$emit("update:valid", false);
      const config = {
        skipEmptyLines: "greedy",
        complete: (results) => {
          if (version !== this.parse_version) return;
          this.loadCsvToSheet(results);

          if (!this.headers) {
            this.parse_state = "empty";
            return;
          }
          if (results.errors?.length) {
            this.parse_state = "error";
            NotificationService.showErrorAlert(
              null,
              this.$t("importer.category_workspace.parsing_error"),
            );
            return;
          }

          const formatValid = CategoriesCsvFormat.CheckValidFile(this.headers);

          if (!formatValid) {
            // Keep the selected file available to the product importer after navigation.
            if (ProductsCsvFormat.CheckValidFile(this.headers)) {
              this.parse_state = "idle";
              TemporaryDataHelper.Set(this, {
                file,
                converted_file: this.converted_file,
              });
              this.preventClearTemporaryData();
              this.$router.push({
                name: "BPageShopProductsImporter",
              });
              return;
            }
            this.parse_state = "invalid";
            NotificationService.showErrorAlert(
              null,
              this.$t("importer.category_workspace.invalid_format"),
            );
            return;
          }

          const valid = Boolean(this.items?.length);
          this.parse_state = valid ? "ready" : "empty";
          this.$emit("update:valid", valid);
          if (valid)
            NotificationService.showSuccessAlert(
              null,
              this.$t("importer.category_workspace.file_loaded"),
            );
        },
        error: () => {
          if (version !== this.parse_version) return;
          this.parse_state = "error";
          NotificationService.showErrorAlert(
            null,
            this.$t("importer.category_workspace.cannot_read"),
          );
          this.$emit("update:valid", false);
        },
      };

      Papa.parse(file, config);
    },
    resetToDefault() {
      this.parse_version++;
      this.conversion_version++;
      this.converting_file = false;
      this.file = null;
      this.input_files = null;
      this.headers = null;
      this.items = null;
      this.converted_file = false;
      this.invalid_char = false;
      this.preventClearTemporaryDataFlag = false;
      this.parse_state = "idle";
      this.$emit("update:valid", false);
    },
    loadCsvToSheet({ data, errors, meta }) {
      this.headers = null;
      this.items = null;

      this.$nextTick(() => {
        this.$refs.sheet?.goFirst();
      });

      const sheet = Array.isArray(data) ? data : [];

      if (sheet.length > 0) this.headers = sheet[0];
      if (sheet.length > 1) {
        this.items = sheet.slice(1);
      }

      // Update after change prop:
      this.$nextTick(() => {
        this.$refs.sheet?.showPagedData();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-spreadsheet-categories--modern {
  .b-spreadsheet-categories__file {
    padding: 12px 16px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: var(--sd-modern-inset);
    :deep(.v-field) {
      padding: 0;
    }
    :deep(.v-field__input) {
      min-width: 0;
      padding-block: 0;
      font-family: inherit;
      font-size: 14px;
      line-height: 22px;
    }
    :deep(.v-field__prepend-inner),
    :deep(.v-field__clearable) {
      align-items: center;
      padding-block: 0;
    }
    // Keep the empty prompt visible on focus without a floating label.
    :deep(.v-field--active:not(.v-field--dirty) .v-field-label) {
      visibility: visible;
    }
    :deep(.v-file-input__text) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &:focus-within {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
  .b-spreadsheet-categories__selection {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    width: 100%;
  }
  .b-spreadsheet-categories__filename {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .b-spreadsheet-categories__size {
    flex-shrink: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    white-space: nowrap;
  }
  .b-spreadsheet-categories__file-message {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 10px 0 16px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
    > .v-icon {
      flex: 0 0 auto;
      margin-top: 2px;
    }
    > span {
      min-width: 0;
    }
  }
  @media (max-width: 600px) {
    .b-spreadsheet-categories__file :deep(.v-field__input) {
      font-size: 16px;
    }
  }
}
</style>

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
  <div>
    <v-file-input
      v-if="!converted_file"
      v-model="input_files"
      :disabled="!canSelectFile"
      accept=".csv,.xls,.xlsx"
      append-icon="attach"
      hide-details
      label="Select customers .csv / .xlsx file"
      show-size
      variant="outlined"
      @update:model-value="selectFile"
    >
      <template v-slot:prepend-inner>
        <img
          class="me-3"
          height="24"
          src="../../../assets/file/excel.svg"
          width="24"
        />
      </template>
    </v-file-input>

    <b-spreadsheet
      ref="sheet"
      :cols="cols"
      :headers="headers"
      :items="items"
      :styler="styler"
    ></b-spreadsheet>

    <import-invalid-character-error-dialog v-model="invalid_char">
    </import-invalid-character-error-dialog>
  </div>
</template>

<script>
import BSpreadsheet from "../BSpreadsheet.vue";
import ImportInvalidCharacterErrorDialog from "../../spreadsheet/dialog/ImportInvalidCharacterErrorDialog.vue";
import {
  CustomersCsvFormat,
  CustomersCsvHeaders,
  CustomersCsvStyler,
} from "@selldone/core-js/helper/csv/CustomersCsvFormat";
import SpreadsheetMixin from "../../spreadsheet/mixins/SpreadsheetMixin";

const Papa = require("papaparse");

export default {
  name: "BSpreadsheetCustomers",
  mixins: [SpreadsheetMixin],

  components: {
    ImportInvalidCharacterErrorDialog,
    BSpreadsheet,
  },
  props: {
    canSelectFile: {
      type: Boolean,
      default: true,
    },
    totalItems: {},
  },

  data: () => ({
    styler: CustomersCsvStyler,
    cols: CustomersCsvHeaders,

    headers: null,
    items: null,

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

    async generateCustomersJson(
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
      //console.log("dataset_size",dataset_size,this.items);

      // Chunk customers:
      for (let i = 0; i < dataset_size / chunk_size; i++) {
        let is_end = false;

        const start = i * chunk_size;
        let end = (i + 1) * chunk_size;

        if (end >= dataset_size) {
          is_end = true;
          end = dataset_size /*- 1*/;
        }

        console.log("i", i, "start", start, "end", end);

        await callback(
          [this.headers, ...this.items.slice(start, end)],
          is_end ? 100 : (100 * end) / dataset_size,
          is_end,
        );
        //    await new Promise((res) => setTimeout(res, delay));

        if (is_end) break; // Make sure loop ended!
      }
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
          this.showSuccessAlert(null, "Load CSV file completed.");
          this.loadCsvToSheet(results);

          let valid = CustomersCsvFormat.CheckValidFile(this.headers);

          this.$emit("update:valid", valid);
        },
        error: () => {
          this.showErrorAlert(null, "Parsing error!");
          this.$emit("update:valid", false);

          this.file = null;
          this.converted_file = false;
        },
      };

      Papa.parse(this.file, config);
    },
    loadCsvToSheet({ data, errors, meta }) {
      console.log("Start load csv...");
      this.headers = null;
      this.items = null;

      this.$nextTick(() => {
        this.$refs.sheet.goFirst();
      });

      if (!data || !data.length) {
        this.showErrorAlert(null, "Can not read this file!");
      }

      const sheet = data;

      if (sheet.length > 0) this.headers = sheet[0];

      // Validate header:
      if (!this.isValidCustomersCsv(this.headers)) {
        this.items = [];
        this.showErrorAlert(null, "Invalid customers format.");
        return;
      }

      if (sheet.length > 0) this.headers = sheet[0];

      if (sheet.length > 1) {
        this.items = sheet.slice(1).filter((it) => {
          // AUTO FIX 1 : Filter empty rows!
          //console.log('filter',it)
          return it.length > 1 && it.some((x) => x.length); // Remove empty rows (without user name!)
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

    isValidCustomersCsv(headers) {
      return (
        headers.includes("Name") &&
        (headers.includes("Phone") || headers.includes("Email"))
      );
    },
  },
};
</script>

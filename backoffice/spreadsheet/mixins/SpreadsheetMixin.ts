import { defineComponent } from "vue";
import { RouteRecordRaw } from "vue-router";
import { FileFormatConverterOnline } from "@selldone/components-vue/utils/converters/FileFormatConverterOnline.ts";
import { TemporaryDataHelper } from "../../../utils/temporary-data/TemporaryDataHelper";
import BSpreadsheetConversionProgress from "../conversion/BSpreadsheetConversionProgress.vue";

export default defineComponent({
  components: { BSpreadsheetConversionProgress },
  emits: ["update:valid", "update:totalItems", "update:converting"],
  data() {
    return {
      file: null as File | null,
      converted_file: false,
      converting_file: false,
      conversion_version: 0,
      invalid_char: false,
      preventClearTemporaryDataFlag: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL(): boolean {
      // Assuming this.$route and this.$route.matched are available in your component context.
      // Replace with appropriate types or methods to access route data in your application.
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some(
          (record: RouteRecordRaw) => record.meta?.vendor,
        )
      );
    },

    temporary_data_pass(): any {
      return TemporaryDataHelper.Get(this);
    },
  },

  watch: {
    "$route.params.shop_id"() {
      this.resetToDefault();
    },
    "$route.params.vendor_id"() {
      this.resetToDefault();
    },
    converting_file(value: boolean) {
      this.$emit("update:converting", value);
    },
    temporary_data_pass(newVal: any) {
      const { file, converted_file = false } = newVal || {};

      this.conversion_version++;
      this.converting_file = false;
      this.converted_file = converted_file;

      if (file) {
        this.file = file;
        this.parseFile();
      } else {
        this.resetToDefault();
      }
    },
  },

  methods: {
    selectFile(files: FileList) {
      const file = Array.isArray(files) ? files[0] : files;
      this.resetToDefault();
      this.file = file || null;
      this.input_files = file || null;
      if (file) return this.parseOrConvertFile();
    },

    async parseOrConvertFile() {
      const version = ++this.conversion_version;
      this.converting_file = false;
      this.invalid_char = false;

      if (
        this.file &&
        (this.file.name.toLowerCase().endsWith(".xls") ||
          this.file.name.toLowerCase().endsWith(".xlsx"))
      ) {
        const selectedFile = this.file;
        const { shop_id, vendor_id } = this.$route.params;
        this.converted_file = false;
        this.headers = null;
        this.items = null;
        this.$emit("update:valid", false);
        this.converting_file = true;
        const _callback = (data: File) => {
          // Replaced files or a changed shop/vendor must not restore an old preview.
          if (
            version !== this.conversion_version ||
            this.file !== selectedFile ||
            this.$route.params.shop_id !== shop_id ||
            this.$route.params.vendor_id !== vendor_id
          )
            return;
          this.file = data;
          this.converted_file = true;
          this.parseFile();
        };

        try {
          if (this.IS_VENDOR_PANEL) {
            await FileFormatConverterOnline.VendorConvertToCsv(
              this,
              vendor_id,
              selectedFile,
              _callback,
            );
          } else {
            await FileFormatConverterOnline.ConvertToCsv(
              this,
              shop_id,
              selectedFile,
              _callback,
            );
          }
        } finally {
          if (version === this.conversion_version) this.converting_file = false;
        }
      } else {
        this.parseFile();
      }
    },

    resetToDefault() {
      this.conversion_version++;
      this.converting_file = false;
      this.file = null;
      this.input_files = null;
      this.converted_file = false;
      this.invalid_char = false;
      this.headers = null;
      this.items = null;
      this.preventClearTemporaryDataFlag = false;
      this.$emit("update:valid", false);
    },

    parseFile() {
      throw new Error("parseFile() must be implemented in the component!");
    },

    preventClearTemporaryData() {
      this.preventClearTemporaryDataFlag = true;
    },
  },

  created() {
    const { file, converted_file = false } =
      TemporaryDataHelper.Get(this) || {};
    this.converted_file = converted_file;

    if (file) {
      this.file = file;
      this.parseFile();
    }
  },

  beforeUnmount() {
    this.conversion_version++;
    this.converting_file = false;
    this.$emit("update:converting", false);
    this.file = null;
    if (!this.preventClearTemporaryDataFlag) {
      TemporaryDataHelper.Clear(this);
    }
  },
});

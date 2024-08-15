import { defineComponent } from "vue";
import { RouteRecordRaw } from "vue-router";
import { FileFormatConverterOnline } from "@selldone/core-js/helper/converters/FileFormatConverterOnline";
import { TemporaryDataHelper } from "../../../utils/temporary-data/TemporaryDataHelper";

export default defineComponent({
  data() {
    return {
      file: null as File | null,
      converted_file: false,
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
    temporary_data_pass(newVal: any) {
      const { file, converted_file = false } = newVal || {};

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
      this.file = Array.isArray(files) ? files[0] : files;
      this.parseOrConvertFile();
    },

    parseOrConvertFile() {
      this.invalid_char = false;

      if (
        this.file &&
        (this.file.name.toLowerCase().endsWith(".xls") ||
          this.file.name.toLowerCase().endsWith(".xlsx"))
      ) {
        const _callback = (data: File) => {
          this.file = data;
          this.converted_file = true;
          this.parseFile();
        };

        if (this.IS_VENDOR_PANEL) {
          FileFormatConverterOnline.VendorConvertToCsv(
            this,
            this.$route.params.vendor_id,
            this.file,
            _callback,
          );
        } else {
          FileFormatConverterOnline.ConvertToCsv(
            this,
            this.$route.params.shop_id,
            this.file,
            _callback,
          );
        }
      } else {
        this.parseFile();
      }
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
    if (!this.preventClearTemporaryDataFlag) {
      TemporaryDataHelper.Clear(this);
    }
  },
});

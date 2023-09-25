<template>
  <div class="flex items-center justify-center w-full h-screen text-center">
    <div
      class="pa-6 dashed border-gray-300 rounded-18px d-flex flex-column"
      style="min-height: inherit"
      @dragover="dragover"
      @dragleave="dragleave"
      @dragend="dragleave"
      @drop="drop"
    >
      <v-file-input
        :chips="!!multiple"
        :multiple="multiple"
        class="w-px h-px opacity-0 overflow-hidden absolute flex-grow-0"
        @change="(files) => processFile(files, '')"
        :accept="extension"
        flat
        solo
        :label="label"
        v-model="filelist"
        background-color="transparent"
      />

      <v-spacer></v-spacer>
      <div>
        <v-icon size="64" color="#fff" class="m-2">{{icon}}</v-icon>
      </div>
      <div>Drop landing page file here or click top input.</div>
      <v-spacer></v-spacer>
      <template v-if="multiple">
        <h3 class="display-3 font-weight-black mt-3">
          <span class="text-success">{{ uploaded_count }}</span>
          <span class="mx-1 text-muted font-weight-thin">/</span>
          {{ accepted_count }}
        </h3>
        <v-progress-linear
          color="light-green"
          class="my-3"
          height="10"
          :value="(100 * uploaded_count) / accepted_count"
          striped
          rounded
        ></v-progress-linear>

        <v-btn
          v-if="failed_count"
          x-large
          depressed
          dark
          color="red"
          @click="resendFailed"
          >Resend {{ failed_count }} failed files</v-btn
        >

        <v-btn depressed small color="blue" dark @click="resetCount"
          ><v-icon>clear</v-icon> Reset</v-btn
        >
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "DropZone",
  delimiters: ["${", "}"], // Avoid Twig conflicts

  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
    extension: {}, //'.csv'
    maxFileSize: { default: 20 * 1024 * 1024 }, //20MB
    label: {},

    acceptedFiles: {},
    uploadedFiles: {},
    failedFiles: {},
    icon:{default:'file_present'},
    hint:{}
  },
  data: () => ({
    filelist: [], // Store our uploaded files
  }),

  computed: {
    accepted_count() {
      return this.acceptedFiles.length;
    },
    uploaded_count() {
      return this.uploadedFiles.length;
    },
    failed_count() {
      return this.failedFiles.length;
    },
  },

  methods: {
    resetCount() {
      this.$emit("update:acceptedFiles", []);
      this.$emit("update:uploadedFiles", []);
      this.$emit("update:failedFiles", []);
    },
    /*  onChange() {
      const accepted = [];
      this.filelist.forEach((file) => {
        if (
          this.extension &&
          !file.name.toLowerCase().endsWith(this.extension)
        ) {
          this.showErrorAlert(
            null,
            `Acceptable file format is ${this.extension}!`
          );
          return;
        }
        if (file.size > this.maxFileSize) {
          this.showErrorAlert(
            null,
            `Maximum file size limited to ${Math.round(
              maxFileSize / (1024 * 1024)
            )} MB!`
          );
          return;
        }
        accepted.push(file);
      });


      if (this.multiple) this.$emit("select:files", {files:this.filelist,local_folder:this.local_folder});
      else
        this.$emit(
          "select:file",
          this.filelist.length ? this.filelist[0] : null
        );
    },
*/
    dragover(event) {
      event.preventDefault();
      // Add some visual fluff to show the user can drop its files
      if (!event.currentTarget.classList.contains("bg-green-300")) {
        event.currentTarget.classList.remove("bg-gray-100");
        event.currentTarget.classList.add("bg-green-300");
      }
    },
    dragleave(event) {
      // Clean up
      event.currentTarget.classList.add("bg-gray-100");
      event.currentTarget.classList.remove("bg-green-300");
    },
    drop(event) {
      // Clean up
      event.currentTarget.classList.add("bg-gray-100");
      event.currentTarget.classList.remove("bg-green-300");

      event.preventDefault();

      // if directory support is available
      if (event.dataTransfer && event.dataTransfer.items) {
        console.log("drop > folder > dataTransfer:", event.dataTransfer);

        const items = event.dataTransfer.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i].webkitGetAsEntry();

          if (item) {
            this.addDirectory(item, "");
          }
        }
        return;
      }

      if (event.dataTransfer.files && event.dataTransfer.files.length)
        this.processFile(event.dataTransfer.files, "");
    },

    processFile(files, local_folder) {
      if (!files) return;

      console.log("processFile", files);

      if (!Array.isArray(files)) files = [files];
      //  this.onChange(); // Trigger the onChange event manually

      const accepted = [];
      files.forEach((file) => {
        if (
          this.extension &&
          !file.name.toLowerCase().endsWith(this.extension)
        ) {
          this.showErrorAlert(
            null,
            `Acceptable file format is ${this.extension}!`
          );
          return;
        }
        if (file.size > this.maxFileSize) {
          this.showErrorAlert(
            null,
            `Maximum file size limited to ${Math.round(
              maxFileSize / (1024 * 1024)
            )} MB!`
          );
          return;
        }
        accepted.push(file);
      });

      if (this.multiple)
        this.$emit("select:files", {
          files: accepted,
          local_folder: local_folder,
        });
      else this.$emit("select:file", files.length ? files[0] : null);
    },

    resendFailed() {
      const out = {};
      this.failedFiles.forEach(({ file, local_folder }) => {
        if (!out[local_folder]) out[local_folder] = [];
        out[local_folder].push(file);
      });

      Object.keys(out).forEach((key) => {
        this.$emit("select:files", {
          files: out[key],
          local_folder: key, // Set local_folder at push failed files to failedFiles
        });
      });
    },

    addDirectory(item, local_folder) {
      const _this = this;
      if (item.isDirectory) {
        console.log("addDirectory fullPath:", item.fullPath);

        const directoryReader = item.createReader();
        directoryReader.readEntries((entries) => {
          entries.forEach((entry) => {
            _this.addDirectory(entry, item.fullPath);
          });
        });
      } else {
        item.file((file) => {
          _this.processFile([file], local_folder);
        });
      }
    },
  },
};
</script>

<style scoped>
.bg-green-300 {
  background-color: #00a89a;
  color: #fff;
}
</style>

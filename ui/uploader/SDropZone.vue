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
  <div class="d-flex items-center justify-center w-full text-center">
    <div
      class="pa-6 dashed border-gray-300 rounded-18px d-flex flex-column flex-grow-1"
      style="min-height: inherit"
      @dragend="dragleave"
      @dragleave="dragleave"
      @dragover="dragover"
      @drop="drop"
    >
      <v-file-input
        v-model="filelist"
        :accept="extension"
        :chips="!!multiple"
        :label="label"
        :multiple="multiple"
        bg-color="transparent"
        class="w-px h-px opacity-0 overflow-hidden absolute flex-grow-0"
        flat
        variant="solo"
        @update:model-value="(files) => processFile(files, '')"
      />

      <v-spacer></v-spacer>
      <div>
        <v-icon class="m-2" color="#fff" size="64">{{ icon }}</v-icon>
      </div>
      <div>Drop landing page file here or click top input.</div>
      <v-spacer></v-spacer>
      <template v-if="multiple">
        <h3 class="text-h2 font-weight-black mt-3">
          <span class="text-success">{{ uploaded_count }}</span>
          <span class="mx-1 text-muted font-weight-thin">/</span>
          {{ accepted_count }}
        </h3>
        <v-progress-linear
          :model-value="(100 * uploaded_count) / accepted_count"
          class="my-3"
          color="light-green"
          height="10"
          rounded
          striped
        ></v-progress-linear>

        <v-btn
          v-if="failed_count"
          color="red"
          size="x-large"
          variant="flat"
          @click="resendFailed"
          >Resend {{ failed_count }} failed files
        </v-btn>

        <v-btn color="blue" size="small" variant="flat" @click="resetCount">
          <v-icon>clear</v-icon>
          Reset
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SDropZone",
  emits: [
    "select:file",
    "select:files",
    "update:acceptedFiles",
    "update:uploadedFiles",
    "update:failedFiles",
  ],
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
    icon: { default: "file_present" },
    hint: {},
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
          NotificationService.showErrorAlert(
            null,
            `Acceptable file format is ${this.extension}!`,
          );
          return;
        }
        if (file.size > this.maxFileSize) {
          NotificationService.showErrorAlert(
            null,
            `Maximum file size limited to ${Math.round(
              maxFileSize / (1024 * 1024),
            )} MB!`,
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

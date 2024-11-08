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
  <div class="uploader-container-file mx-auto p-2">
    <file-pond
      ref="pond"
      :check-validity="true"
      :data-max-file-size="maxFileSize"
      :files="file"
      :label-idle="`<p class='text-dark'>${label}</p>`"
      :max-files="1"
      :maxFileSize="maxFileSize"
      :server="server_credential"
      allow-multiple="false"
      class="mx-auto pointer-pointer"
      credits="false"
      name="file"
      style="min-height: 84px"
      @error="handleFilePondError"
      @processfile="handleProcessFile"
    />
    <!-- NOT WORK! invalid mine type in usdz and glf files! :accepted-file-types="acceptedFileTypes" -->
    <!-- NOT WORK! accepted-file-types=".gltf, .glb" -->

    <p class="small file-size-limit mx-2">
      {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
    </p>
  </div>
</template>

<script lang="ts">
import FilePondLoader from "@selldone/components-vue/plugins/filepond/FilePondLoader.ts";

export default {
  name: "SArModelUploader",
  components: {
    FilePond: FilePondLoader.loadFilePondComponent(),
  },
  props: {
    label: {
      required: false,
      type: String,
    },
    server: {
      required: false,
      type: String,
    },

    maxFileSize: {
      required: false,
      type: String,
      default: "2MB",
    },
    ar: {
      required: false,
    },
  },

  data: () => ({
    file: null,
  }),
  computed: {
    server_credential() {
      const token = document.head.querySelector('meta[name="csrf-token"]');

      return {
        url: this.server,
        process: {
          method: "POST",
          withCredentials: true,

          headers: {
            "X-CSRF-TOKEN": token ? token.content : "",
          },
        },
        revert: null,
      };
    },
  },

  created() {},

  methods: {
    handleFilePondError(error) {
      this.showErrorAlert(null, error.body);
      //  console.error('handleFilePondError',error)
    },
    handleProcessFile: function (error, file, ssss) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        console.log("done", response.files.path);
        this.$emit("new-path", response.files.path);
        this.$emit("update:ar", response.ar);

        // this.$emit("created", response.files.app_file);

        return true;
      } else {
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep(.uploader-container-file) {
  .filepond--drop-label {
    p {
      margin: 0 !important;
      font-weight: 700;

      color: #777 !important;
    }
  }
}
</style>

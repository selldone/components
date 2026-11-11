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
  <div :class="modern ? 's-ar-model-uploader text-start' : 'uploader-container-file mx-auto p-2'">
    <template v-if="modern">
      <v-btn v-if="hasFile" class="sd-modern-button sd-modern-button--inline s-ar-model-uploader__replace" color="primary" variant="text" prepend-icon="swap_horiz" :disabled="!pond_ready || disabled || upload_active" @click="browseModel">{{ label }}</v-btn>
      <div v-else class="s-ar-model-uploader__drop" @dragover.prevent @drop.prevent="dropModel">
        <v-icon icon="cloud_upload" size="19" aria-hidden="true" />
        <div><strong>{{ $t('product_ar.drop_file', { format: '.' + format.toLowerCase() }) }}</strong><small>{{ $t('product_ar.file_limit', { size: maxFileSize }) }}</small></div>
        <v-btn class="sd-modern-button" :class="{ 'sd-modern-button--primary': format === 'GLB' }" :color="format === 'GLB' ? 'primary' : undefined" :variant="format === 'GLB' ? 'flat' : 'outlined'" prepend-icon="add" :disabled="!pond_ready || disabled || upload_active" @click="browseModel">{{ label }}</v-btn>
      </div>
    </template>
    <file-pond
      ref="pond"
      :check-validity="true"
      :data-max-file-size="maxFileSize"
      :files="file"
      :disabled="disabled"
      :label-idle="`<p class='text-dark'>${label}</p>`"
      :max-files="1"
      :maxFileSize="maxFileSize"
      :server="server_credential"
      :allow-multiple="false"
      :class="modern ? { 's-ar-model-uploader__pond--empty': !has_files } : 'mx-auto pointer-pointer'"
      credits="false"
      name="file"
      :style="modern ? undefined : { minHeight: '84px' }"
      @init="pond_ready = true"
      @error="handleFilePondError"
      @processfile="handleProcessFile"
      @addfilestart="startUpload"
      @addfile="modern && refreshActivity()"
      @processfilestart="startUpload"
      @processfileabort="refreshActivity"
      @removefile="refreshActivity"
    />
    <!-- NOT WORK! invalid mine type in usdz and glf files! :accepted-file-types="acceptedFileTypes" -->
    <!-- NOT WORK! accepted-file-types=".gltf, .glb" -->

    <p v-if="!modern" class="small file-size-limit mx-2">
      {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
    </p>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import FilePondLoader from "@selldone/components-vue/plugins/filepond/FilePondLoader.ts";

export default {
  name: "SArModelUploader",
  emits: ["new-path", "update:ar", "busy"],
  components: {
    FilePond: FilePondLoader.loadFilePondComponent(),
  },
  props: {
    modern: Boolean,
    hasFile: Boolean,
    format: { type: String, default: 'GLB' },
    disabled: Boolean,
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
    active: true,
    pond_ready: false,
    upload_active: false,
    has_files: false,
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
  beforeUnmount() {
    this.active = false;
    this.$emit("busy", false);
  },

  methods: {
    browseModel() {
      if (!this.active || !this.pond_ready || this.disabled || this.upload_active) return;
      this.$refs.pond?.browse();
    },
    dropModel(event) {
      if (!this.active || !this.pond_ready || this.disabled || this.upload_active) return;
      const file = event.dataTransfer?.files?.[0];
      // FilePond handles size validation; the server validates GLB/USDZ despite unreliable browser MIME values.
      if (file) this.$refs.pond?.addFile(file).catch(() => {});
    },
    startUpload() {
      this.upload_active = true;
      this.$emit('busy', true);
      if (this.modern) this.refreshActivity();
    },
    refreshActivity() {
      if (!this.modern) { this.$emit('busy', false); return; }
      this.$nextTick(() => {
        if (!this.active) return;
        const files = this.$refs.pond?.getFiles?.() || [];
        this.has_files = files.length > 0;
        this.upload_active = files.some(file => [1, 3, 7, 9].includes(file.status));
        this.$emit('busy', this.upload_active);
      });
    },
    handleFilePondError(error) {
      this.upload_active = false;
      this.$emit("busy", false);
      NotificationService.showErrorAlert(null, error.body);
      if (this.modern) this.refreshActivity();
      //  console.error('handleFilePondError',error)
    },
    handleProcessFile: function (error, file, ssss) {
      try {
        if (!error) {
          let response = JSON.parse(file.serverId);
          console.log("done", response.files.path);
          this.$emit("new-path", response.files.path);
          this.$emit("update:ar", response.ar);

          // this.$emit("created", response.files.app_file);

          return true;
        }
      } finally {
        this.upload_active = false;
        this.$emit("busy", false);
        if (this.modern) this.refreshActivity();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.s-ar-model-uploader {
  position: relative;
  min-width: 0;
  &__drop { display: flex; align-items: center; gap: 9px; padding: 11px; margin-block: 3px 2px; border: 1px dashed var(--sd-modern-border); border-radius: 9px; background: var(--sd-modern-inset); }
  &__drop > .v-icon { flex-shrink: 0; color: var(--sd-modern-muted); }
  &__drop > div { flex: 1; min-width: 0; }
  &__drop strong { display: block; font-size: 12px; line-height: 19px; font-weight: 400; }
  &__drop small { display: block; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  &__drop .v-btn { flex-shrink: 0; }
  &__replace { margin-inline-start: 32px; }
  :deep(.filepond--root) { margin: 10px 0 0; font-family: inherit; }
  :deep(.filepond--panel-root), :deep(.filepond--item-panel) { background: var(--sd-modern-inset); }
  :deep(.filepond--file) { color: rgb(var(--v-theme-on-surface)); }
  :deep(.filepond--drop-label) { display: none; }
  :deep(.filepond--list-scroller) { margin-block-start: 0; }
  :deep(.s-ar-model-uploader__pond--empty) { position: absolute; width: 100%; height: 0 !important; min-height: 0; margin: 0; visibility: hidden; pointer-events: none; }
  @media (max-width: 680px) {
    &__drop { flex-wrap: wrap; }
    &__drop .v-btn { width: 100%; }
  }
}
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

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
  <div :class="{ 's-video-uploader--modern text-start': modern }">
    <div v-if="modern" class="s-video-uploader__drop" @dragover.prevent @drop.prevent="dropVideo">
      <v-icon icon="cloud_upload" size="24" aria-hidden="true" />
      <div class="s-video-uploader__drop-copy">
        <strong>{{ $t('global.video_uploader.drop') }}</strong>
        <small>{{ $t('global.video_uploader.limit', { size: maxFileSize }) }}</small>
      </div>
      <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat" prepend-icon="add" :disabled="!pond_ready || disabled || upload_active" @click="browseVideo">
        {{ $t('global.video_uploader.choose') }}
      </v-btn>
    </div>
    <!-- --------- Compact mode --------- -->
    <v-list-item v-if="!modern && on_compact" class="text-start py-5" lines="two">
      <template v-slot:prepend>
        <a :href="video" target="_blank" class="me-3">
          <v-avatar class="border pa-1 bg-white" rounded="lg" size="64">
            <v-sheet
              style="height: 100%; width: 100%; border-radius: 0.6em"
              color="red"
              class="d-flex align-center justify-center elevation-5"
            >
              <v-icon size="x-large">smart_display</v-icon>
            </v-sheet>
          </v-avatar>
        </a>
      </template>
      <v-list-item-title>
        <b>{{ label }}</b>
      </v-list-item-title>
      <v-list-item-subtitle v-if="video" class="small"
        >{{ video }}
      </v-list-item-subtitle>

      <template v-slot:append>
        <v-btn
          v-if="clearable && last_video"
          class="ms-1"
          color="red"
          icon
          title="Clear Video"
          variant="text"
          @click.stop="
            () => {
              last_video = null;
              $emit('onClear');
            }
          "
        >
          <v-icon>close</v-icon>
        </v-btn>

        <v-btn
          class="ms-1"
          icon
          title="Edit Video"
          variant="text"
          @click="
            force_edit = !force_edit;
            last_video = null;
          "
        >
          <v-icon>edit</v-icon>
        </v-btn>
      </template>
    </v-list-item>

    <!-- --------- Normal mode --------- -->

    <v-expand-transition>
      <div v-if="modern || !on_compact">
        <div v-if="!modern" class="label-top" v-html="label"></div>

        <div
          :class="[
            modern ? 's-video-uploader__transport' : 'uploader-container mx-auto rounded-18px overflow-hidden',
            !modern && {
              dense: dense,
              dark: dark,
              disabled: disabled,
              'has-value': true,
              ctrl: ctrl,
            },
            !modern && rounded ? `rounded-${rounded}` : '',
          ]"
          :style="modern ? undefined : {
            minHeight: minHeight,
            border: border ? 'dashed thin #ddd' : undefined,
          }"
        >
          <v-slide-y-transition v-if="!modern">
            <div class="small">
              <v-icon class="me-1" size="large">smart_display</v-icon>
              {{ last_video }}
            </div>
          </v-slide-y-transition>

          <file-pond
            v-if="modern || !clearable || !last_video"
            ref="pond"
            :accepted-file-types="acceptedFileTypes"
            :allow-multiple="false"
            :files="logo"
            :max-files="maxFiles"
            :maxFileSize="maxFileSize"
            :name="paramName"
            :server="server_credential"
            :disabled="disabled"
            check-validity="true"
            :class="modern ? { 's-video-uploader__pond--empty': !has_files } : 'pointer-pointer fadeIn filepond-style'"
            credits="false"
            :label-idle="idleLabel || 'Upload video file'"
            :style="modern ? undefined : { minHeight: '84px' }"
            @init="pond_ready = true"
            @error="handleFilePondError"
            @processfile="handleProcessFile"
            @addfilestart="refreshActivity"
            @addfile="refreshActivity"
            @removefile="refreshActivity"
            @processfilestart="refreshActivity"
            @processfileabort="refreshActivity"
          />

          <p v-if="!modern" class="small file-size-limit">
            {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
          </p>

          <v-btn
            v-if="!modern && clearable && last_video"
            class="absolute-top-end m-2 z2"
            icon
            size="small"
            variant="text"
            @click.stop="
              () => {
                last_video = null;
                $emit('onClear');
              }
            "
          >
            <v-icon>close</v-icon>
          </v-btn>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import FilePondLoader from "@selldone/components-vue/plugins/filepond/FilePondLoader.ts";

export default {
  name: "SVideoUploader",
  components: {
    FilePond: FilePondLoader.loadFilePondComponent(),
  },
  emits: ["response", "new-path", "new-url", "onClear", "new-item", "activity"],
  props: {
    modern: { type: Boolean, default: false },
    idleLabel: String,
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
      default: "5MB",
    },

    video: {
      required: false,
      type: String,
    },

    paramName: {
      required: false,
      type: String,
      default: "video",
    },

    maxFiles: {
      required: false,
      type: Number,
      default: 1,
    },

    allowMultiple: {
      required: false,
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },

    dense: {
      type: Boolean,
      default: false,
    },

    dark: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    autoCompact: {
      type: Boolean,
      default: false,
    },

    minHeight: { default: "240px" },
    border: Boolean,
    rounded: {
      default: "xl",
    },
  },

  data: () => ({
    active: true,
    pond_ready: false,
    has_files: false,
    upload_active: false,
    logo: null,

    last_video: null,

    ctrl: false,
    key_listener_keydown: null,
    key_listener_keyup: null,

    force_edit: false, // Force show upload (in auto compact mode!)
  }),

  computed: {
    on_compact() {
      return this.autoCompact && this.last_video && !this.force_edit; //
    },

    acceptedFileTypes() {
      return [
        "video/mp4",
        "video/m4v",
        "video/mkv",
        "video/3gp",
        "video/avi",
        "video/wmv",
        "video/mov",
        "video/ogg",
        "video/webm",
      ];
    },

    server_credential() {
      const token = document.head.querySelector('meta[name="csrf-token"]');

      return {
        url: this.server,
        process: {
          method: "POST",
          withCredentials: true,

          headers: {
            "X-CSRF-TOKEN": token ? token.content : "",
            Authorization:
              window.axios.defaults.headers.common["Authorization"], // fix upload image in chrome!
          },
        },
        revert: null,
      };
    },
  },
  watch: {
    video(video) {
      this.last_video = video;
    },
  },
  created() {
    this.last_video = this.video;
  },

  mounted() {},

  beforeUnmount() {
    this.active = false;
    this.$emit('activity', false);
  },

  methods: {
    browseVideo() {
      if (!this.pond_ready || this.disabled || this.upload_active) return;
      this.$refs.pond?.browse();
    },
    dropVideo(event) {
      if (!this.pond_ready || this.disabled || this.upload_active) return;
      const file = event.dataTransfer?.files?.[0];
      // FilePond owns type/size validation and reports rejected files through its error event.
      if (file) this.$refs.pond?.addFile(file).catch(() => {});
    },
    refreshActivity() {
      this.$nextTick(() => {
        if (!this.active) return;
        const files = this.$refs.pond?.getFiles?.() || [];
        this.has_files = files.length > 0;
        this.upload_active = files.some(file => [1, 3, 7, 9].includes(file.status));
        this.$emit('activity', this.upload_active);
      });
    },
    handleFilePondError(error) {
      this.refreshActivity();
      NotificationService.showErrorAlert(null, error.body);
      //  console.error('handleFilePondError',error)
    },

    handleProcessFile: function (error, file) {
      this.refreshActivity();
      if (!error) {
        let response = JSON.parse(file.serverId);
        this.$emit("response", response);

        if (Array.isArray(response.files)) {
          response.files.forEach((file) => {
            console.log("done", file.path);
            this.$emit("new-path", file.path);
            this.$emit("new-url", file.url);

            if (file.item) {
              // Database record
              this.$emit("new-item", file.item);
            }
          });
        } else {
          console.log("done", response.files.path);
          this.$emit("new-path", response.files.path);
          this.$emit("new-url", response.files.url);

          if (response.files.item) {
            // Database record
            this.$emit("new-item", response.files.item);
          }
        }

        return true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.s-video-uploader--modern {
  min-width: 0;
  .s-video-uploader__drop { display: flex; align-items: center; gap: 12px; padding: 15px; border: 1px dashed var(--sd-modern-border, rgba(var(--v-theme-on-surface), .16)); border-radius: 10px; background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), .03)); }
  .s-video-uploader__drop > .v-icon { flex-shrink: 0; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); }
  .s-video-uploader__drop-copy { flex: 1; min-width: 0; }
  .s-video-uploader__drop-copy strong { display: block; font-size: 13px; line-height: 21px; font-weight: 500; }
  .s-video-uploader__drop-copy small { display: block; margin-block-start: 2px; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); font-size: 11px; line-height: 18px; }
  .s-video-uploader__drop .v-btn { flex-shrink: 0; }
  .s-video-uploader__transport { position: relative; }
  .s-video-uploader__transport :deep(.filepond--root) { margin: 12px 0 0; font-family: inherit; }
  .s-video-uploader__transport :deep(.filepond--panel-root) { background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), .03)); border-radius: 10px; }
  .s-video-uploader__transport :deep(.filepond--item-panel) { background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), .03)); }
  .s-video-uploader__transport :deep(.filepond--file) { color: rgb(var(--v-theme-on-surface)); }
  .s-video-uploader__transport :deep(.filepond--drop-label) { display: none; }
  .s-video-uploader__transport :deep(.filepond--list-scroller) { margin-block-start: 0; }
  .s-video-uploader__transport :deep(.s-video-uploader__pond--empty) { position: absolute; width: 100%; height: 0 !important; min-height: 0; margin: 0; visibility: hidden; pointer-events: none; }
  @media (max-width: 560px) {
    .s-video-uploader__drop { flex-wrap: wrap; padding: 13px; gap: 10px; }
    .s-video-uploader__drop .v-btn { width: 100%; }
  }
}
</style>

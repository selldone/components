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
  <div
    :class="{ 's-image-uploader--thumbnail text-start': thumbnail, 's-image-uploader--modern': modern, 's-image-uploader--queue text-start': compactQueue }"
    @focusin="thumbnail && (focused = true)"
    @focusout="thumbnail && (focused = false)"
  >
    <div v-if="compactQueue" class="s-image-uploader__queue">
      <div class="s-image-uploader__drop" @dragover.prevent @drop.prevent="dropQueue">
        <v-icon icon="cloud_upload" size="24" aria-hidden="true" />
        <div class="s-image-uploader__drop-copy">
          <strong>{{ $t('global.image_uploader.gallery.drop') }}</strong>
          <small>{{ $t('global.image_uploader.gallery.limit', { size: maxFileSize }) }} · {{ $t(noSvg ? 'global.image_uploader.queue.formats_no_svg' : 'global.image_uploader.gallery.formats') }}</small>
        </div>
        <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="flat" prepend-icon="add" :disabled="!queueCanBrowse" @click="browseQueue">
          {{ chooseLabel || $t('global.image_uploader.gallery.choose') }}
        </v-btn>
      </div>
      <p v-if="queue_error" class="s-image-uploader__queue-error" role="alert">{{ queue_error }}</p>
      <ul v-if="queue_files.length" class="s-image-uploader__files" :aria-label="$t('global.image_uploader.queue.title')">
        <li v-for="file in queue_files" :key="file.id" class="s-image-uploader__file" :class="{ 's-image-uploader__file--error': file.state === 'error' }" :aria-busy="['loading', 'queued', 'uploading'].includes(file.state)">
          <div class="s-image-uploader__file-preview">
            <img v-if="file.preview" :src="file.preview" alt="" />
            <v-icon v-else icon="image" size="22" aria-hidden="true" />
          </div>
          <div class="s-image-uploader__file-info">
            <span class="s-image-uploader__filename" dir="auto">{{ file.name }}<v-tooltip activator="parent" :text="file.name" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" /></span>
            <p class="s-image-uploader__file-status" :role="file.state === 'error' ? 'alert' : 'status'" :aria-live="file.state === 'uploading' ? 'off' : 'polite'">
              <v-icon v-if="file.state === 'error' || file.state === 'success'" :icon="file.state === 'error' ? 'error_outline' : 'check_circle_outline'" :color="file.state === 'error' ? 'error' : 'success'" size="14" aria-hidden="true" />
              {{ queueStatus(file) }}<span v-if="file.size"> · {{ queueFileSize(file.size) }}</span>
            </p>
            <v-progress-linear v-if="['loading', 'queued', 'uploading'].includes(file.state)" class="s-image-uploader__file-progress" :model-value="file.progress === null ? undefined : file.progress * 100" :indeterminate="file.progress === null" :aria-label="$t('global.image_uploader.queue.uploading')" height="3" color="primary" rounded />
          </div>
          <div class="s-image-uploader__file-actions">
            <v-btn v-if="file.state === 'error' && file.retryable && !deferUpload" class="sd-modern-button sd-modern-button--small" variant="outlined" prepend-icon="refresh" :disabled="disabled" @click="retryQueueFile(file, $event)">{{ $t('global.image_uploader.queue.retry') }}</v-btn>
            <v-btn class="sd-modern-icon-button" data-queue-remove icon variant="text" :disabled="disabled" :aria-label="$t(file.state === 'success' ? 'global.image_uploader.queue.dismiss' : file.state === 'uploading' ? 'global.image_uploader.queue.cancel' : 'global.image_uploader.queue.remove')" @click="removeQueueFile(file)">
              <v-icon icon="close" size="16" aria-hidden="true" />
              <v-tooltip activator="parent" :text="$t(file.state === 'success' ? 'global.image_uploader.queue.dismiss' : file.state === 'uploading' ? 'global.image_uploader.queue.cancel' : 'global.image_uploader.queue.remove')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" />
            </v-btn>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="thumbnail" class="s-image-uploader__thumbnail">
      <div class="s-image-uploader__thumbnail-heading">
        <slot name="thumbnail-heading"
          ><span v-if="label">{{ label }}</span></slot
        >
      </div>
      <button
        type="button"
        class="s-image-uploader__thumbnail-pick"
        :disabled="
          disabled ||
          !thumbnail_ready ||
          thumbnail_loading ||
          thumbnail_processing
        "
        :aria-label="chooseLabel || $t('global.actions.upload')"
        @click="browseThumbnail"
        @dragover.prevent
        @drop.prevent="dropThumbnail"
        @focus="focused = true"
      >
        <span class="s-image-uploader__thumbnail-well">
          <img
            v-if="thumbnailSource"
            :src="thumbnailSource"
            :alt="label || ''"
          />
          <v-icon v-else icon="add_a_photo" size="23" aria-hidden="true" />
        </span>
        <v-tooltip
          activator="parent"
          :text="chooseLabel || $t('global.actions.upload')"
          location="top"
          :open-on-focus="true"
          content-class="sd-modern-tooltip text-start"
        />
      </button>
      <div class="s-image-uploader__thumbnail-caption">
        <p v-if="hint" class="s-image-uploader__thumbnail-hint">{{ hint }}</p>
        <p v-else class="s-image-uploader__thumbnail-hint">
          {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
        </p>
        <p
          v-if="thumbnailFilename"
          class="s-image-uploader__thumbnail-name"
          :title="thumbnailFilename"
        >
          {{ thumbnailFilename }}
        </p>
        <div
          v-if="thumbnailSource || thumbnail_file_id"
          class="s-image-uploader__thumbnail-actions"
        >
          <v-btn
            class="sd-modern-button sd-modern-button--small s-image-uploader__thumbnail-edit"
            variant="text"
            :disabled="
              disabled ||
              !thumbnail_ready ||
              thumbnail_loading ||
              thumbnail_processing
            "
            @click="browseThumbnail"
            ><v-icon icon="edit" size="13" aria-hidden="true" />{{
              editLabel || $t("global.actions.edit")
            }}</v-btn
          >
          <v-tooltip
            v-if="thumbnail_file_id || clearable"
            :text="removeLabel || $t('global.actions.remove_image')"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button s-image-uploader__thumbnail-remove"
                icon
                variant="text"
                :disabled="disabled || !thumbnail_ready || thumbnail_processing"
                :aria-label="removeLabel || $t('global.actions.remove_image')"
                @click="removeThumbnail"
                ><v-icon
                  icon="delete_outline"
                  size="16"
                  aria-hidden="true" /></v-btn></template
          ></v-tooltip>
        </div>
        <p
          v-if="thumbnail_error"
          class="s-image-uploader__thumbnail-status"
          role="alert"
        >
          {{ thumbnail_error }}
        </p>
        <p
          v-else-if="thumbnail_loading || thumbnail_processing"
          class="s-image-uploader__thumbnail-status"
          role="status"
        >
          {{
            $t(
              thumbnail_processing
                ? "global.commons.uploading"
                : "global.commons.loading",
            )
          }}<span v-if="thumbnail_progress !== null">
            {{ Math.round(thumbnail_progress * 100) }}%</span
          >
        </p>
      </div>
    </div>
    <!-- --------- Compact mode --------- -->
    <v-list-item
      v-if="!thumbnail && !compactQueue && on_compact"
      class="text-start"
      :class="{ 'py-5': !dense, 'py-2 px-0': dense }"
      lines="two"
      :density="dense ? 'compact' : undefined"
    >
      <template v-slot:prepend>
        <v-avatar
          class="border pa-1 elevation-5 bg-white"
          rounded="lg"
          size="64"
        >
          <v-img
            :src="image_url"
            style="
              object-fit: cover;
              height: inherit;
              width: inherit;
              border-radius: 0.6em;
            "
          />
        </v-avatar>
      </template>

      <v-list-item-title>
        <b>{{ label }}</b>
      </v-list-item-title>

      <v-list-item-subtitle v-if="image" class="small"
        >{{ image }}
      </v-list-item-subtitle>

      <template v-slot:append>
        <v-btn
          v-if="clearable && last_image && !disabled"
          class="ms-1"
          :class="{ 'sd-modern-icon-button s-image-uploader__compact-action': modern }"
          :color="modern ? undefined : 'red'"
          icon
          :title="modern ? undefined : 'Clear image'"
          :aria-label="modern ? removeLabel || $t('global.actions.remove_image') : undefined"
          variant="text"
          @click.stop="
            () => {
              last_image = null;
              $emit('onClear');
            }
          "
        >
          <v-icon :size="modern ? 16 : undefined">close</v-icon>
          <v-tooltip v-if="modern" activator="parent" :text="removeLabel || $t('global.actions.remove_image')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" />
        </v-btn>

        <slot
          v-if="!disabled"
          name="compact-action"
          :edit="
            () => {
              force_edit = !force_edit;
              last_image = null;
            }
          "
        >
          <v-btn
            class="ms-1"
            :class="{ 'sd-modern-icon-button s-image-uploader__compact-action': modern }"
            icon
            :title="modern ? undefined : 'Edit image'"
            :aria-label="modern ? editLabel || $t('global.actions.edit') : undefined"
            variant="text"
            @click="
              force_edit = !force_edit;
              last_image = null;
            "
          >
            <v-icon :size="modern ? 16 : undefined">edit</v-icon>
            <v-tooltip v-if="modern" activator="parent" :text="editLabel || $t('global.actions.edit')" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start" />
          </v-btn>
        </slot>
      </template>
    </v-list-item>
    <!-- --------- Normal mode --------- -->

    <v-expand-transition>
      <div v-if="thumbnail || compactQueue || !on_compact">
        <div v-if="label && !thumbnail && !compactQueue" class="label-top" v-html="label"></div>
        <div
          :class="[
            {
              dense: dense,
              dark: dark,
              disabled: disabled,
              'has-value': true,
              ctrl: ctrl,
              's-image-uploader__transport': thumbnail,
              's-image-uploader__queue-transport': compactQueue,
            },
            rounded ? `rounded-${rounded}` : '',
          ]"
          :style="{
            minHeight: minHeight,
            border: border ? 'dashed 2px #000' : undefined,
          }"
          class="uploader-container mx-auto overflow-hidden"
        >
          <v-slide-y-transition>
            <v-avatar
              v-if="showPreImage && last_image && !autoCompact"
              :style="clearable ? 'top: 50%;' : ''"
              class="prev-img"
              size="76"
            >
              <v-img :src="image_url" />
            </v-avatar>
          </v-slide-y-transition>

          <v-icon
            v-if="focused && !disablePast"
            :color="dark ? '#fff' : '#000'"
            class="fadeIn absolute-top-start"
            size="small"
            style="z-index: 1"
            >fa:fas fa-paste
          </v-icon>
          <file-pond
            v-if="thumbnail || compactQueue || !clearable || !last_image"
            ref="pond"
            v-intersect="onIntersect"
            :accepted-file-types="acceptedFileTypes"
            :allow-multiple="thumbnail ? false : allowMultiple"
            :instant-upload="!deferUpload"
            :allow-process="!deferUpload"
            :disabled="disabled"
            :allowImageResize="allowImageResize"
            :allowImageTransform="allowImageTransform"
            :allowPaste="focused && !disablePast"
            :files="logo"
            :imageResizeMode="imageResizeMode"
            :imageResizeTargetHeight="
              imageResizeTargetHeight
                ? imageResizeTargetHeight
                : imageResizeTargetWidth
            "
            :imageResizeTargetWidth="imageResizeTargetWidth"
            :imageResizeUpscale="imageResizeUpscale"
            :label-idle="
              idleLabel || (placeholderImage && !last_image
                ? `<img src='${placeholderImage}' class='placeholder'>`
                : '') +
              `<p class='text-dark m-0'><i class='fa:fas fa-plus text-success ms-2'></i> ${$t(
                'global.image_uploader.label',
              )}  </p>`
            "
            :max-files="thumbnail ? 1 : maxFiles"
            :maxFileSize="maxFileSize"
            :name="paramName"
            :server="server_credential"
            check-validity="true"
            class="pointer-pointer fadeIn filepond-style"
            credits="false"
            style="min-height: 84px"
            @init="thumbnail_ready = true"
            @addfilestart="handleAddFileStart"
            @addfile="handleAddFile"
            @removefile="handleRemoveFile"
            @error="handleFilePondError"
            @warning="handleFilePondWarning"
            @processfile="handleProcessFile"
            @processfileabort="handleProcessAbort"
            @processfilestart="handleProcessStart"
            @processfileprogress="handleProcessProgress"
          />

          <p class="small file-size-limit text-dark">
            {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
          </p>

          <v-btn
            v-if="clearable && last_image"
            class="absolute-top-end m-2 z2"
            icon
            size="small"
            title="Clear image"
            variant="flat"
            @click.stop="
              () => {
                last_image = null;
                $emit('onClear');
                force_edit = false;
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
import { isString } from "lodash-es";

// Define a regular expression to match "image-placeholder*.svg"
const pattern = /(?:\/|^)(image-placeholder.*\.svg)$/;

export default {
  name: "SImageUploader",
  components: {
    FilePond: FilePondLoader.loadFilePondComponent(),
  },
  emits: [
    "response",
    "new-path",
    "new-url",
    "onClear",
    "onError",
    "onAddFileStart",
    "onAddFile",
    "onRemoveFile",
    "onProcessFileStart",
    "onProcessFileAbort",
  ],
  props: {
    label: {
      required: false,
      type: String,
    },
    server: {
      required: false,
      type: String,
    },
    deferUpload: {
      type: Boolean,
      default: false,
    },
    thumbnail: { type: Boolean, default: false },
    compactQueue: { type: Boolean, default: false },
    modern: { type: Boolean, default: false },
    idleLabel: String,
    chooseLabel: String,
    editLabel: String,
    removeLabel: String,
    hint: String,
    extraParams: {
      type: Object,
    },

    maxFileSize: {
      required: false,
      type: String,
      default: "1MB",
    },

    image: {
      required: false,
      type: String,
    },
    placeholderImage: {
      required: false,
      type: String,
    },
    paramName: {
      required: false,
      type: String,
      default: "photo",
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
    rounded: {
      default: "xl",
    },

    dark: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },
    imageResizeTargetWidth: {
      default: 4000,
    },
    imageResizeTargetHeight: {
      default: undefined,
    },
    imageResizeMode: {
      default: "contain", // force / cover / contain
    },
    imageResizeUpscale: {
      type: Boolean,
      default: false,
    },
    allowImageResize: {
      type: Boolean,
      default: true,
    },

    noSvg: {
      type: Boolean,
      default: false,
    },
    showPreImage: {
      type: Boolean,
      default: true,
    },
    allowImageTransform: {
      type: Boolean,
      default: false,
    },
    disablePast: {
      type: Boolean,
      default: false,
    },
    minHeight: { default: "240px" },
    border: Boolean,

    autoCompact: {
      type: Boolean,
      default: false,
    },
    headers: {}, // Add extra headers
  },

  data: () => ({
    logo: null,
    ///////  version: "",
    last_image: null,

    focused: false,

    ctrl: false,
    key_listener_keydown: null,
    key_listener_keyup: null,

    force_edit: false, // Force show upload (in auto compact mode!)
    thumbnail_ready: false,
    thumbnail_file_id: null,
    thumbnail_name: "",
    thumbnail_preview: null,
    thumbnail_loading: false,
    thumbnail_processing: false,
    thumbnail_progress: null,
    thumbnail_error: "",
    queue_files: [],
    queue_error: "",
    queue_active: true,
  }),

  computed: {
    queueCanBrowse() {
      return !this.disabled && this.thumbnail_ready && !(this.allowMultiple && this.maxFiles > 0 && this.queue_files.length >= this.maxFiles);
    },
    thumbnailSource() {
      return this.thumbnail_preview || this.image;
    },
    thumbnailFilename() {
      return this.thumbnail_name || this.image?.split("/").pop()?.split("?")[0];
    },
    on_compact() {
      return (
        this.autoCompact &&
        this.last_image &&
        !this.force_edit &&
        !(isString(this.last_image) && pattern.test(this.last_image))
      ); // Define a regular expression to match "image-placeholder*.svg"
      // /image-placeholder -> default place holder image!
    },

    acceptedFileTypes() {
      return this.noSvg
        ? "image/jpeg, image/png, image/webp, image/gif"
        : "image/jpeg, image/png, image/svg+xml, image/webp, image/gif";
    },
    image_url() {
      if (!this.image) return null;
      return this.image; //// + this.version;
    },
    server_credential() {
      if (this.deferUpload && !this.server) return null;
      const token = document.head.querySelector('meta[name="csrf-token"]');

      const headers = {
        "X-CSRF-TOKEN": token ? token.content : "",
        Authorization: window.axios.defaults.headers.common["Authorization"], // fix upload image in chrome!
      };

      if (this.headers) {
        Object.keys(this.headers).forEach((key) => {
          if (this.headers[key]) headers[key] = this.headers[key];
        });
      }

      return {
        url: this.server,
        process: {
          method: "POST",
          withCredentials: true,

          headers: headers,
          ondata: (formData) => {
            // Append extra parameters to the FormData object
            if (this.extraParams) {
              Object.keys(this.extraParams).forEach((key) => {
                formData.append(key, this.extraParams[key]);
              });
            }

            return formData;
          },
        },
        revert: null,
      };
    },
  },
  watch: {
    image() {
      this.last_image = this.image;
    },
  },
  created() {
    this.last_image = this.image;
    ///////// this.version = "?v=" + Math.round(Math.random() * 100); //Invalidate cache!
  },

  mounted() {
    //――――――――――――――――――――――  START Editor key listener ――――――――――――――――――――

    this.key_listener_keydown = (event) => {
      if (this.disablePast) return;
      if (event.ctrlKey || event.metaKey) {
        this.ctrl = true;
      }
    };
    this.key_listener_keyup = (event) => {
      this.ctrl = false;
    };

    document.addEventListener("keydown", this.key_listener_keydown);
    document.addEventListener("keyup", this.key_listener_keyup);
    //――――――――――――――――――――――  END Editor key listener ――――――――――――――――――――
  },

  beforeUnmount() {
    this.queue_active = false;
    this.releaseQueuePreviews();
    this.releaseThumbnailPreview();
    //――――――――――――――――――――――  REMOVE key listener ――――――――――――――――――――
    document.removeEventListener("keydown", this.key_listener_keydown);
    document.removeEventListener("keyup", this.key_listener_keyup);
  },

  methods: {
    browseQueue() {
      if (!this.queue_active || !this.queueCanBrowse) return;
      this.queue_error = "";
      this.$refs.pond?.browse();
    },
    dropQueue(event) {
      if (!this.queue_active || !this.queueCanBrowse || !event.dataTransfer?.files?.length) return;
      this.queue_error = "";
      this.$refs.pond?.addFiles(Array.from(event.dataTransfer.files)).catch(error => {
        if (this.queue_active && !this.queue_files.some(file => file.state === "error")) this.queue_error = this.thumbnailError(error);
      });
    },
    syncQueueFile(file, updates = {}) {
      if (!this.compactQueue || !this.queue_active || !file?.id) return;
      let entry = this.queue_files.find(item => item.id === file.id);
      if (!entry) return;
      Object.assign(entry, { name: file.filename || file.file?.name || entry.name, size: file.fileSize || file.file?.size || entry.size }, updates);
      return entry;
    },
    releaseQueuePreviews() {
      this.queue_files.forEach(file => { if (file.preview) URL.revokeObjectURL(file.preview); });
      this.queue_files = [];
    },
    queueStatus(file) {
      if (file.state === "error") return file.error;
      if (file.state === "uploading" && file.progress !== null)
        return this.$t("global.image_uploader.queue.progress", { progress: Math.round(file.progress * 100) });
      return this.$t(`global.image_uploader.queue.${file.state}`);
    },
    queueFileSize(size) {
      return size < 1024 * 1024 ? `${Math.round(size / 1024)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
    },
    async retryQueueFile(entry, event) {
      if (!this.queue_active || this.disabled || !this.thumbnail_ready || this.deferUpload || entry.state !== "error" || !entry.retryable) return;
      const file = this.$refs.pond?.getFiles().find(file => file.id === entry.id);
      if (!file || ![2, 5, 6].includes(file.status)) return;
      const cancelButton = event?.currentTarget?.parentElement?.querySelector('[data-queue-remove]');
      this.syncQueueFile(file, { state: "uploading", error: "", progress: null, retryable: false });
      if (cancelButton) this.$nextTick(() => cancelButton.focus());
      try {
        await this.$refs.pond.processFile(file.id);
      } catch (error) {
        if (this.queue_active && this.queue_files.some(item => item.id === file.id))
          this.syncQueueFile(file, { state: "error", error: this.thumbnailError(error), retryable: true });
      }
    },
    removeQueueFile(entry) {
      if (!this.queue_active || this.disabled || !this.thumbnail_ready) return;
      // Removing a queue receipt must never revert an image already saved by the server.
      this.$refs.pond?.removeFile(entry.id, { revert: false }).catch(error => {
        if (this.queue_active) this.queue_error = this.thumbnailError(error);
      });
    },
    releaseThumbnailPreview() {
      if (this.thumbnail_preview) URL.revokeObjectURL(this.thumbnail_preview);
      this.thumbnail_preview = null;
    },
    thumbnailError(error) {
      return (
        [error?.main, error?.sub].filter(Boolean).join(" · ") ||
        error?.body ||
        error?.message ||
        this.$t("global.commons.invalid")
      );
    },
    browseThumbnail() {
      if (
        this.disabled ||
        !this.thumbnail_ready ||
        this.thumbnail_loading ||
        this.thumbnail_processing
      )
        return;
      // FilePond's own input keeps native selection, type/size validation and its existing queue.
      this.$refs.pond?.browse();
    },
    dropThumbnail(event) {
      if (
        this.disabled ||
        !this.thumbnail_ready ||
        this.thumbnail_loading ||
        this.thumbnail_processing
      )
        return;
      const files = event.dataTransfer?.files;
      if (!files?.length) return;
      if (files.length !== 1) {
        this.thumbnail_error = this.$t("global.commons.invalid");
        return;
      }
      this.$refs.pond?.addFile(files[0]).catch(() => {}); // FilePond reports validation through its error event.
    },
    removeThumbnail() {
      if (this.disabled || !this.thumbnail_ready || this.thumbnail_processing)
        return;
      if (this.thumbnail_file_id) this.discardPendingFile()?.catch(() => {});
      else if (this.clearable) {
        this.last_image = null;
        this.$emit("onClear");
      }
    },
    handleAddFileStart(file) {
      this.queue_error = "";
      if (this.compactQueue && this.queue_active && !this.queue_files.some(item => item.id === file.id))
        this.queue_files.push({ id: file.id, name: "", size: 0, preview: null, state: "loading", progress: null, error: "", retryable: false, invalid: false });
      this.syncQueueFile(file, { state: "loading", progress: null, error: "", retryable: false });
      if (this.thumbnail) {
        this.releaseThumbnailPreview();
        this.thumbnail_file_id = file.id;
        this.thumbnail_name = file.filename || "";
        this.thumbnail_loading = true;
        this.thumbnail_error = "";
        this.thumbnail_progress = null;
      }
      this.$emit("onAddFileStart", file);
    },
    handleAddFile(error, file) {
      const entry = this.syncQueueFile(file, { state: error ? "error" : "queued", error: error ? this.thumbnailError(error) : "", retryable: false, invalid: Boolean(error) });
      if (entry && !error && !entry.preview && file.file instanceof Blob)
        entry.preview = URL.createObjectURL(file.file);
      if (this.thumbnail && file?.id === this.thumbnail_file_id) {
        this.thumbnail_loading = false;
        this.thumbnail_name = file.filename || file.file?.name || "";
        this.thumbnail_error = error ? this.thumbnailError(error) : "";
        if (!error && file.file instanceof Blob) {
          this.releaseThumbnailPreview();
          this.thumbnail_preview = URL.createObjectURL(file.file);
        }
      }
      this.$emit("onAddFile", { error, file });
    },
    handleRemoveFile(error, file) {
      if (this.compactQueue && !error && file?.id) {
        const entry = this.queue_files.find(item => item.id === file.id);
        if (entry?.preview) URL.revokeObjectURL(entry.preview);
        this.queue_files = this.queue_files.filter(item => item.id !== file.id);
      }
      if (this.thumbnail && !error && file?.id === this.thumbnail_file_id) {
        this.releaseThumbnailPreview();
        this.thumbnail_file_id = null;
        this.thumbnail_name = "";
        this.thumbnail_loading = false;
        this.thumbnail_processing = false;
        this.thumbnail_progress = null;
        this.thumbnail_error = "";
      }
      this.$emit("onRemoveFile", { error, file });
    },
    handleProcessStart(file) {
      this.syncQueueFile(file, { state: "uploading", progress: null, error: "", retryable: false });
      if (this.thumbnail) {
        this.thumbnail_processing = true;
        this.thumbnail_progress = null;
        this.thumbnail_error = "";
      }
      this.$emit("onProcessFileStart", file);
    },
    handleProcessAbort(file) {
      if (this.queue_files.some(item => item.id === file.id))
        this.syncQueueFile(file, { state: "error", progress: null, error: this.$t("global.image_uploader.queue.cancelled"), retryable: true });
      if (this.thumbnail) {
        this.thumbnail_processing = false;
        this.thumbnail_progress = null;
      }
      this.$emit("onProcessFileAbort", file);
    },
    handleProcessProgress(file, progress) {
      if (this.queue_files.some(item => item.id === file.id))
        this.syncQueueFile(file, { progress: Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : null });
      if (this.thumbnail && file?.id === this.thumbnail_file_id)
        this.thumbnail_progress = progress;
    },
    async processPendingFile() {
      const pond = this.$refs.pond;
      if (!this.deferUpload || !this.server || !pond)
        throw new Error("Deferred image upload is not configured.");
      const files = pond.getFiles();
      // FilePond can leave processing promises pending for loading or invalid files.
      if (files.length !== 1 || ![2, 5, 6].includes(files[0].status))
        throw new Error("Choose one ready image before uploading.");
      if (this.thumbnail) {
        this.thumbnail_processing = true;
        this.thumbnail_error = "";
        this.thumbnail_progress = null;
      }
      try {
        const file = await pond.processFile(files[0].id);
        const response = JSON.parse(file?.serverId);
        if (
          !response ||
          response.error ||
          response.success === false ||
          !response.files ||
          typeof response.files !== "object" ||
          Array.isArray(response.files) ||
          typeof response.files.path !== "string" ||
          !response.files.path.trim()
        )
          throw new Error("Image upload returned an invalid response.");
        this.syncQueueFile(file, { state: "success", progress: 1, error: "", retryable: false });
        return response.files;
      } catch (error) {
        if (this.queue_files.some(file => file.id === files[0].id))
          this.syncQueueFile(files[0], { state: "error", error: this.thumbnailError(error), retryable: false });
        if (this.thumbnail && !this.thumbnail_error)
          this.thumbnail_error = this.thumbnailError(error);
        throw error;
      } finally {
        if (this.thumbnail) this.thumbnail_processing = false;
      }
    },
    discardPendingFile() {
      return this.$refs.pond?.removeFiles({ revert: false });
    },
    onIntersect(isIntersecting) {
      if (this.thumbnail || this.compactQueue) return;
      this.focused = isIntersecting;
    },

    handleFilePondWarning(warning) {
      if (!this.compactQueue || !this.queue_active) return;
      this.queue_error = this.thumbnailError(warning);
      this.$emit("onError", warning);
    },
    handleFilePondError(error, file, status) {
      if (this.compactQueue && (!this.queue_active || (file && !this.queue_files.some(item => item.id === file.id)))) return;
      if (this.compactQueue && this.queue_active) {
        if (file) {
          const invalid = this.queue_files.find(item => item.id === file.id)?.invalid;
          this.syncQueueFile(file, { state: "error", error: this.thumbnailError(error), retryable: !invalid && [2, 5, 6].includes(file.status) });
        } else this.queue_error = this.thumbnailError(error);
      }
      if (this.thumbnail && (!file || file.id === this.thumbnail_file_id)) {
        this.thumbnail_loading = false;
        this.thumbnail_processing = false;
        this.thumbnail_error = this.thumbnailError(error);
      }
      this.$emit("onError", error);
      if (error?.main && error.sub)
        return NotificationService.showErrorAlert(error.main, error.sub);
      else if (error?.main)
        return NotificationService.showErrorAlert(null, error.main);

      NotificationService.showLaravelError(error);
    },

    handleProcessFile: function (error, file) {
      if (this.compactQueue && (!this.queue_active || !this.queue_files.some(item => item.id === file?.id))) return;
      if (error) this.syncQueueFile(file, { state: "error", error: this.thumbnailError(error), retryable: true });
      if (this.thumbnail && file?.id === this.thumbnail_file_id) {
        this.thumbnail_processing = false;
        if (error) this.thumbnail_error = this.thumbnailError(error);
      }
      // Deferred callers consume the validated result before delayed FilePond events arrive.
      if (this.deferUpload) return;
      if (!error) {
        this.force_edit = false; // Reset to compact mode!

        let response;
        try {
          response = JSON.parse(file.serverId);
          if (this.compactQueue) {
            const files = Array.isArray(response?.files) ? response.files : [response?.files];
            if (!response || response.error || response.success === false || !files.length || files.some(item => typeof item?.path !== "string" || !item.path.trim()))
              throw new Error(this.$t("global.image_uploader.queue.failed"));
          }
        } catch (error) {
          if (!this.compactQueue) throw error;
          const message = this.$t("global.image_uploader.queue.failed");
          this.syncQueueFile(file, { state: "error", error: message, retryable: true });
          this.$emit("onError", { message });
          return;
        }
        this.syncQueueFile(file, { state: "success", progress: 1, error: "", retryable: false });
        this.$emit("response", response);

        if (Array.isArray(response.files)) {
          response.files.forEach((file) => {
            //console.log("done", file.path);
            this.$emit("new-path", file.path);
            this.$emit("new-url", file.url);
          });
        } else if (response.files) {
          //console.log("done", response.files.path);
          this.$emit("new-path", response.files.path);
          this.$emit("new-url", response.files.url);

          this.$nextTick(() => {
            //////  this.version = "?v=" + Math.random(100);
          });
        }

        // Removing a local queue entry must not suggest deleting an already saved image.
        if (this.thumbnail && response.files) this.thumbnail_file_id = null;

        return true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.s-image-uploader--queue {
  position: relative;
  min-width: 0;
  .s-image-uploader__drop { display: flex; align-items: center; gap: 12px; padding: 15px; border: 1px dashed var(--sd-modern-border, rgba(var(--v-theme-on-surface), .16)); border-radius: 10px; background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), .03)); }
  .s-image-uploader__drop > .v-icon { color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); flex-shrink: 0; }
  .s-image-uploader__drop-copy { flex: 1; min-width: 0; }
  .s-image-uploader__drop-copy strong { display: block; font-size: 13px; line-height: 21px; font-weight: 500; }
  .s-image-uploader__drop-copy small { display: block; margin-block-start: 2px; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); font-size: 11px; line-height: 18px; }
  .s-image-uploader__drop .v-btn { flex-shrink: 0; }
  .s-image-uploader__files { list-style: none; padding: 0; margin: 14px 0 0; }
  .s-image-uploader__file { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding-block: 10px; }
  .s-image-uploader__file + .s-image-uploader__file { border-block-start: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), .16)); }
  .s-image-uploader__file-preview { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; overflow: hidden; border-radius: 7px; background: var(--sd-modern-inset, rgba(var(--v-theme-on-surface), .03)); color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); }
  .s-image-uploader__file-preview img { width: 100%; height: 100%; object-fit: cover; }
  .s-image-uploader__file-info { min-width: 0; }
  .s-image-uploader__filename { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; line-height: 20px; font-weight: 500; }
  .s-image-uploader__file-status { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; margin: 2px 0 0; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), .65)); }
  .s-image-uploader__file-status .v-icon { align-self: center; }
  .s-image-uploader__file-progress { margin-block-start: 7px; }
  .s-image-uploader__file-actions { display: flex; align-items: center; gap: 6px; }
  .s-image-uploader__file-actions .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; }
  .s-image-uploader__queue-error { margin: 10px 0 0; font-size: 12px; line-height: 20px; color: rgb(var(--v-theme-on-surface)); }
  .s-image-uploader__queue-transport { position: absolute; inset-block-start: 0; width: 128px; height: 128px; min-height: 0 !important; visibility: hidden; pointer-events: none; }
}
@media (max-width: 560px) {
  .s-image-uploader--queue {
    .s-image-uploader__drop { flex-wrap: wrap; padding: 13px; gap: 10px; }
    .s-image-uploader__drop .v-btn { width: 100%; }
    .s-image-uploader__file { grid-template-columns: 42px minmax(0, 1fr) auto; gap: 8px; }
    .s-image-uploader__file-preview { width: 42px; height: 42px; }
    .s-image-uploader__file--error { grid-template-columns: 42px minmax(0, 1fr); }
    .s-image-uploader__file--error .s-image-uploader__file-actions { grid-column: 2; }
  }
}
@media (max-width: 700px), (pointer: coarse) {
  .s-image-uploader--queue .s-image-uploader__file-actions .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
}
.s-image-uploader--modern .s-image-uploader__compact-action {
  --sd-modern-icon-button-size: 32px;
}

@media (max-width: 640px), (pointer: coarse) {
  .s-image-uploader--modern .s-image-uploader__compact-action {
    --sd-modern-icon-button-size: 44px;
  }
}

.s-image-uploader--thumbnail {
  position: relative;
  min-width: 0;
  .s-image-uploader__thumbnail-heading {
    margin-block-end: 10px;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
  }
  .s-image-uploader__thumbnail-pick {
    display: grid;
    place-items: center;
    width: 128px;
    height: 128px;
    max-width: 100%;
    aspect-ratio: 1;
    padding: 7px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 3px 10px rgba(24, 40, 65, 0.05);
    color: var(--sd-modern-muted);
    cursor: pointer;
    &:disabled {
      cursor: default;
    }
    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
    }
  }
  .s-image-uploader__thumbnail-well {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-radius: 7px;
    background: var(--sd-modern-inset);
    > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
  .s-image-uploader__thumbnail-caption {
    max-width: 140px;
    min-width: 0;
  }
  .s-image-uploader__thumbnail-hint,
  .s-image-uploader__thumbnail-name,
  .s-image-uploader__thumbnail-status {
    margin: 10px 0 0;
    color: var(--sd-modern-muted);
    font-family: inherit;
    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
  }
  .s-image-uploader__thumbnail-name {
    margin-block-start: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .s-image-uploader__thumbnail-status {
    color: rgb(var(--v-theme-on-surface));
    overflow-wrap: anywhere;
  }
  .s-image-uploader__thumbnail-actions {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-block-start: 4px;
  }
  .s-image-uploader__thumbnail-edit.v-btn {
    min-width: 0;
    min-height: 32px;
    height: auto;
    padding: 6px 0;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    :deep(.v-btn__content) {
      gap: 5px;
    }
  }
  .s-image-uploader__thumbnail-remove {
    --sd-modern-icon-button-size: 32px;
  }
  .s-image-uploader__transport {
    position: absolute;
    inset-block-start: 0;
    width: 128px;
    height: 128px;
    min-height: 0 !important;
    visibility: hidden;
    pointer-events: none;
  }
}
@media (max-width: 600px) {
  .s-image-uploader--thumbnail {
    .s-image-uploader__thumbnail {
      display: grid;
      grid-template-columns: 104px minmax(0, 1fr);
      column-gap: 18px;
    }
    .s-image-uploader__thumbnail-heading {
      grid-column: 2;
      grid-row: 1;
      align-self: end;
      margin-block-end: 6px;
    }
    .s-image-uploader__thumbnail-pick {
      width: 104px;
      height: 104px;
      grid-column: 1;
      grid-row: 1 / 3;
      align-self: start;
    }
    .s-image-uploader__thumbnail-caption {
      grid-column: 2;
      grid-row: 2;
      max-width: none;
    }
    .s-image-uploader__thumbnail-hint {
      margin: 0;
    }
  }
}
@media (max-width: 360px) {
  .s-image-uploader--thumbnail {
    .s-image-uploader__thumbnail {
      grid-template-columns: 88px minmax(0, 1fr);
      column-gap: 13px;
    }
    .s-image-uploader__thumbnail-pick {
      width: 88px;
      height: 88px;
    }
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .s-image-uploader--thumbnail {
    .s-image-uploader__thumbnail-remove {
      --sd-modern-icon-button-size: 44px;
    }
    .s-image-uploader__thumbnail-edit.v-btn {
      min-height: 44px;
    }
  }
}
</style>

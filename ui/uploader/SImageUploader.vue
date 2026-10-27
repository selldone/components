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
    :class="{ 's-image-uploader--thumbnail text-start': thumbnail }"
    @focusin="thumbnail && (focused = true)"
    @focusout="thumbnail && (focused = false)"
  >
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
      v-if="!thumbnail && on_compact"
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
          color="red"
          icon
          title="Clear image"
          variant="text"
          @click.stop="
            () => {
              last_image = null;
              $emit('onClear');
            }
          "
        >
          <v-icon>close</v-icon>
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
            icon
            title="Edit image"
            variant="text"
            @click="
              force_edit = !force_edit;
              last_image = null;
            "
          >
            <v-icon>edit</v-icon>
          </v-btn>
        </slot>
      </template>
    </v-list-item>
    <!-- --------- Normal mode --------- -->

    <v-expand-transition>
      <div v-if="thumbnail || !on_compact">
        <div v-if="label && !thumbnail" class="label-top" v-html="label"></div>
        <div
          :class="[
            {
              dense: dense,
              dark: dark,
              disabled: disabled,
              'has-value': true,
              ctrl: ctrl,
              's-image-uploader__transport': thumbnail,
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
            v-if="thumbnail || !clearable || !last_image"
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
              (placeholderImage && !last_image
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
  }),

  computed: {
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
    this.releaseThumbnailPreview();
    //――――――――――――――――――――――  REMOVE key listener ――――――――――――――――――――
    document.removeEventListener("keydown", this.key_listener_keydown);
    document.removeEventListener("keyup", this.key_listener_keyup);
  },

  methods: {
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
      if (this.thumbnail) {
        this.thumbnail_processing = true;
        this.thumbnail_progress = null;
        this.thumbnail_error = "";
      }
      this.$emit("onProcessFileStart", file);
    },
    handleProcessAbort(file) {
      if (this.thumbnail) {
        this.thumbnail_processing = false;
        this.thumbnail_progress = null;
      }
      this.$emit("onProcessFileAbort", file);
    },
    handleProcessProgress(file, progress) {
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
        return response.files;
      } catch (error) {
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
      if (this.thumbnail) return;
      this.focused = isIntersecting;
    },

    handleFilePondError(error, file, status) {
      if (this.thumbnail && (!file || file.id === this.thumbnail_file_id)) {
        this.thumbnail_loading = false;
        this.thumbnail_processing = false;
        this.thumbnail_error = this.thumbnailError(error);
      }
      this.$emit("onError", error);
      if (error.main && error.sub)
        return NotificationService.showErrorAlert(error.main, error.sub);
      else if (error.main)
        return NotificationService.showErrorAlert(null, error.main);

      NotificationService.showLaravelError(error);
    },

    handleProcessFile: function (error, file) {
      if (this.thumbnail && file?.id === this.thumbnail_file_id) {
        this.thumbnail_processing = false;
        if (error) this.thumbnail_error = this.thumbnailError(error);
      }
      // Deferred callers consume the validated result before delayed FilePond events arrive.
      if (this.deferUpload) return;
      if (!error) {
        this.force_edit = false; // Reset to compact mode!

        let response = JSON.parse(file.serverId);
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

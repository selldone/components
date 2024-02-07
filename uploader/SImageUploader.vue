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
  <div>
    <!-- --------- Compact mode --------- -->
    <div v-if="on_compact" class="d-flex align-center py-5">
      <v-avatar size="64" rounded="lg" class="me-2 border">
        <img
          :src="image_url"
          class="pa-1 rounded-lg"
          style="object-fit: cover"
        />
      </v-avatar>
      <div class="flex-grow-1">
        <b>{{ label }}</b>
      </div>

      <v-btn
        icon variant="text"
        color="red"
        v-if="clearable && last_image"
        @click.stop="
          () => {
            last_image = null;
            $emit('onClear');
          }
        "
        title="Clear image"
        class="ms-1"
      >
        <v-icon>close</v-icon>
      </v-btn>

      <v-btn
        icon variant="text"
        class="ms-1"
        @click="
          force_edit = !force_edit;
          last_image = null;
        "
        :title="$t('global.actions.edit')"
      >
        <v-icon>edit</v-icon>
      </v-btn>
    </div>
    <!-- --------- Normal mode --------- -->

    <v-expand-transition>
      <div v-if="!on_compact">
        <div v-if="!on_compact" class="label-top" v-html="label"></div>
        <div
          class="uploader-container mx-auto rounded-18px overflow-hidden"
          :style="{ minHeight: minHeight }"
          :class="{
            dense: dense,
            dark: dark,
            disabled: disabled,
            'has-value': true,
            ctrl: ctrl,
          }"
        >
          <v-slide-y-transition>
            <v-avatar
              v-if="showPreImage && last_image && !autoCompact"
              class="prev-img"
              size="76"
              :style="clearable ? 'top: 50%;' : ''"
            >
              <img :src="image_url" />
            </v-avatar>
          </v-slide-y-transition>

          <v-icon
            v-if="focused && !disablePast"
            class="fadeIn absolute-top-start"
            style="z-index: 1"
            size="small"
            :dark="dark"
            >fa:fas fa-paste
          </v-icon>
          <file-pond
            v-if="!clearable || !last_image"
            v-intersect="onIntersect"
            ref="pond"
            class="pointer-pointer fadeIn filepond-style"
            :name="paramName"
            style="min-height: 84px"
            :label-idle="
              (placeholderImage && !last_image
                ? `<img src='${placeholderImage}' class='placeholder'>`
                : '') +
              `<p class='text-dark m-0'><i class='fa:fas fa-plus text-success ms-2'></i> ${$t(
                'global.image_uploader.label',
              )}  </p>`
            "
            :allow-multiple="allowMultiple"
            :accepted-file-types="acceptedFileTypes"
            :server="server_credential"
            :files="logo"
            :maxFileSize="maxFileSize"
            :max-files="maxFiles"
            check-validity="true"
            @processfile="handleProcessFile"
            @error="handleFilePondError"
            :allowPaste="focused && !disablePast"
            :allowImageResize="allowImageResize"
            :imageResizeUpscale="imageResizeUpscale"
            :imageResizeMode="imageResizeMode"
            :imageResizeTargetWidth="imageResizeTargetWidth"
            :imageResizeTargetHeight="
              imageResizeTargetHeight
                ? imageResizeTargetHeight
                : imageResizeTargetWidth
            "
            credits="false"
            :allowImageTransform="allowImageTransform"
            @addfile="(error, file) => $emit('onAddFile', { error, file })"
            @processfilestart="(e) => $emit('onProcessFileStart', e)"
            @processfileabort="(e) => $emit('onProcessFileAbort', e)"
          />

          <p class="small file-size-limit">
            {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
          </p>

          <v-btn
            variant="flat"
            icon
            size="small"
            v-if="clearable && last_image"
            @click.stop="
              () => {
                last_image = null;
                $emit('onClear');
                force_edit = false;
              }
            "
            title="Clear image"
            class="absolute-top-end m-2 z2"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
export default {
  name: "SImageUploader",
  emits: [
    "response",
    "new-path",
    "new-url",
    "onClear",
    "onError",
    "onAddFile",
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

    autoCompact: {
      type: Boolean,
      default: false,
    },
    headers: {}, // Add extra headers
  },

  data: () => ({
    logo: null,
    version: "",
    last_image: null,

    focused: false,

    ctrl: false,
    key_listener_keydown: null,
    key_listener_keyup: null,

    force_edit: false, // Force show upload (in auto compact mode!)
  }),

  computed: {
    on_compact() {
      return (
        this.autoCompact &&
        this.last_image &&
        !this.force_edit &&
        !this.last_image.includes("/image-placeholder")
      ); // /image-placeholder -> default place holder image!
    },

    acceptedFileTypes() {
      return this.noSvg
        ? "image/jpeg, image/png, image/webp, image/gif"
        : "image/jpeg, image/png, image/svg+xml, image/webp, image/gif";
    },
    image_url() {
      if (!this.image) return null;
      return this.image + this.version;
    },
    server_credential() {
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
    this.version = "?v=" + Math.round(Math.random() * 100); //Invalidate cache!
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
    //――――――――――――――――――――――  REMOVE key listener ――――――――――――――――――――
    document.removeEventListener("keydown", this.key_listener_keydown);
    document.removeEventListener("keyup", this.key_listener_keyup);
  },

  methods: {
    onIntersect(isIntersecting) {
      this.focused = isIntersecting;
    },

    handleFilePondError(error, file, status) {
      this.$emit("onError", error);
      if (error.main && error.sub)
        return this.showErrorAlert(error.main, error.sub);
      else if (error.main) return this.showErrorAlert(null, error.main);

      this.showLaravelError(error);
      console.error("File upload error", error);
    },

    handleProcessFile: function (error, file) {
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
        } else {
          //console.log("done", response.files.path);
          this.$emit("new-path", response.files.path);
          this.$emit("new-url", response.files.url);

          this.$nextTick(() => {
            this.version = "?v=" + Math.random(100);
          });
        }

        return true;
      }
    },
  },
};
</script>

<style lang="scss">


</style>

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
      <v-avatar class="me-2 border" rounded="lg" size="64">
        <v-icon size="x-large">smart_display</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <b>{{ label }}</b>
        <div v-if="video" class="small">{{ video }}</div>
      </div>

      <v-btn
        v-if="clearable && last_video"
        class="ms-1"
        color="red"
        icon variant="text"
        title="Clear image"
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
        :title="$t('global.actions.edit')"
        class="ms-1"
        icon variant="text"
        @click="
          force_edit = !force_edit;
          last_video = null;
        "
      >
        <v-icon>edit</v-icon>
      </v-btn>
    </div>
    <v-expand-transition>
      <div v-if="!on_compact">
        <div class="label-top" v-html="label"></div>

        <div
          :class="{
            dense: dense,
            dark: dark,
            disabled: disabled,
            'has-value': true,
            ctrl: ctrl,
          }"
          class="uploader-container mx-auto rounded-18px overflow-hidden"
        >
          <v-slide-y-transition>
            <div class="small">
              <v-icon class="me-1" size="large">smart_display</v-icon>
              {{ last_video }}
            </div>
          </v-slide-y-transition>

          <file-pond
            v-if="!clearable || !last_video"
            ref="pond"
            :accepted-file-types="acceptedFileTypes"
            :allow-multiple="false"
            :files="logo"
            :max-files="maxFiles"
            :maxFileSize="maxFileSize"
            :name="paramName"
            :server="server_credential"
            check-validity="true"
            class="pointer-pointer fadeIn filepond-style"
            credits="false"
            label-idle="Upload video file"
            style="min-height: 84px"
            @error="handleFilePondError"
            @processfile="handleProcessFile"
          />

          <p class="small file-size-limit">
            {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
          </p>

          <v-btn
            v-if="clearable && last_video"
            class="absolute-top-end m-2 z2"
            size="small"
            variant="text"
            icon
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

<script>
export default {
  name: "SVideoUploader",
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
  },

  data: () => ({
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
      return "video/mp4";
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

  beforeUnmount() {},

  methods: {
    handleFilePondError(error) {
      this.showErrorAlert(null, error.body);
      //  console.error('handleFilePondError',error)
    },

    handleProcessFile: function (error, file) {
      if (!error) {
        let response = JSON.parse(file.serverId);
        this.$emit("response", response);

        if (Array.isArray(response.files)) {
          response.files.forEach((file) => {
            console.log("done", file.path);
            this.$emit("new-path", file.path);
            this.$emit("new-url", file.url);
          });
        } else {
          console.log("done", response.files.path);
          this.$emit("new-path", response.files.path);
          this.$emit("new-url", response.files.url);
        }

        return true;
      }
    },
  },
};
</script>

<style lang="scss"></style>

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
      <slot></slot>

      <file-pond
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
        label-idle="Upload file"
        style="min-height: 84px"
        @error="handleFilePondError"
        @processfile="handleProcessFile"
      />

      <p class="small file-size-limit">
        {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
      </p>

      <v-btn
        v-if="clearable"
        class="absolute-top-end m-2 z2"
        icon
        size="small"
        variant="flat"
        @click.stop="
          () => {
            $emit('onClear');
          }
        "
      >
        <v-icon>close</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: "SFileUploader",
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

    paramName: {
      required: false,
      type: String,
      default: "file",
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

    acceptedFileTypes: {},
  },

  data: () => ({
    logo: null,

    ctrl: false,
    key_listener_keydown: null,
    key_listener_keyup: null,
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
            Authorization:
              window.axios.defaults.headers.common["Authorization"], // fix upload image in chrome!
          },
        },
        revert: null,
      };
    },
  },
  watch: {},
  created() {},

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

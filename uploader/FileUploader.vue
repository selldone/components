<template>
  <div>
    <div class="label-top" v-html="label"></div>
    <div
      class="uploader-container mx-auto rounded-18px overflow-hidden"
      :class="{
        dense: dense,
        dark: dark,
        disabled: disabled,
        'has-value': true,
        ctrl: ctrl,
      }"
    >
      <slot></slot>

      <file-pond
        ref="pond"
        class="pointer-pointer fadeIn filepond-style"
        :name="paramName"
        style="min-height: 84px"
        label-idle="Upload file"
        :allow-multiple="false"
        :accepted-file-types="acceptedFileTypes"
        :server="server_credential"
        :files="logo"
        :maxFileSize="maxFileSize"
        :max-files="maxFiles"
        check-validity="true"
        @processfile="handleProcessFile"
        @error="handleFilePondError"
        credits="false"
      />

      <p class="small file-size-limit">
        {{ $t("global.image_uploader.max_size", { size: maxFileSize }) }}
      </p>

      <v-btn
        fab
        depressed
        small
        v-if="clearable"
        @click.stop="
          () => {
            $emit('onClear');
          }
        "
        class="absolute-top-end m-2 z2"
        ><v-icon>close</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "FileUploader",
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

  beforeDestroy() {},

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

<template>
  <div>
    <!-- --------- Compact mode --------- -->
    <div v-if="on_compact" class="d-flex align-center py-5">
      <v-avatar size="64" rounded="lg" class="me-2 border">
        <v-icon x-large>smart_display</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <b>{{ label }}</b>
        <div class="small" v-if="video">{{ video }}</div>
      </div>

      <v-btn
        icon
        color="red"
        v-if="clearable && last_video"
        @click.stop="
          () => {
            last_video = null;
            $emit('onClear');
          }
        "
        title="Clear image"
        class="ms-1"
        ><v-icon>close</v-icon></v-btn
      >

      <v-btn
        icon
        class="ms-1"
        @click="
          force_edit = !force_edit;
          last_video = null;
        "
        :title="$t('global.actions.edit')"
        ><v-icon>edit</v-icon></v-btn
      >
    </div>
    <v-expand-transition>
      <div v-if="!on_compact">
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
          <v-slide-y-transition>
            <div class="small">
              <v-icon large class="me-1">smart_display</v-icon> {{ last_video }}
            </div>
          </v-slide-y-transition>

          <file-pond
            v-if="!clearable || !last_video"
            ref="pond"
            class="pointer-pointer fadeIn filepond-style"
            :name="paramName"
            style="min-height: 84px"
            label-idle="Upload video file"
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
            v-if="clearable && last_video"
            @click.stop="
              () => {
                last_video = null;
                $emit('onClear');
              }
            "
            class="absolute-top-end m-2 z2"
            ><v-icon>close</v-icon></v-btn
          >
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

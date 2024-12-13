<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ███████████████████████ AI Commander ███████████████████████ -->
  <u-voice-recorder-continues
    keyword="hey"
    @error="handleError"
    @stop="handleRecording"
    :silence-duration="2000"
    class="position-relative"
  >
    <template v-slot="{ isRecording, startRecording, stopRecording, error }">
      <v-slide-x-reverse-transition hide-on-leave group>
        <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Mode > Ready to record ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <u-button-ai-small
          v-if="!isRecording"
          size="small"
          gradientLive
          :image-size="32"
          @click="startRecording"
          class="position-relative"
        >
          <v-icon class="center-absolute">mic</v-icon>
          <v-progress-circular
            v-if="busy_ai"
            :indeterminate="progress >= 99"
            :model-value="progress"
            class="center-absolute"
            size="36"
          ></v-progress-circular>
        </u-button-ai-small>
        <!-- <v-avatar
           v-if="!isRecording"
           class="avatar-gradient -thin -blue elevation-5"
           size="36"
         >
           <v-btn
             class="border-w-medium"
             icon
             variant="flat"
             @click="startRecording"
             size="28"
           >
             <v-icon>mic</v-icon>
           </v-btn>
           <v-progress-circular
             v-if="busy_ai"
             :indeterminate="progress >= 99"
             :model-value="progress"
             class="center-absolute"
             size="36"
           ></v-progress-circular>
         </v-avatar>-->

        <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Mode > In Recording ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div
          v-else
          class="d-flex align-center"
          :class="{ 'flex-row-reverse': alignEnd }"
        >
          <v-avatar class="avatar-gradient -thin -red zoomIn" size="36">
            <v-btn
              class="border-w-medium"
              color="#FFCDD2"
              icon
              variant="flat"
              @click="stopRecording"
              size="28"
            >
              <v-icon>stop</v-icon>
            </v-btn>
          </v-avatar>

          <div
            class="ms-2 fadeIn position-relative min-width-100 d-inline-block"
            style="font-size: 9px"
          >
            Recording
            <v-icon class="ms-2 blink-me-linear" color="red" size="small"
              >lens
            </v-icon>
            <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Spectrum ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
            <div v-if="isRecording || voiceFile" class="center-absolute">
              <u-voice-spectrum-gradient
                :play="isRecording"
                :style="{
                  opacity: isRecording ? 1 : 0.5,
                  display: 'block',
                }"
                class="center-absolute"
                :width="100"
                :height="32"
              />
            </div>
          </div>
        </div>
      </v-slide-x-reverse-transition>

      <v-tooltip
        v-if="error_msg || error"
        activator="parent"
        location="bottom"
        max-width="360"
        content-class="text-start bg-black"
      >
        <div v-html="error_msg ? error_msg : error"></div>
      </v-tooltip>
    </template>
  </u-voice-recorder-continues>
</template>

<script lang="ts">
import { RouteMixin } from "../../../mixin/route/RouteMixin.ts";
import { SetupService } from "@selldone/core-js/server/SetupService";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UVoiceRecorderContinues from "@selldone/components-vue/community/voice/recorder/UVoiceRecorderContinues.vue";
import UVoiceSpectrumGradient from "@selldone/components-vue/community/voice/spectrum/UVoiceSpectrumGradient.vue";
import UButtonAiSmall from "@selldone/components-vue/ui/button/ai/small/UButtonAiSmall.vue";

export default {
  name: "BAiCommander",
  mixins: [RouteMixin],
  emits: ["response", "update:modelValue"],
  components: {
    UButtonAiSmall,
    UVoiceSpectrumGradient,
    UVoiceRecorderContinues,
  },

  props: {
    modelValue: {},

    shop: {
      required: true,
      type: Object,
    },

    endpoint: {
      required: true,
    },
    alignEnd: Boolean,
  },

  data: () => ({
    busy_ai: false,
    progress: 0,

    voice: null,
    voice_file: null,
    error_msg: null,
    currency: SetupService.DefaultCurrency(),
  }),

  computed: {},

  watch: {
    modelValue(val) {
      //this.BlurApp(val);

      if (val) {
        this.voice = null;
        this.voice_file = null;
        this.error_msg = null;
        this.progress = 0;
      }
    },
  },

  created() {
    if (
      this.hasCurrency &&
      this.shop.currencies &&
      this.shop.currencies.length > 0 &&
      !this.shop.currencies.includes(this.currency)
    )
      this.currency = this.shop.currencies && this.shop.currencies[0];
  },

  methods: {
    handleRecording({ blob, src }) {
      this.sendVoiceToServer(blob);
    },

    handleError() {},

    sendVoiceToServer(voice_file) {
      if (!voice_file) return;
      this.error_msg = null;

      this.busy_ai = true;
      this.progress = 0;

      const formData = new FormData();

      formData.append("voice", voice_file, "voice.mp3");

      if (this.hasCurrency && this.currency)
        formData.append("currency", this.currency);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          const pval = Math.floor((e.loaded / (e.total + 0.001)) * 100);
          this.progress = pval;
        },
      };

      axios
        .post(this.endpoint, formData, config)
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showNotificationAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          } else {
            this.$emit("response", data);

            this.$emit("update:modelValue", false);
            if (this.successMessage)
              NotificationService.showSuccessAlert(null, this.successMessage);
          }
        })
        .catch((error) => {
          this.error_msg = this.errorMessage;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_ai = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>

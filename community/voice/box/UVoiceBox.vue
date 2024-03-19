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

<template>
  <div class="text-center">
    <h2>🎙️ Record voice</h2>

    <template v-if="showError">
      Your browser does’t support audio recording or you’ve blocked microphone
      access.
    </template>

    <template v-else>
      <u-voice-recorder
        :mime-type="mimeType"
        :max-duration="maxDuration"
        @error="handleError"
        @stop="handleRecording"
      >
        <template v-slot="{ isRecording, startRecording, stopRecording }">
          <v-slide-x-reverse-transition hide-on-leave>
            <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Mode > Ready to record ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <v-avatar
              v-if="!isRecording"
              class="mt-3 avatar-gradient -thin -blue"
              size="64"
            >
              <v-btn
                class="border-w-medium"
                icon
                variant="flat"
                @click="startRecording"
              >
                <v-icon>mic</v-icon>
              </v-btn>
            </v-avatar>

            <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Mode > In Recording ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
            <div v-else>
              <v-avatar class="mt-3 avatar-gradient -thin -red" size="64">
                <v-btn
                  class="border-w-medium"
                  color="#FFCDD2"
                  icon
                  variant="flat"
                  @click="stopRecording"
                >
                  <v-icon>stop</v-icon>
                </v-btn>
              </v-avatar>

              <span class="ms-2 text-subtitle-2 fadeIn"
                >Recording
                <v-icon class="ms-2 blink-me-linear" color="red" size="small"
                  >lens</v-icon
                ></span
              >
            </div>
          </v-slide-x-reverse-transition>

          <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Spectrum ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <v-expand-transition>
            <div v-if="isRecording || voiceFile">
              <div style="min-height: 128px">
                <u-voice-spectrum
                  :play="isRecording"
                  :style="{ opacity: isRecording ? 1 : 0.5, display: 'block' }"
                  class="mx-auto"
                />
              </div>
            </div>
          </v-expand-transition>
        </template>
      </u-voice-recorder>

      <div v-if="modelValue && !noPlayback" class="d-flex align-center">
        <audio
          :src="modelValue"
          class="my-1 flex-grow-1 rounded me-1"
          controls
        ></audio>
        <v-btn variant="flat" size="40" @click="clear()" title="Clear voice">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script>
import UVoiceRecorder from "../recorder/UVoiceRecorder.vue";
import UVoiceSpectrum from "../spectrum/UVoiceSpectrum.vue";

export default {
  name: "UVoiceBox",
  emits: ["update:modelValue", "update:voiceFile"],
  props: {
    mimeType: {
      type: String,
      default: "audio/webm",
    },
    modelValue: {},
    voiceFile: {},
    maxDuration: {
      type: Number,
      default: 10 * 60, // Default max recording time in seconds (e.g., 10s)
    },
    noPlayback: Boolean, // Do not show playback controls
  },
  data() {
    return {
      showError: false,
    };
  },
  methods: {
    handleError() {
      this.showError = true;
    },
    // eslint-disable-next-line no-unused-vars
    handleRecording({ blob, src }) {
      this.$emit("update:modelValue", src);
      this.$emit("update:voiceFile", blob);
      // console.log("handleRecording", src);
    },
    clear() {
      this.$emit("update:modelValue", null);
      this.$emit("update:voiceFile", null);
    },
  },
  components: {
    UVoiceRecorder,
    UVoiceSpectrum,
  },
};
</script>

<style lang="scss" scoped></style>

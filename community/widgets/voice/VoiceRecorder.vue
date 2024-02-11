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
  <div class="text-center">
    <h2>🎙️ Record voice</h2>

    <template v-if="showError">
      Your browser doesn’t support audio recording or you’ve blocked microphone
      access.
    </template>

    <template v-else>
      <dictaphone
        mime-type="audio/mp3"
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
                fab
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
                  fab
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

          <div style="min-height: 128px">
            <spectrum-analyser
              :play="isRecording"
              :style="{ opacity: isRecording ? 1 : 0.5, display: 'block' }"
              class="mx-auto"
            />
          </div>
        </template>
      </dictaphone>

      <div v-if="value" class="d-flex align-center">
        <audio
          :src="value"
          class="my-1 flex-grow-1 rounded me-1"
          controls
        ></audio>
        <v-btn icon size="large" tile @click="clear()">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script>
import Dictaphone from "./Dictaphone.vue";
import SpectrumAnalyser from "./SpectrumAnalyser.vue";

export default {
  name: "VoiceRecorder",
  props: {
    value: {},
    voiceFile: {},
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
      this.$emit("input", src);
      this.$emit("update:voiceFile", blob);
      // console.log("handleRecording", src);
    },
    clear() {
      this.$emit("input", null);
      this.$emit("update:voiceFile", null);
    },
  },
  components: {
    Dictaphone,
    SpectrumAnalyser,
  },
};
</script>

<style lang="scss" scoped></style>

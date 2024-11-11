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
  <div v-if="mediaRecorder">
    <slot
      :deleteRecording="deleteRecording"
      :isRecording="isRecording"
      :startRecording="startRecording"
      :stopRecording="stopRecording"
    >
    </slot>
  </div>
</template>

<script lang="ts">
export default {
  name: "UVoiceRecorder",
  emits: ["error", "stop"],
  data() {
    return {
      audioBlob: null,
      mediaRecorder: null,
      isRecording: false,
      recordTimeout: null, // Timeout reference
    };
  },
  props: {
    mimeType: {
      type: String,
      default: "audio/webm",
      // Prefer MP3 if supported: audio/mpeg
      // Fallback to WAV if supported: audio/wav
      // Fallback to WebM if supported: audio/webm
    },
    maxDuration: {
      type: Number,
      default: 10 * 60, // Default max recording time in seconds (e.g., 10s)
    },
  },
  methods: {
    startRecording() {
      if (this.isRecording) return; // Prevent starting a new recording if already recording

      this.isRecording = true;
      this.mediaRecorder.start();

      // Automatically stop recording after maxDuration milliseconds
      this.recordTimeout = setTimeout(() => {
        this.stopRecording();
      }, this.maxDuration * 1000);
    },
    stopRecording() {
      if (!this.isRecording) return; // Prevent stopping if not currently recording

      this.isRecording = false;
      this.mediaRecorder.stop();

      if (this.recordTimeout) clearTimeout(this.recordTimeout); // Clear the timeout when recording is manually stopped

      this.recordTimeout = null;
    },
    deleteRecording() {
      this.audioBlob = null;
    },
  },
  watch: {
    audioBlob() {
      this.$emit("stop", {
        blob: this.audioBlob,
        src: URL.createObjectURL(this.audioBlob),
      });
    },
  },
  // eslint-disable-next-line consistent-return
  async mounted() {
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      this.$emit("error", "`navigator.mediaDevices.getUserMedia()` failed.");
      return Promise.resolve();
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: this.mimeType,
    });
    let chunks = [];

    recorder.addEventListener("stop", () => {
      this.audioBlob = new Blob(chunks, { type: this.mediaRecorder.mimeType });
      chunks = [];
    });

    recorder.addEventListener("dataavailable", (e) => {
      chunks.push(e.data);
    });

    this.mediaRecorder = recorder;
  },

  beforeUnmount() {
    if (this.recordTimeout) clearTimeout(this.recordTimeout); // Clear the timeout when recording is manually stopped
  },
};
</script>

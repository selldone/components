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

<script>
export default {
  name: "dictaphone",
  data() {
    return {
      audioBlob: null,
      mediaRecorder: null,
      isRecording: false,
    };
  },
  props: {
    mimeType: {
      type: String,
      default: "audio/webm",
    },
  },
  methods: {
    startRecording() {
      this.isRecording = true;
      this.mediaRecorder.start();
    },
    stopRecording() {
      this.isRecording = false;
      this.mediaRecorder.stop();
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

    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.addEventListener("stop", () => {
      this.audioBlob = new Blob(chunks, { type: this.mimeType });
      chunks = [];
    });

    recorder.addEventListener("dataavailable", (e) => {
      chunks.push(e.data);
    });

    this.mediaRecorder = recorder;
  },
};
</script>

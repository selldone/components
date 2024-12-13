<template>
  <div v-if="mediaRecorder">
    <slot
      :deleteRecording="deleteRecording"
      :isRecording="isRecording"
      :startRecording="startRecording"
      :stopRecording="stopRecording"
      :isListening="isListening"
      :error="error"
    >
    </slot>
  </div>
  <span v-else>
    <v-icon>hourglass_empty</v-icon>
    <v-tooltip content-class="text-start bg-red">
      We can not initialize the voice recorder. Please make sure you have a
      microphone connected and enabled. If it's ok reassign permission to
      microphone and refresh page.
    </v-tooltip>
  </span>
</template>

<script lang="ts">
import { SoundHelper } from "@selldone/core-js/helper/sound/SoundHelper";

export default {
  name: "UVoiceRecorderContinues",
  emits: ["error", "stop"],
  data() {
    return {
      audioBlob: null,
      mediaRecorder: null,
      isRecording: false,
      recordTimeout: null, // Timeout reference for max duration
      isListening: false, // Indicates if the keyword listener is active
      error: null, // To capture any errors
      silenceTimeout: null, // Timeout reference for silence detection
      audioContext: null, // Web Audio API context
      analyser: null, // Analyser node for silence detection
      dataArray: null, // Data array for audio levels
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
      default: 30, // Max recording time in seconds
    },
    keyword: {
      type: String,
      default: "hey", // Keyword to trigger recording
    },
    silenceThreshold: {
      type: Number,
      default: 0.01, // Threshold for silence detection
    },
    silenceDuration: {
      type: Number,
      default: 3000, // 3 seconds of silence to stop recording
    },
  },
  methods: {
    async initializeMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.setupMediaRecorder(stream);
        this.setupAudioContext(stream);
        this.startKeywordListener(stream);
      } catch (err) {
        console.debug(err);
        this.error = "`navigator.mediaDevices.getUserMedia()` failed.";
        this.$emit("error", this.error);
      }
    },
    setupMediaRecorder(stream) {
      const recorder = new MediaRecorder(stream, {
        mimeType: this.mimeType,
      });
      let chunks = [];

      recorder.addEventListener("stop", () => {
        this.audioBlob = new Blob(chunks, { type: recorder.mimeType });
        chunks = [];
      });

      recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
      });

      this.mediaRecorder = recorder;
    },
    setupAudioContext(stream) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.fftSize);
    },
    startKeywordListener(stream) {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        this.error =
          "The Speech Recognition API is not supported in this browser. Please use the buttons to manually start and stop recording.";

        this.$emit("error", this.error);
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript
              .trim()
              .toLowerCase();
            if (transcript.includes(this.keyword.toLowerCase())) {
              this.startRecording();
            }
          }
        }
      };

      recognition.onerror = (event) => {
        this.error = `Speech Recognition Error: ${event.error}`;
        this.$emit("error", this.error);
      };

      recognition.onend = () => {
        this.isListening = false;
        // Restart recognition to keep listening
        recognition.start();
      };

      recognition.start();
    },
    async startRecording() {
      if (this.isRecording) return; // Prevent starting a new recording if already recording

      this.error = null;
      await SoundHelper.playBubble();
      this.isRecording = true;
      this.mediaRecorder.start();

      // Automatically stop recording after maxDuration seconds
      this.recordTimeout = setTimeout(() => {
        this.stopRecording();
      }, this.maxDuration * 1000);

      // Start monitoring silence
      this.monitorSilence();
    },
    stopRecording() {
      if (!this.isRecording) return; // Prevent stopping if not currently recording

      this.isRecording = false;
      this.mediaRecorder.stop();

      SoundHelper.playDoubleBubble();

      if (this.recordTimeout) {
        clearTimeout(this.recordTimeout);
        this.recordTimeout = null;
      }

      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
    },
    deleteRecording() {
      this.audioBlob = null;
    },
    monitorSilence() {
      const checkSilence = () => {
        this.analyser.getByteTimeDomainData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          const sample = this.dataArray[i] / 128 - 1;
          sum += sample * sample;
        }
        const rms = Math.sqrt(sum / this.dataArray.length);
        if (rms < this.silenceThreshold) {
          if (!this.silenceTimeout) {
            this.silenceTimeout = setTimeout(() => {
              this.stopRecording();
            }, this.silenceDuration);
          }
        } else {
          if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
          }
        }

        if (this.isRecording) {
          requestAnimationFrame(checkSilence);
        }
      };

      requestAnimationFrame(checkSilence);
    },
  },
  watch: {
    audioBlob() {
      if (this.audioBlob) {
        this.$emit("stop", {
          blob: this.audioBlob,
          src: URL.createObjectURL(this.audioBlob),
        });
      }
    },
  },
  async mounted() {
    await this.initializeMedia();
  },
  beforeUnmount() {
    if (this.recordTimeout) clearTimeout(this.recordTimeout);
    if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
    if (this.audioContext) this.audioContext.close();
  },
};
</script>

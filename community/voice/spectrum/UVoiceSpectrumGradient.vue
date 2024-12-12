<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <canvas v-if="points" ref="canvas" :height="height" :width="width"></canvas>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

export default defineComponent({
  name: "UVoiceSpectrumGradient",
  props: {
    width: {
      type: Number,
      default: 512,
    },
    height: {
      type: Number,
      default: 128,
    },
    play: {
      type: Boolean,
      default: false,
    },
    // Optional: You can define gradient colors as props for customization
    gradientColors: {
      type: Array,
      default: () => ["#ff0000", "#00ff00", "#0000ff"], // Red to Green to Blue
    },
  },
  emits: ["error"],
  setup(props, { emit }) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const spectrum = ref<Uint8Array | null>(null);
    let context: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let animationId: number | null = null;

    const points = computed(() => {
      if (!spectrum.value) {
        return null;
      }

      const pointsArray = [];
      const dataLength = spectrum.value.length;
      const sliceWidth = props.width / dataLength;

      let x = 0;
      for (let i = 0; i < dataLength; i++) {
        const v = spectrum.value[i] / 255.0;
        const y = v * props.height;
        pointsArray.push({ x, y });
        x += sliceWidth;
      }

      return pointsArray;
    });

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        context = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        analyser = context.createAnalyser();
        analyser.fftSize = 256; // Adjust for resolution
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);

        updateData();
      } catch (error) {
        emit("error", "`navigator.mediaDevices.getUserMedia()` failed.");
        console.error(error);
      }
    };

    const updateData = () => {
      if (!analyser || !dataArray) return;

      analyser.getByteFrequencyData(dataArray);
      spectrum.value = dataArray.slice();

      if (props.play) {
        animationId = requestAnimationFrame(updateData);
      }
    };

    const draw = () => {
      if (!canvas.value || !points.value) return;
      const ctx = canvas.value.getContext("2d");
      if (!ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, props.width, props.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, props.width, 0);
      const colorStops = props.gradientColors.length;
      props.gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (colorStops - 1), color);
      });

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(points.value[0].x, props.height / 2 + points.value[0].y / 2);

      // Draw the top half of the spectrum
      for (let i = 1; i < points.value.length; i++) {
        ctx.lineTo(points.value[i].x, props.height / 2 + points.value[i].y / 2);
      }

      // Draw the bottom half (mirrored)
      for (let i = points.value.length - 1; i >= 0; i--) {
        ctx.lineTo(points.value[i].x, props.height / 2 - points.value[i].y / 2);
      }

      ctx.closePath();
      ctx.fill();
    };

    const renderCanvas = () => {
      draw();
    };

    onMounted(() => {
      setupAudio();

      // Start the rendering loop
      watch(points, () => {
        renderCanvas();
      });
    });

    onBeforeUnmount(() => {
      if (context) context.close();
      if (animationId) cancelAnimationFrame(animationId);
    });

    return {
      canvas,
      points,
    };
  },
});
</script>

<style scoped>
canvas {
  display: block;
}
</style>

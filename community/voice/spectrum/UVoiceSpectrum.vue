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
  <canvas
    v-if="points"
    v-render="points"
    :height="height"
    :width="width"
  ></canvas>
</template>

<script lang="ts">
export default {
  name: "UVoiceSpectrum",
  props: {
    width: {
      type: Number,
      default: 512,
    },
    height: {
      type: Number,
      default: 128,
    },
    fillStyle: {
      type: String,
      default: "#000",
    },
    play: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      spectrum: null,

      context: null,
      analyser: null,
      dataArray: null,
    };
  },
  computed: {
    points() {
      if (!this.spectrum) {
        return null;
      }

      const points = [];

      const dataLength =
        this.spectrum.length || Object.keys(this.spectrum).length;
      const sliceWidth = (this.width * 1.0) / dataLength;

      let x = 0;
      for (let i = 0; i < dataLength; i += 1) {
        const v = this.spectrum[i] / 255.0;
        const y = v * this.height;
        points.push([x, y]);
        x += sliceWidth;
      }

      return points;
    },
  },

  watch: {
    play() {
      this.updateData();
    },
  },
  directives: {
    render: {
      beforeMount(el, binding, vnode, prevVnode) {
        el.context = el.getContext("2d");
      },
      updated(el, binding, vnode, prevVnode) {
        const context = el.context;

        const width = el.width;
        const height = el.height;

        const points = binding.value;

        context.fillStyle = vnode.props.fillStyle;

        context.clearRect(0, 0, width, height);
        context.beginPath();

        context.moveTo(points[0][0], height / 2 + points[0][1] / 2);

        for (let i = 1; i < points.length; i += 1) {
          context.lineTo(points[i][0], height / 2 + points[i][1] / 2);
        }

        for (let i = points.length - 1; i >= 0; i -= 1) {
          context.lineTo(points[i][0], height / 2 - points[i][1] / 2);
        }

        context.fill();
      },
    },
  },
  mounted() {
    this.generate();
  },

  methods: {
    async generate() {
      let stream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        this.$emit("error", "`navigator.mediaDevices.getUserMedia()` failed.");
        return Promise.resolve();
      }

      this.context = new AudioContext();

      this.analyser = this.context.createAnalyser();
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const source = this.context.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.updateData();
    },
    updateData() {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.spectrum = this.dataArray.slice();

      if (this.play) requestAnimationFrame(this.updateData);
    },
  },

  beforeUnmount() {
    if (this.context) this.context.close();
  },
};
</script>

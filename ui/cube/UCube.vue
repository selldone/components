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
  <div class="scene text-center">
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
export default {
  name: "UCube",

  props: {
    size: {
      required: false,
      type: Number,
      default: 200,
    },

    x: {
      required: false,
      type: Number,
      default: 100,
    },
    y: {
      required: false,
      type: Number,
      default: 100,
    },
    z: {
      required: false,
      type: Number,
      default: 100,
    },

    color: {
      required: false,
      type: String,
      default: "#795548",
    },
    noAnimation: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    scale() {
      let scale = (0.4 * this.size) / Math.max(this.x, this.y, this.z);
      return scale > 1 ? 1 : scale;
    },
  },
  watch:{
    x(){
      this.draw()
    },
    y(){
      this.draw()
    },
    z(){
      this.draw()
    },
    size(){
      this.draw()
    },
    color(){
      this.draw()
    },
  },
  data() {
    return {
      ctx: null,
    };
  },

  mounted() {
    // Set up our canvas
    let canvas = this.$refs.canvas;
    canvas.width = this.size;
    canvas.height = this.size;
    this.ctx = canvas.getContext("2d");

    this.draw();
  },
  methods: {
    // Animation function

    draw() {
      const size = this.size;
      const ctx = this.ctx;

      // clear the canvas
      ctx.clearRect(0, 0, size, size);

      // Wobble the cube using a sine wave
      const wobble = this.noAnimation
        ? size / 4
        : (Math.sin(Date.now() / 250) * size * this.scale) / 50;

      // draw the cube
      this.drawCube(
        size / 2,
        size / 2 + wobble + (this.z * this.scale) / 2 + (size > 100 ? 15 : 0),
        Number(this.x * this.scale),
        Number(this.y * this.scale),
        Number(this.z * this.scale),
        this.color,
      );

      if (!this.noAnimation) requestAnimationFrame(this.draw);
    },
    // Draw a cube to the specified specs
    drawCube(x, y, wx, wy, h, color) {
      const ctx = this.ctx;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - wx, y - wx * 0.5);
      ctx.lineTo(x - wx, y - h - wx * 0.5);
      ctx.lineTo(x, y - h * 1);
      ctx.closePath();
      ctx.fillStyle = this.shadeColor(color, -10);
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + wy, y - wy * 0.5);
      ctx.lineTo(x + wy, y - h - wy * 0.5);
      ctx.lineTo(x, y - h * 1);
      ctx.closePath();
      ctx.fillStyle = this.shadeColor(color, 10);
      ctx.strokeStyle = this.shadeColor(color, 50);
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x - wx, y - h - wx * 0.5);
      ctx.lineTo(x - wx + wy, y - h - (wx * 0.5 + wy * 0.5));
      ctx.lineTo(x + wy, y - h - wy * 0.5);
      ctx.closePath();
      ctx.fillStyle = this.shadeColor(color, 20);
      ctx.strokeStyle = this.shadeColor(color, 60);
      ctx.stroke();
      ctx.fill();
    },
    // Colour adjustment function
    // Nicked from http://stackoverflow.com/questions/5560248
    shadeColor(color, percent) {
      color = color.substring(1);
      let num = parseInt(color, 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00ff) + amt,
        B = (num & 0x0000ff) + amt;
      return (
        "#" +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.scene {
  position: relative;
  margin: 0;
  padding: 0;
  // background: white;
  overflow: visible;
}
</style>

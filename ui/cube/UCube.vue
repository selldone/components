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

<script>
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

  mounted() {
    let size = this.size;
    // Set up our canvas
    let canvas = this.$refs.canvas;
    canvas.width = size;
    canvas.height = size;
    let ctx = canvas.getContext("2d");

    // Animation function

    let t = this;

    function draw() {
      // clear the canvas
      ctx.clearRect(0, 0, size, size);

      // Wobble the cube using a sine wave
      const wobble = t.noAnimation
        ? 0
        : (Math.sin(Date.now() / 250) * size * t.scale) / 50;

      // draw the cube
      drawCube(
        size / 2,
        size / 2 + wobble + (t.z * t.scale) / 2 + (size > 100 ? 15 : 0),
        Number(t.x * t.scale),
        Number(t.y * t.scale),
        Number(t.z * t.scale),
        t.color,
      );

      if (!t.noAnimation) requestAnimationFrame(draw);
    }

    draw();

    // Colour adjustment function
    // Nicked from http://stackoverflow.com/questions/5560248
    function shadeColor(color, percent) {
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
    }

    // Draw a cube to the specified specs
    function drawCube(x, y, wx, wy, h, color) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - wx, y - wx * 0.5);
      ctx.lineTo(x - wx, y - h - wx * 0.5);
      ctx.lineTo(x, y - h * 1);
      ctx.closePath();
      ctx.fillStyle = shadeColor(color, -10);
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + wy, y - wy * 0.5);
      ctx.lineTo(x + wy, y - h - wy * 0.5);
      ctx.lineTo(x, y - h * 1);
      ctx.closePath();
      ctx.fillStyle = shadeColor(color, 10);
      ctx.strokeStyle = shadeColor(color, 50);
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x - wx, y - h - wx * 0.5);
      ctx.lineTo(x - wx + wy, y - h - (wx * 0.5 + wy * 0.5));
      ctx.lineTo(x + wy, y - h - wy * 0.5);
      ctx.closePath();
      ctx.fillStyle = shadeColor(color, 20);
      ctx.strokeStyle = shadeColor(color, 60);
      ctx.stroke();
      ctx.fill();
    }
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

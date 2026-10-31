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
  <div v-if="modern" ref="preview" class="u-cube-modern">
    <svg
      :viewBox="`0 0 ${previewWidth} 180`"
      role="img"
      :aria-label="
        $t('add_product.shipping_modern.preview_accessibility', {
          width: formatted(x),
          length: formatted(y),
          height: formatted(z),
          unit,
        })
      "
      :class="{ 'u-cube-modern--empty': !validDimensions }"
    >
      <polygon :points="modernGeometry.front" class="u-cube-modern__front" />
      <polygon :points="modernGeometry.side" class="u-cube-modern__side" />
      <polygon :points="modernGeometry.top" class="u-cube-modern__top" />
      <g v-for="axis in modernGeometry.axes" :key="axis.name">
        <path :d="axis.path" />
        <text :x="axis.x" :y="axis.y">
          {{ $t("add_product.shipping_modern." + axis.name + "_short") }}
        </text>
      </g>
    </svg>
  </div>
  <div v-else class="scene text-center">
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
export default {
  name: "UCube",

  props: {
    modern: { type: Boolean, default: false },
    unit: { type: String, default: "" },
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
    validDimensions() {
      return [this.x, this.y, this.z].every(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      );
    },
    modernGeometry() {
      const [width, length, height] = this.validDimensions
        ? [Number(this.x), Number(this.y), Number(this.z)]
        : [50, 50, 50];
      const scale = Math.min(
        (this.previewWidth - 55) / (width + length),
        102 / height,
        1.3,
      );
      const w = width * scale * 0.8,
        l = length * scale * 0.8,
        h = height * scale * 0.8;
      const cx = (this.previewWidth + w - l) / 2,
        cy = 124;
      const p = {
        a: [cx, cy],
        b: [cx - w, cy - w * 0.35],
        c: [cx + l, cy - l * 0.35],
        d: [cx, cy - h],
        e: [cx - w, cy - w * 0.35 - h],
        f: [cx + l, cy - l * 0.35 - h],
        g: [cx - w + l, cy - (w + l) * 0.35 - h],
      };
      const points = (names) =>
        names.map((name) => p[name].join(",")).join(" ");
      const edges = [
        { name: "width", a: [p.b[0], p.b[1] + 13], b: [p.a[0], p.a[1] + 13] },
        {
          name: "length",
          a: [p.a[0] + 4, p.a[1] + 13],
          b: [p.c[0] + 4, p.c[1] + 13],
        },
        { name: "height", a: [p.c[0] + 13, p.c[1]], b: [p.f[0] + 13, p.f[1]] },
      ];
      return {
        front: points(["a", "b", "e", "d"]),
        side: points(["a", "c", "f", "d"]),
        top: points(["d", "e", "g", "f"]),
        axes: edges.map((axis) => ({
          name: axis.name,
          path: `M${axis.a} L${axis.b}`,
          x: (axis.a[0] + axis.b[0]) / 2 + (axis.name === "height" ? 8 : 0),
          y: (axis.a[1] + axis.b[1]) / 2 + (axis.name === "height" ? 4 : 13),
        })),
      };
    },
    scale() {
      let scale = (0.4 * this.size) / Math.max(this.x, this.y, this.z);
      return scale > 1 ? 1 : scale;
    },
  },
  watch: {
    x() {
      this.draw();
    },
    y() {
      this.draw();
    },
    z() {
      this.draw();
    },
    size() {
      this.draw();
    },
    color() {
      this.draw();
    },
  },
  data() {
    return {
      ctx: null,
      previewWidth: 190,
      previewObserver: null,
    };
  },

  mounted() {
    if (this.modern) {
      this.previewObserver = new ResizeObserver((entries) => {
        this.previewWidth = Math.max(130, entries[0].contentRect.width);
      });
      this.previewObserver.observe(this.$refs.preview);
      return;
    }
    // Set up our canvas
    let canvas = this.$refs.canvas;
    canvas.width = this.size;
    canvas.height = this.size;
    this.ctx = canvas.getContext("2d");

    this.draw();
  },
  beforeUnmount() {
    this.previewObserver?.disconnect();
  },
  methods: {
    formatted(value) {
      return Number(value).toLocaleString(
        this.$vuetify?.locale?.isRtl ? "fa-IR" : "en-US",
        { maximumFractionDigits: 3 },
      );
    },
    // Animation function

    draw() {
      const size = this.size;
      const ctx = this.ctx;

      if (!this.ctx) return;

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
.u-cube-modern {
  min-width: 0;
  width: 100%;
  svg {
    display: block;
    width: 100%;
    height: 180px;
    overflow: visible;
  }
  polygon {
    stroke: var(--sd-modern-muted);
    stroke-width: 1.1;
    stroke-linejoin: round;
    fill: var(--sd-modern-inset);
  }
  &__side {
    fill: color-mix(
      in srgb,
      rgb(var(--v-theme-on-surface)) 9%,
      rgb(var(--v-theme-surface))
    );
  }
  &__top {
    fill: rgb(var(--v-theme-surface));
  }
  path {
    stroke: var(--sd-modern-border);
    stroke-width: 1;
    fill: none;
  }
  text {
    font-family: inherit;
    font-size: 11px;
    font-weight: 400;
    fill: var(--sd-modern-muted);
    text-anchor: middle;
  }
  &--empty {
    opacity: 0.5;
  }
}
</style>

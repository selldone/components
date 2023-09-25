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
  <div
    class="position-relative canvas-container"
    :style="image ? `background-image:url('${image}')` : undefined"
  >
    <v-fade-transition>
      <div v-if="editable && show_menu" class="toolbar-op">
        <v-btn @click="clearAll" tile outlined small class="m-1" dark
          >Clear all</v-btn
        >
        <v-btn
          v-if="selected_rect"
          tile
          @click="RemoveSelected"
          outlined
          dark
          small
          class="m-1"
          >Remove selected</v-btn
        >

        <v-btn
          @click="show_upload = !show_upload"
          tile
          dark
          outlined
          small
          class="m-1"
          >{{ show_upload ? "Back" : "Upload Image" }}</v-btn
        >
        <v-slider
          :value="ratio"
          @input="(val) => $emit('update:ratio', val)"
          :step="0.01"
          :min="0.5"
          :max="2"
          class="mt-1"
          dense
          hide-details
          color="#fff"
        >
          <template slot="prepend">
            <span class="small text-nowrap text-white">Aspect ratio: </span>
          </template>

          <template slot="append">
            <input
              :value="ratio"
              @input="(val) => $emit('update:ratio', val)"
              style="width: 48px"
              class="small font-weight-bold text-white"
            />
          </template>
        </v-slider>

        <div v-if="selected_rect" class="d-flex">
          <div class="w-50">
            <span class="small text-nowrap text-white">Caption: </span>
            <input
              v-model="selected_rect.caption"
              class="small font-weight-bold text-white"
              placeholder="Type caption..."
              @blur="drawAll()"
            />
          </div>
          <div class="w-50">
            <span class="small text-nowrap text-white">Header: </span>
            <input
              v-model="selected_rect.header"
              class="small font-weight-bold text-white"
              placeholder="Type header..."
              @blur="drawAll()"
            />
          </div>
        </div>
      </div>
    </v-fade-transition>

    <v-btn
      v-if="editable"
      icon
      @click="show_menu = !show_menu"
      class="absolute-top-end z2"
      dark
      ><v-icon>{{ show_menu ? "close" : "settings" }}</v-icon>
    </v-btn>

    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      class="canvas-style"
      :class="{ dragged: move }"
    ></canvas>

    <div v-if="show_upload && editable" class="setting-overlay">
      <image-uploader
        class="center-absolute m-3 w-100"
        contenteditable="false"
        :server="uploadUrl"
        :image="bg_image"
        @new-url="(url) => setBg(url)"
      />
    </div>

    <slot></slot>
  </div>
</template>

<script>
import ImageUploader from "@/Components/uploader/ImageUploader.vue";
export default {
  name: "SImageCanvas",
  components: { ImageUploader },
  props: {
    ratio: {
      default: 1.6,
    },

    image: {},
    rects: {},

    editable: {
      type: Boolean,
      default: false,
    },
    uploadUrl: {
      required: false,
      default: "",
      type: String,
    },
  },
  data() {
    return {
      show_menu: true,

      canvas: null,
      ctx: null,
      drag: false,
      move: false,

      //----------
      selected_rect: null,
      selected_offset_x: 0,
      selected_offset_y: 0,

      //--------------
      show_upload: false,
    };
  },

  computed: {
    bg_image() {
      return this.muted_pack ? this.muted_pack.bg : null;
    },
    width() {
      return window.innerWidth > 800 ? 624 : window.innerWidth - 80;
    },
    height() {
      return this.width / this.ratio;
    },

    scale() {
      return this.width / 624;
    },
  },

  watch: {
    ratio(ratio) {
      this.$nextTick(() => {
        this.drawAll();
      });
    },
  },

  mounted() {
    if (!this.rects || !Array.isArray(this.rects))
      this.$emit("update:rects", []);

    const canvas = (this.canvas = this.$refs.canvas);
    const ctx = (this.ctx = this.canvas.getContext("2d"));
    let rect = {};

    const that = this;

    function mouseDown(e) {
      if (!that.editable) return;

      that.selected_rect = findRect(e.offsetX, e.offsetY);
      if (that.selected_rect) {
        (that.move = true),
          (that.selected_offset_x = e.offsetX - that.selected_rect.startX);
        that.selected_offset_y = e.offsetY - that.selected_rect.startY;
        drawAll();

        return;
      }
      (that.move = false), (rect = {});
      rect.startX = e.offsetX;
      rect.startY = e.offsetY;
      that.drag = true;
    }
    function findRect(x, y) {
      x = x / that.scale;
      y = y / that.scale;

      return that.rects.find((rect) => {
        //console.log(x,y,'rect',rect)
        return (
          rect.startX < x &&
          rect.startY < y &&
          rect.startX + rect.w > x &&
          rect.startY + rect.h > y
        );
      });
    }

    function mouseUp() {
      if (that.drag) {
        that.drag = false;

        let new_rect = {
          startX: rect.w > 0 ? rect.startX : rect.startX + rect.w,
          startY: rect.h > 0 ? rect.startY : rect.startY + rect.h,
          w: Math.abs(rect.w),
          h: Math.abs(rect.h),
        };
        if (new_rect.w > 30 && new_rect.h > 30) {
          new_rect.startX = new_rect.startX / that.scale;
          new_rect.startY = new_rect.startY / that.scale;
          new_rect.w = new_rect.w / that.scale;
          new_rect.h = new_rect.h / that.scale;
          that.rects.push(new_rect);
        }
      }
      that.move = false;

      drawAll();
    }
    function mouseMove(e) {
      if (that.drag) {
        rect.w = e.offsetX - rect.startX;
        rect.h = e.offsetY - rect.startY;
        drawAll();
        drawDraft();
      } else if (that.move && that.selected_rect) {
        that.selected_rect.startX = e.offsetX - that.selected_offset_x;
        that.selected_rect.startY = e.offsetY - that.selected_offset_y;

        drawAll();
      }
    }

    function drawDraft() {
      that.ctx.setLineDash([6]);
      that.ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
    }

    function drawAll() {
      that.drawAll();
    }

    this.canvas.addEventListener("mousedown", mouseDown, false);
    this.canvas.addEventListener("mouseup", mouseUp, false);
    this.canvas.addEventListener("mousemove", mouseMove, false);

    drawAll();
  },

  methods: {
    drawAll() {
      const canvas = this.canvas;
      const ctx = this.ctx;

      ctx.globalCompositeOperation = "source-over";

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.rects.forEach((rect) => {
        ctx.setLineDash([]);
        ctx.fillStyle =
          this.selected_rect === rect ? "rgba(255,0,0,0.51)" : "#fff";
        ctx.globalCompositeOperation =
          this.selected_rect === rect ? "source-over" : "destination-out";

        // ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);

        roundRect(
          ctx,
          rect.startX * this.scale,
          rect.startY * this.scale,
          rect.w * this.scale,
          rect.h * this.scale,
          12 * this.scale,
          true,
          false
        );

        if (rect.caption) {
          ctx.textAlign = "left";
          ctx.globalCompositeOperation = "source-over";
          ctx.font = `${11 * this.scale}px`;
          ctx.fillText(
            rect.caption,
            rect.startX * this.scale,
            (rect.startY + rect.h + 12) * this.scale
          );
        }

        if (rect.header) {
          ctx.textAlign = "center";
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "#333";
          ctx.font = `800 ${28 * this.scale}px`;
          ctx.fillText(
            rect.header,
            (rect.startX + rect.w / 2) * this.scale,
            (rect.startY + rect.h / 2 + 12) * this.scale
          );
        }
      });
    },

    clearAll() {
      this.$emit("update:rects", []);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    RemoveSelected() {
      this.remove(this.rects, this.selected_rect);
      this.drawAll();
    },

    setBg(path) {
      console.log("setBg", path);
      this.$emit("update:image", path);
      this.show_upload = false;
    },
  },
};

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
</script>

<style scoped lang="scss">
.canvas-style {
  position: relative;
  left: 0;
  top: 0;
  //  background-color: rgba(102, 153, 170, 0.85);
  vertical-align: bottom;
  opacity: 0.8;
  transition: all 0.4s;

  &.dragged {
    cursor: move;
  }
}

.canvas-container {
  min-height: 48px;
  min-width: 48px;

  width: max-content;
  height: max-content;
  // max-height: 400px;
  border-radius: 14px;
  //  border: rgb(204, 214, 221) solid 1px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 50px 3px rgba(68, 68, 68, 0.22) !important;
  transition: all 0.4s;
  margin: auto auto 16px;

  background-repeat: no-repeat;
  background-size: 100% auto;
  background-position: top left;

  &:hover {
    box-shadow: 0px 3px 20px 2px rgba(68, 68, 68, 0.22) !important;
    /**
    &:after {
      transform: scale(1);
    }*/

    .canvas-style {
      opacity: 1;
    }
  }

  .toolbar-op {
    position: absolute;
    z-index: 2;
    width: 100%;
    opacity: 0.7;
    transition: all 0.4s;
    overflow-x: auto;
    overflow-y: hidden;
    box-shadow: 0px 10px 50px 5px rgba(113, 112, 112, 0.5) !important;

    padding: 4px 8px;
    background-color: #0c91d3;
    color: #fff;

    &:hover {
      opacity: 1;
    }
  }

  .image-b {
    position: absolute;
    left: 0;
    top: 0;
  }
  .setting-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
  }
}
</style>

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
  >
    <v-fade-transition>
      <v-sheet v-if="editable && show_menu" class="toolbar-op">
        <v-btn
          class="sd-modern-button sd-modern-button--compact"
          @click="clearAll"
          variant="text"
          prepend-icon="layers_clear"
          >{{ $t('global.article.inline_tools.clear_all') }}
        </v-btn>
        <v-btn
          v-if="selected_rect"
          class="sd-modern-button sd-modern-button--compact"
          variant="text"
          @click="RemoveSelected"
          prepend-icon="close"
          >{{ $t('global.article.inline_tools.remove_selected') }}
        </v-btn>

        <v-btn
          class="sd-modern-button sd-modern-button--compact"
          variant="text"
          @click="show_upload = !show_upload"
          prepend-icon="image"
          >{{ show_upload ? $t('global.actions.back') : $t('global.article.inline_tools.upload_image') }}
        </v-btn>
        <v-slider
          :max="2"
          :min="0.5"
          :model-value="ratio"
          :step="0.01"
          class="mt-2"
          density="compact"
          hide-details
          @update:model-value="setRatio"
        >
          <template v-slot:prepend>
            <span class="canvas-setting-label">{{ $t('global.article.inline_tools.aspect_ratio') }}</span>
          </template>

          <template v-slot:append>
            <v-text-field
              :model-value="ratio"
              class="canvas-ratio"
              style="width: 48px"
              variant="plain"
              hide-details
              single-line
              @update:model-value="setRatio"
            />
          </template>
        </v-slider>

        <v-expand-transition>
          <div v-if="selected_rect" class="canvas-setting-fields">
            <div>
              <v-text-field
                :model-value="selected_rect.caption"
                :label="$t('global.article.inline_tools.caption')"
                class="sd-modern-underlined-field"
                @update:model-value="setSelected('caption', $event)"
                @blur="drawAll()"
                variant="underlined"
                hide-details
              />
            </div>
            <div>
              <v-text-field
                :model-value="selected_rect.header"
                :label="$t('global.article.inline_tools.header')"
                class="sd-modern-underlined-field"
                @update:model-value="setSelected('header', $event)"
                @blur="drawAll()"
                variant="underlined"
                hide-details
              />
            </div>
          </div>
        </v-expand-transition>
      </v-sheet>
    </v-fade-transition>

    <div class="canvas-picture" :style="{ backgroundImage: image ? `url('${image}')` : undefined }">
    <canvas
      ref="canvas"
      :class="{ dragged: move, '-editable': editable }"
      :height="height"
      :width="width"
      class="canvas-style"
    ></canvas>

    <div v-if="show_upload && editable" class="setting-overlay">
      <s-image-uploader
        :image="bg_image"
        :server="uploadUrl"
        class="center-absolute m-3 w-100"
        contenteditable="false"
        max-file-size="2MB"
        @new-url="(url) => setBg(url)"
      />
    </div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import { ArticleMixin } from "../../../../mixin/article/ArticleMixin.ts";
import { articleAddonContext } from "../../toolbar/article-addon-context";

export default {
  name: "AAddonCanvasEditor",
  emits: ["update:image", "update:rects", "update:ratio", "change"],
  mixins: [ArticleMixin],
  components: { SImageUploader },
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
      show_menu: false,
      render_width: 624,

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
      return this.image;
    },
    width() {
      return this.render_width;
    },
    height() {
      return this.width / this.ratio;
    },

    scale() {
      return this.width / 624;
    },
  },

  watch: {
    editable(value) { if (!value) { this.show_menu = false; this.show_upload = false; this.selected_rect = null; this.drag = false; this.move = false; this.$nextTick(() => this.drawAll()); } },
    width() { this.$nextTick(() => this.drawAll()); },
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
      if (!that.editingContext()) return;
      canvas.setPointerCapture?.(e.pointerId);

      that.selected_rect = findRect(e.offsetX, e.offsetY);
      if (that.selected_rect) {
        (that.move = true),
          (that.selected_offset_x = e.offsetX / that.scale - that.selected_rect.startX);
        that.selected_offset_y = e.offsetY / that.scale - that.selected_rect.startY;
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
      if (!that.editingContext()) { that.drag = false; that.move = false; return; }
      const changed = that.drag || that.move;
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
      if (changed) that.$emit("change");
    }

    function mouseMove(e) {
      if (!that.editingContext()) return;
      if (that.drag) {
        rect.w = e.offsetX - rect.startX;
        rect.h = e.offsetY - rect.startY;
        drawAll();
        drawDraft();
      } else if (that.move && that.selected_rect) {
        that.selected_rect.startX = e.offsetX / that.scale - that.selected_offset_x;
        that.selected_rect.startY = e.offsetY / that.scale - that.selected_offset_y;

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

    this._canvasHandlers = { pointerdown: mouseDown, pointerup: mouseUp, pointermove: mouseMove, pointercancel: () => { const changed = this.move; this.drag = false; this.move = false; this.drawAll(); if (changed) this.$emit("change"); } };
    Object.entries(this._canvasHandlers).forEach(([name, handler]) => canvas.addEventListener(name, handler));
    this._canvasResize = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) this.render_width = Math.min(624, Math.round(entry.contentRect.width));
    });
    this._canvasResize.observe(this.$el);

    drawAll();
  },
  beforeUnmount() {
    this._canvasResize?.disconnect();
    Object.entries(this._canvasHandlers || {}).forEach(([name, handler]) => this.canvas?.removeEventListener(name, handler));
  },

  methods: {
    editingContext() { return this.editable && articleAddonContext(this.$el.closest('.image-overlay-canvas')); },
    toggleSettings() { if (this.editingContext()) this.show_menu = !this.show_menu; },
    setRatio(value) {
      const ratio = Number(value);
      if (!this.editingContext() || !Number.isFinite(ratio) || ratio < 0.5 || ratio > 2) return;
      this.$emit("update:ratio", ratio);
      this.$emit("change");
    },
    setSelected(key, value) {
      if (!this.editingContext() || !this.selected_rect) return;
      this.selected_rect[key] = value;
      this.$emit("change");
    },
    drawAll() {
      const canvas = this.canvas;
      const ctx = this.ctx;
      if (!canvas || !ctx) return;

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
          false,
        );

        if (rect.caption) {
          ctx.textAlign = "left";
          ctx.globalCompositeOperation = "source-over";
          ctx.font = `${11 * this.scale}px`;
          ctx.fillText(
            rect.caption,
            rect.startX * this.scale,
            (rect.startY + rect.h + 12) * this.scale,
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
            (rect.startY + rect.h / 2 + 12) * this.scale,
          );
        }
      });
    },

    clearAll() {
      if (!this.editingContext()) return;
      this.$emit("update:rects", []);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.selected_rect = null;
      this.$emit("change");
    },
    RemoveSelected() {
      if (!this.editingContext() || !this.selected_rect) return;
      const index = this.rects.indexOf(this.selected_rect);
      if (index < 0) return;
      this.rects.splice(index, 1);
      this.selected_rect = null;
      this.drawAll();
      this.$emit("change");
    },

    setBg(path) {
      if (!this.editingContext()) return;
      this.$emit("update:image", path);
      this.show_upload = false;
      this.$emit("change");
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
    y + height,
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

<style lang="scss" scoped>
.canvas-style {
  position: relative;
  left: 0;
  top: 0;
  //  background-color: rgba(102, 153, 170, 0.85);
  vertical-align: bottom;
  display: block;
  max-width: 100%;
  &.-editable { touch-action: none; }

  &.dragged {
    cursor: move;
  }
}

.canvas-container {
  min-height: 48px;
  min-width: 48px;

  width: 100%;
  max-width: 624px;
  height: max-content;
  // max-height: 400px;
  border-radius: 14px;
  //  border: rgb(204, 214, 221) solid 1px;
  overflow: visible;
  position: relative;
  // box-shadow: 0 0 50px 3px rgba(68, 68, 68, 0.22) !important;
  margin: auto auto 16px;

  background-repeat: no-repeat;
  background-size: 100% auto;
  background-position: top left;

  .toolbar-op {
    position: relative;
    width: 100%;
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 10px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
    font-family: inherit;
    font-size: 12px;
    line-height: 20px;
    .canvas-setting-label { font-size: 12px; line-height: 18px; }
    .canvas-setting-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .canvas-setting-fields > * { min-width: 0; }
    @media (max-width: 540px) { .canvas-setting-fields { grid-template-columns: minmax(0, 1fr); } }
  }

  .canvas-picture { position: relative; overflow: hidden; border-radius: 12px; background-repeat: no-repeat; background-size: 100% auto; background-position: top left; }

  .setting-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: grid;
    align-items: center;
    padding: 12px;
    background-color: rgb(var(--v-theme-surface));
  }
}
</style>

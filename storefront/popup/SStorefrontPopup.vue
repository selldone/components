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
    v-if="show"
    :class="popup.position"
    class="popup-dialog-container"
    @click="show = false"
  >
    <div
      :class="[popup.transition]"
      :style="{
        transformOrigin: popup.position
          ? popup.position.replace('-', ' ')
          : 'center',
      }"
      class="position-relative"
      style="max-height: 100%; max-width: 100%"
    >
      <LPageViewer
        v-if="popup.content"
        :class="[{ 's--shadow-no-padding': popup_style && popup_style.s }]"
        :initialPageData="popup.content"
        :initialPageCss="popup.css"
        :style="{
          borderRadius:
            popup_style && popup_style.r ? popup_style.r : undefined,
          width:
            popup_style && popup_style.w
              ? popup_style.w
              : Math.min(window.innerWidth, 800),
          height:
            popup_style && popup_style.h
              ? popup_style.h
              : Math.min(window.innerHeight, 800),
        }"
        class="pop-card overflow-auto thin-scroll"
        style="max-height: 100%; width: 100%; cursor: initial"
        @click.stop
      />

      <v-sheet
        class="absolute-top-end zoomIn delay_500 pa-2 ma-1"
        color="#fff"
        rounded="circle"
      >
        <v-btn
          color="#fff"
          icon
          size="small"
          variant="elevated"
          @click="show = false"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-sheet>
    </div>

    <v-row
      v-if="preview"
      class="bottom-bar fadeIn delay_1s"
      dir="ltr"
      no-gutters
    >
      <v-chip
        v-if="popup.delay"
        class="m-1"
        color="green"
        label
        size="small"
        variant="flat"
      >
        <v-icon class="me-1" size="small">motion_photos_on</v-icon>
        {{ popup.delay }} s
      </v-chip>
      <v-chip
        v-if="popup.hide"
        class="m-1"
        color="red"
        label
        size="small"
        variant="flat"
      >
        <v-icon class="me-1" size="small">hourglass_bottom</v-icon>
        {{ popup.hide }} s
      </v-chip>
      <v-chip
        v-if="popup.transition"
        class="m-1"
        color="blue"
        label
        size="small"
        variant="flat"
      >
        <v-icon class="me-1" size="small">timelapse</v-icon>
        {{ getName(popup.transition) }}
      </v-chip>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent } from "vue";

export default {
  name: "SStorefrontPopup",
  components: {
    LPageViewer: defineAsyncComponent(
      () => import("@selldone/page-builder/page/viewer/LPageViewer.vue"),
    ),
  },
  inject: ["$shop"],
  props: {
    modelValue: Boolean,
    previewPopup: {
      require: true,
      type: Object,
    },
    preview: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    show: false,
  }),

  computed: {
    popup_style() {
      return this.popup.style ? this.popup.style : {};
    },

    popup() {
      return this.previewPopup ? this.previewPopup : this.$shop?.popup;
    },
  },
  watch: {
    show(value) {
      this.$emit("update:modelValue", value);
    },

    modelValue(value) {
      if (value) this.init();
    },

    popup(popup) {
      if (popup) this.init();
    },
  },

  created() {
    this.init();
  },

  beforeUnmount() {},

  methods: {
    init() {
      if (!this.popup) {
        console.style("<b>🛸 Popup : None! </b>");
        return;
      }

      console.style("<b>🛸 You have a popup! </b>");

      setTimeout(
        () => {
          this.show = true;

          // Auto hide:
          if (this.popup.hide) {
            console.log("🛸 Auto hide in", this.popup.hide, "seconds");
            setTimeout(() => {
              this.show = false;
            }, this.popup.hide * 1000);
          }
        },
        this.preview ? 0 : this.popup.delay * 1000,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.popup-dialog-container {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  top: 0;
  left: 0;
  transition: all 0.5s;
  flex-direction: column;

  .pop-card {
    position: relative;
    overflow-y: auto;
    background-color: #fff;
  }

  &.top-left {
    justify-content: flex-start;
    align-items: flex-start;
  }

  &.top-center {
    justify-content: flex-start;
    align-items: center;
  }

  &.top-right {
    justify-content: flex-start;
    align-items: flex-end;
  }

  &.left-center {
    justify-content: center;
    align-items: flex-start;
  }

  &.right-center {
    justify-content: center;
    align-items: flex-end;
  }

  &.bottom-right {
    justify-content: flex-end;
    align-items: flex-end;
  }

  &.bottom-center {
    justify-content: flex-end;
    align-items: center;
  }

  &.bottom-left {
    justify-content: flex-end;
    align-items: flex-start;
  }

  .bottom-bar {
    flex-grow: 0;
    background: #333;
    padding: 6px;
    border-radius: 6px;
    margin: 8px;
  }
}
</style>

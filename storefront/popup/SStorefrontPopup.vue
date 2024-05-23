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
    :class="popup.position"
    class="popup-dialog-container"
    @click="$emit('close')"
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
        :class="[{ 's--shadow-no-padding': style && style.s }]"
        :initialPageData="popup.content"
        :style="{
          borderRadius: style && style.r ? style.r : undefined,
          width: style && style.w ? style.w : Math.min(window.innerWidth, 800),
          height:
            style && style.h ? style.h : Math.min(window.innerHeight, 800),
        }"
        class="pop-card overflow-auto d-flex thin-scroll"
        style="max-height: 100%; width: 100%; cursor: initial"
        @click.stop
      />

      <v-btn
        class="absolute-top-end zoomIn delay_500"
        color="#fff"
        icon
        variant="flat"
        @click="$emit('close')"
      >
        <v-icon>close</v-icon>
      </v-btn>
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

<script>
import LPageViewer from "@selldone/page-builder/page/viewer/LPageViewer.vue";

export default {
  name: "SStorefrontPopup",
  components: { LPageViewer },
  props: {
    popup: {
      require: true,
      type: Object,
    },
    preview: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({}),

  computed: {
    style() {
      return this.popup.style ? this.popup.style : {};
    },
  },
  watch: {},

  created() {},

  beforeUnmount() {},

  methods: {},
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

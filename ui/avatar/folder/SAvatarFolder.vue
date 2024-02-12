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
  <v-avatar
    :class="{ 'bg-amber-soft': isAmber }"
    :size="size"
    :style="{
      backgroundImage: bg,
      'border-radius': size < 60 ? '18px' : '24px',
    }"
    class="s---category"
  >
    <v-avatar
      :size="size - borderSize"
      color="#fff"
      :style="{ 'border-radius': size < 60 ? '16px' : '22px' }"
    >
      <v-img v-if="src" :src="getShopImagePath(src)">
        <template v-slot:placeholder>
          <s-image-placeholder
            :bg-color="color1"
            :color="color2"
          ></s-image-placeholder>
        </template>
      </v-img>
      <v-icon v-else>{{ placeholderIcon }}</v-icon>
    </v-avatar>

    <div
      :style="{ backgroundImage: bg }"
      class="absolute-bottom-end rounded-ts-circle h-auto w-auto pa-1 ma-n1"
      style="background-size: 300% 300%"
    >
      <v-img
        v-if="sideImage"
        :src="sideImage"
        :height="side_size"
        :width="side_size"
        :class="{
          'rounded rounded-ts-circle rounded-be-circle': side_image_rounded,
        }"
      ></v-img>
      <v-icon v-else color="#fff" :size="side_size">
        {{ sideIcon }}
      </v-icon>
    </div>

    <div
      v-if="caption"
      class="single-line s---title"
      style="background: inherit"
    >
      {{ caption }}
    </div>
    <v-progress-circular
      v-if="loading"
      :color="color1"
      class="center-absolute"
    ></v-progress-circular>

    <slot></slot>

    <v-tooltip v-if="tooltip" activator="parent">
      {{ tooltip }}
    </v-tooltip>
  </v-avatar>
</template>

<script>
import { defineComponent } from "vue";
import SImagePlaceholder from "@components/ui/image/placeholder/SImagePlaceholder.vue";

export default defineComponent({
  name: "SAvatarFolder",
  components: { SImagePlaceholder },
  props: {
    src: {},
    isAmber: Boolean,
    isBlue: Boolean,
    isRed: Boolean,
    isPink: Boolean,
    isGray: Boolean,
    size: {
      default: 62,
      type: Number,
    },
    borderSize: {
      default: 10,
      type: Number,
    },
    sideIcon: {
      default: "devices_fold",
    },
    sideImage: {},

    caption: {},
    loading: Boolean,
    tooltip: {},
    placeholderIcon: {
      default: "camera",
    },
  },

  computed: {
    side_image_rounded() {
      return (
        !this.sideImage?.endsWith(".svg")
      );
    },

    side_size() {
      return Math.min(this.size / 3.3, 24);
    },
    bg() {
      return `linear-gradient(45deg, ${this.color1}, ${this.color2})`;
    },

    color1() {
      return this.isAmber
        ? "#FFA000"
        : this.isBlue
          ? "#64B5F6"
          : this.isRed
            ? "#F44336"
            : this.isPink
              ? "#E91E63"
              : this.isGray
                ? "#ddd"
                : "#000";
    },
    color2() {
      return this.isAmber
        ? "#de8e07"
        : this.isBlue
          ? "#1976D2"
          : this.isRed
            ? "#D32F2F"
            : this.isPink
              ? "#C2185B"
              : this.isGray
                ? "#eee"
                : "#000";
    },
  },
});
</script>

<style lang="scss" scoped>
.s---category {
  position: relative;

  .s---title {
    position: absolute;
    left: 12px;
    right: 12px;
    top: 7px;
    padding: 3px 3px;
    border-radius: 8px;
    font-size: 7px;
    max-width: calc(100% - 24px);
    width: calc(100% - 24px);
    overflow: hidden;
    display: block;
    color: #000;
  }
}
</style>

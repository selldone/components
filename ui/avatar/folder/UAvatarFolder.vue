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
      'border-radius': `${border_radius}px`,
    }"
    class="s---category"
  >
    <v-avatar
      :color="!src && text_avatar_color ? text_avatar_color : '#fff'"
      :size="size - borderSize"
      :style="{ 'border-radius': `${border_radius - 2}px` }"
      cover
      :class="{ 'elevation-3': elevated }"
      class="hover-scale force-top"
    >
      <v-img v-if="src" :src="getShopImagePath(src)" :alt="text_avatar_value">
        <template v-slot:placeholder>
          <s-image-placeholder
            :bg-color="color1"
            :color="color2"
            :size="border_radius * 1.7"
          ></s-image-placeholder>
        </template>
      </v-img>

      <span
        v-else-if="textAvatar"
        :style="{ 'font-size': size * 0.32 + 'px' }"
        class="text-uppercase pen usn"
        >{{ text_avatar_value }}</span
      >
      <v-icon v-else>{{ placeholderIcon }}</v-icon>
    </v-avatar>

    <div
      v-if="!hideSideIcon"
      :style="{ backgroundImage: bg }"
      class="absolute-bottom-end-0 rounded-ts-circle h-auto w-auto pe-2 pb-2 pen"
      style="background-size: 300% 300%; line-height: 0; padding: 6px"
    >
      <img
        v-if="sideImage"
        :class="{
          'rounded rounded-ts-circle rounded-be-circle': side_image_rounded,
        }"
        :height="side_size / (smallSideIcon ? 2 : 1)"
        :src="sideImage"
        :width="side_size / (smallSideIcon ? 2 : 1)"
        alt="Side Icon"
      />
      <v-icon
        v-else
        :size="side_size / (smallSideIcon ? 2 : 1)"
        :color="sideIconColor"
      >
        {{ sideIcon }}
      </v-icon>
    </div>

    <div
      v-if="caption"
      class="single-line s---title pen"
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

<script lang="ts">
import { defineComponent } from "vue";
import SImagePlaceholder from "../../../ui/image/placeholder/SImagePlaceholder.vue";
import { StringToColour } from "@selldone/core-js/helper/color/ColorGenerator";

export default defineComponent({
  name: "UAvatarFolder",
  components: { SImagePlaceholder },
  props: {
    src: {},
    isAmber: Boolean,
    isBlue: Boolean,
    isRed: Boolean,
    isPink: Boolean,
    isGray: Boolean,
    isGreen: Boolean,
    isPurple: Boolean,

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
    smallSideIcon: Boolean,
    sideIconColor: {
      default: "#fff",
    },

    caption: {},
    loading: Boolean,
    tooltip: {},
    placeholderIcon: {
      default: "camera",
    },
    hideSideIcon: {
      default: false,
      type: Boolean,
    },
    textAvatar: {},
    elevated: Boolean,
  },

  computed: {
    border_radius() {
      return Math.round(Math.min(this.size / 3.3, 24));
    },

    side_image_rounded() {
      return !this.sideImage?.endsWith(".svg");
    },

    side_size() {
      return Math.round(Math.min(this.size / 4, 24));
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
                : this.isGreen
                  ? "#4CAF50"
                  : this.isPurple
                    ? "#5f36f4"
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
                : this.isGreen
                  ? "#388E3C"
                  : this.isPurple
                    ? "#673AB7"
                    : "#000";
    },

    text_avatar_value() {
      if (!this.textAvatar) return "-";
      let out = "";

      out = this.textAvatar
        .split(" ")
        .map((word) => word[0])
        .join("");

      if (out.length < 2 && this.textAvatar.length >= 2)
        out = out + this.textAvatar[1];

      return out.substring(0, 2);
    },

    text_avatar_color() {
      if (!this.textAvatar) return null;
      return StringToColour(this.textAvatar ? this.textAvatar : "-", -15);
    },
  },
});
</script>

<style lang="scss" scoped>
.s---category {
  position: relative;

  .s---title {
    position: absolute;
    left: 9px;
    right: 9px;
    top: 7px;
    padding: 4px 3px 3px 3px;
    line-height: normal;
    border-radius: 18px 18px 4px 4px;
    font-size: 7px;
    max-width: calc(100% - 18px);
    width: calc(100% - 18px);
    overflow: hidden;
    display: block;
    color: #000;
  }
}
</style>

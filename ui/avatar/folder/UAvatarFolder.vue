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
      '--folder-border-inset': borderSize == null ? null : `${borderSize}px`,
    }"
    class="s---category"
  >
    <v-avatar
      :color="!src && text_avatar_color ? text_avatar_color : '#fff'"
      cover
      :class="{ 'elevation-3': elevated }"
      class="s---category__image hover-scale force-top"
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
        class="s---category__text text-uppercase pen usn"
        >{{ text_avatar_value }}</span
      >
      <v-icon v-else size="min(38.71cqi, 24px)">{{ placeholderIcon }}</v-icon>
    </v-avatar>

    <div
      v-if="!hideSideIcon"
      :style="{ backgroundImage: bg, '--folder-side-scale': smallSideIcon ? 0.5 : 1 }"
      class="s---category__side absolute-bottom-end-0 rounded-ts-circle pen"
    >
      <img
        v-if="sideImage"
        class="s---category__side-icon"
        :class="{
          'rounded rounded-ts-circle rounded-be-circle': side_image_rounded,
        }"
        :src="sideImage"
        alt="Side Icon"
      />
      <v-icon
        v-else
        class="s---category__side-icon"
        size="var(--folder-side-size)"
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
      // The default inset scales; explicit values retain their pixel size.
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
  --folder-border-inset: min(10px, 16.129cqi);
  position: relative;
  container-type: inline-size;
  border-radius: min(30.303%, 24px);

  &__image {
    width: calc(100% - var(--folder-border-inset));
    height: calc(100% - var(--folder-border-inset));
    border-radius: max(0px, calc(min(30.303cqi, 24px) - min(3.226cqi, 2px)));
  }

  &__text { font-size: 32cqi; }

  &__side {
    --folder-side-size: calc(min(25cqi, 24px) * var(--folder-side-scale));
    background-size: 300% 300%;
    line-height: 0;
    padding: min(9.677cqi, 6px);
    padding-inline-end: min(12.903cqi, 8px);
    padding-block-end: min(12.903cqi, 8px);
  }

  &__side-icon {
    width: var(--folder-side-size);
    height: var(--folder-side-size);
  }

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

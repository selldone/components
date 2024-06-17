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
  <div class="safe-height">
    <div v-if="$vuetify.display.mdAndUp" class="mb-5 inline-block">
      <v-btn-toggle
        v-model="preview_mode"
        class="widget-toggle"
        mandatory
        rounded
        selected-class="blue-flat"
      >
        <v-btn value="mobile" variant="text">
          <v-icon>smartphone</v-icon>
        </v-btn>
        <v-btn value="tablet" variant="text">
          <v-icon>tablet_mac</v-icon>
        </v-btn>
        <v-btn value="laptop" variant="text">
          <v-icon>computer</v-icon>
        </v-btn>
        <v-btn value="pc" variant="text">
          <v-icon>desktop_mac</v-icon>
        </v-btn>
      </v-btn-toggle>
    </div>

    <div class="responsive-frame-scale">
      <div
        v-if="window.innerWidth > 600"
        :class="{
          'device-iphone-x': preview_mode === 'mobile',
          'device-ipad-pro': preview_mode === 'tablet',
          'device-macbook': preview_mode === 'laptop',
          'device-imac-pro': preview_mode === 'pc',
        }"
        class="device mx-auto"
      >
        <div class="device-frame">
          <!--
                  <video class="device-content" muted="muted" autoplay loop >
                          <source src="src/video/bg-01.mp4" type="video/mp4">
                        </video>
                        -->
          <div
            :style="{ transform: parent_transform }"
            class="device-content rounded-xl"
            style="border: unset"
          >
            <iframe
              v-if="url"
              :src="url"
              :style="{
                width: iframe_scale,
                height: iframe_scale /*,transform:iframe_transform*/,
              }"
              scrolling="yes"
              style="border: none; border-radius: inherit"
            />
          </div>

          <!--  <img class="device-content" src="./assets/screenshots/apple-store.png"/>
               -->
        </div>
        <div class="device-stripe" />
        <div class="device-header" />
        <div class="device-sensors" />
        <div class="device-btns" />
        <div class="device-power" />
      </div>

      <div v-else class="device device-galaxy-s8 mx-auto">
        <div
          class="device-frame d-flex align-center justify-center pa-2 bg-white"
        >
          Not supported in small screens!
        </div>
        <div class="device-stripe" />
        <div class="device-header" />
        <div class="device-sensors" />
        <div class="device-btns" />
        <div class="device-power" />
      </div>
    </div>
  </div>
</template>

<script>
import './style/devices.scss'
export default {
  name: "PwaPreview",

  props: {
    url: {
      type: String,
      require: true,
    },
  },

  data: () => ({
    preview_mode: "tablet",
  }),
  computed: {
    iframe_scale() {
      if (this.preview_mode === "mobile") return "100%";
      else if (this.preview_mode === "tablet") return "200%";
      else if (this.preview_mode === "laptop") return "340%";
      else if (this.preview_mode === "pc") return "400%";

      return "100%";
    },

    iframe_transform() {
      if (this.preview_mode === "mobile") return "scale(1)";
      else if (this.preview_mode === "tablet") return "scale(0.5)";
      else if (this.preview_mode === "laptop") return "scale(0.294)";
      else if (this.preview_mode === "pc") return "scale(0.25)";

      return "scale(1)";
    },

    parent_transform() {
      if (this.preview_mode === "mobile") return "scale(1)";
      else if (this.preview_mode === "tablet")
        return this.$vuetify.locale.isRtl
          ? "scale(0.5) translate(50%,-50%)"
          : "scale(0.5) translate(-50%,-50%)";
      else if (this.preview_mode === "laptop")
        return this.$vuetify.locale.isRtl
          ? "scale(0.294) translate(120%,-120%)"
          : "scale(0.294) translate(-120%,-120%)";
      else if (this.preview_mode === "pc")
        return this.$vuetify.locale.isRtl
          ? "scale(0.25) translate(150%,-150%)"
          : "scale(0.25) translate(-150%,-150%)";

      return "scale(1)";
    },
  },
};
</script>

<style lang="scss">
.responsive-frame-scale {
  transition: all 0.4s;
  transform: translate(-50%, 0) scale(0.9);
  transform-origin: top center;
  position: absolute;
  left: 50%;

  .device-content {
    /* transform-origin: right top;
        overflow: hidden;
        @supports (-ms-ime-align:auto) {
          transform-origin:left top;
        }
        //Any Safari version:
        @media all and (-webkit-min-device-pixel-ratio:0) and (min-resolution: .001dpcm) {
          transform-origin:left top;

        }*/
  }

  @media screen and (max-width: 1360px) {
    transform: translate(-50%, 0) scale(0.8);
  }
  @media screen and (max-width: 767px) {
    transform: translate(-50%, 0) scale(0.52);
  }
}

.safe-height {
  min-height: 880px;

  @media screen and (max-width: 1360px) {
    min-height: 800px;
  }

  @media screen and (max-width: 767px) {
    min-height: 500px;
  }
}
</style>


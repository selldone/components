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
  <div :class="[type, { '-shadow': shadow }]" class="frame-view">
    <v-img v-if="src" :src="src" class="view"  eager>
      <template v-slot:placeholder>
        <v-row align="center" justify="center" no-gutters>
          <v-progress-circular color="primary" indeterminate />
        </v-row>
      </template>
    </v-img>
    <div class="view" style="padding: 10%">
      <slot></slot>
    </div>

    <img :src="frame_src" class="frame" width="100%" />
  </div>
</template>

<script lang="ts">
export default {
  name: "FrameView",
  props: {
    src: {},
    type: {
      // macbook : NOT WORK ! deprecated!
      type: String,
      default: "iphone",
    },
    shadow: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    frame_src() {
      if (this.type === "macbook") return require("./assets/macbook-frame.svg");

      return require("./assets/iphone-frame.svg");
    },
  },
};
</script>

<style lang="scss" scoped>
.frame-view {
  position: relative;

  overflow: visible;
  transition: all 0.5s;
  max-width: 100%;
  max-height: 600px;

  @media only screen and (min-width: 900px) {
    &.-shadow {
      filter: drop-shadow(4px 4px 20px rgba(0, 0, 0, 0.2));

      &:hover {
        filter: drop-shadow(4px 15px 28px rgba(0, 0, 0, 0.4));
      }
    }
  }

  .frame {
    position: relative;
    z-index: 1;
    width: 100%;
    // height: 100%;
    max-height: 600px;
  }

  .view {
    position: absolute;

    width: 90%;
    height: 95%;
    left: 5%;
    top: 2.5%;

    /*   &:after {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0%;
        top: 0%;
        content: "";
       background-image: linear-gradient(
          to right,
          rgba(241, 241, 241, 0),
          rgba(200, 200, 200, 0.12),
          rgba(255, 255, 255, 0),
          rgba(255, 255, 255, 0)
        );

      }*/
  }

  &.iphone {
  }

  &.macbook {
    .view {
      height: 90%;
      width: 62%;
      left: 19%;
      background-color: #849;
    }
  }
}
</style>

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
  <v-dialog v-model="dialog" :transition="false" fullscreen>
    <div
      :class="classx"
      :style="stylex"
      class="no-scroll d-flex flex-column align-center safe-con pointer-zoom-out"
      style="
        background-color: #fff;
        max-height: 100vh;
        cursor: zoom-out;
        overflow-y: auto;
        transition: all 0.3s ease-in-out;
      "
      @click="closeImage()"
      v-html="html"
    ></div>
  </v-dialog>
</template>

<script lang="ts">
import {EventBus} from "@selldone/core-js/events/EventBus.ts";

export default {
  name: "SFullscreenViewAnimator",
  data() {
    return {
      dialog: false,
      html: null,
      stylex: {},
      stylex_clone: {},
      classx: null,

      // content_height:null,
    };
  },

  methods: {
    selectImage(event) {
      this.dialog = true;

      const t = this;

      let position = {};
      let size = {};

      let $this = event.currentTarget;
      position = $this.getBoundingClientRect();
      size = {
        width: window.getComputedStyle($this).width,
        height: window.getComputedStyle($this).height,
      };

      t.stylex.position = "absolute";
      t.stylex.top = position.top + "px";
      t.stylex.left = position.left + "px";
      t.stylex.height = size.height;
      t.stylex.width = size.width;
      t.stylex.margin = $this.style.margin;

      t.stylex_clone = Object.assign({}, t.stylex);
      t.html = $this.outerHTML;
      //console.log('$this.outerHTML',$this.outerHTML)
      //  t.classx = $this.classList.value;

      // console.log('size',size)

      // t.content_height=Math.round(100*size.height/size.width)  + 'vw'

      setTimeout(function () {
        t.stylex.height = "100vh";
        t.stylex.width = "100vw";
        t.stylex.top = "0";
        t.stylex.left = "0";
        t.stylex.margin = "0";

        t.stylex = Object.assign({}, t.stylex);
      }, 1);
    },

    closeImage() {
      this.stylex = this.stylex_clone;

      setTimeout(() => {
        this.dialog = false;
        this.html = null;
      }, 300);
    },
  },

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    EventBus.$on("show:fullscreen", (event) => {
      this.selectImage(event);
    });
  },
  beforeUnmount() {
    EventBus.$off("show:fullscreen");
  },
};
</script>

<style lang="scss">
.fullscreen-able-icon {
  cursor: zoom-in;

  &:hover {
    &:after {
      pointer-events: none;
      position: absolute;
      top: 12px;
      right: 12px;
      color: #fff;
      font-size: 20px;
      z-index: 2;
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      content: "\f065";
    }
  }
}

.safe-con {
  :first-child {
    width: 100% !important;
    height: auto !important;
    border-radius: unset !important;
    margin: auto !important;
    flex-grow: 0 !important;
    max-height: unset !important;
  }
}
</style>

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
    :style="{
      '--top': top,
      '--left': left,
      '--top-s': top680 ? top680 : top,
      '--left-s': left680 ? left680 : left,
    }"
    class="ribbon"
    :class="{ '-no-res': !top680 }"
  >
    <img :src="src" class="approved-bg" />

    <div class="approved-container single-line"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: "Ribbon",
  props: {
    red: {
      type: Boolean,
      default: false,
    },
    green: {
      type: Boolean,
      default: false,
    },

    top: {
      default: "-4px",
    },
    left: {
      default: "-5px",
    },

    top680: {},
    left680: {},
  },

  computed: {
    src() {
      return this.green
        ? require("@components/assets/icons/approve-badge.svg")
        : require("@components/assets/icons/countdown-badge.svg");
    },
  },
};
</script>

<style lang="scss">
.ribbon {
  .approved-bg {
    position: absolute;
    top: var(--top);
    left: var(--left);
    z-index: 3;
    width: 100px;
    pointer-events: none;
    transform: scaleX(-1);

  }
  .approved-container {
    pointer-events: none;
    position: absolute;

    user-select: none;
    text-transform: uppercase;

    top: calc(14px + var(--top));
    left: calc(5px + var(--left));
    z-index: 4;
    padding: 6px;
    color: #fff;

    transform: rotate(-41deg) translate(-18%, -35%);
    transform-origin: center;
    width: 100px;
    font-weight: 500;
    font-size: 12px;
    //  background: rgba(194, 24, 91, 0.8);
    transform-origin: center;
    text-align: center;
  }

  // Change in small screen:
 /* &:not(.-no-res) {
    @media only screen and (max-width: 680px) {
      .approved-container {
        top: 18px;
        transform: rotate(-41deg) translate(-20%, 8%);
      }
      .approved-bg {
        top: var(--top-s);
        left: var(--left-s);
      }
    }
  }*/
}
</style>

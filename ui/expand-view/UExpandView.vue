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
    :class="{ '-expanded': expanded }"
    :style="{
      '--top': fadeTop,
      '--bottom': fadeBottom,
      '--left': fadeLeft,
      '--right': fadeRight,
      'max-height': expanded ? scrollHeight : maxHeight,
      'min-height': minHeight,
    }"
    class="s-expand-view"
  >
    <div
      ref="scroll"
      v-mutate="onMutate"
      v-scroll.self="(ev) => onScroll(ev.target)"
      class="--scroll"
    >
      <slot></slot>
    </div>

    <div v-if="had_scroll" class="-expand-button">
      <v-btn size="x-large" variant="text" @click="expanded = !expanded"
        >{{
          expanded
            ? $t("global.actions.collapse")
            : $t("global.actions.view_all")
        }}

        <v-icon :class="{ 'rotate-180': expanded }" class="mx-2"
          >expand_more
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from "lodash-es";

export default {
  name: "UExpandView",
  props: {
    minHeight: {
      default: "40vh",
    },
    maxHeight: {
      default: "60vh",
    },
  },
  data: () => ({
    fadeTop: "0",
    fadeBottom: "0",
    fadeLeft: "0",
    fadeRight: "0",

    had_scroll: false,
    expanded: false,
    scrollHeight: "10000px",

    block: false,
  }),
  watch: {
    expanded() {
      this.block = true;
      this.unBlock();
    },
  },

  mounted() {
    this.onScroll(this.$refs.scroll);
  },

  methods: {
    unBlock: debounce(function () {
      this.block = false;
      this.onScroll(this.$refs.scroll);
    }, 1500),

    onMutate(e) {
      this.onScroll(this.$refs.scroll);
    },
    onScroll(target) {
      const {
        scrollTop,
        scrollLeft,
        clientHeight,
        clientWidth,
        scrollHeight,
        scrollWidth,
      } = target;

      if (this.block) return;

      this.had_scroll = this.expanded || clientHeight < scrollHeight;
      this.scrollHeight = scrollHeight + "px";

      // Check if the scroll is at the top or bottom
      this.fadeTop = scrollTop === 0 ? "0" : "2em";
      this.fadeBottom = scrollTop + clientHeight >= scrollHeight ? "0" : "40%";

      // Check if the scroll is at the left or right
      this.fadeLeft = scrollLeft === 0 ? "0" : "2em";
      this.fadeRight = scrollLeft + clientWidth >= scrollWidth ? "0" : "40%";
    },
  },
};
</script>

<style lang="scss" scoped>
.s-expand-view {
  position: relative;
  transition: all 1s ease 0s;

  .--scroll {
    max-height: inherit;

    scrollbar-width: none;
    -ms-overflow-style: none; /* Hide scrollbar for Edge */
    &::-webkit-scrollbar {
      display: none; /* Hide scrollbar for Chrome */
    }

    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    overflow: hidden;
  }

  &:not(.-expanded) {
    &:after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      pointer-events: none;
      transition: all 1s;
      z-index: 2;

      background-image: linear-gradient(
          to bottom,
          var(--background),
          transparent
        ),
        linear-gradient(to top, var(--background), transparent),
        linear-gradient(to right, var(--background), transparent),
        linear-gradient(to left, var(--background), transparent);

      background-position: top, bottom, left, right;
      background-repeat: no-repeat;
      background-size:
        100% var(--top, 0),
        100% var(--bottom, 0),
        var(--left, 0) 100%,
        var(--right, 0) 100%;
    }
  }

  .-expand-button {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 3;
    transition: all 0.3s;
  }

  &.-expanded {
    .-expand-button {
      bottom: -64px;
    }
  }
}
</style>

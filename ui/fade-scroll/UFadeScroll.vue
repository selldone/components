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
    :class="{ '-center': center }"
    :style="{
      '--top': fadeTop,
      '--bottom': fadeBottom,
      '--left': $vuetify.locale.isRtl ? fadeRight : fadeLeft,
      '--right': $vuetify.locale.isRtl ? fadeLeft : fadeRight,
      '--background': bgColor,
    }"
    class="s-fade-scroll"
  >
    <div
      ref="scroll"
      v-dragscroll="dragScroll"
      v-intersect="onIntersect"
      v-scroll.self="(ev) => debouncedOnScroll(ev.target)"
      :class="{ usn: dragScroll }"
      class="--scroll"
    >
      <slot></slot>
    </div>
    <div v-if="showArrow" class="-arrows">
      <v-slide-x-transition>
        <v-btn
          v-if="fadeLeft && fadeLeft !== '0'"
          :size="!smallArrow ? 'large' : undefined"
          class="-arrow-btn"
          icon
          variant="flat"
          @click="scrollLeft"
          aria-label="Show back categories"
        >
          <v-icon size="x-large">{{ $t("icons.navigate_before") }}</v-icon>
        </v-btn>
      </v-slide-x-transition>
      <v-spacer></v-spacer>
      <v-slide-x-reverse-transition>
        <v-btn
          v-if="fadeRight && fadeRight !== '0'"
          :size="!smallArrow ? 'large' : undefined"
          class="-arrow-btn"
          icon
          variant="flat"
          @click="scrollRight"
          aria-label="Show next categories"
        >
          <v-icon size="x-large">{{ $t("icons.navigate_next") }}</v-icon>
        </v-btn>
      </v-slide-x-reverse-transition>
    </div>
  </div>
</template>

<script lang="ts">
import {debounce} from "lodash-es";

export default {
  name: "UFadeScroll",
  props: {
    showArrow: {
      type: Boolean,
      default: false,
    },
    smallArrow: {
      type: Boolean,
      default: false,
    },

    center: { type: Boolean, default: false },

    stickClass: {
      // Child class to sticky scroll to it
    },
    stickScrollOffset: {
      default: 24, // Add offset to scroll to child
    },

    dragScroll: Boolean,
    bgColor: {},
  },
  data: () => ({
    fadeTop: "0",
    fadeBottom: "0",
    fadeLeft: "0",
    fadeRight: "0",

    isDragging: false,
    pan_start_x: 0,
    pan_scroll_left: 0,
  }),

  mounted() {
    this.$nextTick(() => {
      this.onScroll(this.$refs.scroll);
    });
  },

  methods: {
    onIntersect() {
      this.debouncedOnScroll(this.$refs.scroll);
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

      const newFadeTop = scrollTop === 0 ? "0" : "2em";
      const newFadeBottom = scrollTop + clientHeight >= scrollHeight ? "0" : "2em";
      const newFadeLeft = scrollLeft === 0 ? "0" : "2em";
      const newFadeRight = scrollLeft + clientWidth >= scrollWidth ? "0" : "2em";

      // Only update if values have changed
      if (this.fadeTop !== newFadeTop) this.fadeTop = newFadeTop;
      if (this.fadeBottom !== newFadeBottom) this.fadeBottom = newFadeBottom;
      if (this.fadeLeft !== newFadeLeft) this.fadeLeft = newFadeLeft;
      if (this.fadeRight !== newFadeRight) this.fadeRight = newFadeRight;
    },

    // In your methods
    debouncedOnScroll: debounce(function(target) {
      this.onScroll(target);
    }, 100, { leading: true, trailing: true }), // Adjust the delay as needed


    scrollRight() {
      if (this.stickClass) {
        if (this.scrollToTheNextChild()) return;
      }
      this.$refs.scroll.scrollBy({
        left:
          (this.$vuetify.locale.isRtl ? -1 : 1) *
          Math.min(window.innerWidth*0.8, 1600),
        behavior: "smooth",
      });
    },
    scrollLeft() {
      if (this.stickClass) {
        if (this.scrollToThePreviousChild()) return;
      }

      this.$refs.scroll.scrollBy({
        left:
          (this.$vuetify.locale.isRtl ? 1 : -1) *
          Math.min(window.innerWidth*0.8, 1600),
        behavior: "smooth",
      });
    },

    scrollToTheNextChild() {
      const container = this.$refs.scroll;
      const items = Array.from(
        this.$refs.scroll.querySelectorAll(`.${this.stickClass}`),
      );
      let nextItem = null;

      items.some((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (this.$vuetify.locale.isRtl) {
          if (itemRect.left < containerRect.left) {
            nextItem = item;
            return true;
          }
        } else {
          if (itemRect.right > containerRect.right) {
            nextItem = item;
            return true;
          }
        }

        return false;
      });

      if (nextItem) {
        container.scrollTo({
          left:
            nextItem.offsetLeft - container.offsetLeft - this.stickScrollOffset,
          behavior: "smooth",
        });
        return true;
      }
      return false;
    },

    scrollToThePreviousChild() {
      const container = this.$refs.scroll;
      const items = Array.from(
        this.$refs.scroll.querySelectorAll(`.${this.stickClass}`),
      ).reverse();
      let previousItem = null;

      items.some((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (this.$vuetify.locale.isRtl) {
          if (itemRect.right > containerRect.right + containerRect.width) {
            previousItem = items[index - 1];
            return true;
          }
        } else {
          if (itemRect.left < containerRect.left - containerRect.width) {
            previousItem = items[index - 1];
            return true;
          }
        }

        return false;
      });

      //console.log('previousItem',previousItem)
      if (!previousItem) {
        previousItem = items.reverse()[0];
      }

      if (previousItem) {
        container.scrollTo({
          left:
            previousItem.offsetLeft -
            container.offsetLeft -
            this.stickScrollOffset,
          behavior: "smooth",
        });

        return true;
      }
      return false;
    },
  },

  beforeUnmount() {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s-fade-scroll {
  position: relative;

  &.-center {
    display: flex;
    justify-content: center;
  }

  .--scroll {
    white-space: nowrap; /*Force inline items be scrollable*/
    scrollbar-width: none;
    -ms-overflow-style: none; /* Hide scrollbar for Edge */
    &::-webkit-scrollbar {
      display: none; /* Hide scrollbar for Chrome */
    }

    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    overflow: auto;
    max-height: inherit;
  }

  &:after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    transition: all 1s;
    z-index: 10;

    background-image: linear-gradient(to bottom, var(--background), transparent),
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

  .-arrows {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    position: absolute;

    top: 50%;
    left: 0;
    transform: translate(0, -50%);
    width: 100%;
    user-select: none;
    pointer-events: none;
    z-index: 9;

    .-arrow-btn {
      box-shadow: 0px 3px 8px 0px rgba(0, 0, 0, 0.05);
      pointer-events: all;
    }
  }

  &:hover {
    .-arrows {
      .-arrow-btn {
        box-shadow: 2px 4px 10px 2px rgba(0, 0, 0, 0.32);
      }
    }
  }
}
</style>

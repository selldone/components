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
  <div
    :style="{ '--size': size + 'px' }"
    class="flip-container"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div :class="{ flip: hover }" class="flipper">
      <div class="-front">
        <!-- Front Content -->
        <v-avatar :size="size" class="me-2" rounded="lg">
          <v-img :src="src"></v-img>
        </v-avatar>
      </div>
      <router-link :to="to" class="-back" target="_blank">
        <!-- Back Content -->
        <v-icon size="14">open_in_new</v-icon>
        <small>{{ $t("global.actions.open") }}</small>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UAvatarFlip",
  props: {
    src: {},
    to: {},
    size: { default: 40 },
  },
  data() {
    return {
      hover: false,
    };
  },
  methods: {},
});
</script>

<style lang="scss" scoped>
.flip-container {
  perspective: 1000px;

  width: var(--size);
  height: var(--size);
  position: relative;

  .flipper {
    transition: 0.6s;
    transform-style: preserve-3d;
    position: relative;

    &.flip {
      transform: rotateY(180deg);
    }

    .-front,
    .-back {
      backface-visibility: hidden;
      position: absolute;
      top: 0;
      left: 0;
      width: var(--size);
      height: var(--size);
    }

    .-front {
      z-index: 2;
      transform: rotateY(0deg);
    }

    .-back {
      transform: rotateY(180deg);
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #333;
      color: #fff;
      border-radius: 12px;
      font-size: 10px;
    }
  }

  &:hover .flipper {
    transform: rotateY(180deg);
  }
}
</style>

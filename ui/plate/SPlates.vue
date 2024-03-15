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
  <div class="s--plates">
    <div class="scene">
      <div
        v-for="(plate, i) in plates"
        :key="i"
        class="plate"
        :class="{ '-borderless': !plate.border }"
      >
        <slot :name="`layer-${i + 1}`"></slot>
      </div>
    </div>
    <div class="-side-note">
      <div v-for="(plate, i) in plates" :key="i">{{ plate.title }}</div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SPlates",
  props: {
    plates: {
      type: Array,
    },
  },
});
</script>

<style scoped lang="scss">
.s--plates {
  display: inline-flex;

  .scene {
    perspective: 500px;
    width: 200px;
    height: 200px;
    position: relative;
    margin: 20px;
  }

  .plate {
    position: absolute;
    width: 80%;
    height: 80%;
    border: 1.6px solid #aaa;
    border-radius: 12px;
    background: rgba(245, 245, 245, 0.9);
    overflow: hidden;

    &.-borderless {
      border: none;
    }

    // animation: rotate 20s infinite linear;
    // Adjust the transform to create the 3D layered effect
    &:nth-child(1) {
      transform: rotateX(70deg) rotateY(0deg) rotateZ(35deg) translateZ(40px);
      z-index: 3;

      &:hover {
        animation: rotate 10s infinite linear;
      }
    }

    &:nth-child(2) {
      transform: rotateX(70deg) rotateY(0deg) rotateZ(35deg) translateZ(0);
      z-index: 2;
      &:hover {
        animation: rotate-second 10s infinite linear;
      }
    }

    &:nth-child(3) {
      transform: rotateX(70deg) rotateY(0deg) rotateZ(35deg) translateZ(-40px);
      z-index: 1;
      &:hover {
        animation: rotate-third 10s infinite linear;
      }
    }

    // Add more nth-child rules as needed for more plates
  }

  .-side-note {
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    font-size: 12px;
    opacity: 0.7;
    padding: 20px 0 20px 0;
    text-align: start;
  }
}

@keyframes rotate {
  0% {
    transform: rotateX(70deg) rotateY(0deg) rotateZ(35deg) translateZ(40px); /* For the first plate */
  }
  100% {
    transform: rotateX(70deg) rotateY(0deg) rotateZ(395deg) translateZ(40px); /* For the first plate */
  }
}

/* You might need separate animations for each plate if they have different translateZ values */
@keyframes rotate-second {
  0% {
    transform: rotateX(70deg) rotateY(0deg) rotateZ(35deg) translateZ(0); /* For the second plate */
  }
  100% {
    transform: rotateX(70deg) rotateY(0deg) rotateZ(395deg) translateZ(0); /* For the second plate */
  }
}

@keyframes rotate-third {
  0% {
    transform: rotateX(70deg) rotateY(0deg) rotateZ(35deg) translateZ(-40px); /* For the third plate */
  }
  100% {
    transform: rotateX(70deg) rotateY(0deg) rotateZ(395deg) translateZ(-40px); /* For the third plate */
  }
}
</style>

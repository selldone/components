<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-btn
    :class="{ '-loading': loading }"
    :loading="loading"
    :size="xLarge ? 'x-large' : undefined"
    class="ai-btn"
    icon
    variant="text"
  >
    <img
      :height="xLarge ? 36 : 24"
      :width="xLarge ? 36 : 24"
      src="../../../../assets/icons/ci-logo.png"
    />
    <v-tooltip v-if="tooltip" activator="parent" :location="tooltipLocation" max-width="360" content-class="bg-black">
      <div v-html="tooltip"></div>
    </v-tooltip>
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: "UButtonAiSmall",
  props: {
    loading: {},
    xLarge: { type: Boolean, default: false },
    tooltip: {
      default: "<b>AI</b> | Automatically generate contents or do process.",
    },
    tooltipLocation: {
      default: "top",
    },
  },
};
</script>

<style lang="scss" scoped>
.ai-btn {
  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 36px;
    height: 36px;
    opacity: 0;
    border-radius: 50%;
    filter: blur(5px);
    transform-origin: center;
  }

  &.-loading {
    &:before {
      background-image: linear-gradient(
        -45deg,
        #ee7752,
        #e73c7e,
        #23a6d5,
        #23d5ab
      );
      background-size: 400% 400%;
      animation:
        gradient 15s ease infinite,
        scale-infinite 2s ease-in-out infinite;

      opacity: 1;
    }
  }
}

@keyframes scale-infinite {
  0% {
    transform: scale(1.15) translate(-45%, -45%);
  }
  50% {
    transform: scale(1) translate(-50%, -50%);
  }
  100% {
    transform: scale(1.15) translate(-45%, -45%); //fix un center bug!
  }
}
</style>

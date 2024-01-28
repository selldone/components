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
  <div class="widget-buttons">
    <v-btn
      @click="$emit('click')"
      :color="loading ? '#512DA8' : '#673AB7'"
      dark
      x-large
      depressed
      block
      :class="{ pen: loading }"
    >
      <v-avatar
        size="36"
        class="me-2 ai-btn-large position-relative"
        color="#512DA8"
        :class="{ '-loading': loading }"
      >
        <img
          src="@components/assets/icons/ci-logo.png"
          :width="32"
          :height="32"
          class="z1"
        />
        <v-progress-circular
          v-if="loading"
          indeterminate
          :size="28"
          color="#FFF"
          class="center-absolute"
        ></v-progress-circular>
      </v-avatar>

      <div class="pe-2 me-2 border-end text-h4">AI</div>

      <div class="flex-grow-1">
        <div class="font-weight-black">
          {{ title }}
        </div>
        <div>
          {{ subTitle }}
        </div>
      </div>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "AiButtonLarge",
  emits: ["click"],
  props: {
    loading: {},
    title: {},
    subTitle: {},
  },
};
</script>

<style scoped lang="scss">
.ai-btn-large {
  overflow: visible;
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

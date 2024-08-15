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
  <div class="widget-buttons">
    <v-btn
      :class="{ pen: loading }"
      :color="loading ? '#512DA8' : '#673AB7'"
      block
      class="s--ai-button-large"
      size="x-large"
      variant="flat"
      @click="$emit('select')"
    >
      <div class="flex-grow-0 d-flex align-center">
        <v-avatar
          :class="{ '-loading': loading }"
          class="me-2 -avatar position-relative"
          color="#512DA8"
          size="36"
        >
          <img
            :height="32"
            :width="32"
            class="z1"
            src="../../../../assets/icons/ci-logo.png"
          />
          <v-progress-circular
            v-if="loading"
            :size="28"
            class="center-absolute"
            color="#FFF"
            indeterminate
          ></v-progress-circular>
        </v-avatar>

        <div class="pe-2 me-2 border-end text-h4">AI</div>
      </div>

      <div class="flex-grow-1 text-center overflow-hidden ">
        <div class="single-line">
          {{ title }}
        </div>
        <div class="small mt-1 single-line">
          {{ subTitle }}
        </div>
      </div>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "UButtonAiLarge",
  emits: ["select"],
  props: {
    loading: Boolean,
    title: {},
    subTitle: {},
  },
};
</script>

<style lang="scss" scoped>
.s--ai-button-large {
  line-height: normal;
  ::v-deep(.v-btn__content) {
    width: 100%;
  }

  .-avatar {
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
}
</style>

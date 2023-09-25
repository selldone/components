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
  <v-btn
    icon
    class="sub-caption b4px ai-btn"
    caption="AI"
    :loading="loading"
    :class="{ '-loading': loading }"
    :dark="loading"
    :x-large="xLarge"
    v-on="$listeners"
  >
    <img
      src="@/Components/assets/icons/ci-logo.png"
      :width="xLarge ? 36 : 24"
      :height="xLarge ? 36 : 24"
    />
  </v-btn>
</template>

<script>
export default {
  name: "AiButton",
  props: {
    loading: {},
    xLarge: { type: Boolean, default: false },
  },
};
</script>

<style scoped lang="scss">
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
      animation: gradient 15s ease infinite,
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

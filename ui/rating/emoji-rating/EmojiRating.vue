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
  <div class="text-center">
    <v-rating
      v-if="!noStars"
      :value="value"
      @input="(val) => $emit('input', val)"
      color="yellow darken-3"
      background-color="grey darken-1"
      empty-icon="$ratingFull"
      hover
      :x-large="!small"
      :small="xSmall"
      :dense="dense"
      :calss="{ disabled: loading }"
      @change="(val) => $emit('change', val)"
      :readonly="readOnly"
      :class="{ 'inline-block': horizontal }"
    ></v-rating>

    <img
      v-if="!noImage"
      :src="emoji"
      :width="xSmall ? 24 : small ? 42 : 68"
      :height="xSmall ? 24 : small ? 42 : 68"
      class="face"
      :class="{
        '-vertical': value === 5,
        'my-2': !dense,
        'mx-2': horizontal,
        'mx-auto': !horizontal,
      }"
    />
  </div>
</template>

<script>
export default {
  name: "EmojiRating",
  props: {
    value: {},
    small: { default: false, type: Boolean },
    xSmall: { default: false, type: Boolean },
    loading: { default: false, type: Boolean },
    readOnly: { default: false, type: Boolean },
    dense: { default: false, type: Boolean },
    noImage: { default: false, type: Boolean },
    noStars: { default: false, type: Boolean },
    horizontal: { default: false, type: Boolean },
  },

  computed: {
    emoji() {
      if (this.value === 1)
        return require("./assets/rate-1.svg");
      if (this.value === 2)
        return require("./assets/rate-2.svg");
      if (this.value === 3)
        return require("./assets/rate-3.svg");
      if (this.value === 4)
        return require("./assets/rate-4.svg");
      if (this.value === 5)
        return require("./assets/rate-5.svg");

      return require("./assets/rate-no.svg");
    },
  },
};
</script>

<style scoped lang="scss">
.face {
  &:hover {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;

    &.-vertical {
      animation: shake-vertical 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
  }
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
@keyframes shake-vertical {
  10%,
  90% {
    transform: translate3d(0, -1px, 0);
  }

  20%,
  80% {
    transform: translate3d(0, 2px, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(0, -4px, 0);
  }

  40%,
  60% {
    transform: translate3d(0, 4px, 0);
  }
}
</style>

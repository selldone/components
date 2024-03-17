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
  <div class="d-flex flex-column align-center justify-center">
    <v-rating
      v-if="!noStars"
      :calss="{ disabled: loading }"
      :class="{ 'inline-block': horizontal }"
      :density="dense ? 'compact' : undefined"
      :model-value="modelValue"
      :readonly="readOnly"
      :size="xSmall ? 'x-small' : small ? 'small' : 'x-large'"
      active-color="amber-darken-3"
      color="grey-darken-1"
      hover
      @change="(val) => $emit('change', val)"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    ></v-rating>

    <img
      v-if="!noImage"
      :class="{
        '-vertical': modelValue === 5,
        'my-2': !dense,
        'mx-2': horizontal,
        'mx-auto': !horizontal,
      }"
      :height="xSmall ? 24 : small ? 42 : 68"
      :src="emoji"
      :width="xSmall ? 24 : small ? 42 : 68"
      class="face"
    />
  </div>
</template>

<script>
export default {
  name: "URatingEmoji",
  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},
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
      if (this.modelValue === 1) return require("@components/ui/rating/emoji/assets/rate-1.svg");
      if (this.modelValue === 2) return require("@components/ui/rating/emoji/assets/rate-2.svg");
      if (this.modelValue === 3) return require("@components/ui/rating/emoji/assets/rate-3.svg");
      if (this.modelValue === 4) return require("@components/ui/rating/emoji/assets/rate-4.svg");
      if (this.modelValue === 5) return require("@components/ui/rating/emoji/assets/rate-5.svg");

      return require("@components/ui/rating/emoji/assets/rate-no.svg");
    },
  },
};
</script>

<style lang="scss" scoped>
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

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
  <div :style="{ padding: `${size / 3}px` }" class="circles-container">
    <v-avatar
      v-for="(id, index) in ids"
      :key="id + '-' + index"
      :class="{
        'pointer-pointer': link,
        'big-scale': bigScale,
        '-no-scale-on-hover': noScale,
      }"
      :color="color"
      :size="size"
      class="citm"
      @click="$emit('click:item', id)"
    >
      <img :src="getShopIcon(id, IMAGE_SIZE_SMALL)" style="padding: 2px" />
    </v-avatar>
  </div>
</template>

<script>
export default {
  name: "ShopsDenseImagesCircles",
  props: {
    ids: {
      require: true,
      type: Array,
    },
    rawImagesPath: {
      // Used in avocado items view
      type: Boolean,
      default: false,
    },

    link: {
      type: Boolean,
      default: false,
    },
    size: {
      default: 32,
    },
    bigScale: {
      type: Boolean,
      default: false,
    },
    color: {
      default: "#0061e0",
    },
    noScale: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.circles-container {
  display: flex;
  overflow: auto;

  //  padding: 10px;
  .citm {
    transition: all 0.5s;

    --scale: 1.5;

    &.big-scale {
      --scale: 2.2;
    }

    &:not(:first-child) {
      margin-left: -12px;
    }

    &:hover:not(.-no-scale-on-hover) {
      &:not(:first-child) {
        margin-left: 10px;
      }

      margin-right: 22px;

      transform: scale(var(--scale));
      z-index: 1;
    }
  }
}

.v-application--is-rtl {
  .circles-container {
    .citm {
      &:not(:first-child) {
        margin-right: -12px;
        margin-left: unset;
      }

      &:hover {
        &:not(:first-child) {
          margin-right: 10px;
          margin-left: unset;
        }

        margin-left: 22px;
        margin-right: unset;
      }
    }

    .more-items {
      margin-right: unset;
      margin-left: 24px;
    }
  }
}
</style>

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
    :style="{ padding: `${Math.round(size / 3)}px` }"
    class="circles-container"
  >
    <v-avatar
      v-for="img in images_limited"
      :key="img"
      :class="{ 'pointer-pointer': link }"
      :color="color"
      :size="size"
      class="citm"
      style="padding: 2px"
      @click="$emit('click:item', img)"
    >
      <v-img
        :src="getShopImagePath(img)"
        class="rounded-card"
        :color="circleColor"
        cover
        alt="Icon"
      />
    </v-avatar>

    <span v-if="more_items > 0" class="more-items ms-2">
      <v-icon size="small">more_horiz</v-icon>
      (+{{ more_items }})
    </span>

    <v-btn
      v-if="add"
      class="more-items ms-2 hover-scale-small"
      color="success"
      icon
      :size="size"
      variant="flat"
      @click.stop="$emit('click:add')"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
export default {
  name: "SDenseImagesCircles",
  emits: ["click:item", "click:add"],
  props: {
    images: {
      require: true,
      type: Array,
    },
    link: {
      type: Boolean,
      default: false,
    },
    size: {
      default: 32,
    },
    limit: {
      default: 20,
    },
    add: {
      type: Boolean,
      default: false,
    },
    color: {
      default: "#00a89a",
    },
    circleColor: {
      default: "#ffffffbb",
    },
  },

  computed: {
    images_limited() {
      return this.images.unique().slice(0, this.limit).filter((i) => !!i);
    },
    more_items() {
      return this.images.length - this.images_limited.length;
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

    &:not(:first-child) {
      margin-left: -12px;
    }

    &:hover {
      &:not(:first-child) {
        margin-left: 10px;
      }

      margin-right: 22px;

      transform: scale(1.5);
      z-index: 1;
    }
  }

  .more-items {
    font-size: 10px;
    font-weight: 600;
    color: #999;
    display: flex;
    align-items: center;
  }
}

.v-locale--is-rtl {
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
    }
  }
}
</style>

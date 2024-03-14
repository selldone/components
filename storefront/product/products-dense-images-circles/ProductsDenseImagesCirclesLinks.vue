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
    :class="{ '-inline': inline }"
    :style="{ padding: `${size / 3}px` }"
    class="circles-container"
  >
    <router-link
      v-for="(id, index) in ids.limit(maxCount)"
      :key="id + '-' + index"
      :to="
        !rawImagesPath && id.toString().startsWith('c-')
          ? toCategory(id.toString().replace('c-', ''))
          : toProduct(id)
      "
      class="citm"
      @click.stop
    >
      <v-avatar
        :class="{ 'pointer-pointer': link, 'big-scale': bigScale }"
        :color="id.toString().startsWith('c-') ? 'amber' : '#ffffffbb'"
        :size="size"
      >
        <img
          v-if="!rawImagesPath && id.toString().startsWith('c-')"
          :src="
            getCategoryIcon(id.toString().replace('c-', ''), IMAGE_SIZE_SMALL)
          "
          style="padding: 2px"
        />
        <img
          v-else
          :src="
            rawImagesPath
              ? getShopImagePath(id)
              : getProductImage(id, IMAGE_SIZE_SMALL)
          "
        />
      </v-avatar>
    </router-link>
    <v-icon v-if="ids.length > maxCount">more_horiz</v-icon>

    <v-btn
      v-if="hasAdd"
      key="add"
      :class="{ 'pointer-pointer': link, 'big-scale': bigScale }"
      :style="{ width: size + 'px', height: size + 'px' }"
      class="citm"
      color="primary"
      dark
      fab
      variant="flat"
      @click="$emit('click:add')"
    >
      <v-icon size="small">add</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "ProductsDenseImagesCirclesLinks",
  props: {
    toCategory: {
      // A function!
      require: true,
    },
    toProduct: {
      // A function!
      require: true,
    },
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
    hasAdd: {
      type: Boolean,
      default: false,
    },
    maxCount: {
      default: 8,
    },
    inline: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.circles-container {
  display: flex;
  overflow: visible;

  &.-inline {
    display: inline-flex;
  }

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

      &.big-scale {
        transform: scale(2.2);
      }
    }

    img {
      object-fit: cover;
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

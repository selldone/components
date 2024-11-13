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
    <v-avatar
      v-for="(id, index) in ids.limit(maxCount)"
      :key="id + '-' + index"
      :class="[
        {
          'pointer-pointer': link,
          'big-scale': bigScale,
          border: border,
        },
        avatarClass,
      ]"
      :color="id.toString().startsWith('c-') ? 'amber' : '#ffffffbb'"
      :size="size"
      class="citm"
      @click.stop="
        !rawImagesPath && id.toString().startsWith('c-')
          ? $emit('click:category', id.toString().replace('c-', ''))
          : $emit('click:item', id)
      "
    >
      <img
        v-if="!rawImagesPath && id.toString().startsWith('c-')"
        :src="
          ShopCategoryHelper.GetCategoryIconById(id.toString().replace('c-', ''), IMAGE_SIZE_SMALL)
        "
        height="100%"
        style="padding: 2px"
        alt="Category"
      />
      <img
        v-else
        :src="
          rawImagesPath
            ? getShopImagePath(id)
            : getProductImage(id, IMAGE_SIZE_SMALL)
        "
        height="100%"
        alt="Product"
      />
    </v-avatar>
    <v-icon v-if="ids.length > maxCount">more_horiz</v-icon>

    <v-btn
      v-if="hasAdd"
      key="add"
      :class="{ 'pointer-pointer': link, 'big-scale': bigScale }"
      :size="size"
      class="citm"
      color="primary"
      icon
      variant="flat"
      @click="$emit('click:add')"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import {ShopCategoryHelper} from "@selldone/core-js/helper/category/ShopCategoryHelper.ts";

export default {
  name: "ProductsDenseImagesCircles",
  computed: {
    ShopCategoryHelper() {
      return ShopCategoryHelper
    }
  },
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
    border: Boolean,
    avatarClass: {},
  },
};
</script>

<style lang="scss" scoped>
.circles-container {
  display: flex;
  overflow: visible;
  align-items: center;

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
      margin-right: unset;
      margin-left: 24px;
    }
  }
}
</style>

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
      v-for="id in ids_limited"
      :key="id"
      :class="{ 'pointer-pointer': link }"
      :color="color"
      :size="size"
      class="citm"
      style="padding: 2px"
      @click="$emit('click:item', id)"
    >
      <v-img
        :src="getUserAvatar(id, IMAGE_SIZE_SMALL)"
        class="rounded-card"
        :color="circleColor"
        cover
      />
    </v-avatar>

    <span v-if="more_items > 0" class="more-items">
      <v-icon size="small">more_horiz</v-icon>
      (+{{ more_items }})
    </span>

    <v-btn
      v-if="add"
      :size="size"
      class="more-items hover-scale-small"
      color="success"
      icon
      variant="flat"
      @click.stop="$emit('click:add')"
    >
      <v-icon size="20">add</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
export default {
  name: "UDenseCirclesUsers",
  emits: ["click:item", "click:add"],
  props: {
    ids: {
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
    ids_limited() {
      return this.ids?.slice(0, this.limit);
    },
    more_items() {
      return this.ids && (this.ids.length - this.ids_limited.length);
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
    margin-left: 8px;
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
      margin-left: unset;
      margin-right: 8px;
    }
  }
}
</style>

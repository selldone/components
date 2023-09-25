<template>
  <div class="circles-container" :style="{ padding: `${size / 3}px` }">
    <v-avatar
      :size="size"
      v-for="(id,index) in ids"
      :key="id+'-'+index"
      class="citm"
      @click="$emit('click:item', id) "
      :class="{ 'pointer-pointer': link, 'big-scale': bigScale }"
      color="#0061e0"

    >

      <img  :src="getShopIcon(id,IMAGE_SIZE_SMALL)" style="padding: 2px" />
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
    rawImagesPath: {    // Used in avocado items view
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

  },
};
</script>

<style scoped lang="scss">
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

      &.big-scale {
        transform: scale(2.2);
      }
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

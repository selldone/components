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
  <v-flex
    d-flex
    align-center
    justify-center
    class="slider-container pointer-pointer"
    :class="selected ? 'active' : ''"
    @click="toggle()"
  >
    <v-icon :color="selected ? '#444' : '#fff'" class="ms-1 no-inv" small>
      {{ icon }}
    </v-icon>

    <span v-if="show" class="mb-1">
      <v-icon
        v-for="item in list"
        :key="item"
        :color="item"
        class="me-1  hover-scale"
        small
        @click="select(item)"
        @click.stop
        >brightness_1</v-icon
      >

      <span
        class="card-badge-info"
        dir="auto"
        @click="select(null)"
        @click.stop
      >
        {{$t('global.commons.all')}}
      </span>
    </span>
    <span v-else :color="selected" >
      <v-icon v-if="selected" :color="selected" class=" hover-scale" small
        >brightness_1</v-icon
      >
      <span v-else class="card-badge-info">{{$t('global.variants.color')}}</span>
    </span>
  </v-flex>
</template>

<script>
export default {
  name: "ColorSelectSlider",
  props: {
    icon: {
      required: false,
      type: String,
      default: "palette"
    },
    list: {
      required: true,
      type: Array
    },
    value: {
      required: false,
      default: null
    },

    close: {
      required: false,
      default: true
    }
  },

  data() {
    return {
      show: false,

      selected: null
    };
  },
  watch: {
    value() {
      this.selected = this.value;
    },
    close() {
      this.show = !this.close;
    }
  },
  created() {
    this.selected = this.value;
    this.show = !this.close;
  },

  methods: {
    toggle() {
      this.show = !this.show;
      if (this.show) this.$emit("open");
      else this.$emit("close");
    },
    select(item) {
      this.selected = item;
      this.$emit("select", item);
      this.show = null;
    }
  }
};
</script>

<style scoped lang="scss">
.slider-container {
  user-select: none;

  color: #fff;
  background: #999;
  border-radius: 8px;
  margin: 3px;
  padding: 4px 8px;

  &.active {
    background: #eee;
    color: #333;
  }
}

.card-badge-info {
  user-select: none;
  cursor: pointer;

  padding: 0 4px;
  font-weight: 400;
  margin-right: 4px;

  &:hover {
    color: #ffa000;
    font-weight: 600;
  }
}

.hover-scale {
  &:hover {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0, 1);
    transform: scale(1.4, 1.4);
    font-size: 1.03em;
  }
}
</style>

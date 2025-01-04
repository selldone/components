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
    :class="selected && !show ? 'active' : ''"
    class="slider-container pointer-pointer d-flex align-center justify-center"
    @click="toggle()"
    style="min-height: 32px"
  >
    <v-icon class="me-2 no-inv" size="small">
      {{ icon }}
    </v-icon>
    <v-scale-transition group leave-absolute>
      <template v-if="show">
        <u-color-circle
          v-for="item in list"
          :key="item"
          :color="item"
          class="me-1 hover-scale"
          :size="19"
          @click="select(item)"
          @click.stop
        ></u-color-circle>

        <v-btn
          class="ms-1"
          dir="auto"
          size="x-small"
          variant="elevated"
          @click="select(null)"
          @click.stop
          color="#000"
          min-height="28"
        >
          {{ $t("global.commons.all") }}
        </v-btn>
      </template>
      <template v-else>
        <u-color-circle v-if="selected" :color="selected" :size="19">
        </u-color-circle>
        <b v-else>
          {{ $t("global.commons.all") }}
        </b>
      </template>
    </v-scale-transition>
  </div>
</template>

<script lang="ts">
import UColorCircle from "@selldone/components-vue/ui/color/circle/UColorCircle.vue";

export default {
  name: "ColorSelectSlider",
  components: { UColorCircle },
  emits: ["open", "close", "select"],
  props: {
    icon: {
      required: false,
      type: String,
      default: "palette",
    },
    list: {
      required: true,
      type: Array,
    },
    modelValue: {
      required: false,
      default: null,
    },

    close: {
      required: false,
      default: true,
    },
  },

  data() {
    return {
      show: false,

      selected: null,
    };
  },
  watch: {
    modelValue() {
      this.selected = this.modelValue;
    },
    close() {
      this.show = !this.close;
    },
  },
  created() {
    this.selected = this.modelValue;
    this.show = !this.close;
  },

  methods: {
    toggle() {
      this.show = !this.show;

      if (this.show) {
        this.$emit("open");
        this.selected = null;
        this.$emit("select", null);
      }
      else{
        this.$emit("close");
      }
    },
    select(item) {
      this.selected = item;
      this.$emit("select", item);
      this.show = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.slider-container {
  user-select: none;

  color: #fff;
  background: #333;
  border-radius: 8px;
  margin: 3px;
  padding: 4px 8px;

  &.active {
    background: #eee;
    color: #333;
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

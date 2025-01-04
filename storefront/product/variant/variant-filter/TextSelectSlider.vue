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
    class="d-flex align-center justify-center slider-container pointer-pointer"
    style="min-height: 32px"
    @click="toggle()"
  >
    <v-icon class="me-2" size="small">
      {{ icon }}
    </v-icon>
    <v-scale-transition group leave-absolute>
      <template v-if="show">
        <v-btn
          v-for="item in list"
          :key="item"
          dir="auto"
          size="x-small"
          variant="outlined"
          color="#fff"
          class="tnt ms-1"
          @click="select(item)"
          @click.stop
          min-height="28"
        >

          <u-variant-asset-image :value="item" :size="20" class="ms-n1 me-1"></u-variant-asset-image>

          {{item?.removeVariantAsset()}}
        </v-btn>
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
      <template v-else >
        <b v-if="selected" dir="auto">

          <u-variant-asset-image :value="selected" :size="24"></u-variant-asset-image>

          {{selected.removeVariantAsset()}}
        </b>
        <b v-else dir="auto">
          {{  title }}
        </b>
      </template>



    </v-scale-transition>
  </div>
</template>

<script lang="ts">
import UVariantAssetImage from "@selldone/components-vue/ui/variant/asset/image/UVariantAssetImage.vue";

export default {
  name: "TextSelectSlider",
  components: { UVariantAssetImage },
  emits: ["select", "open", "close"],
  props: {
    icon: {
      required: false,
      type: String,
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

    title: {
      required: false,
      type: String,
      default: "All",
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
      else {
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
</style>

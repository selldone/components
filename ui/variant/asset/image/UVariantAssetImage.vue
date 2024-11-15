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
  <img
    v-if="$shop?.id && value && name"
    :class="{
      'inline-block': !block && !background,
      background: background,
      'hover-scale vertical-align-middle rounded': !background,
      '-selected': selected,
    }"
    :height="background ? '100%' : size"
    :src="src"
    :width="background ? '100%' : size"
    :alt="value"
  />
</template>

<script lang="ts">
export default {
  name: "UVariantAssetImage",
  components: {},
  inject: ["$shop"],
  props: {
    value: {},
    size: {
      default: 32,
    },
    block: {
      default: false,
      type: Boolean,
    },

    background: {
      default: false,
      type: Boolean,
    },
    selected: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    name() {
      const regex = /\{(.+?)\}/;
      const match = this.value?.match(regex);
      if (match?.length > 1) return match[1];

      return null;
    },
    src() {
      return this.getShopImagePath(
        `shops_${this.$shop.id}_variant-assets_${this.name}.png`,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.-selected {
  transition: none;
  border: solid 4px #000;
}
</style>

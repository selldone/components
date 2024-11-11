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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    :style="{ '--size': size, '--aspect-ratio': aspectRatio }"
    class="u--map-image"
  >
    <a
      :href="MapHelper.GetMapDirectionUrl(location, true)"
      class="-wrap"
      target="_blank"
    >
      <img
        v-if="location?.lng && location?.lat"
        :src="MapHelper.GetMapImage(location.lng, location.lat, 18)"
        class="hover-scale"
      />
    </a>
  </div>
</template>

<script lang="ts">
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";

export default {
  name: "UMapImage",
  props: {
    location: {
      require: true,
    },
    size: {
      default: "300px",
    },
    aspectRatio: {
      default: 1,
    },
  },
  components: {},

  data: function () {
    return {};
  },

  computed: {
    MapHelper() {
      return MapHelper;
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.u--map-image {
  width: var(--size);
  aspect-ratio: var(--aspect-ratio);

  .-wrap {
    border-radius: 4px;
    margin-bottom: 12px;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: inline-block;
    position: relative;

    &:after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      background-color: #000; // Set the color of the dot
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      transition: all 0.35s;
    }

    img {
      width: 100%;
      height: 100%;
    }
  }

  &:hover {
    .-wrap {
      &:after {
        background: transparent;
        border: solid 2px #000;
        width: 64px;
        height: 64px;
      }
    }
  }
}
</style>

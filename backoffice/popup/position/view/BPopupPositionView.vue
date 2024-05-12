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
  <div class="position-con" style="width: 24px; height: 24px">
    <span :class="position" class="-pos"></span>
  </div>
</template>

<script>
export default {
  name: "BPopupPositionView",
  components: {},
  props: {
    position: {
      required: true,
    },
  },

  data() {
    return {};
  },

  computed: {},
  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.position-con {
  position: relative;
  border: dashed 1px #999;

  .-pos {
    position: absolute;
    width: 30%;
    height: 30%;
    background-color: #0b77bf;

    &.center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &.top-center {
      top: 2px;
      left: 50%;
      transform: translate(-50%, 0);
    }

    &.top-right {
      top: 2px;
      right: 2px;
    }

    &.top-left {
      top: 2px;
      left: 2px;
    }

    &.bottom-center {
      bottom: 2px;
      left: 50%;
      transform: translate(-50%, 0);
    }

    &.bottom-right {
      bottom: 2px;
      right: 2px;
    }

    &.bottom-left {
      bottom: 2px;
      left: 2px;
    }

    &.right-center {
      right: 2px;
      top: 50%;
      transform: translate(0, -50%);
    }

    &.left-center {
      left: 2px;
      top: 50%;
      transform: translate(0, -50%);
    }
  }
}
</style>

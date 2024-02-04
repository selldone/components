<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-avatar
    class="s---category"
    :class="{ 'bg-amber-soft': isAmber }"
    :size="size"
    rounded="xl"
  >
    <v-avatar :size="size - borderSize" class="rounded-18px" color="#fff">
      <v-img v-if="src" :src="getShopImagePath(src)">
        <template v-slot:placeholder>
          <s-image-placeholder
            :color="isAmber ? '#de8e07' : undefined"
            :bg-color="isAmber ? 'amber' : undefined"
          ></s-image-placeholder>
        </template>
      </v-img>
      <v-icon v-else>camera</v-icon>
    </v-avatar>
    <v-icon
      class="absolute-bottom-end bg-amber-soft rounded-ts-circle h-auto w-auto pa-1 ma-n1"
      color="#fff"
    >
      {{ sideIcon }}
    </v-icon>

    <div
      v-if="caption"
      class="single-line s---title"
      style="background: inherit"
    >
      {{ caption }}
    </div>
  </v-avatar>
</template>

<script>
import { defineComponent } from "vue";
import SImagePlaceholder from "@components/ui/image/placeholder/SImagePlaceholder.vue";

export default defineComponent({
  name: "SAvatarFolder",
  components: { SImagePlaceholder },
  props: {
    src: {},
    isAmber: Boolean,
    size: {
      default: 62,
    },
    borderSize: {
      default: 10,
    },
    sideIcon: {
      default: "devices_fold",
    },
    caption: {},
  },
});
</script>

<style scoped lang="scss">
.s---category {
  position: relative;

  .s---title {
    position: absolute;
    left: 12px;
    right: 12px;
    top: 7px;
    padding: 3px 3px;
    border-radius: 8px;
    font-size: 7px;
    max-width: calc(100% - 24px);
    width: calc(100% - 24px);
    overflow: hidden;
    display: block;
    color: #000;
  }
}
</style>

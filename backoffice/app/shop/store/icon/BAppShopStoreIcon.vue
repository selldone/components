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
  <div class="position-relative" style="max-width: 96px">
    <v-img
      :class="{ loading: loading }"
      :src="
        app.icon
          ? getShopImagePath(app.icon, 128)
          : require('@selldone/core-js/helper/image/assets/image-placeholder.svg')
      "
      class="card-white hover-able pointer-pointer image-loading"
      height="96"
      width="96"
      @click="$emit('select', app)"
    />
    <v-progress-circular
      v-if="loading"
      color="#eee"
      indeterminate
      size="80"
      style="position: absolute; top: 8px; left: 8px"
      width="14"
    />

    <small class="limited-text-100px">
      {{ app.name }}
    </small>

    <v-avatar
      v-if="mode_badge"
      :title="mode_badge.title"
      class="absolute-top-end shadow-small pointer-event-none"
      color="#fff"
      size="32"
    >
      <img :src="mode_badge.src" class="p-1"
    /></v-avatar>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { AppMode } from "@selldone/core-js/enums/application/AppMode";

export default defineComponent({
  name: "BAppShopStoreIcon",
  props: {
    app: {
      require: true,
    },
    loading: Boolean,
  },

  computed: {
    mode_badge() {
      const mode = this.app.mode;
      if (mode === AppMode.TEST.code) return AppMode.TEST;
      else if (mode === AppMode.ENTERPRISE.code) return AppMode.ENTERPRISE;
      return null;
    },
  },
});
</script>

<style scoped lang="scss"></style>

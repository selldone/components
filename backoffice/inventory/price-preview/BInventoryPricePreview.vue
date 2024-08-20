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
  <div class="position-relative">
    <u-cube no-animation size="168" z="80"></u-cube>
    <u-cube
      v-if="multiple"
      no-animation
      size="72"
      style="position: absolute; left: 30%; bottom: 10%"
    ></u-cube>
    <v-sheet
      :color="priceColor"
      style="
        position: absolute;
        top: 20px;
        right: 10%;
        border-radius: 24px;
        font-size: 16px;
        padding: 12px;
        z-index: 1;
      "
    >
      <slot></slot>
    </v-sheet>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import UCube from "../../../ui/cube/UCube.vue";

export default defineComponent({
  name: "BInventoryPricePreview",
  components: { UCube },
  props: {
    multiple: Boolean,
    priceColor: {
      default: "#fff",
    },
  },
});
</script>

<style lang="scss" scoped></style>

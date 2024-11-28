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
  <div >
    <div
      class="border-bottom border-left border-right pa-1 border-top-0 rounded-b-lg"
      style="min-height: 20px; font-size: 10px; font-weight: 500;border-style: dashed !important;"
    >
      {{ getName(pre) }}
    </div>
    <v-card
      variant="outlined"
      height="100"
      class="my-2 d-flex align-center justify-center pa-3 text-uppercase"
      rounded="lg"
    >
      {{ title }}
    </v-card>
    <div
      class="border-top border-left border-right pa-1 border-bottom-0 rounded-t-lg"
      style="min-height: 20px; font-size: 10px; font-weight: 500;border-style: dashed !important;"
    >
      {{ getName(next) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BProductProfileLocationPreview",
  inject: ["$shop"],
  props: {
    title: String,
    orderKey: String,
  },
  computed: {
    order() {
      return this.$shop?.theme?.order;
    },
    index() {
      return this.order?.findIndex((item) => item === this.orderKey);
    },
    pre() {
      if( this.index ===-1)return "Product Page";
      if( this.index ===0)return "Product Info";
      return this.index > 0 ? this.order[this.index - 1] : "";
    },
    next() {
      if( this.index ===-1)return "";
      return this.index < this.order?.length - 1
        ? this.order[this.index + 1]
        : "";
    },
  },
});
</script>

<style scoped lang="scss"></style>

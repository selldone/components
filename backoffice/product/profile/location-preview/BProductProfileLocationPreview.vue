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
  <div v-if="modern" class="b-product-profile-location-preview text-start">
    <div class="b-product-profile-location-preview__label">
      <b-product-edit-info-icon name="PanelsTopLeft" :size="14" />
      <span>{{ label }}</span>
    </div>
    <ol>
      <li v-if="pre">{{ getName(pre) }}</li>
      <li class="b-product-profile-location-preview__current">{{ title }}</li>
      <li v-if="next">{{ getName(next) }}</li>
    </ol>
  </div>
  <div v-else>
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
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default defineComponent({
  name: "BProductProfileLocationPreview",
  components: { BProductEditInfoIcon },
  inject: ["$shop"],
  props: {
    title: String,
    orderKey: String,
    modern: Boolean,
    label: String,
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

<style scoped lang="scss">
.b-product-profile-location-preview {
  .b-product-profile-location-preview__label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    color: rgba(var(--v-theme-on-surface), .65);
    font-size: 12px;
    line-height: 18px;
  }
  ol { list-style: none; margin: 0; padding: 0; }
  li {
    position: relative;
    padding: 6px 10px;
    padding-inline-start: 28px;
    color: rgba(var(--v-theme-on-surface), .65);
    font-size: 12px;
    line-height: 19px;

    &::before {
      content: "";
      position: absolute;
      inset-inline-start: 12px;
      top: 13px;
      width: 5px;
      height: 5px;
      border: 1px solid rgba(var(--v-theme-on-surface), .35);
      border-radius: 50%;
      background: rgb(var(--v-theme-surface));
    }
    &:not(:last-child)::after {
      content: "";
      position: absolute;
      inset-inline-start: 14px;
      top: 19px;
      bottom: -12px;
      border-inline-start: 1px solid rgba(var(--v-theme-on-surface), .12);
    }
  }
  .b-product-profile-location-preview__current {
    border-radius: 6px;
    background: rgba(var(--v-theme-on-surface), .035);
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    font-weight: 500;

    &::before { border-color: currentColor; background: currentColor; }
  }
}
</style>

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
  <div class="u--button-decorative c-container">
    <component
      :is="to ? 'router-link' : 'div'"
      :class="{ disabled: disabled, 'bg-red-soft': isRed, 'bg-gray': isGray }"
      :style="`border-color: ${border_color} !important; color: ${text_color}`"
      :to="to"
      class="elevation-3 border pp px-5 py-7 d-flex ma-2 c-widget align-center"
    >
      <u-loading-progress v-if="loading"></u-loading-progress>
      <v-icon v-if="icon" :color="text_color" class="me-1">{{ icon }}</v-icon>
      <v-spacer></v-spacer>

      <span
        ><v-icon v-if="titleIcon" :color="text_color" class="me-1">{{
          titleIcon
        }}</v-icon>
        {{ title }}<br />
        <small :style="{ color: text_color }">{{ subtitle }}</small>
      </span>

      <v-spacer></v-spacer>

      <v-icon :color="text_color">{{ $t("icons.chevron_next") }}</v-icon>
    </component>
  </div>
</template>

<script>
export default {
  name: "UButtonDecorative",
  props: {
    icon: {},
    title: {},
    to: {},
    subtitle: {},
    titleIcon: {},
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    isRed: Boolean,
    isGray: Boolean,
  },

  computed: {
    text_color() {
      return this.isRed ? "#fff" : "#000";
    },
    border_color() {
      return this.isRed ? "#ff0000" : "#ddd";
    },
  },
};
</script>

<style lang="scss" scoped>
.u--button-decorative {
  .elevation-3 {
    transition: all 0.35s;

    &:hover {
      box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.2) !important;
      z-index: 3;
      transform: translateY(-2px);
    }
  }
}
</style>

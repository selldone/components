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
  <div class="d-flex flex-column align-center">
    <component
      :is="to ? 'router-link' : href ? 'a' : 'div'"
      :class="{
        '-large': large,
        placeholder: placeholder,
        'auto-scale': autoScaleDown,
        selected: selected,
        disabled: disabled,
      }"
      :href="href"
      :target="href ? '_blank' : null"
      :to="to"
      class="c-it text-black"
      @click="$emit('click')"
    >
      <img v-if="src" :src="src" height="36" width="36" />
      <v-icon v-if="icon" :color="iconColor" size="36">{{ icon }}</v-icon>
      <span class="mt-1">{{ name }}</span>
    </component>
    <v-btn
      v-if="toSetting"
      :to="toSetting"
      class="tnt"
      exact
      size="small"
      variant="plain"
      @click.stop
    >
      <v-icon start>settings</v-icon>
      {{ $t("global.commons.setting") }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "SFeatureButton",
  props: {
    href: {},
    to: {},
    src: {},
    icon: {},
    name: {},
    toSetting: {},
    placeholder: {
      default: false,
      type: Boolean,
    },
    large: {
      default: false,
      type: Boolean,
    },
    iconColor: {
      default: "#333",
    },
    autoScaleDown: {
      default: false,
      type: Boolean,
    },
    selected: {
      default: false,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
  },
};
</script>

<style lang="scss" scoped>
.c-it {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 10px 50px 5px rgba(113, 112, 112, 0.24) !important;
  cursor: pointer;
  transition: all 0.4s;
  margin: 10px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  position: relative;
  z-index: 1;

  min-width: 84px;
  min-height: 84px;

  &.-large {
    min-width: 106px;
    min-height: 106px;
  }

  &:hover {
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.3) !important;
    z-index: 3;
  }

  img {
    margin-bottom: 4px;
  }

  &.placeholder {
    border: dashed thin #444;
    opacity: 0.5;
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
  }

  &.auto-scale {
    @media only screen and (max-width: 550px) {
      margin: 5px;
      font-size: 9px;
      padding: 8px;
      min-width: 64px;
      min-height: 64px;

      img {
        width: 24px !important;
        height: 24px !important;
      }
    }
  }

  &.selected {
    background-color: #0b77bf;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.3) !important;
    color: #fff !important;
  }
}
</style>

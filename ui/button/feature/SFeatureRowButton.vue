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
  <component
    :is="to ? 'router-link' : 'div'"
    :class="{ disabled: disabled }"
    :style="color ? `border-color: ${color} !important; color: ${color}` : null"
    :to="to"
    class="row-hover rounded-xl border px-5 py-7 d-flex m-2 bg-gray"

  >
    <s-progress-loading v-if="loading"></s-progress-loading>
    <v-icon v-if="icon" :color="color" class="me-1">{{ icon }}</v-icon>
    <v-spacer></v-spacer>

    <span
      ><v-icon v-if="titleIcon" :color="color ? color : '#111'" class="me-1">{{
        titleIcon
      }}</v-icon>
      {{ title }}<br />
      <small :style="{ color: color }">{{ subtitle }}</small>
    </span>

    <v-spacer></v-spacer>

    <v-icon :color="color">{{ $t("icons.chevron_next") }}</v-icon>
  </component>
</template>

<script>
export default {
  name: "SFeatureRowButton",
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
    color: {},
  },
};
</script>

<style scoped></style>

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
  <div :style="{ height: height }" class="s--value-box">
    <div class="flex-grow-1 border-end text-start pe-1 me-1">
      <v-icon v-if="icon" class="me-1">{{ icon }}</v-icon>
      {{ label }}
    </div>
    <div :class="{ vb50: vb50 }" class="-val text-subtitle-2">
      <u-check v-if="isBoolean(value)" :model-value="value" read-only></u-check>
      <span v-else>{{ value }}</span>
      <slot name="value"></slot>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "UTextValueBox",
  props: {
    label: {},
    value: {},
    icon: {},
    vb50: {
      type: Boolean,
      default: false,
    },
    height: {},
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--value-box {
  display: flex;
  align-items: center;
  border: solid thin #ddd;
  border-radius: 12px;
  padding: 3px 8px;
  margin: 4px auto;

  .-val {
    flex-basis: 30%;
    padding: 2px 4px;
    text-align: center;

    &.vb50 {
      flex-basis: 50%;
    }
  }
}
</style>

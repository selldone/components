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
  <div
    :style="{ height: height }"
    class="s--value-box"
    :class="{ '-small': small }"
  >
    <div class="flex-grow-1 border-end text-start pe-1 me-1">
      <v-icon v-if="icon" class="me-1">{{ icon }}</v-icon>
      {{ label }}
    </div>
    <div :class="{ vb50: vb50, vb25: vb25, vb75: vb75 }" class="-val">
      <u-check v-if="isBoolean(value)" :model-value="value" read-only></u-check>
      <span v-else>{{ value }}</span>
      <slot name="value"></slot>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "UTextValueBox",
  props: {
    label: {},
    value: {},
    icon: {},
    vb75: Boolean,
    vb50: {
      type: Boolean,
      default: false,
    },
    vb25: Boolean,
    height: {},
    small: Boolean,
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
    font-size: 0.875rem;
    font-weight: 500;

    &.vb75 {
      flex-basis: 75%;
    }

    &.vb50 {
      flex-basis: 50%;
    }

    &.vb25 {
      flex-basis: 25%;
    }
  }

  &.-small {
    padding: 1px 4px;
    border-radius: 6px;
    margin: 2px auto;
    font-size: 10px;

    .-val {
      font-size: 0.7rem;
    }
  }
}
</style>

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
  <div class="clock__digit" :class="{ '-small': small }">
    <Transition mode="out-in" name="change">
      <div :key="value.charAt(0)" class="digit">
        {{ value.charAt(0) }}
      </div>
    </Transition>
    <Transition mode="out-in" name="change">
      <div :key="value.charAt(1)" class="digit">
        {{ value.charAt(1) }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DigitalClockDigit",
  props: {
    value: {
      type: String,
      required: true,
    },
    small: Boolean,
  },
});
</script>

<style scoped lang="scss">
.clock__digit {
  font-size: 2.25rem; /* Equivalent to text-4xl */
  font-weight: 900; /* Equivalent to font-black */
  color: #f7fafc; /* Equivalent to text-gray-100 */

  display: flex;
  gap: 0.25rem; /* Optional: Add spacing between digits if needed */

  &.-small {
    font-size: 1.0rem;
    gap: 0.125rem;
  }
}

.digit {
  position: relative;
  display: inline-block;
  vertical-align: top;
}

/* Transition Styles */
.change-enter-active,
.change-leave-active {
  transition: all 200ms ease;
}

.change-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.change-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>

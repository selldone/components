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
  <v-chip
    :color="value > 0 ? '#255e27' : value === 0 ? '#888' : '#922222'"
    :density="density"
    :size="size"
    :style="{
      backgroundColor: value > 0 ? '#F0F4C3' : value === 0 ? '#eee' : '#FFCDD2',
    }"
    class="s--change-chip"
    label
    pill
    variant="text"
  >
    <v-icon
      v-if="value"
      :color="value > 0 ? '#255e27' : '#922222'"
      size="small"
      start
    >
      {{ value > 0 ? "fa:fas fa-caret-up" : "fa:fas fa-caret-down" }}
    </v-icon>

    <u-price
      v-if="currency"
      :amount="value"
      :currency="currency"
    ></u-price>
    <span v-else>{{ numeralFormat(value, "0.[00]a") }}</span>

    <slot></slot>
  </v-chip>
</template>

<script>
export default {
  name: "UChipChange",
  components: {},
  props: {
    value: {},
    currency: {},
    size: {},
    density: {},
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

.s--change-chip {
  font-size: 12px;
  unicode-bidi: plaintext;
  white-space: nowrap;
  font-weight: 600;
}
</style>

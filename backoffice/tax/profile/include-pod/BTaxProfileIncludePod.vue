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
  <div class="text-center py-5">
    <div class="pod mx-auto">
      <v-icon color="#111">local_pizza</v-icon>
      <div>Net price</div>

      <div
        :style="{ 'max-height': included ? '20px' : '0' }"
        class="position-relative -trans"
      >
        <v-chip
          :color="included ? '#FFC107' : '#8BC34A'"
          size="x-small"
          label variant="flat"
          :style="{ bottom: included ? '0' : '-30px' }"
          class="-trans"
          ><v-icon start>loupe</v-icon>Tax</v-chip
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BTaxProfileIncludePod",
  props: {
    included: {},
  },
};
</script>

<style scoped lang="scss">
.-trans{
  transition: all 0.3s ease-in-out;
}
</style>

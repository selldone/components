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
  <div>
    <h1 class="mx-2 fadeIn">{{ title }}</h1>
    <small
      v-if="subtitle"
      class="text-capitalize mx-2 d-block fadeIn delay_100"
      >{{ subtitle }}</small
    >
    <p class="mx-2 fadeIn delay_200">
      {{ desc.substring(0, more ? 256 : 80) }}
      <v-btn
        v-if="!more && desc.length > 80"
        icon
        size="small"
        variant="text"
        @click="more = true"
      >
        <v-icon>more_horiz</v-icon>
      </v-btn>
    </p>
  </div>
</template>

<script>
export default {
  name: "CommunityHeader",
  props: {
    title: {},
    subtitle: {},
    desc: {},
  },

  data() {
    return {
      more: false, // Show all description
    };
  },
};
</script>

<style scoped></style>

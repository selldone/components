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
  <span>
    <v-avatar class="hover-scale me-1" size="36">
      <v-img :src="getUserAvatar(person.user_id)" />
    </v-avatar>
  </span>
</template>

<script>
export default {
  name: "PersonInfoSpan",
  props: {
    person: {
      require: true,
      type: Object,
    },
  },
};
</script>

<style scoped></style>

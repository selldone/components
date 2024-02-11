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
    :class="{ 'fill-h': fillH }"
    :title="$t('global.notification.update_license')"
    class="overlay-block clickable --red text-uppercase"
    @click.stop="$router.push({ name: 'ShopEdit_License' })"
  ></div>
</template>

<script>
export default {
  name: "UpdateLicenseLayer",
  props: {
    fillH: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>

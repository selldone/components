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
  <a
    class="typo-body border rounded-18px d-flex align-center overflow-hidden d-block"
    href="https://selldone.com/gapi/books/Do-Your-Business-Like-A-Game.pdf"
    target="_blank"
  >
    <img
      class="m-2 me-4"
      height="32"
      src="../../../assets/icons/pdf.svg"
      width="32"
    />

    <div
      :class="{ 'text-wrap small': $vuetify.display.mdAndDown }"
      class="flex-grow-1 pe-2 text-black text-capitalize"
    >
      The ultimate guide to start and make your first sale on your ecommerce.
    </div>
    <v-btn
      :min-width="$vuetify.display.smAndUp ? 150 : 64"
      class="tnt"
      color="#000"
      dark
      height="64"
      tile
      variant="flat"
    >
      <v-icon class="me-1" size="small">download</v-icon>
      <span v-if="$vuetify.display.smAndUp">
        {{ $t("global.actions.download_now") }}
      </span>
    </v-btn>
  </a>
</template>

<script>
export default {
  name: "HandBookDownloadButton",
  props: {},
};
</script>

<style lang="scss" scoped>
.small {
  font-size: 13px;
}
</style>

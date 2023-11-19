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
  <v-btn
    depressed
    :color="busy ? 'default' : color"
    dark
    rounded
    :class="{ disabled: disabled }"
    @click="busy ? '' : $emit('click')"
  >
    <slot v-if="!this.busy" />

    <lottie
      v-else
      :options="{ path: '/animation/719-loading.json', loop: true }"
      height="84px"
      width="100px"
      :speed="1"
    />
  </v-btn>
</template>

<script>
export default {
  name: "LoadingButton",

  props: {
    busy: {
      required: false,
      type: Boolean,
      default: false
    },

    disabled: {
      required: false,
      type: Boolean,
      default: false
    },
    color: {
      required: false,
      default: "success"
    }
  },

  data: () => ({}),

  computed: {}
};
</script>

<style scoped></style>

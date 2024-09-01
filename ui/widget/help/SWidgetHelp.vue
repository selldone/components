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
  <v-btn
    @click="dialog = true"
    class="tnt"
    variant="text"
    color="#4f46e5"
    slim
    prepend-icon="tips_and_updates"
  >
    <span style="text-decoration: underline">
      {{ title }}
    </span>
  </v-btn>
  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card @click="dialog = false" color="#fff" class="text-start">
      <v-card-title class="d-flex align-center">
        {{ title }}
        <v-spacer></v-spacer>
        <v-btn variant="text" icon @click="dialog = false" class="ms-2">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div
          v-if="code"
          style="
            position: relative;
            box-sizing: content-box;
            max-height: 80vh;
            max-height: 80svh;
            width: 100%;
            aspect-ratio: 1.4588963963963963;
            max-width: 1200px;
            margin: auto;
          "
        >
          <iframe
            :src="`https://demo.selldone.com/embed/${code}?embed_v=2`"
            loading="lazy"
            title="Cross Selling"
            allow="clipboard-write"
            frameborder="0"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            allowfullscreen
            style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            "
          ></iframe>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SWidgetHelp",
  props: {
    code: {
      required: true,
    },
    title: {
      required: true,
    },
  },
  data: () => ({
    dialog: false,
  }),
});
</script>

<style scoped lang="scss"></style>

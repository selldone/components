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
  <template v-if="embed_code">
    <v-btn
      @click="dialog = true"
      class="tnt"
      variant="text"
      color="#4f46e5"
      slim
      prepend-icon="tips_and_updates"
      :height="inline ? 'auto' : undefined"
      :class="{ 'px-1': inline }"
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
        <v-card-title class="d-flex align-center font-weight-thin">
          <v-icon class="me-2" size="16">tips_and_updates</v-icon>
          {{ title }}
          <v-spacer></v-spacer>
          <v-btn variant="text" icon @click="dialog = false" class="ms-2">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div
            v-if="embed_code"
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
              :src="`https://demo.selldone.com/embed/${embed_code}?embed_v=2`"
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
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SWidgetHelp",
  props: {
    code: {
      required: true,
    },
    inline: Boolean,
  },
  data: () => ({
    dialog: false,
  }),
  computed: {
    embed_code() {
      return this.$tm("help." + this.code)?.embed;
    },
    title() {
      return this.$tm("help." + this.code)?.title;
    },
  },
});
</script>

<style scoped lang="scss"></style>

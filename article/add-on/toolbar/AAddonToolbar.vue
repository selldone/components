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
  <v-toolbar class="my-3" dense flat rounded>
    <v-icon color="#999">more_vert</v-icon>
    <v-toolbar-title class="text-uppercase font-weight-normal"
      ><small>{{ title }}</small></v-toolbar-title
    >
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <slot></slot>

      <v-btn v-if="editButton" icon @click="$emit('click:edit')">
        <v-icon>{{ editIcon }}</v-icon>
      </v-btn>

      <v-btn icon title="Add line before" @click="addEnterBefore()">
        <v-icon>subdirectory_arrow_left</v-icon>
      </v-btn>

      <v-btn icon title="Add line after" @click="addEnterAfter()">
        <v-icon>subdirectory_arrow_right</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script lang="ts">
export default {
  name: "AAddonToolbar",
  props: {
    element: {
      require: true,
    },
    title: {},
    editButton: {
      type: Boolean,
      default: true,
    },
    editIcon: {
      default: "edit",
    },
  },

  methods: {
    addEnterAfter() {
      $(this.element).after("<p>...</p>");
    },
    addEnterBefore() {
      $(this.element).before("<p>...</p>");
    },
  },
};
</script>

<style scoped></style>

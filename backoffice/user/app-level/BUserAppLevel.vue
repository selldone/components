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
  <v-select
    v-model="selectedAppLevel"
    :density="dense ? 'compact' : undefined"
    :items="app_level"
    :label="$t('app_levels.title')"
    :rounded="rounded"
    :theme="dark ? 'dark' : 'light'"
    :variant="filled ? 'filled' : 'plain'"
    flat
    hide-details
    item-value="level"
    return-object
  >
    <template v-slot:item="{ item, props }">
      <v-list-item class="text-start" v-bind="props">
        <template v-slot:title>
          {{ $t(item.raw.title) }}
        </template>
        <template v-slot:append>
          <v-rating
            :model-value="item.raw.level"
            color="primary"
            density="compact"
            empty-icon="radio_button_unchecked"
            full-icon="lens"
            readonly
            size="small"
          ></v-rating>
        </template>
      </v-list-item>
    </template>

    <template v-slot:selection="{ item }">
      <div class="d-flex align-center justify-space-between">
        <span class="px-1 flex-grow-1 text-start">
          {{ $t(item.raw.title) }}</span
        >

        <v-rating
          :model-value="item.raw.level"
          color="primary"
          density="compact"
          empty-icon="radio_button_unchecked"
          full-icon="lens"
          readonly
          size="small"
          style="max-width: 130px"
        ></v-rating>
      </div>
    </template>
  </v-select>
</template>

<script lang="ts">
import { User } from "@selldone/core-js";

export default {
  name: "BUserAppLevel",
  emits: ["select"],
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    selectedAppLevel: User.Preferences.AppLevel.ADVANCED,
  }),

  computed: {
    app_level() {
      return Object.values(User.Preferences.AppLevel);
    },
  },

  watch: {
    selectedAppLevel(selectedAppLevel) {
      this.$store.commit("setAppLevel", selectedAppLevel);
      this.$emit("select", selectedAppLevel.code);
    },

    "$store.getters.getAppLevel"(val) {
      this.selectedAppLevel = val;
    },
  },

  methods: {},

  created() {
    this.selectedAppLevel = this.$store.getters.getAppLevel;
  },
};
</script>

<style scoped></style>

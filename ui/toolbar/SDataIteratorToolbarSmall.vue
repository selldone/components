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
  <v-toolbar
    :color="color"
    :dark="dark"
    :style="`border-radius: ${radius};padding:${padding}`"
    class="my-2 overflow-hidden"
    flat
    height="auto"
  >
    <v-text-field
      v-if="show_search"
      :label="$t('global.data_toolbar.search')"
      :model-value="search"
      append-inner-icon="arrow_back"
      class="max-width-field mb-2 zoomIn"
      density="compact"
      hide-details
      prepend-inner-icon="search"
      rounded
      single-line
      variant="filled"
      @update:model-value="(value) => $emit('update:search', value)"
      @click:append-inner="show_search = false"
    >
    </v-text-field>

    <template v-if="has_sort && !show_search">
      <v-btn class="me-1" icon @click="show_search = true">
        <v-icon>search</v-icon>
      </v-btn>
      <v-menu offset-y z-index="99999999">
        <template v-slot:activator="{ props }">
          <v-btn
            :close="!!sortBy"
            :color="sortBy ? 'blue' : undefined"
            :dark="!!sortBy"
            :icon="!sortBy"
            :title="$t('global.data_toolbar.sort_by')"
            class="mx-2"
            rounded
            size="small"
            v-bind="props"
            variant="flat"
            @click:close="$emit('update:sort-by', null)"
          >
            <v-icon class="me-1">sort</v-icon>
            {{ sortBy_object ? $t(sortBy_object.label) : "" }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in sortKeys"
            :key="index"
            density="compact"
            @click="$emit('update:sort-by', item.value)"
          >
            <v-list-item-title>{{ $t(item.label) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        dark
        icon
        rounded
        size="small"
        variant="flat"
        @click="(value) => $emit('update:sortDesc', !sortDesc)"
      >
        <v-icon
          >{{ sortDesc ? "keyboard_arrow_down" : "keyboard_arrow_up" }}
        </v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <slot></slot>
    </template>
  </v-toolbar>
</template>

<script>
export default {
  name: "SDataIteratorToolbarSmall",

  props: {
    sortKeys: {
      required: false,
      type: Array,
    },

    search: {
      required: false,
      type: String,
    },

    sortBy: {
      required: false,
      type: String,
    },

    sortDesc: {
      required: false,
      type: Boolean,
    },
    itemsPerPage: {
      required: false,
      type: Number,
    },
    baseItemsCount: {
      required: false,
      type: Number,
      default: 8,
    },
    dark: {
      required: false,
      type: Boolean,
      default: false,
    },
    color: {
      required: false,
      type: String,
      default: "transparent",
    },

    radius: {
      required: false,
      type: String,
      default: "0",
    },

    padding: {
      required: false,
      type: String,
      default: "0",
    },

    center: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    pages: [],
    show_search: false,
  }),

  computed: {
    has_sort() {
      return this.sortKeys && this.sortKeys.length;
    },

    items() {
      return [
        this.baseItemsCount,
        this.baseItemsCount * 2,
        this.baseItemsCount * 4,
        this.baseItemsCount * 8,
      ];
    },
    sortBy_object() {
      return this.sortKeys.find((item) => item.value === this.sortBy);
    },
  },
};
</script>

<style scoped></style>

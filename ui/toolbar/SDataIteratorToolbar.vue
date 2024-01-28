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
    class="my-2 overflow-auto"
    flat
    :color="color"
    :dark="dark"
    height="auto"
    :style="`border-radius: ${radius};padding:${padding}`"
    :extended="$vuetify.display.smAndDown"
    extension-height="68"
  >
    <v-spacer v-if="center && $vuetify.display.mdAndUp"></v-spacer>

    <template v-if="has_sort && $vuetify.display.mdAndUp">
      <v-btn-toggle
        :model-value="sortBy"
        @update:model-value="(val) => $emit('update:sort-by', val)"
        class="rounded-group ms-2"
        selected-class="dark-flat"
        borderless
        light
      >
        <v-btn
          :value="item.value"
          v-for="(item, index) in sortKeys"
          :key="index.value"
          :small="small"
          class="tnt"
          variant="flat"
        >
          {{ $t(item.label) }}
        </v-btn>
      </v-btn-toggle>

      <v-btn-toggle
        :dark="dark"
        :model-value="sortDesc"
        @update:model-value="(value) => $emit('update:sortDesc', value)"
        mandatory
        class="mx-2"
        selected-class="dark-flat"
        borderless
      >
        <v-btn :value="false" :small="small" variant="flat">
          <v-icon>keyboard_arrow_up</v-icon>
        </v-btn>
        <v-btn :value="true" :small="small" variant="flat">
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-btn-toggle>
    </template>

    <slot></slot>

    <v-spacer v-if="$vuetify.display.mdAndUp"></v-spacer>

    <v-menu offset-y v-if="$vuetify.display.smAndUp" open-on-hover>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          class="mx-2"
          :dark="dark"
          icon
          :title="itemsPerPage"
        >
          <v-icon>view_module</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          @click="$emit('update:itemsPerPage', item)"
        >
          <v-list-item-title
            >{{ $t("global.data_toolbar.count_item", { item: item }) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-text-field
      :model-value="search"
      @update:model-value="(value) => $emit('update:search', value)"
      clearable
      variant="solo"
      flat
      hide-details
      prepend-inner-icon="search"
      :placeholder="$t('global.commons.search')"
      class="max-width-field"
      :density="dense && 'compact'"
      :single-line="true"
      bg-color="transparent"
    >
    </v-text-field>

    <template v-slot:extension v-if="has_sort && $vuetify.display.smAndDown">
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            :dark="dark"
            :close="!!sortBy"
            @click:close="$emit('update:sort-by', null)"
            class="mx-2 tnt"
            height="48"
            variant="flat"
          >
            <v-icon start size="small">sort</v-icon>
            {{
              sortBy_object
                ? $t(sortBy_object.label)
                : $t("global.data_toolbar.sort_by")
            }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in sortKeys"
            :key="index.value"
            density="compact"
            @click="$emit('update:sort-by', item.value)"
          >
            <v-list-item-title>{{ $t(item.label) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn-toggle
        :dark="dark"
        :model-value="sortDesc"
        @update:model-value="(value) => $emit('update:sortDesc', value)"
        mandatory
        selected-class="dark-flat"
        class="rounded-group mx-2"
        borderless
      >
        <v-btn :value="false">
          <v-icon>keyboard_arrow_up</v-icon>
        </v-btn>
        <v-btn :value="true">
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-btn-toggle>
    </template>
  </v-toolbar>
</template>

<script>
export default {
  name: "SDataIteratorToolbar",

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

    dense: {
      type: Boolean,
      default: false,
    },

    center: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    pages: [],
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

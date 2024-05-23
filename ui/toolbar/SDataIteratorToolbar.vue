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
    :extended="$vuetify.display.smAndDown"
    :style="`border-radius: ${radius};padding:${padding}`"
    class="my-2 overflow-auto"
    extension-height="68"
    flat
    height="auto"
  >
    <v-spacer v-if="center && $vuetify.display.mdAndUp"></v-spacer>

    <template v-if="has_sort && $vuetify.display.mdAndUp">
      <v-btn-toggle
        :model-value="sortKey"
        class="rounded-group ms-2"
        selected-class="dark-flat"
        @update:model-value="(val) => $emit('update:sortKey', val)"
      >
        <v-btn
          v-for="(item, index) in sortKeys"
          :key="index.value"
          :small="small"
          :value="item.value"
          class="tnt"
          variant="flat"
        >
          {{ $t(item.label) }}
        </v-btn>
      </v-btn-toggle>

      <v-btn-toggle
        :model-value="sortOrder"
        class="mx-2"
        mandatory
        selected-class="dark-flat"
        @update:model-value="(value) => $emit('update:sortOrder', value)"
      >
        <v-btn :small="small" value="asc" variant="flat">
          <v-icon>keyboard_arrow_up</v-icon>
        </v-btn>
        <v-btn :small="small" value="desc" variant="flat">
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-btn-toggle>
    </template>

    <slot></slot>

    <v-spacer v-if="$vuetify.display.mdAndUp"></v-spacer>

    <v-menu v-if="$vuetify.display.smAndUp" open-on-hover>
      <template v-slot:activator="{ props }">
        <v-btn :title="itemsPerPage" class="mx-2" icon v-bind="props">
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
      :density="dense ? 'compact' : undefined"
      :model-value="search"
      :placeholder="$t('global.commons.search')"
      :single-line="true"
      bg-color="transparent"
      class="max-width-field min-width-200"
      clearable
      flat
      hide-details
      prepend-inner-icon="search"
      variant="solo"
      @update:model-value="(value) => $emit('update:search', value)"
    >
    </v-text-field>

    <template v-if="has_sort && $vuetify.display.smAndDown" v-slot:extension>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            :close="!!sortKey"
            class="mx-2 tnt"
            height="48"
            v-bind="props"
            variant="flat"
            @click:close="$emit('update:sortKey', null)"
          >
            <v-icon size="small" start>sort</v-icon>
            {{
              sortKey_object
                ? $t(sortKey_object.label)
                : $t("global.data_toolbar.sort_by")
            }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in sortKeys"
            :key="index.value"
            density="compact"
            @click="$emit('update:sortKey', item.value)"
          >
            <v-list-item-title>{{ $t(item.label) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn-toggle
        :model-value="sortOrder"
        class="rounded-group mx-2"
        mandatory
        selected-class="dark-flat"
        @update:model-value="(value) => $emit('update:sortOrder', value)"
      >
        <v-btn value="asc">
          <v-icon>keyboard_arrow_up</v-icon>
        </v-btn>
        <v-btn value="desc">
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

    sortKey: {
      required: false,
      type: String,
    },

    sortOrder: {
      required: false,
      type: String,
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
    sortKey_object() {
      return this.sortKeys.find((item) => item.value === this.sortKey);
    },
  },
};
</script>

<style scoped></style>

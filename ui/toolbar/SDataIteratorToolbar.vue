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
    :extended="$vuetify.breakpoint.smAndDown"
    extension-height="68"
  >
    <v-spacer v-if="center && $vuetify.breakpoint.mdAndUp"></v-spacer>

    <template v-if="has_sort && $vuetify.breakpoint.mdAndUp">
      <v-btn-toggle
        :value="sortBy"
        @change="(val) => $emit('update:sort-by', val)"
        class="rounded-group ms-2"
        active-class="dark-flat"
        borderless
        light
      >
        <v-btn
          :value="item.value"
          v-for="(item, index) in sortKeys"
          :key="index.value"
          :small="small"
          class="tnt"
          depressed
        >
          {{ $t(item.label) }}
        </v-btn>
      </v-btn-toggle>

      <v-btn-toggle
        :dark="dark"
        :value="sortDesc"
        @change="(value) => $emit('update:sortDesc', value)"
        mandatory
        class="mx-2"
        active-class="dark-flat"
        borderless
      >
        <v-btn :value="false" :small="small" depressed>
          <v-icon>keyboard_arrow_up</v-icon>
        </v-btn>
        <v-btn :value="true" :small="small" depressed>
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-btn-toggle>
    </template>

    <slot></slot>

    <v-spacer v-if="$vuetify.breakpoint.mdAndUp"></v-spacer>

    <v-menu offset-y v-if="$vuetify.breakpoint.smAndUp" open-on-hover>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" class="mx-2" :dark="dark" icon :title="itemsPerPage">
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
      :value="search"
      @input="(value) => $emit('update:search', value)"
      clearable
      solo
      flat
      hide-details
      prepend-inner-icon="search"
      :placeholder="$t('global.commons.search')"
      class="max-width-field"
      :dense="dense"
      :single-line="true"
      background-color="transparent"
    >
    </v-text-field>

    <template slot="extension" v-if="has_sort && $vuetify.breakpoint.smAndDown">
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            :dark="dark"
            :close="!!sortBy"
            @click:close="$emit('update:sort-by', null)"
            class="mx-2 tnt"
            height="48"
            depressed
          >
            <v-icon left small>sort</v-icon>
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
            dense
            @click="$emit('update:sort-by', item.value)"
          >
            <v-list-item-title>{{ $t(item.label) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn-toggle
        :dark="dark"
        :value="sortDesc"
        @change="(value) => $emit('update:sortDesc', value)"
        mandatory
        active-class="dark-flat"
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

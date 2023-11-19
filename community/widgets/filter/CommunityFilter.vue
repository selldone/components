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
  <v-col cols="12" class="c-max-w">
    <div class="bg-white c-widget nopx">
      <div class="d-flex border-between fnt-as">
        <v-btn
          depressed
          text
          tile
          large
          min-height="48"
          class="border-end"
          @click="$emit('update:opxActive', !opxActive)"
          :color="opxActive ? 'success' : undefined"
        >
          <v-icon class="me-1">{{
            !opxActive ? "wysiwyg" : "view_headline"
          }}</v-icon>
        </v-btn>

        <v-btn
          depressed
          text
          tile
          large
          class="w-25"
          min-height="48"
          @click="$emit('update:filter', 'posts')"
          :color="filter === 'posts' ? 'success' : undefined"
        >
          <v-icon class="me-1">batch_prediction</v-icon>
          {{$t('community.filter.all_posts')}}

        </v-btn>

        <v-btn
          depressed
          text
          tile
          large
          class="w-25"
          min-height="48"
          @click="$emit('update:filter', 'media')"
          :color="filter === 'media' ? 'success' : undefined"
        >
          <v-icon class="me-1">photo_camera</v-icon>
          {{$t('community.filter.media_only')}}

        </v-btn>

        <v-text-field
          :value="search"
          @input="(val) => $emit('update:search', val)"
          append-icon="search"
          single-line
          solo
          flat
          hide-details
          clearable
          class="w-50"
          :placeholder="$t('global.commons.search')"
        >
        </v-text-field>
      </div>
    </div>

    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="blue" text class="mt-2" v-bind="attrs" v-on="on" :loading="loadingSort">
          {{ sort.text }}
          <v-icon class="ms-1" small
            >{{ sort.sortDesc ? "south" : "north" }}
          </v-icon>
        </v-btn>
      </template>
      <v-list class="text-start">
        <v-list-item
          v-for="(item, index) in sorts"
          :key="index"
          @click="
            sort = item;
            $emit('update:sort', item);
          "
          :disabled="sort === item"
        >
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-col>
</template>

<script>
export default {
  name: "CommunityFilter",

  props: {
    filter: {
      default: "posts",
    },
    search: {},
    opxActive: {},
    loadingSort: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      sorts: [
        { sortBy: "created_at", sortDesc: true, text: this.$t('community.filter.created_at') },
        { sortBy: "created_at", sortDesc: false, text:this.$t('community.filter.created_at_asc') },
        { sortBy: "positive-reactions", sortDesc: true, text: this.$t('community.filter.positive_reactions') },
        { sortBy: "engagement", sortDesc: true, text: this.$t('community.filter.engaged')},
      ],

      sort: null,
    };
  },

  created() {
    this.sort = this.sorts[0];
  },
};
</script>

<style scoped lang="scss"></style>

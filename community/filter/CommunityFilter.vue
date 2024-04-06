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
  <v-col class="c-max-w" cols="12">
    <div class="bg-white c-widget nopx">
      <div class="d-flex border-between">
        <v-btn
          :color="opxActive ? 'success' : undefined"
          class="border-end"
          min-height="56"
          size="large"
          variant="text"
          tile
          min-width="56"
          @click="$emit('update:opxActive', !opxActive)"
        >
          <v-icon class="me-1"
            >{{ !opxActive ? "wysiwyg" : "view_headline" }}
          </v-icon>
        </v-btn>

        <v-btn
          :color="filter === 'posts' ? 'success' : undefined"
          size="large"
          min-height="56"
          min-width="56"
          tile
          variant="text"
          @click="$emit('update:filter', 'posts')"
        >
          <v-icon class="me-1">batch_prediction</v-icon>
          <span class="d-none d-sm-inline-block tnt">
            {{ $t("community.filter.all_posts") }}</span
          >
        </v-btn>

        <v-btn
          :color="filter === 'media' ? 'success' : undefined"
          min-height="56"
          min-width="56"
          tile
          size="large"
          variant="text"
          @click="$emit('update:filter', 'media')"
        >
          <v-icon class="me-1">photo_camera</v-icon>
          <span class="d-none d-sm-inline-block tnt">
            {{ $t("community.filter.media_only") }}
          </span>
        </v-btn>

        <v-text-field
          :model-value="search"
          :placeholder="$t('global.commons.search')"
          append-inner-icon="search"
          class="w-50"
          clearable
          flat
          hide-details
          single-line
          variant="solo"
          @update:model-value="(val) => $emit('update:search', val)"
        >
        </v-text-field>
      </div>
    </div>

    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          :loading="loadingSort"
          class="mt-2"
          color="blue"
          v-bind="props"
          variant="text"
        >
          {{ sort.text }}
          <v-icon class="ms-1" size="small"
            >{{ sort.sortDesc ? "south" : "north" }}
          </v-icon>
        </v-btn>
      </template>
      <v-list class="text-start">
        <v-list-item
          v-for="(item, index) in sorts"
          :key="index"
          :disabled="sort === item"
          @click="
            sort = item;
            $emit('update:sort', item);
          "
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
        {
          sortBy: "created_at",
          sortDesc: true,
          text: this.$t("community.filter.created_at"),
        },
        {
          sortBy: "created_at",
          sortDesc: false,
          text: this.$t("community.filter.created_at_asc"),
        },
        {
          sortBy: "positive-reactions",
          sortDesc: true,
          text: this.$t("community.filter.positive_reactions"),
        },
        {
          sortBy: "engagement",
          sortDesc: true,
          text: this.$t("community.filter.engaged"),
        },
      ],

      sort: null,
    };
  },

  created() {
    this.sort = this.sorts[0];
  },
};
</script>

<style lang="scss" scoped></style>

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
  <v-container>
    <v-skeleton-loader class="mx-auto" type="table-heading"></v-skeleton-loader>

    <v-row>
      <v-col v-for="i in 4" :key="i" cols="6" md="3" sm="4">
        <v-skeleton-loader
          class="mx-auto"
          :type="['article', 'text@2']"
        ></v-skeleton-loader>
      </v-col>

      <v-col cols="12">
        <hr />
      </v-col>

      <v-col v-for="item in 8" :key="item.key" cols="12" lg="3" md="4" sm="6">
        <v-skeleton-loader
          class="mx-auto"
          type="table-heading"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default {
  name: "CommunityStatisticViewSkeleton",
  components: {},
  props: {},

  data() {
    return {};
  },

  created() {},

  computed: {},
  methods: {},
};
</script>

<style scoped></style>

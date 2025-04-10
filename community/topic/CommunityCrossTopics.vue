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
  <v-col class="c-max-w d-flex align-center" cols="12">
    <v-btn
      color="success"
      icon
      size="small"
      variant="flat"
      @click="show_cross = true"
    >
      <v-icon>add</v-icon>
    </v-btn>

    <v-row class="flex-grow-1" justify="end" no-gutters>
      <v-btn
        v-if="main_community"
        key="m"
        :href="getUrl(main_community)"
        :title="main_community.title"
        class="m-2"
        icon
        variant="text"
        size="large"
        target="_blank"
      >
        <v-avatar>
          <img :src="getShopImagePath(main_community.image)" />
        </v-avatar>
      </v-btn>

      <v-btn
        v-for="item in cross_communities"
        :key="item.id"
        :href="getUrl(item)"
        :title="item.title"
        class="m-2"
        icon
        variant="text"
        size="large"
        target="_blank"
      >
        <v-avatar>
          <img :src="getShopImagePath(item.image)" />
        </v-avatar>
      </v-btn>
    </v-row>

    <v-btn v-if="false" icon variant="text">
      <v-icon>more_horiz</v-icon>
    </v-btn>

    <!-- ------------------------------------ Cross Dialog ------------------------------------ -->
    <v-dialog
      v-if="show_cross"
      v-model="show_cross"
      :fullscreen="$vuetify.display.smAndDown"
      max-width="640"
      scrollable
    >
      <v-card min-height="420">
        <v-card-title class="d-flex align-center"
          >Create cross topic
          <v-spacer></v-spacer>
          <v-btn icon size="large" @click="show_cross = false" variant="text">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="text-start d-flex flex-column">
          <p>Copy and past this code in your community's category</p>

          <h2 class="text-center ma-auto text-h2 text-success">
            <span v-copy>{{ community.id }}/{{ topic.id }}</span>
          </h2>
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script lang="ts">
import { CommunityURLs } from "@selldone/sdk-community/url/CommunityURLs";

export default {
  name: "CommunityCrossTopics",
  components: {},
  props: {
    community: {
      required: true,
    },
    topic: {
      required: true,
    },
  },

  data() {
    return {
      show_cross: false,
    };
  },

  computed: {
    cross_communities() {
      return this.topic.cross_communities;
    },
    main_community() {
      return this.topic.main_community;
    },
  },
  methods: {
    getUrl(item) {
      return CommunityURLs.TopicShortUrl(item.id, this.topic.id); // Topic id is same!
    },
  },
};
</script>

<style lang="scss" scoped></style>

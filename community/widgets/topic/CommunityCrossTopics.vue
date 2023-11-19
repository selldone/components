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
  <v-col cols="12" class="c-max-w d-flex align-center">
    <v-btn @click="show_cross = true" color="success" dark depressed fab small
      ><v-icon>add</v-icon></v-btn
    >

    <v-row no-gutters class="flex-grow-1" justify="end">

      <v-btn
              v-if="main_community"
              key="m"
              :href="getUrl(main_community)"
              target="_blank"
              large
              class="m-2"
              icon
              :title="main_community.title"
      >

        <v-avatar>
          <img :src="getShopImagePath(main_community.image)">
        </v-avatar>
      </v-btn>



      <v-btn
        v-for="item in cross_communities"
        :key="item.id"
        :href="getUrl(item)"
        target="_blank"
        large
        class="m-2"
        icon
        :title="item.title"
        >

       <v-avatar>
         <img :src="getShopImagePath(item.image)">
       </v-avatar>
      </v-btn>
    </v-row>


    <v-btn icon v-if="false"><v-icon>more_horiz</v-icon></v-btn>

    <!-- ------------------------------------ Cross Dialog ------------------------------------ -->
    <v-dialog
      v-if="show_cross"
      v-model="show_cross"
      max-width="640"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card min-height="420">
        <v-card-title
          >Create cross topic
          <v-spacer></v-spacer>
          <v-btn icon large @click="show_cross = false"
            ><v-icon>close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text class="text-start d-flex flex-column">
          <p>Copy and past this code in your community's category</p>

          <h2 class="text-center m-auto display-3 text-success">
            <span v-copy>{{ community.id }}/{{ topic.id }}</span>
          </h2>
        </v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>
import CommunityURLs from "../../helper/CommunityURLs";

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

<style scoped lang="scss"></style>

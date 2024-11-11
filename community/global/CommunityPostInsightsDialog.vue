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
  <v-bottom-sheet
    v-if="post"
    v-model="dialog"
    width="560"
    max-width="98vw"
    scrollable
    content-class="rounded-t-xl"
  >
    <v-card rounded="t-xl">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">ssid_chart</v-icon>
        Insights

        <v-spacer></v-spacer>
        <v-btn icon variant="text" size="large" @click="dialog = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="text-center insi">
        <v-row>
          <v-col
            v-for="item in PostActions"
            :key="item.code"
            cols="6"
            md="3"
            sm="4"
          >
            <small class="d-block">
              <v-icon>{{ item.icon }}</v-icon>
              <br />
              {{ $t(item.name) }}</small
            >
            <b>{{ numeralFormat(post[item.code], "0.[00]a") }}</b>
          </v-col>
        </v-row>
        <hr />
        <v-row justify="space-around">
          <v-col
            v-for="item in PostReaction"
            :key="item.code"
            col="6"
            md="2"
            sm="3"
          >
            <small class="d-block"
              ><img :src="item.image" height="24" width="24" /><br />
              {{ $t(item.name) }}</small
            >
            <b>{{ numeralFormat(post[item.column], "0.[00]a") }}</b>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { CommunityPost } from "@selldone/core-js";
import { CommunityPostReaction } from "@selldone/core-js/models";
import { EventBus } from "@selldone/core-js/events/EventBus";

export default {
  name: "CommunityPostInsightsDialog",
  components: {},
  props: {
    community: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      post: null,

      PostReaction: CommunityPostReaction.Reactions,
      PostActions: CommunityPost.PostActions,
    };
  },

  computed: {},

  watch: {},

  methods: {},

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    EventBus.$on("community:show-post-insights", ({ post }) => {
      this.post = post;
      this.dialog = true;
    });
  },
  beforeUnmount() {
    EventBus.$off("community:show-post-insights");
  },
};
</script>

<style lang="scss">
.insi {
  b {
    font-size: 18px;
    display: block;
    margin-top: 8px;
  }
}
</style>

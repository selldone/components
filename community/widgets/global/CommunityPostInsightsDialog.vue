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
  <v-dialog
    v-if="post"
    v-model="dialog"
    max-width="560"
    scrollable
    :fullscreen="$vuetify.display.mdAndDown"
  >
    <v-card>
      <v-card-title>
        Insights

        <v-spacer></v-spacer>
        <v-btn icon large @click="dialog = false"><v-icon>close</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="text-center insi">
        <v-row>
          <v-col
            v-for="item in PostAction"
            :key="item.code"
            cols="6"
            sm="4"
            md="3"
          >
            <small class="d-block"
              ><v-icon>{{ item.icon }}</v-icon
              ><br />
              {{ $t(item.name) }}</small
            >
            <b>{{   numeralFormat(post[item.code],"0.[00]a") }}</b>
          </v-col>
        </v-row>
        <hr />
        <v-row justify="space-around">
          <v-col
            v-for="item in PostReaction"
            :key="item.code"
            col="6"
            sm="3"
            md="2"
          >
            <small class="d-block"
              ><img width="24" height="24" :src="item.image" /><br />
              {{ $t(item.name) }}</small
            >
            <b>{{   numeralFormat(post[item.column],"0.[00]a") }}</b>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { PostReaction } from "@core/enums/community/PostReaction";
import { PostAction } from "@core/enums/community/PostAction";

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

      PostReaction: PostReaction,
      PostAction: PostAction,
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
    this.EventBus.$on("community:show-post-insights", ({ post }) => {
      this.post = post;
      this.dialog = true;
    });
  },
  beforeDestroy() {
    this.EventBus.$off("community:show-post-insights");
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

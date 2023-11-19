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
    :fullscreen="$vuetify.breakpoint.mdAndDown"
  >
    <v-card class="text-start rcard">
      <v-card-title>
        Reactions

        <v-spacer></v-spacer>
        <v-btn icon large @click="dialog = false"><v-icon>close</v-icon></v-btn>
      </v-card-title>
      <div>
        <v-tabs v-model="reaction" slider-size="4">
          <v-tabs-slider color="success"></v-tabs-slider>

          <v-tab
            v-for="item in tabs"
            :key="item.act.code"
            :href="`#${item.act.code}`"
            @click="loadData(item.act.code)"
          >
            <img :src="item.act.image" width="24" height="24" class="me-1" />
            <b>{{ item.value | numeralFormat("0.[0]a") }}</b>
          </v-tab>
        </v-tabs>
      </div>
      <hr />
      <v-card-text>
        <v-list two-line class="border-between-vertical">
          <v-list-item v-for="item in filtered_reactions" :key="item.user_id">
            <v-list-item-avatar size="56" class="my-0">
              <v-img
                :src="getUserAvatar(item.user_id)"
                class="position-relative"
              >
                <img :src="PostReaction[item.reaction].image" class="ubadg" />
              </v-img>
            </v-list-item-avatar>
            <v-list-item-content class="p-0">
              <v-list-item-title class="uname"
                >{{ item.name }}
                <v-icon v-if="item.verified" small color="blue" class="ms-1"
                  >verified</v-icon
                ></v-list-item-title
              >
              <v-list-item-subtitle class="udesc my-1">{{
                item.description
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <div
          v-if="has_more"
          style="height: 120px"
          v-intersect.quiet="
            (entries) => {
              if (entries[0].isIntersecting) getMore();
            }
          "
        ></div>
      </v-card-text>

      <progress-loading v-if="busy"></progress-loading>
    </v-card>
  </v-dialog>
</template>

<script>
import { PostReaction } from "@core/enums/community/PostReaction";

export default {
  name: "CommunityPostReactionsDialog",
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
      reaction: null,

      PostReaction: PostReaction,

      reactions: [],

      busy: false,

      // -----------------
      page: 1,
      itemsPerPage: 10,
    };
  },

  computed: {
    tabs() {
      const out = [
        { act: PostReaction.LIKE, value: this.post.likes },
        { act: PostReaction.SMILE, value: this.post.smiles },
        { act: PostReaction.CLAP, value: this.post.claps },
        { act: PostReaction.IDEA, value: this.post.ideas },
        { act: PostReaction.DISAGREE, value: this.post.disagrees },
      ];

      return out
        .filter((i) => i.value)
        .sort(function (a, b) {
          return b.value - a.value;
        });
    },

    filtered_reactions() {
      if (!this.reaction) return this.reactions;

      return this.reactions.filter((i) => i.reaction === this.reaction);
    },

    total() {
      switch (this.reaction) {
        case PostReaction.LIKE.code:
          return this.post.likes;
        case PostReaction.SMILE.code:
          return this.post.smiles;
        case PostReaction.CLAP.code:
          return this.post.claps;
        case PostReaction.IDEA.code:
          return this.post.ideas;
        case PostReaction.DISAGREE.code:
          return this.post.disagrees;
      }

      return (
        this.post.likes +
        this.post.smiles +
        this.post.claps +
        this.post.ideas +
        this.post.disagrees
      );
    },

    has_more() {
      return this.total < this.filtered_reactions.length;
    },
  },

  watch: {},

  methods: {
    getMore() {
      if (this.has_more) {
        this.page++;
        this.getPostReactionsDetail();
      }
    },
    getPostReactionsDetail() {
      this.busy = true;

      axios
        .get(
          window.CAPI.GET_COMMUNITY_TOPIC_POST_REACTIONS(
            this.post.community_id,
            this.post.topic_id,
            this.post.id
          ),
          {
            params: {
              reaction: this.reaction,

              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
            },
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            data.reactions.forEach((r) => {
              this.AddOrUpdateItemByID(this.reactions, r, "user_id");
            });
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    loadData(reaction) {
      if (this.reaction === reaction) return;

      this.old_reaction = reaction;
      this.reaction = reaction;
      this.page = 1;

      if (this.filtered_reactions.length < this.itemsPerPage) {
        this.getPostReactionsDetail();
      } else {
        this.total = this.filtered_reactions.length + 1; // Force refresh at end!
      }
    },
  },

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    this.EventBus.$on("community:show-post-reactions", ({ post, reaction }) => {
      this.post = post;
      this.reaction = reaction;
      this.dialog = true;
      this.reactions = []; // Reset
      this.getPostReactionsDetail();
    });
  },
  beforeDestroy() {
    this.EventBus.$off("community:show-post-reactions");
  },
};
</script>

<style lang="scss">
.uname {
  font-size: 16px;
  font-weight: 600;
}
.udesc {
  font-size: 14px;
  font-weight: 400;
  white-space: normal !important;
}
.ubadg {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 20px !important;
  height: 20px !important;
  padding: 4px;
  background-color: #fff;
}
.rcard {
  min-height: 570px;
}
</style>

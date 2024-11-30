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
    :fullscreen="$vuetify.display.mdAndDown"
    max-width="560"
    scrollable
  >
    <v-card class="text-start" min-height="50vh">
      <v-card-title class="d-flex align-center">
        Reactions

        <v-spacer></v-spacer>
        <v-btn icon size="large" @click="dialog = false" variant="text">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <div>
        <v-tabs v-model="reaction" slider-size="4">
          <v-tab
            v-for="item in tabs"
            :key="item.act.code"
            :href="`#${item.act.code}`"
            @click="loadData(item.act.code)"
          >
            <img :src="item.act.image" class="me-1" height="24" width="24" />
            <b>{{ numeralFormat(item.value, "0.[0]a") }}</b>
          </v-tab>
        </v-tabs>
      </div>
      <v-card-text>
        <v-list
          class="border-between-vertical"
          lines="two"
          density="comfortable"
        >
          <v-list-item v-for="item in filtered_reactions" :key="item.user_id">
            <template v-slot:prepend>
              <span class="position-relative me-3">
                <v-avatar
                  size="56"
                  :image="getUserAvatar(item.user_id)"
                  alt="User"
                >
                </v-avatar>
                <img
                  :src="PostReaction[item.reaction].image"
                  class="ubadg"
                  :alt="item.reaction"
                />
              </span>
            </template>
            <v-list-item-title class="uname"
              >{{ item.name }}
              <v-icon
                v-if="item.verified"
                class="ms-1"
                color="blue"
                size="small"
                >verified
              </v-icon>
            </v-list-item-title>
            <v-list-item-subtitle class="udesc my-1"
              >{{ item.description }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <div
          v-if="has_more"
          v-intersect.quiet="
            (isIntersecting) => {
              if (isIntersecting) getMore();
            }
          "
          style="height: 120px"
        ></div>
      </v-card-text>

      <u-loading-progress v-if="busy"></u-loading-progress>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { CommunityPostReaction } from "@selldone/core-js";
import { EventBus } from "@selldone/core-js/events/EventBus";

export default {
  name: "CommunityPostReactionsDialog",
  mixins: [],
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

      PostReaction: CommunityPostReaction.Reactions,

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
        { act: CommunityPostReaction.Reactions.LIKE, value: this.post.likes },
        { act: CommunityPostReaction.Reactions.SMILE, value: this.post.smiles },
        { act: CommunityPostReaction.Reactions.CLAP, value: this.post.claps },
        { act: CommunityPostReaction.Reactions.IDEA, value: this.post.ideas },
        {
          act: CommunityPostReaction.Reactions.DISAGREE,
          value: this.post.disagrees,
        },
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
        case CommunityPostReaction.Reactions.LIKE.code:
          return this.post.likes;
        case CommunityPostReaction.Reactions.SMILE.code:
          return this.post.smiles;
        case CommunityPostReaction.Reactions.CLAP.code:
          return this.post.claps;
        case CommunityPostReaction.Reactions.IDEA.code:
          return this.post.ideas;
        case CommunityPostReaction.Reactions.DISAGREE.code:
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
            this.post.id,
          ),
          {
            params: {
              reaction: this.reaction,

              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            data.reactions.forEach((r) => {
              this.AddOrUpdateItemByID(this.reactions, r, "user_id");
            });
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
    EventBus.$on("community:show-post-reactions", ({ post, reaction }) => {
      this.post = post;
      this.reaction = reaction;
      this.dialog = true;
      this.reactions = []; // Reset
      this.getPostReactionsDetail();
    });
  },
  beforeUnmount() {
    EventBus.$off("community:show-post-reactions");
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
  right: 0px;
  bottom: 0px;
  width: 20px !important;
  height: 20px !important;
  padding: 4px;
  background-color: #fff;
  border-radius: 50%;
  overflow: hidden;
}
</style>

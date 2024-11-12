/*
 * Copyright (c) 2023-2024. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */


import {CommunityComment, CommunityPost, CommunityTopic, Shop, UserProfile} from "@selldone/core-js/models";
import {EventBus} from "@selldone/core-js/events/EventBus.ts";

const CommunityMixin = {
  methods: {

    //―――――――――――――――――――――― Community global ――――――――――――――――――――
    showCommunityUserProfile(profile: UserProfile) {
      EventBus.$emit("community:show-profile", { profile });
    },

    showCommunitySharePost(
        activator: Element,
        shop: Shop,
        topic: CommunityTopic,
        post: CommunityPost,
    ) {
      EventBus.$emit("community:share:post", {
        activator,
        shop,
        topic,
        post,
      });
    },


    showCommunityPostReactions(post: CommunityPost, reaction: string) {
      EventBus.$emit("community:show-post-reactions", { post, reaction });
    },

    showCommunityPostInsights(post: CommunityPost) {
      EventBus.$emit("community:show-post-insights", { post });
    },

    showCommunityPostActionsMenu(
        activator: Element,
        topic: CommunityTopic,
        post: CommunityPost,
        delete_callback: () => void,
    ) {
      EventBus.$emit("community:post-actions-menu", {
        activator,
        topic,
        post,
        delete_callback,
      });
    },


    showCommunityPostReportsMenu(post: CommunityPost) {
      EventBus.$emit("community:show-post-reports", { post });
    },

    showCommunityCommentActionsMenu(
        activator: Element,
        shop: Shop,
        post: CommunityPost,
        comment: CommunityComment,
        delete_callback: () => void,
    ) {
      EventBus.$emit("community:comment-actions-menu", {
        activator,
        shop,
        post,
        comment,
        delete_callback,
      });
    },


    showCommunityCommentReportsMenu(comment: CommunityComment) {
      EventBus.$emit("community:show-comment-reports", { comment });
    },


    //―――――――――――――――――――――― Community global >Analytics ――――――――――――――――――――

    onCommunityPostImpression(topic: CommunityTopic, post: CommunityPost) {
      EventBus.$emit("community:analytics:post:impression", {
        topic,
        post,
      });
    },


    onCommunityPostShare(topic: CommunityTopic, post: CommunityPost) {
      EventBus.$emit("community:analytics:post:share", { topic, post });
    },
    onCommunityPostEmbed(topic: CommunityTopic, post: CommunityPost) {
      EventBus.$emit("community:analytics:post:embed", { topic, post });
    },

    onCommunityPostView(topic: CommunityTopic, post: CommunityPost) {
      EventBus.$emit("community:analytics:post:view", { topic, post });
    },











  },
};

export default CommunityMixin;

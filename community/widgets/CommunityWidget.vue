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
  <div
    class="c-container pa-3 -force-rounded"
    v-intersect.quiet.once="
      (entries) => {
        if (entries[0].isIntersecting) onCommunityPostImpression(topic, post);
      }
    "
    :id="'post-' + post.id"
  >
    <!-- tips: overflow-visible: show discount ribbon of product -->

    <div class="c-widget bg-white overflow-visible">
      <!-- Header -->
      <div class="d-flex mx-4 mt-2 align-center">
        <v-avatar
          size="3.2em"
          color="#fafafa"
          class="c-avatar pp"
          :class="avatar_class"
          @click="showCommunityUserProfile(post.profile)"
        >
          <img :src="getUserAvatar(post.user_id)" />
        </v-avatar>
        <div class="flex-grow-1 ps-3 pe-2 overflow-hidden">
          <b class="d-block single-line text-capitalize"
            >{{ post.profile.name }}
            <v-icon v-if="post.profile.verified" small color="blue" class="ms-1"
              >verified</v-icon
            ></b
          >
          <small class="d-block single-line">{{
            post.profile.description
          }}</small>
          <small class="d-block">{{ getFromNowString(post.created_at) }}</small>
        </div>

        <div class="opx">
          <v-btn
            v-if="!simpleMode"
            icon
            @click="
              (e) =>
                showCommunityPostActionsMenu(
                  e.target,
                  topic,
                  post,
                  (post, topic_removed) =>
                    $emit('delete', { post, topic_removed })
                )
            "
          >
            <v-icon>more_horiz</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Topic header -->
      <div v-if="question" class="mx-4 mt-1">
        <small>{{ $t("community.commons.topic_title") }}</small>
        <h1>
          {{ topic.title }}
        </h1>
      </div>
      <!-- Topic header in feed -->
      <div v-else-if="showTopicTitle" class="mx-4 mt-1">
        <small>{{ $t("community.commons.topic_title") }}</small>
        <h2>
          {{ topic.title }}
        </h2>
      </div>

      <!-- Cross community -->
      <div v-if="post.cross" class="mt-1 mx-4 subtitle-2 text-end">
        {{ post.cross.title }}
        <v-avatar size="24" class="ms-1 hover-scale force-top"
          ><img :src="getShopImagePath(post.cross.image)"
        /></v-avatar>
        <v-icon class="ms-2 rotate-90-s">alt_route</v-icon>
      </div>

      <!-- Deleted -->
      <p v-if="post.deleted_at" class="mx-4 mt-1 subtitle-2 red--text">
        {{ $t("global.commons.deleted_at") }}
        {{ getLocalTimeString(post.deleted_at) }}
      </p>

      <!-- Message -->
      <v-btn
        v-if="post.offensive"
        small
        text
        color="red"
        @click="force_show = !force_show"
        class="m-4"
        ><v-icon class="me-1" small>warning</v-icon>
        {{ $t("community.widget.offensive_message") }}</v-btn
      >

      <div
        v-if="!post.offensive || force_show"
        class="m-4 c-body html-style"
        v-html="smartText(post.body)"
      ></div>


      <!-- Attachment files -->
    <community-attach-view   v-if="post?.attachments?.length" :post="post" :files="post?.attachments">

    </community-attach-view>


      <!-- Poll -->
      <community-poll
        v-if="question && topic.poll"
        class="mb-2"
        :value="topic.poll"
        :user-selected-id="topic.action && topic.action.poll"
        @click:item="setPollAnswer"
        :busy="busy_poll"
      ></community-poll>

      <!-- Image -->
      <community-image
        v-if="post.image"
        :src="getShopImagePath(post.image)"
        :aspect-ratio="post.aspect"
        fullscreen
        width="100%"
        height="auto"
      ></community-image>

      <!-- Video -->
      <video
        v-if="post.video"
        width="100%"
        controls
        style="max-height: 400px; background-color: #000"
        @play="onPlayMedia"
        preload="metadata"
        muted="muted"
      >
        <source :src="getVideoUrl(post.video)"  :type="VideoHelper.GetMime(post.video)" />
      </video>

      <!-- Voice -->
      <div v-if="post.voice" class="p-2">
        <audio
          :src="getVoiceUrl(post.voice)"
          controls
          class="w-100 rounded"
          style="background-color: #000"
          @play="onPlayMedia"
        ></audio>
      </div>

      <!-- Link -->

      <div v-if="post.link_preview" class="mx-4 my-2">
        <h3>{{ post.link_preview.title }}</h3>
        <p v-if="post.link_preview.type !== 'link'">
          {{ post.link_preview.description }}
        </p>

        <div class="mt-2" v-html="post.link_preview.html"></div>
      </div>

      <!-- Product -->
      <community-product-view
        v-if="post.product_id"
        :community="community"
        :shop="shop"
        :product-id="post.product_id"
      ></community-product-view>

      <!-- Reactions & Insights -->

      <div v-if="!simpleMode" class="mx-4 py-2 d-flex">
        <div class="single-line subtitle-2">
          <!-- Show reports to admin -->
          <span
            v-if="post.reports"
            class="red--text pp"
            @click="showCommunityPostReportsMenu(post)"
          >
            <v-icon size="20" color="red">report</v-icon>
            {{ post.reports }} report(s)
          </span>

          <span
            v-if="post.reports && (post.views || reactions.length)"
            class="mx-1 op-0-2"
            >/</span
          >

          <!-- Show media views -->
          <span v-if="post.views">
            <v-icon size="20">play_arrow</v-icon>
            {{ post.views }} play
          </span>

          <span v-if="post.views && reactions.length" class="mx-1 op-0-2"
            >/</span
          >

          <!-- Users reactions -->

          <template v-for="(item, i) in reactions">
            <span
              :key="'i-' + i"
              class="pp hover-blue"
              @click="showCommunityPostReactions(post, item.act.code)"
              ><img :src="item.act.image" width="16" height="16" />
              {{ item.value | numeralFormat("0.[0]a") }}
              <span v-if="i < 3" class="text-lowercase">{{
                $t(item.act.name)
              }}</span></span
            >
            <span
              v-if="i < reactions.length - 1"
              :key="'s-' + i"
              class="mx-1 op-0-2"
              >/</span
            >
          </template>
        </div>

        <v-spacer></v-spacer>
        <v-btn
          v-if="access.admin"
          text
          color="blue"
          @click="showCommunityPostInsights(post)"
        >
          {{ $t("community.commons.view_insight") }}</v-btn
        >
      </div>

      <hr v-if="!simpleMode" class="opx" />

      <!-- User actions -->

      <div v-if="!simpleMode">
        <v-menu
          offset-y
          top
          open-on-hover
          open-on-click
          content-class="rounded-28px bg-white overflow-hidden px-3"
          close-on-content-click
          open-delay="100ms"
          close-delay="300ms"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" text :loading="busy_reaction" tile>
              <template v-if="reaction">
                <img
                  :src="reaction.image"
                  class="me-1 bounceIn"
                  width="24"
                  height="24"
                />
                {{ $t(reaction.name) }}
              </template>
              <template v-else>
                <v-icon class="me-1">thumb_up_off_alt</v-icon>
                {{ $t("community.commons.like") }}
              </template>
            </v-btn>
          </template>

          <v-btn
            v-for="(rec, key, i) in PostReaction"
            :key="key"
            icon
            class="m-2 zoomIn anim-fast sub-caption -hover"
            :caption="$t(rec.name)"
            @click="setReaction(rec.code)"
            :style="{ 'animation-delay': 50 * i + 'ms' }"
            ><img :src="rec.image" width="24" height="24"
          /></v-btn>
        </v-menu>

        <v-btn text @click="show_comments = !show_comments" tile>
          <v-icon class="me-1">{{
            show_comments ? "chat_bubble" : "chat_bubble_outline"
          }}</v-icon>
          {{ $t("community.commons.comment") }}

          <span v-if="post.total_comments" class="ms-1"
            >({{ post.total_comments | numeralFormat("0.[0]a") }})</span
          >
        </v-btn>

        <v-btn text @click="share" tile>
          <v-icon class="me-1">share</v-icon>
          {{ $t("community.commons.share") }}
        </v-btn>
      </div>
      <community-comments
        v-if="!simpleMode"
        :shop="shop"
        :post="post"
        :show.sync="show_comments"
      >
      </community-comments>
    </div>

    <!-- Trend -->
    <ribbon v-if="!simpleMode && is_trend" red top680="13px" left680="3px">
      <v-icon small dark>local_fire_department</v-icon>
      {{ $t("community.commons.trend") }}
    </ribbon>
    <!-- Approved -->
    <ribbon v-else-if="post.approved" green top680="13px" left680="3px">
      {{ $t("community.commons.approved") }}
    </ribbon>
  </div>
</template>

<script>
import { SmartConvertTextToHtmlHashtags } from "@core/helper/html/HtmlHelper";
import CommunityComments from "./comment/CommunityComments.vue";
import CommunityImage from "./image/CommunityImage.vue";
import { PostReaction } from "@core/enums/community/PostReaction";
import Ribbon from "@components/ui/ribbon/Ribbon.vue";
import CommunityPoll from "./post/CommunityPoll.vue";
import CommunityProductView from "./product/CommunityProductView.vue";
import CommunityAttachView from "./attach/CommunityAttachView.vue";
import VideoHelper from "@core/helper/video/VideoHelper";

export default {
  name: "CommunityWidget",
  components: {
    CommunityAttachView,
    CommunityProductView,
    CommunityPoll,
    Ribbon,
    CommunityImage,
    CommunityComments,
  },
  props: {
    community: {
      required: true,
      type: Object,
    },

    shop: {},

    topicTitle: {},

    topic: {
      require: true,
      type: Object,
    },
    post: {
      require: true,
      type: Object,
    },

    question: {
      // is main topic post!
      default: false,
      type: Boolean,
    },
    showTopicTitle: {
      // is main topic post!
      default: false,
      type: Boolean,
    },

    simpleMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      VideoHelper: VideoHelper,


      show_comments: false,

      PostReaction: PostReaction,

      busy_reaction: false,

      busy_poll: false,

      force_show: false,
    };
  },

  computed: {
    access() {
      return this.community.access;
    },

    avatar_class() {
      if (
        this.community.admins_list &&
        this.community.admins_list.includes(this.post.user_id)
      ) {
        return "-owner";
      } else if (
        this.community.moderators_list &&
        this.community.admins_list.includes(this.post.user_id)
      ) {
        return "-moderator";
      } else if (this.topic.user_id === this.post.user_id) {
        return "-starter";
      }
      return null;
      /*
      return ["-owner", "-moderator", "-starter"][
        Math.round(Math.random() * 2.5)
      ];*/
    },

    reactions() {
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

    reaction() {
      return (
        this.post.action &&
        this.post.action.reaction &&
        PostReaction[this.post.action.reaction]
      );
    },
    is_trend() {
      return this.question && this.topic && this.topic.trend;
    },
  },

  mounted() {},

  methods: {
    smartText(text) {
      return SmartConvertTextToHtmlHashtags(text, false, true);
    },
    share(e) {
      this.showCommunitySharePost(e.target,this.shop, this.topic, this.post);
    },
    //――――――――――――――――――――――――― Set post reaction ―――――――――――――――――――――――――

    setReaction(reaction) {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }
      this.busy_reaction = true;

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POST_REACTION(
            this.post.community_id,
            this.topic.id,
            this.post.id
          ),
          {
            reaction: reaction,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.post.action = data.action;
            Object.assign(this.post, data.post); // Update reactions count on post!
            this.$emit("update:action", data.action);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reaction = false;
        });
    },

    onPlayMedia() {
      this.onCommunityPostView(this.topic, this.post); // + Set on community analytic
    },
    //――――――――――――――――――――――――― Set poll answer ―――――――――――――――――――――――――

    setPollAnswer(item) {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }

      this.busy_poll = item;

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POLL(
            this.community.id,
            this.topic.id
          ),
          {
            poll: item.id,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.topic.action = data.action;
            this.topic.poll = data.poll;
            this.$emit("update:poll", data.poll);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_poll = false;
        });
    },
  },
};
</script>

<style lang="scss"></style>

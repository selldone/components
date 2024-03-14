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
  <component
    :is="$vuetify.display.xs ? 'v-bottom-sheet' : 'v-menu'"
    v-if="topic && post"
    v-model="value"
    :activator="activator"
    :max-width="$vuetify.display.xs ? undefined : 360"
    offset-y
    rounded="xl"
    top
  >
    <div class="p-3 bg-white">
      <s-social-share-buttons
        :description="post.body"
        :force-large="$vuetify.display.xs"
        :hashtags="hashtags"
        :media="media"
        :quote="topic.desc"
        :small="!$vuetify.display.xs"
        :title="topic.title"
        :url="url"
        class="m-0"
        @embed="onCommunityPostEmbed(topic, post)"
        @share="onCommunityPostShare(topic, post)"
      >
      </s-social-share-buttons>
    </div>
  </component>
</template>

<script>
import SSocialShareButtons from "../../ui/button/share/SSocialShareButtons.vue";
import { CommunityURLs } from "@sdk-community/url/CommunityURLs";

export default {
  name: "CommunityShareDialog",
  components: { SSocialShareButtons },
  props: {
    community: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activator: null,

      shop: null,
      topic: null,
      post: null,

      value: false,
    };
  },

  computed: {
    url() {
      console.log("CommunityURLs", CommunityURLs);
      return CommunityURLs.PostUrl(this.shop, this.post);
    },

    media() {
      return this.post.video
        ? this.getVideoUrl(this.post.video)
        : this.post.voice
          ? this.getVoiceUrl(this.post.voice)
          : this.post.image
            ? this.getShopImagePath(this.post.image)
            : null;
    },
    hashtags() {
      return this.post.tags && this.post.tags.join(",");
    },
  },

  methods: {},

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    this.EventBus.$on(
      "community:share:post",
      ({ activator, shop, topic, post }) => {
        this.activator = activator;
        this.shop = shop;
        this.topic = topic;
        this.post = post;

        this.$nextTick(() => {
          this.value = true;
        });
      },
    );
  },
  beforeUnmount() {
    this.EventBus.$off("community:share:post");
  },
};
</script>

<style lang="scss"></style>

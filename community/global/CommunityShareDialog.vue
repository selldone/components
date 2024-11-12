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
      <u-button-share-group
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
      </u-button-share-group>
    </div>
  </component>
</template>

<script lang="ts">
import UButtonShareGroup from "../../ui/button/share/group/UButtonShareGroup.vue";
import { CommunityURLs } from "@selldone/sdk-community/url/CommunityURLs";
import { EventBus } from "@selldone/core-js/events/EventBus";
import CommunityMixin from "@selldone/components-vue/mixin/community/CommunityMixin.ts";

export default {
  name: "CommunityShareDialog",
  mixins: [CommunityMixin],
  components: { UButtonShareGroup },
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
    EventBus.$on("community:share:post", ({ activator, shop, topic, post }) => {
      this.activator = activator;
      this.shop = shop;
      this.topic = topic;
      this.post = post;

      this.$nextTick(() => {
        this.value = true;
      });
    });
  },
  beforeUnmount() {
    EventBus.$off("community:share:post");
  },
};
</script>

<style lang="scss"></style>

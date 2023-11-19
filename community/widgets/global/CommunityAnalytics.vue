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
  <div></div>
</template>

<script>


  function safeIncrementProperty(obj,key,count){
    if(!key)return;
    obj[key] = obj[key] ? (obj[key] + count) : count
  }

export default {
  name: "CommunityAnalytics",
  components: {},
  props: {
    community: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      pack: null,
      //-------------------
      busy: false,

      signals: {
        "community:analytics:post:impression": this.onPostImpression,
        "community:analytics:post:share": this.onPostShare,
        "community:analytics:post:embed": this.onPostEmbed,
        "community:analytics:post:view": this.onPostView,
      },

      intervalId: null,
    };
  },

  computed: {},

  created() {
    this.reset();
  },
  methods: {
    //――――――――――――――――――――――――― Reset ―――――――――――――――――――――――――
    // shares: Copy link , share button click
    // views: Like video view or voice listen

    reset() {
      this.pack = {
        posts: { impressions: {}, shares: {}, embeds: {}, views: {} },
        topics: { impressions: {}, shares: {}, embeds: {}, views: {} },
        categories: { impressions: {}, shares: {}, embeds: {}, views: {} },
      };
    },

    //――――――――――――――――――――――――― Actions ―――――――――――――――――――――――――

    onPostImpression({topic, post }) {
      this.pack.posts.impressions[post.id]=1;
      safeIncrementProperty(this.pack.topics.impressions,topic.id,1)
      safeIncrementProperty(this.pack.categories.impressions,topic.category_id,1)
      //console.log('onPostImpression',this.pack)
    },
    onPostShare({ topic,post }) {
      this.pack.posts.shares[post.id]=1;
      safeIncrementProperty(this.pack.topics.shares,topic.id,1)
      safeIncrementProperty(this.pack.categories.shares,topic.category_id,1)
    },
    onPostEmbed({topic, post }) {
      this.pack.posts.embeds[post.id]=1;
      safeIncrementProperty(this.pack.topics.embeds,topic.id,1)
      safeIncrementProperty(this.pack.categories.embeds,topic.category_id,1)
    },
    onPostView({ topic,post }) {
      this.pack.posts.views[post.id]=1;
      safeIncrementProperty(this.pack.topics.views,topic.id,1)
      safeIncrementProperty(this.pack.categories.views,topic.category_id,1)
      //console.log('onPostImpression',this.pack.posts_view)
    },

    //――――――――――――――――――――――――― Send data ―――――――――――――――――――――――――

    sendData() {
      if (this.busy) return;

      let change = Object.values(this.pack).some(
        (val) => Object.values(val).some(v=>Object.values(v).length>0)
      );

      if (!change) return; // No change!

      this.busy = true;
      axios
        .post(window.CAPI.POST_COMMUNITY_ANALYTIC(this.community.id), this.pack)
        .then(({ data }) => {})
        .catch((error) => {})
        .finally(() => {
          this.busy = false;
        });

      this.reset();
    },
  },

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    Object.keys(this.signals).forEach((key) => {
      this.EventBus.$on(key, (data) => {
        this.signals[key](data);
      });
    });
    this.intervalId = setInterval(() => {
      this.sendData();
    }, 60 * 1000);
  },
  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    Object.keys(this.signals).forEach((key) => {
      this.EventBus.$off(key);
    });

    this.sendData(); // Send remains data.
  },
};
</script>

<style lang="scss"></style>

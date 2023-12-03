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
  <v-container
    :class="{ 'opx-active': opx_active }"
    style="margin-bottom: 20vh"
  >
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <community-breadcrumb
      class="breadcrumb-max-w mb-12"
      :shop="shop"
      :community="community"
    ></community-breadcrumb>

    <v-container class="c-max-w">
      <v-row justify="center" align="start">
        <community-widget
          v-for="(post, i) in posts"
          :key="post.id"
          :community="community"
          :topic="post.topic"
          show-topic-title
          :post="post"
          :shop="shop"
          @delete="
            () => {
              DeleteItemByID(posts, post.id);
            }
          "
          class="fadeInUp"
          :style="{ 'animation-delay': 50 * (i % itemsPerPage) + 'ms' }"
        ></community-widget>

        <!-- Auto load more -->

        <v-col
          cols="12"
          v-if="has_more"
          style="height: 50vh"
          v-intersect.quiet="
            (entries) => {
              if (entries[0].isIntersecting) fetchFeed(page + 1);
            }
          "
        >
          <s-loading light css-mode v-if="busy"></s-loading>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import CommunityBreadcrumb from "../widgets/header/CommunityBreadcrumb.vue";
import CommunityWidget from "../widgets/CommunityWidget.vue";

export default {
  name: "CommunityFeedPage",
  components: {
    CommunityWidget,

    CommunityBreadcrumb,
  },

  props: {
    shop: {},

    community: {
      required: true,
      type: Object,
    },
    categories: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      opx_active: false,

      //----------------------------------
      busy: false,
      posts: [],
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
    };
  },

  computed: {
    has_more() {
      return this.totalItems > this.posts.length;
    },
  },
  watch: {},

  created() {
    this.fetchFeed(1);
  },
  mounted() {},

  methods: {
    refreshData() {
      this.fetchFeed(1);
    },

    //――――――――――――――――――――――― Topics ―――――――――――――――――――――――

    fetchFeed(page) {
      if (this.busy) return; // Prevent multiple fetching!

      this.busy = true;
      this.$emit("busy", true);

      this.page = page;

      if (page === 1) {
        // Reset values:
        this.posts = [];
        this.totalItems = 0;
      }

      axios
        .get(window.CAPI.GET_COMMUNITY_FEED(this.community.id), {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
          },
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }
          this.posts.push(...data.posts);
          this.totalItems = 200;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          this.$emit("busy", false);
        });
    },
  },
};
</script>

<style scoped lang="scss"></style>

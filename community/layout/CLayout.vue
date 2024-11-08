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
  <div class="text-start overflow-hidden min-height-100vh">
    <!-- Loading -->
    <u-loading-progress v-if="busy"></u-loading-progress>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Header ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div
      :class="{ 'justify-center': in_search, 'justify-end': !in_search }"
      class="d-flex p-2"
    >
      <v-text-field
        v-model="search"
        :class="{
          'search-e c-widget -no-radius': in_search,
          'search-n': !in_search,
        }"
        :loading="busy_search"
        :placeholder="$t('global.commons.search')"
        append-inner-icon="search"
        clearable
        flat
        hide-details
        rounded
        single-line
        variant="solo"
        @blur="focus = false"
        @focus="focus = true"
        @keydown.enter="searchPosts(1)"
      >
      </v-text-field>
    </div>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Main view ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-fade-transition>
      <router-view
        v-if="community"
        v-show="!in_search"
        v-model:categories="categories"
        v-model:community="community"
        :communityTimeSeries="community_timeseries"
        :data="data"
        :shop="shop"
        @busy="(val) => (busy = val)"
      ></router-view>
    </v-fade-transition>

    <v-container v-if="in_search">
      <router-link
        v-for="(post, i) in posts"
        :key="post.id"
        :to="{
          name: window.$community.routes.COMMUNITY_TOPIC_PAGE,
          params: {
            category_id: post.topic.category.id,
            category_slug: slugify(post.topic.category.title),
            topic_id: post.topic.id,
            topic_slug: slugify(post.topic.title),
          },
        }"
        style="color: #111"
        @click="search = null"
      >
        <c-post-widget
          :community="community"
          :post="post"
          :shop="shop"
          :style="{ 'animation-delay': 50 * (i % itemsPerPage) + 'ms' }"
          :topic="post.topic"
          class="fadeInUp"
          simple-mode
        ></c-post-widget>
      </router-link>
    </v-container>

    <div style="min-height: 5vh"></div>

    <template v-if="community">
      <!-- Profile view -->
      <community-user-profile-dialog
        :community="community"
      ></community-user-profile-dialog>

      <!-- Share view -->
      <community-share-dialog :community="community"></community-share-dialog>

      <!-- Post Reactions view -->
      <community-post-reactions-dialog
        :community="community"
      ></community-post-reactions-dialog>

      <!-- Post Insights view -->
      <community-post-insights-dialog
        :community="community"
      ></community-post-insights-dialog>

      <!-- Post Actions Menu view -->
      <community-post-actions-menu
        :community="community"
        :shop="shop"
      ></community-post-actions-menu>

      <!-- Comment Actions Menu view -->
      <community-comment-actions-menu
        :community="community"
      ></community-comment-actions-menu>

      <!-- Comment Post Reports Dialog -->
      <community-post-reports-dialog
        :community="community"
      ></community-post-reports-dialog>

      <!-- Comment Post Reports Dialog -->
      <community-comment-reports-dialog
        :community="community"
      ></community-comment-reports-dialog>

      <!-- Comment Analytics -->
      <community-analytics :community="community"></community-analytics>
    </template>
  </div>
</template>

<script>
import CommunityUserProfileDialog from "../../community/global/CommunityUserProfileDialog.vue";
import CommunityShareDialog from "../../community/global/CommunityShareDialog.vue";
import CommunityPostReactionsDialog from "../../community/global/CommunityPostReactionsDialog.vue";
import CommunityPostInsightsDialog from "../../community/global/CommunityPostInsightsDialog.vue";
import CommunityPostActionsMenu from "../../community/global/CommunityPostActionsMenu.vue";
import CommunityCommentActionsMenu from "../../community/global/CommunityCommentActionsMenu.vue";
import CommunityPostReportsDialog from "../../community/global/CommunityPostReportsDialog.vue";
import CommunityAnalytics from "../../community/global/CommunityAnalytics.vue";
import CommunityCommentReportsDialog from "../../community/global/CommunityCommentReportsDialog.vue";
import { TimeSeries } from "@selldone/core-js/timeserie/TimeSeries";
import CPostWidget from "../post/widget/CPostWidget.vue";
import { debounce } from "lodash-es";

export default {
  name: "CLayout",
  components: {
    CPostWidget,
    CommunityCommentReportsDialog,
    CommunityAnalytics,
    CommunityPostReportsDialog,
    CommunityCommentActionsMenu,
    CommunityPostActionsMenu,
    CommunityPostInsightsDialog,
    CommunityPostReactionsDialog,
    CommunityShareDialog,
    CommunityUserProfileDialog,
  },
  props: {
    shop: {},
  },
  data() {
    return {
      community: null,
      community_timeseries: null,
      categories: null,
      data: null,

      focus: false,

      busy: false,

      search: "",
      filter: "posts",

      // ---------------------
      offset: 0,
      days: 7,

      //--------------------
      page: 1,
      busy_search: false,
      itemsPerPage: 10,
      posts: [],
      last_search: null,
    };
  },

  computed: {
    in_search() {
      return this.focus || this.search;
    },
  },
  watch: {
    search: debounce(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.searchPosts(1);
    }, 1500),
  },

  created() {
    this.search = this.$route.query.search ? this.$route.query.search : "";
    this.fetchCommunity();
  },
  mounted() {},

  methods: {
    fetchCallback: function (offset, days) {
      if (this.offset === offset && this.days === days) return; // No change!

      this.offset = offset;
      this.days = days;

      this.fetchCommunity();
    },

    fetchCommunity() {
      this.busy = true;

      const handleSuccessResponse = ({ community, categories, data }) => {
        this.community = community;

        this.categories = categories;
        this.data = data;
        // Statistics:
        if (data) {
          this.community_timeseries = new TimeSeries(
            data,
            "Community Data",
            this.offset,
            this.days,
          );

          // Register fetch callback (Use to refresh by change time span)
          this.community_timeseries.fetch = this.fetchCallback;
        }
      };

      window.$community
        .getInfo(
          window.$community.getCommunityID(this.shop),
          this.offset,
          this.days,
        )
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    //――――――――――――――――――――――― SearchPosts ―――――――――――――――――――――――

    searchPosts(page) {
      if (
        this.busy_search ||
        !this.search ||
        (this.last_search && this.last_search === this.search)
      )
        return; // Prevent multiple fetching!

      this.busy_search = true;

      this.page = page;

      if (page === 1) {
        // Reset values:
        this.posts = [];
        this.has_more = false;
      }

      this.last_search = this.search;

      const handleSuccessResponse = ({ posts, more }) => {
        this.posts.push(...posts);
        this.has_more = more;
      };

      window.$community.post
        .optimize(60)
        .searchPosts(this.community.id, this.offset, this.limit, this.search)
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_search = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.search-n,
.search-e {
  transition: all 0.8s ease;
}

.search-n {
  max-width: 250px;
}

.search-e {
  max-width: 480px;
  margin: 4vh auto;
}
</style>

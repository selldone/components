<template>
  <div class="text-start overflow-hidden min-height-100vh">
    <!-- Loading -->
    <progress-loading v-if="busy"></progress-loading>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Header ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div
      class="d-flex p-2"
      :class="{ 'justify-center': in_search, 'justify-end': !in_search }"
    >
      <v-text-field
        v-model="search"
        append-icon="search"
        @keydown.enter="searchPosts(1)"
        :loading="busy_search"
        single-line
        solo
        flat
        hide-details
        clearable
        rounded
        :class="{
          'search-e c-widget -no-radius': in_search,
          'search-n': !in_search,
        }"
        :placeholder="$t('global.commons.search')"
        @focus="focus = true"
        @blur="focus = false"
      >
      </v-text-field>
    </div>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Main view ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-fade-transition>
      <router-view
        v-if="community"
        v-show="!in_search"
        @busy="(val) => (busy = val)"
        :shop="shop"
        :community.sync="community"
        :communityTimeSeries="community_timeseries"
        :categories.sync="categories"
        :data="data"
      ></router-view>
    </v-fade-transition>

    <v-container v-if="in_search">
      <router-link
        v-for="(post, i) in posts"
        :key="post.id"
        style="color: #111;"
        :to="{
          name: 'CommunityTopicPage',
          params: {
            category_id: post.topic.category.id,
            category_slug: slugify(post.topic.category.title),
            topic_id: post.topic.id,
            topic_slug: slugify(post.topic.title),
          },
        }"
        @click.native="search=null"
      >
        <community-widget
          :community="community"
          :topic="post.topic"
          :post="post"
          :shop="shop"
          class="fadeInUp"
          :style="{ 'animation-delay': 50 * (i % itemsPerPage) + 'ms' }"
          simple-mode
        ></community-widget>
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
        :shop="shop"
        :community="community"
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
import CommunityUserProfileDialog from "../widgets/global/CommunityUserProfileDialog.vue";
import CommunityShareDialog from "../widgets/global/CommunityShareDialog.vue";
import CommunityPostReactionsDialog from "../widgets/global/CommunityPostReactionsDialog.vue";
import CommunityPostInsightsDialog from "../widgets/global/CommunityPostInsightsDialog.vue";
import CommunityPostActionsMenu from "../widgets/global/CommunityPostActionsMenu.vue";
import CommunityCommentActionsMenu from "../widgets/global/CommunityCommentActionsMenu.vue";
import CommunityPostReportsDialog from "../widgets/global/CommunityPostReportsDialog.vue";
import CommunityAnalytics from "../widgets/global/CommunityAnalytics.vue";
import CommunityCommentReportsDialog from "../widgets/global/CommunityCommentReportsDialog.vue";
import { TimeSeries } from "../../../../core/timeserie/TimeSeries";
import CommunityWidget from "../widgets/CommunityWidget.vue";
import _ from "lodash-es";
export default {
  name: "CommunityLayout",
  components: {
    CommunityWidget,
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
    search: _.debounce(function (newVal, oldVal) {
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
      axios
        .get(
          window.CAPI.GET_COMMUNITY_INFO(
            this.shop
              ? this.shop.community && this.shop.community.id
              : 1 /* 1 : Main Selldone official community */
          ),
          {
            params: {
              offset: this.offset,
              days: this.days,
            },
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.community = data.community;

            this.categories = data.categories;
            this.data = data.data;
            // Statistics:
            if (data.data) {
              this.community_timeseries = new TimeSeries(
                data.data,
                "Community Data",
                this.offset,
                this.days
              );

              // Register fetch callback (Use to refresh by change time span)
              this.community_timeseries.fetch = this.fetchCallback;
            }
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

      axios
        .get(window.CAPI.GET_COMMUNITY_POSTS_SEARCH(this.community.id), {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            search: this.search,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.posts.push(...data.posts);
            this.has_more = data.more;
          } else {
          }
        })
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

<style scoped lang="scss">
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

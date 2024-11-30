<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    class="--add-extra-top-header"
    style="margin-bottom: 20vh"
  >
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <c-breadcrumb
      v-model:show-edit="show_edit"
      v-model:show-report="show_report"
      :category="category"
      :class="{ 'mb-12': !has_cross }"
      :community="community"
      :post="target_post"
      :shop="shop"
      :topic="topic"
      class="breadcrumb-max-w"
      has-edit
      has-report
    ></c-breadcrumb>
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Edit ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <div v-if="show_edit" class="c-max-w">
        <c-post-editor
          :category="category"
          :community="community"
          :post="topic.question"
          :topic="topic"
          class="border-top-thick -blue"
          topic-mode
          @update:topic="
            (val) => {
              Object.assign(topic, val);
              show_edit = false;
            }
          "
        ></c-post-editor>
        <div class="text-end py-5">
          <v-btn
            class="m-2"
            color="red"
            variant="text"
            @click="show_critic = !show_critic"
          >
            <v-icon class="me-1" size="small">warning</v-icon>
            {{ $t("global.commons.critical_zone") }}
          </v-btn>
        </div>
        <v-expand-transition>
          <div v-if="show_critic">
            <div class="widget-box mb-5">
              <h2>
                <v-icon class="me-1" size="small">warning</v-icon>
                {{ $t("global.commons.critical_zone") }}
              </h2>
              <v-list-subheader>
                {{ $t("community.topic.remove_msg") }}
              </v-list-subheader>
              <div class="widget-buttons">
                <v-btn
                  :loading="busy_delete"
                  color="red"
                  size="x-large"
                  variant="flat"
                  @click="removeTopic()"
                >
                  <v-icon class="me-1">delete</v-icon>
                  {{ $t("community.topic.remove") }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Report ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-expand-transition>
      <div v-if="show_report">
        <community-topic-statistic
          :community="community"
          :topic-id="topic.id"
          @busy="(v) => $emit('busy', v)"
        ></community-topic-statistic>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Cross ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <community-cross-topics
      v-if="has_cross"
      :community="community"
      :topic="topic"
      class="mb-3 fadeIn c-max-w"
    ></community-cross-topics>

    <v-container class="c-max-w">
      <v-row align="start" justify="center">
        <template v-if="topic">
          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Main post ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <c-post-widget
            v-if="topic.question"
            :community="community"
            :post="topic.question"
            :shop="shop"
            :topic="topic"
            class="fadeIn"
            question
            @delete="
              ({ post, topic_removed }) => {
                topic.question = null;
                if (topic_removed)
                  $router.push({
                    name: window.$community.routes.COMMUNITY_CATEGORY_PAGE,
                  });
              }
            "
          ></c-post-widget>
          <v-col v-else class="c-container" cols="12">
            <div class="c-widget bg-white px-4 py-3">
              <small>{{ $t("community.commons.topic") }}</small>
              <h1>
                {{ topic.title }}
              </h1>

              <v-alert
                border="start"
                class="mt-4"
                color="red"
                density="compact"
                type="error"
                >{{ $t("community.topic.main_post_removed_msg") }}
              </v-alert>
            </div>
          </v-col>

          <!-- Subscription -->

          <community-topic-subscribe
            v-if="topic.subscription"
            :community="community"
            :topic="topic"
          ></community-topic-subscribe>

          <!-- New post -->

          <c-post-editor
            :category="category"
            :community="community"
            :topic="topic"
            can-product
            can-voice
            @add:post="(post) => AddOrUpdateItemByID(posts, post, 'id', false)"
          ></c-post-editor>

          <!-- filter -->
          <c-posts-filter
            v-model:filter="filter"
            v-model:opx-active="opx_active"
            v-model:search="search"
            :loadingSort="busy_posts && page === 1"
            @update:sort="setSort"
          ></c-posts-filter>

          <!-- posts > part 1 -->

          <template v-if="posts.length">
            <c-post-widget
              v-for="(post, i) in posts.slice(0, follow_index)"
              :key="post.id"
              :community="community"
              :post="post"
              :shop="shop"
              :style="{ 'animation-delay': 50 * (i % itemsPerPage) + 'ms' }"
              :topic="topic"
              class="fadeInUp"
              @delete="
                ({ post, topic_removed }) => {
                  DeleteItemByID(posts, post.id);
                  if (topic_removed)
                    $router.push({
                      name: window.$community.routes.COMMUNITY_CATEGORY_PAGE,
                    });
                }
              "
            ></c-post-widget>

            <!-- following suggestion -->

            <community-follow-suggestion
              v-if="has_suggestion"
              :community="community"
              :style="{ 'animation-delay': 50 * follow_index + 'ms' }"
              class="fadeInUp"
            ></community-follow-suggestion>

            <!-- posts > part 2 -->

            <c-post-widget
              v-for="(post, i) in posts.slice(follow_index, posts.length)"
              :key="post.id"
              :community="community"
              :post="post"
              :shop="shop"
              :style="{
                'animation-delay':
                  50 * ((i + follow_index) % itemsPerPage) + 'ms',
              }"
              :topic="topic"
              class="fadeInUp"
              @delete="
                ({ post, topic_removed }) => {
                  DeleteItemByID(posts, post.id);
                  if (topic_removed)
                    $router.push({
                      name: window.$community.routes.COMMUNITY_CATEGORY_PAGE,
                    });
                }
              "
            ></c-post-widget>

            <!-- Auto load more -->

            <v-col
              v-if="has_more"
              v-intersect.quiet="
                (isIntersecting) => {
                  if (isIntersecting) fetchPosts(page + 1,false);
                }
              "
              cols="12"
              style="height: 50vh"
            >
              <u-loading-ellipsis
                v-if="busy_posts"
                css-mode
                light
              ></u-loading-ellipsis>
            </v-col>
          </template>

          <!-- Keep space bottom -->
          <v-col v-else-if="busy_posts" cols="12" style="height: 80vh"></v-col>
        </template>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import CPostWidget from "../../post/widget/CPostWidget.vue";
import CPostEditor from "../../../community/post/editor/CPostEditor.vue";
import CPostsFilter from "../../../community/post/filter/CPostsFilter.vue";
import CBreadcrumb from "../../../community/breadcrumb/CBreadcrumb.vue";
import CommunityCrossTopics from "../../../community/topic/CommunityCrossTopics.vue";
import CommunityTopicSubscribe from "../../../community/topic/CommunityTopicSubscribe.vue";
import CommunityFollowSuggestion from "../../../community/users/CommunityFollowSuggestion.vue";
import CommunityTopicStatistic from "../../../community/topic/CommunityTopicStatistic.vue";
import { debounce } from "lodash-es";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import CommunityMixin from "@selldone/components-vue/mixin/community/CommunityMixin.ts";


export default {
  name: "CommunityTopicPage",
  mixins: [CommunityMixin ],
  components: {
    ULoadingEllipsis,
    CommunityTopicStatistic,
    CommunityFollowSuggestion,
    CommunityTopicSubscribe,

    CommunityCrossTopics,
    CBreadcrumb,
    CPostsFilter,
    CPostEditor,
    CPostWidget,
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
      category: null,
      topic: null,

      show_edit: false,
      //----------------------------------
      busy_posts: false,
      posts: [],
      page: 1,
      itemsPerPage: 10,
      has_more: false,
      //----------------------------------

      busy: false,

      search: "",
      filter: "posts",
      opx_active: false,

      sortBy: "created_at",
      sortDesc: true,

      follow_index: 3,

      show_report: false,

      //---------------------------------
      busy_delete: false,
      show_critic: false,
    };
  },

  computed: {
    access() {
      return this.community.access;
    },
    question() {
      return this.topic && this.topic.question;
    },

    community_config() {
      return this.$store.getters.getCommunityConfiguration;
    },
    show_deletes() {
      return this.community_config && this.community_config.show_deletes;
    },
    has_cross() {
      return this.topic && this.topic.cross;
    },

    has_suggestion() {
      return true;
    },
    target_post() {
      const query_post_id = parseInt(this.$route.query.post);
      if (!query_post_id) return null;
      // 1. try to find it in main topic:
      if (
        this.topic &&
        this.topic.question &&
        this.topic.question.id === query_post_id
      )
        return this.topic.question;
      // 2. Try to find it in posts:
      return this.posts && this.posts.find((p) => p.id === query_post_id);
    },
  },
  watch: {
    "$route.query"(query) {
      // Set page by query if existed:
      this.page = parseInt(this.$route.query.page ? this.$route.query.page : 1);
      this.search = this.$route.query.search ? this.$route.query.search : "";

      this.fetchTopic();
    },

    show_deletes() {
      this.fetchPosts(1,false);
    },

    filter() {
      this.fetchPosts(1,false);
    },

    search: debounce(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.fetchPosts(1,false);
    }, 1500),
  },

  created() {
    this.follow_index = this.has_suggestion
      ? Math.round(Math.random() * 3) + 1
      : 0;

    // Try to pre load category data:
    this.category = this.categories.find(
      (c) => c.id === parseInt(this.$route.params.category_id),
    );

    this.search = this.$route.query.search ? this.$route.query.search : "";

    this.fetchTopic();
  },
  mounted() {},

  methods: {
    refreshData() {
      this.fetchTopic();
    },
    //――――――――――――――――――――――― Sort ―――――――――――――――――――――――

    setSort({ sortBy, sortDesc }) {
      this.sortBy = sortBy;
      this.sortDesc = sortDesc;

      this.fetchPosts(1,false);
    },
    //――――――――――――――――――――――― Topic ―――――――――――――――――――――――

    fetchTopic() {
      this.busy = true;
      this.$emit("busy", true);

      // Fix comment link in topic (main topic post):
      const query_post_id = this.$route.query.post;
      const query_comment_id = query_post_id && this.$route.query.comment;

      axios
        .get(
          window.CAPI.GET_COMMUNITY_TOPIC_INFO(
            this.community.id,
            this.$route.params.topic_id,
          ),
          {
            params: {
              //-----------------------
              post_id: query_post_id,
              comment_id: query_comment_id,
              //-----------------------
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.posts = [];
          this.has_more = false;

          this.topic = data.topic;

          // Signal to first post impression: (Not fire on first load)
          this.onCommunityPostImpression(this.topic, this.topic.question);

          this.fetchPosts(1,false);
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          this.$emit("busy", false);
        });
    },

    //――――――――――――――――――――――― Posts ―――――――――――――――――――――――

    fetchPosts(page,scroll=false) {
      if (this.busy_posts) return; // Prevent multiple fetching!

      this.busy_posts = true;
      this.$emit("busy", true);

      const query_post_id = this.$route.query.post;
      const query_comment_id = query_post_id && this.$route.query.comment;

      this.page = page;

      if (page === 1) {
        // Reset values:
        this.posts = [];
        this.has_more = false;
      }

      axios
        .get(
          window.CAPI.GET_COMMUNITY_TOPIC_POSTS(
            this.community.id,
            this.$route.params.topic_id,
          ),
          {
            params: {
              //-----------------------
              post_id: query_post_id,
              comment_id: query_comment_id,
              //-----------------------
              filter: this.filter,

              sortBy: this.sortBy,
              sortDesc: this.sortDesc,

              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,

              search: this.search,

              deletes: this.show_deletes, // Show deletes posts
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.posts.push(...data.posts);
          this.has_more = data.more;

          // Scroll to target:
          if(scroll)
          this.$nextTick(() => {
            if (query_comment_id) {
              this.ScrollToComment(query_comment_id);
            } else if (query_post_id) {
              this.ScrollToPost(query_post_id);
            }
          });
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_posts = false;
          this.$emit("busy", false);
        });
    },
    //――――――――――――――――――――――― Scroll ―――――――――――――――――――――――
    ScrollToPost(post_id) {
      ScrollHelper.scrollToElement("#post-" + post_id, 250, "smooth");
    },
    ScrollToComment(comment_id) {
      ScrollHelper.scrollToElement("#comment-" + comment_id, 250, "smooth");
    },
    //――――――――――――――――――――――― Remove topic ―――――――――――――――――――――――
    removeTopic() {
      NotificationService.openDangerAlert(
        this.$t("community.topic.delete_dialog.title"),
        this.$t("community.topic.delete_dialog.message"),
        this.$t("community.topic.delete_dialog.actions"),
        () => {
          this.busy_delete = true;
          axios
            .delete(
              window.CAPI.DELETE_COMMUNITY_TOPIC(
                this.community.id,
                this.topic.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.$router.push({
                  name: window.$community.routes.COMMUNITY_CATEGORY_PAGE,
                });
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>

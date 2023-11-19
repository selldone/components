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
    class="--add-extra-top-header"
  >
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <community-breadcrumb
      class="breadcrumb-max-w"
      :class="{ 'mb-12': !has_cross }"
      :shop="shop"
      :community="community"
      :category="category"
      :topic="topic"
      :post="target_post"
      :show-edit.sync="show_edit"
      :show-report.sync="show_report"
      has-report
      has-edit
    ></community-breadcrumb>
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Edit ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <div v-if="show_edit" class="c-max-w">
        <community-post-editor
          class="border-top-thick -blue"
          :community="community"
          :category="category"
          :topic="topic"
          :post="topic.question"
          topic-mode
          @update:topic="
            (val) => {
              Object.assign(topic, val);
              show_edit = false;
            }
          "
        ></community-post-editor>
        <div class="text-end py-5">
          <v-btn
            @click="show_critic = !show_critic"
            color="red"
            text
            class="m-2"
            ><v-icon class="me-1" small>warning</v-icon>
            {{ $t("global.commons.critical_zone") }}</v-btn
          >
        </div>
        <v-expand-transition>
          <div v-if="show_critic">
            <div class="widget-box mb-5">
              <h2>
                <v-icon class="me-1" small>warning</v-icon>
                {{ $t("global.commons.critical_zone") }}
              </h2>
              <v-subheader>
                {{ $t("community.topic.remove_msg") }}
              </v-subheader>
              <div class="widget-buttons">
                <v-btn
                  color="red"
                  dark
                  x-large
                  @click="removeTopic()"
                  :loading="busy_delete"
                  depressed
                >
                  <v-icon class="me-1">delete</v-icon>
                  {{ $t("community.topic.remove") }}</v-btn
                >
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
      <v-row justify="center" align="start">
        <template v-if="topic">
          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Main post ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <community-widget
            v-if="topic.question"
            class="fadeIn"
            :community="community"
            :topic="topic"
            :post="topic.question"
            :shop="shop"
            @delete="
              ({ post, topic_removed }) => {
                topic.question = null;
                if (topic_removed)
                  $router.push({ name: 'CommunityCategoryPage' });
              }
            "
            question
          ></community-widget>
          <v-col v-else cols="12" class="c-container">
            <div class="c-widget bg-white px-4 py-3">
              <small>{{ $t("community.commons.topic") }}</small>
              <h1>
                {{ topic.title }}
              </h1>

              <v-alert
                type="error"
                color="red"
                border="left"
                dense
                class="mt-4"
                >{{ $t("community.topic.main_post_removed_msg") }}</v-alert
              >
            </div>
          </v-col>

          <!-- Subscription -->

          <community-topic-subscribe
            v-if="topic.subscription"
            :community="community"
            :topic="topic"
          ></community-topic-subscribe>

          <!-- New post -->

          <community-post-editor
            :community="community"
            :category="category"
            :topic="topic"
            can-voice
            can-product
            @add:post="(post) => AddOrUpdateItemByID(posts, post, 'id', false)"
          ></community-post-editor>

          <!-- filter -->
          <community-filter
            :search.sync="search"
            :filter.sync="filter"
            :opx-active.sync="opx_active"
            @update:sort="setSort"
            :loadingSort="busy_posts && page === 1"
          ></community-filter>

          <!-- posts > part 1 -->

          <template v-if="posts.length">
            <community-widget
              v-for="(post, i) in posts.slice(0, follow_index)"
              :key="post.id"
              :community="community"
              :topic="topic"
              :post="post"
              :shop="shop"
              @delete="
                ({ post, topic_removed }) => {
                  DeleteItemByID(posts, post.id);
                  if (topic_removed)
                    $router.push({ name: 'CommunityCategoryPage' });
                }
              "
              class="fadeInUp"
              :style="{ 'animation-delay': 50 * (i % itemsPerPage) + 'ms' }"
            ></community-widget>

            <!-- following suggestion -->

            <community-follow-suggestion
              v-if="has_suggestion"
              :community="community"
              class="fadeInUp"
              :style="{ 'animation-delay': 50 * follow_index + 'ms' }"
            ></community-follow-suggestion>

            <!-- posts > part 2 -->

            <community-widget
              v-for="(post, i) in posts.slice(follow_index, posts.length)"
              :key="post.id"
              :community="community"
              :topic="topic"
              :post="post"
              :shop="shop"
              @delete="
                ({ post, topic_removed }) => {
                  DeleteItemByID(posts, post.id);
                  if (topic_removed)
                    $router.push({ name: 'CommunityCategoryPage' });
                }
              "
              class="fadeInUp"
              :style="{
                'animation-delay':
                  50 * ((i + follow_index) % itemsPerPage) + 'ms',
              }"
            ></community-widget>

            <!-- Auto load more -->

            <v-col
              cols="12"
              v-if="has_more"
              style="height: 50vh"
              v-intersect.quiet="
                (entries) => {
                  if (entries[0].isIntersecting) fetchPosts(page + 1);
                }
              "
            >
              <loading light css-mode v-if="busy_posts"></loading>
            </v-col>
          </template>

          <!-- Keep space bottom -->
          <v-col v-else-if="busy_posts" cols="12" style="height: 80vh"> </v-col>
        </template>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import CommunityWidget from "../widgets/CommunityWidget.vue";
import CommunityPostEditor from "../widgets/post/CommunityPostEditor.vue";
import CommunityFilter from "../widgets/filter/CommunityFilter.vue";
import CommunityBreadcrumb from "../widgets/header/CommunityBreadcrumb.vue";
import CommunityCrossTopics from "../widgets/topic/CommunityCrossTopics.vue";
import CommunityTopicSubscribe from "../widgets/topic/CommunityTopicSubscribe.vue";
import CommunityFollowSuggestion from "../widgets/users/CommunityFollowSuggestion.vue";
import CommunityTopicStatistic from "../widgets/topic/CommunityTopicStatistic.vue";
import _ from "lodash-es";

export default {
  name: "CommunityTopicPage",
  components: {
    CommunityTopicStatistic,
    CommunityFollowSuggestion,
    CommunityTopicSubscribe,

    CommunityCrossTopics,
    CommunityBreadcrumb,
    CommunityFilter,
    CommunityPostEditor,
    CommunityWidget,
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
      return this.USER() && Math.random() < 0.1; // Chance of show follow suggestion!
    },
    target_post(){
      const query_post_id = parseInt(this.$route.query.post);
      if(!query_post_id)return null;
      // 1. try to find it in main topic:
      if(this.topic && this.topic.question &&  this.topic.question.id===query_post_id)return this.topic.question
      // 2. Try to find it in posts:
      return  this.posts &&  this.posts.find(p=>p.id===query_post_id);
    }
  },
  watch: {
    "$route.query"(query) {
      // Set page by query if existed:
      this.page = parseInt(this.$route.query.page ? this.$route.query.page : 1);
      this.search = this.$route.query.search ? this.$route.query.search : "";

      this.fetchTopic();
    },

    show_deletes() {
      this.fetchPosts(1);
    },

    filter() {
      this.fetchPosts(1);
    },

    search: _.debounce(function (newVal, oldVal) {
      this.fetchPosts(1);
    }, 1500),
  },

  created() {
    this.follow_index = this.has_suggestion
      ? Math.round(Math.random() * 3) + 1
      : 0;

    // Try to pre load category data:
    this.category = this.categories.find(
      (c) => c.id === parseInt(this.$route.params.category_id)
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

      this.fetchPosts(1);
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
            this.$route.params.topic_id
          ),
          {
            params: {
              //-----------------------
              post_id: query_post_id,
              comment_id: query_comment_id,
              //-----------------------
            },
          }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          this.posts = [];
          this.has_more = false;

          this.topic = data.topic;

          // Signal to first post impression: (Not fire on first load)
          this.onCommunityPostImpression(this.topic, this.topic.question);

          this.fetchPosts(1);
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          this.$emit("busy", false);
        });
    },

    //――――――――――――――――――――――― Posts ―――――――――――――――――――――――

    fetchPosts(page) {
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
            this.$route.params.topic_id
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
          }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }
          this.posts.push(...data.posts);
          this.has_more = data.more;

          // Scroll to target:
          this.$nextTick(() => {
            if (query_comment_id) {
              this.ScrollToComment(query_comment_id);
            } else if (query_post_id) {
              this.ScrollToPost(query_post_id);
            }
          });
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_posts = false;
          this.$emit("busy", false);
        });
    },
    //――――――――――――――――――――――― Scroll ―――――――――――――――――――――――
    ScrollToPost(post_id) {
      this.$vuetify.goTo("#post-" + post_id, {
        duration: 1800,
        offset: 250,
        easing: "easeInOutQuad",
      });
    },
    ScrollToComment(comment_id) {
      this.$vuetify.goTo("#comment-" + comment_id, {
        duration: 1800,
        offset: 250,
        easing: "easeInOutQuad",
      });
    },
    //――――――――――――――――――――――― Remove topic ―――――――――――――――――――――――
    removeTopic() {
      this.openDangerAlert(
        this.$t("community.topic.delete_dialog.title"),
        this.$t("community.topic.delete_dialog.message"),
        this.$t("community.topic.delete_dialog.actions"),
        () => {
          this.busy_delete = true;
          axios
            .delete(
              window.CAPI.DELETE_COMMUNITY_TOPIC(
                this.community.id,
                this.topic.id
              )
            )
            .then(({ data }) => {
              if (!data.error) {
                this.$router.push({ name: "CommunityCategoryPage" });
              } else {
                this.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        }
      );
    },
  },
};
</script>

<style scoped lang="scss"></style>

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
  <v-container class="--add-extra-top-header">
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <community-breadcrumb
      :shop="shop"
      :community="community"
      :category="category"
      class="mb-6 breadcrumb-max-w"
      :show-report.sync="show_report"
      :show-edit.sync="show_edit"
      has-report
      has-edit
    ></community-breadcrumb>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Title ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <div v-if="!show_edit && !show_report" class="c-max-w">
        <h1 class="mx-2 fadeIn">{{ category.title }}</h1>
        <p class="mx-2 fadeIn delay_200">
          {{ category.desc.substring(0, more ? 256 : 80) }}
          <v-btn
            v-if="!more && category.desc.length > 80"
            @click="more = true"
            text
            small
            icon
            ><v-icon>more_horiz </v-icon></v-btn
          >
        </p>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Report ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-expand-transition>
      <div v-if="show_report">
        <community-category-statistic
          :community="community"
          :category-id="category.id"
          @busy="(v) => $emit('busy', v)"
        ></community-category-statistic>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Edit ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <div v-if="show_edit" class="c-max-w">
        <community-category-edit
          :class="{ 'pointer-event-none': !access.admin }"
          ref="editor"
          :community="community"
          :category.sync="category"
          @update:category="
            (cat) => {
              show_edit = false;
              AddOrUpdateItemByID(categories, cat);
            }
          "
        ></community-category-edit>

        <div v-if="access.admin" class="my-3 widget-buttons">
          <v-btn
            depressed
            color="primary"
            x-large
            @click="
              $refs.editor.save((val) => {
                busy_edit = val;
              })
            "
            :loading="busy_edit"
          >
            <v-icon class="me-1">save</v-icon>
            {{ $t("global.actions.save") }}</v-btn
          >
        </div>

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
                {{ $t("community.category.remove_msg") }}
              </v-subheader>

              <s-smart-check-verify-action v-model="check_delete" true-title="Verify delete category" :true-description="$t('community.category.delete_dialog.message')" color="red" false-gray class="my-3">

              </s-smart-check-verify-action>


              <div class="widget-buttons">
                <v-btn
                  depressed
                  :class="{disabled:!check_delete}"
                  color="red"
                  dark
                  x-large
                  @click="removeCategory()"
                  :loading="busy_delete"
                >
                  <v-icon class="me-1">delete</v-icon>
                  {{ $t("global.actions.delete") }}</v-btn
                >
              </div>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Add topic ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <template
      v-if="
        access.topic && (!category.restrict || access.admin || access.moderator)
      "
    >
      <div class="c-container -force-rounded p-3">
        <div
          class="c-widget d-flex black--text pp usn"
          @click="showAddTopic()"
          :class="{ '-hover': !show_new_post }"
        >
          <v-avatar :size="64" tile height="100%">
            <v-icon color="success" size="48">add</v-icon>
          </v-avatar>
          <div
            class="ms-2 px-2 flex-grow-1 py-2 overflow-hidden d-flex flex-column"
          >
            <b class="d-block text-uppercase"
              >{{ $t("community.topic.add_topic") }}
            </b>
            <p class="d-block m-0">
              {{ $t("community.topic.add_topic_desc") }}
            </p>
            <div class="d-flex subtitle-2 mt-2">
              <v-spacer></v-spacer>
              {{ $t("community.topic.can_create") }}:
              <b class="blue--text mx-1">
                <v-icon v-if="category.restrict" x-small color="red"
                  >lock</v-icon
                >
                {{
                  category.restrict
                    ? $t("community.stage_level.PRIVATE")
                    : $t(stage_level.name)
                }}</b
              >
            </div>
          </div>
        </div>
      </div>

      <v-expand-transition>
        <div v-show="show_new_post && !show_report" class="c-max-w">
          <community-post-editor
            :community="community"
            :category="category"
            topic-mode
            @add:topic="
              (topic) =>
                $router.push({
                  name: 'CommunityTopicPage',
                  params: {
                    category_id: category.id,
                    category_slug: slugify(category.title),

                    topic_id: topic.id,
                    topic_slug: slugify(topic.title),
                  },
                })
            "
          ></community-post-editor>
        </div>
      </v-expand-transition>
    </template>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Show login to create topic! ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <div
      v-else-if="!USER() && !category.restrict && category.stage !== 'PUBLIC'"
      class="d-flex flex-column mx-auto c-max-w p-3 mb-6"
    >
      <v-btn
        @click="NeedLogin()"
        class="m-auto"
        color="blue"
        dark
        x-large
        depressed
        rounded
        ><span class="me-2 display-1">👋</span>
        <div class="text-start">
          {{ $t("global.actions.login_now") }}
          <small class="d-block white--text">{{
            $t("community.commons.login_msg")
          }}</small>
        </div></v-btn
      >
    </div>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Cross topic ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <template v-if="access.cross">
      <div class="c-container -force-rounded p-3">
        <div
          class="c-widget d-flex black--text pp usn"
          :class="{ '-hover': !show_cross }"
          @click="showCrossTopic()"
        >
          <v-avatar :size="64" tile height="100%">
            <v-icon color="success" size="48">alt_route</v-icon>
          </v-avatar>
          <div
            class="ms-2 px-2 flex-grow-1 py-2 overflow-hidden d-flex flex-column"
          >
            <b class="d-block text-uppercase"
              >{{ $t("community.topic.add_cross") }}
            </b>
            <p class="d-block m-0">
              {{ $t("community.topic.add_cross_desc") }}
            </p>
            <div class="d-flex subtitle-2 mt-2">
              <v-spacer></v-spacer>
              {{ $t("community.topic.can_create") }}:
              <b class="blue--text mx-1"
                >{{ $t("community.topic.admins_moderators") }}
              </b>
            </div>
          </div>
        </div>
      </div>

      <v-expand-transition>
        <div v-if="show_cross">
          <div class="c-container -force-rounded p-3">
            <div class="c-widget p-3">
              <div
                v-if="cross_preview"
                class="d-flex"
                :class="{ 'flex-column': $vuetify.breakpoint.xs }"
              >
                <community-image
                  :src="getShopImagePath(cross_preview.image)"
                  :width="$vuetify.breakpoint.xs ? '100%' : 200"
                  :min-height="$vuetify.breakpoint.xs ? undefined : 200"
                  :height="$vuetify.breakpoint.xs ? '140px' : 'auto'"
                  class="rounded-18px"
                ></community-image>
                <div class="ps-3 pe-2 mt-4 text-justify overflow-hidden">
                  <h2>{{ cross_preview.title }}</h2>
                  <p class="single-line">{{ cross_preview.desc }}</p>

                  <p class="m-0 subtitle-2">
                    <v-avatar size="24" class="me-1"
                      ><img
                        :src="getShopImagePath(cross_preview.community.image)"
                    /></v-avatar>
                    {{ cross_preview.community.title }}
                  </p>
                </div>
              </div>

              <v-text-field
                v-model="cross_topic_id"
                label="Cross topic code"
                placeholder="XXX/XXX"
                class="mt-4"
                @blur="fetchCrossPreview"
                @keydown.enter="fetchCrossPreview"
                :loading="busy_pre"
              ></v-text-field>
              <v-btn
                :loading="busy_cross"
                @click="crossTopic"
                color="blue"
                dark
                depressed
                class="m-2"
                :class="{ disabled: !cross_preview }"
                >Add topic</v-btn
              >
            </div>
          </div>
        </div>
      </v-expand-transition>
    </template>

    <v-container class="c-max-w">
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Topics ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-row justify="center" align="start">
        <!-- Topic -->

        <community-topic-card
          v-for="(topic, i) in topics"
          :key="topic.id"
          :community="community"
          :topic="topic"
          class="fadeInUp"
          :style="{ 'animation-delay': 50 * (i % itemsPerPage) + 'ms' }"
          :show-report="show_report"
        ></community-topic-card>

        <!-- Auto load more -->

        <v-col
          cols="12"
          v-if="has_more"
          style="height: 50vh"
          v-intersect.quiet="
            (entries) => {
              if (entries[0].isIntersecting) fetchTopics(page + 1);
            }
          "
        >
          <loading light css-mode v-if="busy"></loading>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import CommunityBreadcrumb from "../widgets/header/CommunityBreadcrumb.vue";
import CommunityTopicCard from "../widgets/topic/CommunityTopicCard.vue";
import CommunityPostEditor from "../widgets/post/CommunityPostEditor.vue";
import CommunityCategoryEdit from "../widgets/category/CommunityCategoryEdit.vue";
import CommunityCategoryStatistic from "../widgets/category/CommunityCategoryStatistic.vue";
import { CommunityStageLevel } from "@core/enums/community/CommunityStageLevel";
import CommunityImage from "../widgets/image/CommunityImage.vue";
import SSmartCheckVerifyAction from "@components/smart/SSmartCheckVerifyAction.vue";

export default {
  name: "CommunityCategoryPage",
  components: {
    SSmartCheckVerifyAction,
    CommunityImage,
    CommunityCategoryStatistic,
    CommunityCategoryEdit,
    CommunityPostEditor,
    CommunityTopicCard,
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
      more: false, // Show all description

      //----------------------------------
      category: null,

      //----------------------------------
      topics: [],
      has_more: false,
      itemsPerPage: 10,

      //----------------------------------

      busy: false,

      page: 1,

      search: "",
      filter: "posts",
      //---------------------------------
      show_new_post: false,

      show_edit: false,
      show_report: false,

      busy_edit: false,
      busy_delete: false,
      show_critic: false,
      check_delete:false,

      //---------------------------------
      show_cross: false,
      cross_topic_id: null,
      busy_pre: false,
      cross_preview: null,
      busy_cross: false,
    };
  },

  computed: {
    stage_level() {
      return this.community.stage && CommunityStageLevel[this.community.stage];
    },
    access() {
      return this.community.access;
    },
  },
  watch: {
    "$route.query"(query) {
      // Set page by query if exist:
      this.page = parseInt(this.$route.query.page ? this.$route.query.page : 1);
      this.search = this.$route.query.search ? this.$route.query.search : "";

      this.topics = [];
      this.fetchTopics(1);
    },
  },

  created() {
    // Try to pre load category data:
    this.category = this.categories.find(
      (c) => c.id === parseInt(this.$route.params.category_id)
    );

    this.search = this.$route.query.search ? this.$route.query.search : "";

    this.fetchTopics(1);
  },
  mounted() {},

  methods: {
    //――――――――――――――――――――――― Topics ―――――――――――――――――――――――

    fetchTopics(page) {
      if (this.busy) return; // Prevent multiple fetching!

      this.busy = true;
      this.$emit("busy", true);

      this.page = page;

      axios
        .get(
          window.CAPI.GET_COMMUNITY_CATEGORY_TOPICS(
            this.community.id,
            this.$route.params.category_id
          ),
          {
            params: {
              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,

              sortDesc: true,
              sortBy: "updated_at",

              search: this.search,
            },
          }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          this.topics.push(...data.topics);
          this.has_more = data.more;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
          this.$emit("busy", false);
        });
    },

    //――――――――――――――――――――――― New topic ―――――――――――――――――――――――

    showAddTopic() {
      this.show_new_post = !this.show_new_post;
      this.show_cross = false;
    },

    //――――――――――――――――――――――― Cross topic ―――――――――――――――――――――――

    showCrossTopic() {
      this.show_cross = !this.show_cross;
      this.show_new_post = false;
    },

    fetchCrossPreview() {
      if (!this.cross_topic_id) {
        this.cross_preview = null;
        return;
      }

      const arr = this.cross_topic_id.split("/");
     // console.log("arr", arr);
      if (arr.length !== 2) {
        this.cross_preview = null;
        return;
      }

      let community_id = parseInt(arr[0]);
      let topic_id = parseInt(arr[1]);
      if (!community_id || !topic_id) {
        this.cross_preview = null;
        return;
      }

      // Check no change:
      if (
        this.cross_preview &&
        this.cross_preview.community_id === community_id &&
        this.cross_preview.id === topic_id
      ) {
        return;
      }

      this.cross_preview = null;

      this.busy_pre = true;

      axios
        .get(window.CAPI.GET_COMMUNITY_TOPIC_PREVIEW(community_id, topic_id))
        .then(({ data }) => {
          if (!data.error) {
            this.cross_preview = data.topic;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_pre = false;
        });
    },

    crossTopic() {
      if (!this.cross_preview) return;

      this.busy_cross = true;

      axios
        .post(window.CAPI.POST_COMMUNITY_TOPIC_CROSS(this.community.id), {
          category_id: this.category.id,
          cross_community_id: this.cross_preview.community_id,
          cross_topic_id: this.cross_preview.id,
        })
        .then(({ data }) => {
          if (!data.error) {
            const topic = data.topic;

            this.$router.push({
              name: "CommunityTopicPage",
              params: {
                category_id: this.category.id,
                category_slug: this.slugify(this.category.title),

                topic_id: topic.id,
                topic_slug: this.slugify(topic.title),
              },
            });
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_cross = false;
        });
    },

    //――――――――――――――――――――――― Remove category ―――――――――――――――――――――――
    removeCategory() {
      this.openDangerAlert(
        this.$t("community.category.delete_dialog.title"),
        this.$t("community.category.delete_dialog.message"),
        this.$t("community.category.delete_dialog.actions"),
        () => {
          this.busy_delete = true;
          axios
            .delete(
              window.CAPI.DELETE_COMMUNITY_EDIT_CATEGORY(
                this.community.id,
                this.category.id
              )
            )
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  "Remove category",
                  this.category.title + " has been removed successfully!"
                );
                this.DeleteItemByID(this.categories, this.category.id);
                this.$router.push({ name: "CommunityHomePage" });
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

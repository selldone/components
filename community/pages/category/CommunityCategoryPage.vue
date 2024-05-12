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
  <v-container class="--add-extra-top-header">
    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Breadcrumb ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <c-breadcrumb
      v-model:show-edit="show_edit"
      v-model:show-report="show_report"
      :category="category"
      :community="community"
      :shop="shop"
      class="mb-6 breadcrumb-max-w"
      has-edit
      has-report
    ></c-breadcrumb>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Title ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <div v-if="!show_edit && !show_report" class="c-max-w">
        <h1 class="mx-2 fadeIn">{{ category.title }}</h1>
        <p class="mx-2 fadeIn delay_200 mb-3">
          {{ category.desc.substring(0, more ? 256 : 80) }}
          <v-btn
            v-if="!more && category.desc.length > 80"
            icon
            size="small"
            variant="text"
            @click="more = true"
          >
            <v-icon>more_horiz</v-icon>
          </v-btn>
        </p>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Report ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <v-expand-transition>
      <div v-if="show_report">
        <c-category-analytics
          :category-id="category.id"
          :community="community"
          @busy="(v) => $emit('busy', v)"
        ></c-category-analytics>
      </div>
    </v-expand-transition>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Edit ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <v-expand-transition>
      <div v-if="show_edit" class="c-max-w">
        <c-category-edit
          ref="editor"
          v-model:category="category"
          :class="{ 'pointer-event-none': !access.admin }"
          :community="community"
          @update:category="
            (cat) => {
              show_edit = false;
              AddOrUpdateItemByID(categories, cat);
            }
          "
        ></c-category-edit>

        <div v-if="access.admin" class="my-3 widget-buttons">
          <v-btn
            :loading="busy_edit"
            color="primary"
            size="x-large"
            variant="flat"
            @click="
              $refs.editor.save((val) => {
                busy_edit = val;
              })
            "
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>

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
                {{ $t("community.category.remove_msg") }}
              </v-list-subheader>

              <u-smart-verify
                v-model="check_delete"
                :true-description="
                  $t('community.category.delete_dialog.message')
                "
                class="my-3"
                color="red"
                false-gray
                true-title="Verify delete category"
              >
              </u-smart-verify>

              <div class="widget-buttons">
                <v-btn
                  :class="{ disabled: !check_delete }"
                  :loading="busy_delete"
                  color="red"
                  dark
                  size="x-large"
                  variant="flat"
                  @click="removeCategory()"
                >
                  <v-icon class="me-1">delete</v-icon>
                  {{ $t("global.actions.delete") }}
                </v-btn>
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
          :class="{ '-hover': !show_new_post }"
          class="c-widget d-flex text-black pp usn"
          @click="showAddTopic()"
        >
          <v-avatar :size="64" height="100%" tile>
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
            <div class="d-flex text-subtitle-2 mt-2">
              <v-spacer></v-spacer>
              {{ $t("community.topic.can_create") }}:
              <b class="text-blue mx-1">
                <v-icon v-if="category.restrict" color="red" size="x-small"
                  >lock
                </v-icon>
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
          <c-post-editor
            :category="category"
            :community="community"
            topic-mode
            @add:topic="
              (topic) =>
                $router.push({
                  name: window.$community.routes.COMMUNITY_TOPIC_PAGE,
                  params: {
                    category_id: category.id,
                    category_slug: slugify(category.title),

                    topic_id: topic.id,
                    topic_slug: slugify(topic.title),
                  },
                })
            "
          ></c-post-editor>
        </div>
      </v-expand-transition>
    </template>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Show login to create topic! ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
    <div
      v-else-if="!USER() && !category.restrict && category.stage !== 'PUBLIC'"
      class="d-flex flex-column mx-auto c-max-w p-3 mb-6"
    >
      <v-btn
        class="ma-auto"
        color="blue"
        dark
        rounded
        size="x-large"
        variant="flat"
        @click="NeedLogin()"
        ><span class="me-2 text-h4">👋</span>
        <div class="text-start">
          {{ $t("global.actions.login_now") }}
          <small class="d-block text-white">{{
            $t("community.commons.login_msg")
          }}</small>
        </div>
      </v-btn>
    </div>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Cross topic ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <template v-if="access.cross">
      <div class="c-container -force-rounded p-3">
        <div
          :class="{ '-hover': !show_cross }"
          class="c-widget d-flex text-black pp usn"
          @click="showCrossTopic()"
        >
          <v-avatar :size="64" height="100%" tile>
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
            <div class="d-flex text-subtitle-2 mt-2">
              <v-spacer></v-spacer>
              {{ $t("community.topic.can_create") }}:
              <b class="text-blue mx-1"
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
              <p class="mb-3">
                You can incorporate topics from other communities into this one
                and initiate a new fork of a thread. The original community must
                permit the crossing of topics.
              </p>
              <div
                v-if="cross_preview"
                :class="{ 'flex-column': $vuetify.display.xs }"
                class="d-flex"
              >
                <c-image-view
                  :height="$vuetify.display.xs ? '140px' : 'auto'"
                  :min-height="$vuetify.display.xs ? undefined : 200"
                  :src="getShopImagePath(cross_preview.image)"
                  :width="$vuetify.display.xs ? '100%' : 200"
                  class="rounded-18px"
                ></c-image-view>
                <div class="ps-3 pe-2 mt-4 text-justify overflow-hidden">
                  <h2>{{ cross_preview.title }}</h2>
                  <p class="single-line">{{ cross_preview.desc }}</p>

                  <p class="m-0 text-subtitle-2">
                    <v-avatar class="me-1" size="24"
                      ><img
                        :src="getShopImagePath(cross_preview.community.image)"
                    /></v-avatar>
                    {{ cross_preview.community.title }}
                  </p>
                </div>
              </div>

              <v-text-field
                v-model="cross_topic_id"
                :loading="busy_pre"
                class="mt-4"
                label="Cross topic code"
                placeholder="XXX/XXX"
                variant="solo"
                @blur="fetchCrossPreview"
                @keydown.enter="fetchCrossPreview"
                clearable
              ></v-text-field>

              <s-widget-buttons>
                <v-btn
                  :class="{ disabled: !cross_preview }"
                  :loading="busy_cross"
                  size="x-large"
                  color="primary"
                  variant="elevated"
                  @click="crossTopic"
                  prepend-icon="add_box"
                >
                  <div>
                    <div>Add topic</div>
                    <div v-if="cross_preview?.title" class="small mt-1">
                      {{ cross_preview.title }}
                    </div>
                  </div>
                </v-btn>
              </s-widget-buttons>
            </div>
          </div>
        </div>
      </v-expand-transition>
    </template>

    <v-container class="c-max-w">
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Topics ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <v-row align="start" justify="center">
        <!-- Topic -->

        <community-topic-card
          v-for="(topic, i) in topics"
          :key="topic.id"
          :community="community"
          :show-report="show_report"
          :style="{ 'animation-delay': 50 * (i % itemsPerPage) + 'ms' }"
          :topic="topic"
          class="fadeInUp"
        ></community-topic-card>

        <!-- Auto load more -->

        <v-col
          v-if="has_more"
          v-intersect.quiet="
            (isIntersecting, entries, observer) => {
              if (isIntersecting) fetchTopics(page + 1);
            }
          "
          cols="12"
          style="height: 50vh"
        >
          <u-loading-ellipsis v-if="busy" css-mode light></u-loading-ellipsis>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import CBreadcrumb from "../../../community/breadcrumb/CBreadcrumb.vue";
import CommunityTopicCard from "../../../community/topic/CommunityTopicCard.vue";
import CPostEditor from "../../../community/post/editor/CPostEditor.vue";
import CCategoryEdit from "../../../community/category/edit/CCategoryEdit.vue";
import CCategoryAnalytics from "../../../community/category/analytics/CCategoryAnalytics.vue";
import { CommunityStageLevel } from "@selldone/core-js/enums/community/CommunityStageLevel";
import CImageView from "../../../community/image/view/CImageView.vue";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import SWidgetButtons from "../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "CommunityCategoryPage",
  components: {
    SWidgetButtons,
    USmartVerify,
    CImageView,
    CCategoryAnalytics,
    CCategoryEdit,
    CPostEditor,
    CommunityTopicCard,
    CBreadcrumb,
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
      check_delete: false,

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
      (c) => c.id === parseInt(this.$route.params.category_id),
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
            this.$route.params.category_id,
          ),
          {
            params: {
              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,

              sortDesc: true,
              sortBy: "updated_at",

              search: this.search,
            },
          },
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
              name: window.$community.routes.COMMUNITY_TOPIC_PAGE,
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
                this.category.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                this.showSuccessAlert(
                  "Remove category",
                  this.category.title + " has been removed successfully!",
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
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>

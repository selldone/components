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
  <div>
    <v-menu
      v-if="comment"
      v-model="value"
      :activator="activator"
      location="left bottom"
      max-width="320"
    >
      <v-card class="text-start" rounded="xl">
        <v-list slim >
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            @click="item.click"
          >
            <template v-slot:prepend>
              <v-avatar tile>
                <v-icon :color="item.color">{{ item.icon }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.subtitle }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- ------------------ Edit post dialog ------------------------ -->
    <v-bottom-sheet
      v-if="edit_dialog"
      v-model="edit_dialog"
      content-class="rounded-t-xl"
      max-width="1200"
      width="98vw"
      scrollable

    >
      <v-card rounded="t-xl" class="text-start">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">comment</v-icon>
          {{ $t("community.comment_actions.edit") }}

          <v-spacer></v-spacer>
          <v-btn icon size="large" @click="edit_dialog = false" variant="text">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-textarea v-model="comment_body" auto-grow variant="outlined"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :loading="busy_edit"
              color="primary"
              size="x-large"
              @click="editComment"
              variant="elevated"
            >
              <v-icon start>save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ------------------ Report post dialog ------------------------ -->

    <a-feedback-content-violation-report
      v-model="report_dialog"
      :loading="busy_report"
      @report="reportComment"
    ></a-feedback-content-violation-report>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import AFeedbackContentViolationReport from "../../article/feedback/conent-violation-report/AFeedbackContentViolationReport.vue";
import { CommunityURLs } from "@selldone/sdk-community/url/CommunityURLs";
import { delay } from "lodash-es";
import { ArticleReport } from "@selldone/core-js";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";


export default {
  name: "CommunityCommentActionsMenu",
  mixins: [],
  components: { AFeedbackContentViolationReport },
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

      post: null,
      comment: null,

      value: false,

      //-------------------
      comment_body: null,
      edit_dialog: false,
      busy_edit: false,

      //-------------------

      report_dialog: false,
      busy_report: false,
    };
  },

  computed: {
    access() {
      return this.community.access;
    },

    items() {
      const out = [
        {
          title: this.$t("community.comment_actions.link"),
          icon: "link",
          subtitle: this.$t("community.comment_actions.link_msg"),
          click: this.copyLink,
        },
      ];

      // Not author:

      if (this.USER_ID() !== this.comment.user_id) {
        out.unshift({
          title:
            this.comment.action && this.comment.action.report
              ? this.$t("community.commons.reported")
              : this.$t("community.commons.report"),
          icon: "report",
          subtitle:
            this.comment.action && this.comment.action.report
              ? this.$t(
                  ArticleReport.Categories[this.comment.action.report].title,
                )
              : "Is this comment inappropriate?",
          click: this.showReportComment,
          color:
            this.comment.action && this.comment.action.report
              ? "red"
              : undefined,
        });
      }

      // Author:
      if (this.USER_ID() === this.comment.user_id) {
        out.unshift({
          title: this.$t("community.comment_actions.edit"),
          icon: "edit",
          subtitle: this.$t("community.comment_actions.edit_msg"),
          click: this.showEditComment,
        });
      }
      // Author, admin and moderators:
      if (
        this.access.admin ||
        this.access.moderator ||
        this.USER_ID() === this.comment.user_id
      ) {
        out.push({
          title: this.$t("community.comment_actions.delete"),
          icon: "delete_outline",
          subtitle: this.$t("community.comment_actions.delete_msg"),
          click: this.deleteComment,
        });
      }

      return out;
    },
  },

  methods: {
    //――――――――――――――――――――――――― Edit ―――――――――――――――――――――――――
    showEditComment() {
      this.comment_body = this.comment.body;
      this.edit_dialog = true;
    },
    editComment() {
      this.busy_edit = true;

      axios
        .put(
          window.CAPI.PUT_COMMUNITY_TOPIC_POST_COMMENT_EDIT(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
            this.comment.id,
          ),
          {
            body: this.comment_body,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.comment.body = data.body;
            this.edit_dialog = false;
            NotificationService.showSuccessAlert();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit = false;
        });
    },

    //――――――――――――――――――――――――― Delete ―――――――――――――――――――――――――
    deleteComment() {
      NotificationService.openDangerAlert(
        this.$t("community.comment_actions.delete_dialog.title"),
        this.$t("community.comment_actions.delete_dialog.message"),
        this.$t("community.comment_actions.delete_dialog.action"),
        () => {
          this.busy = true;

          axios
            .delete(
              window.CAPI.DELETE_COMMUNITY_TOPIC_POST_COMMENT(
                this.post.community_id,
                this.post.topic_id,
                this.post.id,
                this.comment.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                if (this.delete_callback) {
                  this.delete_callback(this.comment);
                }
                Object.assign(this.post, data.post); // update total_comments
              } else {
                NotificationService.showErrorAlert(null, data.error_msg);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy = false;
            });
        },
      );
    },

    //――――――――――――――――――――――――― Report ―――――――――――――――――――――――――
    showReportComment() {
      this.report_dialog = true;
    },
    reportComment(report) {
      this.busy_report = true;

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POST_COMMENT_REPORT(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
            this.comment.id,
          ),
          {
            report: report,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.comment.action = data.action;
            this.report_dialog = false;
            NotificationService.showSuccessAlert();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_report = false;
        });
    },

    //――――――――――――――――――――――――― Link ―――――――――――――――――――――――――
    copyLink() {
      this.copyToClipboard(CommunityURLs.CommentUrl(this.shop, this.comment));
    },
  },

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    EventBus.$on(
      "community:comment-actions-menu",
      ({ activator, shop, post, comment, delete_callback }) => {
        this.activator = activator;
        this.shop = shop;
        this.post = post;
        this.comment = comment;

        this.delete_callback = delete_callback;

        if (this.value) {
          this.value = false;
          delay(() => {
            this.value = true;
          }, 350);
        } else {
          this.$nextTick(() => {
            this.value = true;
          });
        }
      },
    );
  },
  beforeUnmount() {
    EventBus.$off("community:comment-actions-menu");
  },
};
</script>

<style lang="scss"></style>

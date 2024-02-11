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
      <div>
        <v-list class="text-start" rounded="xl">
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
      </div>
    </v-menu>

    <!-- ------------------ Edit post dialog ------------------------ -->
    <v-dialog
      v-if="edit_dialog"
      v-model="edit_dialog"
      content-class="no-shadow-dialog"
      max-width="680"
      scrollable
    >
      <v-card>
        <v-card-title>
          {{ $t("community.comment_actions.edit") }}

          <v-spacer></v-spacer>
          <v-btn icon size="large" @click="edit_dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-textarea v-model="comment_body" auto-grow></v-textarea>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :loading="busy_edit"
              color="primary"
              size="x-large"
              @click="editComment"
            >
              <v-icon class="me-1">save</v-icon>
              {{ $t("global.actions.save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ------------------ Report post dialog ------------------------ -->

    <s-content-violation-report-dialog
      v-model="report_dialog"
      :loading="busy_report"
      @report="reportComment"
    ></s-content-violation-report-dialog>
  </div>
</template>

<script>
import { ArticleReport } from "@core/enums/article/ArticleReport";
import SContentViolationReportDialog from "../../../ui/dialog/conent-violation-report/SContentViolationReportDialog.vue";
import { CommunityURLs } from "@sdk-community/url/CommunityURLs";
import _ from "lodash-es";

export default {
  name: "CommunityCommentActionsMenu",
  components: { SContentViolationReportDialog },
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
              ? this.$t(ArticleReport[this.comment.action.report].title)
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
            this.showSuccessAlert();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit = false;
        });
    },

    //――――――――――――――――――――――――― Delete ―――――――――――――――――――――――――
    deleteComment() {
      this.openDangerAlert(
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
            this.showSuccessAlert();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
    this.EventBus.$on(
      "community:comment-actions-menu",
      ({ activator, shop, post, comment, delete_callback }) => {
        this.activator = activator;
        this.shop = shop;
        this.post = post;
        this.comment = comment;

        this.delete_callback = delete_callback;

        if (this.value) {
          this.value = false;
          _.delay(() => {
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
    this.EventBus.$off("community:comment-actions-menu");
  },
};
</script>

<style lang="scss"></style>

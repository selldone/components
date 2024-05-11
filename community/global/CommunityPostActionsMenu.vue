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
      v-model="value"
      :activator="activator"
      location="left bottom"
      max-width="360"
    >
      <v-sheet class="p-3" color="#fff" rounded="xl">
        <v-list class="text-start">
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
      </v-sheet>
    </v-menu>

    <!-- ------------------ Embed post dialog ------------------------ -->
    <v-dialog
      v-if="embed_dialog"
      v-model="embed_dialog"
      max-width="560"
      scrollable
    >
      <v-card class="d-flex flex-column text-start">
        <v-card-title
          >{{ $t("community.post_actions.embed") }}
          <v-spacer></v-spacer>
          <v-btn icon size="large" @click="embed_dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <small>{{ $t("community.embed.copy_code_msg") }} </small>
          <div
            class="border my-3 hover-editable px-2 py-4 rounded"
            v-text="embed_code"
          ></div>

          <v-btn
            color="blue"
            variant="text"
            @click="copyToClipboard(embed_code)"
          >
            <v-icon class="me-1" size="small">content_copy</v-icon>
            {{ $t("community.embed.copy_code") }}
          </v-btn>
          <hr class="mb-4" />
          <small>{{ $t("global.commons.preview") }}</small>
          <div class="my-3" v-html="embed_code"></div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ------------------ Edit post dialog ------------------------ -->
    <v-dialog
      v-if="edit_dialog"
      v-model="edit_dialog"
      content-class="no-shadow-dialog"
      max-width="680"
      scrollable
    >
      <v-btn
        class="absolute-top-end"
        icon
        size="large"
        @click="edit_dialog = false"
      >
        <v-icon>close</v-icon>
      </v-btn>

      <c-post-editor
        :community="community"
        :post="post"
        :shop="shop"
        class="my-0"
        scrollable
        @update:post="
          (val) => {
            if (val.id === post.id) Object.assign(post, val);
            edit_dialog = false;
          }
        "
      >
      </c-post-editor>
    </v-dialog>

    <!-- ------------------ Report post dialog ------------------------ -->

    <a-feedback-content-violation-report
      v-model="report_dialog"
      :loading="busy_report"
      @report="reportPost"
    ></a-feedback-content-violation-report>
  </div>
</template>
<script>
import CPostEditor from "@components/community/post/editor/CPostEditor.vue";
import AFeedbackContentViolationReport from "@components/article/feedback/conent-violation-report/AFeedbackContentViolationReport.vue";
import { ArticleReport } from "@selldone/core-js/enums/article/ArticleReport";
import { CommunityURLs } from "@sdk-community/url/CommunityURLs";
import _ from "lodash-es";

export default {
  name: "CommunityPostActionsMenu",
  components: { AFeedbackContentViolationReport, CPostEditor },
  props: {
    shop: {},

    community: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      topic: null,
      post: null,
      delete_callback: null,

      activator: null,
      value: false,

      busy: false,
      // ---------------------------------
      embed_dialog: false,

      edit_dialog: false,

      report_dialog: false,
      busy_report: false,
    };
  },

  computed: {
    access() {
      return this.community.access;
    },

    items() {
      if (!this.USER() || !this.post) {
        return [
          {
            title: this.$t("global.actions.login_now"),
            icon: "edit",
            subtitle: this.$t("community.commons.login_msg"),
            click: this.NeedLogin,
          },
        ];
      }

      const out = [
        {
          title: this.$t("community.post_actions.save"),
          icon:
            this.post.action && this.post.action.save
              ? "bookmark"
              : "bookmark_border",
          subtitle: this.$t("community.post_actions.save_msg"),
          click: this.savePost,
          color:
            this.post.action && this.post.action.save ? "success" : undefined,
        },

        {
          title: this.$t("community.post_actions.copy_link"),
          icon: "link",
          subtitle: this.$t("community.post_actions.copy_link_msg"),
          click: this.copyLink,
        },

        {
          title: this.$t("community.post_actions.embed"),
          icon: "filter_frames",
          subtitle: this.$t("community.post_actions.embed_msg"),
          click: this.embedPost,
        },
      ];

      // Not author:

      if (this.USER_ID() !== this.post.user_id) {
        out.push({
          title:
            this.post.action && this.post.action.report
              ? this.$t("community.commons.reported")
              : this.$t("community.commons.report"),
          icon: "report",
          subtitle:
            this.post.action && this.post.action.report
              ? this.$t(ArticleReport[this.post.action.report].title)
              : this.$t("community.post_actions.report_msg"),
          click: this.showReportPost,
          color:
            this.post.action && this.post.action.report ? "red" : undefined,
        });
      }

      // Author:

      if (this.USER_ID() === this.post.user_id) {
        out.unshift({
          title: this.$t("community.post_actions.edit"),
          icon: "edit",
          subtitle: this.$t("community.post_actions.edit_msg"),
          click: this.editPost,
        });
      }

      // Author and admin:
      if (
        this.access.admin ||
        this.access.moderator ||
        this.USER_ID() === this.post.user_id
      ) {
        out.push({
          title: this.$t("community.post_actions.delete"),
          icon: "delete_outline",
          subtitle: this.$t("community.post_actions.delete_msg"),
          click: this.deletePost,
        });

        if (this.topic.post_id !== this.post.id)
          // Main topic post can not mark as accepted answer
          out.push({
            title: this.post.approved
              ? this.$t("community.post_actions.approved")
              : this.$t("community.post_actions.approve_action"),
            icon: this.post.approved ? "check_circle" : "check_circle_outline",
            color: this.post.approved ? "success" : undefined,
            subtitle: this.$t("community.post_actions.approved_msg"),
            click: this.approvePost,
          });
      }

      return out;
    },

    embed_code() {
      const link = CommunityURLs.PostEmbedUrl(this.shop, this.post);
      return `<iframe src="${link}" allowfullscreen="" title="Embedded post" width="500" height="470" frameborder="0" style="max-width: 100%;border: solid thin #ddd;border-radius: 12px;"></iframe>`;
    },
  },

  methods: {
    //――――――――――――――――――――――――― Delete ―――――――――――――――――――――――――

    deletePost() {
      this.openDangerAlert(
        this.$t("community.post_actions.delete_dialog.title"),
        this.$t("community.post_actions.delete_dialog.message"),
        this.$t("community.post_actions.delete_dialog.action"),
        () => {
          this.busy = true;

          axios
            .delete(
              window.CAPI.DELETE_COMMUNITY_TOPIC_POST(
                this.post.community_id,
                this.post.topic_id,
                this.post.id,
              ),
            )
            .then(({ data }) => {
              if (!data.error) {
                if (this.delete_callback) {
                  this.delete_callback(this.post, data.topic_removed);
                }
                // Errors in removing files on disk:
                if (data.errors) {
                  this.showWarningAlert(
                    null,
                    "There is some issue with removing files: <ul>" +
                      data.errors.map((e) => "<li>" + e + "</li>").join(" ") +
                      "</ul>",
                  );
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
      );
    },

    //――――――――――――――――――――――――― Save ―――――――――――――――――――――――――

    savePost() {
      this.busy = true;

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POST_SAVE(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
          ),
          {
            save: !(this.post.action && this.post.action.save),
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.post.action = data.action;
            this.showSuccessAlert();
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
    //――――――――――――――――――――――――― Approve ―――――――――――――――――――――――――

    approvePost() {
      this.busy = true;

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POST_APPROVED(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
          ),
          {
            approved: !this.post.approved,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.post.approved = data.approved;
            this.showSuccessAlert();
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

    //――――――――――――――――――――――――― Embed ―――――――――――――――――――――――――

    embedPost() {
      this.embed_dialog = true;
      this.onCommunityPostEmbed(this.topic, this.post); // + Set on community analytic
    },

    //――――――――――――――――――――――――― Report ―――――――――――――――――――――――――
    showReportPost() {
      this.report_dialog = true;
    },
    reportPost(report) {
      this.busy_report = true;

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POST_REPORT(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
          ),
          {
            report: report,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.post.action = data.action;
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
    //――――――――――――――――――――――――― Edit ―――――――――――――――――――――――――
    editPost() {
      this.edit_dialog = true;
    },
    //――――――――――――――――――――――――― Link ―――――――――――――――――――――――――
    copyLink() {
      this.copyToClipboard(CommunityURLs.PostUrl(this.shop, this.post));

      this.onCommunityPostShare(this.topic, this.post); // + Set on community analytic
    },
  },

  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    this.EventBus.$on(
      "community:post-actions-menu",
      ({ activator, topic, post, delete_callback }) => {
        if (this.busy) return;

        this.activator = activator;
        this.topic = topic;
        this.post = post;
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
    this.EventBus.$off("community:post-actions-menu");
  },
};
</script>

<style lang="scss"></style>

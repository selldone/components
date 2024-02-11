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
  <div style="line-height: normal">
    <div class="mx-auto">
      <div v-if="user" class="comment-form">
        <v-expand-transition>
          <div
            v-if="!expand"
            :class="{ disabled: !can_send_comment }"
            class="comment-placeholder"
          >
            <div class="pa-5" @click="expand = true">
              <v-icon class="me-1">add_comment</v-icon>
              {{ $t("global.comments.new_action") }}

              <div v-if="!can_send_comment" class="py-2 small">
                <v-icon class="me-1" size="small">warning_amber</v-icon>
                Each user can send only one comment for an article or product.
                Please edit your previous comment.
              </div>
            </div>
          </div>
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="expand">
            <div class="pa-5">
              <form id="comment-form ">
                <v-textarea
                  v-model="data.body"
                  :placeholder="$t('global.comments.body_placeholder')"
                  auto-grow
                  dir="auto"
                  hide-details
                  name="comment"
                  rows="3"
                  single-line
                  variant="plain"
                />

                <div class="widget-buttons">
                  <v-btn
                    rounded
                    size="x-large"
                    variant="flat"
                    @click="closeNewComment"
                  >
                    <v-icon class="me-1">close</v-icon>
                    {{ $t("global.actions.cancel") }}
                  </v-btn>
                  <v-btn
                    :loading="busy_send"
                    color="primary"
                    rounded
                    size="x-large"
                    variant="flat"
                    @click="saveComment"
                  >
                    {{ $t("global.comments.send_action") }}
                    <v-icon class="ms-2">send</v-icon>
                  </v-btn>
                </div>
                <div>
                  <p v-if="error" class="text-danger mt-2">
                    <i class="fas fa-warning" />
                    {{ error_message }}
                  </p>

                  <label class="inline-error fa:fas fa-warning">
                    {{ $t("global.comments.body_is_empty_error") }}
                  </label>
                </div>
              </form>
            </div>
          </div>
        </v-expand-transition>
      </div>

      <div v-else class="mb-16">
        <div class="ps-5">
          <!-- Shop Login -->
          <s-shop-login v-if="isShop" class="mt-16"></s-shop-login>
          <!-- Selldone Login -->
          <b-login-form
            v-if="isSelldone"
            flat
            inlineMode
            no-header
            no-redirect
          ></b-login-form>
        </div>
      </div>

      <div
        v-if="!busy && comments_count === 0"
        class="text-subtitle-2 text-muted text-uppercase text-center"
      >
        {{ $t("global.comments.no_comments") }}
      </div>

      <!-- ――――――――――――――――――――――― My comments ――――――――――――――――――――――― -->
      <div v-if="my_comments && my_comments.length" class="mt-3">
        <h2 class="my-5 text-start">{{ $t("global.comments.my_comments") }}</h2>
        <transition-group name="fadeUp">
          <s-article-comment
            v-for="(comment, index) in my_comments"
            :key="comment.id"
            :article-user-id="articleUserId"
            :class="[index === comments.length - 1 ? '' : 'mb-6']"
            :comment="comment"
            :loading="busy_update === comment.id"
            :rates="getRates(comment.user_id)"
            :style="{ 'animation-delay': (index % 10) * 100 + 'ms' }"
            @comment-updated="updateComment($event)"
            @comment-deleted="openDeleteAlert($event)"
          />
        </transition-group>
      </div>

      <!-- ――――――――――――――――――――――― Other comments ――――――――――――――――――――――― -->

      <div class="mt-3">
        <transition-group name="fadeUp">
          <s-article-comment
            v-for="(comment, index) in other_comments"
            :key="comment.id"
            :article-user-id="articleUserId"
            :class="[index === comments.length - 1 ? '' : 'mb-6']"
            :comment="comment"
            :is-admin="isAdmin"
            :loading="busy_update === comment.id"
            :rates="getRates(comment.user_id)"
            :style="{ 'animation-delay': (index % 10) * 100 + 'ms' }"
            @comment-updated="updateComment($event)"
            @comment-deleted="openDeleteAlert($event)"
            @comment-reply="replyComment"
          />
        </transition-group>

        <s-loading v-if="busy" css-mode light></s-loading>
        <v-btn
          v-if="more && !busy"
          v-intersect.quiet="
            () => {
              if (remain_auto_fetch > 0) {
                remain_auto_fetch--;
                fetchComments(false);
              }
            }
          "
          rounded
          variant="flat"
          @click="fetchComments(false)"
        >
          {{ $t("global.comments.load_more_action") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import SArticleComment from "./SArticleComment.vue";
import SShopLogin from "@components/login/SShopLogin.vue";
import BLoginForm from "@components/backoffice/auth/form/BLoginForm.vue";

export default {
  name: "SArticleComments",

  components: {
    BLoginForm,
    SShopLogin,
    SArticleComment,
  },
  props: {
    isShop: {
      default: false,
      type: Boolean,
    },
    shop: {},

    isSelldone: {
      default: false,
      type: Boolean,
    },
    articleUserId: {
      required: false,
      type: Number,
    },
    articleId: {
      required: true,
      type: Number,
    },
    forProduct: {
      required: false,
      type: Boolean,
      default: false,
    },
    isAdmin: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      state: "default",
      data: {
        body: "",
      },

      comments_count: 0,
      comments: [],
      user_rates: [],

      error: false,
      error_message: "",

      current_comment_id: 0,

      // ―――――――― 🗘 Sync endless list. ――――――――
      busy: false,
      offset: 0, // Offset of data
      limit: 10, // Size of serves
      more: true, // Has more data,

      busy_send: false,
      busy_update: null,

      remain_auto_fetch: 1,

      expand: false,
    };
  },
  computed: {
    user() {
      return this.USER();
    },

    my_comments() {
      if (!this.user) return [];
      return this.comments.filter((i) => i.user_id === this.user.id);
    },
    other_comments() {
      if (!this.user) return this.comments;
      return this.comments.filter((i) => i.user_id !== this.user.id);
    },
    can_send_comment() {
      return !this.my_comments || !this.my_comments.some((i) => !i.deleted_at);
    },
  },
  watch: {
    articleId: function (newVal, oldVal) {
      // watch it
      this.refreshPage(true);
    },
  },
  created() {
    this.fetchComments(true);
  },

  mounted() {
    // this.initScroll();
  },
  methods: {
    getRates(user_id) {
      if (!this.forProduct) return null;
      return this.user_rates.filter((item) => {
        return item.user_id === user_id;
      });
    },

    refreshPage() {
      // 🞇 Reset to default
      this.resetToDefault();

      this.fetchComments(true);
    },

    //――――――――――――――――――――――― Comment ▶ Get comments ―――――――――――――――――――――――

    fetchComments(load_my_comments) {
      if (this.busy || !this.more || !this.articleId) return;
      this.busy = true;

      //const t = this;
      axios
        .get(window.GAPI.GET_COMMENTS(this.articleId), {
          params: {
            offset: this.offset,
            limit: this.limit,
            product: this.forProduct,

            myself: load_my_comments, // Load my comments separately.
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.comments = this.comments.concat(data.comments);
            this.user_rates = this.user_rates.concat(data.user_rates);

            this.offset = data.offset;
            this.more = data.more;

            this.comments_count = data.count;

            if (load_my_comments && data.my_comments) {
              this.comments.push(...data.my_comments);
            }
          }
        })
        .finally(() => {
          this.busy = false;
        });
    },

    //――――――――――――――――――――――― Comment ▶ Edit (Update) ―――――――――――――――――――――――
    updateComment($event) {
      this.busy_update = $event.comment_id;
      axios
        .put(window.ARTICLE_API.PUT_UPDATE_COMMENT($event.comment_id), $event)
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }
          this.comments[this.commentIndex($event.comment_id)].body =
            data.comment.body;
          this.comments[this.commentIndex($event.comment_id)].updated_at =
            data.comment.updated_at;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = null;
        });
    },

    //――――――――――――――――――――――― Comment ▶ Reply (By admin) ―――――――――――――――――――――――
    replyComment({ comment_id, reply }) {
      this.busy_update = comment_id;
      axios
        .put(
          window.ARTICLE_API.PUT_SHOP_COMMENT_REPLY(this.shop.id, comment_id),
          { reply: reply },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }
          this.comments[this.commentIndex(comment_id)].reply =
            data.comment.reply;
          this.comments[this.commentIndex(comment_id)].updated_at =
            data.comment.updated_at;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = null;
        });
    },

    //――――――――――――――――――――――― Comment ▶ Save ―――――――――――――――――――――――

    saveComment() {
      // Check body not empty!
      if (this.data.body === "") {
        this.error = true;
        this.error_message = this.$t(
          "global.comment_manager.comment_input_empty",
        );
        return;
      }
      // Check article has been saved!
      if (this.articleId === "") {
        this.error = true;
        this.error_message = this.$t(
          "global.comment_manager.article_not_saved",
        );
        return;
      }
      // Clear error.
      this.error = false;
      this.error_message = "";

      this.busy_send = true;
      axios
        .post(window.ARTICLE_API.POST_ADD_COMMENT(this.articleId), this.data)
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.error = true;
            this.error_message = data.error_msg
              ? data.error_msg
              : this.$t("global.comments.cant_send_comment");
            return;
          }
          this.closeNewComment();
          this.comments_count = data.count;
          this.comments.unshift(data.comment);
          this.stopEditing();
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy_send = false;
        });
    },

    //――――――――――――――――――――――― Comment ▶ Delete ―――――――――――――――――――――――
    openDeleteAlert($event) {
      this.current_comment_id = $event.comment_id;

      this.openDangerAlert(
        this.$t("global.comments.delete_alert.title"),
        this.$t("global.comments.delete_alert.message"),
        this.$t("global.comments.delete_alert.action"),
        this.deleteComment,
      );
    },

    deleteComment() {
      axios
        .delete(window.ARTICLE_API.DELETE_COMMENT(this.current_comment_id))
        .then(({ data }) => {
          if (data.error) {
            // Error!
            this.error = true;
            this.error_message = this.$t(
              "global.comments.cant_remove_this_comment",
            );
            this.showErrorAlert("Error!", data.error_msg);
            return;
          }
          this.comments_count = data.count;
          this.comments.splice(this.commentIndex(data.comment.id), 1);
          this.showSuccessAlert(
            this.$t("global.comments.delete_alert.title"),
            this.$t("global.comments.notifications.delete_success"),
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        });
    },

    //――――――――――――――――――――――― Helper Methods ―――――――――――――――――――――――

    startEditing() {
      this.state = "editing";
    },
    stopEditing() {
      this.state = "default";
      this.data.body = "";
    },

    commentIndex(commentId) {
      return this.comments.findIndex((element) => {
        return element.id === commentId;
      });
    },

    closeNewComment() {
      this.expand = false;
    },

    //――――――――――――――――――――――― Scroll ―――――――――――――――――――――――
  },
};
</script>

<style lang="scss" scoped></style>

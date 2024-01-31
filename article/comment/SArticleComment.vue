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
    <div class="comment-item pa-5">
      <v-row no-gutters align="center">
        <div
          v-if="canDelete"
          class="delete-comment"
          :title="$t('global.commons.delete')"
          @click="deleteComment"
        >
          <span class="fas fa-ban" />
        </div>

        <div
          v-if="editable"
          class="edit-comment"
          @click="state = state === 'editing' ? 'default' : 'editing'"
          :title="$t('global.commons.edit')"
        >
          <span class="edit_square" />
        </div>

        <v-chip
          v-if="comment.deleted_at"
          label
          class="mx-2"
          size="small"
          :title="'Deleted: ' + getLocalTimeString(comment.deleted_at)"

          color="red"
        >
          <v-icon size="small" start>delete</v-icon>
          {{ getFromNowString(comment.deleted_at) }}</v-chip
        >

        <v-spacer></v-spacer>

        <div class="comment-author-info">
          <b>{{ comment.user.name }}</b>

          <time
            >{{ $t("global.comments.comment_at") }}
            {{ getLocalTimeString(comment.updated_at) }}</time
          >

          <transition name="bounce">
            <i
              v-if="comment.created_at !== comment.updated_at"
              class="fas fa-refresh ms-2"
              :title="
                $t('global.comments.first_send') +
                ' : ' +
                getLocalTimeString(comment.created_at)
              "
            ></i>
          </transition>
        </div>

        <v-avatar
          color="#fff"
          size="38"
          class="m-2 avatar-gradient -thin -user hover-scale force-top"
        >
          <v-img :src="getUserAvatar(comment.user.id)" />
        </v-avatar>
      </v-row>

      <div class="position-relative">
        <v-expand-transition>
          <div v-if="state === 'default'">
            <div class="comment-body">
              <v-row v-if="buy_product" align="center">
                <v-col cols="12" sm="6" class="text-start">
                  <rating-bar
                    v-for="(item, index) in rates"
                    :key="index"
                    :value="item.value"
                    :max="5"
                    :title="item.name"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-rating
                    :model-value="calculateRate"
                    class="text-center"
                    active-color="yellow-darken-3"
                    color="grey-darken-1"
                    half-increments
                    :readonly="true"
                    size="small"
                  />
                  <v-chip size="small" color="success" >
                    <v-icon start size="x-small"> shopping_basket</v-icon>
                    {{ $t("global.comments.product_buyer") }}</v-chip
                  >
                </v-col>
              </v-row>

              <p
                dir="auto"
                style="text-align: justify"
                class="mt-3 typo-body"
                :class="{ 'op-0-5': comment.deleted_at }"
                v-html="comment_html"
              ></p>

              <v-sheet
                v-if="reply_html || isAdmin"
                color="#fafafa"
                class="mt-3 pa-3 pa-3 rounded-lg text-start"
              >
                <v-avatar class="me-1" color="#fff" size="24">
                  <v-icon size="small">storefront</v-icon>
                </v-avatar>
                <b> {{ $t("global.commons.merchant") }}</b>
                <v-expand-transition>
                  <div v-if="!show_reply">
                    <p
                      dir="auto"
                      style="text-align: justify"
                      class="typo-body mt-2 mb-0"
                      v-html="reply_html"
                    ></p>
                  </div>
                </v-expand-transition>

                <div v-if="isAdmin" class="py-3">
                  <v-expand-transition>
                    <v-btn
                      v-if="!show_reply"
                      @click="show_reply = true"
                      color="primary"
                      :variant="!!comment.reply && 'text'"
                      class="tnt"
                    >
                      <v-icon class="me-1" size="small">edit</v-icon>
                      {{
                        comment.reply ? "Edit reply" : "Write the answer"
                      }}</v-btn
                    >
                    <div v-else>
                      <v-textarea
                        flat
                        auto-grow
                        v-model="reply_input"
                        dir="auto"
                        density="compact"
                        rounded
                        placeholder="Write your message here..."
                        class="m-2"
                      >
                      </v-textarea>

                      <div class="widget-buttons">
                        <v-btn
                          size="x-large"
                          variant="text"
                          @click="show_reply = false"
                        >
                          <v-icon class="me-1">close</v-icon>
                          {{ $t("global.actions.close") }}
                        </v-btn>
                        <v-btn
                          size="x-large"
                          color="primary"
                          @click="sendReply()"
                        >
                          <v-icon class="me-1">save</v-icon>
                          {{ $t("global.actions.save") }}
                        </v-btn>
                      </div>
                    </div>
                  </v-expand-transition>
                </div>
              </v-sheet>
            </div>
          </div>
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="state === 'editing'">
            <div class="comment-body">
              <v-textarea
                flat
                auto-grow
                v-model="data.body"
                dir="auto"
                density="compact"
                rounded
                :placeholder="$t('global.comments.edit_comment')"
                class="m-2"
              />

              <div class="widget-buttons">
                <v-btn variant="text" size="x-large" @click="resetEdit">
                  <v-icon class="me-1">close</v-icon>
                  {{ $t("global.actions.cancel") }}
                </v-btn>
                <v-btn
                  color="#333"
                  variant="flat"
                  size="x-large"
                  @click="deleteComment"
                >
                  <v-icon class="me-1">delete</v-icon>
                  {{ $t("global.actions.delete") }}
                </v-btn>
                <v-btn
                  color="#333"
                  size="x-large"
                  variant="flat"
                  @click="saveEdit"
                  :loading="loading"
                >
                  <v-icon class="me-1">save</v-icon>
                  {{ $t("global.actions.save") }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </div>
    </div>
  </div>
</template>

<script>
import RatingBar from "@components/ui/rating/RatingBar.vue";
import { SmartConvertTextToHtml } from "@core/helper/html/HtmlHelper";
export default {
  name: "SArticleComment",
  components: { RatingBar },
  props: {
    comment: {
      required: true,
      type: Object,
    },
    articleUserId: {
      required: true,
      type: Number,
    },
    rates: {
      // For product rating
    },
    loading: {},
    isAdmin: {
      default: false,
      type: Boolean,
    },
  },
  data: function () {
    return {
      state: "default",
      data: {
        body: this.comment.body,
      },

      show_reply: false,
      reply_input: null,
    };
  },
  computed: {
    comment_html() {
      return SmartConvertTextToHtml(this.comment.body);
    },
    reply_html() {
      return SmartConvertTextToHtml(this.comment.reply);
    },
    editable() {
      return this.USER() && this.USER_ID() === this.comment.user.id;
    },
    canDelete() {
      // Owner of th article or Comment author
      return (
        this.USER() &&
        !this.comment.deleted_at &&
        (this.USER_ID() === this.articleUserId ||
          this.USER_ID() === this.comment.user.id)
      );
    },

    buy_product() {
      return this.rates && this.rates.length;
    },
    calculateRate() {
      if (!this.rates || !this.rates.length) return 0;
      let sum = 0;
      this.rates.forEach((item) => {
        sum += item.value;
      });

      return sum / this.rates.length;
    },
  },

  created() {
    this.reply_input = this.comment.reply;
  },
  methods: {
    resetEdit() {
      this.state = "default";
      this.data.body = this.comment.body;
      this.reply_input = this.comment.reply;
    },
    saveEdit() {
      this.state = "default";
      this.$emit("comment-updated", {
        comment_id: this.comment.id,
        body: this.data.body,
      });
    },
    deleteComment() {
      this.$emit("comment-deleted", {
        comment_id: this.comment.id,
      });
    },

    sendReply() {
      this.$emit("comment-reply", {
        comment_id: this.comment.id,
        reply: this.reply_input,
      });
      this.comment.reply = this.reply_input;
      this.show_reply = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>

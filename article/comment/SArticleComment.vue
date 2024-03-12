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
      <v-row align="center" no-gutters>
        <v-btn
          v-if="canDelete"
          :title="$t('global.commons.delete')"
          color="red"
          icon
          variant="text"
          @click="deleteComment"
        >
          <v-icon>close</v-icon>
        </v-btn>

        <v-btn
          v-if="editable"
          :title="$t('global.commons.edit')"
          icon
          variant="text"
          @click="state = state === 'editing' ? 'default' : 'editing'"
        >
          <v-icon>edit</v-icon>
        </v-btn>

        <v-chip
          v-if="comment.deleted_at"
          :title="'Deleted: ' + getLocalTimeString(comment.deleted_at)"
          class="mx-2"
          color="red"
          label
          size="small"
        >
          <v-icon size="small" start>delete</v-icon>
          {{ getFromNowString(comment.deleted_at) }}
        </v-chip>

        <v-spacer></v-spacer>

        <div class="comment-author-info">
          <b>{{ comment.user.name }}</b>

          <time
            >{{ $t("global.comments.comment_at") }}
            {{ getLocalTimeString(comment.updated_at) }}
          </time>

          <transition name="bounce">
            <i
              v-if="comment.created_at !== comment.updated_at"
              :title="
                $t('global.comments.first_send') +
                ' : ' +
                getLocalTimeString(comment.created_at)
              "
              class="fas fa-refresh ms-2"
            ></i>
          </transition>
        </div>

        <v-avatar
          class="m-2 avatar-gradient -thin -user hover-scale force-top"
          color="#fff"
          size="38"
        >
          <v-img :src="getUserAvatar(comment.user.id)" />
        </v-avatar>
      </v-row>

      <div class="position-relative">
        <v-expand-transition>
          <div v-if="state === 'default'">
            <div class="comment-body">
              <v-row v-if="buy_product" align="center">
                <v-col class="text-start" cols="12" sm="6">
                  <rating-bar
                    v-for="(item, index) in rates"
                    :key="index"
                    :max="5"
                    :title="item.name"
                    :value="item.value"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-rating
                    :model-value="calculateRate"
                    :readonly="true"
                    active-color="yellow-darken-3"
                    class="text-center"
                    color="grey-darken-1"
                    half-increments
                    size="small"
                  />
                  <v-chip color="success" size="small">
                    <v-icon size="x-small" start> shopping_basket</v-icon>
                    {{ $t("global.comments.product_buyer") }}
                  </v-chip>
                </v-col>
              </v-row>

              <p
                :class="{ 'op-0-5': comment.deleted_at }"
                class="mt-3 typo-body"
                dir="auto"
                style="text-align: justify"
                v-html="comment_html"
              ></p>

              <v-sheet
                v-if="reply_html || isAdmin"
                class="mt-3 pa-3 pa-3 rounded-lg text-start"
                color="#fafafa"
              >
                <v-avatar class="me-1" color="#fff" size="24">
                  <v-icon size="small">storefront</v-icon>
                </v-avatar>
                <b> {{ $t("global.commons.merchant") }}</b>
                <v-expand-transition>
                  <div v-if="!show_reply">
                    <p
                      class="typo-body mt-2 mb-0"
                      dir="auto"
                      style="text-align: justify"
                      v-html="reply_html"
                    ></p>
                  </div>
                </v-expand-transition>

                <div v-if="isAdmin" class="py-3">
                  <v-expand-transition>
                    <v-btn
                      v-if="!show_reply"
                      :variant="!!comment.reply ? 'text' : undefined"
                      class="tnt"
                      color="primary"
                      @click="show_reply = true"
                    >
                      <v-icon class="me-1" size="small">edit</v-icon>
                      {{ comment.reply ? "Edit reply" : "Write the answer" }}
                    </v-btn>
                    <div v-else>
                      <v-textarea
                        v-model="reply_input"
                        :rows="3"
                        auto-grow
                        class="ma-2"
                        dir="auto"
                        placeholder="Write your message here..."
                        variant="plain"
                      >
                      </v-textarea>

                      <div class="widget-buttons">
                        <v-btn
                          size="x-large"
                          variant="text"
                          @click="show_reply = false"
                        >
                          <v-icon start>close</v-icon>
                          {{ $t("global.actions.close") }}
                        </v-btn>
                        <v-btn
                          color="primary"
                          size="x-large"
                          @click="sendReply()"
                        >
                          <v-icon start>save</v-icon>
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
                v-model="data.body"
                :placeholder="$t('global.comments.edit_comment')"
                auto-grow
                class="ma-2"
                dir="auto"
                variant="plain"
              />

              <div class="widget-buttons">
                <v-btn size="x-large" variant="text" @click="resetEdit" prepend-icon="close">
                  {{ $t("global.actions.cancel") }}
                </v-btn>
                <v-btn
                  color="#333"
                  size="x-large"
                  variant="text"
                  @click="deleteComment"
                  prepend-icon="delete"
                >
                  {{ $t("global.actions.delete") }}
                </v-btn>
                <v-btn
                  :loading="loading"
                  color="#333"
                  size="x-large"
                  variant="elevated"
                  @click="saveEdit"
                  prepend-icon="save"
                >
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

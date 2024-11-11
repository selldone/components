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
  <div>
    <!-- Comments view -->

    <v-expand-transition>
      <div
        v-if="show || fake_show"
        :class="{ 'mx-4': !parent, 'ms-4': parent }"
        class="my-2"
      >
        <u-loading-ellipsis
          v-if="busy_fetch && page === 1"
          css-mode
          light
        ></u-loading-ellipsis>

        <!-- No comment message -->
        <div v-if="!busy_fetch && !comments.length" class="text-muted p-2">
          {{ $t("community.comment.first_comment") }}
        </div>

        <!-- No comments -->
        <v-scroll-y-reverse-transition group hide-on-leave>
          <div v-for="com in comments" :id="'comment-' + com.id" :key="com.id">
            <div class="d-flex">
              <!-- User Avatar -->
              <v-avatar
                :size="parent ? '2.2em' : '2.6em'"
                class="me-2"
                color="#fafafa"
              >
                <v-img :src="getUserAvatar(com.user_id)"></v-img>
              </v-avatar>

              <!-- Author name / description -->
              <div
                :class="{ '-blue': focus === com.id }"
                class="flex-grow-1 p-2 cmt-body overflow-hidden bgc"
              >
                <div class="d-flex align-center">
                  <b class="d-block text-capitalize flex-grow-1"
                    >{{ com.profile.name }}
                    <v-icon
                      v-if="com.profile.verified"
                      class="ms-1"
                      color="blue"
                      size="small"
                      >verified
                    </v-icon>

                    <v-chip
                      v-if="com.user_id === post.user_id"
                      class="mx-1"
                      color="#333"
                      pill
                      size="x-small"
                      >{{ $t("community.commons.author") }}
                    </v-chip>
                  </b>
                  <small
                    >{{ getFromNowString(com.created_at) }}
                    <span v-if="com.created_at !== com.updated_at">
                      . edited</span
                    ></small
                  >
                  <v-btn
                    class="ms-2"
                    icon
                    variant="text"
                    size="small"
                    @click="
                      (e) =>
                        showCommunityCommentActionsMenu(
                          e.target,
                          shop,
                          post,
                          com,
                          () => {
                            DeleteItemByID(comments, com.id);
                          },
                        )
                    "
                  >
                    <v-icon>more_horiz</v-icon>
                  </v-btn>
                </div>
                <small class="d-block single-line mb-2">{{
                  com.profile.description
                }}</small>

                <!-- Comment image -->

                <c-image-view
                  v-if="com.image"
                  :src="getShopImagePath(com.image)"
                  class="rounded-18px"
                  fullscreen
                  height="auto"
                  max-height="480"
                  width="240"
                >
                </c-image-view>

                <!-- Comment body -->
                <v-btn
                  v-if="com.offensive"
                  color="red"
                  size="small"
                  variant="text"
                  @click="force_show = !force_show && com.id"
                >
                  <v-icon class="me-1" size="small">warning</v-icon>
                  This comment is offensive!
                </v-btn>
                <p
                  v-if="!com.offensive || force_show === com.id"
                  class="my-2"
                  v-html="convertToHtml(com.body)"
                ></p>

                <!-- Show reports to admin -->
                <div class="text-subtitle-2 mb-1 d-flex justify-end">
                  <span
                    v-if="com.reports"
                    class="text-red pp"
                    @click="showCommunityCommentReportsMenu(com)"
                  >
                    <v-icon color="red" size="small">report</v-icon>
                    {{ com.reports }} {{ $t("community.commons.reports") }}
                  </span>
                </div>

                <!-- actions -->
                <div class="d-flex">
                  <v-btn
                    :disabled="show_replies_id === com.id"
                    variant="text"
                    @click="showReplies(com, 1)"
                  >
                    <v-icon class="me-1" size="small">question_answer</v-icon>
                    {{ $t("community.commons.reply") }}
                    <b v-if="com.replies">({{ com.replies }})</b></v-btn
                  >

                  <v-spacer></v-spacer>

                  <!-- actions > Disagree -->

                  <span
                    class="cc-d"
                    :style="{
                      '--size':
                        Math.round(
                          60 *
                            (com.disagrees /
                              (com.agrees + com.disagrees + 10)) /*bias*/,
                        ) + 'px',
                    }"
                  >
                    <v-btn
                      :color="
                        com.action && com.action.reaction === 'DISAGREE'
                          ? '#9C27B0'
                          : undefined
                      "
                      :loading="busy_reaction === com.id + 'DISAGREE'"
                      class="ma-1"
                      size="small"
                      variant="text"
                      @click="sendCommentReaction(com, 'DISAGREE')"
                    >
                      <v-icon class="me-1" size="small"
                        >{{
                          com.action && com.action.reaction === "DISAGREE"
                            ? "thumb_down"
                            : "thumb_down_off_alt"
                        }}
                      </v-icon>
                      {{ $t("community.commons.disagree") }}
                      <b v-if="com.disagrees" class="ms-1"
                        >({{ numeralFormat(com.disagrees, "0.[0]a") }})</b
                      ></v-btn
                    >
                  </span>

                  <!-- actions > Agree -->

                  <span
                    class="cc-a"
                    :style="{
                      '--size':
                        Math.round(
                          60 *
                            (com.agrees /
                              (com.agrees + com.disagrees + 10)) /*bias*/,
                        ) + 'px',
                    }"
                  >
                    <v-btn
                      :color="
                        com.action && com.action.reaction === 'AGREE'
                          ? 'success'
                          : undefined
                      "
                      :loading="busy_reaction === com.id + 'AGREE'"
                      class="ma-1"
                      size="small"
                      variant="text"
                      @click="sendCommentReaction(com, 'AGREE')"
                    >
                      <v-icon class="me-1" size="small"
                        >{{
                          com.action && com.action.reaction === "AGREE"
                            ? "thumb_up"
                            : "thumb_up_off_alt"
                        }}
                      </v-icon>
                      {{ $t("community.commons.agree") }}
                      <b v-if="com.agrees" class="ms-1"
                        >({{ numeralFormat(com.agrees, "0.[0]a") }})</b
                      ></v-btn
                    >
                  </span>
                </div>
              </div>
            </div>
            <!-- replies -->

            <div v-if="show_replies_id === com.id">
              <v-btn
                v-if="com.replies"
                class="text-capitalize"
                color="blue"
                size="small"
                variant="text"
                @click="show_replies_messages = !show_replies_messages"
                >{{
                  show_replies_messages ? "Hide replies" : "Show replies"
                }}
                ({{ com.replies }})
              </v-btn>
              <c-comments-list
                :parent="com"
                :post="post"
                :show="show_replies_messages"
                @blur="focus = null"
                @focus="focus = com.id"
              >
              </c-comments-list>
            </div>
          </div>
        </v-scroll-y-reverse-transition>

        <v-btn
          v-if="has_more"
          :loading="busy_fetch"
          class="my-2"
          variant="text"
          @click="fetchComments(page + 1)"
          >{{ $t("community.commons.show_more") }}
        </v-btn>
      </div>
    </v-expand-transition>

    <!-- image -->
    <v-expand-transition>
      <div v-show="image">
        <v-img
          :src="image"
          class="position-relative rounded-18px mx-4 my-2"
          height="200"
          max-width="90%"
          width="320"
        >
          <v-btn
            class="absolute-top-end"
            size="small"
            variant="flat"
            @click="clearImage"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-img>
      </div>
    </v-expand-transition>

    <!-- Comment send -->

    <div
      class="my-2"
      :class="{
        'mx-2 mx-sm-4': !parent,
        'ms-2 ms-sm-4': parent,
        opx: !show,
      }"
    >
      <v-textarea
        v-model="body"
        :class="{
          border: !parent || focus_me,

          ' rounded-t-xl': $vuetify.display.xs,
          'border-b-0 ': $vuetify.display.xs && body,
          'rounded-b-xl': $vuetify.display.xs && !body,

          'rounded-28px': !$vuetify.display.xs,
        }"
        :placeholder="
          parent
            ? $t('community.comment.comment_response_plc', {
                name: parent.profile.name,
              })
            : $t('community.comment.comment_plc')
        "
        auto-grow
        color="#ddd"
        flat
        hide-details
        bg-color="transparent"
        rounded
        rows="1"
        variant="solo"
        @blur="
          $emit('blur');
          focus_me = false;
        "
        @focus="
          $emit('focus');
          focus_me = true;
        "
      >
        <template v-slot:prepend-inner>
          <v-avatar class="me-2" color="#fafafa" size="2.4em">
            <v-img :src="getUserAvatar(USER_ID())"></v-img>
          </v-avatar>
        </template>
        <template v-if="!$vuetify.display.xs" v-slot:append-inner>
          <v-btn class="me-2" icon @click="showSelectImage()" variant="text">
            <v-icon>add_a_photo</v-icon>
          </v-btn>

          <v-btn
            :class="{ disabled: !body }"
            :disabled="!body"
            :color="body ? 'primary' : '#666'"
            icon
            :loading="busy"
            :variant="body ? 'elevated' : 'text'"
            class=""
            @click="sendComment"
          >
            <v-icon class="flip-rtl">send</v-icon>
          </v-btn>
        </template>
      </v-textarea>

      <v-expand-transition>
        <div v-if="$vuetify.display.xs && body" class="text-center">
          <div class="rounded-b-xl border border-t-0 mb-2">
            <v-btn
              class="my-1 mx-3"
              icon
              @click="showSelectImage()"
              variant="text"
            >
              <v-icon>add_a_photo</v-icon>
            </v-btn>

            <v-btn
              :class="{ disabled: !body }"
              :disabled="!body"
              :color="body ? 'primary' : '#666'"
              :loading="busy"
              :variant="body ? 'elevated' : 'text'"
              class="my-1 mx-3"
              @click="sendComment"
              rounded
              min-height="48px"
            >
              {{ $t("global.actions.send") }}
              <v-icon class="flip-rtl" end>send</v-icon>
            </v-btn>
          </div>
        </div>
      </v-expand-transition>

      <input
        ref="image_input"
        accept="image/*"
        hidden="hidden"
        type="file"
        @change="onSelectImage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import CImageView from "../../../community/image/view/CImageView.vue";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper.ts";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";

export default {
  name: "CCommentsList",
  components: {ULoadingEllipsis, CImageView },
  props: {
    shop: {},

    post: {
      require: true,
      type: Object,
    },
    parent: {},

    show: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      // Comment:
      comments: [],
      totalItems: 0,
      page: 1,
      busy_fetch: false,
      itemsPerPage: 5,

      // New Comment:
      body: null,
      image: null,
      image_file: null,
      busy: false,

      fake_show: false, // Force show my new comments

      //--------------------------
      show_replies_id: null,
      show_replies_messages: false,
      replies_page: 1,

      focus: false, // Focus on reply
      focus_me: false, // Focus on comment input
      //----------- Comment Reactions -----------
      busy_reaction: false,

      //--------------------------
      force_show: null,
    };
  },

  computed: {
    has_more() {
      return this.totalItems > this.comments.length;
    },

    preset_total() {
      return this.parent ? this.parent.replies : this.post.total_comments;
    },
  },

  watch: {
    show(show) {
      // First show load comments
      if (show && !this.totalItems && this.preset_total /*Post has comment!*/)
        this.fetchComments(1);

      if (!show) this.fake_show = false; // force hide if user want!
    },
  },

  created() {
    if (this.show && this.preset_total) {
      this.fetchComments(1);
    } else {
      // Show attached comments to post: (used by assign comment_id on fetch posts)
      if (this.post.comments && !this.parent /*Just show in the firs level!*/) {
        this.comments = this.post.comments;
        this.fake_show = true;
      }
    }
  },
  mounted() {},

  methods: {
    convertToHtml(body) {
      return SmartConvertTextToHtml(body, false, true, [
        "b",
        "p",
        "i",
        "a",
        "hr",
        "br",
        "span",
      ]);
    },
    //――――――――――――――――――――――― Comment > Image ―――――――――――――――――――――――

    showSelectImage() {
      const defaultFile = this.$refs.image_input;
      defaultFile.click();
    },

    onSelectImage() {
      const defaultFile = this.$refs.image_input;

      // Image Preview
      const file = defaultFile.files[0]; //files[0] - For getting first file
      //   console.log(files);

      if (file.size > 2 * 1024 * 1024) {
        this.showErrorAlert(null, "Max image size limit is 2Mb.");
        return;
      }

      if (file) {
        //Read File
        const fileReader = new FileReader();

        const t = this;
        fileReader.addEventListener("load", function () {
          // convert image to base64 encoded string
          t.image = this.result;
          t.image_file = file;
        });
        fileReader.readAsDataURL(file);
      }
    },
    clearImage() {
      this.image = null;
      this.image_file = null;
    },

    //――――――――――――――――――――――― Comment > Get list ―――――――――――――――――――――――
    fetchComments(page) {
      if (this.busy_fetch) return; // Prevent multiple fetching!

      this.busy_fetch = true;

      this.page = page;

      axios
        .get(
          window.CAPI.GET_COMMUNITY_TOPIC_POST_COMMENTS(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
          ),
          {
            params: {
              parent_id: this.parent ? this.parent.id : null,

              sortBy: null, // default
              sortDesc: null, // default

              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
            },
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            return;
          }

          data.comments.forEach((c) => {
            this.AddOrUpdateItemByID(this.comments, c);
          });

          this.totalItems = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    //――――――――――――――――――――――― Comment > Send ―――――――――――――――――――――――
    sendComment() {
      if (!this.USER()) {
        this.NeedLogin();
        return;
      }

      this.busy = true;

      const formData = new FormData();

      formData.append("body", this.body);

      if (this.parent)
        // Reply to this comment
        formData.append("parent_id", this.parent.id);

      if (this.image_file)
        formData.append("image", this.image_file, this.image_file.name);

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POST_COMMENT_CREATE(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
          ),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.body = null;
            this.clearImage();
            this.comments.push(data.comment);

            this.fake_show = true; // Force show my new comments

            // Update post comments count:
            if (this.parent) {
              this.parent.replies++;
            } else {
              this.post.total_comments++;
            }

            // Update parent replies count:
            if (this.parent) {
              this.parent.replies++;
            }

            this.$emit("add", data.comment);
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

    //――――――――――――――――――――――― Comment > Replies ―――――――――――――――――――――――

    showReplies(comment, page) {
      this.show_replies_id = comment.id;
      this.replies_page = page;
      this.show_replies_messages = true;
    },

    //――――――――――――――――――――――― Comment > Reaction ―――――――――――――――――――――――
    sendCommentReaction(comment, reaction) {
      if (!this.USER()) {
        return this.NeedLogin();
      }

      if (comment.action && comment.action.reaction === reaction) return;

      this.busy_reaction = comment.id + reaction;

      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_POST_COMMENT_REACTION(
            this.post.community_id,
            this.post.topic_id,
            this.post.id,
            comment.id,
          ),
          {
            reaction: reaction,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            comment.action = data.action; // Update user reaction
            Object.assign(comment, data.comment); // Update agrees / disagrees count
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reaction = null;
        });
    },
  },
};
</script>

<style lang="scss">
.bgc {
  background-color: #f8f9fa75;
  transition: all 0.3s ease;

  &.-blue {
    background-color: #0b77bf;
    color: #fff;

    small {
      color: #eee !important;
    }
  }
}

.cc-a,
.cc-d {
  position: relative;

  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    mix-blend-mode: hard-light;
    transition: all 0.3s ease;
    transition-delay: 0.15s;
    pointer-events: none;
  }

  &:hover {
    --size: 0 !important;
  }
}

.cc-a {
  &:after {
    background-color: #4fb053;
    opacity: 0.3;
  }
}

.cc-d {
  &:after {
    background-color: #ac59ba;
    opacity: 0.6;
  }
}
</style>

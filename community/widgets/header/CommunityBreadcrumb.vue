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
  <v-col cols="12">
    <div
      class="c-widget d-sm-flex align-center nopx overflow-x-auto -header py-2 thin-scroll position-relative"
      :class="{
        'text-center': $vuetify.breakpoint.xsOnly,
        'rounded-28px': !$vuetify.breakpoint.xsOnly,
      }"
    >
      <div
        class="flex-grow-1 px-4 py-2 d-block d-sm-flex align-center c-breadcrumb"
      >
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Login button ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <v-btn
            v-if="!USER()"
            icon
            @click="NeedLogin()"
            class="me-2 ms-sm-n2"
            :class="{'absolute-top-end':$vuetify.breakpoint.xsOnly}"
            :small="!$vuetify.breakpoint.xsOnly"
        ><v-icon>person</v-icon></v-btn>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ User menu ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <v-menu
          v-if="USER()"
          offset-y
          min-width="220"
          rounded="lg"
          open-on-hover
          open-on-click
          close-delay="300ms"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-avatar
              v-bind="attrs"
              v-on="on"
              :size="$vuetify.breakpoint.xsOnly ? 48 : 36"
              class="me-2 ms-sm-n2 avatar-gradient -thin -user"
              :class="{ 'float-start': $vuetify.breakpoint.xsOnly }"
            >
              <v-img :src="getUserAvatar(USER_ID())" />
            </v-avatar>
          </template>

          <v-sheet class="text-start">
            <v-list dense>
              <template v-if="access.admin">
                <v-list-item>
                  <v-list-item-title class="text-uppercase">{{
                    $t("community.commons.you_are_admin")
                  }}</v-list-item-title>
                  <v-list-item-icon
                    ><v-icon color="amber" small
                      >fas fa-crown</v-icon
                    ></v-list-item-icon
                  >
                </v-list-item>

                <v-divider></v-divider>
              </template>

              <v-list-item v-else-if="access.moderator">
                <v-list-item-title class="text-uppercase">{{
                  $t("community.commons.you_are_moderator")
                }}</v-list-item-title>
                <v-list-item-icon
                  ><v-icon color="success" small
                    >admin_panel_settings</v-icon
                  ></v-list-item-icon
                >
              </v-list-item>

              <!-- profile -->

              <div v-if="profile" class="d-flex my-1 text-center">
                <div class="w-50">
                  <small class="d-block">{{
                    $t("global.commons.followers")
                  }}</small
                  ><b>{{ profile.followers_count }}</b>
                </div>
                <div class="w-50">
                  <small class="d-block">{{
                    $t("global.commons.followings")
                  }}</small
                  ><b>{{ profile.following_count }}</b>
                </div>
              </div>

              <!-- Invite -->

              <v-list-item @click="show_invite = true">
                <v-list-item-title>{{
                  $t("community.commons.invite_friend")
                }}</v-list-item-title>
              </v-list-item>

              <!-- Nominate -->

              <v-list-item
                @click="show_nominate = true"
                :disabled="!is_verified_user"
              >
                <v-list-item-content>
                  <v-list-item-title
                    >{{ $t("community.commons.nominate_friend") }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="!is_verified_user">{{
                    $t("community.commons.request_nominate")
                  }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-icon
                  v-if="is_verified_user"
                  class="text-success font-weight-bold"
                  >{{ profile_credit }}x</v-list-item-icon
                >
              </v-list-item>

              <template v-if="access.admin || access.moderator">
                <v-divider></v-divider>
                <v-list-item
                  @click.stop="
                    community_config.show_deletes =
                      !community_config.show_deletes
                  "
                >
                  <v-list-item-title>{{
                    $t("community.commons.show_deleted_posts")
                  }}</v-list-item-title>
                  <v-list-item-icon
                    ><v-icon
                      :color="
                        community_config.show_deletes ? 'success' : undefined
                      "
                      >{{
                        community_config.show_deletes
                          ? "radio_button_checked"
                          : "radio_button_unchecked"
                      }}</v-icon
                    ></v-list-item-icon
                  >
                </v-list-item>
              </template>
            </v-list>
          </v-sheet>
        </v-menu>


        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Home ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
        <router-link
          :to="{ name: 'CommunityHomePage' }"
          class="d-block text-start"
          :class="{
            'limited-text-300px': $vuetify.breakpoint.xsOnly,
            'limited-text-150px': !$vuetify.breakpoint.xsOnly,
          }"
          exact
          >{{ $t("community.commons.categories") }}</router-link
        >

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Category ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <template v-if="category">
          <v-icon small class="mx-1 d-none d-sm-block">{{
            $t("icons.chevron_next")
          }}</v-icon>

          <component
            :is="topic ? 'router-link' : 'span'"
            :to="{
              name: 'CommunityCategoryPage',
              params: {
                category_id: category.id,
                category_slug: slugify(category.title),
              },
            }"
            class="d-block text-start"
            :class="{
              'limited-text-300px': $vuetify.breakpoint.xsOnly,
              'limited-text-150px': !$vuetify.breakpoint.xsOnly,
            }"
            >{{ category.title }}</component
          >
        </template>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Topic ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <template v-if="topic">
          <v-icon small class="mx-1 d-none d-sm-block">{{
            $t("icons.chevron_next")
          }}</v-icon>

          <component
            :is="post ? 'router-link' : 'span'"
            :to="{
              name: 'CommunityTopicPage',
              params: {
                category_id: category.id,
                category_slug: slugify(category.title),
                topic_id: topic.id,
                topic_slug: slugify(topic.title),
              },
            }"
            class="d-block text-start"
            :class="{
              'limited-text-300px': $vuetify.breakpoint.xsOnly,
              'limited-text-150px': !$vuetify.breakpoint.xsOnly,
            }"
            >{{ topic.title }}</component
          >
        </template>
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Post ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <template v-if="post">
          <v-icon small class="mx-1 d-none d-sm-block">{{
            $t("icons.chevron_next")
          }}</v-icon>
          <v-avatar
            :size="24"
            class="hover-scale avatar-gradient -thin -black me-1"
          >
            <v-img :src="getUserAvatar(post.user_id)" />
          </v-avatar>

          <span
            class="d-block text-start"
            :class="{
              'limited-text-300px': $vuetify.breakpoint.xsOnly,
              'limited-text-150px': !$vuetify.breakpoint.xsOnly,
            }"
          >
            {{ $t("community.commons.post") }}

            <v-icon v-if="post.video" small color="#111">smart_display</v-icon>
            <v-icon v-if="post.voice" small color="#111">graphic_eq</v-icon>
            <v-icon v-if="post.image" small color="#111">image</v-icon>
            <v-icon v-if="post.link" small color="#111">link</v-icon>
          </span>
        </template>
      </div>

      <!-- Other social channels -->
      <v-btn
        v-if="bot_telegram && bot_telegram.enable"
        icon
        class="me-1 sub-caption -hover"
        :title="$t('global.social_network.telegram')"
        :href="`https://t.me/${bot_telegram.channel}`"
        target="_blank"
        ><img width="16" height="16" src="../../../assets/tradmark/telegram.svg"
      /></v-btn>

      <template v-if="access.admin">
        <!-- Bot -->

        <v-btn
          v-if="hasBot"
          icon
          class="me-1 sub-caption -hover"
          :caption="$t('global.commons.bot')"
          @click="
            $emit('update:showBot', !showBot);
            $emit('update:showReport', false);
            $emit('update:showEdit', false);
          "
          :color="showBot ? 'blue' : undefined"
          ><v-icon small>fas fa-robot</v-icon></v-btn
        >

        <!-- Moderators -->
        <v-btn
          icon
          class="me-1 sub-caption -hover"
          @click="show_access = !show_access"
          :color="show_access ? 'blue' : undefined"
          :caption="$t('community.commons.moderators')"
          ><v-icon small>add_moderator</v-icon></v-btn
        >

        <!-- Report / Statistics -->

        <v-btn
          v-if="hasReport"
          icon
          class="me-1 sub-caption -hover"
          :caption="$t('community.commons.analytics')"
          @click="
            $emit('update:showReport', !showReport);
            $emit('update:showEdit', false);
            $emit('update:showBot', false);
          "
          :color="showReport ? 'blue' : undefined"
          ><v-icon small>donut_small</v-icon></v-btn
        >
        <!-- Edit -->

        <v-btn
          v-if="hasEdit"
          icon
          class="me-1 sub-caption -hover"
          :caption="$t('community.commons.edit')"
          @click="
            $emit('update:showEdit', !showEdit);
            $emit('update:showReport', false);
            $emit('update:showBot', false);
          "
          :color="showEdit ? 'blue' : undefined"
          ><v-icon small>edit</v-icon></v-btn
        >

        <v-divider vertical class="my-0 mx-1"></v-divider>
      </template>

      <!-- Notification -->

      <v-btn
        v-if="is_topic && USER()"
        icon
        :loading="busy_notify"
        class="me-1 sub-caption -hover"
        :caption="$t('community.commons.notify')"
        @click="toggleNotify()"
        :color="notify ? 'amber' : undefined"
        ><v-icon small>{{
          notify ? "notifications_active" : "notifications_none"
        }}</v-icon></v-btn
      >
      <!-- Rule -->

      <v-btn
        v-if="is_topic && USER()"
        icon
        class="me-1 sub-caption -hover"
        :caption="$t('community.commons.rules')"
        @click="dialog_rule = true"
        :color="showRule ? 'blue' : undefined"
        ><v-icon small>gavel</v-icon></v-btn
      >

      <!-- Feeds -->
      <v-btn
        v-if="USER()"
        icon
        class="me-1 sub-caption -hover"
        :caption="$t('community.commons.explore')"
        :to="{ name: 'CommunityFeedPage' }"
        exact
        ><v-icon small>explore</v-icon></v-btn
      >

      <!-- Comments (Replies) -->
      <v-btn
        v-if="USER()"
        icon
        class="me-1 sub-caption -hover"
        :caption="$t('community.commons.my_feed')"
        :to="{ name: 'CommunityMyCommentsPage' }"
        exact
        ><v-icon small>question_answer</v-icon></v-btn
      >
    </div>

    <!-- ------------------------------------ Moderators / Admins ------------------------------------ -->

    <v-expand-transition>
      <div v-if="show_access">
        <community-access-controller
          :shop="shop"
          :community="community"
        ></community-access-controller>
      </div>
    </v-expand-transition>

    <!-- ------------------------------------ Blocked user ------------------------------------ -->
    <v-alert
      v-if="block_at"
      class="mt-8 subtitle-2"
      dense
      color="red"
      colored-border
      border="left"
      >{{ $t("community.commons.blocked_message") }}:
      {{ getLocalTimeString(block_at) }}
      <br />
      <count-down :end="block_at_date"></count-down>
    </v-alert>

    <!-- ████████████████████ Rule Dialog ████████████████████ -->
    <v-dialog
      v-if="dialog_rule"
      v-model="dialog_rule"
      max-width="640"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card min-height="420">
        <v-card-title>
          {{ $t("community.commons.rules") }}
          <v-spacer></v-spacer>
          <v-btn icon large @click="dialog_rule = false"
            ><v-icon>close</v-icon></v-btn
          >
        </v-card-title>
        <v-card-text
          style="font-size: 16px; line-height: normal; color: #333"
          class="text-start"
          v-html="rule_html"
        >

        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ████████████████████ Invite Dialog ████████████████████ -->
    <v-dialog
      v-if="show_invite"
      v-model="show_invite"
      max-width="820"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card min-height="420">
        <v-card-title
          >{{ $t("community.commons.invite_friend") }}
          <v-spacer></v-spacer>
          <v-btn icon large @click="show_invite = false"
            ><v-icon>close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text
          style="font-size: 16px; line-height: normal; color: #333"
          class="text-start"
        >
          <p>{{ $t("community.invite.send_invite_msg") }}:</p>

          <div
            class="editable p-3 my-3"
            style="line-height: 1.8em"
            v-copy="invite_message + '\n\n' + invite_link"
          >
            {{ invite_message }}
            <br />
            {{ invite_link }}
          </div>

          <div class="text-center">
            <s-social-share-buttons
              class="mt-3"
              :title="`Invite you to ${
                community.name
              } ${SetupService.GetTwitterAccount()}`"
              :description="invite_message + '\n\n' + invite_link"
              :hashtags="`${community.name}`"
              :quote="invite_message"
              :url="invite_link"
              small
            ></s-social-share-buttons>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ------------------------------------ Nominate Dialog ------------------------------------ -->
    <v-dialog
      v-if="show_nominate"
      v-model="show_nominate"
      max-width="640"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <v-card min-height="420">
        <v-card-title>
          {{ $t("community.nominate.title") }}

          <v-spacer></v-spacer>
          <v-btn icon large @click="show_nominate = false"
            ><v-icon>close</v-icon></v-btn
          >
        </v-card-title>

        <v-card-text
          style="font-size: 16px; line-height: normal; color: #333"
          class="text-start"
        >
          <p>{{ $t("community.nominate.note") }}</p>

          <p>
            {{ $t("community.nominate.remains_credit") }}
            :<br /><span class="display-2 text-success"
              >{{ profile_credit }}x</span
            >
          </p>

          <v-alert type="info" v-if="profile_credit <= 0">
            {{ $t("community.nominate.no_credit_message") }}</v-alert
          >

          <user-email-input
            :user.sync="user_nominate"
            class="mt-3"
            :label="$t('community.nominate.user_nominate')"
            with-profile
            exclude-me
            no-icon
            :class="{ disabled: profile_credit <= 0 }"
          ></user-email-input>

          <v-alert
            v-if="user_nominate && !user_nominate.profile"
            type="error"
            >{{ $t("community.invite.not_have_profile_error") }}</v-alert
          >
          <v-alert
            v-else-if="user_nominate && user_nominate.profile.nominated_id"
            type="error"
            >{{ $t("community.invite.nominated_before_error") }}</v-alert
          >
          <v-alert
            v-else-if="user_nominate && user_nominate.profile.verified"
            type="error"
            >{{ $t("community.invite.verified_before_error") }}</v-alert
          >
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              color="primary"
              x-large
              depressed
              :disabled="!can_nominate"
              @click="nominateUser()"
              :loading="busy_nominate"
            >
              <v-icon class="me-1">group_add</v-icon>

              {{ $t("community.nominate.action") }}
              {{ user_nominate ? user_nominate.email : "" }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script>
import CommunityURLs from "../../helper/CommunityURLs";
import SSocialShareButtons from "../../../ui/button/share/SSocialShareButtons.vue";
import UserEmailInput from "@/Applications/Backoffice/components/user/UserEmailInput.vue";
import UsersDenseImagesCircles from "@/Applications/Backoffice/components/user/UsersDenseImagesCircles.vue";
import CommunityAccessController from "../access/CommunityAccessController.vue";
import CountDown from "@/Components/ui/count-down/CountDown.vue";
import { DateConverter } from "../../../../../core/helper/date/DateConverter";
import {SmartConvertTextToHtml} from "../../../../../core/helper/html/HtmlHelper";

export default {
  name: "CommunityBreadcrumb",
  components: {
    CountDown,
    CommunityAccessController,
    UsersDenseImagesCircles,
    UserEmailInput,
    SSocialShareButtons,
  },
  props: {
    shop: {},

    community: {
      required: true,
      type: Object,
    },

    category: {},
    topic: {},
    post: {},

    showRule: {
      type: Boolean,
      default: false,
    },
    showEdit: {
      type: Boolean,
      default: false,
    },
    showReport: {
      type: Boolean,
      default: false,
    },

    hasReport: {
      type: Boolean,
      default: false,
    },
    hasEdit: {
      type: Boolean,
      default: false,
    },
    hasBot: {
      type: Boolean,
      default: false,
    },

    showBot: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      dialog_rule: false,

      show_invite: false,

      show_nominate: false,

      show_access: false,

      // --------------------
      user_nominate: null,
      busy_nominate: false,
      busy_notify: false,

      // --------------------
    };
  },
  computed: {
    access() {
      return this.community.access;
    },

    is_topic() {
      return !!this.topic;
    },

    community_config() {
      return this.$store.getters.getCommunityConfiguration;
    },

    invite_message() {
      return this.$t("community.invite_message", {
        user: this.USER().name,
        community: this.community.title,
      });
    },

    invite_link() {
      return CommunityURLs.CommunityInviteLink(this.shop);
    },

    can_nominate() {
      return (
        this.profile_credit > 0 &&
        this.user_nominate &&
        this.user_nominate.profile &&
        !this.user_nominate.profile.nominated_id &&
        !this.user_nominate.profile.verified
      );
    },

    is_verified_user() {
      return (
        this.USER() &&
        this.USER().profile &&
        (this.USER().profile.nominated_id || this.USER().profile.verified)
      );
    },

    profile_credit() {
      return this.profile && this.profile.credit;
    },

    notify() {
      return this.topic && this.topic.action && this.topic.action.notify;
    },

    block_at() {
      return this.USER() && this.USER().block_at;
    },
    block_at_date() {
      return this.block_at && DateConverter.convertToLocalTime(this.block_at);
    },

    profile() {
      return this.USER() && this.USER().profile;
    },

    bot_telegram() {
      return this.community.bots && this.community.bots["Telegram"];
    },

    rule_html(){
      return this.community.rule && SmartConvertTextToHtml(this.community.rule)
    }
  },

  methods: {
    //――――――――――――――――――――――――― Mention ―――――――――――――――――――――――――

    nominateUser() {
      this.busy_nominate = true;
      axios
        .post(window.CAPI.POST_COMMUNITY_NOMINATE(this.community.id), {
          email: this.user_nominate.email,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert();
            this.user_nominate = null;
            this.USER().profile.credit--; // Decrement profile credit!
            this.show_nominate = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_nominate = false;
        });
    },

    //――――――――――――――――――――――――― Set notify ―――――――――――――――――――――――――

    toggleNotify() {
      this.busy_notify = true;
      axios
        .post(
          window.CAPI.POST_COMMUNITY_TOPIC_NOTIFY(
            this.community.id,
            this.topic.id
          ),
          {
            notify: !this.notify,
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert();
            this.topic.action = data.action;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_notify = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.c-breadcrumb {
  a {
    color: #0b6aaa;
  }
}
.-header {
  min-height: 74px;
  font-size: 14px;
  font-weight: 500;
}
</style>

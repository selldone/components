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
      :class="{
        'text-center': $vuetify.display.xs,
        'rounded-28px': !$vuetify.display.xs,
      }"
      class="c-widget d-sm-flex align-center nopx overflow-x-auto -header py-2 thin-scroll position-relative"
    >
      <div
        class="flex-grow-1 px-4 py-2 d-block d-sm-flex align-center c-breadcrumb"
      >
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Login button ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <v-btn
          v-if="!USER()"
          :class="{ 'absolute-top-end': $vuetify.display.xs }"
          :size="!$vuetify.display.xs ? 'small' : undefined"
          class="me-2 ms-sm-n2"
          icon
          variant="text"
          @click="NeedLogin()"
        >
          <v-icon>person</v-icon>
        </v-btn>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ User menu ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <v-menu
          v-if="USER()"
          close-delay="300ms"
          min-width="220"
          open-on-click
          open-on-hover
        >
          <template v-slot:activator="{ props }">
            <v-avatar
              :class="{ 'float-start': $vuetify.display.xs }"
              :size="$vuetify.display.xs ? 48 : 36"
              class="me-2 ms-sm-n2 avatar-gradient -thin -user pp"
              v-bind="props"
            >
              <v-img :src="getUserAvatar(USER_ID())" />
            </v-avatar>
          </template>

          <v-sheet class="text-start" rounded="lg">
            <v-list density="compact">
              <template v-if="access.admin">
                <v-list-item>
                  <v-list-item-title class="text-uppercase"
                    >{{ $t("community.commons.you_are_admin") }}
                  </v-list-item-title>
                  <template v-slot:append>
                    <v-icon color="amber" size="small">fa:fas fa-crown</v-icon>
                  </template>
                </v-list-item>

                <v-divider></v-divider>
              </template>

              <v-list-item v-else-if="access.moderator">
                <v-list-item-title class="text-uppercase"
                  >{{ $t("community.commons.you_are_moderator") }}
                </v-list-item-title>
                <template v-slot:append>
                  <v-icon color="success" size="small"
                    >admin_panel_settings
                  </v-icon>
                </template>
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
                <v-list-item-title
                  >{{ $t("community.commons.invite_friend") }}
                </v-list-item-title>
              </v-list-item>

              <!-- Nominate -->

              <v-list-item
                :disabled="!is_verified_user"
                @click="show_nominate = true"
              >
                <v-list-item-title
                  >{{ $t("community.commons.nominate_friend") }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="!is_verified_user"
                  >{{ $t("community.commons.request_nominate") }}
                </v-list-item-subtitle>

                <template v-slot:append v-if="is_verified_user">
                  <b class="text-success">{{ profile_credit }}x</b>
                </template>
              </v-list-item>

              <template v-if="access.admin || access.moderator">
                <v-divider></v-divider>
                <v-list-item
                  @click.stop="
                    community_config.show_deletes =
                      !community_config.show_deletes
                  "
                >
                  <v-list-item-title
                    >{{ $t("community.commons.show_deleted_posts") }}
                  </v-list-item-title>
                  <template v-slot:append>
                    <v-icon
                      :color="
                        community_config.show_deletes ? 'success' : undefined
                      "
                      >{{
                        community_config.show_deletes
                          ? "radio_button_checked"
                          : "radio_button_unchecked"
                      }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-list>
          </v-sheet>
        </v-menu>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Home ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->
        <router-link
          :class="{
            'limited-text-300px': $vuetify.display.xs,
            'limited-text-150px': !$vuetify.display.xs,
          }"
          :to="{ name: 'CommunityHomePage' }"
          class="d-block text-start"
          exact
          >{{ $t("community.commons.categories") }}
        </router-link>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Category ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <template v-if="category">
          <v-icon class="mx-1 d-none d-sm-block" size="small"
            >{{ $t("icons.chevron_next") }}
          </v-icon>

          <component
            :is="topic ? 'router-link' : 'span'"
            :class="{
              'limited-text-300px': $vuetify.display.xs,
              'limited-text-150px': !$vuetify.display.xs,
            }"
            :to="{
              name: window.$community.routes.COMMUNITY_CATEGORY_PAGE,
              params: {
                category_id: category.id,
                category_slug: Slugify.apply(category.title),
              },
            }"
            class="d-block text-start"
            >{{ category.title }}
          </component>
        </template>

        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Topic ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <template v-if="topic">
          <v-icon class="mx-1 d-none d-sm-block" size="small"
            >{{ $t("icons.chevron_next") }}
          </v-icon>

          <component
            :is="post ? 'router-link' : 'span'"
            :class="{
              'limited-text-300px': $vuetify.display.xs,
              'limited-text-150px': !$vuetify.display.xs,
            }"
            :to="{
              name: window.$community.routes.COMMUNITY_TOPIC_PAGE,
              params: {
                category_id: category.id,
                category_slug: Slugify.apply(category.title),
                topic_id: topic.id,
                topic_slug: Slugify.apply(topic.title),
              },
            }"
            class="d-block text-start"
            >{{ topic.title }}
          </component>
        </template>
        <!-- ▄▄▄▄▄▄▄▄▄▄▄▄▄ Post ▄▄▄▄▄▄▄▄▄▄▄▄▄ -->

        <template v-if="post">
          <v-icon class="mx-1 d-none d-sm-block" size="small"
            >{{ $t("icons.chevron_next") }}
          </v-icon>
          <v-avatar
            :size="24"
            class="hover-scale avatar-gradient -thin -black me-1"
          >
            <v-img :src="getUserAvatar(post.user_id)" />
          </v-avatar>

          <span
            :class="{
              'limited-text-300px': $vuetify.display.xs,
              'limited-text-150px': !$vuetify.display.xs,
            }"
            class="d-block text-start"
          >
            {{ $t("community.commons.post") }}

            <v-icon v-if="post.video" color="#111" size="small"
              >smart_display</v-icon
            >
            <v-icon v-if="post.voice" color="#111" size="small"
              >graphic_eq</v-icon
            >
            <v-icon v-if="post.image" color="#111" size="small">image</v-icon>
            <v-icon v-if="post.link" color="#111" size="small">link</v-icon>
          </span>
        </template>
      </div>

      <!-- Other social channels -->
      <v-btn
        v-if="bot_telegram && bot_telegram.enable"
        :href="`https://t.me/${bot_telegram.channel}`"
        class="me-1"
        icon
        variant="text"
        target="_blank"
        ><img
          height="16"
          src="../../assets/trademark/telegram.svg"
          width="16"
        />

        <v-tooltip activator="parent" location="bottom">
          {{ $t("global.social_network.telegram") }}
        </v-tooltip>
      </v-btn>

      <template v-if="access.admin">
        <!-- Bot -->

        <v-btn
          v-if="hasBot"
          :color="showBot ? 'blue' : undefined"
          class="me-1"
          icon
          variant="text"
          @click="
            $emit('update:showBot', !showBot);
            $emit('update:showReport', false);
            $emit('update:showEdit', false);
          "
        >
          <v-icon size="small">fa:fas fa-robot</v-icon>

          <v-tooltip activator="parent" location="bottom">
            {{ $t("community.commons.bot") }}
          </v-tooltip>
        </v-btn>

        <!-- Moderators -->
        <v-btn
          :color="show_access ? 'blue' : undefined"
          class="me-1"
          icon
          variant="text"
          @click="show_access = !show_access"
        >
          <v-icon size="small">add_moderator</v-icon>

          <v-tooltip activator="parent" location="bottom">
            {{ $t("community.commons.moderators") }}
          </v-tooltip>
        </v-btn>

        <!-- Report / Statistics -->

        <v-btn
          v-if="hasReport"
          :color="showReport ? 'blue' : undefined"
          class="me-1"
          icon
          variant="text"
          @click="
            $emit('update:showReport', !showReport);
            $emit('update:showEdit', false);
            $emit('update:showBot', false);
          "
        >
          <v-icon size="small">donut_small</v-icon>

          <v-tooltip activator="parent" location="bottom">
            {{ $t("community.commons.analytics") }}
          </v-tooltip>
        </v-btn>
        <!-- Edit -->

        <v-btn
          v-if="hasEdit"
          :color="showEdit ? 'blue' : undefined"
          class="me-1"
          icon
          variant="text"
          @click="
            $emit('update:showEdit', !showEdit);
            $emit('update:showReport', false);
            $emit('update:showBot', false);
          "
        >
          <v-icon size="small">edit</v-icon>

          <v-tooltip activator="parent" location="bottom">
            {{ $t("community.commons.edit") }}
          </v-tooltip>
        </v-btn>

        <v-divider class="my-0 mx-1" vertical></v-divider>
      </template>

      <!-- Notification -->

      <v-btn
        v-if="is_topic && USER()"
        :color="notify ? 'amber' : undefined"
        :loading="busy_notify"
        class="me-1"
        icon
        variant="text"
        @click="toggleNotify()"
      >
        <v-icon size="small"
          >{{ notify ? "notifications_active" : "notifications_none" }}
        </v-icon>

        <v-tooltip activator="parent" location="bottom">
          {{ $t("community.commons.notify") }}
        </v-tooltip>
      </v-btn>
      <!-- Rule -->

      <v-btn
        v-if="is_topic && USER()"
        :color="showRule ? 'blue' : undefined"
        class="me-1"
        icon
        variant="text"
        @click="dialog_rule = true"
      >
        <v-icon size="small">gavel</v-icon>

        <v-tooltip activator="parent" location="bottom">
          {{ $t("community.commons.rules") }}
        </v-tooltip>
      </v-btn>

      <!-- Feeds -->
      <v-btn
        v-if="USER()"
        :to="{ name: 'CommunityFeedPage' }"
        class="me-1"
        exact
        icon
        variant="text"
      >
        <v-icon size="small">explore</v-icon>

        <v-tooltip activator="parent" location="bottom">
          {{ $t("community.commons.explore") }}
        </v-tooltip>
      </v-btn>

      <!-- Comments (Replies) -->
      <v-btn
        v-if="USER()"
        :to="{ name: 'CommunityMyCommentsPage' }"
        class="me-1"
        exact
        icon
        variant="text"
      >
        <v-icon size="small">question_answer</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ $t("community.commons.my_feed") }}
        </v-tooltip>
      </v-btn>
    </div>

    <!-- ------------------------------------ Moderators / Admins ------------------------------------ -->

    <v-expand-transition>
      <div v-if="show_access">
        <c-access-controller
          :community="community"
          :shop="shop"
        ></c-access-controller>
      </div>
    </v-expand-transition>

    <!-- ------------------------------------ Blocked user ------------------------------------ -->
    <v-alert
      v-if="block_at"
      border="start"
      class="mt-8 text-subtitle-2"
      color="red"
      variant="flat"
      density="compact"
      >{{ $t("community.commons.blocked_message") }}:
      {{ getLocalTimeString(block_at) }}
      <br />
      <u-count-down :end="block_at_date"></u-count-down>
    </v-alert>

    <!-- ████████████████████ Rule Dialog ████████████████████ -->
    <v-dialog
      v-if="dialog_rule"
      v-model="dialog_rule"
      :fullscreen="$vuetify.display.smAndDown"
      max-width="640"
      scrollable
    >
      <v-card min-height="420" class="text-start">
        <v-card-title class="d-flex align-center">
          {{ $t("community.commons.rules") }}
          <v-spacer></v-spacer>
          <v-btn icon size="large" @click="dialog_rule = false" variant="text">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text
          class="text-start"
          style="font-size: 16px; line-height: normal; color: #333"
          v-html="rule_html"
        >
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ████████████████████ Invite Dialog ████████████████████ -->
    <v-dialog
      v-if="show_invite"
      v-model="show_invite"
      :fullscreen="$vuetify.display.smAndDown"
      max-width="820"
      scrollable
    >
      <v-card min-height="420">
        <v-card-title
          >{{ $t("community.commons.invite_friend") }}
          <v-spacer></v-spacer>
          <v-btn icon size="large" @click="show_invite = false" variant="text">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text
          class="text-start"
          style="font-size: 16px; line-height: normal; color: #333"
        >
          <p>{{ $t("community.invite.send_invite_msg") }}:</p>

          <div
            v-copy="invite_message + '\n\n' + invite_link"
            class="editable p-3 my-3"
            style="line-height: 1.8em"
          >
            {{ invite_message }}
            <br />
            {{ invite_link }}
          </div>

          <div class="text-center">
            <u-button-share-group
              :description="invite_message + '\n\n' + invite_link"
              :hashtags="`${community.name}`"
              :quote="invite_message"
              :title="`Invite you to ${
                community.name
              } ${SetupService.GetTwitterAccount()}`"
              :url="invite_link"
              class="mt-3"
              small
            ></u-button-share-group>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ------------------------------------ Nominate Dialog ------------------------------------ -->
    <v-dialog
      v-if="show_nominate"
      v-model="show_nominate"
      :fullscreen="$vuetify.display.smAndDown"
      max-width="640"
      scrollable
    >
      <v-card min-height="420">
        <v-card-title>
          {{ $t("community.nominate.title") }}

          <v-spacer></v-spacer>
          <v-btn
            icon
            size="large"
            @click="show_nominate = false"
            variant="text"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text
          class="text-start"
          style="font-size: 16px; line-height: normal; color: #333"
        >
          <p>{{ $t("community.nominate.note") }}</p>

          <p>
            {{ $t("community.nominate.remains_credit") }}
            :<br /><span class="text-h3 text-success"
              >{{ profile_credit }}x</span
            >
          </p>

          <v-alert v-if="profile_credit <= 0" type="info">
            {{ $t("community.nominate.no_credit_message") }}
          </v-alert>

          <c-user-input
            v-model:user="user_nominate"
            :class="{ disabled: profile_credit <= 0 }"
            :label="$t('community.nominate.user_nominate')"
            class="mt-3"
            exclude-me
            no-icon
            with-profile
          ></c-user-input>

          <v-alert v-if="user_nominate && !user_nominate.profile" type="error"
            >{{ $t("community.invite.not_have_profile_error") }}
          </v-alert>
          <v-alert
            v-else-if="user_nominate && user_nominate.profile.nominated_id"
            type="error"
            >{{ $t("community.invite.nominated_before_error") }}
          </v-alert>
          <v-alert
            v-else-if="user_nominate && user_nominate.profile.verified"
            type="error"
            >{{ $t("community.invite.verified_before_error") }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :disabled="!can_nominate"
              :loading="busy_nominate"
              color="primary"
              size="x-large"
              variant="flat"
              @click="nominateUser()"
            >
              <v-icon class="me-1">group_add</v-icon>

              {{ $t("community.nominate.action") }}
              {{ user_nominate ? user_nominate.email : "" }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { CommunityURLs } from "@selldone/sdk-community/url/CommunityURLs";
import UButtonShareGroup from "../../ui/button/share/group/UButtonShareGroup.vue";
import UDenseCirclesUsers from "../../ui/dense-circles/users/UDenseCirclesUsers.vue";
import CAccessController from "../../community/access/controller/CAccessController.vue";
import UCountDown from "../../ui/count-down/UCountDown.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import { SmartConvertTextToHtml } from "@selldone/core-js/helper/html/HtmlHelper";
import CUserInput from "../../community/user/input/CUserInput.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";
import {Slugify} from "@selldone/core-js/utils/slugify/slugify.ts";


/**
 * <c-breadcrumb>
 */
export default {
  name: "CBreadcrumb",
  mixins: [DateMixin, AuthMixin ],
  components: {
    CUserInput,
    UCountDown,
    CAccessController,
    UDenseCirclesUsers,
    UButtonShareGroup,
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
      Slugify: Slugify,

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

    rule_html() {
      return this.community.rule && SmartConvertTextToHtml(this.community.rule);
    },
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
            NotificationService.showSuccessAlert();
            this.user_nominate = null;
            this.USER().profile.credit--; // Decrement profile credit!
            this.show_nominate = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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
            this.topic.id,
          ),
          {
            notify: !this.notify,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert();
            this.topic.action = data.action;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_notify = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
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

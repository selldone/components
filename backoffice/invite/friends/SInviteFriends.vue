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
  <div v-if="referral">
    <slot name="activator" :open="showDialog">
      <v-btn
        :size="modern ? 'default' : large ? 'x-large' : 'small'"
        :class="{ 'sd-modern-button': modern }"
        :color="modern ? 'primary' : '#000'"
        target="_blank"
        @click="showDialog"
        v-tooltip="$t('global.actions.invite')"
      >
        <v-icon class="me-1">share</v-icon>
        {{ $t("global.actions.invite")
        }}<template v-if="!modern"> + 🎁</template>
      </v-btn>
    </slot>

    <v-bottom-sheet
      v-model="dialog"
      :aria-label="
        modern ? $t('admin_shop.dashboard.modern.invite_friends') : undefined
      "
      :fullscreen="$vuetify.display.smAndDown"
      content-class="rounded-t-xl"
      max-width="860"
      width="99vw"
      :scrollable="modern"
    >
      <v-card
        :class="
          modern
            ? 's--invite-friends-modern sd-modern-widget text-start'
            : 'rounded-t-xl'
        "
        :max-height="
          modern && !$vuetify.display.smAndDown ? '92dvh' : undefined
        "
      >
        <v-card-title v-if="modern" class="sd-modern-header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon>share</v-icon></span
            >
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.invite_friends") }}
              </h2>
              <p class="sd-modern-subtitle">{{ USER().name }}</p>
            </div>
          </div>
          <div class="s--invite-friends-modern__header-actions">
            <v-btn
              :to="{ name: 'OPageMonetizeReferral' }"
              :active="false"
              class="sd-modern-button sd-modern-button--inline"
              variant="text"
              v-tooltip="$t('global.commons.affiliate')"
            >
              <v-icon start size="small">trending_up</v-icon
              >{{ $t("global.commons.affiliate") }}
            </v-btn>
            <v-btn
              icon
              class="sd-modern-icon-button"
              variant="text"
              :aria-label="$t('global.actions.close')"
              v-tooltip="$t('global.actions.close')"
              @click="dialog = false"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-img
          v-else
          :src="require('./assets/selldone-invite-landscape.webp')"
          width="100%"
          max-height="380"
          cover
          :aspect-ratio="1792 / 1024"
        >
          <v-card-title class="d-flex align-center">
            <v-avatar class="avatar-gradient -thin me-2" size="36">
              <v-img :src="getUserAvatar(USER_ID(), 'big')"></v-img>
            </v-avatar>
            <b>{{ USER().name }}</b>

            <v-spacer></v-spacer>
            <v-btn
              :to="{ name: 'OPageMonetizeReferral' }"
              class="tnt"
              color="#fff"
              rounded="xl"
              size="x-large"
              variant="outlined"
              style="backdrop-filter: blur(7px)"
              prepend-icon="trending_up"
              >My Affiliate Panel
            </v-btn>
          </v-card-title>
        </v-img>

        <v-card-text v-scroll.self="onScroll" class="thin-scroll">
          <h2
            :class="
              modern
                ? 's--invite-friends-modern__intro-title'
                : 'text-h4 my-3 text-start'
            "
          >
            {{ $t("invite_friends.title") }}
          </h2>
          <p
            :class="
              modern ? 'sd-modern-subtitle mb-4' : 'typo-body my-3 text-start'
            "
          >
            {{ $t("invite_friends.msg") }}
          </p>

          <v-container :class="{ 'pa-0': modern }">
            <!-- Emails list -->

            <v-row
              v-for="i in count"
              :key="i"
              :class="{
                'shadow-paper py-3':
                  !modern && emails[i] && valid_mails.includes(emails[i]),
                's--invite-friends-modern__person': modern,
                'rounded-28px': !modern,
              }"
              class="mt-1 mb-3"
              dense
              justify="space-around"
            >
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="emails[i]"
                  :hide-details="emails[i] && valid_mails.includes(emails[i])"
                  :loading="busy_check === i"
                  :placeholder="$t('global.placeholders.friend_email')"
                  :label="
                    modern ? $t('global.placeholders.friend_email') : undefined
                  "
                  :rules="[GlobalRules.email()]"
                  :variant="
                    !modern && emails[i] && valid_mails.includes(emails[i])
                      ? 'text'
                      : 'outlined'
                  "
                  class="english-field"
                  clearable
                  :color="modern ? 'primary' : 'blue'"
                  prepend-inner-icon="mail"
                  @blur="checkEmailToInvite(i, emails[i])"
                >
                  <template v-slot:append-inner>
                    <v-icon
                      v-if="emails[i] && valid_mails.includes(emails[i])"
                      class="op-1-0"
                      color="success"
                      >check_circle
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" :sm="modern ? 6 : 5">
                <v-text-field
                  v-model="names[i]"
                  :class="{ 'font-weight-bold': emails[i] && names[i] }"
                  :color="modern ? 'primary' : names[i] ? 'success' : 'amber'"
                  :hide-details="emails[i] && valid_mails.includes(emails[i])"
                  :placeholder="$t('global.placeholders.friend_name')"
                  :label="
                    modern ? $t('global.placeholders.friend_name') : undefined
                  "
                  :prepend-inner-icon="
                    names[i] ? 'insert_emoticon' : 'sentiment_satisfied'
                  "
                  :variant="
                    !modern && emails[i] && valid_mails.includes(emails[i])
                      ? 'text'
                      : 'outlined'
                  "
                >
                </v-text-field>
              </v-col>
            </v-row>

            <!-- Add button -->
            <div
              :class="{
                'sd-modern-actions s--invite-friends-modern__form-actions':
                  modern,
              }"
            >
              <div
                v-if="count <= 5"
                :class="modern ? undefined : 'widget-buttons'"
              >
                <v-btn
                  class="tnt"
                  :class="{
                    'sd-modern-button sd-modern-button--inline': modern,
                  }"
                  color="primary"
                  size="x-large"
                  variant="text"
                  @click="addNew"
                  v-tooltip="$t('global.actions.add_more')"
                >
                  <v-icon start>add</v-icon>
                  {{ $t("global.actions.add_more") }}
                </v-btn>
              </div>
              <!-- Send button -->

              <div :class="modern ? undefined : 'widget-buttons'">
                <v-btn
                  :loading="busy"
                  :class="{ 'sd-modern-button': modern }"
                  color="primary"
                  size="x-large"
                  @click="sendInvites()"
                  v-tooltip="$t('global.actions.send_invites')"
                >
                  <v-icon start>send</v-icon>
                  {{ $t("global.actions.send_invites") }}
                </v-btn>
              </div>
            </div>
          </v-container>

          <v-expansion-panels
            :class="modern ? 's--invite-friends-modern__disclosures' : 'my-6'"
            :variant="modern ? 'accordion' : 'default'"
            :flat="modern"
          >
            <v-expansion-panel :rounded="modern ? 0 : 'xl'">
              <v-expansion-panel-title>
                <div>
                  <v-icon
                    class="me-2"
                    :color="modern ? undefined : '#111'"
                    :size="modern ? 20 : undefined"
                    >share</v-icon
                  >
                  {{
                    modern ? $t("global.commons.share") : "Other Share Options"
                  }}
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Copy link -->
                <v-text-field
                  :label="$t('selldone_referral_page.referral_link')"
                  :model-value="referral_url"
                  :append-inner-icon="modern ? undefined : 'content_copy'"
                  :class="
                    modern
                      ? 'my-3 english-field'
                      : 'my-3 english-field dashed-field max-width-field-large mx-auto'
                  "
                  :color="modern ? 'primary' : 'success'"
                  hide-details
                  prepend-inner-icon="link"
                  readonly
                  variant="plain"
                  @click:append-inner="copyToClipboard(referral_url)"
                >
                  <template v-if="modern" #append-inner>
                    <v-btn
                      icon
                      class="sd-modern-icon-button"
                      variant="text"
                      :aria-label="$t('global.actions.copy')"
                      v-tooltip="$t('global.actions.copy')"
                      @click.stop="copyToClipboard(referral_url)"
                      ><v-icon>content_copy</v-icon></v-btn
                    >
                  </template>
                </v-text-field>

                <p :data-content="$t('global.commons.or')" class="hr-text"></p>

                <!-- Social share buttons -->

                <u-button-share-group
                  :description="$t('invite_friends.invite.description')"
                  :hashtags="$t('invite_friends.invite.hashtags')"
                  :quote="$t('invite_friends.invite.quote')"
                  :title="$t('invite_friends.invite.title')"
                  :url="referral_url"
                  small
                />
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel :rounded="modern ? 0 : 'xl'">
              <v-expansion-panel-title>
                <div>
                  <v-icon
                    class="me-2"
                    :color="modern ? undefined : '#111'"
                    :size="modern ? 20 : undefined"
                    >trending_up</v-icon
                  >
                  {{
                    modern
                      ? $t("global.commons.report")
                      : "My Invitation Report"
                  }}
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Report -->
                <v-row :class="{ 's--invite-friends-modern__report': modern }">
                  <v-col :cols="modern ? 12 : 4" :sm="modern ? 4 : undefined">
                    <small class="d-block">{{
                      $t("selldone_referral_page.registered")
                    }}</small>
                    <b>{{ referral.registered }}</b>
                  </v-col>
                  <v-col :cols="modern ? 12 : 4" :sm="modern ? 4 : undefined">
                    <small class="d-block">{{
                      $t("selldone_referral_page.accepted")
                    }}</small>
                    <b>{{ referral.accepted }}</b>
                  </v-col>
                  <v-col
                    :title="$t('global.commons.updated_at')"
                    :cols="modern ? 12 : 4"
                    :sm="modern ? 4 : undefined"
                  >
                    <b>{{ getFromNowString(referral.updated_at) }}</b
                    ><br />
                    <small>{{ getLocalTimeString(referral.updated_at) }}</small>
                  </v-col>
                </v-row>

                <div
                  :class="modern ? 'sd-modern-actions mt-3' : 'widget-buttons'"
                >
                  <v-btn
                    :to="{ name: 'OPageMonetizeReferral' }"
                    :active="modern ? false : undefined"
                    :class="{
                      'sd-modern-button sd-modern-button--inline': modern,
                    }"
                    color="primary"
                    size="x-large"
                    variant="text"
                    v-tooltip="$t('global.commons.report')"
                  >
                    <v-icon start>trending_up</v-icon>
                    {{ $t("global.commons.report") }}
                  </v-btn>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>

        <v-card-actions>
          <div
            :class="
              modern ? 'sd-modern-actions w-100 justify-end' : 'widget-buttons'
            "
          >
            <v-btn
              :class="{ 'sd-modern-button sd-modern-button--inline': modern }"
              size="x-large"
              variant="text"
              v-tooltip="$t('global.actions.close')"
              @click="dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules";
import UButtonShareGroup from "../../../ui/button/share/group/UButtonShareGroup.vue";
import { throttle } from "lodash-es";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "SInviteFriends",
  mixins: [DateMixin],
  components: { UButtonShareGroup },
  emits: ["update:dialog"],
  props: {
    modern: { type: Boolean, default: false },
    glowMode: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
  },
  data: () => ({
    dialog: false,

    busy_check: null,
    valid_mails: [],

    count: 1,
    emails: [""],
    names: [""],
    busy: false,

    max_h: "30vh",
  }),
  computed: {
    referral() {
      return this.USER().referral;
    },
    referral_url() {
      return window.URLS.MainServiceUrl() + `?ref=${this.referral.code}`;
    },
  },

  methods: {
    showDialog() {
      this.count = 1;
      this.emails = [""];
      this.names = [""];
      this.dialog = true;
    },

    addNew() {
      this.count++;
      this.emails.push("");
      this.names.push("");
    },

    checkEmailToInvite(index, email) {
      if (!email || !GlobalRules.ValidateEmail(email)) return;

      // Previously verified:
      if (this.valid_mails.includes(email)) return;

      this.busy_check = index;

      axios
        .get(window.API.GET_REFERRAL_INVITE_CHECK_EMAIL(), {
          params: {
            email: email,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.valid_mails.push(data.email);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_check = null;
        });
    },

    sendInvites() {
      this.busy = true;

      const invites = [];
      for (let i = 0; i < this.emails.length; i++) {
        const email = this.emails[i];
        const name = this.names[i];

        if (email && GlobalRules.ValidateEmail(email)) {
          invites.push({ name: name, email: email });
        }
      }

      axios
        .post(window.API.POST_REFERRAL_INVITES(), {
          shop_id: this.$route.params.shop_id,
          invites: invites,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Your invites has been sent.",
            );

            this.resetToDefault(); // 🞇 Reset to default
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

    onScroll: throttle(function (e) {
      const has_scroll = e.target.scrollHeight > e.target.clientHeight;
      // console.log(has_scroll)
      if (!has_scroll) return;
      this.max_h = e.target.scrollTop > 0 ? "15vh" : "30vh";
    }, 1000),
  },
};
</script>

<style lang="scss" scoped>
.s--invite-friends-modern {
  padding: 0;
  border: 0;
  .sd-modern-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 16px;
    padding: 20px 24px;
    margin: 0;
    border-block-end: 1px solid var(--sd-modern-border);
    white-space: normal;
    overflow: visible;
  }
  .sd-modern-title > div {
    min-width: 0;
  }
  &__header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__intro-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }
  > .v-card-text {
    padding: 24px;
  }
  > .v-card-actions {
    padding: 8px 24px 16px;
  }
  &__person {
    margin-inline: -4px;
  }
  &__form-actions {
    margin-block: 4px 20px;
  }
  &__disclosures {
    margin-block: 0;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__disclosures :deep(.v-expansion-panel) {
    background: transparent;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__disclosures :deep(.v-expansion-panel-title) {
    min-height: 52px;
    padding-inline: 0;
    font-size: 14px;
    font-weight: 500;
  }
  &__disclosures :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 0 20px;
  }
  &__report {
    font-size: 13px;
    line-height: 1.6;
  }
  &__report .v-col {
    overflow-wrap: anywhere;
  }
  @media (max-width: 600px) {
    .sd-modern-header,
    > .v-card-text {
      padding: 16px;
    }
    > .v-card-actions {
      padding: 8px 16px 16px;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

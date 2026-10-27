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
    <slot v-if="!embedded" name="activator" :open="showDialog">
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

    <component
      :is="embedded ? 'div' : 'VBottomSheet'"
      v-bind="
        embedded
          ? {}
          : {
              modelValue: dialog,
              'aria-label': modern
                ? $t('admin_shop.dashboard.modern.invite_friends')
                : undefined,
              fullscreen: $vuetify.display.smAndDown,
              contentClass: 'rounded-t-xl',
              maxWidth: 860,
              width: '99vw',
              scrollable: modern,
            }
      "
      @update:model-value="dialog = $event"
    >
      <v-card
        :class="
          modern
            ? 's--invite-friends-modern sd-modern-widget text-start'
            : 'rounded-t-xl'
        "
        :data-embedded="embedded || undefined"
        :max-height="
          modern && !embedded && !$vuetify.display.smAndDown
            ? '92dvh'
            : undefined
        "
      >
        <v-card-title v-if="modern" class="sd-modern-header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon>share</v-icon></span
            >
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("invite_friends.form_title") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{ $t("invite_friends.form_subtitle") }}
              </p>
            </div>
          </div>
          <div class="s--invite-friends-modern__header-actions">
            <v-btn
              v-if="!embedded"
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
              @click="close()"
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
          <h2 v-if="!modern" class="text-h4 my-3 text-start">
            {{ $t("invite_friends.title") }}
          </h2>
          <p v-if="!modern" class="typo-body my-3 text-start">
            {{ $t("invite_friends.msg") }}
          </p>

          <div v-if="modern" class="s--invite-friends-modern__intro">
            <p class="s--invite-friends-modern__sender">
              <v-avatar size="28">
                <v-img :src="getUserAvatar(USER_ID(), 'big')">
                  <template #error><v-icon size="20">person</v-icon></template>
                </v-img>
              </v-avatar>
              {{ $t("invite_friends.from", { name: USER().name }) }}
            </p>
            <p>{{ $t("invite_friends.form_help") }}</p>
          </div>

          <v-form @submit.prevent="sendInvites()">
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
                      modern ? $t('invite_friends.email_label') : undefined
                    "
                    :rules="[GlobalRules.email()]"
                    :variant="
                      !modern && emails[i] && valid_mails.includes(emails[i])
                        ? 'text'
                        : 'outlined'
                    "
                    class="english-field"
                    type="email"
                    autocomplete="off"
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
                    autocomplete="off"
                    :class="{
                      'font-weight-bold': !modern && emails[i] && names[i],
                    }"
                    :color="modern ? 'primary' : names[i] ? 'success' : 'amber'"
                    :hide-details="emails[i] && valid_mails.includes(emails[i])"
                    :placeholder="$t('global.placeholders.friend_name')"
                    :label="
                      modern ? $t('invite_friends.name_label') : undefined
                    "
                    :prepend-inner-icon="
                      modern
                        ? 'person_outline'
                        : names[i]
                          ? 'insert_emoticon'
                          : 'sentiment_satisfied'
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
                    :disabled="busy"
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
                    :disabled="!has_invites || has_invalid_invites"
                    :class="{ 'sd-modern-button': modern }"
                    color="primary"
                    size="x-large"
                    type="submit"
                    v-tooltip="$t('global.actions.send_invites')"
                  >
                    <v-icon start>send</v-icon>
                    {{ $t("global.actions.send_invites") }}
                  </v-btn>
                </div>
              </div>
            </v-container>
          </v-form>

          <p v-if="modern" class="s--invite-friends-modern__delivery-note">
            {{ $t("invite_friends.delivery_note") }}
          </p>
          <p
            v-if="submission_message"
            role="status"
            class="s--invite-friends-modern__submission"
          >
            <v-icon size="18" aria-hidden="true">info_outline</v-icon>
            {{ submission_message }}
          </p>

          <v-expansion-panels
            :class="modern ? 's--invite-friends-modern__disclosures' : 'my-6'"
            :variant="modern ? 'accordion' : 'default'"
            :flat="modern"
          >
            <v-expansion-panel v-if="modern" rounded="0">
              <v-expansion-panel-title>
                <span
                  ><v-icon class="me-2" size="20">card_giftcard</v-icon
                  >{{ $t("invite_friends.benefits") }}</span
                >
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <p class="s--invite-friends-modern__benefits">
                  {{ $t("invite_friends.msg") }}
                </p>
              </v-expansion-panel-text>
            </v-expansion-panel>
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

        <v-card-actions v-if="!embedded">
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
              @click="close()"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </component>
  </div>
</template>

<script lang="ts">
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules";
import UButtonShareGroup from "../../../ui/button/share/group/UButtonShareGroup.vue";
import { throttle } from "lodash-es";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { VBottomSheet } from "vuetify/components";

export default {
  name: "SInviteFriends",
  mixins: [DateMixin],
  components: { UButtonShareGroup, VBottomSheet },
  emits: ["update:dialog", "close"],
  props: {
    modern: { type: Boolean, default: false },
    embedded: { type: Boolean, default: false },
    glowMode: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
  },
  data: () => ({
    dialog: false,

    busy_check: null,
    email_check_controller: null,
    valid_mails: [],

    count: 1,
    emails: [""],
    names: [""],
    busy: false,
    submission_message: "",

    max_h: "30vh",
  }),
  computed: {
    referral() {
      return this.USER().referral;
    },
    referral_url() {
      return window.URLS.MainServiceUrl() + `?ref=${this.referral.code}`;
    },
    has_invites() {
      return this.emails.some(
        (email) => email && GlobalRules.ValidateEmail(email),
      );
    },
    has_invalid_invites() {
      return this.emails.some(
        (email) => email && !GlobalRules.ValidateEmail(email),
      );
    },
  },

  beforeUnmount() {
    this.email_check_controller?.abort();
  },

  methods: {
    close() {
      this.email_check_controller?.abort();
      this.dialog = false;
      this.$emit("close");
    },
    showDialog() {
      this.email_check_controller?.abort();
      this.count = 1;
      this.emails = [""];
      this.names = [""];
      this.valid_mails = [];
      this.submission_message = "";
      this.dialog = true;
    },

    addNew() {
      if (this.count >= 6 || this.busy) return;
      this.count++;
      this.emails.push("");
      this.names.push("");
    },

    checkEmailToInvite(index, email) {
      if (!email || !GlobalRules.ValidateEmail(email)) return;

      // Previously verified:
      if (this.valid_mails.includes(email)) return;

      this.email_check_controller?.abort();
      const controller = new AbortController();
      this.email_check_controller = controller;
      this.busy_check = index;

      return axios
        .get(window.API.GET_REFERRAL_INVITE_CHECK_EMAIL(), {
          signal: controller.signal,
          params: {
            email: email,
          },
        })
        .then(({ data }) => {
          if (controller.signal.aborted || this.emails[index] !== email) return;
          if (!data.error) {
            this.valid_mails.push(data.email);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.email_check_controller === controller) {
            this.busy_check = null;
            this.email_check_controller = null;
          }
        });
    },

    sendInvites() {
      if (this.busy || !this.has_invites || this.has_invalid_invites) return;
      this.busy = true;
      this.submission_message = "";

      const invites = [];
      for (let i = 0; i < this.emails.length; i++) {
        const email = this.emails[i];
        const name = this.names[i];

        if (email && GlobalRules.ValidateEmail(email)) {
          invites.push({ name: name, email: email });
        }
      }

      return axios
        .post(window.API.POST_REFERRAL_INVITES(), {
          shop_id: this.$route.params.shop_id,
          invites: invites,
        })
        .then(({ data }) => {
          if (!data.error) {
            if (data.count > 0) {
              NotificationService.showSuccessAlert(
                null,
                this.$t("invite_friends.submitted", { count: data.count }),
              );
            }
            if (data.count === invites.length) {
              this.email_check_controller?.abort();
              this.resetToDefault(); // 🞇 Reset to default
            }
            this.submission_message = this.$t(
              data.count === 0
                ? "invite_friends.none_submitted"
                : data.count < invites.length
                  ? "invite_friends.partly_submitted"
                  : "invite_friends.submitted",
              { count: data.count },
            );
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
  min-width: 0;
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
  .sd-modern-title-text {
    font-size: 24px;
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.35px;
  }
  &__intro {
    margin-block-end: 20px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 1.7;
    p {
      margin: 0;
    }
    p + p {
      margin-block-start: 12px;
    }
  }
  &__sender {
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgb(var(--v-theme-on-surface));
    overflow-wrap: anywhere;
  }
  &__delivery-note,
  &__benefits {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.7;
  }
  &__delivery-note {
    margin-block: 0 20px;
  }
  &__submission {
    display: flex;
    align-items: start;
    gap: 8px;
    margin-block: 0 20px;
    padding: 12px;
    border-radius: 10px;
    color: rgb(var(--v-theme-on-surface));
    background: var(--sd-modern-inset);
    font-size: 13px;
    line-height: 1.6;
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
  :deep(.v-input--error .v-messages) {
    color: rgb(var(--v-theme-on-surface));
  }
  &__form-actions {
    justify-content: space-between;
    gap: 12px;
    margin-block: 4px 12px;
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
  &[data-embedded] {
    overflow: visible;
    .sd-modern-header {
      padding: 0;
      margin-block-end: 20px;
      border: 0;
    }
    > .v-card-text {
      padding: 0;
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

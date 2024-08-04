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
    <v-btn
      :size="large ? 'x-large' : 'small'"
      color="#C2185B"
      target="_blank"
      @click="showDialog"
    >
      <v-icon class="me-1">share</v-icon>
      {{ $t("global.actions.invite") }} + 🎁
    </v-btn>

    <v-bottom-sheet
      v-model="dialog"
      :fullscreen="$vuetify.display.smAndDown"
      content-class="rounded-t-xl"
      max-width="860"
      width="99vw"
    >
      <v-card class="rounded-t-xl">
        <v-img
          :src="require('./assets/selldone-invite-landscape.webp')"
          width="100%"
          max-height="380"
          cover
          :aspect-ratio="1792/1024"
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
          <h2 class="text-h4 my-3 text-start">
            {{ $t("invite_friends.title") }}
          </h2>
          <p class="typo-body my-3 text-start">
            {{ $t("invite_friends.msg") }}
          </p>

          <v-container>
            <!-- Emails list -->

            <v-row
              v-for="i in count"
              :key="i"
              :class="{
                'shadow-paper py-3':
                  emails[i] && valid_mails.includes(emails[i]),
              }"
              class="mt-1 mb-3 rounded-28px"
              dense
              justify="space-around"
            >
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="emails[i]"
                  :hide-details="emails[i] && valid_mails.includes(emails[i])"
                  :loading="busy_check === i"
                  :placeholder="$t('global.placeholders.friend_email')"
                  :rules="[GlobalRules.email()]"
                  :variant="
                    emails[i] && valid_mails.includes(emails[i])
                      ? 'text'
                      : 'outlined'
                  "
                  class="english-field"
                  clearable
                  color="blue"
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
              <v-col cols="12" sm="5">
                <v-text-field
                  v-model="names[i]"
                  :class="{ 'font-weight-bold': emails[i] && names[i] }"
                  :color="names[i] ? 'success' : 'amber'"
                  :hide-details="emails[i] && valid_mails.includes(emails[i])"
                  :placeholder="$t('global.placeholders.friend_name')"
                  :prepend-inner-icon="
                    names[i] ? 'insert_emoticon' : 'sentiment_satisfied'
                  "
                  :variant="
                    emails[i] && valid_mails.includes(emails[i])
                      ? 'text'
                      : 'outlined'
                  "
                >
                </v-text-field>
              </v-col>
            </v-row>

            <!-- Add button -->
            <div v-if="count <= 5" class="widget-buttons">
              <v-btn
                class="tnt"
                color="primary"
                size="x-large"
                variant="text"
                @click="addNew"
              >
                <v-icon start>add</v-icon>
                {{ $t("global.actions.add_more") }}
              </v-btn>
            </div>
            <!-- Send button -->

            <div class="widget-buttons">
              <v-btn
                :loading="busy"
                color="primary"
                size="x-large"
                @click="sendInvites()"
              >
                <v-icon start>send</v-icon>
                {{ $t("global.actions.send_invites") }}
              </v-btn>
            </div>
          </v-container>

          <v-expansion-panels class="my-6">
            <v-expansion-panel rounded="xl">
              <v-expansion-panel-title>
                <div>
                  <v-icon class="me-2" color="#111">share</v-icon>
                  Other Share Options
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Copy link -->
                <v-text-field
                  :label="$t('selldone_referral_page.referral_link')"
                  :model-value="referral_url"
                  append-inner-icon="content_copy"
                  class="my-3 english-field dashed-field max-width-field-large mx-auto"
                  color="success"
                  hide-details
                  prepend-inner-icon="link"
                  readonly
                  variant="plain"
                  @click:append-inner="copyToClipboard(referral_url)"
                >
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

            <v-expansion-panel rounded="xl">
              <v-expansion-panel-title>
                <div>
                  <v-icon class="me-2" color="#111">trending_up</v-icon>
                  My Invitation Report
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Report -->
                <v-row>
                  <v-col cols="4">
                    <small class="d-block">{{
                      $t("selldone_referral_page.registered")
                    }}</small>
                    <b>{{ referral.registered }}</b>
                  </v-col>
                  <v-col cols="4">
                    <small class="d-block">{{
                      $t("selldone_referral_page.accepted")
                    }}</small>
                    <b>{{ referral.accepted }}</b>
                  </v-col>
                  <v-col :title="$t('global.commons.updated_at')" cols="4">
                    <b>{{ getFromNowString(referral.updated_at) }}</b
                    ><br />
                    <small>{{ getLocalTimeString(referral.updated_at) }}</small>
                  </v-col>
                </v-row>

                <div class="widget-buttons">
                  <v-btn
                    :to="{ name: 'OPageMonetizeReferral' }"
                    color="primary"
                    size="x-large"
                    variant="text"
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
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules";
import UButtonShareGroup from "../../../ui/button/share/group/UButtonShareGroup.vue";
import _ from "lodash-es";

export default {
  name: "SInviteFriends",
  components: { UButtonShareGroup },
  emits: ["update:dialog"],
  props: {
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showSuccessAlert(null, "Your invites has been sent.");

            this.resetToDefault(); // 🞇 Reset to default
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

    onScroll: _.throttle(function (e) {
      const has_scroll = e.target.scrollHeight > e.target.clientHeight;
      // console.log(has_scroll)
      if (!has_scroll) return;
      this.max_h = e.target.scrollTop > 0 ? "15vh" : "30vh";
    }, 1000),
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

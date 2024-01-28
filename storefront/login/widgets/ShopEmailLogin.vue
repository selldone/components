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
    <v-btn
      depressed
      block
      class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt"
      @mouseenter="tick()"
      @click="show()"
      large

    >
      <v-avatar size="32" class="float-start ms-n2" color="#fff"
        ><v-icon>alternate_email</v-icon></v-avatar
      >
      <span class="flex-grow-1">{{ $t("global.need_login.login_email") }}</span>
    </v-btn>

    <!-- ██████████████████████ Dialog ██████████████████████ -->

    <v-dialog v-model="dialog" max-width="640">
      <v-card>
        <v-card-title
          ><v-icon class="me-1" color="#333">account_circle</v-icon>
          {{ $t("global.need_login.title") }}
        </v-card-title>
        <v-card-text class="text-start">
          <template v-if="step === 1">
            <p class="typo-body">
              {{ $t("global.need_login.email_login_step_1") }}
            </p>
            <v-text-field
              v-model="email"
              outlined
              :placeholder="$t('global.placeholders.email')"
              :rules="[GlobalRules.required(), GlobalRules.email()]"
              class="strong-field"
            ></v-text-field>
          </template>

          <template v-else-if="step === 2">
            <p class="typo-body">
              {{ $t("global.need_login.email_login_step_2") }}
            </p>
            <div class="text-h4 font-weight-thin text-center py-3">
              {{ email }}
            </div>
          </template>

          <template v-else-if="step === 3">
            <p class="typo-body">
              {{ $t("global.need_login.email_login_step_3") }}
            </p>
            <v-otp-input
              v-model="otp"
              length="8"
              @finish="confirmOtp()"
              type="number"
              class="strong-field"
            ></v-otp-input>
          </template>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn v-if="step === 2" x-large @click="step = 1" text>
              <v-icon left>{{ $t("icons.chevron_back") }}</v-icon>
              {{ $t("global.actions.back") }}</v-btn
            >

            <v-btn v-else x-large @click="dialog = false" text>
              <v-icon left>close</v-icon>
              {{ $t("global.actions.close") }}</v-btn
            >

            <v-btn
              x-large
              v-if="step === 1"
              @click="step = 2"
              :loading="busy"
              color="primary"
              :class="{ disabled: !is_valid_email }"
              >{{ $t("global.actions.next") }}
              <v-icon right>{{ $t("icons.chevron_next") }}</v-icon></v-btn
            >
            <v-btn
              x-large
              v-else-if="step === 2"
              @click="sendEmail()"
              :loading="busy"
              color="primary"
              ><v-icon left>check</v-icon> {{ $t("global.actions.yes") }}</v-btn
            >

            <v-btn
              x-large
              v-else-if="step === 3"
              @click="confirmOtp()"
              :loading="busy"
              color="primary"
              :class="{ disabled: !is_valid_otp }"
              ><v-icon left>check</v-icon>
              {{ $t("global.actions.confirm") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { SoundHelper } from "@core/helper/sound/SoundHelper";
import GlobalRules from "@core/helper/rules/GlobalRules";

export default {
  name: "ShopEmailLogin",

  props: {
    shop: {
      required: true,
      type: Object,
    },

    source: {
      default: "customer",
    },
  },
  data: () => ({
    dialog: false,

    email: null,
    otp: null,

    step: 1,

    busy: false,
  }),

  computed: {
    is_valid_email() {
      return GlobalRules.ValidateEmail(this.email);
    },
    is_valid_otp() {
      return this.otp?.length >= 8;
    },
  },

  methods: {
    tick() {
      SoundHelper.playTick(0.1);
    },
    show() {
      this.$emit("close"); // Close login dialog
      this.step = 1;
      this.email = null;
      this.otp = null;

      this.dialog = true;
    },

    sendEmail() {
      this.busy = true;

      axios
        .post(window.XAPI.POST_SHOP_LOGIN_EMAIL_REQUEST(this.shop.name), {
          email: this.email,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.step = 3;
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

    confirmOtp() {
      this.busy = true;

      axios
        .post(window.XAPI.POST_SHOP_LOGIN_EMAIL_VERIFY(this.shop.name), {
          email: this.email,
          verification_code: this.otp,
          source: this.source,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.dialog = false;

            this.$emit("login", {
              token: data.token,
              expires_in: data.expires_in,
            }); //  🚀 🚀 🚀 LOGIN  🚀 🚀 🚀
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
  },
};
</script>

<style scoped></style>

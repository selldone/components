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
  <v-btn
    v-bind="$attrs"
    block
    class="my-2 fadeIn delay_100 d-flex align-items-center tnt s--button-flex border"
    rounded
    size="large"
    variant="flat"
    @click.stop="show()"
    @mouseenter="tick()"
  >
    <template v-slot:prepend>
      <v-avatar class="float-start ms-n2" color="#fff" size="32">
        <v-icon>alternate_email</v-icon>
      </v-avatar>
    </template>
    <span>{{ $t("global.need_login.login_email") }}</span>
  </v-btn>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-bottom-sheet v-model="dialog" max-width="680" content-class="rounded-t-xl">
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        <v-icon class="me-1">account_circle</v-icon>
        {{ $t("global.need_login.title") }}
      </v-card-title>
      <v-card-text class="text-start">
        <template v-if="step === 1">
          <p class="typo-body">
            {{ $t("global.need_login.email_login_step_1") }}
          </p>
          <v-text-field
            v-model="email"
            :placeholder="$t('global.placeholders.email')"
            :rules="[GlobalRules.required(), GlobalRules.email()]"
            class="strong-field my-5"
            variant="outlined"
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
            class="strong-field"
            length="8"
            type="number"
            @finish="confirmOtp()"
          ></v-otp-input>
        </template>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            v-if="step === 2"
            size="x-large"
            variant="text"
            @click="step = 1"
          >
            <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>
            {{ $t("global.actions.back") }}
          </v-btn>

          <v-btn v-else size="x-large" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            v-if="step === 1"
            :class="{ disabled: !is_valid_email }"
            :loading="busy"
            color="primary"
            variant="elevated"
            size="x-large"
            @click="step = 2"
            >{{ $t("global.actions.next") }}
            <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
          <v-btn
            v-else-if="step === 2"
            :loading="busy"
            color="primary"
            variant="elevated"
            size="x-large"
            @click="sendEmail()"
          >
            <v-icon start>check</v-icon>
            {{ $t("global.actions.yes") }}
          </v-btn>

          <v-btn
            v-else-if="step === 3"
            :class="{ disabled: !is_valid_otp }"
            :loading="busy"
            color="primary"
            variant="elevated"
            size="x-large"
            @click="confirmOtp()"
          >
            <v-icon start>check</v-icon>
            {{ $t("global.actions.confirm") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
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
    otp: '',

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
  watch: {

  },

  methods: {
    tick() {
      SoundHelper.playTick(0.1);
    },
    show() {
      this.step = 1;
      this.email = null;
      this.otp = '';

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

            this.$emit("close"); // Close login dialog

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

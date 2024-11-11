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
    block
    class="my-2 fadeIn delay_100 d-flex align-items-center tnt s--button-flex border"
    rounded
    size="large"
    v-bind="$attrs"
    variant="flat"
    @mouseenter="tick()"
    @click.stop="show()"
  >
    <template v-slot:prepend>
      <v-avatar class="float-start ms-n2" color="#fff" size="32">
        <v-icon>alternate_email</v-icon>
      </v-avatar>
    </template>
    <div class="d-flex flex-column">
      <span>{{ $t("global.need_login.login_email") }}</span>
      <small v-if="predefine_email" class="mt-1">
        <v-icon class="me-1" size="small">lock</v-icon>
        {{ predefine_email }}</small
      >
    </div>
  </v-btn>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-bottom-sheet
    v-model="dialog"
    content-class="rounded-t-xl"
    max-width="680"
    :persistent="step === 3"
  >
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
            placeholder="john@gmail.com"
            :rules="[GlobalRules.required(), GlobalRules.email()]"
            class="strong-field my-5 english-field"
            dir="ltr"
            variant="outlined"
            :readonly="predefine_email"
            :append-inner-icon="predefine_email ? 'lock' : undefined"
          ></v-text-field>
        </template>

        <template v-else-if="step === 2">
          <p class="typo-body">
            {{ $t("global.need_login.email_login_step_2") }}
          </p>
          <div class="text-h4 font-weight-thin text-center py-3">
            {{ email }}
          </div>

          <v-expand-transition>
            <div v-if="error_message_send_code" class="text-red text-start">
              <div class="py-3" v-html="error_message_send_code"></div>
            </div>
          </v-expand-transition>
        </template>

        <template v-else-if="step === 3">
          <p class="typo-body">
            {{ $t("global.need_login.email_login_step_3") }}
          </p>
          <v-otp-input
            v-model="otp"
            class="strong-field max-w-400 mx-auto"
            dir="ltr"
            length="6"
            min-width="90%"
            type="number"
            @finish="verifyOTP()"
          ></v-otp-input>

          <v-expand-transition>
            <div v-if="error_message_otp_check" class="text-red text-start">
              <div class="py-3" v-html="error_message_otp_check"></div>
            </div>
          </v-expand-transition>
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
            size="x-large"
            variant="elevated"
            @click="step = 2"
            >{{ $t("global.actions.next") }}
            <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
          <v-btn
            v-else-if="step === 2"
            :loading="busy"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="requestOTP()"
          >
            <v-icon start>check</v-icon>
            {{ $t("global.actions.yes") }}
          </v-btn>

          <v-btn
            v-else-if="step === 3"
            :class="{ disabled: !is_valid_otp }"
            :loading="busy"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="verifyOTP()"
          >
            <v-icon start>check</v-icon>
            {{ $t("global.actions.confirm") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { SoundHelper } from "@selldone/core-js/helper/sound/SoundHelper";
import GlobalRules from "@selldone/core-js/helper/rules/GlobalRules";

export default {
  name: "ShopEmailLogin",
  inject: ["$shop"],
  props: {

    source: {
      default: "customer",
    },
  },
  data: () => ({
    dialog: false,

    email: null,
    otp: "",

    error_message_send_code: null,
    error_message_otp_check: null,

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
    predefine_email() {
      return this.$route.query.email;
    },
  },
  watch: {},
  created() {},

  methods: {
    tick() {
      SoundHelper.playTick(0.1);
    },
    show() {
      this.step = 1;
      this.email = this.predefine_email;
      this.otp = "";

      this.dialog = true;
    },

    requestOTP() {
      this.busy = true;
      this.error_message_send_code = null;

      window.$storefront.auth.email
        .requestOtp(this.email)
        .then(({ success }) => {
          this.step = 3;
        })
        .catch((error) => {
          if (error.error_msg) this.error_message_send_code = error.error_msg;

          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },

    verifyOTP() {
      this.busy = true;
      this.error_message_otp_check = null;

      window.$storefront.auth.email
        .verifyOTP(this.email, this.otp, this.source)
        .then(({ token, expires_in }) => {
          this.dialog = false;

          this.$emit("login", {
            token: token,
            expires_in: expires_in,
          }); //  🚀 🚀 🚀 LOGIN  🚀 🚀 🚀

          this.$emit("close"); // Close login dialog
        })
        .catch((error) => {
          if (error.error_msg) this.error_message_otp_check = error.error_msg;

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

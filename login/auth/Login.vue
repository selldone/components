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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    :class="{
      'min-height-80vh': !inlineMode,
      '-right': !inlineMode && !LOGIN_POPUP_LOGIN,
      'my-6': inlineMode,
      disabled: !!busy_redirect || !!window.auth_user,
    }"
    class="login-form-container"
  >
    <div v-if="!inlineMode" style="min-height: 120px"></div>

    <!-- Top app icons selldone <-> shop icon -->
    <div
      v-if="LOGIN_POPUP_LOGIN"
      class="d-flex align-center justify-center mb-n10 z1"
    >
      <div
        class="bg-white rounded-28px flex-grow-0 pa-2"
        style="box-shadow: 0px -15px 15px -12px rgba(113, 112, 112, 0.2)"
      >
        <v-img
          :src="require('@components/assets/selldone-logo/app-icon.png')"
          width="84"
          height="84"
          class="rounded-28px"
        >
        </v-img>
      </div>

      <template v-if="APP_IMAGE">
        <img src="../../assets/icons/wire.svg" width="16" class="mx-3" />

        <div
          class="bg-white rounded-28px flex-grow-0 pa-2"
          style="box-shadow: 0px -15px 15px -12px rgba(113, 112, 112, 0.2)"
        >
          <v-img :src="APP_IMAGE" width="84" height="84" class="rounded-28px">
          </v-img>
        </div>
      </template>
    </div>

    <!-- Main login form -->
    <div class="login-form" :class="{ 'shadow-paper': !flat, dark: dark }">
      <template v-if="!noHeader">
        <div class="header-place"></div>

        <v-img
          :src="`/images/weekly-reports/${weeksIntoYear}.jpg`"
          width="100%"
          height="190"
          class="-header-img"
        />
      </template>

      <v-expand-transition>
        <!------------------------------ Register ------------------------------>

        <div key="register" v-if="mode === 'register'">
          <div class="text-start mt-3">
            <h3 v-html="$t('login.register_title')" class="mb-2"></h3>
            <p v-html="$t('login.register_subtitle')" class="mb-6"></p>
          </div>

          <v-expansion-panels flat hover class="rounded-xl">
            <v-expansion-panel>
              <v-expansion-panel-header class="rounded-xl text-uppercase">
                <v-icon class="flex-grow-0 me-2">admin_panel_settings</v-icon>
                {{ $t("login.create_your_account") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content
                eager
                class="no-x-padding-expansion-panel pt-2"
              >
                <v-text-field
                  autocomplete="name"
                  v-model="register_name"
                  flat
                  dense
                  :label="$t('login.name_placeholder')"
                  :placeholder="$t('global.placeholders.name')"
                ></v-text-field>
                <v-text-field
                  autocomplete="username"
                  v-model="register_username"
                  dense
                  :label="$t('login.email_placeholder')"
                  :placeholder="$t('global.placeholders.email')"
                  class="english-field"
                  :rules="[GlobalRules.email()]"
                ></v-text-field>
                <v-text-field
                  autocomplete="new-password"
                  v-model="register_password"
                  dense
                  :label="$t('login.password_placeholder')"
                  class="english-field"
                  :append-icon="
                    register_Password_show ? 'visibility' : 'visibility_off'
                  "
                  :type="register_Password_show ? 'text' : 'password'"
                  @click:append="
                    register_Password_show = !register_Password_show
                  "
                ></v-text-field>
                <v-text-field
                  autocomplete="new-password"
                  v-model="register_password_re"
                  dense
                  :label="$t('login.re_password_placeholder')"
                  class="english-field"
                  :append-icon="
                    register_Password_2_show ? 'visibility' : 'visibility_off'
                  "
                  :type="register_Password_2_show ? 'text' : 'password'"
                  @click:append="
                    register_Password_2_show = !register_Password_2_show
                  "
                ></v-text-field>

                <ul class="mt-2 mb-0">
                  <li>
                    <small :class="validPasswordLength ? 'text-success' : ''"
                      ><i class="fas fa-check-circle me-2" />
                      {{ $t("login.password_8_chars") }}
                    </small>
                  </li>
                  <li>
                    <small :class="validPasswordSecurity ? 'text-success' : ''"
                      ><i class="fas fa-check-circle me-2" />
                      {{ $t("login.password_upercase_number") }}
                    </small>
                  </li>
                  <li>
                    <small :class="validPasswordMatch ? 'text-success' : ''"
                      ><i class="fas fa-check-circle me-2" />
                      {{ $t("login.password_confirm") }}
                    </small>
                  </li>
                </ul>

                <v-checkbox
                  v-model="accept_terms"
                  color="green"
                  class="small-label"
                >
                  <template v-slot:label>
                    <span
                      @click="fetchTerms"
                      v-html="$t('login.privacy_agreement')"
                      class="text-start success-links"
                    ></span>
                  </template>
                </v-checkbox>

                <v-alert
                  :value="!!errorMessage_register"
                  color="#C2185B"
                  dark
                  dense
                  class="small"
                >
                  {{ errorMessage_register }}
                </v-alert>

                <v-btn
                  depressed
                  block
                  class="untransform"
                  color="primary"
                  dark
                  large
                  :rounded="rounded"
                  :class="{ disabled: !can_register }"
                  @click="register"
                  :loading="register_busy"
                >
                  <i
                    v-if="!recaptcha_response"
                    class="fa-solid fa-circle-notch fa-spin"
                  ></i>

                  <span class="ms-1">{{ $t("login.register_action") }}</span>
                </v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <p
            class="hr-text my-4"
            :class="{ '-black': dark }"
            :data-content="$t('global.commons.or')"
          ></p>

          <v-btn
            v-if="login_modes.includes('google')"
            @click="busy_redirect = 'google'"
            :loading="busy_redirect === 'google'"
            depressed
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center"
            href="/login/google"
            color="#0061e0"
            dark
            large
            :rounded="rounded"
          >
            <v-avatar size="28" class="float-start ms-n2" color="#ffffff"
              ><img
                class="pa-1"
                src="../../assets/tradmark/google.svg"
            /></v-avatar>
            <span class="flex-grow-1">{{ $t("login.register_google") }}</span>
          </v-btn>

          <v-btn
            v-if="login_modes.includes('apple')"
            @click="busy_redirect = 'apple'"
            :loading="busy_redirect === 'apple'"
            depressed
            block
            class="my-2 untransform fadeIn delay_200 d-flex align-items-center"
            href="/login/apple"
            color="#000"
            dark
            large
            :rounded="rounded"
          >
            <v-avatar size="28" class="float-start ms-n2" color="#111"
              ><img
                class="pa-1"
                src="../../assets/tradmark/apple.svg"
            /></v-avatar>
            <span class="flex-grow-1">{{ $t("login.register_apple") }}</span>
          </v-btn>

          <v-btn
            v-if="login_modes.includes('linkedin')"
            @click="busy_redirect = 'linkedin'"
            :loading="busy_redirect === 'linkedin'"
            :rounded="rounded"
            depressed
            large
            block
            class="my-2 untransform fadeIn delay_300 d-flex align-items-center"
            href="/login/linkedin"
          >
            <v-avatar size="28" class="float-start ms-n2" color="#fff"
              ><img
                class="pa-1"
                src="../../assets/tradmark/linkedin-circle.svg"
            /></v-avatar>
            <span class="flex-grow-1">{{ $t("login.register_linkedin") }}</span>
          </v-btn>

          <v-btn
            v-if="login_modes.includes('facebook')"
            @click="busy_redirect = 'facebook'"
            :loading="busy_redirect === 'facebook'"
            :rounded="rounded"
            depressed
            large
            block
            class="my-2 untransform fadeIn delay_400 d-flex align-items-center"
            href="/login/facebook"
          >
            <v-avatar size="28" class="float-start ms-n2" color="#fff"
              ><img
                class="pa-1"
                src="../../assets/tradmark/meta.png"
            /></v-avatar>
            <span class="flex-grow-1">{{ $t("login.register_facebook") }}</span>
          </v-btn>

          <v-btn
            v-if="login_modes.includes('github')"
            @click="busy_redirect = 'github'"
            :loading="busy_redirect === 'github'"
            depressed
            :rounded="rounded"
            large
            block
            class="my-2 untransform fadeIn delay_500 d-flex align-items-cente"
            href="/login/github"
          >
            <v-avatar size="28" class="float-start ms-n2" color="#fff"
              ><img
                class="pa-1"
                src="../../assets/tradmark/github.svg"
            /></v-avatar>
            <span class="flex-grow-1">{{ $t("login.register_github") }}</span>
          </v-btn>

          <template v-if="login_modes.includes('stripe') && !LOGIN_POPUP_LOGIN">
            <p
              class="hr-text my-4"
              :class="{ '-black': dark }"
              :data-content="$t('global.commons.or')"
            ></p>

            <v-btn
              @click="busy_redirect = 'stripe'"
              :loading="busy_redirect === 'stripe'"
              depressed
              block
              class="my-2 untransform fadeIn delay_100 d-flex align-items-center"
              href="/stripe/login"
              color="#635BFF"
              dark
              large
              :rounded="rounded"
            >
              <v-avatar size="28" class="float-start ms-n2" color="#fff"
                ><img
                  class="pa-1"
                  src="../../assets/tradmark/stripe-icon.png"
              /></v-avatar>
              <div class="flex-grow-1">
                {{ $t("login.continue_with") }}
                <img
                  src="../../assets/tradmark/stripe-white.svg"
                  height="24"
                />
                <small class="d-block white--text"
                  >+ {{ $t("login.auto_create_shop") }}</small
                >
              </div>
            </v-btn>
          </template>

          <!----- SMS Agreement ------>
          <v-expansion-panels :disabled="!window.sms_agreement" flat>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div class="line-height-normal">
                  <v-icon color="success" small class="me-1">check</v-icon>
                  <span v-html="$t('global.reed_agree_terms')"></span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div
                  class="text-justify mt-4 blue-links"
                  style="font-size: 12px; line-height: 1.5rem"
                  v-html="window.sms_agreement"
                ></div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <!----- Footer ------>

          <p class="mt-5 text-start fadeIn delay_500">
            <v-icon color="blue" small class="me-1">fiber_manual_record</v-icon>
            {{ $t("login.already_signup") }}

            <v-btn
              text
              @click="setMode('login')"
              class="untransform"
              color="primary"
            >
              {{ $t("login.login_action") }}</v-btn
            >
          </p>
        </div>

        <!------------------------------ Login ------------------------------>

        <div key="login" v-else>
          <v-btn
            large
            @click="setMode('register')"
            block
            class="m-2 untransform font-weight-black"
            text
            ><v-icon>{{ $t("icons.chevron_back") }}</v-icon>

            {{ $t("login.login_your_account") }}
          </v-btn>

          <!----- Login > Step 1 ------>

          <div v-if="!login_step2_mode" class="pt-2">
            <v-text-field
              autocomplete="username"
              type="email"
              v-model="login_username"
              name="email"
              :disabled="ValidateEmail($route.query.email)"
              dense
              :label="$t('login.email_or_username_placeholder')"
              class="english-field"
            ></v-text-field>
            <v-text-field
              autocomplete="current-password"
              v-model="login_password"
              name="password"
              dense
              :label="$t('login.password_placeholder')"
              class="english-field"
              :append-icon="
                login_Password_show ? 'visibility' : 'visibility_off'
              "
              :type="login_Password_show ? 'text' : 'password'"
              @click:append="login_Password_show = !login_Password_show"
              hide-details
            >
            </v-text-field>

            <div class="text-end">
              <v-btn
                text
                @click.stop="showResetPass"
                class="untransform"
                small
                color="primary"
              >
                {{ $t("login.forgot_password") }}
              </v-btn>
            </div>

            <v-alert
              color="#C2185B"
              dark
              dense
              :value="!!errorMessage"
              class="small"
            >
              {{ errorMessage }}
            </v-alert>

            <s-smart-toggle
              v-model="remember"
              color="primary"
              class="small-label"
              :true-title="$t('login.remember_me')"
            >
            </s-smart-toggle>

            <v-btn
              depressed
              large
              :rounded="rounded"
              block
              class="my-2 untransform"
              color="primary"
              dark
              :loading="login_busy"
              :class="{ disabled: !can_login }"
              @click="login"
            >
              <i
                v-if="!recaptcha_response"
                class="fa-solid fa-circle-notch fa-spin"
              ></i>
              <span class="ms-1">{{ $t("login.login_button") }}</span>
              <v-icon class="ms-2">login</v-icon>
            </v-btn>

            <p
              class="hr-text my-6"
              :class="{ '-black': dark }"
              :data-content="$t('global.commons.or')"
            ></p>

            <v-btn
              v-if="login_modes.includes('google')"
              @click="busy_redirect = 'google'"
              :loading="busy_redirect === 'google'"
              depressed
              :rounded="rounded"
              block
              class="my-2 untransform fadeIn delay_100 d-flex align-items-center"
              href="/login/google"
              color="#0061e0"
              dark
              large
            >
              <v-avatar size="28" class="float-start ms-n2" color="#ffffff"
                ><img
                  class="pa-1"
                  src="../../assets/tradmark/google.svg"
              /></v-avatar>
              <span class="flex-grow-1">{{ $t("login.login_google") }}</span>
            </v-btn>

            <v-btn
              v-if="login_modes.includes('apple')"
              @click="busy_redirect = 'apple'"
              :loading="busy_redirect === 'apple'"
              depressed
              block
              class="my-2 untransform fadeIn delay_200 d-flex align-items-center"
              href="/login/apple"
              color="#000"
              dark
              large
              :rounded="rounded"
            >
              <v-avatar size="28" class="float-start ms-n2" color="#111"
                ><img
                  class="pa-1"
                  src="../../assets/tradmark/apple.svg"
              /></v-avatar>
              <span class="flex-grow-1">{{ $t("login.register_apple") }}</span>
            </v-btn>

            <v-btn
              v-if="login_modes.includes('linkedin')"
              @click="busy_redirect = 'linkedin'"
              :loading="busy_redirect === 'linkedin'"
              depressed
              large
              :rounded="rounded"
              block
              class="my-2 untransform fadeIn delay_300"
              href="/login/linkedin"
            >
              <v-avatar size="28" class="float-start ms-n2" color="#fff"
                ><img
                  class="pa-1"
                  src="../../assets/tradmark/linkedin-circle.svg"
              /></v-avatar>
              <span class="flex-grow-1">{{ $t("login.login_linkedin") }}</span>
            </v-btn>

            <v-btn
              v-if="login_modes.includes('facebook')"
              @click="busy_redirect = 'facebook'"
              :loading="busy_redirect === 'facebook'"
              depressed
              large
              :rounded="rounded"
              block
              class="my-2 untransform fadeIn delay_400"
              href="/login/facebook"
            >
              <v-avatar size="28" class="float-start ms-n2" color="#fff"
                ><img
                  class="pa-1"
                  src="../../assets/tradmark/meta.png"
              /></v-avatar>
              <span class="flex-grow-1">{{ $t("login.login_facebook") }}</span>
            </v-btn>

            <v-btn
              v-if="login_modes.includes('github')"
              @click="busy_redirect = 'github'"
              :loading="busy_redirect === 'github'"
              depressed
              large
              :rounded="rounded"
              block
              class="my-2 untransform fadeIn delay_500"
              href="/login/github"
            >
              <v-avatar size="28" class="float-start ms-n2" color="#fff"
                ><img
                  class="pa-1"
                  src="../../assets/tradmark/github.svg"
              /></v-avatar>
              <span class="flex-grow-1">{{ $t("login.login_github") }}</span>
            </v-btn>

            <template
              v-if="login_modes.includes('stripe') && !LOGIN_POPUP_LOGIN"
            >
              <p
                class="hr-text my-4"
                :class="{ '-black': dark }"
                :data-content="$t('global.commons.or')"
              ></p>

              <v-btn
                @click="busy_redirect = 'stripe'"
                :loading="busy_redirect === 'stripe'"
                depressed
                block
                class="my-2 untransform fadeIn delay_100 d-flex align-items-center"
                href="/stripe/login"
                color="#635BFF"
                dark
                large
                :rounded="rounded"
              >
                <v-avatar size="28" class="float-start ms-n2" color="#fff"
                  ><img
                    class="pa-1"
                    src="../../assets/tradmark/stripe-icon.png"
                /></v-avatar>
                <div class="flex-grow-1">
                  {{ $t("login.continue_with") }}
                  <img
                    src="../../assets/tradmark/stripe-white.svg"
                    height="24"
                  />
                  <small class="d-block white--text"
                    >+ {{ $t("login.auto_create_shop") }}</small
                  >
                </div>
              </v-btn>
            </template>
          </div>

          <!----- Login > Step 2 (Optional) ------>

          <div v-else class="mt-2">
            <v-text-field
              v-model="login_step2_code"
              outlined
              dense
              label="Activation Code"
              placeholder="X X X X X X"
              persistent-placeholder
              class="m-2"
              hide-details
            ></v-text-field>

            <p class="text-start my-3 small">
              {{ $t("login.two_step_problem") }}

              <v-btn
                small
                text
                color="primary"
                class="tnt my-1"
                href="/security/reset"
              >
                {{ $t("login.two_step_problem_action") }}</v-btn
              >
            </p>

            <v-btn
              class="my-2"
              color="primary"
              :disabled="!login_step2_code"
              @click="loginStep2"
              :loading="busy_2fa"
            >
              {{ $t("login.two_step_confirm") }}
            </v-btn>
          </div>

          <!----- Footer ------>

          <p class="mt-5 text-start fadeIn delay_500">
            <v-icon color="green" small class="me-1"
              >fiber_manual_record</v-icon
            >

            {{ $t("login.new_in_samin") }}

            <v-btn
              text
              @click="setMode('register')"
              class="untransform"
              color="green"
            >
              {{ $t("login.signup_free") }}
            </v-btn>
          </p>
        </div>
      </v-expand-transition>

      <v-row
        no-gutters
        class="mt-5 small font-weight-bold pt-5"
        justify="space-around"
      >
        <a href="/privacy" target="_blank">Privacy Policy</a>
        <a href="/terms" target="_blank">Terms of Use</a>
      </v-row>
    </div>

    <div style="min-height: 42px">
      <v-chip
        pill
        small
        v-if="!recaptcha_response"
        color="#0097A7"
        dark
        class="m-2"
        >{{ $t("login.checking_robot_message") }}
      </v-chip>
    </div>
    <div v-if="!inlineMode" style="min-height: 120px"></div>

    <!-- ███████████████████ Reset password dialog ███████████████████ -->

    <v-bottom-sheet v-model="reset_password_dialog" inset max-width="640px">
      <v-card class="text-start">
        <v-card-title>
          <v-icon class="me-1">password</v-icon>
          {{ $t("login.password_recovery_title") }}
        </v-card-title>

        <v-card-subtitle class="subtitle-2 mt-2">
          {{ $t("login.password_recovery_message") }}
        </v-card-subtitle>

        <v-card-text>
          <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Phone Recovery ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

          <template v-if="recover_mode === 'phone'">
            <v-btn text color="primary" @click="recover_mode = null">
              <v-icon class="me-1" small>email</v-icon>

              {{ $t("global.actions.reset_by_mail") }}
            </v-btn>

            <vue-tel-input
              v-model="phone"
              @country-changed="(val) => (country = val)"
              enabledCountryCode
              :inputOptions="{
                placeholder: $t('global.need_login.mobile_input'),
              }"
              required
              validCharactersOnly
              class="stylish-phone-input my-3 max-width-field mx-auto zoomIn"
              :defaultCountry="defaultCountry"
            ></vue-tel-input>
          </template>

          <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Need set email (Registered by phone!) ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
          <template v-else-if="recover_mode === 'set-mail'">
            <p class="text-center">
              {{ $t("global.need_login.verification_code") }}
            </p>
            <v-otp-input
              v-model="in_code"
              :length="6"
              autofocus
              @finish="(val) => (in_code = val)"
              class="zoomIn max-width-field mx-auto text-center mb-12"
            />

            <v-text-field
              autocomplete="username"
              type="email"
              class="zoomIn delay_100 max-width-field mx-auto english-field"
              :label="$t('global.commons.email')"
              v-model="in_email"
              id="in_email"
              :rules="[GlobalRules.required(), GlobalRules.email()]"
              append-icon="account_circle"
            >
            </v-text-field>
            <v-text-field
              autocomplete="new-password"
              class="zoomIn delay_200 max-width-field mx-auto english-field"
              :label="$t('global.commons.password')"
              v-model="in_password"
              id="in_password"
              :rules="[GlobalRules.required(), GlobalRules.minLength(8)]"
              :append-icon="password_show ? 'visibility' : 'visibility_off'"
              @click:append="password_show = !password_show"
              :type="password_show ? 'text' : 'password'"
            >
            </v-text-field>
          </template>

          <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Email Recovery ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
          <template v-else>
            <v-btn text color="primary" @click="recover_mode = 'phone'">
              <v-icon class="me-1" small>phone</v-icon>
              {{ $t("global.actions.reset_by_sms") }}
            </v-btn>

            <v-text-field
              v-model="reset_password_email"
              class="mt-3 mx-auto english-field max-width-field zoomIn strong-field"
              :placeholder="$t('login.email')"
              append-icon="mail_outline"
            />
          </template>
        </v-card-text>

        <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Actions ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              v-if="recover_mode !== 'set-mail'"
              x-large
              color="primary"
              dark
              :class="{ disabled: !can_request_reset }"
              @click.stop="requestResetPassword()"
              :loading="busy_reset"
            >
              <v-icon class="me-1">send</v-icon>
              {{ $t("login.password_recovery_action") }}
            </v-btn>

            <v-btn
              v-else
              x-large
              :class="{
                disabled:
                  !in_code ||
                  in_code.length < 6 ||
                  !in_email ||
                  !in_password ||
                  in_password.length < 8,
              }"
              @click.stop="setUserEmail()"
              :loading="busy_set_mail"
              color="primary"
              dark
              ><v-icon class="me-1">check</v-icon>

              {{ $t("global.actions.verify") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- ███████████████████ Terms dialog ███████████████████ -->
    <v-dialog
      v-model="show_terms_privacy"
      scrollable
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card tile>
        <v-card-title
          ><v-btn
            x-large
            text
            color="primary"
            @click="fetchTerms"
            :disabled="dialog_tab === 'terms'"
            :loading="busy_terms"
          >
            <v-icon class="me-1" small>gavel</v-icon> Terms of Use</v-btn
          >
          <v-btn
            x-large
            text
            color="primary"
            class="mx-3"
            @click="fetchPrivacy"
            :disabled="dialog_tab === 'privacy'"
            :loading="busy_privacy"
          >
            <v-icon class="me-1" small>policy</v-icon>
            Privacy Policy</v-btn
          ></v-card-title
        >
        <v-card-text
          class="text-start"
          style="font-size: 15px; line-height: inherit"
        >
          <v-container v-html="dialog_tab === 'terms' ? terms : privacy">
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              x-large
              text
              @click="
                () => {
                  show_terms_privacy = false;
                  accept_terms = false;
                }
              "
            >
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.reject") }}</v-btn
            >

            <v-btn
              x-large
              dark
              color="success"
              @click="
                () => {
                  show_terms_privacy = false;
                  accept_terms = true;
                }
              "
            >
              <v-icon class="me-1">check</v-icon>
              {{ $t("global.actions.accept") }}</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-footer
      v-if="LOGIN_POPUP_LOGIN"
      min-height="25vh"
      class="border-top"
      light
    >
      <v-container class="text-start">
        <h3 class="display-1 my-2">
          <b
            >Selldone ® Business
            <span class="bg-star-wine text-gradient">OS</span>™</b
          >
        </h3>
        <h4>
          {{ $t("footer.title") }}
        </h4>
        <p class="mt-3 small op-0-6">
          {{ $t("footer.message") }}
        </p>

        <v-row class="d-flex align-center my-5">
          <v-col cols="12" sm="4">
            <s-app-language-selector></s-app-language-selector
          ></v-col>
          <v-col cols="12" sm="8" class="text-end">
            <v-btn
              text
              href="/privacy"
              color="primary"
              class="m-1 tnt"
              target="_blank"
              >Privacy Policy</v-btn
            >
            <v-btn
              text
              href="/terms"
              color="primary"
              class="m-1 tnt"
              target="_blank"
              >Terms of Use</v-btn
            >
          </v-col>
        </v-row>

        <v-subheader class="text-center justify-center mt-5">
          <i class="fas fa-copyright me-1" />
          {{ new Date().getFullYear() }},

          {{ $t("footer.copyright") }}
        </v-subheader>
      </v-container>
    </v-footer>
  </div>
</template>

<script>
import SetupService from "@core/server/SetupService";
import SAppLanguageSelector from "@components/ui/input/language/SAppLanguageSelector.vue";
import SSmartToggle from "@components/smart/SSmartToggle.vue";
import { TrackEventOnboarding } from "@core/enums/gtag/TrackEvents";
import _ from "lodash-es";

export default {
  name: "LoginPage",
  components: { SSmartToggle, SAppLanguageSelector },

  props: {
    inlineMode: {
      default: false,
      type: Boolean,
    },
    flat: {
      default: false,
      type: Boolean,
    },
    dark: { default: false, type: Boolean },
    noHeader: {
      default: false,
      type: Boolean,
    },
    initialMode: {
      default: "login",
      type: String,
    },

    noRedirect: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      rounded: false,

      busy_redirect: null,

      errorMessage: null,

      remember: false,

      recaptcha_response: null,

      mode: null,

      errorMessage_register: null,
      accept_terms: false,

      // Login
      login_username: "",
      login_password: "",

      login_Password_show: false,

      // Register
      register_username: "",
      register_password: "",
      register_password_re: "",
      register_name: "",

      register_Password_show: false,
      register_Password_2_show: false,

      // Reset password
      busy_reset: false,
      reset_password_dialog: false,
      reset_password_email: "",

      // 2FA Step2 login
      login_step2_mode: false,
      login_step2_code: null,
      busy_2fa: false,

      login_busy: false,
      register_busy: false,

      //---------------------
      terms: null,
      privacy: null,
      show_terms_privacy: false,
      dialog_tab: "terms",
      busy_terms: false,
      busy_privacy: false,

      //-------------
      country: null,
      phone: null,
      dial_code: null,
      recover_mode: null,

      //------------- User not set email yet -----------
      in_phone: null,
      in_code: null,
      in_email: null,
      in_password: null,

      busy_set_mail: false,
    };
  },

  computed: {
    LOGIN_POPUP_LOGIN() {
      return window.LOGIN_POPUP_LOGIN;
    },
    APP_IMAGE() {
      return window.APP_IMAGE;
    },

    weeksIntoYear() {
      const date = new Date();
      return Math.ceil(
        (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
          Date.UTC(date.getFullYear(), 0, 0)) /
          7 /
          24 /
          60 /
          60 /
          1000,
      );
    },

    login_modes() {
      return SetupService.GetLoginModes();
    },

    can_login() {
      return (
        this.recaptcha_response !== null &&
        this.login_username &&
        ////Can log in by user name!   this.ValidateEmail(this.login_username) &&
        this.login_password
      );
    },

    can_register() {
      return (
        this.accept_terms &&
        this.register_name !== null &&
        this.recaptcha_response !== null &&
        this.register_username &&
        this.ValidateEmail(this.register_username) &&
        this.register_password &&
        this.register_password === this.register_password_re &&
        this.validPasswordLength &&
        this.validPasswordSecurity &&
        this.validPasswordMatch
      );
    },
    validPasswordLength() {
      return this.register_password.length >= 8;
    },
    validPasswordSecurity() {
      return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(this.register_password);
    },
    validPasswordMatch() {
      return (
        this.register_password &&
        this.register_password === this.register_password_re
      );
    },

    defaultCountry() {
      return SetupService.LocalServiceCountry();
    },

    can_request_reset() {
      return (
        (this.recover_mode === "phone" &&
          this.phone &&
          this.phone.length > 6 &&
          this.country) ||
        (!this.recover_mode &&
          this.reset_password_email &&
          this.ValidateEmail(this.reset_password_email))
      );
    },
  },

  watch: {
    "$route.name"() {
      this.initialState();
    },
  },
  created() {
    if (this.USER()) {
      this.$router.push("/");
      return;
    }
    this.initialState();

    // AUto fill:
    if (this.$route.query.email) this.login_username = this.$route.query.email;
  },

  mounted() {
    let recaptchaScript = document.createElement("script");
    recaptchaScript.setAttribute(
      "src",
      "https://www.google.com/recaptcha/api.js?render=" +
        SetupService.GetCaptchaKey(),
    );
    recaptchaScript.async = true;
    recaptchaScript.defer = true;

    let t = this;

    recaptchaScript.onload = () => {
      grecaptcha.ready(function () {
        t.reCAPTCHA_execute();
      });
    };

    document.head.appendChild(recaptchaScript);
  },

  beforeDestroy() {
    let recaptchaScript = document.querySelector("script");
    recaptchaScript.remove();
  },

  methods: {
    setMode(mode) {
      this.mode = mode;
      if (!this.inlineMode) {
        this.$vuetify.goTo(0, {
          duration: 800,
          offset: 0,
          easing: "easeInOutQuad",
        });
      }
    },

    initialState() {
      // Full width :
      this.$emit("request:full-width", true);

      if (!this.$vuetify.breakpoint.smAndDown && !this.LOGIN_POPUP_LOGIN) {
        this.$emit("set:bg", {
          backgroundImage: `url('${require("@components/login/auth/assets/login-page-bg.jpg")}'),url('${require("@components/login/auth/assets/login-page-bg-pattern.jpg")}')`,
          backgroundSize: "auto 100%",
          backgroundRepeat: "no-repeat,repeat-x",
        });
      } else {
        this.$emit("set:bg", { background: "#eee" });
      }

      this.mode =
        this.$route.name === "register" ? "register" : this.initialMode;
    },

    ValidateEmail(mail) {
      if (!mail) return false;
      // eslint-disable-next-line no-useless-escape
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
      }
      return false;
    },

    login() {
      if (this.login_busy) return;

      this.login_busy = true;
      axios
        .post("/login", {
          email: this.login_username,
          password: this.login_password,
          remember: this.remember ? true : null,
          "g-recaptcha-response": this.recaptcha_response,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.errorMessage = null;

            this.checkHas2StepVerification();
          } else {
            this.showErrorAlert(null, data.error_msg);
            this.errorMessage = data.error_msg;
            this.reCAPTCHA_execute();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
          this.reCAPTCHA_execute();
        })
        .finally(() => {
          this.login_busy = false;
        });
    },

    checkHas2StepVerification() {
      // For web login it's needed to check 2fa after login!
      axios.get(window.API.GET_2FA_CHECK()).then(({ data }) => {
        if (data.has_2fa) {
          this.login_step2_mode = true;
        } else {
          this.finishLogin(data.user);
        }
      });
    },

    loginStep2() {
      this.busy_2fa = true;
      axios
        .post("/auth/2fa", {
          code: this.login_step2_code,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.errorMessage = null;
            this.finishLogin(data.user);
            this.showSuccessAlert(
              null,
              this.$t("login.notifications.step2_login_success"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_2fa = false;
        });
    },

    finishLogin(user) {
      window.auth_user = user;
      this.$store.commit("setAuthUser", user);

      // ━ ━ ━ ━ ━ ━ ━ ━ ━ ⚡ Google Tag manager ━ ━ ━ ━ ━ ━ ━ ━ ━
      TrackEventOnboarding.OnLoginUser();
      // ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━

      this.loadLanguageByUserPreferences(); // Load preferences language!

      if (this.window.back_url) {
        console.log("window.back_url = " + window.back_url);
        location.href = this.window.back_url;
      } else {
        if (!this.noRedirect) {
          this.$router.push({ name: "ShopsListPage" });
        }

        // Fetch home data: (user shops...) Load by delay! (Must not cached!)
        _.delay(() => {
          this.needHomeData(true);
        }, 2000);
        // location.reload();
      }
    },

    register() {
      if (this.register_busy) return;

      this.register_busy = true;
      axios
        .post("/register", {
          name: this.register_name,
          email: this.register_username,
          password: this.register_password,
          password_confirmation: this.register_password_re,
          "g-recaptcha-response": this.recaptcha_response,
          "verification-code": true,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.errorMessage_register = null;

            // ━ ━ ━ ━ ━ ━ ━ ━ ━ ⚡ Google Tag manager ━ ━ ━ ━ ━ ━ ━ ━ ━
            TrackEventOnboarding.OnRegisterUser();
            // ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━

            this.finishLogin(data.user);
          } else {
            this.showErrorAlert(null, data.error_msg);
            this.errorMessage_register = data.error_msg;
            this.reCAPTCHA_execute();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
          this.reCAPTCHA_execute();
        })
        .finally(() => {
          this.register_busy = false;
        });
    },

    reCAPTCHA_execute() {
      this.recaptcha_response = null;
      grecaptcha
        .execute(SetupService.GetCaptchaKey(), {
          action: "login",
        })
        .then((token) => {
          //  console.log(token);
          this.recaptcha_response = token;
        });
    },

    fetchTerms() {
      this.dialog_tab = "terms";
      this.show_terms_privacy = true;
      if (this.terms) return;

      this.busy_terms = true;
      axios
        .get(window.GAPI.GET_TERMS())
        .then(({ data }) => {
          this.terms = data;
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_terms = false;
        });
    },
    fetchPrivacy() {
      this.dialog_tab = "privacy";
      this.show_terms_privacy = true;
      if (this.privacy) return;

      this.busy_privacy = true;
      axios
        .get(window.GAPI.GET_PRIVACY())
        .then(({ data }) => {
          this.privacy = data;
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_privacy = false;
        });
    },

    showResetPass() {
      this.reset_password_dialog = true;
      this.reset_password_email = null;
      this.recover_mode = null;
      this.phone = null;
    },

    //-------------------------------------------------------------------------------------------------
    requestResetPassword() {
      this.busy_reset = true;

      const url =
        this.recover_mode === "phone" ? "/password/phone" : "/password/email";
      axios
        .post(url, {
          // For email recovery:
          email: this.reset_password_email,

          // For phone recovery:
          dial_code: this.country ? this.country.dialCode : null,
          country_code: this.country ? this.country.iso2 : null,
          phone: this.phone,

          // Recaptcha:
          "g-recaptcha-response": this.recaptcha_response,
        })
        .then(({ data }) => {
          if (!data.error) {
            if (data.need_email) {
              this.in_phone = data.phone;
              this.recover_mode = "set-mail";
            } else {
              this.reset_password_dialog = false;
              this.showSuccessAlert(
                null,
                "Reset password link has been sent to your email. Please check your mail.",
              );
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
          this.reCAPTCHA_execute();
        })
        .finally(() => {
          this.busy_reset = false;
        });
    },

    setUserEmail() {
      this.busy_set_mail = true;
      axios
        .post("/password/phone/mail", {
          phone: this.in_phone,
          code: this.in_code,
          email: this.in_email,
          password: this.in_password,
        })
        .then(({ data }) => {
          if (!data.error) {
            // User has been login
            this.reset_password_dialog = false;
            this.finishLogin(data.user);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy_set_mail = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.untransform {
  text-transform: unset !important ;
}

ul {
  text-align: start;
  li {
    list-style-type: none;
  }
}
</style>

<style lang="scss">
.grecaptcha-badge {
  visibility: collapse !important;
}

.login-form {
  width: 100%;
  max-width: 460px;
  padding: 56px 56px 24px 56px;
  border-radius: 64px;
  background: #fff;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;

  &.dark {
    background: #1e1e1e;
  }

  .header-place {
    height: 140px;
  }

  @media only screen and (max-width: 600px) {
    padding: 28px;
    max-width: 85vw;
    border-radius: 24px;

    .header-place {
      height: 170px;
    }
  }

  .-header-img {
    position: absolute;
    transition: none;
    overflow: hidden;
    left: 0;
    right: 0;
    top: 0;
    width: 100%;
    border-radius: 64px 64px 0 0;

    @media only screen and (max-width: 600px) {
      border-radius: 24px 24px 0 0;
    }
  }
}
.login-form-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  &.-right {
    padding-left: 60%;
    @media only screen and (max-width: 1250px) {
      padding-left: unset;
    }
  }
}
</style>

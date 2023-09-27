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
  <v-card flat>
    <v-card-title class="mx-2">
      <v-btn
        v-if="method !== 'fast'"
        @click="
          method = 'fast';
          code = null;
          phone = null;
        "
        text
        color="blue"
        class="zoomIn"
      >
        {{ $t("global.need_login.title") }}
      </v-btn>

      <v-icon v-if="current_step" class="zoomIn mx-2 delay_200">{{
        $t("icons.chevron_next")
      }}</v-icon>

      <v-btn
        v-if="current_step"
        text
        class="pointer-event-none zoomIn delay_400"
      >
        {{ current_step }}
      </v-btn>
    </v-card-title>

    <v-card-text
      class="log-form"
      :class="{ 'overflow-visible': method === 'request' }"
    >
      <!-- ====================================== Request ====================================== -->
      <div v-if="method === 'request'" class="fst" :class="{ '-focus': tel_f }">
        <div class="max-width-field mx-auto">
          <vue-tel-input
            v-model="phone"
            @country-changed="(val) => (country = val)"
            enabledCountryCode
            :inputOptions="{
              placeholder: $t('global.need_login.mobile_input'),
            }"
            required
            validCharactersOnly
            class="stylish-phone-input my-3 fadeIn"
            @open="tel_f = true"
            @close="tel_f = false"
            :defaultCountry="defaultCountry"
            @keypress.native.enter="
              country && phone && phone.length >= 7
                ? requestSendCode()
                : undefined
            "
          ></vue-tel-input>

          <div class="widget-buttons">
            <v-btn
              class="my-3 -btn tnt fadeIn delay_100"
              :class="{ disabled: !country || !phone || phone.length < 7 }"
              :depressed="!country || !phone || phone.length < 7"
              @click.stop="requestSendCode()"
              :loading="busy_login"
              color="#0061e0"
              x-large
              dark
              >{{ $t("global.actions.get_sms_code") }}</v-btn
            >
          </div>
        </div>

        <!----- SMS Agreement ------>
        <div v-if="window.sms_agreement" class="fadeIn delay_200">
          <hr />

          <v-checkbox
            color="#0061e0"
            :input-value="true"
            readonly
            @click="show_sms_agreement = !show_sms_agreement"
            :label="$t('global.commons.accept_agreement')"
            class="small-label"
            hide-details
          ></v-checkbox>

          <v-expand-transition>
            <div v-if="show_sms_agreement">
              <div
                class="text-justify mt-4 blue-links"
                style="font-size: 12px; line-height: 1.5rem"
                v-html="window.sms_agreement"
              ></div>
            </div>
          </v-expand-transition>
        </div>
      </div>

      <!-- ====================================== Verify ====================================== -->
      <div v-if="method === 'verify'">
        <lottie
          :options="{
            path: '/animation/938-iphone-x-loading.json',
            loop: true,
          }"
          height="128px"
          width="128px"
          :speed="0.4"
        />
        <div class="body-2">{{ phone_number }}</div>

        <div class="py-3">
          <v-expand-transition>
            <count-down
              v-if="countdown_end && !show_resend"
              :end="countdown_end"
              @end="show_resend = true"
            ></count-down>
            <v-btn
              v-else-if="show_resend"
              color="#0061e0"
              plain
              class="tnt"
              @click.stop="requestSendCode()"
              >{{ $t("global.actions.resend_code") }}</v-btn
            >
          </v-expand-transition>
        </div>

        <p style="max-width: 360px" class="mx-auto text-start">
          {{ $t("global.need_login.verification_code") }}:
        </p>

        <v-otp-input
          v-model="verification_code"
          :length="6"
          autofocus
          @finish="(val) => (verification_code = val)"
          class="max-width-field mx-auto text-center mb-12"
        />

        <div class="widget-buttons">
          <v-btn
            class="fadeIn"
            x-large
            block
            :class="{
              disabled: !verification_code || verification_code.length !== 6,
              'pointer-event-none': after_login,
            }"
            @click.stop="loginVerify()"
            :loading="busy_login"
            :color="after_login ? 'success' : '#0061e0'"
            dark
            min-width="200"
            >{{ $t("global.actions.verify") }}</v-btn
          >
        </div>
      </div>

      <!-- ====================================== Select ====================================== -->
      <div v-if="method === 'select'">
        <v-list
          v-if="method === 'select' && users"
          two-line
          :class="{ disabled: busy_login, 'pointer-event-none': after_login }"
          class="max-width-field mx-auto border-between-vertical text-start"
          color="transparent"
        >
          <template v-for="(user, index) in users">
            <v-list-item
              :key="user.id"
              @click.stop="loginSelectUser(user)"
              class="zoomIn"
              :style="`animation-delay: ${index * 100}ms`"
            >
              <v-list-item-avatar>
                <v-img :src="getUserAvatar(user.id)"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title
                  v-text="user.name"
                  class="font-weight-bold"
                ></v-list-item-title>
                <v-list-item-subtitle
                  v-text="user.email"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </div>

      <!-- ====================================== Register ====================================== -->
      <div v-if="method === 'register'">
        <v-text-field
          class="zoomIn max-width-field mx-auto"
          :label="$t('global.commons.name')"
          :placeholder="$t('global.placeholders.name')"
          v-model="name"
          id="in_name"
          :rules="[GlobalRules.required()]"
        >
        </v-text-field>
        <v-text-field
          v-if="!no_email_mode"
          autocomplete="username"
          type="email"
          class="zoomIn delay_100 max-width-field mx-auto english-field"
          :label="$t('global.commons.email')"
          :placeholder="$t('global.placeholders.email')"
          v-model="email"
          id="in_email"
          :rules="[GlobalRules.required(), GlobalRules.email()]"
        >
        </v-text-field>
        <v-text-field
          v-if="!no_email_mode"
          autocomplete="new-password"
          class="zoomIn delay_200 max-width-field mx-auto english-field"
          :label="$t('global.commons.password')"
          v-model="password"
          id="in_password"
          :rules="[GlobalRules.required(), GlobalRules.minLength(8)]"
          :append-icon="password_show ? 'visibility' : 'visibility_off'"
          @click:append="password_show = !password_show"
          :type="password_show ? 'text' : 'password'"
        >
        </v-text-field>
        <div class="widget-buttons">
          <v-btn
            class="fadeIn"
            :class="{
              disabled:
                !name ||
                (!no_email_mode &&
                  (!email || !password || password.length < 8)),

              'pointer-event-none': after_login,
            }"
            @click.stop="loginNewUser()"
            :loading="busy_login"
            :color="after_login ? 'success' : '#0061e0'"
            x-large
            dark
            >{{ $t("global.actions.verify") }}</v-btn
          >
        </div>

        <p class="mt-4 mb-1">
          {{ $t("global.actions.no_mail_register_message") }}
        </p>
        <div class="widget-buttons">
          <v-btn
            class="fadeIn delay_300"
            @click.stop="no_email_mode = !no_email_mode"
            color="#0061e0"
            dark
            text
            min-width="200"
            x-large
          >
            <v-icon v-if="no_email_mode" class="zoomIn me-1">check</v-icon>
            {{ $t("global.actions.register_no_mail") }}</v-btn
          >
        </div>
      </div>

      <!-- ====================================== Fast ====================================== -->
      <div v-if="method === 'fast'">
        <div class="-msg">
          <div class="d-flex align-items-center justify-content-center">
            <v-avatar><img :src="getShopIcon(shop.id)" /></v-avatar>
            <p class="subtitle-2 mx-2 my-2">{{ shop.title }}</p>
          </div>
          <h2>{{ $t("global.need_login.msg_title") }}</h2>
          <p>{{ $t("global.need_login.msg_body") }}</p>
        </div>
        <div
          class="max-width-field mx-auto"
          :class="{ disabled: disabled_fast_buttons }"
        >
          <!-- 1. Google login -->
          <v-btn
            v-if="login_modes && login_modes.includes('google')"
            depressed
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt"
            @mouseenter="tick()"
            @click="
              busy_redirect = 'google';
              LoginShop(null, 'google', false);
            "
            :loading="busy_redirect === 'google'"
            color="#4285f4"
            dark
            large
          >
            <v-avatar size="32" class="float-start ms-n2" color="#fff"
              ><img class="p-2" src="../assets/tradmark/google.svg"
            /></v-avatar>
            <span class="flex-grow-1">{{
              $t("global.need_login.login_google")
            }}</span>
          </v-btn>

          <!-- 2. Apple login -->
          <v-btn
            v-if="login_modes && login_modes.includes('apple')"
            depressed
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt"
            @mouseenter="tick()"
            @click="
              busy_redirect = 'apple';
              LoginShop(null, 'apple', false);
            "
            :loading="busy_redirect === 'apple'"
            large
            color="#111"
            dark
          >
            <v-avatar size="32" class="float-start ms-n2" color="#fff"
              ><img class="p-2" src="../assets/tradmark/apple-b.svg"
            /></v-avatar>
            <span class="flex-grow-1">{{
              $t("global.need_login.login_apple")
            }}</span>
          </v-btn>

          <!-- 0. Email login -->
          <shop-email-login
            v-if="login_modes && login_modes.includes('email')"
            :shop="shop"
            :source="source"
            @close="$emit('update:show', false)"
            @login="({ token, expires_in }) => handleToken(token, expires_in)"
          >
          </shop-email-login>

          <!-- 2. Facebook login -->
          <v-btn
            v-if="login_modes && login_modes.includes('facebook')"
            depressed
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt"
            @mouseenter="tick()"
            @click="
              busy_redirect = 'facebook';
              LoginShop(null, 'facebook', false);
            "
            :loading="busy_redirect === 'facebook'"
            large
          >
            <v-avatar size="32" class="float-start ms-n2" color="#fff"
              ><img class="p-2" src="../assets/tradmark/meta.png"
            /></v-avatar>
            <span class="flex-grow-1">{{
              $t("global.need_login.login_facebook")
            }}</span>
          </v-btn>

          <!-- 3. Selldone login -->

          <v-btn
            v-if="login_modes && login_modes.includes('selldone')"
            depressed
            large
            block
            class="my-2 untransform fadeIn delay_300 d-flex align-items-center tnt"
            @click="
              busy_redirect = 'selldone';
              LoginShop(null, null, false);
            "
            :loading="busy_redirect === 'selldone'"
            @mouseenter="tick()"
          >
            <v-avatar size="32" class="float-start ms-n2" color="#fff">
              <img class="p-2" src="../assets/tradmark/selldone.svg" />
            </v-avatar>
            <span class="flex-grow-1">{{
              $t("global.need_login.login_account")
            }}</span>
          </v-btn>

          <!-- 4. Phone login -->
          <v-btn
            v-if="login_modes && login_modes.includes('sms')"
            depressed
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt"
            @mouseenter="tick()"
            @click.stop="method = 'request'"
            large
          >
            <v-avatar size="32" class="float-start ms-n2" color="#fff">
              <v-icon size="20">phone_iphone</v-icon>
            </v-avatar>
            <span class="flex-grow-1">{{
              $t("global.need_login.login_sms")
            }}</span>
          </v-btn>
        </div>
      </div>

      <loading css-mode light v-if="method === 'login'" class="m-4"> </loading>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { SoundHelper } from "../../../core/helper/sound/SoundHelper";
import CountDown from "@/Components/ui/count-down/CountDown.vue";
import SetupService from "../../../core/server/SetupService";
import {
  ISMSVerifyOTPServerResponse_Select_User,
  SuccessVerifyMethod,
} from "../../../SDKs/storefront/auth/XapiAuthSMS";
import {XapiAuth} from "../../../SDKs/storefront/auth/XapiAuth";
import ShopEmailLogin from "@/Components/storefront/login/widgets/ShopEmailLogin.vue";

@Component({
  components: { ShopEmailLogin, CountDown },
})
export default class FastLoginCard extends Vue {
  @Prop({ default: false, type: Boolean }) show!: boolean;
  @Prop({ default: "transparent" }) color!: string;
  @Prop({ default: XapiAuth.LoginSource.CUSTOMER }) source!: XapiAuth.LoginSource;

  // data properties
  show_sms_agreement = false;
  busy_redirect :string|null = null;
  country: any = null;
  phone: any = null;
  phone_number = "";
  verification_code: string | null = null;
  busy_login = false;
  method: string = "fast";
  countdown_end: Date | null = null;
  show_resend = false;
  users: ISMSVerifyOTPServerResponse_Select_User[] | null | undefined;
  code: string | null = null;
  name: string | null = null;
  email: string | null = null;
  password: string | null = null;
  password_show = false;
  tel_f = false;
  no_email_mode = false;
  after_login = false;

  // computed properties
  get shop(): any {
    return this.getShop();
  }

  get user(): any {
    return this.$store.getters.getUser;
  }

  get current_step(): string | null {
    if (this.method === "request")
      return this.$t("global.commons.mobile") as string;
    if (this.method === "verify")
      return this.$t("global.actions.verify") as string;
    if (this.method === "select")
      return this.$t("global.commons.select_account") as string;
    if (this.method === "register")
      return this.$t("global.commons.register") as string;
    return null;
  }

  get defaultCountry(): any {
    return SetupService.DefaultCountry();
  }

  get disabled_fast_buttons(): boolean {
    return !!this.busy_redirect;
  }

  get login_modes(): any {
    return this.shop.login_modes;
  }

  // watchers
  @Watch("user")
  onUserChanged(user: any) {
    this.busy_redirect = null;
    if (user) this.$emit("update:show", false);
  }

  @Watch("show")
  onShowChanged() {
    setTimeout(() => {
      this.resetState();
    }, 500);
  }

  @Watch("verification_code")
  onVerificationCodeChanged(val: string) {
    if (this.method === "verify" && val && val.length >= 6) {
      this.loginVerify();
    }
  }

  created() {
    this.EventBus.$on("get-me:error", this.resetState);
  }

  beforeDestroy() {
    this.EventBus.$off("get-me:error");
  }

  // methods
  tick() {
    SoundHelper.playTick(0.1);
  }

  requestSendCode() {
    this.show_resend = false;
    this.countdown_end = null;

    this.busy_login = true;

    window.$storefront.auth.sms
      .requestOTP(this.country.dialCode, this.country.iso2, this.phone)
      .then((data) => {
        this.method = "verify";
        this.phone_number = data.phone;

        // Start count down resend:
        this.countdown_end = new Date().addSeconds(60);
      })
      .catch((error) => {
        this.showLaravelError(error);
      })
      .finally(() => {
        this.busy_login = false;
      });
  }

  loginVerify() {
    if(this.verification_code?.length!==6)return
    this.busy_login = true;

    // Reset values:
    this.users = null;
    this.code = null;
    window.$storefront.auth.sms
      .verifyOTP(
        this.country.dialCode,
        this.country.iso2,
        this.phone,
        this.verification_code,
        this.source
      )

      .then((data) => {
        this.method = data.method;

        if (data.method === SuccessVerifyMethod.SELECT) {
          // Next step is select user:
          this.users = data.users;
        } else if (data.method === SuccessVerifyMethod.LOGIN) {
          // User has been login and get token
          this.handleToken(data.token, data.expires_in); //  🚀 🚀 🚀 LOGIN  🚀 🚀 🚀
        } else if (data.method === SuccessVerifyMethod.REGISTER) {
          // Next step is register new user:
          this.code = data.code;
        }
      })
      .catch((error) => {
        this.showLaravelError(error);
      })

      .finally(() => {
        this.busy_login = false;
      });
  }

  loginSelectUser(user : ISMSVerifyOTPServerResponse_Select_User) {
    this.busy_login = true;
    window.$storefront.auth.sms
      .selectUser(user.code, this.source)
      .then((data) => {
        // User has been login and get token
        this.method = "login";
        this.handleToken(data.token, data.expires_in); //  🚀 🚀 🚀 LOGIN  🚀 🚀 🚀
      })
      .catch((error) => {
        this.showLaravelError(error);
      })

      .finally(() => {
        this.busy_login = false;
      });
  }

  loginNewUser() {
    if (!this.code || !this.name) return;
    this.busy_login = true;

    window.$storefront.auth.sms
      .registerUser(
        this.code,
        this.name,
        this.email,
        this.password,
        this.no_email_mode,
        this.source
      )
      .then((data) => {
        // User has been login and get token
        this.method = "login";
        this.handleToken(data.token, data.expires_in); //  🚀 🚀 🚀 LOGIN  🚀 🚀 🚀
      })
      .catch((error) => {
        this.showLaravelError(error);
      })

      .finally(() => {
        this.busy_login = false;
      });
  }

  handleToken(token: string, expires_in: number) {
    this.after_login = true;
    const expire_date = new Date();
    expire_date.setUTCSeconds(expires_in);

    window.SetToken(token, expire_date);
  }

  resetState() {
    this.method = "fast";
    this.country = null;
    this.phone = null;
    this.verification_code = null;
    this.code = null;
    this.name = null;
    this.email = null;
    this.password = null;
    this.password_show = false;
    this.after_login = false;
  }
}
</script>

<style lang="scss" scoped>
.log-form {
  min-height: 330px;
  display: flex;
  align-items: center;
  justify-content: center;
  > div {
    width: 100%;
  }

  .-fab {
    background-color: #fff !important;
    &.-blue {
      border: solid thick #03a9f4;
      &:hover {
        background-color: #03a9f4 !important;
      }
    }
    &.-green {
      border: solid thick #3cba92;
      &:hover {
        background-color: #3cba92 !important;
      }
    }

    &:hover {
      transition-duration: 0.1s !important;

      .v-icon {
        color: #fff !important;
      }
    }
  }
  .-msg {
    text-align: start;
    font-size: 1.5em;
    font-weight: 300;
    line-height: normal;
  }
}

.fst {
  transition: all 0.4s ease-in-out;
  &.-focus {
    margin-top: -20% !important;
    .-btn {
      opacity: 0;
      transition: unset !important;
    }
  }
  .-btn {
    opacity: 1;
    transition: all 0.3s;
  }
}
</style>

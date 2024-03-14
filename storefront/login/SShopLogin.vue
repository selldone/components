<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    <v-card-title class="mx-2 text-start">
      <v-btn
        v-if="method !== 'fast'"
        class="zoomIn tnt"
        color="blue"
        rounded
        variant="text"
        @click="
          method = 'fast';
          code = null;
          phone = null;
        "
      >
        {{ $t("global.need_login.title") }}
      </v-btn>

      <v-icon v-if="current_step" class="zoomIn mx-2 delay_200"
        >{{ $t("icons.chevron_next") }}
      </v-icon>

      <v-btn
        v-if="current_step"
        class="pointer-event-none zoomIn delay_400 tnt"
        variant="text"
        rounded
      >
        {{ current_step }}
      </v-btn>
    </v-card-title>

    <v-card-text
      :class="{ 'overflow-visible': method === 'request' }"
      class="log-form"
    >
      <!-- ====================================== Request ====================================== -->
      <div v-if="method === 'request'" :class="{ '-focus': tel_f }" class="fst">
        <s-tel-input
          v-model="phone"
          :defaultCountry="defaultCountry"
          :inputOptions="{
            placeholder: $t('global.need_login.mobile_input'),
          }"
          class="max-width-field mx-auto my-3 fadeIn"
          enabledCountryCode
          required
          validCharactersOnly
          @close="tel_f = false"
          @open="tel_f = true"
          @country-changed="(val) => (country = val)"
          @keypress.enter="
            country && phone && phone.length >= 7
              ? requestSendCode()
              : undefined
          "
          variant="outlined"
        ></s-tel-input>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !country || !phone || phone.length < 7 }"
            :loading="busy_login"
            :disabled="!country || !phone || phone.length < 7"
            class="my-3 -btn tnt fadeIn delay_100"
            color="#0061e0"
            variant="elevated"
            size="x-large"
            @click.stop="requestSendCode()"
            >{{ $t("global.actions.get_sms_code") }}
            <v-icon end>{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
        </div>

        <!----- SMS Agreement ------>
        <div v-if="window.sms_agreement" class="fadeIn delay_200">
          <hr />

          <v-checkbox
            :label="$t('global.commons.accept_agreement')"
            :model-value="true"
            class="small-label"
            color="#0061e0"
            hide-details
            readonly
            @click="show_sms_agreement = !show_sms_agreement"
          ></v-checkbox>

          <v-expand-transition>
            <div v-if="show_sms_agreement">
              <div
                class="text-justify my-4 blue-links"
                style="font-size: 12px; line-height: 1.5rem"
                v-html="window.sms_agreement"
              ></div>
            </div>
          </v-expand-transition>
        </div>
      </div>

      <!-- ====================================== Verify ====================================== -->
      <div v-if="method === 'verify'">
        <s-lottie
          :options="{
            path: '/animation/938-iphone-x-loading.json',
            loop: true,
          }"
          :speed="0.4"
          height="128px"
          width="128px"
        />
        <div class="text-body-2">{{ phone_number }}</div>

        <div class="py-3">
          <v-expand-transition>
            <s-count-down
              v-if="countdown_end && !show_resend"
              :end="countdown_end"
              @end="show_resend = true"
            ></s-count-down>
            <v-btn
              v-else-if="show_resend"
              class="tnt"
              color="#0061e0"
              variant="plain"
              @click.stop="requestSendCode()"
              >{{ $t("global.actions.resend_code") }}
            </v-btn>
          </v-expand-transition>
        </div>

        <p class="mx-auto text-start" style="max-width: 360px">
          {{ $t("global.need_login.verification_code") }}:
        </p>

        <v-otp-input
          v-model="verification_code"
          :length="6"
          autofocus
          class="max-width-field mx-auto text-center mb-12"
          @finish="(val) => (verification_code = val)"
          @click="verification_code=''"
        />

        <div class="widget-buttons">
          <v-btn
            :class="{
              disabled: !verification_code || verification_code.length !== 6,
              'pointer-event-none': after_login,
            }"
            :color="after_login ? 'success' : '#0061e0'"
            :loading="busy_login"
            block
            class="fadeIn"
            min-width="200"
            size="x-large"
            @click.stop="loginVerify()"
            >{{ $t("global.actions.verify") }}
          </v-btn>
        </div>
      </div>

      <!-- ====================================== Select ====================================== -->
      <div v-if="method === 'select'">
        <v-list
          v-if="method === 'select' && users"
          :class="{ disabled: busy_login, 'pointer-event-none': after_login }"
          class="max-width-field mx-auto border-between-vertical text-start"
          bg-color="transparent"
          lines="two"
        >
          <template v-for="(user, index) in users" :key="user.id">
            <v-list-item
              :style="`animation-delay: ${index * 100}ms`"
              class="zoomIn"
              @click.stop="loginSelectUser(user)"
            >
              <template v-slot:prepend>
                <v-avatar>
                  <v-img :src="getUserAvatar(user.id)"></v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold"
                >{{ user.name }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-list>
      </div>

      <!-- ====================================== Register ====================================== -->
      <div v-if="method === 'register'">
        <v-text-field
          id="in_name"
          v-model="name"
          :label="$t('global.commons.name')"
          :placeholder="$t('global.placeholders.name')"
          :rules="[GlobalRules.required()]"
          class="zoomIn max-width-field mx-auto"
        >
        </v-text-field>
        <v-text-field
          v-if="!no_email_mode"
          id="in_email"
          v-model="email"
          :label="$t('global.commons.email')"
          :placeholder="$t('global.placeholders.email')"
          :rules="[GlobalRules.required(), GlobalRules.email()]"
          autocomplete="username"
          class="zoomIn delay_100 max-width-field mx-auto english-field"
          type="email"
        >
        </v-text-field>
        <v-text-field
          v-if="!no_email_mode"
          id="in_password"
          v-model="password"
          :append-inner-icon="password_show ? 'visibility' : 'visibility_off'"
          :label="$t('global.commons.password')"
          :rules="[GlobalRules.required(), GlobalRules.minLength(8)]"
          :type="password_show ? 'text' : 'password'"
          autocomplete="new-password"
          class="zoomIn delay_200 max-width-field mx-auto english-field"
          @click:append-inner="password_show = !password_show"
        >
        </v-text-field>
        <div class="widget-buttons">
          <v-btn
            :class="{
              disabled:
                !name ||
                (!no_email_mode &&
                  (!email || !password || password.length < 8)),

              'pointer-event-none': after_login,
            }"
            :color="after_login ? 'success' : '#0061e0'"
            :loading="busy_login"
            class="fadeIn"
            size="x-large"
            @click.stop="loginNewUser()"
            >{{ $t("global.actions.verify") }}
          </v-btn>
        </div>

        <p class="mt-4 mb-1">
          {{ $t("global.actions.no_mail_register_message") }}
        </p>
        <div class="widget-buttons">
          <v-btn
            class="fadeIn delay_300"
            color="#0061e0"
            min-width="200"
            size="x-large"
            variant="text"
            @click.stop="no_email_mode = !no_email_mode"
          >
            <v-icon v-if="no_email_mode" class="zoomIn me-1">check</v-icon>
            {{ $t("global.actions.register_no_mail") }}
          </v-btn>
        </div>
      </div>

      <!-- ====================================== Fast ====================================== -->
      <div v-if="method === 'fast'">
        <div class="-msg">
          <div class="d-flex align-items-center justify-center">
            <v-avatar class="avatar-gradient -thin -shop"
              ><img :src="getShopIcon(shop.id)"
            /></v-avatar>
            <p class="text-subtitle-2 mx-2 my-2">{{ shop.title }}</p>
          </div>
          <h2>{{ $t("global.need_login.msg_title") }}</h2>
          <p class="mb-5">{{ $t("global.need_login.msg_body") }}</p>
        </div>
        <div
          :class="{ disabled: disabled_fast_buttons }"
          class="max-width-field mx-auto"
        >
          <!-- 1. Google login -->
          <v-btn
            v-if="login_modes && login_modes.includes('google')"
            :loading="busy_redirect === 'google'"
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt s--button-flex"
            rounded
            color="#4285f4"
            size="large"
            variant="flat"
            @click="
              busy_redirect = 'google';
              LoginShop(null, 'google', false);
            "
            @mouseenter="tick()"
          >
            <template v-slot:prepend>
              <v-avatar class="float-start ms-n2" color="#fff" size="32"
                ><img class="p-2" src="../../assets/trademark/google.svg"
              /></v-avatar>
            </template>

            <span>{{ $t("global.need_login.login_google") }}</span>
          </v-btn>

          <!-- 2. Apple login -->
          <v-btn
            v-if="login_modes && login_modes.includes('apple')"
            :loading="busy_redirect === 'apple'"
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt s--button-flex"
            rounded
            color="#111"
            size="large"
            variant="flat"
            @click="
              busy_redirect = 'apple';
              LoginShop(null, 'apple', false);
            "
            @mouseenter="tick()"
          >
            <template v-slot:prepend>
              <v-avatar class="float-start ms-n2" color="#fff" size="32"
                ><img class="p-2" src="../../assets/trademark/apple-b.svg"
              /></v-avatar>
            </template>
            <span>{{ $t("global.need_login.login_apple") }}</span>
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
            :loading="busy_redirect === 'facebook'"
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt s--button-flex border"
            rounded
            size="large"
            variant="flat"
            @click="
              busy_redirect = 'facebook';
              LoginShop(null, 'facebook', false);
            "
            @mouseenter="tick()"
          >
            <template v-slot:prepend>
              <v-avatar class="float-start ms-n2" color="#fff" size="32"
                ><img class="p-2" src="../../assets/trademark/meta.png"
              /></v-avatar>
            </template>
            <span>{{ $t("global.need_login.login_facebook") }}</span>
          </v-btn>

          <!-- 3. Selldone login -->

          <v-btn
            v-if="login_modes && login_modes.includes('selldone')"
            :loading="busy_redirect === 'selldone'"
            block
            class="my-2 untransform fadeIn delay_300 d-flex align-items-center tnt s--button-flex border"
            rounded
            size="large"
            variant="flat"
            @click="
              busy_redirect = 'selldone';
              LoginShop(null, null, false);
            "
            @mouseenter="tick()"
          >
            <template v-slot:prepend>
              <v-avatar class="float-start ms-n2" color="#fff" size="32">
                <img class="p-2" src="../../assets/trademark/selldone.svg" />
              </v-avatar>
            </template>
            <span>{{ $t("global.need_login.login_account") }}</span>
          </v-btn>

          <!-- 4. Phone login -->
          <v-btn
            v-if="login_modes && login_modes.includes('sms')"
            block
            class="my-2 untransform fadeIn delay_100 d-flex align-items-center tnt s--button-flex border"
            rounded
            size="large"
            variant="flat"
            @mouseenter="tick()"
            @click.stop="method = 'request'"
          >
            <template v-slot:prepend>
              <v-avatar class="float-start ms-n2" color="#fff" size="32">
                <v-icon size="20">phone_iphone</v-icon>
              </v-avatar>
            </template>

            <span>{{ $t("global.need_login.login_sms") }}</span>
          </v-btn>
        </div>
      </div>

      <s-loading v-if="method === 'login'" class="m-4" css-mode light>
      </s-loading>
    </v-card-text>
  </v-card>
</template>

<script>
import { SoundHelper } from "@core/helper/sound/SoundHelper";
import SCountDown from "@components/ui/count-down/SCountDown.vue";
import { SetupService } from "@core/server/SetupService";
import { SuccessVerifyMethod } from "@sdk-storefront/auth/XapiAuthSMS";
import { XapiAuth } from "@sdk-storefront/auth/XapiAuth";
import ShopEmailLogin from "@components/storefront/login/widgets/ShopEmailLogin.vue";

export default {
  name: "SShopLogin",
  components: {
    ShopEmailLogin,
    SCountDown,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    color: {
      default: "transparent",
    },
    source: {
      default: XapiAuth.LoginSource.CUSTOMER,
    },
  },
  data() {
    return {
      show_sms_agreement: false,
      busy_redirect: null,
      country: null,
      phone: null,
      phone_number: "",
      verification_code: '',
      busy_login: false,
      method: "fast",
      countdown_end: null,
      show_resend: false,
      users: null,
      code: null,
      name: null,
      email: null,
      password: null,
      password_show: false,
      tel_f: false,
      no_email_mode: false,
      after_login: false,
    };
  },
  computed: {
    shop() {
      return this.getShop();
    },
    user() {
      return this.$store.getters.getUser;
    },
    current_step() {
      if (this.method === "request") return this.$t("global.commons.mobile");
      if (this.method === "verify") return this.$t("global.actions.verify");
      if (this.method === "select")
        return this.$t("global.commons.select_account");
      if (this.method === "register") return this.$t("global.commons.register");
      return null;
    },
    defaultCountry() {
      return SetupService.DefaultCountry();
    },
    disabled_fast_buttons() {
      return !!this.busy_redirect;
    },
    login_modes() {
      return this.shop.login_modes;
    },
  },
  watch: {
    user(user) {
      this.busy_redirect = null;
      if (user) this.$emit("update:show", false);
    },
    show() {
      setTimeout(() => {
        this.resetState();
      }, 500);
    },
    verification_code(val) {
      if (this.method === "verify" && val && val.length >= 6) {
        this.loginVerify();
      }
    },
  },
  created() {
    this.EventBus.$on("get-me:error", this.resetState);
  },
  beforeUnmount() {
    this.EventBus.$off("get-me:error");
  },
  methods: {
    tick() {
      SoundHelper.playTick(0.1);
    },

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
    },

    loginVerify() {
      if (this.verification_code?.length !== 6) return;
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
          this.source,
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
    },

    loginSelectUser(user) {
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
    },

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
          this.source,
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
    },

    handleToken(token, expires_in) {
      this.after_login = true;
      const expire_date = new Date();
      expire_date.setUTCSeconds(expires_in);

      window.SetToken(token, expire_date);
    },

    resetState() {
      this.method = "fast";
      this.country = null;
      this.phone = null;
      this.verification_code = '';
      this.code = null;
      this.name = null;
      this.email = null;
      this.password = null;
      this.password_show = false;
      this.after_login = false;
    },
  },
};
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

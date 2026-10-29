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
  <div class="b-shop-login text-start" :class="{ 'b-shop-login--modern': modern }">
  <div :class="modern ? 'sd-modern-widget b-shop-login__widget' : 'widget-box mb-5'">
    <div v-if="modern" class="b-shop-login__heading">
      <v-icon class="b-shop-login__heading-icon" size="18">login</v-icon>
      <div class="b-shop-login__heading-copy">
        <h2 class="sd-modern-title-text">{{ $t('shop_configuration.flow_modern.login.title') }}</h2>
        <div class="b-shop-login__subtitle">
          <span>{{ $t('shop_configuration.flow_modern.login.subtitle') }}</span>
          <u-tooltip-tips
            class="sd-modern-icon-button sd-modern-info-button"
            icon="info_outline"
            :aria-label="$t('shop_configuration.flow_modern.login.help_label')"
            :message="$t('shop_configuration.flow_modern.login.help')"
          />
        </div>
      </div>
      <span class="b-shop-login__auto" role="status"><span class="sd-modern-status__dot" />{{ $t('shop_configuration.flow_modern.login.auto_save') }}</span>
    </div>
    <template v-else>
    <u-widget-header :title="$t('shop_configuration.login.title')" icon="login">
    </u-widget-header>
    <v-list-subheader>
      {{ $t("shop_configuration.login.subtitle") }}
    </v-list-subheader>
    </template>

    <v-list :lines="2" class="bg-transparent" :class="modern ? 'b-shop-login__list' : 'border-between-vertical'">
      <b-options-login-method-row
        v-for="login in login_methods"
        :key="login.code"
        :login="login"
        :shop="shop"
        :readOnly="readOnly"
        :modern="modern"
      >
      </b-options-login-method-row>
    </v-list>
    <v-list-subheader v-if="!modern">
      <div v-html="$t('shop_configuration.login.tips')">

      </div>
    </v-list-subheader>
  </div>
    <div v-if="modern" class="b-shop-login__privacy">
      <v-icon size="17">privacy_tip</v-icon>
      <div>
        <h3>{{ $t('shop_configuration.flow_modern.login.privacy_title') }}</h3>
        <p>{{ $t('shop_configuration.flow_modern.login.privacy') }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BOptionsLoginMethodRow from "../../../shop/options/login-methods/row/BOptionsLoginMethodRow.vue";
import UTooltipTips from "../../../../ui/tooltip/tips/UTooltipTips.vue";

export default {
  name: "BShopOptionsLoginMethods",
  components: { BOptionsLoginMethodRow, UTooltipTips },
  props: {
    shop: {
      required: false,
      type: Object,
    },
    readOnly:Boolean,
    modern: Boolean,
  },

  data: () => ({
    busy_login: null,
  }),

  computed: {
    /**
     * Defined server side by Selldone service
     */
    login_modes() {
      return this.shop.login_modes;
    },

    login_methods() {
      const out = [];
      // Email:
      out.push({
        code: "email",
        title: this.$t(this.modern ? "shop_configuration.flow_modern.login.email" : "global.need_login.login_email"),
        icon: "alternate_email",
        available: this.login_modes.includes("email"),
      });

      // Google:
      out.push({
        code: "google",
        title: this.$t(this.modern ? "shop_configuration.flow_modern.login.google" : "global.need_login.login_google"),
        image: require("../../../../assets/trademark/google.svg"),
        available: this.login_modes.includes("google"),
        customizable:true,
      });

      // Meta:
      out.push({
        code: "facebook",
        title: this.$t(this.modern ? "shop_configuration.flow_modern.login.facebook" : "global.need_login.login_facebook"),
        image: require("../../../../assets/trademark/meta.png"),
        available: this.login_modes.includes("facebook"),
      });

      // Selldone:
      out.push({
        code: "selldone",
        title: this.$t(this.modern ? "shop_configuration.flow_modern.login.selldone" : "global.need_login.login_account"),
        image: require("../../../../assets/trademark/selldone.svg"),
        available: true,
        premium: true,
      });

      // Apple:
      out.push({
        code: "apple",
        title: this.$t(this.modern ? "shop_configuration.flow_modern.login.apple" : "global.need_login.login_apple"),
        image: require("../../../../assets/trademark/apple-b.svg"),
        available: this.login_modes.includes("apple"),
        premium: true,
      });

      // SMS:
      out.push({
        code: "sms",
        title: this.$t(this.modern ? "shop_configuration.flow_modern.login.sms" : "global.need_login.login_sms"),
        subtitle: this.$t(this.modern ? "shop_configuration.flow_modern.login.sms_description" : "global.need_login.login_sms_description"),
        image: require("../../../../assets/icons/sms.svg"),
        available: this.login_modes.includes("sms"),
        paid: true,
      });

      return out;
    },
  },

  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.b-shop-login--modern {
  .b-shop-login__widget { margin-block-end: 20px; }
  .b-shop-login__heading { display: flex; align-items: flex-start; gap: 12px; margin-block-end: 25px; }
  .b-shop-login__heading-icon { margin-block-start: 4px; color: var(--sd-modern-muted); }
  .b-shop-login__heading-copy { flex: 1; min-width: 0; }
  .b-shop-login__subtitle { display: flex; align-items: center; gap: 5px; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 13px; line-height: 1.55; }
  .b-shop-login__auto { display: inline-flex; align-items: center; gap: 6px; padding-block-start: 6px; color: var(--sd-modern-muted); font-size: 11px; line-height: 1.5; white-space: nowrap; }
  .b-shop-login__auto .sd-modern-status__dot { color: rgb(var(--v-theme-success)); }
  .b-shop-login__list { padding: 0; }
  .b-shop-login__privacy { display: flex; align-items: flex-start; gap: 10px; margin: 25px 3px; color: var(--sd-modern-muted); }
  .b-shop-login__privacy > .v-icon { margin-block-start: 2px; }
  .b-shop-login__privacy h3 { margin: 0 0 5px; color: rgb(var(--v-theme-on-surface)); font-size: 13px; font-weight: 500; line-height: 1.5; }
  .b-shop-login__privacy p { margin: 0; font-size: 12px; line-height: 1.65; }
}
@media (max-width: 800px) {
  .b-shop-login--modern .b-shop-login__heading { flex-wrap: wrap; }
  .b-shop-login--modern .b-shop-login__auto { margin-inline-start: 30px; padding-block-start: 0; }
}
@media (max-width: 600px) {
  .b-shop-login--modern .b-shop-login__subtitle { align-items: flex-start; }
}
</style>

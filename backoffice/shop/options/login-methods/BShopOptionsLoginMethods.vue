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
  <div class="widget-box mb-5">
    <s-widget-header :title="$t('shop_configuration.login.title')" icon="login">
    </s-widget-header>
    <v-list-subheader>
      {{ $t("shop_configuration.login.subtitle") }}
    </v-list-subheader>

    <v-list :lines="2" class="bg-transparent border-between-vertical">
      <b-options-login-method-row
        v-for="login in login_methods"
        :key="login.code"
        :login="login"
        :shop="shop"
      >
      </b-options-login-method-row>
    </v-list>
    <v-list-subheader>
      <div>
        <b>Important.</b> When a user registers with your shop, a corresponding
        Selldone user is created, if one doesn't already exist. This user will
        have access to their address book across all shops and can view their
        order history, even if a shop has closed. We do not use this information
        for marketing purposes but require it to prevent fraud on both sides. To
        maintain transparency, we'll send an email to the user informing them of
        their registration.
      </div>
    </v-list-subheader>
  </div>
</template>

<script>
import BOptionsLoginMethodRow from "../../../shop/options/login-methods/row/BOptionsLoginMethodRow.vue";

export default {
  name: "BShopOptionsLoginMethods",
  components: { BOptionsLoginMethodRow },
  props: {
    shop: {
      required: false,
      type: Object,
    },
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
        title: this.$t("global.need_login.login_email"),
        icon: "alternate_email",
        available: this.login_modes.includes("email"),
      });

      // Google:
      out.push({
        code: "google",
        title: this.$t("global.need_login.login_google"),
        image: require("../../../../assets/trademark/google.svg"),
        available: this.login_modes.includes("google"),
      });

      // Meta:
      out.push({
        code: "facebook",
        title: this.$t("global.need_login.login_facebook"),
        image: require("../../../../assets/trademark/meta.png"),
        available: this.login_modes.includes("facebook"),
      });

      // Selldone:
      out.push({
        code: "selldone",
        title: this.$t("global.need_login.login_account"),
        image: require("../../../../assets/trademark/selldone.svg"),
        available: true,
        premium: true,
      });

      // Apple:
      out.push({
        code: "apple",
        title: this.$t("global.need_login.login_apple"),
        image: require("../../../../assets/trademark/apple-b.svg"),
        available: this.login_modes.includes("apple"),
        premium: true,
      });

      // SMS:
      out.push({
        code: "sms",
        title: this.$t("global.need_login.login_sms"),
        subtitle:
          "In some countries it's free. We try to make this feature free for all. More information will be available soon.",
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

<style scoped></style>

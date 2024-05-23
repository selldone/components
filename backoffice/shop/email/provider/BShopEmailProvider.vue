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
  <div :class="{ disabled: busy }" class="widget-box my-5 pb-6">
    <s-widget-header
      :add-caption="
        mail_service && mail_service.errors > 0
          ? `Reset errors (${mail_service.errors})`
          : undefined
      "
      :add-loading="busy_reset"
      add-icon="autorenew"
      icon="private_connectivity"
      title="Custom mail server"
      @click:add="resetErrors"
    >
    </s-widget-header>

    <u-loading-progress v-if="busy"></u-loading-progress>
    <v-list-subheader>
      Connect your mail service provider to send emails via your custom domain.
    </v-list-subheader>

    <u-smart-select
      v-model="driver"
      :items="email_providers"
      class="my-3"
      item-description="description"
      item-image="icon"
      item-text="title"
      item-value="driver"
      title="Provider"
    >
    </u-smart-select>

    <v-list-subheader v-if="mail_service && mail_service.errors > 10">
      <v-icon class="me-1" color="amber">warning</v-icon>
      If your service exceeds 100 errors, it will be disabled automatically! You
      can reset errors to re-enable it.
    </v-list-subheader>

    <v-alert
      v-if="mail_service && mail_service.error"
      color="red"
      text
      type="error"
      >{{ mail_service.error }}
    </v-alert>

    <template v-if="selected_provider">
      <u-smart-switch
        v-model="enable"
        :false-title="$t('global.commons.disable')"
        :true-title="$t('global.commons.enable')"
        class="my-3"
        false-description="Your emails will be sent via your myselldone domain."
        false-gray
        false-icon="close"
        true-description="Your emails will be sent via your custom mail domain."
        true-icon="check"
      >
      </u-smart-switch>

      <s-widget-header
        class="mt-6"
        icon="tune"
        title="Configs"
      ></s-widget-header>

      <v-list-subheader>
        To configure your custom mail service for your shop, input your service
        API key along with other necessary settings.
      </v-list-subheader>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ Host ━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-text-field
        v-if="selected_provider?.options?.host"
        v-model="host"
        :label="selected_provider.options.host?.label"
        :messages="selected_provider.options.host?.message"
        :placeholder="selected_provider.options?.host?.placeholder"
        class="my-3"
        persistent-placeholder
        variant="underlined"
      ></v-text-field>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ Port ━━━━━━━━━━━━━━━━━━━━━━ -->
      <u-number-input
        v-if="selected_provider?.options?.port"
        v-model="port"
        :label="selected_provider.options.port?.label"
        :max="65535"
        :messages="selected_provider.options.port?.message"
        :min="20"
        :placeholder="selected_provider.options?.port?.placeholder"
        class="my-3"
        clearable
        variant="underlined"
      ></u-number-input>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ API Key ━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-text-field
        v-if="selected_provider?.options?.api"
        v-model="api"
        :append-inner-icon="show_api ? 'visibility' : 'visibility_off'"
        :label="selected_provider.options.api?.label"
        :messages="selected_provider.options.api?.message"
        :placeholder="selected_provider.options?.api?.placeholder"
        :type="show_api ? 'test' : 'password'"
        class="my-3"
        persistent-placeholder
        variant="underlined"
        @click:append-inner="show_api = !show_api"
      ></v-text-field>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ Endpoint ━━━━━━━━━━━━━━━━━━━━━━ -->
      <v-select
        v-if="selected_provider?.options?.endpoint?.items /*It's a list!*/"
        v-model="endpoint"
        :items="selected_provider.options.endpoint?.items"
        :label="selected_provider.options.endpoint?.label"
        :messages="selected_provider.options.endpoint?.message"
        :placeholder="selected_provider.options?.endpoint?.placeholder"
        class="my-3"
        persistent-placeholder
        variant="underlined"
      ></v-select>
      <v-text-field
        v-else-if="selected_provider?.options?.endpoint"
        v-model="endpoint"
        :label="selected_provider.options.endpoint?.label"
        :messages="selected_provider.options?.endpoint?.message"
        :placeholder="selected_provider.options?.endpoint?.placeholder"
        class="my-3"
        persistent-placeholder
        variant="underlined"
      ></v-text-field>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ User name ━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-text-field
        v-if="selected_provider?.options?.username"
        v-model="username"
        :label="selected_provider.options.username?.label"
        :messages="selected_provider.options?.username?.message"
        :placeholder="selected_provider.options?.username?.placeholder"
        class="my-3"
        persistent-placeholder
        variant="underlined"
      ></v-text-field>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ Password ━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-text-field
        v-if="selected_provider?.options?.password"
        v-model="password"
        :append-inner-icon="show_password ? 'visibility' : 'visibility_off'"
        :label="selected_provider.options?.password?.label"
        :messages="selected_provider.options?.password?.message"
        :placeholder="selected_provider.options?.password?.placeholder"
        :type="show_password ? 'test' : 'password'"
        class="my-3"
        persistent-placeholder
        variant="underlined"
        @click:append-inner="show_password = !show_password"
      ></v-text-field>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ Encryption ━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-list-subheader>
        <div>
          Email providers may offer SSL, TLS, or unencrypted connections based
          on available ports. If connecting results in an error, altering the
          encryption mode might resolve the issue. Standard <b>TLS</b> use Port
          : <b>587</b> and <b>SSL</b> use Port : <b>465</b>.
        </div>
      </v-list-subheader>
      <u-smart-select
        v-model="encryption"
        :items="encryption_options"
        class="my-3"
        item-description="description"
        item-text="title"
        item-value="value"
      >
      </u-smart-select>

      <s-widget-header class="mt-5" icon="contact_mail" title="From">
      </s-widget-header>
      <v-list-subheader
        >You can configure the default sender's name and email address, which
        will be used for dispatching emails to your customers.
      </v-list-subheader>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ Default Sender Email ━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-text-field
        v-model="from"
        append-icon="alternate_email"
        label="From Email"
        persistent-placeholder
        placeholder="support@yourdomain.com"
        variant="underlined"
      ></v-text-field>

      <!-- ━━━━━━━━━━━━━━━━━━━━━━ Default Sender Name ━━━━━━━━━━━━━━━━━━━━━━ -->

      <v-text-field
        v-model="from_name"
        :placeholder="shop.title + ' team'"
        append-icon="person"
        label="From Name"
        persistent-placeholder
        variant="underlined"
      ></v-text-field>

      <v-list-subheader v-if="enable">
        <div>
          <v-icon class="me-1">info</v-icon>
          You will receive a test mail on
          <b>{{ USER().email }}</b
          >.
        </div>
      </v-list-subheader>
    </template>

    <s-widget-buttons auto-fixed-position>
      <v-btn
        :class="{ disabled: !selected_provider }"
        :loading="busy_set"
        color="primary"
        size="x-large"
        @click="setMailService"
      >
        <v-icon start>save</v-icon>
        {{ $t("global.actions.save") }}
      </v-btn>
    </s-widget-buttons>
  </div>
</template>

<script>
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { EmailProviders } from "@selldone/core-js/enums/email/EmailProviders";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BShopEmailProvider",
  components: { SWidgetButtons, USmartSelect, USmartSwitch, UNumberInput },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    mail_service: null,
    busy: false,

    email_providers: EmailProviders,

    encryption_options: [
      {
        value: "tls",
        title: "TLS",
        description:
          "TLS secures email by encrypting data during transmission.",
      },
      {
        value: "ssl",
        title: "SSL",
        description:
          "SSL secures emails by encrypting data between you and the server.",
      },
      { value: "none", title: "None ", description: "Not encrypted." },
    ],

    //----------------------------
    enable: false,
    driver: "mailgun",
    host: null,
    port: 25,
    from: null,
    from_name: null,
    api: null,
    username: null,
    password: null,
    endpoint: null,
    encryption: null,

    busy_set: false,

    show_api: false,
    show_password: false,
    //----------------------------
    busy_reset: false,
  }),

  computed: {
    selected_provider() {
      return (
        this.driver &&
        this.email_providers.find((i) => i.driver === this.driver)
      );
    },
  },

  watch: {},
  created() {
    // Pre load service:
    this.mail_provider = this.shop.mail_provider;

    // Full load service info:
    this.fetchShopMailService();
  },

  methods: {
    assign() {
      if (this.mail_service) {
        this.enable = this.mail_service.enable;
        this.driver = this.mail_service.driver;
        this.host = this.mail_service.host;
        this.port = this.mail_service.port;
        this.from = this.mail_service.from;
        this.from_name = this.mail_service.from_name;
        this.api = this.mail_service.api;
        this.username = this.mail_service.username;
        this.password = this.mail_service.password;
        this.endpoint = this.mail_service.endpoint;
        this.encryption = this.mail_service.encryption;
      } else {
        this.resetToDefault(); // 🞇 Reset to default
      }
    },

    fetchShopMailService() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_MAIL_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.mail_service = data.mail_service;

            this.assign();
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

    setMailService() {
      this.busy_set = true;
      axios
        .post(window.API.POST_SET_SHOP_MAIL_SERVICE(this.shop.id), {
          enable: this.enable,
          driver: this.driver,
          host: this.host,
          port: this.port,
          from: this.from,
          from_name: this.from_name,
          api: this.api,
          username: this.username,
          password: this.password,
          endpoint: this.endpoint,
          encryption: this.encryption,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.mail_service = data.mail_service;
            this.shop.mail_service = data.mail_service;

            this.showSuccessAlert(
              null,
              "Shop mail service updated successfully!",
            );
            this.edit_dialog = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_set = false;
        });
    },

    resetErrors() {
      this.busy_reset = true;
      axios
        .post(window.API.POST_RESET_SHOP_MAIL_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.mail_service = data.mail_service;
            this.shop.mail_service = data.mail_service;

            this.showSuccessAlert(null, "Shop mail service errors reset!");
            this.edit_dialog = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reset = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>

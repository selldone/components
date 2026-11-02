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
  <section class="b-shop-email-provider text-start" :aria-busy="busy">
    <u-loading-progress v-if="busy" class="b-shop-email-provider__progress" />

    <div class="b-shop-email-provider__cards" :inert="busy || undefined">
      <section
        class="sd-modern-widget b-shop-email-provider__card b-shop-email-provider__provider-card"
      >
        <header class="sd-modern-header b-shop-email-provider__header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain b-shop-email-provider__heading-icon">
              <v-icon aria-hidden="true">send</v-icon>
            </span>
            <div>
              <h2 class="sd-modern-title-text b-shop-email-provider__title">
                {{ $t("shop_email_provider.title") }}
              </h2>
              <p class="sd-modern-subtitle">{{ $t("shop_email_provider.subtitle") }}</p>
            </div>
          </div>

          <div class="b-shop-email-provider__header-actions">
            <span
              v-if="selected_provider && !busy"
              class="sd-modern-status sd-modern-status--plain"
            >
              <span
                class="sd-modern-status__dot"
                :class="enable ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--error'"
                aria-hidden="true"
              />
              {{
                $t(
                  enable
                    ? "shop_email_provider.status_enabled"
                    : "shop_email_provider.status_disabled",
                )
              }}
            </span>
          </div>
        </header>

        <u-smart-select
          v-model="driver"
          :items="email_providers"
          class="sd-modern-smart-select b-shop-email-provider__provider"
          item-description="description"
          item-image="icon"
          item-text="title"
          item-value="driver"
          :label="$t('shop_email_provider.provider')"
          accessible
          border
        />

        <u-smart-switch
          v-if="selected_provider"
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          class="sd-modern-smart-select sd-modern-smart-select--columns b-shop-email-provider__enable"
          :false-description="$t('shop_email_provider.enable_input.false_description')"
          false-gray
          false-icon="close"
          :true-description="$t('shop_email_provider.enable_input.true_description')"
          true-icon="check"
          accessible
          border
        />

        <div
          v-if="mail_service && mail_service.errors > 10"
          class="sd-modern-notice b-shop-email-provider__notice"
          role="status"
        >
          <v-icon size="18" color="warning" aria-hidden="true">warning_amber</v-icon>
          <div class="sd-modern-notice__content">
            {{ $t("shop_email_provider.messages.provider_error_limit") }}
          </div>
        </div>

        <div
          v-if="mail_service && mail_service.error"
          class="sd-modern-notice b-shop-email-provider__notice"
          role="alert"
        >
          <v-icon size="18" color="error" aria-hidden="true">error_outline</v-icon>
          <div class="sd-modern-notice__content">{{ mail_service.error }}</div>
        </div>

        <div v-if="mail_service && mail_service.errors > 0" class="b-shop-email-provider__reset">
          <v-btn
            :loading="busy_reset"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            prepend-icon="restart_alt"
            @click="resetErrors"
          >
            {{ $t("shop_email_provider.actions.reset_errors", { count: mail_service.errors }) }}
          </v-btn>
        </div>
      </section>

      <section
        v-if="selected_provider"
        class="sd-modern-widget b-shop-email-provider__card b-shop-email-provider__configuration-card"
      >
        <div class="sd-modern-title b-shop-email-provider__section-heading">
          <span class="sd-modern-icon sd-modern-icon--plain b-shop-email-provider__heading-icon">
            <v-icon aria-hidden="true">tune</v-icon>
          </span>
          <div>
            <h3>
              {{
                $t("shop_email_provider.config.provider_title", {
                  provider: selected_provider.title,
                })
              }}
            </h3>
            <p class="sd-modern-subtitle">{{ $t("shop_email_provider.config.subtitle") }}</p>
          </div>
        </div>

        <div class="sd-modern-form-grid b-shop-email-provider__fields">
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Host ━━━━━━━━━━━━━━━━━━━━━━ -->
          <v-text-field
            v-if="selected_provider?.options?.host"
            v-model="host"
            :label="selected_provider.options.host?.label"
            :messages="selected_provider.options.host?.message"
            :placeholder="selected_provider.options?.host?.placeholder"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            persistent-placeholder
            variant="underlined"
          />

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Port ━━━━━━━━━━━━━━━━━━━━━━ -->
          <u-number-input
            v-if="selected_provider?.options?.port"
            v-model="port"
            :label="selected_provider.options.port?.label"
            :max="65535"
            :messages="selected_provider.options.port?.message"
            :min="20"
            :placeholder="selected_provider.options?.port?.placeholder"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            clearable
            variant="underlined"
          />

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ API Key ━━━━━━━━━━━━━━━━━━━━━━ -->
          <v-text-field
            v-if="selected_provider?.options?.api"
            v-model="api"
            :append-inner-icon="show_api ? 'visibility' : 'visibility_off'"
            :label="selected_provider.options.api?.label"
            :messages="selected_provider.options.api?.message"
            :placeholder="selected_provider.options?.api?.placeholder"
            :type="show_api ? 'text' : 'password'"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            persistent-placeholder
            variant="underlined"
            @click:append-inner="show_api = !show_api"
          />

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Endpoint ━━━━━━━━━━━━━━━━━━━━━━ -->
          <v-select
            v-if="selected_provider?.options?.endpoint?.items /*It's a list!*/"
            v-model="endpoint"
            :items="selected_provider.options.endpoint?.items"
            :label="selected_provider.options.endpoint?.label"
            :messages="selected_provider.options.endpoint?.message"
            :placeholder="selected_provider.options?.endpoint?.placeholder"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            persistent-placeholder
            variant="underlined"
          />
          <v-text-field
            v-else-if="selected_provider?.options?.endpoint"
            v-model="endpoint"
            :label="selected_provider.options.endpoint?.label"
            :messages="selected_provider.options?.endpoint?.message"
            :placeholder="selected_provider.options?.endpoint?.placeholder"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            persistent-placeholder
            variant="underlined"
          />

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ User name ━━━━━━━━━━━━━━━━━━━━━━ -->
          <v-text-field
            v-if="selected_provider?.options?.username"
            v-model="username"
            :label="selected_provider.options.username?.label"
            :messages="selected_provider.options?.username?.message"
            :placeholder="selected_provider.options?.username?.placeholder"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            persistent-placeholder
            variant="underlined"
          />

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Password ━━━━━━━━━━━━━━━━━━━━━━ -->
          <v-text-field
            v-if="selected_provider?.options?.password"
            v-model="password"
            :append-inner-icon="show_password ? 'visibility' : 'visibility_off'"
            :label="selected_provider.options?.password?.label"
            :messages="selected_provider.options?.password?.message"
            :placeholder="selected_provider.options?.password?.placeholder"
            :type="show_password ? 'text' : 'password'"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            persistent-placeholder
            variant="underlined"
            @click:append-inner="show_password = !show_password"
          />
        </div>

        <!-- ━━━━━━━━━━━━━━━━━━━━━━ Encryption ━━━━━━━━━━━━━━━━━━━━━━ -->
        <div class="b-shop-email-provider__encryption">
          <u-smart-select
            v-model="encryption"
            :items="encryption_options"
            :label="$t('shop_email_provider.encryption.title')"
            class="sd-modern-smart-select"
            item-description="description"
            item-text="title"
            item-value="value"
            accessible
            border
          />
          <p
            class="b-shop-email-provider__encryption-help"
            v-html="$t('shop_email_provider.messages.encryption_ports_guide')"
          />
        </div>
      </section>

      <section
        v-if="selected_provider"
        class="sd-modern-widget b-shop-email-provider__card b-shop-email-provider__sender-card"
      >
        <div class="sd-modern-title b-shop-email-provider__section-heading">
          <span class="sd-modern-icon sd-modern-icon--plain b-shop-email-provider__heading-icon">
            <v-icon aria-hidden="true">contact_mail</v-icon>
          </span>
          <div>
            <h3>{{ $t("shop_email_provider.sender.title") }}</h3>
            <p class="sd-modern-subtitle">{{ $t("shop_email_provider.sender.subtitle") }}</p>
          </div>
        </div>

        <div class="sd-modern-form-grid b-shop-email-provider__fields">
          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Default Sender Email ━━━━━━━━━━━━━━━━━━━━━━ -->
          <v-text-field
            v-model="from"
            append-icon="alternate_email"
            :label="$t('shop_email_provider.inputs.from.label')"
            class="sd-modern-underlined-field b-shop-email-provider__technical-field"
            persistent-placeholder
            placeholder="support@yourdomain.com"
            variant="underlined"
          />

          <!-- ━━━━━━━━━━━━━━━━━━━━━━ Default Sender Name ━━━━━━━━━━━━━━━━━━━━━━ -->
          <v-text-field
            v-model="from_name"
            :placeholder="shop.title + ' team'"
            append-icon="person"
            :label="$t('shop_email_provider.inputs.from_name.label')"
            class="sd-modern-underlined-field"
            persistent-placeholder
            variant="underlined"
          />
        </div>
      </section>

      <section
        class="sd-modern-widget b-shop-email-provider__card b-shop-email-provider__actions-card"
      >
        <div class="sd-modern-title b-shop-email-provider__section-heading">
          <span class="sd-modern-icon sd-modern-icon--plain b-shop-email-provider__heading-icon">
            <v-icon aria-hidden="true">mark_email_read</v-icon>
          </span>
          <div>
            <h3>{{ $t("shop_email_provider.save_test.title") }}</h3>
          </div>
        </div>
        <template v-if="selected_provider">
          <div class="sd-modern-notice b-shop-email-provider__notice">
            <v-icon size="18" aria-hidden="true">info_outline</v-icon>
            <div class="sd-modern-notice__content">
              {{ $t("shop_email_provider.messages.configuration_not_verified") }}
            </div>
          </div>
          <p
            v-if="enable"
            class="b-shop-email-provider__test-recipient"
            v-html="$t('shop_email_provider.messages.enable_receive_test', { email: USER().email })"
          />
        </template>

        <s-widget-buttons class="b-shop-email-provider__actions">
          <v-btn
            v-if="selected_provider && enable"
            :loading="busy_send_test"
            class="sd-modern-button sd-modern-button--form b-shop-email-provider__action b-shop-email-provider__test"
            variant="outlined"
            prepend-icon="outgoing_mail"
            @click="sendTestMail"
          >
            {{ $t("shop_email_provider.actions.send_test_email") }}
          </v-btn>
          <v-btn
            :disabled="!selected_provider"
            :loading="busy_set"
            class="sd-modern-button sd-modern-button--form sd-modern-button--primary b-shop-email-provider__action"
            color="primary"
            prepend-icon="save"
            @click="setMailService"
          >
            {{ $t("global.actions.save") }}
          </v-btn>
        </s-widget-buttons>
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import { EmailProviders } from "@selldone/core-js/enums/email/EmailProviders";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopEmailProvider",
  mixins: [],
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
        description: "shop_email_provider.encryption.tls_description",
      },
      {
        value: "ssl",
        title: "SSL",
        description: "shop_email_provider.encryption.ssl_description",
      },
      {
        value: "none",
        title: "shop_email_provider.encryption.none_title",
        description: "shop_email_provider.encryption.none_description",
      },
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
    busy_send_test: false,

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
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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

            NotificationService.showSuccessAlert(
              null,
              "Shop mail service updated successfully!",
            );
            this.edit_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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

            NotificationService.showSuccessAlert(null, "Shop mail service errors reset!");
            this.edit_dialog = false;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reset = false;
        });
    },

    sendTestMail() {
      this.busy_send_test = true;
      axios
        .post(window.API.POST_SHOP_MAIL_SERVICE_TEST(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              "Send Success",
              "Test email sent successfully. Please check your inbox.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_send_test = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-shop-email-provider {
  position: relative;
  min-width: 0;

  &__progress { position: absolute; inset-block-start: 0; inset-inline: 0; }
  &__cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
  &__card.sd-modern-widget { padding: 22px; border: 0; border-radius: 0; box-shadow: none; }
  &__card:first-child { border-start-start-radius: 18px; border-start-end-radius: 18px; }
  &__card:last-child { border-end-start-radius: 18px; border-end-end-radius: 18px; }
  &__header { align-items: flex-start; gap: 16px; margin-block-end: 21px; }
  &__header .sd-modern-title { flex: 1 1 280px; gap: 10px; }
  &__title { font-size: 18px; font-weight: 500; line-height: 24px; letter-spacing: -0.2px; }
  &__heading-icon.sd-modern-icon { flex-basis: 18px; width: 18px; height: 18px; margin-block-start: 3px; }
  &__heading-icon :deep(.v-icon) { font-size: 18px !important; }
  &__card .sd-modern-subtitle { margin-block: 4px 0; font-size: 13px; font-weight: 400; line-height: 20px; }
  &__header-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
  &__provider { margin: 0; }
  &__enable { margin-block-start: 20px; }
  &__reset { margin-block-start: 8px; }
  &__section-heading { gap: 10px; }
  &__section-heading h3 { margin: 0; font-size: 14px; font-weight: 500; line-height: 21px; }
  &__fields { gap: 22px; margin-block-start: 21px; }
  &__technical-field :deep(input) { direction: ltr; text-align: start; }
  &__encryption { margin-block-start: 22px; }
  &__encryption-help { margin-block: 10px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__notice { gap: 9px; margin-block-start: 16px; padding: 13px; font-size: 12px; line-height: 19px; }
  &__notice p { margin: 0; }
  &__actions-card.sd-modern-widget { padding-block: 18px 20px; }
  &__actions-card .b-shop-email-provider__notice { margin-block-start: 14px; }
  &__test-recipient { margin-block: 10px 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  &__actions {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    width: 100%;
    max-width: 100%;
    margin: 17px 0 0;
    padding: 0;
  }
  &__actions > .b-shop-email-provider__action {
    --v-btn-height: 42px;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    min-height: 42px;
    height: auto;
    max-height: none;
    margin: 0;
    padding: 10px 15px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__action :deep(.v-icon) { width: 16px; height: 16px; font-size: 16px; }
  &__action :deep(.v-btn__prepend) { margin-inline: 0 7px; }
  &__test { margin-inline-end: auto !important; border-color: var(--sd-modern-border); }
  &__actions :deep(.v-btn__content) { white-space: normal; }

  @media (max-width: 600px) {
    &__card.sd-modern-widget { padding: 20px 16px; }
    &__fields { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    &__header { display: block; }
    &__header .sd-modern-title { flex-basis: 100%; }
    &__header-actions { margin-block-start: 10px; margin-inline-start: 28px; }
  }

  @media (max-width: 600px), (pointer: coarse) {
    &__actions > .b-shop-email-provider__action { --v-btn-height: 44px; min-height: 44px; }
  }
}
</style>

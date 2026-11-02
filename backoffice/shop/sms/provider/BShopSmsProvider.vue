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
  <div
    class="sms-provider text-start"
    :class="{
      'sms-provider--modern sd-modern-form': modern,
      disabled: !modern && busy,
      'disabled-no-filter': modern && busy,
    }"
    :aria-busy="busy"
  >
    <header
      v-if="modern"
      class="sd-modern-provider-header sd-modern-provider-header--compact sms-provider__identity"
    >
      <div class="sd-modern-title">
        <img
          v-if="selected_provider?.icon"
          :src="selected_provider.icon"
          alt=""
          class="sms-provider__logo"
        />
        <div>
          <h2 class="sd-modern-provider-title">
            {{ selected_provider?.title || $t("shop_sms_provider.title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_sms.modern.provider_subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        v-if="selected_provider?.link"
        :href="selected_provider.link"
        class="sd-modern-button sd-modern-button--inline"
        color="primary"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
      >
        {{ $t("global.actions.visit") }} {{ selected_provider.title }}
        <v-icon end aria-hidden="true">north_east</v-icon>
      </v-btn>
    </header>
    <!-- ████████████████████████ Service ████████████████████████ -->

    <div :class="modern ? 'sms-provider__settings' : 'widget-box my-5'">
      <section :class="{ 'sd-modern-widget sms-provider__card': modern }">
        <header v-if="modern" class="sms-provider__section-heading">
          <v-icon aria-hidden="true">settings_suggest</v-icon>
          <div>
            <h3>{{ $t("shop_sms.modern.provider_settings") }}</h3>
            <p>{{ $t("shop_sms.modern.provider_preferences_help") }}</p>
          </div>
        </header>
        <u-widget-header
          v-else
          :add-caption="
            sms_service && sms_service.errors > 0
              ? `${$t('shop_sms_provider.reset_error')} (${sms_service.errors})`
              : undefined
          "
          :add-loading="busy_reset"
          add-icon="autorenew"
          icon="private_connectivity"
          :title="$t('shop_sms_provider.title')"
          @click:add="resetErrors"
        >
        </u-widget-header>

        <u-loading-progress v-if="busy"></u-loading-progress>
        <v-list-subheader v-if="!modern">
          {{ $t("shop_sms_provider.subtitle") }}
        </v-list-subheader>

        <!-- ████████████████████ Select Service ████████████████████ -->

        <u-smart-select
          v-model="driver"
          :items="sms_providers"
          class="my-3"
          :class="{
            'sd-modern-smart-select sms-provider__provider-select': modern,
          }"
          :accessible="modern"
          :border="modern"
          item-description="description"
          item-image="icon"
          item-text="title"
          item-value="driver"
          :label="modern ? $t('shop_sms.modern.provider_label') : undefined"
          :title="modern ? undefined : 'Provider'"
        >
        </u-smart-select>

        <v-btn
          v-if="!modern && selected_provider?.link"
          :href="selected_provider.link"
          class="font-weight-bold float-end tnt"
          color="primary"
          size="small"
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
        >
          {{ $t("global.actions.visit") }}
          {{ selected_provider.title }}
          <v-icon end>open_in_new</v-icon>
        </v-btn>

        <div
          v-if="selected_provider"
          class="d-flex align-center my-2"
          :class="{ 'sms-provider__capabilities': modern }"
        >
          <div
            class="w-50"
            :title="modern ? undefined : 'Support custom text message?'"
          >
            <v-icon
              class="me-1"
              :color="modern ? undefined : '#111'"
              aria-hidden="true"
              >subject</v-icon
            >

            {{ $t("shop_sms_provider.plain_text") }}
            <u-check
              :model-value="selected_provider.support_text"
              class="ms-2"
              read-only
            ></u-check>
          </div>
          <div
            class="w-50"
            :title="modern ? undefined : 'Support custom template message?'"
          >
            <v-icon
              class="me-1"
              :color="modern ? undefined : '#111'"
              aria-hidden="true"
              >data_object</v-icon
            >

            {{ $t("shop_sms_provider.structural_template") }}
            <u-check
              :model-value="selected_provider.support_template"
              class="ms-2"
              read-only
            ></u-check>
          </div>
        </div>

        <!-- ████████████████████ Messages ████████████████████ -->

        <v-expand-transition>
          <div
            v-if="selected_provider?.messages"
            :class="{ 'sms-provider__messages': modern }"
          >
            <ul
              class="mb-6"
              :class="{ 'sms-provider__provider-messages': modern }"
            >
              <li
                v-for="it in selected_provider.messages"
                :key="it"
                v-html="it"
              ></li>
            </ul>
          </div>
        </v-expand-transition>

        <!-- ████████████████████ Errors ████████████████████ -->

        <v-list-subheader
          v-if="!modern && sms_service && sms_service.errors > 10"
          class="mt-5"
        >
          <v-icon class="me-1" color="amber">warning</v-icon>

          {{ $t("shop_sms_provider.errors_limit_msg") }}
        </v-list-subheader>

        <v-alert
          v-if="!modern && sms_service && sms_service.error"
          class="mt-5"
          color="red"
          text
          type="error"
          density="compact"
          >{{ sms_service.error }}
        </v-alert>
      </section>
      <!-- ████████████████████ Configs ████████████████████ -->

      <section
        v-if="selected_provider && selected_provider?.driver !== 'default'"
        :class="{ 'sd-modern-widget sms-provider__card': modern }"
      >
        <u-widget-header
          class="mt-6"
          :class="{ 'sd-modern-form-header sms-provider__subheading': modern }"
          icon="tune"
          :title="modern ? $t('shop_sms.modern.provider_configs') : 'Configs'"
        ></u-widget-header>

        <u-smart-switch
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          :class="
            modern
              ? 'sd-modern-smart-select sd-modern-smart-select--columns sms-provider__control'
              : 'my-5'
          "
          :accessible="modern"
          :border="modern"
          :false-description="
            $t('shop_sms_provider.enable_input.false_description')
          "
          false-gray
          false-icon="close"
          :true-description="
            $t('shop_sms_provider.enable_input.true_description')
          "
          true-icon="check"
        >
        </u-smart-switch>
        <u-smart-select
          v-if="selected_provider?.networks?.length"
          v-model="network"
          :disabled="!enable"
          :items="selected_provider?.networks"
          class="my-5"
          :class="{ 'sd-modern-smart-select sms-provider__control': modern }"
          :accessible="modern"
          :border="modern"
          item-description="description"
          item-text="title"
          item-value="value"
        >
        </u-smart-select>

        <u-smart-select
          v-model="option"
          :disabled="!enable"
          :items="options"
          class="my-5"
          :class="{
            'sd-modern-smart-select sd-modern-smart-select--columns sms-provider__control':
              modern,
          }"
          :accessible="modern"
          :border="modern"
          :force-show-all="modern"
          item-description="desc"
          item-icon="icon"
          item-text="title"
          item-value="value"
        ></u-smart-select>
      </section>

      <!-- ████████████████████ Tokens ████████████████████ -->

      <section
        v-if="selected_provider?.tokens?.length"
        :class="{ 'sd-modern-widget sms-provider__card': modern }"
      >
        <u-widget-header
          class="mt-6"
          :class="{ 'sd-modern-form-header sms-provider__subheading': modern }"
          icon="token"
          :title="$t('shop_sms_provider.tokens.title')"
        ></u-widget-header>
        <p v-if="modern" class="sms-provider__guidance">
          {{ $t("shop_sms_provider.tokens.subtitle") }}
        </p>
        <v-list-subheader v-else>{{
          $t("shop_sms_provider.tokens.subtitle")
        }}</v-list-subheader>
        <div :class="{ 'sd-modern-form-grid sms-provider__tokens': modern }">
          <v-text-field
            v-for="(token, i) in selected_provider.tokens"
            :key="token"
            v-model="tokens[i]"
            :disabled="!enable"
            :label="token"
            :placeholder="
              selected_provider?.placeholders &&
              selected_provider.placeholders[i]
            "
            persistent-placeholder
            variant="underlined"
            :class="{ 'sd-modern-underlined-field': modern }"
          ></v-text-field>
        </div>
      </section>

      <!-- ████████████████████ Test ████████████████████ -->

      <section
        :class="{
          'sd-modern-widget sms-provider__card sms-provider__save-card': modern,
        }"
      >
        <header v-if="modern" class="sms-provider__section-heading">
          <v-icon aria-hidden="true">mark_chat_read</v-icon>
          <div>
            <h3>{{ $t("shop_sms.modern.provider_save_test") }}</h3>
            <p>{{ $t("shop_sms.modern.provider_save_help") }}</p>
          </div>
        </header>
        <template
          v-if="USER().phone && driver && driver !== 'default' && enable"
        >
          <hr v-if="!modern" />
          <u-smart-toggle
            v-model="test"
            :accessible="modern"
            :true-description="
              $t('shop_sms_provider.test_input.true_description', {
                phone: USER().phone,
              })
            "
            :class="
              modern ? 'sms-provider__test sd-modern-control-colors' : 'my-5'
            "
            color="success"
            false-gray
            true-icon="ad_units"
            :true-title="$t('shop_sms_provider.test_input.true_title')"
          ></u-smart-toggle>
          <hr v-if="!modern" class="my-5" />
        </template>

        <s-widget-buttons
          auto-fixed-position
          :class="{ 'sd-modern-form-actions sms-provider__actions': modern }"
        >
          <v-btn
            :class="{
              disabled: !selected_provider,
              'sd-modern-button sd-modern-button--primary': modern,
            }"
            :disabled="modern && !selected_provider"
            class="sms-provider__save"
            :loading="busy_set"
            color="primary"
            :size="modern ? 'default' : 'x-large'"
            @click="setSmsService"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </s-widget-buttons>
      </section>
    </div>

    <section
      v-if="
        modern && sms_service && (sms_service.errors > 0 || sms_service.error)
      "
      class="sd-modern-widget sms-provider__errors"
    >
      <header class="sms-provider__section-heading">
        <v-icon aria-hidden="true">error_outline</v-icon>
        <div>
          <h3>{{ $t("shop_sms.modern.provider_errors") }}</h3>
          <p
            v-if="sms_service.errors > 0"
            class="sd-modern-status sd-modern-status--plain"
          >
            <span
              class="sd-modern-status__dot sd-modern-status__dot--error"
              aria-hidden="true"
            ></span>
            {{
              $t("shop_sms.modern.provider_errors_count", {
                count: sms_service.errors,
              })
            }}
          </p>
        </div>
        <v-btn
          v-if="sms_service.errors > 0"
          :loading="busy_reset"
          class="sd-modern-button"
          variant="outlined"
          @click="resetErrors"
        >
          <v-icon start aria-hidden="true">restart_alt</v-icon>
          {{ $t("shop_sms_provider.reset_error") }}
        </v-btn>
      </header>
      <div
        v-if="sms_service.errors > 10"
        class="sd-modern-notice sms-provider__error-notice"
        role="status"
      >
        <v-icon color="warning" aria-hidden="true">warning_amber</v-icon>
        <p class="sd-modern-notice__content">
          {{ $t("shop_sms_provider.errors_limit_msg") }}
        </p>
      </div>
      <div
        v-if="sms_service.error"
        class="sd-modern-notice sms-provider__error-notice"
        role="status"
      >
        <v-icon color="error" aria-hidden="true">error_outline</v-icon>
        <p class="sd-modern-notice__content">{{ sms_service.error }}</p>
      </div>
    </section>

    <!-- ████████████████████████ Actions ████████████████████████ -->
    <div
      v-if="has_sync_action"
      :class="
        modern ? 'sd-modern-widget sms-provider__sync' : 'widget-box my-5'
      "
    >
      <u-widget-header
        :class="{ 'sd-modern-form-header sms-provider__subheading': modern }"
        icon="fact_check"
        :title="$t('shop_sms_provider.sync_action.title')"
      ></u-widget-header>

      <u-loading-progress v-if="busy"></u-loading-progress>
      <v-list-subheader>
        {{ $t("shop_sms_provider.sync_action.subtitle") }}
      </v-list-subheader>

      <u-smart-verify v-model="check" class="mb-3"></u-smart-verify>

      <div
        v-if="has_sync_action"
        class="widget-buttons"
        :class="{ 'sms-provider__sync-actions': modern }"
      >
        <v-btn
          :class="{
            disabled: !check,
            'sd-modern-button sd-modern-button--primary': modern,
          }"
          :disabled="modern && !check"
          :loading="busy_sync"
          color="primary"
          :size="modern ? 'default' : 'x-large'"
          @click="syncContacts()"
        >
          <v-icon start>contacts</v-icon>

          {{ $t("shop_sms_provider.sync_action.action") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { SetupService } from "@selldone/core-js/server/SetupService";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopSmsProvider",
  mixins:[],

  components: {
    SWidgetButtons,
    USmartVerify,
    USmartToggle,
    USmartSelect,
    USmartSwitch,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    modern: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    sms_service: null,
    busy: false,

    sms_providers: Object.values(SmsProviders).filter(
      (i) => !i.locals || i.locals.includes(SetupService.LocalServiceCountry()),
    ),

    //----------------------------

    //----------------------------
    option: "all",
    test: false,

    enable: true,
    driver: "default",
    tokens: [null, null, null, null, null],
    network: null,

    busy_set: false,

    show_api: false,
    show_password: false,
    //----------------------------
    busy_reset: false,

    //----------------------------
    busy_sync: false,
    check: false,
  }),

  computed: {
    selected_provider() {
      return (
        this.driver && this.sms_providers.find((i) => i.driver === this.driver)
      );
    },

    options() {
      return [
        {
          value: "all",
          title: this.$t('sms_messages_options.all.title'),
          desc:  this.$t('sms_messages_options.all.description'),
          icon: "notifications_active",
        },
        {
          value: "otp",
          title:this.$t('sms_messages_options.otp.title'),
          desc: this.$t('sms_messages_options.otp.description'),
          icon: "pin",
        },
      ];
    },

    has_sync_action() {
      return (
        this.selected_provider?.actions &&
        this.selected_provider.actions.includes("sync")
      );
    },
  },

  watch: {},
  created() {
    // Pre load service:
    this.sms_service = this.shop.sms_service;
    this.assign();

    // Full load service info:
    this.fetchShopSmsService();
  },

  methods: {
    assign() {
      if (this.sms_service) {
        this.enable = this.sms_service.enable;
        this.driver = this.sms_service.driver;

        this.tokens = [
          this.sms_service.token_1,
          this.sms_service.token_2,
          this.sms_service.token_3,
          this.sms_service.token_4,
          this.sms_service.token_5,
        ];

        this.network = this.sms_service.network;

        this.option = this.sms_service.option;
      } else {
        this.resetToDefault(); // 🞇 Reset to default
      }
    },

    fetchShopSmsService() {
      this.busy = true;
      axios
        .get(window.API.GET_SHOP_SMS_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.sms_service = data.sms_service;

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

    setSmsService() {
      this.busy_set = true;
      axios
        .post(window.API.POST_SET_SHOP_SMS_SERVICE(this.shop.id), {
          enable: this.enable,
          driver: this.driver,

          token_1: this.tokens[0],
          token_2: this.tokens[1],
          token_3: this.tokens[2],
          token_4: this.tokens[3],
          token_5: this.tokens[4],

          option: this.option,

          network: this.network,

          test: this.test,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.sms_service = data.sms_service;
            this.shop.sms_service = data.sms_service;

            if (data.sms_service.error) {
              // Some error!
              NotificationService.showWarningAlert(
                "Something goes wrong!",
                data.sms_service.error,
              );
            } else {
              // Success:
              NotificationService.showSuccessAlert(
                null,
                "Shop SMS service updated successfully!",
              );
            }

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
        .post(window.API.POST_RESET_SHOP_SMS_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.sms_service = data.sms_service;

            NotificationService.showSuccessAlert(null, "Shop SMS service errors reset!");
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

    syncContacts() {
      this.busy_sync = true;
      axios
        .post(window.API.POST_SHOP_SMS_SERVICE_ACTION_SYNC(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Contacts syncing started successfully. <br><hr>" + data.message,
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
          this.busy_sync = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.sms-provider.sms-provider--modern {
  font-family: inherit;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.55;

  .sms-provider__identity {
    margin-block: 4px 20px;

    .sd-modern-title { gap: 12px; align-items: center; }
    h2 { margin: 0; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; }
    .sd-modern-subtitle { margin-block: 3px 0; font-size: 13px; line-height: 20px; }
  }

  .sms-provider__logo { flex: 0 0 28px; width: 28px; height: 28px; object-fit: contain; }
  .sms-provider__errors,
  .sms-provider__sync { padding: 20px; border-radius: 20px; }
  .sms-provider__settings { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .sms-provider__card.sd-modern-widget { min-width: 0; padding: 22px; border: 0; border-radius: 0; box-shadow: none; }
  .sms-provider__card:first-child { border-start-start-radius: 18px; border-start-end-radius: 18px; }
  .sms-provider__card:last-child { border-end-start-radius: 18px; border-end-end-radius: 18px; }
  .sms-provider__errors,
  .sms-provider__sync { margin-block-start: 16px; }

  .sms-provider__section-heading {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-block-end: 18px;

    > .v-icon { flex: 0 0 18px; font-size: 18px; color: var(--sd-modern-muted); margin-block-start: 2px; }
    > div { flex: 1; min-width: 0; }
    h3 { margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
    p { margin-block: 3px 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  }

  .sms-provider__provider-select { margin-block: 0 18px !important; }
  .sms-provider__capabilities {
    gap: 16px;
    margin-block: 14px 0 !important;
    font-size: 13px;
    line-height: 20px;

    > div { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-width: 0; }
    .v-icon { font-size: 18px; color: var(--sd-modern-muted); }
  }

  .sms-provider__messages { display: flow-root; }
  .sms-provider__provider-messages { margin-block: 16px 0 !important; padding-inline-start: 20px; font-size: 13px; line-height: 21px; }
  .sms-provider__control { margin-block: 18px !important; }
  .sms-provider__subheading {
    margin-block: 24px 12px !important;

    :deep(h2) { gap: 9px; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
    :deep(.--icon) { font-size: 18px !important; }
  }
  .sms-provider__card > .sms-provider__subheading { margin-block-start: 0 !important; }
  .sms-provider__card > .sms-provider__control:last-child { margin-block-end: 0 !important; }

  .sms-provider__guidance { margin-block: 0 12px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .sms-provider__tokens { gap: 20px; }
  .sms-provider__tokens :deep(input) { direction: ltr; text-align: start; }
  .sms-provider__test { margin-block: 0; }
  .sms-provider__actions { margin-block-start: 20px; }
  .sms-provider__actions :deep(.widget-buttons) {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 0;
  }
  .sms-provider__save.sd-modern-button {
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

    :deep(.v-icon) { width: 16px; height: 16px; font-size: 16px; }
    :deep(.v-icon--start) { margin-inline: 0 7px; }
    :deep(.v-btn__content) { white-space: normal; }
  }
  .sms-provider__error-notice { padding: 14px; font-size: 13px; line-height: 21px; }
  .sms-provider__error-notice + .sms-provider__error-notice { margin-block-start: 12px; }
  .sms-provider__sync > .sms-provider__subheading { margin-block-start: 0 !important; }
  .sms-provider__sync-actions { justify-content: flex-end; margin-block-start: 16px; }

  @media (max-width: 600px) {
    .sms-provider__card.sd-modern-widget { padding: 20px 16px; }
    .sms-provider__errors,
    .sms-provider__sync { padding: 18px 16px; }
    .sms-provider__section-heading { flex-wrap: wrap; }
    .sms-provider__section-heading > .v-btn { margin-inline-start: 27px; }
    .sms-provider__capabilities { flex-direction: column; align-items: stretch !important; gap: 12px; }
    .sms-provider__capabilities > div { width: 100% !important; }
  }

  @media (max-width: 600px), (pointer: coarse) {
    .sms-provider__save.sd-modern-button { --v-btn-height: 44px; min-height: 44px; }
  }
}
</style>

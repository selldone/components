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
  <div :class="{ disabled: busy }">
    <!-- ████████████████████████ Service ████████████████████████ -->

    <div class="widget-box my-5">
      <s-widget-header
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
      </s-widget-header>

      <u-loading-progress v-if="busy"></u-loading-progress>
      <v-list-subheader>
        {{ $t("shop_sms_provider.subtitle") }}
      </v-list-subheader>

      <!-- ████████████████████ Select Service ████████████████████ -->

      <u-smart-select
        v-model="driver"
        :items="sms_providers"
        class="my-3"
        item-description="description"
        item-image="icon"
        item-text="title"
        item-value="driver"
        title="Provider"
      >
      </u-smart-select>

      <v-btn
        v-if="selected_provider?.link"
        :href="selected_provider.link"
        class="font-weight-bold float-end tnt"
        color="primary"
        size="small"
        target="_blank"
        variant="text"
      >
        {{ $t("global.actions.visit") }}
        {{ selected_provider.title }}
        <v-icon end>open_in_new</v-icon>

      </v-btn>

      <div v-if="selected_provider" class="d-flex align-center my-2">
        <div class="w-50" title="Support custom text message?">
          <v-icon class="me-1" color="#111">subject</v-icon>

          {{ $t("shop_sms_provider.plain_text") }}
          <u-check
            :model-value="selected_provider.support_text"
            class="ms-2"
            read-only
          ></u-check>
        </div>
        <div class="w-50" title="Support custom template message?">
          <v-icon class="me-1" color="#111">data_object</v-icon>

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
        <ul v-if="selected_provider?.messages" class="mb-6">
          <li
            v-for="it in selected_provider.messages"
            :key="it"
            v-html="it"
          ></li>
        </ul>
      </v-expand-transition>

      <!-- ████████████████████ Errors ████████████████████ -->

      <v-list-subheader
        v-if="sms_service && sms_service.errors > 10"
        class="mt-5"
      >
        <v-icon class="me-1" color="amber">warning</v-icon>

        {{ $t("shop_sms_provider.errors_limit_msg") }}
      </v-list-subheader>

      <v-alert
        v-if="sms_service && sms_service.error"
        class="mt-5"
        color="red"
        text
        type="error"
        density="compact"
        >{{ sms_service.error }}
      </v-alert>
      <!-- ████████████████████ Configs ████████████████████ -->

      <template
        v-if="selected_provider && selected_provider?.driver !== 'default'"
      >
        <s-widget-header
          class="mt-6"
          icon="tune"
          title="Configs"
        ></s-widget-header>

        <u-smart-switch
          v-model="enable"
          :false-title="$t('global.commons.disable')"
          :true-title="$t('global.commons.enable')"
          class="my-5"
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
          item-description="desc"
          item-icon="icon"
          item-text="title"
          item-value="value"
        ></u-smart-select>
      </template>

      <!-- ████████████████████ Tokens ████████████████████ -->

      <template v-if="selected_provider?.tokens?.length">
        <s-widget-header
          class="mt-6"
          icon="token"
          :title=" $t('shop_sms_provider.tokens.title') "
        ></s-widget-header>
        <v-list-subheader>{{$t('shop_sms_provider.tokens.subtitle') }}</v-list-subheader>
        <v-text-field
          v-for="(token, i) in selected_provider.tokens"
          :key="token"
          v-model="tokens[i]"
          :disabled="!enable"
          :label="token"
          :placeholder="
            selected_provider?.placeholders && selected_provider.placeholders[i]
          "
          persistent-placeholder
          variant="underlined"
        ></v-text-field>
      </template>

      <!-- ████████████████████ Test ████████████████████ -->

      <template v-if="USER().phone && driver && driver !== 'default' && enable">
        <hr />
        <u-smart-toggle
          v-model="test"
          :true-description="
            $t('shop_sms_provider.test_input.true_description', {
              phone: USER().phone,
            })
          "
          class="my-5"
          color="success"
          false-gray
          true-icon="ad_units"
          :true-title="$t('shop_sms_provider.test_input.true_title')"
        ></u-smart-toggle>
        <hr class="my-5" />
      </template>

      <s-widget-buttons auto-fixed-position>
        <v-btn
          :class="{ disabled: !selected_provider }"
          :loading="busy_set"
          color="primary"
          size="x-large"
          @click="setSmsService"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </s-widget-buttons>
    </div>

    <!-- ████████████████████████ Actions ████████████████████████ -->
    <div v-if="has_sync_action" class="widget-box my-5">
      <s-widget-header
        icon="fact_check"
        :title="$t('shop_sms_provider.sync_action.title')"
      ></s-widget-header>

      <u-loading-progress v-if="busy"></u-loading-progress>
      <v-list-subheader>
        {{ $t("shop_sms_provider.sync_action.subtitle") }}
      </v-list-subheader>

      <u-smart-verify v-model="check" class="mb-3"></u-smart-verify>

      <div v-if="has_sync_action" class="widget-buttons">
        <v-btn
          :class="{ disabled: !check }"
          :loading="busy_sync"
          color="primary"
          size="x-large"
          @click="syncContacts()"
        >
          <v-icon start>contacts</v-icon>

          {{ $t("shop_sms_provider.sync_action.action") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { SetupService } from "@selldone/core-js/server/SetupService";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BShopSmsProvider",
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
              this.showWarningAlert(
                "Something goes wrong!",
                data.sms_service.error,
              );
            } else {
              // Success:
              this.showSuccessAlert(
                null,
                "Shop SMS service updated successfully!",
              );
            }

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
        .post(window.API.POST_RESET_SHOP_SMS_SERVICE(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.sms_service = data.sms_service;

            this.showSuccessAlert(null, "Shop SMS service errors reset!");
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

    syncContacts() {
      this.busy_sync = true;
      axios
        .post(window.API.POST_SHOP_SMS_SERVICE_ACTION_SYNC(this.shop.id))
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              "Contacts syncing started successfully. <br><hr>" + data.message,
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
          this.busy_sync = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>

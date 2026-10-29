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
  <v-card class="text-start" :class="{ 'b-domain-setting--modern': modern }" rounded="0">
    <v-card-title class="d-flex align-center">
      <v-avatar
        class="avatar-gradient -thin -shop me-2"
        size="36"
        :image="getShopImagePath(shop.icon, 96)"
      >
      </v-avatar>
      <div>
        <b>
          <v-icon class="me-1">settings</v-icon>
          {{ $t("global.commons.domain") }}
        </b>
        |
        {{ domain.domain }}
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="modern && domain.externally_hosted" class="sd-modern-notice b-domain-setting__notice"><v-icon size="18">open_in_new</v-icon><span>{{ $t("admin_shop.dashboard.info.add_dialog.hosting.external_note") }}</span></div>
      <v-alert
        v-if="!modern && domain.externally_hosted"
        class="mb-5"
        color="deep-purple"
        icon="open_in_new"
        variant="tonal"
      >
        {{ $t("admin_shop.dashboard.info.add_dialog.hosting.external_note") }}
      </v-alert>

      <!-- ████████████████████████ SSL ████████████████████████ -->
      <div v-if="!domain.externally_hosted" ref="sslSection" :class="modern ? 'sd-modern-widget b-domain-setting__section' : 'widget-box mb-5'">
        <u-widget-header
          :add-loading="busy_check_ssl"
          :add-text="!!domain.ssl"
          :add-caption="modern ? $t('domains_modern.setting.check_ssl') : 'Check SSL'"
          add-icon="published_with_changes"
          icon="https"
          title="SSL/TLS"
          :class="{ 'sd-modern-form-header': modern }"
          @click:add="checkSSL()"
        ></u-widget-header>
        <v-list-subheader
          ><template v-if="modern">{{ $t('domains_modern.setting.ssl_help') }}</template><template v-else>Advanced domain setting offers a flexible and customizable way to
          issue and manage certificates and SSL.
          </template>
        </v-list-subheader>

        <u-smart-switch
          v-model="https"
          :false-description="modern ? $t('domains_modern.setting.http_description') : 'Your website will be accessible via both HTTP and HTTPS. While HTTP is a less secure option, it can be considered if you are experiencing SSL-related issues.'"
          false-icon="http"
          :false-title="modern ? $t('domains_modern.setting.allow_http') : 'Allow HTTP traffic'"
          :hint="modern ? $t('domains_modern.setting.redirect_help') : 'Redirect traffic from HTTP to HTTPS automatically in the application layer. Also, we recommend you enable force HTTP to HTTPS in your CDN.'"
          :label="modern ? $t('domains_modern.setting.redirect_title') : 'HTTPS Force Redirect'"
          :true-description="modern ? $t('domains_modern.setting.https_description') : 'When attempting to redirect HTTP requests to HTTPS, it is crucial to ensure that you have a valid SSL certificate.'"
          true-icon="https"
          :true-title="modern ? $t('domains_modern.setting.force_https') : 'Force redirect HTTP to HTTPS'"
        >
        </u-smart-switch>
      </div>

      <!-- ████████████████████████ Resource Customization ████████████████████████ -->
      <div :class="modern ? 'sd-modern-widget b-domain-setting__section' : 'widget-box mb-5'">
        <u-widget-header
          icon="ballot"
          :title="modern ? $t('domains_modern.setting.resources') : 'Resource Customization'"
          :class="{ 'sd-modern-form-header': modern }"
        ></u-widget-header>
        <v-list-subheader>
          <template v-if="modern">{{ $t('domains_modern.setting.resources_help') }}</template><template v-else>You can restrict the available languages and currencies for this
          domain. By default, all languages and currencies are accessible. If
          you select specific currencies, only the associated payment will be
          displayed to customers.</template>
        </v-list-subheader>

        <u-language-input
          ref="languagesInput"
          :available-languages="available_languages"
          v-model="languages"
          multiple
          :label="modern ? $t('domains_modern.setting.languages') : 'Available Languages'"
          :class="{ 'sd-modern-underlined-field': modern }"
          max-width="null"
          clearable
          chips
          :placeholder="modern ? $t('domains_modern.list.all_languages') : '*.* All languages are available'"
          persistent-placeholder
        ></u-language-input>

        <u-currency-input
          ref="currenciesInput"
          :active-currencies="shop.currencies"
          v-model="currencies"
          chips
          clearable
          multiple
          :label="modern ? $t('domains_modern.setting.currencies') : 'Available Currencies'"
          :class="{ 'sd-modern-underlined-field': modern }"
          :placeholder="modern ? $t('domains_modern.list.all_currencies') : '*.* All currencies are available'"
          persistent-placeholder
        ></u-currency-input>
      </div>

      <!-- ████████████████████████ Certificate ████████████████████████ -->
      <div
        v-if="!domain.externally_hosted && certificate"
        :class="modern ? 'sd-modern-widget b-domain-setting__section' : 'widget-box mb-5'"
      >
        <u-widget-header
          icon="workspace_premium"
          :title="modern ? $t('domains_modern.setting.certificate') : 'Certificate'"
          :class="{ 'sd-modern-form-header': modern }"
        ></u-widget-header>
        <v-list-subheader
          ><template v-if="modern">{{ $t('domains_modern.setting.certificate_help') }}</template><template v-else>The details of the SSL certificate issued by Selldone are visible.</template>
        </v-list-subheader>

        <div class="d-flex align-center mb-3">
          <span :class="modern ? 'b-domain-setting__certificate-name' : 'font-weight-black'"
            >{{ certificate["Name"] }} - {{ certificate["Key Type"] }}</span
          >
          <span v-if="modern" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="is_valid ? 'bg-success' : 'bg-warning'" />{{ $t(is_valid ? 'domains_modern.setting.valid' : 'domains_modern.list.expired') }}</span>
          <v-chip
            v-if="!modern && is_valid"
            class="mx-2"
            color="success"
            variant="flat"
            label
            size="small"
          >
            <v-icon start>check_circle</v-icon>
            Valid
          </v-chip>
          <v-chip
            v-else-if="!modern"
            class="mx-2"
            color="red"
            variant="flat"
            label
            size="small"
          >
            <v-icon start>cancel</v-icon>
            Expired
          </v-chip>
        </div>

        <u-text-value-box :label="modern ? $t('domains_modern.setting.serial') : 'Serial Number'" vb50>
          {{ certificate["Serial Number"] }}
        </u-text-value-box>

        <u-text-value-box :label="modern ? $t('commons.domains') : 'Domains'" vb50>
          {{ certificate["Domains"] }}
        </u-text-value-box>

        <u-text-value-box :label="modern ? $t('domains_modern.setting.expiry') : 'Expiry Date'" vb50>
          {{ getLocalDateString(certificate["Expiry Date"]) }} -
          {{ getFromNowString(certificate["Expiry Date"]) }}
        </u-text-value-box>
      </div>

      <!-- ████████████████████████ Robot ████████████████████████ -->
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons" :class="{ 'b-domain-setting__actions': modern }">
        <v-btn :size="modern ? undefined : 'x-large'" :class="{ 'sd-modern-button': modern }" variant="text" @click="close">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :loading="busy_save"
          color="primary"
          :size="modern ? undefined : 'x-large'"
          :class="{ 'sd-modern-button': modern }"
          variant="elevated"
          @click="save"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import UTextValueBox from "../../../ui/text/value-box/UTextValueBox.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ULanguageInput from "@selldone/components-vue/ui/language/input/ULanguageInput.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper";
import UCurrencyInput from "@selldone/components-vue/ui/currency/input/UCurrencyInput.vue";

export default {
  name: "BDomainSetting",
  mixins: [DateMixin],

  components: { UCurrencyInput, ULanguageInput, USmartSwitch, UTextValueBox },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    domain: {
      required: false,
      type: Object,
    },
  },

  data: () => ({
    https: false,
    busy_save: false,
    busy_check_ssl: false,

    languages: [],
    currencies: [],
  }),

  computed: {
    certificate() {
      return this.domain?.certificate;
    },
    is_valid() {
      return (
        this.certificate["Expiry Date"] &&
        DateConverter.convertToLocalTime(
          this.certificate["Expiry Date"],
        )?.isAfterToday()
      );
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃ Languages ▃▃▃▃▃▃▃▃▃▃▃▃▃
    available_languages() {
      // Available languages of shop!
      return this.shop && ShopOptionsHelper.GetLanguages(this.shop);
    },
  },
  watch: {
    domain() {
      this.init();
    },
  },

  methods: {
    focusSection(section) {
      if (!this.modern || !['languages', 'currencies', 'ssl'].includes(section)) return;
      const reference = section === 'ssl' ? this.$refs.sslSection : this.$refs[`${section}Input`];
      const element = reference?.$el || reference;
      element?.scrollIntoView({ block: 'center' });
      element?.querySelector('input:not([type="hidden"]), button')?.focus({ preventScroll: true });
    },
    close() {
      this.$emit("click:close");
    },
    save() {
      this.busy_save = true;

      axios
        .post(
          window.API.POST_SET_DOMAIN_SETTING(this.shop.id, this.domain.id),
          {
            https: this.https,
            currencies: this.currencies,
            languages: this.languages,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Your domain was successfully updated.",
            );
            Object.assign(this.domain, data.domain); // Update shop domains & domains list!

            this.UpdateItemByID(this.shop.domains, data.domain);

            this.close();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    checkSSL() {
      this.busy_check_ssl = true;

      axios
        .post(window.API.POST_DOMAIN_CHECK_SSL(this.shop.id, this.domain.id))
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Your domain is secure.",
            );
            Object.assign(this.domain, data.domain); // Update shop domains & domains list!

            this.UpdateItemByID(this.shop.domains, data.domain);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_check_ssl = false;
        });
    },

    init() {
      this.https = this.domain.https;
      this.languages = this.domain.languages;
      this.currencies = this.domain.currencies;
    },
  },
  created() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.b-domain-setting--modern {
  background: color-mix(in srgb, rgb(var(--v-theme-background)) 96%, rgb(var(--v-theme-on-background)));
  :deep(.v-card-title) { font-size: 18px; font-weight: 500; line-height: 26px; padding: 22px 25px; }
  > .v-card-text { width: min(960px, 100%); margin-inline: auto; padding: 24px 25px; }
  .b-domain-setting__section { padding: 25px; margin-block-end: 20px; border-radius: 18px; }
  .b-domain-setting__section > .v-list-subheader { padding: 0; min-height: 0; font-size: 13px; line-height: 21px; color: var(--sd-modern-muted); margin-block: 7px 20px; }
  .b-domain-setting__section :deep(.u-smart-select) { font-size: 13px; }
  .b-domain-setting__certificate-name { font-size: 13px; font-weight: 500; }
  .b-domain-setting__notice { display: flex; align-items: flex-start; gap: 10px; margin-block-end: 20px; font-size: 13px; line-height: 21px; }
  .b-domain-setting__actions { display: flex; justify-content: flex-end; gap: 10px; width: min(910px, 100%); margin: 0 auto; }
  .b-domain-setting__actions .v-btn { flex: 0 1 auto; height: 38px; font-size: 12px; line-height: 18px; border-radius: 10px; padding-inline: 16px; }
  @media (max-width: 600px) {
    > .v-card-text { padding: 18px 14px; }
    .b-domain-setting__section { padding: 20px 15px; }
    .b-domain-setting__actions .v-btn { min-height: 44px; }
  }
}
</style>

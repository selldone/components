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
  <v-card class="text-start" rounded="0">
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
      <!-- ████████████████████████ SSL ████████████████████████ -->
      <div class="widget-box mb-5">
        <u-widget-header
          :add-loading="busy_check_ssl"
          :add-text="!!domain.ssl"
          add-caption="Check SSL"
          add-icon="published_with_changes"
          icon="https"
          title="SSL/TLS"
          @click:add="checkSSL()"
        ></u-widget-header>
        <v-list-subheader
          >Advanced domain setting offers a flexible and customizable way to
          issue and manage certificates and SSL.
        </v-list-subheader>

        <u-smart-switch
          v-model="https"
          false-description="Your website will be accessible via both HTTP and HTTPS. While HTTP is a less secure option, it can be considered if you are experiencing SSL-related issues."
          false-icon="http"
          false-title="Allow HTTP traffic"
          hint="Redirect traffic from HTTP to HTTPS automatically in the application layer. Also, we recommend you enable force HTTP to HTTPS in your CDN."
          label="HTTPS Force Redirect"
          true-description="When attempting to redirect HTTP requests to HTTPS, it is crucial to ensure that you have a valid SSL certificate."
          true-icon="https"
          true-title="Force redirect HTTP to HTTPS"
        >
        </u-smart-switch>
      </div>

      <!-- ████████████████████████ Resource Customization ████████████████████████ -->
      <div class="widget-box mb-5">
        <u-widget-header
          icon="ballot"
          title="Resource Customization"
        ></u-widget-header>
        <v-list-subheader>
          You can restrict the available languages and currencies for this
          domain. By default, all languages and currencies are accessible. If
          you select specific currencies, only the associated payment will be
          displayed to customers.
        </v-list-subheader>

        <u-language-input
          :available-languages="available_languages"
          v-model="languages"
          multiple
          label="Available Languages"
          max-width="null"
          clearable
          chips
          placeholder="*.* All languages are available"
          persistent-placeholder
        ></u-language-input>

        <u-currency-input
          :active-currencies="shop.currencies"
          v-model="currencies"
          chips
          clearable
          multiple
          label="Available Currencies"
          placeholder="*.* All currencies are available"
          persistent-placeholder
        ></u-currency-input>
      </div>

      <!-- ████████████████████████ Certificate ████████████████████████ -->
      <div v-if="certificate" class="widget-box mb-5">
        <u-widget-header
          icon="workspace_premium"
          title="Certificate"
        ></u-widget-header>
        <v-list-subheader
          >The details of the SSL certificate issued by Selldone are visible.
        </v-list-subheader>

        <div class="d-flex align-center mb-3">
          <span class="font-weight-black"
            >{{ certificate["Name"] }} - {{ certificate["Key Type"] }}</span
          >
          <v-chip
            v-if="is_valid"
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
            v-else
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

        <u-text-value-box label="Serial Number" vb50>
          {{ certificate["Serial Number"] }}
        </u-text-value-box>

        <u-text-value-box label="Domains" vb50>
          {{ certificate["Domains"] }}
        </u-text-value-box>

        <u-text-value-box label="Expiry Date" vb50>
          {{ getLocalDateString(certificate["Expiry Date"]) }} -
          {{ getFromNowString(certificate["Expiry Date"]) }}
        </u-text-value-box>
      </div>

      <!-- ████████████████████████ Robot ████████████████████████ -->
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="close">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :loading="busy_save"
          color="primary"
          size="x-large"
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

<style scoped></style>

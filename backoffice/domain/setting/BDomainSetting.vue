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
    <v-card-title>
      <span>
        <v-icon class="me-1">settings</v-icon>
        {{ $t("global.commons.setting") }}
      </span>
    </v-card-title>
    <v-card-subtitle class="mt-0">{{ domain.domain }}</v-card-subtitle>

    <v-card-text>
      <!-- ████████████████████████ SSL ████████████████████████ -->
      <div class="widget-box mb-5">
        <s-widget-header
          :add-loading="busy_check_ssl"
          :add-text="!!domain.ssl"
          add-caption="Check SSL"
          add-icon="published_with_changes"
          icon="https"
          title="SSL/TLS"
          @click:add="checkSSL()"
        ></s-widget-header>
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
          label="Encrypt all visitor traffic"
          true-description="When attempting to redirect HTTP requests to HTTPS, it is crucial to ensure that you have a valid SSL certificate."
          true-icon="https"
          true-title="Force redirect HTTP to HTTPS"
        >
        </u-smart-switch>
      </div>

      <!-- ████████████████████████ Certificate ████████████████████████ -->
      <div v-if="certificate" class="widget-box mb-5">
        <s-widget-header
          icon="workspace_premium"
          title="Certificate"
        ></s-widget-header>
        <v-list-subheader
          >The details of the SSL certificate issued by Selldone are visible.
        </v-list-subheader>

        <div class="d-flex align-center mb-3">
          <span class="text-h4"
            >{{ certificate["Name"] }} - {{ certificate["Key Type"] }}</span
          >
          <v-chip v-if="is_valid" class="mx-2" color="success" dark label>
            <v-icon start>check_circle</v-icon>
            Valid
          </v-chip>
          <v-chip v-else class="mx-2" color="red" dark label>
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
          variant="flat"
          @click="save"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import UTextValueBox from "../../../ui/text/value-box/UTextValueBox.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "BDomainSetting",
  components: { USmartSwitch, UTextValueBox },
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
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert(
              null,
              "Your domain was successfully updated.",
            );
            Object.assign(this.domain, data.domain); // Update shop domains & domains list!

            this.UpdateItemByID(this.shop.domains, data.domain);

            this.close();
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showSuccessAlert(null, "Your domain is secure.");
            Object.assign(this.domain, data.domain); // Update shop domains & domains list!

            this.UpdateItemByID(this.shop.domains, data.domain);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_check_ssl = false;
        });
    },
  },
  created() {
    this.https = this.domain.https;
  },
};
</script>

<style scoped></style>

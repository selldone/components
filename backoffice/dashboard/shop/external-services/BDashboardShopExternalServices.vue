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
  <!-- ============ Servers & Services ============ -->

  <s-widget-box
    :sub-title="$t('external_services.subtitle')"
    :title="$t('external_services.title')"
    class="mb-5"
  >
    <template v-slot:actions>
      <v-list
        v-if="sms_provider"
        class="border-between-vertical bg-transparent"
        density="compact"
        lines="three"
      >
        <v-list-item>
          <template v-slot:prepend>
            <v-avatar :image="sms_provider.icon" rounded></v-avatar>
          </template>

          <v-list-item-title>
            <b>SMS ● </b> {{ sms_provider.title }}

            <v-chip
              v-if="sms_service && !sms_service.enable"
              class="ms-2"
              color="#D32F2F"
              label
              size="small"
              >{{ $t("global.commons.disable") }}
            </v-chip>
          </v-list-item-title>

          <v-list-item-subtitle v-if="sms_service && sms_service.error">
            <v-icon color="red" size="small">report</v-icon>
            {{ sms_service.error }}

            <v-chip
              v-if="sms_service.errors"
              class="ms-2"
              color="#D32F2F"
              label
              size="small"
              >{{ sms_service.errors }}
            </v-chip>
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-list-item-action>
              <v-btn
                :to="{ name: 'BPageShopSettingSms' }"
                color="primary"
                size="small"
                variant="elevated"
              >
                <v-icon class="me-1" size="small">settings</v-icon>
                SMS setting
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-list-item>
          <template v-slot:prepend>
            <v-avatar :src="sms_provider.icon" rounded>
              <img v-if="mail_provider" :src="mail_provider.icon" />
              <v-icon v-else size="24">mail_outline</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title>
            <b>Email ● </b>
            {{ mail_provider ? mail_provider.title : "Default" }}

            <v-chip
              v-if="mail_service && !mail_service.enable"
              class="ms-2"
              color="#D32F2F"
              label
              size="small"
              >{{ $t("global.commons.disable") }}
            </v-chip>
          </v-list-item-title>

          <v-list-item-subtitle v-if="mail_service && mail_service.error">
            <v-icon color="red" size="small">report</v-icon>
            {{ mail_service.error }}

            <v-chip
              v-if="mail_service.errors"
              class="ms-2"
              color="#D32F2F"
              label
              size="small"
              >{{ mail_service.errors }}
            </v-chip>
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-list-item-action>
              <v-btn
                :to="{ name: 'BPageShopSettingEmail' }"
                color="primary"
                size="small"
                variant="elevated"
              >
                <v-icon class="me-1" size="small">settings</v-icon>
                Email setting
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { EmailProviders } from "@selldone/core-js/enums/email/EmailProviders";

export default {
  name: "BDashboardShopExternalServices",
  components: {
    SWidgetBox,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    sms_service() {
      return this.shop.sms_service;
    },
    sms_provider() {
      const driver = this.sms_service ? this.sms_service.driver : "default";
      return SmsProviders.find((i) => i.driver === driver);
    },

    mail_service() {
      return this.shop.mail_service;
    },
    mail_provider() {
      return (
        this.mail_service &&
        EmailProviders.find((i) => i.driver === this.mail_service.driver)
      );
    },
  },

  watch: {},
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

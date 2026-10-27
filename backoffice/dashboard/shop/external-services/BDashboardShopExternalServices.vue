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

  <div
    v-if="modern"
    class="s--shop-dashboard-services text-start"
  >
    <section v-for="item in services" :key="item.route" class="sd-modern-widget">
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon :icon="item.fallbackIcon" size="20" aria-hidden="true"
        /></span>
        <div>
          <h2 class="sd-modern-title-text">
            {{ item.type }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("external_services.subtitle") }}
          </p>
        </div>
      </div>
    </header>
      <div class="s--shop-dashboard-services__row">
        <div class="sd-modern-icon">
          <img
            v-if="item.icon"
            :src="item.icon"
            alt=""
            width="28"
            height="28"
          />
          <v-icon v-else>{{ item.fallbackIcon }}</v-icon>
        </div>
        <div class="s--shop-dashboard-services__content">
          <div class="sd-modern-value">
            {{ item.title }}
            <span v-if="item.service" class="sd-modern-status sd-modern-status--plain ms-2">
              <span class="sd-modern-status__dot" :class="item.service.enable ? 'text-success' : 'text-medium-emphasis'" />
              {{ $t(item.service.enable ? "global.commons.enable" : "global.commons.disable") }}
            </span>
          </div>
          <p v-if="item.service" class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.modern.service_errors") }} · {{ item.service.errors || 0 }}
          </p>
          <p
            v-if="item.service?.error"
            class="sd-modern-subtitle s--shop-dashboard-services__error"
            role="alert"
          >
            <v-icon color="error" size="small" class="me-1">report</v-icon>
            {{ item.service.error }}
          </p>
        </div>
        <v-btn
          :to="{ name: item.route }"
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          v-tooltip="{
                  text: `${item.type} · ${$t('global.commons.setting')}`,
                  location: modern ? 'top' : undefined,
                  contentClass: modern ? 'sd-modern-tooltip text-start' : undefined,
                  openOnFocus: modern ? true : undefined,
                }"
        >
          <v-icon start size="small">settings</v-icon>
          {{ $t("global.commons.setting") }}
        </v-btn>
      </div>
    </section>
  </div>
  <s-widget-box
    v-else
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
            <v-avatar rounded>
              <v-icon v-if="sms_provider.driver === 'default'"
                >chat_bubble_outline
              </v-icon>
              <v-img v-else :src="sms_provider.icon" />
            </v-avatar>
          </template>

          <v-list-item-title>
            SMS ● <b class="ms-1">{{ sms_provider.title }}</b>

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
            <v-avatar rounded>
              <v-img v-if="mail_provider" :src="mail_provider.icon" />
              <v-icon v-else size="24">mail_outline</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title>
            Email ●
            <b class="ms-1">{{
              mail_provider ? mail_provider.title : "Default"
            }}</b>

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

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { SmsProviders } from "@selldone/core-js/enums/sms/SmsProviders";
import { EmailProviders } from "@selldone/core-js/enums/email/EmailProviders";

export default {
  name: "BDashboardShopExternalServices",
  components: {
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    services() {
      return [
        {
          type: "SMS",
          title: this.sms_provider?.title || this.sms_service?.driver || this.$t("global.commons.default"),
          icon:
            this.sms_provider?.driver !== "default"
              ? this.sms_provider?.icon
              : null,
          fallbackIcon: "chat_bubble_outline",
          service: this.sms_service,
          route: "BPageShopSettingSms",
        },
        {
          type: this.$t("global.commons.email"),
          title: this.mail_provider?.title || this.mail_service?.driver || this.$t("global.commons.default"),
          icon: this.mail_provider?.icon,
          fallbackIcon: "mail_outline",
          service: this.mail_service,
          route: "BPageShopSettingEmail",
        },
      ];
    },
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
.s--shop-dashboard-services {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  :deep(.sd-modern-value) { font-weight: 400; }
  &__row {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    align-items: start;
    gap: 16px;
    padding-block: 8px;
  }
  &__content {
    min-width: 0;
  }
  &__error {
    opacity: 1;
    overflow-wrap: anywhere;
  }
  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
  @media (max-width: 600px) {
    &__row {
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 12px;
    }
    &__row > .v-btn {
      grid-column: 2;
      justify-self: start;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

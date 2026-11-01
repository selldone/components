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

  <section
    v-if="modern"
    class="sd-modern-widget s--shop-dashboard-services text-start"
  >
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon icon="settings_input_antenna" size="20" aria-hidden="true"
        /></span>
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("admin_shop.dashboard.technical.services_title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.technical.services_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <div class="sd-modern-records">
      <article
        v-for="item in services"
        :key="item.route"
        class="sd-modern-record s--shop-dashboard-services__row"
        :aria-label="item.type"
      >
        <span class="s--shop-dashboard-services__icon">
          <img
            v-if="item.icon"
            :src="item.icon"
            alt=""
            width="28"
            height="28"
          />
          <v-icon
            v-else
            :icon="item.fallbackIcon"
            size="20"
            aria-hidden="true"
          />
        </span>
        <div class="s--shop-dashboard-services__content">
          <h3>{{ item.type }}</h3>
          <p class="s--shop-dashboard-services__description">
            {{ $t(item.description) }}
          </p>
        </div>
        <div class="s--shop-dashboard-services__provider">
          <p>
            {{ item.title }}
          </p>
          <div v-if="item.service" class="s--shop-dashboard-services__state">
            <span class="sd-modern-status sd-modern-status--plain">
              <span
                class="sd-modern-status__dot"
                :class="{
                  'sd-modern-status__dot--success': item.service.enable,
                }"
              />
              {{
                $t(
                  item.service.enable
                    ? "global.commons.enable"
                    : "global.commons.disable",
                )
              }}
            </span>
            <span>
              {{ $t("admin_shop.dashboard.modern.service_errors") }} ·
              {{
                item.service.errors ??
                $t("admin_shop.dashboard.technical.not_reported")
              }}
            </span>
          </div>
        </div>
        <v-btn
          :to="{ name: item.route }"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          :aria-label="
            $t('admin_shop.dashboard.technical.service_settings', {
              service: item.type,
            })
          "
          v-tooltip="{
            text: $t('admin_shop.dashboard.technical.service_settings', {
              service: item.type,
            }),
            location: 'top',
            contentClass: 'sd-modern-tooltip text-start',
            openOnFocus: true,
          }"
        >
          <v-icon start size="small">settings</v-icon>
          {{ $t("global.commons.setting") }}
        </v-btn>
        <details
          v-if="item.service?.error"
          :key="shop.id + ':' + item.route + ':' + item.service.error"
          class="s--shop-dashboard-services__error"
        >
          <summary>
            <v-icon
              icon="error_outline"
              size="17"
              color="error"
              aria-hidden="true"
            />
            <span>{{ $t("admin_shop.dashboard.technical.latest_error") }}</span>
            <v-icon
              class="s--shop-dashboard-services__chevron"
              icon="expand_more"
              size="17"
              aria-hidden="true"
            />
          </summary>
          <p role="alert">{{ item.service.error }}</p>
        </details>
      </article>
    </div>
  </section>
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
          description: "admin_shop.dashboard.technical.sms_description",
          title:
            this.sms_provider?.title ||
            this.sms_service?.driver ||
            this.$t("global.commons.default"),
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
          description: "admin_shop.dashboard.technical.email_description",
          title:
            this.mail_provider?.title ||
            this.mail_service?.driver ||
            this.$t("global.commons.default"),
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
  padding: 24px;
  border-radius: 15px;
  .sd-modern-title-text {
    font-size: 17px;
    font-weight: 500;
  }
  .sd-modern-header {
    margin-block-end: 16px;
  }
  &__row {
    grid-template-columns: 32px minmax(0, 1fr) minmax(150px, 0.65fr) auto;
    gap: 10px 14px;
    padding: 18px 12px;
  }
  &__icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    color: var(--sd-modern-muted);
    img {
      max-width: 100%;
      object-fit: contain;
    }
  }
  &__content,
  &__provider {
    min-width: 0;
  }
  &__content h3 {
    margin: 0;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
  }
  &__description {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__provider > p {
    margin: 0;
    font-size: 13px;
    font-weight: 400;
  }
  &__state {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    .sd-modern-status {
      font-size: inherit;
      font-weight: 400;
    }
  }
  &__error {
    grid-column: 2 / -1;
    padding: 10px 12px;
    border-radius: 9px;
    background: var(--sd-modern-inset);
    font-size: 12px;
    overflow-wrap: anywhere;
    summary {
      display: flex;
      align-items: center;
      gap: 8px;
      list-style: none;
      cursor: pointer;
      &:focus-visible {
        outline: 2px solid rgb(var(--v-theme-primary));
        outline-offset: 3px;
        border-radius: 4px;
      }
    }
    summary::-webkit-details-marker {
      display: none;
    }
    p {
      margin: 10px 0 0;
      white-space: pre-line;
    }
    &[open] .s--shop-dashboard-services__chevron {
      transform: rotate(180deg);
    }
  }
  &__chevron {
    margin-inline-start: auto;
  }
  @media (max-width: 600px) {
    padding: 18px;
    &__row {
      grid-template-columns: 28px minmax(0, 1fr) auto;
      gap: 8px 10px;
    }
    &__provider {
      grid-column: 2;
      grid-row: 2;
    }
    &__row > .v-btn {
      grid-column: 3;
      grid-row: 1 / 3;
    }
    &__error {
      grid-column: 1 / -1;
      padding: 0 12px;
    }
    &__error summary {
      min-height: 44px;
    }
    &__error p { margin: 0 0 12px; }
  }
  @media (pointer: coarse) {
    &__error summary { min-height: 44px; }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <!-- --------------------------------- Google Search Console Connect --------------------------- -->

  <div :class="{ 'b-google-serp-connect text-start': modern }">
    <template v-if="modern">
      <section
        class="sd-modern-widget b-google-serp-connect__performance"
        :aria-label="$t('channel_google.modern.reporting')"
      >
        <header class="b-google-serp-connect__header">
          <div class="b-google-serp-connect__heading">
            <svg
              class="b-google-serp-connect__chart-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <h2 class="sd-modern-title-text">
              {{ $t("channel_google.modern.reporting") }}
            </h2>
          </div>
          <span
            class="sd-modern-status sd-modern-status--plain b-google-serp-connect__status"
          >
            <span
              class="sd-modern-status__dot"
              :class="
                shop.search_console
                  ? 'sd-modern-status__dot--success'
                  : 'sd-modern-status__dot--warning'
              "
              aria-hidden="true"
            ></span>
            {{
              $t(
                shop.search_console
                  ? "channel_google.modern.connected"
                  : "channel_google.modern.disconnected",
              )
            }}
          </span>
        </header>
        <p class="sd-modern-subtitle b-google-serp-connect__intro">
          {{ $t("channel_google.modern.reportingIntro") }}
        </p>

        <template v-if="!shop.search_console">
          <ol class="sd-modern-steps b-google-serp-connect__steps">
            <li class="sd-modern-step">
              <span class="sd-modern-step__number" aria-hidden="true">
                <v-icon v-if="main_domain" size="15" color="success"
                  >check</v-icon
                >
                <template v-else>{{ $n(1) }}</template>
              </span>
              <div>
                <h3 class="sd-modern-step__title">
                  {{ $t("channel_google.modern.domainStep") }}
                </h3>
                <p v-if="main_domain" class="b-google-serp-connect__domain">
                  <bdi dir="ltr">{{ main_domain.domain }}</bdi>
                </p>
                <p v-else class="b-google-serp-connect__domain">
                  {{ $t("channel_google.modern.missingDomain") }}
                </p>
                <v-btn
                  :to="{ name: 'BPageShopSettingDomain' }"
                  class="sd-modern-button sd-modern-button--inline b-google-serp-connect__text-action"
                  color="primary"
                  variant="text"
                >
                  {{ $t("channel_google.modern.manageDomains") }}
                  <v-icon end size="16" aria-hidden="true">{{
                    $vuetify.locale.isRtl ? "arrow_back" : "arrow_forward"
                  }}</v-icon>
                </v-btn>
              </div>
            </li>
            <li class="sd-modern-step">
              <span class="sd-modern-step__number" aria-hidden="true">{{
                $n(2)
              }}</span>
              <div>
                <h3 class="sd-modern-step__title">
                  {{ $t("channel_google.modern.verifyStep") }}
                </h3>
                <v-btn
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="sd-modern-button sd-modern-button--inline b-google-serp-connect__text-action"
                  color="primary"
                  variant="text"
                >
                  {{ $t("channel_google.modern.openSearchConsole") }}
                  <v-icon end size="16" aria-hidden="true">north_east</v-icon>
                </v-btn>
              </div>
            </li>
          </ol>
          <div class="b-google-serp-connect__connect-row">
            <v-btn
              :href="`/shops/${shop.id}/services/google/search/authentication/login`"
              :disabled="!canAuthenticate"
              :loading="busy_search"
              class="sd-modern-button sd-modern-button--primary b-google-serp-connect__connect-button"
              color="primary"
              variant="flat"
              prepend-icon="link"
              @click="startAuthentication"
              >{{ $t("channel_google.modern.connect") }}</v-btn
            >
            <p>
              {{
                $t(
                  canWrite
                    ? "channel_google.modern.connectionHint"
                    : "channel_google.modern.readonly",
                )
              }}
            </p>
          </div>
        </template>
        <p v-else class="b-google-serp-connect__connected-copy">
          {{ $t("channel_google.modern.connectedBody") }}
        </p>
      </section>

      <details
        v-if="shop.search_console && canWrite"
        :open="critical_open"
        class="sd-modern-widget sd-modern-disclosure sd-modern-critical b-google-serp-connect__critical"
        @toggle="onCriticalToggle"
      >
        <summary class="sd-modern-disclosure__summary">
          <v-icon size="18" aria-hidden="true">link_off</v-icon>
          <div class="sd-modern-disclosure__copy">
            <h2>{{ $t("channel_google.modern.disconnectTitle") }}</h2>
          </div>
          <v-icon
            class="sd-modern-disclosure__chevron"
            size="18"
            aria-hidden="true"
            >expand_more</v-icon
          >
        </summary>
        <div
          class="sd-modern-disclosure__content b-google-serp-connect__critical-content"
        >
          <p>{{ $t("channel_google.modern.disconnectBody") }}</p>
          <u-smart-verify
            :model-value="accept_disconnect"
            :true-title="$t('channel_google.modern.verifyDisconnect')"
            :aria-label="$t('channel_google.modern.verifyDisconnect')"
            :aria-checked="String(accept_disconnect)"
            :aria-disabled="String(busy_remove_search_console)"
            :tabindex="busy_remove_search_console ? -1 : 0"
            :disabled="busy_remove_search_console"
            class="b-google-serp-connect__verify"
            role="checkbox"
            color="error"
            false-gray
            @update:model-value="setDisconnectConsent"
            @keydown.space.prevent="setDisconnectConsent(!accept_disconnect)"
            @keydown.enter.prevent="setDisconnectConsent(!accept_disconnect)"
          />
          <v-btn
            :disabled="!canDisconnect"
            :loading="busy_remove_search_console"
            class="sd-modern-button sd-modern-button--danger"
            color="error"
            variant="elevated"
            prepend-icon="link_off"
            @click="askRemove"
            >{{ $t("channel_google.modern.disconnect") }}</v-btn
          >
        </div>
      </details>
    </template>

    <template v-else>
      <v-list-item>
        <template v-slot:prepend>
          <v-avatar rounded>
            <img src="../../../assets/trademark/google.svg" />
          </v-avatar>
        </template>

        <v-list-item-title>
          <b>{{ $t("channel_google.serp_content.title") }}</b>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t("channel_google.serp_content.subtitle") }}
        </v-list-item-subtitle>
      </v-list-item>

      <hr class="my-5" />

      <div v-if="!shop.search_console">
        <b class="d-block mb-2">
          {{ $t("channel_google.serp_content.tips.title") }}
        </b>
        <ol class="my-3">
          <li>
            {{ $t("channel_google.serp_content.tips.add_in_selldone") }}

            <u-check :model-value="!!main_domain" class="mx-1"></u-check>
            <br />
            <v-btn
              :to="{ name: 'BPageShopSettingDomain' }"
              class="tnt"
              color="primary"
              prepend-icon="add_box"
              variant="text"
              ><b>{{
                $t("channel_google.serp_content.action_custom_domain")
              }}</b></v-btn
            >
          </li>
          <li
            v-html="
              $t('channel_google.serp_content.tips.add_in_google', {
                domain: main_domain ? main_domain.domain : 'your domain',
              })
            "
          ></li>
        </ol>
      </div>

      <div v-if="canWrite" class="widget-buttons">
        <v-btn
          v-if="!shop.search_console"
          :disabled="!canAuthenticate"
          :href="`/shops/${shop.id}/services/google/search/authentication/login`"
          :loading="busy_search"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="startAuthentication"
        >
          <v-icon start>cable</v-icon>

          {{ $t("channel_google.serp_content.action_connect_now") }}
        </v-btn>
        <v-btn
          v-else
          :loading="busy_remove_search_console"
          :disabled="!canDisconnect"
          color="red"
          size="x-large"
          variant="text"
          @click="askRemove()"
        >
          <v-icon start>mobiledata_off</v-icon>

          {{ $t("channel_google.serp_content.action_remove_connection") }}
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";

export default {
  name: "BGoogleSerpConnect",
  mixins: [],
  components: { USmartVerify },
  props: {
    modern: Boolean,
    shop: {
      required: false,
      type: Object,
    },
  },

  data: () => ({
    busy_search: false,
    busy_remove_search_console: false,
    critical_open: false,
    accept_disconnect: false,
  }),

  computed: {
    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    main_domain() {
      return this.shop.domains.find((i) => i.enable && i.primary);
    },
    canWrite() {
      return this.writeShopAccess(ShopPermissionRegions.CHANNELS.code);
    },
    canAuthenticate() {
      return (
        this.canWrite &&
        !!this.main_domain &&
        !this.shop.search_console &&
        !this.busy_search &&
        !this.busy_remove_search_console
      );
    },
    canDisconnect() {
      return (
        this.canWrite &&
        !!this.shop.search_console &&
        !this.busy_remove_search_console &&
        (!this.modern || (this.critical_open && this.accept_disconnect))
      );
    },
  },

  watch: {
    critical_open(value) {
      if (!value) this.accept_disconnect = false;
    },
    canWrite(value) {
      if (!value) this.resetDisconnect();
    },
    "shop.id"() {
      this.resetDisconnect();
    },
    "shop.search_console"(value) {
      if (!value) this.resetDisconnect();
    },
  },

  created() {},

  methods: {
    startAuthentication(event) {
      if (!this.canAuthenticate) {
        event?.preventDefault();
        return;
      }
      this.busy_search = true;
    },
    onCriticalToggle(event) {
      this.critical_open = event.target.open;
      if (!this.critical_open) this.accept_disconnect = false;
    },
    setDisconnectConsent(value) {
      this.accept_disconnect =
        !!value &&
        this.canWrite &&
        !!this.shop.search_console &&
        this.critical_open &&
        !this.busy_remove_search_console;
    },
    resetDisconnect() {
      this.critical_open = false;
      this.accept_disconnect = false;
    },
    askRemove() {
      if (!this.canDisconnect) return;
      const shopId = this.shop.id;
      NotificationService.openDangerAlert(
        this.$t("channel_google.modern.confirmTitle"),
        this.$t("channel_google.modern.confirmBody"),
        this.$t("channel_google.modern.disconnectConfirmAction"),
        () => {
          if (this.shop.id !== shopId || !this.canDisconnect) return;
          return this.removeSearchConsole();
        },
      );
    },

    removeSearchConsole() {
      if (!this.canDisconnect) return;
      const shop = this.shop;
      this.busy_remove_search_console = true;

      return axios
        .delete(window.API.DELETE_SEARCH_CONSOLE_CONNECTION(shop.id))
        .then(({ data }) => {
          if (!data.error) {
            shop.search_console = false;
            if (this.shop.id === shop.id) this.resetDisconnect();
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_remove_search_console = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-google-serp-connect {
  font-size: 13px;
  line-height: 21px;

  &__performance.sd-modern-widget {
    padding: 24px;
    border: 0;
    box-shadow: none;
  }
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__heading {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 9px;
    .sd-modern-title-text {
      margin: 0;
      font-size: 17px;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: -0.2px;
    }
  }
  &__chart-icon {
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
  }
  &__intro.sd-modern-subtitle {
    margin-block: 8px 0;
    font-size: 13px;
    line-height: 1.65;
  }
  &__status {
    margin: 0;
    gap: 6px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    .sd-modern-status__dot--warning {
      background: color-mix(
        in srgb,
        rgb(var(--v-theme-warning)) 65%,
        rgb(var(--v-theme-on-surface))
      );
    }
  }
  &__steps {
    margin-block: 25px;
    .sd-modern-step {
      grid-template-columns: 26px minmax(0, 1fr);
      gap: 11px;
      padding-block: 17px;
    }
    .sd-modern-step:first-child {
      padding-block-start: 0;
    }
    .sd-modern-step + .sd-modern-step {
      margin-block-start: 0;
      border-block-start: 1px solid var(--sd-modern-border);
    }
    .sd-modern-step__number {
      width: 26px;
      height: 26px;
      border: 1px solid var(--sd-modern-border);
      border-radius: 8px;
      background: rgb(var(--v-theme-surface));
      color: var(--sd-modern-muted);
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
    }
    .sd-modern-step__title {
      font-size: 13px;
      font-weight: 500;
      line-height: 21px;
    }
  }
  &__domain {
    margin: 5px 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  &__text-action.sd-modern-button {
    min-height: 34px;
    margin-inline-start: -8px;
    padding: 6px 8px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__connect-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__connect-row > p {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__connect-button.sd-modern-button {
    min-height: 42px;
    padding: 9px 14px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
    :deep(> .v-btn__content) {
      font: inherit;
    }
    &.v-btn--disabled {
      color: var(--sd-modern-muted) !important;
      background: var(--sd-modern-inset) !important;
      opacity: 1;
      :deep(> .v-btn__overlay) {
        opacity: 0;
      }
    }
  }
  &__connected-copy {
    margin-block: 18px 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
  }
  &__critical {
    margin-block-start: 18px;
    > summary {
      align-items: center;
      gap: 11px;
      padding: 20px 26px;
    }
    > summary > .v-icon {
      color: var(--sd-modern-muted);
    }
    h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 21px;
    }
  }
  &__critical-content {
    padding: 0 26px 24px;
    border: 0;
  }
  &__critical-content > p {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__verify {
    margin-block: 16px;
  }
  &__verify:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 9px;
  }
  &__verify :deep(.mnh > .flex-grow-1 > b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
  }

  @media (max-width: 650px) {
    &__performance.sd-modern-widget {
      padding: 20px;
    }
    &__header {
      gap: 10px;
    }
    &__critical > summary {
      padding-inline: 21px;
    }
    &__critical-content {
      padding-inline: 21px;
    }
  }
  @media (max-width: 380px) {
    &__performance.sd-modern-widget {
      padding: 17px 14px;
    }
  }
  @media (max-width: 599px), (pointer: coarse) {
    &__connect-button.sd-modern-button {
      min-height: 44px;
      max-width: 100%;
      height: auto;
      white-space: normal;
      :deep(> .v-btn__content) {
        white-space: normal;
      }
    }
    &__text-action.sd-modern-button {
      min-height: 44px;
    }
    &__verify {
      min-height: 44px;
    }
  }
}
</style>

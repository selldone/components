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
  <section v-if="modern" class="s--shop-applications-modern text-start">
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="s--shop-applications-modern__brand">
          <img
            :src="require('../../../../assets/selldone-logo/logo-purple.svg')"
            alt=""
            width="28"
            height="34"
          />
        </span>
        <div>
          <p class="sd-modern-eyebrow">
            {{ $t("selldone_applications.workspace.label") }}
          </p>
          <h2 class="sd-modern-title-text">
            {{ $t("selldone_applications.workspace.title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("selldone_applications.workspace.subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        icon
        class="sd-modern-icon-button"
        variant="text"
        :aria-label="$t('global.actions.close')"
        v-tooltip="{
          text: $t('global.actions.close'),
          location: 'top',
          contentClass: 'sd-modern-tooltip text-start',
          openOnFocus: true,
        }"
        @click="close()"
        ><v-icon>close</v-icon></v-btn
      >
    </header>
    <div class="s--shop-applications-modern__content">
      <div class="s--shop-applications-modern__intro">
        <h3>{{ $t("selldone_applications.workspace.mobile_title") }}</h3>
        <p>{{ $t("selldone_applications.workspace.mobile_description") }}</p>
      </div>
      <div class="s--shop-applications-modern__badges">
        <a
          :href="ios"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('selldone_applications.workspace.app_store')"
          v-tooltip="{
            text: $t('selldone_applications.workspace.app_store'),
            location: 'top',
            contentClass: 'sd-modern-tooltip text-start',
            openOnFocus: true,
          }"
          ><img
            :src="require('../../../../assets/trademark/appstore.png')"
            alt="App Store"
            height="40"
        /></a>
        <a
          :href="android"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('selldone_applications.workspace.google_play')"
          v-tooltip="{
            text: $t('selldone_applications.workspace.google_play'),
            location: 'top',
            contentClass: 'sd-modern-tooltip text-start',
            openOnFocus: true,
          }"
          ><img
            :src="require('../../../../assets/trademark/googleplay.png')"
            alt="Google Play"
            height="40"
        /></a>
      </div>
      <div class="s--shop-applications-modern__download">
        <v-btn-toggle
          v-model="tab"
          :aria-label="$t('selldone_applications.workspace.qr_platform')"
          class="s--shop-applications-modern__platforms"
          mandatory
        >
          <v-btn
            value="ios"
            class="sd-modern-button"
            variant="text"
            :aria-pressed="tab === 'ios'"
            v-tooltip="{
              text: $t('selldone_applications.workspace.qr_for', {
                platform: 'iOS',
              }),
              location: 'top',
              contentClass: 'sd-modern-tooltip text-start',
              openOnFocus: true,
            }"
            ><v-icon start size="small">fa:fab fa-apple</v-icon>iOS</v-btn
          >
          <v-btn
            value="android"
            class="sd-modern-button"
            variant="text"
            :aria-pressed="tab === 'android'"
            v-tooltip="{
              text: $t('selldone_applications.workspace.qr_for', {
                platform: 'Android',
              }),
              location: 'top',
              contentClass: 'sd-modern-tooltip text-start',
              openOnFocus: true,
            }"
            ><v-icon start size="small">fa:fab fa-android</v-icon>Android</v-btn
          >
        </v-btn-toggle>
        <div
          class="s--shop-applications-modern__qr-code no-inv"
          role="img"
          :aria-label="
            $t('selldone_applications.workspace.qr_for', {
              platform: tab === 'ios' ? 'iOS' : 'Android',
            })
          "
        >
          <u-qrcode
            :options="{ width: 196, color: { light: '#fff', dark: '#111' } }"
            :value="qr"
          />
        </div>
        <p class="s--shop-applications-modern__scan">
          {{ $t("selldone_applications.scan_qr_code") }}
        </p>
        <p class="s--shop-applications-modern__scan-store" aria-live="polite">
          {{
            $t(
              tab === "ios"
                ? "selldone_applications.workspace.app_store"
                : "selldone_applications.workspace.google_play",
            )
          }}
        </p>
      </div>
      <div class="s--shop-applications-modern__features">
        <div class="s--shop-applications-modern__feature">
          <v-icon size="18" aria-hidden="true">notifications_active</v-icon>
          <div>
            <h3>
              {{ $t("selldone_applications.workspace.notification_title") }}
            </h3>
            <p>{{ $t("selldone_applications.notification.subtitle") }}</p>
          </div>
        </div>
        <div class="s--shop-applications-modern__feature">
          <v-icon size="18" aria-hidden="true">shopping_bag</v-icon>
          <div>
            <h3>{{ $t("selldone_applications.workspace.order_title") }}</h3>
            <p>{{ $t("selldone_applications.order.subtitle") }}</p>
          </div>
        </div>
        <div class="s--shop-applications-modern__feature">
          <v-icon size="18" aria-hidden="true">shelves</v-icon>
          <div>
            <h3>{{ $t("selldone_applications.workspace.product_title") }}</h3>
            <p>{{ $t("selldone_applications.product.subtitle") }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="s--shop-applications-modern__desktop">
      <span class="sd-modern-icon s--shop-applications-modern__desktop-icon"
        ><v-icon size="20" aria-hidden="true">desktop_windows</v-icon></span
      >
      <div class="s--shop-applications-modern__desktop-copy">
        <h3>{{ $t("selldone_applications.workspace.desktop_title") }}</h3>
        <p>{{ $t("selldone_applications.workspace.desktop_description") }}</p>
        <ul
          class="s--shop-applications-modern__systems"
          :aria-label="$t('selldone_applications.workspace.desktop_platforms')"
        >
          <li>
            <v-icon size="16" aria-hidden="true">fa:fab fa-apple</v-icon
            ><span dir="ltr">macOS</span>
          </li>
          <li>
            <v-icon size="15" aria-hidden="true">fa:fab fa-windows</v-icon
            ><span dir="ltr">Windows</span>
          </li>
          <li>
            <v-icon size="17" aria-hidden="true">fa:fab fa-linux</v-icon
            ><span dir="ltr">Linux</span>
          </li>
        </ul>
      </div>
      <a
        :href="desktop"
        target="_blank"
        rel="noopener noreferrer"
        class="s--shop-applications-modern__desktop-link"
        v-tooltip="{
          text: $t('selldone_applications.workspace.desktop_help'),
          location: 'top',
          contentClass: 'sd-modern-tooltip text-start',
          openOnFocus: true,
        }"
      >
        {{ $t("selldone_applications.workspace.desktop_action")
        }}<v-icon size="18" aria-hidden="true">open_in_new</v-icon>
      </a>
    </div>
    <p class="s--shop-applications-modern__account">
      <v-icon size="16" aria-hidden="true">check</v-icon
      >{{ $t("selldone_applications.workspace.account") }}
    </p>
  </section>

  <s-widget v-else class="position-relative">
    <h2 class="text-h3 my-2 text-capitalize line-height-normal fadeIn">
      {{ $t("selldone_applications.title") }} 🎊
    </h2>
    <h3
      class="text-h4 my-2 font-weight-light line-height-normal fadeIn delay_200"
    >
      {{ $t("selldone_applications.msg") }}
      <v-chip class="mx-2" color="success">Available Now</v-chip>
    </h3>

    <div>
      <a
        :href="ios"
        class="m-2 inline-block fadeIn delay_600 row-hover rounded-lg"
        target="_blank"
        ><img
          :src="require('../../../../assets/trademark/appstore.png')"
          height="52"
      /></a>

      <a
        :href="android"
        class="m-2 inline-block fadeIn delay_500 row-hover rounded-lg"
        target="_blank"
        ><img
          :src="require('../../../../assets/trademark/googleplay.png')"
          height="52"
      /></a>
    </div>

    <div class="c-container -force-rounded flex-row mt-5">
      <div
        :class="{ selected: tab === 'ios' }"
        class="selection-box min-width-150"
        @click="tab = 'ios'"
      >
        <v-icon class="me-2">fa:fab fa-apple</v-icon>
        iOS
      </div>

      <div
        :class="{ selected: tab === 'android' }"
        class="selection-box min-width-150"
        @click="tab = 'android'"
      >
        <v-icon class="me-2">fa:fab fa-android</v-icon>

        Android
      </div>
    </div>

    <v-row align="center" justify="center">
      <v-col class="flex-grow-0">
        <div class="position-relative min-width-300">
          <u-qrcode
            :options="{ width: 300, color: { light: '#fff', dark: '#111' } }"
            :value="qr"
            class="border rounded-28px overflow-hidden"
          >
          </u-qrcode>
          <div class="small">
            <v-icon>straight</v-icon>

            {{ $t("selldone_applications.scan_qr_code") }}
          </div>
          <div class="center-absolute circle-white p-1">
            <v-icon
              v-if="tab === 'ios'"
              color="#111"
              size="small"
              style="width: 24px; height: 24px"
              >fa:fab fa-apple
            </v-icon>
            <v-icon
              v-else-if="tab === 'android'"
              color="#111"
              size="small"
              style="width: 24px; height: 24px"
              >fa:fab fa-google-play
            </v-icon>
          </div>
        </div>
      </v-col>
      <v-col class="flex-grow-1 max-w-400 min-width-250">
        <div class="text-start">
          <v-list-item
            :subtitle="$t('selldone_applications.notification.subtitle')"
            :title="$t('selldone_applications.notification.title')"
            class="ma-2"
            prepend-icon="notifications_active"
            rounded="lg"
            variant="plain"
          >
          </v-list-item>
          <v-list-item
            :subtitle="$t('selldone_applications.order.subtitle')"
            :title="$t('selldone_applications.order.title')"
            class="ma-2"
            prepend-icon="shopping_bag"
            rounded="lg"
            variant="plain"
          >
          </v-list-item>
          <v-list-item
            :subtitle="$t('selldone_applications.product.subtitle')"
            :title="$t('selldone_applications.product.title')"
            class="ma-2"
            prepend-icon="shelves"
            rounded="lg"
            variant="plain"
          >
          </v-list-item>
        </div>
      </v-col>
    </v-row>

    <v-btn
      class="absolute-top-end"
      icon
      size="x-large"
      variant="plain"
      @click="close()"
    >
      <v-icon>close</v-icon>
    </v-btn>
  </s-widget>
</template>

<script lang="ts">
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "BDashboardShopApplications",
  props: { modern: { type: Boolean, default: false } },

  data: () => ({
    tab: "ios",
    android: SetupService.AndroidApp(),
    ios: SetupService.IosApp(),
  }),

  computed: {
    desktop() {
      return SetupService.MainServiceUrl() + "/desktop#downloads";
    },
    qr() {
      return this.tab === "ios" ? this.ios : this.android;
    },
  },

  methods: {
    close() {
      localStorage.setItem(
        "hide-applications-dashboard-release",
        Math.round(new Date().getMonth() / 3).toString(),
      );
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.s--shop-applications-modern {
  font-family: inherit;

  .sd-modern-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    margin-block-end: 28px;
  }
  .sd-modern-title {
    align-items: center;
    gap: 15px;
  }
  .sd-modern-title-text {
    font-size: 23px;
    font-weight: 500;
    line-height: 1.3;
  }
  .sd-modern-eyebrow {
    margin-block-end: 5px;
    font-size: 11px;
    font-weight: 500;
  }
  .sd-modern-subtitle {
    margin-block-start: 6px;
    font-size: 13px;
  }
  &__brand {
    display: grid;
    flex: 0 0 52px;
    place-items: center;
    height: 56px;
    background: var(--sd-modern-inset);
    border-radius: 13px;
  }
  &__brand img {
    display: block;
    object-fit: contain;
  }
  &__content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 206px;
    grid-template-areas: "intro download" "features download" "badges download";
    align-items: start;
    gap: 18px 28px;
    margin-block-end: 26px;
  }
  &__download {
    grid-area: download;
    min-width: 0;
    width: 206px;
    max-width: 100%;
    justify-self: center;
    align-self: center;
    text-align: center;
  }
  &__platforms {
    display: flex;
    height: auto;
    gap: 4px;
    padding: 4px;
    margin-block-end: 11px;
    background: var(--sd-modern-inset);
    border-radius: 13px;
  }
  &__platforms.v-btn-group > .v-btn {
    flex: 1 1 auto;
    min-width: 0;
    height: 36px;
    padding-inline: 8px;
    font-size: 13px;
    white-space: nowrap;
    border-radius: 9px;
  }
  &__platforms > .v-btn :deep(.v-btn__content) {
    white-space: nowrap;
    overflow-wrap: normal;
  }
  &__platforms .v-btn--active {
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), 0.06);
  }
  &__qr-code {
    width: 100%;
    aspect-ratio: 1;
    padding: 5px;
    overflow: hidden;
    background: #fff;
    border-radius: 12px;
    line-height: 0;
  }
  &__qr-code :deep(canvas),
  &__qr-code :deep(.v-skeleton-loader) {
    display: block;
    max-width: 100%;
    height: auto !important;
  }
  &__scan {
    margin: 10px 0 0;
    font-size: 13px;
  }
  &__scan-store {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__features {
    grid-area: features;
    display: grid;
    gap: 15px;
    min-width: 0;
  }
  &__intro {
    grid-area: intro;
  }
  &__intro h3,
  &__desktop h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__intro p {
    max-width: 360px;
    margin: 7px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 1.7;
  }
  &__feature {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: start;
    gap: 11px;
  }
  &__feature > .v-icon {
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  &__feature h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__feature p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.6;
  }
  &__badges {
    grid-area: badges;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  &__badges a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    border-radius: 8px;
  }
  &__badges img {
    display: block;
    width: auto;
    max-width: 145px;
    height: 40px;
    object-fit: contain;
  }
  &__badges a:focus-visible,
  &__desktop-link:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  &__desktop {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    align-items: center;
    gap: 13px;
    padding-block: 21px 14px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__desktop-icon {
    align-self: start;
    width: 34px;
    height: 34px;
    margin-block-start: 1px;
    color: var(--sd-modern-muted);
    background: var(--sd-modern-inset);
    border-radius: 9px;
  }
  &__desktop-copy {
    min-width: 0;
  }
  &__desktop h3 {
    font-size: 14px;
  }
  &__desktop p {
    margin: 5px 0 9px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.7;
  }
  &__systems {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin: 0;
    padding: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    list-style: none;
  }
  &__systems li {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  &__desktop-link {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 6px;
    min-height: 44px;
    padding-inline: 8px;
    color: rgb(var(--v-theme-primary));
    border-radius: 8px;
    font-size: 13px;
    text-decoration: none;
    white-space: nowrap;
  }
  &__desktop-link:hover {
    background: var(--sd-modern-inset);
  }
  &__account {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 12px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 1.7;
    text-align: center;
  }
  @media (max-width: 600px) {
    .sd-modern-header {
      align-items: start;
      gap: 10px;
      margin-block-end: 24px;
    }
    .sd-modern-title {
      gap: 11px;
    }
    .sd-modern-title-text {
      font-size: 20px;
    }
    &__brand {
      flex-basis: 42px;
      height: 47px;
      border-radius: 11px;
    }
    &__brand img {
      width: 22px;
      height: 28px;
    }
    &__content {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: "intro" "badges" "download" "features";
      gap: 20px;
    }
    &__intro p {
      max-width: none;
    }
    &__platforms > .v-btn {
      min-height: 44px;
    }
    &__desktop {
      grid-template-columns: 31px minmax(0, 1fr);
      gap: 10px;
      padding-block-start: 20px;
    }
    &__desktop-icon {
      width: 31px;
      height: 31px;
    }
    &__desktop-link {
      grid-column: 2;
      justify-self: start;
      white-space: normal;
    }
    &__systems {
      gap: 11px;
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

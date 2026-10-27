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
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon>phone_iphone</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("admin_shop.dashboard.modern.mobile_apps") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("selldone_applications.msg") }}
          </p>
        </div>
      </div>
      <v-btn
        icon
        class="sd-modern-icon-button"
        variant="text"
        :aria-label="$t('global.actions.close')"
        v-tooltip="$t('global.actions.close')"
        @click="close()"
        ><v-icon>close</v-icon></v-btn
      >
    </header>
    <div class="s--shop-applications-modern__content">
      <div class="s--shop-applications-modern__badges">
        <a
          :href="ios"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('global.actions.download') + ' · App Store'"
          v-tooltip="$t('global.actions.download') + ' · App Store'"
          ><img
            :src="require('../../../../assets/trademark/appstore.png')"
            alt="App Store"
            height="40"
        /></a>
        <a
          :href="android"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('global.actions.download') + ' · Google Play'"
          v-tooltip="$t('global.actions.download') + ' · Google Play'"
          ><img
            :src="require('../../../../assets/trademark/googleplay.png')"
            alt="Google Play"
            height="40"
        /></a>
      </div>
      <div class="s--shop-applications-modern__download">
        <v-btn-toggle
          v-model="tab"
          :aria-label="$t('admin_shop.dashboard.modern.mobile_apps')"
          class="s--shop-applications-modern__platforms"
          mandatory
        >
          <v-btn
            value="ios"
            class="sd-modern-button"
            variant="text"
            :aria-pressed="tab === 'ios'"
            v-tooltip="'iOS'"
            ><v-icon start size="small">fa:fab fa-apple</v-icon>iOS</v-btn
          >
          <v-btn
            value="android"
            class="sd-modern-button"
            variant="text"
            :aria-pressed="tab === 'android'"
            v-tooltip="'Android'"
            ><v-icon start size="small">fa:fab fa-android</v-icon>Android</v-btn
          >
        </v-btn-toggle>
        <u-qrcode
          :options="{ width: 220, color: { light: '#fff', dark: '#111' } }"
          :value="qr"
          class="s--shop-applications-modern__qr-code"
        />
        <p class="sd-modern-subtitle text-center">
          {{ $t("selldone_applications.scan_qr_code") }}
        </p>
      </div>
      <div class="s--shop-applications-modern__features">
        <div class="s--shop-applications-modern__intro">
          <h3 class="sd-modern-eyebrow">
            {{ $t("selldone_applications.title") }}
          </h3>
          <span class="s--shop-applications-modern__availability"
            ><span class="sd-modern-status__dot" />{{
              $t("global.commons.available")
            }}</span
          >
        </div>
        <div class="s--shop-applications-modern__feature">
          <v-icon size="20">notifications_active</v-icon>
          <div>
            <h3>{{ $t("selldone_applications.notification.title") }}</h3>
            <p>{{ $t("selldone_applications.notification.subtitle") }}</p>
          </div>
        </div>
        <div class="s--shop-applications-modern__feature">
          <v-icon size="20">shopping_bag</v-icon>
          <div>
            <h3>{{ $t("selldone_applications.order.title") }}</h3>
            <p>{{ $t("selldone_applications.order.subtitle") }}</p>
          </div>
        </div>
        <div class="s--shop-applications-modern__feature">
          <v-icon size="20">shelves</v-icon>
          <div>
            <h3>{{ $t("selldone_applications.product.title") }}</h3>
            <p>{{ $t("selldone_applications.product.subtitle") }}</p>
          </div>
        </div>
      </div>
    </div>
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
  .sd-modern-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 16px;
    margin-block-end: 24px;
  }
  .sd-modern-title > div {
    min-width: 0;
  }
  &__content {
    display: grid;
    grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
    grid-template-areas: "download features" "download badges";
    align-items: start;
    gap: 16px 28px;
  }
  &__download {
    grid-area: download;
    min-width: 0;
    max-width: 220px;
    justify-self: center;
  }
  &__platforms {
    display: flex;
    height: auto;
    gap: 4px;
    margin-block-end: 12px;
  }
  &__platforms > .v-btn {
    flex: 1 0 auto;
    min-width: 0;
    padding-inline: 10px;
    font-size: 13px;
    white-space: nowrap;
  }
  &__platforms > .v-btn :deep(.v-btn__content) {
    white-space: nowrap;
    overflow-wrap: normal;
  }
  &__platforms .v-btn--active {
    background: var(--sd-modern-inset);
  }
  &__qr-code {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 12px;
  }
  &__qr-code :deep(canvas) {
    display: block;
    max-width: 100%;
    height: auto !important;
  }
  &__features {
    grid-area: features;
    min-width: 0;
  }
  &__intro {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-block-end: 6px;
  }
  &__availability {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__feature {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: start;
    gap: 12px;
    padding-block: 12px;
  }
  &__feature > .v-icon {
    margin-block-start: 2px;
    color: var(--sd-modern-muted);
  }
  &__feature h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  }
  &__feature p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
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
    max-width: 100%;
  }
  &__badges a:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  @media (max-width: 600px) {
    &__content {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: "badges" "download" "features";
      gap: 20px;
    }
    &__platforms > .v-btn {
      min-height: 44px;
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

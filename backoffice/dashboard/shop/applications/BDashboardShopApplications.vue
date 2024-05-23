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
  <s-widget class="position-relative">
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

<script>
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "BDashboardShopApplications",

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

<style scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

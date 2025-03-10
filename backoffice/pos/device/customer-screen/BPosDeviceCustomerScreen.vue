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
  <div class="mb-4">
    <v-expand-transition>
      <u-loading-progress v-if="busy"></u-loading-progress>
      <div v-else class="widget-box">
        <u-widget-header icon="cast" title="Customer Screen"></u-widget-header>
        <v-list-subheader>
          You can convert any devices to a customer screen for your POS just by
          pasting the following link in its browser.
        </v-list-subheader>
        <u-qrcode
          v-if="qrcode_value"
          :options="{
            width: $vuetify.display.mdAndUp ? 420 : 250,
            color: { dark: '#000', light: '#fff' },
          }"
          :value="qrcode_value"
          class="d-block mx-auto my-5"
          style="max-width: 100%; border-radius: 12px"
        />

        <div class="widget-buttons">
          <v-btn
            :href="secure_url"
            color="primary"
            size="x-large"
            target="_blank"
            variant="elevated"
          >
            <v-icon start>open_in_new</v-icon>
            Open customer view app
          </v-btn>
        </div>
        <div class="widget-buttons">
          <v-btn
            color="primary"
            size="x-large"
            variant="outlined"
            @click="copyToClipboard(secure_url)"
          >
            <v-icon start>file_copy</v-icon>
            Copy secure url
          </v-btn>
        </div>

        <div class="my-2">
          <v-icon class="me-1">info</v-icon>
          You can paste this URL into the browser of any device. (Android/ iOS
          tablets, PC, ...)
        </div>
      </div>
    </v-expand-transition>

    <v-btn class="absolute-top-end" icon variant="text" @click="$emit('close')">
      <v-icon>close</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { PosDeviceTypes } from "@selldone/core-js/enums/pos/PosDeviceTypes";
import UWidgetHeader from "../../../../ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BPosDeviceCustomerScreen",
  components: { UWidgetHeader },
  emits: ["close", "add"],
  props: {
    shop: {
      type: Object,
      require: true,
    },
    deviceData: {},
  },

  data: () => ({
    busy: false,

    secure_url: null, // Secure URL generated by server
  }),
  computed: {
    qrcode_value() {
      return this.secure_url;
    },
  },

  watch: {
    deviceData(deviceData) {
      // console.log('deviceData',deviceData)

      // Listen on device connect signal:
      if (
        deviceData.device &&
        deviceData.device.connected &&
        deviceData.device.type === PosDeviceTypes.CustomerView.code
      ) {
        this.$emit("close");
        this.$emit("add", deviceData.device);
      }
    },
  },

  created() {
    this.getSecureUrl();
  },

  methods: {
    getSecureUrl() {
      this.busy = true;

      axios
        .get(
          window.API.GET_CASH_REGISTER_SECURE_URL(
            this.shop.id,
            PosDeviceTypes.CustomerView.code,
          ),
        )
        .then(({ data }) => {
          this.secure_url = data.url;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style scoped></style>

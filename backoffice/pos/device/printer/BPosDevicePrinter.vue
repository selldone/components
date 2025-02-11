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
    <u-loading-progress v-if="busy"></u-loading-progress>
    <div v-else class="widget-box">
      <u-widget-header icon="print" title="Receipt Printer"></u-widget-header>
      <v-list-subheader>
        You can add printer devices to your POS.
      </v-list-subheader>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { PosDeviceTypes } from "@selldone/core-js/enums/pos/PosDeviceTypes";
import UWidgetHeader from "../../../../ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BPosDevicePrinter",
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
        deviceData.device.type === PosDeviceTypes.Printer.code
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
            PosDeviceTypes.Printer.code,
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

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

<template>
  <s-widget-box
    :sub-title="$t('product_admin.dashboard.inform.title_small')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
      'product_admin.dashboard.inform.title',
    )}</h5>`"
    icon="fa:fas fa-bullhorn"
  >
    <p>
      <v-icon size="small">notifications_active</v-icon>
      {{ $t("product_admin.dashboard.inform.message") }}
    </p>

    <v-list class="bg-transparent border-between-vertical overflow-hidden">
      <v-list-item
        :disabled="!product.for_auction"
        :href="download_for_auction"
        target="_blank"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/discounted-product.svg" />
          </v-avatar>
        </template>

        <v-list-item-title class="text-h4 font-weight-black">
          {{ numeralFormat(product.for_auction, "0,0a") }}
          <small class="text-subtitle-1">{{
            $t("product_admin.dashboard.inform.unit")
          }}</small>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t("product_admin.dashboard.inform.waiting_for_auction") }}
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-list-item-action
            class="align-self-center ma-auto"
            end
            title="Download the list"
          >
            <v-icon>download</v-icon>
          </v-list-item-action>
        </template>
      </v-list-item>

      <v-list-item
        :disabled="!product.for_available"
        :href="download_for_available"
        target="_blank"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0">
            <img src="../../../../assets/icons/available-product.svg" />
          </v-avatar>
        </template>

        <v-list-item-title class="text-h4 font-weight-black">
          {{ numeralFormat(product.for_available, "0,0a") }}
          <small class="text-subtitle-1">{{
            $t("product_admin.dashboard.inform.unit")
          }}</small>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t("product_admin.dashboard.inform.waiting_for_available") }}
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-list-item-action
            class="align-self-center ma-auto"
            end
            title="Download the list"
          >
            <v-icon>download</v-icon>
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

export default {
  name: "BProductMarketingAbstractView",
  components: { SWidgetBox },
  props: {
    product: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    download_for_auction() {
      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        return window.VAPI.GET_MY_VENDOR_EXPORT_FOR_AUCTION(
          this.product.vendor_id,
          this.product.id,
        );
      }

      return window.API.GET_EXPORT_FOR_AUCTION(
        this.product.shop_id,
        this.product.id,
      );
    },
    download_for_available() {
      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        return window.VAPI.GET_MY_VENDOR_EXPORT_FOR_AVAILABLE(
          this.product.vendor_id,
          this.product.id,
        );
      }

      return window.API.GET_EXPORT_FOR_AVAILABLE(
        this.product.shop_id,
        this.product.id,
      );
    },
  },
  created() {},
};
</script>

<style scoped></style>

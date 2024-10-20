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
  <v-row v-if="connect" align="center" no-gutters>
    <v-list-item
      :prepend-avatar="getShopImagePath(connect.icon)"
      :title="`${$t(connect_mode.title)} Connect ● ${connect.name}`"
    >
      <template v-slot:subtitle>
        <span
          v-html="$t('product_flow.connect.subtitle', { name: connect.name })"
        ></span>

        <div v-if="connect.enable">
          <v-icon class="me-1" color="green">check_circle</v-icon>
          {{ $t("product_flow.connect.enable_msg") }}
        </div>
        <div v-else>
          <v-icon class="me-1" color="red">cancel</v-icon>
          {{ $t("product_flow.connect.disable_msg") }}
        </div>

        <div v-if="connect.shipping">
          <v-icon class="me-1" color="green">check_circle</v-icon>
          {{
            $t("product_flow.connect.has_shipping_msg", { name: connect.name })
          }}
        </div>
      </template>
    </v-list-item>

    <div class="text-end flex-grow-1">
      <v-btn
        v-if="!IS_VENDOR_PANEL"
        :to="{ name: 'BPageShopChannelConnect' }"
        class="tnt ma-1"
        color="primary"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -shop" size="24">
          <v-img :src="getShopImagePath($shop.icon, 64)"></v-img>
        </v-avatar>
        <v-avatar class="avatar-gradient -thin -connect ms-n3 me-1" size="24">
          <v-img :src="getShopImagePath(connect.icon)"></v-img>
        </v-avatar>

        {{ $t("global.commons.manage") }} {{ connect.name }}
      </v-btn>
    </div>
  </v-row>
</template>

<script lang="ts">
import { Connect } from "@selldone/core-js";

export default {
  name: "BProductFlowRowConnect",
  components: {},
  inject: ["$shop", "$product"],
  props: {},

  data: function () {
    return {};
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    connect() {
      return this.$product.connect;
    },

    connect_mode() {
      return Connect.Modes[this.connect?.mode];
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>

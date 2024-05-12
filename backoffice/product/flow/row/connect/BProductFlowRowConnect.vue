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
  <v-row   v-if="connect" no-gutters align="center">
    <v-list-item

      :prepend-avatar="getShopImagePath(connect.icon)"
      :title="`${$t(connect_mode.title)} Connect ● ${connect.name}`"
    >
      <template v-slot:subtitle>
        This product has been added via <b>{{ connect.name }}</b
        >.

        <div v-if="connect.enable">
          <v-icon class="me-1" color="green">check_circle</v-icon>
          This bridge to external service is enabled.
        </div>
        <div v-else>
          <v-icon class="me-1" color="red">cancel</v-icon>
          This bridge to external service is disabled.
        </div>

        <div v-if="connect.shipping">
          <v-icon class="me-1" color="green">check_circle</v-icon>
          {{ connect.name }} support shipping. So you have the option to enable
          auto shipping calculation by {{ connect.name }} on the checkout page.
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
          <v-img :src="getShopImagePath(shop.icon, 64)"></v-img>
        </v-avatar>
        <v-avatar class="avatar-gradient -thin -connect ms-n3 me-1" size="24">
          <v-img :src="getShopImagePath(connect.icon)"></v-img>
        </v-avatar>

        Manage {{ connect.name }}
      </v-btn>
    </div>
  </v-row>
</template>

<script>
import { ConnectMode } from "@selldone/core-js/enums/connect/ConnectMode";

export default {
  name: "BProductFlowRowConnect",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
  },

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
      return this.product.connect;
    },

    connect_mode() {
      return ConnectMode[this.connect?.mode];
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>

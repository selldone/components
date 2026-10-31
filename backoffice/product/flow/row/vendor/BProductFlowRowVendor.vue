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
  <v-row    v-if="isMarketplace" align="center" no-gutters>
    <v-list-item

      :title="
        $t('global.commons.marketplace') +
        (vendor_owner
          ? ` ● ${vendor_owner.name}`
          : vendors?.length
            ? ` ● ${vendors?.length} ${$t('global.commons.vendors')}`
            : ` ● ${$t('global.commons.no_vendors')}`)
      "
      class="flex-grow-1"
      prepend-icon="storefront"
    >
      <template v-slot:subtitle>
        <div v-if="vendor_owner">
          <span v-if="modern" class="sd-modern-status__dot sd-modern-status__dot--success" aria-hidden="true" />
          <v-icon v-else class="me-1" color="green">check_circle</v-icon>
          <span
            v-html="
              $t('product_flow.vendor.vendor_owner_msg', {
                vendor: vendor_owner.name,
              })
            "
          >
          </span>
        </div>

        <div v-else-if="vendors?.length">
          <span v-if="modern" class="sd-modern-status__dot sd-modern-status__dot--success" aria-hidden="true" />
          <v-icon v-else class="me-1" color="green">check_circle</v-icon>
          {{
            $t("product_flow.vendor.has_vendors_msg", {
              count: vendors?.length,
            })
          }}
        </div>
        <div v-else>
          <span v-if="modern" class="sd-modern-status__dot sd-modern-status__dot--error" aria-hidden="true" />
          <v-icon v-else class="me-1" color="red">cancel</v-icon>
          {{ $t("product_flow.vendor.no_vendor_msg") }}
        </div>
      </template>
    </v-list-item>

    <div class="flex-grow-1 text-end">
      <v-btn
        v-if="!IS_VENDOR_PANEL"
        :to="{ name: 'BPageProductVendors' }"
        class="tnt ma-1"
        :class="{ 'sd-modern-button sd-modern-button--small': modern }"
        color="primary"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -product me-1" size="24">
          <v-img :src="getShopImagePath($product.icon, 64)"></v-img>
        </v-avatar>
        {{ $t("product_flow.vendor.add_vendors") }}
      </v-btn>
    </div>
  </v-row>
</template>

<script lang="ts">
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";

export default {
  name: "BProductFlowRowVendor",
  components: {},
  inject: ["$shop", "$product"],

  props: { modern: { type: Boolean, default: false } },

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

    isMarketplace() {
      return this.$shop.model === BusinessModel.MARKETPLACE.code;
    },
    vendor_owner() {
      return this.$product.vendor;
    },
    vendors() {
      return this.$product.vendors;
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>

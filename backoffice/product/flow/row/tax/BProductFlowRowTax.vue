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
  <v-row align="center" no-gutters>
    <v-list-item
      :prepend-icon="
        current_tax_profile?.icon ? current_tax_profile.icon : 'balance'
      "
      :title="
        (isSubscription
          ? $t('product_flow.tax.title')
          : $t('global.commons.tax')) +
        (current_tax_profile
          ? ` ● ${current_tax_profile.name}`
          : ` ● ${$t('product_flow.tax.default_shop')}`)
      "
      class="flex-grow-1"
    >
      <template v-slot:subtitle>
        <v-icon class="me-1" color="green">check_circle</v-icon>
        <span v-html="tax_profile_desc"></span>
      </template>
    </v-list-item>

    <div class="text-end flex-grow-1">
      <v-btn
        v-if="!IS_VENDOR_PANEL"
        :to="{ name: 'BPageShopFinanceTax' }"
        class="tnt ma-1"
        color="primary"
        variant="text"
      >
        <v-avatar class="avatar-gradient -thin -shop me-1" size="24">
          <v-img :src="getShopImagePath($shop.icon, 64)"></v-img>
        </v-avatar>

        {{ $t("product_flow.tax.tax_profiles") }}
      </v-btn>
    </div>
  </v-row>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BProductFlowRowTax",
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

    tax_profiles() {
      return this.$shop.tax_profiles;
    },

    isSubscription() {
      return this.$product.type === ProductType.SUBSCRIPTION.code;
    },
    current_tax_profile() {
      return (
        this.$product.tax_id &&
        this.tax_profiles.find((t) => t.id === this.$product.tax_id)
      );
    },

    tax_profile_desc() {
      if (this.isSubscription)
        return this.$t("product_flow.tax.description.subscription_tax_msg");
      let out = "";
      let tax = null;
      if (!this.current_tax_profile) {
        out = `<b>${this.$t("global.commons.default")}</b> `;
        tax = this.$shop.tax;
      } else {
        out = `<b>${this.$t("product_flow.tax.description.dedicated")}</b> `;
        tax = this.current_tax_profile;
      }

      if (tax) {
        if (!tax.enable) {
          out += ` | ${this.$t("product_flow.tax.description.is_disabled")} (⚠️${this.$t("global.commons.warning")})`;
        } else {
          if (tax.fix) {
            out += ` | ${this.$t("global.commons.tax")}: ${tax.fix_vat}%`;

            if (tax.shipping) {
              out += ` | ${this.$t("global.commons.shipping")}: ${tax.fix_shipping}%`;
            }
          } else {
            out += ` | ${this.$t("product_flow.tax.description.tax_is_based_on_location")}`;

            if (tax.shipping) {
              out += ` | ${this.$t("product_flow.tax.description.shipping_tax_is_based_on_location")} `;
            }
          }

          if (tax.included) {
            out += ` | ${this.$t("product_flow.tax.description.included_in_price")}`;
          } else {
            out += `.`;
          }
        }
      }

      return out;
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>

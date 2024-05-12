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
  <v-row no-gutters align="center">
    <v-list-item
      class="flex-grow-1"
      :prepend-icon="
        current_tax_profile?.icon ? current_tax_profile.icon : 'balance'
      "
      :title="
        (isSubscription ? 'Subscription tax' : $t('global.commons.tax')) +
        (current_tax_profile
          ? ` ● ${current_tax_profile.name}`
          : ' ● Default Shop')
      "
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
          <v-img :src="getShopImagePath(shop.icon, 64)"></v-img>
        </v-avatar>
        Tax Profiles
      </v-btn>
    </div>
  </v-row>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BProductFlowRowTax",
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

    tax_profiles() {
      return this.shop.tax_profiles;
    },

    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },
    current_tax_profile() {
      return (
        this.product.tax_id &&
        this.tax_profiles.find((t) => t.id === this.product.tax_id)
      );
    },

    tax_profile_desc() {
      if (this.isSubscription)
        return "We can apply tax only on the payment creation step.";
      let out = "";
      let tax = null;
      if (!this.current_tax_profile) {
        out = `<b>Default</b> `;
        tax = this.shop.tax;
      } else {
        out = "<b>Dedicated</b> ";
        tax = this.current_tax_profile;
      }

      if (tax) {
        if (!tax.enable) {
          out += " | This tax profile is disabled! (⚠️Warning)";
        } else {
          if (tax.fix) {
            out += ` | Tax: ${tax.fix_vat}%`;

            if (tax.shipping) {
              out += ` | Shipping: ${tax.fix_shipping}%`;
            }
          } else {
            out += ` | Tax: Location based`;

            if (tax.shipping) {
              out += ` | Shipping: Location based`;
            }
          }

          if (tax.included) {
            out += ` | Included in price.`;
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

<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-list-item
    :prepend-icon="
      product.tax_id && current_tax_profile?.icon
        ? current_tax_profile.icon
        : 'gavel'
    "
    class="row-hover"
    v-bind="$attrs"
    @click="showSetTax()"
  >
    <v-list-item-title>
      <b
        >{{ isSubscription ? "Subscription tax" : $t("global.commons.tax") }}
        <span v-if="current_tax_profile && product.tax_id">
          <v-icon class="mx-1" color="#111">{{
            $t("icons.chevron_next")
          }}</v-icon>
          {{ current_tax_profile.name }}</span
        >
      </b>
    </v-list-item-title>
    <v-list-item-subtitle v-html="tax_profile_desc"></v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          :color="product.tax_id ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon>{{ product.tax_id ? "check_box" : "add_box" }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>

  <!-- ██████████████████████ Dialog > Select Tax profile ██████████████████████ -->

  <v-dialog
    v-model="tax_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-avatar class="me-2" size="36"
          ><img :src="getShopImagePath(product.icon, 64)"
        /></v-avatar>
        {{ $t("product_tax_profile.dialog.header") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <s-widget-header
            :add-caption="$t('product_tax_profile.dialog.action_manage')"
            :add-sub-caption="
              $t('product_tax_profile.dialog.action_manage_sub')
            "
            :title="$t('product_tax_profile.dialog.title')"
            :to="{ name: 'BPageShopFinanceTax' }"
            add-text
            icon="gavel"
          >
          </s-widget-header>
          <v-list-subheader>
            {{ $t("product_tax_profile.dialog.subtitle") }}
          </v-list-subheader>

          <b-tax-profile-input
            v-model="tax_input"
            :shop="shop"
          ></b-tax-profile-input>

          <p
            v-if="isSubscription"
            v-html="$t('product_tax_profile.dialog.subscription_tips')"
          ></p>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="tax_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="selectTax(tax_input)"
          >
            <v-icon class="me-1">check</v-icon>
            {{ $t("global.actions.confirm") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent } from "vue";
import BTaxProfileInput from "../../../tax/profile/input/BTaxProfileInput.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default defineComponent({
  name: "BProductProfileTax",
  components: { BTaxProfileInput },

  props: {
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },
  data: function () {
    return {
      current_tax_profile: null,

      tax_dialog: false,
      tax_input: null,
    };
  },

  computed: {
    tax_profiles() {
      return this.shop.tax_profiles;
    },
    isSubscription() {
      return this.type?.code === ProductType.SUBSCRIPTION.code;
    },

    tax_profile_desc() {
      if (this.isSubscription)
        return this.$t("product_tax_profile.description.subscription");
      let out = "";
      let tax = null;
      if (!this.current_tax_profile) {
        out = `<b>${this.$t("product_tax_profile.description.default")}</b> `;
        tax = this.shop.tax;
      } else {
        out = `<b>${this.$t("product_tax_profile.description.dedicated")}</b> `;
        tax = this.current_tax_profile;
      }

      if (tax) {
        if (!tax.enable) {
          out += ` | ${this.$t("product_tax_profile.description.is_disabled")}`;
        } else {
          if (tax.fix) {
            out += ` | ${this.$t("product_tax_profile.description.fixed_rate")}: ${tax.fix_vat}%`;

            if (tax.shipping) {
              out += ` | ${this.$t("product_tax_profile.description.shipping")}: ${tax.fix_shipping}%`;
            }
          } else {
            out += ` | ${this.$t("product_tax_profile.description.location_based_rate")}`;

            if (tax.shipping) {
              out += ` | ${this.$t("product_tax_profile.description.shipping_location_based_rate")}`;
            }
          }

          if (tax.included) {
            out += ` | ${this.$t("product_tax_profile.description.include_in_price")}.`;
          } else {
            out += `.`;
          }
        }
      }

      return out;
    },
  },

  created() {
    this.refreshTaxProfile();
  },

  methods: {
    // ████████████████████ Set Tax ████████████████████
    showSetTax() {
      this.tax_input = this.product.tax_id;
      this.tax_dialog = true;
    },
    selectTax(tax_id) {
      this.product.tax_id = tax_id;
      this.tax_dialog = false;
      this.refreshTaxProfile();
    },
    refreshTaxProfile() {
      this.current_tax_profile =
        this.product.tax_id &&
        this.tax_profiles.find((t) => t.id === this.product.tax_id);
    },
  },
});
</script>

<style lang="scss" scoped></style>

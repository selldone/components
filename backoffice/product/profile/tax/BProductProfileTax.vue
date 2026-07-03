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
    slim
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

    <v-list-item-subtitle class="d-flex flex-wrap align-center ga-1 mt-1">
      <span class="tax-profile-desc-text" v-html="tax_profile_desc"></span>

      <span class="tax-profile-badges ms-auto d-flex align-center ga-1">
        <v-chip
          :color="taxRuleScopeColor(applied_tax_rule)"
          label
          size="x-small"
          variant="flat"
        >
          <v-icon start size="14">{{ taxRuleScopeIcon(applied_tax_rule) }}</v-icon>
          {{ taxRuleScopeTitle(applied_tax_rule) }}
          <v-tooltip activator="parent">
            {{ taxRuleScopeTooltip(applied_tax_rule) }}
          </v-tooltip>
        </v-chip>

        <v-chip
          v-if="applied_tax_rule && applied_tax_rule.enable"
          :color="taxRuleBehaviorColor(applied_tax_rule)"
          label
          size="x-small"
          variant="flat"
        >
          {{ applied_tax_rule.included ? "Included" : "Excluded" }}
          <v-tooltip activator="parent">
            {{ taxRuleBehaviorTooltip(applied_tax_rule) }}
          </v-tooltip>
        </v-chip>
      </span>
    </v-list-item-subtitle>

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
          <u-widget-header
            :add-caption="$t('product_tax_profile.dialog.action_manage')"
            :add-sub-caption="
              $t('product_tax_profile.dialog.action_manage_sub')
            "
            :title="$t('product_tax_profile.dialog.title')"
            :to="{ name: 'BPageShopFinanceTax' }"
            add-text
            target="_blank"
            icon="gavel"
          >
          </u-widget-header>
          <v-list-subheader>
            {{ $t("product_tax_profile.dialog.subtitle") }}
          </v-list-subheader>

          <b-tax-profile-input
            v-model="tax_input"
            :shop="shop"
          ></b-tax-profile-input>

          <div
            class="tax-rule-preview mt-3"
            :class="taxRulePreviewClass(dialog_tax_rule)"
          >
            <div class="d-flex align-center min-width-0">
              <v-icon class="me-2" color="#111">
                {{ tax_input_profile?.icon || "gavel" }}
              </v-icon>

              <div class="flex-grow-1">
                <b class="d-block">
                  {{
                    tax_input_profile
                      ? tax_input_profile.name
                      : "Default shop tax applies"
                  }}
                </b>
                <small class="text-muted">
                  {{
                    tax_input_profile
                      ? "This product uses a dedicated tax profile."
                      : "This product inherits the default shop tax rule."
                  }}
                </small>
              </div>
            </div>

            <v-expand-transition>
              <div
                v-if="dialog_tax_rule"
                class="tax-rule-include-preview py-3"
              >
                <b-tax-profile-include-pod
                  :disabled="dialog_tax_disabled"
                  :included="dialog_tax_included"
                ></b-tax-profile-include-pod>
              </div>
            </v-expand-transition>

            <div class="tax-rule-detail-text mt-2">
              <div>
                <b>Rule source:</b>
                {{ taxRuleSourceText(dialog_tax_rule) }}
              </div>

              <div v-if="dialog_tax_rule && dialog_tax_rule.enable">
                <b>Price behavior:</b>
                {{ taxRuleBehaviorText(dialog_tax_rule) }}
              </div>

              <div v-if="dialog_tax_rule && !dialog_tax_rule.enable">
                <b>Status:</b>
                Tax calculation is disabled for this rule.
              </div>

              <div v-else-if="dialog_tax_rule">
                <b>Calculation:</b>
                {{ taxRuleCalculationText(dialog_tax_rule) }}
              </div>

              <div v-if="dialog_tax_rule && dialog_tax_rule.enable">
                <b>Shipping:</b>
                {{ taxRuleShippingText(dialog_tax_rule) }}
              </div>
            </div>
          </div>

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

<script lang="ts">
import { defineComponent } from "vue";
import BTaxProfileInput from "../../../tax/profile/input/BTaxProfileInput.vue";
import BTaxProfileIncludePod from "../../../tax/profile/include-pod/BTaxProfileIncludePod.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default defineComponent({
  name: "BProductProfileTax",
  components: { BTaxProfileInput, BTaxProfileIncludePod },

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
    tax_input_profile() {
      return (
        this.tax_input && this.tax_profiles.find((t) => t.id === this.tax_input)
      );
    },
    dialog_tax_rule() {
      return this.tax_input_profile || this.shop.tax;
    },
    dialog_tax_included() {
      return Boolean(this.dialog_tax_rule?.included);
    },
    dialog_tax_disabled() {
      return !this.dialog_tax_rule?.enable;
    },
    applied_tax_rule() {
      return this.current_tax_profile || this.shop.tax;
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
          if (this.isExternalTaxRule(tax)) {
            out += ` | Calculated by ${this.externalTaxProviderTitle(tax)}`;
          } else if (tax.fix) {
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
    externalTaxMeta(tax) {
      return tax?.meta?.external_tax || null;
    },
    isExternalTaxRule(tax) {
      const meta = this.externalTaxMeta(tax);
      return Boolean(meta?.enabled && meta?.provider);
    },
    externalTaxProviderTitle(tax) {
      const provider = this.externalTaxMeta(tax)?.provider;

      if (provider === "stripe_tax") return "Stripe";

      return "External";
    },
    externalTaxProviderColor(tax) {
      const provider = this.externalTaxMeta(tax)?.provider;

      if (provider === "stripe_tax") return "#635bff";

      return "#0b6e69";
    },
    taxRuleBehaviorColor(tax) {
      return tax?.included ? "#FFC107" : "#8BC34A";
    },
    taxRuleBehaviorTooltip(tax) {
      if (tax?.included) {
        return "Tax is included in the product price shown to the buyer.";
      }

      return "Tax is calculated and added on top of the product price at checkout.";
    },
    taxRuleScopeTitle(tax) {
      if (!this.product.tax_id) return "Default";

      return this.isExternalTaxRule(tax) ? "External" : "Internal";
    },
    taxRuleScopeTooltip(tax) {
      if (!this.product.tax_id) {
        return "This product inherits the default shop tax settings.";
      }

      if (this.isExternalTaxRule(tax)) {
        return "This product uses an external service to calculate tax at checkout.";
      }

      return "This product uses a dedicated internal Selldone tax profile.";
    },
    taxRuleScopeIcon(tax) {
      if (!this.product.tax_id) return "tune";

      return this.isExternalTaxRule(tax) ? "hub" : "account_tree";
    },
    taxRuleScopeColor(tax) {
      if (!this.product.tax_id) return "#0b6e69";

      return this.isExternalTaxRule(tax)
        ? this.externalTaxProviderColor(tax)
        : "#111";
    },
    taxRulePreviewClass(tax) {
      if (!this.tax_input_profile) return "tax-rule-preview-default";

      return this.isExternalTaxRule(tax)
        ? "tax-rule-preview-external"
        : "tax-rule-preview-internal";
    },
    taxRuleSourceText(tax) {
      if (!this.tax_input_profile) {
        return "This product inherits the default shop tax settings.";
      }

      if (this.isExternalTaxRule(tax)) {
        return `${this.externalTaxProviderTitle(tax)} calculates tax externally during checkout.`;
      }

      return "This product uses a dedicated internal Selldone tax profile.";
    },
    taxRuleBehaviorText(tax) {
      if (tax?.included) {
        return "Tax is already included in the product price shown to the buyer.";
      }

      return "Tax is calculated and added on top of the product price at checkout.";
    },
    taxRuleCalculationTitle(tax) {
      if (this.isExternalTaxRule(tax)) {
        return `Calculated by ${this.externalTaxProviderTitle(tax)}`;
      }

      if (tax?.fix) {
        return `Goods ${tax.fix_vat || 0}%`;
      }

      return "Location-based rate";
    },
    taxRuleCalculationText(tax) {
      if (this.isExternalTaxRule(tax)) {
        return `The final tax is calculated by ${this.externalTaxProviderTitle(tax)} using buyer location and product tax data.`;
      }

      if (tax?.fix) {
        return `Selldone applies a fixed goods tax rate of ${tax.fix_vat || 0}%.`;
      }

      return "Selldone calculates tax from the buyer location using the internal tax profile rules.";
    },
    taxRuleCalculationTooltip(tax) {
      if (this.isExternalTaxRule(tax)) {
        return "The external provider calculates the final tax using the buyer address and product tax code.";
      }

      if (tax?.fix) {
        return "Selldone applies this fixed goods tax rate.";
      }

      return "Selldone calculates tax from the buyer location using the internal tax profile rules.";
    },
    taxRuleShippingTitle(tax) {
      if (this.isExternalTaxRule(tax)) {
        return tax?.shipping ? "Shipping taxable" : "Shipping not taxable";
      }

      if (!tax?.shipping) return "Shipping not taxable";

      return tax.fix ? `Shipping ${tax.fix_shipping || 0}%` : "Shipping by location";
    },
    taxRuleShippingText(tax) {
      if (!tax?.shipping) {
        return "Shipping is not included in the taxable amount.";
      }

      if (this.isExternalTaxRule(tax)) {
        return "Shipping can be sent to the external provider as a taxable amount.";
      }

      if (tax.fix) {
        return `Shipping is taxed with a fixed rate of ${tax.fix_shipping || 0}%.`;
      }

      return "Shipping tax is calculated by buyer location.";
    },
    taxRuleShippingTooltip(tax) {
      if (tax?.shipping) {
        return "Shipping can be included in the taxable amount for this tax rule.";
      }

      return "Shipping is not included in the taxable amount for this tax rule.";
    },
  },
});
</script>

<style lang="scss" scoped>
.tax-rule-preview {
  border-radius: 16px;
  padding: 12px;
}

.tax-rule-preview-default {
  background: linear-gradient(135deg, rgba(117, 117, 117, 0.1), rgba(189, 189, 189, 0.08));
  border: 1px solid rgba(117, 117, 117, 0.16);
}

.tax-rule-preview-internal {
  background: linear-gradient(135deg, rgba(11, 110, 105, 0.12), rgba(76, 175, 80, 0.08));
  border: 1px solid rgba(11, 110, 105, 0.18);
}

.tax-rule-preview-external {
  background: linear-gradient(135deg, rgba(99, 91, 255, 0.11), rgba(0, 188, 212, 0.07));
  border: 1px solid rgba(99, 91, 255, 0.18);
}

.tax-rule-detail-text {
  color: rgba(0, 0, 0, 0.72);
  font-size: 0.78rem;
  line-height: 1.75;
}

.tax-rule-include-preview {
  border-radius: 14px;
  overflow: hidden;
}

.tax-profile-desc-text {
  min-width: 0;
}

.tax-profile-badges {
  flex-shrink: 0;
}
</style>

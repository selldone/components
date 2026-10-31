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
        : modern ? undefined : 'gavel'
    "
    :class="modern ? 'b-product-profile-tax--modern sd-modern-clickable-item text-start' : 'row-hover'"
    v-bind="$attrs"
    @click="showSetTax()"
    slim
  >
    <template v-if="modern && !(product.tax_id && current_tax_profile?.icon)" #prepend>
      <b-product-edit-info-icon class="me-3" name="ReceiptText" />
    </template>
    <v-list-item-title>
      <b
        >{{ isSubscription ? (modern ? t('subscription_title') : "Subscription tax") : $t("global.commons.tax") }}
        <span v-if="current_tax_profile && product.tax_id">
          <v-icon class="mx-1" color="#111">{{
            $t("icons.chevron_next")
          }}</v-icon>
          {{ current_tax_profile.name }}</span
        >
      </b>
    </v-list-item-title>

    <v-list-item-subtitle class="d-flex flex-wrap align-center ga-1 mt-1">
      <span v-if="modern" class="tax-profile-desc-text">{{ taxRowDescription }}</span>
      <span v-else class="tax-profile-desc-text" v-html="tax_profile_desc"></span>

      <span class="tax-profile-badges ms-auto d-flex align-center ga-1">
        <v-chip
          :color="modern ? undefined : taxRuleScopeColor(applied_tax_rule)"
          label
          size="x-small"
          :variant="modern ? 'text' : 'flat'"
        >
          <v-icon start size="14">{{ taxRuleScopeIcon(applied_tax_rule) }}</v-icon>
          {{ taxRuleScopeTitle(applied_tax_rule) }}
          <v-tooltip activator="parent" :location="modern ? 'top' : undefined" :content-class="modern ? 'sd-modern-tooltip text-start' : undefined" :open-on-focus="true">
            {{ taxRuleScopeTooltip(applied_tax_rule) }}
          </v-tooltip>
        </v-chip>

        <v-chip
          v-if="applied_tax_rule && applied_tax_rule.enable"
          :color="modern ? undefined : taxRuleBehaviorColor(applied_tax_rule)"
          label
          size="x-small"
          :variant="modern ? 'text' : 'flat'"
        >
          {{ modern ? t(applied_tax_rule.included ? 'tax_included' : 'tax_excluded') : applied_tax_rule.included ? "Included" : "Excluded" }}
          <v-tooltip activator="parent" :location="modern ? 'top' : undefined" :content-class="modern ? 'sd-modern-tooltip text-start' : undefined" :open-on-focus="true">
            {{ taxRuleBehaviorTooltip(applied_tax_rule) }}
          </v-tooltip>
        </v-chip>
      </span>
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end :class="{ 'b-product-profile-tax__row-actions': modern }">
        <v-btn
          v-if="modern"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          @click.stop="showSetTax()"
        >{{ $t(product.tax_id ? 'global.actions.change' : 'add_product.edit_info.modern.assign') }}</v-btn>
        <v-btn
          v-else
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
    :fullscreen="!modern || $vuetify.display.xs"
    :max-width="modern ? 820 : undefined"
    :aria-label="modern ? t('title') : undefined"
    scrollable
    :transition="modern ? 'dialog-transition' : 'dialog-bottom-transition'"
    @keydown.esc.capture="dismissTaxHelp"
  >
    <v-card v-if="modern" class="sd-modern-widget b-product-profile-tax__dialog text-start">
      <header class="b-product-profile-tax__header">
        <div class="b-product-profile-tax__heading">
          <b-product-edit-info-icon name="ReceiptText" :size="22" />
          <div><h1>{{ t('title') }}</h1><p>{{ t('subtitle') }}</p></div>
        </div>
        <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="closeTaxDialog">
          <b-product-edit-info-icon name="X" :size="16" />
          <v-tooltip :model-value="tax_help === 'close'" @update:model-value="setTaxHelp('close', $event)" activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </header>
      <v-card-text class="b-product-profile-tax__workspace sd-modern-canvas">
        <section class="sd-modern-widget b-product-profile-tax__widget">
          <div class="b-product-profile-tax__section-heading">
            <h2>{{ t('profile_title') }}</h2>
            <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :to="{ name: 'BPageShopFinanceTax', params: { shop_id: shop.id } }" target="_blank" rel="noopener noreferrer">
              {{ t('manage') }}<template #append><v-icon size="16">north_east</v-icon></template>
            </v-btn>
          </div>
          <p class="b-product-profile-tax__description">{{ t('selection_help') }}</p>
          <b-tax-profile-input v-model="tax_input" :shop="shop" modern class="b-product-profile-tax__input sd-modern-underlined-field" />
          <div class="b-product-profile-tax__selection-meta">
            <span class="sd-modern-status sd-modern-status--plain">
              <span class="sd-modern-status__dot" :class="{ 'b-product-profile-tax__override': tax_input != null }" />
              {{ t(tax_input != null ? 'product_override' : 'store_default') }}
            </span>
            <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="t('default_help')" @click="setTaxHelp('default', true)">
              <b-product-edit-info-icon name="Info" :size="15" />
              <v-tooltip :model-value="tax_help === 'default'" @update:model-value="setTaxHelp('default', $event)" activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ t('default_help') }}</v-tooltip>
            </v-btn>
          </div>
          <v-btn class="sd-modern-button sd-modern-button--inline b-product-profile-tax__default" color="primary" variant="text" :disabled="tax_input == null" @click="tax_input = null">
            <template #prepend><b-product-edit-info-icon name="RotateCcw" :size="16" /></template>{{ t('use_default') }}
          </v-btn>
          <p v-if="missingTaxProfile" class="sd-modern-notice b-product-profile-tax__unavailable" role="status"><b-product-edit-info-icon class="sd-modern-notice__icon" name="Info" :size="16" /><span class="sd-modern-notice__content">{{ t('profile_unavailable') }}</span></p>
        </section>
        <section class="sd-modern-widget b-product-profile-tax__widget" aria-live="polite">
          <div class="b-product-profile-tax__section-heading">
            <div class="b-product-profile-tax__subheading"><b-product-edit-info-icon name="Calculator" /><h2>{{ t('application_title') }}</h2></div>
            <span class="sd-modern-status sd-modern-status--plain b-product-profile-tax__method">
              <span v-if="taxMode === 'disabled'" class="sd-modern-status__dot sd-modern-status__dot--error" />{{ taxMethod }}
            </span>
          </div>
          <p class="b-product-profile-tax__description">{{ taxSummary }}</p>
          <dl class="b-product-profile-tax__facts">
            <div><dt>{{ t('goods') }}</dt><dd :class="{ 'b-product-profile-tax__text-value': !fixedTaxRate }"><bdi>{{ goodsTaxValue }}</bdi></dd></div>
            <div><dt>{{ t('shipping') }}</dt><dd :class="{ 'b-product-profile-tax__text-value': !fixedTaxRate || !dialog_tax_rule?.shipping }"><bdi>{{ shippingTaxValue }}</bdi></dd></div>
            <div><dt>{{ t('price_display') }}</dt><dd class="b-product-profile-tax__text-value">{{ taxPriceLabel }}</dd></div>
          </dl>
          <div v-if="dialog_tax_rule" class="b-product-profile-tax__flow" :class="{ 'b-product-profile-tax__flow--rtl': $vuetify.locale.isRtl }" role="group" :aria-label="t('flow_label')">
            <template v-for="(step, index) in taxFlowSteps" :key="step.key">
              <span v-if="index" class="b-product-profile-tax__connector" aria-hidden="true"><b-product-edit-info-icon name="ChevronRight" :size="16" /></span>
              <button type="button" class="b-product-profile-tax__node" :class="{ 'b-product-profile-tax__node--operation': step.operation && !dialog_tax_disabled }" @click="setTaxHelp(step.key, true)">
                <b-product-edit-info-icon :name="step.icon" :size="18" /><span>{{ step.title }}</span><small>{{ step.detail }}</small>
                <v-tooltip :model-value="tax_help === step.key" @update:model-value="setTaxHelp(step.key, $event)" activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ step.help }}</v-tooltip>
              </button>
            </template>
          </div>
          <details v-if="dialog_tax_rule" class="b-product-profile-tax__details">
            <summary><span>{{ t('details') }}</span><b-product-edit-info-icon name="ChevronDown" :size="16" /></summary>
            <dl class="b-product-profile-tax__rules">
              <div><dt>{{ t('rule_source') }}</dt><dd>{{ t(tax_input == null ? 'default_source' : 'dedicated_source') }}</dd></div>
              <div><dt>{{ t('calculation') }}</dt><dd>{{ taxCalculationDescription }}</dd></div>
              <div><dt>{{ t('price_behavior') }}</dt><dd>{{ t(taxMode === 'disabled' ? 'disabled_rule' : dialog_tax_included ? 'included_rule' : 'added_rule') }}</dd></div>
              <div><dt>{{ t('shipping') }}</dt><dd>{{ taxShippingDescription }}</dd></div>
            </dl>
          </details>
        </section>
        <div v-if="isSubscription" class="sd-modern-notice b-product-profile-tax__subscription"><b-product-edit-info-icon class="sd-modern-notice__icon" name="Info" :size="16" /><div class="sd-modern-notice__content" v-html="$t('product_tax_profile.dialog.subscription_tips')" /></div>
      </v-card-text>
      <footer class="b-product-profile-tax__footer">
        <p><b-product-edit-info-icon name="Info" :size="15" /><span>{{ t('save_scope') }}</span></p>
        <div class="b-product-profile-tax__actions">
          <v-btn class="sd-modern-button" variant="outlined" @click="closeTaxDialog">{{ $t('global.actions.cancel') }}</v-btn>
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :disabled="missingTaxProfile" @click="selectTax(tax_input)"><template #prepend><b-product-edit-info-icon name="Check" :size="16" /></template>{{ t('confirm') }}</v-btn>
        </div>
      </footer>
    </v-card>
    <v-card v-else>
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
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default defineComponent({
  name: "BProductProfileTax",
  components: { BProductEditInfoIcon, BTaxProfileInput, BTaxProfileIncludePod },

  props: {
    modern: { type: Boolean, default: false },
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
      tax_dialog: false,
      tax_input: null,
      tax_help: null,
    };
  },

  computed: {
    tax_profiles() {
      return this.shop.tax_profiles || [];
    },
    current_tax_profile() {
      return this.tax_profiles.find((tax) => String(tax.id) === String(this.product.tax_id)) || null;
    },
    tax_input_profile() {
      return this.tax_profiles.find((tax) => String(tax.id) === String(this.tax_input)) || null;
    },
    missingTaxProfile() {
      return this.tax_input != null && !this.tax_input_profile;
    },
    dialog_tax_rule() {
      if (this.modern && this.missingTaxProfile) return null;
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
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },
    taxMode() {
      if (!this.dialog_tax_rule) return 'unavailable';
      if (!this.dialog_tax_rule.enable) return 'disabled';
      return this.isExternalTaxRule(this.dialog_tax_rule) ? 'external' : 'internal';
    },
    fixedTaxRate() {
      return this.taxMode === 'internal' && this.dialog_tax_rule.fix;
    },
    taxMethod() {
      return this.taxMode === 'external'
        ? this.t('external_method', { provider: this.taxProviderName(this.dialog_tax_rule) })
        : this.t(this.taxMode === 'internal' ? 'internal_method' : this.taxMode);
    },
    taxSummary() {
      const key = this.taxMode === 'unavailable' ? 'unavailable_summary'
        : this.taxMode === 'disabled' ? 'disabled_summary'
        : this.taxMode === 'external' ? 'external_summary'
        : !this.dialog_tax_rule.fix ? 'location_summary'
        : this.dialog_tax_included ? 'included_summary' : 'added_summary';
      return this.t(key, { provider: this.taxProviderName(this.dialog_tax_rule) });
    },
    goodsTaxValue() {
      if (this.taxMode === 'unavailable') return this.t('unavailable');
      if (this.taxMode === 'disabled') return this.t('not_applied');
      if (this.taxMode === 'external') return this.t('at_checkout');
      return this.fixedTaxRate ? this.taxPercent(this.dialog_tax_rule.fix_vat) : this.t('by_location');
    },
    shippingTaxValue() {
      if (this.taxMode === 'unavailable') return this.t('unavailable');
      if (this.dialog_tax_disabled || !this.dialog_tax_rule.shipping) return this.t('not_applied');
      if (this.taxMode === 'external') return this.t('at_checkout');
      return this.fixedTaxRate ? this.taxPercent(this.dialog_tax_rule.fix_shipping) : this.t('by_location');
    },
    taxPriceLabel() {
      return this.t(this.taxMode === 'unavailable' ? 'unavailable' : this.taxMode === 'disabled' ? 'no_tax' : this.dialog_tax_included ? 'tax_included' : 'tax_excluded');
    },
    taxCalculationDescription() {
      return this.t(this.taxMode === 'disabled' ? 'disabled_rule' : this.taxMode === 'external' ? 'external_rule' : this.fixedTaxRate ? 'fixed_rule' : 'location_rule', {
        rate: this.taxPercent(this.dialog_tax_rule?.fix_vat), provider: this.taxProviderName(this.dialog_tax_rule),
      });
    },
    taxShippingDescription() {
      return this.t(this.dialog_tax_disabled || !this.dialog_tax_rule?.shipping ? 'shipping_off' : this.taxMode === 'external' ? 'shipping_external' : this.fixedTaxRate ? 'shipping_fixed' : 'shipping_location', {
        rate: this.taxPercent(this.dialog_tax_rule?.fix_shipping), provider: this.taxProviderName(this.dialog_tax_rule),
      });
    },
    taxFlowSteps() {
      const disabled = this.dialog_tax_disabled;
      return [
        { key: 'price', icon: 'Tag', title: this.t('product_price'), detail: this.t(disabled ? 'no_tax' : this.dialog_tax_included ? 'tax_included' : 'before_tax'), help: this.t('price_help') },
        { key: 'calculation', operation: true, icon: disabled ? 'CircleSlash' : this.taxMode === 'external' ? 'Globe' : this.fixedTaxRate ? 'Calculator' : 'MapPin',
          title: disabled ? this.t('disabled') : this.taxMode === 'external' ? this.taxProviderName(this.dialog_tax_rule) : this.t('selldone'),
          detail: this.t(disabled ? 'no_tax' : this.taxMode === 'internal' && !this.fixedTaxRate ? 'buyer_location' : 'calculate_tax'),
          help: this.t(disabled ? 'disabled_help' : this.taxMode === 'external' ? 'external_help' : 'internal_help', { provider: this.taxProviderName(this.dialog_tax_rule) }) },
        { key: 'checkout', icon: 'ShoppingCart', title: this.t('checkout'), detail: this.t(disabled ? 'none_added' : this.dialog_tax_included ? 'already_included' : 'tax_added'),
          help: this.t(disabled ? 'checkout_disabled_help' : this.dialog_tax_included ? 'checkout_included_help' : 'checkout_added_help') },
      ];
    },
    taxRowDescription() {
      const tax = this.applied_tax_rule;
      const parts = [this.$t(`product_tax_profile.description.${this.current_tax_profile ? 'dedicated' : 'default'}`)];
      if (!tax || !tax.enable) return parts.concat(this.t(tax ? 'disabled' : 'unavailable')).join(' · ');
      if (this.isExternalTaxRule(tax)) parts.push(this.taxProviderName(tax), this.t('at_checkout'));
      else if (tax.fix) {
        parts.push(`${this.t('goods')}: ${this.taxPercent(tax.fix_vat)}`);
        if (tax.shipping) parts.push(`${this.t('shipping')}: ${this.taxPercent(tax.fix_shipping)}`);
      } else parts.push(this.t('by_location'));
      parts.push(this.t(tax.included ? 'tax_included' : 'tax_excluded'));
      return parts.join(' · ');
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

  watch: {
    tax_dialog(open) { if (!open) this.tax_help = null; },
    product() { this.closeTaxDialog(); },
    'product.id'() { this.closeTaxDialog(); },
    shop() { this.closeTaxDialog(); },
    'shop.id'() { this.closeTaxDialog(); },
  },

  methods: {
    setTaxHelp(key, open) {
      if (open) this.tax_help = key;
      else if (this.tax_help === key) this.tax_help = null;
    },
    dismissTaxHelp(event) {
      if (!this.tax_help) return;
      // Tooltips do not join Vuetify's overlay stack; Escape must dismiss help first.
      event.preventDefault();
      event.stopPropagation();
      this.tax_help = null;
    },
    t(key, values = {}) { return this.$t(`product_tax_profile.refined.${key}`, values); },
    taxPercent(value) {
      const locale = this.$i18n.locale;
      const rate = new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(Number(value || 0));
      const sign = new Intl.NumberFormat(locale, { style: 'percent' }).formatToParts(0).find(part => part.type === 'percentSign').value;
      return `${rate}${sign}`;
    },
    taxProviderName(tax) {
      return this.t(this.externalTaxMeta(tax)?.provider === 'stripe_tax' ? 'provider_stripe' : 'external');
    },
    // ████████████████████ Set Tax ████████████████████
    showSetTax() {
      this.tax_help = null;
      this.tax_input = this.product.tax_id ?? null;
      this.tax_dialog = true;
    },
    closeTaxDialog() {
      this.tax_help = null;
      this.tax_dialog = false;
      this.tax_input = this.product.tax_id ?? null;
    },
    selectTax(tax_id) {
      if (this.modern && tax_id != null && !this.tax_profiles.some(tax => String(tax.id) === String(tax_id))) return;
      this.product.tax_id = tax_id ?? null;
      this.tax_dialog = false;
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
      if (this.modern) return this.t(tax?.included ? 'checkout_included_help' : 'checkout_added_help');
      if (tax?.included) {
        return "Tax is included in the product price shown to the buyer.";
      }

      return "Tax is calculated and added on top of the product price at checkout.";
    },
    taxRuleScopeTitle(tax) {
      if (this.modern) return this.t(!this.product.tax_id ? 'store_default' : this.isExternalTaxRule(tax) ? 'external' : 'internal');
      if (!this.product.tax_id) return "Default";

      return this.isExternalTaxRule(tax) ? "External" : "Internal";
    },
    taxRuleScopeTooltip(tax) {
      if (this.modern) return this.t(!this.product.tax_id ? 'default_help' : !tax?.enable ? 'disabled_help' : this.isExternalTaxRule(tax) ? 'external_help' : 'internal_help', { provider: this.taxProviderName(tax) });
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
.b-product-profile-tax__dialog.v-card {
  --sd-modern-icon-button-size: 32px;
  padding: 0;
  border-radius: 18px;
  color: rgb(var(--v-theme-on-surface));

  .b-product-profile-tax__header {
    display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
    padding: 24px 24px 22px; flex: 0 0 auto;
  }
  .b-product-profile-tax__heading {
    display: flex; align-items: flex-start; gap: 11px; min-width: 0;
    > .b-product-edit-info-icon { margin-block-start: 3px; color: var(--sd-modern-muted); flex-shrink: 0; }
    h1 { margin: 0; font-family: inherit; font-size: 20px; font-weight: 500; line-height: 28px; letter-spacing: -.2px; }
    p { margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  }
  .b-product-profile-tax__workspace { display: flex; flex-direction: column; gap: 16px; padding: 20px; min-width: 0; }
  .b-product-profile-tax__widget { flex-shrink: 0; min-width: 0; padding: 21px; border-radius: 14px; }
  .b-product-profile-tax__section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; min-width: 0; }
  h2 { margin: 0; font-family: inherit; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: 0; }
  .b-product-profile-tax__subheading { display: flex; align-items: center; gap: 8px; > .b-product-edit-info-icon { color: var(--sd-modern-muted); } }
  .b-product-profile-tax__description { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  .b-product-profile-tax__input { margin-block-start: 20px; }
  .b-product-profile-tax__selection-meta { display: flex; align-items: center; gap: 7px; margin-block-start: 8px; font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  .b-product-profile-tax__selection-meta .sd-modern-status { font-size: inherit; line-height: inherit; }
  .b-product-profile-tax__override { background: rgb(var(--v-theme-primary)); }
  .b-product-profile-tax__default { margin-block-start: 3px; margin-inline-start: -10px; }
  .b-product-profile-tax__unavailable { margin-block-start: 12px; font-size: 13px; line-height: 21px; }
  .b-product-profile-tax__method { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  .b-product-profile-tax__facts {
    display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 18px; margin: 23px 0 0;
    > div { min-width: 0; }
    dt { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
    dd { margin: 5px 0 0; font-size: 22px; line-height: 28px; font-weight: 500; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
    dd.b-product-profile-tax__text-value { font-size: 14px; line-height: 22px; margin-block-start: 9px; font-weight: 500; font-variant-numeric: normal; }
  }
  .b-product-profile-tax__flow { display: grid; grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr) 24px minmax(0, 1fr); align-items: center; margin-block: 24px 16px; min-width: 0; }
  .b-product-profile-tax__node {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
    min-width: 0; min-height: 104px; padding: 12px 8px; border: 1px solid var(--sd-modern-border); border-radius: 10px;
    background: rgb(var(--v-theme-surface)); color: inherit; font-family: inherit; font-size: 13px; font-weight: 400; line-height: 20px; text-align: center;
    > .b-product-edit-info-icon { color: var(--sd-modern-muted); margin-block-end: 3px; flex-shrink: 0; }
    small { font-size: 12px; line-height: 18px; font-weight: 400; color: var(--sd-modern-muted); }
    &:hover { background: color-mix(in srgb, rgb(var(--v-theme-surface)) 97%, rgb(var(--v-theme-on-surface))); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }
  .b-product-profile-tax__node--operation { border: 2px solid rgb(var(--v-theme-primary)); }
  .b-product-profile-tax__connector { display: flex; align-items: center; justify-content: center; color: var(--sd-modern-muted); }
  @media (min-width: 601px) { .b-product-profile-tax__flow--rtl .b-product-profile-tax__connector :deep(.b-product-edit-info-icon) { transform: rotate(180deg); } }
  .b-product-profile-tax__details {
    margin-block-start: 4px;
    summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 36px; padding-block: 5px; font-size: 13px; line-height: 21px; color: var(--sd-modern-muted); cursor: pointer; }
    summary::-webkit-details-marker { display: none; }
    &[open] summary > .b-product-edit-info-icon { transform: rotate(180deg); }
  }
  .b-product-profile-tax__rules {
    margin: 0; padding-block-start: 8px;
    > div { display: grid; grid-template-columns: 116px minmax(0, 1fr); gap: 16px; padding-block: 12px; border-block-start: 1px solid var(--sd-modern-border); font-size: 13px; line-height: 21px; }
    dt { color: var(--sd-modern-muted); }
    dd { margin: 0; overflow-wrap: anywhere; }
  }
  .b-product-profile-tax__subscription { flex-shrink: 0; font-size: 13px; line-height: 21px; }
  .b-product-profile-tax__footer { flex: 0 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 20px 24px 22px; }
  .b-product-profile-tax__footer > p { display: flex; align-items: flex-start; gap: 7px; max-width: 345px; margin: 0; min-width: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; > .b-product-edit-info-icon { margin-block-start: 3px; flex-shrink: 0; } }
  .b-product-profile-tax__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .b-product-profile-tax__actions > .sd-modern-button { font-size: 13px; font-weight: 500; line-height: 20px; }

  @media (max-width: 600px) {
    border-radius: 18px 18px 0 0;
    .b-product-profile-tax__header { padding: 22px 18px 20px; gap: 10px; }
    .b-product-profile-tax__heading { gap: 9px; h1 { font-size: 18px; line-height: 27px; } }
    .b-product-profile-tax__workspace { padding: 14px; gap: 14px; }
    .b-product-profile-tax__widget { padding: 18px; }
    .b-product-profile-tax__section-heading { gap: 8px; }
    .b-product-profile-tax__facts { grid-template-columns: 1fr 1fr; gap: 20px 18px; > div:last-child { grid-column: 1 / -1; } dd.b-product-profile-tax__text-value { margin-block-start: 4px; } }
    .b-product-profile-tax__flow { grid-template-columns: minmax(0, 1fr); gap: 4px; }
    .b-product-profile-tax__node { min-height: 58px; display: grid; grid-template-columns: 20px minmax(0, 1fr); column-gap: 10px; text-align: start; justify-content: start; padding: 10px 12px; > .b-product-edit-info-icon { grid-row: 1 / 3; margin: 0; } > span, > small { grid-column: 2; } }
    .b-product-profile-tax__connector :deep(.b-product-edit-info-icon) { transform: rotate(90deg); }
    .b-product-profile-tax__rules > div { grid-template-columns: 1fr; gap: 3px; }
    .b-product-profile-tax__footer { flex-direction: column; align-items: stretch; gap: 16px; padding: 18px; > p { max-width: none; } }
    .b-product-profile-tax__actions { justify-content: flex-end; flex-wrap: wrap; > .sd-modern-button--primary { flex: 1; } }
    .b-product-profile-tax__details summary { min-height: 44px; }
  }
  @media (pointer: coarse) { .b-product-profile-tax__details summary { min-height: 44px; } }
}

.b-product-profile-tax--modern {
  min-height: 62px;
  padding: 10px 12px;
  border-radius: 9px;
  :deep(.v-list-item-title), :deep(.v-list-item-title b) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; white-space: normal; }
  :deep(.v-list-item-title .v-icon) { font-size: 14px; color: var(--sd-modern-muted) !important; }
  :deep(.v-list-item-subtitle) { margin-top: 2px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; opacity: 1; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item__append) { padding-inline-start: 12px; }
  .b-product-profile-tax__row-actions { margin-inline-end: 0; }
  .b-product-edit-info-icon { color: var(--sd-modern-muted); }
}

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

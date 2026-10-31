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
  <v-card flat :class="{ 'sd-modern-canvas b-vendor-pricing-add text-start': modern }">
    <template v-if="modern">
      <v-card-title class="b-vendor-pricing-add__header">
        <div class="b-vendor-pricing-add__heading">
          <v-icon size="22" aria-hidden="true">price_change</v-icon>
          <div>
            <h2>{{ $t(pricing ? 'marketplace_pricings.modern.editTitle' : 'marketplace_pricings.modern.addTitle') }}</h2>
            <p>{{ $t(pricing ? 'marketplace_pricings.modern.editSubtitle' : 'marketplace_pricings.modern.addSubtitle') }}</p>
          </div>
        </div>
        <v-btn type="button" icon variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" :disabled="busy || busy_delete" @click="requestClose">
          <v-icon size="16" aria-hidden="true">close</v-icon>
          <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </v-card-title>
      <v-card-text class="b-vendor-pricing-add__body">
        <div class="sd-modern-content b-vendor-pricing-add__content">
        <div class="b-vendor-pricing-add__intro">
          <h3>{{ $t('marketplace_pricings.modern.sharedTitle') }}</h3>
          <p>{{ $t('marketplace_pricings.modern.sharedHelp') }}</p>
          <p>{{ $t('marketplace_pricings.modern.assignmentHelp') }}</p>
        </div>
        <form :id="formId" class="b-vendor-pricing-add__form" @submit.prevent="pricing ? editricing() : addPricing()">
          <section class="sd-modern-widget b-vendor-pricing-add__widget">
            <header class="b-vendor-pricing-add__widget-heading">
              <h3><v-icon size="17" aria-hidden="true">notes</v-icon>{{ $t('marketplace_pricings.modern.detailsTitle') }}</h3>
              <p>{{ $t('marketplace_pricings.modern.detailsHelp') }}</p>
            </header>
            <v-text-field
              v-model="title"
              :label="$t('global.commons.title')"
              :placeholder="$t('marketplace_pricings.modern.titlePlaceholder')"
              :disabled="busy || busy_delete"
              :error-messages="title !== null && !validTitle ? $t('marketplace_pricings.modern.invalidTitle') : undefined"
              maxlength="255"
              required
              persistent-placeholder
              variant="underlined"
              class="sd-modern-underlined-field b-vendor-pricing-add__field"
              messages=" "
            >
              <template #append-inner>
                <b-translation-button-vendor-pricing v-if="pricing?.id" :label="$t('global.commons.title')" :pricing="pricing" :shop="shop" translation-key="title" :inert="busy || busy_delete" />
              </template>
              <template #message="{ message }">
                <div><span v-if="message && message !== ' '">{{ message }}</span><u-smart-suggestion :samples="$tm('suggestions.vendor_pricing.title')" :inert="busy || busy_delete" @select="value => title = value" /></div>
              </template>
            </v-text-field>
            <v-textarea
              v-model="description"
              :label="`${$t('global.commons.description')} · ${$t('marketplace_pricings.modern.optional')}`"
              :placeholder="$t('marketplace_pricings.modern.descriptionPlaceholder')"
              :disabled="busy || busy_delete"
              persistent-placeholder
              auto-grow
              rows="2"
              variant="underlined"
              class="sd-modern-underlined-field b-vendor-pricing-add__description"
              dir="auto"
            >
              <template #append-inner>
                <b-translation-button-vendor-pricing v-if="pricing?.id" :label="$t('global.commons.description')" :pricing="pricing" :shop="shop" translation-key="description" :inert="busy || busy_delete" />
              </template>
            </v-textarea>
          </section>

          <section class="sd-modern-widget b-vendor-pricing-add__widget">
            <header class="b-vendor-pricing-add__widget-heading">
              <h3><v-icon size="17" aria-hidden="true">percent</v-icon>{{ $t('marketplace_pricings.modern.ruleTitle') }}</h3>
              <p>{{ $t('marketplace_pricings.modern.ruleHelp') }}</p>
            </header>
            <u-number-input
              v-model="commission"
              :label="$t('marketplace_pricings.modern.commissionLabel')"
              :min="0"
              :max="1000"
              :disabled="busy || busy_delete"
              :messages="$t('marketplace_pricings.modern.commissionHelp')"
              :error-messages="!validCommission ? $t('marketplace_pricings.modern.invalidPercent') : undefined"
              suffix="%"
              required
              variant="underlined"
              class="sd-modern-underlined-field"
            />
            <div class="b-vendor-pricing-add__example" aria-live="polite">
              <span>{{ $t('marketplace_pricings.modern.example') }}</span>
              <div class="b-vendor-pricing-add__example-values" dir="ltr">
                <span><small dir="auto">{{ $t('marketplace_pricings.modern.raw') }}</small><bdi>100</bdi></span>
                <v-icon size="18" aria-hidden="true">arrow_forward</v-icon>
                <span><small dir="auto">{{ $t('marketplace_pricings.modern.sale') }}</small><strong><bdi>{{ examplePrice ?? '—' }}</bdi></strong></span>
              </div>
            </div>
          </section>
        </form>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Separate critical action ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <details v-if="pricing" :open="critical_open" class="sd-modern-widget sd-modern-critical b-vendor-pricing-add__critical" @toggle="onCriticalToggle">
          <summary><v-icon size="17" aria-hidden="true">warning_amber</v-icon><span>{{ $t('marketplace_pricings.modern.remove') }}</span><v-icon size="17" class="b-vendor-pricing-add__chevron" aria-hidden="true">expand_more</v-icon></summary>
          <p>{{ $t('marketplace_pricings.modern.removeHelp') }}</p>
          <u-smart-verify
            v-model="accept_delete"
            color="error"
            :true-title="$t('marketplace_pricings.modern.verify')"
            :disabled="busy || busy_delete"
            role="checkbox"
            :tabindex="busy || busy_delete ? -1 : 0"
            :aria-checked="accept_delete"
            :aria-disabled="busy || busy_delete"
            :aria-label="$t('marketplace_pricings.modern.verify')"
            @keydown.enter.prevent="toggleDeleteIntent"
            @keydown.space.prevent="toggleDeleteIntent"
          />
          <v-btn type="button" class="sd-modern-button sd-modern-button--danger" color="error" variant="elevated" :disabled="!canRemoveModern" :loading="busy_delete" @click="remove"><v-icon start aria-hidden="true">delete</v-icon>{{ $t('marketplace_pricings.modern.removeAction') }}</v-btn>
        </details>
        </div>
      </v-card-text>
      <v-card-actions class="b-vendor-pricing-add__actions">
        <v-btn type="button" class="sd-modern-button" variant="text" :disabled="busy || busy_delete" @click="requestClose"><v-icon start aria-hidden="true">close</v-icon>{{ $t('global.actions.close') }}</v-btn>
        <v-btn type="submit" :form="formId" class="sd-modern-button" color="primary" variant="elevated" :disabled="!canSubmitModern" :loading="busy"><v-icon start aria-hidden="true">{{ pricing ? 'save' : 'add' }}</v-icon>{{ $t(pricing ? 'marketplace_pricings.modern.save' : 'marketplace_pricings.modern.create') }}</v-btn>
      </v-card-actions>
    </template>
    <template v-else>
    <v-card-title></v-card-title>
    <v-card-text>
      <div class="widget-box mb-5">
        <u-widget-header
          icon="price_change"
          :title="$t('vendor_pricing_add.title')"
        >
        </u-widget-header>

        <v-list-subheader>
          {{ $t("vendor_pricing_add.subtitle") }}
        </v-list-subheader>

        <v-text-field
          v-model="title"
          :label="$t('global.commons.title')"
          persistent-placeholder
          :placeholder="$t('vendor_pricing_add.inputs.title.placeholder')"
          variant="underlined"
          messages=" "
        >
          <template v-slot:append-inner>
            <b-translation-button-vendor-pricing
              v-if="pricing?.id"
              :label="$t('global.commons.title')"
              :pricing="pricing"
              :shop="shop"
              translation-key="title"
            ></b-translation-button-vendor-pricing>
          </template>
          <template v-slot:message>
            <u-smart-suggestion
              :samples="$tm('suggestions.vendor_pricing.title')"
              @select="(v) => (title = v)"
            ></u-smart-suggestion>
          </template>
        </v-text-field>

        <u-number-input
          v-model="commission"
          :label="$t('global.commons.percent_commission')"
          :max="1000"
          :min="0"
          class="strong-field"
          suffix="%"
          variant="underlined"
        ></u-number-input>

        <v-textarea
          v-model="description"
          :label="$t('global.commons.description')"
          append-inner-icon="sticky_note_2"
          auto-grow
          persistent-placeholder
          :placeholder="$t('vendor_pricing_add.inputs.description.placeholder')"
          rows="2"
          variant="underlined"
        >
          <template v-slot:append-inner>
            <b-translation-button-vendor-pricing
              v-if="pricing?.id"
              :label="$t('global.commons.description')"
              :pricing="pricing"
              :shop="shop"
              translation-key="description"
            ></b-translation-button-vendor-pricing>
          </template>
        </v-textarea>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Delete  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div v-if="pricing" class="widget-box mb-5">
        <u-widget-header
          :title="$t('global.commons.critical_zone')"
          icon="warning_amber"
        >
        </u-widget-header>
        <v-list-subheader>
          {{ $t("vendor_pricing_add.delete.subtitle") }}
        </v-list-subheader>

        <u-smart-verify
          v-model="accept_delete"
          color="red"
          :true-description="
            $t('vendor_pricing_add.inputs.accept_delete.true_description')
          "
          :true-title="$t('vendor_pricing_add.inputs.accept_delete.true_title')"
        ></u-smart-verify>

        <div class="widget-buttons">
          <v-btn
            :class="{ disabled: !accept_delete }"
            :loading="busy_delete"
            color="red"
            size="x-large"
            @click="remove"
          >
            <v-icon class="me-1">remove</v-icon>
            {{ $t("vendor_pricing_add.delete.remove_pricing_action") }}
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="pricing"
          :disabled="!title"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="editricing"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>

        <v-btn
          v-else
          :disabled="!title"
          :loading="busy"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addPricing"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </v-card-actions>
    </template>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { useId } from "vue";

import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BTranslationButtonVendorPricing from "../../../translation/button/vendor-pricing/BTranslationButtonVendorPricing.vue";
import USmartSuggestion from "@selldone/components-vue/ui/smart/suggestion/USmartSuggestion.vue";


export default {
  name: "BVendorPricingAdd",
  setup: () => ({ formId: `vendor-pricing-form-${useId()}` }),
  mixins: [],
  components: {
    USmartSuggestion,
    BTranslationButtonVendorPricing,
    USmartVerify,
    UNumberInput,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
    },

    pricing: {},
  },
  data: () => ({
    busy: false,
    busy_delete: false,
    pendingRequest: null,
    context: null,

    title: null,
    description: null,
    commission: 0,

    accept_delete: false,
    critical_open: false,
  }),
  computed: {
    validTitle() {
      return typeof this.title === 'string' && this.title.trim().length > 0 && this.title.trim().length <= 255;
    },
    validCommission() {
      const value = this.commission;
      return (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1000;
    },
    hasCurrentContext() {
      return !!this.context && this.context.pricing === (this.pricing ?? null) && this.context.pricingId === this.pricing?.id && this.context.shopId === this.shop.id;
    },
    validPricing() {
      return !!this.pricing?.id && (this.pricing.shop_id == null || this.pricing.shop_id == this.shop.id);
    },
    canSubmitModern() {
      return this.hasCurrentContext && (!this.pricing || this.validPricing) && this.validTitle && this.validCommission && !this.busy && !this.busy_delete;
    },
    canRemoveModern() {
      return this.hasCurrentContext && this.validPricing && this.critical_open && this.accept_delete && !this.busy && !this.busy_delete;
    },
    examplePrice() {
      return this.validCommission ? 100 + Number(this.commission) : null;
    },
  },

  watch: {
    pricing() {
      this.assign();
    },
    'shop.id'() {
      if (this.modern) this.assign();
    },
  },

  created() {
    this.assign();
  },

  beforeUnmount() {
    this.pendingRequest = null;
    this.context = null;
    this.resetRemoval();
  },

  methods: {
    resetRemoval() {
      this.critical_open = false;
      this.accept_delete = false;
    },
    onCriticalToggle(event) {
      this.critical_open = event.target.open;
      if (!this.critical_open) this.accept_delete = false;
    },
    toggleDeleteIntent() {
      if (this.critical_open && !this.busy && !this.busy_delete) this.accept_delete = !this.accept_delete;
    },
    requestClose() {
      if (this.modern && (this.busy || this.busy_delete)) return;
      this.resetRemoval();
      this.pendingRequest = null;
      this.$emit('close');
    },
    isCurrentRequest(request, context) {
      return this.modern && this.pendingRequest === request && this.context === context && this.hasCurrentContext;
    },
    //――――――――――――――――――――――― Edit Vendor ―――――――――――――――――――――――

    assign() {
      this.resetToDefault(); // 🞇 Reset to default
      // Keep the snapshot shallow so Vue preserves the originating pricing reference.
      this.context = Object.freeze({ pricing: this.pricing ?? null, pricingId: this.pricing?.id, shopId: this.shop.id });

      if (this.pricing) {
        this.title = this.pricing.title;
        this.description = this.pricing.description;
        this.commission = this.pricing.commission;
        this.accept_delete = false;
      }
    },

    addPricing() {
      if (this.modern && (!this.canSubmitModern || this.pricing)) return;
      const modern = this.modern, context = this.context, request = Symbol();
      if (modern) this.pendingRequest = request;
      this.busy = true;

      return axios
        .post(window.API.POST_SHOP_ADD_VENDOR_PRICINGS(this.shop.id), {
          title: modern ? this.title.trim() : this.title,
          description: this.description,
          commission: modern ? Number(this.commission) : this.commission,
        })
        .then(({ data }) => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          if (!data.error) {
            this.$emit("add", data.pricing);
            if (modern && !this.isCurrentRequest(request, context)) return;
            if (modern) this.resetRemoval();
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          this.busy = false;
          if (modern) this.pendingRequest = null;
        });
    },

    editricing() {
      if (this.modern && (!this.canSubmitModern || !this.validPricing)) return;
      const modern = this.modern, context = this.context, request = Symbol();
      if (modern) this.pendingRequest = request;
      this.busy = true;

      return axios
        .put(
          window.API.PUT_SHOP_EDIT_VENDOR_PRICINGS(
            this.shop.id,
            this.pricing.id,
          ),
          {
            title: modern ? this.title.trim() : this.title,
            description: this.description,
            commission: modern ? Number(this.commission) : this.commission,
          },
        )
        .then(({ data }) => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          if (!data.error) {
            this.$emit("update", data.pricing);
            if (modern && !this.isCurrentRequest(request, context)) return;
            if (modern) this.resetRemoval();
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          this.busy = false;
          if (modern) this.pendingRequest = null;
        });
    },

    remove() {
      if (this.modern && !this.canRemoveModern) return;
      const modern = this.modern, context = this.context, request = Symbol();
      if (modern) this.pendingRequest = request;
      this.busy_delete = true;

      return axios
        .delete(
          window.API.DELETE_SHOP_EDIT_VENDOR_PRICINGS(
            this.shop.id,
            this.pricing.id,
          ),
        )
        .then(({ data }) => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          if (!data.error) {
            this.$emit("remove", data.id);
            if (modern && !this.isCurrentRequest(request, context)) return;
            if (modern) this.resetRemoval();
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (modern && !this.isCurrentRequest(request, context)) return;
          this.busy_delete = false;
          if (modern) this.pendingRequest = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-vendor-pricing-add {
  --sd-modern-icon-button-size: 33px;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 0;
  padding: 0;
  border: 0;
  border-radius: 0 !important;
  overflow: hidden;
  font-family: inherit;
  font-size: var(--sd-modern-font-body);
  line-height: 22px;
  // Bound the fullscreen card so only its body scrolls, keeping the native header and actions visible.
  &.v-card { flex: 1 1 auto; max-height: 100dvh; padding: 0; border: 0; box-shadow: none; font-size: var(--sd-modern-font-body); line-height: 22px; }

  > .b-vendor-pricing-add__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex: 0 0 auto;
    gap: 15px;
    margin: 0;
    padding: 22px 24px;
    background: rgb(var(--v-theme-surface));
    border-block-end: 1px solid var(--sd-modern-border);
    white-space: normal;
    h2 { margin: 0; font-size: 21px; line-height: 29px; font-weight: 500; }
    p { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small); line-height: 21px; font-weight: 400; }
    > .sd-modern-icon-button { flex-shrink: 0; }
  }

  &__heading { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
  &__heading > .v-icon { margin-block-start: 4px; color: var(--sd-modern-muted); flex-shrink: 0; }
  > .b-vendor-pricing-add__body { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior-y: contain; padding: 30px 24px 34px !important; font-size: var(--sd-modern-font-body); line-height: 22px; }
  &__content { min-width: 0; }
  &__intro { margin-block-end: 24px; }
  &__intro h3 { margin: 0; font-size: 17px; line-height: 25px; font-weight: 500; }
  &__intro p { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small); line-height: 21px; }
  &__form { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
  &__widget.sd-modern-widget { min-width: 0; padding: 24px; border: 0; border-radius: 16px; box-shadow: none; }
  &__widget-heading { margin-block-end: 20px; }
  &__widget-heading h3 { display: flex; align-items: center; gap: 9px; margin: 0; font-size: var(--sd-modern-font-body); line-height: 22px; font-weight: 500; }
  &__widget-heading h3 .v-icon { color: var(--sd-modern-muted); }
  &__widget-heading p { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small); line-height: 21px; }
  :deep(.sd-modern-underlined-field .v-field__input) { font-size: var(--sd-modern-font-body) !important; line-height: 22px !important; font-weight: 400; }
  :deep(.sd-modern-underlined-field .v-label) { font-weight: 400; }
  :deep(.sd-modern-underlined-field .v-field-label--floating) { font-size: var(--sd-modern-font-small); line-height: 20px; }
  :deep(.sd-modern-underlined-field .v-messages) { font-size: var(--sd-modern-font-small); line-height: 20px; }
  &__field { margin-block-end: 22px; }
  &__description { margin-block-end: 0; }
  &__example { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-block-start: 20px; padding: 15px 18px; background: var(--sd-modern-inset); border-radius: 11px; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small); line-height: 21px; }
  &__example-values { display: flex; align-items: center; gap: 22px; }
  &__example-values > span { display: flex; flex-direction: column; gap: 3px; }
  &__example small { font-size: var(--sd-modern-font-small); line-height: 21px; }
  &__example bdi { color: rgb(var(--v-theme-on-surface)); font-size: 18px; line-height: 26px; font-weight: 500; }
  &__example strong { font-weight: 500; }
  > .b-vendor-pricing-add__actions { display: flex; justify-content: flex-end; flex: 0 0 auto; flex-wrap: wrap; gap: 10px; padding: 16px 24px; background: rgb(var(--v-theme-surface)); border-block-start: 1px solid var(--sd-modern-border); }
  &__actions > .v-btn { margin-inline: 0; }
  .sd-modern-button { font-size: 13px; line-height: 22px; padding-block: 9px; }
  &__critical.sd-modern-widget { margin-block-start: 24px; padding: 12px 24px; border: 0; border-radius: 16px; box-shadow: none; }
  &__critical summary { display: flex; align-items: center; gap: 9px; min-height: 44px; list-style: none; cursor: pointer; font-size: var(--sd-modern-font-body); line-height: 22px; font-weight: 500; }
  &__critical summary::-webkit-details-marker { display: none; }
  &__critical summary > .v-icon { color: var(--sd-modern-muted); }
  &__chevron { margin-inline-start: auto; }
  &__critical[open] .b-vendor-pricing-add__chevron { transform: rotate(180deg); }
  &__critical > p { margin: 9px 0 14px; color: var(--sd-modern-muted); font-size: var(--sd-modern-font-small); line-height: 21px; }
  &__critical > .s--smart-verify { margin-block-end: 16px; min-height: 44px; }
  &__critical > .s--smart-verify :deep(.ok > b) { font-size: var(--sd-modern-font-small); line-height: 21px; font-weight: 400; }
  &__critical > .sd-modern-button { margin-block-end: 8px; }
  &__critical summary:focus-visible, &__critical > .s--smart-verify:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
}

@media (max-width: 899.98px) {
  .b-vendor-pricing-add__form { grid-template-columns: minmax(0, 1fr); gap: 16px; }
}

@media (max-width: 599.98px) {
  .b-vendor-pricing-add > .b-vendor-pricing-add__header { padding: 20px 16px; }
  .b-vendor-pricing-add > .b-vendor-pricing-add__body { padding: 16px !important; }
  .b-vendor-pricing-add .b-vendor-pricing-add__widget.sd-modern-widget { padding: 20px 16px; }
  .b-vendor-pricing-add .b-vendor-pricing-add__critical.sd-modern-widget { padding-inline: 16px; }
  .b-vendor-pricing-add > .b-vendor-pricing-add__actions { padding: 12px 16px; gap: 8px; }
  .b-vendor-pricing-add .sd-modern-button { min-height: 44px; }
  .b-vendor-pricing-add { --sd-modern-icon-button-size: 44px; }
  .b-vendor-pricing-add :deep(.sd-modern-underlined-field .v-field__input) { font-size: 16px !important; line-height: 24px !important; }
}
</style>

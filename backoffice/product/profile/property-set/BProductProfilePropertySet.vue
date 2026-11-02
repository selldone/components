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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Assign Package Profile ▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

  <v-list-item
    v-if="isPhysical || isVirtual"
    v-bind="$attrs"
    :class="modern ? 'b-product-profile-property-set--modern sd-modern-clickable-item text-start' : 'row-hover'"
    :prepend-icon="modern ? undefined : 'hive'"
    @click="showEdit()"
    slim
  >
    <template v-if="modern" #prepend>
      <b-product-edit-info-icon class="me-3" name="Layers" />
    </template>
    <v-list-item-title>
      <b>{{ $t("product_property_set.profile.title") }} </b>
    </v-list-item-title>

    <v-list-item-subtitle>
      <span v-if="modern" class="b-product-profile-property-set__name">
        {{ product.property_set?.name || product.property_set?.title || (product.property_set_id ? $t('add_product.edit_info.modern.assigned_profile', { id: product.property_set_id }) : $t('add_product.edit_info.modern.not_assigned')) }}
      </span>
      <template v-if="product.property_set">
        <template v-if="product.property_set.variants">
          <v-chip
            v-for="it in product.property_set.variants"
            :key="it.code"
            size="x-small"
            :prepend-icon="GetVariantIconByCode(it.code, product)"
            style="margin: 1px"
            color="#fff"
            variant="flat"
          >
            {{ $t(GetVariantNameByCode(it.code, product)) }}
          </v-chip>
        </template>
        <small v-else>{{ $t("global.commons.empty") }}</small>
      </template>
      <template v-else-if="!modern">
        {{ $t("product_property_set.profile.subtitle") }}
      </template>
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-list-item-action end>
        <v-btn
          v-if="modern"
          class="sd-modern-button sd-modern-button--inline"
          color="primary"
          variant="text"
          @click.stop="showEdit()"
        >{{ $t(product.property_set_id ? 'global.actions.change' : 'add_product.edit_info.modern.assign') }}</v-btn>
        <v-btn
          v-else
          :color="property_set ? 'success' : 'primary'"
          icon
          variant="text"
        >
          <v-icon>{{ property_set ? "check_box" : "add_box" }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>

  <!-- ██████████████████████ Dialog > Select Property Set for the Product ██████████████████████ -->

  <v-dialog
    v-model="assign_dialog"
    :fullscreen="!modern || $vuetify.display.xs"
    :max-width="modern ? 820 : undefined"
    scrollable
    :transition="modern ? 'dialog-transition' : 'dialog-bottom-transition'"
  >
    <v-card class="text-start" :class="{ 'sd-modern-widget b-product-profile-property-set__dialog': modern }" :theme="modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined">
      <template v-if="modern">
        <header class="b-product-profile-property-set__header">
          <b-product-edit-info-icon name="Layers" :size="22" />
          <div class="b-product-profile-property-set__heading"><h1>{{ t('title') }}</h1><p>{{ t('subtitle') }}</p></div>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="assign_dialog = false">
            <b-product-edit-info-icon name="X" :size="16" />
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-focus="true">{{ $t('global.actions.close') }}</v-tooltip>
          </v-btn>
        </header>
        <v-card-text class="b-product-profile-property-set__workspace sd-modern-canvas">
          <section class="sd-modern-widget b-product-profile-property-set__selection" :aria-busy="selectorState.loading">
            <div class="b-product-profile-property-set__selection-heading">
              <div><h2>{{ t('selection_title') }}</h2><p>{{ t('selection_help') }}</p></div>
              <v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :to="IS_VENDOR_PANEL ? undefined : { name: 'BPageShopLogisticPropertySets' }" :disabled="!!IS_VENDOR_PANEL" target="_blank" rel="noopener noreferrer">
                <template #prepend><b-product-edit-info-icon name="Plus" :size="16" /></template>{{ t('create') }}<v-icon size="16" end aria-hidden="true">north_east</v-icon>
              </v-btn>
            </div>
            <label class="b-product-profile-property-set__field-label">{{ $t('global.commons.property_set') }}</label>
            <v-locale-provider :rtl="false">
              <!-- Preserve the native menu workaround without changing the field's reading direction. -->
              <b-property-set-input v-if="assign_dialog" ref="propertySetInput" :key="shop.id" v-model="property_set" modern return-object :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'" class="sd-modern-underlined-field" @load-state="setSelectorState" />
            </v-locale-provider>
            <div class="b-product-profile-property-set__feedback">
              <div v-if="selectorState.error" class="b-product-profile-property-set__error" role="alert"><v-icon size="18" aria-hidden="true">error_outline</v-icon><span>{{ t('load_error') }}</span><v-btn class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" prepend-icon="refresh" @click="$refs.propertySetInput?.getPropertySets()">{{ t('retry') }}</v-btn></div>
              <p v-else-if="selectorState.loading" role="status">{{ t('loading') }}</p>
              <p v-else-if="property_set?.description">{{ property_set.description }}</p>
            </div>
            <p v-if="IS_VENDOR_PANEL" class="b-product-profile-property-set__vendor-note">{{ $t('product_property_set.modern.vendor_note') }}</p>
          </section>
          <section class="sd-modern-widget b-product-profile-property-set__preview">
            <div class="b-product-profile-property-set__preview-heading">
              <div><h2>{{ t('preview') }}</h2><p>{{ property_set ? t('source_summary', { name: property_set.title || property_set.name, count: customOptionCount }) : t('default_summary') }}</p></div>
              <span class="sd-modern-status sd-modern-status--plain">{{ t('option_count', { count: optionCount }) }}</span>
            </div>
            <b-product-property-set-preview modern :property-set="property_set" class="b-product-profile-property-set__options">
              <template #option="{ option }">
                <v-icon size="18" aria-hidden="true">{{ option.icon }}</v-icon>
                <div class="b-product-profile-property-set__option-copy">
                  <span class="b-product-profile-property-set__option-name">{{ option.name }}</span>
                  <div v-if="optionOverride(option.code)?.values?.length" class="b-product-profile-property-set__values">
                    <span v-for="(value, index) in optionOverride(option.code).values.slice(0, 3)" :key="index" class="b-product-profile-property-set__value">
                      <span v-if="index" aria-hidden="true">·</span>
                      <u-color-circle v-if="option.code === 'color'" :color="value" :size="14" />
                      <u-variant-asset-image v-else :value="value" :size="18" />
                      <span>{{ value.removeVariantAsset() }}</span>
                    </span>
                    <span v-if="optionOverride(option.code).values.length > 3" dir="ltr">+{{ optionOverride(option.code).values.length - 3 }}</span>
                  </div>
                  <span v-else class="b-product-profile-property-set__value-note">{{ t(optionOverride(option.code) ? 'no_suggestions' : 'shop_default') }}</span>
                </div>
                <span v-if="optionOverride(option.code)" class="b-product-profile-property-set__custom"><span class="sd-modern-status__dot" />{{ t('custom') }}</span>
              </template>
            </b-product-property-set-preview>
            <p class="b-product-profile-property-set__preview-help">{{ t('preview_help') }}</p>
          </section>
          <div class="sd-modern-notice b-product-profile-property-set__notice"><v-icon aria-hidden="true">info_outline</v-icon><p class="sd-modern-notice__content">{{ t('guidance') }}</p></div>
          <details class="b-product-profile-property-set__examples"><summary><v-icon size="16" aria-hidden="true">lightbulb_outline</v-icon><span>{{ t('examples') }}</span><v-icon size="16" aria-hidden="true">expand_more</v-icon></summary><div><p><v-icon size="16" aria-hidden="true">checkroom</v-icon>{{ t('example_clothing') }}</p><p><v-icon size="16" aria-hidden="true">headphones</v-icon>{{ t('example_gadgets') }}</p><p><v-icon size="16" aria-hidden="true">fitness_center</v-icon>{{ t('example_training') }}</p></div></details>
        </v-card-text>
        <v-card-actions class="b-product-profile-property-set__footer">
          <p><v-icon size="14" aria-hidden="true">save</v-icon><span>{{ t('save_help') }}</span></p>
          <div class="b-product-profile-property-set__footer-actions">
            <v-btn class="sd-modern-button" variant="text" @click="assign_dialog = false">{{ $t('global.actions.cancel') }}</v-btn>
            <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" prepend-icon="check" :disabled="confirmBlocked" @click="confirm">{{ t('confirm') }}</v-btn>
          </div>
        </v-card-actions>
      </template>
      <template v-else>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1">hive</v-icon>
        {{ $t("product_property_set.select_property_set") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            icon="hive"
            :title="$t('global.commons.property_set')"
            :to="
              IS_VENDOR_PANEL
                ? undefined
                : { name: 'BPageShopLogisticPropertySets' }
            "
            :add-caption="$t('product_property_set.add_property_set')"
            :disabled="IS_VENDOR_PANEL"
            :disabled-reason="$t('product_badges.only_marketplace_owner_msg')"
            add-text
            target="_blank"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("product_property_set.subtitle") }}
          </v-list-subheader>

          <b-product-property-set-preview
            class="mb-5"
            :property-set="property_set"
          ></b-product-property-set-preview>

          <v-locale-provider :rtl="false /*Fix bug not show dropdown menu*/">
            <b-property-set-input
              v-model="property_set"
              return-object
            ></b-property-set-input>
          </v-locale-provider>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="assign_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            color="primary"
            size="x-large"
            variant="elevated"
            @click="confirm"
            prepend-icon="check"
          >
            {{ $t("global.actions.set") }}
          </v-btn>
        </div>
      </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants.ts";
import BPropertySetInput from "@selldone/components-vue/backoffice/property-set/input/BPropertySetInput.vue";
import BProductPropertySetPreview from "@selldone/components-vue/backoffice/property-set/preview/BProductPropertySetPreview.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";

export default {
  name: "BProductProfilePropertySet",
  mixins: [],
  components: {
    BProductEditInfoIcon,
    BProductPropertySetPreview,
    BPropertySetInput,
    UColorCircle,
    UVariantAssetImage,
  },
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
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,

      assign_dialog: false,

      dialog_add: false,

      property_set: null,
      selectorState: { loading: false, error: false },
    };
  },
  computed: {
    optionCount() {
      return Object.keys(ProductVariants).length;
    },
    customOptionCount() {
      return new Set((this.property_set?.variants || []).map(item => item.code).filter(code => Object.hasOwn(ProductVariants, code))).size;
    },
    confirmBlocked() {
      return this.modern && (this.selectorState.loading || this.selectorState.error || (!!this.property_set && (typeof this.property_set !== 'object' || this.property_set.id == null)));
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    isPhysical() {
      return this.product?.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product?.type === ProductType.VIRTUAL.code;
    },
  },

  watch: {
    assign_dialog(value) {
      if (!value) {
        this.property_set = this.product.property_set || null;
        this.selectorState = { loading: false, error: false };
      }
    },
    product() {
      this.assign_dialog = false;
      this.property_set = this.product.property_set;
    },
    "product.property_set"(value) {
      if (this.modern && !this.assign_dialog) this.property_set = value;
    },
  },

  created() {
    this.property_set = this.product.property_set;
  },

  methods: {
    t(key, values = {}) {
      return this.$t(`product_property_set.profile_refined.${key}`, values);
    },
    optionOverride(code) {
      return this.property_set?.variants?.find(item => item.code === code);
    },
    setSelectorState(value) {
      if (this.assign_dialog) this.selectorState = value;
    },
    showEdit() {
      this.property_set = this.product.property_set || null;
      this.selectorState = { loading: false, error: false };
      this.assign_dialog = true;
    },

    confirm() {
      if (this.confirmBlocked) return;
      // An explicit null survives JSON serialization when restoring shop defaults.
      this.product.property_set_id = this.property_set?.id ?? null;
      this.product.property_set = this.property_set || null;
      this.assign_dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-profile-property-set__dialog {
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
  max-height: calc(100dvh - 48px);

  h1, h2, p { margin: 0; font-family: inherit; }
  h1 { font-size: 20px; line-height: 28px; font-weight: 500; letter-spacing: 0; }
  h2 { font-size: 14px; line-height: 22px; font-weight: 500; }
  p { font-size: 13px; line-height: 21px; color: var(--sd-modern-muted); }
  .sd-modern-button { font-size: 13px; line-height: 20px; }
  .b-product-profile-property-set__header { display: flex; align-items: flex-start; gap: 12px; padding: 24px; border-bottom: 1px solid var(--sd-modern-border); flex-shrink: 0; }
  .b-product-profile-property-set__header > .b-product-edit-info-icon { flex-shrink: 0; margin-block-start: 3px; color: var(--sd-modern-muted); }
  .b-product-profile-property-set__heading { min-width: 0; flex: 1; }
  .b-product-profile-property-set__heading p { margin-block-start: 4px; }
  .b-product-profile-property-set__workspace { display: flex; flex-direction: column; gap: 16px; padding: 20px; min-width: 0; }
  .b-product-profile-property-set__selection, .b-product-profile-property-set__preview { flex-shrink: 0; padding: 20px; border-radius: 14px; }
  .b-product-profile-property-set__selection-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-block-end: 20px; }
  .b-product-profile-property-set__selection-heading p { margin-block-start: 4px; }
  .b-product-profile-property-set__field-label { display: block; font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-product-profile-property-set__feedback { min-height: 21px; margin-block-start: 8px; }
  .b-product-profile-property-set__feedback > p, .b-product-profile-property-set__vendor-note { font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  .b-product-profile-property-set__vendor-note { margin-block-start: 12px; }
  .b-product-profile-property-set__error { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; align-items: start; gap: 8px; color: rgb(var(--v-theme-on-surface)); font-size: 13px; line-height: 21px; }
  .b-product-profile-property-set__error > .v-icon { margin-block-start: 2px; }
  .b-product-profile-property-set__error > .sd-modern-button { margin-block-start: -7px; }
  .b-product-profile-property-set__preview-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-block-end: 12px; }
  .b-product-profile-property-set__preview-heading p { margin-block-start: 4px; font-size: 12px; line-height: 18px; }
  .b-product-profile-property-set__preview-heading > span { white-space: nowrap; }
  .b-product-profile-property-set__options { column-gap: 20px; }
  .b-product-profile-property-set__options :deep(> li) { padding: 12px; gap: 9px; }
  .b-product-profile-property-set__options :deep(> li::before) { flex-basis: 10px; font-size: 12px; line-height: 18px; }
  .b-product-profile-property-set__option-copy { min-width: 0; flex: 1; }
  .b-product-profile-property-set__option-name { display: block; font-size: 13px; line-height: 20px; font-weight: 500; overflow-wrap: anywhere; }
  .b-product-profile-property-set__values { display: flex; align-items: center; flex-wrap: wrap; gap: 2px 5px; margin-block-start: 2px; font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-product-profile-property-set__value { display: inline-flex; align-items: center; gap: 4px; min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .b-product-profile-property-set__value > :deep(img), .b-product-profile-property-set__value > :deep(.u-color-circle) { flex-shrink: 0; }
  .b-product-profile-property-set__value-note { display: block; margin-block-start: 2px; font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-product-profile-property-set__options :deep(> li > .b-product-profile-property-set__custom) { display: inline-flex; flex-shrink: 0; align-items: center; gap: 4px; font-size: 11px; line-height: 16px; color: var(--sd-modern-muted); }
  .b-product-profile-property-set__custom .sd-modern-status__dot { width: 4px; height: 4px; background: rgb(var(--v-theme-primary)); }
  .b-product-profile-property-set__preview-help { margin-block-start: 16px; font-size: 12px; line-height: 19px; }
  .b-product-profile-property-set__notice { padding: 0 4px; background: transparent; }
  .b-product-profile-property-set__examples { padding-inline: 4px; }
  .b-product-profile-property-set__examples summary { display: flex; align-items: center; gap: 8px; min-height: 36px; list-style: none; cursor: pointer; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; }
  .b-product-profile-property-set__examples summary::-webkit-details-marker { display: none; }
  .b-product-profile-property-set__examples summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 4px; }
  .b-product-profile-property-set__examples summary .v-icon:last-child { margin-inline-start: auto; }
  .b-product-profile-property-set__examples[open] summary .v-icon:last-child { transform: rotate(180deg); }
  .b-product-profile-property-set__examples > div { display: grid; gap: 10px; padding-block-start: 10px; }
  .b-product-profile-property-set__examples p { display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 19px; }
  .b-product-profile-property-set__footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; border-top: 1px solid var(--sd-modern-border); flex-shrink: 0; }
  .b-product-profile-property-set__footer > p { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; line-height: 18px; }
  .b-product-profile-property-set__footer > p .v-icon { flex-shrink: 0; margin-block-start: 2px; }
  .b-product-profile-property-set__footer-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  @media (max-width: 620px) {
    .b-product-profile-property-set__options { grid-template-columns: minmax(0, 1fr); }
    .b-product-profile-property-set__options :deep(> li:nth-last-child(2)) { border-block-end: 1px solid var(--sd-modern-border); }
  }
  @media (max-width: 600px) {
    border-radius: 0;
    max-height: 100dvh;
    .b-product-profile-property-set__header { padding: 20px 16px; }
    .b-product-profile-property-set__workspace { padding: 16px; }
    .b-product-profile-property-set__selection, .b-product-profile-property-set__preview { padding: 16px; }
    .b-product-profile-property-set__selection-heading { flex-wrap: wrap; gap: 6px; margin-block-end: 16px; }
    .b-product-profile-property-set__error { grid-template-columns: 18px minmax(0, 1fr); }
    .b-product-profile-property-set__error > .sd-modern-button { grid-column: 2; justify-self: start; margin-block-start: 0; }
    .b-product-profile-property-set__examples summary { min-height: 44px; }
    .b-product-profile-property-set__footer { flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; }
    .b-product-profile-property-set__footer-actions { justify-content: flex-end; flex-wrap: wrap; }
  }
}

.b-product-profile-property-set--modern {
  min-height: 62px;
  padding: 10px 12px;
  border-radius: 9px;
  :deep(.v-list-item-title), :deep(.v-list-item-title b) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; white-space: normal; }
  :deep(.v-list-item-subtitle) { margin-top: 2px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; opacity: 1; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item__append) { padding-inline-start: 12px; }
  .b-product-profile-property-set__name { display: block; margin-bottom: 2px; }
  .b-product-edit-info-icon { color: var(--sd-modern-muted); }
}
</style>

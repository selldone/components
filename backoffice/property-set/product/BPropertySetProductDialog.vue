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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ███████████████████████ Dialog > Add Bulk ███████████████████████ -->
  <component
    :is="modern && !mobileSheet ? 'VDialog' : 'VBottomSheet'"
    :model-value="modelValue"
    :width="modern ? (mobileSheet ? '100%' : 'calc(100% - 32px)') : '98vw'"
    :max-width="modern ? 640 : 1200"
    scrollable
    :persistent="busy"
    transition="dialog-bottom-transition"
    :content-props="modern ? { 'aria-labelledby': 'property-set-title', style: { borderRadius: mobileSheet ? '18px 18px 0 0' : '18px' } } : undefined"
    :content-class="modern ? undefined : 'rounded-t-xl'"
    @update:model-value="onDialogToggle"
  >
    <v-card
      :rounded="modern ? undefined : 't-xl'"
      class="text-start"
      :class="{
        'sd-modern-widget b-property-set-product-editor': modern,
        'b-property-set-product-editor--sheet': modern && mobileSheet,
      }"
      :theme="
        modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined
      "
      @keydown.esc="onEscape"
    >
      <header v-if="modern" class="b-property-set-product-editor__header">
        <b-product-edit-info-icon name="Layers" :size="22" />
        <div class="b-property-set-product-editor__heading"><h2 id="property-set-title">{{ $t("product_property_set.select_property_set") }}</h2><p>{{ $t('product_property_set.modern.subtitle') }}</p></div>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('global.actions.close')"
          :disabled="busy"
          @click="close"
        >
          <b-product-edit-info-icon name="X" :size="16" />
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </header>
      <v-card-title v-else class="d-flex align-center">
        <u-avatar-folder
          :src="getShopImagePath($product.icon, 128)"
          class="me-2"
          :size="48"
          :border-size="6"
          side-icon="shelves"
        ></u-avatar-folder>
        {{ $t("product_property_set.select_property_set") }}
      </v-card-title>
      <v-card-text v-if="modern" class="b-property-set-product-editor__body">
        <p class="b-property-set-product-editor__product"><b-product-edit-info-icon name="PackageOpen" :size="15" /><span>{{ $product.title }}</span></p>
        <div class="b-property-set-product-editor__help-heading"><p>{{ $t('product_property_set.modern.brief') }}</p><v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :disabled="busy" :aria-label="$t('product_property_set.modern.help_title')" :aria-expanded="helpOpen" aria-controls="property-set-help" @click="helpOpen = !helpOpen"><b-product-edit-info-icon name="Info" :size="16" /><v-tooltip :disabled="helpOpen" activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('product_property_set.modern.help_title') }}</v-tooltip></v-btn></div>
        <section v-if="helpOpen" id="property-set-help" class="b-property-set-product-editor__help">
          <h3>{{ $t('product_property_set.modern.help_title') }}</h3><p>{{ $t('product_property_set.modern.help_body') }}</p>
          <div class="b-property-set-product-editor__example"><b-product-edit-info-icon name="Shirt" :size="17" /><span>{{ $t('product_property_set.modern.example_clothing') }}</span><b-product-edit-info-icon class="b-property-set-product-editor__direction" name="ArrowRight" :size="16" /><span><b-product-edit-info-icon name="Ruler" :size="16" />{{ $t('product_property_set.modern.example_size') }}</span><span><b-product-edit-info-icon name="Layers" :size="16" />{{ $t('product_property_set.modern.example_fabric') }}</span></div>
          <p class="b-property-set-product-editor__help-foot">{{ $t('product_property_set.modern.help_foot') }}</p>
        </section>
        <div class="b-property-set-product-editor__selection-heading"><span>{{ $t('global.commons.property_set') }}</span><v-btn class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" :to="IS_VENDOR_PANEL ? undefined : { name: 'BPageShopLogisticPropertySets' }" :disabled="busy || !!IS_VENDOR_PANEL" target="_blank" rel="noopener noreferrer"><template #prepend><b-product-edit-info-icon name="Plus" :size="14" /></template>{{ $t('product_property_set.modern.create_set') }}<v-icon size="14" end>north_east</v-icon></v-btn></div>
        <b-property-set-input v-model="property_set" modern :disabled="busy" return-object class="sd-modern-underlined-field" />
        <p class="b-property-set-product-editor__selection-note">{{ property_set?.description || $t(property_set ? 'product_property_set.modern.selected_hint' : 'product_property_set.modern.default_hint') }}</p>
        <p v-if="IS_VENDOR_PANEL" class="b-property-set-product-editor__vendor-note"><b-product-edit-info-icon name="LockKeyhole" :size="14" />{{ $t('product_property_set.modern.vendor_note') }}</p>
        <section class="b-property-set-product-editor__preview"><h3>{{ $t('product_property_set.modern.preview') }}</h3><p>{{ $t('product_property_set.modern.preview_intro') }}</p><b-product-property-set-preview modern :property-set="property_set" /></section>
        <p class="b-property-set-product-editor__scope"><b-product-edit-info-icon name="CircleCheck" :size="15" /><span>{{ $t('product_property_set.modern.scope') }}</span></p>
      </v-card-text>
      <v-card-text v-else>
        <div
          :class="
            modern
              ? 'b-property-set-product-editor__section'
              : 'widget-box -large mb-5'
          "
        >
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
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

          <b-property-set-input
            v-model="property_set"
            :class="{ 'sd-modern-underlined-field': modern }"
            return-object
          ></b-property-set-input>
        </div>
      </v-card-text>
      <v-card-actions
        :class="{ 'b-property-set-product-editor__actions': modern }"
      >
        <div class="widget-buttons">
          <v-btn
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            variant="text"
            :disabled="busy"
            @click="close"
            :prepend-icon="modern ? undefined : 'close'"
          >
            {{ $t(modern ? 'global.actions.cancel' : 'global.actions.close') }}
          </v-btn>

          <v-btn
            :loading="busy"
            :disabled="busy || invalidSelection"
            color="primary"
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            @click="saveProductPropertySet()"
            variant="elevated"
            :prepend-icon="modern ? undefined : 'save'"
          >
            <template v-if="modern" #prepend><b-product-edit-info-icon name="Check" :size="16" /></template>
            {{ $t("global.actions.save_changes") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </component>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import BPropertySetInput from "@selldone/components-vue/backoffice/property-set/input/BPropertySetInput.vue";
import BProductPropertySetPreview from "@selldone/components-vue/backoffice/property-set/preview/BProductPropertySetPreview.vue";
import BProductEditInfoIcon from "../../product/edit/info/BProductEditInfoIcon.vue";
import { VDialog, VBottomSheet } from "vuetify/components";

export default {
  name: "BPropertySetProductDialog",
  mixins: [],

  inject: ["$shop", "$vendor", "$product"],
  components: {
    VDialog,
    VBottomSheet,
    BProductEditInfoIcon,
    BProductPropertySetPreview,
    BPropertySetInput,
    UAvatarFolder,
  },
  emits: ["update:modelValue", "update:product"],
  props: {
    modern: { type: Boolean, default: false },
    modelValue: {},
  },
  data() {
    return {
      busy: false,
      property_set: null,
      helpOpen: false,
      session: 0,
      disposed: false,
    };
  },

  computed: {
    mobileSheet() {
      return this.$vuetify.display.width <= 520;
    },
    invalidSelection() {
      return !!this.property_set && (typeof this.property_set !== 'object' || this.property_set.id == null);
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    $product() {
      this.init();
    },
    modelValue(value) {
      if (value) this.init();
      else { this.session++; this.busy = false; this.helpOpen = false; }
    },
  },
  created() {
    this.init();
  },
  beforeUnmount() {
    this.disposed = true;
    this.session++;
  },
  methods: {
    init() {
      this.session++;
      this.busy = false;
      this.helpOpen = false;
      this.property_set = this.$product.property_set || null;
    },
    saveProductPropertySet() {
      if (this.busy || !this.modelValue || this.invalidSelection) return;
      const product = this.$product, productId = product.id, session = this.session;
      const isCurrent = () => !this.disposed && this.session === session && this.$product === product && product.id === productId;
      this.busy = true;

      let url = null;

      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        url = window.VAPI.PUT_MY_VENDOR_PRODUCT_SET_PROPERTY_SET(
          this.$vendor.id,
          this.$product.id,
        );
      } else {
        url = window.API.PUT_PRODUCT_SET_PROPERTY_SET(
          this.$shop.id,
          this.$product.id,
        );
      }

      axios
        .put(url, {
          property_set_id: this.property_set?.id,
        })
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (!data.error) {
            Object.assign(this.$product, data.product);
            this.$product.property_set = data.property_set;

            this.$emit("update:product", this.$product);

            this.busy = false;
            this.close();

            NotificationService.showSuccessAlert(
              null,
              this.$t('product_property_set.modern.saved'),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (isCurrent()) NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (isCurrent()) this.busy = false;
        });
    },

    close() {
      if (this.busy) return;
      this.property_set = this.$product.property_set || null;
      this.helpOpen = false;
      this.$emit("update:modelValue", false);
    },
    onDialogToggle(value) {
      if (!this.busy) {
        if (!value) this.close();
        else this.$emit('update:modelValue', true);
      }
    },
    onEscape(event) {
      if (!this.helpOpen) return;
      event.stopPropagation();
      event.preventDefault();
      this.helpOpen = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-property-set-product-editor {
  --sd-modern-icon-button-size: 32px;
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--sd-modern-border);
  border-radius: 18px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;

  &--sheet { border-radius: 18px 18px 0 0; border-block-end: 0; }
  &__header { display: flex; align-items: flex-start; gap: 12px; padding: 25px 26px 21px; flex-shrink: 0; }
  &__header > svg { flex-shrink: 0; margin-block-start: 3px; color: var(--sd-modern-muted); }
  &__heading { flex: 1; min-width: 0; }
  &__heading h2 { margin: 0; font-size: 20px; line-height: 28px; font-weight: 500; letter-spacing: -.25px; }
  &__heading p { margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__body { min-width: 0; padding: 0 26px 24px !important; }
  &__product { display: flex; align-items: center; gap: 7px; margin: 0; padding-block-end: 22px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__product > svg { flex-shrink: 0; }
  &__product > span { min-width: 0; overflow-wrap: anywhere; }
  &__help-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-block-end: 22px; }
  &__help-heading p { margin: 0; font-size: 13px; line-height: 21px; }
  &__help-heading > .v-btn { flex-shrink: 0; }
  &__help { margin-block: -7px 24px; padding: 17px 18px; border-radius: 12px; background: var(--sd-modern-inset); }
  &__help h3 { margin: 0 0 7px; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__help > p { margin: 0; font-size: 14px; line-height: 23px; }
  &__help .b-property-set-product-editor__help-foot { margin-block-start: 14px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__example { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-block-start: 15px; font-size: 13px; line-height: 21px; }
  &__example > svg { flex-shrink: 0; color: var(--sd-modern-muted); }
  &__example > span { display: inline-flex; align-items: center; gap: 5px; }
  &__selection-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px 14px; margin-block-end: 6px; }
  &__selection-heading > span { font-size: 13px; font-weight: 500; line-height: 21px; }
  &__selection-heading .v-btn { min-height: 36px; padding-inline: 0; font-size: 12px; font-weight: 500; line-height: 20px; margin-inline-start: auto; }
  &__selection-heading :deep(.v-btn__content) { gap: 5px; font: inherit; }
  &__selection-heading :deep(.v-btn__prepend) { margin-inline: 0 5px; }
  &__selection-note { margin: 8px 0 0; min-height: 21px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; overflow-wrap: anywhere; }
  &__vendor-note { display: flex; align-items: flex-start; gap: 6px; margin: 10px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__vendor-note > svg { flex-shrink: 0; margin-block-start: 3px; }
  &__preview { margin-block-start: 28px; }
  &__preview h3 { margin: 0; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__preview > p { margin: 3px 0 14px; color: var(--sd-modern-muted); font-size: 12px; line-height: 20px; }
  &__scope { display: flex; align-items: flex-start; gap: 7px; margin: 23px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__scope > svg { flex-shrink: 0; margin-block-start: 3px; }
  &__actions { padding: 18px 26px 22px; border-block-start: 1px solid var(--sd-modern-border); flex-shrink: 0; }
  &__actions .widget-buttons { display: flex; flex-direction: row; justify-content: flex-end; flex-wrap: wrap; gap: 9px; width: 100%; max-width: none; margin: 0; padding: 0; }
  &__actions .widget-buttons > .v-btn { flex: 0 0 auto; min-width: 0; min-height: 42px; margin: 0; padding: 9px 16px; border-radius: 9px; font-size: 13px; font-weight: 500; line-height: 20px; }
  &__actions .widget-buttons > .v-btn:first-child { border: 1px solid var(--sd-modern-border); }
  &__actions :deep(.v-btn__content) { font: inherit; }
  &:dir(rtl) &__direction { transform: scaleX(-1); }
  &:dir(rtl) &__heading h2 { letter-spacing: 0; }

  @media (max-width: 520px) {
    &__header { padding: 22px 19px 18px; gap: 10px; }
    &__heading h2 { font-size: 18px; line-height: 26px; }
    &__body { padding: 0 19px 23px !important; }
    &__actions { padding: 17px 19px 20px; }
    &__actions .widget-buttons > .v-btn, &__selection-heading .v-btn { min-height: 44px; }
    &__help { padding: 15px; }
    .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
  }
  @media (max-width: 360px) {
    &__header { padding-inline: 15px; }
    &__header > svg { display: none; }
    &__body { padding-inline: 15px !important; }
    &__actions { padding-inline: 15px; }
  }
}

.v-card.b-property-set-product-editor { border-radius: 18px; }
.v-card.b-property-set-product-editor.b-property-set-product-editor--sheet { border-radius: 18px 18px 0 0; }
</style>

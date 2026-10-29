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
  <section class="b-theme-colors text-start">
    <header class="b-theme-colors__heading">
      <h2 class="sd-modern-title-text">{{ $t('shop_theme.theme_colors') }}</h2>
      <p class="sd-modern-subtitle">{{ $t('shop_theme.studio.colors_description') }}</p>
    </header>

    <div class="b-theme-colors__workspace">
      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Appearance and palette ▃▃▃▃▃▃▃▃▃▃▃▃ -->
      <section class="sd-modern-widget b-theme-colors__settings">
        <h3 class="sd-modern-eyebrow">{{ $t('shop_theme.studio.appearance') }}</h3>
        <div class="b-theme-colors__appearance">
          <u-smart-switch
            v-for="choice in appearanceChoices"
            :key="choice.event"
            :model-value="choice.value"
            :true-title="$t(choice.title) + ' | ' + $t('global.commons.light')"
            :false-title="$t(choice.title) + ' | ' + $t('global.commons.dark')"
            :force-show-all="false"
            :readonly="readOnly"
            class="sd-modern-smart-select"
            true-icon="light_mode"
            false-icon="mode_night"
            accessible
            border
            @update:model-value="value => $emit(choice.event, value)"
          />
        </div>

        <div class="b-theme-colors__palette-heading">
          <h3 class="sd-modern-eyebrow">{{ $t('shop_theme.studio.color_palette') }}</h3>
          <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
            <template #activator="{ props }">
              <v-btn v-bind="props" class="sd-modern-info-button" variant="text" icon
                     :aria-label="$t('shop_theme.studio.palette_help_label')">
                <v-icon aria-hidden="true">info_outline</v-icon>
              </v-btn>
            </template>
            {{ $t('shop_theme.studio.palette_help') }}
          </v-tooltip>
        </div>

        <div v-for="color in palette" :key="color.event" class="b-theme-colors__palette-row">
          <div class="b-theme-colors__color-description">
            <span class="b-theme-colors__color-label">{{ $t(color.title) }}</span>
            <span class="b-theme-colors__color-help">{{ $t(color.help) }}</span>
          </div>
          <div class="b-theme-colors__color-value">
            <u-color-selector
              v-if="!readOnly"
              :model-value="color.value"
              :dialog-title="$t(color.title)"
              class="b-theme-colors__selector"
              no-alpha
              no-bg
              icon="square"
              :size="28"
              @update:model-value="value => $emit(color.event, value)"
            />
            <span v-else class="b-theme-colors__readonly-swatch" :style="{ backgroundColor: color.value }" aria-hidden="true" />
            <bdi dir="ltr" class="b-theme-colors__hex">{{ String(color.value || '').toUpperCase() }}</bdi>
          </div>
        </div>
      </section>

      <!-- ▃▃▃▃▃▃▃▃▃▃▃▃ Live storefront preview ▃▃▃▃▃▃▃▃▃▃▃▃ -->
      <section class="b-theme-colors__preview" :aria-label="$t('shop_theme.studio.live_preview')">
        <div class="b-theme-colors__preview-heading">
          <h3 class="sd-modern-eyebrow">{{ $t('shop_theme.studio.live_preview') }}</h3>
          <div class="b-theme-colors__devices" role="group" :aria-label="$t('shop_theme.studio.live_preview')">
            <v-tooltip v-for="device in previewDevices" :key="device.code" location="top"
                       content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
              <template #activator="{ props }">
                <v-btn v-bind="props" class="sd-modern-icon-button b-theme-colors__device" icon variant="text"
                       :aria-label="$t(device.title)" :aria-pressed="previewDevice === device.code"
                       @click="previewDevice = device.code">
                  <v-icon size="16" aria-hidden="true">{{ device.icon }}</v-icon>
                </v-btn>
              </template>
              {{ $t(device.title) }}
            </v-tooltip>
          </div>
        </div>

        <div class="b-theme-colors__preview-stage">
          <div class="b-theme-colors__store" :class="{ 'b-theme-colors__store--mobile': previewDevice === 'mobile' }" :style="previewStyles">
            <!-- Header -->
            <div class="b-theme-colors__store-header">
              <div class="b-theme-colors__identity">
                <v-avatar size="25">
                  <v-img v-if="shop.icon" :src="getShopImagePath(shop.icon, 128)" :alt="shop.title" />
                  <v-icon v-else size="19" aria-hidden="true">storefront</v-icon>
                </v-avatar>
                <span>{{ shop.title }}</span>
              </div>
              <div class="b-theme-colors__store-icons" aria-hidden="true">
                <v-icon size="17">search</v-icon>
                <v-icon size="17">shopping_cart</v-icon>
              </div>
            </div>

            <!-- Content -->
            <div class="b-theme-colors__store-body">
              <div class="b-theme-colors__filter">
                <span>{{ $t('shop_theme.studio.all_categories') }}</span>
                <v-icon size="14" aria-hidden="true">tune</v-icon>
              </div>
              <div class="b-theme-colors__product">
                <div class="b-theme-colors__product-image">
                  <v-icon size="42" aria-hidden="true">shopping_bag</v-icon>
                  <span>{{ $t('shop_theme.studio.sample_storefront') }}</span>
                </div>
                <div class="b-theme-colors__product-content">
                  <span class="b-theme-colors__product-kicker">{{ $t('shop_theme.studio.sample_collection') }}</span>
                  <h4>{{ $t('shop_theme.studio.sample_product') }}</h4>
                  <div class="b-theme-colors__product-price">
                    <u-price :amount="2900" />
                    <span>{{ $t('shop_theme.studio.sample_variant') }}</span>
                  </div>
                  <div class="b-theme-colors__store-button">
                    <v-icon size="15" aria-hidden="true">add</v-icon>
                    {{ $t('global.actions.add_to_cart') }}
                  </div>
                </div>
              </div>

              <div class="b-theme-colors__checkout">
                <div class="b-theme-colors__checkout-heading">
                  <span>{{ $t('shop_theme.studio.order_summary') }}</span>
                  <v-icon size="15" aria-hidden="true">receipt_long</v-icon>
                </div>
                <u-text-value-dashed>
                  <template #label>{{ $t('global.commons.net_price') }}</template>
                  <u-price :amount="2900" />
                </u-text-value-dashed>
                <u-text-value-dashed>
                  <template #label>{{ $t('global.commons.tax') }}</template>
                  <u-price :amount="100" />
                </u-text-value-dashed>
                <u-text-value-dashed>
                  <template #label>{{ $t('global.commons.shipping_tax') }}</template>
                  <u-price :amount="0" />
                </u-text-value-dashed>
                <u-text-value-dashed class="b-theme-colors__total">
                  <template #label>{{ $t('global.commons.price') }}</template>
                  <u-price :amount="3000" />
                </u-text-value-dashed>
              </div>
            </div>

            <!-- Footer -->
            <div class="b-theme-colors__store-footer">
              <span>© {{ shop.title }}</span>
              <span class="b-theme-colors__store-link">{{ $t('shop_theme.studio.contact_us') }}</span>
            </div>
          </div>
        </div>
        <p class="b-theme-colors__preview-note">
          <v-icon size="14" aria-hidden="true">visibility</v-icon>
          {{ $t('shop_theme.studio.preview_note') }}
        </p>
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import chroma from "chroma-js";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import UTextValueDashed from "./../../../../ui/text/value-dashed/UTextValueDashed.vue";
import UColorSelector from "./../../../../ui/color/selector/UColorSelector.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default defineComponent({
  name: "BShopThemeColors",
  mixins: [TemplateMixin],
  components: { UColorSelector, UTextValueDashed, USmartSwitch },
  props: {
    shop: { required: true, type: Object },
    readOnly: { type: Boolean, default: false },
    lightHeader: {},
    lightFooter: {},
    lightCheckout: {},
    lightFilter: {},
    colorDark: {},
    colorDeepDark: {},
    colorLight: {},
    colorInfo: {},
    colorBill: {},
  },
  data() {
    return {
      previewDevice: "desktop",
      previewDevices: [
        { code: "desktop", icon: "desktop_windows", title: "shop_theme.studio.desktop_preview" },
        { code: "mobile", icon: "smartphone", title: "shop_theme.studio.mobile_preview" },
      ],
    };
  },
  computed: {
    appearanceChoices() {
      return [
        { value: this.lightHeader, title: "shop_theme.studio.header", event: "update:lightHeader" },
        { value: this.lightFooter, title: "shop_theme.studio.footer", event: "update:lightFooter" },
        { value: this.lightCheckout, title: "shop_theme.studio.checkout", event: "update:lightCheckout" },
        { value: this.lightFilter, title: "shop_theme.studio.category_filter", event: "update:lightFilter" },
      ];
    },
    palette() {
      return [
        { value: this.colorDark, title: "shop_theme.studio.header_background", help: "shop_theme.studio.header_background_help", event: "update:colorDark" },
        { value: this.colorDeepDark, title: "shop_theme.studio.store_background", help: "shop_theme.studio.store_background_help", event: "update:colorDeepDark" },
        { value: this.colorBill, title: "shop_theme.studio.checkout_background", help: "shop_theme.studio.checkout_background_help", event: "update:colorBill" },
        { value: this.colorLight, title: "shop_theme.studio.buttons", help: "shop_theme.studio.buttons_help", event: "update:colorLight" },
        { value: this.colorInfo, title: "shop_theme.studio.links", help: "shop_theme.studio.links_help", event: "update:colorInfo" },
      ];
    },
    previewStyles() {
      const header = this.lightHeader ? "#ffffff" : this.colorDark || this.ThemeColorDark;
      const footer = this.lightFooter ? "#ffffff" : this.colorDeepDark || this.ThemeColorDeepDark;
      const checkout = this.lightCheckout ? "#f6f7f9" : this.colorBill || this.ThemeColorDeepDark;
      const filter = this.lightFilter ? "#ffffff" : "#252830";
      const button = this.colorLight || this.ThemeColorLight;
      return {
        "--preview-header": header,
        "--preview-header-ink": this.foreground(header),
        "--preview-backdrop": this.colorDeepDark || this.ThemeColorDeepDark,
        "--preview-footer": footer,
        "--preview-footer-ink": this.foreground(footer),
        "--preview-checkout": checkout,
        "--preview-checkout-ink": this.foreground(checkout),
        "--preview-filter": filter,
        "--preview-filter-ink": this.foreground(filter),
        "--preview-button": button,
        "--preview-button-ink": this.foreground(button),
        "--preview-link": this.colorInfo || this.ThemeColorInfo,
      };
    },
  },
  methods: {
    foreground(color: unknown) {
      if (typeof color !== "string" || !chroma.valid(color)) return "#ffffff";
      return chroma(color).luminance() > 0.179 ? "#000000" : "#ffffff";
    },
  },
});
</script>

<style lang="scss" scoped>
.b-theme-colors {
  font-family: inherit;

  &__heading { margin-block-end: 20px; }
  &__heading .sd-modern-title-text { font-size: 17px; font-weight: 500; line-height: 24px; letter-spacing: -.3px; }
  &__heading .sd-modern-subtitle { max-width: 390px; margin: 4px 0 0; font-size: 12px; font-weight: 400; line-height: 18px; }
  &__workspace { display: grid; grid-template-columns: minmax(0, 1.06fr) minmax(0, .94fr); align-items: stretch; gap: 28px; }
  &__settings.sd-modern-widget { padding: 25px 28px; font-size: 13px; line-height: 20px; }
  .sd-modern-eyebrow { margin: 0; font-size: 10px; font-weight: 400; line-height: 15px; letter-spacing: .9px; }
  &__appearance { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-block-start: 15px; }
  &__palette-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-block: 25px 4px; }
  &__palette-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; padding-block: 12px; }
  &__palette-row + &__palette-row { border-block-start: 1px solid var(--sd-modern-border); }
  &__color-description { min-width: 0; }
  &__color-label { display: block; font-size: 12px; font-weight: 500; line-height: 18px; }
  &__color-help { display: block; margin-block-start: 1px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 17px; }
  &__color-value { display: flex; align-items: center; gap: 7px; }
  &__selector { flex: 0 0 auto; }
  &__selector :deep(> .v-btn) { border-radius: 8px; }
  &__hex { min-width: 57px; max-width: 100px; overflow-wrap: anywhere; color: var(--sd-modern-muted); font-family: ui-monospace, Consolas, monospace; font-size: 11px; line-height: 16px; }
  &__readonly-swatch { display: block; flex: 0 0 28px; width: 28px; height: 28px; border: 1px solid var(--sd-modern-border); border-radius: 8px; }
  &__preview { display: flex; flex-direction: column; min-width: 0; padding-inline: 10px; }
  &__preview-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-block-end: 16px; }
  &__devices { display: flex; gap: 4px; }
  &__device.sd-modern-icon-button { --sd-modern-icon-button-size: 30px; }
  &__device[aria-pressed="true"] { background: rgb(var(--v-theme-surface)); box-shadow: var(--sd-modern-selected-shadow); }
  &__preview-stage { display: flex; justify-content: center; align-items: flex-start; flex: 1; min-width: 0; }
  // The storefront's Light/Dark controls own these sample surfaces, independently of the dashboard theme.
  &__store { width: 100%; overflow: hidden; border: 1px solid var(--sd-modern-border); border-radius: 14px; background: #fff; color: #20242c; box-shadow: 0 10px 26px rgba(var(--v-theme-on-surface), .04); }
  &__store--mobile { max-width: 265px; }
  &__store-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 14px; color: var(--preview-header-ink); background: var(--preview-header); }
  &__identity { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 12px; font-weight: 500; line-height: 18px; }
  &__identity > span { overflow-wrap: anywhere; }
  &__store-icons { display: flex; flex: 0 0 auto; gap: 12px; }
  &__store-body { padding: 15px; background: var(--preview-backdrop); }
  &__filter { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-block-end: 12px; padding: 9px 12px; border-radius: 8px; background: var(--preview-filter); color: var(--preview-filter-ink); font-size: 11px; line-height: 16px; }
  &__product { overflow: hidden; border-radius: 10px; background: #fff; color: #20242c; }
  &__product-image { position: relative; display: flex; align-items: center; justify-content: center; min-height: 130px; background: #f2f1ef; color: #8c8b85; }
  &__product-image > span { position: absolute; inset-block-end: 8px; inset-inline: 10px; color: #6c6c66; font-size: 10px; line-height: 15px; letter-spacing: .8px; text-align: center; text-transform: uppercase; }
  &__product-content { padding: 14px; }
  &__product-kicker { display: block; color: #6d737b; font-size: 10px; line-height: 15px; letter-spacing: .9px; text-transform: uppercase; }
  &__product-content h4 { margin: 4px 0 9px; font-size: 14px; font-weight: 500; line-height: 21px; }
  &__product-price { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-block-end: 13px; font-size: 12px; line-height: 18px; }
  &__product-price > span { color: #6d737b; font-size: 11px; line-height: 16px; }
  &__store-button { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; padding: 8px; border-radius: 8px; background: var(--preview-button); color: var(--preview-button-ink); font-size: 11px; font-weight: 500; line-height: 18px; }
  &__checkout { margin-block-start: 12px; padding: 12px; border-radius: 10px; background: var(--preview-checkout); color: var(--preview-checkout-ink); font-size: 11px; line-height: 17px; }
  &__checkout-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-block-end: 8px; font-weight: 500; }
  &__total { margin-block-start: 5px; padding-block-start: 8px; border-block-start: 1px solid currentColor; font-weight: 500; }
  &__store-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 12px 14px; background: var(--preview-footer); color: var(--preview-footer-ink); font-size: 11px; line-height: 16px; }
  &__store-link { color: var(--preview-link); font-weight: 500; }
  &__preview-note { display: flex; align-items: flex-start; gap: 6px; margin: 12px 2px 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  &__preview-note > .v-icon { margin-block-start: 2px; }

  @media (max-width: 960px) {
    &__settings.sd-modern-widget { padding: 22px; }
    &__workspace { gap: 22px; }
    &__preview { padding-inline: 0; }
    &__appearance { grid-template-columns: minmax(0, 1fr); }
  }

  @media (max-width: 700px) {
    &__workspace { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    &__appearance { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &__preview-stage { flex: none; }
    &__store { max-width: 410px; }
    &__store--mobile { max-width: 265px; }
  }

  @media (max-width: 420px) {
    &__settings.sd-modern-widget { padding: 20px; }
    &__appearance { grid-template-columns: minmax(0, 1fr); }
  }

  @media (pointer: coarse) {
    &__device.sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
    &__selector :deep(> .v-btn) { width: 44px; height: 44px; }
  }
}
</style>

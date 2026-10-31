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
            force-show-all
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
              @change="onPaletteChange(color.event)"
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

        <p class="b-theme-colors__preview-context">{{ $t('shop_theme.studio.preview_context') }}</p>
        <div class="b-theme-colors__preview-stage" aria-hidden="true">
          <div class="b-theme-colors__store" :class="{ 'b-theme-colors__store--mobile': previewDevice === 'mobile' }" :style="previewStyles">
            <div class="b-theme-colors__browser-bar">
              <div class="b-theme-colors__browser-dots"><i /><i /><i /></div>
              <div class="b-theme-colors__browser-address"><v-icon size="12">lock_outline</v-icon>{{ $t('shop_theme.studio.sample_storefront') }}</div>
              <span class="b-theme-colors__browser-spacer" />
            </div>
            <!-- Keep the storefront's chosen colors independent of dashboard Smart invert. -->
            <div class="b-theme-colors__store-viewport no-inv">
            <!-- Header -->
            <div class="b-theme-colors__announcement">{{ $t('shop_theme.studio.miniature.announcement') }}</div>
            <div class="b-theme-colors__store-header">
              <div class="b-theme-colors__identity">
                <v-avatar size="16">
                  <v-img v-if="shop.icon" :src="getShopImagePath(shop.icon, 128)" :alt="shop.title" />
                  <v-icon v-else size="13" aria-hidden="true">storefront</v-icon>
                </v-avatar>
                <span>{{ shop.title }}</span>
              </div>
              <div class="b-theme-colors__store-nav">
                <span>{{ $t('shop_theme.studio.miniature.shop') }}</span>
                <span>{{ $t('shop_theme.studio.miniature.collections') }}</span>
                <span>{{ $t('shop_theme.studio.miniature.story') }}</span>
              </div>
              <div class="b-theme-colors__store-icons" aria-hidden="true">
                <v-icon class="b-theme-colors__mobile-menu" size="12">menu</v-icon>
                <v-icon size="12">search</v-icon>
                <v-icon size="12">shopping_bag</v-icon>
                <span class="b-theme-colors__bag-count">1</span>
              </div>
            </div>

            <!-- Content -->
            <div class="b-theme-colors__store-body">
              <div class="b-theme-colors__filter">
                <span>{{ $t('shop_theme.studio.all_categories') }}</span>
                <span>{{ $t('shop_theme.studio.sample_collection') }}</span>
                <v-icon size="10" aria-hidden="true">tune</v-icon>
              </div>
              <div class="b-theme-colors__store-editorial">
              <div class="b-theme-colors__product">
                <div class="b-theme-colors__product-image">
                  <svg class="b-theme-colors__product-art" viewBox="0 0 400 260" fill="none" focusable="false">
                    <defs>
                      <linearGradient :id="`${previewId}-canvas`" x1="116" y1="95" x2="277" y2="224" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#f8eedb" /><stop offset=".48" stop-color="#e6d1aa" /><stop offset="1" stop-color="#c4a679" />
                      </linearGradient>
                      <linearGradient :id="`${previewId}-side`" x1="256" y1="104" x2="289" y2="210" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#c8ac80" /><stop offset="1" stop-color="#9f7d52" />
                      </linearGradient>
                      <linearGradient :id="`${previewId}-handle`" x1="150" y1="35" x2="244" y2="115" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#a17b50" /><stop offset=".5" stop-color="#60462e" /><stop offset="1" stop-color="#977047" />
                      </linearGradient>
                      <radialGradient :id="`${previewId}-shadow`"><stop stop-color="#5e4933" stop-opacity=".27" /><stop offset="1" stop-color="#5e4933" stop-opacity="0" /></radialGradient>
                      <pattern :id="`${previewId}-weave`" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 .5H5M.5 0V5" stroke="#fff" stroke-opacity=".16" stroke-width=".7" /></pattern>
                    </defs>
                    <circle class="b-theme-colors__art-halo" cx="200" cy="129" r="102" />
                    <ellipse class="b-theme-colors__art-shadow" cx="202" cy="232" rx="123" ry="19" :fill="`url(#${previewId}-shadow)`" />
                    <g class="b-theme-colors__bag">
                    <g :id="`${previewId}-tote`">
                      <path d="M167 109V71C167 24 248 24 248 71V111" stroke="#b99a70" stroke-width="10" stroke-linecap="round" />
                      <path d="M260 93L282 108L294 208Q278 224 249 226L242 110Z" :fill="`url(#${previewId}-side)`" />
                      <path d="M124 94Q192 81 263 96L278 207Q277 224 256 228Q195 239 133 222Q116 218 116 203Z" :fill="`url(#${previewId}-canvas)`" />
                      <path d="M124 94Q192 81 263 96L278 207Q277 224 256 228Q195 239 133 222Q116 218 116 203Z" :fill="`url(#${previewId}-weave)`" />
                      <path d="M126 99Q194 88 261 101" stroke="#fff8e8" stroke-opacity=".75" stroke-width="3" />
                      <path d="M149 112V67C149 24 230 24 230 67V114" :stroke="`url(#${previewId}-handle)`" stroke-width="10" stroke-linecap="round" />
                      <path d="M145 106V133M226 108V135" stroke="#967048" stroke-width="10" stroke-linecap="round" />
                      <path d="M151 139L230 143L229 192Q190 202 153 190Z" fill="#e5cfa8" stroke="#c6ac84" stroke-width="1.2" />
                      <path d="M156 145L225 149M157 187Q191 198 225 189" stroke="#fbefd8" stroke-width="1.2" stroke-dasharray="2 3" />
                      <rect x="177" y="155" width="28" height="16" rx="3" fill="#9c7952" />
                      <path d="M185 163H197" stroke="#e8d6b7" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M128 112L125 201Q126 211 137 214" stroke="#fff8e8" stroke-opacity=".5" stroke-width="2" />
                    </g>
                    </g>
                  </svg>
                  <span class="b-theme-colors__material-label"><span />{{ $t('shop_theme.studio.preview_material') }}</span>
                </div>
                <div class="b-theme-colors__product-content">
                  <span class="b-theme-colors__collection-label">{{ $t('shop_theme.studio.sample_collection') }}</span>
                  <h4>{{ $t('shop_theme.studio.miniature.hero_title') }}</h4>
                  <p class="b-theme-colors__hero-copy">{{ $t('shop_theme.studio.miniature.hero_copy') }}</p>
                  <div class="b-theme-colors__store-button">
                    {{ $t('shop_theme.studio.miniature.explore') }}
                    <v-icon size="10" aria-hidden="true">{{ $t('icons.chevron_next') }}</v-icon>
                  </div>
                </div>
              </div>

              <div class="b-theme-colors__catalog-heading">
                <span>{{ $t('shop_theme.studio.miniature.featured') }}</span>
                <span class="b-theme-colors__store-link">{{ $t('shop_theme.studio.miniature.view_all') }} <v-icon size="9">{{ $t('icons.chevron_next') }}</v-icon></span>
              </div>
              <div class="b-theme-colors__catalog">
                <div class="b-theme-colors__catalog-product">
                  <div class="b-theme-colors__catalog-image">
                    <svg viewBox="75 10 250 245" fill="none" focusable="false"><use :href="`#${previewId}-tote`" /></svg>
                    <span class="b-theme-colors__quick-add"><v-icon size="10">add</v-icon></span>
                  </div>
                  <span class="b-theme-colors__catalog-name">{{ $t('shop_theme.studio.sample_product') }}</span>
                  <div class="b-theme-colors__catalog-meta"><u-price :amount="2900" /><div class="b-theme-colors__swatches"><i /><i /><i /></div></div>
                </div>
                <div class="b-theme-colors__catalog-product">
                  <div class="b-theme-colors__catalog-image b-theme-colors__catalog-image--sage">
                    <svg viewBox="0 0 120 100" fill="none" focusable="false">
                      <ellipse cx="60" cy="87" rx="35" ry="5" fill="#526b5b" opacity=".13" />
                      <path d="M58 46H64V82H58Z" fill="#6e8377" />
                      <ellipse cx="61" cy="82" rx="22" ry="5" fill="#8fa497" />
                      <path d="M26 50C26 8 95 8 95 50Z" fill="#81998b" />
                      <path d="M26 50C26 13 64 10 66 17C40 19 39 37 39 50Z" fill="#a6b9ad" />
                      <ellipse cx="60.5" cy="50" rx="34.5" ry="5" fill="#617a6b" />
                      <ellipse cx="60.5" cy="50" rx="23" ry="2.5" fill="#e8e2cf" />
                    </svg>
                    <span class="b-theme-colors__quick-add"><v-icon size="10">add</v-icon></span>
                  </div>
                  <span class="b-theme-colors__catalog-name">{{ $t('shop_theme.studio.miniature.lamp') }}</span>
                  <div class="b-theme-colors__catalog-meta"><u-price :amount="1800" /><div class="b-theme-colors__swatches"><i /><i /></div></div>
                </div>
                <div class="b-theme-colors__catalog-product">
                  <div class="b-theme-colors__catalog-image b-theme-colors__catalog-image--clay">
                    <svg viewBox="0 0 120 100" fill="none" focusable="false">
                      <ellipse cx="59" cy="86" rx="36" ry="5" fill="#775a40" opacity=".13" />
                      <path d="M75 33H85C107 33 105 64 77 64" stroke="#b29472" stroke-width="10" />
                      <path d="M28 29H79L74 75Q53 89 33 75Z" fill="#cbb396" />
                      <path d="M28 29H40L43 80Q35 79 33 75Z" fill="#e1cdb4" />
                      <ellipse cx="53.5" cy="29" rx="25.5" ry="7" fill="#eadcc9" />
                      <ellipse cx="53.5" cy="29" rx="20" ry="4" fill="#9b7b5c" />
                    </svg>
                    <span class="b-theme-colors__quick-add"><v-icon size="10">add</v-icon></span>
                  </div>
                  <span class="b-theme-colors__catalog-name">{{ $t('shop_theme.studio.miniature.cup') }}</span>
                  <div class="b-theme-colors__catalog-meta"><u-price :amount="600" /><div class="b-theme-colors__swatches"><i /><i /></div></div>
                </div>
              </div>
              </div>

              <div class="b-theme-colors__store-bottom">
              <div class="b-theme-colors__story">
                <v-icon size="16">eco</v-icon>
                <h4>{{ $t('shop_theme.studio.miniature.story_title') }}</h4>
                <p>{{ $t('shop_theme.studio.miniature.story_copy') }}</p>
                <span><v-icon size="10">inventory_2</v-icon>{{ $t('shop_theme.studio.miniature.packed') }}</span>
              </div>
              <div class="b-theme-colors__checkout">
                <div class="b-theme-colors__checkout-heading">
                  <span>{{ $t('shop_theme.studio.order_summary') }}</span>
                  <v-icon size="10" aria-hidden="true">receipt_long</v-icon>
                </div>
                <div class="b-theme-colors__checkout-item"><span>{{ $t('shop_theme.studio.sample_product') }}</span><span>× 1</span></div>
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
            </div>

            <!-- Footer -->
            <div class="b-theme-colors__store-footer">
              <div class="b-theme-colors__footer-brand"><span>{{ shop.title }}</span><span>{{ $t('shop_theme.studio.miniature.footer_line') }}</span></div>
              <div class="b-theme-colors__footer-nav"><span>{{ $t('shop_theme.studio.miniature.shop') }}</span><span>{{ $t('shop_theme.studio.miniature.story') }}</span><span>© {{ shop.title }}</span></div>
              <span class="b-theme-colors__store-link">{{ $t('shop_theme.studio.contact_us') }}</span>
            </div>
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
import { defineComponent, useId } from "vue";
import chroma from "chroma-js";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import UTextValueDashed from "./../../../../ui/text/value-dashed/UTextValueDashed.vue";
import UColorSelector from "./../../../../ui/color/selector/UColorSelector.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default defineComponent({
  name: "BShopThemeColors",
  mixins: [TemplateMixin],
  components: { UColorSelector, UTextValueDashed, USmartSwitch },
  setup() {
    return { previewId: useId() };
  },
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
        { value: this.lightHeader !== false, title: "shop_theme.studio.header", event: "update:lightHeader" },
        { value: this.lightFooter !== false, title: "shop_theme.studio.footer", event: "update:lightFooter" },
        { value: !!this.lightCheckout, title: "shop_theme.studio.checkout", event: "update:lightCheckout" },
        { value: !!this.lightFilter, title: "shop_theme.studio.category_filter", event: "update:lightFilter" },
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
      const header = this.lightHeader !== false ? "#ffffff" : this.colorDark || this.ThemeColorDark;
      const footer = this.lightFooter !== false ? "#ffffff" : this.colorDeepDark || this.ThemeColorDeepDark;
      const checkout = this.lightCheckout ? "#f6f7f9" : this.colorBill || this.ThemeColorDeepDark;
      const filter = this.lightFilter ? "#fafafa" : this.colorDeepDark || this.ThemeColorDeepDark;
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
    onPaletteChange(event: string) {
      if (this.readOnly) return;
      // A chosen background must also be enabled in the storefront draft.
      if (event === "update:colorDark") this.$emit("update:lightHeader", false);
      else if (event === "update:colorBill") this.$emit("update:lightCheckout", false);
    },
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
  &__preview-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-block-end: 7px; }
  &__preview-context { margin: 0 0 16px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }
  &__devices { display: flex; gap: 4px; }
  &__device.sd-modern-icon-button { --sd-modern-icon-button-size: 30px; }
  &__device[aria-pressed="true"] { background: rgb(var(--v-theme-surface)); box-shadow: var(--sd-modern-selected-shadow); }
  &__preview-stage { display: flex; justify-content: center; align-items: flex-start; flex: 1; min-width: 0; padding: 16px 12px 22px; border-radius: 26px; background: rgba(var(--v-theme-on-surface), .035); }
  &__store { width: 100%; min-width: 0; padding: 7px; border: 1px solid var(--sd-modern-border); border-radius: 23px; background: rgb(var(--v-theme-surface)); box-shadow: 0 18px 35px -18px rgba(var(--v-theme-on-surface), .25), 0 3px 8px rgba(var(--v-theme-on-surface), .04); transition: max-width 220ms ease; }
  &__browser-bar { display: flex; align-items: center; gap: 12px; min-height: 31px; padding: 0 5px 7px; color: var(--sd-modern-muted); }
  &__browser-dots { display: flex; gap: 4px; flex: 0 0 30px; }
  &__browser-dots i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .35; }
  &__browser-address { display: flex; align-items: center; justify-content: center; gap: 5px; flex: 1; min-width: 0; padding: 3px 8px; border-radius: 6px; background: rgba(var(--v-theme-on-surface), .04); font-size: 10px; line-height: 15px; }
  &__browser-spacer { flex: 0 0 30px; }
  // The storefront's Light/Dark choices own these surfaces, rather than the dashboard theme.
  // Only the inert storefront is miniature; the actual editor and device controls retain their normal size.
  &__store-viewport { overflow: hidden; border-radius: 15px; background: #fff; color: #20242c; font-size: 9px; line-height: 1.4; }
  &__store--mobile { max-width: 286px; padding: 6px; border-radius: 34px; }
  &__store--mobile &__browser-bar { justify-content: center; min-height: 24px; padding: 2px 0 7px; }
  &__store--mobile &__browser-bar::before { content: ''; width: 54px; height: 6px; border-radius: 8px; background: rgba(var(--v-theme-on-surface), .22); }
  &__store--mobile &__browser-dots, &__store--mobile &__browser-address, &__store--mobile &__browser-spacer { display: none; }
  &__store--mobile &__store-viewport { border-radius: 26px; }
  &__announcement { padding: 5px 10px; background: var(--preview-header); color: var(--preview-header-ink); font-size: 7px; line-height: 10px; letter-spacing: .6px; text-align: center; border-block-end: 1px solid color-mix(in srgb, var(--preview-header-ink) 8%, transparent); }
  &__store-header { display: flex; align-items: center; justify-content: space-between; gap: 9px; min-height: 39px; padding: 9px 12px; color: var(--preview-header-ink); background: var(--preview-header); }
  &__identity { display: flex; align-items: center; gap: 5px; min-width: 0; font-size: 10px; font-weight: 500; line-height: 14px; }
  &__identity > span { max-width: 100px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  &__store-nav { display: flex; align-items: center; justify-content: center; gap: 11px; font-size: 7px; line-height: 11px; }
  &__store-nav > span { white-space: nowrap; }
  &__store-icons { display: flex; align-items: center; flex: 0 0 auto; gap: 7px; }
  &__bag-count { display: grid; place-items: center; width: 11px; height: 11px; border-radius: 50%; background: var(--preview-button); color: var(--preview-button-ink); font-size: 6px; line-height: 1; margin-inline-start: -4px; }
  &__store-icons &__mobile-menu { display: none; }
  &__store-body { padding: 8px; background: var(--preview-backdrop); }
  &__filter { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-block-end: 7px; padding: 7px 9px; border-radius: 5px; background: var(--preview-filter); color: var(--preview-filter-ink); font-size: 7px; line-height: 10px; }
  &__filter > :nth-child(2) { margin-inline-start: auto; opacity: .65; }
  &__store-editorial { padding: 9px; border-radius: 9px; background: #fff; color: #252822; }
  &__product { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-height: 166px; overflow: hidden; border-radius: 6px; background: #f3f0e9; }
  &__product-image { position: relative; order: 2; display: grid; place-items: center; min-width: 0; }
  &__product-art { display: block; width: 100%; max-width: 260px; height: 166px; overflow: visible; }
  &__art-halo { fill: color-mix(in srgb, var(--preview-button) 9%, #fff); }
  &__collection-label { color: #756e63; font-size: 6px; line-height: 10px; letter-spacing: .8px; text-transform: uppercase; }
  &__material-label { position: absolute; inset-block-end: 9px; inset-inline-end: 9px; display: flex; align-items: center; gap: 4px; color: #756e63; font-size: 6px; line-height: 9px; }
  &__material-label > span { width: 4px; height: 4px; border-radius: 50%; background: #b99a70; }
  &__bag { transform-origin: 200px 132px; animation: b-theme-colors-product-arrive 2.6s cubic-bezier(.2, .7, .2, 1) both; }
  &__art-shadow { transform-origin: 202px 232px; animation: b-theme-colors-shadow-arrive 2.6s ease-out both; }
  &__product-content { order: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; min-width: 0; padding: 16px; }
  &__product-content h4 { margin: 7px 0; font-size: 22px; font-weight: 500; line-height: 1.02; letter-spacing: -.8px; overflow-wrap: anywhere; }
  &__hero-copy { margin: 0 0 11px; color: #756e63; font-size: 8px; line-height: 12px; }
  &__swatches { display: flex; align-items: center; flex-shrink: 0; gap: 3px; }
  &__swatches i { width: 4px; height: 4px; border-radius: 50%; background: #c7af89; }
  &__swatches i:nth-child(2) { background: #68796e; }
  &__swatches i:nth-child(3) { background: #343b3d; }
  &__store-button { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 23px; padding: 6px 9px; border-radius: 4px; background: var(--preview-button); color: var(--preview-button-ink); font-size: 7px; font-weight: 500; line-height: 10px; }
  &__catalog-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-block: 13px 7px; font-size: 10px; font-weight: 500; line-height: 14px; }
  &__catalog-heading > :last-child { display: flex; align-items: center; gap: 4px; font-size: 7px; font-weight: 400; }
  &__catalog { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
  &__catalog-product { min-width: 0; }
  &__catalog-image { display: grid; place-items: center; position: relative; height: 74px; border-radius: 5px; background: #f3eee5; }
  &__catalog-image--sage { background: #e8ede8; }
  &__catalog-image--clay { background: #f0e4d7; }
  &__catalog-image > svg { width: 78%; height: 68px; }
  &__quick-add { display: grid; place-items: center; position: absolute; inset-inline-end: 5px; inset-block-end: 5px; width: 16px; height: 16px; border-radius: 50%; background: var(--preview-button); color: var(--preview-button-ink); }
  &__catalog-name { display: block; margin-block-start: 5px; font-size: 8px; font-weight: 500; line-height: 11px; overflow-wrap: anywhere; }
  &__catalog-meta { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 3px; margin-block-start: 3px; color: #767b72; font-size: 7px; line-height: 10px; }
  &__store-viewport :deep(.u--price), &__store-viewport :deep(.u--price .small) { font-size: inherit !important; line-height: inherit; font-weight: inherit; }
  &__store-bottom { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: stretch; gap: 8px; margin-block-start: 8px; }
  &__story { display: flex; flex-direction: column; align-items: flex-start; padding: 11px; border-radius: 8px; background: #ebece2; color: #4e5848; }
  &__story > .v-icon { color: #809473; margin-block-end: 6px; }
  &__story h4 { max-width: 120px; margin: 0 0 5px; font-size: 13px; font-weight: 500; line-height: 14px; letter-spacing: -.2px; }
  &__story p { margin: 0 0 10px; font-size: 7px; line-height: 11px; }
  &__story > span { display: flex; align-items: center; gap: 4px; margin-block-start: auto; font-size: 6px; line-height: 10px; }
  &__checkout { min-width: 0; padding: 10px; border-radius: 8px; background: var(--preview-checkout); color: var(--preview-checkout-ink); font-size: 7px; line-height: 11px; }
  &__checkout-heading { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-block-end: 7px; font-size: 9px; font-weight: 500; line-height: 12px; }
  &__checkout-item { display: flex; justify-content: space-between; gap: 5px; margin-block-end: 5px; padding-block-end: 6px; border-block-end: 1px solid color-mix(in srgb, var(--preview-checkout-ink) 10%, transparent); }
  &__checkout :deep(.s--value-dashed) { gap: 3px; padding-block: 2px; font-size: inherit; line-height: inherit; }
  &__total { margin-block-start: 3px; padding-block-start: 5px !important; border-block-start: 1px solid color-mix(in srgb, var(--preview-checkout-ink) 20%, transparent); font-weight: 500; }
  &__store-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px; background: var(--preview-footer); color: var(--preview-footer-ink); font-size: 7px; line-height: 11px; }
  &__footer-brand { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  &__footer-brand > :first-child { font-size: 10px; font-weight: 500; overflow-wrap: anywhere; }
  &__footer-brand > :last-child { font-size: 6px; opacity: .6; }
  &__footer-nav { display: flex; flex-direction: column; gap: 3px; font-size: 6px; }
  &__store-link { color: var(--preview-link); font-weight: 500; }
  &__store--mobile &__store-header { padding-inline: 10px; }
  &__store--mobile &__store-nav { display: none; }
  &__store--mobile &__mobile-menu { display: inline-flex; }
  &__store--mobile &__product-content { padding: 12px 10px; }
  &__store--mobile &__product-content h4 { font-size: 17px; letter-spacing: -.5px; }
  &__store--mobile &__collection-label { font-size: 5px; letter-spacing: .3px; }
  &__store--mobile &__material-label { font-size: 5px; }
  &__store--mobile &__hero-copy { font-size: 7px; line-height: 10px; }
  &__store--mobile &__store-button { padding-inline: 6px; font-size: 6px; }
  &__store--mobile &__catalog-name { font-size: 7px; }
  &__store--mobile &__story { padding: 9px; }
  &__store--mobile &__story h4 { font-size: 11px; line-height: 12px; }
  &__store--mobile &__checkout { padding: 8px; }
  &__store--mobile &__checkout-heading { font-size: 8px; }
  &__store--mobile &__store-footer { padding: 11px; gap: 7px; }
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
    &__store--mobile { max-width: 286px; }
  }

  @media (max-width: 420px) {
    &__settings.sd-modern-widget { padding: 20px; }
    &__appearance { grid-template-columns: minmax(0, 1fr); }
  }

  @media (pointer: coarse) {
    &__device.sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
    &__selector :deep(> .v-btn) { width: 44px; height: 44px; }
  }

  @media (prefers-reduced-motion: reduce) {
    &__bag, &__art-shadow { animation: none; }
    &__store { transition: none; }
  }
}

@keyframes b-theme-colors-product-arrive {
  from { opacity: 0; transform: translateY(14px) rotate(-6deg); }
  65% { opacity: 1; transform: translateY(-3px) rotate(1deg); }
  to { opacity: 1; transform: translateY(0) rotate(0); }
}
@keyframes b-theme-colors-shadow-arrive {
  from { opacity: .2; transform: scaleX(.8); }
  to { opacity: 1; transform: scaleX(1); }
}
</style>

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
  <div v-if="modern" class="b-checkout-modern text-start">
    <u-loading-progress v-if="busy"></u-loading-progress>

    <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Login first / last ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
    <section class="sd-modern-widget b-checkout-modern__widget">
      <div class="b-checkout-modern__heading">
        <v-icon class="b-checkout-modern__heading-icon">route</v-icon>
        <div class="b-checkout-modern__heading-copy">
          <h2 class="sd-modern-title-text">{{ $t('shop_configuration.flow_modern.checkout.journey_title') }}</h2>
          <div class="b-checkout-modern__subtitle">
            <span>{{ $t('shop_configuration.flow_modern.checkout.journey_subtitle') }}</span>
            <v-tooltip content-class="sd-modern-tooltip text-start" location="top" max-width="340" open-on-click>
              <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('shop_configuration.flow_modern.checkout.journey_help_label')"><v-icon>info_outline</v-icon></v-btn></template>
              {{ $t('shop_configuration.flow_modern.checkout.journey_help') }}
            </v-tooltip>
          </div>
        </div>
        <span class="b-checkout-modern__autosave"><span></span>{{ $t('shop_configuration.flow_modern.checkout.autosave') }}</span>
      </div>
      <div class="b-checkout-modern__split">
        <div>
          <p class="b-checkout-modern__label">{{ $t('shop_configuration.flow_modern.checkout.when_sign_in') }}</p>
          <u-smart-select
            v-model="mode"
            :disabled="busy || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
            :items="modernLoginModes"
            class="b-checkout-modern__choices"
            accessible
            force-show-all
            item-description="description"
            item-text="title"
            item-value="id"
            :aria-label="$t('shop_configuration.flow_modern.checkout.when_sign_in')"
            @update:model-value="(val) => setOptionCheckout('mode', val)"
          ></u-smart-select>
        </div>
        <div class="b-checkout-modern__detail">
          <p class="sd-modern-eyebrow b-checkout-modern__eyebrow">{{ $t('shop_configuration.flow_modern.checkout.customer_journey') }}</p>
          <b-shop-options-checkout-mode-pods :mode="mode" :shop="shop" modern></b-shop-options-checkout-mode-pods>
          <p class="b-checkout-modern__caption">{{ $t(modernLoginModes.find(item => item.id === mode)?.description || '') }}</p>
        </div>
      </div>
    </section>

    <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Shipping address and map ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
    <section class="sd-modern-widget b-checkout-modern__widget">
      <div class="b-checkout-modern__heading">
        <v-icon class="b-checkout-modern__heading-icon">place</v-icon>
        <div class="b-checkout-modern__heading-copy">
          <h2 class="sd-modern-title-text">{{ $t('shop_configuration.flow_modern.checkout.shipping_title') }}</h2>
          <div class="b-checkout-modern__subtitle">
            <span>{{ $t('shop_configuration.flow_modern.checkout.shipping_subtitle') }}</span>
            <v-tooltip content-class="sd-modern-tooltip text-start" location="top" max-width="340" open-on-click>
              <template #activator="{ props }"><v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('shop_configuration.flow_modern.checkout.shipping_help_label')"><v-icon>info_outline</v-icon></v-btn></template>
              {{ $t('shop_configuration.flow_modern.checkout.shipping_help') }}
            </v-tooltip>
          </div>
        </div>
      </div>
      <div class="b-checkout-modern__split">
        <div>
          <p class="b-checkout-modern__label">{{ $t('shop_configuration.flow_modern.checkout.ask_address') }}</p>
          <u-smart-select
            v-model="shipping"
            :disabled="busy || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
            :items="modernShippingOptions"
            class="b-checkout-modern__choices"
            accessible
            item-description="desc"
            item-icon="icon"
            item-text="title"
            item-value="value"
            :aria-label="$t('shop_configuration.flow_modern.checkout.ask_address')"
            @update:model-value="(val) => (val ? setOptionCheckout('shipping', val) : undefined)"
          ></u-smart-select>
          <p class="b-checkout-modern__caption">{{ $t('shop_configuration.flow_modern.checkout.expand_shipping') }}</p>
          <div class="b-checkout-modern__section-gap">
          <p class="b-checkout-modern__label">{{ $t('shop_configuration.flow_modern.checkout.delivery_location') }}</p>
          <u-smart-switch
            v-model="map"
            :disabled="busy || shipping === 'off' || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
            :true-title="$t('shop_configuration.flow_modern.checkout.map_title')"
            :true-description="$t('shop_configuration.flow_modern.checkout.map_description')"
            :false-title="$t('shop_configuration.flow_modern.checkout.manual_title')"
            :false-description="$t('shop_configuration.flow_modern.checkout.manual_description')"
            true-icon="map"
            false-icon="edit_location_alt"
            class="b-checkout-modern__choices"
            accessible
            :aria-label="$t('shop_configuration.flow_modern.checkout.delivery_location')"
            @change="(val) => setOptionCheckout('map', val)"
          ></u-smart-switch>
          <p v-if="shipping === 'off'" class="b-checkout-modern__caption">{{ $t('shop_configuration.flow_modern.checkout.map_disabled') }}</p>
          </div>
        </div>
        <div class="b-checkout-modern__detail">
          <p class="sd-modern-eyebrow b-checkout-modern__eyebrow">{{ $t('shop_configuration.flow_modern.checkout.delivery_flow') }}</p>
          <b-shop-options-checkout-map-pods :map="map" :shop="shop" modern></b-shop-options-checkout-map-pods>
          <b-shop-checkout-delivery-preview :shipping="shipping" :map="map" />
        </div>
      </div>
    </section>

    <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ After add to cart ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
    <section class="sd-modern-widget b-checkout-modern__widget">
      <div class="b-checkout-modern__heading">
        <v-icon class="b-checkout-modern__heading-icon">shopping_bag</v-icon>
        <div class="b-checkout-modern__heading-copy">
          <h2 class="sd-modern-title-text">{{ $t('shop_configuration.flow_modern.checkout.cart_title') }}</h2>
          <p class="b-checkout-modern__subtitle">{{ $t('shop_configuration.flow_modern.checkout.cart_subtitle') }}</p>
        </div>
      </div>
      <div class="b-checkout-modern__split">
        <div>
      <p class="b-checkout-modern__label">{{ $t('shop_configuration.flow_modern.checkout.next_step') }}</p>
      <!-- Keep the normal shopping option first in the shared true/false control. -->
      <u-smart-switch
        :model-value="!express"
        :disabled="busy || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
        :true-description="$t('shop_configuration.flow_modern.checkout.continue_description')"
        :true-title="$t('shop_configuration.flow_modern.checkout.continue_title')"
        :false-description="$t('shop_configuration.flow_modern.checkout.express_description')"
        :false-title="$t('shop_configuration.flow_modern.checkout.express_title')"
        true-icon="shopping_bag"
        false-icon="arrow_forward"
        class="b-checkout-modern__choices"
        accessible
        :aria-label="$t('shop_configuration.flow_modern.checkout.next_step')"
        @update:model-value="(val) => { express = !val; setOptionCheckout('express', !val); }"
      ></u-smart-switch>
        </div>
        <div class="b-checkout-modern__detail">
          <p class="sd-modern-eyebrow b-checkout-modern__eyebrow">{{ $t('shop_configuration.flow_modern.checkout.customer_journey') }}</p>
          <b-shop-checkout-flow-diagram :steps="modernCartSteps" :emphasis="express ? 'checkout' : 'browse'" />
        </div>
      </div>
    </section>
  </div>
  <div v-else class="widget-box mb-5">
    <u-widget-header
      :title="$t('shop_configuration.checkout.title')"
      icon="shopping_cart"
    >
    </u-widget-header>
    <v-list-subheader>
      {{ $t("shop_configuration.checkout.subtitle") }}
    </v-list-subheader>

    <u-loading-progress v-if="busy"></u-loading-progress>

    <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Login first / last ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
    <u-smart-select
      v-model="mode"
      :disabled="busy || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
      :items="LoginModes"
      :label="$t('shop_configuration.checkout.mode.title')"
      class="my-5"
      force-show-all
      item-description="description"
      item-icon="icon"
      item-text="title"
      item-value="id"
      @update:model-value="(val) => setOptionCheckout('mode', val)"
    >
    </u-smart-select>

    <b-shop-options-checkout-mode-pods
      :mode="mode"
      :shop="shop"
      class="mx-n3"
    ></b-shop-options-checkout-mode-pods>

    <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Config ask shipping address ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->
    <u-smart-select
      v-model="shipping"
      :disabled="busy || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
      :items="ShippingOptions"
      :label="$t('shop_configuration.checkout.shipping_address.title')"
      class="mt-5"
      item-description="desc"
      item-icon="icon"
      item-text="title"
      item-value="value"
      @update:model-value="
        (val) => (val ? setOptionCheckout('shipping', val) : undefined)
      "
    >
    </u-smart-select>

    <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Map ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->

    <u-smart-switch
      v-model="map"
      :class="{ disabled: shipping === 'off' }"
      :disabled="busy || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
      :false-description="$t('shop_configuration.checkout.map.subtitle_no_map')"
      :false-title="$t('global.commons.disable')"
      :label="$t('shop_configuration.checkout.map.title')"
      :true-description="$t('shop_configuration.checkout.map.subtitle')"
      :true-title="$t('global.commons.enable')"
      false-icon="close"
      true-icon="map"
      @change="(val) => setOptionCheckout('map', val)"
    >
    </u-smart-switch>

    <b-shop-options-checkout-map-pods
      :map="map"
      :shop="shop"
      class="mx-n3"
    ></b-shop-options-checkout-map-pods>

    <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Config after add to cart action ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->

    <u-smart-switch
      v-model="express"
      :disabled="busy || !writeShopAccess(ShopPermissionRegions.SETTINGS.code)"
      :false-description="$t('shop_configuration.checkout.express.false.msg')"
      :false-title="$t('shop_configuration.checkout.express.false.title')"
      :label="$t('shop_configuration.checkout.express.title')"
      :true-description="$t('shop_configuration.checkout.express.true.msg')"
      :true-title="$t('shop_configuration.checkout.express.true.title')"
      false-icon="adjust"
      true-icon="next_plan"
      @update:model-value="(val) => setOptionCheckout('express', val)"
    ></u-smart-switch>
  </div>
</template>

<script lang="ts">
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import BShopOptionsCheckoutModePods from "../../../shop/options/checkout/mode-pods/BShopOptionsCheckoutModePods.vue";
import BShopOptionsCheckoutMapPods from "../../../shop/options/checkout/map-pods/BShopOptionsCheckoutMapPods.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import BShopCheckoutFlowDiagram from "./flow-diagram/BShopCheckoutFlowDiagram.vue";
import BShopCheckoutDeliveryPreview from "./preview/BShopCheckoutDeliveryPreview.vue";
import {
  LoginModes,
  ShippingOptions,
} from "@selldone/core-js/enums/shop/options/CheckoutOptions";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BShopOptionsCheckout",
  mixins: [],
  components: {
    BShopCheckoutDeliveryPreview,
    BShopCheckoutFlowDiagram,
    USmartSwitch,
    BShopOptionsCheckoutMapPods,
    BShopOptionsCheckoutModePods,
    USmartSelect,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: false,
      type: Object,
    },
  },

  data: () => ({
    LoginModes: LoginModes,
    ShippingOptions: ShippingOptions,

    busy: null,

    map: true,
    mode: "default",
    express: false,
    shipping: "smart",
  }),

  computed: {
    modernCartSteps() {
      return [
        { id: 'page', title: this.$t('shop_configuration.flow_modern.checkout.current_page'), icon: 'web' },
        { id: 'cart', title: this.$t('shop_configuration.flow_modern.checkout.add_to_cart'), icon: 'add_shopping_cart' },
        this.express
          ? { id: 'checkout', title: this.$t('global.commons.checkout'), icon: 'shopping_bag', caption: this.$t('shop_configuration.flow_modern.checkout.automatic_redirect') }
          : { id: 'browse', title: this.$t('shop_configuration.flow_modern.checkout.continue_title'), icon: 'storefront', caption: this.$t('shop_configuration.flow_modern.checkout.same_page') },
      ];
    },
    modernLoginModes() {
      return LoginModes.map(item => ({
        ...item,
        title: `shop_configuration.flow_modern.checkout.timing.${item.id.replace('-', '_')}.title`,
        description: `shop_configuration.flow_modern.checkout.timing.${item.id.replace('-', '_')}.description`,
      }));
    },
    modernShippingOptions() {
      return ShippingOptions.map(item => ({
        ...item,
        title: `shop_configuration.flow_modern.checkout.shipping.${item.value}.title`,
        desc: `shop_configuration.flow_modern.checkout.shipping.${item.value}.description`,
        icon: 'expand_more',
      }));
    },
    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    checkout() {
      return ShopOptionsHelper.GetCheckout(this.shop);
    },
  },
  watch: {
    checkout(checkout) {
      if (!checkout) return;
      this.map = checkout.map;
      this.mode = checkout.mode;
      this.express = checkout.express;
      this.shipping = checkout.shipping ? checkout.shipping : "default";
    },
  },

  created() {
    if (this.checkout) {
      this.map = this.checkout.map;
      this.mode = this.checkout.mode;
      this.express = !!this.checkout.express;
      this.shipping = this.checkout.shipping
        ? this.checkout.shipping
        : "default";
    }
  },
  methods: {
    setOptionCheckout(code, value) {
      this.busy = true;
      axios
        .post(window.API.POST_SET_SHOP_OPTIONS_CHECKOUT(this.shop.id), {
          code: code,
          value: value,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.shop.options = data.options;
            NotificationService.showSuccessAlert(
              null,
              "Checkout settings have been successfully updated.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-checkout-modern {
  min-width: 0;
  font-size: 14px;
  line-height: 1.5;

  &__widget { margin-block-end: 20px; }
  &__heading { display: flex; align-items: flex-start; gap: 12px; margin-block-end: 25px; }
  &__heading-icon { width: 18px; height: 18px; flex: 0 0 18px; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 18px; }
  &__heading-copy { flex: 1; min-width: 0; }
  &__heading .sd-modern-title-text { font-family: inherit; font-size: 18px; font-weight: 600; line-height: 1.4; letter-spacing: -0.15px; }
  &__subtitle { display: flex; align-items: center; gap: 5px; margin: 4px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 1.55; }
  &__autosave { display: flex; align-items: center; gap: 6px; padding-block-start: 6px; color: var(--sd-modern-muted); font-size: 11px; white-space: nowrap; }
  &__autosave > span { flex-shrink: 0; width: 6px; height: 6px; border-radius: 50%; background: rgb(var(--v-theme-success)); }
  &__split { display: grid; grid-template-columns: minmax(260px, .85fr) minmax(0, 1.15fr); gap: 28px; }
  &__split > div { min-width: 0; }
  &__detail { padding-inline-start: 28px; border-inline-start: 1px solid var(--sd-modern-border); }
  &__label { margin: 0 0 12px; font-size: 13px; font-weight: 500; line-height: 1.5; }
  &__eyebrow { margin: 0 0 14px; font-size: 11px; font-weight: 500; line-height: 1.5; letter-spacing: .65px; }
  &__caption { margin: 12px 0 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 1.6; }
  &__section-gap { margin-block-start: 25px; padding-block-start: 25px; border-block-start: 1px solid var(--sd-modern-border); }
  &__choices {
    :deep(.border-between-vertical) { overflow: hidden; border-radius: 14px; background: var(--sd-modern-inset); }
    :deep(.row-hover) { min-height: 76px; padding: 15px 14px !important; background: transparent !important; border-color: var(--sd-modern-border) !important; }
    :deep(.row-hover:last-child) { border-block-end: 0; }
    :deep(.mnh) { min-height: 44px; gap: 7px; }
    :deep(.mnh > .flex-grow-1) { min-width: 0; }
    :deep(.mnh > .flex-grow-1 > b) { font-family: inherit; font-size: 14px; font-weight: 500; line-height: 1.4; }
    :deep(.mnh > .flex-grow-1 > .small) { margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 1.5; opacity: 1; }
    :deep(.mnh > .v-icon:last-child) { font-size: 18px; color: var(--sd-modern-muted); }
    :deep(.avatar-gradient) { flex-shrink: 0; }
    :deep(.circle-check) { width: 20px; height: 20px; }
  }
  @media (max-width: 800px) {
    &__split { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    &__detail { padding-inline-start: 0; padding-block-start: 24px; border-inline-start: 0; border-block-start: 1px solid var(--sd-modern-border); }
    &__heading { flex-wrap: wrap; }
    &__autosave { margin-inline-start: 30px; padding-block-start: 0; }
  }
  @media (max-width: 600px) {
    &__widget { padding: 22px 18px; }
    &__subtitle { align-items: flex-start; }
  }
  @media (max-width: 380px) { &__widget { padding-inline: 12px; } }
}
</style>

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
  <div class="widget-box mb-5">
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
    USmartSwitch,
    BShopOptionsCheckoutMapPods,
    BShopOptionsCheckoutModePods,
    USmartSelect,
  },
  props: {
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

<style scoped></style>

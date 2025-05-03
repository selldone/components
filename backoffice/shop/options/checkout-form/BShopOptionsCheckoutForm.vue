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
  <!--- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Custom Checkout Form ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ --->

  <div class="widget-box mb-5">
    <u-widget-header
      :title="$t('shop_configuration.checkout_form.title')"
      icon="input"
    >
    </u-widget-header>
    <v-list-subheader>
      {{ $t("shop_configuration.checkout_form.subtitle") }}
    </v-list-subheader>

    <s-country-select
      v-model="country"
      clearable
      :label="$t('global.commons.country')"
      :placeholder="$t('global.commons.default') + ' *.*'"
      persistent-placeholder
      :prepend-inner-icon="country ? null : 'public'"
      item-value="alpha2"
      :messages="
        country
          ? `Override the form to show only for ${getCountryName(country)}`
          : 'Default for all countries.'
      "
    ></s-country-select>

    <v-chip v-if="overridden_country_codes.length>0" @click="country = null" class="ma-1" prepend-icon="public" :color="!country?'primary':'#eee'" variant="flat">
      {{$t('global.commons.default')}}
    </v-chip>
    <v-chip v-for="key in overridden_country_codes" @click="country = key" class="ma-1" :color="country===key?'primary':'#eee'" variant="flat">
      <flag :iso="key" :squared="false" class="me-3" />
      <b class="me-1">{{ key }} | </b>
      <small class="d-block mt-1">{{ getCountryName(key) }}</small>

      <v-icon end @click.stop="delectOverrideForm()">cancel</v-icon>
    </v-chip>


    <s-form-builder
      :title="
        `Checkout Form: ` +
        (country ? getCountryName(country) : $t('global.commons.default'))
      "
      v-model:structure="checkout_form"
      class="mb-5"
      @update:structure="changed = true"
      :key="form_key"
      has-required
    >
    </s-form-builder>

    <v-slide-y-reverse-transition>
      <s-widget-buttons v-if="changed" auto-fixed-position>
        <v-btn
          @click="setOptionCheckout(form_key, checkout_form)"
          :loading="busy"
          size="x-large"
          prepend-icon="save"
          variant="elevated"
          color="primary"
        >
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </s-widget-buttons>
    </v-slide-y-reverse-transition>
  </div>
</template>

<script lang="ts">
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import BShopOptionsCheckoutModePods from "../../../shop/options/checkout/mode-pods/BShopOptionsCheckoutModePods.vue";
import BShopOptionsCheckoutMapPods from "../../../shop/options/checkout/map-pods/BShopOptionsCheckoutMapPods.vue";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SFormBuilder from "@selldone/components-vue/ui/form/SFormBuilder.vue";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper";
import SCountrySelect from "@selldone/components-vue/ui/country/select/SCountrySelect.vue";

export default {
  name: "BShopOptionsCheckoutForm",
  mixins: [],
  components: {
    SCountrySelect,
    SWidgetButtons,
    SFormBuilder,
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
    busy: null,

    checkout_form: null,

    changed: false,
    country: null,
  }),

  computed: {
    checkout() {
      return ShopOptionsHelper.GetCheckout(this.shop);
    },
    form_key() {
      if (this.country) {
        return `form_${this.country}`;
      } else {
        return "form";
      }
    },
    overridden_country_codes() {
      const keys_checkout = Object.keys(this.checkout);
      const keys_checkout_form = keys_checkout.filter((key) =>
        key.startsWith("form_"),
      );
      return keys_checkout_form.map((key) => key.replace("form_", ""));
    },
  },
  watch: {
    country() {
      return (this.checkout_form = this.checkout
        ? this.checkout[this.form_key]
        : null);
    },
  },

  created() {
    this.checkout_form = this.checkout?.form;
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
            this.changed = false;
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

    delectOverrideForm(country) {
      NotificationService.openDeleteAlert(() => {
        this.setOptionCheckout(`form_${country}`, null);
        this.country = null;
      });
    },
  },
};
</script>

<style scoped></style>

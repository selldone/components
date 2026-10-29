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

  <div
    :class="
      modern
        ? 'sd-modern-widget flow-checkout-form flow-checkout-form--focused text-start'
        : 'widget-box mb-5'
    "
  >
    <div v-if="modern" class="flow-checkout-form__heading">
      <v-icon
        icon="edit_document"
        size="18"
        class="flow-checkout-form__heading-icon"
      />
      <div class="flow-checkout-form__heading-copy">
        <h2 class="sd-modern-title-text">
          {{ $t("shop_configuration.flow_modern.form.title") }}
        </h2>
        <div class="flow-checkout-form__subtitle">
          <span>{{ $t("shop_configuration.flow_modern.form.subtitle") }}</span
          ><v-tooltip
            :text="$t('shop_configuration.flow_modern.form.help')"
            content-class="sd-modern-tooltip text-start"
            location="top"
            open-on-click
            ><template #activator="{ props }"
              ><v-btn
                v-bind="props"
                class="sd-modern-icon-button sd-modern-info-button"
                :aria-label="
                  $t('shop_configuration.flow_modern.form.help_label')
                "
                icon="info_outline"
                variant="text" /></template
          ></v-tooltip>
        </div>
      </div>
      <v-btn
        class="sd-modern-button flow-checkout-form__preview-toggle"
        :prepend-icon="previewing ? 'arrow_back' : 'visibility'"
        :aria-pressed="previewing"
        variant="text"
        @click="previewing = !previewing"
        >{{
          $t(
            previewing
              ? "shop_configuration.flow_modern.form.focused.back_to_editor"
              : "shop_configuration.flow_modern.form.focused.preview",
          )
        }}</v-btn
      >
    </div>
    <u-widget-header
      v-if="!modern"
      :title="$t('shop_configuration.checkout_form.title')"
      icon="input"
    >
    </u-widget-header>
    <v-list-subheader v-if="!modern">
      {{ $t("shop_configuration.checkout_form.subtitle") }}
    </v-list-subheader>

    <div :class="{ 'flow-checkout-form__scope': modern }">
      <s-country-select
        v-model="country"
        clearable
        :label="
          $t(
            modern
              ? 'shop_configuration.flow_modern.form.focused.form_for'
              : 'global.commons.country',
          )
        "
        :placeholder="
          modern
            ? $t('shop_configuration.flow_modern.form.all_countries')
            : $t('global.commons.default') + ' *.*'
        "
        persistent-placeholder
        :hide-details="modern"
        :prepend-inner-icon="country ? null : 'public'"
        item-value="alpha2"
        :class="{
          'sd-modern-underlined-field flow-checkout-form__country': modern,
        }"
        :messages="
          modern
            ? []
            : country
              ? `Override the form to show only for ${getCountryName(country)}`
              : 'Default for all countries.'
        "
      ></s-country-select>
      <p v-if="modern" class="flow-checkout-form__scope-description">
        {{
          country
            ? $t("shop_configuration.flow_modern.form.country_hint", {
                country: getCountryName(country),
              })
            : $t("shop_configuration.flow_modern.form.default_hint")
        }}
      </p>
      <v-tooltip
        v-if="modern && country && overridden_country_codes.includes(country)"
        :text="
          $t('shop_configuration.flow_modern.form.remove_country', {
            country: getCountryName(country),
          })
        "
        content-class="sd-modern-tooltip text-start"
        location="top"
        ><template #activator="{ props }"
          ><v-btn
            v-bind="props"
            class="sd-modern-icon-button flow-checkout-form__scope-remove"
            :disabled="!canWrite || busy"
            :aria-label="
              $t('shop_configuration.flow_modern.form.remove_country', {
                country: getCountryName(country),
              })
            "
            icon="delete_outline"
            variant="text"
            @click="delectOverrideForm(country)" /></template
      ></v-tooltip>
    </div>

    <v-chip
      v-if="overridden_country_codes.length > 0"
      @click="country = null"
      class="ma-1"
      :class="{ 'flow-checkout-form__country-chip': modern }"
      prepend-icon="public"
      :color="modern ? undefined : !country ? 'primary' : '#eee'"
      :variant="modern ? 'outlined' : 'flat'"
    >
      {{
        $t(
          modern
            ? "shop_configuration.flow_modern.form.all_countries"
            : "global.commons.default",
        )
      }}
    </v-chip>
    <v-chip
      v-for="key in overridden_country_codes"
      :key="key"
      @click="country = key"
      class="ma-1"
      :class="{
        'flow-checkout-form__country-chip': modern,
        'flow-checkout-form__country-chip--selected': modern && country === key,
      }"
      :color="modern ? undefined : country === key ? 'primary' : '#eee'"
      :variant="modern ? 'outlined' : 'flat'"
    >
      <flag :iso="key" :squared="false" class="me-3" />
      <b class="me-1">{{ key }} | </b>
      <small class="d-block mt-1">{{ getCountryName(key) }}</small>

      <v-tooltip
        v-if="modern"
        :text="
          $t('shop_configuration.flow_modern.form.remove_country', {
            country: getCountryName(key),
          })
        "
        content-class="sd-modern-tooltip text-start"
        location="top"
        ><template #activator="{ props }"
          ><v-btn
            v-bind="props"
            class="sd-modern-icon-button ms-2"
            :disabled="!canWrite || busy"
            :aria-label="
              $t('shop_configuration.flow_modern.form.remove_country', {
                country: getCountryName(key),
              })
            "
            icon="close"
            variant="text"
            @click.stop="delectOverrideForm(key)" /></template
      ></v-tooltip>
      <v-icon v-else end @click.stop="delectOverrideForm(key)">cancel</v-icon>
    </v-chip>

    <s-form-builder
      v-show="!modern || !previewing"
      :title="
        modern
          ? country
            ? $t('shop_configuration.flow_modern.form.country_title', {
                country: getCountryName(country),
              })
            : $t('shop_configuration.flow_modern.form.default_title')
          : `Checkout Form: ` +
            (country ? getCountryName(country) : $t('global.commons.default'))
      "
      :modern="modern"
      :focused="modern"
      :read-only="!canWrite || busy"
      v-model:structure="checkout_form"
      class="mb-5"
      @update:structure="changed = true"
      :key="form_key"
      has-required
    >
    </s-form-builder>
    <b-shop-checkout-form-preview
      v-if="modern"
      :active="previewing"
      :key="form_key"
      :form="checkout_form || []"
      :country-label="
        country
          ? getCountryName(country)
          : $t('shop_configuration.flow_modern.form.all_countries')
      "
    />

    <v-slide-y-reverse-transition>
      <s-widget-buttons
        v-if="changed || modern"
        auto-fixed-position
        :class="{
          'sd-modern-form-actions flow-checkout-form__actions': modern,
        }"
      >
        <span
          v-if="modern"
          class="flow-checkout-form__save-status"
          role="status"
          >{{
            $t(
              changed
                ? "shop_configuration.flow_modern.form.unsaved"
                : "shop_configuration.flow_modern.form.saved",
            )
          }}</span
        >
        <v-btn
          @click="setOptionCheckout(form_key, checkout_form)"
          :loading="busy"
          :disabled="!canWrite || !changed"
          :class="{ 'sd-modern-button': modern }"
          size="x-large"
          :prepend-icon="modern ? undefined : 'save'"
          :append-icon="modern ? 'arrow_forward' : undefined"
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
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import BShopCheckoutFormPreview from "./preview/BShopCheckoutFormPreview.vue";

export default {
  name: "BShopOptionsCheckoutForm",
  mixins: [],
  components: {
    BShopCheckoutFormPreview,
    SCountrySelect,
    SWidgetButtons,
    SFormBuilder,
    USmartSwitch,
    BShopOptionsCheckoutMapPods,
    BShopOptionsCheckoutModePods,
    USmartSelect,
  },
  props: {
    modern: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
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
    previewing: false,
  }),

  computed: {
    canWrite() {
      return (
        !this.readOnly &&
        !!this.writeShopAccess?.(ShopPermissionRegions.SETTINGS.code)
      );
    },
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
      if (!this.canWrite || this.busy) return;
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
      if (!this.canWrite || this.busy) return;
      NotificationService.openDeleteAlert(() => {
        if (!this.canWrite || this.busy) return;
        this.setOptionCheckout(`form_${country}`, null);
        this.country = null;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.flow-checkout-form {
  .flow-checkout-form__heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-block-end: 24px;
  }
  .flow-checkout-form__heading-copy {
    flex: 1;
    min-width: 0;
  }
  .flow-checkout-form__heading .sd-modern-title-text {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: -0.15px;
  }
  .flow-checkout-form__preview-toggle.sd-modern-button {
    flex: 0 0 auto;
    min-height: 38px;
    height: auto;
    padding: 0 8px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  .flow-checkout-form__preview-toggle :deep(.v-icon) {
    font-size: 16px !important;
  }
  .flow-checkout-form__scope {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-block-end: 24px;
    padding-block-end: 23px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  .flow-checkout-form__scope-description {
    max-width: 270px;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
  }
  .flow-checkout-form__scope-remove {
    margin-inline-start: auto;
  }
  .flow-checkout-form__heading-icon {
    flex: 0 0 18px;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
  }
  .flow-checkout-form__subtitle {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    margin-block-start: 4px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.55;
  }
  .flow-checkout-form__country {
    flex: 0 0 310px;
    width: 310px;
    max-width: 100%;
  }
  .flow-checkout-form__country :deep(.v-field__input) {
    font-size: 13px;
  }
  .flow-checkout-form__country-chip {
    max-width: 100%;
    height: auto;
    min-height: 36px;
    padding-inline: 10px 2px;
    border-color: var(--sd-modern-border);
    border-radius: 9px;
    font-size: 12px;
  }
  .flow-checkout-form__country-chip :deep(.v-chip__content) {
    flex-wrap: wrap;
    white-space: normal;
  }
  .flow-checkout-form__country-chip--selected {
    border-color: rgb(var(--v-theme-primary));
  }
  .flow-checkout-form__country-chip b {
    font-weight: 500;
  }
  .flow-checkout-form__actions :deep(.widget-buttons) {
    width: 100%;
    max-width: none;
    flex-direction: row;
    justify-content: flex-end;
    margin-inline: 0;
    padding: 0;
  }
  .flow-checkout-form__actions :deep(.widget-buttons.-fixed-bottom) {
    width: min(1000px, calc(100% - 32px));
    margin-inline: auto;
    padding: 8px;
  }
  .flow-checkout-form__actions :deep(.sd-modern-button) {
    flex: 0 0 auto;
    width: auto;
    min-width: 132px;
    min-height: 40px;
    height: 40px;
    padding: 0 18px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }
  .flow-checkout-form__save-status {
    align-self: center;
    margin-inline-end: auto;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 1.5;
  }
}
.flow-checkout-form--focused .flow-checkout-form__actions {
  margin-block-start: 28px;
  padding-block-start: 20px;
  border-block-start: 1px solid var(--sd-modern-border);
}
.flow-checkout-form--focused
  .flow-checkout-form__actions
  :deep(.sd-modern-button) {
  min-width: 130px;
  min-height: 38px;
  height: 38px;
  padding-inline: 14px;
  font-size: 12px;
}
@media (max-width: 780px) {
  .flow-checkout-form.flow-checkout-form--focused.sd-modern-widget {
    padding: 22px;
  }
  .flow-checkout-form--focused .flow-checkout-form__scope {
    gap: 16px;
  }
}
@media (max-width: 480px) {
  .flow-checkout-form.flow-checkout-form--focused.sd-modern-widget {
    padding: 20px 14px;
  }
  .flow-checkout-form--focused {
    .flow-checkout-form__heading {
      flex-wrap: wrap;
      gap: 8px;
    }
    .flow-checkout-form__heading-copy {
      flex: 1 1 calc(100% - 28px);
    }
    .flow-checkout-form__scope {
      align-items: stretch;
      flex-direction: column;
      gap: 9px;
    }
    .flow-checkout-form__country {
      flex-basis: auto;
      width: 100%;
    }
    .flow-checkout-form__scope-description {
      max-width: none;
    }
  }
}
@media (max-width: 480px), (pointer: coarse) {
  .flow-checkout-form--focused
    .flow-checkout-form__country
    :deep(.v-field__input) {
    font-size: 16px;
  }
  .flow-checkout-form--focused
    .flow-checkout-form__preview-toggle.sd-modern-button {
    min-height: 44px;
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .flow-checkout-form .flow-checkout-form__actions :deep(.sd-modern-button) {
    min-height: 44px;
    height: 44px;
  }
}
</style>

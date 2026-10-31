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
  <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Custom Variants ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
  <div class="b-shop-theme-variants sd-modern-widget text-start">
    <u-widget-header class="sd-modern-form-header" icon="autofps_select" :title="$t('b_shop_options_variants.custom_variants.title')">
    </u-widget-header>
    <div class="sd-modern-subtitle b-shop-theme-variants__subtitle">
      <span>{{ $t('b_shop_options_variants.custom_variants.subtitle') }}</span>
      <v-menu v-model="icon_help_open" :close-on-content-click="false" location="bottom end" max-width="420"
              :content-props="{ role: 'dialog', 'aria-label': $t('b_shop_options_variants.custom_variants.icon_help_title') }">
        <template #activator="{ props }">
          <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" icon variant="text"
                 aria-haspopup="dialog" :aria-label="$t('b_shop_options_variants.custom_variants.icon_help_title')">
            <v-icon>help_outline</v-icon>
            <v-tooltip v-if="!icon_help_open" activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('b_shop_options_variants.custom_variants.icon_help_title') }}</v-tooltip>
          </v-btn>
        </template>
        <v-sheet class="b-shop-theme-variants__icon-help sd-modern-widget text-start">
          <header>
            <h3>{{ $t('b_shop_options_variants.custom_variants.icon_help_title') }}</h3>
            <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="icon_help_open = false">
              <v-icon>close</v-icon>
              <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
            </v-btn>
          </header>
          <p>{{ $t('b_shop_options_variants.custom_variants.icon_help_intro') }}</p>
          <section>
            <h4>{{ $t('b_shop_options_variants.custom_variants.material_icons_title') }}</h4>
            <p>{{ $t('b_shop_options_variants.custom_variants.material_icons_help') }}</p>
            <div class="b-shop-theme-variants__icon-sample"><v-icon aria-hidden="true">palette</v-icon><code dir="ltr">palette</code></div>
            <v-btn class="sd-modern-button sd-modern-button--inline" color="primary"
                   href="https://fonts.google.com/icons?selected=Material+Icons" target="_blank" rel="noopener noreferrer" variant="text">
              {{ $t('shop_theme.studio.icons_list') }}<v-icon end aria-hidden="true">north_east</v-icon>
            </v-btn>
          </section>
          <section>
            <h4>{{ $t('b_shop_options_variants.custom_variants.fontawesome_title') }}</h4>
            <p>{{ $t('b_shop_options_variants.custom_variants.fontawesome_help') }}</p>
            <div class="b-shop-theme-variants__icon-sample"><v-icon aria-hidden="true">fa:fas fa-toolbox</v-icon><code dir="ltr">fa:fas fa-toolbox</code></div>
          </section>
        </v-sheet>
      </v-menu>
    </div>

    <div class="b-shop-theme-variants__list">
      <div v-for="(variant, key) in ProductVariants" :key="key" class="b-shop-theme-variants__row" role="group" :aria-label="$t(variant.name)">
        <div class="b-shop-theme-variants__identity"><v-icon aria-hidden="true">{{ variant.icon }}</v-icon><span>{{ $t(variant.name) }}</span></div>
        <v-text-field
          class="sd-modern-underlined-field"
          :disabled="!canWriteSettings || busy_variants"
          v-model="variants[variant.code]"
          :label="$t('global.commons.name')"
          :aria-label="`${$t(variant.name)} · ${$t('global.commons.name')}`"
          :placeholder="$t(variant.name)"
          flat
          hide-details
          persistent-placeholder
          variant="underlined"
          @change="variants_change = true"
        ></v-text-field>
        <v-text-field
          class="sd-modern-underlined-field"
          :disabled="!canWriteSettings || busy_variants"
          v-model="variants[variant.code + '_icon']"
          :label="$t('global.commons.icon')"
          :aria-label="`${$t(variant.name)} · ${$t('global.commons.icon')}`"
          :placeholder="variant.icon"
          flat
          hide-details
          persistent-placeholder
          variant="underlined"
          @change="variants_change = true"
        ></v-text-field>
      </div>
    </div>

    <v-expand-transition>
      <s-widget-buttons v-if="variants_change && canWriteSettings" class="sd-modern-form-actions">
        <v-btn
          class="sd-modern-button sd-modern-button--primary"
          :loading="busy_variants"
          :disabled="!canWriteSettings"
          color="primary"
          @click="saveVariants"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save_changes") }}
        </v-btn>
      </s-widget-buttons>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import {
  OverrideCustomVariantsName,
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions.ts";

export default {
  name: "BShopOptionsVariants",
  mixins:[],

  components: { SWidgetButtons },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    ProductVariants: ProductVariants,
    variants_change: false,
    busy_variants: false,
    variants: {},
    icon_help_open: false,
  }),

  computed: {
    canWriteSettings() {
      return this.writeShopAccess(ShopPermissionRegions.SETTINGS.code);
    },
  },

  created() {
    this.variants = ShopOptionsHelper.GetCustomVariants(this.shop);
  },
  methods: {
    saveVariants() {
      if (!this.canWriteSettings || this.busy_variants) return;
      this.busy_variants = true;

      axios
        .post(
          window.API.POST_SET_SHOP_OPTIONS_VARIANTS(this.shop.id),
          this.variants,
        )
        .then(({ data }) => {
          if (!data.error) {
            this.shop.options = data.options;
            this.variants_change = false;
            OverrideCustomVariantsName(this.shop); // Update custom variant names.
            this.$forceUpdate();
            NotificationService.showSuccessAlert(
              "Variants updated",
              "Your custom variants have been updated successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_variants = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-shop-theme-variants {
  min-width: 0;

  &__subtitle { display: flex; align-items: center; gap: 6px; margin-block: 0 12px; }
  &__row { display: grid; grid-template-columns: minmax(100px, .65fr) repeat(2, minmax(0, 1fr)); align-items: center; gap: 24px; padding-block: 12px; border-block-end: 1px solid var(--sd-modern-border); }
  &__row:last-child { border-block-end: 0; }
  &__identity { display: flex; align-items: center; gap: 10px; min-width: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  &__identity > .v-icon { flex-shrink: 0; font-size: 20px; }
  @media (max-width: 760px) {
    &__row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 18px; padding-block: 18px; }
    &__identity { grid-column: 1 / -1; }
  }
  @media (max-width: 480px) { &__row { grid-template-columns: minmax(0, 1fr); } }
}
.b-shop-theme-variants__icon-help {
  --sd-modern-icon-button-size: 32px;
  padding: 20px;
  max-width: min(420px, calc(100vw - 32px));
  font-family: inherit;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 1.6;
  > header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-block-end: 12px; }
  h3 { margin: 0; font-family: inherit; font-size: 16px; font-weight: 500; line-height: 24px; }
  h4 { margin: 0 0 6px; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
  p { margin: 0; }
  section { margin-block-start: 18px; }
  .b-shop-theme-variants__icon-sample { display: flex; align-items: center; gap: 10px; margin-block: 10px; }
  code { font-size: 13px; overflow-wrap: anywhere; }
}
</style>

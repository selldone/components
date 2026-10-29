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
    <v-list-subheader class="sd-modern-subtitle b-shop-theme-variants__subtitle">
      {{$t('b_shop_options_variants.custom_variants.subtitle')}}
    </v-list-subheader>

    <v-list class="b-shop-theme-variants__list border-between-vertical bg-transparent" density="compact">
      <v-list-item v-for="(variant, key) in ProductVariants" :key="key">
        <template v-slot:prepend>
          <v-icon>{{ variant.icon }}</v-icon>
        </template>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              class="sd-modern-underlined-field"
              :disabled="!canWriteSettings || busy_variants"
              v-model="variants[variant.code]"
              :placeholder="$t(variant.name)"
              :prefix="`${$t(variant.name)}: `"
              flat
              hide-details
              persistent-placeholder
              variant="underlined"
              @change="variants_change = true"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              class="sd-modern-underlined-field"
              :disabled="!canWriteSettings || busy_variants"
              v-model="variants[variant.code + '_icon']"
              :placeholder="variant.icon"
              flat
              hide-details
              persistent-placeholder
              :prefix="`${$t('global.commons.icon')}: `"
              variant="underlined"
              @change="variants_change = true"
            >
              <template v-slot:append-inner>
                <v-btn class="sd-modern-icon-button sd-modern-input-action" icon variant="text" :aria-label="$t('global.commons.icon')">
                  <v-icon>info</v-icon>

                  <v-menu
                    :close-on-content-click="false"
                    activator="parent"
                    location="bottom"
                    max-width="420"
                    open-on-hover
                  >
                    <v-sheet class="b-shop-theme-variants__icon-help sd-modern-widget text-start">
                      <div>● {{$t('commons.google_icon_font_sample')}}:</div>
                      <div class="my-1">
                        <v-icon class="me-2" size="small">tapas</v-icon>
                        <code>tapas</code>
                      </div>
                      <div class="widget-buttons">
                        <v-btn
                          class="sd-modern-button sd-modern-button--inline"
                          color="primary"
                          href="https://fonts.google.com/icons?selected=Material+Icons"
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="text"
                          >{{ $t('shop_theme.studio.icons_list') }}
                          <v-icon end>north_east</v-icon>
                        </v-btn>
                      </div>

                      <div class="mt-1">● {{$t('commons.fontawesome_icon_font_sample')}}:</div>
                      <div class="my-1">
                        <v-icon class="me-2" size="small"
                          >fa:fas fa-toolbox
                        </v-icon>
                        <code>fa:fas fa-toolbox</code>
                      </div>
                    </v-sheet>
                  </v-menu>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>

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

  &__subtitle { padding: 0; margin-block: 0 18px; min-height: 0; }
  &__list :deep(.v-list-item) { padding-inline: 0; }
  &__icon-help { padding: 20px; max-width: min(420px, calc(100vw - 32px)); font-size: 12px; }
}
</style>

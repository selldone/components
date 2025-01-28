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
  <div class="widget-box -large mb-5">
    <u-widget-header icon="autofps_select" :title="$t('b_shop_options_variants.custom_variants.title')">
    </u-widget-header>
    <v-list-subheader>
      {{$t('b_shop_options_variants.custom_variants.subtitle')}}
    </v-list-subheader>

    <v-list class="rounded-18px border-between-vertical" density="compact">
      <v-list-item v-for="(variant, key) in ProductVariants" :key="key">
        <template v-slot:prepend>
          <v-icon color="#111">{{ variant.icon }}</v-icon>
        </template>
        <v-row>
          <v-col>
            <v-text-field
              v-model="variants[variant.code]"
              :placeholder="$t(variant.name)"
              :prefix="`${$t(variant.name)}: `"
              flat
              hide-details
              persistent-placeholder
              variant="solo"
              @change="variants_change = true"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              v-model="variants[variant.code + '_icon']"
              :placeholder="variant.icon"
              flat
              hide-details
              persistent-placeholder
              :prefix="`${$t('global.commons.icon')}: `"
              variant="solo"
              @change="variants_change = true"
            >
              <template v-slot:append-inner>
                <v-btn color="#111" icon size="small" variant="text">
                  <v-icon>info</v-icon>

                  <v-menu
                    :close-on-content-click="false"
                    activator="parent"
                    location="bottom"
                    max-width="420"
                    open-on-hover
                  >
                    <v-sheet class="text-start pa-3" color="#111" rounded="xl">
                      <div>● {{$t('commons.google_icon_font_sample')}}:</div>
                      <div class="my-1">
                        <v-icon class="me-2" size="small">tapas</v-icon>
                        <code>tapas</code>
                      </div>
                      <div class="widget-buttons">
                        <v-btn
                          class="tnt"
                          color="amber"
                          href="https://fonts.google.com/icons?selected=Material+Icons"
                          target="_blank"
                          variant="text"
                          >Icons list
                          <v-icon end>open_in_new</v-icon>
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
      <s-widget-buttons v-if="variants_change">
        <v-btn
          :loading="busy_variants"
          color="primary"
          size="x-large"
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

  computed: {},

  created() {
    this.variants = ShopOptionsHelper.GetCustomVariants(this.shop);
  },
  methods: {
    saveVariants() {
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

<style scoped></style>

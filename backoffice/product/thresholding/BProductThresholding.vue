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

<template>
  <div v-if="product_thresholds_obj?.conditions">
    <div class="widget-box -large mb-5">
      <u-widget-header
        :src="require('@selldone/components-vue/assets/icons/thresholding.svg')"
        title="Thresholds"
      >
        <template v-slot:actions>
          <u-smart-menu
            v-if="thresholds && !IS_VENDOR_PANEL"
            :items="[
              {
                title: 'Reset to default',
                subtitle: 'Reset all thresholds to default values',
                icon: 'restart_alt',
                click: resetToDefault,
              },
            ]"
            class="ms-2"
          >
          </u-smart-menu>
        </template>
      </u-widget-header>
      <v-list-subheader>
        You can set thresholds for this product to display a progress bar on the
        product page, encouraging buyers to purchase the product faster.
      </v-list-subheader>

      <v-expansion-panels rounded="xl" flat>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <b-product-thresholding-preview
              :variables="variables"
              :progress="progress"
              :carts="carts"
              class="flex-grow-1"
            >
            </b-product-thresholding-preview>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <u-smart-toggle
              v-model="custom"
              false-gray
              true-description="
       Has custom thresholds for this product.
        "
              true-title="
          Custom Thresholds
        "
              false-title="
          Default Thresholds"
              false-description="
          Use default thresholds for this product.
"
              @change="
                (val) => {
                  setting_changed = true;
                }
              "
              :disabled="IS_VENDOR_PANEL"
            >
            </u-smart-toggle>

            <v-expand-transition>
              <div v-if="custom" :class="{ disabled: IS_VENDOR_PANEL }">
                <div v-if="has_progress">
                  <div>
                    Show a progress bar when the product's sold proportion
                    exceeds the defined threshold. Formula:
                    <code>sold / (stock + sold) > {{ progress }}</code
                    >.
                  </div>
                  <v-slider
                    v-model="progress"
                    hide-details
                    density="compact"
                    :min="0"
                    :max="1"
                    show-ticks
                    @update:model-value="setting_changed = true"
                    :step="0.01"
                  >
                  </v-slider>
                </div>

                <div v-if="has_in_cart_count">
                  <div>
                    Show an indicator if more than the defined percentage of
                    stock is added to carts. Formula:
                    <code>in_carts >= stock * {{ carts }}</code
                    >.
                  </div>
                  <v-slider
                    v-model="carts"
                    hide-details
                    density="compact"
                    :min="0"
                    :max="1"
                    show-ticks
                    @update:model-value="setting_changed = true"
                    :step="0.01"
                  >
                  </v-slider>
                </div>

                <!-- ⬬⬬⬬⬬ Custom Thresholds ⬬⬬⬬⬬ -->
                <div class="mt-4">
                  <div
                    v-for="(item, key) in product_thresholds_obj.conditions"
                    :key="key"
                    class="my-1"
                  >
                    <div>
                      {{ $t(item.message) }}
                    </div>

                    <v-row class="my-0 position-relative">
                      <div
                        class="vertical-text text-center pen"
                        style="
                          font-size: 10px;
                          position: absolute;
                          left: -8px;
                          top: 0;
                          bottom: 0;
                          border-right: solid 2px;
                        "
                        :style="{
                          borderColor: ProductThresholdLevel[item.key]?.color,
                        }"
                      >
                        {{ ProductThresholdLevel[item.key]?.name }}
                      </div>

                      <v-col cols="12" sm="4">
                        <v-number-input
                          v-model="variables[item.key].minSells"
                          label="Min Sells"
                          :min="0"
                          variant="outlined"
                          density="compact"
                          clearable
                          hide-details
                          persistent-placeholder
                          placeholder="0"
                          @update:model-value="setting_changed = true"
                          prepend-icon="local_mall"
                        ></v-number-input>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-number-input
                          v-model="variables[item.key].minQuantity"
                          label="Min Quantity"
                          :min="0"
                          variant="outlined"
                          density="compact"
                          clearable
                          hide-details
                          persistent-placeholder
                          placeholder="0"
                          @update:model-value="setting_changed = true"
                          prepend-icon="shelves"
                        ></v-number-input>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-number-input
                          v-model="variables[item.key].maxQuantity"
                          label="Max Quantity"
                          :min="0"
                          variant="outlined"
                          density="compact"
                          clearable
                          hide-details
                          persistent-placeholder
                          placeholder="Infinit"
                          @update:model-value="setting_changed = true"
                          prepend-icon="shelves"
                        ></v-number-input>
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </div>
            </v-expand-transition>

            <v-expand-transition>
              <div v-if="setting_changed">
                <div class="widget-buttons">
                  <v-btn
                    :loading="busy_save"
                    color="#000"
                    size="x-large"
                    @click="saveThresholds"
                    prepend-icon="save"
                  >
                    {{ $t("global.actions.save_changes") }}
                  </v-btn>
                </div>
              </div>
            </v-expand-transition>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import ProductThresholds, {
  ProductThresholdLevel,
} from "@selldone/core-js/enums/product/ProductThresholds.ts";
import BProductThresholdingPreview from "@selldone/components-vue/backoffice/product/thresholding/BProductThresholdingPreview.vue";

export default {
  name: "BProductThresholding",
  mixins: [],
  inject: ["$shop", "$product", "$vendor"],
  components: {
    BProductThresholdingPreview,
    UWidgetHeader,
    USmartMenu,
    USmartToggle,
  },
  props: {},
  data: () => ({
    ProductThresholdLevel: ProductThresholdLevel,
    ProductType: ProductType,

    busy_save: false,
    setting_changed: false,

    custom: false,
    variables: null,
    progress: 0.1, // proportion  to show progress: this.sells / (this.quantity + this.sells) > 0.1; (only physical and virtual)
    carts: 0.1, // if added to cart more than 10% of stock this.in_carts >= this.quantity * 0.1 (only physical and virtual)
  }),
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    has_progress() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },
    has_in_cart_count() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },

    product_thresholds_obj() {
      return ProductThresholds[this.$product.type];
    },

    thresholds() {
      return this.$product.thresholds;
    },

    isVirtual() {
      return this.$product.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.$product.type === ProductType.PHYSICAL.code;
    },
    isFile() {
      return this.$product.type === ProductType.FILE.code;
    },
  },

  watch: {
    $product() {
      this.init();
    },
  },

  created() {
    this.init();
  },
  methods: {
    init() {
      if (!this.product_thresholds_obj?.conditions) return;

      this.custom = !!this.thresholds?.custom;
      this.variables = this.thresholds?.variables
        ? JSON.parse(JSON.stringify(this.thresholds.variables))
        : {};

      this.progress = this.thresholds?.progress
        ? this.thresholds?.progress
        : 0.1;
      this.carts = this.thresholds?.carts ? this.thresholds?.carts : 0.1;

      if (this.variables) {
        // Add tiers to variables
        this.product_thresholds_obj.conditions.forEach((item, key) => {
          if (!this.variables[item.key]) {
            this.variables[item.key] = {
              minSells: item.minSells,
              minQuantity: item.minQuantity,
              maxQuantity: item.maxQuantity,
            };
          }
        });
      }
    },

    resetToDefault() {
      this.$product.thresholds = null;
      this.init();
      this.setting_changed = true;
    },

    saveThresholds() {
      this.busy_save = true;

      axios
        .put(
          window.API.PUT_SET_PRODUCT_THRESHOLDS(
            this.$shop.id,
            this.$product.id,
          ),
          {
            custom: this.custom,
            variables: this.variables,
            progress: Math.ceil(this.progress * 100) / 100,
            carts: Math.ceil(this.carts * 100) / 100,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$product.thresholds = data.product.thresholds;
            this.setting_changed = false;
            NotificationService.showSuccessAlert(
              null,
              "Thresholds saved successfully.",
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
  },
};
</script>

<style scoped></style>

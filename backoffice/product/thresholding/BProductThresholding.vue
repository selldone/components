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
  <div
    v-if="product_thresholds_obj?.conditions"
    :class="{
      'text-start': modern,
      'b-product-thresholds--modern': modern,
      'b-product-thresholds--expanded': modern && settings_open,
    }"
  >
    <div
      :class="
        modern
          ? 'sd-modern-widget b-product-thresholds__widget'
          : 'widget-box -large mb-5'
      "
    >
      <header
        v-if="modern"
        class="sd-modern-header b-product-thresholds__header"
      >
        <div class="sd-modern-title">
          <v-icon class="sd-modern-icon" aria-hidden="true">tune</v-icon>
          <div class="flex-grow-1 min-width-0">
            <h2>{{ $t("b_product_inventory.thresholds.title") }}</h2>
            <p class="sd-modern-subtitle">
              {{ $t("b_product_inventory.thresholds.subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          variant="text"
          color="primary"
          class="sd-modern-button sd-modern-button--small"
          :aria-expanded="settings_open"
          :aria-controls="'product-thresholds-' + $product.id"
          @click="settings_open = !settings_open"
        >
          <v-icon start aria-hidden="true">{{
            settings_open ? "expand_less" : "edit"
          }}</v-icon>
          {{
            $t(settings_open ? "global.actions.close" : "global.actions.edit")
          }}
        </v-btn>
      </header>
      <div
        v-if="modern"
        v-show="!settings_open"
        class="b-product-thresholds__summary"
      >
        <div
          v-if="has_progress || has_in_cart_count"
          class="b-product-thresholds__preview"
        >
          <span v-if="has_progress"
            >{{ $t("b_product_inventory.thresholds.progress") }}
            <b>{{ Math.round(progress * 100) }}%</b></span
          >
          <span
            v-if="has_progress"
            class="b-product-thresholds__track"
            aria-hidden="true"
            ><i :style="{ width: Math.round(progress * 100) + '%' }"></i
          ></span>
          <span v-if="has_in_cart_count"
            >{{ $t("b_product_inventory.thresholds.carts") }}
            <b>{{ Math.round(carts * 100) }}%</b></span
          >
        </div>
        <span class="sd-modern-status sd-modern-status--plain"
          ><i
            v-if="custom"
            class="sd-modern-status__dot bg-primary b-product-thresholds__custom-dot"
          ></i
          >{{
            $t(
              custom
                ? "b_product_inventory.thresholds.custom"
                : "b_product_inventory.thresholds.default",
            )
          }}</span
        >
      </div>
      <div
        v-show="!modern || settings_open"
        :id="modern ? 'product-thresholds-' + $product.id : undefined"
        class="b-product-thresholds__details"
      >
        <div
          v-if="modern && thresholds && !IS_VENDOR_PANEL"
          class="sd-modern-actions b-product-thresholds__toolbar"
        >
          <v-btn
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--small"
            prepend-icon="restart_alt"
            @click="resetToDefault"
            >{{ $t("b_product_inventory.thresholds.reset") }}</v-btn
          >
        </div>
        <u-widget-header
          v-if="!modern"
          :src="
            require('@selldone/components-vue/assets/icons/thresholding.svg')
          "
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
        <v-list-subheader v-if="!modern">
          You can set thresholds for this product to display a progress bar on
          the product page, encouraging buyers to purchase the product faster.
        </v-list-subheader>

        <v-expansion-panels
          rounded="xl"
          flat
          :model-value="modern ? 0 : undefined"
        >
          <v-expansion-panel :eager="modern">
            <v-expansion-panel-title v-show="!modern">
              <b-product-thresholding-preview
                :variables="variables"
                :progress="progress"
                :carts="carts"
                :custom="custom"
                class="flex-grow-1"
              >
              </b-product-thresholding-preview>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <b-product-thresholding-preview
                v-if="modern"
                :variables="variables"
                :progress="progress"
                :carts="carts"
                :custom="custom"
                class="b-product-thresholds__rules-preview"
              />
              <u-smart-toggle
                v-model="custom"
                false-gray
                :true-description="
                  modern
                    ? $t('b_product_inventory.thresholds.custom_help')
                    : 'Has custom thresholds for this product.'
                "
                :true-title="
                  modern
                    ? $t('b_product_inventory.thresholds.custom')
                    : 'Custom Thresholds'
                "
                :false-title="
                  modern
                    ? $t('b_product_inventory.thresholds.default')
                    : 'Default Thresholds'
                "
                :false-description="
                  modern
                    ? $t('b_product_inventory.thresholds.default_help')
                    : 'Use default thresholds for this product.'
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
                  <div
                    v-if="has_progress"
                    :class="modern ? 'b-product-thresholds__slider' : undefined"
                  >
                    <div>
                      <b class="me-1">{{
                        modern
                          ? $t("b_product_inventory.thresholds.progress")
                          : "Progress |"
                      }}</b>
                      <span v-if="modern">{{
                        $t("b_product_inventory.thresholds.progress_help")
                      }}</span>
                      <template v-else
                        >Show a progress bar when the product's sold proportion
                        exceeds the defined threshold.</template
                      >
                      <code
                        >sold / (stock + sold) >
                        {{ numeralFormat(progress, "0.00") }}</code
                      >
                    </div>
                    <v-slider
                      v-model="progress"
                      :aria-label="
                        modern
                          ? $t('b_product_inventory.thresholds.progress')
                          : undefined
                      "
                      :disabled="modern && IS_VENDOR_PANEL"
                      :thumb-label="modern ? true : undefined"
                      hide-details
                      density="compact"
                      :min="0"
                      :max="1"
                      show-ticks
                      @update:model-value="setting_changed = true"
                      :step="0.01"
                    >
                      <template v-if="modern" #thumb-label="{ modelValue }"
                        >{{ Math.round(modelValue * 100) }}%</template
                      >
                    </v-slider>
                  </div>

                  <div
                    v-if="has_in_cart_count"
                    :class="modern ? 'b-product-thresholds__slider' : undefined"
                  >
                    <div>
                      <b class="me-1">{{
                        modern
                          ? $t("b_product_inventory.thresholds.carts")
                          : "In Cart |"
                      }}</b>
                      <span v-if="modern">{{
                        $t("b_product_inventory.thresholds.carts_help")
                      }}</span>
                      <template v-else
                        >Show an indicator if more than the defined percentage
                        of stock is added to carts.</template
                      >
                      <code
                        >in_carts >= stock *
                        {{ numeralFormat(carts, "0.00") }}</code
                      >
                    </div>
                    <v-slider
                      v-model="carts"
                      :aria-label="
                        modern
                          ? $t('b_product_inventory.thresholds.carts')
                          : undefined
                      "
                      :disabled="modern && IS_VENDOR_PANEL"
                      :thumb-label="modern ? true : undefined"
                      hide-details
                      density="compact"
                      :min="0"
                      :max="1"
                      show-ticks
                      @update:model-value="setting_changed = true"
                      :step="0.01"
                    >
                      <template v-if="modern" #thumb-label="{ modelValue }"
                        >{{ Math.round(modelValue * 100) }}%</template
                      >
                    </v-slider>
                  </div>

                  <!-- ⬬⬬⬬⬬ Custom Thresholds ⬬⬬⬬⬬ -->
                  <div class="mt-4">
                    <div
                      v-for="(item, key) in product_thresholds_obj.conditions"
                      :key="key"
                      :class="
                        modern ? 'b-product-thresholds__condition' : 'my-1'
                      "
                    >
                      <div
                        v-if="modern"
                        class="b-product-thresholds__condition-level"
                      >
                        <i
                          class="b-product-thresholds__level-dot"
                          :style="{
                            backgroundColor:
                              ProductThresholdLevel[item.key]?.color,
                          }"
                          aria-hidden="true"
                        ></i>
                        {{
                          $t(
                            "b_product_inventory.thresholds.levels." + item.key,
                          )
                        }}
                      </div>
                      <div
                        :class="
                          modern ? 'b-product-thresholds__message' : undefined
                        "
                      >
                        {{ $t(item.message) }}
                      </div>

                      <v-row class="my-0 position-relative">
                        <div
                          v-if="!modern"
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
                            v-model="variables[item.key].minSales"
                            :label="
                              modern
                                ? $t('b_product_inventory.thresholds.min_sales')
                                : 'Min Sales'
                            "
                            :disabled="modern && IS_VENDOR_PANEL"
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
                            :label="
                              modern
                                ? $t(
                                    'b_product_inventory.thresholds.min_quantity',
                                  )
                                : 'Min Quantity'
                            "
                            :disabled="modern && IS_VENDOR_PANEL"
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
                            :label="
                              modern
                                ? $t(
                                    'b_product_inventory.thresholds.max_quantity',
                                  )
                                : 'Max Quantity'
                            "
                            :disabled="modern && IS_VENDOR_PANEL"
                            :min="0"
                            variant="outlined"
                            density="compact"
                            clearable
                            hide-details
                            persistent-placeholder
                            :placeholder="modern ? '∞' : 'Infinit'"
                            @update:model-value="setting_changed = true"
                            prepend-icon="shelves"
                          ></v-number-input>
                        </v-col>
                      </v-row>
                    </div>
                  </div>

                  <ul class="small">
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_order")
                          : "Conditions are checked in order from top to bottom."
                      }}
                    </li>
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_zero")
                          : "To show progress initially, set 'Show Progress' to zero."
                      }}
                    </li>
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_sales")
                          : "The system compares Min Sells with the product's total sales (all variants included)."
                      }}
                    </li>
                    <li>
                      {{
                        modern
                          ? $t("b_product_inventory.thresholds.help_stock")
                          : "The system compares Min/Max Quantity with the selected variant's stock, or for marketplaces, the vendor's inventory."
                      }}
                    </li>
                  </ul>
                </div>
              </v-expand-transition>

              <v-expand-transition>
                <div v-if="setting_changed">
                  <div
                    :class="
                      modern ? 'sd-modern-form-actions' : 'widget-buttons'
                    "
                  >
                    <v-btn
                      :class="
                        modern
                          ? 'sd-modern-button sd-modern-button--form sd-modern-button--primary'
                          : undefined
                      "
                      :disabled="modern && IS_VENDOR_PANEL"
                      :loading="busy_save"
                      :color="modern ? 'primary' : '#000'"
                      :size="modern ? undefined : 'x-large'"
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
  props: {
    modern: { type: Boolean, default: false },
  },
  data: () => ({
    settings_open: false,
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

      this.progress =
        this.thresholds?.progress != null ? this.thresholds?.progress : 0.1;
      this.carts =
        this.thresholds?.carts != null ? this.thresholds?.carts : 0.1;

      if (this.variables) {
        // Add tiers to variables
        this.product_thresholds_obj.conditions.forEach((item, key) => {
          if (!this.variables[item.key]) {
            this.variables[item.key] = {
              minSales: item.minSales,
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

<style scoped lang="scss">
.b-product-thresholds--modern {
  min-width: 0;
  display: flex;
  flex-direction: column;

  .b-product-thresholds__widget {
    min-width: 0;
    padding: 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .b-product-thresholds__header {
    align-items: flex-start;
    gap: 12px;
    margin: 0;
  }

  .b-product-thresholds__header h2 {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  .b-product-thresholds__header .sd-modern-subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 20px;
  }

  .b-product-thresholds__header > .v-btn {
    flex-shrink: 0;
  }

  .b-product-thresholds__summary {
    padding-block-start: 14px;
    margin-block-start: auto;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }

  .b-product-thresholds__preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-block-end: 8px;
  }

  .b-product-thresholds__preview b {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 500;
  }

  .b-product-thresholds__track {
    flex: 1;
    min-width: 36px;
    height: 5px;
    border-radius: 4px;
    background: var(--sd-modern-border);
    overflow: hidden;
  }

  .b-product-thresholds__track > i {
    display: block;
    height: 100%;
    background: rgb(var(--v-theme-primary));
  }

  .b-product-thresholds__details {
    margin-block-start: 16px;
    min-width: 0;
  }

  .b-product-thresholds__toolbar {
    justify-content: flex-end;
    margin-block-end: 12px;
  }

  .b-product-thresholds__details :deep(.v-expansion-panel) {
    background: transparent;
    border-radius: 0;
  }

  .b-product-thresholds__details :deep(.v-expansion-panel-text__wrapper) {
    padding: 0;
  }

  .b-product-thresholds__rules-preview {
    margin-block-end: 20px;
  }

  .b-product-thresholds__slider {
    margin-block-start: 20px;
    font-size: 13px;
    line-height: 20px;
  }

  .b-product-thresholds__slider code {
    display: block;
    width: fit-content;
    max-width: 100%;
    direction: ltr;
    unicode-bidi: isolate;
    margin-block-start: 6px;
    overflow-wrap: anywhere;
  }

  .b-product-thresholds__slider :deep(.v-slider) {
    margin: 12px 0 0;
    min-height: 44px;
  }

  .b-product-thresholds__condition {
    margin-block-start: 20px;
  }

  .b-product-thresholds__condition-level {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    line-height: 20px;
    font-weight: 500;
  }

  .b-product-thresholds__condition-level > i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .b-product-thresholds__message {
    font-size: 13px;
    line-height: 20px;
    margin-block: 4px 8px;
  }

  .b-product-thresholds__condition :deep(.v-col) {
    padding-block: 8px;
  }

  .b-product-thresholds__details ul {
    margin-block: 20px;
    padding-inline-start: 18px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }

  .sd-modern-form-actions {
    display: flex;
    justify-content: flex-end;
    margin-block-start: 20px;
  }

  @media (max-width: 639px) {
    .b-product-thresholds__header {
      flex-wrap: wrap;
    }
    .b-product-thresholds__track {
      flex-basis: 60px;
    }
  }
}

:global(.smart-invert) .b-product-thresholds--modern {
  .b-product-thresholds__custom-dot,
  .b-product-thresholds__track > i,
  .b-product-thresholds__level-dot {
    filter: invert(1);
  }
}
</style>

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
  <!-- ███████████████████████ Dialog > Add Bulk ███████████████████████ -->
  <v-dialog
    :model-value="modelValue"
    :fullscreen="!modern"
    :max-width="modern ? 840 : undefined"
    scrollable
    transition="dialog-bottom-transition"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <v-card
      :class="{
        'sd-modern-widget sd-modern-form b-product-variants-bulk-editor':
          modern,
      }"
      :theme="
        modern ? (USER()?.preferences?.dark ? 'dark' : 'light') : undefined
      "
    >
      <header v-if="modern" class="b-product-variants-bulk-editor__header">
        <v-icon size="24">auto_fix_high</v-icon>
        <div class="b-product-variants-bulk-editor__heading">
          <h2>{{ $t("product_variants_bulk_add.title") }}</h2>
          <p>{{ $t("b_product_inventory.bulk.subtitle") }}</p>
        </div>
        <v-btn
          icon
          variant="text"
          class="sd-modern-icon-button"
          :aria-label="$t('global.actions.close')"
          @click="close"
        >
          <v-icon>close</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.close") }}</v-tooltip
          >
        </v-btn>
      </header>
      <v-card-title v-else class="d-flex align-center">
        <v-icon class="me-1" color="#111">auto_fix_high</v-icon>

        {{ $t("product_variants_bulk_add.title") }}
      </v-card-title>
      <v-card-text :class="{ 'b-product-variants-bulk-editor__body': modern }">
        <div
          :class="
            modern
              ? 'b-product-variants-bulk-editor__section'
              : 'widget-box mb-5'
          "
        >
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
            icon="conveyor_belt"
            :title="$t('product_variants_bulk_add.variants.title')"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("product_variants_bulk_add.variants.subtitle") }}
          </v-list-subheader>

          <u-smart-select
            v-model="input_variant_1"
            :items="
              Object.values(ProductVariants).filter(
                (x) => x.code !== input_variant_2,
              )
            "
            class="my-3"
            :class="{ 'sd-modern-smart-select': modern }"
            :accessible="modern"
            :border="modern"
            :item-icon="(x) => GetVariantIconByCode(x.code, product)"
            :item-text="(x) => $t(GetVariantNameByCode(x.code, product))"
            item-value="code"
          ></u-smart-select>
          <u-smart-select
            v-model="input_variant_2"
            :items="items_2"
            class="my-3"
            :class="{ 'sd-modern-smart-select': modern }"
            :accessible="modern"
            :border="modern"
            item-description="description"
            item-value="code"
            :item-icon="
              (x) =>
                modern && x.code === 'empty'
                  ? 'remove'
                  : GetVariantIconByCode(x.code, product)
            "
            :item-text="
              (x) =>
                modern && x.code === 'empty'
                  ? x.name
                  : $t(GetVariantNameByCode(x.code, product))
            "
          ></u-smart-select>
        </div>

        <div
          :class="
            modern
              ? 'b-product-variants-bulk-editor__section'
              : 'widget-box mb-5'
          "
        >
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
            icon="table_view"
            :title="$t('product_variants_bulk_add.values.title')"
          ></u-widget-header>
          <v-list-subheader>
            {{ $t("product_variants_bulk_add.values.subtitle") }}
          </v-list-subheader>

          <b-product-variant-multiple-values-input
            v-if="input_variant_1"
            v-model="input_options_1"
            :shop="shop"
            :variant-code="input_variant_1"
          >
          </b-product-variant-multiple-values-input>

          <b-product-variant-multiple-values-input
            v-if="input_variant_2 && input_variant_2 !== 'empty'"
            v-model="input_options_2"
            :shop="shop"
            :variant-code="input_variant_2"
          >
          </b-product-variant-multiple-values-input>

          <v-list-subheader>
            <div
              v-html="
                $t('product_variants_bulk_add.values.prevent_duplicates_tips')
              "
            ></div>
          </v-list-subheader>

          <v-table
            v-if="
              input_variant_1 && input_variant_2 && input_variant_2 !== 'empty'
            "
            class="mt-3 rounded-16px"
            density="compact"
          >
            <template v-slot:default>
              <thead>
                <tr>
                  <th></th>
                  <th
                    v-for="var_1 in input_options_1"
                    :key="var_1"
                    class="text-center"
                  >
                    <u-color-circle
                      v-if="input_variant_1 === ProductVariants.color.code"
                      :color="var_1"
                      :size="16"
                      class="circle-border m-1"
                    >
                    </u-color-circle>
                    <template v-else>
                      <u-variant-asset-image
                        :size="24"
                        :value="var_1"
                      ></u-variant-asset-image>

                      {{ var_1.removeVariantAsset() }}
                    </template>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="var_2 in input_options_2" :key="var_2">
                  <td>
                    <u-color-circle
                      v-if="input_variant_2 === ProductVariants.color.code"
                      :color="var_2"
                      :size="16"
                      class="circle-border m-1"
                    >
                    </u-color-circle>
                    <template v-else>
                      <u-variant-asset-image
                        :size="24"
                        :value="var_2"
                      ></u-variant-asset-image>

                      {{ var_2.removeVariantAsset() }}
                    </template>
                  </td>
                  <td
                    v-for="var_1 in input_options_1"
                    :key="var_1"
                    class="text-center"
                  >
                    <u-check
                      v-if="!modern"
                      :model-value="!excludes[var_1]?.includes(var_2)"
                      @update:model-value="toggle(var_1, var_2)"
                    ></u-check>
                    <v-checkbox-btn
                      v-else
                      :model-value="!excludes[var_1]?.includes(var_2)"
                      :aria-label="`${$t(GetVariantNameByCode(input_variant_1, product))}: ${var_1.removeVariantAsset()} / ${$t(GetVariantNameByCode(input_variant_2, product))}: ${var_2.removeVariantAsset()}`"
                      color="primary"
                      @update:model-value="toggle(var_1, var_2)"
                    />
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </div>

        <div
          :class="
            modern
              ? 'b-product-variants-bulk-editor__section'
              : 'widget-box mb-5'
          "
        >
          <u-widget-header
            :class="{ 'sd-modern-form-header': modern }"
            icon="shelves"
            :title="$t('product_variants_bulk_add.inventory.title')"
          ></u-widget-header>

          <v-list-subheader>
            {{ $t("product_variants_bulk_add.inventory.subtitle") }}
          </v-list-subheader>

          <u-number-input
            v-model="input_quantity"
            :label="$t('product_admin.inventory.variants.count_input')"
            :min="0"
            class="strong-field"
            show-buttons
          >
          </u-number-input>
        </div>
      </v-card-text>
      <v-card-actions
        :class="{ 'b-product-variants-bulk-editor__actions': modern }"
      >
        <span v-if="modern" class="b-product-variants-bulk-editor__count">{{
          $t("b_product_inventory.bulk.selected", { count: add_variants_count })
        }}</span>
        <div class="widget-buttons">
          <v-btn
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            variant="text"
            @click="close"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy"
            color="primary"
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            @click="importVariants()"
            variant="elevated"
          >
            <v-icon start>check</v-icon>
            {{ $t("product_variants_bulk_add.add_variants_action") }} ({{
              add_variants_count
            }}🞫)
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import USmartSelect from "../../../../ui/smart/select/USmartSelect.vue";
import BProductVariantMultipleValuesInput from "../multiple-values-input/BProductVariantMultipleValuesInput.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BProductVariantsBulkAdd",
  mixins: [],

  components: {
    UVariantAssetImage,
    UColorCircle,
    BProductVariantMultipleValuesInput,
    USmartSelect,

    UNumberInput,
  },
  emits: ["update:modelValue", "add"],
  props: {
    modern: { type: Boolean, default: false },
    modelValue: {},
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    product: {
      required: true,
      type: Object,
    },
    initialVariantTypes: {
      type: Array,
    },
  },
  data() {
    return {
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,

      ProductVariants: ProductVariants,

      input_quantity: 10,
      input_variant_1: null,
      input_variant_2: null,

      input_options_1: [],
      input_options_2: [],
      excludes: {},

      busy: false,
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    excludes_count() {
      return Object.values(this.excludes).reduce(
        (sum, current) => sum + current.length,
        0,
      );
    },

    add_variants_count() {
      if (this.input_variant_2 && this.input_variant_2 !== "empty") {
        return (
          this.input_options_1.length * this.input_options_2.length -
          this.excludes_count
        );
      }
      return this.input_options_1.length - this.excludes_count;
    },

    items_2() {
      const out = Object.values(ProductVariants).filter(
        (x) => x.code !== this.input_variant_1,
      );

      out.unshift({
        code: "empty",
        name: this.modern
          ? this.$t("b_product_inventory.bulk.one_attribute")
          : "Empty!",
        icon: "close",
        description: this.modern
          ? this.$t("b_product_inventory.bulk.one_attribute_help")
          : "The product has one variant type.",
      });
      return out;
    },
  },

  watch: {
    initialVariantTypes() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.input_variant_1 =
        this.initialVariantTypes?.length > 0
          ? this.initialVariantTypes[0]
          : null;
      this.input_variant_2 =
        this.initialVariantTypes?.length > 1
          ? this.initialVariantTypes[1]
          : "empty";
      this.excludes = {};
      this.input_options_1 = [];
      this.input_options_2 = [];
    },
    toggle(var_1, var_2) {
      if (!this.excludes[var_1]) this.excludes[var_1] = [];
      this.excludes[var_1].toggle(var_2);
      this.excludes = Object.assign({}, this.excludes); // Force update!
    },
    importVariants() {
      this.busy = true;

      let url = null;

      if (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/) {
        url = window.VAPI.POST_MY_VENDOR_ADD_BULK_VARIANT(
          this.product.vendor_id,
          this.product.id,
        );
      } else {
        url = window.API.POST_ADD_VARIANT_BULK(
          this.product.shop_id,
          this.product.id,
        );
      }

      axios
        .post(url, {
          type_1: this.input_variant_1,
          type_2:
            this.input_variant_2 && this.input_variant_2 !== "empty"
              ? this.input_variant_2
              : null,

          options_1: this.input_options_1,
          options_2: this.input_options_2,

          excludes: this.excludes,
          quantity: this.input_quantity,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.product.variants = data.variants;
            this.product.quantity = data.quantity;

            // Update in local list:
            this.$emit("add", data.product_variants);

            this.close();

            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "product_admin.inventory.variants.notifications.add_success",
              ),
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

    close() {
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

<style lang="scss" scoped></style>

<style lang="scss" scoped>
.b-product-variants-bulk-editor {
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  text-align: start;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    padding: 20px 24px 16px;
    border-block-end: 1px solid var(--sd-modern-border);
  }

  &__heading {
    flex: 1;
    min-width: 0;
    h2 {
      margin: 0;
      font-size: 18px;
      line-height: 26px;
      font-weight: 600;
    }
    p {
      margin: 3px 0 0;
      font-size: 13px;
      line-height: 20px;
      color: var(--sd-modern-muted);
    }
  }

  &__body {
    padding: 16px 24px !important;
    min-width: 0;
  }
  &__section {
    min-width: 0;
    padding-block: 4px 16px;
  }
  &__section + &__section {
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 24px;
    border-block-start: 1px solid var(--sd-modern-border);
    .widget-buttons {
      display: flex;
      flex: 1;
      justify-content: flex-end;
      gap: 8px;
      width: auto;
      max-width: none;
      margin: 0;
    }
    .widget-buttons > .v-btn {
      flex: 0 1 auto;
      min-width: 104px;
      margin: 0;
    }
  }

  &__count {
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  :deep(.v-list-subheader) {
    min-height: 0;
    margin-block: 5px 12px;
    padding: 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--sd-modern-muted);
  }
  :deep(.s--widget-header h2) {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  :deep(.s--widget-header > .v-icon) {
    font-size: 18px;
  }
  :deep(.v-table) {
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px !important;
  }
  :deep(.v-table__wrapper) {
    overflow-x: auto;
  }
  :deep(.v-table th),
  :deep(.v-table td) {
    min-width: 64px;
    padding-inline: 8px;
    font-size: 13px;
  }
  :deep(.v-checkbox-btn) {
    justify-content: center;
    min-height: 44px;
  }
  :deep(.v-checkbox-btn .v-selection-control__wrapper) {
    width: 44px;
    height: 44px;
  }

  @media (max-width: 599px) {
    &__header {
      padding: 16px;
      gap: 9px;
    }
    &__body {
      padding: 12px 16px !important;
    }
    &__actions {
      padding: 10px 16px;
      gap: 8px;
    }
    &__count {
      width: 100%;
    }
    &__actions .widget-buttons {
      width: 100%;
    }
    &__actions .widget-buttons > .v-btn {
      min-height: 44px;
      min-width: 0;
      flex: 1;
    }
    :deep(.color-button-ball) {
      width: 44px !important;
      height: 44px !important;
      margin-inline: 0 !important;
    }
  }
}
</style>

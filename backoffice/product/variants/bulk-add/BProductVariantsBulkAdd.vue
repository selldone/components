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
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-1" color="#111">auto_fix_high</v-icon>

        {{ $t("product_variants_bulk_add.title") }}
      </v-card-title>
      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header
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
            :item-icon="
              (x) => GetVariantIconByCode(x.code, product)
            "
            :item-text="(x) => GetVariantNameByCode(x.code, product)"
            item-value="code"
          ></u-smart-select>
          <u-smart-select
            v-model="input_variant_2"
            :items="items_2"
            class="my-3"
            item-description="description"

            item-value="code"
            :item-icon="
              (x) => GetVariantIconByCode(x.code, product)
            "
            :item-text="(x) => GetVariantNameByCode(x.code, product)"

          ></u-smart-select>
        </div>

        <div class="widget-box mb-5">
          <u-widget-header
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
                      :model-value="!excludes[var_1]?.includes(var_2)"
                      @update:model-value="toggle(var_1, var_2)"
                    ></u-check>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </div>

        <div class="widget-box mb-5">
          <u-widget-header
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
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="close">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy"
            color="primary"
            size="x-large"
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
        name: "Empty!",
        icon: "close",
        description: "The product has one variant type.",
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

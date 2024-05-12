<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div>
    <v-dialog
      :model-value="modelValue"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
      @update:model-value="(v) => $emit('update:modelValue', v)"
    >
      <v-card class="text-start">
        <v-card-title>
          <v-icon class="me-2">shelves</v-icon>

          {{ $t("inventory_list.bulk_price_dialog.title") }}
        </v-card-title>
        <v-card-text class="text-start">
          <v-tabs v-model="mode" align-tabs="title" mandatory>
            <v-tab value="percent">
              <v-icon class="me-1">percent</v-icon>
              {{ $t("inventory_list.bulk_price_dialog.add_percent_tab") }}
            </v-tab>
            <v-tab value="constant">
              <v-icon class="me-1">functions</v-icon>
              {{ $t("inventory_list.bulk_price_dialog.add_constant_tab") }}
            </v-tab>
            <v-tab value="ending">
              <v-icon class="me-1">money</v-icon>
              {{ $t("inventory_list.bulk_price_dialog.ending_tab") }}
            </v-tab>
          </v-tabs>

          <v-window v-model="mode" class="mt-3">
            <v-window-item value="percent">
              <div class="widget-box mb-5">
                <s-widget-header
                  :title="$t('global.commons.price')"
                  icon="price_change"
                ></s-widget-header>

                <v-list-subheader>
                  {{ $t("inventory_list.bulk_price_dialog.message") }}
                </v-list-subheader>

                <b-inventory-price-preview multiple>
                  <small class="d-block">{{
                    $t("global.commons.price")
                  }}</small>
                  #######
                  <v-icon>close</v-icon>
                  (1
                  <v-icon>add</v-icon>
                  <b>%{{ bulk_percent }}</b
                  >)
                </b-inventory-price-preview>

                <u-number-input
                  v-model="bulk_percent"
                  :decimal="1"
                  :max="90"
                  :min="-90"
                  :step="0.5"
                  class="strong-field"
                  prepend-inner-icon="fa:fas fa-percent"
                  show-buttons
                ></u-number-input>
              </div>
            </v-window-item>
            <v-window-item value="constant">
              <div class="widget-box mb-5">
                <s-widget-header
                  :title="$t('global.commons.price')"
                  icon="price_change"
                ></s-widget-header>

                <v-list-subheader>
                  The amount will be added or subtracted from the current price
                  of products.
                </v-list-subheader>

                <b-inventory-price-preview multiple>
                  <small class="d-block">{{
                    $t("global.commons.price")
                  }}</small>
                  #######
                  <v-icon
                    :color="bulk_constant >= 0 ? 'green' : 'red'"
                    @click="bulk_constant = -bulk_constant"
                    >{{ bulk_constant >= 0 ? "add" : "remove" }}
                  </v-icon>
                  <b>{{ Math.abs(bulk_constant) }}</b>
                </b-inventory-price-preview>

                <u-currency-input
                  v-model="bulk_currency"
                  :active-currencies="shop.currencies"
                  :return-object="false"
                  @change="fetchReport"
                ></u-currency-input>

                <u-price-input
                  v-model="bulk_constant"
                  :currency="bulk_currency"
                  allow-negative
                  class="strong-field"
                ></u-price-input>
              </div>
            </v-window-item>

            <v-window-item value="ending">
              <div class="widget-box mb-5">
                <s-widget-header
                  :title="$t('global.commons.price')"
                  icon="price_change"
                ></s-widget-header>

                <v-list-subheader>
                  The ending of the current price of products will be changed to
                  the specified value.
                </v-list-subheader>

                <b-inventory-price-preview multiple>
                  <small class="d-block">{{
                    $t("global.commons.price")
                  }}</small>
                  {{ "#".repeat(12 - ("" + bulk_ending).length) }}
                  <b>{{ bulk_ending }}</b>
                </b-inventory-price-preview>

                <u-currency-input
                  v-model="bulk_currency"
                  :active-currencies="shop.currencies"
                  :return-object="false"
                  @change="fetchReport"
                ></u-currency-input>

                <u-price-input
                  v-model="bulk_ending"
                  :currency="bulk_currency"
                  class="strong-field"
                ></u-price-input>
              </div>
            </v-window-item>
          </v-window>

          <div class="widget-box mb-5">
            <s-widget-header
              :title="$t('global.commons.category')"
              icon="snippet_folder"
            ></s-widget-header>
            <v-list-subheader
              >Limit bulk action to a category and all subcategories.
            </v-list-subheader>

            <b-category-input
              v-model="bulk_category"
              :label="$t('global.commons.category')"
              :messages="$t('inventory_list.category_filter_msg')"
              :placeholder="$t('global.commons.all') + ' *.*'"
              clearable
              no-home
              persistent-placeholder
              @change="fetchReport"
            >
            </b-category-input>

            <!-- ━━━━━━━━━━━━━━━━━━ 📊 Report ━━━━━━━━━━━━━━━━━━ -->
            <u-loading-progress v-if="busy_report"></u-loading-progress>
            <v-expand-transition
              v-if="!need_currency_in_params || bulk_currency"
            >
              <div v-if="report">
                <div class="py-3">
                  <u-text-value-dashed>
                    <template v-slot:label> Total products</template>
                    {{ report.count_products }}
                  </u-text-value-dashed>

                  <u-text-value-dashed>
                    <template v-slot:label> Total variants</template>
                    {{ report.count_variants }}
                  </u-text-value-dashed>
                </div>
              </div>
            </v-expand-transition>

            <!-- ━━━━━━━━━━━━━━━━━━ Confirmation ━━━━━━━━━━━━━━━━━━ -->

            <hr class="hr-dashed" />

            <u-smart-verify
              v-model="bulk_check"
              :label="$t('inventory_list.bulk_price_dialog.check')"
              true-description="The price will be changed for the selected category and all subcategories."
            >
            </u-smart-verify>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="$emit('update:modelValue', false)"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              :class="{ disabled: !bulk_check }"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="preview = true"
            >
              {{ $t("global.actions.show_preview") }}

              <v-icon start>{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ====================== Dialog > Preview ====================== -->

    <v-dialog
      v-model="preview"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card min-height="60vh" class="text-start">
        <v-card-title></v-card-title>

        <v-card-text>
          <b-inventory-bulk-preview
            v-if="preview"
            :has-currency="!need_currency_in_params"
            :params="params"
            :shop="shop"
            :url="list_url"
          ></b-inventory-bulk-preview>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="preview = false">
              <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>
              {{ $t("global.actions.back") }}
            </v-btn>

            <v-btn
              :disabled="!bulk_check"
              :loading="busy_bulk"
              color="success"
              size="x-large"
              variant="elevated"
              @click="setBulkPrice"
            >
              {{ $t("global.actions.apply_change") }}

              <b v-if="mode === 'percent'" class="ms-2">%{{ bulk_percent }}</b>
              <b v-else-if="mode === 'constant'" class="ms-2"
                >+ {{ bulk_constant }} {{ bulk_currency }}</b
              >
              <b v-else-if="mode === 'ending'" class="ms-2"
                >{{ bulk_ending }} ####{{ bulk_currency }}</b
              >
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BCategoryInput from "../../../category/input/BCategoryInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import BInventoryBulkPreview from "../../../inventory/bulk/preview/BInventoryBulkPreview.vue";

import _ from "lodash-es";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import UCube from "../../../../ui/cube/UCube.vue";
import BInventoryPricePreview from "../../../inventory/price-preview/BInventoryPricePreview.vue";

export default {
  name: "BInventoryBulkPrice",
  components: {
    BInventoryPricePreview,
    UCube,
    USmartVerify,
    BInventoryBulkPreview,
    UTextValueDashed,
    BCategoryInput,
    UCurrencyInput,
    UPriceInput,
    UNumberInput,
  },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    mode: "percent",

    bulk_category: null,
    bulk_percent: 0,
    bulk_check: false,
    busy_bulk: false,
    bulk_constant: 0,
    bulk_currency: null,
    bulk_ending: 0,

    report: null,
    busy_report: false,

    preview: false,
  }),
  computed: {
    need_currency_in_params() {
      return ["constant", "ending"].includes(this.mode);
    },
    list_url() {
      return window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_LIST(
        this.shop.id,
      );
    },
    params() {
      return {
        mode: this.mode, // Pricing strategy
        category: this.bulk_category,

        percent: this.bulk_percent,

        constant: this.bulk_constant,
        currency: this.bulk_currency,

        ending: this.bulk_ending,
      };
    },
  },

  watch: {
    modelValue(value) {
      if (value) {
        this.resetToDefault(); // 🞇 Reset to default
        if (this.shop.currencies && this.shop.currencies.length)
          this.bulk_currency = this.shop.currencies[0];
        this.fetchReport();
      }
    },
    need_currency_in_params() {
      this.fetchReport();
    },
  },
  created() {
    // console.log("currencies", this.shop.currencies, this.bulk_currency);
  },
  methods: {
    setBulkPrice() {
      this.busy_bulk = true;
      axios
        .post(
          window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE(this.shop.id),
          this.params,
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert();
            this.preview = false;

            this.$emit("update", data);
            this.$emit("update:modelValue", false);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => (this.busy_bulk = false));
    },

    fetchReport: _.throttle(function () {
      this.report = null;

      this.$nextTick(() => {
        // Make sure all params updated!
        if (this.need_currency_in_params && !this.bulk_currency) return;

        this.busy_report = true;

        axios
          .get(
            window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_REPORT(
              this.shop.id,
            ),
            {
              params: this.params,
            },
          )
          .then(({ data }) => {
            if (!data.error) {
              this.report = data;
            } else {
              this.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            this.showLaravelError(error);
          })
          .finally(() => {
            this.busy_report = false;
          });
      });
    }, 1000),
  },
};
</script>

<style lang="scss" scoped></style>

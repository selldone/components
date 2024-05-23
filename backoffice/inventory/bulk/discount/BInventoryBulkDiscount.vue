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
    <!-- ====================== Dialog > Bulk discount action ====================== -->
    <v-dialog
      :model-value="modelValue"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
      @update:model-value="(v) => $emit('update:modelValue', v)"
    >
      <v-card class="text-start">
        <v-card-title>
          <template
            v-if="
              category /*Only for this category! In the admin select products view.*/
            "
          >
            <v-avatar class="me-2" size="36">
              <img
                v-if="category.icon"
                :src="getShopImagePath(category.icon, 64)"
              />
              <v-icon v-else>folder</v-icon>
            </v-avatar>

            {{ category.title }} >
          </template>
          <v-icon v-else class="me-2">shelves</v-icon>

          {{ $t("inventory_list.bulk_discount_dialog.title") }}
        </v-card-title>
        <v-card-text class="text-start">
          <div class="widget-box mb-5">
            <s-widget-header
              :title="$t('global.commons.discount')"
              icon="discount"
            ></s-widget-header>

            <v-list-subheader>
              {{ $t("inventory_list.bulk_discount_dialog.message") }}
            </v-list-subheader>

            <b-inventory-price-preview multiple price-color="#C2185B">
              <u-chip-discount :percent="bulk_percent" show-zero size="x-large">
              </u-chip-discount>
            </b-inventory-price-preview>

            <u-number-input
              v-model="bulk_percent"
              :decimal="1"
              :max="90"
              :min="0"
              :step="0.5"
              class="strong-field"
              prepend-inner-icon="fa:fas fa-percent"
              show-buttons
            ></u-number-input>

            <u-date-input
              v-model="dis_start"
              :label="$t('add_product.pricing.start_input')"
              :max="dis_end"
              :placeholder="$t('add_product.pricing.start_input_placeholder')"
              class="mt-2"
              clearable
              color="#C2185B"
              prepend-inner-icon="play_arrow"
              return-utc
            />
            <u-date-input
              v-model="dis_end"
              :disabled="!dis_start"
              :label="$t('add_product.pricing.end_input')"
              :min="dis_start"
              :placeholder="$t('add_product.pricing.end_input_placeholder')"
              class="mt-2"
              clearable
              color="#C2185B"
              prepend-inner-icon="stop"
              return-utc
            />

            <u-time-progress-bar
              :created-time="new Date()"
              :end-time="dis_end"
              :start-time="dis_start"
              class="my-2"
            />
          </div>

          <div class="widget-box mb-5">
            <s-widget-header
              :title="$t('global.commons.category')"
              icon="snippet_folder"
            ></s-widget-header>
            <v-list-subheader
              >Limit bulk action to a category and all subcategories.
            </v-list-subheader>

            <b-category-input
              v-if="!category"
              v-model="bulk_category"
              :label="$t('global.commons.category')"
              :messages="$t('inventory_list.category_filter_msg')"
              :placeholder="$t('global.commons.all') + ' *.*'"
              clearable
              no-home
              persistent-placeholder
              @update:model-value="fetchReport"
            >
            </b-category-input>

            <!-- The category has been selected before! -->
            <div v-else class="d-flex align-center text-start">
              <v-avatar :size="32" class="me-2">
                <img
                  v-if="category.icon"
                  :src="getShopImagePath(category.icon, 64)"
                />
                <v-icon v-else>folder</v-icon>
              </v-avatar>

              <div class="flex-grow-1 overflow-hidden">
                <b>{{ category.title }}</b>
                <b-category-parent :category="category" class="d-block" small>
                </b-category-parent>
              </div>
            </div>

            <!-- ━━━━━━━━━━━━━━━━━━ 📊 Report ━━━━━━━━━━━━━━━━━━ -->
            <u-loading-progress v-if="busy_report"></u-loading-progress>
            <v-expand-transition>
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
              :true-title="$t('inventory_list.bulk_discount_dialog.check')"
              true-description="The discount will be applied to all products in the selected category and its subcategories."
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
              @click="showPreviewList()"
            >
              {{ $t("global.actions.show_preview") }}

              <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ████████████████████ Dialog > Preview ████████████████████ -->

    <v-dialog
      v-model="preview"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="dialog_pre" class="text-start">
        <v-card-title></v-card-title>

        <v-card-text>
          <b-inventory-bulk-preview
            :params="{
              category: bulk_category,
              percent: bulk_percent,
              dis_start: dis_start,
              dis_end: dis_end,
            }"
            :shop="shop"
            :url="list_url"
            has-currency
          ></b-inventory-bulk-preview>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="preview = false">
              <v-icon start>{{ $t("icons.chevron_back") }}</v-icon>
              {{ $t("global.actions.back") }}
            </v-btn>

            <v-btn
              :class="{ disabled: !bulk_check }"
              :loading="busy_bulk"
              color="#C2185B"
              size="x-large"
              variant="elevated"
              @click="setBulkDiscount"
            >
              <v-icon start>check</v-icon>
              {{ $t("global.actions.apply_change") }}

              <b class="ms-2">%{{ bulk_percent }}</b>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import BCategoryInput from "../../../category/input/BCategoryInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import BInventoryBulkPreview from "../../../inventory/bulk/preview/BInventoryBulkPreview.vue";

import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import BCategoryParent from "../../../category/parent/BCategoryParent.vue";
import _ from "lodash-es";
import UChipDiscount from "../../../../ui/chip/discount/UChipDiscount.vue";
import BInventoryPricePreview from "../../../inventory/price-preview/BInventoryPricePreview.vue";

export default {
  name: "BInventoryBulkDiscount",
  components: {
    BInventoryPricePreview,
    UChipDiscount,
    BCategoryParent,
    USmartVerify,

    BInventoryBulkPreview,
    UTextValueDashed,
    UTimeProgressBar,
    UDateInput,
    BCategoryInput,

    UNumberInput,
  },
  emits: ["update", "update:modelValue"],
  props: {
    modelValue: {},
    shop: {
      required: true,
      type: Object,
    },
    category: {
      // Optional ! Only for this category!
    },
  },
  data: () => ({
    bulk_category: null,
    bulk_percent: 0,
    bulk_check: false,
    busy_bulk: false,

    dis_start: null,
    dis_end: null,

    report: null,
    busy_report: false,

    preview: false,
    dialog_pre: false,
  }),
  computed: {
    list_url() {
      return window.API.GET_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT_LIST(
        this.shop.id,
      );
    },
  },

  watch: {
    modelValue(value) {
      if (value) {
        this.resetToDefault(); // 🞇 Reset to default

        this.$nextTick(() => {
          this.fetchReport();
        });
      }
    },

    category(val) {
      this.bulk_category = val?.id;
    },
  },
  created() {
    this.bulk_category = this.category?.id;
    if (this.category) {
      this.fetchReport();
    }
  },
  methods: {
    showPreviewList() {
      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.preview = true;
      });
    },

    setBulkDiscount() {
      this.busy_bulk = true;
      axios
        .post(
          window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT(this.shop.id),
          {
            category: this.bulk_category,

            percent: this.bulk_percent,
            dis_start: this.dis_start,
            dis_end: this.dis_end,
          },
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

        this.busy_report = true;
        axios
          .get(
            window.API.GET_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT_REPORT(
              this.shop.id,
            ),
            {
              params: {
                category: this.bulk_category,

                percent: this.bulk_percent,
                dis_start: this.dis_start,
                dis_end: this.dis_end,
              },
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

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
  <div>
    <!-- ====================== Dialog > Bulk discount action ====================== -->
    <v-dialog
      :value="value"
      @input="(v) => $emit('input', v)"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>
          <template
            v-if="
              category /*Only for this category! In the admin select products view.*/
            "
          >
            <v-avatar size="36" class="me-2">
              <img
                v-if="category.icon"
                :src="getShopImagePath(category.icon, 64)"
              />
              <v-icon v-else>folder</v-icon>
            </v-avatar>

            {{ category.title }} >
          </template>

          {{ $t("inventory_list.bulk_discount_dialog.title") }}
        </v-card-title>
        <v-card-text class="text-start">
          <div class="widget-box mb-5">
            <s-widget-header
              :title="$t('global.commons.discount')"
              icon="discount"
            ></s-widget-header>

            <h2 class="text-center mt-2 mb-5 text-h4">
              {{ $t("global.commons.price") }} <v-icon>close</v-icon> %{{
                bulk_percent
              }}
            </h2>

            <p class="subtitle-2">
              {{ $t("inventory_list.bulk_discount_dialog.message") }}
            </p>

            <s-number-input
              prepend-inner-icon="fa:fas fa-percent"
              v-model="bulk_percent"
              :min="0"
              :max="90"
              :step="0.5"
              :decimal="1"
              show-buttons
              class="strong-field"
            ></s-number-input>

            <s-date-input
              return-utc
              v-model="dis_start"
              :max="dis_end"
              class="mt-2"
              :label="$t('add_product.pricing.start_input')"
              color="#C2185B"
              clearable
              :placeholder="$t('add_product.pricing.start_input_placeholder')"
              prepend-inner-icon="play_arrow"
            />
            <s-date-input
              return-utc
              v-model="dis_end"
              class="mt-2"
              :label="$t('add_product.pricing.end_input')"
              color="#C2185B"
              :min="dis_start"
              :disabled="!dis_start"
              clearable
              :placeholder="$t('add_product.pricing.end_input_placeholder')"
              prepend-inner-icon="stop"
            />

            <s-time-progress-bar
              class="my-2"
              :created-time="new Date()"
              :start-time="dis_start"
              :end-time="dis_end"
            />
          </div>

          <div class="widget-box mb-5">
            <s-widget-header
              :title="$t('global.commons.category')"
              icon="snippet_folder"
            ></s-widget-header>
            <v-list-subheader
              >Limit bulk action to a category and all
              subcategories.</v-list-subheader
            >

            <b-shop-category-input
              v-if="!category"
              v-model="bulk_category"
              :placeholder="$t('global.commons.all') + ' *.*'"
              persistent-placeholder
              clearable
              :label="$t('global.commons.category')"
              no-home
              :messages="$t('inventory_list.category_filter_msg')"
              @input="fetchReport"
            >
            </b-shop-category-input>

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
                <category-parents-view
                  :category="category"
                  small
                  class="d-block"
                >
                </category-parents-view>
              </div>
            </div>

            <!-- ━━━━━━━━━━━━━━━━━━ 📊 Report ━━━━━━━━━━━━━━━━━━ -->
            <s-progress-loading v-if="busy_report"></s-progress-loading>
            <v-expand-transition>
              <div v-if="report">
                <div class="py-3">
                  <s-value-dashed>
                    <template v-slot:label> Total products </template>
                    {{ report.count_products }}
                  </s-value-dashed>

                  <s-value-dashed>
                    <template v-slot:label> Total variants </template>
                    {{ report.count_variants }}
                  </s-value-dashed>
                </div>
              </div>
            </v-expand-transition>

            <!-- ━━━━━━━━━━━━━━━━━━ Confirmation ━━━━━━━━━━━━━━━━━━ -->

            <s-smart-check-verify-action
              :true-title="$t('inventory_list.bulk_discount_dialog.check')"
              v-model="bulk_check"
            >
            </s-smart-check-verify-action>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn @click="$emit('input', false)" text x-large>
              <v-icon class="me-1">close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>

            <v-btn
              color="primary"
              dark
              :class="{ disabled: !bulk_check }"
              @click="showPreviewList()"
              x-large
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
      scrollable
      transition="dialog-bottom-transition"
      fullscreen
    >
      <v-card v-if="dialog_pre">
        <v-card-title> </v-card-title>

        <v-card-text>
          <bulk-preview
            :url="list_url"
            :shop="shop"
            has-currency
            :params="{
              category: bulk_category,
              percent: bulk_percent,
              dis_start: dis_start,
              dis_end: dis_end,
            }"
          ></bulk-preview>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn @click="preview = false" text x-large>
              <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
              {{ $t("global.actions.back") }}
            </v-btn>

            <v-btn
              color="#C2185B"
              dark
              :class="{ disabled: !bulk_check }"
              @click="setBulkDiscount"
              :loading="busy_bulk"
              x-large
            >
              <v-icon class="me-1">check</v-icon>
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
import SDateInput from "@components/ui/calendar/date-input/SDateInput.vue";
import STimeProgressBar from "@components/ui/calendar/time-progress/STimeProgressBar.vue";
import BShopCategoryInput from "@components/backoffice/shop/category/input/BShopCategoryInput.vue";
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import SValueDashed from "@components/ui/text/SValueDashed.vue";
import BulkPreview from "@components/backoffice/incentives/discount-code/inventory-bulk-action/BulkPreview.vue";

import SSmartCheckVerifyAction from "@components/smart/SSmartCheckVerifyAction.vue";
import CategoryParentsView from "@components/backoffice/category/CategoryParentsView.vue";
import _ from "lodash-es";

export default {
  name: "BulkDiscountDialog",
  components: {
    CategoryParentsView,
    SSmartCheckVerifyAction,

    BulkPreview,
    SValueDashed,
    STimeProgressBar,
    SDateInput,
    BShopCategoryInput,

    SNumberInput,
  },
  props: {
    value: {},
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
        this.shop.id
      );
    },
  },

  watch: {
    value(value) {
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
          }
        )
        .then(({ data }) => {
          if (!data.error) {
            this.showSuccessAlert();
            this.preview = false;
            this.$emit("update", data);
            this.$emit("input", false);
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
              this.shop.id
            ),
            {
              params: {
                category: this.bulk_category,

                percent: this.bulk_percent,
                dis_start: this.dis_start,
                dis_end: this.dis_end,
              },
            }
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

<style scoped lang="scss"></style>

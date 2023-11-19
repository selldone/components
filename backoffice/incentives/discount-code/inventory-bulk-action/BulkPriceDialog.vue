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
    <v-dialog
      :value="value"
      @input="(v) => $emit('input', v)"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card >
        <v-card-title>
          {{ $t("inventory_list.bulk_price_dialog.title") }}
        </v-card-title>
        <v-card-text class="text-start">
          <v-tabs v-model="tab" align-with-title>
            <v-tabs-slider color="primary"></v-tabs-slider>

            <v-tab>
              <v-icon class="me-1">percent</v-icon>
              {{ $t("inventory_list.bulk_price_dialog.add_percent_tab") }}
            </v-tab>
            <v-tab>
              <v-icon class="me-1">functions</v-icon>
              {{ $t("inventory_list.bulk_price_dialog.add_constant_tab") }}
            </v-tab>
            <v-tab>
              <v-icon class="me-1">money</v-icon>
              {{ $t("inventory_list.bulk_price_dialog.ending_tab") }}
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab" class="mt-3">
            <v-tab-item>
              <div class="widget-box mb-5">

                <widget-header :title="$t('global.commons.price')" icon="price_change"></widget-header>



                <h2 class="text-center mt-2 mb-5 display-1">
                  ####### <v-icon>close</v-icon> (1 <v-icon>add</v-icon> %{{
                    bulk_percent
                  }})
                </h2>

                <p class="subtitle-2">
                  {{ $t("inventory_list.bulk_price_dialog.message") }}
                </p>

                <s-number-input
                  prepend-inner-icon="fas fa-percent"
                  v-model="bulk_percent"
                  :min="-90"
                  :max="90"
                  :step="0.5"
                  :decimal="1"
                  show-buttons
                  class="strong-field"
                ></s-number-input>
              </div>
            </v-tab-item>
            <v-tab-item>
              <div class="widget-box mb-5">
                <h2 class="text-center mt-2 mb-5 display-1">
                  #######
                  <v-icon
                    @click="bulk_constant = -bulk_constant"
                    :color="bulk_constant >= 0 ? 'green' : 'red'"
                    >{{ bulk_constant >= 0 ? "add" : "remove" }}</v-icon
                  >
                  {{ Math.abs(bulk_constant) }}
                </h2>

                <currency-list
                  v-model="bulk_currency"
                  :return-object="false"
                  :active-currencies="shop.currencies"
                  @change="fetchReport"
                ></currency-list>

                <s-price-input
                  v-model="bulk_constant"
                  class="strong-field"
                  :currency="bulk_currency"
                  allow-negative
                ></s-price-input>
              </div>
            </v-tab-item>

            <v-tab-item>
              <div class="widget-box mb-5">
                <h2 class="text-center mt-2 mb-5 display-1">
                  {{ "#".repeat(12 - ("" + bulk_ending).length) }}
                  {{ bulk_ending }}
                </h2>

                <currency-list
                  v-model="bulk_currency"
                  :return-object="false"
                  :active-currencies="shop.currencies"
                  @change="fetchReport"
                ></currency-list>

                <s-price-input
                  v-model="bulk_ending"
                  class="strong-field"
                  :currency="bulk_currency"
                ></s-price-input>
              </div>
            </v-tab-item>
          </v-tabs-items>

          <div class="widget-box mb-5">

            <widget-header :title="$t('global.commons.category')" icon="snippet_folder"></widget-header>
            <v-subheader>Limit bulk action to a category and all subcategories.</v-subheader>


            <category-select
              v-model="bulk_category"
              :placeholder="$t('global.commons.all') + ' *.*'"
              persistent-placeholder
              clearable
              :label="$t('global.commons.category')"
              no-home
              :messages="$t('inventory_list.category_filter_msg')"
              @change="fetchReport"
            >
            </category-select>

            <!-- ━━━━━━━━━━━━━━━━━━ 📊 Report ━━━━━━━━━━━━━━━━━━ -->
            <progress-loading v-if="busy_report"></progress-loading>
            <v-expand-transition
              v-if="!need_currency_in_params || bulk_currency"
            >
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

            <v-checkbox
              :label="$t('inventory_list.bulk_price_dialog.check')"
              v-model="bulk_check"
              color="success"
            >
            </v-checkbox>
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
              @click="preview = true"
              x-large
            >
              {{$t('global.actions.show_preview')}}

              <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ====================== Dialog > Preview ====================== -->

    <v-dialog
      v-model="preview"
      scrollable
      transition="dialog-bottom-transition"
      fullscreen
    >
      <v-card min-height="60vh">
        <v-card-title> </v-card-title>

        <v-card-text>
          <bulk-preview
            v-if="preview"
            :url="list_url"
            :shop="shop"
            :has-currency="!need_currency_in_params"
            :params="params"
          ></bulk-preview>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn @click="preview = false" text x-large>
              <v-icon class="me-1">{{ $t("icons.chevron_back") }}</v-icon>
              {{ $t("global.actions.back") }}
            </v-btn>

            <v-btn
              color="success"
              :disabled="!bulk_check"
              @click="setBulkPrice"
              :loading="busy_bulk"
              x-large
            >
              {{ $t("global.actions.apply_change") }}

              <b class="ms-2" v-if="tab === 0">%{{ bulk_percent }}</b>
              <b class="ms-2" v-else-if="tab === 1"
                >+ {{ bulk_constant }} {{ bulk_currency }}</b
              >
              <b class="ms-2" v-else-if="tab === 2"
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
import CategorySelect from "@components/backoffice/category/CategorySelect.vue";
import CurrencyList from "@components/ui/currency/CurrencyList.vue";
import SPriceInput from "@components/ui/input/price/SPriceInput.vue";
import SNumberInput from "@components/ui/input/number/SNumberInput.vue";
import SValueDashed from "@components/ui/text/SValueDashed.vue";
import BulkPreview from "@components/backoffice/incentives/discount-code/inventory-bulk-action/BulkPreview.vue";
import WidgetHeader from "@components/widget/WidgetHeader.vue";
import _ from "lodash-es";

export default {
  name: "BulkPriceDialog",
  components: {
    WidgetHeader,
    BulkPreview,
    SValueDashed,
    CategorySelect,
    CurrencyList,
    SPriceInput,
    SNumberInput,
  },
  props: {
    value: {},
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    tab: 0,

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
      return [2 /*constant*/, 1 /*ending*/].includes(this.tab);
    },
    list_url() {
      return window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_LIST(
        this.shop.id
      );
    },
    params() {
      return {
        mode:
          this.tab === 0 ? "percent" : this.tab === 1 ? "constant" : "ending", // Pricing strategy
        category: this.bulk_category,

        percent: this.bulk_percent,

        constant: this.bulk_constant,
        currency: this.bulk_currency,

        ending: this.bulk_ending,
      };
    },
  },

  watch: {
    value(value) {
      if (value) {
           this.resetToDefault();      // 🞇 Reset to default
        if (this.shop.currencies && this.shop.currencies.length)
          this.bulk_currency = this.shop.currencies[0];
        this.fetchReport();
      }
    },
    need_currency_in_params(){
      this.fetchReport()
    }
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
          this.params
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

      this.$nextTick(() => {     // Make sure all params updated!
        if (this.need_currency_in_params && !this.bulk_currency) return;

        this.busy_report = true;


        axios
          .get(
            window.API.POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_REPORT(
              this.shop.id
            ),
            {
              params: this.params,
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

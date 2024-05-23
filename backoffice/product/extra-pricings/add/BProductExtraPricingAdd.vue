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
  <v-bottom-sheet
    :max-width="840"
    :model-value="modelValue"
    :theme="light ? 'light' : 'dark'"
    content-class="rounded-t-xl"
    scrollable
    width="96%"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card
      :color="light ? '#fff' : '#111'"
      :title="
        $t('extra_pricing_add_dialog.title', { min: clone_extra_pricing.min })
      "
      class="rounded-t-xl text-start"
      prepend-icon="money"
    >
      <v-card-text>
        <div class="pb-5">
          {{ $t("extra_pricing_add_dialog.subtitle") }}
        </div>

        <u-number-input
          v-model="clone_extra_pricing.min"
          :dark="!light"
          :label="$t('extra_pricing_add_dialog.min_quantity')"
          :min="2"
          :text-center="false"
          class="sm-suffix price-input strong-field"
          required
          variant="underlined"
        ></u-number-input>

        <u-price-input
          v-model="clone_extra_pricing.price"
          :dark="!light"
          :decimal="currencyObject.floats"
          :disabled="!!vendorProduct?.pricing"
          :label="
            vendorProduct
              ? 'Marketplace price'
              : $t('add_product.pricing.price_input')
          "
          :suffix="currencyName"
          class="sm-suffix price-input strong-field"
          required
          variant="underlined"
        >
          <template v-if="vendorProduct" v-slot:append-inner>
            <!-- 🟣 Marketplace 🟣 -->
            <v-avatar class="mt-2 avatar-gradient -thin -shop" size="24"
              ><img :src="getShopImagePath(shop.icon, 96)"
            /></v-avatar>
          </template>
        </u-price-input>

        <!-- ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀ -->
        <template v-if="vendorProduct">
          <u-price-input
            v-model="clone_extra_pricing.raw_price"
            :dark="!light"
            :decimal="currencyObject.floats"
            :suffix="currencyName"
            class="sm-suffix price-input strong-field"
            label="Vendor price"
            required
            variant="underlined"
            @blur="
              () => {
                if (vendorProduct?.pricing) {
                  clone_extra_pricing.price =
                    (1 + vendorProduct?.pricing.commission / 100) *
                    clone_extra_pricing.raw_price;
                }
              }
            "
          >
            <template v-slot:append-inner>
              <v-icon class="mt-2">storefront</v-icon>
            </template>
          </u-price-input>
        </template>
        <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
        <v-slide-y-transition leave-absolute>
          <div
            v-if="!show_commission && !clone_extra_pricing.commission"
            class="price-input my-0 text-end"
          >
            <v-btn
              class="tnt"
              size="small"
              variant="text"
              @click="show_commission = true"
            >
              <v-icon class="me-1" size="small">add</v-icon>
              {{ $t("add_product.pricing.add_commission_action") }}
            </v-btn>
          </div>
        </v-slide-y-transition>
        <v-slide-y-reverse-transition hide-on-leave>
          <div v-if="show_commission || clone_extra_pricing.commission">
            <u-price-input
              v-model="clone_extra_pricing.commission"
              :dark="!light"
              :decimal="currencyObject.floats"
              :label="$t('add_product.pricing.commission_input')"
              :suffix="currencyName"
              class="sm-suffix price-input strong-field"
              clearable
              hide-details
              required
              @click:clear="
                clone_extra_pricing.commission = 0;
                show_commission = false;
              "
            />
          </div>
        </v-slide-y-reverse-transition>

        <u-price-input
          v-model="clone_extra_pricing.discount"
          :dark="!light"
          :decimal="currencyObject.floats"
          :label="$t('add_product.pricing.discount_input')"
          :messages="`${$t(
            'add_product.pricing.discount_input_message',
          )}: ${discount_percent}%`"
          :suffix="currencyName"
          class="sm-suffix price-input strong-field my-5"
        />

        <div class="text-center line-height-normal d-flex align-center">
          <div
            class="flex-grow-1 mx-3"
            style="border-bottom: dashed thin #fff"
          ></div>
          <span class="d-block">
            {{
              pricing === PricingTypes.FIX.code
                ? $t("global.commons.final_price")
                : $t("global.commons.starting_price")
            }}
          </span>
          <div
            class="flex-grow-1 mx-3"
            style="border-bottom: dashed thin #fff"
          ></div>
        </div>

        <div class="text-center my-3">
          <u-price
            :amount="calculatePrice"
            :class="{ 'text-danger': calculatePrice <= 0 }"
            :currency="currency"
            x-large
          >
          </u-price>
          <span v-if="price_label" class="ms-2">{{ price_label }}</span>
        </div>

        <v-expand-transition>
          <div v-if="clone_extra_pricing.discount">
            <v-expansion-panels
              :dark="!light"
              :model-value="has_discount_period ? 0 : null"
              class="price-input mt-5"
              style="border-radius: 18px; overflow: hidden"
              @update:model-value="(val) => (has_discount_period = val === 0)"
            >
              <v-expansion-panel
                :style="{ 'background-color': light ? '#eee' : '#1e1e1ea8' }"
                elevation="0"
              >
                <v-expansion-panel-title color="transparent">
                  <v-icon
                    :color="has_discount_period ? 'success' : undefined"
                    class="flex-grow-0 me-2"
                    >{{
                      has_discount_period ? "check_circle" : "panorama_fish_eye"
                    }}
                  </v-icon>
                  <span class="flex-grow-1">{{
                    $t("add_product.pricing.has_discount_period_input")
                  }}</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text color="transparent">
                  <p class="text-start">
                    <v-icon>arrow_drop_down</v-icon>
                    {{ $t("add_product.pricing.discount_timespan") }}
                  </p>

                  <u-date-input
                    v-model="clone_extra_pricing.dis_start"
                    :label="$t('add_product.pricing.start_input')"
                    :max="clone_extra_pricing.dis_end"
                    :placeholder="
                      $t('add_product.pricing.start_input_placeholder')
                    "
                    class="mt-2"
                    clearable
                    color="#C2185B"
                    prepend-inner-icon="play_arrow"
                    return-utc
                  />
                  <u-date-input
                    v-model="clone_extra_pricing.dis_end"
                    :disabled="!clone_extra_pricing.dis_start"
                    :label="$t('add_product.pricing.end_input')"
                    :min="clone_extra_pricing.dis_start"
                    :placeholder="
                      $t('add_product.pricing.end_input_placeholder')
                    "
                    class="mt-2"
                    clearable
                    color="#C2185B"
                    prepend-inner-icon="stop"
                    return-utc
                  />

                  <u-time-progress-bar
                    :class="{ 'text-white': !light }"
                    :created-time="
                      clone_extra_pricing.created_at
                        ? clone_extra_pricing.created_at
                        : product.created_at
                    "
                    :end-time="clone_extra_pricing.dis_end"
                    :start-time="clone_extra_pricing.dis_start"
                    class="my-2"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-expand-transition>
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
            v-if="clone_extra_pricing.id"
            :loading="busy_save"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="editExtraPricing"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
          <v-btn
            v-else
            :loading="busy_save"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addExtraPricing"
          >
            <v-icon start>add</v-icon>
            {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";

export default {
  name: "BProductExtraPricingAdd",
  components: {
    UNumberInput,
    UDateInput,
    UTimeProgressBar,
    UPriceInput,
  },
  emits: ["update:modelValue", "onAdd", "onEdit", "onDelete"],
  props: {
    modelValue: {},
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    vendorProduct: {
      /*🟢 Add extra pricing to product<->vendor in the Product > Vendors tab🟢*/ required: false,
    },

    product: {
      required: true,
      type: Object,
    },

    variant: {
      required: false,
      type: Object,
    },

    extraPricing: {
      required: true,
      type: Object,
    },
    allExtraPricings: {
      // Active extra pricing for current product / variant / vendor
      required: false,
      type: Array,
    },

    transparent: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    PricingTypes: PricingTypes,

    has_discount_period: false,

    show_commission: false,

    busy_save: false,
    busy_delete: false,

    clone_extra_pricing: null,
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    pricing() {
      return this.product.pricing;
    },
    price_label() {
      return this.product.price_label;
    },

    currency() {
      return this.product.currency;
    },
    currencyObject() {
      return this.GetCurrency(this.currency);
    },
    currencyName() {
      return this.getCurrencyName(this.currency);
    },

    calculatePrice() {
      return this.priceProductByCurrency(
        this.shop,
        {
          price: this.clone_extra_pricing.price,
          currency: this.currency,
          commission: this.clone_extra_pricing.commission,
          discount: this.clone_extra_pricing.discount,
        },
        null,
        this.currency,
      );
    },
    discount_percent() {
      return this.discountProductPercent(this.shop, {
        price: this.clone_extra_pricing.price,
        currency: this.currency,
        commission: this.clone_extra_pricing.commission,
        discount: this.clone_extra_pricing.discount,
      });
    },
  },

  watch: {
    has_discount_period(value) {
      if (!value) {
        this.clone_extra_pricing.dis_start = null;
        this.clone_extra_pricing.dis_end = null;
      }
    },

    extraPricing() {
      this.init();
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.clone_extra_pricing = Object.assign({}, this.extraPricing);

      this.has_discount_period =
        this.clone_extra_pricing.dis_start || this.clone_extra_pricing.dis_end;
    },

    addExtraPricing() {
      const params = {
        variant_id: this.variant?.id,
        vendor_product_id: this.vendorProduct?.id,

        min: this.clone_extra_pricing.min,
        price: this.clone_extra_pricing.price,
        raw_price: this.clone_extra_pricing.raw_price,

        commission: this.clone_extra_pricing.commission,
        discount: this.clone_extra_pricing.discount,
        dis_start: this.clone_extra_pricing.dis_start,
        dis_end: this.clone_extra_pricing.dis_end,
      };

      this.busy_save = true;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_ADD_EXTRA_PRICINGS(
                this.$route.params.vendor_id,
                this.product.id,
              )
            : window.API.POST_PRODUCT_ADD_EXTRA_PRICINGS(
                this.shop.id,
                this.product.id,
              ),
          params,
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("onAdd", data.extra_pricing);
            this.$emit("update:modelValue", false);
            this.showSuccessAlert(null, "The product extra pricing added.");
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    editExtraPricing() {
      const params = {
        variant_id: this.variant?.id,
        vendor_product_id: this.vendorProduct?.id,

        min: this.clone_extra_pricing.min,
        price: this.clone_extra_pricing.price,
        raw_price: this.clone_extra_pricing.raw_price,

        commission: this.clone_extra_pricing.commission,
        discount: this.clone_extra_pricing.discount,
        dis_start: this.clone_extra_pricing.dis_start,
        dis_end: this.clone_extra_pricing.dis_end,
      };

      this.busy_save = true;

      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.$route.params.vendor_id,
                this.product.id,
                this.extraPricing.id,
              )
            : window.API.PUT_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.shop.id,
                this.product.id,
                this.extraPricing.id,
              ),
          params,
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("onEdit", data.extra_pricing);
            this.$emit("update:modelValue", false);
            this.showSuccessAlert(null, "The product extra pricing updated.");

            //----------------------------------------------
            Object.assign(this.extraPricing, data.extra_pricing);
            //----------------------------------------------
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showDelete() {
      this.openDangerAlert(
        "Delete extra pricing",
        "Are you certain you want to permanently remove this additional pricing?",
        "Yes, Delete now",
        () => {
          this.deleteNow();
        },
      );
    },
    deleteNow() {
      this.busy_delete = true;

      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.$route.params.vendor_id,
                this.product.id,
                this.extraPricing.id,
              )
            : window.API.DELETE_PRODUCT_EDIT_EXTRA_PRICINGS(
                this.shop.id,
                this.product.id,
                this.extraPricing.id,
              ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("onDelete", data.id);
            this.$emit("close");
            this.showSuccessAlert(
              null,
              "The product extra pricing has been deleted.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.price-input {
  max-width: 420px;
  margin: 12px auto;
}
</style>

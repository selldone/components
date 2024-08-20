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
    <!-- ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀ -->
    <div v-if="isMarketplace" class="widget-box my-5">
      <s-widget-header
        :add-caption="
          !IS_VENDOR_PANEL
            ? $t('add_product.pricing.vendor.manage_vendors')
            : undefined
        "
        :src="require('../../../../assets/icons/marketplace.svg')"
        :to="
          product
            ? {
                name: 'BPageProductVendors',
                params: { product_id: product.id },
              }
            : undefined
        "
        add-icon="price_change"
        add-text
        class="mb-2"
        :title="$t('add_product.pricing.vendor.title')"
      ></s-widget-header>

      <v-list-subheader>
        <div>
          <v-icon class="me-1">info_outline</v-icon>
          {{ $t("add_product.pricing.vendor.subtitle") }}
        </div>
      </v-list-subheader>

      <v-list-subheader v-if="!vendorProduct && !variant && product?.vendor_id">
        <div>
          <v-icon class="me-1">info_outline</v-icon>
          <span
            v-html="
              $t('add_product.pricing.vendor.vendor_product_pricing_link')
            "
          >
          </span>
        </div>
      </v-list-subheader>

      <v-list-subheader v-if="!vendorProduct && variant && product?.vendor_id">
        <div>
          <v-icon class="me-1">info_outline</v-icon>

          <span
            v-html="
              $t('add_product.pricing.vendor.vendor_variant_pricing_link')
            "
          >
          </span>
        </div>
      </v-list-subheader>
    </div>
    <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

    <!-- ▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀ -->
    <div v-if="isSubscription" class="widget-box my-5">
      <s-widget-header
        :src="
          require('@selldone/core-js/assets/product-types/subscription.svg')
        "
        :to="
          product
            ? {
                name: 'BPageProductInventory',
                params: { product_id: product.id },
              }
            : undefined
        "
        add-caption="Manage Plans"
        add-icon="price_change"
        add-text
        class="mb-2"
        title="Subscription pricing"
      ></s-widget-header>

      <v-list-subheader>
        <div>
          <v-icon class="me-1">info_outline</v-icon>
          This price will be shown only in the products listing. You can set the
          actual price of the product and subscription plans in the Product >
          Inventory tab.
        </div>
      </v-list-subheader>
    </div>
    <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

    <v-sheet
      :class="{
        '-transparent': transparent,
        'widget-hover-dark': !transparent,
        light: light,
      }"
      :theme="light ? 'light' : 'dark'"
      class="widget-box price-input-form mx-auto"
    >
      <s-widget-header
        :title="$t('add_product.pricing.edit_price')"
        icon="price_change"
      >
      </s-widget-header>
      <v-list-subheader :dark="!light">
        {{ subtitle }}
      </v-list-subheader>

      <!-- Pricing available only for services -->
      <v-col v-if="isService" cols="12">
        <v-radio-group
          v-model="pricing"
          :inline="$vuetify.display.smAndUp"
          class="justify-space-around"
          @update:model-value="setValue('pricing', pricing)"
        >
          <v-radio
            v-for="type in available_pricing"
            :key="type.code"
            :label="$t(type.title)"
            :value="type.code"
          ></v-radio>
        </v-radio-group>

        <v-row align="center" class="m-0" style="min-height: 100px">
          <v-col cols="12" sm="6">
            <v-img
              :class="{ 'invert-image': light }"
              :src="PricingTypes[pricing].image"
              class="mx-auto"
              max-width="280"
            ></v-img>
          </v-col>
          <v-col class="text-start text-subtitle-2" cols="12" sm="6">
            <v-icon size="small">info</v-icon>
            {{ $t(PricingTypes[pricing].message) }}
          </v-col>
        </v-row>
        <hr />
      </v-col>

      <u-currency-input
        v-model="currency"
        :activeCurrencies="shop.currencies"
        :dark="!light"
        :label="$t('add_product.pricing.currency_input')"
        :messages="$t('add_product.pricing.currency_input_messages')"
        class="sm-suffix price-input"
        return-object
        @update:model-value="setValue('currency', currency.code)"
      />

      <u-price-input
        v-model="price"
        :currency="currencyObject"
        :dark="!light"
        :label="$t('add_product.pricing.price_input')"
        class="sm-suffix price-input strong-field"
        required
        @update:model-value="setValue('price', price)"
      />

      <v-slide-y-transition leave-absolute>
        <div
          v-if="!show_commission && !commission"
          class="price-input my-0 text-end"
        >
          <v-btn
            class="tnt"
            size="small"
            variant="text"
            @click="show_commission = true"
          >
            <v-icon start>add</v-icon>
            {{ $t("add_product.pricing.add_commission_action") }}
          </v-btn>
        </div>
      </v-slide-y-transition>
      <v-slide-y-reverse-transition hide-on-leave>
        <div v-if="show_commission || commission">
          <u-price-input
            v-model="commission"
            :currency="currencyObject"
            :dark="!light"
            :label="$t('add_product.pricing.commission_input')"
            class="sm-suffix price-input strong-field"
            clearable
            hide-details
            required
            @update:model-value="setValue('commission', commission)"
            @click:clear="
              commission = 0;
              setValue('commission', 0);
              show_commission = false;
            "
          />

          <div class="small price-input text-justify">
            <v-icon class="me-1" color="amber" size="small">info</v-icon>
            {{ $t("add_product.pricing.commission_message") }}
            <div class="text-end">
              <v-btn
                :color="light ? 'primary' : 'amber'"
                :to="{ name: 'BPageShopFinanceTax' }"
                class="mt-1"
                size="small"
                variant="text"
              >
                <v-icon start>gavel</v-icon>
                {{ $t("shop_tax.tax_setting") }}
              </v-btn>
            </div>
          </div>
        </div>
      </v-slide-y-reverse-transition>

      <u-price-input
        v-model="discount"
        :currency="currencyObject"
        :dark="!light"
        :label="$t('add_product.pricing.discount_input')"
        :messages="`${$t(
          'add_product.pricing.discount_input_message',
        )}: ${discount_percent}%`"
        class="sm-suffix price-input strong-field"
        @update:model-value="setValue('discount', discount)"
      />

      <div class="text-center line-height-normal d-flex align-center">
        <div
          class="flex-grow-1 mx-3"
          style="border-bottom: dashed thin #fff"
        ></div>
        <span class="d-block">
          {{
            pricing === PricingTypes.FIX.code ||
            variant /*Pricing type is just for products*/
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

        <v-slide-y-transition leave-absolute>
          <div
            v-if="!show_price_label && !price_label"
            class="price-input my-0 text-end"
          >
            <v-btn
              class="tnt"
              size="small"
              variant="text"
              @click="show_price_label = true"
            >
              <v-icon start>add</v-icon>
              {{ $t("add_product.pricing.add_price_label_action") }}
            </v-btn>
          </div>
        </v-slide-y-transition>

        <v-slide-y-reverse-transition hide-on-leave>
          <div v-if="show_price_label || price_label">
            <v-text-field
              v-model="price_label"
              :label="$t('add_product.pricing.price_label_input')"
              :messages="$t('add_product.pricing.price_label_message')"
              class="price-input"
              clearable
              counter="32"
              placeholder="($1.5/Fl Oz)"
              variant="underlined"
              @update:model-value="setValue('price_label', price_label)"
              @click:clear="
                price_label = null;
                setValue('price_label', null);
                show_price_label = false;
              "
            />
          </div>
        </v-slide-y-reverse-transition>
      </div>

      <v-expand-transition>
        <div v-if="discount">
          <v-expansion-panels
            :dark="!light"
            :model-value="has_discount_period ? 0 : null"
            class="mt-5"
            style="border-radius: 18px; overflow: hidden"
            @update:model-value="(val) => (has_discount_period = val === 0)"
          >
            <v-expansion-panel
              :style="{ 'background-color': light ? '#eee' : '#1e1e1ea8' }"
              elevation="0"
            >
              <v-expansion-panel-title color="transparent">
                <v-icon class="flex-grow-0 me-2"
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
                  v-model="dis_start"
                  :label="$t('add_product.pricing.start_input')"
                  :max="dis_end"
                  :placeholder="
                    $t('add_product.pricing.start_input_placeholder')
                  "
                  class="mt-2"
                  clearable
                  color="#C2185B"
                  prepend-inner-icon="play_arrow"
                  return-utc
                  @update:model-value="setValue('dis_start', dis_start)"
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
                  @update:model-value="setValue('dis_end', dis_end)"
                />

                <u-time-progress-bar
                  :class="{ 'text-white': !light }"
                  :created-time="created_at"
                  :end-time="dis_end"
                  :start-time="dis_start"
                  class="my-2"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-expand-transition>
    </v-sheet>

    <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Add/Edit extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->
    <template v-if="(isPhysical || isVirtual) && !isMarketplace">
      <div class="widget-buttons">
        <v-btn
          color="primary"
          size="x-large"
          variant="text"
          @click="showAddExtraPrice"
        >
          <div>
            <b class="d-block">
              <v-icon start>add</v-icon>
              {{ $t("add_product.pricing.extra_pricings.title") }}</b
            >
            <small>{{
              $t("add_product.pricing.extra_pricings.subtitle")
            }}</small>
          </div>
        </v-btn>
      </div>
      <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Add extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->
      <extra-pricing-levels
        v-if="extra_pricings_to_show?.length"
        :extra-pricings="extra_pricings_to_show"
        :product="product ? product : customObject"
        class="max-w-250 mx-auto"
      ></extra-pricing-levels>
      <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <v-table
        v-if="extra_pricings_to_show?.length"
        class="max-widget-width mx-auto bg-transparent"
        density="compact"
      >
        <template v-slot:default>
          <thead>
            <tr>
              <th>Min Qty</th>
              <th>
                {{ $t("global.commons.price") }}
                <small class="d-block">After discount</small>
              </th>
              <th>
                {{ $t("global.commons.discount") }}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <b-product-extra-pricing-row
              v-for="(extra_price, i) in extra_pricings_to_show"
              :key="extra_price.id"
              :all-extra-pricings="extra_pricings_to_show"
              :color="getColor(i)"
              :extra-pricing="extra_price"
              :product="product"
              :shop="shop"
              light
              @onDelete="
                (id) => {
                  DeleteItemByID(product.extra_pricings, id);
                  forceupdate();
                }
              "
              @select="showEditExtraPricing(extra_price)"
            ></b-product-extra-pricing-row>
          </tbody>
        </template>
      </v-table>

      <!-- Extra pricing add/edit dialog -->
      <b-product-extra-pricing-add
        v-if="selected_extra_price"
        v-model="show_add_extra_price"
        :all-extra-pricings="extra_pricings_to_show"
        :extra-pricing="selected_extra_price"
        :product="product"
        :shop="shop"
        :transparent="transparent"
        :variant="variant"
        :vendor="vendor"
        :vendor-product="vendorProduct"
        light
        @onAdd="
          (val) => {
            AddOrUpdateItemByID(product.extra_pricings, val);
            forceupdate();
          }
        "
        @onEdit="(val) => AddOrUpdateItemByID(product.extra_pricings, val)"
      ></b-product-extra-pricing-add>
    </template>

    <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

    <s-widget-buttons
      v-if="hasButtonNext"
      auto-fixed-position
      class="mb-5 mt-12"
    >
      <v-btn
        :class="{ disabled: calculatePrice < 0 }"
        :loading="busy"
        color="primary"
        size="x-large"
        variant="elevated"
        @click="$emit('next')"
      >
        {{ $t("global.actions.save_continue") }}

        <v-icon end>
          {{ $t("icons.arrow_end") }}
        </v-icon>
      </v-btn>
    </s-widget-buttons>

    <!-- ----------------- Instance Mode ----------------- -->

    <template v-if="instanceMode">
      <div v-if="customObject.variant_id" class="widget-box my-5">
        <v-list-subheader class="text-start"
          >{{ $t("add_product.pricing.variant_pricing_message") }}
        </v-list-subheader>

        <div class="c-container -force-rounded flex-row">
          <div
            :class="{ selected: variant_pricing }"
            class="selection-box"
            @click="variant_pricing = true"
          >
            {{ $t("add_product.pricing.independent_price") }}
          </div>

          <div
            :class="{ selected: !variant_pricing }"
            class="selection-box"
            @click="variant_pricing = false"
          >
            {{ $t("add_product.pricing.same_price") }}
          </div>
        </div>
      </div>

      <s-widget-buttons v-if="!externalActionButtons">
        <v-btn
          :loading="busy_update"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="setProductPrice()"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </s-widget-buttons>
    </template>
  </div>
</template>

<script>
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductExtraPricingAdd from "../../../product/extra-pricings/add/BProductExtraPricingAdd.vue";
import ExtraPricingLevels from "../../../extra-pricing/ExtraPricingLevels.vue";
import BProductExtraPricingRow from "../../../product/extra-pricings/row/BProductExtraPricingRow.vue";
import { standardDesignColor } from "@selldone/core-js/helper/color/ColorGenerator";
import { PriceHelper } from "@selldone/core-js/helper/price/PriceHelper";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";

export default {
  name: "BProductEditPrice",
  components: {
    SWidgetButtons,
    BProductExtraPricingRow,
    ExtraPricingLevels,
    BProductExtraPricingAdd,
    UTimeProgressBar,
    UDateInput,
    UCurrencyInput,
    UPriceInput,
  },
  emits: ["update:instance", "next"],
  props: {
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
      required: false,
      type: Object,
    },

    variant: {
      // Used just in extra pricing! maybe we used it in other places
      required: false,
      type: Object,
    },

    customObject: {
      required: false,
      type: Object,
    },
    hasButtonNext: {
      required: false,
      type: Boolean,
      default: false,
    },
    transparent: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },

    externalActionButtons: {
      type: Boolean,
      default: false,
    },

    busy: {},

    //-----------Instance Product Price Update---------- (+++)
    instanceMode: {
      type: Boolean,
      default: false,
    },
    instanceOriginalProduct: {},
    instanceObject: {},
    instanceProductId: {},
    instanceVariantId: {}, // Inventory management mode
    instanceVariantPricing: {}, // Set for variant pricing (Independent from product)

    //---------------------------------------------------

    // ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀
    isMarketplace: {
      // Marketplace pricing in vendor tab!
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    PricingTypes: PricingTypes,
    pricing: PricingTypes.FIX.code,

    price: 0,
    currency: null,
    commission: 0,
    discount: 0,

    dis_start: "",
    dis_end: "",
    created_at: "",

    price_label: null,

    has_discount_period: false,

    show_commission: false,
    show_price_label: false,

    //-----------Instance Product Price Update---------- (+++)
    variant_pricing: false,
    busy_update: false,
    //---------------------------------------------------

    type: ProductType.PHYSICAL.code,

    //---------------------------------------------------
    show_add_extra_price: false,
    selected_extra_price: null,

    random: 0, //Fix update issue!
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    CURRENT_ITEM() {
      return this.customObject ? this.customObject : this.product;
    },

    isVirtual() {
      return this.type === ProductType.VIRTUAL.code;
    },
    isPhysical() {
      return this.type === ProductType.PHYSICAL.code;
    },

    isFile() {
      return this.type === ProductType.FILE.code;
    },
    isService() {
      return this.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return (
        this.product && this.product.type === ProductType.SUBSCRIPTION.code
      );
    },

    available_pricing() {
      if (this.isService)
        return [
          PricingTypes.FIX,
          PricingTypes.AGREEMENT,
          PricingTypes.ESTIMATION,
        ];

      return [PricingTypes.FIX];
    },

    currencyObject() {
      return this.currency;
    },

    calculatePrice() {
      try {
        return PriceHelper.priceProductByCurrency(
          this.shop,
          {
            price: this.price,
            currency: this.currency?.code,
            commission: this.commission,
            discount: this.discount,
          },
          null,
          this.currency?.code,
        );
      } catch (e) {
        console.error("Price", e);
        return "🚨";
      }
    },
    discount_percent() {
      try {
        return PriceHelper.discountProductPercent(
          this.shop,
          {
            price: this.price,
            currency: this.currency?.code,
            commission: this.commission,
            discount: this.discount,
          },
          null,
        );
      } catch (e) {
        console.error("Discount", e);
        return "🚨";
      }
    },

    currencies() {
      let out = [];
      for (let key in Currency) {
        let item = Currency[key];
        if (item.enable) out.push(item);
      }
      return out;
    },

    // 🌸 Extra pricing 🌸
    extra_pricings() {
      const random = this.random; //Fix update issue!
      return (
        this.product ? this.product : this.customObject
      ).extra_pricings?.sortByKey("min", true);
    },
    extra_pricings_to_show() {
      const variant_id = this.instanceVariantId
        ? this.instanceVariantId /*Inventory management mode*/
        : this.variant?.id; // For a variant
      const vendor_id = this.vendor?.id; // In vendor panel
      return this.extra_pricings
        ?.filter((x) =>
          variant_id ? x.variant_id === variant_id : !x.variant_id,
        ) // Just for current variant! null: added for variant
        .filter((x) => (vendor_id ? x.vendor_id === vendor_id : !x.vendor_id)); // Just for current vendor - null: added by marketplace owner in the product pricing page
    },

    subtitle() {
      return this.isMarketplace
        ? this.$t("add_product.pricing.subtitle.marketplace")
        : this.isSubscription
          ? this.$t("add_product.pricing.subtitle.subscription")
          : this.isService
            ? this.$t("add_product.pricing.subtitle.service")
            : this.isFile
              ? this.$t("add_product.pricing.subtitle.file")
              : this.$t("add_product.pricing.subtitle.default");
    },
  },

  watch: {
    variant_pricing(val) {
      if (!val) this.setSameAsProduct();
    },

    has_discount_period(value) {
      if (!value) {
        this.dis_start = null;
        this.dis_end = null;

        this.setValue("dis_start", null);
        this.setValue("dis_end", null);
      }
    },
  },
  created() {
    this.type = this.customObject?.type
      ? this.customObject.type
      : this.product.type;

    this.pricing = this.customObject
      ? this.customObject.pricing
      : this.product.pricing;

    this.price = this.customObject
      ? this.customObject.price
      : this.product.price;
    this.currency = this.GetCurrency(this.CURRENT_ITEM.currency);
    if (!this.currency) this.currency = this.GetUserSelectedCurrency(); // Only for BUG situation!

    this.commission = this.customObject
      ? this.customObject.commission
      : this.product.commission;
    this.discount = this.customObject
      ? this.customObject.discount
      : this.product.discount;

    // Convert UTC to local time for picker!
    this.dis_start = this.customObject
      ? this.customObject.dis_start
      : this.product.dis_start;
    this.dis_end = this.customObject
      ? this.customObject.dis_end
      : this.product.dis_end;

    this.created_at = this.customObject
      ? this.customObject.created_at
      : this.product.created_at;

    this.has_discount_period = this.dis_start != null || this.dis_end != null;

    this.price_label = this.customObject
      ? this.customObject.price_label
      : this.product.price_label;

    //-----------Instance Product Price Update---------- (+++)
    if (this.instanceMode) {
      this.variant_pricing = this.instanceVariantPricing;
    }
  },

  methods: {
    setValue(key, value) {
      //   console.log('setValue',key,value)
      if (this.customObject) this.customObject[key] = value;
      else this.product[key] = value;
    },

    setSameAsProduct() {
      if (!this.instanceMode) return;

      this.price = this.instanceOriginalProduct.price;
      this.currency = Currency[this.instanceOriginalProduct.currency];
      this.commission = this.instanceOriginalProduct.commission;
      this.dis_start = this.instanceOriginalProduct.dis_start;
      this.dis_end = this.instanceOriginalProduct.dis_end;
      this.price_label = this.instanceOriginalProduct.price_label;

      // console.log('setSameAsProduct',this.instanceOriginalProduct)
    },

    /**
     * Important: Do not change the method name! It's used externally.
     */
    setProductPrice() {
      if (!this.instanceMode) return;

      this.busy_update = true;

      let pricing = null;
      if (this.instanceVariantId) {
        pricing = this.variant_pricing; // Set for variant pricing (Independent from product)
      } else {
        pricing = this.pricing;
      }

      const params = {
        price: this.price,
        currency: this.currency.code,
        commission: this.commission,
        discount: this.discount,
        dis_start: this.dis_start,
        dis_end: this.dis_end,
        price_label: this.price_label,

        pricing: pricing,
      };

      axios
        .put(
          window.API.PUT_EDIT_PRODUCT_PRICE(
            this.shop.id,
            this.instanceProductId,
            this.instanceVariantId,
          ),
          params,
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("update:instance", params);
            this.showSuccessAlert(null, "The product price updated.");

            //----------------------------------------------

            // Update instance object:
            this.instanceObject.pricing = params.pricing;
            this.instanceObject.price = params.price;
            this.instanceObject.currency = params.currency;
            this.instanceObject.commission = params.commission;
            this.instanceObject.discount = params.discount;
            this.instanceObject.dis_start = params.dis_start;
            this.instanceObject.dis_end = params.dis_end;
            this.instanceObject.price_label = params.price_label;

            // Update for product:
            if (this.instanceObject.product) {
              Object.assign(this.instanceOriginalProduct, data.product);
            }

            // Update for variant:
            if (this.instanceObject.product.variant) {
              Object.assign(this.instanceObject.variant, data.variant);
            }

            //----------------------------------------------
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update = false;
        });
    },

    //━━━━━━━━━━━━━━━━━━━━━ 🌸 extra pricing 🌸 ━━━━━━━━━━━━━━━━━━━━━
    showAddExtraPrice() {
      const max_minimum_quantity = this.extra_pricings_to_show?.maxByKey("min");
      this.selected_extra_price = {
        min: (max_minimum_quantity?.min ? max_minimum_quantity.min : 1) * 10,

        price: this.CURRENT_ITEM.price,
        commission: this.CURRENT_ITEM.commission,
        discount: this.CURRENT_ITEM.discount,
        dis_start: this.CURRENT_ITEM.dis_start,
        dis_end: this.CURRENT_ITEM.dis_end,
      };
      this.show_add_extra_price = true;
    },
    showEditExtraPricing(extra_price) {
      this.selected_extra_price = extra_price;
      this.show_add_extra_price = true;
    },

    forceupdate() {
      this.random = Math.random();
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    getColor(i) {
      return standardDesignColor[i % standardDesignColor.length];
    },
  },
};
</script>

<style lang="scss" scoped>
.price-input-form {
  color: white;
  font-weight: 400;
  background-image: linear-gradient(-60deg, #00796b 0%, #009688 100%);

  border-style: solid;
  padding: 8px;
  border-radius: 24px;
  border-width: 0px;
  border-color: #5271c4;

  &.-transparent {
    background: transparent;
  }

  &.light {
    color: #222;
  }
}

.discount-date-picker {
  transition: 0.3s all ease-out;
  background-color: white;
  border-radius: 24px;
  margin-top: 12px;
  padding: 8px;
}

.price-input {
  max-width: 420px;
  margin: 12px auto;
}
</style>

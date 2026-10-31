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
  <component
    :is="workspaceMode ? 'VDialog' : 'VBottomSheet'"
    :max-width="workspaceMode ? 610 : modern ? 560 : 840"
    :model-value="modelValue"
    :theme="modern ? undefined : light ? 'light' : 'dark'"
    :content-class="modern ? undefined : 'rounded-t-xl'"
    scrollable
    :width="workspaceMode ? 'calc(100vw - 32px)' : '98vw'"
    :persistent="workspaceMode && busy"
    @update:model-value="updateDialog"
  >
    <v-card
      :color="modern ? 'surface' : light ? '#fff' : '#111'"
      :title="
        modern
          ? undefined
          : $t('extra_pricing_add_dialog.title', {
              min: clone_extra_pricing.min,
            })
      "
      class="rounded-t-xl text-start"
      :class="{
        'sd-modern-widget b-product-extra-pricing-add': modern,
        'b-product-extra-pricing-add--workspace': workspaceMode,
      }"
      :prepend-icon="modern ? undefined : 'money'"
    >
      <header v-if="modern" class="b-product-extra-pricing-add__header">
        <b-product-edit-info-icon
          v-if="workspaceMode"
          name="Layers"
          :size="20"
        />
        <h2>
          {{
            workspaceMode
              ? $t(
                  clone_extra_pricing.id
                    ? "add_product.pricing.workspace.tier_edit_title"
                    : "add_product.pricing.workspace.tier_add_title",
                )
              : clone_extra_pricing.id
                ? $t("add_product.pricing.modern.quantity_pricing")
                : $t("add_product.pricing.modern.add_tier")
          }}
        </h2>
        <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="sd-modern-icon-button"
              :aria-label="$t('global.actions.close')"
              icon
              variant="text"
              :disabled="workspaceMode && busy"
              @click="closeDialog"
              ><b-product-edit-info-icon
                v-if="workspaceMode"
                name="X"
                :size="16"
              /><v-icon v-else size="16" aria-hidden="true"
                >close</v-icon
              ></v-btn
            >
          </template>
          {{ $t("global.actions.close") }}
        </v-tooltip>
      </header>
      <v-card-text :class="{ 'b-product-extra-pricing-add__body': modern }">
        <p v-if="modern" class="b-product-extra-pricing-add__help">
          {{
            $t(
              workspaceMode
                ? "add_product.pricing.workspace.tier_intro"
                : "add_product.pricing.modern.tier_rules",
            )
          }}
        </p>
        <div v-else class="pb-5">
          {{ $t("extra_pricing_add_dialog.subtitle") }}
        </div>

        <div v-if="workspaceMode" class="b-product-extra-pricing-add__context">
          <v-avatar v-if="product.icon" size="32" rounded
            ><v-img :src="getShopImagePath(product.icon)" alt="" /></v-avatar
          ><b-product-edit-info-icon
            v-else
            name="PackageOpen"
            :size="20"
          /><span>{{ product.title }}</span
          ><bdi>{{ currency }}</bdi>
        </div>
        <div :class="{ 'b-product-extra-pricing-add__fields': modern }">
          <u-number-input
            v-model="clone_extra_pricing.min"
            :dark="modern ? undefined : !light"
            :label="
              $t(
                workspaceMode
                  ? 'add_product.pricing.workspace.minimum_quantity'
                  : modern
                    ? 'add_product.pricing.modern.minimum_quantity'
                    : 'extra_pricing_add_dialog.min_quantity',
              )
            "
            :min="2"
            :disabled="workspaceMode && (disabled || busy)"
            :messages="
              workspaceMode
                ? $t('add_product.pricing.workspace.tier_minimum_help')
                : undefined
            "
            :text-center="false"
            class="sm-suffix price-input strong-field"
            :class="{ 'sd-modern-underlined-field': modern }"
            required
            variant="underlined"
          ></u-number-input>

          <u-price-input
            v-model="clone_extra_pricing.price"
            :dark="modern ? undefined : !light"
            :decimal="currencyObject.floats"
            :disabled="
              !!vendorProduct?.pricing || (workspaceMode && (disabled || busy))
            "
            :label="
              vendorProduct
                ? 'Marketplace price'
                : $t(
                    workspaceMode
                      ? 'add_product.pricing.workspace.tier_price'
                      : 'add_product.pricing.price_input',
                  )
            "
            :suffix="currencyName"
            class="sm-suffix price-input strong-field"
            :class="{ 'sd-modern-underlined-field': modern }"
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
              :disabled="workspaceMode && (disabled || busy)"
              :dark="modern ? undefined : !light"
              :decimal="currencyObject.floats"
              :suffix="currencyName"
              class="sm-suffix price-input strong-field"
              :class="{ 'sd-modern-underlined-field': modern }"
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
              v-if="
                !modern && !show_commission && !clone_extra_pricing.commission
              "
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
            <div
              v-if="modern || show_commission || clone_extra_pricing.commission"
            >
              <u-price-input
                v-model="clone_extra_pricing.commission"
                :disabled="workspaceMode && (disabled || busy)"
                :dark="modern ? undefined : !light"
                :decimal="currencyObject.floats"
                :label="
                  $t(
                    workspaceMode
                      ? 'add_product.pricing.workspace.tier_commission'
                      : 'add_product.pricing.commission_input',
                  )
                "
                :suffix="currencyName"
                class="sm-suffix price-input strong-field"
                :class="{ 'sd-modern-underlined-field': modern }"
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
            :disabled="workspaceMode && (disabled || busy)"
            :dark="modern ? undefined : !light"
            :decimal="currencyObject.floats"
            :label="
              $t(
                workspaceMode
                  ? 'add_product.pricing.workspace.tier_discount'
                  : 'add_product.pricing.discount_input',
              )
            "
            :messages="`${$t(
              'add_product.pricing.discount_input_message',
            )}: ${discount_percent}%`"
            :suffix="currencyName"
            class="sm-suffix price-input strong-field my-5"
            :class="{ 'sd-modern-underlined-field': modern }"
          />
        </div>

        <div
          v-if="!workspaceMode"
          :class="{ 'b-product-extra-pricing-add__total': modern }"
        >
          <div
            :class="
              modern
                ? 'b-product-extra-pricing-add__preview-label'
                : 'text-center line-height-normal d-flex align-center'
            "
          >
            <div
              v-if="!modern"
              class="flex-grow-1 mx-3"
              style="border-bottom: dashed thin #fff"
            ></div>
            <span class="d-block">
              {{
                workspaceMode
                  ? $t("add_product.pricing.workspace.tier_current_preview")
                  : pricing === PricingTypes.FIX.code
                    ? $t(
                        modern
                          ? "add_product.pricing.modern.after_discount"
                          : "global.commons.final_price",
                      )
                    : $t(
                        modern
                          ? "add_product.pricing.modern.starting_after_discount"
                          : "global.commons.starting_price",
                      )
              }}
            </span>
            <div
              v-if="!modern"
              class="flex-grow-1 mx-3"
              style="border-bottom: dashed thin #fff"
            ></div>
          </div>

          <div
            :class="
              modern
                ? 'b-product-extra-pricing-add__preview'
                : 'text-center my-3'
            "
          >
            <u-price
              :amount="calculatePrice"
              :class="{ 'text-danger': !modern && calculatePrice <= 0 }"
              :currency="currency"
              :x-large="!modern"
            >
            </u-price>
            <span v-if="price_label" class="ms-2">{{ price_label }}</span>
          </div>
        </div>
        <p
          v-if="modern && calculatePrice < 0"
          class="b-product-extra-pricing-add__warning"
          role="alert"
        >
          <v-icon size="16" color="error" aria-hidden="true"
            >error_outline</v-icon
          >{{
            $t(
              workspaceMode
                ? "add_product.pricing.workspace.tier_negative"
                : "add_product.pricing.modern.negative_total",
            )
          }}
        </p>

        <div
          v-if="workspaceMode && clone_extra_pricing.discount"
          class="b-product-extra-pricing-add__workspace-schedule"
        >
          <u-smart-toggle
            v-model="has_discount_period"
            :disabled="disabled || busy"
            accessible
            false-gray
            :true-title="$t('add_product.pricing.workspace.tier_schedule')"
            :false-title="$t('add_product.pricing.workspace.tier_schedule')"
            :true-description="
              $t('add_product.pricing.workspace.tier_schedule_help')
            "
            :false-description="
              $t('add_product.pricing.workspace.tier_schedule_help')
            "
          />
          <div
            v-if="has_discount_period"
            class="b-product-extra-pricing-add__fields b-product-extra-pricing-add__workspace-dates"
          >
            <u-date-input
              v-model="clone_extra_pricing.dis_start"
              :disabled="disabled || busy"
              :label="$t('add_product.pricing.start_input')"
              :max="clone_extra_pricing.dis_end"
              class="sd-modern-underlined-field"
              clearable
              return-utc
            />
            <u-date-input
              v-model="clone_extra_pricing.dis_end"
              :disabled="!clone_extra_pricing.dis_start || disabled || busy"
              :label="$t('add_product.pricing.end_input')"
              :min="clone_extra_pricing.dis_start"
              class="sd-modern-underlined-field"
              clearable
              return-utc
            />
          </div>
        </div>
        <v-expand-transition v-if="!workspaceMode">
          <div v-if="clone_extra_pricing.discount">
            <v-expansion-panels
              :dark="modern ? undefined : !light"
              :model-value="has_discount_period ? 0 : null"
              class="mt-5 mx-auto"
              :class="{ 'b-product-extra-pricing-add__schedule': modern }"
              style="border-radius: 18px; overflow: hidden; max-width: 560px"
              @update:model-value="(val) => (has_discount_period = val === 0)"
              :disabled="workspaceMode && (disabled || busy)"
            >
              <v-expansion-panel
                :style="
                  modern
                    ? undefined
                    : { 'background-color': light ? '#eee' : '#1e1e1ea8' }
                "
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
                    $t(
                      workspaceMode
                        ? "add_product.pricing.workspace.tier_schedule"
                        : "add_product.pricing.has_discount_period_input",
                    )
                  }}</span>

                  <v-chip
                    v-if="is_finished_discount"
                    :color="modern ? undefined : '#000'"
                    size="small"
                    variant="flat"
                  >
                    {{ $t("global.commons.finished") }}
                  </v-chip>
                </v-expansion-panel-title>
                <v-expansion-panel-text color="transparent">
                  <p class="text-start">
                    <v-icon>arrow_drop_down</v-icon>
                    {{ $t("add_product.pricing.discount_timespan") }}
                  </p>

                  <u-date-input
                    v-model="clone_extra_pricing.dis_start"
                    :disabled="workspaceMode && (disabled || busy)"
                    :label="$t('add_product.pricing.start_input')"
                    :max="clone_extra_pricing.dis_end"
                    :placeholder="
                      $t('add_product.pricing.start_input_placeholder')
                    "
                    class="mt-2"
                    :class="{ 'sd-modern-underlined-field': modern }"
                    clearable
                    :color="modern ? 'primary' : '#C2185B'"
                    prepend-inner-icon="play_arrow"
                    return-utc
                  />
                  <u-date-input
                    v-model="clone_extra_pricing.dis_end"
                    :disabled="
                      !clone_extra_pricing.dis_start ||
                      (workspaceMode && (disabled || busy))
                    "
                    :label="$t('add_product.pricing.end_input')"
                    :min="clone_extra_pricing.dis_start"
                    :placeholder="
                      $t('add_product.pricing.end_input_placeholder')
                    "
                    class="mt-2"
                    :class="{ 'sd-modern-underlined-field': modern }"
                    clearable
                    :color="modern ? 'primary' : '#C2185B'"
                    prepend-inner-icon="stop"
                    return-utc
                  />

                  <u-time-progress-bar
                    :class="{ 'text-white': !modern && !light }"
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
        <template v-if="workspaceMode"
          ><div class="b-product-extra-pricing-add__total">
            <span class="b-product-extra-pricing-add__preview-label">{{
              $t("add_product.pricing.workspace.tier_current_preview")
            }}</span>
            <div class="b-product-extra-pricing-add__preview">
              <u-price :amount="calculatePrice" :currency="currency" /><span
                v-if="price_label"
                >{{ price_label }}</span
              >
            </div>
          </div>
          <p class="b-product-extra-pricing-add__preview-help">
            {{ $t("add_product.pricing.workspace.tier_preview_help") }}
          </p></template
        >
        <p
          v-if="workspaceMode && validationError"
          class="b-product-extra-pricing-add__validation"
          role="alert"
        >
          <b-product-edit-info-icon name="CircleAlert" :size="16" />{{
            validationError
          }}
        </p>
      </v-card-text>
      <v-card-actions
        :class="{
          'sd-modern-form-actions b-product-extra-pricing-add__actions': modern,
        }"
      >
        <div
          :class="
            modern ? 'b-product-extra-pricing-add__buttons' : 'widget-buttons'
          "
        >
          <v-btn
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            :variant="modern ? 'outlined' : 'text'"
            :disabled="workspaceMode && busy"
            @click="closeDialog"
          >
            <v-icon v-if="!modern" start>close</v-icon>
            {{ $t(modern ? "global.actions.cancel" : "global.actions.close") }}
          </v-btn>
          <v-btn
            v-if="clone_extra_pricing.id"
            :loading="busy_save"
            :disabled="workspaceMode && (disabled || !!validationError)"
            color="primary"
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
            variant="elevated"
            @click="editExtraPricing"
          >
            <template v-if="workspaceMode" #prepend
              ><b-product-edit-info-icon name="Save" :size="16" /></template
            ><v-icon v-if="!workspaceMode" start>save</v-icon>
            {{
              $t(
                workspaceMode
                  ? "add_product.pricing.workspace.tier_save"
                  : modern
                    ? "add_product.pricing.modern.save_tier"
                    : "global.actions.save",
              )
            }}
          </v-btn>
          <v-btn
            v-else
            :loading="busy_save"
            :disabled="workspaceMode && (disabled || !!validationError)"
            color="primary"
            :size="modern ? 'default' : 'x-large'"
            :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
            variant="elevated"
            @click="addExtraPricing"
          >
            <template v-if="workspaceMode" #prepend
              ><b-product-edit-info-icon name="Save" :size="16" /></template
            ><v-icon v-if="!workspaceMode" start>{{
              modern ? "save" : "add"
            }}</v-icon>
            {{
              $t(
                workspaceMode
                  ? "add_product.pricing.workspace.tier_save"
                  : modern
                    ? "add_product.pricing.modern.save_tier"
                    : "global.actions.add",
              )
            }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </component>
</template>

<script lang="ts">
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import UDateInput from "../../../../ui/date/input/UDateInput.vue";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import { DateConverter } from "@selldone/core-js";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { VDialog, VBottomSheet } from "vuetify/components";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default {
  name: "BProductExtraPricingAdd",
  mixins: [CurrencyMixin, ProductMixin],

  components: {
    VDialog,
    VBottomSheet,
    BProductEditInfoIcon,
    UNumberInput,
    USmartToggle,
    UDateInput,
    UTimeProgressBar,
    UPriceInput,
  },
  emits: ["update:modelValue", "onAdd", "onEdit", "onDelete", "activity"],
  props: {
    modern: { type: Boolean, default: false },
    workspace: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
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
    dialogActivator: null,
  }),

  computed: {
    workspaceMode() {
      return this.modern && this.workspace;
    },
    busy() {
      return this.busy_save || this.busy_delete;
    },
    validationError() {
      if (!this.workspaceMode || !this.clone_extra_pricing) return null;
      const minimum = Number(this.clone_extra_pricing.min),
        tiers = this.allExtraPricings || [];
      if (!Number.isInteger(minimum) || minimum < 2)
        return this.$t("add_product.pricing.workspace.tier_min_invalid");
      if (
        tiers.some(
          (tier) =>
            Number(tier.id) !== Number(this.clone_extra_pricing.id) &&
            Number(tier.min) === minimum,
        )
      )
        return this.$t("add_product.pricing.workspace.tier_min_duplicate");
      if (!this.clone_extra_pricing.id && tiers.length >= 10)
        return this.$t("add_product.pricing.workspace.tier_limit");
      const { dis_start, dis_end } = this.clone_extra_pricing;
      if (
        dis_start &&
        dis_end &&
        new Date(dis_end).getTime() < new Date(dis_start).getTime()
      )
        return this.$t("add_product.pricing.workspace.tier_dates_invalid");
      return null;
    },
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

          dis_start: this.clone_extra_pricing.dis_start,
          dis_end: this.clone_extra_pricing.dis_end,
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

    is_finished_discount() {
      return (
        (this.clone_extra_pricing?.dis_start ||
          this.clone_extra_pricing?.dis_end) &&
        !DateConverter.inBetweenDates(
          new Date(),
          DateConverter.convertToLocalTime(this.clone_extra_pricing.dis_start),
          DateConverter.convertToLocalTime(this.clone_extra_pricing.dis_end),
        )
      );
    },
  },

  watch: {
    busy: {
      immediate: true,
      handler(value) {
        if (!this.workspaceMode) return;
        this.$emit("activity", value);
        if (!value && !this.modelValue) this.restoreDialogFocus();
      },
    },
    modelValue: {
      immediate: true,
      handler(value) {
        if (!this.workspaceMode) return;
        if (value) {
          this.dialogActivator =
            typeof document !== "undefined" ? document.activeElement : null;
          this.init();
        } else if (!this.busy) this.restoreDialogFocus();
      },
    },
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
    updateDialog(value) {
      if (this.workspaceMode && this.busy) return;
      this.$emit("update:modelValue", value);
    },
    closeDialog() {
      this.updateDialog(false);
    },
    restoreDialogFocus() {
      const activator = this.dialogActivator;
      if (!activator) return;
      this.$nextTick(() => {
        if (activator.isConnected && !activator.disabled)
          activator.focus({ preventScroll: true });
        this.dialogActivator = null;
      });
    },
    init() {
      this.clone_extra_pricing = Object.assign({}, this.extraPricing);

      this.has_discount_period =
        this.clone_extra_pricing.dis_start || this.clone_extra_pricing.dis_end;
    },

    addExtraPricing() {
      if (
        this.workspaceMode &&
        (this.disabled || this.busy || this.validationError)
      )
        return;
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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("onAdd", data.extra_pricing);
            this.$emit("update:modelValue", false);
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("add_product.pricing.modern.tier_added")
                : "The product extra pricing added.",
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    editExtraPricing() {
      if (
        this.workspaceMode &&
        (this.disabled || this.busy || this.validationError)
      )
        return;
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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("onEdit", data.extra_pricing);
            this.$emit("update:modelValue", false);
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("add_product.pricing.modern.tier_updated")
                : "The product extra pricing updated.",
            );

            //----------------------------------------------
            Object.assign(this.extraPricing, data.extra_pricing);
            //----------------------------------------------
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    showDelete() {
      NotificationService.openDangerAlert(
        this.modern
          ? this.$t("add_product.pricing.modern.delete_tier_title")
          : "Delete extra pricing",
        this.modern
          ? this.$t("add_product.pricing.modern.delete_tier_help")
          : "Are you certain you want to permanently remove this additional pricing?",
        this.modern ? this.$t("global.actions.delete") : "Yes, Delete now",
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
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.$emit("onDelete", data.id);
            this.$emit("close");
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("add_product.pricing.modern.tier_deleted")
                : "The product extra pricing has been deleted.",
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
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

.b-product-extra-pricing-add {
  --sd-modern-icon-button-size: 32px;
  padding: 0 !important;
  border-radius: 18px !important;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  line-height: 22px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px;
    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
  }
  &__body {
    padding: 8px 20px 20px !important;
  }
  &__help {
    margin: 0 0 20px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 18px 20px;
  }
  &__fields > * {
    min-width: 0;
  }
  .price-input {
    width: 100%;
    max-width: none;
    margin: 0 !important;
  }
  :deep(.sd-modern-underlined-field .v-field__input),
  :deep(.sd-modern-underlined-field .v-field__input > input),
  :deep(.sd-modern-underlined-field .v-select__selection-text) {
    font-family: inherit;
    font-size: 16px !important;
    font-weight: 400 !important;
    line-height: 24px;
  }
  :deep(.sd-modern-underlined-field .v-field-label) {
    font-size: 13px !important;
    font-weight: 400 !important;
    line-height: 20px !important;
  }
  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    padding-block-start: 20px;
  }
  &__preview-label {
    font-size: 13px;
    line-height: 20px;
  }
  &__preview {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px;
  }
  &__preview :deep(.u--price) {
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
  }
  &__warning {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 12px 0 0;
    font-size: 13px;
    line-height: 20px;
  }
  &__schedule :deep(.v-expansion-panel) {
    background: rgb(var(--v-theme-surface));
    border: 1px solid var(--sd-modern-border);
  }
  &__schedule :deep(.v-expansion-panel-title) {
    min-height: 48px;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 20px;
  }
  &__schedule :deep(.v-expansion-panel-text__wrapper) {
    padding: 0 14px 16px;
  }
  &__actions {
    padding: 14px 20px !important;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  &__buttons :deep(> .v-btn) {
    --v-btn-height: 42px;
    flex: 0 0 auto !important;
    order: 0 !important;
    width: auto !important;
    min-height: 42px !important;
    height: auto !important;
    margin: 0 !important;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  .sd-modern-icon-button:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  @media (max-width: 600px) {
    &__fields {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 799px), (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
    &__buttons :deep(> .v-btn) {
      --v-btn-height: 44px;
      min-height: 44px !important;
    }
  }
}
.b-product-extra-pricing-add--workspace {
  .b-product-extra-pricing-add__header {
    padding: 23px 23px 14px;
    h2 {
      flex: 1;
      font-size: 18px;
      line-height: 26px;
    }
    > svg {
      flex-shrink: 0;
      color: var(--sd-modern-muted);
    }
  }
  .b-product-extra-pricing-add__body {
    padding: 0 23px 23px !important;
  }
  .b-product-extra-pricing-add__help {
    margin-block-end: 18px;
    font-size: 13px;
    line-height: 21px;
  }
  .b-product-extra-pricing-add__context {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-block-end: 24px;
    font-size: 12px;
    line-height: 19px;
    > span {
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    > bdi {
      color: var(--sd-modern-muted);
    }
  }
  .b-product-extra-pricing-add__fields {
    gap: 19px 23px;
  }
  .b-product-extra-pricing-add__total {
    margin-block-start: 23px;
    padding-block-start: 17px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  .b-product-extra-pricing-add__preview-help {
    margin-block: 6px 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  .b-product-extra-pricing-add__actions {
    padding: 17px 23px 20px !important;
  }
  .b-product-extra-pricing-add__workspace-schedule {
    margin-block-start: 23px;
  }
  .b-product-extra-pricing-add__workspace-dates {
    margin-block-start: 16px;
  }
  .b-product-extra-pricing-add__validation {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-block: 17px 0;
    color: rgb(var(--v-theme-on-surface));
    font-size: 13px;
    line-height: 21px;
    > svg {
      flex-shrink: 0;
      margin-block-start: 2px;
      color: rgb(var(--v-theme-error));
    }
  }
  :deep(.sd-modern-underlined-field .v-field__input),
  :deep(.sd-modern-underlined-field .v-field__input > input) {
    font-size: 14px !important;
    line-height: 22px;
  }
  :deep(.s--smart-toggle b) {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  :deep(.s--smart-toggle .small) {
    font-size: 12px;
    line-height: 19px;
  }
  @media (max-width: 600px) {
    .b-product-extra-pricing-add__header {
      padding: 18px 16px 14px;
    }
    .b-product-extra-pricing-add__body {
      padding-inline: 16px !important;
    }
    .b-product-extra-pricing-add__actions {
      padding-inline: 16px !important;
    }
    :deep(.sd-modern-underlined-field .v-field__input),
    :deep(.sd-modern-underlined-field .v-field__input > input) {
      font-size: 16px !important;
    }
  }
}
</style>

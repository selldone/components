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
    class="text-center"
    :class="{
      'b-extra-pricing-levels--modern': modern,
      'b-extra-pricing-levels--workspace': workspaceMode,
    }"
  >
    <ol
      v-if="workspaceMode"
      class="b-extra-pricing-levels__path text-start"
      :aria-label="$t('add_product.pricing.workspace.quantity_title')"
    >
      <li v-for="item in sorted_list" :key="item.id ?? 'base'" tabindex="0">
        <strong
          ><u-price
            :amount="item.price + item.commission - item.discount"
            :currency="product.currency" /></strong
        ><span>{{ numeralFormat(item.min, "0,0") }}+</span>
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-focus
          open-on-click
        >
          <div>
            {{ $t("extra_pricing_levels.min_quantity") }}:
            {{ numeralFormat(item.min, "0,0") }}
          </div>
          <div>
            {{ $t("global.commons.price") }}:
            <u-price :amount="item.price" :currency="product.currency" />
          </div>
          <div>
            {{ $t("add_product.pricing.commission_input") }}:
            <u-price :amount="item.commission" :currency="product.currency" />
          </div>
          <div>
            {{ $t("global.commons.discount") }}:
            <u-price :amount="item.discount" :currency="product.currency" />
          </div>
        </v-tooltip>
      </li>
    </ol>
    <div v-else :style="{ height: height }" class="exp-container">
      <div
        v-for="(item, i) in sorted_list"
        :key="i"
        :class="{
          disabled: activeExtraPriceId && activeExtraPriceId !== item.id,
        }"
        :style="{
          height: `${Math.round(
            (100 * (item.price - item.discount + item.commission)) / max_price,
          )}%`,
          'flex-grow': `${item.min / max_quantity}`,
          backgroundColor:
            inventoryQuantity !== null && item.min > inventoryQuantity
              ? '#000'
              : getColor(i),
        }"
        class="exp-item"
        :tabindex="modern ? 0 : undefined"
        :role="modern ? 'img' : undefined"
        :aria-label="
          modern
            ? $t('extra_pricing_levels.min_quantity') +
              ': ' +
              numeralFormat(item.min, '0.[0] a')
            : undefined
        "
      >
        <v-tooltip
          activator="parent"
          :max-width="modern ? undefined : 360"
          :content-class="
            modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'
          "
          :location="modern ? 'top' : 'bottom'"
          :open-on-focus="modern ? true : undefined"
          :open-on-click="modern ? true : undefined"
          :persistent="modern ? false : undefined"
        >
          <div>
            {{ $t("extra_pricing_levels.min_quantity") }}:
            <b class="ms-1">{{ numeralFormat(item.min, "0.[0] a") }}</b>
          </div>
          <div>
            {{ $t("global.commons.price") }}:

            <template v-if="originalPricing">
              <u-price
                :amount="originalPricing.price"
                :currency="product.currency"
                class="ms-1"
              ></u-price>
              <v-icon class="mx-2" size="small"
                >{{ $t("icons.arrow_end") }}
              </v-icon>
            </template>

            <u-price
              :amount="item.price"
              :currency="product.currency"
              class="ms-1"
            ></u-price>
          </div>
          <div>
            {{ $t("global.commons.discount") }}:
            <template v-if="originalPricing">
              <u-price
                :amount="originalPricing.discount"
                :currency="product.currency"
                class="ms-1"
              ></u-price>
              <v-icon class="mx-2" size="small"
                >{{ $t("icons.arrow_end") }}
              </v-icon>
            </template>

            <u-price
              :amount="item.discount"
              :currency="product.currency"
              class="ms-1"
            ></u-price>
          </div>
          <div
            v-if="inventoryQuantity !== null && item.min > inventoryQuantity"
          >
            <b>🍁 {{ $t("extra_pricing_levels.range_is_out_of_stock") }}</b>
          </div>
        </v-tooltip>
      </div>
    </div>
    <small v-if="modern && !workspaceMode">{{
      $t(
        "add_product.pricing.modern.tier_count",
        { count: extraPricings.length },
        extraPricings.length,
      )
    }}</small>
    <small v-else-if="!modern">
      <v-icon size="x-small">add</v-icon>
      {{ items.length }}
      {{ $t("extra_pricing_levels.extra_pricings") }}.</small
    >
  </div>
</template>

<script lang="ts">
import { standardDesignColor } from "@selldone/core-js/helper/color/ColorGenerator";

export default {
  name: "ExtraPricingLevels",
  props: {
    modern: { type: Boolean, default: false },
    workspace: { type: Boolean, default: false },
    product: {
      required: true,
      type: Object,
    },
    extraPricings: {
      type: Array,
      required: true,
    },
    /**
     * Original pricing: product, variant, vendorProduct
     */
    originalPricing: {
      type: Object,
    },
    activeExtraPriceId: {},
    height: { default: "24px" },
    inventoryQuantity: { default: null }, // total quantity of item. If provided then gray not valid ranges!
  },
  computed: {
    workspaceMode() {
      return this.modern && this.workspace;
    },
    sorted_list() {
      return this.items.sortByKey("min", true);
    },
    max_price() {
      if (!this.items.length) return 1;

      let max_item = this.items[0];
      this.items.forEach(
        (i) =>
          (max_item =
            i.price + i.commission - i.discount >
            max_item.price + max_item.commission - max_item.discount
              ? i
              : max_item),
      );

      return max_item.price + max_item.commission - max_item.discount;
    },
    max_quantity() {
      return this.items.maxByKey("min")?.min;
    },

    items() {
      if (this.originalPricing)
        return [
          {
            ...this.originalPricing,
            min: 0,
          },
          ...this.extraPricings,
        ];

      return this.extraPricings;
    },
  },
  methods: {
    getColor(i) {
      if (this.originalPricing) {
        if (i === 0) return "#aaa";
        return standardDesignColor[(i - 1) % standardDesignColor.length];
      }
      return standardDesignColor[i % standardDesignColor.length];
    },
  },
};
</script>

<style lang="scss" scoped>
.b-extra-pricing-levels--modern .exp-item:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 3px;
}
.b-extra-pricing-levels--workspace {
  .b-extra-pricing-levels__path {
    display: flex;
    flex-wrap: wrap;
    gap: 15px 0;
    list-style: none;
    padding: 0;
    margin: 0 0 25px;
  }
  li {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding-inline-end: 9px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  li::before {
    content: "";
    height: 2px;
    background: var(--sd-modern-border);
    margin-block-end: 3px;
  }
  strong {
    font-size: 12px;
    font-weight: 500;
    line-height: 19px;
    color: rgb(var(--v-theme-on-surface));
    overflow-wrap: anywhere;
  }
  :deep(.u--price) {
    font-size: inherit;
    line-height: inherit;
  }
  li:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }
  @media (max-width: 600px) {
    li {
      flex: 0 0 33.333%;
    }
  }
}

.exp-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  .exp-item {
    flex-grow: 0;
    background: #eee;
    transition: all 0.3s;
    position: relative;
    margin: 0 1px;
    border-radius: 4px;
    min-width: 4px;

    &:hover {
      transform: scale(1.2);
      z-index: 1;
    }
  }
}
</style>

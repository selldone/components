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
  <v-menu :close-on-content-click="false" :open-on-hover="true" z-index="100">
    <template v-slot:activator="{ props }">
      <component
        :is="modern ? 'button' : 'div'"
        v-bind="props"
        :type="modern ? 'button' : undefined"
        :class="{ 'b-shop-card-products--modern': modern }"
        :aria-label="
          modern
            ? $t('user_dashboard.shops.modern.product_details') +
              ': ' +
              (total_products === null ? '—' : total_products)
            : undefined
        "
      >
        <v-tooltip
          v-if="modern"
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :persistent="false"
          >{{ $t("user_dashboard.shops.modern.product_details") }}</v-tooltip
        >
        <span v-if="modern" class="b-shop-card-products__caption">{{
          $t("user_dashboard.shops.shop_card.products")
        }}</span>
        <h6>
          <i class="fas fa-boxes" />
          {{
            total_products === null
              ? "—"
              : numeralFormat(total_products, "0.[0]a")
          }}
        </h6>

        <p v-if="!modern" class="text-muted mb-0">
          <small>{{ $t("user_dashboard.shops.shop_card.products") }}</small>
        </p>
      </component>
    </template>
    <v-card
      class="p-2"
      :class="{ 'sd-modern-widget text-start': modern }"
      :min-width="modern ? 280 : 300"
      rounded="xl"
    >
      <apexchart
        v-if="has_products"
        :height="250"
        :options="options"
        :series="series"
        type="donut"
      />
      <p v-else class="m-2 text-muted">
        {{ $t("global.commons.no_data") }}
      </p>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BShopCardProducts",
  props: {
    modern: Boolean,
    lastData: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {};
  },

  computed: {
    options() {
      return {
        chart: {
          fontFamily: "var(--font)",
        },
        colors: [
          ...(this.total_products_physical ? [ProductType.PHYSICAL.color] : []),

          ...(this.total_products_virtual ? [ProductType.VIRTUAL.color] : []),

          ...(this.total_products_file ? [ProductType.FILE.color] : []),

          ...(this.total_products_service ? [ProductType.SERVICE.color] : []),

          ...(this.total_products_subscription
            ? [ProductType.SUBSCRIPTION.color]
            : []),
        ],

        labels: [
          ...(this.total_products_physical
            ? [this.$t(ProductType.PHYSICAL.name)]
            : []),
          ...(this.total_products_virtual
            ? [this.$t(ProductType.VIRTUAL.name)]
            : []),
          ...(this.total_products_file ? [this.$t(ProductType.FILE.name)] : []),
          ...(this.total_products_service
            ? [this.$t(ProductType.SERVICE.name)]
            : []),
          ...(this.total_products_subscription
            ? [this.$t(ProductType.SUBSCRIPTION.name)]
            : []),
        ],
        legend: {
          position: "bottom",
        },

        dataLabels: {
          enabled: true,
          formatter: function (value, timestamp, index) {
            return Math.round(value) + "%";
          },
        },

        plotOptions: {
          pie: {
            donut: {
              size: "30%",
            },
          },
        },
      };
    },

    total_products_physical() {
      if (this.modern) return this.observed("total_products_physical");
      return this.lastData.total_products_physical
        ? this.lastData.total_products_physical
        : 0;
    },

    total_products_virtual() {
      if (this.modern) return this.observed("total_products_virtual");
      return this.lastData.total_products_virtual
        ? this.lastData.total_products_virtual
        : 0;
    },

    total_products_file() {
      if (this.modern) return this.observed("total_products_file");
      return this.lastData.total_products_file
        ? this.lastData.total_products_file
        : 0;
    },
    total_products_service() {
      if (this.modern) return this.observed("total_products_service");
      return this.lastData.total_products_service
        ? this.lastData.total_products_service
        : 0;
    },
    total_products_subscription() {
      if (this.modern) return this.observed("total_products_subscription");
      return this.lastData.total_products_subscription
        ? this.lastData.total_products_subscription
        : 0;
    },
    total_products() {
      if (
        this.modern &&
        [
          this.total_products_virtual,
          this.total_products_physical,
          this.total_products_file,
          this.total_products_service,
          this.total_products_subscription,
        ].some((value) => value === null)
      )
        return null;
      return (
        this.total_products_virtual +
        this.total_products_physical +
        this.total_products_file +
        this.total_products_service +
        this.total_products_subscription
      );
    },

    has_products() {
      return (
        this.total_products_physical ||
        this.total_products_virtual ||
        this.total_products_file ||
        this.total_products_service ||
        this.total_products_subscription
      );
    },

    series() {
      return [
        ...(this.total_products_physical ? [this.total_products_physical] : []),

        ...(this.total_products_virtual ? [this.total_products_virtual] : []),
        ...(this.total_products_file ? [this.total_products_file] : []),
        ...(this.total_products_service ? [this.total_products_service] : []),
        ...(this.total_products_subscription
          ? [this.total_products_subscription]
          : []),
      ];
    },
  },
  methods: {
    observed(key) {
      const value = this.lastData[key];
      return (typeof value === "number" ||
        (typeof value === "string" && value.trim() !== "")) &&
        Number.isFinite(Number(value))
        ? Number(value)
        : null;
    },
  },
};
</script>

<style scoped lang="scss">
.b-shop-card-products--modern {
  font-family: inherit;
  font-weight: 400;
  line-height: inherit;
  text-align: start;
  border: 0;
  padding: 0;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  .b-shop-card-products__caption {
    display: block;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 11px;
    font-weight: 400;
    margin-bottom: 3px;
  }
  h6 {
    font-family: inherit;
    font-size: 22px;
    font-weight: 400;
    line-height: 1.25;
    letter-spacing: -0.3px;
    margin: 0;
    font-variant-numeric: tabular-nums;
    i {
      display: none;
    }
  }
  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 4px;
  }
  @media (max-width: 799px), (pointer: coarse) {
    min-height: 44px;
  }
}
</style>

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
  <v-menu
    :close-on-content-click="false"
    z-index="100"
    offset-y
    open-on-hover
    rounded="xl"
    v-if="lastData"
  >
    <template v-slot:activator="{ on }">
      <div v-on="on">
        <h6>
          <i class="fas fa-boxes" />
          {{ total_products | numeralFormat("0.[0]a") }}
        </h6>

        <p class="text-muted mb-0">
          <small>{{ $t("user_dashboard.shops.shop_card.products") }}</small>
        </p>
      </div>
    </template>

    <v-card class="p-2" min-width="300">
      <apexchart
        v-if="has_products"
        :height="250"
        type="donut"
        :options="options"
        :series="series"
      />
      <p v-else class="m-2 text-muted">
        {{ $t("global.commons.no_data") }}
      </p>
    </v-card>
  </v-menu>
</template>

<script>
import { ProductType } from "@core/enums/product/ProductType";

export default {
  name: "ShopProductsPieChart",
  props: {
    lastData: {
      required: true,
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
      return this.lastData.total_products_physical
        ? this.lastData.total_products_physical
        : 0;
    },

    total_products_virtual() {
      return this.lastData.total_products_virtual
        ? this.lastData.total_products_virtual
        : 0;
    },

    total_products_file() {
      return this.lastData.total_products_file
        ? this.lastData.total_products_file
        : 0;
    },
    total_products_service() {
      return this.lastData.total_products_service
        ? this.lastData.total_products_service
        : 0;
    },
    total_products_subscription() {
      return this.lastData.total_products_subscription
        ? this.lastData.total_products_subscription
        : 0;
    },
    total_products() {
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
};
</script>

<style scoped></style>

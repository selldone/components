<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
    class="position-relative ps-1"
    style="font-size: 7px; border-inline-start: solid 2px"
    :style="{ borderColor: pt?.color }"
  >
    <!-- Inventory Bar -->
    <div
      v-if="variable.minQuantity || variable.maxQuantity"
      class="d-flex align-center"
    >
      <div style="min-width: 60px">
        <v-icon>shelves</v-icon>
        {{ $t("global.commons.inventory") }}
      </div>
      <div class="position-relative flex-grow-1">
        <div
          :style="{
            left: left_quantity,
            right: right_quantity,
          }"
          style="
            top: 0px;
            height: 2px;
            background-color: #ffa000;
            position: absolute;
          "
        >
          <span
            class="text-nowrap -badge"
            style="
              left: 0;

              background-color: #ffa000;
            "
          >
            {{ variable.minQuantity ? variable.minQuantity : 0 }}</span
          >
          <span
            class="text-nowrap -badge"
            style="
              right: 0;

              background-color: #ffa000;
            "
          >
            {{ variable.maxQuantity ? variable.maxQuantity : "∞" }}</span
          >
        </div>
      </div>
    </div>
    <!-- Sell Bar -->
    <div v-if="variable.minSells" class="d-flex align-center">
      <div style="min-width: 60px">
        <v-icon>local_mall</v-icon>
        {{ $t("global.commons.order") }}
      </div>

      <div class="position-relative flex-grow-1">
        <div
          :style="{ left: left_sells, right: 0 }"
          style="
            top: 0px;
            height: 2px;
            background-color: #673ab7;
            position: absolute;
          "
        >
          <span
            class="text-nowrap -badge"
            style="left: 0; background-color: #673ab7"
          >
            {{ variable.minSells }}
          </span>

          <span
            class="text-nowrap -badge"
            style="right: 0; background-color: #673ab7"
          >
            ∞
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ProductThresholdLevel } from "@selldone/core-js/enums/product/ProductThresholds.ts";

export default defineComponent({
  name: "BProductThresholdingPreviewItem",
  inject: ["$shop", "$product"],
  props: {
    level: {},
    variable: {},
    quantityLimit: {},
    minSellsLimit: {},
  },
  computed: {
    pt() {
      return ProductThresholdLevel[this.level];
    },
    left_quantity() {
      if (!this.variable.minQuantity) return 0;
      let out = (100 * this.variable.minQuantity) / this.quantityLimit;
      return `${Math.round(out)}%`;
    },
    right_quantity() {
      if (this.variable.maxQuantity >= this.quantityLimit) return 0;
      let out = (100 * this.variable.maxQuantity) / this.quantityLimit;
      if (out > 100) out = 100;
      return `${Math.round(100 - out)}%`;
    },

    left_sells() {
      if (!this.variable.minSells) return 0;
      let out = (100 * this.variable.minSells) / this.minSellsLimit;
      return `${out}%`;
    },
  },
});
</script>

<style scoped lang="scss">
.-badge {
  position: absolute;
  top: -3px;
  color: #fff;
  padding: 1px 4px;
  z-index: 1;
  border-radius: 4px;
}
</style>

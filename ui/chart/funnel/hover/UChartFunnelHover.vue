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
    v-if="
      (is2d &&
        filtered_values.length &&
        (!isPercentMode || filtered_values.length > 1)) ||
      isCurrency
    "
    class="u--hover-container elevation-3"
    :class="{ 'pt-7': label && !vertical }"
  >
    <div v-if="!vertical" class="absolute-top-center small op-0-5">
      {{ label }}
    </div>

    <ul class="u--hover-label">
      <li v-for="(subLabel, j) in filtered_subLabels" :key="j">
        <div v-if="isCurrency" class="d-flex flex-column py-1">
          <div class="mb-1 mx-auto d-flex align-center">
            <u-currency-icon
              :currency="GetCurrency(subLabel)"
              class="me-1"
              flag-only
              small
            ></u-currency-icon>
            <b>{{ subLabel }}</b>
          </div>

          <u-price
            :amount="filtered_values[j]"
            :currency="subLabel"
            class="body-title"
          ></u-price>
        </div>

        <template v-else>
          <span class="--label">
            <div
              :style="subLabelBackgrounds(j)"
              style="
                height: 10px;
                width: 10px;
                border-radius: 50%;
                display: inline-block;
              "
              class="me-1"
            ></div>

            <img
              v-if="subLabelImages && subLabelImages.length > j"
              :src="subLabelImages[j]"
              class="me-1"
              height="16"
              width="16"
            />

            {{ subLabel }}
          </span>

          <span v-if="isPercentMode" class="--percent"
            >{{ twoDimPercentages[index][j] }}%</span
          >
          <span v-else-if="actualValue"
            >{{
              numeralFormat(actualValue(index, j, filtered_values[j]), "0.[0]a")
            }}
          </span>
          <span v-else class="--percent">{{
            numeralFormat(filtered_values[j], "0.[0]a")
          }}</span>
        </template>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UCurrencyIcon from "@selldone/components-vue/ui/currency/icon/UCurrencyIcon.vue";

export default defineComponent({
  name: "UChartFunnelHover",
  components: { UCurrencyIcon },
  props: {
    values: {
      type: Array,
      required: true,
    },
    labels: {
      type: Array,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    filterZeros: Boolean,
    subLabelImages: {},
    isCurrency: Boolean,
    is2d: Boolean,
    actualValue: {
      type: Function,
    },

    twoDimPercentages: {
      type: Array,
      required: true,
    },
    isPercentMode: Boolean,
    subLabelBackgrounds: Function,
    label: {},
    vertical: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    filtered_values() {
      const out = this.values[this.index];
      if (this.filterZeros) {
        return out.filter((i) => i > 0.0001);
      }
      return out;
    },
    filtered_subLabels() {
      if (this.filterZeros) {
        return this.labels.filter((subLabel, index) => {
          return this.values[this.index][index] > 0.0001;
        });
      }

      return this.labels;
    },
  },
});
</script>

<style scoped lang="scss"></style>

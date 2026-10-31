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
  <component
    :is="modern ? 'v-tooltip' : 'div'"
    v-if="
      (is2d &&
        filtered_values.length &&
        (!isPercentMode || filtered_values.length > 1)) ||
      isCurrency
    "
    :class="
      modern
        ? undefined
        : ['u--hover-container elevation-3', { 'pt-7': label && !vertical }]
    "
    :activator="modern ? 'parent' : undefined"
    :location="modern ? 'top' : undefined"
    :open-on-focus="modern ? true : undefined"
    :open-on-click="modern ? false : undefined"
    :model-value="modern ? tooltip_open : undefined"
    :activator-props="modern ? { onClick: openTooltip, onKeydown: onTooltipKeydown } : undefined"
    :content-class="modern ? 'sd-modern-tooltip text-start' : undefined"
    @update:model-value="modern && (tooltip_open = $event)"
  >
    <div
      v-if="!vertical"
      :class="
        modern
          ? 'u-chart-funnel-help__date'
          : 'absolute-top-center small op-0-5'
      "
    >
      {{ label }}
    </div>

    <ul :class="modern ? 'u-chart-funnel-help__values' : 'u--hover-label'">
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
            v-if="!modern || !actualValue || Number.isFinite(currency_values[j])"
            :amount="currency_values[j]"
            :currency="subLabel"
            class="body-title"
          ></u-price>
          <span v-else :aria-label="$t('global.commons.not_available')">—</span>
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
  </component>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UCurrencyIcon from "@selldone/components-vue/ui/currency/icon/UCurrencyIcon.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default defineComponent({
  name: "UChartFunnelHover",
  mixins: [CurrencyMixin],
  components: { UCurrencyIcon },
  props: {
    modern: Boolean,
    values: {
      type: Array,
      required: true,
    },
    labels: {
      type: Array,
      required: false,
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
  data() {
    return { tooltip_open: false };
  },
  methods: {
    openTooltip(event) {
      // Focus may already open the tooltip before a synthesized touch click arrives.
      event.stopPropagation();
      this.tooltip_open = true;
    },
    onTooltipKeydown(event) {
      if (event.key === 'Escape') this.tooltip_open = false;
    },
  },
  computed: {
    currency_values() {
      if (!this.modern || !this.actualValue) return this.filtered_values;
      const indices = this.values[this.index].map((value, index) => ({ value, index }))
        .filter(({ value }) => !this.filterZeros || value > 0.0001);
      return indices.map(({ value, index }) => this.actualValue(this.index, index, value));
    },
    filtered_values() {
      const out = this.values[this.index];
      if (this.filterZeros) {
        return out.filter((i) => i > 0.0001);
      }
      return out;
    },
    filtered_subLabels() {
      if (this.filterZeros) {
        return this.labels?.filter((subLabel, index) => {
          return this.values[this.index][index] > 0.0001;
        });
      }

      return this.labels;
    },
  },
});
</script>

<style scoped lang="scss">
.u-chart-funnel-help__date {
  margin-block-end: 8px;
  font-size: inherit;
}
.u-chart-funnel-help__values {
  margin: 0;
  padding: 0;
  list-style: none;
}
.u-chart-funnel-help__values > li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px 20px;
  margin-block: 4px;
  font-size: inherit;
}
</style>

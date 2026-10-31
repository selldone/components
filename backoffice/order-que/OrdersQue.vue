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
    class="d-flex justify-content-between align-items-center text-center"
    :class="{
      'orders-que--distribution': showDistribution && list.length,
      'orders-que--modern': modern,
    }"
  >
    <div
      v-for="(item, index) in list"
      :key="item.code"
      :title="$t(item.name)"
      class="flex-grow-1 d-flex align-center"
    >
      <span :title="$t(item.name)" class="flex-grow-1">
        <v-icon class="me-1" size="16"> {{ item.icon }}</v-icon>
        <b>
          {{ numeralFormat(getQueCountBasketsByType(item.code), "0,0") }}
        </b>
        <span v-if="modern" class="orders-que__stage-label">{{
          $t(item.name)
        }}</span>
      </span>

      <v-icon
        v-if="!modern && index !== list.length - 1"
        :color="dark ? '#fff' : '#000'"
        class="flex-grow-1 op-0-7 flip-rtl"
        size="16"
      >
        trending_flat
      </v-icon>
    </div>

    <span v-if="!list.length" class="ma-auto"
      ><v-icon class="me-1">emoji_food_beverage</v-icon>
      {{ $t("global.commons.auto") }}</span
    >
    <button
      v-if="showDistribution && list.length"
      type="button"
      class="orders-que__distribution"
      :aria-label="distribution_label"
    >
      <span class="orders-que__rail" aria-hidden="true">
        <span
          v-for="(stage, index) in distribution_segments"
          v-show="stage.count > 0"
          :key="stage.code"
          class="orders-que__segment"
          :class="{ 'orders-que__segment--other': stage.code === 'Other' }"
          :style="{
            width: distribution_total
              ? (100 * stage.count) / distribution_total + '%'
              : '0%',
            opacity: 0.35 + index * 0.15,
          }"
        />
      </span>
      <v-tooltip
        activator="parent"
        location="top"
        open-on-hover
        open-on-focus
        open-on-click
        interactive
        :max-width="360"
        content-class="sd-modern-tooltip text-start"
      >
        <p class="sd-modern-tooltip__body">
          {{ $t("admin_shop.dashboard.modern.queue_stage_distribution") }}
        </p>
        <dl class="orders-que__tooltip-stages">
          <div v-for="stage in distribution_segments" :key="stage.code">
            <dt>{{ $t(stage.name) }}</dt>
            <dd>{{ numeralFormat(stage.count, "0,0") }}</dd>
          </div>
        </dl>
      </v-tooltip>
    </button>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { Basket } from "@selldone/core-js";

export default {
  name: "OrdersQue",
  props: {
    modern: Boolean,
    showDistribution: { type: Boolean, default: false },
    orderQue: {
      required: true,
      type: Array,
    },
    type: {
      required: true,
      type: String,
    },
    dark: {
      deafult: false,
      type: Boolean,
    },
  },

  computed: {
    distribution_segments() {
      if (!this.list.length) return [];
      const stages = this.list.map((stage) => ({ ...stage, count: 0 }));
      let other = 0;
      for (const row of this.orderQue || []) {
        if (this.type !== "AVO" && row.type !== this.type) continue;
        const count = Number(row.count);
        if (!Number.isFinite(count) || count < 0) continue;
        const stage = stages.find((stage) => stage.code === row.delivery_state);
        // Avocado is grouped by status as well as stage; both statuses belong in this queue.
        if (stage) stage.count += count;
        else other += count;
      }
      if (other > 0)
        stages.push({
          code: "Other",
          name: "global.commons.other",
          count: other,
        });
      return stages;
    },
    distribution_total() {
      return this.distribution_segments.reduce(
        (sum, stage) => sum + stage.count,
        0,
      );
    },
    distribution_label() {
      return (
        this.$t("admin_shop.dashboard.modern.queue_stage_distribution") +
        " · " +
        this.distribution_segments
          .map(
            (stage) =>
              this.$t(stage.name) +
              ": " +
              this.numeralFormat(stage.count, "0,0"),
          )
          .join(" · ")
      );
    },
    list() {
      if (this.type === ProductType.PHYSICAL.code || this.type === "AVO")
        return [
          Basket.PhysicalOrderStates.CheckQueue,
          Basket.PhysicalOrderStates.OrderConfirm,
          Basket.PhysicalOrderStates.PreparingOrder,
          Basket.PhysicalOrderStates.SentOrder,
        ];
      else if (this.type === ProductType.VIRTUAL.code)
        return [
          Basket.VirtualOrderStates.CheckQueue,
          Basket.VirtualOrderStates.OrderConfirm,
          Basket.VirtualOrderStates.PreparingOrder,
        ];
      else if (this.type === ProductType.FILE.code) return [];

      return [];
    },
  },
  methods: {
    getQueCountBasketsByType(delivery_state) {
      if (this.showDistribution)
        return (
          this.distribution_segments.find(
            (stage) => stage.code === delivery_state,
          )?.count ?? 0
        );
      let order_que = this.orderQue.find((basket) => {
        return (
          (basket.type === this.type || this.type === "AVO") &&
          basket.delivery_state === delivery_state
        );
      });
      return order_que ? order_que.count : 0;
    },
  },
};
</script>

<style scoped>
.orders-que--modern {
  gap: 8px;
  flex-wrap: wrap;
  margin-block: 18px;
}
.orders-que--modern > div {
  min-width: 50px;
  flex: 1;
}
.orders-que--modern > div > span {
  display: grid;
  justify-items: center;
  gap: 4px;
}
.orders-que--modern b {
  font-size: 18px;
  font-weight: 400;
  line-height: 26px;
}
.orders-que__stage-label {
  font-size: 11px;
  line-height: 17px;
  color: var(--sd-modern-muted);
}
.orders-que--distribution {
  position: relative;
  padding-block-end: 8px;
}
.orders-que__distribution {
  position: absolute;
  inset: 0;
  width: min(160px, 100%);
  margin-inline: auto;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  cursor: help;
}
.orders-que__distribution:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.orders-que__rail {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  display: flex;
  height: 5px;
  overflow: hidden;
  border-radius: 5px;
  background: rgba(var(--v-theme-on-surface), 0.1);
}
.orders-que__segment {
  flex-shrink: 0;
  background: rgb(var(--v-theme-primary));
}
.orders-que__segment--other {
  background: rgb(var(--v-theme-on-surface));
}
.orders-que__tooltip-stages {
  margin: 0;
  font-size: inherit;
  font-weight: 400;
}
.orders-que__tooltip-stages > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
}
.orders-que__tooltip-stages dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 600px) {
  .orders-que--distribution {
    min-height: 44px;
  }
  .orders-que__distribution {
    min-height: 44px;
  }
}
</style>

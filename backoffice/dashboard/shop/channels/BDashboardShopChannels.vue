<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
      modern || (social_keys?.length > 2 && timeSeries.raw_data?.length > 5)
    "
    class="b-dashboard-channels text-start"
    :class="{ 'b-dashboard-channels--modern': modern }"
  >
    <component
      :is="modern ? 'section' : 's-widget-box'"
      :title="
        modern
          ? undefined
          : `<h5 class='align-items-center pb-1'>    <span class='circle bg-teal mx-sm' style='font-size: 6px;'></span> ${$t('admin_shop.dashboard.channels.title')}  </h5><span class='fw-normal ml-xs small'> ${$t(
              'admin_shop.dashboard.channels.subtitle',
            )} </span> `
      "
      :icon="modern ? undefined : 'diversity_1'"
      :class="modern ? 'sd-modern-widget' : 'overflow-hidden'"
    >
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain" aria-hidden="true">
            <v-icon icon="stacked_line_chart" size="20" />
          </span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.channels.title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.channel_history_help") }}
            </p>
          </div>
        </div>
      </header>
      <div
        v-if="social_keys?.length && timeSeries.raw_data?.length"
        :class="modern ? 'b-dashboard-channels__chart' : 'mx-n5'"
      >
        <u-chart-funnel
          id="fun-data"
          :animated="!modern"
          :dark="modern && $vuetify.theme.current.dark"
          :colors="colors"
          direction="horizontal"
          :display-percentage="false"
          gradient-direction="vertical"
          :height="height"
          :labels="labels"
          :sub-label-images="subLabelImages"
          :sub-labels="subLabels"
          :values="values"
          :width="width"
          class="mt-3"
          hover-opacity-effect
        />
      </div>
      <section
        v-if="modern && social_keys?.length && timeSeries.raw_data?.length"
        class="b-dashboard-channels__day-detail"
      >
        <v-slider
          v-if="timeSeries.raw_data.length > 1"
          :model-value="history_day_index"
          :max="timeSeries.raw_data.length - 1"
          min="0"
          step="1"
          color="on-surface"
          density="compact"
          hide-details
          :aria-label="$t('admin_shop.dashboard.modern.channel_history_day')"
          @update:model-value="history_day = $event"
        />
        <div class="b-dashboard-channels__day-heading">
          <span
            ><v-icon icon="calendar_today" size="16" aria-hidden="true" />{{
              getLocalDateString(
                timeSeries.raw_data[history_day_index].created_at,
              )
            }}</span
          >
          <span
            >{{ numeralFormat(history_day_total, "0,0") }}
            {{ $t("global.commons.sessions") }}</span
          >
        </div>
        <v-table
          density="compact"
          class="sd-modern-data-table b-dashboard-channels__day-table"
        >
          <thead>
            <tr>
              <th>{{ $t("global.commons.acquisition_channel") }}</th>
              <th class="text-end">{{ $t("global.commons.sessions") }}</th>
              <th class="text-end">
                {{ $t("admin_shop.dashboard.modern.session_share") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(key, i) in social_keys" :key="key">
              <td>
                <span class="b-dashboard-channels__source"
                  ><img
                    :src="subLabelImages[i]"
                    width="18"
                    height="18"
                    alt=""
                  />{{ subLabels[i] }}</span
                >
              </td>
              <td class="text-end">
                {{ numeralFormat(history_day_values[i], "0,0") }}
              </td>
              <td class="text-end">
                {{
                  (history_day_total
                    ? (100 * history_day_values[i]) / history_day_total
                    : 0
                  ).toFixed(1)
                }}%
              </td>
            </tr>
          </tbody>
        </v-table>
      </section>
      <p v-else-if="modern" class="sd-modern-empty-state" role="status">
        {{ $t("admin_shop.dashboard.modern.channel_history_empty") }}
      </p>
    </component>
  </div>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UChartFunnel from "@selldone/components-vue/ui/chart/funnel/UChartFunnel.vue";
import { Brands } from "@selldone/core-js/enums/social/Brands.ts";
import { colorSet3, ShadeColor } from "@selldone/core-js/helper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import directIcon from "../../../../assets/icons/direct-enter.svg";
import defaultSourceIcon from "../../../../assets/trademark/default.svg";

export default {
  name: "BDashboardShopChannels",
  mixins: [DateMixin, CurrencyMixin],
  components: {
    UChartFunnel,
    SWidgetBox,
  },
  props: {
    modern: Boolean,
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data() {
    return { history_day: null };
  },

  created() {},

  computed: {
    history_day_index() {
      const last = Math.max(0, (this.timeSeries.raw_data?.length || 1) - 1);
      return this.history_day == null ? last : Math.min(this.history_day, last);
    },
    history_day_values() {
      return this.values[this.history_day_index] || [];
    },
    history_day_total() {
      return this.history_day_values.reduce((sum, value) => sum + value, 0);
    },
    socials() {
      return this.timeSeries.socialTotalKeys();
    },

    social_keys() {
      return Object.keys(this.socials);
    },
    subLabels() {
      return this.social_keys.map((key) => this.getName(key));
    },
    subLabelImages() {
      return this.social_keys.map((key) => {
        const found = Brands.find(
          (item) => item.name.toLowerCase() === key.toLowerCase(),
        );

        return (
          found?.icon ||
          (this.modern
            ? key.toLowerCase() === "direct"
              ? directIcon
              : defaultSourceIcon
            : undefined)
        );
      });
    },

    labels() {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          out.push(this.getLocalTimeString(item.created_at, false, true));
        });

      return out;
    },

    values() {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          const social = item.social;

          let _arr = [];

          this.social_keys.forEach((_key) => {
            let _value = social && social[_key] ? social[_key] : 0;

            _arr.push(this.truncate(_value, 0));
          });

          out.push(_arr);
        });

      return out;
    },

    height() {
      return 150 + this.social_keys.length * 30;
    },
    width() {
      if (!this.timeSeries.raw_data) return 500;
      return 500 + 45 * this.timeSeries.raw_data.length;
    },
    colors() {
      return colorSet3.map((color) => [color, ShadeColor(color, -20)]);
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.b-dashboard-channels--modern {
  min-width: 0;

  .sd-modern-title-text {
    font-weight: 500;
  }

  .b-dashboard-channels__day-detail {
    margin-block-start: 20px;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-dashboard-channels__day-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-block: 8px 12px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
  }

  .b-dashboard-channels__day-heading > span:first-child,
  .b-dashboard-channels__source {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .b-dashboard-channels__source > img {
    flex: 0 0 18px;
    object-fit: contain;
  }

  .b-dashboard-channels__day-table :deep(th),
  .b-dashboard-channels__day-table :deep(td) {
    height: 44px;
    padding-inline: 8px;
    font-size: 12px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  .b-dashboard-channels__chart {
    min-width: 0;
    margin-inline: -8px;
  }

  :deep(.u--chart-funnel > .--container) {
    max-width: 100%;
  }

  :deep(.u--chart-funnel > .--legend) {
    gap: 12px 20px;
    margin-block-start: 20px;
    font-size: 12px;
  }

  :deep(.u--chart-funnel .--l-item-title) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  :deep(.u--chart-funnel .--l-item-title img) {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  :deep(.u--chart-funnel .--l-item) {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 400;
  }

  :deep(.u--chart-funnel .--label-value),
  :deep(.u--chart-funnel .--label-title) {
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
  }

  :deep(.u--chart-funnel .--label-value) {
    font-size: 13px;
    font-weight: 400;
  }

  :deep(.u--chart-funnel .u--hover-label .--label) {
    font-size: 12px;
  }

  :deep(.u--chart-funnel .u--hover-container) {
    color: rgb(var(--v-theme-on-surface));
    background: rgba(var(--v-theme-surface), 0.96);
    border-color: var(--sd-modern-border);
    text-shadow: none;
  }

  :deep(.u--chart-funnel .u--hover-container .--percent) {
    color: rgb(var(--v-theme-on-surface));
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-dashboard-channels--modern :deep(.u--chart-funnel .t-all-400) {
    transition: none !important;
  }
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

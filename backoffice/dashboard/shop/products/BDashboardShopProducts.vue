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
  <section
    v-if="modern"
    class="b-dashboard-products-summary sd-modern-widget text-start"
  >
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="20" aria-hidden="true">inventory_2</v-icon></span
        >
        <div>
          <div class="d-flex align-center ga-1">
            <h2 class="sd-modern-title-text">
              {{ $t("global.commons.catalog") }}
            </h2>
            <v-btn
              class="sd-modern-icon-button sd-modern-info-button"
              icon
              variant="text"
              :aria-label="
                $t('global.commons.help') + ' · ' + $t('global.commons.catalog')
              "
            >
              <v-icon icon="info_outline" size="16" aria-hidden="true" />
              <v-tooltip
                activator="parent"
                location="top"
                :open-on-click="true"
                :open-on-focus="true"
                interactive
                :max-width="360"
                content-class="sd-modern-tooltip text-start"
              >
                <p class="sd-modern-tooltip__body">
                  {{ $t("admin_shop.dashboard.modern.catalog_help") }}
                </p>
              </v-tooltip>
            </v-btn>
          </div>
          <p class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.modern.catalog_subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        v-if="can_add_product"
        :active="false"
        :to="{ name: 'BPageShopProductsList', hash: '#add' }"
        class="sd-modern-button"
        variant="text"
      >
        <v-icon start size="small">add</v-icon>
        {{ $t("admin_shop.dashboard.modern.add_product") }}
        <v-tooltip
          activator="parent"
          :open-on-focus="true"
          location="top"
          content-class="sd-modern-tooltip text-start"
        >
          {{ $t("admin_shop.dashboard.modern.add_product") }}
        </v-tooltip>
      </v-btn>
    </header>
    <div class="b-dashboard-products-summary__total">
      <strong>{{
        total_products === null ? "—" : numeralFormat(total_products, "0,0")
      }}</strong>
      <span class="sd-modern-subtitle">{{
        $t("global.commons.products")
      }}</span>
    </div>
    <div class="b-dashboard-products-summary__types">
      <div
        v-for="item in available_types"
        :key="item.code"
        class="b-dashboard-products-summary__type"
      >
        <img :src="item.image" width="20" height="20" alt="" />
        <span>{{ $t(item.name) }}</span>
        <u-chart-bar
          class="b-dashboard-products-summary__inline-history"
          :dataset="getArray(`total_products_${item.code.toLowerCase()}`)"
          :start-date="daily_start_date"
          :end-date="timeSeries.endDate"
          :colors="[item.color]"
          :height="28"
          :show-title="false"
          :labels="[
            $t('admin_shop.dashboard.modern.catalog_count_history', {
              type: $t(item.name),
            }),
          ]"
          :aria-label="
            $t('admin_shop.dashboard.modern.catalog_count_history', {
              type: $t(item.name),
            })
          "
          fit
          dense
          narrow
          hide-dates
        />
        <b>{{
          Number.isFinite(
            lastDayData[`total_products_${item.code.toLowerCase()}`],
          )
            ? numeralFormat(
                lastDayData[`total_products_${item.code.toLowerCase()}`],
                "0,0",
              )
            : "—"
        }}</b>
        <v-btn
          v-if="can_view_products"
          :to="{ name: 'BPageShopProductsList', query: { types: item.code } }"
          :active="false"
          class="sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="$t('global.actions.view_all') + ' · ' + $t(item.name)"
        >
          <v-icon size="18" class="flip-rtl" aria-hidden="true"
            >arrow_forward</v-icon
          >
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("global.actions.view_all") }} ·
            {{ $t(item.name) }}</v-tooltip
          >
        </v-btn>
      </div>
    </div>
    <template v-if="!summary">
      <v-expansion-panels
        variant="accordion"
        class="b-dashboard-products-summary__histories"
      >
        <v-expansion-panel elevation="0" rounded="0">
          <v-expansion-panel-title>{{
            $t("admin_shop.dashboard.modern.catalog_history")
          }}</v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="b-dashboard-products-summary__history-grid">
              <u-chart-bar
                v-for="item in available_types"
                :key="item.code"
                :colors="[item.color]"
                :dataset="getArray(`total_products_${item.code.toLowerCase()}`)"
                :end-date="timeSeries.endDate"
                :start-date="timeSeries.startDate"
                :height="75"
                fit
                narrow
              >
                <template #title
                  ><span class="b-dashboard-products-summary__history-label"
                    ><img :src="item.image" alt="" width="20" height="20" />{{
                      $t(item.name)
                    }}<span>{{
                      numeralFormat(
                        lastDayData[
                          `total_products_${item.code.toLowerCase()}`
                        ],
                        "0,0",
                      )
                    }}</span></span
                  ></template
                >
              </u-chart-bar>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div class="b-dashboard-products-summary__imports">
        <b-shop-products-import-processing :shop="shop" />
      </div>
    </template>
  </section>
  <s-widget-box
    v-else
    :active="true"
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
            'admin_shop.dashboard.products.title',
          )} </h5>`
    "
    extended
    :sub-title="
      modern ? undefined : $t('admin_shop.dashboard.products.title_small')
    "
    :class="{
      'b-dashboard-products-modern sd-modern-widget text-start': modern,
    }"
    :color="modern ? 'rgb(var(--v-theme-surface))' : undefined"
    :dark="modern && $vuetify.theme.current.dark"
  >
    <template v-slot:top-left>
      <v-btn
        v-if="!modern"
        :to="{ name: 'BPageShopProductsList', hash: '#add' }"
        class="icon-add"
        icon
        variant="text"
      >
        <v-icon>fa:fas fa-boxes</v-icon>
        <v-tooltip activator="parent"
          >{{ $t("global.actions.add") }} ·
          {{ $t("global.commons.products") }}</v-tooltip
        >
      </v-btn>
    </template>
    <template v-slot:actions>
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon size="20" aria-hidden="true">inventory_2</v-icon></span
          >
          <div>
            <div class="d-flex align-center ga-1">
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.products.title") }}
              </h2>
              <v-btn
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="
                  $t('global.commons.help') +
                  ' · ' +
                  $t('admin_shop.dashboard.products.title')
                "
              >
                <v-icon icon="info_outline" size="16" aria-hidden="true" />
                <v-tooltip
                  activator="parent"
                  location="top"
                  :open-on-click="true"
                  :open-on-focus="true"
                  interactive
                  :max-width="360"
                  content-class="sd-modern-tooltip text-start"
                >
                  <p class="sd-modern-tooltip__body">
                    {{ $t("admin_shop.dashboard.modern.catalog_help") }}
                  </p>
                </v-tooltip>
              </v-btn>
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.products.title_small") }}
            </p>
          </div>
        </div>
        <v-btn
          :to="{ name: 'BPageShopProductsList', hash: '#add' }"
          variant="text"
          class="sd-modern-button sd-modern-button--inline"
        >
          <v-icon start size="small">add</v-icon>{{ $t("global.actions.add") }}
          <v-tooltip activator="parent"
            >{{ $t("global.actions.add") }} ·
            {{ $t("global.commons.products") }}</v-tooltip
          >
        </v-btn>
      </header>
      <div class="d-flex">
        <div class="min-width-100">
          <h2
            :class="
              modern
                ? 'b-dashboard-products-modern__count'
                : 'text-h3 font-weight-black'
            "
          >
            {{ numeralFormat(total_products, "0,0") }}
          </h2>
          <small>{{
            $t("admin_shop.dashboard.products.total_products")
          }}</small>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <u-chart-bar
        v-for="item in available_types"
        :key="item.code"
        :class="{ disabled: !item.enable }"
        :colors="[item.color]"
        :dataset="getArray(`total_products_${item.code.toLowerCase()}`)"
        :end-date="timeSeries.endDate"
        :height="60"
        :start-date="timeSeries.startDate"
        class="py-5 text-center"
        narrow
      >
        <template v-slot:title>
          <img :src="item.image" class="me-1" height="20" />
          {{ $t(item.name) }}
          /
          <span class="font-weight-black ms-1">
            {{
              numeralFormat(
                lastDayData[`total_products_${item.code.toLowerCase()}`],
                "0,0a",
              )
            }}
          </span>
        </template>
      </u-chart-bar>

      <!-- ------------------- Importing Products Que ------------------- -->

      <b-shop-products-import-processing :shop="shop">
      </b-shop-products-import-processing>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import BShopProductsImportProcessing from "../../../product/importer/processing/BShopProductsImportProcessing.vue";

import UChartBar from "../../../../ui/chart/bar/UChartBar.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import {
  getReportDailyValues,
  getReportStartDate,
} from "../performance/periodComparison";

export default {
  name: "BDashboardShopProducts",
  components: {
    UChartBar,
    BShopProductsImportProcessing,
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
    summary: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    daily_start_date() {
      return getReportStartDate(this.timeSeries);
    },
    can_view_products() {
      return this.readShopAccess(ShopPermissionRegions.PRODUCTS.code);
    },
    can_add_product() {
      return this.writeShopAccess(ShopPermissionRegions.PRODUCTS.code);
    },
    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },
    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    lastDayData() {
      return this.timeSeries.lastDayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    total_products() {
      if (
        this.modern &&
        !["physical", "virtual", "file", "service", "subscription"].every(
          (type) => Number.isFinite(this.lastDayData[`total_products_${type}`]),
        )
      )
        return null;
      return (
        this.lastDayData.total_products_virtual +
        this.lastDayData.total_products_physical +
        this.lastDayData.total_products_file +
        this.lastDayData.total_products_service +
        this.lastDayData.total_products_subscription
      );
    },
  },
  methods: {
    getArray(key) {
      if (this.modern) return getReportDailyValues(this.timeSeries, [key]);
      return this.timeSeries
        .arrayOfForceInterpolateByLastValue(key, false, "created_at")
        .map((val) => [val >= 0 ? val : 0]);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-products-modern {
  :deep(> .widget-body) {
    margin-block-start: 0;
  }
  &__count {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.4;
  }
}

.b-dashboard-products-summary {
  container-type: inline-size;
  &__total {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 9px;
    margin-block-end: 12px;
  }
  &__total strong {
    font-size: 30px;
    font-weight: 600;
    line-height: 1.2;
  }
  &__total .sd-modern-subtitle {
    margin: 0;
    font-size: 12px;
  }
  &__type {
    display: grid;
    grid-template-columns:
      20px minmax(0, 1fr) clamp(48px, 16cqi, 104px) minmax(28px, auto)
      auto;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    padding: 4px 8px;
    border-block-end: 1px solid var(--sd-modern-border);
    font-size: 13px;
  }
  &__type:last-child {
    border-block-end: 0;
  }
  &__type > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  &__type b {
    font-variant-numeric: tabular-nums;
    font-weight: 400;
    text-align: end;
  }
  &__inline-history {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
  &__inline-history :deep(.--bar) {
    opacity: 0.45;
  }
  &__histories {
    margin-block-start: 16px;
  }
  &__histories :deep(.v-expansion-panel-title) {
    min-height: 48px;
    padding: 10px 8px;
    font-size: 14px;
    font-weight: 400;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  &__histories :deep(.v-expansion-panel-text__wrapper) {
    padding: 12px 0;
  }
  &__history-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 24px;
  }
  &__history-grid > * {
    min-width: 0;
  }
  &__history-grid :deep(.x--chart-bar > .font-weight-bold) {
    font-weight: 400 !important;
  }
  &__history-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 400;
  }
  &__imports :deep(> .widget-box) {
    padding: 16px 0 0;
    margin-block: 16px 0 !important;
    box-shadow: none;
    border: 0;
    border-block-start: 1px solid var(--sd-modern-border);
    background: transparent;
  }
  &__imports :deep(.font-weight-black),
  &__imports :deep(b) {
    font-weight: 400 !important;
  }
  &__imports :deep(.widget-buttons) {
    padding-inline: 0;
    margin: 0;
  }
  &__imports :deep(.widget-buttons > .v-btn) {
    min-height: 44px;
    padding: 8px 12px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    text-transform: none;
    background: var(--sd-modern-inset);
    border-radius: 8px;
  }
  @media (max-width: 600px) {
    &__history-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

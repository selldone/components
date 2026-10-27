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
  <div v-if="modern" class="s--shop-dashboard-finance-modern text-start">
    <section class="sd-modern-widget">
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="account_balance_wallet" size="20" aria-hidden="true"
          /></span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.modern.finance_snapshot_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ title }} ·
              {{ $t("admin_shop.dashboard.modern.finance_snapshot_subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          :to="{ name: 'BPageShopFinanceReport' }"
          :active="false"
          class="sd-modern-button"
          variant="text"
          prepend-icon="arrow_outward"
        >
          {{ $t("admin_shop.dashboard.modern.finance_report") }}
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("admin_shop.dashboard.modern.finance_report") }}</v-tooltip
          >
        </v-btn>
      </header>
      <div class="s--shop-dashboard-finance-modern__snapshot">
        <b-dashboard-shop-performance-payments
          :modern="true"
          :shop="shop"
          :time-series="timeSeries"
          :snapshot="snapshot_rows.current"
          :previous-snapshot="snapshot_rows.previous"
        />
        <b-dashboard-shop-performance-orders
          :modern="true"
          :shop="shop"
          :time-series="timeSeries"
          :snapshot="snapshot_rows.current"
          :previous-snapshot="snapshot_rows.previous"
        />
        <section class="s--shop-dashboard-finance-modern__mix">
          <div class="d-flex align-center ga-1 mb-3">
            <span class="sd-modern-eyebrow">{{
              $t("admin_shop.dashboard.finance.pie.title")
            }}</span>
            <v-btn
              class="sd-modern-icon-button sd-modern-info-button"
              icon
              variant="text"
              :aria-label="$t('admin_shop.dashboard.finance.pie.title')"
            >
              <v-icon icon="info_outline" size="16" aria-hidden="true" />
              <v-tooltip
                activator="parent"
                location="top"
                open-on-click
                open-on-focus
                interactive
                :max-width="360"
                content-class="sd-modern-tooltip text-start"
                >{{
                  $t("admin_shop.dashboard.modern.sales_mix_help")
                }}</v-tooltip
              >
            </v-btn>
          </div>
          <u-chart-donut
            v-if="pie_chart_total"
            :has-legend="false"
            background="rgb(var(--v-theme-surface))"
            :sections="pie_values"
            :size="100"
            :thickness="32"
            :total="pie_chart_total"
            unit="px"
          >
            <span class="s--shop-dashboard-finance-modern__mix-total">{{
              numeralFormat(pie_chart_total, "0.[0]a")
            }}</span>
          </u-chart-donut>
          <p v-else class="sd-modern-empty-state">
            {{ $t("admin_shop.dashboard.finance.pie.no_data") }}
          </p>
          <div class="s--shop-dashboard-finance-modern__legend">
            <span v-for="part in pie_values" :key="part.label"
              ><span
                class="sd-modern-status__dot"
                :style="{ backgroundColor: part.color }"
              />{{ part.label }}
              <span>{{ numeralFormat(part.value, "0,0") }}</span></span
            >
          </div>
        </section>
      </div>
    </section>
    <section class="sd-modern-widget">
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="currency_exchange" size="20" aria-hidden="true"
          /></span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.modern.finance_native_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.finance_native_subtitle") }}
            </p>
          </div>
        </div>
        <v-btn
          :to="{ name: 'BPageShopFinanceExchange' }"
          :active="false"
          class="sd-modern-button"
          variant="text"
          prepend-icon="settings"
        >
          {{ $t("admin_shop.dashboard.info.currencies") }}
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t("admin_shop.dashboard.info.currencies") }}</v-tooltip
          >
        </v-btn>
      </header>
      <div class="s--shop-dashboard-finance-modern__currencies">
        <section
          v-for="(total, currency) in totalPayFor30days"
          :key="currency"
          class="s--shop-dashboard-finance-modern__currency"
        >
          <header class="s--shop-dashboard-finance-modern__currency-head">
            <span class="d-inline-flex align-center ga-2"
              ><u-currency-icon :currency="currency" flag-only small />{{
                currency
              }}</span
            >
            <span class="sd-modern-label">{{ $t("commons.pay_today") }}</span>
            <u-price
              :amount="GetFinanceValueByCurrency(todayData, currency, 'pay')"
              :currency="currency"
            />
          </header>
          <dl class="s--shop-dashboard-finance-modern__rows">
            <div>
              <dt>{{ $t("commons.pay_yesterday") }}</dt>
              <dd>
                <u-price
                  :amount="
                    GetFinanceValueByCurrency(yesterdayData, currency, 'pay')
                  "
                  :currency="currency"
                />
              </dd>
            </div>
            <div>
              <dt>
                {{ $t("admin_shop.dashboard.modern.finance_period_total") }}
              </dt>
              <dd><u-price :amount="total" :currency="currency" /></dd>
            </div>
          </dl>
          <finance-inline-chart
            :colors="GetCurrency(currency).gradient"
            :currency="currency"
            :days="timeSeries.days"
            :finance-keys="['sell', 'pay']"
            :time-series="timeSeries"
            :value-titles="[
              $t('admin_shop.dashboard.finance.table.sell'),
              $t('admin_shop.dashboard.finance.table.pay'),
            ]"
            height="68"
          />
        </section>
      </div>
    </section>
    <section class="sd-modern-widget">
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon icon="multiline_chart" size="20" aria-hidden="true"
          /></span>
          <div>
            <h2 class="sd-modern-title-text">
              {{ $t("admin_shop.dashboard.modern.finance_activity_title") }}
            </h2>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.finance_activity_subtitle") }}
            </p>
          </div>
        </div>
      </header>
      <v-btn-toggle
        v-model="mode_funnel"
        multiple
        class="s--shop-dashboard-finance-modern__modes"
        selected-class="s--shop-dashboard-finance-modern__selected"
      >
        <v-btn
          v-for="measure in amount_measures"
          :key="measure.key"
          :value="measure.key"
          variant="text"
          class="sd-modern-button"
          :prepend-icon="
            mode_funnel.includes(measure.key) ? 'check' : undefined
          "
        >
          {{ $t(measure.label) }}
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{ $t(measure.label) }}</v-tooltip
          >
        </v-btn>
        <v-btn
          value="count"
          variant="text"
          class="sd-modern-button"
          :prepend-icon="mode_funnel.includes('count') ? 'check' : undefined"
        >
          {{ $t("admin_shop.dashboard.finance.sell_count") }}
          <v-tooltip
            activator="parent"
            location="top"
            open-on-focus
            content-class="sd-modern-tooltip text-start"
            >{{
              $t("admin_shop.dashboard.finance.sell_count_chart_title")
            }}</v-tooltip
          >
        </v-btn>
      </v-btn-toggle>
      <template v-for="measure in amount_measures" :key="measure.key">
        <section
          v-if="mode_funnel.includes(measure.key)"
          class="s--shop-dashboard-finance-modern__history"
        >
          <h3 class="s--shop-dashboard-finance-modern__section-title">
            {{ $t(measure.label) }}
          </h3>
          <s-chart-funnel-finance
            :shop="shop"
            :time-series="timeSeries"
            :finance-key="measure.key"
            class="s--shop-dashboard-finance-modern__native-chart"
          />
        </section>
      </template>
      <section
        v-if="mode_funnel.includes('count')"
        class="s--shop-dashboard-finance-modern__history"
      >
        <h3 class="s--shop-dashboard-finance-modern__section-title">
          {{ $t("admin_shop.dashboard.finance.sell_count_chart_title") }}
        </h3>
        <s-chart-funnel-data
          :colors="colors"
          :keys="[
            'sell_products_physical',
            'sell_products_virtual',
            'sell_products_file',
            'sell_products_service',
            'sell_products_subscription',
            'sell_avocados',
          ]"
          :shop="shop"
          :sub-label-images="subLabelImages"
          :sub-labels="subLabels"
          :time-series="timeSeries"
          class="s--shop-dashboard-finance-modern__native-chart"
        />
      </section>
    </section>
    <s-widget-box
      :h100="!modern"
      :class="{ 'sd-modern-widget': modern }"
      :color="modern ? 'rgb(var(--v-theme-surface))' : '#f0f0f0'"
      :dark="modern && $vuetify.theme.current.dark"
      :icon-to="modern ? undefined : { name: 'BPageShopFinanceGateways' }"
      :title="
        modern ? undefined : $t('admin_shop.dashboard.finance.active_gateways')
      "
      class="mb-5"
      :icon="modern ? undefined : 'payment'"
      :sub-title="
        modern
          ? undefined
          : 'This is a compilation of payment gateways integrated into your store. Customers have the option to make payments in any currency through a single payment gateway. Employ multiple gateways for various currencies only if you wish to establish distinct pricing for each currency.'
      "
    >
      <template v-if="modern" v-slot:actions>
        <header class="sd-modern-header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon icon="payment" size="20" aria-hidden="true"
            /></span>
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.finance_methods_title") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{ $t("admin_shop.dashboard.modern.gateways_hint") }}
              </p>
            </div>
          </div>
          <v-btn
            :to="{ name: 'BPageShopFinanceGateways' }"
            class="sd-modern-button"
            variant="text"
            :active="false"
            prepend-icon="settings"
            :aria-label="$t('admin_shop.dashboard.finance.active_gateways')"
            v-tooltip="{
              text: $t('admin_shop.dashboard.finance.active_gateways'),
              location: 'top',
              contentClass: 'sd-modern-tooltip text-start',
              openOnFocus: true,
            }"
          >
            {{ $t("admin_shop.dashboard.modern.finance_manage_methods") }}
          </v-btn>
        </header>
      </template>
      <v-row class="my-2" no-gutters>
        <v-chip
          v-for="item in currencies"
          :key="item.code"
          class="ma-1"
          :color="modern ? undefined : '#111'"
          :variant="modern ? 'text' : 'outlined'"
        >
          <u-currency-icon
            :currency="item"
            class="ms-n1"
            flag
            small
          ></u-currency-icon>

          <span class="small ms-1">{{ getCurrencyName(item.code) }}</span>
        </v-chip>

        <v-btn
          :to="{ name: 'BPageShopFinanceExchange' }"
          icon
          :class="{ 'sd-modern-icon-button': modern }"
          :aria-label="$t('admin_shop.dashboard.info.currencies')"
          v-tooltip="{
            text: $t('admin_shop.dashboard.info.currencies'),
            location: 'top',
            contentClass: 'sd-modern-tooltip text-start',
            openOnFocus: true,
          }"
          variant="text"
        >
          <v-icon>more_horiz</v-icon>
        </v-btn>
      </v-row>

      <v-btn
        v-if="!currencies.length"
        :to="{ name: 'BPageShopFinanceExchange' }"
        :color="modern ? 'primary' : 'red'"
        :class="{ 'sd-modern-button': modern }"
        :variant="modern ? 'text' : 'flat'"
        v-tooltip="{
          text: $t('admin_shop.dashboard.info.currencies_alert'),
          location: 'top',
          contentClass: 'sd-modern-tooltip text-start',
          openOnFocus: true,
        }"
      >
        <v-icon :color="modern ? undefined : '#fff'"> add</v-icon>
        <span :class="{ 'text-white': !modern }">
          {{ $t("admin_shop.dashboard.info.currencies_alert") }}
        </span>
      </v-btn>

      <v-data-table
        :group-by="[
          {
            key: 'currency',
            order: 'asc',
          },
        ]"
        :headers="gateway_headers"
        :items="_shop_gateways"
        :items-per-page="100"
        class="bg-transparent"
        :class="{ 'sd-modern-data-table': modern }"
        item-key="id"
      >
        <template
          v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
        >
          <tr>
            <td v-if="modern" :colspan="columns.length" class="pa-0">
              <button
                type="button"
                :aria-expanded="isGroupOpen(item)"
                class="s--shop-dashboard-finance-modern__gateway-group text-start"
                v-tooltip="{
                  text: getCurrencyName(item.value),
                  location: 'top',
                  contentClass: 'sd-modern-tooltip text-start',
                  openOnFocus: true,
                }"
                @click="toggleGroup(item)"
              >
                <u-currency-icon :currency="item.value" flag small />
                <span
                  >{{ item.value }} · {{ getCurrencyName(item.value) }}</span
                >
                <span class="s--shop-dashboard-finance-modern__group-providers">
                  <span
                    v-for="_g in item.items"
                    :key="_g.id"
                    class="d-inline-flex align-center me-3"
                  >
                    <img
                      :src="getShopImagePath(_g.raw.gateway.icon)"
                      alt=""
                      width="20"
                      height="20"
                      class="me-1"
                      :class="{
                        'img-grayscale':
                          !_g.raw.enable || !_g.raw.gateway.enable,
                      }"
                    />
                    <span>{{ _g.raw.gateway.name }}</span>
                  </span>
                </span>
                <small>{{ getCountryFromCurrency(item.value) }}</small>
                <v-icon size="small">{{
                  isGroupOpen(item) ? "expand_less" : "expand_more"
                }}</v-icon>
              </button>
            </td>
            <td v-else :colspan="columns.length - 1">
              <VBtn
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                class="me-2"
                size="small"
                variant="text"
                @click="toggleGroup(item)"
              ></VBtn>

              <u-currency-icon
                :currency="item.value"
                flag
                small
              ></u-currency-icon>

              <b class="small ms-1 me-3">{{ getCurrencyName(item.value) }}</b>

              <v-chip
                v-for="_g in item.items"
                :key="_g.id"
                :variant="
                  _g.raw.enable && _g.raw.gateway.enable ? 'text' : 'plain'
                "
                class="ma-1"
                color="#111"
              >
                <v-img
                  :src="getShopImagePath(_g.raw.gateway.icon)"
                  class="me-1"
                  height="24"
                  width="24"
                ></v-img>

                <b class="small ms-1">{{ _g.raw.gateway.name }}</b>
              </v-chip>
            </td>

            <td v-if="!modern" class="text-end" colspan="1">
              <small>
                {{ getCountryFromCurrency(item.value) }}
              </small>
            </td>
          </tr>
        </template>

        <template v-slot:item.name="{ item }">
          <img
            :class="{ 'img-grayscale': !item.enable }"
            :src="getShopImagePath(item.gateway.icon)"
            class="m-2 rounded-8px"
            height="24px"
            width="auto"
          />

          {{ item.gateway.name }}
        </template>

        <template v-slot:item.state="{ item }">
          <v-chip
            v-if="!item.gateway.enable"
            class="ma-1"
            :color="modern ? undefined : 'red'"
            size="small"
            :title="
              modern
                ? $t('admin_shop.dashboard.modern.gateway_globally_disabled')
                : 'This payment globally disabled on Selldone.'
            "
            :variant="modern ? 'text' : 'flat'"
          >
            <v-icon start :color="modern ? 'error' : undefined">warning</v-icon>
            {{
              modern
                ? $t("admin_shop.dashboard.modern.gateway_globally_disabled")
                : "Globally Disabled"
            }}
          </v-chip>

          <v-chip
            v-if="item.livemode"
            class="ma-1"
            :color="modern ? undefined : 'green'"
            size="small"
            :variant="modern ? 'text' : 'flat'"
          >
            <v-icon start :color="modern ? 'success' : undefined">paid</v-icon>
            {{
              modern ? $t("admin_shop.dashboard.modern.live_mode") : "Live Mode"
            }}
          </v-chip>
          <v-chip
            v-else
            class="ma-1"
            :color="modern ? undefined : 'orange'"
            size="small"
            :variant="modern ? 'text' : 'flat'"
          >
            <v-icon start>science</v-icon>
            {{
              modern
                ? $t("admin_shop.dashboard.modern.debug_mode")
                : "Debug Mode"
            }}
          </v-chip>
        </template>
        <template v-slot:item.type="{ item }">
          {{
            item.gateway.cod
              ? $t("global.commons.COD")
              : item.gateway.cash
                ? $t("global.commons.cash")
                : item.gateway.dir
                  ? $t("global.commons.dir_payment")
                  : $t("global.commons.online")
          }}
        </template>
        <template v-slot:item.enable="{ item }">
          <v-chip
            :color="modern ? undefined : '#333'"
            :variant="modern ? 'text' : 'tonal'"
            size="small"
          >
            <v-icon v-if="item.enable" color="success" size="x-small" start
              >lens
            </v-icon>
            <v-icon v-else color="red" size="x-small" start>lens</v-icon>
            {{ $t(item.enable ? "global.active" : "global.inactive") }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            :to="{
              name: 'BPageGatewayDashboard',
              params: { gateway_code: item.gateway.code },
            }"
            :color="modern ? undefined : 'primary'"
            :active="modern ? false : undefined"
            :class="{ 'sd-modern-button sd-modern-button--inline': modern }"
            variant="text"
            v-tooltip="{
              text: $t('global.actions.edit'),
              location: 'top',
              contentClass: 'sd-modern-tooltip text-start',
              openOnFocus: true,
            }"
          >
            <v-icon class="me-1" start>edit</v-icon>
            {{ $t("global.actions.edit") }}
          </v-btn>
        </template>
      </v-data-table>
    </s-widget-box>
  </div>

  <template v-else>
    <div>
      <s-widget-box
        :icon-to="{ name: 'BPageShopFinanceReport' }"
        :title="title"
        class="mb-5"
        icon="multiline_chart"
      >
        <v-row class="my-0">
          <!-- ------------------------------ Today Payments ------------------------------ -->

          <v-col
            class="border-end-grater-xs p-3 px-4 text-center"
            cols="12"
            sm="4"
          >
            <b-dashboard-shop-performance-payments
              :shop="shop"
              :time-series="timeSeries"
            >
            </b-dashboard-shop-performance-payments>
          </v-col>

          <!-- ------------------------------ Today Sales ------------------------------ -->

          <v-col
            class="border-end-grater-xs p-3 px-4 text-center"
            cols="12"
            sm="4"
          >
            <b-dashboard-shop-performance-orders
              :shop="shop"
              :time-series="timeSeries"
            ></b-dashboard-shop-performance-orders>
          </v-col>

          <!-- Footer > Pie chart -->

          <v-col
            class="p-3 text-center d-flex align-center justify-center flex-column"
            cols="12"
            sm="4"
          >
            <s-donut-chart
              v-if="pie_chart_total"
              :has-legend="false"
              :sections="pie_values"
              :size="64"
              :thickness="40"
              :total="pie_chart_total"
              unit="px"
            >
              <span style="font-size: 10px; font-weight: 500">{{
                numeralFormat(pie_chart_total, "0.[0]a")
              }}</span>
            </s-donut-chart>
            <p class="text-muted my-2">
              <small>
                {{
                  pie_chart_total
                    ? $t("admin_shop.dashboard.finance.pie.title")
                    : $t("admin_shop.dashboard.finance.pie.no_data")
                }}
              </small>
            </p>
          </v-col>
        </v-row>
      </s-widget-box>

      <s-widget-box
        :icon-to="{ name: 'BPageShopFinanceReport' }"
        :sub-title="$t('admin_shop.dashboard.finance.title_small')"
        :title="$t('admin_shop.dashboard.finance.title')"
        class="mb-5"
        icon="bar_chart"
      >
        <p>
          <b class="text-capitalize me-2">{{
            $t("admin_shop.dashboard.finance.total_30days_title")
          }}</b>

          <small>({{ $t("admin_shop.dashboard.finance.last_30_day") }})</small>
        </p>

        <v-card
          v-for="(total, currency, i) in totalPayFor30days"
          :key="currency"
          :style="{ 'animation-delay': 100 + i * 100 + 'ms' }"
          class="my-2 border rounded-2rem fadeIn"
          flat
        >
          <u-currency-icon
            :currency="GetCurrency(currency)"
            :title="$t('global.commons.currency')"
            class="absolute-top-end m-2"
            gradient
            small
          ></u-currency-icon>

          <div class="p-2 d-flex border-between text-center">
            <div class="flex-grow-1">
              <u-price
                :amount="GetFinanceValueByCurrency(todayData, currency, 'pay')"
                :currency="currency"
                :large="$vuetify.display.smAndUp"
                class="font-weight-black d-block"
              ></u-price>
              <small>{{ $t("commons.pay_today") }}</small>
            </div>

            <div class="flex-grow-1 hide-on-small-600">
              <u-price
                :amount="
                  GetFinanceValueByCurrency(yesterdayData, currency, 'pay')
                "
                :currency="currency"
                :large="$vuetify.display.smAndUp"
                class="font-weight-black d-block"
              ></u-price>
              <small>{{ $t("commons.pay_yesterday") }}</small>
            </div>

            <div class="flex-grow-1">
              <u-price
                :amount="total"
                :currency="currency"
                :large="$vuetify.display.smAndUp"
                class="font-weight-black d-block"
              ></u-price>
              <small>{{ $t("commons.pay_last30days") }}</small>
            </div>
          </div>

          <v-card-subtitle class="py-0">
            {{ $t("admin_shop.dashboard.finance.table.sell_daily") }}:
          </v-card-subtitle>
          <v-card-text>
            <finance-inline-chart
              :colors="GetCurrency(currency).gradient"
              :currency="currency"
              :days="timeSeries.days"
              :finance-keys="['sell', 'pay']"
              :timeSeries="timeSeries"
              :value-titles="[
                $t('admin_shop.dashboard.finance.table.sell'),
                $t('admin_shop.dashboard.finance.table.pay'),
              ]"
              height="68"
            ></finance-inline-chart>
          </v-card-text>
        </v-card>
      </s-widget-box>

      <!-- Actions > Report for 30 days -->

      <v-row class="overflow-x-auto my-3" no-gutters>
        <v-btn-toggle
          v-model="mode_funnel"
          class="rounded-toggles"
          multiple
          rounded
          selected-class="black-flat"
          style="height: 64px"
        >
          <v-btn class="min-width-100" value="pay" variant="text">
            <v-icon v-if="mode_funnel.includes('pay')" class="me-1"
              >check
            </v-icon>
            {{ $t("admin_shop.dashboard.finance.pay_amount") }}
          </v-btn>
          <v-btn class="min-width-100" value="sell" variant="text">
            <v-icon v-if="mode_funnel.includes('sell')" class="me-1"
              >check
            </v-icon>
            {{ $t("admin_shop.dashboard.finance.sell_amount") }}
          </v-btn>
          <v-btn class="min-width-100" value="discount" variant="text">
            <v-icon
              v-if="mode_funnel.includes('discount')"
              class="me-1"
              size="small"
              >check
            </v-icon>
            {{ $t("admin_shop.dashboard.finance.discount_amount") }}
          </v-btn>
          <v-btn class="min-width-100" value="count" variant="text">
            <v-icon v-if="mode_funnel.includes('count')" class="me-1"
              >check
            </v-icon>
            {{ $t("admin_shop.dashboard.finance.sell_count") }}
          </v-btn>
        </v-btn-toggle>
      </v-row>

      <!-- Actions > Payment Amount Chart -->
      <v-expand-transition>
        <s-widget-box
          v-if="mode_funnel.includes('pay')"
          :icon-to="{ name: 'BPageShopFinanceReport' }"
          :sub-title="$t('admin_shop.dashboard.finance.title_small')"
          :title="$t('admin_shop.dashboard.finance.pay_amount_chart_title')"
          class="mb-5"
          icon="multiline_chart"
        >
          <s-chart-funnel-finance
            :shop="shop"
            :time-series="timeSeries"
            bordered
            finance-key="pay"
            class="mx-n5"
          />
        </s-widget-box>
      </v-expand-transition>

      <!-- Actions > Sell Amount Chart -->
      <v-expand-transition>
        <s-widget-box
          v-if="mode_funnel.includes('sell')"
          :icon-to="{ name: 'BPageShopFinanceReport' }"
          :sub-title="$t('admin_shop.dashboard.finance.title_small')"
          :title="$t('admin_shop.dashboard.finance.sell_amount_chart_title')"
          class="mb-5"
          icon="multiline_chart"
        >
          <s-chart-funnel-finance
            :shop="shop"
            :time-series="timeSeries"
            bordered
            finance-key="sell"
            class="mx-n5"
          />
        </s-widget-box>
      </v-expand-transition>

      <!-- Actions > Discount Amount Chart -->
      <v-expand-transition>
        <s-widget-box
          v-if="mode_funnel.includes('discount')"
          :icon-to="{ name: 'BPageShopFinanceReport' }"
          :sub-title="$t('admin_shop.dashboard.finance.title_small')"
          :title="
            $t('admin_shop.dashboard.finance.discount_amount_chart_title')
          "
          class="mb-5"
          icon="multiline_chart"
        >
          <s-chart-funnel-finance
            :shop="shop"
            :time-series="timeSeries"
            bordered
            finance-key="discount"
            class="mx-n5"
          />
        </s-widget-box>
      </v-expand-transition>

      <!-- Actions > Count Chart -->
      <v-expand-transition>
        <s-widget-box
          v-if="mode_funnel.includes('count')"
          :icon-to="{ name: 'BPageShopFinanceReport' }"
          :sub-title="$t('admin_shop.dashboard.finance.sell_count_chart_title')"
          :title="$t('global.commons.carts')"
          class="mb-5"
          icon="multiline_chart"
        >
          <s-chart-funnel-data
            :colors="colors"
            :keys="[
              'sell_products_physical',
              'sell_products_virtual',
              'sell_products_file',
              'sell_products_service',
              'sell_products_subscription',
              'sell_avocados',
            ]"
            :shop="shop"
            :sub-label-images="subLabelImages"
            :sub-labels="subLabels"
            :time-series="timeSeries"
            bordered
            class="mx-n5"
          />
        </s-widget-box>
      </v-expand-transition>

      <!-- █████████████████████████ Gateways █████████████████████████ -->

      <s-widget-box
        :icon-to="{ name: 'BPageShopFinanceGateways' }"
        :title="$t('admin_shop.dashboard.finance.active_gateways')"
        class="mb-5"
        icon="payment"
        sub-title="This is a compilation of payment gateways integrated into your store. Customers have the option to make payments in any currency through a single payment gateway. Employ multiple gateways for various currencies only if you wish to establish distinct pricing for each currency."
      >
        <v-row class="my-2" no-gutters>
          <v-chip
            v-for="item in currencies"
            :key="item.code"
            class="ma-1"
            color="#111"
            variant="outlined"
          >
            <u-currency-icon
              :currency="item"
              class="ms-n1"
              flag
              small
            ></u-currency-icon>

            <b class="small ms-1">{{ getCurrencyName(item.code) }}</b>
          </v-chip>

          <v-btn
            :to="{ name: 'BPageShopFinanceExchange' }"
            icon
            title="Manage currencies"
            variant="text"
          >
            <v-icon>more_horiz</v-icon>
          </v-btn>
        </v-row>

        <v-btn
          v-if="!currencies.length"
          :to="{ name: 'BPageShopFinanceExchange' }"
          color="red"
          variant="flat"
        >
          <v-icon color="#fff"> add</v-icon>
          <span class="text-white">
            {{ $t("admin_shop.dashboard.info.currencies_alert") }}
          </span>
        </v-btn>

        <v-data-table
          :group-by="[
            {
              key: 'currency',
              order: 'asc',
            },
          ]"
          :headers="gateway_headers"
          :items="_shop_gateways"
          :items-per-page="100"
          class="bg-transparent"
          item-key="id"
        >
          <template
            v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
          >
            <tr>
              <td :colspan="columns.length - 1">
                <VBtn
                  :icon="isGroupOpen(item) ? '$expand' : '$next'"
                  class="me-2"
                  size="small"
                  variant="text"
                  @click="toggleGroup(item)"
                ></VBtn>

                <u-currency-icon
                  :currency="item.value"
                  flag
                  small
                ></u-currency-icon>

                <b class="small ms-1 me-3">{{ getCurrencyName(item.value) }}</b>

                <v-chip
                  v-for="_g in item.items"
                  :key="_g.id"
                  :variant="
                    _g.raw.enable && _g.raw.gateway.enable ? 'text' : 'plain'
                  "
                  class="ma-1"
                  color="#111"
                >
                  <v-img
                    :src="getShopImagePath(_g.raw.gateway.icon)"
                    class="me-1"
                    height="24"
                    width="24"
                  ></v-img>

                  <b class="small ms-1">{{ _g.raw.gateway.name }}</b>
                </v-chip>
              </td>

              <td class="text-end" colspan="1">
                <small>
                  {{ getCountryFromCurrency(item.value) }}
                </small>
              </td>
            </tr>
          </template>

          <template v-slot:item.name="{ item }">
            <img
              :class="{ 'img-grayscale': !item.enable }"
              :src="getShopImagePath(item.gateway.icon)"
              class="m-2 rounded-8px"
              height="24px"
              width="auto"
            />

            {{ item.gateway.name }}
          </template>

          <template v-slot:item.state="{ item }">
            <v-chip
              v-if="!item.gateway.enable"
              class="ma-1"
              color="red"
              size="small"
              title="This payment globally disabled on Selldone."
              variant="flat"
            >
              <v-icon start>warning</v-icon>
              Globally Disabled
            </v-chip>

            <v-chip
              v-if="item.livemode"
              class="ma-1"
              color="green"
              size="small"
              variant="flat"
            >
              <v-icon start>paid</v-icon>
              Live Mode
            </v-chip>
            <v-chip
              v-else
              class="ma-1"
              color="orange"
              size="small"
              variant="flat"
            >
              <v-icon start>science</v-icon>
              Debug Mode
            </v-chip>
          </template>
          <template v-slot:item.type="{ item }">
            {{
              item.gateway.cod
                ? $t("global.commons.COD")
                : item.gateway.cash
                  ? $t("global.commons.cash")
                  : item.gateway.dir
                    ? $t("global.commons.dir_payment")
                    : $t("global.commons.online")
            }}
          </template>
          <template v-slot:item.enable="{ item }">
            <v-chip color="#333" size="small">
              <v-icon v-if="item.enable" color="success" size="x-small" start
                >lens
              </v-icon>
              <v-icon v-else color="red" size="x-small" start>lens</v-icon>
              {{ $t(item.enable ? "global.active" : "global.inactive") }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn
              :to="{
                name: 'BPageGatewayDashboard',
                params: { gateway_code: item.gateway.code },
              }"
              color="primary"
              variant="text"
            >
              <v-icon class="me-1" start>edit</v-icon>
              {{ $t("global.actions.edit") }}
            </v-btn>
          </template>
        </v-data-table>
      </s-widget-box>
    </div>
  </template>
</template>

<script lang="ts">
import { getReportSnapshot } from "../performance/periodComparison.ts";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UChartDonut from "../../../../ui/chart/donut/UChartDonut.vue";

import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import BDashboardShopPerformancePayments from "../../../dashboard/shop/performance/payments/BDashboardShopPerformancePayments.vue";
import BDashboardShopPerformanceOrders from "../../../dashboard/shop/performance/orders/BDashboardShopPerformanceOrders.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { CurrencyHelper } from "@selldone/core-js/helper/currency/CurrencyHelper";
import FinanceInlineChart from "../../../chart/FinanceInlineChart.vue";
import SChartFunnelData from "../../../chart/funnel/data/SChartFunnelData.vue";
import SChartFunnelFinance from "../../../chart/funnel/finance/SChartFunnelFinance.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "BDashboardShopFinance",
  mixins: [DateMixin, CurrencyMixin],

  components: {
    UChartDonut,
    BDashboardShopPerformanceOrders,
    BDashboardShopPerformancePayments,
    UCurrencyIcon,
    FinanceInlineChart,
    SChartFunnelData,
    SChartFunnelFinance,
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
      type: Object,
    },
    shopGateways: {
      required: true,
      type: Array,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
    pay: {
      default: false,
      type: Boolean,
    },
    sell: {
      default: false,
      type: Boolean,
    },
    discount: {
      default: false,
      type: Boolean,
    },
    count: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      gateway_headers: [
        { title: "Gateway", value: "name" },
        { title: this.$t("global.commons.State"), value: "state" },
        { title: this.$t("global.commons.type"), value: "type" },
        { title: this.$t("global.commons.enable"), value: "enable" },
        { title: "", value: "actions", align: "end" },
      ],

      subLabels: [
        this.$t("global.product_types.physical"),
        this.$t("global.product_types.virtual"),
        this.$t("global.product_types.file"),
        this.$t("global.product_types.service"),
        this.$t("global.product_types.subscription"),
        this.$t("global.commons.avocado"),
      ],
      subLabelImages: [
        ProductType.PHYSICAL.image,
        ProductType.VIRTUAL.image,
        ProductType.FILE.image,
        ProductType.SERVICE.image,
        ProductType.SUBSCRIPTION.image,
        require("../../../../assets/icons/avocado.svg"),
      ],

      mode_funnel: [],
    };
  },

  created() {
    if (this.pay) this.mode_funnel.push("pay");
    if (this.sell) this.mode_funnel.push("sell");
    if (this.discount) this.mode_funnel.push("discount");
    if (this.count) this.mode_funnel.push("count");
  },

  computed: {
    snapshot_rows() {
      return getReportSnapshot(this.timeSeries);
    },
    amount_measures() {
      return [
        { key: "pay", label: "admin_shop.dashboard.finance.pay_amount" },
        { key: "sell", label: "admin_shop.dashboard.finance.sell_amount" },
        {
          key: "discount",
          label: "admin_shop.dashboard.finance.discount_amount",
        },
      ];
    },
    _shop_gateways() {
      return this.shopGateways.map((item) => {
        return {
          ...item,
          currency: item.gateway.currency,
        };
      });
    },

    todayDataOffset() {
      return this.modern
        ? this.snapshot_rows.current
        : this.timeSeries.todayDataOffset();
    },

    title() {
      return !this.todayDataOffset ||
        this.isToday(this.todayDataOffset.created_at)
        ? this.$t("admin_shop.dashboard.performance.title")
        : this.getLocalDateString(this.todayDataOffset.created_at);
    },

    currencies() {
      let out = [];
      for (let key in Currency) {
        let item = Currency[key];
        if (
          item.enable &&
          this.shop.currencies &&
          this.shop.currencies.includes(key)
        )
          out.push(item);
      }
      return out;
    },

    colors() {
      return [
        ProductType.PHYSICAL.colors,
        ProductType.VIRTUAL.colors,
        ProductType.FILE.colors,
        ProductType.SERVICE.colors,
        ProductType.SUBSCRIPTION.colors,
        ["#333", "#111"],
      ];
    },
    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    totalPayFor30days() {
      return this.timeSeries.financeTotalOf("pay");
    },

    pie_values() {
      return [
        {
          value: this.todayData.sell_products_physical,
          label: this.$t(ProductType.PHYSICAL.name),
          color: ProductType.PHYSICAL.color,
        },
        {
          value: this.todayData.sell_products_virtual,
          label: this.$t(ProductType.VIRTUAL.name),
          color: ProductType.VIRTUAL.color,
        },
        {
          value: this.todayData.sell_products_file,
          label: this.$t(ProductType.FILE.name),
          color: ProductType.FILE.color,
        },
        {
          value: this.todayData.sell_products_service,
          label: this.$t(ProductType.SERVICE.name),
          color: ProductType.SERVICE.color,
        },
        {
          value: this.todayData.sell_products_subscription,
          label: this.$t(ProductType.SUBSCRIPTION.name),
          color: ProductType.SUBSCRIPTION.color,
        },
      ];
    },

    pie_chart_total() {
      return (
        this.todayData.sell_products_virtual +
        this.todayData.sell_products_physical +
        this.todayData.sell_products_file +
        this.todayData.sell_products_service +
        this.todayData.sell_products_subscription
      );
    },
  },
  methods: {
    getCountryFromCurrency(currency) {
      return CurrencyHelper.GetCountryByCurrencyCode(currency);
    },
  },
};
</script>

<style lang="scss" scoped>
.s--shop-dashboard-finance-modern {
  display: grid;
  gap: 20px;
  min-width: 0;
  > .sd-modern-widget {
    margin: 0 !important;
  }
  > .sd-modern-widget :deep(> .widget-body) {
    margin: 0 !important;
  }
  &__snapshot {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 28px;
  }
  &__snapshot > * {
    min-width: 0;
  }
  &__snapshot :deep(.b-dashboard-performance-stat__value) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-block: 8px 16px;
    font-size: 28px;
    font-weight: 400;
    line-height: 1.35;
    font-variant-numeric: tabular-nums;
  }
  &__snapshot :deep(.b-dashboard-performance-stat__payment) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 20px;
    font-weight: 400;
    line-height: 1.5;
  }
  &__snapshot :deep(.b-dashboard-performance-stat__currency) {
    flex: 0 0 100%;
    max-width: 150px;
    margin-block: 4px;
  }
  &__snapshot :deep(.b-dashboard-performance-stat__currency-code) {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
  }
  &__snapshot :deep(.s--change-chip) {
    color: var(--sd-modern-muted) !important;
    background: transparent !important;
    padding-inline: 0;
    font-size: 12px;
  }
  &__snapshot :deep(.s--change-chip .v-icon--start) {
    margin-inline-start: 0;
    margin-inline-end: 4px;
    flex-shrink: 0;
  }
  &__mix {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  &__mix-total {
    font-size: 18px;
    font-weight: 400;
  }
  &__legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 14px;
    margin-block-start: 16px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__legend > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  &__currencies {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  &__currency {
    min-width: 0;
  }
  &__currency-head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 14px;
  }
  &__currency-head > :last-child {
    margin-inline-start: auto;
    font-size: 22px;
    font-weight: 400;
  }
  &__rows {
    margin: 12px 0;
    font-size: 13px;
    font-weight: 400;
  }
  &__rows > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 44px;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__rows dt {
    color: var(--sd-modern-muted);
  }
  &__rows dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  &__rows :deep(.u--price) {
    font-weight: 400;
  }
  &__modes {
    height: auto;
    flex-wrap: wrap;
    gap: 8px;
    overflow: visible;
  }
  &__modes > .v-btn {
    border-radius: 9px !important;
    font-weight: 400;
  }
  &__selected {
    background: rgba(var(--v-theme-on-surface), 0.06);
  }
  &__history {
    margin-block-start: 24px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
    min-width: 0;
  }
  &__section-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
  }
  &__native-chart :deep(.rounded-toggles) {
    height: auto;
    flex-wrap: wrap;
    gap: 6px;
    background: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
  &__native-chart :deep(.rounded-toggles > .v-btn) {
    min-height: 44px;
    height: auto !important;
    padding: 6px 12px;
    font-weight: 400;
    border-radius: 8px !important;
  }
  &__native-chart :deep(.rounded-toggles .dark-flat) {
    color: rgb(var(--v-theme-on-surface)) !important;
    background: rgba(var(--v-theme-on-surface), 0.07) !important;
  }
  &__native-chart :deep(.rounded-toggles .dark-flat .v-btn__overlay) {
    opacity: 0;
  }
  &__gateway-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    min-height: 48px;
    padding: 10px 14px;
    background: var(--sd-modern-inset);
    font-size: 13px;
    font-weight: 400;
  }
  &__gateway-group:hover {
    background: rgba(var(--v-theme-on-surface), 0.05);
  }
  &__gateway-group:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -3px;
  }
  &__group-providers {
    display: flex;
    flex: 1 1 180px;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--sd-modern-muted);
  }
  @media (max-width: 900px) {
    &__snapshot {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    &__mix {
      grid-column: 1 / -1;
    }
  }
  @media (max-width: 600px) {
    &__snapshot,
    &__currencies {
      grid-template-columns: minmax(0, 1fr);
    }
    &__mix {
      grid-column: auto;
    }
  }
}
</style>

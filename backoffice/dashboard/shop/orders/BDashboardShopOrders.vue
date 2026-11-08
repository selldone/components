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
  <div v-if="modern" class="b-dashboard-orders-view text-start">
    <section class="b-dashboard-orders-summary sd-modern-widget text-start">
      <header class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon size="20" aria-hidden="true">shopping_basket</v-icon></span
          >
          <div>
            <div class="d-flex align-center ga-1">
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.orders_to_process") }}
              </h2>
              <v-btn
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="
                  $t('global.commons.help') +
                  ' · ' +
                  $t('admin_shop.dashboard.modern.orders_to_process')
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
                    {{ $t("admin_shop.dashboard.modern.orders_help") }}
                  </p>
                </v-tooltip>
              </v-btn>
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.modern.queue_scope") }}
            </p>
          </div>
        </div>
        <v-btn
          v-if="can_open_process"
          :to="{ name: orders_page }"
          class="sd-modern-button"
          variant="text"
        >
          {{ $t("admin_shop.dashboard.modern.process_orders") }}
          <v-icon end size="small" class="flip-rtl">arrow_forward</v-icon>
          <v-tooltip
            activator="parent"
            :open-on-focus="true"
            location="top"
            content-class="sd-modern-tooltip text-start"
            >{{ $t("admin_shop.dashboard.modern.process_orders") }}</v-tooltip
          >
        </v-btn>
      </header>
      <div class="b-dashboard-orders-summary__total">
        <strong>{{
          numeralFormat(totalPendingOrders + totalPendingOrders_Avocado, "0,0")
        }}</strong>
        <span>{{
          $t("admin_shop.dashboard.modern.pending_enabled_types")
        }}</span>
      </div>
      <!-- One aligned table: a column per processing stage, and each queue row opens its orders. -->
      <table class="b-dashboard-orders-summary__table">
        <thead>
          <tr>
            <th
              scope="col"
              class="sd-modern-list-header b-dashboard-orders-summary__type"
            >
              {{ $t("global.commons.type") }}
            </th>
            <th
              v-for="stage in queue_stages"
              :key="stage.code"
              scope="col"
              class="sd-modern-list-header b-dashboard-orders-summary__stage"
            >
              <v-icon
                class="b-dashboard-orders-summary__stage-icon"
                size="14"
                aria-hidden="true"
                >{{ stage.icon }}</v-icon
              ><span class="b-dashboard-orders-summary__stage-name">{{
                $t(stage.name)
              }}</span>
            </th>
            <th
              scope="col"
              class="sd-modern-list-header b-dashboard-orders-summary__count"
            >
              {{ $t("global.commons.pending") }}
            </th>
            <td
              v-if="can_open_process"
              class="b-dashboard-orders-summary__go"
            ></td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in queue_rows"
            :key="row.key"
            :class="{ 'sd-modern-clickable-item': can_open_process }"
          >
            <th scope="row" class="b-dashboard-orders-summary__type">
              <component
                :is="can_open_process ? 'router-link' : 'span'"
                :to="can_open_process ? { name: row.page } : undefined"
                :aria-label="
                  can_open_process
                    ? $t('admin_shop.dashboard.modern.process_orders') +
                      ' · ' +
                      row.label
                    : undefined
                "
                class="b-dashboard-orders-summary__link"
                ><img :src="row.icon" width="20" height="20" alt="" /><span>{{
                  row.label
                }}</span></component
              >
            </th>
            <td
              v-if="row.note"
              :colspan="queue_stages.length"
              class="b-dashboard-orders-summary__note"
            >
              {{ row.note }}
            </td>
            <template v-else>
              <td
                v-for="(value, index) in row.stages"
                :key="queue_stages[index].code"
                class="b-dashboard-orders-summary__stage"
                :class="{ '-muted': !value }"
              >
                {{ value === null ? "—" : numeralFormat(value, "0,0") }}
              </td>
            </template>
            <td
              class="b-dashboard-orders-summary__count"
              :class="{ '-muted': !row.total }"
            >
              {{ numeralFormat(row.total, "0,0") }}
            </td>
            <td v-if="can_open_process" class="b-dashboard-orders-summary__go">
              <v-icon size="18" class="flip-rtl" aria-hidden="true"
                >chevron_right</v-icon
              >
            </td>
          </tr>
        </tbody>
      </table>
      <!-- A page may add its own digest under the queues; the shop dashboard adds its order mix. -->
      <slot name="footer"></slot>
    </section>
    <template v-if="!summary">
      <section class="b-dashboard-orders-detail sd-modern-widget text-start">
        <header class="sd-modern-header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon size="20" aria-hidden="true">filter_alt</v-icon></span
            >
            <div>
              <div class="d-flex align-center ga-1">
                <h2 class="sd-modern-title-text">
                  {{ $t("admin_shop.dashboard.modern.order_funnel") }}
                </h2>
                <v-btn
                  class="sd-modern-icon-button sd-modern-info-button"
                  variant="text"
                  icon
                  :aria-label="$t('admin_shop.dashboard.modern.order_funnel')"
                >
                  <v-icon size="16" aria-hidden="true">info_outline</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    open-on-click
                    open-on-focus
                    interactive
                    :max-width="360"
                    content-class="sd-modern-tooltip text-start"
                    >{{
                      $t("admin_shop.dashboard.modern.funnel_help")
                    }}</v-tooltip
                  >
                </v-btn>
              </div>
              <p class="sd-modern-subtitle">
                {{ $t("admin_shop.dashboard.modern.funnel_scope") }}
              </p>
            </div>
          </div>
        </header>
        <u-time-span
          v-model:end-date="end_date"
          v-model:start-date="start_date"
          :max-days="max_days_data_exist"
          :days="max_days_data_exist"
          :offset="0"
          :origin-date="origin_date_data_exist"
          color="rgb(var(--v-theme-on-surface))"
          class="b-dashboard-orders-detail__range"
          @onChange="calculate_funnel()"
        />
        <dl class="sd-modern-stat-grid b-dashboard-orders-detail__funnel-stats">
          <div v-for="(label, index) in funnel_labels" :key="label">
            <dt>{{ label }}</dt>
            <dd>
              {{
                Number.isFinite(funnel_totals[index])
                  ? numeralFormat(funnel_totals[index], "0,0")
                  : "—"
              }}
            </dd>
          </div>
        </dl>
        <u-chart-funnel-simple
          modern
          :colors="available_types.map((item) => item.colors)"
          :labels="funnel_labels"
          :sub-labels="available_types.map((item) => $t(item.name))"
          :value="funnel_value"
          :width="280"
          :is-dark="$vuetify.theme.current.dark"
          display-percentage
          height="280"
        />
      </section>
      <section class="b-dashboard-orders-detail sd-modern-widget text-start">
        <header class="sd-modern-header">
          <div class="sd-modern-title">
            <span class="sd-modern-icon sd-modern-icon--plain"
              ><v-icon size="20" aria-hidden="true">insights</v-icon></span
            >
            <div>
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.order_activity") }}
              </h2>
              <p class="sd-modern-subtitle">
                {{ $t("admin_shop.dashboard.modern.order_activity_subtitle") }}
              </p>
            </div>
          </div>
        </header>
        <div class="b-dashboard-orders-detail__table-wrap">
          <table
            class="sd-modern-table sd-modern-table--dense b-dashboard-orders-detail__table"
          >
            <thead>
              <tr>
                <th>{{ $t("global.commons.type") }}</th>
                <th class="b-dashboard-orders-detail__activity-heading">
                  {{ $t("admin_shop.dashboard.modern.daily_order_activity") }}
                  <span class="b-dashboard-orders-detail__activity-legend">
                    <span
                      ><i class="b-dashboard-orders-detail__cart-dot" />{{
                        $t("global.commons.new_carts")
                      }}</span
                    >
                    <span
                      ><i class="b-dashboard-orders-detail__checkout-dot" />{{
                        $t("global.commons.checkouts")
                      }}</span
                    >
                  </span>
                </th>
                <th>{{ $t("admin_shop.dashboard.modern.current_queue") }}</th>
                <th>{{ $t("global.commons.sells") }}</th>
                <th
                  :aria-label="$t('admin_shop.dashboard.modern.process_orders')"
                ></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in available_types" :key="item.code">
                <td>
                  <span class="b-dashboard-orders-detail__identity"
                    ><img :src="item.basket" alt="" width="20" height="20" />{{
                      $t(item.name)
                    }}</span
                  >
                </td>
                <td class="b-dashboard-orders-detail__inline-history">
                  <u-chart-bar
                    :dataset="getActivityHistory(item)"
                    :colors="[
                      'rgb(var(--v-theme-primary))',
                      'rgba(var(--v-theme-on-surface), 0.4)',
                    ]"
                    :labels="[
                      $t('global.commons.new_carts'),
                      $t('global.commons.checkouts'),
                    ]"
                    :aria-label="
                      $t('admin_shop.dashboard.modern.order_type_history', {
                        type: $t(item.name),
                      })
                    "
                    :start-date="daily_start_date"
                    :end-date="timeSeries.endDate"
                    :height="28"
                    :show-title="false"
                    fit
                    grouped
                    dense
                    narrow
                    hide-dates
                  />
                </td>
                <td>{{ numeralFormat(getTotalPendingOrders(item), "0,0") }}</td>
                <td>
                  {{
                    numeralFormat(
                      timeSeries.totalOf(
                        `sell_products_${item.code.toLowerCase()}`,
                      ),
                      "0,0",
                    )
                  }}
                </td>
                <td>
                  <v-btn
                    v-if="can_open_process"
                    :to="{ name: item.process_page }"
                    :active="false"
                    variant="text"
                    icon
                    class="sd-modern-icon-button"
                    :aria-label="
                      $t('admin_shop.dashboard.modern.process_orders') +
                      ' · ' +
                      $t(item.name)
                    "
                    ><v-icon size="18" class="flip-rtl">arrow_forward</v-icon
                    ><v-tooltip
                      activator="parent"
                      location="top"
                      open-on-focus
                      content-class="sd-modern-tooltip text-start"
                      >{{ $t("admin_shop.dashboard.modern.process_orders") }} ·
                      {{ $t(item.name) }}</v-tooltip
                    ></v-btn
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <v-expansion-panels
          v-model="expanded_types"
          multiple
          variant="accordion"
          class="b-dashboard-orders-detail__histories"
        >
          <v-expansion-panel
            v-for="item in available_types"
            :key="item.code"
            :value="item.code"
            elevation="0"
            rounded="0"
          >
            <v-expansion-panel-title
              ><span class="b-dashboard-orders-detail__identity"
                ><img :src="item.basket" alt="" width="20" height="20" /><span
                  >{{ $t(item.name) }} ·
                  {{ $t("admin_shop.dashboard.modern.stage_details") }}</span
                ></span
              ></v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <b-dashboard-shop-orders-basket
                :time-series="timeSeries"
                :type="item.code"
                modern
              />
              <v-btn
                v-if="can_open_process"
                :to="{ name: item.process_page }"
                :active="false"
                variant="text"
                class="sd-modern-button"
                ><span
                  >{{ $t("admin_shop.dashboard.modern.process_orders") }} ·
                  {{ $t(item.name) }}</span
                ><v-icon end size="18" class="flip-rtl">arrow_forward</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  open-on-focus
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("admin_shop.dashboard.modern.process_orders") }} ·
                  {{ $t(item.name) }}</v-tooltip
                ></v-btn
              >
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel
            v-if="has_avocado"
            value="AVOCADO"
            elevation="0"
            rounded="0"
          >
            <v-expansion-panel-title
              ><span class="b-dashboard-orders-detail__identity"
                ><img
                  :src="require('../../../../assets/icons/avocado.svg')"
                  alt=""
                  width="20"
                  height="20"
                /><span
                  >{{ $t("global.commons.avocado") }} ·
                  {{ $t("admin_shop.dashboard.modern.stage_details") }}</span
                ></span
              ></v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <b-dashboard-shop-orders-avocado
                :shop="shop"
                :time-series="timeSeries"
                modern
              />
              <v-btn
                v-if="can_open_process"
                :to="{ name: 'BPageShopOrdersAvocado' }"
                :active="false"
                variant="text"
                class="sd-modern-button"
                >{{ $t("admin_shop.dashboard.modern.process_orders")
                }}<v-icon end size="18" class="flip-rtl">arrow_forward</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  open-on-focus
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("admin_shop.dashboard.modern.process_orders") }} ·
                  {{ $t("global.commons.avocado") }}</v-tooltip
                ></v-btn
              >
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel
            v-if="has_hyper"
            value="HYPER"
            elevation="0"
            rounded="0"
          >
            <v-expansion-panel-title
              ><span class="b-dashboard-orders-detail__identity"
                ><img
                  :src="require('../../../../assets/icons/hyper.svg')"
                  alt=""
                  width="20"
                  height="20"
                /><span
                  >{{ $t("global.commons.hyper") }} ·
                  {{ $t("admin_shop.dashboard.modern.stage_details") }}</span
                ></span
              ></v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <b-dashboard-shop-orders-hyper
                :shop="shop"
                :time-series="timeSeries"
                modern
              />
              <v-btn
                v-if="can_open_process"
                :to="{ name: 'BPageShopOrdersHyper' }"
                :active="false"
                variant="text"
                class="sd-modern-button"
                >{{ $t("admin_shop.dashboard.modern.process_orders")
                }}<v-icon end size="18" class="flip-rtl">arrow_forward</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  open-on-focus
                  content-class="sd-modern-tooltip text-start"
                  >{{ $t("admin_shop.dashboard.modern.process_orders") }} ·
                  {{ $t("global.commons.hyper") }}</v-tooltip
                ></v-btn
              >
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </section>
    </template>
  </div>
  <s-widget-box
    v-else
    :active="true"
    :src="modern ? undefined : require('../../../../assets/icons/store.svg')"
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-green mr-sm' style='font-size: 6px;'></span>  ${$t(
            'admin_shop.dashboard.active_orders.title',
          )}<span class='fw-normal ml-xs small'> ${$t(
            'admin_shop.dashboard.active_orders.title_small',
          )}</span>  </h5>`
    "
    class="s--shop-dashboard-orders"
    :class="{ 'b-dashboard-orders-modern sd-modern-widget': modern }"
    :color="modern ? 'rgb(var(--v-theme-surface))' : undefined"
    :dark="modern && $vuetify.theme.current.dark"
  >
    <!-- Actions -->
    <template v-slot:actions>
      <header v-if="modern" class="sd-modern-header">
        <div class="sd-modern-title">
          <span class="sd-modern-icon sd-modern-icon--plain"
            ><v-icon size="20" aria-hidden="true">shopping_bag</v-icon></span
          >
          <div>
            <div class="d-flex align-center ga-1">
              <h2 class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.active_orders.title") }}
              </h2>
              <v-btn
                class="sd-modern-icon-button sd-modern-info-button"
                icon
                variant="text"
                :aria-label="
                  $t('global.commons.help') +
                  ' · ' +
                  $t('admin_shop.dashboard.active_orders.title')
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
                    {{ $t("admin_shop.dashboard.modern.orders_help") }}
                  </p>
                </v-tooltip>
              </v-btn>
            </div>
            <p class="sd-modern-subtitle">
              {{ $t("admin_shop.dashboard.active_orders.title_small") }}
            </p>
          </div>
        </div>
      </header>
      <div class="pb-2" :class="{ 'b-dashboard-orders-modern__total': modern }">
        <h2 class="text-h3 me-2 font-weight-black">
          {{
            numeralFormat(
              totalPendingOrders + totalPendingOrders_Avocado,
              "0,0",
            )
          }}
        </h2>
        <small>{{
          $t("admin_shop.dashboard.active_orders.pending_orders")
        }}</small>
      </div>

      <component
        :is="modern ? 'div' : 'u-fade-scroll'"
        :show-arrow="$vuetify.display.smAndUp"
        drag-scroll
        small-arrow
        stick-class="-card"
      >
        <div :class="modern ? 'b-dashboard-orders-modern__cards' : 'd-flex'">
          <!-- ██████████████████████████ Online Baskets > Full Funnel ██████████████████████████ -->

          <v-card
            class="text-center me-4 pa-2 -card flex-0-0"
            :color="modern ? 'transparent' : '#fafafa'"
            flat
            :max-width="modern ? undefined : 420"
            :min-width="modern ? 0 : 250"
            rounded="lg"
            :width="modern ? '100%' : '90%'"
          >
            <u-chart-funnel-simple
              :colors="available_types.map((t) => t.colors)"
              :labels="[
                $t('global.commons.leads'),
                $t('global.commons.new_carts'),
                $t('global.commons.checkouts'),
                $t('global.commons.sells'),
              ]"
              :sub-labels="available_types.map((t) => $t(t.name))"
              :value="funnel_value"
              :width="modern ? 240 : $vuetify.display.xs ? 240 : 320"
              :is-dark="modern && $vuetify.theme.current.dark"
              class="mx-auto"
              display-percentage
              height="280"
            >
            </u-chart-funnel-simple>

            <u-time-span
              :color="modern ? 'on-surface' : undefined"
              v-model:end-date="end_date"
              v-model:start-date="start_date"
              :max-days="max_days_data_exist"
              :origin-date="origin_date_data_exist"
              class="mt-5 mb-2"
              @onChange="calculate_funnel()"
            ></u-time-span>
          </v-card>

          <!-- ██████████████████████████ Online Baskets ██████████████████████████ -->

          <v-card
            v-for="item in available_types"
            :key="item.code"
            :class="{ disabled: !item.enable }"
            class="me-4 pa-2 -card"
            :color="modern ? 'transparent' : '#fafafa'"
            flat
            :max-width="modern ? undefined : 420"
            :min-width="modern ? 0 : 300"
            rounded="lg"
            :style="{ '--background': modern ? 'transparent' : '#fafafa' }"
            :width="modern ? '100%' : '90%'"
          >
            <div class="d-flex justify-space-between align-center">
              <h2 class="text-h3 me-2 font-weight-black">
                {{ numeralFormat(getTotalPendingOrders(item), "0,0") }}
              </h2>
              <b class="text-muted">{{ $t(item.name) }}</b>
            </div>

            <div
              :class="
                modern ? 'b-dashboard-orders-modern__type-actions' : 'p-2'
              "
            >
              <v-btn
                :to="{ name: item.process_page }"
                :class="modern ? 'sd-modern-button' : 'nbt m-1'"
                :min-width="modern ? undefined : 200"
                :size="modern ? undefined : 'small'"
                :variant="modern ? 'text' : undefined"
                :active="modern ? false : undefined"
              >
                <img
                  :src="modern ? item.basket : item.image"
                  class="me-1"
                  height="18"
                  alt=""
                />
                {{
                  $t(
                    `admin_shop.dashboard.active_orders.${item.code.toLowerCase()}`,
                  )
                }}
                <v-icon
                  v-if="getTotalPendingOrders(item)"
                  class="ms-1 blink-me"
                  color="success"
                  size="x-small"
                  >lens
                </v-icon>
                <v-tooltip
                  activator="parent"
                  :location="modern ? 'top' : undefined"
                  :open-on-focus="modern ? true : undefined"
                  :max-width="modern ? 360 : undefined"
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  >{{
                    $t(
                      `admin_shop.dashboard.active_orders.${item.code.toLowerCase()}`,
                    )
                  }}</v-tooltip
                >
              </v-btn>

              <v-btn
                :aria-label="
                  $t('global.commons.show_details') + ' · ' + $t(item.name)
                "
                :aria-expanded="selected_type === item.code && show_extra"
                :class="modern ? 'sd-modern-icon-button' : 'nbt m-1'"
                :icon="modern"
                :size="modern ? undefined : 'small'"
                :variant="modern ? 'text' : undefined"
                @click="
                  show_extra = selected_type !== item.code || !show_extra;
                  selected_type = item.code;
                "
              >
                <v-icon :size="modern ? 20 : 'small'"
                  >{{
                    selected_type === item.code && show_extra
                      ? "close"
                      : "waterfall_chart"
                  }}
                </v-icon>
                <v-tooltip
                  activator="parent"
                  :location="modern ? 'top' : undefined"
                  :open-on-focus="modern ? true : undefined"
                  :max-width="modern ? 360 : undefined"
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  >{{ $t("global.commons.show_details") }} ·
                  {{ $t(item.name) }}</v-tooltip
                >
              </v-btn>
            </div>

            <orders-que
              :order-que="orderQue"
              :type="item.code"
              class="my-3"
            ></orders-que>

            <time-series-inline-chart
              :chart-id="'sell_products_chart_' + item.code"
              :colors="[item.color]"
              :days="timeSeries.days"
              :height="70"
              :keys="['sell_products_' + item.code.toLowerCase()]"
              :offset-day="timeSeries.offset"
              :time-series="timeSeries"
              :value-titles="[
                $t('admin_shop.dashboard.customers.orders_count') +
                  ' | ' +
                  $t(item.name) +
                  ' ',
              ]"
              chart-group="sell-products-chart"
              class="w-100 pointer-pointer"
              type="bar"
              @click="
                show_extra = selected_type !== item.code || !show_extra;
                selected_type = item.code;
              "
            ></time-series-inline-chart>

            <u-chart-bar
              :colors="['#ddd', '#FFA000', '#0097A7', '#8BC34A', '#7C4DFF']"
              :dataset="
                getArrayOfKeys(
                  `view_products_${item.code.toLowerCase()}`,
                  `order_${item.code.toLowerCase()}_added`,
                  `order_${item.code.toLowerCase()}_checkout`,
                  `sell_products_${item.code.toLowerCase()}`,
                  `send_products_${item.code.toLowerCase()}`,
                )
              "
              :end-date="timeSeries.endDate"
              :height="130"
              :labels="labels"
              :start-date="timeSeries.startDate"
              class="mt-5"
              legend
              narrow
            >
              <template v-slot:title>{{
                $t("admin_shop.dashboard.performance.title_small")
              }}</template>
            </u-chart-bar>
          </v-card>

          <!-- ██████████████████████████ Avocado ██████████████████████████ -->
          <v-card
            v-if="has_avocado && avocadoQue"
            key="avocado"
            class="me-4 pa-2 -card"
            :color="modern ? 'transparent' : '#fafafa'"
            flat
            :max-width="modern ? undefined : 420"
            :min-width="modern ? 0 : 300"
            rounded="lg"
            :style="{ '--background': modern ? 'transparent' : '#fafafa' }"
            :width="modern ? '100%' : '90%'"
          >
            <div class="d-flex justify-space-between align-center">
              <h2 class="text-h3 me-2 font-weight-black">
                {{ numeralFormat(totalPendingOrders_Avocado, "0,0") }}
              </h2>
              <b class="text-muted">{{ $t("global.commons.avocado") }}</b>
            </div>

            <div
              :class="
                modern ? 'b-dashboard-orders-modern__type-actions' : 'p-2'
              "
            >
              <v-btn
                :to="{ name: 'BPageShopOrdersAvocado' }"
                :class="modern ? 'sd-modern-button' : 'nbt m-1'"
                :min-width="modern ? undefined : 200"
                :size="modern ? undefined : 'small'"
                :variant="modern ? 'text' : undefined"
                :active="modern ? false : undefined"
              >
                <img
                  class="me-1"
                  height="18"
                  :src="require('../../../../assets/icons/avocado.svg')"
                  alt=""
                />
                {{ $t(`avocado_orders.avocado`) }}
                <v-icon
                  v-if="totalPendingOrders_Avocado"
                  class="ms-1 blink-me"
                  color="success"
                  size="x-small"
                  >lens
                </v-icon>
                <v-tooltip
                  activator="parent"
                  :location="modern ? 'top' : undefined"
                  :open-on-focus="modern ? true : undefined"
                  :max-width="modern ? 360 : undefined"
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  >{{ $t("avocado_orders.avocado") }}</v-tooltip
                >
              </v-btn>

              <v-btn
                :aria-label="
                  $t('global.commons.show_details') +
                  ' · ' +
                  $t('global.commons.avocado')
                "
                :aria-expanded="selected_type === 'avocado' && show_extra"
                :class="modern ? 'sd-modern-icon-button' : 'nbt m-1'"
                :icon="modern"
                :size="modern ? undefined : 'small'"
                :variant="modern ? 'text' : undefined"
                @click="
                  show_extra = selected_type !== 'avocado' || !show_extra;
                  selected_type = 'avocado';
                "
              >
                <v-icon :size="modern ? 20 : 'small'"
                  >{{
                    selected_type === "avocado" && show_extra
                      ? "close"
                      : "waterfall_chart"
                  }}
                </v-icon>
                <v-tooltip
                  activator="parent"
                  :location="modern ? 'top' : undefined"
                  :open-on-focus="modern ? true : undefined"
                  :max-width="modern ? 360 : undefined"
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  >{{ $t("global.commons.show_details") }} ·
                  {{ $t("global.commons.avocado") }}</v-tooltip
                >
              </v-btn>
            </div>

            <orders-que
              :order-que="avocadoQue"
              class="my-3"
              type="AVO"
            ></orders-que>

            <time-series-inline-chart
              :chart-id="'sell_products_chart_avocado'"
              :colors="['#5dad11', '#34e397']"
              :days="timeSeries.days"
              :height="70"
              :keys="['sell_avocados']"
              :offset-day="timeSeries.offset"
              :time-series="timeSeries"
              :value-titles="[
                $t('admin_shop.dashboard.customers.orders_count') +
                  ' | ' +
                  'Avocado' +
                  ' ',
              ]"
              chart-group="sell-products-chart"
              class="w-100 pointer-pointer"
              type="bar"
              @click="
                show_extra = selected_type !== 'avocado' || !show_extra;
                selected_type = 'avocado';
              "
            ></time-series-inline-chart>

            <u-chart-bar
              :colors="['#ddd', '#03A9F4', '#34e397']"
              :dataset="
                getArrayOfKeys(
                  `view_avocados`,
                  `request_avocados`,
                  `sell_avocados`,
                )
              "
              :end-date="timeSeries.endDate"
              :height="130"
              :labels="[
                $t('global.commons.views'),
                $t('global.commons.request'),
                $t('global.commons.sell'),
              ]"
              :start-date="timeSeries.startDate"
              class="mt-5"
              legend
              narrow
            >
              <template v-slot:title>{{
                $t("admin_shop.dashboard.performance.title_small")
              }}</template>
            </u-chart-bar>
          </v-card>

          <!-- ██████████████████████████ Hyper ██████████████████████████ -->
          <v-card
            v-if="has_hyper"
            key="hyper"
            class="me-4 pa-2 -card"
            :color="modern ? 'transparent' : '#fafafa'"
            flat
            :max-width="modern ? undefined : 420"
            :min-width="modern ? 0 : 300"
            rounded="lg"
            :style="{ '--background': modern ? 'transparent' : '#fafafa' }"
            :width="modern ? '100%' : '90%'"
          >
            <div class="d-flex justify-space-between align-center">
              <h2 class="text-h3 me-2 font-weight-black">
                {{ numeralFormat(todayOrders_Hyper, "0,0") }}
              </h2>
              <b class="text-muted">{{ $t("global.commons.hyper") }}</b>
            </div>

            <div
              :class="
                modern ? 'b-dashboard-orders-modern__type-actions' : 'p-2'
              "
            >
              <v-btn
                :to="{ name: 'BPageShopOrdersHyper' }"
                :class="modern ? 'sd-modern-button' : 'nbt m-1'"
                :min-width="modern ? undefined : 200"
                :size="modern ? undefined : 'small'"
                :variant="modern ? 'text' : undefined"
                :active="modern ? false : undefined"
              >
                <img
                  class="me-1"
                  height="18"
                  :src="require('../../../../assets/icons/hyper.svg')"
                  alt=""
                />
                {{ $t("global.commons.hyper") }}
                <v-tooltip
                  activator="parent"
                  :location="modern ? 'top' : undefined"
                  :open-on-focus="modern ? true : undefined"
                  :max-width="modern ? 360 : undefined"
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  >{{ $t("global.commons.hyper") }}</v-tooltip
                >
              </v-btn>

              <v-btn
                :aria-label="
                  $t('global.commons.show_details') +
                  ' · ' +
                  $t('global.commons.hyper')
                "
                :aria-expanded="selected_type === 'hyper' && show_extra"
                :class="modern ? 'sd-modern-icon-button' : 'nbt m-1'"
                :icon="modern"
                :size="modern ? undefined : 'small'"
                :variant="modern ? 'text' : undefined"
                @click="
                  show_extra = selected_type !== 'hyper' || !show_extra;
                  selected_type = 'hyper';
                "
              >
                <v-icon :size="modern ? 20 : 'small'"
                  >{{
                    selected_type === "hyper" && show_extra
                      ? "close"
                      : "waterfall_chart"
                  }}
                </v-icon>
                <v-tooltip
                  activator="parent"
                  :location="modern ? 'top' : undefined"
                  :open-on-focus="modern ? true : undefined"
                  :max-width="modern ? 360 : undefined"
                  :content-class="
                    modern ? 'sd-modern-tooltip text-start' : undefined
                  "
                  >{{ $t("global.commons.show_details") }} ·
                  {{ $t("global.commons.hyper") }}</v-tooltip
                >
              </v-btn>
            </div>

            <p class="sd-modern-subtitle my-3">
              {{ $t("global.commons.today") }} · {{ $t("global.commons.paid") }}
            </p>

            <time-series-inline-chart
              :chart-id="'sell_products_chart_hyper'"
              :colors="['#cb1f1f', '#cb0b7e']"
              :days="timeSeries.days"
              :height="70"
              :keys="['hyper_pays']"
              :offset-day="timeSeries.offset"
              :time-series="timeSeries"
              :value-titles="[
                $t('admin_shop.dashboard.customers.orders_count') +
                  ' | ' +
                  'Hyper' +
                  ' ',
              ]"
              chart-group="sell-products-chart"
              class="w-100 pointer-pointer"
              type="bar"
              @click="
                show_extra = selected_type !== 'hyper' || !show_extra;
                selected_type = 'hyper';
              "
            ></time-series-inline-chart>

            <u-chart-bar
              :colors="['#ddd', '#FBC02D', '#FF5252', '#34e397']"
              :dataset="
                getArrayOfKeys(
                  `hyper_views`,
                  `hyper_new_carts`,
                  `hyper_checkouts`,
                  'hyper_pays',
                )
              "
              :end-date="timeSeries.endDate"
              :height="130"
              :labels="[
                $t('global.commons.views'),
                $t('global.commons.new_carts'),
                $t('global.commons.checkouts'),
                $t('global.commons.pays'),
              ]"
              :start-date="timeSeries.startDate"
              class="mt-5"
              legend
              narrow
            >
              <template v-slot:title>{{
                $t("admin_shop.dashboard.performance.title_small")
              }}</template>
            </u-chart-bar>
          </v-card>
        </div>
      </component>
    </template>

    <!-- ██████████████████████████ Extra Charts ██████████████████████████ -->

    <v-expand-transition>
      <div v-if="show_extra">
        <b-dashboard-shop-orders-avocado
          v-if="selected_type === 'avocado'"
          :shop="shop"
          :time-series="timeSeries"
          :modern="modern"
          class="border mt-5"
        >
        </b-dashboard-shop-orders-avocado>

        <b-dashboard-shop-orders-hyper
          v-else-if="selected_type === 'hyper'"
          :shop="shop"
          :time-series="timeSeries"
          :modern="modern"
          class="border mt-5"
        >
        </b-dashboard-shop-orders-hyper>

        <b-dashboard-shop-orders-basket
          v-else
          :time-series="timeSeries"
          :type="selected_type"
          :modern="modern"
          class="border mt-5"
        >
        </b-dashboard-shop-orders-basket>
      </div>
    </v-expand-transition>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import UTimeSpan from "../../../../ui/time/span/UTimeSpan.vue";
import UChartFunnelSimple from "../../../../ui/chart/funnel/simple/UChartFunnelSimple.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UFadeScroll from "../../../../ui/fade-scroll/UFadeScroll.vue";
import UChartBar from "../../../../ui/chart/bar/UChartBar.vue";
import TimeSeriesInlineChart from "../../../chart/TimeSeriesInlineChart.vue";
import OrdersQue from "../../../order-que/OrdersQue.vue";
import BDashboardShopOrdersHyper from "../../../dashboard/shop/orders/hyper/BDashboardShopOrdersHyper.vue";
import BDashboardShopOrdersAvocado from "../../../dashboard/shop/orders/avocado/BDashboardShopOrdersAvocado.vue";
import BDashboardShopOrdersBasket from "../../../dashboard/shop/orders/basket/BDashboardShopOrdersBasket.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import {
  getReportDailyValues,
  getReportStartDate,
} from "../performance/periodComparison";
import { Basket } from "@selldone/core-js";
import avocadoIcon from "../../../../assets/icons/avocado.svg";
import hyperIcon from "../../../../assets/icons/hyper.svg";

// Queue stages in processing order; delivered orders have left the queue.
const QUEUE_STAGES = [
  "CheckQueue",
  "OrderConfirm",
  "PreparingOrder",
  "SentOrder",
];

export default {
  name: "BDashboardShopOrders",
  components: {
    BDashboardShopOrdersHyper,
    BDashboardShopOrdersAvocado,
    UChartBar,
    UFadeScroll,
    BDashboardShopOrdersBasket,
    UChartFunnelSimple,
    UTimeSpan,
    TimeSeriesInlineChart,
    OrdersQue,
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

    orderQue: {
      required: true,
      type: Array,
    },
    avocadoQue: {},
  },

  data: () => ({
    funnel_value: [0, 0, 0, 0, 0],

    start_date: null,
    end_date: null,

    selected_type: null,
    show_extra: false,
    expanded_types: ["PHYSICAL"],
  }),

  computed: {
    daily_start_date() {
      return getReportStartDate(this.timeSeries);
    },
    funnel_labels() {
      return ["leads", "new_carts", "checkouts", "sells"].map((key) =>
        this.$t(`global.commons.${key}`),
      );
    },
    funnel_totals() {
      return this.funnel_value.map((stage) =>
        Array.isArray(stage)
          ? stage.reduce((sum, value) => sum + value, 0)
          : stage,
      );
    },
    can_open_process() {
      return this.readShopAccess(ShopPermissionRegions.ORDERS.code);
    },
    orders_page() {
      if (this.available_types.length)
        return this.available_types[0].process_page;
      const first = this.option_types[0];
      if (first === "AVOCADO") return "BPageShopOrdersAvocado";
      if (first === "HYPER") return "BPageShopOrdersHyper";
      if (first === "POS") return "BPageShopOrdersPos";
      return "BPageShopOrdersPhysical";
    },
    labels() {
      return [
        this.$t("global.commons.view"),
        this.$t("global.commons.new_carts"),
        this.$t("global.commons.checkout"),
        this.$t("global.commons.paid"),
        this.$t("global.commons.delivered"),
      ];
    },
    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },
    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    hasInsufficientData() {
      return this.timeSeries.raw_data.length > 1;
    },

    queue_stages() {
      return QUEUE_STAGES.map((code) => Basket.PhysicalOrderStates[code]);
    },
    // A row per queue: its orders at each stage (null where its type has no such stage) and in total.
    queue_rows() {
      const count = (row) => {
        const value = Number(row?.count);
        return Number.isFinite(value) && value > 0 ? value : 0;
      };
      const queue = (states, rows) => ({
        stages: states
          ? QUEUE_STAGES.map((code) => {
              const value = rows
                .filter((row) => row.delivery_state === code)
                .reduce((sum, row) => sum + count(row), 0);
              return code in states || value ? value : null;
            })
          : null,
        // File orders are delivered automatically, so they have no stage to show.
        note: states ? null : this.$t("global.commons.auto"),
        total: rows.reduce((sum, row) => sum + count(row), 0),
      });
      const states = {
        PHYSICAL: Basket.PhysicalOrderStates,
        VIRTUAL: Basket.VirtualOrderStates,
        SERVICE: Basket.ServiceOrderStates,
        SUBSCRIPTION: Basket.SubscriptionOrderStates,
      };
      const rows = this.available_types.map((type) => ({
        key: type.code,
        label: this.$t(type.name),
        icon: type.basket,
        page: type.process_page,
        ...queue(
          states[type.code],
          this.orderQue.filter((row) => row.type === type.code),
        ),
      }));
      if (this.has_avocado && this.avocadoQue)
        rows.push({
          key: "AVOCADO",
          label: this.$t("global.commons.avocado"),
          icon: avocadoIcon,
          page: "BPageShopOrdersAvocado",
          // Avocado splits each stage by payment status; both belong to the stage.
          ...queue(Basket.PhysicalOrderStates, this.avocadoQue),
        });
      if (this.has_hyper)
        rows.push({
          key: "HYPER",
          label: this.$t("global.commons.hyper"),
          icon: hyperIcon,
          page: "BPageShopOrdersHyper",
          stages: null,
          note: `${this.$t("global.commons.today")} · ${this.$t("global.commons.paid")}`,
          total: this.todayOrders_Hyper ?? 0,
        });
      return rows;
    },

    //▘▘▘▘▘▘▘▘▘▘▘▘▘   Total pending orders  ▘▘▘▘▘▘▘▘▘▘▘▘▘

    totalPendingOrders() {
      let out = 0;
      this.orderQue.forEach((item) => (out += item.count));
      return out;
    },

    max_days_data_exist() {
      return this.timeSeries.days ? this.timeSeries.days : 30;
    },
    origin_date_data_exist() {
      let date = new Date();
      if (this.timeSeries.offset)
        date.setDate(date.getDate() - this.timeSeries.offset);
      return date;
    },

    has_avocado() {
      return this.shop.avocado && this.shop.avocado.enable;
    },

    totalPendingOrders_Avocado() {
      let out = 0;
      this.avocadoQue?.forEach((item) => (out += item.count));
      return out;
    },

    has_hyper() {
      return this.shop.hyper && this.shop.hyper.enable;
    },
    todayOrders_Hyper() {
      return this.timeSeries.todayData()?.hyper_pays; // Today hyper sells
    },
  },
  created() {
    this.calculate_funnel();
  },
  methods: {
    getActivityHistory(type) {
      const code = type.code.toLowerCase();
      return getReportDailyValues(this.timeSeries, [
        `order_${code}_added`,
        `order_${code}_checkout`,
      ]);
    },
    getTotalPendingOrders(type) {
      let out = 0;
      this.orderQue
        .filter((item) => item.type === type.code)
        .forEach((item) => (out += item.count));
      return out;
    },

    getSellsProductArray(type) {
      let out = [];
      if (this.timeSeries.raw_data)
        this.timeSeries.raw_data.forEach((item) => {
          out.push(item[`sell_products_${type.code.toLowerCase()}`]);
        });
      return out;
    },

    //------------------------------------------
    sumInTimeSpan(key) {
      return this.timeSeries.totalOf(key, this.start_date, this.end_date);
    },
    calculate_funnel() {
      const sub_view_physical = this.sumInTimeSpan("view_products_physical");
      const sub_view_virtual = this.sumInTimeSpan("view_products_virtual");
      const sub_view_file = this.sumInTimeSpan("view_products_file");
      const sub_view_service = this.sumInTimeSpan("view_products_service");
      const sub_view_subscription = this.sumInTimeSpan(
        "view_products_subscription",
      );

      const sum_vies =
        sub_view_physical +
        sub_view_virtual +
        sub_view_file +
        sub_view_service +
        sub_view_subscription;

      const sum_new_visitors = this.sumInTimeSpan("new_visitors");
      const sum_returning_visitors = this.sumInTimeSpan("returning_visitors");

      let sum_visitors = sum_new_visitors + sum_returning_visitors;
      if (sum_visitors <= 0) sum_visitors = 1;

      this.funnel_value = [
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [Math.round((sum_visitors * sub_view_physical) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [Math.round((sum_visitors * sub_view_virtual) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [Math.round((sum_visitors * sub_view_file) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [Math.round((sum_visitors * sub_view_service) / sum_vies)]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [Math.round((sum_visitors * sub_view_subscription) / sum_vies)]
            : []),
        ],
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [this.sumInTimeSpan("order_physical_added")]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [this.sumInTimeSpan("order_virtual_added")]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [this.sumInTimeSpan("order_file_added")]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [this.sumInTimeSpan("order_service_added")]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [this.sumInTimeSpan("order_subscription_added")]
            : []),
        ],
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [this.sumInTimeSpan("order_physical_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [this.sumInTimeSpan("order_virtual_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [this.sumInTimeSpan("order_file_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [this.sumInTimeSpan("order_service_checkout")]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [this.sumInTimeSpan("order_subscription_checkout")]
            : []),
        ],
        [
          ...(this.option_types.includes(ProductType.PHYSICAL.code)
            ? [this.sumInTimeSpan("sell_products_physical")]
            : []),
          ...(this.option_types.includes(ProductType.VIRTUAL.code)
            ? [this.sumInTimeSpan("sell_products_virtual")]
            : []),
          ...(this.option_types.includes(ProductType.FILE.code)
            ? [this.sumInTimeSpan("sell_products_file")]
            : []),
          ...(this.option_types.includes(ProductType.SERVICE.code)
            ? [this.sumInTimeSpan("sell_products_service")]
            : []),
          ...(this.option_types.includes(ProductType.SUBSCRIPTION.code)
            ? [this.sumInTimeSpan("sell_products_subscription")]
            : []),
        ],
      ];

      // console.log("funnel_value", this.funnel_value);
    },

    getArray(key) {
      return this.timeSeries
        .arrayOfForceInterpolateByLastValue(key, false, "created_at")
        .map((val) => [val >= 0 ? val : 0]);
    },
    getArrayOfKeys(...keys) {
      const raw_arrays = keys.map((k) => this.getArray(k));
      let merged = raw_arrays[0].map((_, i) =>
        raw_arrays.map((arr) => arr[i][0]),
      );
      return merged;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-orders-view {
  display: grid;
  gap: 20px;
  min-width: 0;
}
.b-dashboard-orders-detail {
  min-width: 0;
  font-family: inherit;
  :deep(.u--chart-funnel .--label-value),
  :deep(.u--chart-funnel .--label-title),
  :deep(.u--chart-funnel .--label-percent-value),
  :deep(.u--chart-funnel .--percent) {
    font-weight: 400;
  }
  &__range {
    max-width: 620px;
    margin: 0 auto 12px;
  }
  &__funnel-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-block: 16px;
  }
  &__funnel-stats dt {
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__funnel-stats dd {
    margin: 6px 0 0;
    font-size: 24px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__table-wrap {
    overflow-x: auto;
  }
  &__table {
    width: 100%;
  }
  &__table th,
  &__table td {
    text-align: start;
  }
  &__table td {
    font-size: 14px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  &__table th:nth-child(2),
  &__table th:nth-child(3),
  &__table th:nth-child(4),
  &__table td:nth-child(3),
  &__table td:nth-child(4) {
    text-align: end;
  }
  &__table th.b-dashboard-orders-detail__activity-heading {
    text-align: start;
  }
  &__inline-history {
    width: 24%;
    min-width: 150px;
  }
  &__activity-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-block-start: 3px;
    font-size: 11px;
  }
  &__activity-legend > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  &__activity-legend i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
  &__cart-dot {
    background: rgb(var(--v-theme-primary));
  }
  &__checkout-dot {
    background: rgba(var(--v-theme-on-surface), 0.4);
  }
  &__table td:last-child {
    width: 44px;
    text-align: end;
  }
  &__identity {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  &__identity img {
    flex-shrink: 0;
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
  &__histories :deep(.b-dashboard-orders-avocado),
  &__histories :deep(.b-dashboard-orders-hyper) {
    border: 0;
    box-shadow: none;
    padding: 0;
  }
  @media (max-width: 500px) {
    &__funnel-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
    &__table {
      min-width: 520px;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-dashboard-orders {
  border-top: thick #673ab7 solid;
  position: relative;
}

.b-dashboard-orders-modern {
  border-block-start: 1px solid var(--sd-modern-border);

  :deep(> .widget-body) {
    margin-block-start: 0;
  }

  &__total {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-block-end: 20px;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: 28px;
  }

  &__cards > .-card {
    margin-inline: 0 !important;
    padding: 20px 0 0 !important;
    border-block-start: 1px solid var(--sd-modern-border);
    border-radius: 0 !important;
  }

  :deep(.text-h3) {
    font-size: 28px !important;
    font-weight: 600 !important;
    line-height: 1.4;
  }

  &__type-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-block: 8px;
  }
}

.b-dashboard-orders-summary {
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
    font-variant-numeric: tabular-nums;
  }
  &__total span {
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-variant-numeric: tabular-nums;
  }
  &__table th,
  &__table td {
    padding: 6px 12px;
    text-align: start;
    vertical-align: middle;
  }
  // Captions keep the shared list-header typography; only body cells set theirs.
  &__table thead th {
    padding-block: 0 8px;
    vertical-align: bottom;
  }
  &__table tbody th,
  &__table tbody td {
    border-block-start: 1px solid var(--sd-modern-border);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }
  &__table &__stage {
    width: 14%;
    text-align: end;
  }
  &__table &__count {
    width: 11%;
    text-align: end;
  }
  &__table tbody &__count {
    font-size: 15px;
    font-weight: 500;
  }
  &__table &__go {
    width: 30px;
    padding-inline: 0 8px;
    color: var(--sd-modern-muted);
  }
  &__table &__note {
    color: var(--sd-modern-muted);
    font-size: 13px;
    text-align: center;
  }
  &__table tbody .-muted {
    color: var(--sd-modern-muted);
    font-weight: 400;
  }
  &__stage-icon {
    display: none;
  }
  &__link {
    // Block-level, so the 20px icon never adds an inline line box to the row height.
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: inherit;
    text-decoration: none;
    img {
      flex-shrink: 0;
    }
    // The whole row opens the queue; the row (sd-modern-clickable-item) positions this layer.
    &[href]::after {
      content: "";
      position: absolute;
      inset: 0;
    }
    &:focus-visible {
      outline: none;
    }
    &:focus-visible::after {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
    }
  }

  // Phones: the stages move under their row and the caption row, in the same four columns.
  @media (max-width: 600px) {
    &__table,
    &__table thead,
    &__table tbody {
      display: block;
    }
    &__table tr {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr)) auto auto;
      align-items: center;
      gap: 2px 8px;
      padding: 6px 12px;
    }
    &__table tbody tr {
      min-height: 44px;
      border-block-start: 1px solid var(--sd-modern-border);
    }
    &__table thead th,
    &__table tbody th,
    &__table tbody td,
    &__table &__go {
      padding: 0;
      border: 0;
    }
    &__table &__stage,
    &__table &__count,
    &__table &__go {
      width: auto;
    }
    &__table &__stage {
      text-align: start;
    }
    // Four captions do not fit a phone; the stage icons stand in, the names stay for screen readers.
    &__stage-icon {
      display: inline-flex;
    }
    &__stage-name {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    &__type {
      grid-row: 1;
      grid-column: 1 / 5;
      min-height: 28px;
      display: flex;
      align-items: center;
    }
    &__count {
      grid-row: 1;
      grid-column: 5;
    }
    &__go {
      grid-row: 1;
      grid-column: 6;
    }
    &__table &__note {
      grid-row: 2;
      grid-column: 1 / 5;
      text-align: start;
    }
  }
}
</style>

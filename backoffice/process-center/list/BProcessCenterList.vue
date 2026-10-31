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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    class="b-process-center-list"
    :class="[modern ? 'b-process-center-list--modern text-start' : 'widget-box -x-large mb-5 min-height-50vh', { 'b-process-center-list--wholesale': modernWholesale, 'b-process-center-list--marketplace': modernMarketplace, 'b-process-center-list--vendor': modernVendorPanel, 'b-process-center-list--rtl': modernVendorPanel && $vuetify.locale?.isRtl }]"
    :style="modern ? { '--sd-order-status-filter': $vuetify.theme?.current?.dark ? 'invert(1) hue-rotate(180deg)' : 'none' } : undefined"
    :aria-busy="busy_fetch"
  >
    <header v-if="modern && !modernMarketplace && !modernVendorPanel" class="sd-modern-header b-process-center-list__header">
      <slot name="heading"></slot>
      <slot name="top-menu"></slot>
    </header>
    <div class="s-table-loading" :class="{ 'sd-modern-widget b-process-center-list__body': modern }">
    <v-row align="center" class="px-2 py-2 b-process-center-list__toolbar" :class="{ 'sd-modern-list-toolbar': modernMarketplace || modernVendorPanel }" justify="start" no-gutters>
      <div class="flex-grow-1">
        <v-btn-toggle
          v-if="modernMarketplace || modernVendorPanel"
          v-model="status"
          :class="modernVendorPanel ? 'b-process-center-list__vendor-statuses' : 'b-process-center-list__marketplace-statuses'"
          :aria-label="$t(modernVendorPanel ? 'vendor_orders.selected_states' : 'marketplace_fulfillments.selected_states')"
          multiple
          mandatory
          @update:model-value="refreshOrders"
        >
          <v-btn v-for="state in marketplaceStatuses" :key="state.code" :value="state.code" :aria-pressed="status.includes(state.code)" variant="text">
            <b-vendor-order-icon v-if="modernVendorPanel" :name="vendorStatusIcon(state.code)" :size="14" class="me-1" />
            <v-icon v-else-if="status.includes(state.code)" size="12" class="me-1" aria-hidden="true">check</v-icon>
            {{ $t(state.title) }}
          </v-btn>
        </v-btn-toggle>
        <s-order-statuses-select
          v-else
          v-model="status"
          :has-cod="has_cod"
          :has-open="!isDropShipping"
          class="b-process-center-list__statuses"
          has-reserved
          @change="
            modern && (page = 1);
            fetchOrders(1, sortBy?.[0]?.key, sortBy?.[0]?.order === 'desc')
          "
        ></s-order-statuses-select>
      </div>

      <!-- 🎗️ Subscription plan filter -->
      <div
        v-if="
          isSubscription && !modernVendorPanel &&
          !filterSubscriptionPriceId /*Not be just for a specific price*/
        "
        class="flex-grow-1"
      >
        <b-product-subscription-pricing-input
          v-if="
            !isVendorPanel /*TODO: Add support this for vendors in the future!*/
          "
          v-model="selected_subscription_price"
          :product="filterProductId ? { id: filterProductId } : null"
          :shop="shop"
          bg-color="transparent"
          class="min-width-200 max-width-field"
          :class="{ 'b-process-center-list__subscription-plan': modern }"
          clearable
          flat
          hide-details
          single-line
          :variant="modern ? 'plain' : 'solo'"
          @change="!modern && refreshOrders()"
        >
        </b-product-subscription-pricing-input>
      </div>

      <v-text-field
        v-model="search"
        :placeholder="modernVendorPanel ? $t('vendor_orders.search') : modernMarketplace ? $t('marketplace_fulfillments.search') : modern ? $t(isDropShipping ? 'admin_shop.orders.modern.wholesale.search' : 'admin_shop.orders.physical.modern.search') : $t('global.commons.search')"
        bg-color="transparent"
        class="min-width-200 max-width-field b-process-center-list__search"
        :aria-label="modernVendorPanel ? $t('vendor_orders.search') : modernMarketplace ? $t('marketplace_fulfillments.search') : modern ? $t(isDropShipping ? 'admin_shop.orders.modern.wholesale.search' : 'admin_shop.orders.physical.modern.search') : $t('global.commons.search')"
        clearable
        flat
        hide-details
        :prepend-inner-icon="modernVendorPanel ? undefined : 'search'"
        single-line
        :variant="modern ? 'plain' : 'solo'"
      >
        <template v-if="modernVendorPanel" #prepend-inner><b-vendor-order-icon name="search" :size="18" /></template>
        <template v-if="modernVendorPanel" #clear="{ props }"><button v-bind="props" type="button" class="b-process-center-list__vendor-clear" :aria-label="$t('global.actions.clear')"><b-vendor-order-icon name="x" :size="14" /></button></template>
      </v-text-field>

      <v-btn
        v-if="modern && !modernMarketplace && !modernVendorPanel"
        class="sd-modern-button sd-modern-button--compact b-process-center-list__filter-button"
        variant="text"
        prepend-icon="tune"
        @click="dialogExtraFilters = true"
      >
        {{ $t('admin_shop.orders.physical.modern.filters.title') }}
        <span v-if="extraFilterSummaries.length" class="ms-1">· {{ extraFilterSummaries.length }}</span>
      </v-btn>

      <v-menu v-if="modernMarketplace || modernVendorPanel" location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button b-process-center-list__sort-button" :aria-label="$t('global.commons.sort_by')">
            <b-vendor-order-icon v-if="modernVendorPanel" name="arrow-up-down" :size="18" />
            <v-icon v-else aria-hidden="true">sort</v-icon>
            <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('marketplace_fulfillments.sort') }}</v-tooltip>
          </v-btn>
        </template>
        <v-list density="compact" class="b-process-center-list__sort-menu text-start">
          <v-list-item v-for="header in headers.filter(header => header.sortable)" :key="header.value" :active="sortBy[0]?.key === header.value" @click="sortMarketplace(header.value)">
            <v-list-item-title>{{ header.title }}</v-list-item-title>
            <template #append><v-icon v-if="sortBy[0]?.key === header.value" size="16" class="ms-3">{{ sortBy[0].order === 'desc' ? 'south' : 'north' }}</v-icon></template>
          </v-list-item>
        </v-list>
      </v-menu>

      <div v-if="modern && !modernVendorPanel && extraFilterSummaries.length" class="b-process-center-list__filter-summaries" :aria-label="$t('admin_shop.orders.physical.modern.filters.applied_summary', { count: extraFilterSummaries.length })">
        <v-chip
          v-for="filter in extraFilterSummaries"
          :key="filter.key"
          class="b-process-center-list__filter-summary"
          variant="outlined"
          size="small"
          closable
          close-icon="close"
          :close-label="$t('admin_shop.orders.physical.modern.filters.remove', { filter: filter.label })"
          @click="dialogExtraFilters = true"
          @click:close.stop="removeExtraFilter(filter.key)"
        >
          <v-avatar v-if="filter.key === 'productId'" class="me-1 hover-scale" size="20" rounded="sm">
            <img :src="getProductImage(extraFilters.productId, IMAGE_SIZE_SMALL)" alt="" />
          </v-avatar>
          <v-icon v-else :icon="filter.icon" size="13" class="me-1" aria-hidden="true" />
          <span class="b-process-center-list__filter-label">{{ filter.label }}</span>
          <v-tooltip v-if="filter.description" activator="parent" location="top" :open-on-focus="true" :persistent="false" content-class="sd-modern-tooltip text-start">{{ filter.description }}</v-tooltip>
        </v-chip>
      </div>

      <slot v-if="!modern" name="top-menu"></slot>
    </v-row>

    <div v-if="modernVendorPanel" class="b-process-center-list__vendor-title">
      <h2>{{ $t('vendor_orders.list_title', { type: $t(type.name) }) }}</h2>
      <span>{{ totalItems }}</span>
      <v-btn v-if="marketplaceFiltersChanged" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" @click="clearMarketplaceFilters">{{ $t('vendor_orders.clear_filters') }}</v-btn>
    </div>

    <div v-if="modernVendorPanel && fetch_error" class="sd-modern-empty-state b-process-center-list__vendor-empty" role="alert">
      <b-vendor-order-icon name="clipboard-list" :size="30" />
      <h2>{{ $t('vendor_orders.error_title') }}</h2>
      <p>{{ $t('vendor_orders.error_body') }}</p>
      <v-btn class="sd-modern-button" variant="outlined" :loading="busy_fetch" @click="refreshOrders"><b-vendor-order-icon name="rotate-ccw" :size="16" class="me-2" />{{ $t('vendor_orders.retry') }}</v-btn>
    </div>

    <div v-if="modernMarketplace" class="b-process-center-list__marketplace-title">
      <span>{{ $t(type.name) }} · {{ $t('marketplace_fulfillments.list_title') }}</span>
      <span class="sd-modern-status sd-modern-status--plain">{{ totalItems }}</span>
      <v-btn v-if="marketplaceFiltersChanged" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" @click="clearMarketplaceFilters">{{ $t('marketplace_fulfillments.clear_filters') }}</v-btn>
    </div>

    <div v-if="modernMarketplace && fetch_error" class="sd-modern-empty-state b-process-center-list__marketplace-empty" role="alert">
      <v-icon size="28" aria-hidden="true">error_outline</v-icon>
      <h2>{{ $t('marketplace_fulfillments.error_title') }}</h2>
      <p>{{ $t('marketplace_fulfillments.error_body') }}</p>
      <v-btn class="sd-modern-button" variant="outlined" prepend-icon="refresh" :loading="busy_fetch" @click="refreshOrders">{{ $t('marketplace_fulfillments.retry') }}</v-btn>
    </div>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <v-data-table-server
      v-show="!(modernMarketplace || modernVendorPanel) || !fetch_error"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :class="{ 'blurred disabled': busy_fetch && !HIGHLIGHT_ID, 'sd-modern-data-table b-process-center-list__table': modern }"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="orders"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="modernVendorPanel ? $vuetify.display.width < 1000 : modernMarketplace ? $vuetify.display.width < 1100 : modern ? $vuetify.display.width < 1000 : $vuetify.display.xs"
      :row-props="
        (_data) => {
          return {
            class:
              'row-hover anim-hover-targets ' + (modern ? 'sd-modern-clickable-item ' : '') +
              (HIGHLIGHT_ID === _data.item.id ? 'drop-down-delayed' : ''),
          };
        }
      "
      class="bg-transparent min-height-60vh blur-animate"
      density="compact"
      hide-default-footer
      item-key="id"
      @click:row="(_, r) => handleSelected(r.item)"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="modernVendorPanel" class="sd-modern-empty-state b-process-center-list__vendor-empty" role="status">
          <template v-if="!busy_fetch">
            <b-vendor-order-icon :name="marketplaceFiltersChanged ? 'search' : 'clipboard-list'" :size="30" />
            <h2>{{ $t(marketplaceFiltersChanged ? 'vendor_orders.no_results_title' : 'vendor_orders.empty_title') }}</h2>
            <p>{{ $t(marketplaceFiltersChanged ? 'vendor_orders.no_results_body' : 'vendor_orders.empty_body') }}</p>
            <v-btn v-if="marketplaceFiltersChanged" class="sd-modern-button" variant="outlined" @click="clearMarketplaceFilters">{{ $t('vendor_orders.clear_filters') }}</v-btn>
          </template>
        </div>
        <div v-else-if="modernMarketplace" class="sd-modern-empty-state b-process-center-list__marketplace-empty" role="status">
          <template v-if="!busy_fetch">
            <v-icon size="28" aria-hidden="true">{{ marketplaceFiltersChanged ? 'search_off' : 'inventory_2' }}</v-icon>
            <h2>{{ $t(marketplaceFiltersChanged ? 'marketplace_fulfillments.no_results_title' : 'marketplace_fulfillments.empty_title') }}</h2>
            <p>{{ $t(marketplaceFiltersChanged ? 'marketplace_fulfillments.no_results_body' : 'marketplace_fulfillments.empty_body') }}</p>
            <v-btn v-if="marketplaceFiltersChanged" class="sd-modern-button" variant="outlined" @click="clearMarketplaceFilters">{{ $t('marketplace_fulfillments.clear_filters') }}</v-btn>
          </template>
        </div>
        <div v-else-if="!busy_fetch && !search && (!modern || !extraFilterSummaries.length)" class="py-5 usn text-center fadeIn" :class="{ 'sd-modern-empty-state': modern }">
          <img
            :src="require('../../../assets/guides/orders-empty.png')"
            class="m-3 op-0-3"
            style="max-height: 400px; object-fit: contain"
            width="85%"
          />
          <h2 v-if="!modern" class="text-h4 font-weight-thin">
            Your orders will appear here...
          </h2>
          <p v-else class="sd-modern-help mb-0">{{ $t('admin_shop.orders.modern.empty') }}</p>
        </div>
        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:item.type="{ item }">
        <v-img
          v-if="isAffiliatePos"
          :aspect-ratio="1"
          :height="42"
          :src="basket_image"
          :width="42"
          class="my-2"
        />
        <router-link
          v-else
          :to="createRouteTo(item)"
          target="_blank"
          title="🧅 Open order in a new page."
        >
          <v-img
            :aspect-ratio="1"
            :height="42"
            :src="basket_image"
            :width="42"
            class="my-1"
            @click.stop
          />
        </router-link>

        <div
          v-if="item.channel"
          style="font-size: 8px; font-weight: 500; margin-bottom: 2px"
          class="d-flex align-center mx-n1"
        >
          <b-campaign-source-icon
            :value="item.channel"
            height="13"
            width="13"
            class="me-1"
          />
          <div class="single-line d-inline-block" style="max-width: 36px">
            {{ item.channel }}
          </div>
        </div>
      </template>

      <template v-slot:item.id="{ item }">
        <div class="py-1 py-sm-0">
          <div class="min-width-250 d-flex align-center b-process-center-list__order">
            <router-link
              v-if="modern && !modernMarketplace"
              :to="createRouteTo(item)"
              target="_blank"
              rel="noopener noreferrer"
              class="b-process-center-list__basket"
              :aria-label="getBasketOrderCode(item)"
              @click.stop
            >
              <v-img :src="basket_image" :width="21" :height="27" />
            </router-link>
            <!-- Avocado -->
            <div v-if="isAvocado" class="flex-grow-1 b-process-center-list__avocado">
              <div class="mt-1 d-flex align-center">
                <b class="flex-grow-1 flex-md-grow-0 text-start"
                  >AVO-{{ item.id }} <small>|</small> {{ item.title }}
                  <i
                    v-if="inQueProcess(item) && !item.reject"
                    class="fas fa-circle-notch fa-spin text-info mx-2"
                  ></i>
                </b>

                <products-dense-images-circles
                  :ids="getItemsImages(item)"
                  big-scale
                  border
                  class="py-1"
                  raw-images-path
                  :size="modern ? 27 : 32"
                  style="vertical-align: super; display: inline"
                ></products-dense-images-circles>
                <return-request-button-badge
                  v-if="modern && item.basket_item_returns?.length"
                  :basket-item-returns="item.basket_item_returns"
                  modern
                  class="b-process-center-list__return"
                  @click:return="openReturnRequest(item)"
                />
              </div>
              <span
                class="text-subtitle-2 single-line max-w-200 overflow-hidden"
                >{{ item.message }}</span
              >
              <div
                class="d-flex justify-end position-relative max-w-100 py-1 hover-scale-y-3x"
                :tabindex="modern ? 0 : undefined"
                :aria-label="modern ? $t('admin_shop.orders.modern.avocado.progress', { progress: item.progress }) : undefined"
              >
                <v-progress-linear
                  :color="
                    item.progress === 0
                      ? '#ddd'
                      : item.progress >= 100
                        ? 'green'
                        : 'blue'
                  "
                  :model-value="item.progress"
                  height="3"
                  rounded
                >
                </v-progress-linear>
                <v-tooltip activator="parent" location="top" :open-on-focus="modern ? true : undefined" :open-on-click="modern ? true : undefined" :content-class="modern ? 'sd-modern-tooltip text-start' : undefined">
                  <template v-if="modern">{{ $t('admin_shop.orders.modern.avocado.progress', { progress: item.progress }) }}</template>
                  <template v-else>Fulfillment progress: {{ item.progress }}%</template>
                </v-tooltip>
              </div>
            </div>
            <!-- Others (has items) -->
            <template v-else>
              <!-- Vendor order mode -->
              <div v-if="modernMarketplace" class="b-process-center-list__marketplace-codes">
                <v-btn variant="text" class="b-process-center-list__marketplace-code" :aria-label="$t('marketplace_fulfillments.fulfillment_help', { code: getVendorOrderCode(item) })" @click.stop="handleSelected(item)">
                  {{ getVendorOrderCode(item) }}
                  <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('marketplace_fulfillments.fulfillment_help', { code: getVendorOrderCode(item) }) }}</v-tooltip>
                </v-btn>
                <bdi class="b-process-center-list__marketplace-parent">{{ getBasketOrderCode(item) }}</bdi>
              </div>
              <router-link
                v-else-if="modernVendorPanel"
                :to="createRouteTo(item)"
                class="b-process-center-list__vendor-code"
                :aria-label="$t('vendor_orders.open_order', { code: getVendorOrderCode(item) })"
                @click.stop="cacheRouteState(item.id)"
              ><bdi>{{ getBasketOrderCode(item) }}</bdi><b-vendor-order-icon name="chevron-right" :size="13" /><bdi>{{ getVendorOrderCode(item) }}</bdi></router-link>
              <b v-else-if="isVendorOrders">
                {{
                  `${getBasketOrderCode(item)} ❯ ${getVendorOrderCode(item)}`
                }}
              </b>
              <!-- Normal mode -->
              <router-link
                v-else-if="modernWholesale"
                :to="createRouteTo(item)"
                class="b-process-center-list__code"
                @click.stop="cacheRouteState(item.id)"
              >{{ getBasketOrderCode(item) }}</router-link>
              <b v-else class="flex-grow-1 flex-md-grow-0 text-start b-process-center-list__code">
                {{ getBasketOrderCode(item) }}
              </b>
              <div
                class="b-process-center-list__products"
                :style="modern ? undefined : { display: 'contents' }"
              >
                <b-process-center-customer v-if="modernMarketplace" :item="item" :shop="shop" :is-affiliate-pos="isAffiliatePos" />
                <products-dense-images-circles
                  :ids="getProductsIDs(item)"
                  :size="modern ? 27 : 32"
                  big-scale
                  border
                  class="py-1"
                  style="vertical-align: super; display: inline"
                ></products-dense-images-circles>
                <!-- Preserve the vendor endpoint's existing customer projection and Guest fallback. -->
                <span v-if="modernVendorPanel && !item.customer && !item.buyer" class="b-process-center-list__vendor-guest"><b-vendor-order-icon name="user-round" :size="12" />{{ $t('global.commons.guest') }}</span>
                <b-process-center-customer v-else-if="modernVendorPanel" :item="item" :shop="shop" :is-affiliate-pos="isAffiliatePos" />
                <return-request-button-badge
                  v-if="modern && item.basket_item_returns?.length"
                  :basket-item-returns="item.basket_item_returns"
                  modern
                  class="b-process-center-list__return"
                  @click:return="openReturnRequest(item)"
                />
              </div>

              <v-chip
                v-if="
                  item.gateway_processing &&
                  item.gateway_processing.transaction_type === 'dir'
                "
                color="blue"
                size="small"
                variant="flat"
              >
                <v-icon class="blink-me" start>lens</v-icon>
                {{ $t("global.actions.check_now") }}
                <v-tooltip activator="parent"
                  >It's a direct money transfer and needs your attention.
                </v-tooltip>
              </v-chip>

              <i
                v-if="!modernWholesale && !modernMarketplace && !modernVendorPanel && inQueProcess(item) && !item.reject"
                class="fas fa-circle-notch fa-spin text-info mx-2"
              >
                <v-tooltip activator="parent">
                  <div class="d-flex align-center">
                    <v-icon class="fa-spin text-info"
                      >fa:fas fa-circle-notch
                    </v-icon>
                    <div class="ms-3">
                      In processing que...
                      <small class="d-block">Need your action!</small>
                    </div>
                  </div>
                </v-tooltip>
              </i>
              <span v-if="modernVendorPanel && inQueProcess(item) && !item.reject" class="b-process-center-list__vendor-queue" tabindex="0" @click.stop>
                <b-vendor-order-icon name="loader-circle" :size="13" />
                <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('admin_shop.orders.physical.modern.attention.unknown.title') }}</v-tooltip>
              </span>
              <span v-if="modernMarketplace && inQueProcess(item) && !item.reject" class="b-process-center-list__marketplace-queue" tabindex="0" @click.stop>
                <v-icon size="12" color="warning" aria-hidden="true">schedule</v-icon>
                {{ $t('marketplace_fulfillments.queued') }}
                <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('marketplace_fulfillments.queued_help') }}</v-tooltip>
              </span>
            </template>

            <v-spacer class="flex-grow-0 flex-md-grow-1"></v-spacer>

            <v-chip
              v-if="item.withdraw"
              :class="modern ? 'b-process-center-list__withdrawal' : 'font-weight-bold mx-1'"
              :aria-label="modern ? $t('admin_shop.orders.physical.modern.withdrawal.title') : undefined"
              :tabindex="modern ? 0 : undefined"
              color="red"
              label
              size="x-small"
              variant="flat"
              v-on="modern ? { click: event => event.stopPropagation() } : {}"
            >
              <v-icon start size="12">assignment_return</v-icon>
              {{ modern ? $t('admin_shop.orders.physical.modern.withdrawal.badge') : 'Withdrawn by customer' }}
              <v-tooltip
                activator="parent"
                :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black text-start'"
                location="top"
                :open-on-focus="true"
                :open-on-click="modern"
                :persistent="false"
                :max-width="modern ? 330 : undefined"
              >
                <div :class="modern ? 'sd-modern-tooltip__title' : 'font-weight-bold mb-1'">
                  {{ modern ? $t('admin_shop.orders.physical.modern.withdrawal.title') : 'Withdrawn by customer' }}
                </div>
                <div v-if="item.withdraw_at" :class="modern ? 'sd-modern-tooltip__body mb-1' : 'small mb-1'">
                  {{ modern ? $t('admin_shop.orders.physical.modern.withdrawal.requested_at') : 'Requested at' }}:
                  <b>{{getFromNowString(item.withdraw_at)}}</b> |
                  {{ getLocalTimeString(item.withdraw_at) }}
                </div>
                <div :class="modern ? 'sd-modern-tooltip__body' : 'small max-w-300'">
                  {{ modern ? $t('admin_shop.orders.physical.modern.withdrawal.body') : 'The customer has withdrawn this order. If you already shipped it, arrange the return. Always verify that the customer refund was completed correctly. You are responsible for handling it.' }}
                </div>
              </v-tooltip>
            </v-chip>


            <span v-if="modernWholesale && inQueProcess(item) && !item.reject" class="b-process-center-list__queue" tabindex="0" @click.stop>
              <v-icon size="12" color="warning" aria-hidden="true">schedule</v-icon>
              {{ $t('admin_shop.orders.modern.wholesale.queued') }}
              <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" :persistent="false" content-class="sd-modern-tooltip text-start">{{ $t('admin_shop.orders.modern.wholesale.queue_help') }}</v-tooltip>
            </span>
            <span v-if="modernWholesale && item.reject" class="b-process-center-list__rejection" tabindex="0" @click.stop>
              <v-icon size="12" color="error" aria-hidden="true">error_outline</v-icon>
              {{ $t('admin_shop.orders.modern.wholesale.rejection') }}
              <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" :persistent="false" content-class="sd-modern-tooltip text-start">
                <span class="d-block">{{ $t('admin_shop.orders.modern.wholesale.rejection_help') }}</span>
                <span v-if="item.reject_note" class="d-block mt-1">{{ item.reject_note }}</span>
                <span v-if="item.reject_at" class="d-block mt-1">{{ getLocalTimeString(item.reject_at) }}</span>
              </v-tooltip>
            </span>
            <v-chip
              v-else-if="item.reject && !modernMarketplace"
              class="font-weight-bold mx-1"
              color="red"
              size="x-small"
            >
              {{ $t("admin_shop.orders.physical.rejected") }}

              <v-icon end>fa:fas fa-exclamation</v-icon>
            </v-chip>
            <span v-if="modernMarketplace && item.reject" class="b-process-center-list__marketplace-queue" tabindex="0" @click.stop>
              <v-icon size="12" color="error" aria-hidden="true">error_outline</v-icon>
              {{ $t('admin_shop.orders.physical.rejected') }}
              <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('admin_shop.orders.physical.modern.attention.rejected.body') }}</v-tooltip>
            </span>


            <div
              class="b-process-center-list__attribution"
              :style="modern ? undefined : { display: 'contents' }"
            >
              <span v-if="modern && item.channel" class="b-process-center-list__channel">
                <v-icon class="rotate-90-e" size="13">alt_route</v-icon>
                <b-campaign-source-icon :value="item.channel" :size="16" alt="" />
                <span>{{ item.channel }}</span>
              </span>
              <img
                v-if="item.link_id"
                :title="$t('global.commons.campaign')"
                class="mx-1"
                height="20"
                src="../../../assets/icons/campaign.svg"
                width="20"
              />
              <img
                v-if="item.affiliate_id"
                :title="$t('global.commons.affiliate')"
                class="mx-1"
                height="20"
                src="../../../assets/icons/affiliate.svg"
                width="20"
              />
              <img
                v-if="hasDropShipping(item)"
                :title="$t('global.commons.drop_shipping')"
                class="mx-1"
                height="20"
                src="../../../assets/icons/dropshipping.svg"
                width="20"
              />
            </div>
          </div>

          <b-process-center-customer
            v-if="!modern"
            :item="item"
            :shop="shop"
            :is-affiliate-pos="isAffiliatePos"
          />
        </div>
      </template>

      <template v-if="modern" v-slot:item.customer="{ item }">
        <!-- Fulfillment customer_id belongs to the reseller's shop, not this supplier. -->
        <b-process-center-customer
          :item="isDropShipping ? { buyer: item.buyer } : item"
          :shop="shop"
          :is-affiliate-pos="isAffiliatePos"
        />
      </template>

      <template v-slot:item.price="{ item }">
        <div class="py-1 b-process-center-list__amount">
          <!-- Need pricing -->
          <span
            v-if="isService && item.status === 'Reserved'"
            class="text-muted"
            ><v-icon class="me-1 blink-me" color="blue" size="x-small"
              >lens</v-icon
            >
            {{ $t("global.commons.waiting_review") }}</span
          >

          <!-- Show normal pricing -->

          <p
            v-else
            class="m-0 font-weight-bold d-flex align-center min-width-250 b-process-center-list__amount-value"
            title="Payment"
          >
            <return-request-button-badge
              v-if="!modern && item.basket_item_returns?.length"
              :basket-item-returns="item.basket_item_returns"
              @click:return="openReturnRequest(item)"
            ></return-request-button-badge>

            <connect-order-chip
              v-for="connect_order in item.connect_orders"
              :key="connect_order.id"
              :connect-orders="connect_order"
              :small="$vuetify.display.xs"
              class="ma-1"
            ></connect-order-chip>

            <!-- 🎗️ Subscription payment active -->
            <v-chip
              v-if="item.meta?.subscription_period && item.status === 'Payed'"
              class="mx-1 b-process-center-list__subscription-meta"
              :tabindex="modern ? 0 : undefined"
              label
              size="small"
              variant="text"
            >
              <v-icon start>credit_score</v-icon>

              <v-icon
                :color="getPeriodColor(item.meta.subscription_period)"
                class="me-1"
                size="12"
                >circle
              </v-icon>
              {{ getPeriodTitle(item.meta.subscription_period) }}

              <v-tooltip activator="parent" :location="modern ? 'top' : undefined" :open-on-focus="modern ? true : undefined" :open-on-click="modern ? true : undefined" :content-class="modern ? 'sd-modern-tooltip text-start' : undefined">
                {{ modern ? $t('admin_shop.orders.modern.subscription.active_help') : "It's an active subscription." }}
              </v-tooltip>
            </v-chip>

            <!-- 🎗️ Created by a subscription basket -->
            <v-chip
              v-if="item.subscription_id"
              class="m-1 b-process-center-list__subscription-meta"
              :tabindex="modern ? 0 : undefined"
              label
              title=""
              variant="text"
            >
              <v-avatar rounded start>
                <img :src="ProductType.SUBSCRIPTION.image" />
              </v-avatar>
              SN-{{ item.subscription_id }}

              <v-tooltip activator="parent" :location="modern ? 'top' : undefined" :open-on-focus="modern ? true : undefined" :open-on-click="modern ? true : undefined" :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black'">
                <template v-if="modern">{{ $t('admin_shop.orders.modern.subscription.origin_help') }}</template>
                <template v-else>
                  <div>Auto created by subscription.</div>
                  <div class="small">Physical products are in subscription.</div>
                </template>
              </v-tooltip>
            </v-chip>

            <v-spacer></v-spacer>
            <!-- Show currency flag if two currency has same unicode -->
            <u-currency-icon
              v-if="modernWholesale || CurrencyHelper.NeedToSHowCurrencyFlag(shop.currencies)"
              :currency="item.currency"
              flag-only
              small
            ></u-currency-icon>
            <u-price :amount="item.price" :currency="item.currency"></u-price>
          </p>

          <!-- User select an specific date to deliver -->
          <div
            v-if="!modernWholesale && waitingToDeliver(item)"
            :title="`Time remaining until the delivery due date. ● ${getLocalTimeString(
              item.delivery_info.date,
            )}`"
            class="text-start"
          >
            <template
              v-if="
                item.delivery_info.date.convertToLocalDate()?.isAfterToday()
              "
            >
              <div class="mt-1 me-auto max-w-120">
                <v-progress-linear
                  :model-value="remainsTimePercent(item)"
                  color="primary"
                  height="4"
                  rounded
                  striped
                ></v-progress-linear>
              </div>

              <small class="my-1"
                >● {{ getFromNowString(item.delivery_info.date) }}</small
              >
            </template>
            <template v-else>
              <div class="max-w-120 mt-1 me-auto">
                <v-progress-linear
                  :model-value="0"
                  color="red"
                  height="4"
                  rounded
                  striped
                ></v-progress-linear>
              </div>

              <small class="my-1 text-red"
                >● {{ getLocalDateString(item.delivery_info.date) }} (late
                😟)</small
              >
            </template>
          </div>

          <!-- 🎗️ Progress to the next auto payment in subscription -->
          <div
            v-if="isSubscribed(item) && nextPaymentDate(item)"
            class="text-center"
            :title="modern ? $t('admin_shop.orders.modern.subscription.next_payment') : 'The next payment'"
          >
            <div class="max-w-120 mx-auto mt-1">
              <v-progress-linear
                :model-value="nextPaymentRemainPercent(item)"
                color="primary"
                height="4"
                rounded
                striped
              ></v-progress-linear>
            </div>
            <small class="my-1">{{
              nextPaymentDate(item)
                ? `~ ${getLocalDateString(
                    nextPaymentDate(item),
                  )} ● ${getFromNowString(nextPaymentDate(item))}.`
                : ""
            }}</small>
          </div>

          <v-row class="text-muted small mt-1 b-process-center-list__amount-details" no-gutters>
            <div v-if="has_delivery">
              <b-vendor-order-icon v-if="modernVendorPanel" name="truck" :size="12" />
              <v-icon v-else size="x-small">local_shipping</v-icon>
              <span class="mx-1"
                >{{ $t("admin_shop.orders.physical.delivery") }}:</span
              >

              <span v-if="item.delivery_price < 0">{{
                $t("admin_shop.orders.physical.not_paid")
              }}</span>
              <span v-else-if="item.delivery_price === 0">{{
                $t("global.commons.free")
              }}</span>
              <u-price
                v-else
                :amount="item.delivery_price"
                :currency="item.currency"
              ></u-price>
            </div>
            <div v-else></div>

            <v-spacer></v-spacer>

            <div v-if="item.discount">
              <span class="me-1"
                >{{ $t("admin_shop.orders.physical.discount") }}:</span
              >

              <u-price
                :amount="item.discount"
                :currency="item.currency"
              ></u-price>
            </div>
            <div v-else></div>
          </v-row>
        </div>
      </template>

      <!-- Country -->
      <template v-slot:item.country="{ item }">
        <div v-if="modernWholesale" class="b-process-center-list__country" tabindex="0" @click.stop>
          <flag :iso="item.country" :squared="false" />
          <span>{{ item.country }}</span>
          <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" :persistent="false" content-class="sd-modern-tooltip text-start">{{ getCountryName(item.country) }}</v-tooltip>
        </div>
        <flag
          v-else
          :iso="item.country"
          :squared="false"
          :title="getCountryName(item.country)"
        />
      </template>

      <!-- Status > Payment -->
      <template v-slot:item.status="{ item }">
        <div
          class="b-process-center-list__payment"
          :tabindex="modern && getPaymentDetailRows(item.payment).length ? 0 : undefined"
          :aria-label="modern && getPaymentDetailRows(item.payment).length ? $t('admin_shop.orders.physical.modern.payment.title') : undefined"
          @click="modern && getPaymentDetailRows(item.payment).length && $event.stopPropagation()"
        >
        <span v-if="modernMarketplace && marketplacePaymentStatus(item)" class="sd-modern-status sd-modern-status--plain b-process-center-list__marketplace-payment">
          <span class="sd-modern-status__dot" :class="item.status === BasketStatus.Payed.code ? 'sd-modern-status__dot--success' : item.status === BasketStatus.Canceled.code ? 'sd-modern-status__dot--error' : 'sd-modern-status__dot--warning'"></span>
          {{ $t(marketplacePaymentStatus(item).title) }}
        </span>
        <s-order-status-view
          v-else
          :gateway-processing="item.gateway_processing"
          :payment-require-capture="
            item.payment?.status ===TransactionStatus.RequireCapture.code
          "
          :status="item.status"
          :payment="item.payment"
          class="mt-3 inline-block"
        ></s-order-status-view>
          <v-tooltip
            v-if="modern && getPaymentDetailRows(item.payment).length"
            activator="parent"
            location="top"
            :open-on-focus="true"
            :open-on-click="true"
            :persistent="false"
            :max-width="330"
            content-class="sd-modern-tooltip text-start"
          >
            <div class="sd-modern-tooltip__title">{{ $t('admin_shop.orders.physical.modern.payment.title') }}</div>
            <dl class="sd-modern-tooltip__details">
              <div v-for="detail in getPaymentDetailRows(item.payment)" :key="detail.key">
                <dt>{{ $t(detail.labelKey) }}</dt>
                <dd>{{ detail.value }}</dd>
              </div>
            </dl>
            <p v-if="getPaymentDetailRows(item.payment).some(detail => detail.key === 'risk')" class="sd-modern-tooltip__body mt-2 mb-0">
              {{ $t('admin_shop.orders.physical.modern.payment.risk_help') }}
            </p>
          </v-tooltip>
        </div>
      </template>

      <!-- Status > Delivery -->
      <template v-if="has_delivery_col" v-slot:item.delivery_state="{ item }">
        <div
          v-if="!modern && $vuetify.display.xs && item.channel"
          style="font-size: 12px; font-weight: 500"
          class="d-flex align-center"
        >
          <v-icon class="me-1 rotate-90-e ms-3">alt_route</v-icon>
          <b-campaign-source-icon
            :value="item.channel"
            height="16"
            width="16"
            class="me-1"
          />
          <div>
            {{ item.channel }}
          </div>
        </div>
        <s-order-delivery-status-stepper
          :has-subscription="isSubscription"
          :isSubscribed="item.status === 'Payed'"
          :state="item.delivery_state"
          :states="deliveryStates"
          :modern-tooltips="modern"
          :modern-tooltip-prefix="modernTooltipPrefix"
          :modern-final-tooltip="modernWholesale || ((modernMarketplace || modernVendorPanel) && !hasReceiverInfo)"
          class="my-1 b-process-center-list__stepper"
          :style="modernVendorPanel ? { '--sd-vendor-stage-offset': `${50 / Object.keys(deliveryStates).length}%` } : undefined"
          :color="modern ? 'rgba(var(--v-theme-on-surface), 0.25)' : undefined"
          :dark-color="modern ? 'rgb(var(--v-theme-on-surface))' : undefined"
          @mouseEnterToCustomer="(n) => setActivator(n, item)"
        >
          <template v-if="modernVendorPanel" #stage-icon="{ item: stage, completed }">
            <span class="b-process-center-list__vendor-stage-icon"><b-vendor-order-icon :name="completed ? 'check' : vendorStageIcon(stage.code)" :size="13" :stroke-width="1.8" /></span>
          </template>
        </s-order-delivery-status-stepper>

        <div
          class="py-1 small min-width-200 d-flex align-center justify-center b-process-center-list__delivery-caption"
        >
          <span v-if="!modern || modernVendorPanel" class="text-muted">
            {{ getDeliveryStateString(item.delivery_state) }}
          </span>
          <template v-if="item.receiver_info">
            <span class="dashed-flex-space"></span>
            <button v-if="modernMarketplace && hasReceiverInfo" type="button" class="b-process-center-list__marketplace-receiver" :aria-label="$t('marketplace_fulfillments.receiver_details')" @click.stop="openMarketplaceReceiver($event, item)">
              <flag :iso="item.receiver_info.country" :squared="false" class="me-1" />
              <span>{{ getShortAddress(item.receiver_info) }}</span>
              <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('marketplace_fulfillments.receiver_details') }}</v-tooltip>
            </button>
            <div v-else class="ps-1">
              <flag
                :iso="item.receiver_info.country"
                :squared="false"
                class="me-1"
              ></flag>
              <span>{{ getShortAddress(item.receiver_info) }}</span>
            </div>
          </template>
          <span v-if="modern && !modernVendorPanel" class="text-muted">
            {{ getDeliveryStateString(item.delivery_state) }}
          </span>
        </div>
        <span v-if="modernWholesale && waitingToDeliver(item)" class="b-process-center-list__delivery-schedule" tabindex="0" @click.stop>
          <v-icon size="12" :color="item.delivery_info.date.convertToLocalDate()?.isAfterToday() ? undefined : 'warning'" aria-hidden="true">event</v-icon>
          {{ $t(`admin_shop.orders.modern.wholesale.${item.delivery_info.date.convertToLocalDate()?.isAfterToday() ? 'delivery_due' : 'delivery_overdue'}`) }} · {{ getLocalDateString(item.delivery_info.date) }}
          <v-tooltip activator="parent" location="top" :open-on-focus="true" :open-on-click="true" :persistent="false" content-class="sd-modern-tooltip text-start">{{ getLocalTimeString(item.delivery_info.date) }}</v-tooltip>
        </span>
      </template>

      <template v-slot:item.reserved_at="{ item }">
        <div class="min-width-200 py-1 b-process-center-list__checkout">
          {{
            getFromNowString(
              item.reserved_at ? item.reserved_at : item.created_at,
            )
          }}

          <span v-if="!modernMarketplace" class="float-end">
            <!-- ▂▂▂▂▂▂▂▂ Chat ▂▂▂▂▂▂▂ -->

            <v-btn
              v-if="item.chat && item.chat.length"
              class="mx-1 b-process-center-list__chat"
              :aria-label="$t('global.commons.chat')"
              color="#111"
              icon
              variant="text"
              @click.stop="showChat(item)"
            >
              <v-badge
                :model-value="
                  !item.chat[item.chat.length - 1]
                    .officer /*Show dot if customer send last message!*/
                "
                color="red"
                dot
              >
                <b-vendor-order-icon v-if="modernVendorPanel" name="message-circle" :size="14" />
                <v-icon v-else>chat</v-icon>
              </v-badge>

              <v-tooltip
                activator="parent"
                content-class="bg-black"
                location="bottom"
                max-width="460"
              >
                <s-order-chat-message
                  :basket="item"
                  :message="item.chat[item.chat.length - 1]"
                  is-admin
                >
                </s-order-chat-message>
              </v-tooltip>
            </v-btn>

            <!-- ▂▂▂▂▂▂▂▂ Emoji ▂▂▂▂▂▂▂ -->

            <template v-if="getDiffLastUpdateEmoji(item)">
              <v-btn
                v-if="modern"
                class="b-process-center-list__attention ms-1"
                icon
                variant="text"
                :aria-label="$t(orderAttention(item)?.titleKey || 'global.commons.order')"
                @click.stop
              >
                <img
                  :class="getDiffLastUpdateOver3Days(item) ? 'jump-target' : ''"
                  :src="getDiffLastUpdateEmoji(item)"
                  alt=""
                  height="20"
                  width="20"
                />
                <v-tooltip
                  v-if="orderAttention(item)"
                  activator="parent"
                  location="top"
                  :open-on-focus="true"
                  :open-on-click="true"
                  :persistent="false"
                  :max-width="300"
                  content-class="sd-modern-tooltip text-start"
                >
                  <div class="sd-modern-tooltip__title">{{ $t(orderAttention(item).titleKey) }}</div>
                  <div class="sd-modern-tooltip__body">{{ $t(orderAttention(item).bodyKey) }}</div>
                </v-tooltip>
              </v-btn>
            <img
              v-else
              :class="getDiffLastUpdateOver3Days(item) ? 'jump-target' : ''"
              :src="getDiffLastUpdateEmoji(item)"
              class="ms-1"
              height="20"
              width="20"
            />
            </template>
            <span
              v-else
              class="d-inline-block"
              style="min-width: 24px; height: 1px"
            ></span>
          </span>

          <br v-if="!modern" />
          <small>
            {{
              getLocalTimeString(
                item.reserved_at ? item.reserved_at : item.created_at,
              )
            }}
          </small>
        </div>
      </template>

      <template v-if="modernMarketplace" v-slot:item.actions="{ item }">
        <div class="b-process-center-list__marketplace-actions" @click.stop>
          <v-btn v-if="item.chat?.length" icon variant="text" class="sd-modern-icon-button b-process-center-list__chat" :aria-label="$t('global.commons.chat')" @click.stop="showChat(item)">
            <v-badge :model-value="!item.chat[item.chat.length - 1].officer" color="error" dot>
              <v-icon aria-hidden="true">chat</v-icon>
            </v-badge>
            <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">
              <s-order-chat-message :basket="item" :message="item.chat[item.chat.length - 1]" is-admin />
            </v-tooltip>
          </v-btn>
          <v-btn v-if="getDiffLastUpdateEmoji(item)" icon variant="text" class="b-process-center-list__attention" :aria-label="$t(orderAttention(item)?.titleKey || 'global.commons.order')">
            <img :src="getDiffLastUpdateEmoji(item)" alt="" width="20" height="20" />
            <v-tooltip v-if="orderAttention(item)" activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">
              <div class="sd-modern-tooltip__title">{{ $t(orderAttention(item).titleKey) }}</div>
              <div class="sd-modern-tooltip__body">{{ $t(orderAttention(item).bodyKey) }}</div>
            </v-tooltip>
          </v-btn>
          <v-btn :to="createRouteTo(item)" target="_blank" rel="noopener noreferrer" icon variant="text" class="sd-modern-icon-button" :aria-label="$t('marketplace_fulfillments.order_help', { code: getBasketOrderCode(item) })">
            <v-icon aria-hidden="true">north_east</v-icon>
            <v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('marketplace_fulfillments.order_help', { code: getBasketOrderCode(item) }) }}</v-tooltip>
          </v-btn>
        </div>
      </template>

      <template v-slot:bottom>
        <div :class="{ 'sd-modern-table-footer b-process-center-list__footer': modern }">
          <span v-if="modernVendorPanel" role="status">{{ $t('vendor_orders.range', marketplaceRange) }}</span>
          <span v-else-if="modernMarketplace">{{ $t('marketplace_fulfillments.range', marketplaceRange) }}</span>
          <span v-else-if="modern">{{ $t('global.commons.orders') }} · {{ totalItems }}</span>
          <v-pagination v-model="page" :length="pageCount" :class="{ 'sd-modern-pagination': modern }" :total-visible="modern ? 7 : undefined" rounded />
        </div>
      </template>
    </v-data-table-server>

    <slot v-if="!modern"></slot>
    </div>
    <slot v-if="modern"></slot>

    <b-process-center-filters
      v-if="modern && !modernVendorPanel && dialogExtraFilters"
      v-model="dialogExtraFilters"
      :filters="extraFilters"
      :shop="shop"
      :fixed-product-id="filterProductId"
      :fixed-customer-id="filterCustomerId"
      :allow-product="extraFilterSupport.product"
      :allow-customer="extraFilterSupport.customer"
      :allow-updated-after="extraFilterSupport.updatedAfter"
      @apply="applyExtraFilters"
    />

    <!-- ----------------------------------- Receiver Info Details Menu ----------------------------------- -->
    <v-menu
      v-if="hasReceiverInfo"
      v-model="receiver_menu"
      :activator="activator"
      :open-delay="200"
      location="top"
      max-width="360"
      open-on-hover
    >
      <v-sheet class="p-3 text-start" :color="modern ? 'surface' : '#fefefe'" rounded="xl">
        <s-order-receiver-info-card
          v-if="activator_item && activator_item.receiver_info"
          :receiver-info="activator_item.receiver_info"
          :userId="activator_item.user_id"
          class="text-start"
        >
        </s-order-receiver-info-card>
        <small v-else
          ><i class="fa:fas fa-map-location me-1"></i> Not set yet!</small
        >
      </v-sheet>
    </v-menu>

    <!-- ██████████████████████ Dialog > Chat ██████████████████████ -->
    <v-dialog
      v-model="dialog_chat"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selected_basket" class="text-start">
        <v-card-title>
          <v-avatar class="m-2" size="24">
            <v-img :src="getShopImagePath(shop.icon, IMAGE_SIZE_SMALL)" />
          </v-avatar>

          {{ $t("global.commons.chat") }} >
          {{ getBasketOrderCode(selected_basket) }}
        </v-card-title>
        <v-card-text v-if="selected_basket">
          <b-order-chat-box
            :basket="selected_basket"
            :shop="shop"
          ></b-order-chat-box>
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="dialog_chat = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import SOrderDeliveryStatusStepper from "../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import SOrderStatusesSelect from "../../../storefront/order/status-select/SOrderStatusesSelect.vue";
import ReturnRequestButtonBadge from "../../../storefront/order/order-return/ReturnRequestButtonBadge.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import SOrderStatusView from "../../../storefront/order/order-status/SOrderStatusView.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import BProcessCenterCustomer from "./BProcessCenterCustomer.vue";
import SOrderReceiverInfoCard from "../../../storefront/order/receiver-info/card/SOrderReceiverInfoCard.vue";
import ConnectOrderChip from "../../connect/order/chip/ConnectOrderChip.vue";
import SOrderChatMessage from "../../../storefront/order/chat/message/SOrderChatMessage.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import BProductSubscriptionPricingInput from "../../product/subscription/pricing/input/BProductSubscriptionPricingInput.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import { CurrencyHelper } from "@selldone/core-js/helper/currency/CurrencyHelper";
import { debounce, throttle } from "lodash-es";
import { OrderType } from "@selldone/core-js/enums/order/OrderType";
import { RouteMixin } from "../../../mixin/route/RouteMixin.ts";
import {Avocado, Basket, ShopURLs} from "@selldone/core-js";
import BCampaignSourceIcon from "@selldone/components-vue/backoffice/campaign/source/icon/BCampaignSourceIcon.vue";
import BOrderChatBox from "@selldone/components-vue/backoffice/order/chat/box/BOrderChatBox.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import {TransactionStatus} from "@selldone/core-js/enums/payment/TransactionStatus.ts";
import { getOrderAttention, getPaymentDetailRows } from "./ProcessCenterPresentation";
import BProcessCenterFilters from "./BProcessCenterFilters.vue";
import BVendorOrderIcon from "./icon/BVendorOrderIcon.vue";

const modernPhysicalIcons = {
  CheckQueue: 'shopping_basket',
  OrderConfirm: 'check_circle',
  PreparingOrder: 'inventory_2',
  SentOrder: 'local_shipping',
  ToCustomer: 'done_all',
};

export default {
  name: "BProcessCenterList",
  mixins: [RouteMixin, DateMixin, OrderMixin ],

  components: {
    BVendorOrderIcon,
    BProcessCenterFilters,
    BCampaignSourceIcon,
    UCurrencyIcon,
    BProductSubscriptionPricingInput,
    SOrderChatMessage,
    BOrderChatBox,
    ConnectOrderChip,
    SOrderReceiverInfoCard,
    BProcessCenterCustomer,
    SOrderStatusView,
    ProductsDenseImagesCircles,
    ReturnRequestButtonBadge,
    SOrderStatusesSelect,
    SOrderDeliveryStatusStepper,
  },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    shop: {
      required: true,
    },
    filterProductId: {
      // 🦋 Only for a specific product:
      required: false,
    },

    filterCustomerId: {
      // Show just for this customer
      required: false,
    },
    filterSubscriptionPriceId: {
      // 🎗️ Only baskets contain this subscription price:
      required: false,
    },
    type: {
      required: false,
    },
    isPos: {
      default: false,
      type: Boolean,
    },

    isDropShipping: {
      default: false,
      type: Boolean,
    },
    resellerShopId: {
      // Only for this reseller shop ID.
    },

    isAvocado: {
      default: false,
      type: Boolean,
    },
    isHyper: {
      default: false,
      type: Boolean,
    },

    isAffiliatePos: {
      default: false,
      type: Boolean,
    },

    filterAffiliateId: {
      // Only for this affiliate! (Affiliate POS orders list)
    },

    // 🟣 Marketplace 🟣 Show fulfillment of marketplace: (Need type : physical, virtual, ...)
    isVendorOrders: {
      default: false,
      type: Boolean,
    },

    // Vendor order
    isVendorPanel: {
      /*🟢 Vendor Panel 🟢*/ default: false,
      type: Boolean,
    },
    vendor: {
      type: Object,
      default: null,
    },
  },

  data: function () {
    return {
      ProductType: ProductType,
      TransactionStatus:TransactionStatus,
      BasketStatus: Basket.Status,

      activator: null,
      activator_item: null,

      status: [Basket.Status.Payed.code, Basket.Status.COD.code],

      busy_fetch: false,
      fetch_error: false,
      ordersRequestId: 0,

      orders: [],

      // Pagination:
      page: 1,
      sortBy: [{ key: null, order: "desc" }],
      itemsPerPage: 10,
      totalItems: 0,

      search: null,
      dialogExtraFilters: false,
      extraFilters: { productId: null, customerId: null, updatedAfter: null, customerName: '' },
      selected_subscription_price: null,

      dialog_chat: false,
      selected_basket: null,
      receiver_menu: false,
    };
  },
  computed: {

    modernMarketplace() {
      return this.modern && this.isVendorOrders && !this.isVendorPanel;
    },
    modernVendorPanel() {
      return this.modern && this.isVendorPanel;
    },
    marketplaceStatuses() {
      return [Basket.Status.Open, Basket.Status.Reserved, Basket.Status.Payed, ...(this.has_cod ? [Basket.Status.COD] : []), Basket.Status.Canceled];
    },
    marketplaceDefaultStatuses() {
      return [Basket.Status.Payed.code, this.isService ? Basket.Status.Reserved.code : Basket.Status.COD.code];
    },
    marketplaceFiltersChanged() {
      return !!this.search || this.status.length !== this.marketplaceDefaultStatuses.length || this.marketplaceDefaultStatuses.some(status => !this.status.includes(status));
    },
    marketplaceRange() {
      return { start: this.totalItems ? (this.page - 1) * this.itemsPerPage + 1 : 0, end: Math.min(this.page * this.itemsPerPage, this.totalItems), total: this.totalItems };
    },

    extraFilterSupport() {
      return { product: !this.isAvocado, customer: !this.isDropShipping, updatedAfter: !this.isPos };
    },
    modernWholesale() {
      return this.modern && this.isDropShipping;
    },
    selectedSubscriptionPriceId() {
      return this.selected_subscription_price?.id ?? this.selected_subscription_price ?? null;
    },
    modernTooltipPrefix() {
      if (this.modernWholesale) return 'admin_shop.orders.modern.wholesale.stages';
      const type = this.isAvocado ? 'avocado' : this.type?.code?.toLowerCase();
      return type && type !== 'physical'
        ? `admin_shop.orders.modern.${type}.stages`
        : 'admin_shop.orders.physical.modern.stages';
    },

    extraFilterSummaries() {
      const filters = [];
      const labels = 'admin_shop.orders.physical.modern.filters';
      if (this.extraFilterSupport.product && this.extraFilters.productId && !this.filterProductId) filters.push({ key: 'productId', label: `${this.$t(`${labels}.product`)} #${this.extraFilters.productId}`, icon: 'inventory_2' });
      if (this.extraFilterSupport.customer && this.extraFilters.customerId && !this.filterCustomerId) filters.push({ key: 'customerId', label: `${this.$t(`${labels}.customer`)}: ${this.extraFilters.customerName || `#${this.extraFilters.customerId}`}`, icon: 'person' });
      if (this.extraFilterSupport.updatedAfter && this.extraFilters.updatedAfter) filters.push({ key: 'updatedAfter', label: `${this.$t(`${labels}.updated_after`)}: ${this.getLocalDateString(this.extraFilters.updatedAfter)}`, description: this.getLocalTimeString(this.extraFilters.updatedAfter), icon: 'update' });
      return filters;
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    CurrencyHelper() {
      return CurrencyHelper;
    },
    IS_CONNECT_PANEL() {
      /*🦠 Connect Panel 🦠*/
      return (
        this.$route.params.shop_connect_id &&
        this.$route.matched.some((record) => record.meta.connect)
      );
    },

    hasReceiverInfo() {
      return (
        (this.type?.code &&
          [
            ProductType.PHYSICAL.code,
            ProductType.SERVICE.code,
            ProductType.SUBSCRIPTION.code,
          ].includes(this.type.code)) ||
        this.isAvocado
      );
    },

    isService() {
      return this.type?.code === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.type?.code === ProductType.SUBSCRIPTION.code;
    },

    headers() {
      if (this.modernVendorPanel) return [
        { title: this.$t('admin_shop.orders.physical.table.order_number'), value: 'id', align: 'start', sortable: true, width: '24%', cellProps: { class: 'b-process-center-list__vendor-identity-cell' } },
        { title: this.$t('admin_shop.orders.physical.table.price'), value: 'price', align: 'end', sortable: true, width: '14%' },
        { title: this.$t('admin_shop.orders.physical.table.payment_status'), value: 'status', align: 'center', sortable: true, width: '12%' },
        { title: this.$t('admin_shop.orders.physical.table.status'), value: 'delivery_state', align: 'start', sortable: true, width: '29%', cellProps: { class: 'b-process-center-list__wide-cell' } },
        { title: this.$t('admin_shop.orders.physical.table.order_date'), value: 'reserved_at', align: 'start', sortable: true, width: '21%', cellProps: { class: 'b-process-center-list__wide-cell' } },
      ];
      if (this.modernMarketplace) return [
        { title: this.$t('marketplace_fulfillments.fulfillment'), value: 'id', align: 'start', sortable: true, width: '21%', cellProps: { class: 'b-process-center-list__marketplace-identity-cell' } },
        { title: this.$t('admin_shop.orders.physical.table.price'), value: 'price', align: 'start', sortable: true, width: '14%' },
        { title: this.$t('marketplace_fulfillments.payment'), value: 'status', align: 'start', sortable: true, width: '11%' },
        { title: this.$t('marketplace_fulfillments.progress'), value: 'delivery_state', align: 'start', sortable: true, width: '25%', cellProps: { class: 'b-process-center-list__wide-cell' } },
        { title: this.$t('marketplace_fulfillments.checkout'), value: 'reserved_at', align: 'start', sortable: true, width: '17%', cellProps: { class: 'b-process-center-list__wide-cell' } },
        { title: this.$t('marketplace_fulfillments.actions'), value: 'actions', align: 'end', sortable: false, width: '12%', cellProps: { class: 'b-process-center-list__marketplace-actions-cell' } },
      ];
      if (this.modern) {
        if (this.isDropShipping) return [
          { title: this.$t('admin_shop.orders.physical.table.order_number'), value: 'id', align: 'start', sortable: true, width: '20%' },
          { title: this.$t('admin_shop.orders.modern.wholesale.owner'), value: 'customer', align: 'start', sortable: false, width: '17%' },
          { title: this.$t('admin_shop.orders.modern.wholesale.merchandise'), value: 'price', align: 'end', sortable: true, width: '13%' },
          { title: this.$t('admin_shop.orders.modern.wholesale.payment'), value: 'status', align: 'start', sortable: true, width: '13%' },
          { title: this.$t('admin_shop.orders.modern.wholesale.fulfillment'), value: 'delivery_state', align: 'start', sortable: true, width: '19%', cellProps: { class: 'b-process-center-list__wide-cell' } },
          { title: this.$t('global.commons.country'), value: 'country', align: 'center', sortable: true, width: '6%' },
          { title: this.$t('admin_shop.orders.modern.wholesale.checkout'), value: 'reserved_at', align: 'start', sortable: true, width: '12%', cellProps: { class: 'b-process-center-list__wide-cell' } },
        ];
        const widths = this.has_delivery_col ? ['21%', '18%', '13%', '13%', '23%', '12%']
          : ['25%', '24%', '18%', '17%', null, '16%'];
        return [
          { title: this.$t('admin_shop.orders.physical.table.order_number'), value: 'id', align: 'start', sortable: true, width: widths[0] },
          { title: this.$t(this.isDropShipping ? 'admin_shop.orders.modern.reseller' : 'global.commons.customer'), value: 'customer', align: 'start', sortable: false, width: widths[1] },
          { title: this.$t('admin_shop.orders.physical.table.price'), value: 'price', align: 'end', sortable: true, width: widths[2] },
          { title: this.$t('admin_shop.orders.physical.table.payment_status'), value: 'status', align: 'start', sortable: true, width: widths[3] },
          ...(this.has_delivery_col ? [{ title: this.$t('admin_shop.orders.physical.table.status'), value: 'delivery_state', align: 'start', sortable: true, width: widths[4], cellProps: { class: 'b-process-center-list__wide-cell' } }] : []),
          { title: this.$t('admin_shop.orders.physical.table.order_date'), value: 'reserved_at', align: 'start', sortable: true, width: widths[5], cellProps: { class: 'b-process-center-list__wide-cell' } },
        ];
      }
      if (this.isDropShipping) {
        return [
          ...(this.$vuetify.display.mdAndUp
            ? [
                {
                  align: "center",
                  sortable: false,
                  value: "type",
                  width: 50,
                },
              ]
            : []),
          {
            title: this.$t("admin_shop.orders.physical.table.order_number"),
            align: "start",
            sortable: true,
            value: "id",
          },
          {
            title: this.$t("admin_shop.orders.physical.table.price"),
            align: "center",
            value: "price",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.payment_status"),
            align: "center",
            value: "status",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.status"),
            align: "center",
            value: "delivery_state",
            sortable: true,
          },

          {
            title: this.$t("global.commons.country"),
            align: "center",
            value: "country",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.order_date"),
            align: "start",
            sortable: true,
            value: "reserved_at",
          },
        ];
      } else if (this.isPos || this.isHyper) {
        return [
          ...(this.$vuetify.display.mdAndUp
            ? [
                {
                  align: "center",
                  sortable: false,
                  value: "type",
                  width: 50,
                },
              ]
            : []),
          {
            title: this.$t("admin_shop.orders.physical.table.order_number"),
            align: "start",
            sortable: true,
            value: "id",
          },
          {
            title: this.$t("admin_shop.orders.physical.table.price"),
            align: "center",
            value: "price",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.payment_status"),
            align: "center",
            value: "status",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.order_date"),
            align: "start",
            sortable: true,
            value: "reserved_at",
          },
        ];
      } else if (this.isAvocado) {
        return [
          ...(this.$vuetify.display.mdAndUp
            ? [
                {
                  align: "center",
                  sortable: false,
                  value: "type",
                  width: 50,
                },
              ]
            : []),
          {
            title: this.$t("admin_shop.orders.physical.table.order_number"),
            align: "start",
            sortable: true,
            value: "id",
          },
          {
            title: this.$t("admin_shop.orders.physical.table.price"),
            align: "center",
            value: "price",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.payment_status"),
            align: "center",
            value: "status",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.status"),
            align: "center",
            value: "delivery_state",
            sortable: true,
          },

          {
            title: this.$t("admin_shop.orders.physical.table.order_date"),
            align: "start",
            sortable: true,
            value: "reserved_at",
          },
        ];
      }

      return [
        ...(this.$vuetify.display.mdAndUp
          ? [
              {
                align: "center",
                sortable: false,
                value: "type",
                width: 50,
              },
            ]
          : []),
        {
          title: this.$t("admin_shop.orders.physical.table.order_number"),
          align: "start",
          sortable: true,
          value: "id",
        },
        {
          title: this.$t("admin_shop.orders.physical.table.price"),
          align: "center",
          value: "price",
          sortable: true,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.payment_status"),
          align: "center",
          value: "status",
          sortable: true,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.status"),
          align: "center",
          value: "delivery_state",
          sortable: true,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.order_date"),
          align: "start",
          sortable: true,
          value: "reserved_at",
        },
      ];
    },

    return_request_page_name() {
      if (this.type?.code === ProductType.PHYSICAL.code)
        return "BPageOrderPhysicalReturn";
      else if (this.type?.code === ProductType.VIRTUAL.code)
        return "BPageOrderVirtualReturn";
      else if (this.type?.code === ProductType.FILE.code)
        return "ShopProcessCenterFileOrderPage_ReturnRequest";
      else if (this.type?.code === ProductType.SERVICE.code)
        return "ShopProcessCenterServiceOrderPage_ReturnRequest";
      else if (this.type?.code === ProductType.SUBSCRIPTION.code)
        return "ShopProcessCenterSubscriptionOrderPage_ReturnRequest";

      return null;
    },

    dashboard_page_name_vendor_panel() {
      if (this.type?.code === ProductType.PHYSICAL.code)
        return "VendorProcessCenterPhysicalOrderPage_Dashboard";
      else if (this.type?.code === ProductType.VIRTUAL.code)
        return "VendorProcessCenterVirtualOrderPage_Dashboard";
      else if (this.type?.code === ProductType.FILE.code)
        return "VendorProcessCenterFileOrderPage_Dashboard";
      else if (this.type?.code === ProductType.SERVICE.code)
        return "VendorProcessCenterServiceOrderPage_Dashboard";
      else if (this.type?.code === ProductType.SUBSCRIPTION.code)
        return "VendorProcessCenterSubscriptionOrderPage_Dashboard";
      return null;
    },

    dashboard_page_name() {
      if (this.type?.code === ProductType.PHYSICAL.code)
        return "BPageOrderPhysicalDashboard";
      else if (this.type?.code === ProductType.VIRTUAL.code)
        return "BPageOrderVirtualDashboard";
      else if (this.type?.code === ProductType.FILE.code)
        return "BPageOrderFileDashboard";
      else if (this.type?.code === ProductType.SERVICE.code)
        return "BPageOrderServiceDashboard";
      else if (this.type?.code === ProductType.SUBSCRIPTION.code)
        return "BPageOrderSubscriptionDashboard";
      else if (this.isPos) return "BPageOrderPosDashboard";
      else if (this.isDropShipping) return "BPageOrderFulfillmentDashboard";
      else if (this.isAvocado) return "BPageOrderAvocadoDashboard";
      else if (this.isHyper) return "BPageOrderHyperDashboard";

      return null;
    },

    deliveryStates() {
      const states = this.isDropShipping ? Basket.PhysicalOrderStates
        : this.isAvocado ? Avocado.DeliveryStates
        : this.type?.code === ProductType.PHYSICAL.code ? Basket.PhysicalOrderStates
        : this.type?.code === ProductType.VIRTUAL.code ? Basket.VirtualOrderStates
        : this.type?.code === ProductType.FILE.code ? Basket.FileOrderStates
        : this.type?.code === ProductType.SERVICE.code ? Basket.ServiceOrderStates
        : this.type?.code === ProductType.SUBSCRIPTION.code ? Basket.SubscriptionOrderStates : null;
      if (!this.modern || !states) return states;
      return Object.fromEntries(Object.entries(states).map(([key, state]) => [key, {
        ...state, icon: this.type?.code === ProductType.FILE.code ? state.icon : modernPhysicalIcons[key] || state.icon,
      }]));
    },
    has_cod() {
      return this.type?.code === ProductType.PHYSICAL.code;
    },

    has_delivery() {
      return (
        this.isPos ||
        this.type?.code === ProductType.PHYSICAL.code ||
        this.isDropShipping ||
        this.isAvocado
      );
    },

    has_delivery_col() {
      return !this.isPos && !this.isHyper;
    },
    has_return_col() {
      return !this.isPos && !this.isAvocado && !this.isHyper;
    },

    basket_image() {
      if (this.isPos)
        return require("@selldone/core-js/assets/order-types/basket-pos.svg");
      else if (this.isDropShipping)
        return require("@selldone/core-js/assets/order-types/basket-drop-shipping.svg");
      else if (this.isAvocado)
        return require("@selldone/core-js/assets/order-types/basket-avocado.svg");
      else if (this.isHyper)
        return require("@selldone/core-js/assets/order-types/basket-hyper.svg");

      return this.type.basket;
    },
  },
  watch: {
    'vendor.id'() {
      if (!this.modernMarketplace) return;
      this.ordersRequestId++;
      this.orders = [];
      this.totalItems = 0;
      this.refreshOrders();
    },
    selectedSubscriptionPriceId(value, previous) {
      if (this.modern && this.isSubscription && value !== previous) this.refreshOrders();
    },
    sortBy() {
      this.fetchOrders(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },
    page() {
      this.fetchOrders(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },

    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      if (this.modern) this.page = 1;
      this.fetchOrders(
        1,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    }, window.SERACH_THROTTLE),
  },
  created() {
    if (this.modernWholesale) {
      this.status = [Basket.Status.Payed.code];
    } else if (this.isService) {
      this.status = [Basket.Status.Payed.code, Basket.Status.Reserved.code]; // Show reserved basket to review by seller and set price. (Or auto pricing)
    } else if (this.isAvocado) {
      this.status = [Basket.Status.Reserved.code, Basket.Status.Payed.code]; // Show All
    } else if (this.isHyper) {
      this.status = [Basket.Status.Reserved.code, Basket.Status.Payed.code]; // Show All
    }
    this.fetchOrders(
      this.page,
      this.sortBy[0]?.key,
      this.sortBy[0]?.order === "desc",
    );
  },
  beforeUnmount() {
    this.ordersRequestId++;
  },

  methods: {
    vendorStatusIcon(code) {
      return { Open: 'inbox', Reserved: 'pause', Payed: 'credit-card', COD: 'banknote', Canceled: 'square-x' }[code];
    },
    vendorStageIcon(code) {
      if (code === 'PreparingOrder') {
        return this.type?.code === ProductType.FILE.code ? 'link' : this.type?.code === ProductType.VIRTUAL.code ? 'laptop' : this.isService ? 'list-checks' : 'package';
      }
      return { CheckQueue: 'shopping-basket', OrderConfirm: 'circle-check', SentOrder: 'truck', ToCustomer: this.type?.code === ProductType.FILE.code ? 'download' : 'check-check' }[code] || 'circle-check';
    },
    sortMarketplace(key) {
      if (!this.headers.some(header => header.sortable && header.value === key)) return;
      this.page = 1;
      this.sortBy = [{ key, order: this.sortBy[0]?.key === key && this.sortBy[0].order === 'desc' ? 'asc' : 'desc' }];
    },
    clearMarketplaceFilters() {
      this.status = [...this.marketplaceDefaultStatuses];
      this.search = null;
      this.refreshOrders();
    },
    marketplacePaymentStatus(item) {
      if (item.gateway_processing || item.payment?.status === TransactionStatus.RequireCapture.code || item.payment?.card) return null;
      return Object.values(Basket.Status).find(status => status.code === item.status);
    },
    openReturnRequest(item) {
      this.cacheRouteState(item.id);
      this.$router.push({ name: this.return_request_page_name, params: { basket_id: item.id } });
    },
    applyExtraFilters(filters) {
      this.extraFilters = filters;
      this.refreshOrders();
    },
    removeExtraFilter(key) {
      this.extraFilters = { ...this.extraFilters, [key]: null, ...(key === 'customerId' ? { customerName: '' } : {}) };
      this.refreshOrders();
    },
    getPaymentDetailRows,
    orderAttention(item) {
      return getOrderAttention({
        rejected: !!item.reject,
        queued: this.inQueProcess(item),
        daysSinceUpdate: DateConverter.getFromNowNumber(item.updated_at, 'd'),
      });
    },
    setActivator(node, item) {
      if (!this.hasReceiverInfo) return;
      //  console.log('setActivator',node)
      this.activator = node;
      this.activator_item = item;
    },
    openMarketplaceReceiver(event, item) {
      this.setActivator(event.currentTarget, item);
      this.receiver_menu = true;
    },
    getShortAddress(receiver_info) {
      if (receiver_info.state && receiver_info.city)
        return `${receiver_info.state} > ${receiver_info.city}`;
      else if (receiver_info.city) return receiver_info.city;
      else return receiver_info.state;
    },
    handleSelected(selected) {
      // For affiliate POS orders redirect user to shop page:
      if (this.isAffiliatePos) {
        const url =
            ShopURLs.MainShopUrl(this.shop) + `/orders/physical/SM-${selected.id}`;
        window.open(url, "_blank").focus();
        return;
      }

      this.cacheRouteState(selected.id);

      this.$router.push(this.createRouteTo(selected));
    },
    createRouteTo(selected) {
      if (this.isAffiliatePos) {
        return null;
      }

      return {
        name: this.isVendorPanel /*🟢 Vendor Panel 🟢*/
          ? this.dashboard_page_name_vendor_panel
          : this.dashboard_page_name,
        params: {
          shop_id: this.shop.id,
          basket_id: !this.isVendorPanel /*🟢 Not Vendor Panel 🟢*/
            ? this.isVendorOrders
              ? selected.basket_id /*🟣 Marketplace -> Go to main basket page🟣*/
              : selected.id
            : undefined,
          vendor_order_id: this.isVendorPanel /*🟢 Vendor Panel 🟢*/
            ? selected.id
            : undefined,
        },
      };
    },

    refreshOrders() {
      this.page = 1;

      this.fetchOrders(
        1,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },
    fetchOrders: debounce(function () {
      this.fetchOrdersNow(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    }, 50),

    fetchOrdersNow(page, sortBy, sortDesc = true) {
      this.page = page;

      if (this.modernMarketplace && this.vendor != null && !(Number.isSafeInteger(Number(this.vendor.id)) && Number(this.vendor.id) > 0)) {
        this.ordersRequestId++;
        this.orders = [];
        this.totalItems = 0;
        this.busy_fetch = false;
        this.fetch_error = true;
        return;
      }

      this.busy_fetch = true;
      if (this.modernMarketplace || this.modernVendorPanel) this.fetch_error = false;
      // A late response must not replace the currently applied modern filters.
      const requestId = ++this.ordersRequestId;
      const modernRequest = this.modern;

      axios
        .get(
          // Affiliate POS:
          this.isAffiliatePos
            ? window.API.GET_AFFILIATE_POS_ORDERS(this.filterAffiliateId)
            : this.isVendorPanel /*🟢 Vendor Panel 🟢*/
              ? window.VAPI.GET_MY_VENDORS_ORDERS(
                  this.$route.params.vendor_id,
                  this.type.code,
                )
              : // 🟣 Marketplace vendor orders 🟣
                this.isVendorOrders
                ? window.API.GET_VENDORS_ORDERS(
                    this.shop.id,
                    this.type
                      .code /*Only basket orders supported by vendors like physical,virtual,...*/,
                  )
                : // Normal orders:
                  window.API.GET_ORDERS(
                    this.shop.id,
                    this.isDropShipping
                      ? OrderType.DROPSHIPPING
                      : this.isPos
                        ? OrderType.POS
                        : this.isAvocado
                          ? OrderType.AVOCADO
                          : this.isHyper
                            ? OrderType.HYPER
                            : this.type.code, // Physical, virtual, file, service, subscription
                  ),

          {
            params: {
              ...(this.modernMarketplace && this.vendor != null ? { vendor_id: this.vendor.id } : {}),
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              product_id: this.filterProductId ?? (this.modern && this.extraFilterSupport.product ? this.extraFilters.productId ?? undefined : undefined),
              customer_id: this.filterCustomerId ?? (this.modern && this.extraFilterSupport.customer ? this.extraFilters.customerId ?? undefined : undefined), // Show just for this customer
              updated_at: this.modern && this.extraFilterSupport.updatedAfter && this.extraFilters.updatedAfter ? new Date(this.extraFilters.updatedAfter).toISOString().slice(0, 19).replace('T', ' ') : undefined,
              subscription_price_id: this.isSubscription
                ? this.filterSubscriptionPriceId
                  ? this.filterSubscriptionPriceId
                  : this.modern ? this.selectedSubscriptionPriceId : this.selected_subscription_price?.id
                : null, // 🎗️ Only baskets contain this subscription price
              sortBy: sortBy,
              sortDesc: sortDesc,
              statuses: this.status,

              search: this.search,


              affiliate_id: this.filterAffiliateId,

              shop_connect_id: this.IS_CONNECT_PANEL
                ? this.$route.params.shop_connect_id
                : null, // 🦠 Only for a specific connect service
              connect_orders: true, // 🦠 With all connect orders

              reseller_shop_id: this.isDropShipping
                ? this.resellerShopId
                : null, // Only for this reseller shop ID.

              // These list endpoints opt into their existing bounded buyer relation separately.
              buyer: this.modern && (this.isPos || this.isAvocado || this.isHyper || this.isDropShipping) ? true : undefined,
              with:['buyer','payment-compact'] // Compact payment details only where the existing endpoint supports them.
            },
          },
        )
        .then(({ data }) => {
          if (modernRequest && requestId !== this.ordersRequestId) return;
          if (data.error) {
            if (this.modernMarketplace || this.modernVendorPanel) this.fetch_error = true;
            return NotificationService.showErrorAlert(null, data.error_msg);
          }

          this.totalItems = data.total;
          this.orders = data.orders;
        })
        .catch((e) => {
          if (modernRequest && requestId !== this.ordersRequestId) return;
          if (this.modernMarketplace || this.modernVendorPanel) this.fetch_error = true;
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          if (modernRequest && requestId !== this.ordersRequestId) return;
          this.busy_fetch = false;
        });
    },

    inQueProcess(item) {
      return (
        [
          this.isAvocado ? Basket.Status.Reserved.code : null, // Tips: in Avocado orders 'Reserved' are in processing mode (need seller actions...)
          //Basket.Status.Reserved.code,
          Basket.Status.Payed.code,
          Basket.Status.COD.code,
        ].includes(item.status) &&
        [
          Basket.PhysicalOrderStates.CheckQueue.code,
          Basket.PhysicalOrderStates.OrderConfirm.code,
          Basket.PhysicalOrderStates.PreparingOrder.code,
        ].includes(item.delivery_state)
      );
    },

    getProductsIDs(basket) {
      const out = [];

      if (this.isDropShipping) {
        basket.contents.forEach((item) => {
          // In the fulfillment items (product_id & variant_id & count) Save in contents column
          if (!out.includes("" + item.product_id))
            out.push("" + item.product_id);
        });
      } else {
        basket.items.forEach((item) => {
          if (!out.includes("" + item.product_id))
            out.push("" + item.product_id);
        });
      }

      return out;
    },

    getItemsImages(basket) {
      const out = [];
      basket.items.forEach((item) => {
        if (item.image) out.push(item.image);
      });
      return out;
    },

    getDiffLastUpdateEmoji(item) {
      if (item.reject) return require("../../../assets/emotions/010-dead.svg");

      if (
        item.status === Basket.Status.Open ||
        item.status === Basket.Status.Reserved ||
        item.status === Basket.Status.Canceled
      )
        return null;

      if (!this.inQueProcess(item)) return null;

      const diff = DateConverter.getFromNowNumber(item.updated_at, "d");

      if (diff > 10) return require("../../../assets/emotions/Angry.svg");
      else if (diff > 7)
        return require("../../../assets/emotions/002-angry face.svg");
      else if (diff > 5) return require("../../../assets/emotions/030-mad.svg");
      else if (diff > 3)
        return require("../../../assets/emotions/003-annoyed.svg");
      else if (diff > 2) return require("../../../assets/emotions/035-sad.svg");
      else if (diff > 1)
        return require("../../../assets/emotions/011-detective.svg");
      else return require("../../../assets/emotions/019-happy.svg");
    },
    getDiffLastUpdateOver3Days(item) {
      if (item.reject) return false;
      if (
        item.status === Basket.Status.Open ||
        item.status === Basket.Status.Reserved ||
        item.status === Basket.Status.Canceled
      )
        return false;
      if (!this.inQueProcess(item)) return false;

      const diff = DateConverter.getFromNowNumber(item.updated_at, "d");

      if (diff > 3) return true;
    },

    hasDropShipping(basket) {
      if (this.isDropShipping || this.isAvocado || this.isHyper) {
        // Drop shipping list has not reselling items!
        return false;
      } else {
        return basket.items.some((it) => it.fulfillment_id);
      }
    },

    showChat(basket) {
      this.dialog_chat = true;
      this.selected_basket = basket;
    },

    //----------------------------------------
    getPeriodTitle(period) {
      return this.$t(BillingPeriod[period]?.title);
    },
    getPeriodColor(period) {
      return BillingPeriod[period]?.color;
    },

    // ――――――――――― 🎗️ Subscription ―――――――――――
    isSubscribed(order) {
      return this.isSubscription && order.status === Basket.Status.Payed.code;
    },

    subscriptionPeriod(order) {
      return BillingPeriod[
        order.meta?.subscription_period
          ? order.meta.subscription_period
          : order.items[0]?.subscription_price?.period
      ];
    },

    nextPaymentDate(order) {
      const payment_date =
        this.isSubscribed(order) &&
        order.meta?.subscription_payment_at?.convertToLocalDate();
      if (!this.subscriptionPeriod(order) || !payment_date) return null;

      return payment_date.addHours(this.subscriptionPeriod(order).hours);
    },

    nextPaymentRemainPercent(order) {
      if (!this.nextPaymentDate(order)) return 0;
      if (this.nextPaymentDate(order).isBeforeToday()) return 100;
      const diff = this.nextPaymentDate(order).diffHours(new Date());
      const total_hours = this.subscriptionPeriod(order).hours;
      const out = (100 * (total_hours - diff)) / total_hours;
      return out > 100 ? 100 : out;
    },

    // ――――――――――― ETA (delivery in specific date) ―――――――――――

    waitingToDeliver(item) {
      const delivery_info = item.delivery_info;
      if (
        [Basket.Status.COD.code, Basket.Status.Payed.code].includes(
          item.status,
        ) && // Payed or COD
        ![
          Basket.PhysicalOrderStates.SentOrder.code,
          Basket.PhysicalOrderStates.ToCustomer.code,
        ].includes(item.delivery_state) && // Nor delivered yet!
        delivery_info &&
        delivery_info.date // Has date
      ) {
        return true;
      }
      return false;
    },

    remainsTimePercent(item) {
      try {
        const date = DateConverter.convertToLocalTime(item.delivery_info.date);
        if (date.isBeforeToday()) return 0;

        return (100 * Math.abs(date.diffHours(new Date()))) / (3 * 24);
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.b-process-center-list--modern {
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;

  .b-process-center-list__header { margin-block-end: 19px; }
  .b-process-center-list__filter-button { color: var(--sd-modern-muted); }
  .b-process-center-list__filter-summaries { display: flex; flex-wrap: wrap; flex-basis: 100%; gap: 8px; }
  .b-process-center-list__filter-summary { max-width: 100%; overflow: visible; border-color: var(--sd-modern-border); color: var(--sd-modern-muted); font-family: inherit; font-size: 11px; font-weight: 400; }
  .b-process-center-list__filter-label { max-width: 210px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .b-process-center-list__body {
    padding: 0;
    border-radius: 16px;
    box-shadow: none;
  }

  .b-process-center-list__toolbar {
    gap: 16px;
    padding: 17px 18px !important;
    border-block-end: 1px solid var(--sd-modern-border);
  }

  .b-process-center-list__search {
    flex: 0 1 220px;
    min-width: 160px !important;
    max-width: 240px;

    --v-input-control-height: 30px;
    :deep(.v-field) { align-items: center; padding: 0; }
    :deep(.v-field__input) { min-height: 30px; padding-block: 6px !important; padding-inline: 0 !important; font-size: 12px !important; line-height: 18px; }
    :deep(.v-field__prepend-inner) { height: 30px; padding-block: 0 !important; align-items: center; margin-inline-end: 8px; }
    :deep(.v-icon) { font-size: 16px !important; color: var(--sd-modern-muted); opacity: 1; }
    :deep(input::placeholder) { color: var(--sd-modern-muted); opacity: 1; }
  }

  .b-process-center-list__subscription-plan {
    min-width: 160px !important;
    max-width: 260px !important;
    :deep(.v-field__input) { min-height: 30px; padding-block: 4px !important; font-family: inherit; font-size: 12px; line-height: 20px; }
    :deep(.v-field-label) { font-family: inherit; font-size: 12px; line-height: 18px; }
    :deep(.v-list-item) { padding: 0; min-height: 30px; }
    :deep(.v-list-item-title) { font-size: 12px; line-height: 18px; }
  }

  .b-process-center-list__statuses {
    padding: 4px !important;
    border-radius: 11px !important;
    background: rgba(var(--v-theme-on-surface), 0.025) !important;
    box-shadow: none !important;

    :deep(.v-btn-toggle) {
      gap: 4px;
      height: auto;
      background: transparent;
      box-shadow: none;
      overflow: visible;
    }

    :deep(.v-btn) {
      height: 30px !important;
      min-height: 30px;
      min-width: 0;
      padding: 4px 9px;
      border-radius: 7px !important;
      background: transparent !important;
      color: var(--sd-modern-muted);
      font-family: inherit;
      font-size: 12px;
      font-weight: 400;
      line-height: 17px;
      letter-spacing: 0 !important;
      text-indent: 0;
      text-transform: none;
    }

    :deep(.v-btn.blue-flat) {
      color: rgb(var(--v-theme-on-surface)) !important;
      background: rgb(var(--v-theme-surface)) !important;
      position: relative;
      z-index: 1;
      box-shadow: 0 2px 7px rgba(var(--v-theme-on-surface), 0.14), 0 1px 2px rgba(var(--v-theme-on-surface), 0.08);
    }

    :deep(.v-btn--active > .v-btn__overlay) { opacity: 0; }
    :deep(.v-btn.blue-flat .v-icon) { color: rgb(var(--v-theme-on-surface)) !important; }
    :deep(.v-btn .v-icon) { font-size: 13px; }
    :deep(.v-btn__content) { font: inherit; letter-spacing: 0 !important; }
    :deep(.v-btn.blue-flat .v-btn__content::after) { content: ""; width: 4px; height: 4px; margin-inline-start: 5px; border-radius: 50%; background: rgb(var(--v-theme-primary)); }
    :deep(.hide-on-small-600) { display: inline !important; }
  }

  .b-process-center-list__table {
    min-height: 200px !important;

    :deep(.v-table__wrapper) { overflow: visible; }
    :deep(table) { table-layout: fixed; }

    :deep(.v-table__wrapper > table > thead > tr > th) {
      height: 40px;
      padding: 10px 14px !important;
    }

    :deep(.v-table__wrapper > table > tbody > tr > td) {
      height: 82px;
      padding: 9px 14px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.45;
    }
  }

  .b-process-center-list__order {
    min-width: 0 !important;
    flex-wrap: wrap;
    gap: 4px 6px;

    > .v-spacer { display: none; }
    > .fa-circle-notch { margin-inline: 0 !important; font-size: 11px; }
  }

  .b-process-center-list__basket { flex: 0 0 21px; }
  .b-process-center-list__attribution {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    max-width: 100%;
    margin-inline-start: auto;
    gap: 6px;
    > img { flex: 0 0 20px; margin-inline: 0 !important; }
  }
  .b-process-center-list__channel {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    gap: 4px;
    font-size: 11px;
    line-height: 16px;
    > .v-icon, > img { flex-shrink: 0; }
    > span { min-width: 0; overflow-wrap: anywhere; }
  }
  .b-process-center-list__avocado {
    min-width: 0;
    > .d-flex { flex-wrap: wrap; gap: 4px 8px; }
    .text-subtitle-2 { font-family: inherit; font-size: 11px !important; font-weight: 400; line-height: 16px; }
  }
  .b-process-center-list__code { flex: 0 1 auto !important; font-size: 13px; font-weight: 500; }
  .b-process-center-list__products { display: flex; align-items: center; flex-wrap: wrap; flex-basis: 100%; order: 2; gap: 4px 8px; min-width: 0; padding: 0 !important; padding-inline-start: 25px !important; }
  .b-process-center-list__return { flex: 0 0 auto; margin-inline-start: auto; }
  .b-process-center-list__withdrawal {
    height: 18px;
    max-width: 100%;
    padding-inline: 5px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    line-height: 14px;
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }

  :deep(.b-process-center-customer) {
    display: block !important;
    margin: 0 !important;
    font-size: 12px;
    line-height: 17px;
  }
  :deep(.b-process-center-customer > .dashed-flex-space) { display: none; }
  :deep(.b-process-center-customer__identity) { gap: 3px; }
  :deep(.b-process-center-customer__name) { font-size: 12px; font-weight: 400; overflow-wrap: anywhere; }
  :deep(.b-process-center-customer__contact) { flex-wrap: wrap; gap: 3px; margin-block-start: 7px; font-size: 11px; color: var(--sd-modern-muted); }
  :deep(.b-process-center-customer__email) { width: 24px; height: 24px; color: var(--sd-modern-muted) !important; }
  :deep(.b-process-center-customer__email .v-icon) { font-size: 15px !important; }

  .b-process-center-list__amount { text-align: end; }
  .b-process-center-list__amount-value {
    min-width: 0 !important;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 4px;
    font-size: 14px;
    font-weight: 400 !important;
    > .v-spacer { display: none; }
    > .b-process-center-list__subscription-meta { flex-basis: 100%; order: 2; justify-content: flex-end; margin: 0 !important; font-size: 10px; }
    :deep(.u--price) { font-size: 14px; font-weight: 400; white-space: nowrap; }
  }
  .b-process-center-list__amount-details {
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 4px;
    font-size: 11px;
    line-height: 16px;
    > .v-spacer { display: none; }
    :deep(.u--price) { font-size: inherit; font-weight: 400; }
  }

  .b-process-center-list__payment {
    font-size: 11px;
    // Keep the original black status artwork readable on dark theme surfaces.
    :deep(.s--order-status-view > .inline-block > img) { filter: var(--sd-order-status-filter, none); }
    :deep(.s--order-status-view) { display: flex; align-items: center; gap: 7px; margin: 0 !important; text-align: start; }
    :deep(.s--order-status-view small) { font-size: 11px; line-height: 16px; white-space: normal; }
    :deep(.s--order-status-view + .d-flex) { justify-content: flex-start !important; margin-block-start: 7px; font-size: 10px; }
    :deep(.v-chip) { background: rgb(var(--v-theme-surface)) !important; color: rgb(var(--v-theme-on-surface)); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; border-radius: 4px; }
  }

  .b-process-center-list__stepper {
    display: flow-root;
    :deep(.container-stepper > div:not(.top-chain)) { top: 12px !important; height: 1px !important; }
    :deep(.container-stepper > div:nth-child(2)) { background: rgb(var(--v-theme-on-surface)) !important; }
    :deep(.top-chain) { --chain-color: rgb(var(--v-theme-on-surface)); font-size: 10px; font-weight: 500; }
    :deep(.progressbar li::before) { width: 25px; height: 25px; line-height: 23px; border-width: 1px; background: rgb(var(--v-theme-surface)); }
    :deep(.progressbar li.active::before) { background: rgb(var(--v-theme-on-surface)); }
    :deep(.progressbar li.active .v-icon) { color: rgb(var(--v-theme-surface)) !important; }
  }
  .b-process-center-list__delivery-caption {
    min-width: 0 !important;
    flex-wrap: wrap;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px 8px;
    padding-block-end: 0 !important;
    font-size: 11px;
    line-height: 16px;
    > .dashed-flex-space { display: none; }
    > span { margin-inline-start: auto; white-space: nowrap; }
    > div { max-width: 100%; padding-inline-start: 0 !important; font-size: 10px; overflow-wrap: anywhere; }
  }
  .b-process-center-list__checkout {
    min-width: 0 !important;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 4px;
    font-size: 11px;
    line-height: 16px;
    > span { float: none !important; display: inline-flex; align-items: center; }
    > small { grid-column: 1 / -1; display: block; width: 100%; margin-block-start: 5px; font-size: 10px; color: var(--sd-modern-muted); text-wrap: balance; }
  }
  .b-process-center-list__chat { width: 25px; height: 25px; color: var(--sd-modern-muted) !important; :deep(.v-icon) { font-size: 15px; } }
  .b-process-center-list__attention { width: 28px; height: 20px; padding: 0; vertical-align: middle; }
  .b-process-center-list__footer { padding: 17px 18px; gap: 12px; color: var(--sd-modern-muted); font-size: 11px; line-height: 16px; }

  @media (min-width: 1000px) {
    .b-process-center-list__amount,
    .b-process-center-list__checkout { padding-block: 0 !important; }
  }

  @media (max-width: 999px) {

    .b-process-center-list__table {
      // Keep native mobile labels/sorting while releasing the desktop table tracks.
      :deep(table), :deep(thead), :deep(tbody), :deep(thead > tr) { display: block; width: 100%; }
      :deep(thead > tr > th) { display: block; width: 100% !important; height: auto !important; }
      :deep(.v-data-table__tr--mobile) { display: grid; width: 100%; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px 12px; padding: 16px 13px; border-block-end: 1px solid var(--sd-modern-border); }
      :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) { display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 7px; width: auto !important; height: auto; min-height: 0; padding: 0; border: 0; }
      :deep(.v-data-table__tr--mobile > .b-process-center-list__wide-cell) { grid-column: 1 / -1; }
      :deep(.v-data-table__td-value) { text-align: start !important; min-width: 0; }
    }
    .b-process-center-list__order { align-content: flex-start; }
    .b-process-center-list__products { padding-inline: 0 !important; }
    .b-process-center-list__amount { text-align: start; }
    .b-process-center-list__amount-value { justify-content: flex-start; > .v-spacer { display: none; } > .b-process-center-list__subscription-meta { justify-content: flex-start; } }
    .b-process-center-list__amount-details { align-items: flex-start; }
    .b-process-center-list__delivery-caption > div, .b-process-center-list__checkout > small { font-size: 11px; }
    .b-process-center-list__checkout { border-block-start: 1px solid var(--sd-modern-border); padding-block-start: 10px !important; }
    .b-process-center-list__toolbar { gap: 10px; padding: 12px !important; }
    .b-process-center-list__toolbar > .flex-grow-1 { min-width: 0; width: 100%; }
    .b-process-center-list__search { flex: 1 1 120px; min-width: 110px !important; max-width: none; :deep(.v-field__input) { font-size: 16px !important; } }
    .b-process-center-list__statuses {
      width: 100% !important;
      max-width: 100%;
      :deep(.v-btn-toggle) { display: flex; flex-wrap: wrap; width: 100%; min-width: 0 !important; max-width: 100%; }
      :deep(.v-btn) { height: 44px !important; min-height: 44px; }
    }
  }
  @media (pointer: coarse) {
    .b-process-center-list__stepper :deep(.progressbar li:hover) { transform: none; }
    .b-process-center-list__statuses :deep(.v-btn), :deep(.b-process-center-customer__contact .v-btn), .b-process-center-list__chat, .b-process-center-list__attention { min-width: 44px; min-height: 44px; }
  }
}

.b-process-center-list--wholesale {
  .b-process-center-list__code { color: inherit; text-decoration: none; }
  .b-process-center-list__queue,
  .b-process-center-list__rejection,
  .b-process-center-list__delivery-schedule { display: inline-flex; align-items: center; gap: 4px; color: var(--sd-modern-muted); font-size: 11px; line-height: 16px; }
  .b-process-center-list__rejection { flex-basis: 100%; order: 3; }
  .b-process-center-list__delivery-schedule { margin-block-start: 3px; }
  .b-process-center-list__country { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 11px; line-height: 16px; color: var(--sd-modern-muted); }
  .b-process-center-list__country :deep(.fi) { flex-shrink: 0; }
  &:where(.smart-invert *) {
    .b-process-center-list__queue > .v-icon,
    .b-process-center-list__rejection > .v-icon,
    .b-process-center-list__delivery-schedule > .text-warning { filter: invert(1); }
  }
  @media (max-width: 999px) {
    .b-process-center-list__country { flex-direction: row; justify-content: flex-start; gap: 6px; }
  }
}
.b-process-center-list--marketplace {
  font-size: 13px;
  line-height: 20px;

  .b-process-center-list__body { padding-inline: 22px; border-radius: 17px; }
  .b-process-center-list__toolbar { gap: 12px; padding: 20px 0 !important; }
  .b-process-center-list__toolbar > .flex-grow-1 { flex: 1 1 auto; }
  .b-process-center-list__search {
    flex: 0 1 215px;
    min-width: 170px !important;
    :deep(.v-field__input) { min-height: 36px; padding-block: 7px !important; font-size: 13px !important; line-height: 20px; }
    :deep(.v-field__prepend-inner) { height: 36px; }
    :deep(.v-icon) { font-size: 18px !important; }
  }
  .b-process-center-list__marketplace-statuses {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    height: auto;
    padding: 5px;
    overflow: visible;
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), .04);
    :deep(> .v-btn) { height: 34px; min-height: 34px; min-width: 0; padding: 7px 10px; border-radius: 7px !important; background: transparent; color: rgb(var(--v-theme-on-surface)); font-family: inherit; font-size: 12px; font-weight: 400; line-height: 20px; letter-spacing: 0; text-transform: none; }
    :deep(> .v-btn--active) { background: rgb(var(--v-theme-surface)); box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), .1); }
    :deep(> .v-btn--active > .v-btn__overlay) { opacity: 0 !important; }
    :deep(> .v-btn:focus-visible) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  }
  .b-process-center-list__marketplace-title { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; padding: 19px 12px 15px; font-size: 13px; line-height: 20px; }
  .b-process-center-list__marketplace-title > .sd-modern-status { font-size: 12px; color: var(--sd-modern-muted); }
  .b-process-center-list__marketplace-title > .v-btn { margin-inline-start: auto; }
  .b-process-center-list__table {
    --sd-modern-table-font-size: 13px;
    --sd-modern-table-line-height: 20px;
    :deep(.v-table__wrapper > table > thead > tr > th) { padding: 10px 12px 13px !important; }
    :deep(.v-table__wrapper > table > tbody > tr > td) { height: auto; padding: 13px 12px !important; line-height: 20px; vertical-align: top; }
  }
  .b-process-center-list__marketplace-codes { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; flex-basis: 100%; }
  .b-process-center-list__marketplace-code.v-btn { min-width: 0; height: auto; min-height: 22px; padding: 0; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; text-transform: none; }
  .b-process-center-list__marketplace-parent { font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-process-center-list__products { gap: 7px; padding-inline: 0 !important; align-items: center; }
  .b-process-center-list__products :deep(.b-process-center-customer) { font-size: 12px; line-height: 18px; }
  .b-process-center-list__marketplace-queue { display: inline-flex; align-items: center; gap: 4px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .b-process-center-list__withdrawal { color: rgb(var(--v-theme-on-surface)) !important; background: var(--sd-modern-inset) !important; }
  .b-process-center-list__amount { text-align: start; }
  .b-process-center-list__amount-value { justify-content: flex-start; :deep(.u--price) { font-weight: 500; } }
  .b-process-center-list__amount-details { align-items: flex-start; font-size: 11px; line-height: 18px; }
  .b-process-center-list__marketplace-payment { font-size: 12px; line-height: 20px; }
  .b-process-center-list__stepper { max-width: 230px; margin-inline: -6px; }
  .b-process-center-list__delivery-caption { flex-direction: column; align-items: flex-start !important; gap: 2px; padding-block-start: 1px !important; font-size: 12px; line-height: 19px; }
  .b-process-center-list__delivery-caption > span { order: -1; margin-inline-start: 0; color: rgb(var(--v-theme-on-surface)) !important; }
  .b-process-center-list__delivery-caption > div { font-size: 11px; line-height: 18px; }
  .b-process-center-list__marketplace-receiver { display: inline-flex; align-items: center; min-height: 22px; padding: 0; font: inherit; font-size: 11px; line-height: 18px; text-align: start; color: inherit; border-radius: 4px; }
  .b-process-center-list__marketplace-receiver:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  .b-process-center-list__checkout { display: block; font-size: 12px; line-height: 19px; }
  .b-process-center-list__checkout > small { margin-block-start: 4px; font-size: 11px; line-height: 18px; text-wrap: auto; }
  .b-process-center-list__marketplace-actions { --sd-modern-icon-button-size: 33px; display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
  .b-process-center-list__marketplace-actions > .sd-modern-icon-button { margin: 0; }
  .b-process-center-list__marketplace-actions > .b-process-center-list__attention { margin: 0; width: 24px; min-width: 24px; height: 33px; }
  .b-process-center-list__footer { padding: 18px 9px 20px; font-size: 12px; line-height: 19px; }
  .b-process-center-list__marketplace-empty { padding: 60px 20px 70px; min-height: 240px; }
  .b-process-center-list__marketplace-empty > .v-icon { color: var(--sd-modern-muted); margin-block-end: 14px; }
  .b-process-center-list__marketplace-empty h2 { margin: 0; font-family: inherit; font-size: 17px; font-weight: 500; line-height: 25px; }
  .b-process-center-list__marketplace-empty p { max-width: 360px; margin: 6px auto 18px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }

  @media (max-width: 1099px) {
    .b-process-center-list__toolbar { padding-block: 17px !important; }
    .b-process-center-list__toolbar > .flex-grow-1 { flex-basis: 100%; min-width: 0; }
    .b-process-center-list__search { flex: 1 1 150px; max-width: none; :deep(.v-field__input) { font-size: 16px !important; } }
    .b-process-center-list__marketplace-statuses { display: flex; width: 100%; :deep(> .v-btn) { flex: 1 1 auto; min-height: 40px; height: auto; } }
    .b-process-center-list__table {
      :deep(table), :deep(tbody) { display: block; width: 100%; }
      // The dedicated toolbar menu retains all five sorting fields on mobile.
      :deep(thead) { display: none; }
      :deep(.v-data-table__tr--mobile) { display: grid; width: 100%; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 17px 14px; padding: 20px 12px; border-block-end: 1px solid var(--sd-modern-border); }
      :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) { display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 6px; width: auto !important; height: auto; min-height: 0; padding: 0 !important; border: 0; }
      :deep(.v-data-table__tr--mobile > .b-process-center-list__marketplace-identity-cell), :deep(.v-data-table__tr--mobile > .b-process-center-list__wide-cell), :deep(.v-data-table__tr--mobile > .b-process-center-list__marketplace-actions-cell) { grid-column: 1 / -1; }
      :deep(.v-data-table__td-value) { text-align: start !important; min-width: 0; }
      :deep(.v-data-table__tr--mobile > .b-process-center-list__marketplace-actions-cell > .v-data-table__td-title) { display: none; }
    }
    .b-process-center-list__checkout { border: 0; padding-block: 0 !important; }
    .b-process-center-list__stepper { max-width: 270px; }
  }
  @media (max-width: 440px) {
    .b-process-center-list__body { padding-inline: 8px; border-radius: 15px; }
    .b-process-center-list__toolbar { margin-inline: 6px; }
    .b-process-center-list__marketplace-statuses { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); :deep(> .v-btn) { padding-inline: 5px; } }
    .b-process-center-list__marketplace-title { padding-inline: 12px; }
  }
  @media (pointer: coarse) {
    .b-process-center-list__marketplace-statuses :deep(> .v-btn), .b-process-center-list__marketplace-code.v-btn { min-height: 44px; }
    .b-process-center-list__marketplace-receiver { min-height: 44px; }
    .b-process-center-list__marketplace-actions > .v-btn { min-width: 44px; width: 44px; min-height: 44px; height: 44px; }
    .b-process-center-list__marketplace-actions { --sd-modern-icon-button-size: 44px; gap: 6px; }
  }
}
.b-process-center-list--vendor {
  font-size: 13px;
  line-height: 20px;

  .b-process-center-list__body { padding: 6px 24px 0; border-radius: 18px; }
  .b-process-center-list__toolbar { gap: 12px; padding: 15px 0 17px !important; }
  .b-process-center-list__toolbar > .flex-grow-1 { flex: 1 1 auto; min-width: 0; }
  .b-process-center-list__vendor-statuses {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    height: auto;
    padding: 4px;
    overflow: visible;
    border-radius: 9px;
    background: var(--sd-modern-inset);
    :deep(> .v-btn) { height: 32px; min-height: 32px; min-width: 0; padding: 6px 9px; border-radius: 6px !important; background: transparent; color: rgb(var(--v-theme-on-surface)); font: inherit; font-size: 12px; line-height: 18px; letter-spacing: 0; text-transform: none; }
    :deep(> .v-btn--active) { background: rgb(var(--v-theme-surface)); box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), .08); }
    :deep(> .v-btn--active > .v-btn__overlay) { opacity: 0 !important; }
    :deep(> .v-btn--active .v-btn__content::after) { content: ''; width: 4px; height: 4px; margin-inline-start: 6px; border-radius: 50%; background: rgb(var(--v-theme-primary)); }
    :deep(> .v-btn:focus-visible) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }
  .b-process-center-list__search {
    flex: 0 1 205px;
    min-width: 170px !important;
    max-width: 205px;
    border-block-end: 1px solid var(--sd-modern-border);
    :deep(.v-field__input) { min-height: 36px; padding-block: 7px !important; font-size: 13px !important; line-height: 20px; }
    :deep(.v-field__prepend-inner) { height: 36px; padding-block-start: 9px; color: var(--sd-modern-muted); }
    :deep(.v-field__clearable) { align-items: center; padding-block: 0; }
  }
  .b-process-center-list__vendor-clear { display: grid; place-items: center; width: 28px; height: 28px; padding: 0; border-radius: 6px; color: var(--sd-modern-muted); }
  .b-process-center-list__vendor-clear:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  .b-process-center-list__sort-button { display: none; }
  .b-process-center-list__vendor-title { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px; padding: 16px 0 12px; }
  .b-process-center-list__vendor-title h2 { margin: 0; font: inherit; font-size: 14px; font-weight: 500; line-height: 22px; }
  .b-process-center-list__vendor-title > span { margin-inline-start: auto; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .b-process-center-list__vendor-title > .v-btn { margin-inline-start: auto; }
  .b-process-center-list__table {
    --sd-modern-table-font-size: 13px;
    --sd-modern-table-line-height: 20px;
    :deep(.v-table__wrapper > table > thead > tr > th) { padding: 11px 12px !important; }
    :deep(.v-table__wrapper > table > tbody > tr > td) { height: 82px; padding: 12px; line-height: 20px; vertical-align: middle; overflow-wrap: anywhere; }
  }
  .b-process-center-list__order { gap: 5px 9px; }
  .b-process-center-list__basket { flex: 0 0 26px; :deep(.v-img) { width: 26px !important; height: 26px !important; } }
  .b-process-center-list__vendor-code { display: inline-flex; align-items: center; gap: 3px; color: inherit; font-size: 12px; font-weight: 500; line-height: 20px; text-decoration: none; white-space: nowrap; }
  .b-process-center-list__vendor-code:hover { color: rgb(var(--v-theme-primary)); }
  .b-process-center-list__vendor-code:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; border-radius: 3px; }
  .b-process-center-list__vendor-code > svg { color: var(--sd-modern-muted); }
  &.b-process-center-list--rtl {
    .b-process-center-list__vendor-code > svg { transform: scaleX(-1); }
    .b-process-center-list__stepper {
      :deep(.progressbar li) { float: right; }
      :deep(.container-stepper > div:not(.top-chain)) { left: auto !important; right: var(--sd-vendor-stage-offset) !important; }
      :deep(.top-chain) { right: auto; left: 0; }
    }
  }
  .b-process-center-list__products { gap: 5px 9px; padding-inline: 0 !important; }
  .b-process-center-list__products > .py-1 { padding-block: 0 !important; }
  .b-process-center-list__products :deep(.b-process-center-customer__name) { font-size: 11px; line-height: 18px; }
  .b-process-center-list__vendor-guest { display: inline-flex; align-items: center; gap: 5px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .b-process-center-list__vendor-queue { display: inline-flex; align-items: center; color: #a46ce7; }
  .smart-invert & .b-process-center-list__vendor-queue, .v-theme--dark & .b-process-center-list__vendor-queue { color: #c59af6; }
  // The content window inverts once; keep the real semantic and selection colors.
  .smart-invert & {
    .b-process-center-list__vendor-queue { filter: invert(1); }
    .b-process-center-list__vendor-statuses :deep(> .v-btn--active .v-btn__content::after) { filter: invert(1); }
    .b-process-center-list__payment :deep(.sup-icon > .v-icon) { filter: invert(1); }
  }
  .b-process-center-list__amount-value { font-size: 13px; :deep(.u--price) { font-size: inherit; font-weight: 500; } }
  .b-process-center-list__amount-details { line-height: 18px; }
  .b-process-center-list__amount-details > div { display: inline-flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
  .b-process-center-list__payment {
    :deep(.s--order-status-view) { flex-direction: column; justify-content: center; gap: 2px; text-align: center; }
    :deep(.s--order-status-view > .inline-block > img) { margin-inline: 0 !important; }
    :deep(.s--order-status-view small) { line-height: 18px; }
    :deep(.s--order-status-view .sup-icon) { min-width: 13px; min-height: 13px; width: 13px; height: 13px; padding: 0; inset-inline-start: -5px; inset-inline-end: auto; top: -3px; background: rgb(var(--v-theme-surface)); }
    :deep(.s--order-status-view .sup-icon > .v-icon) { font-size: 13px; }
    :deep(.s--order-status-view + .d-flex) { justify-content: center !important; }
  }
  .b-process-center-list__stepper { max-width: 230px; margin-inline: -6px; }
  .b-process-center-list__vendor-stage-icon { position: absolute; inset: 0; display: grid; place-items: center; color: var(--sd-modern-muted); pointer-events: none; }
  .b-process-center-list__stepper :deep(.progressbar li.active .b-process-center-list__vendor-stage-icon) { color: rgb(var(--v-theme-surface)); }
  .b-process-center-list__delivery-caption { max-width: 230px; justify-content: space-between !important; gap: 0 8px; line-height: 18px; }
  .b-process-center-list__delivery-caption > span { margin-inline-start: 0; }
  .b-process-center-list__delivery-caption > div { font-size: 11px; line-height: 18px; }
  .b-process-center-list__checkout { font-size: 12px; line-height: 20px; }
  .b-process-center-list__checkout > small { margin-block-start: 2px; font-size: 11px; line-height: 18px; text-wrap: auto; }
  .b-process-center-list__chat, .b-process-center-list__attention { min-width: 28px; height: 30px; padding: 3px; }
  .b-process-center-list__footer { padding: 18px 0 20px; font-size: 11px; line-height: 18px; }
  .b-process-center-list__vendor-empty { min-height: 360px; padding: 54px 24px; }
  .b-process-center-list__vendor-empty > svg { margin-block-end: 14px; color: var(--sd-modern-muted); }
  .b-process-center-list__vendor-empty h2 { margin: 0; font: inherit; font-size: 17px; font-weight: 500; line-height: 25px; }
  .b-process-center-list__vendor-empty p { max-width: 360px; margin: 6px auto 18px; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }

  @media (max-width: 999px) {
    .b-process-center-list__body { padding-inline: 16px; }
    .b-process-center-list__toolbar > .flex-grow-1 { flex-basis: 100%; }
    .b-process-center-list__vendor-statuses { display: flex; :deep(> .v-btn) { flex: 1 1 auto; min-height: 40px; height: auto; } }
    .b-process-center-list__search { flex: 1 1 150px; max-width: none; :deep(.v-field__input) { font-size: 16px !important; } }
    .b-process-center-list__sort-button { display: inline-flex; }
    .b-process-center-list__table {
      // The mobile toolbar keeps all five server sorting fields available.
      :deep(thead) { display: none; }
      :deep(.v-data-table__tr--mobile) { gap: 18px; padding: 20px 12px; }
      :deep(.v-data-table__tr--mobile > .b-process-center-list__vendor-identity-cell) { grid-column: 1 / -1; }
      :deep(.v-data-table__tr--mobile > .b-process-center-list__vendor-identity-cell > .v-data-table__td-title) { display: none; }
      :deep(.v-data-table__tr--mobile > .b-process-center-list__vendor-identity-cell > .v-data-table__td-value > .py-1) { padding-block: 0 !important; }
      :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) { padding: 0 !important; }
    }
    .b-process-center-list__amount { padding-block: 0 !important; }
    .b-process-center-list__payment :deep(.s--order-status-view) { align-items: flex-start; text-align: start; }
    .b-process-center-list__amount-details > div { justify-content: flex-start; }
    .b-process-center-list__stepper, .b-process-center-list__delivery-caption { max-width: 300px; }
    .b-process-center-list__checkout { padding-block-start: 0 !important; border: 0; }
  }
  @media (max-width: 440px) {
    .b-process-center-list__body { padding-inline: 12px; border-radius: 15px; }
    .b-process-center-list__vendor-statuses { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); :deep(> .v-btn) { padding-inline: 5px; } }
    .b-process-center-list__footer { flex-wrap: wrap; }
  }
  @media (pointer: coarse) {
    .b-process-center-list__vendor-statuses :deep(> .v-btn), .b-process-center-list__vendor-code, .b-process-center-list__vendor-clear { min-height: 44px; }
    .b-process-center-list__chat, .b-process-center-list__attention { min-width: 44px; width: 44px; min-height: 44px; height: 44px; }
  }
}
.b-process-center-list__sort-menu {
  :deep(.v-list-item-title) { font-family: inherit; font-size: 13px; line-height: 20px; font-weight: 400; }
}
.data-table {
  cursor: pointer;
  font-size: 1.071rem;
  font-weight: 400;
  color: #555;
  height: 68px;
}
</style>

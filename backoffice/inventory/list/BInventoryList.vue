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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    v-bind="$attrs"
    class="b-inventory-list s-table-loading text-start"
    :class="{ 'b-inventory-list--modern': modern, 'b-inventory-list--wholesale': wholesaleLayout }"
    :aria-busy="busy_fetch"
    @dragover="dragover"
  >
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!---------------------------- Filter ----------------------->

    <v-row no-gutters :class="{ 'b-inventory-list__toolbar': modern, 'sd-modern-list-toolbar': wholesaleLayout }">
      <v-btn :icon="!modern" :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--quiet': modern }" variant="text" @click="showBulkPrice">
        <v-icon v-if="wholesaleLayout" start size="18" aria-hidden="true">auto_fix_high</v-icon>
        <b-inventory-list-icon v-else-if="modern" name="wand-sparkles" />
        <v-icon v-else size="small">auto_fix_high</v-icon>
        <template v-if="modern">{{ $t('inventory_list.bulk_price_short') }}</template>

        <v-tooltip
          v-if="!modern"
          :text="$t('inventory_list.bulk_price')"
          activator="parent"
          :location="modern ? 'top' : 'bottom'"
          :content-class="modern ? 'sd-modern-tooltip' : undefined"
        ></v-tooltip>
      </v-btn>

      <v-btn :icon="!modern" :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--quiet': modern }" variant="text" @click="showBulkDiscount">
        <v-icon v-if="wholesaleLayout" start size="18" aria-hidden="true">local_offer</v-icon>
        <b-inventory-list-icon v-else-if="modern" name="tag" />
        <v-icon v-else size="small">local_offer</v-icon>
        <template v-if="modern">{{ $t('inventory_list.bulk_discount_short') }}</template>
        <v-tooltip
          v-if="!modern"
          :text="$t('inventory_list.bulk_discount')"
          activator="parent"
          :location="modern ? 'top' : 'bottom'"
          :content-class="modern ? 'sd-modern-tooltip' : undefined"
        ></v-tooltip>
      </v-btn>

      <v-divider v-if="!wholesaleLayout" class="my-0 mx-2" vertical></v-divider>

      <v-select v-if="wholesaleLayout" v-model="group_mode" :items="groupItems" class="b-inventory-list__group-select" variant="plain" hide-details single-line :aria-label="$t('inventory_list.grouped')" :menu-props="{contentClass:'sd-modern-select-menu text-start'}" />
      <v-btn v-else :icon="!modern" :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--quiet': modern }" variant="text" @click="toggleGroup()">
        <b-inventory-list-icon v-if="modern" name="layers-2" />
        <v-icon v-else
          >{{
            group_mode === "auto"
              ? "flash_auto"
              : group_mode
                ? "view_stream"
                : "view_day"
          }}
        </v-icon>
        <template v-if="modern">{{ $t(group_mode === 'auto' ? 'inventory_list.group_auto' : group_mode ? 'inventory_list.grouped' : 'inventory_list.expanded') }}</template>

        <v-tooltip
          v-if="!modern"
          :text="
            group_mode === 'auto'
              ? 'Auto group items'
              : group_mode
                ? 'Group'
                : 'Expanded'
          "
          activator="parent"
          location="bottom"
        ></v-tooltip>
      </v-btn>

      <v-spacer></v-spacer>

      <b-inventory-filter
        v-model="filters"
        :shop="shop"
        :class="modern ? 'b-inventory-list__filter' : 'min-width-200'"
        :modern="modern"
        :dense="modern"
        variant="plain"
        @change="onFilterChange"
      >
      </b-inventory-filter>
      <s-storefront-search-box
        ref="inventory_search"
        :dense="modern"
        :dark="modern && $vuetify.theme.current.dark"
        :label="$t('inventory_list.search_input')"
        :placeholder="modern ? $t('inventory_list.search_inventory') : undefined"
        is-admin
        persistent-placeholder
        background-color="transparent"
        block
        :class="modern ? 'b-inventory-list__search' : 'search-inline mx-2 max-width-field min-width-250 flex-grow-1'"
        expand-input
        variant="plain"
        @onClear="onClear()"
        @onSearch="(event) => onSearch(event)"
        single-line
      >
        <template v-if="modern" v-slot:prepend-inner>
          <v-icon v-if="wholesaleLayout" size="18" aria-hidden="true">search</v-icon>
          <b-inventory-list-icon v-else name="search" />
        </template>
        <template v-if="modern" v-slot:append-inner>
          <v-btn
            class="b-inventory-list__scan"
            :class="{ 'sd-modern-icon-button': wholesaleLayout }"
            icon
            variant="text"
            :aria-label="$t('inventory_list.scan_product')"
            @click.stop="$refs.inventory_search.showQRScanner()"
          >
            <v-icon v-if="wholesaleLayout" size="16" aria-hidden="true">qr_code_scanner</v-icon>
            <b-inventory-list-icon v-else name="scan-line" />
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('inventory_list.scan_product') }}</v-tooltip>
          </v-btn>
        </template>
      </s-storefront-search-box>
      <v-select v-if="wholesaleLayout" v-model="flatSort" :items="sortItems" class="b-inventory-list__flat-sort" variant="plain" hide-details single-line :aria-label="$t('global.commons.sort_by')" :menu-props="{contentClass:'sd-modern-select-menu text-start'}" />
      <v-tooltip v-if="wholesaleLayout" location="top" content-class="sd-modern-tooltip text-start">
        <template #activator="{props}"><v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button b-inventory-list__reverse" :aria-label="$t('inventory_list.modern.reverse_sort')" @click="reverseSort"><v-icon size="16" aria-hidden="true">{{ sortBy[0]?.order === 'desc' ? 'south' : 'north' }}</v-icon></v-btn></template>
        {{ $t('inventory_list.modern.reverse_sort') }}
      </v-tooltip>
    </v-row>
    <div v-if="wholesaleLayout" class="b-inventory-list__scope">
      <span>{{ $t('inventory_list.modern.display_currency', { currency: displayCurrency().code }) }}</span>
      <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-click :persistent="false">
        <template #activator="{props}"><v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('inventory_list.modern.display_currency_help')"><v-icon size="13">info_outline</v-icon></v-btn></template>
        {{ $t('inventory_list.modern.display_currency_help') }}
      </v-tooltip>
      <v-tooltip location="top" content-class="sd-modern-tooltip text-start" open-on-click :persistent="false">
        <template #activator="{props}"><v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('inventory_list.modern.bulk_scope_help')"><v-icon size="13">info_outline</v-icon></v-btn></template>
        {{ $t('inventory_list.modern.bulk_scope_help') }}
      </v-tooltip>
      <v-btn :to="{name:'InventoryImporter'}" class="sd-modern-button sd-modern-button--inline b-inventory-list__import" variant="text"><v-icon start size="16">upload_file</v-icon>{{ $t('inventory_list.modern.import_file') }}</v-btn>
    </div>

    <!---------------------------- List ----------------------->
    <v-data-table-server
      :mobile="isMobile"
      :hide-default-header="wholesaleLayout && isMobile"
      :disable-sort="wholesaleLayout"
      :loading="busy_fetch"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :group-by="is_grouped ? [{ key: 'group' }] : undefined"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading-text="$t('global.commons.waiting_load_data')"
      :row-props="modern && is_grouped ? { class: 'b-inventory-list__child' } : undefined"
      :row-propsCC="
        (_data) => {
          return {
            class:
              'row-hover -no-pointer ' +
              (open_group === _data.item.group ||
              groups_count === 1 ||
              !is_grouped
                ? `open fadeIn`
                : 'close'),
          };
        }
      "
      class="bg-transparent"
      :class="modern ? 'sd-modern-data-table sd-modern-data-table--compact b-inventory-list__table' : 'min-height-80vh'"
      density="compact"
      hide-default-footer
      item-value="key"
    >
      <template v-if="modern && !wholesaleLayout" v-slot:header.sku="{ toggleSort, isSorted }">
        <span class="b-inventory-list__sort-pair">
          <button v-for="key in ['sku', 'mpn']" :key="key" type="button" class="b-inventory-list__sort"
            :aria-label="`${$t('global.commons.sort_by')} ${$t(`inventory_list.table.${key}`)}`"
            :aria-pressed="isSorted({ key })" @click.stop="toggleSort({ key })" @keydown.stop>
            {{ $t(`inventory_list.table.${key}`) }}
            <b-inventory-list-icon v-if="isSorted({ key })" :name="sortBy.find(sort => sort.key === key)?.order === 'asc' ? 'arrow-up' : 'arrow-down'" class="b-inventory-list__sort-icon" />
          </button>
        </span>
      </template>
      <template v-if="modern && !wholesaleLayout" v-slot:header.status="{ toggleSort, isSorted }">
        <span class="b-inventory-list__sort-pair">
          <button v-for="key in ['status', 'original']" :key="key" type="button" class="b-inventory-list__sort"
            :aria-label="`${$t('global.commons.sort_by')} ${$t(`inventory_list.table.${key}`)}`"
            :aria-pressed="isSorted({ key })" @click.stop="toggleSort({ key })" @keydown.stop>
            {{ $t(`inventory_list.table.${key}`) }}
            <b-inventory-list-icon v-if="isSorted({ key })" :name="sortBy.find(sort => sort.key === key)?.order === 'asc' ? 'arrow-up' : 'arrow-down'" class="b-inventory-list__sort-icon" />
          </button>
        </span>
      </template>
      <template v-if="modern" v-slot:item.data-table-group>
        <span class="b-inventory-list__branch" aria-hidden="true"></span>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="fetch_error && !busy_fetch" class="sd-modern-empty-state" role="alert">
          <v-icon size="28">cloud_off</v-icon>
          <h3>{{ $t('inventory_list.modern.load_error') }}</h3>
          <p>{{ $t('inventory_list.modern.load_error_help') }}</p>
          <v-btn class="sd-modern-button" variant="text" @click="onRefresh">{{ $t('global.actions.retry') }}</v-btn>
        </div>
        <div v-else-if="modern && !busy_fetch" class="sd-modern-empty-state">
          <v-icon size="28">{{ search || filters.length ? 'search_off' : 'shelves' }}</v-icon>
          <h3>{{ $t('global.commons.no_data') }}</h3>
          <p>{{ $t('inventory_list.subtitle') }}</p>
        </div>
        <div v-else-if="!busy_fetch && !search" class="py-5 usn text-center fadeIn">
          <img
            :src="require('../../../assets/guides/inventory-empty.png')"
            class="m-3 op-0-3"
            style="max-height: 400px; object-fit: contain"
            width="85%"
          />
          <h2 class="text-h4 font-weight-thin">
            Manage all products in the inventory here...
          </h2>
        </div>
        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <!-- ===================================== Start Group ================================== -->

      <template
        v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
      >
        <b-inventory-list-group-header
          :columns="columns"
          :isGroupOpen="isGroupOpen"
          :isMobile="isMobile"
          :modern="modern"
          :item="item"
          :toggleGroup="toggleGroup"
        ></b-inventory-list-group-header>
      </template>

      <!-- ===================================== End Group ================================== -->

      <template v-slot:item.icon="{ item }">
        <div :class="modern ? 'b-inventory-list__image' : 'py-2'">
          <router-link
            :to="{
              name: 'BPageProductDashboard',
              params: { product_id: item.id },
            }"
          >
            <u-avatar-folder
              :size="modern ? 38 : undefined"
              is-gray
              :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
              :side-image="getProductTypeImage(item.type)"
              :elevated="!modern"
            >
            </u-avatar-folder>

            <v-tooltip activator="parent" :location="modern ? 'top' : 'bottom'" :content-class="modern ? 'sd-modern-tooltip' : undefined"
              >Open product admin page.
            </v-tooltip>
          </router-link>
        </div>
      </template>

      <template v-slot:item.title="{ item }">
        <div v-if="modern" class="b-inventory-list__product">
          <router-link :to="{ name: 'BPageProductDashboard', params: { product_id: item.id } }" :aria-label="item.title" class="b-inventory-list__product-link">
            <v-avatar :size="wholesaleLayout ? 38 : isMobile ? 40 : 44" rounded="lg" class="b-inventory-list__avatar hover-scale-small">
              <v-img :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL) || getProductTypeImage(item.type)" :alt="item.title" cover>
                <template v-slot:error><v-img :src="getProductTypeImage(item.type)" :alt="item.title" /></template>
              </v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('inventory_list.open_product') }}</v-tooltip>
          </router-link>
          <div class="b-inventory-list__product-copy">
            <router-link v-if="wholesaleLayout" class="b-inventory-list__product-name" :to="{name:'BPageProductDashboard',params:{product_id:item.id}}">{{ item.title }}</router-link>
            <div v-else class="b-inventory-list__product-name">{{ item.title }}</div>
            <div v-if="item.title_en" class="b-inventory-list__secondary">{{ item.title_en }}</div>
            <button v-if="wholesaleLayout" v-copy type="button" class="b-inventory-list__copy b-inventory-list__secondary" :aria-label="$t('global.actions.copy') + ' ' + item.code" @click.stop><bdi>{{ item.code }}</bdi></button>
            <variant-item-view-micro v-if="item.variant" :product-variant="item.variant" />
          </div>
        </div>
        <template v-else-if="$vuetify.display.xs">
          <div
            class="d-flex align-center pt-2 justify-space-between"
            style="min-width: 60vw"
          >
            <variant-item-view-micro
              v-if="item.variant"
              :product-variant="item.variant"
              class="flex-grow-0"
            />

            <product-status-view
              :product="item"
              class="mx-2"
            ></product-status-view>

            <u-avatar-folder
              is-gray
              :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
              :side-image="getProductTypeImage(item.type)"
              class="flex-grow-0"
            >
            </u-avatar-folder>
          </div>
        </template>
        <template v-else>
          <div class="min-width-200 max-w-300 py-1">
            <div class="font-weight-bold single-line">{{ item.title }}</div>
            <div class="small single-line">{{ item.title_en }}</div>
            <variant-item-view-micro
              v-if="item.variant"
              :product-variant="item.variant"
            />
          </div>
        </template>
      </template>

      <template v-slot:item.id="{ item }">
        <div v-copy :class="modern ? 'b-inventory-list__identifier' : 'min-width-100 text-subtitle-2 py-2'" dir="ltr">
          {{ item.code }}
        </div>
      </template>

      <template v-slot:item.sku="{ item }">
        <div v-if="modern" class="b-inventory-list__identifiers" dir="ltr">
          <button v-if="wholesaleLayout && item.sku" v-copy type="button" class="b-inventory-list__copy b-inventory-list__identifier" @click.stop><bdi>{{ item.sku }}</bdi></button>
          <span v-else-if="item.sku" v-copy class="b-inventory-list__identifier">{{ item.sku }}</span>
          <span v-else class="b-inventory-list__secondary">—</span>
          <button v-if="wholesaleLayout && item.mpn" v-copy type="button" class="b-inventory-list__copy b-inventory-list__identifier b-inventory-list__secondary" @click.stop><bdi>{{ item.mpn }}</bdi></button>
          <span v-else-if="item.mpn" v-copy class="b-inventory-list__identifier b-inventory-list__secondary">{{ item.mpn }}</span>
        </div>
        <div v-else>
          <span v-copy :class="modern ? 'b-inventory-list__identifier' : 'min-width-50 text-subtitle-2 py-2'" dir="ltr">{{
            item.sku
          }}</span>
        </div>
      </template>

      <template v-slot:item.mpn="{ item }">
        <div>
          <span v-copy :class="modern ? 'b-inventory-list__identifier' : 'min-width-50 text-subtitle-2 py-2'" dir="ltr">
            {{ item.mpn }}</span
          >
        </div>
      </template>

      <template v-slot:item.original="{ item }">
        <v-icon v-if="item.original" color="success" :size="modern ? 15 : undefined" :aria-label="$t('inventory_list.table.original')"> check</v-icon>
      </template>

      <template v-slot:item.status="{ item }">
        <div v-if="modern" class="b-inventory-list__status-stack">
        <span class="b-inventory-list__status">
          <span class="sd-modern-status__dot" :class="'sd-modern-status__dot--' + statusTone(item)"></span>
          {{ $t(item.disabled ? 'inventory_list.table.close_state' : ProductStatus[item.status].name) }}
        </span>
        <span v-if="item.original" class="b-inventory-list__original">
          <v-icon size="13" color="success" class="no-inv" aria-hidden="true">check</v-icon>
          {{ $t('inventory_list.table.original') }}
        </span>
        </div>
        <product-status-view
          v-else-if="!item.disabled"
          :product="item"
        ></product-status-view>
        <v-icon v-else title="Variant is disabled!">close</v-icon>
      </template>

      <template v-slot:item.quantity="{ item }">
        <div
          v-if="
            item.type === ProductType.PHYSICAL.code ||
            item.type === ProductType.VIRTUAL.code
          "
          :class="modern ? 'b-inventory-list__stock' : 'min-width-150 font-weight-black'"
          dir="ltr"
        >
          {{ item.quantity }}
          <span
            v-if="isChanged(item)"
          >
            <i class="fas fa-caret-right mx-2" />
            <span class="highlight-value">{{
              stockTarget(item)
            }}</span>
          </span>
        </div>
        <div v-else>
          <small>{{ modern ? $t('global.commons.infinite') : 'Infinite' }}</small>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <component
          :is="modern ? 'button' : 'div'"
          :type="modern ? 'button' : undefined"
          :aria-label="modern ? `${$t('global.actions.edit')} ${$t('global.commons.price')} · ${item.title}` : undefined"
          :class="modern ? ['b-inventory-list__price', { '-focus': show_price_dialog && selected_item === item }] : ['editable center-flex rounded-lg ma-1 price-btn px-5', { '-focus': show_price_dialog && selected_item === item }]"
          :style="modern ? undefined : { height: $vuetify.display.xs ? '42px' : '65px' }"
          @click="showEditPrice(item)"
        >
          <v-icon
            v-if="item && item.variant && item.variant.pricing"
            :title="$t('add_product.pricing.independent_price')"
            class="me-2"
            size="small"
            >local_offer
          </v-icon>
          <u-price-invalid
            v-if="
              isNaN(CalcPriceProductCurrentCurrency(shop, item, item.variant))
            "
            :currency="item.currency"
          ></u-price-invalid>
          <u-price
            v-else
            :amount="CalcPriceProductCurrentCurrency(shop, item, item.variant)"
            :medium="!modern"
          ></u-price>
          <v-icon v-if="modern" size="12" class="ms-1">edit</v-icon>
        </component>
      </template>

      <template v-slot:item.change="{ item }">
        <!-- ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀ -->
        <div v-if="is_marketplace" class="small pa-1">
          <v-icon class="me-1">info_outline</v-icon>
          Change inventory in the
          <b>
            <router-link
              :to="{
                name: IS_VENDOR_PANEL
                  ? 'Vendor_ProductPage_Vendors'
                  : 'BPageProductVendors',
                params: item ? { product_id: item.id } : undefined,
              }"
              >Vendors
            </router-link>
          </b>
          tab.
        </div>
        <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

        <div v-else-if="canEditStock(item)" :class="modern ? 'b-inventory-list__quantity-editor' : 'p-2'">
          <u-number-input
            v-model="item.number"
            @update:model-value="delete stock_errors[item.key]"
            :disabled="!!stock_busy[item.key] || busy_fetch"
            :min="item.add ? -1000 : 0"
            :background-color="modern ? 'transparent' : '#fafafa'"
            :class="modern ? 'b-inventory-list__quantity-field' : 'max-width-field inline-block vertical-align-middle center-input strong-field min-width-300'"
            :aria-label="modern ? `${$t('global.commons.quantity')} · ${item.title}` : undefined"
            :dark="modern && $vuetify.theme.current.dark"
            flat
            hide-details
            no-padding
            rounded="lg"
            :variant="modern ? 'plain' : 'solo-filled'"
            :dense="modern || $vuetify.display.xs"
          >
            <template v-slot:prepend-inner>
              <v-btn-toggle
                v-model="item.add"
                @update:model-value="delete stock_errors[item.key]"
                :disabled="!!stock_busy[item.key] || busy_fetch"
                :class="modern ? 'b-inventory-list__quantity-mode' : 'vertical-align-middle pa-1 bg-white'"
                density="compact"
                mandatory
                rounded="lg"
                :base-color="modern ? undefined : '#efefef'"
                :style="modern ? undefined : { height: $vuetify.display.xs ? '42px' : '52px' }"
                :selected-class="modern ? 'b-inventory-list__quantity-mode-selected' : isChanged(item) ? 'elevation-1' : undefined"
                :role="modern ? 'group' : undefined"
                :aria-label="modern ? `${$t('inventory_list.table.edit')} · ${item.title}` : undefined"
              >
                <v-btn :value="true" :disabled="!!stock_busy[item.key] || busy_fetch" :aria-pressed="modern ? item.add === true : undefined" :variant="modern ? 'text' : undefined" :selected-class="modern ? undefined : 'green-flat'" size="small">
                  {{ $t("global.actions.add") }}
                </v-btn>
                <v-btn :value="false" :disabled="!!stock_busy[item.key] || busy_fetch" :aria-pressed="modern ? item.add === false : undefined" :variant="modern ? 'text' : undefined" :selected-class="modern ? undefined : 'blue-flat'" size="small">
                  {{ $t("global.actions.set") }}
                </v-btn>
              </v-btn-toggle>
            </template>

            <template v-slot:append-inner>
              <v-btn
                :class="[modern ? 'b-inventory-list__save sd-modern-button sd-modern-button--compact' : 'ms-2 me-n1 vertical-align-middle tnt', {
                  disabled: item.add
                    ? item.number === 0
                    : item.number === item.quantity,
                }]"
                :disabled="!isChanged(item) || !!stock_busy[item.key] || busy_fetch"
                :color="modern ? (isChanged(item) ? 'primary' : undefined) : isChanged(item) ? '#000' : '#999'"
                :loading="!!stock_busy[item.key]"
                :variant="modern ? (isChanged(item) ? 'elevated' : 'text') : isChanged(item) ? 'elevated' : 'plain'"
                rounded="lg"
                :min-height="modern ? (isMobile ? 44 : 32) : $vuetify.display.xs ? 36 : 52"
                @click.stop="updateProductQuantity(item)"
              >
                <v-icon v-if="wholesaleLayout" start size="14" aria-hidden="true">save</v-icon>
                {{ $t(stock_errors[item.key] ? 'global.actions.retry' : 'global.actions.save') }}
              </v-btn>
            </template>
          </u-number-input>
          <div v-if="modern" class="b-inventory-list__stock-feedback" role="status">
            <template v-if="stock_errors[item.key]"><v-icon size="13" color="error" class="no-inv">error_outline</v-icon>{{ $t('inventory_list.modern.quantity_save_error') }}</template>
            <template v-else-if="!validStock(item)"><v-icon size="13" color="error" class="no-inv">error_outline</v-icon>{{ $t('inventory_list.modern.quantity_invalid') }}</template>
          </div>
        </div>
        <div v-else>
          <small>{{ $t("inventory_list.cant_set_here") }}</small>
        </div>
      </template>

      <template v-slot:bottom>
        <div :class="{ 'sd-modern-table-footer b-inventory-list__footer': modern }">
          <span v-if="wholesaleLayout" class="b-inventory-list__secondary">{{ $t('inventory_list.modern.product_count', {count: busy_fetch || fetch_error ? '—' : totalItems}) }} · {{ $t('inventory_list.modern.row_count', {count: busy_fetch || fetch_error ? '—' : items.length}) }}</span>
          <span v-else-if="modern" class="b-inventory-list__secondary">{{ $t('global.commons.total') }}: {{ totalItems }}</span>
          <v-pagination v-model="page" :length="pageCount" :class="{ 'sd-modern-pagination': modern }" :total-visible="modern ? 5 : undefined" rounded />
        </div>
      </template>
    </v-data-table-server>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬ Drop Zone ⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <div
      v-if="show_valid_drop || show_error_drop"
      :class="{ '-invalid-file': show_error_drop }"
      class="drop-container"
      @dragleave="dragleave"
      @drop="drop"
    >
      <div class="center-absolute p-3 text-center">
        <div>
          <v-icon class="m-2" color="#fff" size="64">topic</v-icon>
        </div>
        {{ $t("admin_shop.products.drop_import_message") }}
      </div>
    </div>
  </div>

  <!-- ██████████████████████ Dialog > Price ██████████████████████ -->
  <v-dialog
    v-model="show_price_dialog"
    fullscreen
    scrollable
    :persistent="wholesaleLayout && busy_save_price"
    transition="dialog-bottom-transition"
  >
    <v-card v-if="item_clone && show_price_dialog_pre" class="text-start" :class="{ 'sd-modern-canvas b-inventory-list__price-dialog': modern, 'b-inventory-list__price-dialog--wholesale': wholesaleLayout }">
      <v-card-title class="d-flex align-center">
        <u-avatar-folder
          :class="{ 'me-2': !wholesaleLayout }"
          :size="wholesaleLayout ? 38 : 48"
          :elevated="!wholesaleLayout"
          side-icon="shelves"
          placeholder-icon="inventory"
          :src="getShopImagePath(selected_item.icon, IMAGE_SIZE_SMALL)"
          is-gray
          :border-size="wholesaleLayout ? 0 : 8"
        >
        </u-avatar-folder>

        <div v-if="wholesaleLayout" class="b-inventory-list__price-identity">
          <h2>{{ $t('add_product.pricing.modern.dialog_title') }}</h2>
          <div class="b-inventory-list__price-context">
            <span>{{ selected_item?.product?.title }}</span>
            <span aria-hidden="true">·</span>
            <bdi>{{ selected_item.code }}</bdi>
            <variant-item-view-micro
              v-if="selected_item.variant"
              :product-variant="selected_item.variant"
            />
          </div>
        </div>
        <div v-else class="flex-grow-1 overflow-hidden">
          {{ selected_item?.product?.title }}

          <div class="small single-line">
            {{ selected_item?.product?.title_en?.limitWords(12) }}
          </div>
        </div>

        <v-btn
          class="ms-2"
          :class="{ 'sd-modern-icon-button': modern }"
          :aria-label="$t('global.actions.close')"
          :disabled="wholesaleLayout && busy_save_price"
          icon
          @click="show_price_dialog = false"
          variant="text"
        >
          <v-icon>close</v-icon>
          <v-tooltip v-if="modern" activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </v-card-title>

      <v-card-text class="thin-scroll">
        <b-product-edit-price
          ref="price_edit"
          :customObject="item_clone"
          :product="instanceProduct"
          :variant="selected_item?.variant"
          :instance-object="selected_item"
          :instance-original-product="instanceProduct"
          :instance-product-id="selected_item.id"
          :instance-variant-id="selected_item.variant_id"
          :instance-variant-pricing="variant_pricing"
          :is-marketplace="is_marketplace"
          :shop="shop"
          :modern="wholesaleLayout"
          :class="{ 'mt-4': !wholesaleLayout, 'sd-modern-form': modern }"
          external-action-buttons
          instance-mode
          light
          transparent
          @update:instance="onUpdatePrice"
        >
        </b-product-edit-price>
        <div v-if="wholesaleLayout" class="b-inventory-list__price-consequence"><v-icon size="18" color="warning" class="no-inv" aria-hidden="true">info_outline</v-icon><span>{{ $t('inventory_list.modern.reseller_price_consequence') }}</span></div>
      </v-card-text>
      <v-card-actions :class="{ 'sd-modern-form-actions': modern }">
        <div v-if="wholesaleLayout" class="b-inventory-list__price-actions">
          <v-btn
            class="sd-modern-button"
            variant="outlined"
            :disabled="busy_save_price"
            @click="show_price_dialog = false"
          >
            {{ $t('global.actions.cancel') }}
          </v-btn>
          <v-btn
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="elevated"
            :loading="busy_save_price"
            :disabled="busy_save_price"
            @click="savePrice"
          >
            <v-icon start size="18" aria-hidden="true">save</v-icon>
            {{ $t('global.actions.save') }}
          </v-btn>
        </div>
        <div v-else class="widget-buttons">
          <v-btn
            :size="modern ? undefined : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            variant="text"
            @click="show_price_dialog = false"
          >
            <v-icon start>close</v-icon>

            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy_save_price"
            color="primary"
            :size="modern ? undefined : 'x-large'"
            :class="{ 'sd-modern-button': modern }"
            variant="elevated"
            @click="savePrice"
          >
            <v-icon start>save</v-icon>
            {{ $t("global.actions.save") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ====================== Dialog > Bulk price action ====================== -->
  <b-inventory-bulk-price
    v-model="show_bulk_price"
    :shop="shop"
    :modern="modern"
    @update="onRefresh"
  >
  </b-inventory-bulk-price>
  <!-- ====================== Dialog > Bulk discount action ====================== -->
  <b-inventory-bulk-discount
    v-model="show_bulk_discount"
    :shop="shop"
    :modern="modern"
    @update="onRefresh"
  >
  </b-inventory-bulk-discount>
</template>

<script lang="ts">
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import BProductEditPrice from "../../product/edit/price/BProductEditPrice.vue";
import ProductStatusView from "../../../storefront/product/status/ProductStatusView.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BInventoryFilter from "../../inventory/filter/BInventoryFilter.vue";
import BInventoryListIcon from "./icon/BInventoryListIcon.vue";
import SStorefrontSearchBox from "../../../storefront/search/SStorefrontSearchBox.vue";
import { TemporaryDataHelper } from "../../../utils/temporary-data/TemporaryDataHelper";
import BInventoryBulkPrice from "../../inventory/bulk/price/BInventoryBulkPrice.vue";
import BInventoryBulkDiscount from "../../inventory/bulk/discount/BInventoryBulkDiscount.vue";
import BInventoryListGroupHeader from "../../inventory/list/group-header/BInventoryListGroupHeader.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import UPriceInvalid from "@selldone/components-vue/ui/price/invalid/UPriceInvalid.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import { CurrencyHelper } from "@selldone/core-js/helper/currency/CurrencyHelper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BInventoryList",
  mixins: [ProductMixin ],
  components: {
    BInventoryListIcon,
    UPriceInvalid,
    UAvatarFolder,
    BInventoryListGroupHeader,
    BInventoryBulkDiscount,
    BInventoryBulkPrice,
    SStorefrontSearchBox,
    BInventoryFilter,
    ProductStatusView,
    BProductEditPrice,
    VariantItemViewMicro,
    UNumberInput,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    onlyDropshipping: {
      default: false,
      type: Boolean,
    },
    modern: Boolean,
  },
  data: function () {
    return {
      ProductType: ProductType,

      ProductStatus: ProductStatus,

      tab: "list",

      busy_fetch: false,
      fetch_error: false,
      fetch_id: 0,
      lifecycle_id: 0,
      stock_busy: {},
      stock_errors: {},

      products: [],

      items: [],
      filters: [],

      // ===== Product Filter =====
      filter_bundle: { count: 100 },
      search_type: null,
      search: null,

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      sortBy: [{ key: null, order: "desc" }],

      open_group: [],
      //-----------------------------------------
      item_clone: null,
      show_price_dialog: false,
      show_price_dialog_pre: false,

      busy_set_price: false,
      variant_pricing: false,
      selected_item: null,
      instanceProduct: null,

      busy_save_price: false,

      //--------------------------

      show_valid_drop: false,
      show_error_drop: false,

      //--------------------------

      group_mode: "auto", // false    true    auto

      show_bulk_price: false,
      show_bulk_discount: false,
    };
  },

  computed: {
    wholesaleLayout() {
      return this.modern && this.onlyDropshipping;
    },
    groupItems() {
      return [
        {title:this.$t('inventory_list.group_auto'), value:'auto'},
        {title:this.$t('inventory_list.grouped'), value:true},
        {title:this.$t('inventory_list.expanded'), value:false},
      ];
    },
    flatSort: {
      get() { return this.sortBy[0]?.key ?? null; },
      set(key) { this.sortBy = [{key, order:this.sortBy[0]?.order || 'desc'}]; },
    },
    sortItems() {
      return [{title:this.$t('inventory_list.modern.sort_default'),value:null},
        ...['title','id','sku','mpn','status','original','quantity','price'].map(key=>({title:this.$t(key === 'price' ? 'global.commons.price' : 'inventory_list.table.' + ({title:'product',id:'code',quantity:'in_stock'}[key] || key)),value:key}))];
    },
    isMobile() {
      return this.wholesaleLayout ? this.$vuetify.display.width <= 800 : this.modern
        ? this.$vuetify.display.width < 1200
        : this.$vuetify.display.xs;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    is_grouped() {
      if (this.group_mode === "auto") {
        return this.products.length > 30;
      }

      return this.group_mode; // true or false
    },

    pages() {
      if (this.pagination.rowsPerPage == null || this.items == null) return 0;

      return Math.ceil(this.items.length / this.pagination.rowsPerPage);
    },

    headers() {
      if (this.modern) {
        let columns = [
          { title: this.$t('inventory_list.table.product'), value: 'title', align: 'start', sortable: true },
          { title: this.$t('inventory_list.table.code'), value: 'id', align: 'start', sortable: true },
          { title: `${this.$t('inventory_list.table.sku')} / ${this.$t('inventory_list.table.mpn')}`, value: 'sku', align: 'start', sortable: true },
          { title: `${this.$t('inventory_list.table.status')} / ${this.$t('inventory_list.table.original')}`, value: 'status', align: 'start', sortable: true },
          { title: this.$t('inventory_list.table.in_stock'), value: 'quantity', align: 'end', sortable: true },
          { title: this.$t('global.commons.price'), value: 'price', align: 'end', sortable: true },
          { title: this.$t('inventory_list.table.edit'), value: 'change', align: 'end', sortable: false },
        ];
        // Keep native mobile sorting for the secondary values without repeating their body cells.
        if (this.wholesaleLayout) {
          const widths = {title:'28%',sku:'12%',status:'12%',quantity:'8%',price:'12%',change:'28%'};
          columns = columns.filter(column=>column.value !== 'id').map(column=>({...column,width:widths[column.value],sortable:false}));
        }
        if (this.isMobile && !this.wholesaleLayout) columns.splice(columns.length - 1, 0,
          { title: this.$t('inventory_list.table.mpn'), value: 'mpn', sortable: true, cellProps: { class: 'b-inventory-list__merged-cell' } },
          { title: this.$t('inventory_list.table.original'), value: 'original', sortable: true, cellProps: { class: 'b-inventory-list__merged-cell' } },
        );
        if (this.is_grouped) columns.unshift({ title: '', key: 'data-table-group', value: 'data-table-group', width: 44, sortable: false, cellProps: { class: 'b-inventory-list__branch-cell' } });
        return columns;
      }
      if (this.isMobile) {
        return [
          {
            title: "",
            align: "start",
            sortable: true,
            value: "title",
          },
          {
            title: this.$t("inventory_list.table.code"),
            value: "id",
            sortable: true,
          },
          {
            title: this.$t("inventory_list.table.sku"),
            align: "center",
            value: "sku",
            sortable: true,
          },
          {
            title: this.$t("inventory_list.table.mpn"),
            align: "center",
            value: "mpn",
            sortable: true,
          },

          {
            title: this.$t("inventory_list.table.in_stock"),
            align: this.modern ? "end" : "center",
            value: "quantity",
            sortable: true,
          },
          {
            title: this.$t("global.commons.price"),
            align: this.modern ? "end" : "center",
            sortable: true,
            value: "price",
          },
          {
            title: "",
            align: "center",
            value: "change",
            sortable: false,
          },
        ];
      }

      return [
        {
          title: this.$t("inventory_list.table.image"),
          align: "start",
          sortable: false,
          value: "icon",
        },
        {
          title: this.$t("inventory_list.table.product"),
          align: "start",
          sortable: true,
          value: "title",
        },
        {
          title: this.$t("inventory_list.table.code"),
          align: "start",
          value: "id",
          sortable: true,
        },
        {
          title: this.$t("inventory_list.table.sku"),
          align: "start",
          value: "sku",
          sortable: true,
        },
        {
          title: this.$t("inventory_list.table.mpn"),
          align: "start",
          value: "mpn",
          sortable: true,
        },

        {
          title: this.$t("inventory_list.table.original"),
          align: "center",
          value: "original",
          sortable: true,
        },

        {
          title: this.$t("inventory_list.table.status"),
          align: "center",
          value: "status",
          sortable: true,
        },
        {
          title: this.$t("inventory_list.table.in_stock"),
          align: this.modern ? "end" : "center",
          value: "quantity",
          sortable: true,
        },
        {
          title: this.$t("global.commons.price"),
          align: this.modern ? "end" : "center",
          sortable: true,
          value: "price",
        },
        {
          title: this.$t("inventory_list.table.edit"),
          align: this.modern ? "end" : "center",
          value: "change",
          sortable: false,
        },
      ];
    },

    //--------------------------------------------------------------

    groups_count() {
      return this.items.countUnique("group");
    },
  },

  watch: {
    'shop.id'() {
      this.lifecycle_id++;
      this.fetch_id++;
      this.products = [];
      this.items = [];
      this.totalItems = 0;
      this.stock_busy = {};
      this.stock_errors = {};
      this.selected_item = null;
      this.show_price_dialog = false;
      this.show_bulk_price = false;
      this.show_bulk_discount = false;
      this.page = 1;
      this.fetchData(1, this.sortBy[0]?.key, this.sortBy[0]?.order === 'desc');
    },
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchData(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    products() {
      if (!this.products) return [];
      const previous = new Map(this.items.map(item=>[item.key,item]));
      let out = [];
      this.products.forEach((product) => {
        let product_variants = product.product_variants;
        if (!product_variants || !product_variants.length) {
          out.push({
            group: product.id,

            product: product,

            key: product.id,

            id: product.id,
            code: `P-${product.id}`,

            number: 0,
            product_id: product.id,
            title: product.title,
            quantity: product.quantity,
            type: product.type,
            title_en: product.title_en,
            icon: product.icon,
            add: true,
            original: product.original,
            status: product.status,

            sku: product.sku,
            mpn: product.mpn,

            pricing: product.pricing,

            price: product.price,
            commission: product.commission,
            discount: product.discount,
            currency: product.currency,
            dis_start: product.dis_start,
            dis_end: product.dis_end,

            calc_price: this.CalcPriceProductCurrentCurrency(
              this.shop,
              product,
              null,
            ),

            extra_pricings: product.extra_pricings, // Extra pricings (all extra pricings then filtered in price editor by variant)
          });
        } else {
          product_variants.forEach((variant) => {
            out.push({
              group: product.id,

              product: product,
              variant: variant,

              key: product.id + "-" + variant.id,

              id: product.id,
              variant_id: variant.id,
              code: `P-${product.id}/V-${variant.id}`,
              number: 0,
              product_id: product.id,
              title: product.title,
              quantity: variant.quantity,
              type: product.type,
              title_en: product.title_en,
              icon: variant.image ? variant.image : product.icon,
              add: true,
              original: product.original,
              status: product.status,
              disabled: variant.enable === false,

              sku: variant.sku,
              mpn: variant.mpn,

              pricing: variant.pricing,

              price: variant.pricing ? variant.price : product.price,
              commission: variant.pricing
                ? variant.commission
                : product.commission,
              discount: variant.pricing ? variant.discount : product.discount,
              currency: variant.pricing ? variant.currency : product.currency,
              dis_start: variant.pricing
                ? variant.dis_start
                : product.dis_start,
              dis_end: variant.pricing ? variant.dis_end : product.dis_end,

              calc_price: this.CalcPriceProductCurrentCurrency(
                this.shop,
                product,
                variant,
              ),

              extra_pricings: product.extra_pricings, // Extra pricings (all extra pricings then filtered in price editor by variant)
            });
          });
        }
      });
      // Preserve edits in other rows when one saved row refreshes the server list.
      this.items = out.map(item=>{
        const draft = previous.get(item.key);
        return draft ? {...item, number:draft.number, add:draft.add} : item;
      });
    },
  },
  created() {},
  beforeUnmount() {
    this.fetch_id++;
    this.lifecycle_id++;
  },
  methods: {
    displayCurrency() {
      return CurrencyHelper.GetUserSelectedCurrency(this.$localstorage_base_path());
    },
    reverseSort() {
      this.sortBy = [{key:this.flatSort,order:this.sortBy[0]?.order === 'desc' ? 'asc' : 'desc'}];
    },
    statusTone(item) {
      if(item.disabled || ['Close','Rejected'].includes(item.status)) return 'error';
      if(item.status === 'Pending') return 'warning';
      return item.status === 'Open' ? 'success' : 'neutral';
    },
    canEditStock(item) {
      return item.type === ProductType.PHYSICAL.code && !item.product?.parent_id && !this.is_marketplace;
    },
    stockTarget(item) {
      return item.add ? Number(item.quantity) + Number(item.number) : Number(item.number);
    },
    validStock(item) {
      return item.number !== null && String(item.number).trim() !== '' && Number.isInteger(Number(item.number)) && (item.add ? Number(item.number) >= -1000 : Number(item.number) >= 0) && this.stockTarget(item) >= 0;
    },
    onSearch(event) {
      this.search_type = event.search_type;
      this.search = event.search;
      this.page = 1;
      this.fetchData(1, this.sortBy[0]?.key, this.sortBy[0]?.order === "desc");
    },

    onClear() {
      this.search_type = null;
      this.search = null;
      this.page = 1;
      this.fetchData(1, this.sortBy[0]?.key, this.sortBy[0]?.order === "desc");
    },

    onRefresh() {
      return this.fetchData(this.page, this.sortBy[0]?.key, this.sortBy[0]?.order === "desc");
    },
    //================================= Product Filter ===================================

    updateProductQuantity(item) {
      if (!this.shop?.id || this.stock_busy[item.key] || !this.isChanged(item)) return;
      const shopId = this.shop.id;
      const lifecycleId = this.lifecycle_id;
      const key = item.key;
      const quantity = this.stockTarget(item);
      const isCurrent = () => this.shop?.id === shopId && this.lifecycle_id === lifecycleId;
      this.stock_busy[key] = true;
      delete this.stock_errors[key];

      return axios
        .post(
          window.API.POST_PRODUCT_QUANTITY(
            shopId,
            item.product_id,
            item.variant ? item.variant.id : null,
          ),
          {
            quantity: quantity,
          },
        )
        .then((response) => {
          if (!isCurrent()) return;
          if (!response.data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("inventory_list.notifications.save_success"),
            );
            const current = this.items.find(row => row.key === key);
            if (current) {
              current.quantity = response.data.quantity;
              current.number = current.add ? 0 : response.data.quantity;
              if (current.variant) current.variant.quantity = response.data.quantity;
              else current.product.quantity = response.data.quantity;
            }
            // Refresh aggregate stock and server ordering without dropping other row drafts.
            this.onRefresh();
          } else {
            this.stock_errors[key] = true;
            NotificationService.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          if (!isCurrent()) return;
          this.stock_errors[key] = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (isCurrent()) delete this.stock_busy[key];
        });
    },
    onFilterChange() {
      this.page = 1;
      this.fetchData(1, this.sortBy[0]?.key, this.sortBy[0]?.order === "desc");
    },

    fetchData(page = 1, sortBy = null, sortDesc = true) {
      const shopId = this.shop?.id;
      const fetchId = ++this.fetch_id;
      if (!shopId) {
        this.busy_fetch = false;
        return;
      }
      const isCurrent = () => this.shop?.id === shopId && this.fetch_id === fetchId;
      this.busy_fetch = true;
      this.fetch_error = false;

      return axios
        .get(window.API.GET_ALL_MY_PRODUCTS(shopId), {
          params: {
            statuses: this.filters?.filter((x) => !!ProductStatus[x]),
            types: this.filters?.filter((x) => !!ProductType[x]),

            ////  type:ProductType.PHYSICAL.code,
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            // sort: null,
            // available: this.filter_bundle.only_available,
            dir: "*",
            /* dir:
                                                              !this.search &&
                                                              this.filter_bundle.dir &&
                                                              this.filter_bundle.dir.length
                                                                  ? this.filter_bundle.dir
                                                                  : "*",*/
            products_only: true,
            need_full_variants: true, // Return full variants data
            optimized: true, // Dont send pricing & rating values!

            // count: this.filter_bundle.count,// Not used any more!

            search_type: this.search_type,
            search: this.search,

            with_parent: true,
            with_total: true, // Need for pagination

            only_dropshipping: this.onlyDropshipping, // Only drop shipping items (Wholesaler Inventory)

            with_extra_pricings: true, // We need extra pricings here to edit price!
          },
        })
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (data.error) {
            this.products = [];
            this.fetch_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.products = data.products;
          this.totalItems = data.total;
        })
        .catch((error) => {
          if (!isCurrent()) return;
          this.products = [];
          this.fetch_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (isCurrent()) this.busy_fetch = false;
        });
    },

    showEditPrice(item) {
      this.instanceProduct = item.product;
      this.selected_item = item;

      this.item_clone = Object.assign({}, item); // Create clone for update temporary values

      this.variant_pricing = item.variant && item.variant.pricing; // Variant pricing mode

      this.busy_save_price = false;
      this.show_price_dialog_pre = false;
      const lifecycleId = this.lifecycle_id;
      this.$nextTick(() => {
        if (this.lifecycle_id !== lifecycleId) return;
        this.show_price_dialog_pre = true;
        this.show_price_dialog = true;
      });
    },

    async savePrice() {
      if (this.busy_save_price || !this.$refs.price_edit) return;
      const lifecycleId = this.lifecycle_id;
      this.busy_save_price = true;
      try {
        await this.$refs.price_edit.setProductPrice();
      } finally {
        if (this.lifecycle_id === lifecycleId) this.busy_save_price = false;
      }
    },

    onUpdatePrice() {
      this.onRefresh();
      this.show_price_dialog = false;
      this.busy_save_price = false;
    },

    //-------------------------------------
    dragleave(event) {
      this.show_valid_drop = false;
      this.show_error_drop = false;
    },
    dragover(event) {
      event.preventDefault();

      // CSV File:
      if (
        Object.values(event.dataTransfer.items).some((i) => {
          return i.type.includes("application/vnd") || i.type.includes("csv"); // text/csv
        })
      ) {
        this.show_valid_drop = true;
      } else {
        this.show_error_drop = true;
      }

      // Default file drop:
    },

    drop(event) {
      event.preventDefault();

      if (!this.show_valid_drop) {
        this.show_valid_drop = false;
        this.show_error_drop = false;
        return;
      }

      this.show_valid_drop = false;
      this.show_error_drop = false;

      const files = event.dataTransfer.files;

      // CSV files:

      if (files.length) {
        const file = files[0];

        // 🔹Save the temporary data:
        TemporaryDataHelper.Set(this, { file: file, converted_file: false });

        // Go to inventory import page:
        this.$router.push({
          name: "InventoryImporter",
          //  params: {file: file,},
        });
      }
    },

    //-------------------------------------

    toggleGroup() {
      this.group_mode =
        this.group_mode === true
          ? false
          : this.group_mode === false
            ? "auto"
            : true;
    },

    showBulkPrice() {
      this.show_bulk_price = true;
    },

    showBulkDiscount() {
      this.show_bulk_discount = true;
    },

    isChanged(item) {
      return this.canEditStock(item) && this.validStock(item) && this.stockTarget(item) !== Number(item.quantity);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-inventory-list__price-dialog {
  > .v-card-title { padding: 18px 24px; font-size: 18px; font-weight: 600; line-height: 1.4; background: rgb(var(--v-theme-surface)); border-block-end: 1px solid var(--sd-modern-border); }
  > .v-card-text { padding: 24px; }
  > .v-card-actions { padding: 12px 24px; background: rgb(var(--v-theme-surface)); border-block-start: 1px solid var(--sd-modern-border); }
}

.b-inventory-list--modern {
  min-width: 0;
  font-size: 12px;

  .b-inventory-list__toolbar {
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
    padding: 14px 18px;
    border-block-end: 1px solid var(--sd-modern-border);

    > .v-divider { height: 20px; align-self: center; }
    > .v-spacer { min-width: 6px; }

    > .sd-modern-button {
      color: var(--sd-modern-muted);
      padding-inline: 9px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;

      :deep(> .v-btn__content) { gap: 7px; font: inherit; letter-spacing: 0; }
    }
  }

  .b-inventory-list__filter { flex: 0 1 190px; min-width: 150px; }
  .b-inventory-list__search { flex: 0 1 225px; min-width: 180px; }

  .b-inventory-list__filter,
  .b-inventory-list__search {
    :deep(.v-field__input) { min-height: 34px; padding-block: 0; font-size: 12px; line-height: 1.45; }
    :deep(.v-field__prepend-inner),
    :deep(.v-field__append-inner) { padding-block-start: 5px; }
    :deep(.v-label) { font-size: 12px; line-height: 1.45; }
    :deep(.v-chip) { font-size: 11px; }
    :deep(.v-field__prepend-inner) { align-items: center; padding-block: 0; margin-inline-end: 8px; color: var(--sd-modern-muted); }
    :deep(.v-field__append-inner) { align-items: center; padding-block: 0; }
  }

  .b-inventory-list__scan { min-width: 32px; width: 32px; height: 32px; color: var(--sd-modern-muted); }
  .b-inventory-list__filter :deep(.v-field__input > input) { height: 34px; min-height: 34px; }
  .b-inventory-list__sort-pair { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
  .b-inventory-list__sort-pair > button + button::before { content: '/'; margin-inline-end: 5px; color: var(--sd-modern-muted); }
  .b-inventory-list__sort { display: inline-flex; align-items: center; gap: 3px; padding: 0; color: inherit; font: inherit; background: transparent; border: 0; }
  .b-inventory-list__sort[aria-pressed='true'] { color: rgb(var(--v-theme-primary)); }
  .b-inventory-list__sort-icon { width: 12px; height: 12px; }
  .b-inventory-list__sort:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; border-radius: 2px; }

  .b-inventory-list__table {
    min-height: 300px;

    :deep(.v-table__wrapper > table > tbody > tr > td) { font-size: 12px; }
    :deep(.v-table__wrapper > table > thead > tr > th) { padding-inline: 10px; }
    :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
    :deep(.v-table__wrapper > table > thead > tr > th:first-child) { padding-inline-start: 18px; }
    :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
    :deep(.v-table__wrapper > table > thead > tr > th:last-child) { padding-inline-end: 18px; }
    :deep(.v-data-table__td-value) { min-width: 0; }
  }

  .b-inventory-list__image { padding-block: 0; }
  .b-inventory-list__product { display: flex; align-items: center; gap: 10px; min-width: 180px; max-width: 250px; }
  .b-inventory-list__product-link { flex: 0 0 auto; }
  .b-inventory-list__avatar { background: rgba(var(--v-theme-on-surface), 0.035); border-radius: 10px !important; }
  .b-inventory-list__product-copy { flex: 1; min-width: 0; }
  .b-inventory-list__product-name { font-size: 12px; font-weight: 500; line-height: 1.45; white-space: normal; overflow-wrap: anywhere; }
  .b-inventory-list__secondary { font-size: 11px; font-weight: 400; line-height: 1.45; color: var(--sd-modern-muted); }
  .b-inventory-list__identifier { font-size: 11px; font-weight: 400; line-height: 1.45; overflow-wrap: anywhere; }
  .b-inventory-list__identifiers { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
  .b-inventory-list__identifiers > .b-inventory-list__identifier:first-child { font-size: 12px; }
  .b-inventory-list__status-stack { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
  .b-inventory-list__original { display: inline-flex; align-items: center; gap: 5px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 1.45; }
  .b-inventory-list__status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 400; white-space: nowrap; }
  .b-inventory-list__status .sd-modern-status__dot { width: 5px; height: 5px; margin: 0; }
  .b-inventory-list__stock { min-width: 62px; font-size: 12px; font-weight: 400; text-align: end; font-variant-numeric: tabular-nums; }
  .b-inventory-list__stock .highlight-value { font-weight: 400; background: transparent; color: rgb(var(--v-theme-primary)); }

  .b-inventory-list__price {
    display: inline-flex;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
    width: 100%;
    min-height: 32px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 12px;
    text-align: end;
    white-space: nowrap;

    &:hover,
    &.-focus { color: rgb(var(--v-theme-primary)); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
    > .v-icon { color: var(--sd-modern-muted); }
    :deep(.u--price) { font-size: 12px; font-weight: 400; }
    :deep(.u--price .small) { font-size: 12px !important; font-weight: 400; }
  }

  .b-inventory-list__quantity-editor { min-width: 206px; }
  .b-inventory-list__quantity-field {
    width: 206px;
    max-width: 100%;
    margin: 0;

    :deep(.v-field) { --v-field-padding-start: 0; --v-field-padding-end: 0; padding: 0; align-items: center; }
    :deep(.v-field__field) { min-width: 34px; }
    :deep(.v-field__input) { min-height: 34px; height: 34px; padding: 0 3px; text-align: center; font-size: 12px; font-weight: 400; line-height: 1.45; }
    :deep(.v-field__prepend-inner),
    :deep(.v-field__append-inner) { padding: 0; align-self: center; }
    :deep(.v-field__append-inner) { padding-inline-start: 4px; }
  }

  .b-inventory-list__quantity-mode {
    height: 32px;
    padding: 3px;
    gap: 3px;
    background: rgba(var(--v-theme-on-surface), 0.035);
    border-radius: 8px !important;

    > .v-btn { min-width: 34px; height: 26px; padding: 0 6px; border-radius: 5px !important; font-family: inherit; font-size: 10px; font-weight: 500; letter-spacing: 0; text-indent: 0; text-transform: none; background: transparent; box-shadow: none; color: var(--sd-modern-muted); }
    > .b-inventory-list__quantity-mode-selected { background: rgb(var(--v-theme-surface)) !important; color: rgb(var(--v-theme-on-surface)); box-shadow: 0 1px 3px rgba(var(--v-theme-on-surface), 0.13); }
    > .b-inventory-list__quantity-mode-selected :deep(.v-btn__overlay) { opacity: 0; }
  }

  .b-inventory-list__save { min-width: 42px; padding-inline: 5px; font-size: 11px; }
  .b-inventory-list__save.v-btn--disabled { background: transparent !important; box-shadow: none; border-color: transparent; }
  .b-inventory-list__save.v-btn--disabled :deep(.v-btn__overlay) { opacity: 0; }

  .b-inventory-list__table :deep(td.b-inventory-list__merged-cell) { display: none; }
  .b-inventory-list__table :deep(.b-inventory-list-group--modern > td) { padding: 0 !important; padding-block: 0 !important; }
  .b-inventory-list__table :deep(td.b-inventory-list__branch-cell) { position: relative; padding: 0 !important; width: 44px; }
  .b-inventory-list__table :deep(.b-inventory-list__child > td.b-inventory-list__branch-cell::before),
  .b-inventory-list__table :deep(.b-inventory-list__child > td.b-inventory-list__branch-cell::after) {
    content: '';
    position: absolute;
    inset-inline-start: 26px;
    pointer-events: none;
  }
  .b-inventory-list__table :deep(.b-inventory-list__child > td.b-inventory-list__branch-cell::before) { inset-block: 0; border-inline-start: 1px solid rgba(var(--v-theme-on-surface), 0.2); }
  .b-inventory-list__table :deep(.b-inventory-list__child > td.b-inventory-list__branch-cell::after) { inset-block-start: 50%; width: 18px; border-block-start: 1px solid rgba(var(--v-theme-on-surface), 0.2); }
  .b-inventory-list__table :deep(.b-inventory-list__child:last-child > td.b-inventory-list__branch-cell::before),
  .b-inventory-list__table :deep(.b-inventory-list__child:has(+ .b-inventory-list-group--modern) > td.b-inventory-list__branch-cell::before) { inset-block-end: 50%; }
  .b-inventory-list__table :deep(.b-inventory-list-group--modern:has(+ .b-inventory-list__child) > td) { position: relative; }
  .b-inventory-list__table :deep(.b-inventory-list-group--modern:has(+ .b-inventory-list__child) > td::after) { content: ''; position: absolute; inset-inline-start: 26px; inset-block-start: calc(50% + 12px); inset-block-end: 0; border-inline-start: 1px solid rgba(var(--v-theme-on-surface), 0.2); pointer-events: none; }
  .b-inventory-list__footer { padding: 14px 18px; }
  .sd-modern-empty-state h3 { margin: 0; font-size: 14px; font-weight: 500; }
  .sd-modern-empty-state p { margin: 0; font-size: 13px; color: var(--sd-modern-muted); }

  @media (max-width: 1199px) {
    .b-inventory-list__toolbar { gap: 8px; padding: 12px 14px; }
    .b-inventory-list__toolbar > .v-spacer { flex-basis: 100%; height: 0; }
    .b-inventory-list__filter,
    .b-inventory-list__search { flex: 1 1 180px; min-width: 0; }
    .b-inventory-list__product { max-width: none; width: 100%; min-width: 0; }
    .b-inventory-list__product-name { font-size: 14px; }
    .b-inventory-list__quantity-editor { width: 100%; min-width: 0; }
    .b-inventory-list__quantity-field { width: 100%; min-width: 0; }
    .b-inventory-list__quantity-mode { height: 50px; }
    .b-inventory-list__quantity-mode > .v-btn { min-width: 44px; height: 44px; font-size: 11px; }
    .b-inventory-list__quantity-field :deep(.v-field__input) { min-height: 44px; height: 44px; font-size: 16px; }
    .b-inventory-list__save { min-height: 44px; min-width: 44px; font-size: 12px; }
    .b-inventory-list__scan { width: 44px; height: 44px; }
    .b-inventory-list__price { min-height: 44px; }
    .b-inventory-list__table :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) { padding-inline: 14px; grid-template-columns: minmax(60px, .45fr) minmax(0, 1.55fr); gap: 12px; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile > td:last-child) { display: block; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile > td:last-child > .v-data-table__td-title) { display: block; margin-block-end: 8px; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile > td:last-child > .v-data-table__td-value) { display: block; width: 100%; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile > td:last-child > .v-data-table__td-title:empty) { display: none; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile > td.b-inventory-list__branch-cell) { display: none; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child > td) { position: relative; padding-inline-start: 36px !important; padding-inline-end: 14px !important; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child > td::before),
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child > td:nth-child(2)::after) { content: ''; position: absolute; inset-inline-start: 22px; pointer-events: none; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child > td::before) { inset-block: 0; border-inline-start: 1px solid rgba(var(--v-theme-on-surface), 0.2); }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child > td:nth-child(2)::after) { inset-block-start: 50%; width: 10px; border-block-start: 1px solid rgba(var(--v-theme-on-surface), 0.2); }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child:last-child > td::before),
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child:has(+ .b-inventory-list-group--modern) > td::before) { display: none; }
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child:last-child > td:nth-child(2)::before),
    .b-inventory-list__table :deep(.v-data-table__tr--mobile.b-inventory-list__child:has(+ .b-inventory-list-group--modern) > td:nth-child(2)::before) { display: block; inset-block-end: 50%; }
    .b-inventory-list__table :deep(.b-inventory-list-group--modern:has(+ .b-inventory-list__child) > td::after) { inset-inline-start: 22px; }
  }

  @media (pointer: coarse) {
    .b-inventory-list__quantity-mode { height: 50px; }
    .b-inventory-list__quantity-mode > .v-btn { height: 44px; min-width: 44px; }
    .b-inventory-list__save,
    .b-inventory-list__price { min-height: 44px; }
  }
}

.search-inline {
  display: inline-block;
  margin-right: 16px;
}

.b-inventory-list--wholesale {
  font-size: 13px;
  line-height: 20px;

  .b-inventory-list__toolbar {
    gap: 8px;
    padding: 14px 18px;
    > .v-spacer { flex-basis: 0; }
    > .sd-modern-button { padding-inline: 8px; font-size: 13px; font-weight: 400; }
  }
  .b-inventory-list__group-select { flex: 0 1 126px; min-width: 100px; }
  .b-inventory-list__search { flex: 1 1 194px; min-width: 170px; order: 1; }
  .b-inventory-list__filter { flex: 0 1 142px; min-width: 125px; order: 2; }
  .b-inventory-list__flat-sort { flex: 0 1 125px; min-width: 110px; order: 3; }
  .b-inventory-list__reverse { order: 4; }
  .b-inventory-list__group-select,
  .b-inventory-list__flat-sort,
  .b-inventory-list__filter,
  .b-inventory-list__search {
    :deep(.v-field__input) { min-height: 36px; padding-block: 0; font-size: 13px; line-height: 20px; }
    :deep(.v-field__input > input) { min-height: 36px; height: 36px; }
    :deep(.v-field__prepend-inner),
    :deep(.v-field__append-inner) { align-items: center; padding-block: 0; }
    :deep(.v-label) { font-size: 13px; line-height: 20px; }
  }
  .b-inventory-list__scan { min-width: 32px; width: 32px; height: 32px; }
  .b-inventory-list__scope {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    padding: 10px 18px;
    border-block-end: 1px solid var(--sd-modern-border);
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
  }
  .b-inventory-list__import { margin-inline-start: auto; }
  .b-inventory-list__table {
    min-height: 0;
    :deep(.v-table__wrapper) { overflow: visible; }
    :deep(.v-table__wrapper > table) { table-layout: fixed; width: 100%; }
    :deep(.v-table__wrapper > table > tbody > tr > td) { padding: 15px 8px; font-size: 13px; line-height: 20px; }
    :deep(.v-table__wrapper > table > thead > tr > th) { padding-inline: 8px; }
    :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
    :deep(.v-table__wrapper > table > thead > tr > th:first-child) { padding-inline-start: 18px; }
    :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
    :deep(.v-table__wrapper > table > thead > tr > th:last-child) { padding-inline-end: 18px; }
  }
  .b-inventory-list__product { align-items: flex-start; min-width: 0; max-width: none; }
  .b-inventory-list__product-name { color: inherit; font-size: 13px; font-weight: 500; line-height: 20px; text-decoration: none; }
  a.b-inventory-list__product-name:hover { color: rgb(var(--v-theme-primary)); }
  a.b-inventory-list__product-name:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  .b-inventory-list__secondary { font-size: 11px; line-height: 17px; }
  .b-inventory-list__copy { display: block; max-width: 100%; padding: 0; border: 0; background: transparent; text-align: start; letter-spacing: normal; text-transform: none; overflow-wrap: anywhere; }
  .b-inventory-list__copy:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 2px; }
  .b-inventory-list__identifiers { align-items: flex-start; }
  .b-inventory-list__status { font-size: 12px; line-height: 18px; white-space: normal; text-align: start; }
  .b-inventory-list__stock { min-width: 0; font-size: 15px; font-weight: 500; line-height: 22px; }
  .b-inventory-list__stock > span { display: block; color: rgb(var(--v-theme-primary)); font-size: 11px; font-weight: 400; line-height: 17px; white-space: nowrap; }
  .b-inventory-list__stock > span > i { margin-inline: 3px !important; }
  .b-inventory-list__price {
    min-height: 36px;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    :deep(.u--price),
    :deep(.u--price .small) { font-size: 14px !important; font-weight: 500; }
  }
  .b-inventory-list__quantity-editor { width: 100%; min-width: 0; }
  .b-inventory-list__quantity-field {
    width: 100%;
    min-width: 0;
    :deep(.v-field__input) { min-height: 36px; height: 36px; font-size: 13px; line-height: 20px; }
  }
  .b-inventory-list__quantity-mode {
    height: 34px;
    > .v-btn { min-width: 28px; height: 28px; padding-inline: 6px; font-size: 11px; font-weight: 400; }
    > .b-inventory-list__quantity-mode-selected :deep(.v-btn__overlay) { opacity: 0 !important; }
  }
  .b-inventory-list__save { min-width: 62px; min-height: 32px; padding-inline: 6px; font-size: 12px; font-weight: 400; white-space: nowrap; }
  .b-inventory-list__save :deep(.v-btn__content) { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
  .b-inventory-list__save :deep(.v-icon--start) { margin-inline: 0; }
  .b-inventory-list__stock-feedback { display: flex; align-items: flex-start; gap: 5px; min-height: 17px; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; text-align: start; }
  .b-inventory-list__stock-feedback > .v-icon { flex-shrink: 0; margin-block-start: 2px; }
  .b-inventory-list__footer { gap: 8px; padding: 14px 18px; }

  @media (max-width: 1080px) {
    .b-inventory-list__toolbar > .v-spacer { flex-basis: 100%; height: 0; }
    .b-inventory-list__search { flex-grow: 1; }
  }
  @media (max-width: 800px) {
    .b-inventory-list__toolbar { padding: 12px 14px; }
    .b-inventory-list__group-select { flex-grow: 1; }
    .b-inventory-list__search { flex-basis: 100%; }
    .b-inventory-list__filter { flex: 1 1 calc((100% - 60px) / 2); min-width: 0; }
    .b-inventory-list__flat-sort { flex: 1 1 calc((100% - 60px) / 2); min-width: 0; }
    .b-inventory-list__scope { padding-inline: 14px; }
    .b-inventory-list__table {
      :deep(.v-data-table__tr--mobile) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 15px 18px; padding: 18px 14px; border-block-end: 1px solid var(--sd-modern-border); }
      :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) { display: block; width: auto !important; min-height: 0; padding: 0 !important; border: 0; text-align: start !important; }
      :deep(.v-data-table__tr--mobile > td:first-child),
      :deep(.v-data-table__tr--mobile > td:last-child),
      :deep(.v-data-table__tr--mobile > td:has(.b-inventory-list__product)) { grid-column: 1 / -1; }
      :deep(.v-data-table__tr--mobile > td > .v-data-table__td-title) { display: block; margin-block-end: 5px; text-align: start; }
      :deep(.v-data-table__tr--mobile > td:first-child > .v-data-table__td-title) { display: none; }
      :deep(.v-data-table__tr--mobile > td > .v-data-table__td-value) { display: block; width: 100%; text-align: start; }
      :deep(.v-data-table__tr--mobile > td.b-inventory-list__branch-cell) { display: none; }
      :deep(.v-data-table__tr--mobile.b-inventory-list__child > td::before),
      :deep(.v-data-table__tr--mobile.b-inventory-list__child > td::after) { display: none !important; }
    }
    .b-inventory-list__stock { text-align: start; }
    .b-inventory-list__price { width: auto; justify-content: flex-start; }
    .b-inventory-list__footer { flex-wrap: wrap; padding-inline: 14px; }
  }
  @media (max-width: 799px), (pointer: coarse) {
    .b-inventory-list__quantity-mode { height: 50px; }
    .b-inventory-list__quantity-mode > .v-btn { min-width: 44px; height: 44px; }
    .b-inventory-list__save,
    .b-inventory-list__price { min-height: 44px; min-width: 44px; }
    .b-inventory-list__save { min-width: 68px; height: 44px; }
    .b-inventory-list__scan { width: 44px; height: 44px; min-width: 44px; }
    .b-inventory-list__quantity-field :deep(.v-field__input),
    .b-inventory-list__group-select :deep(.v-field__input),
    .b-inventory-list__flat-sort :deep(.v-field__input),
    .b-inventory-list__filter :deep(.v-field__input),
    .b-inventory-list__search :deep(.v-field__input) { min-height: 44px; height: 44px; font-size: 16px; }
  }
}

.b-inventory-list__price-dialog {
  > .v-card-title { font-weight: 500; line-height: 26px; }
}

.b-inventory-list__price-dialog--wholesale {
  font-size: 14px;
  line-height: 22px;

  > .v-card-title { gap: 12px; padding: 18px 24px; white-space: normal; }
  > .v-card-text { padding: 24px; }
  > .v-card-actions { padding: 16px 24px; }

  .b-inventory-list__price-identity { flex: 1; min-width: 0; }
  .b-inventory-list__price-identity h2 { margin: 0; font-size: 20px; font-weight: 500; line-height: 27px; }
  .b-inventory-list__price-context { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 19px; overflow-wrap: anywhere; }
  .b-inventory-list__price-context :deep(.product-variant-card-micro) { flex-wrap: wrap; padding: 0; font-size: inherit; font-weight: inherit; }
  .b-inventory-list__price-context :deep(.card-badge-info) { color: inherit; font-size: inherit; font-weight: inherit; }
  .b-inventory-list__price-consequence { display: flex; align-items: flex-start; gap: 8px; max-width: 760px; margin: 18px auto 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-inventory-list__price-consequence > .v-icon { flex-shrink: 0; margin-block-start: 2px; }
  .b-inventory-list__price-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; width: 100%; max-width: 760px; margin-inline: auto; }
  .b-inventory-list__price-actions > .sd-modern-button { flex: 0 1 auto; margin: 0; font-size: 13px; font-weight: 500; line-height: 20px; }
}

.price-btn {
  cursor: pointer;
  transition: all 0.45s;

  &.-focus,
  &:hover {
    background-color: #00796b;
    color: #fff;
  }
}

::v-deep(.row-hover) {
  &.close {
    display: none;
  }

  &.open {
  }
}

::v-deep(.is-open) {
  background: #222;
  color: #fff;
  transition: all 0.3s;
}
</style>

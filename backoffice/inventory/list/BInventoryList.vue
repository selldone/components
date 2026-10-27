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
    class="b-inventory-list text-start"
    :class="{ 'b-inventory-list--modern': modern }"
    @dragover="dragover"
  >
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!---------------------------- Filter ----------------------->

    <v-row no-gutters :class="{ 'b-inventory-list__toolbar': modern }">
      <v-btn :icon="!modern" :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--quiet': modern }" variant="text" @click="showBulkPrice">
        <b-inventory-list-icon v-if="modern" name="wand-sparkles" />
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
        <b-inventory-list-icon v-if="modern" name="tag" />
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

      <v-divider class="my-0 mx-2" vertical></v-divider>

      <v-btn :icon="!modern" :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--quiet': modern }" variant="text" @click="toggleGroup()">
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
          <b-inventory-list-icon name="search" />
        </template>
        <template v-if="modern" v-slot:append-inner>
          <v-btn
            class="b-inventory-list__scan"
            icon
            variant="text"
            :aria-label="$t('inventory_list.scan_product')"
            @click.stop="$refs.inventory_search.showQRScanner()"
          >
            <b-inventory-list-icon name="scan-line" />
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('inventory_list.scan_product') }}</v-tooltip>
          </v-btn>
        </template>
      </s-storefront-search-box>
    </v-row>

    <!---------------------------- List ----------------------->
    <v-data-table-server
      :mobile="isMobile"
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
      <template v-if="modern" v-slot:header.sku="{ toggleSort, isSorted }">
        <span class="b-inventory-list__sort-pair">
          <button v-for="key in ['sku', 'mpn']" :key="key" type="button" class="b-inventory-list__sort"
            :aria-label="`${$t('global.commons.sort_by')} ${$t(`inventory_list.table.${key}`)}`"
            :aria-pressed="isSorted({ key })" @click.stop="toggleSort({ key })" @keydown.stop>
            {{ $t(`inventory_list.table.${key}`) }}
            <b-inventory-list-icon v-if="isSorted({ key })" :name="sortBy.find(sort => sort.key === key)?.order === 'asc' ? 'arrow-up' : 'arrow-down'" class="b-inventory-list__sort-icon" />
          </button>
        </span>
      </template>
      <template v-if="modern" v-slot:header.status="{ toggleSort, isSorted }">
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
        <div v-if="modern && !busy_fetch" class="sd-modern-empty-state">
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
            <v-avatar :size="isMobile ? 40 : 44" rounded="lg" class="b-inventory-list__avatar hover-scale-small">
              <v-img :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL) || getProductTypeImage(item.type)" :alt="item.title" cover>
                <template v-slot:error><v-img :src="getProductTypeImage(item.type)" :alt="item.title" /></template>
              </v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('inventory_list.open_product') }}</v-tooltip>
          </router-link>
          <div class="b-inventory-list__product-copy">
            <div class="b-inventory-list__product-name">{{ item.title }}</div>
            <div v-if="item.title_en" class="b-inventory-list__secondary">{{ item.title_en }}</div>
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
          <span v-if="item.sku" v-copy class="b-inventory-list__identifier">{{ item.sku }}</span>
          <span v-else class="b-inventory-list__secondary">—</span>
          <span v-if="item.mpn" v-copy class="b-inventory-list__identifier b-inventory-list__secondary">{{ item.mpn }}</span>
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
          <span v-if="!item.disabled" class="sd-modern-status__dot" :style="{ backgroundColor: item.status === 'Open' ? 'rgb(var(--v-theme-success))' : 'rgb(var(--v-theme-on-surface))' }"></span>
          {{ $t(item.disabled ? 'inventory_list.table.close_state' : ProductStatus[item.status].name) }}
        </span>
        <span v-if="item.original" class="b-inventory-list__original">
          <v-icon size="13" color="success" aria-hidden="true">check</v-icon>
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
            v-if="item.add ? item.number !== 0 : item.quantity !== item.number"
          >
            <i class="fas fa-caret-right mx-2" />
            <span class="highlight-value">{{
              item.add ? item.quantity + item.number : item.number
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

        <div v-else-if="item.type === ProductType.PHYSICAL.code" :class="modern ? 'b-inventory-list__quantity-editor' : 'p-2'">
          <u-number-input
            v-model="item.number"
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
                <v-btn :value="true" :aria-pressed="modern ? item.add === true : undefined" :variant="modern ? 'text' : undefined" :selected-class="modern ? undefined : 'green-flat'" size="small">
                  {{ $t("global.actions.add") }}
                </v-btn>
                <v-btn :value="false" :aria-pressed="modern ? item.add === false : undefined" :variant="modern ? 'text' : undefined" :selected-class="modern ? undefined : 'blue-flat'" size="small">
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
                :disabled="modern ? !isChanged(item) : undefined"
                :color="modern ? (isChanged(item) ? 'primary' : undefined) : isChanged(item) ? '#000' : '#999'"
                :loading="busy_count === item.key"
                :variant="modern ? (isChanged(item) ? 'elevated' : 'text') : isChanged(item) ? 'elevated' : 'plain'"
                rounded="lg"
                :min-height="modern ? (isMobile ? 44 : 32) : $vuetify.display.xs ? 36 : 52"
                @click.stop="updateProductQuantity(item)"
              >
                {{ $t("global.actions.save") }}
              </v-btn>
            </template>
          </u-number-input>
        </div>
        <div v-else>
          <small>{{ $t("inventory_list.cant_set_here") }}</small>
        </div>
      </template>

      <template v-slot:bottom>
        <div :class="{ 'sd-modern-table-footer b-inventory-list__footer': modern }">
          <span v-if="modern" class="b-inventory-list__secondary">{{ $t('global.commons.total') }}: {{ totalItems }}</span>
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
    transition="dialog-bottom-transition"
  >
    <v-card v-if="item_clone && show_price_dialog_pre" class="text-start" :class="{ 'sd-modern-canvas b-inventory-list__price-dialog': modern }">
      <v-card-title class="d-flex align-center">
        <u-avatar-folder
          class="me-2"
          :size="48"
          elevated
          side-icon="shelves"
          placeholder-icon="inventory"
          :src="getShopImagePath(selected_item.icon, IMAGE_SIZE_SMALL)"
          is-gray
          border-size="8"
        >
        </u-avatar-folder>

        <div class="flex-grow-1 overflow-hidden">
          {{ selected_item?.product?.title }}

          <div class="small single-line">
            {{ selected_item?.product?.title_en?.limitWords(12) }}
          </div>
        </div>

        <v-btn
          class="ms-2"
          :class="{ 'sd-modern-icon-button': modern }"
          :aria-label="$t('global.actions.close')"
          icon
          @click="show_price_dialog = false"
          variant="text"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="thin-scroll">
        <b-product-edit-price
          ref="price_edit"
          :customObject="item_clone"
          :instance-object="selected_item"
          :instance-original-product="instanceProduct"
          :instance-product-id="selected_item.id"
          :instance-variant-id="selected_item.variant_id"
          :instance-variant-pricing="variant_pricing"
          :is-marketplace="is_marketplace"
          :shop="shop"
          class="mt-4"
          :class="{ 'sd-modern-form': modern }"
          external-action-buttons
          instance-mode
          light
          transparent
          @update:instance="onUpdatePrice"
        >
        </b-product-edit-price>
      </v-card-text>
      <v-card-actions :class="{ 'sd-modern-form-actions': modern }">
        <div class="widget-buttons">
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
            @click="
              $refs.price_edit.setProductPrice();
              busy_save_price = true;
            "
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
    @update="onRefresh"
  >
  </b-inventory-bulk-price>
  <!-- ====================== Dialog > Bulk discount action ====================== -->
  <b-inventory-bulk-discount
    v-model="show_bulk_discount"
    :shop="shop"
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

      busy_count: false,

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
    isMobile() {
      return this.modern
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
        const columns = [
          { title: this.$t('inventory_list.table.product'), value: 'title', align: 'start', sortable: true },
          { title: this.$t('inventory_list.table.code'), value: 'id', align: 'start', sortable: true },
          { title: `${this.$t('inventory_list.table.sku')} / ${this.$t('inventory_list.table.mpn')}`, value: 'sku', align: 'start', sortable: true },
          { title: `${this.$t('inventory_list.table.status')} / ${this.$t('inventory_list.table.original')}`, value: 'status', align: 'start', sortable: true },
          { title: this.$t('inventory_list.table.in_stock'), value: 'quantity', align: 'end', sortable: true },
          { title: this.$t('global.commons.price'), value: 'price', align: 'end', sortable: true },
          { title: this.$t('inventory_list.table.edit'), value: 'change', align: 'end', sortable: false },
        ];
        // Keep native mobile sorting for the secondary values without repeating their body cells.
        if (this.isMobile) columns.splice(columns.length - 1, 0,
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
      this.items = out;
    },
  },
  created() {},
  methods: {
    onSearch(event) {
      this.search_type = event.search_type;
      this.search = event.search;
      this.page = 1;
      this.fetchData(1);
    },

    onClear() {
      this.search_type = null;
      this.search = null;
      this.fetchData(1);
    },

    onRefresh() {
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchData(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
    },
    //================================= Product Filter ===================================

    updateProductQuantity(item) {
      this.busy_count = item.key;

      let quantity = item.add
        ? parseInt(item.quantity) + parseInt(item.number)
        : parseInt(item.number);

      axios
        .post(
          window.API.POST_PRODUCT_QUANTITY(
            this.$route.params.shop_id,
            item.product_id,
            item.variant ? item.variant.id : null,
          ),
          {
            quantity: quantity,
          },
        )
        .then((response) => {
          if (!response.data.error) {
            NotificationService.showSuccessAlert(
              null,
              this.$t("inventory_list.notifications.save_success"),
            );
            item.quantity = response.data.quantity;

            if (item.add) item.number = 0;
            //item.add = true;
            this.$forceUpdate(); // Update vue component!
          } else {
            NotificationService.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_count = null;
        });
    },
    onFilterChange() {
      this.page = 1;
      this.fetchData(1);
    },

    fetchData(page = 1, sortBy = null, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_ALL_MY_PRODUCTS(this.$route.params.shop_id), {
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
          this.products = data.products;
          this.totalItems = data.total;
        })
        .catch((error) => {})
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    showEditPrice(item) {
      this.instanceProduct = item.product;
      this.selected_item = item;

      this.item_clone = Object.assign({}, item); // Create clone for update temporary values

      this.variant_pricing = item.variant && item.variant.pricing; // Variant pricing mode

      this.busy_save_price = false;
      this.show_price_dialog_pre = false;
      this.$nextTick(() => {
        this.show_price_dialog_pre = true;
        this.show_price_dialog = true;
      });
    },

    onUpdatePrice() {
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchData(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
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
      return !(item.add ? item.number === 0 : item.number === item.quantity);
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

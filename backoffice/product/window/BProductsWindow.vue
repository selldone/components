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
  <!-- ------------------- Products List ------------------- -->
  <div
    :style="{ 'overflow-hidden': inDragState }"
    :class="{
      'b-products-window--modern text-start': modern && !isSpecImport,
      'b-products-window--list': modern && !isSpecImport && !mini,
      'b-products-window--products-only': list_products_only,
      'b-products-window--spec-import text-start': isSpecImport,
    }"
    class="s--backoffice-products-management-view"
    v-bind="$attrs"
    @contextmenu="showMenu($event, null, null)"
  >
    <section v-if="isSpecImport" class="b-products-window__import text-start" :aria-busy="busy_fetch">
      <div class="b-products-window__import-toolbar sd-modern-list-toolbar">
        <v-text-field :model-value="search" class="b-products-window__import-search" :placeholder="$t('add_product.spec_import.search')" :aria-label="$t('add_product.spec_import.search')" variant="plain" single-line hide-details clearable @update:model-value="onImportSearch">
          <template #prepend-inner><b-product-edit-info-icon name="Search" :size="18" /></template>
        </v-text-field>
        <select :value="sort || 'default'" class="b-products-window__import-sort" :aria-label="$t('add_product.spec_import.sort')" @change="sort = $event.target.value === 'default' ? null : $event.target.value; product_page = 1">
          <option v-for="option in importSortOptions" :key="option.value" :value="option.value">{{ option.title }}</option>
        </select>
        <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('add_product.spec_import.filters')" :aria-expanded="importFiltersOpen" @click="importFiltersOpen = !importFiltersOpen"><b-product-edit-info-icon name="SlidersHorizontal" :size="16" /><span v-if="filters.length || only_available || vendor_filter" class="b-products-window__import-filter-dot"></span><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_import.filters') }}</v-tooltip></v-btn>
        <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t(importGrid ? 'add_product.spec_import.list_view' : 'add_product.spec_import.grid_view')" @click="toggleImportView"><b-product-edit-info-icon :name="importGrid ? 'List' : 'LayoutGrid'" :size="16" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t(importGrid ? 'add_product.spec_import.list_view' : 'add_product.spec_import.grid_view') }}</v-tooltip></v-btn>
      </div>
      <div v-show="importFiltersOpen" class="b-products-window__import-filters">
        <div class="b-products-window__import-filter-heading"><h2>{{ $t('add_product.spec_import.filters') }}</h2><v-btn class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" @click="resetImportFilters">{{ $t('add_product.spec_import.clear_filters') }}</v-btn></div>
        <div class="b-products-window__import-availability"><label><input v-model="only_available" type="checkbox" @change="product_page = 1" /><span>{{ $t('add_product.spec_import.available') }}</span></label><v-btn class="sd-modern-info-button sd-modern-icon-button" icon variant="text" :aria-label="$t('add_product.spec_import.available')"><b-product-edit-info-icon name="Info" :size="15" /><v-tooltip activator="parent" location="top" :open-on-click="true" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_import.availability_help') }}</v-tooltip></v-btn></div>
        <div class="b-products-window__import-filter-columns">
          <fieldset><legend>{{ $t('global.commons.product_type') }}</legend><div><label v-for="type in ProductType" :key="type.code"><input v-model="filters" type="checkbox" :value="type.code" @change="onFilterChange" /><img :src="type.image" width="16" height="16" alt="" /><span>{{ $t(type.name) }}</span></label></div></fieldset>
          <fieldset><legend>{{ $t('global.commons.status') }}</legend><div><label v-for="status in ProductStatus" :key="status.code"><input v-model="filters" type="checkbox" :value="status.code" @change="onFilterChange" /><span>{{ $t(status.name) }}</span></label></div></fieldset>
        </div>
        <b-vendor-input v-if="IS_MARKETPLACE && !IS_VENDOR_PANEL" v-model="vendor_filter" :shop="shop" class="b-products-window__import-vendor" :label="$t('global.commons.vendor')" clearable flat hide-details variant="plain" @change="product_page = 1; fetchData()" />
      </div>
      <div class="b-products-window__import-catalog">
        <aside class="b-products-window__import-categories">
          <h2>{{ $t('add_product.spec_import.categories') }}</h2>
          <nav :aria-label="$t('add_product.spec_import.categories')">
            <button type="button" :aria-current="!current_dir_id && !search ? 'location' : undefined" :disabled="busy_fetch" @click="selectFolder(null)"><b-product-edit-info-icon name="Store" :size="16" /><span>{{ $t('global.store') }}</span></button>
            <button v-if="parent_folders" type="button" :disabled="busy_fetch" @click="selectFolder(parent_folders.parent)"><b-product-edit-info-icon name="ChevronLeft" :size="16" class="b-products-window__import-direction" /><span>{{ parent_folders.parent?.title || $t('global.store') }}</span></button>
            <button v-for="category in folders.slice((folder_page - 1) * max_folders_per_page, folder_page * max_folders_per_page)" :key="category.id" type="button" :disabled="busy_fetch" @click="selectFolder(category)"><circle-image v-if="category.icon" :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)" :size="20" class="hover-scale" /><b-product-edit-info-icon v-else name="Folder" :size="16" /><span>{{ category.title }}</span></button>
          </nav>
          <div v-if="folder_pages_count > 1" class="b-products-window__import-category-pager">
            <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="busy_fetch || folder_page <= 1" :aria-label="$t('add_product.spec_import.previous_categories')" @click="folder_page--"><b-product-edit-info-icon name="ChevronLeft" :size="16" class="b-products-window__import-direction" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_import.previous_categories') }}</v-tooltip></v-btn>
            <span><bdi dir="ltr">{{ $t('add_product.spec_import.category_page', { page: folder_page, pages: folder_pages_count }) }}</bdi></span>
            <v-btn class="sd-modern-icon-button" icon variant="text" :disabled="busy_fetch || folder_page >= folder_pages_count" :aria-label="$t('add_product.spec_import.next_categories')" @click="folder_page++"><b-product-edit-info-icon name="ChevronRight" :size="16" class="b-products-window__import-direction" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('add_product.spec_import.next_categories') }}</v-tooltip></v-btn>
          </div>
        </aside>
        <div class="b-products-window__import-products">
          <div ref="breadcrumb_location" class="b-products-window__import-location">
            <nav v-if="search" :aria-label="$t('add_product.spec_import.categories')"><b-product-edit-info-icon name="Search" :size="14" /><span>{{ $t('add_product.spec_import.search_results') }}</span></nav>
            <nav v-else :aria-label="$t('add_product.spec_import.categories')"><template v-for="(crumb, index) in hierarchy_items" :key="index"><b-product-edit-info-icon v-if="index" name="ChevronRight" :size="13" class="b-products-window__import-direction" /><span v-if="crumb.disabled">{{ crumb.text }}</span><button v-else type="button" :disabled="busy_fetch" @click="selectFolder(crumb.to?.query?.dir ? { id: crumb.to.query.dir } : null)">{{ crumb.text }}</button></template></nav>
            <span v-if="!importLoadError" role="status" aria-live="polite">{{ $t('add_product.spec_import.results', { count: products_count }) }}</span>
          </div>
          <div v-if="filters.length || only_available || vendor_filter" class="b-products-window__import-active">
            <span v-for="filter in filters" :key="filter">{{ $t(ProductType[filter]?.name || ProductStatus[filter]?.name) }}</span><span v-if="only_available">{{ $t('add_product.spec_import.available') }}</span><v-btn class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" @click="resetImportFilters">{{ $t('add_product.spec_import.clear_filters') }}</v-btn>
          </div>
          <div v-if="busy_fetch" class="b-products-window__import-skeletons" :class="{ 'b-products-window__import-grid': importGrid }"><v-skeleton-loader v-for="index in max_products_per_page" :key="index" type="list-item-avatar-two-line" /></div>
          <div v-else-if="importLoadError" class="sd-modern-empty-state"><b-product-edit-info-icon name="Info" :size="24" /><h3>{{ $t('add_product.spec_import.load_error') }}</h3><v-btn class="sd-modern-button" variant="outlined" @click="fetchData(true)">{{ $t('add_product.spec_import.retry') }}</v-btn></div>
          <div v-else-if="!products.length" class="sd-modern-empty-state"><b-product-edit-info-icon name="Search" :size="24" /><h3>{{ $t('add_product.spec_import.empty_title') }}</h3><p>{{ $t('add_product.spec_import.empty_help') }}</p><div class="sd-modern-actions justify-center"><v-btn v-if="search" class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" @click="onImportSearch(null)">{{ $t('add_product.spec_import.clear_search') }}</v-btn><v-btn v-if="filters.length || only_available || vendor_filter" class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" @click="resetImportFilters">{{ $t('add_product.spec_import.clear_filters') }}</v-btn></div></div>
          <div v-else class="b-products-window__import-list" :class="{ 'b-products-window__import-grid': importGrid }">
            <div v-for="product in products" :key="product.id" class="b-products-window__import-product-wrapper">
              <button ref="importProduct" type="button" :data-product-id="product.id" class="b-products-window__import-product sd-modern-clickable-item" :aria-pressed="selectMode && isSelected(product.id)" :aria-label="$t('add_product.spec_import.source_action', { name: product.title })" @click="selectImportProduct(product)">
                <circle-image v-if="product.icon" :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)" :size="44" class="b-products-window__import-image hover-scale" />
                <span v-else class="b-products-window__import-image b-products-window__import-fallback"><img :src="ProductType[product.type]?.image" width="24" height="24" alt="" /></span>
                <span class="b-products-window__import-product-copy"><span class="b-products-window__import-product-name">{{ product.title }}</span><span v-if="product.title_en" class="b-products-window__import-product-subtitle">{{ product.title_en }}</span><span class="b-products-window__import-meta"><span class="b-products-window__import-type"><img :src="ProductType[product.type]?.image" width="14" height="14" alt="" />{{ $t(ProductType[product.type]?.name) }}</span><span aria-hidden="true">·</span><span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="importStatusClass(product.status)"></span>{{ $t(ProductStatus[product.status]?.name) }}</span><span aria-hidden="true">·</span><bdi dir="ltr">P{{ product.id }}</bdi></span></span>
                <b-product-edit-info-icon name="ChevronRight" :size="14" class="b-products-window__import-arrow b-products-window__import-direction" />
              </button>
            </div>
          </div>
          <footer v-if="!importLoadError" class="b-products-window__import-pagination sd-modern-table-footer"><span>{{ $t('add_product.spec_import.page_summary', { start: products_count ? (product_page - 1) * max_products_per_page + 1 : 0, end: Math.min(product_page * max_products_per_page, products_count), total: products_count }) }}</span><v-pagination v-model="product_page" class="sd-modern-pagination" :length="Math.max(1, product_pages_count)" :total-visible="$vuetify.display.xs ? 3 : 5" :disabled="busy_fetch || !products_count" /></footer>
        </div>
      </div>
    </section>
    <template v-else>
    <div class="b-products-window__catalog" :class="{ 'sd-modern-widget': modern }">
    <!-- ⬬⬬⬬⬬ Breadcrumbs ⬬⬬⬬⬬ -->

    <div v-if="!modern" class="b-products-window__location">
    <u-breadcrumb
      v-intersect="
        (isIntersecting, entries, observer) => {
          fixed = !isIntersecting;
        }
      "
      :hierarchy-items="hierarchy_items"
      :replace="dialogMode"
    />
    </div>

    <!-- ██████████████████ Clone Product ██████████████████ -->
    <v-slide-y-transition hide-on-leave>
      <u-drop
        v-if="current_dragged_product"
        :class="{
          'drop-safe': inDragState,

          'now-drop-enter': dragOverClone,
        }"
        class="clone-area shadow-small"
        @dragenter="onDropEnterDuplicate()"
        @dragleave="onDropLeaveDuplicate()"
        @drop="(data) => handleDropInDuplicate(data)"
      >
        <u-button-circle
          :tooltip="$t('global.actions.copy')"
          class="center"
          color="#fff"
          icon="fa:fas fa-copy"
        />
      </u-drop>
    </v-slide-y-transition>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!-- ██████████████████ Top Helper Container ██████████████████ -->
    <v-slide-y-transition hide-on-leave>
      <u-drop
        v-if="
          current_dragged_product ||
          current_dragged_folder ||
          held_folders.length ||
          held_items.length
        "
        :class="{ focus: dragOverHolder, 'fixed slideInDown': fixed }"
        class="top-drop-container"
        @dragenter="show_spirit_container ? undefined : onDropEnterHolder()"
        @dragleave="show_spirit_container ? undefined : onDropLeaveHolder()"
        @drop="(data) => handleDropInHolder(data)"
      >
        <!-- Holder zone -->

        <!-- ⬬⬬⬬⬬ ▓▓▓▓▓▓▓▓▓ HOLDER > Folders ▓▓▓▓▓▓▓▓▓ ⬬⬬⬬⬬ -->

        <div
          v-for="category in held_folders"
          :key="'f' + category.id"
          class="item"
        >
          <u-drag
            :drag-image-html="
              $t('products_select.move_category', {
                category: category.title.limitWords(2),
              })
            "
            :drag-image-src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
            :draggable="draggable"
            :transfer-data="{ category: category }"
            drag-image-color="#FFA000"
            @drag="onDragStart({ category: category }, true, ...arguments)"
            @dragend="onDragEnd"
          >
            <circle-image
              v-if="category.icon"
              :size="60"
              :src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
              class="hover-scale-tiny folder"
            />
            <circle-image
              v-else
              :size="60"
              class="hover-scale-tiny"
              icon="fa:fas fa-shapes"
            />
          </u-drag>
        </div>

        <!-- ⬬⬬⬬⬬ ▓▓▓▓▓▓▓▓▓ HOLDER > Products ▓▓▓▓▓▓▓▓▓ ⬬⬬⬬⬬ -->

        <div v-for="product in held_items" :key="'p' + product.id" class="item">
          <u-drag
            :drag-image-html="
              $t('products_select.move_product', {
                category: product.title.limitWords(2),
              })
            "
            :drag-image-src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
            :draggable="draggable"
            :transfer-data="{ product: product }"
            @drag="onDragStart({ product: product }, true, ...arguments)"
            @dragend="onDragEnd"
          >
            <circle-image
              v-if="product.icon"
              :size="60"
              :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
              class="hover-scale-tiny"
            />
            <circle-image
              v-else
              :size="60"
              class="hover-scale-tiny"
              icon="fa:fas fa-box"
            />
          </u-drag>
        </div>
      </u-drop>
    </v-slide-y-transition>

    <!-- ██████████████████ Sort tools ██████████████████ -->
    <v-row no-gutters id="sort_tools">
      <s-products-sort-view
        v-model="sort"
        v-model:only-available="only_available"
        :modern="modern"
        :loading="busy_fetch"
        class="w-100"
        :class="{ 'b-products-window__sort sd-modern-list-toolbar': modern }"
        has-search
        @update:search="
          (val) => {
            search = val;
            product_page = 1;
            fetchData();
          }
        "
      >
        <v-btn
          icon
          :title="modern ? undefined : 'Change view mode'"
          :aria-label="modern ? $t('products_select.modern.change_view') : undefined"
          :class="{ 'sd-modern-icon-button b-products-window__view-button': modern }"
          variant="text"
          @click="toggleViewMode"
        >
          <v-icon>{{ mini ? "folder" : modern ? "view_list" : "view_comfy" }}</v-icon>
          <v-tooltip
            v-if="modern"
            activator="parent"
            content-class="sd-modern-tooltip text-start"
            location="top"
          >{{ $t('products_select.modern.change_view') }}</v-tooltip>
        </v-btn>

        <div v-if="modern" class="b-products-window__toolbar-break"></div>
        <v-spacer></v-spacer>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Filter by Status & Types ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <b-inventory-filter
          v-model="filters"
          :shop="shop"
          class="min-width-200"
          :class="{ 'b-products-window__inventory-filter': modern }"
          :modern="modern"
          dense
          flat
          :variant="modern ? 'plain' : 'solo'"
          @change="onFilterChange"
        >
        </b-inventory-filter>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Filter by vendor ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
        <b-vendor-input
          v-if="IS_MARKETPLACE && !IS_VENDOR_PANEL && $vuetify.display.mdAndUp"
          v-model="vendor_filter"
          :shop="shop"
          class="max-w-300 min-width-200"
          :class="{ 'b-products-window__vendor-filter': modern }"
          dense
          flat
          hide-details
          clearable
          prepend-inner-icon="storefront"
          :variant="modern ? 'plain' : 'solo'"
          @change="fetchData()"
        ></b-vendor-input>
      </s-products-sort-view>
    </v-row>
    <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Filter by vendor ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
    <b-vendor-input
      v-if="IS_MARKETPLACE && !IS_VENDOR_PANEL && !$vuetify.display.mdAndUp"
      v-model="vendor_filter"
      :shop="shop"
      dense
      flat
      clearable
      hide-details
      prepend-inner-icon="storefront"
      :variant="modern ? 'plain' : 'solo'"
      @change="fetchData()"
    ></b-vendor-input>

    <!-- ██████████████████ 🞧 Extra objects return by special search ██████████████████ -->

    <v-expand-transition>
      <div v-if="tax_profile">
        <div class="d-flex align-center pa-2 text-start">
          <img
            class="me-1"
            height="16"
            src="../../../assets/icons/tax-3d.svg"
            width="16"
          />
          <small>{{ $t("global.commons.tax") }} </small>
          <v-icon>{{ $t("icons.chevron_next") }}</v-icon>
          <b-tax-profile-box
            :profile="tax_profile"
            :shop="shop"
          ></b-tax-profile-box>
        </div>
      </div>
    </v-expand-transition>
    <v-expand-transition>
      <div v-if="valuation_filter">
        <div class="d-flex align-center pa-2 text-start">
          <img
            class="me-1"
            height="16"
            src="../../../assets/icons/valuation.svg"
            width="16"
          />
          <small>{{ $t("global.commons.valuation") }} </small>
          <v-icon>{{ $t("icons.chevron_next") }}</v-icon>
          {{ valuation_filter.title }}

          <v-chip
            v-for="it in valuation_filter.structure"
            :key="it.id"
            class="ma-1 pa-1"
            label
            size="x-small"
            >{{ it.title }}
          </v-chip>
        </div>
      </div>
    </v-expand-transition>
    <v-expand-transition>
      <u-fade-scroll v-if="time_filter">
        <div class="d-flex align-center pa-2 text-start">
          <v-icon class="me-1" color="#111" size="16">date_range</v-icon>
          <small>{{ $t("global.commons.from") }} </small>
          <v-chip
            v-if="time_filter.start"
            class="ma-1 min-width-max-content"
            color="#111"
            size="x-small"
            >{{ getLocalTimeStringSmall(time_filter.start) }} 🞄
            {{ getFromNowString(time_filter.start) }}
          </v-chip>
          <v-chip v-else class="ma-1 pa-1" color="primary" size="x-small"
            >-
          </v-chip>
          <v-icon>{{ $t("icons.chevron_next") }}</v-icon>
          <small>{{ $t("global.commons.to") }} </small>
          <v-chip
            v-if="time_filter.end"
            class="ma-1 min-width-max-content"
            color="#111"
            size="x-small"
            >{{ getLocalTimeStringSmall(time_filter.end) }} 🞄
            {{ getFromNowString(time_filter.end) }}
          </v-chip>
          <v-chip v-else class="ma-1 pa-1" color="primary" size="x-small"
            >{{ $t("global.commons.today") }}
          </v-chip>
        </div>
      </u-fade-scroll>
    </v-expand-transition>

    <div v-if="modern" ref="breadcrumb_location" class="b-products-window__location">
      <u-breadcrumb
        v-intersect="(isIntersecting) => { fixed = !isIntersecting; }"
        :hierarchy-items="hierarchy_items"
        :replace="dialogMode"
        class="b-products-window__breadcrumbs"
      />
      <slot name="breadcrumb-append"></slot>
    </div>

    <!-- ██████████████████ List ██████████████████ -->

    <v-row id="manage-panel" dense>
      <v-fade-transition
        group
        hide-on-leave
        origin="center center"
        :disabled="modern || (busy_fetch && product_page !== 1)"
      >
        <!-- ⬬⬬⬬⬬ ▞▞▞▞▞▞▞▞▞▞▞▞ Spirit Container ▞▞▞▞▞▞▞▞▞▞▞▞ ⬬⬬⬬⬬ -->

        <v-col
          v-if="show_spirit_container"
          key="drop-box"
          class="b-products-window__drop-box"
          cols="12"
          lg="3"
          md="4"
          sm="6"
          xl="3"
        >
          <u-drop
            :class="{
              'drop-safe': inDragState,

              'now-drop-enter':
                current_drop_enter_folder &&
                current_drop_enter_folder.id === current_dir_id,
            }"
            class="spirit-container"
            @dragenter="onDropEnter({ id: current_dir_id })"
            @drop="(data) => handleDropInFolder(data, { id: current_dir_id })"
          >
            <div class="center-absolute text-center">
              <v-icon size="64px"> add</v-icon>
              <div class="my-2 small">
                Drop here if you want to move it to current category.
              </div>
            </div>
          </u-drop>
        </v-col>

        <!-- Presentation groups keep the native drag targets and independent pagers. -->
        <div key="category-list" class="b-products-window__categories b-products-window__list-background">
        <div v-if="modern && !mini" class="b-products-window__list-heading">
          <h2><b-product-window-section-icon kind="category" class="b-products-window__section-icon" />{{ $t('product_panel.workspace.list_view.categories') }} <span>{{ folders.length }}</span></h2>
        </div>
        <div
          v-if="modern && !mini && (folder_pages_count > 1 || product_pages_count > 1)"
          class="b-products-window__list-pagination sd-modern-table-footer"
        >
          <v-pagination
            v-if="folder_pages_count > 1"
            v-model="folder_page"
            :aria-label="$t('product_panel.workspace.list_view.categories')"
            class="sd-modern-pagination"
            :length="folder_pages_count"
            rounded
          />
        </div>

        <!-- ⬬⬬⬬⬬ ▞▞▞▞▞▞▞▞▞▞▞▞ Back Button ▞▞▞▞▞▞▞▞▞▞▞▞ ⬬⬬⬬⬬ -->
        <v-col
          v-if="parent_folders"
          key="back"
          class="b-products-window__back-column"
          :cols="mini ? 4 : 12"
          :lg="mini ? 1 : 3"
          :md="mini ? 2 : 4"
          :sm="mini ? 3 : 6"
          :xl="mini ? 1 : 3"
        >
          <button
            v-if="modern && !mini"
            type="button"
            :disabled="busy_fetch"
            class="b-products-window__back sd-modern-clickable-item"
            @click="selectFolder(parent_folders.parent)"
          >
            <v-icon size="18">{{ $t('icons.chevron_back') }}</v-icon>
            <span>{{ $t('product_panel.workspace.list_view.back_to', { title: parent_folders.parent?.title || $t('global.commons.home') }) }}</span>
          </button>
          <div
            v-else
            :class="{ disabled: busy_fetch, 'h-100': !mini }"
            :title="`Back to ${
              parent_folders.parent ? parent_folders.parent.title : 'Home'
            } | Press 🠨 backspace`"
            class="position-relative d-flex flex-column align-center justify-center hover-up"
            @click="selectFolder(parent_folders.parent)"
          >
            <div class="position-relative">
              <v-icon
                :size="mini ? 100 : 200"
                class="no-inv"
                color="#dcab19"
                style="position: absolute; top: -4px; left: -5px"
                >folder
              </v-icon>
              <v-icon :size="mini ? 100 : 200" class="no-inv z1" color="amber"
                >folder
              </v-icon>
            </div>

            <div class="mt-n1 center-absolute" style="z-index: 2">
              <v-avatar
                v-if="parent_folders.parent?.icon"
                class="center-absolute"
                size="40"
                ><img :src="getShopImagePath(parent_folders.parent?.icon, 128)"
              /></v-avatar>
              <v-icon class="z1" color="#fff" size="x-large"
                >{{ $t("icons.chevron_back") }}
              </v-icon>
            </div>
            <small class="d-block">{{
              parent_folders.parent?.title
                ? parent_folders.parent.title.limitWords(mini ? 2 : 5)
                : $t("global.commons.home")
            }}</small>
          </div>
        </v-col>

        <!-- ⬬⬬⬬⬬ ▞▞▞▞▞▞▞▞▞▞▞▞ Folders ▞▞▞▞▞▞▞▞▞▞▞▞ ⬬⬬⬬⬬ -->

        <v-col
          v-for="(category, categoryIndex) in folders.slice(
            (folder_page - 1) * max_folders_per_page,
            folder_page * max_folders_per_page,
          )"
          :key="'f' + category.id"
          :style="modern && !mini ? { '--b-products-list-row': categoryIndex + 4 } : undefined"
          :cols="mini ? 4 : 12"
          :lg="mini ? 1 : 3"
          :md="mini ? 2 : 4"
          :sm="mini ? 3 : 6"
          :xl="mini ? 1 : 3"
          class="position-relative b-products-window__list-item"
          @contextmenu="showMenu($event, null, category)"
        >
          <u-drag
            :class="{
              'arrange-side':
                arrange_folder_mode &&
                current_dragged_folder &&
                arrange_categories_target === category,
            }"
            :drag-image-html="category.title.limitWords(3)"
            :drag-image-src="getShopImagePath(category.icon, IMAGE_SIZE_SMALL)"
            :draggable="draggable"
            :transfer-data="{ category: category }"
            class="h-100 position-relative"
            drag-image-color="#FFA000"
            @drag="onDragStart({ category: category }, false, ...arguments)"
            @dragend="onDragEnd"
          >
            <u-drop
              :class="{
                'drop-safe': inDragState,
                'rotate-7deg': arrange_folder_mode,
              }"
              class="f-anim"
              @dragenter="
                show_spirit_container ? undefined : onDropEnter(category)
              "
              @dragleave="onDropLeave()"
              @drop="(data) => handleDropInFolder(data, category)"
            >
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Category > Mini ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
              <b-product-window-category-mini
                v-if="mini"
                :category="category"
                :class="{
                  'not-drop-able': current_dragged_folder === category,
                  'now-drop-enter': current_drop_enter_folder === category,
                }"
                :is-empty="
                  category.is_empty /*We use it only in the vendor panel*/
                "
                @select="selectFolder(category)"
              >
              </b-product-window-category-mini>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Category > Normal ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <b-product-window-category-large
                v-else
                :modern-list="modern && !mini"
                :category="category"
                :class="{
                  'not-drop-able': current_dragged_folder === category,
                  'now-drop-enter': current_drop_enter_folder === category,
                }"
                :compact-mode="compactMode"
                :loading="loading_cat === category"
                :show-edit-button="showEditButton"
                class="item h-100"
                @select="selectFolder(category)"
                @click:edit="showEditCategory(category)"
                @contextmenu="showMenu($event, null, category)"
                :is-empty="
                  category.is_empty /*We use it only in the vendor panel*/
                "
              >
                <template v-if="modern && !mini" #actions>
                  <b-note-button
                    v-if="showNotes || (category.note && category.note.length)"
                    modern
                    :active-color="showNotes ? undefined : '#333'"
                    :note="category.note"
                    @click.stop="showNoteCategory(category)"
                  />
                </template>
              </b-product-window-category-large>
              <v-btn
                v-if="selectMode && canSelectCategory"
                :size="38"
                class="absolute-top-end selected-icon m-2"
                icon
                style="z-index: 50"
                @click.stop="$emit('select-category', category)"
              >
                <v-icon
                  :color="isSelected('c-' + category.id) ? '#689F38' : '#ccc'"
                  :size="30"
                  >check_circle
                </v-icon>
              </v-btn>
            </u-drop>
          </u-drag>

          <!-- Add Note Button -->
          <b-note-button
            v-if="!(modern && !mini) && (showNotes || (category.note && category.note.length))"
            :activeColor="showNotes ? undefined : '#333'"
            :note="category.note"
            class="absolute-top-start"
            :class="{ 'b-products-window__folder-note': modern && mini }"
            style="top: 0; left: 0; z-index: 50"
            @click="showNoteCategory(category)"
          ></b-note-button>
        </v-col>

        <p v-if="modern && !mini && !folders.length && !busy_fetch" class="b-products-window__list-empty">
          {{ $t('product_panel.workspace.list_view.no_categories') }}
        </p>

        <!-- ━━━━━━━━━━━━━━━━ Pagination > Categories ━━━━━━━━━━━━━━━━ -->

        <v-col
          v-if="folder_pages_count > 1 && !(modern && !mini)"
          key="pagination-categories"
          cols="12"
        >
          <v-pagination
            v-model="folder_page"
            :class="{ 'sd-modern-pagination': modern }"
            :length="folder_pages_count"
            rounded
          ></v-pagination>
        </v-col>
        </div>

        <!-- ⬬⬬⬬⬬ ▞▞▞▞▞▞▞▞▞▞▞▞ Products ▞▞▞▞▞▞▞▞▞▞▞▞ ⬬⬬⬬⬬ -->

        <div key="product-list" class="b-products-window__products b-products-window__list-background">
        <div v-if="modern && !mini" class="b-products-window__list-heading b-products-window__product-heading">
          <h2><b-product-window-section-icon kind="product" class="b-products-window__section-icon" />{{ $t('product_panel.workspace.list_view.products') }} <span>{{ products_count }}</span></h2>
          <div v-if="multiSelectProducts && selected_products.length" class="b-products-window__selection">
            <span aria-live="polite">{{ $t('product_panel.workspace.list_view.selected_count', { count: selected_products.length }) }}</span>
            <v-btn variant="text" class="sd-modern-button" @click="selectAllProducts(false)">{{ $t('product_panel.workspace.list_view.clear_selection') }}</v-btn>
          </div>
        </div>
        <div
          v-if="modern && !mini && (folder_pages_count > 1 || product_pages_count > 1)"
          class="b-products-window__list-pagination sd-modern-table-footer"
        >
          <v-pagination
            v-if="product_pages_count > 1"
            v-model="product_page"
            :aria-label="$t('product_panel.workspace.list_view.products')"
            class="sd-modern-pagination"
            :length="product_pages_count"
            :disabled="busy_fetch"
            rounded
          />
        </div>
        <div v-if="modern && !mini" class="b-products-window__list-columns sd-modern-list-header">
          <label v-if="multiSelectProducts" class="b-products-window__select-page">
            <input
              type="checkbox"
              :aria-label="$t('product_panel.workspace.list_view.select_page')"
              :checked="products.length > 0 && products.every(p => selected_products.includes(p.id))"
              :indeterminate="products.some(p => selected_products.includes(p.id)) && !products.every(p => selected_products.includes(p.id))"
              :disabled="busy_fetch || arrange_folder_mode || !products.length"
              @change="selectAllProducts($event.target.checked)"
            />
            <span class="b-products-window__select-page-label">{{ $t('product_panel.workspace.list_view.select_page') }}</span>
          </label>
          <span class="b-products-window__column-product">{{ $t('global.commons.product') }}</span>
          <span v-if="showPrice" class="b-products-window__column-price">{{ $t('global.commons.price') }}</span>
          <span v-if="showStatistics && !compactMode" class="b-products-window__column-stock">{{ $t('global.commons.quantity') }}</span>
          <span v-if="showStatistics && !compactMode" class="b-products-window__column-activity">{{ $t('product_panel.workspace.list_view.activity') }}</span>
          <span class="b-products-window__column-actions">{{ $t('global.commons.actions') }}</span>
        </div>

        <v-col
          v-for="(product, productIndex) in products"
          :key="product.id"
          :style="modern && !mini ? { '--b-products-list-row': productIndex + 4 } : undefined"
          :class="{
            'op-0-3': cut_product === product,
            'op-0-1 pen': arrange_folder_mode,
            disabled: busy_fetch,
          }"
          :cols="mini ? 4 : 12"
          :lg="mini ? 1 : 3"
          :md="mini ? 2 : 4"
          :sm="mini ? 3 : 6"
          :xl="mini ? 1 : 3"
          class="position-relative b-products-window__list-item"
          @contextmenu="showMenu($event, product, null)"
          @dragover="
            (e) => {
              current_dragged_product && e.preventDefault();
            }
          "
          @drop="onDropArrangeProduct(product)"
          @dragenter.self="dragenterProduct(product)"
        >
          <u-drag
            :class="{
              'arrange-side':
                current_dragged_product && arrange_products_target === product,

              'bundle-mode':
                drag_bundle_products && selected_products.includes(product.id),
            }"
            :drag-image-html="product.title.limitWords(3)"
            :drag-image-src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
            :draggable="draggable"
            :transfer-data="{ product: product }"
            class="h-100 position-relative"
            drag-image-color="#1976D2"
            @drag="onDragStart({ product: product }, false, ...arguments)"
            @dragend="onDragEnd"
          >
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product > Mini ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
            <b-product-window-product-mini
              v-if="mini"
              :class="{
                'not-drop-able':
                  current_dragged_product || current_dragged_folder,

                disabled: disableTypes?.includes(product.type),
              }"
              :dark="dark"
              :deleting="
                product.id === busy_delete ||
                (busy_delete === 'selected' &&
                  selected_products.includes(product.id))
              "
              :i-selected="selected_products.includes(product.id)"
              :product="product"
              :restoring="product.id === busy_restore"
              :selected="selected_products.includes(product.id)"
              :shop="shop"
              :shortcut="
                !busy_fetch &&
                current_dir_id &&
                product.category_id !== current_dir_id
              "
              :show-notes="showNotes"
              :show-select="press_ctrl"
              @onSelect="toggleProductsSelect(product)"
              @onShowNote="showNoteProduct(product)"
              @select="$emit('select', product)"
              @mousedown.middle.stop="$emit('select:middle', product)"
            >
            </b-product-window-product-mini>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product > Normal ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <b-product-window-product-large
              v-else
              :modern-list="modern && !mini"
              :multi-select-products="multiSelectProducts"
              :class="{
                'not-drop-able':
                  current_dragged_product || current_dragged_folder,

                disabled: disableTypes?.includes(product.type),
                'ma-2': !(modern && !mini),
              }"
              :color="dark ? '#000' : '#fff'"
              :compact-mode="compactMode"
              :dark="dark"
              :deleting="product.id === busy_delete || (modern && busy_delete === 'selected' && selected_products.includes(product.id))"
              :i-selected="selected_products.includes(product.id)"
              :product="product"
              :restoring="product.id === busy_restore"
              :selected="selected_products.includes(product.id)"
              :shop="shop"
              :shortcut="
                current_dir_id && product.category_id !== current_dir_id
              "
              :show-edit-button="showEditButton"
              :show-notes="showNotes"
              :show-price="showPrice"
              :show-ratting="showRatting"
              :show-select="press_ctrl"
              :show-statistics="showStatistics"
              class="item h-100"
              @onSelect="toggleProductsSelect(product)"
              @onShowNote="showNoteProduct(product)"
              @select="$emit('select', product)"
              @contextmenu="showMenu($event, product, null)"
              @click:image="
                (e) => {
                  $router.push({
                    name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                      ? 'Vendor_AddProduct'
                      : 'BPageProductEdit',
                    params: { product_id: product.id },
                    hash: '#images',
                  });
                  e.preventDefault();
                }
              "
            />

            <v-scale-transition leave-absolute origin="center center">
              <v-icon
                v-if="selectMode && canSelectProduct && isSelected(product.id)"
                class="absolute-top-end z2 selected-icon h-auto"
                color="#689F38"
                size="large"
                >check_circle
              </v-icon>
            </v-scale-transition>
          </u-drag>
        </v-col>

        <p v-if="modern && !mini && !products.length && !busy_fetch" class="b-products-window__list-empty">
          {{ $t('product_panel.workspace.list_view.no_products') }}
        </p>

        <div v-if="mini" key="spx" class="pen" style="flex-grow: 12"></div>

        <!-- ━━━━━━━━━━━━━━━━ Pagination > Products ━━━━━━━━━━━━━━━━ -->
        <v-col
          v-if="!(modern && !mini)"
          v-show="product_pages_count > 1"
          key="pagination-products"
          cols="12"
          :class="{ 'sd-modern-table-footer': modern }"
        >
          <span v-if="modern" class="sd-modern-muted">
            {{ products_count }} {{ $t('global.commons.products') }}
          </span>
          <v-pagination
            v-model="product_page"
            :class="{ 'sd-modern-pagination': modern }"
            :length="product_pages_count"
            rounded
            :disabled="busy_fetch"
          ></v-pagination>
        </v-col>
        </div>

      </v-fade-transition>
    </v-row>
    </div>

        <!-- ⬬⬬⬬ Add Mode ⬬⬬⬬ -->
        <v-row
          dense
          class="b-products-window__tool-row"
          v-if="
            CAN_ADD_PRODUCT &&
            addProductButton &&
            !search &&
            (!busy_fetch || products.length)
          "
        >
          <div key="catalog-tools" class="b-products-window__tools" :class="{ 'b-products-window__tools--vendor': modern && IS_VENDOR_PANEL }">
          <!-- ⬬⬬⬬ Force new line in mini mode ⬬⬬⬬ -->

          <v-col v-if="mini && !modern" key="spacer" cols="12"></v-col>

          <!-- ⬬⬬⬬ Add button ⬬⬬⬬ -->

          <v-col
            key="add-new-product-buttons"
            class="p-2 d-flex flex-column"
            :class="{ 'b-products-window__creation-stack': modern }"
            cols="12"
            lg="3"
            md="4"
            sm="6"
            xl="3"
          >
            <template v-if="modern && IS_VENDOR_PANEL">
              <b-product-window-section-icon kind="create" :size="24" />
              <h3>{{ $t('product_panel.workspace.vendor_tools.create') }}</h3>
              <div class="b-products-window__vendor-create-actions">
                <v-btn class="sd-modern-button" variant="outlined" @click="$emit('click:add')">
                  <v-icon size="16">library_add</v-icon>
                  {{ $t('product_panel.workspace.vendor_tools.new_product') }}
                </v-btn>
                <v-btn class="sd-modern-button" variant="outlined" @click="$emit('click:fast-add')">
                  <v-icon size="16">flash_on</v-icon>
                  {{ $t('products_select.modern.fast_mode') }}
                </v-btn>
                <v-btn class="sd-modern-button" variant="outlined" @click="$emit('click:ai-add')">
                  <v-icon size="16">auto_fix_high</v-icon>
                  {{ $t('product_panel.workspace.vendor_tools.ai_assistance') }}
                </v-btn>
              </div>
            </template>
            <template v-else>
            <u-button-add
              :caption="$t('add_product.title_new')"
              :fillHeight="false"
              class="flex-grow-1 elevation-1"
              :class="{ 'b-products-window__create b-products-window__create--primary': modern }"
              :color="modern ? 'rgb(var(--v-theme-primary))' : undefined"
              :hover-color="modern ? 'rgb(var(--v-theme-primary))' : undefined"
              :role="modern ? 'button' : undefined"
              :tabindex="modern ? 0 : undefined"
              icon="library_add"
              message="⌘Ctrl + P"
              min-height="100px"
              small
              @click="$emit('click:add')"
              @keydown.enter="modern && $emit('click:add')"
              @keydown.space.prevent="modern && $emit('click:add')"
            ></u-button-add>
            <u-button-add
              :caption="$t('add_product.title_new')"
              :fillHeight="false"
              class="mt-1 flex-grow-1 elevation-1"
              :class="{ 'b-products-window__create': modern }"
              :color="modern ? 'rgb(var(--v-theme-surface))' : undefined"
              :hover-color="modern ? 'rgba(var(--v-theme-on-surface), 0.025)' : undefined"
              :role="modern ? 'button' : undefined"
              :tabindex="modern ? 0 : undefined"
              icon="flash_on"
              :message="modern ? $t('products_select.modern.fast_mode') : 'Fast Mode'"
              min-height="100px"
              small
              @click="$emit('click:fast-add')"
              @keydown.enter="modern && $emit('click:fast-add')"
              @keydown.space.prevent="modern && $emit('click:fast-add')"
            ></u-button-add>
            <u-button-add
              :caption="$t('products_select.ai.title')"
              :fillHeight="false"
              class="mt-1 flex-grow-1 elevation-1"
              :class="{ 'b-products-window__create': modern }"
              :color="modern ? 'rgb(var(--v-theme-surface))' : '#516ad6'"
              :hover-color="modern ? 'rgba(var(--v-theme-on-surface), 0.025)' : '#667eea'"
              :role="modern ? 'button' : undefined"
              :tabindex="modern ? 0 : undefined"
              icon="auto_fix_high"
              message="⌘Ctrl + X"
              min-height="100px"
              small
              @click="$emit('click:ai-add')"
              @keydown.enter="modern && $emit('click:ai-add')"
              @keydown.space.prevent="modern && $emit('click:ai-add')"
            ></u-button-add>
            </template>
          </v-col>

          <slot name="append-products"></slot>

          <v-col
            v-if="
              !IS_VENDOR_PANEL &&
              (current_filter ||
                products?.length > 1 ||
                current_engine?.categories?.length ||
                current_engine?.tags?.length)
              // && !parent_folders /*Show just in the root*/
            "
            key="root-filters"
            class="p-2 d-flex flex-column"
            :class="{ 'b-products-window__filter-tile': modern }"
            cols="12"
            lg="3"
            md="4"
            sm="6"
            xl="3"
          >
            <div
              :class="modern ? 'sd-modern-widget b-products-window__feature' : 'dashed rounded-8px d-flex align-center justify-center pa-3 bg-white min-h-100 position-relative'"
            >
              <div>
                <div class="b-products-window__feature-body">
                  <h3 v-if="current_filter">
                    <v-icon class="me-1 zoomIn" color="green"
                      >check_circle
                    </v-icon>

                    {{
                      parent_folders
                        ? modern ? $t('products_select.modern.category_has_filter', { category: parent_folders.title }) : "This category has a filter."
                        : $t("products_select.filter_box.has_root_filter_message")
                    }}
                  </h3>
                  <h3 v-else>
                    {{
                      parent_folders
                        ? modern ? $t('products_select.modern.category_no_filter', { category: parent_folders.title }) : "No filters have been defined!"
                        : $t("products_select.filter_box.no_root_filter_message")
                    }}
                  </h3>

                  <s-dense-images-circles
                    :images="
                      products?.map((p) =>
                        getShopImagePath(p.icon, IMAGE_SIZE_SMALL),
                      )
                    "
                    :limit="5"
                    class="justify-center"
                  ></s-dense-images-circles>

                  <small class="d-block">{{
                    $t("products_select.filter_box.set_filter_message")
                  }}</small>
                </div>

                <div class="b-products-window__feature-actions">
                  <v-btn
                    class="tnt ma-1"
                    :class="{ 'sd-modern-button sd-modern-button--small': modern }"
                    :aria-label="modern ? parent_folders ? $t('products_select.modern.edit_category_filter', { category: parent_folders.title }) : $t('products_select.filter_box.edit_action') : undefined"
                    color="primary"
                    size="small"
                    @click="dialog_root_filter = true"
                  >
                    <template v-if="modern">
                      <v-avatar class="b-products-window__scope-avatar" size="20" aria-hidden="true">
                        <img v-if="parent_folders?.icon" :src="getShopImagePath(parent_folders.icon, IMAGE_SIZE_SMALL)" alt="" />
                        <v-icon v-else size="18">{{ parent_folders ? 'folder' : 'home' }}</v-icon>
                      </v-avatar>
                      <span class="b-products-window__action-label">{{ $t('products_select.modern.edit_filters') }}</span>
                      <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :text="parent_folders ? parent_folders.title : $t('global.commons.root')" :open-on-focus="true" />
                    </template>
                    <template v-else>
                      <v-icon class="me-1" size="small">filter_alt</v-icon>
                      {{ parent_folders ? `Edit ${parent_folders.title.limitWords(1)} Filter` : $t('products_select.filter_box.edit_action') }}
                    </template>
                  </v-btn>
                  <v-btn
                    v-if="current_filter"
                    :loading="busy_clear_root_filter"
                    class="tnt ma-1"
                    :class="{ 'sd-modern-button sd-modern-button--small': modern }"
                    :aria-label="modern ? parent_folders ? $t('products_select.modern.clear_category_filter', { category: parent_folders.title }) : $t('products_select.filter_box.clear_action') : undefined"
                    size="small"
                    variant="outlined"
                    @click="showClearRootFiltersDialog(parent_folders)"
                  >
                    <template v-if="modern">
                      <v-avatar class="b-products-window__scope-avatar" size="20" aria-hidden="true">
                        <img v-if="parent_folders?.icon" :src="getShopImagePath(parent_folders.icon, IMAGE_SIZE_SMALL)" alt="" />
                        <v-icon v-else size="18">{{ parent_folders ? 'folder' : 'home' }}</v-icon>
                      </v-avatar>
                      <span class="b-products-window__action-label">{{ $t('products_select.modern.clear_filters') }}</span>
                      <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :text="parent_folders ? parent_folders.title : $t('global.commons.root')" :open-on-focus="true" />
                    </template>
                    <template v-else>
                      <v-icon class="me-1" size="small">filter_alt_off</v-icon>
                      {{ parent_folders ? 'Clear Category Filter' : $t('products_select.filter_box.clear_action') }}
                    </template>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>

          <v-col
            v-if="
              current_engine?.categories?.length ||
              current_engine?.tags?.length ||
              true
            "
            key="engine"
            class="p-2 d-flex flex-column"
            :class="{ 'b-products-window__engine-tile': modern }"
            cols="12"
            lg="3"
            md="4"
            sm="6"
            xl="3"
          >
            <div
              :class="modern ? 'sd-modern-widget b-products-window__feature' : 'dashed rounded-8px d-flex align-center justify-center pa-3 bg-white min-h-100 position-relative'"
            >
              <div>
                <div class="b-products-window__feature-body">
                  <b-product-window-section-icon v-if="modern && IS_VENDOR_PANEL" kind="engine" :size="24" />
                  <h3>{{ $t("products_select.engine.title") }}</h3>

                  <template v-if="current_engine">
                    <small class="d-block">
                      {{ $t("products_select.engine.subtitle") }}
                    </small>

                    <b-category-engine-preview
                      :category="
                        parent_folders
                          ? parent_folders
                          : { id: 'root', title: $t('global.commons.home') }
                      "
                      :engine-categories="current_engine.categories"
                      :engine-tags="current_engine.tags"
                      class="my-2"
                    >
                    </b-category-engine-preview>
                  </template>

                  <v-icon v-else-if="!(modern && IS_VENDOR_PANEL)" class="my-2" size="36"> devices_fold</v-icon>

                  <div class="mt-2">
                    <small class="d-block">
                      {{
                        $t(modern && IS_VENDOR_PANEL ? 'product_panel.workspace.vendor_tools.engine_description' : 'products_select.engine.load_in_tips', {
                          category: parent_folders
                            ? parent_folders.title
                            : $t("global.commons.home"),
                        })
                      }}
                    </small>
                  </div>
                </div>

                <div class="b-products-window__feature-actions">
                  <span
                    v-if="modern && IS_VENDOR_PANEL"
                    class="b-products-window__managed-engine"
                    tabindex="0"
                    :aria-label="$t('product_panel.workspace.vendor_tools.engine_managed')"
                  >
                    <v-btn class="sd-modern-button sd-modern-button--small" variant="outlined" disabled>
                      <v-icon size="16">lock_outline</v-icon>
                      {{ $t('product_panel.workspace.vendor_tools.engine_managed') }}
                    </v-btn>
                    <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :text="$t('product_panel.workspace.vendor_tools.engine_managed_help')" :open-on-focus="true" />
                  </span>
                  <v-btn
                    v-else
                    class="tnt ma-1"
                    :class="{ 'sd-modern-button sd-modern-button--small': modern }"
                    :aria-label="modern ? $t('products_select.engine.action', { category: parent_folders ? parent_folders.title : $t('global.commons.root') }) : undefined"
                    color="primary"
                    size="small"
                    @click="dialog_root_engine = true"
                  >
                    <template v-if="modern">
                      <v-avatar class="b-products-window__scope-avatar" size="20" aria-hidden="true">
                        <img v-if="parent_folders?.icon" :src="getShopImagePath(parent_folders.icon, IMAGE_SIZE_SMALL)" alt="" />
                        <v-icon v-else size="18">{{ parent_folders ? 'folder' : 'home' }}</v-icon>
                      </v-avatar>
                      <span class="b-products-window__action-label">{{ $t('products_select.modern.edit_engine') }}</span>
                      <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :text="parent_folders ? parent_folders.title : $t('global.commons.root')" :open-on-focus="true" />
                    </template>
                    <template v-else>
                      <v-icon class="me-1" size="small">auto_mode</v-icon>
                      {{ $t('products_select.engine.action', { category: parent_folders ? parent_folders.title.limitWords(1) : $t('global.commons.root') }) }}
                    </template>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>
          </div>
        </v-row>

    <!-- ███████████████████████ Context Menu ███████████████████████ -->
    <v-menu
      v-model="showProductMenu"
      :target="[x, y]"
      :width="modern ? 380 : undefined"
      :max-width="modern ? 'calc(100vw - 24px)' : undefined"
      :max-height="modern ? 'calc(100dvh - 24px)' : undefined"
      absolute
      transition="slide-y-transition"
    >
      <v-sheet
        class="text-start"
        :class="modern ? 'b-products-window__context sd-modern-widget' : 'v-menu-text-small'"
        :aria-label="modern ? $t('product_panel.workspace.context_menu.title') : undefined"
        rounded="lg"
      >
        <header v-if="modern" class="b-products-window__context-heading">
          <span class="b-products-window__context-identity">
            <v-icon size="18">{{ menu_context.icon }}</v-icon>
          </span>
          <div class="b-products-window__context-copy">
            <div class="b-products-window__context-kind">{{ menu_context.kind }}</div>
            <h2>{{ menu_context.title }}</h2>
          </div>
          <span v-if="currentProductForMenu" class="b-products-window__context-state">
            <template v-if="currentProductForMenu.deleted_at">{{ $t('global.commons.deleted') }}</template>
            <template v-else>
              <v-icon :color="ProductStatus[currentProductForMenu.status]?.color" size="6">circle</v-icon>
              {{ $t(ProductStatus[currentProductForMenu.status]?.name) }}
            </template>
          </span>
        </header>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ For products (Right-click on a selected item) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-list
          v-if="is_menu_multi_select_product"
          class="py-0"
          :color="modern ? undefined : 'primary'"
          density="compact"
        >
          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Assign Vendor ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

          <v-list-item
            v-if="
              IS_MARKETPLACE &&
              !IS_VENDOR_PANEL /*Only in marketplace panel*/ &&
              !menu_add_vendor_error
            "
            @click="showAssignVendor(currentProductForMenu)"
          >
            <template v-slot:prepend>
              <v-icon size="small">add_business</v-icon>
            </template>
            <v-list-item-title>
              {{ $t("marketplace.add_vendor") }}
              <v-chip v-if="!modern" class="mx-2" color="#fff" label size="x-small"
                >+ multi
              </v-chip>
            </v-list-item-title>
          </v-list-item>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Quick Actions ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

          <template v-if="!IS_VENDOR_PANEL /*Only shop admin!*/">
            <v-list-item
              @click="
                showChangeStatusProduct(
                  ...products.filter((p) => selected_products?.includes(p.id)),
                )
              "
            >
              <template v-slot:prepend>
              <v-icon size="small">{{ modern ? 'change_circle' : 'nat' }}</v-icon>
              </template>
              <v-list-item-title>
                {{ $t("add_product.menu.change_status") }}
                <template v-if="!modern"> |
                <v-icon
                  :color="ProductStatus[currentProductForMenu?.status]?.color"
                  size="x-small"
                  >circle
                </v-icon>
                {{ $t(ProductStatus[currentProductForMenu?.status]?.name) }}
                </template>
              </v-list-item-title>
              <template v-if="modern" v-slot:append>
                <span class="b-products-window__context-state">
                  <v-icon :color="ProductStatus[currentProductForMenu?.status]?.color" size="6">circle</v-icon>
                  {{ $t(ProductStatus[currentProductForMenu?.status]?.name) }}
                </span>
              </template>
            </v-list-item>
          </template>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Delete All selected Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

          <v-divider class="my-0"></v-divider>

          <v-list-item @click="deleteAllSelectedProduct(selected_products)">
            <template v-slot:prepend>
              <v-icon :color="modern ? 'error' : 'red'" size="small">{{ modern ? 'delete_outline' : 'fa:fas fa-trash' }}</v-icon>
            </template>
            <v-list-item-title>
              {{ $t(modern ? 'product_panel.workspace.context_menu.delete_selected' : 'global.actions.delete_all') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <template v-else>
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ For products only ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <v-list v-if="currentProductForMenu" class="py-0" density="compact">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Open public product page ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <template v-if="!currentProductForMenu.deleted_at">
              <v-list-item
                :href="
                  ShopURLs.GetProductLink(
                    shop,
                    currentProductForMenu.id,
                    Slugify.apply(currentProductForMenu.title),
                  )
                "
                :base-color="modern ? undefined : '#1976d2'"
                target="_blank"
                rel="noopener noreferrer"
                :theme="modern ? undefined : 'dark'"
                variant="flat"
              >
                <template v-slot:prepend>
                  <v-icon size="small">open_in_new</v-icon>
                </template>
                <v-list-item-title>
                  {{
                    $t("global.actions.open") +
                    " " +
                    currentProductForMenu.title.limitWords(3)
                  }}
                </v-list-item-title>
                <template v-if="modern" v-slot:append><v-icon size="14">north_east</v-icon></template>
              </v-list-item>
              <v-divider v-if="modern" />
            </template>

            <template
              v-if="CAN_ADD_PRODUCT && !currentProductForMenu.deleted_at"
            >
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Assign Vendor ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item
                v-if="
                  IS_MARKETPLACE &&
                  !IS_VENDOR_PANEL /*Only in marketplace panel*/ &&
                  !menu_add_vendor_error
                "
                :base-color="modern ? undefined : '#512da8'"
                :theme="modern ? undefined : 'dark'"
                variant="flat"
                @click="showAssignVendor(currentProductForMenu)"
              >
                <template v-slot:prepend>
                  <v-icon size="small">add_business</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("marketplace.add_vendor") }}
                </v-list-item-title>
              </v-list-item>
              <small
                v-else-if="menu_add_vendor_error"
                :class="modern ? 'b-products-window__context-notice' : 'max-w-250 mx-auto pa-2 d-block border-bottom'"
              >
                <v-icon class="me-1" size="small">add_business</v-icon>
                {{ menu_add_vendor_error }}</small
              >
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Edit Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item
                v-if="CAN_ADD_PRODUCT"
                :to="{
                  name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                    ? 'Vendor_AddProduct'
                    : 'BPageProductEdit',
                  params: { product_id: currentProductForMenu.id },
                  hash: '#general',
                }"
              >
                <template v-slot:prepend>
                  <v-icon size="small">edit_square</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("global.actions.edit") }}
                </v-list-item-title>
                <template v-if="!modern" v-slot:append>
                  <v-avatar :key="currentProductForMenu.id" size="24">
                    <img
                      v-if="currentProductForMenu.icon"
                      :src="getShopImagePath(currentProductForMenu.icon, 128)"
                    />
                    <v-icon v-else>inventory</v-icon>
                  </v-avatar>
                </template>
              </v-list-item>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product Dashboard ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
              <v-list-item
                :to="{
                  name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                    ? 'Vendor_ProductDashboard'
                    : 'BPageProductDashboard',
                  params: { product_id: currentProductForMenu.id },
                  /*   hash: '#dashboard'*/
                }"
              >
                <template v-slot:prepend>
                  <v-icon size="small">dashboard</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("products_select.product_menu.dashboard") }}
                </v-list-item-title>
              </v-list-item>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product Inventory ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item
                :to="{
                  name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                    ? 'Vendor_ProductInventoryPage'
                    : 'BPageProductInventory',
                  params: { product_id: currentProductForMenu.id },
                  /*   hash: '#all-items'*/
                }"
              >
                <template v-slot:prepend>
                  <v-icon size="small">{{ modern ? 'inventory_2' : 'fa:fas fa-boxes' }}</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t(modern ? 'product_panel.workspace.context_menu.inventory' : 'products_select.product_menu.inventory') }}
                </v-list-item-title>
              </v-list-item>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product Images ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item
                :to="{
                  name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                    ? 'Vendor_AddProduct'
                    : 'BPageProductEdit',
                  params: { product_id: currentProductForMenu.id },
                  hash: '#images',
                }"
              >
                <template v-slot:prepend>
                  <v-icon size="small">{{ modern ? 'image' : 'fa:fas fa-image' }}</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("add_product.menu.images") }}
                </v-list-item-title>
              </v-list-item>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Quick Actions ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <template v-if="!IS_VENDOR_PANEL /*Only shop admin!*/">
                <v-list-item
                  @click="showChangeStatusProduct(currentProductForMenu)"
                >
                  <template v-slot:prepend>
                    <v-icon size="small">{{ modern ? 'change_circle' : 'nat' }}</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("add_product.menu.change_status") }}
                    <template v-if="!modern"> |
                    <v-icon
                      :color="
                        ProductStatus[currentProductForMenu?.status]?.color
                      "
                      size="x-small"
                      >circle
                    </v-icon>
                    {{ $t(ProductStatus[currentProductForMenu?.status]?.name) }}
                    </template>
                  </v-list-item-title>
                  <template v-if="modern" v-slot:append>
                    <span class="b-products-window__context-state">
                      <v-icon :color="ProductStatus[currentProductForMenu?.status]?.color" size="6">circle</v-icon>
                      {{ $t(ProductStatus[currentProductForMenu?.status]?.name) }}
                    </span>
                  </template>
                </v-list-item>
              </template>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product Add Note ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item @click="showNoteProduct(currentProductForMenu)">
                <template v-slot:prepend>
                  <v-icon size="small">edit_note</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t(modern ? 'product_panel.workspace.context_menu.add_note' : 'notes.add_action') }}
                </v-list-item-title>
              </v-list-item>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Delete Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <template v-if="CAN_ADD_PRODUCT">
                <v-divider class="my-0"></v-divider>

                <v-list-item @click="deleteProduct(currentProductForMenu)">
                  <template v-slot:prepend>
                    <v-icon :color="modern ? 'error' : 'red'" size="small">{{ modern ? 'delete_outline' : 'fa:fas fa-trash' }}</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("global.actions.delete") }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </template>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Restore Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item
              v-else-if="CAN_ADD_PRODUCT"
              @click="restoreProduct(currentProductForMenu)"
            >
              <template v-slot:prepend>
                <v-icon :color="modern ? 'success' : 'green'" size="small"
                  >{{ modern ? 'restore_from_trash' : 'fa:fas fa-trash-restore' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{ $t("global.actions.restore") }}
              </v-list-item-title>
            </v-list-item>

            <template v-if="CAN_ADD_PRODUCT">
              <v-divider class="my-0"></v-divider>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Cut Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item @click="cutProduct(currentProductForMenu)">
                <template v-slot:prepend>
                  <v-icon size="small">{{ modern ? 'content_cut' : 'fa:fas fa-cut' }}</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("global.actions.cut") }}
                </v-list-item-title>
              </v-list-item>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Copy Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item @click="copyProduct(currentProductForMenu)">
                <template v-slot:prepend>
                  <v-icon size="small">{{ modern ? 'content_copy' : 'fa:fas fa-copy' }}</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("global.actions.copy") }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-list>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ For category ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <v-list
            v-if="CAN_ADD_CATEGORY && currentCategoryForMenu"
            class="py-0"
            density="compact"
          >
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Open public product page ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item
              :href="
                ShopURLs.GetCategoryLink(shop, currentCategoryForMenu.name)
              "
              :base-color="modern ? undefined : '#1976d2'"
              target="_blank"
              rel="noopener noreferrer"
              :theme="modern ? undefined : 'dark'"
              variant="flat"
            >
              <template v-slot:prepend>
                <v-icon size="small">open_in_new</v-icon>
              </template>
              <v-list-item-title>
                {{
                  $t("global.actions.open") +
                  " " +
                  currentCategoryForMenu.title.limitWords(3)
                }}
              </v-list-item-title>
              <template v-if="modern" v-slot:append><v-icon size="14">north_east</v-icon></template>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Category Edit ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item v-if="!modern || showEditButton" @click="showEditCategory(currentCategoryForMenu)">
              <template v-slot:prepend>
                <v-icon size="small">edit</v-icon>
              </template>

              <v-list-item-title>
                {{ $t("add_category.edit_action") }}
              </v-list-item-title>

              <template v-if="!modern" v-slot:append>
                <v-avatar :key="currentCategoryForMenu.id" size="24">
                  <img
                    v-if="currentCategoryForMenu.icon"
                    :src="getShopImagePath(currentCategoryForMenu.icon, 128)"
                  />
                  <v-icon v-else>folder</v-icon>
                </v-avatar>
              </template>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product Add Note ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <template v-if="modern">
              <v-list-item @click="showNoteCategory(currentCategoryForMenu)">
                <template v-slot:prepend>
                  <v-icon size="small">edit_note</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t(modern ? 'product_panel.workspace.context_menu.add_note' : 'notes.add_action') }}
                </v-list-item-title>
              </v-list-item>
            </template>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Set Bulk Profiles ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <template v-if="!IS_VENDOR_PANEL /*Not supported yet!*/">
              <v-divider class="my-0"></v-divider>

              <v-list-item
                @click="showSetBulkCategoryProfile(currentCategoryForMenu)"
              >
                <template v-slot:prepend>
                  <v-icon size="small">assignment_turned_in</v-icon>
                </template>

                <v-list-item-title>
                  {{ $t(modern ? 'product_panel.workspace.context_menu.assign_profiles' : 'products_select.menu.category_assign_profile') }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    $t(modern ? 'product_panel.workspace.context_menu.profiles_help' : 'products_select.menu.category_assign_profile_subtitle')
                  }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item
                @click="showCategoryBulkDiscount(currentCategoryForMenu)"
              >
                <template v-slot:prepend>
                  <v-icon size="small">local_offer</v-icon>
                </template>

                <v-list-item-title>
                  {{ $t("products_select.menu.bulk_discount") }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ $t(modern ? 'product_panel.workspace.context_menu.discount_help' : 'products_select.menu.bulk_discount_subtitle') }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-list>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Right click on no product or category ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-list
            v-if="
              !currentProductForMenu &&
              !currentCategoryForMenu &&
              !IS_VENDOR_PANEL
            "
            class="py-0"
            density="compact"
          >
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Set root filter ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item
              :append-icon="modern ? undefined : 'filter_alt'"
              @click="dialog_root_filter = true"
            >
              <template v-slot:prepend>
                <v-avatar
                  v-if="parent_folders && !modern"
                  :image="getShopImagePath(parent_folders.icon, 64)"
                  :size="24"
                  class="avatar-gradient -thin -category"
                ></v-avatar>
                <v-icon v-else size="small">{{ modern ? 'filter_list' : 'home' }}</v-icon>
              </template>

              <v-list-item-title v-if="modern">
                {{ $t(parent_folders ? 'product_panel.workspace.context_menu.category_filters' : 'product_panel.workspace.context_menu.root_filters') }}
              </v-list-item-title>
              <v-list-item-title v-else-if="parent_folders">
                Set Filter: {{ parent_folders.title?.limitWords(3) }}
              </v-list-item-title>
              <v-list-item-title v-else> Set Root Filter</v-list-item-title>

              <v-list-item-subtitle>
                {{ modern ? $t('product_panel.workspace.context_menu.filter_help') : 'Set filters of this category.' }}
              </v-list-item-subtitle>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Set root engine ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item
              :append-icon="modern ? undefined : 'auto_mode'"
              @click="dialog_root_engine = true"
            >
              <template v-slot:prepend>
                <v-avatar
                  v-if="parent_folders && !modern"
                  :image="getShopImagePath(parent_folders.icon, 64)"
                  :size="24"
                  class="avatar-gradient -thin -category"
                ></v-avatar>
                <v-icon v-else size="small">{{ modern ? 'auto_mode' : 'home' }}</v-icon>
              </template>

              <v-list-item-title v-if="modern">
                {{ $t(parent_folders ? 'product_panel.workspace.context_menu.category_engine' : 'product_panel.workspace.context_menu.root_engine') }}
              </v-list-item-title>
              <v-list-item-title v-else-if="parent_folders">
                Set Engine: {{ parent_folders.title?.limitWords(3) }}
              </v-list-item-title>
              <v-list-item-title v-else> Set Root Engine</v-list-item-title>

              <v-list-item-subtitle>
                {{ modern ? $t('product_panel.workspace.context_menu.engine_help') : 'Load extra products from other categories or by tags.' }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider v-if="!modern"></v-divider>
          </v-list>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ For all ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-list class="text-start py-0" density="compact">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Past Product (copy) ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item v-if="copy_product" @click="pastProduct(copy_product)">
              <template v-slot:prepend>
                <v-icon v-if="!copy_product || !copy_product.icon" size="small"
                  >{{ modern ? 'content_paste' : 'fa:fas fa-paste' }}
                </v-icon>
                <v-avatar v-else size="24"
                  ><img
                    :src="
                      getShopImagePath(copy_product.icon, IMAGE_SIZE_SMALL)
                    "
                /></v-avatar>
              </template>

              <v-list-item-title>
                {{ $t("global.actions.paste") }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ modern ? $t('product_panel.workspace.context_menu.clipboard_destination', { product: copy_product.title, destination: parent_folders?.title || $t('global.store') }) : copy_product.title }}
              </v-list-item-subtitle>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Move Product (Cut) ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item
              v-if="cut_product"
              @click="
                handleDropInFolder(
                  { product: cut_product },
                  { id: current_dir_id },
                )
              "
            >
              <template v-slot:prepend>
                <v-icon v-if="!cut_product || !cut_product.icon" size="small"
                  >{{ modern ? 'drive_file_move' : 'fa:fas fa-paste' }}
                </v-icon>
                <v-avatar v-else class="me-3" size="24"
                  ><img
                    :src="getShopImagePath(cut_product.icon, IMAGE_SIZE_SMALL)"
                /></v-avatar>
              </template>

              <v-list-item-title>{{ modern ? $t('product_panel.workspace.context_menu.move_here') : 'Move here' }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ modern ? $t('product_panel.workspace.context_menu.clipboard_destination', { product: cut_product.title, destination: parent_folders?.title || $t('global.store') }) : cut_product.title }}
              </v-list-item-subtitle>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Select All Products ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-divider v-if="modern && (copy_product || cut_product)" />
            <v-list-item @click="selectAllProducts(!all_products_selected)">
              <template v-slot:prepend>
                <v-icon>highlight_alt</v-icon>
              </template>

              <v-list-item-title>
                {{
                  all_products_selected
                    ? $t(modern ? 'product_panel.workspace.context_menu.clear_selection' : 'products_select.menu.unselect')
                    : $t("products_select.menu.select_all_products")
                }}
              </v-list-item-title>
              <v-tooltip v-if="modern" activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('product_panel.workspace.context_menu.selection_help') }}</v-tooltip>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ New Category ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <template v-if="CAN_ADD_CATEGORY">
              <v-divider class="my-0"></v-divider>

              <v-list-item @click="showEditCategory(null)">
                <template v-slot:prepend>
                  <v-icon color="amber">create_new_folder</v-icon>
                </template>

                <v-list-item-title>
                  {{ $t(modern ? 'product_panel.workspace.context_menu.new_category' : 'admin_shop.categories.menu.add_new') }}
                </v-list-item-title>
              </v-list-item>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Category Arrange Mode ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
              <!-- Enable / Disable Categories arrangement -->
              <v-list-item :role="modern ? 'button' : undefined" :aria-pressed="modern ? arrange_folder_mode : undefined" @click="arrange_folder_mode = !arrange_folder_mode">
                <template v-slot:prepend>
                  <v-icon
                    :color="modern ? undefined : arrange_folder_mode ? 'primary' : '#333'"
                    size="small"
                    >{{
                      modern ? 'drag_indicator' : arrange_folder_mode ? "circle" : "radio_button_unchecked"
                    }}
                  </v-icon>
                </template>

                <v-list-item-title>
                  {{ $t(modern ? 'product_panel.workspace.context_menu.arrange_categories' : 'products_select.menu.sort_categories') }}
                </v-list-item-title>
                <template v-if="modern" v-slot:append>
                  <span class="b-products-window__context-state">
                    {{ $t(arrange_folder_mode ? 'product_panel.workspace.context_menu.arrange_on' : 'product_panel.workspace.context_menu.arrange_off') }}
                    <v-icon v-if="arrange_folder_mode" size="14">check</v-icon>
                  </span>
                </template>
              </v-list-item>
            </template>
          </v-list>
        </template>
      </v-sheet>
    </v-menu>
    </template>
  </div>

  <!-- ████████████████████ Dialog > Edit category ████████████████████ -->
  <v-dialog
    v-model="dialog_cat"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-category-add
      v-if="dialog_pre"
      :categories="null"
      :category="selected_cat"
      :parent-folder="parent_folders"
      :shop="shop"
      :vendor="vendor"
      @add="
        (item) =>
          item.parent_id === current_dir_id ? folders.push(item) : undefined
      "
      @back="dialog_cat = false"
      @delete="
        (id) => {
          DeleteItemByID(folders, id);
          fetchData(
            true /*Force fetch items -> because inside folders and products return to current location*/,
          );
        }
      "
      @edit="
        (item) =>
          item.parent_id !== current_dir_id
            ? DeleteItemByID(folders, item.id)
            : UpdateItemByID(folders, item)
      "
    />
  </v-dialog>

  <!-- ████████████████████ Dialog > Assign Vendor to Product ████████████████████ -->
  <v-bottom-sheet
    v-model="dialog_vendors"
    content-class="rounded-t-xl"
    max-width="98vw"
    width="1080"
    scrollable
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>Bulk actions > Assign vendor</v-card-title>
      <v-card-text>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <div class="widget-box mb-5">
          <u-widget-header icon="admin_panel_settings" title="Vendor">
          </u-widget-header>
          <v-list-subheader
            >This vendor will be added to selected products for all their
            variants.
          </v-list-subheader>

          <products-dense-images-circles
            :ids="assign_vendor_product_ids"
            avatar-class="avatar-gradient -thin -vendor"
          ></products-dense-images-circles>

          <b-vendor-input
            v-model="vendor_id_input"
            :shop="shop"
            active-only
            clearable
            label="Vendor"
            placeholder="Filter by vendor..."
          ></b-vendor-input>

          <u-smart-switch
            v-model="clear_other"
            class="mt-5"
            false-description="Add selected vendor."
            false-title="Add / Update"
            true-description="Other assigned vendors will be removed from selected products."
            true-icon="cleaning_services"
            true-title="Add / Update + Clear other vendors"
          >
          </u-smart-switch>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ price (Calculated / Manual price) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <div class="widget-box mb-5">
          <u-widget-header icon="price_change" title="Marketplace pricing">
          </u-widget-header>
          <v-list-subheader
            >Select a marketplace pricing model to assign to the selected
            product. If you leave it empty, the product pricing will be set as
            vendor price, and the marketplace commission will assume as zero.
          </v-list-subheader>

          <v-pricing-input v-model="pricing_id" :shop="shop"></v-pricing-input>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Quantity  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <div class="widget-box mb-5">
          <u-widget-header
            icon="inventory"
            title="Vendor Inventory"
          ></u-widget-header>
          <v-list-subheader
            >Set as the inventory for each item. No effect on the File-type
            products.
          </v-list-subheader>

          <u-number-input
            v-model="quantity"
            :label="$t('global.commons.quantity')"
            :min="0"
            :step="1"
            class="my-3 strong-field"
          />
        </div>

        <div class="widget-box mb-5 py-3">
          <u-smart-verify
            v-model="check_bulk_vendor"
            true-description="Please confirm that you want to assign the vendor in bulk."
            true-title="Verify Bulk Vendor Assignment"
          >
            >
          </u-smart-verify>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_vendors = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :class="{
              disabled:
                !check_bulk_vendor || (!vendor_id_input && !clear_other),
            }"
            :loading="busy_assign_vendor"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="assignVendor()"
          >
            <v-icon start>save</v-icon>

            {{
              clear_other && vendor_id_input
                ? "Set selected and remove other vendors"
                : clear_other
                  ? "Clear all vendors"
                  : $t("global.actions.set")
            }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>

  <!-- █████████████████████ Dialog > Product Note Messages █████████████████████ -->

  <b-note-dialog
    v-model="note_product_dialog"
    :add-url="
      () =>
        IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.POST_MY_VENDOR_PRODUCT_ADD_NOTE(
              vendor.id,
              note_product_item.id,
            )
          : window.API.POST_PRODUCT_ADD_NOTE(shop.id, note_product_item.id)
    "
    :delete-url="
      (index) =>
        IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_NOTE(
              vendor.id,
              note_product_item.id,
              index,
            )
          : window.API.DELETE_PRODUCT_NOTE(shop.id, note_product_item.id, index)
    "
    :icon="
      note_product_item ? getShopImagePath(note_product_item.icon, 128) : null
    "
    :target="note_product_item"
    :title="note_product_item && note_product_item.title"
  ></b-note-dialog>

  <!-- █████████████████████ Dialog > Category Note Messages █████████████████████ -->

  <b-note-dialog
    v-model="note_category_dialog"
    :add-url="
      () =>
        IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.POST_MY_VENDOR_CATEGORY_ADD_NOTE(
              vendor.id,
              note_category_item.id,
            )
          : window.API.POST_CATEGORY_ADD_NOTE(shop.id, note_category_item.id)
    "
    :delete-url="
      (index) =>
        IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
          ? window.VAPI.DELETE_MY_VENDOR_CATEGORY_NOTE(
              vendor.id,
              note_category_item.id,
              index,
            )
          : window.API.DELETE_CATEGORY_NOTE(
              shop.id,
              note_category_item.id,
              index,
            )
    "
    :icon="
      note_category_item ? getShopImagePath(note_category_item.icon, 128) : null
    "
    :target="note_category_item"
    :title="note_category_item && note_category_item.title"
  ></b-note-dialog>

  <!-- █████████████████████ Dialog > Category > Bulk set profile █████████████████████ -->

  <v-dialog
    v-model="bulk_profile_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <b-category-bulk-action-set-logistic-profile
      v-if="selected_category_bulk_profile"
      :category="selected_category_bulk_profile"
      :shop="shop"
      :vendor="vendor"
      @close="bulk_profile_dialog = false"
    ></b-category-bulk-action-set-logistic-profile>
  </v-dialog>

  <!-- █████████████████████ Dialog > Category > Bulk discount █████████████████████ -->

  <b-inventory-bulk-discount
    v-if="selected_category_bulk_discount"
    v-model="bulk_discount_dialog"
    :category="selected_category_bulk_discount"
    :shop="shop"
  ></b-inventory-bulk-discount>

  <!-- █████████████████████ Dialog > Product > Change Status █████████████████████ -->

  <v-dialog
    v-model="status_product_dialog"
    :max-width="modern ? 560 : 640"
    :width="modern ? 'calc(100% - 32px)' : undefined"
    :aria-labelledby="modern ? `${$.uid}-status-title` : undefined"
    :aria-describedby="modern ? `${$.uid}-status-help` : undefined"
    scrollable
  >
    <v-card
      v-if="status_product_items?.length"
      class="text-start"
      :class="{ 'b-products-window__status-dialog sd-modern-widget': modern }"
      rounded="xl"
    >
      <v-card-title :class="{ 'b-products-window__status-heading': modern }">
        <v-icon :class="{ 'me-2': !modern }">{{ modern ? 'sync' : 'nat' }}</v-icon>
        <h2 v-if="modern" :id="`${$.uid}-status-title`">{{ $t('product_panel.workspace.status_dialog.title') }}</h2>
        <template v-else>Change Product Status</template>
        <v-btn
          v-if="modern"
          class="sd-modern-icon-button"
          variant="text"
          icon
          :aria-label="$t('global.actions.close')"
          @click="status_product_dialog = false"
        >
          <v-icon>close</v-icon>
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </v-card-title>
      <v-card-text :class="{ 'b-products-window__status-body': modern }">
        <div :class="{ 'b-products-window__status-identity': modern }">
          <products-dense-images-circles
            :ids="status_product_items.map((p) => p.id)"
            :size="modern ? status_product_items.length === 1 ? 38 : 30 : 32"
            :class="{ 'b-products-window__status-images': modern }"
          ></products-dense-images-circles>
          <div v-if="modern" class="b-products-window__status-copy">
            <div class="b-products-window__status-name">
              {{ status_product_items.length === 1 ? status_product_items[0].title : $t('product_panel.workspace.status_dialog.selected_count', { count: status_product_items.length }) }}
            </div>
            <div class="b-products-window__status-summary">
              <span>{{ $t('product_panel.workspace.status_dialog.current') }}:</span>
              <span v-for="item in product_status_summary" :key="item.code" class="b-products-window__status-summary-item">
                <span
                  class="sd-modern-status__dot"
                  :class="{
                    'sd-modern-status__dot--success': item.code === 'Open',
                    'sd-modern-status__dot--error': item.code === 'Close' || item.code === 'Rejected',
                    'sd-modern-status__dot--warning': item.code === 'Pending',
                  }"
                ></span>
                <span>{{ $t(item.name) }}<template v-if="status_product_items.length > 1"> ({{ item.count }})</template></span>
              </span>
            </div>
          </div>
        </div>
        <p v-if="modern" :id="`${$.uid}-status-help`" class="b-products-window__status-help">
          <v-icon size="15">bolt</v-icon>
          <span>{{ $t('product_panel.workspace.status_dialog.immediate') }}</span>
        </p>

        <u-smart-select
          v-model="product_status_input"
          :color="modern ? 'primary' : ProductStatus[status_product_items[0].status]?.color"
          :items="status_list"
          :loading="status_busy"
          :accessible="modern"
          :aria-label="modern ? $t('product_panel.workspace.status_dialog.title') : undefined"
          :aria-describedby="modern ? `${$.uid}-status-help` : undefined"
          :aria-busy="modern ? status_busy : undefined"
          :class="modern ? 'sd-modern-smart-select b-products-window__status-options' : 'my-8'"
          force-show-all
          gray-unselected
          :item-description="modern ? (status) => $t(`product_panel.workspace.status_dialog.statuses.${status.code}.description`) : 'description'"
          item-icon="icon"
          :item-text="modern ? (status) => $t(status.name) : 'title'"
          item-value="code"
          @change="onProductStatusChange"
        >
          <template v-if="modern" #append-title="{ item }">
            <span v-if="status_product_items.length === 1 && status_product_items[0].status === item.code" class="b-products-window__status-current">{{ $t('product_panel.workspace.status_dialog.current') }}</span>
          </template>
        </u-smart-select>
        <span v-if="modern" class="b-products-window__status-announcement" role="status">{{ status_busy ? $t('product_panel.workspace.status_dialog.updating') : '' }}</span>
      </v-card-text>
      <v-card-actions :class="{ 'b-products-window__status-footer': modern }">
        <div :class="modern ? 'b-products-window__status-actions' : 'widget-buttons'">
          <v-btn
            :size="modern ? undefined : 'x-large'"
            :variant="modern ? 'outlined' : 'text'"
            :class="{ 'sd-modern-button b-products-window__status-close': modern }"
            @click="status_product_dialog = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ████████████████████ Dialog > Edit shop root filters ████████████████████ -->
  <v-dialog
    v-if="!IS_VENDOR_PANEL"
    v-model="dialog_root_filter"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start sd-modern-canvas b-products-window__filter-editor">
      <v-card-title>
        <div class="b-products-window__filter-heading">
          <h2>{{ $t(parent_folders ? 'add_category.edit_filter.modern.category_title' : 'add_category.edit_filter.modern.root_title') }}</h2>
          <nav :aria-label="$t('add_category.edit_filter.modern.path_label')">
            <v-breadcrumbs :items="hierarchy_items" tag="ol" class="b-products-window__filter-breadcrumbs">
              <template #item="{ item, index }">
                <v-breadcrumbs-item :active="index === hierarchy_items.length - 1" class="b-products-window__filter-crumb">
                  <span v-if="index" class="b-products-window__filter-divider" aria-hidden="true">/</span>
                  <v-avatar size="32" class="b-products-window__filter-avatar">
                    <img
                      v-if="index === 0 ? shop.icon : item.image"
                      :src="getShopImagePath(index === 0 ? shop.icon : item.image, 64)"
                      alt=""
                    />
                    <v-icon v-else size="20" aria-hidden="true">{{ index === 0 ? 'storefront' : 'folder' }}</v-icon>
                  </v-avatar>
                  <span>{{ index === 0 ? shop.title : item.text }}</span>
                </v-breadcrumbs-item>
              </template>
            </v-breadcrumbs>
          </nav>
        </div>
        <v-btn
          class="sd-modern-icon-button"
          icon
          variant="text"
          :aria-label="$t('global.actions.close')"
          @click="dialog_root_filter = false"
        >
          <v-icon aria-hidden="true">close</v-icon>
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </v-card-title>
      <b-category-filter-editor
        hide-context
        @cancel="dialog_root_filter = false"
        :category="
          parent_folders
            ? parent_folders
            : {
                id: 'root',
                shop_id: shop.id,
                filters: shop.filters,
              }
        "
        :shop="shop"
        @edit-filters="
          (_filters) => {
            parent_folders
              ? (parent_folders.filters = _filters)
              : (shop.filters = _filters);
            dialog_root_filter = false;
          }
        "
      />
    </v-card>
  </v-dialog>

  <!-- ████████████████████ Dialog > Edit shop root engine ████████████████████ -->
  <v-dialog
    v-if="!IS_VENDOR_PANEL"
    v-model="dialog_root_engine"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start" :class="{ 'sd-modern-canvas b-products-window__editor': modern }">
      <v-card-title>
        <v-avatar class="avatar-gradient -thin -shop me-2" size="38">
          <img :src="getShopImagePath(shop.icon)" />
        </v-avatar>

        {{ shop.title }}
        <b v-if="parent_folders" class="ms-1">
          |

          <u-avatar-folder
            :border-size="5"
            :size="36"
            :src="getShopImagePath(parent_folders.icon, 64)"
            class="mx-1"
            is-amber
            side-icon="folder"
          ></u-avatar-folder>

          {{ parent_folders.title }}
        </b>
      </v-card-title>
      <v-card-text>
        <b-category-engine-editor
          :modern="modern"
          @cancel="dialog_root_engine = false"
          :category="
            parent_folders
              ? parent_folders
              : {
                  id: 'root',
                  shop_id: shop.id,
                  engine: shop.engine,
                }
          "
          :shop="shop"
          @edit-engine="
            (_engine) => {
              parent_folders
                ? (parent_folders.engine = _engine)
                : (shop.engine = _engine);
              dialog_root_engine = false;
            }
          "
          @edit-filters="
            (_filters) => {
              parent_folders
                ? (parent_folders.filters = _filters)
                : (shop.filters = _filters);
            }
          "
        />
      </v-card-text>
      <v-card-actions v-if="!modern">
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_root_engine = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BProductWindowProductLarge from "../../product/window/product/large/BProductWindowProductLarge.vue";
import SProductsSortView from "../../../storefront/product/sort/SProductsSortView.vue";
import BProductWindowCategoryLarge from "../../product/window/category/large/BProductWindowCategoryLarge.vue";

import CircleImage from "../../../ui/image/CircleImage.vue";
import UBreadcrumb from "../../../ui/breadcrumb/UBreadcrumb.vue";
import UButtonAdd from "../../../ui/button/add/UButtonAdd.vue";
import BCategoryAdd from "../../category/add/BCategoryAdd.vue";
import BProductWindowCategoryMini from "../../product/window/category/mini/BProductWindowCategoryMini.vue";
import BProductWindowProductMini from "../../product/window/product/mini/BProductWindowProductMini.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import BVendorInput from "../../vendor/input/BVendorInput.vue";

import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import USmartSwitch from "../../../ui/smart/switch/USmartSwitch.vue";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import USmartVerify from "../../../ui/smart/verify/USmartVerify.vue";
import BNoteDialog from "../../note/dialog/BNoteDialog.vue";
import BNoteButton from "../../note/button/BNoteButton.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductEditInfoIcon from "../edit/info/BProductEditInfoIcon.vue";
import BProductWindowSectionIcon from "./BProductWindowSectionIcon.vue";
import BTaxProfileBox from "../../tax/profile/box/BTaxProfileBox.vue";
import BCategoryBulkActionSetLogisticProfile from "../../category/bulk-action/set-logistic-profile/BCategoryBulkActionSetLogisticProfile.vue";
import BInventoryBulkDiscount from "../../inventory/bulk/discount/BInventoryBulkDiscount.vue";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import BInventoryFilter from "../../inventory/filter/BInventoryFilter.vue";
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import { delay, isObject } from "lodash-es";
import BCategoryFilterEditor from "../../category/filter/BCategoryFilterEditor.vue";
import SDenseImagesCircles from "../../../ui/image/SDenseImagesCircles.vue";
import UAvatarFolder from "../../../ui/avatar/folder/UAvatarFolder.vue";
import UDrop from "../../../ui/drag/core/UDrop.vue";
import UDrag from "../../../ui/drag/core/UDrag.vue";
import VPricingInput from "../../../storefront/pricing/VPricingInput.vue";
import BCategoryEngineEditor from "@selldone/components-vue/backoffice/category/engine/BCategoryEngineEditor.vue";
import BCategoryEnginePreview from "@selldone/components-vue/backoffice/category/engine/preview/BCategoryEnginePreview.vue";
import { BProductBreadcrumbsHelper } from "../breadcrumbs/helper/BProductBreadcrumbsHelper";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import ScrollHelper from "@selldone/core-js/utils/scroll/ScrollHelper.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { Category, Product } from "@selldone/core-js/models";
import { ShopURLs } from "@selldone/core-js/helper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";
import { CleanCache } from "@selldone/core-js/server";

export default {
  name: "BProductsWindow",
  mixins: [DateMixin],

  emits: [
    "click:ai-add",
    "change:folders",
    "change:parent-folder",
    "select-category",
    "select",
    "select:middle",
    "click:add",
    "click:fast-add",
  ],
  components: {
    BProductWindowSectionIcon,
    BProductEditInfoIcon,
    BCategoryEnginePreview,
    BCategoryEngineEditor,
    UDrag,
    UDrop,
    UAvatarFolder,
    SDenseImagesCircles,
    BCategoryFilterEditor,
    UFadeScroll,
    BInventoryFilter,
    USmartSelect,
    BInventoryBulkDiscount,
    BCategoryBulkActionSetLogisticProfile,
    BTaxProfileBox,
    BNoteButton,
    BNoteDialog,
    USmartVerify,
    ProductsDenseImagesCircles,
    USmartSwitch,
    UNumberInput,
    VPricingInput,

    BVendorInput,
    BProductWindowProductMini,
    BProductWindowCategoryMini,
    BCategoryAdd,
    UButtonAdd,
    UBreadcrumb,
    CircleImage,

    BProductWindowCategoryLarge,
    SProductsSortView,
    BProductWindowProductLarge,
  },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
    shop: {
      required: true,
    },

    set: {
      // Set: null : default , spec: for import spec
      required: false,
      type: String,
      default: null,
    },

    compactMode: {
      required: false,
      type: Boolean,
      default: false,
    },

    draggable: {
      required: false,
      type: Boolean,
      default: false,
    },
    dialogMode: {
      type: Boolean,
      default: false,
    },
    selectMode: {
      type: Boolean,
      default: false,
    },

    /**
     * Array of ids
     * ex: [254,51,...]
     *
     *
     * Object of ids
     * keys are product ids (ID) or category ids (c + ID)
     * ex: {254:[23,34,35],'c-20':true,...}
     *
     * or just one id
     */

    selectedList: {},

    withFullVariant: {
      type: Boolean,
      default: false,
    },

    addProductButton: {
      type: Boolean,
      default: false,
    },

    canSelectCategory: {
      type: Boolean,
      default: false,
    },
    canSelectProduct: {
      type: Boolean,
      default: true,
    },

    showDeletes: {
      type: Boolean,
      default: false,
    },
    showVendors: {
      type: Boolean,
      default: false,
    },
    showNotes: {
      // Show all note (even empty)
      type: Boolean,
      default: false,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    multiSelectProducts: {
      type: Boolean,
      default: false,
    },

    disableTypes: {
      // Disable selecting these types PHYSICAL, Virtual ,...
      type: Array,
    },

    withProductTranslations: { type: Boolean, default: false },
    withCategoryTranslations: { type: Boolean, default: false },

    dark: Boolean,
  },

  data: () => ({
    ProductType,
    importGrid: false,
    importFiltersOpen: false,
    importLoadError: false,
    importSearchTimer: null,
    importRequestId: 0,
    Slugify: Slugify,

    Category: Category,
    Product: Product,

    ProductStatus: ProductStatus,

    mini: true,
    local_view_mode: null,

    products: [],
    products_count: 0,
    busy_fetch: false,

    sort: null,
    only_available: false,

    current_dir_id: null,

    folders: [],

    parent_folders: null,

    current_dragged_product: null,
    current_dragged_folder: null,

    current_drop_enter_folder: null,

    held_items: [],
    held_folders: [],
    dragOverHolder: false,
    dragOverClone: false,

    show_spirit_container: false,

    // Pagination:
    folder_page: 1,
    product_page: 1,

    //-----------------------------------------
    showProductMenu: false,
    currentProductForMenu: null,
    currentCategoryForMenu: null,
    x: 0,
    y: 0,

    //-----------------------------------------
    search: null,
    vendor_filter: null,
    filters: [],

    //-----------------------------------------
    busy_delete: null,
    busy_restore: null,

    //------------------- UI ----------------------
    fixed: false,

    loading_cat: false,

    //------------------- Edit category ----------------------
    dialog_cat: false,
    dialog_pre: false,
    selected_cat: null,

    //------------------- Arrange ----------------------
    arrange_products_target: null,

    arrange_categories_target: null,
    arrange_folder_mode: false,

    //------------------- Vendors ----------------------
    dialog_vendors: false,
    assign_vendor_product_ids: null,
    vendor_id_input: null,
    busy_assign_vendor: false,
    pricing_id: null,
    quantity: 1,
    clear_other: false,
    check_bulk_vendor: false,

    //---------------- Key board -------------
    press_ctrl: false,
    key_listener_keydown: null,
    key_listener_up: null,

    //---------------- Multi Select Products -------------
    selected_products: [], // Keep selected product IDs

    //-------------------------------------
    note_product_item: null,
    note_product_dialog: false,

    //-------------------------------------
    note_category_item: null,
    note_category_dialog: false,

    //-------------------------------------
    selected_category_bulk_profile: null,
    bulk_profile_dialog: false,

    //-------------------------------------
    selected_category_bulk_discount: null,
    bulk_discount_dialog: false,

    //-------------------------------------
    status_product_items: null,
    status_product_dialog: false,
    status_busy: false,
    product_status_input: null,
    status_last_choice: null,

    //━━━━━━━━━━━━━━━━ 🞧 Extra objects return by special search ━━━━━━━━━━━━
    tax_profile: null,
    valuation_filter: null,
    time_filter: null, // timespan search: ?search=new~2023-08-10T20%3A00%3A00.000Z~2023-08-11T19%3A59%3A59.000Z

    //━━━━━━━━━━━━━━━━ Root shop filters ━━━━━━━━━━━━
    dialog_root_filter: false,
    busy_clear_root_filter: false,

    //━━━━━━━━━━━━━━━━ Root shop engine ━━━━━━━━━━━━
    dialog_root_engine: false,
  }),

  computed: {
    isSpecImport() {
      return this.modern && this.set === 'spec';
    },
    list_products_only() {
      return this.modern && !this.isSpecImport && !this.mini && !this.folders.length;
    },
    importSortOptions() {
      return [
        { value: 'default', title: this.$t('add_product.spec_import.default_sort') },
        { value: 'most_visited', title: this.$t('sort.most_views') },
        { value: 'most_popular', title: this.$t('sort.most_likes') },
        { value: 'newest', title: this.$t('sort.most_recent') },
        { value: 'bestselling', title: this.$t('sort.most_sell') },
        { value: 'cheapest', title: this.$t('sort.cheapest') },
        { value: 'most_expensive', title: this.$t('sort.most_expensive') },
      ];
    },
    route_types() {
      if (this.isSpecImport) return [];
      if (this.$route.name !== "BPageShopProductsList") return [];
      const selected = [this.$route.query.types].flat();
      return Object.values(ProductType)
        .map((type) => type.code)
        .filter((code) => selected.includes(code));
    },
    ShopURLs() {
      return ShopURLs;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    CAN_ADD_PRODUCT() {
      return (
        this.writeShopAccess(ShopPermissionRegions.PRODUCTS.code) &&
        (!this.IS_VENDOR_PANEL ||
          (this.shop.marketplace && this.shop.marketplace.product))
      );
    },
    CAN_ADD_CATEGORY() {
      return (
        !this.IS_VENDOR_PANEL ||
        (this.shop.marketplace && this.shop.marketplace.category)
      );
    },

    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    //--------------------------------------------------------------------------------

    inDragState() {
      return this.current_dragged_product || this.current_dragged_folder;
    },

    showEditButton() {
      return !this.set && !this.selectMode;
    },
    showRatting() {
      return !this.set;
    },
    showStatistics() {
      return !this.set;
    },
    showPrice() {
      return !this.set;
    },

    hierarchy_items() {
      const items = BProductBreadcrumbsHelper.GenerateCategoryHierarchy(
        this.$t("global.store"),
        this.parent_folders,
        undefined,
        true,
        this.dialogMode,
        null,
        this.IS_VENDOR_PANEL,
      );
      if (this.modern) {
        items.forEach((item) => {
          item.to.query["no-scroll"] = true;
        });
      }
      return items;
    },

    copy_product() {
      return this.$store.getters.getCopyProduct;
    },
    cut_product() {
      return this.$store.getters.getCutProduct;
    },

    //-----------------------------------------------------

    /**Bulk drag and drop*/
    drag_bundle_products() {
      return (
        this.current_dragged_product &&
        this.selected_products &&
        this.selected_products.includes(this.current_dragged_product.id)
      );
    },
    //------------------------ Context Menu -----------------------------
    menu_add_vendor_error() {
      if (
        !this.IS_MARKETPLACE ||
        this.IS_VENDOR_PANEL /*Only in marketplace panel*/
      )
        return null;
      if (this.currentProductForMenu?.type === ProductType.SUBSCRIPTION.code)
        return this.$t(
          "products_select.menu.subscription_vendor_not_support_message",
        );
      else if (this.currentProductForMenu?.vendor_id)
        return this.$t(
          "products_select.menu.vendor_owner_not_assignable_message",
        );
      return null;
    },

    is_menu_multi_select_product() {
      return (
        this.CAN_ADD_PRODUCT &&
        this.currentProductForMenu &&
        this.selected_products?.includes(this.currentProductForMenu.id)
      );
    },

    menu_context() {
      if (this.is_menu_multi_select_product) {
        return {
          icon: 'checklist',
          kind: this.$t('product_panel.workspace.context_menu.selection'),
          title: this.$t('product_panel.workspace.context_menu.selected_count', { count: this.selected_products.length }),
        };
      }
      const item = this.currentProductForMenu || this.currentCategoryForMenu;
      return {
        icon: this.currentProductForMenu ? 'inventory_2' : this.currentCategoryForMenu || this.parent_folders ? 'folder' : 'storefront',
        kind: this.$t(this.currentProductForMenu ? 'global.commons.product' : this.currentCategoryForMenu ? 'global.commons.category' : 'product_panel.workspace.context_menu.current_folder'),
        title: item?.title || this.parent_folders?.title || this.$t('global.store'),
      };
    },

    //-------------------------- Marketplace --------------------------
    marketplace_has_verification_step() {
      return this.shop.marketplace?.need_verify;
    },
    status_list() {
      return [
        ProductStatus.Open,
        ProductStatus.Close,
        ...(this.marketplace_has_verification_step
          ? [ProductStatus.Pending, ProductStatus.Rejected]
          : []),
      ];
    },
    product_status_summary() {
      return Object.values(ProductStatus)
        .map((status) => ({
          code: status.code,
          name: status.name,
          count: this.status_product_items?.filter((product) => product.status === status.code).length || 0,
        }))
        .filter((status) => status.count);
    },

    folder_pages_count() {
      return (
        this.folders &&
        Math.ceil(this.folders.length / this.max_folders_per_page)
      );
    },
    product_pages_count() {
      return (
        this.products &&
        Math.ceil(this.products_count / this.max_products_per_page)
      );
    },

    all_products_selected() {
      return this.selected_products.length === this.products.length;
    },

    current_engine() {
      return this.parent_folders
        ? this.parent_folders.engine
        : this.shop.engine;
    },

    current_filter() {
      return this.parent_folders
        ? this.parent_folders.filters
        : this.shop.filters;
    },

    max_folders_per_page() {
      if (this.isSpecImport) return 4;
      if (this.mini) {
        if (this.$vuetify.display.lgAndUp) {
          return 4 * 12;
        } else if (this.$vuetify.display.md) {
          return 4 * 6;
        } else if (this.$vuetify.display.sm) {
          return 4 * 4;
        }
        return 4 * 3;
      } else {
        return 8;
      }
    },
    max_products_per_page() {
      if (this.isSpecImport) return this.importGrid ? (this.$vuetify.display.width >= 940 ? 6 : 4) : 6;
      if (this.mini) {
        if (this.$vuetify.display.lgAndUp) {
          return 4 * 12;
        } else if (this.$vuetify.display.md) {
          return 4 * 6;
        } else if (this.$vuetify.display.sm) {
          return 4 * 4;
        }
        return 4 * 3;
      } else {
        return 8;
      }
    },
  },
  watch: {
    "$route.query"(query) {
      if (this.isSpecImport) return;
      this.current_dir_id = query.dir ? parseInt(query.dir) : null;
      this.search = query.search;
      this.applyRouteTypes();
      this.product_page = 1;
      this.folder_page = 1;
      this.fetchData();
      this.selected_products = [];
    },

    sort() {
      this.fetchData();
    },
    only_available() {
      this.fetchData();
    },

    showDeletes() {
      this.fetchData();
    },
    showVendors() {
      this.fetchData();
    },

    product_page() {
      this.fetchData();
    },
    max_products_per_page() {
      this.fetchData();
    },
    current_dir_id() {
      if (this.isSpecImport || this.modern) return;
      this.$nextTick(() => {
        ScrollHelper.scrollToElement("#sort_tools", 0, "smooth");
      });
    },
  },
  created() {
    if (this.isSpecImport) {
      this.fetchData();
      return;
    }
    // Load search query:
    this.search = this.$route.query.search;
    this.applyRouteTypes();

    // Set initial view mode:
    this.local_view_mode = localStorage.getItem("products-view-mode");
    this.mini = !this.local_view_mode || this.local_view_mode === "mini";

    this.current_dir_id = this.$route.query.dir
      ? parseInt(this.$route.query.dir)
      : null;

    this.fetchData();
  },

  mounted() {
    // The import dialog owns native controls; hidden Browse must not consume document shortcuts.
    if (this.isSpecImport) return;
    this.key_listener_keydown = (event) => {
      // Back press (go back)
      if (event.key === "Backspace") {
        // Check if there's any input or textarea in focus
        const activeElement = document.activeElement;
        if (
          !activeElement ||
          (activeElement.tagName !== "INPUT" &&
            activeElement.tagName !== "TEXTAREA")
        ) {
          const _to_category = this.parent_folders?.parent;
          if (
            this.busy_fetch ||
            (!this.$route.query.dir && !_to_category?.id) ||
            (_to_category &&
              parseInt(this.$route.query.dir) === _to_category?.id)
          )
            return;

          this.selectFolder(_to_category);
          return;
        }
      }

      if (!this.multiSelectProducts) return;

      this.press_ctrl = event.ctrlKey || event.metaKey /*Mac*/;
    };

    this.key_listener_up = (event) => {
      if (!this.multiSelectProducts) return;

      this.press_ctrl = false;
    };

    document.addEventListener("keydown", this.key_listener_keydown);
    document.addEventListener("keyup", this.key_listener_up);
  },

  beforeUnmount() {
    clearTimeout(this.importSearchTimer);
    this.importRequestId++;
    document.removeEventListener("keydown", this.key_listener_keydown);
    document.removeEventListener("keyup", this.key_listener_up);
  },

  methods: {
    onImportSearch(value) {
      this.search = value;
      clearTimeout(this.importSearchTimer);
      this.importSearchTimer = setTimeout(() => {
        this.product_page = 1;
        this.fetchData();
      }, window.SERACH_THROTTLE || 300);
    },
    toggleImportView() {
      this.importGrid = !this.importGrid;
      this.product_page = 1;
    },
    resetImportFilters() {
      clearTimeout(this.importSearchTimer);
      this.filters = [];
      this.only_available = false;
      this.vendor_filter = null;
      this.product_page = 1;
      this.fetchData();
    },
    selectImportProduct(product) {
      if (!this.isSpecImport || this.busy_fetch) return;
      this.$emit('select', product);
    },
    focusSelectedProduct(productId) {
      this.$nextTick(() => this.$refs.importProduct?.find((button) => button.dataset.productId === String(productId))?.focus());
    },
    importStatusClass(status) {
      return status === 'Open' ? 'sd-modern-status__dot--success' : status === 'Pending' ? 'sd-modern-status__dot--warning' : ['Close', 'Rejected'].includes(status) ? 'sd-modern-status__dot--error' : '';
    },
    //------------------------------ External methods ------------------------------
    /**
     * Call when main image changed by drag & drop image in products list management
     */
    updateProductMainImage(product_id, icon) {
      const product = this.products.find((i) => i.id === parseInt(product_id));
      if (!product) return false;
      product.icon = icon;
      return true;
    },
    updateCategoryImage(category_id, icon) {
      const category = this.folders.find((i) => i.id === parseInt(category_id));
      if (!category) return false;
      category.icon = icon;
      return true;
    },
    //------------------------------ Internal methods ------------------------------

    isSelected(item_id) {
      if (Array.isArray(this.selectedList)) {
        /**
         * Array of ids
         * ex: [254,51,...]
         */
        return this.selectedList.some(
          (item) => item.toString() === item_id.toString(),
        );
      } else if (isObject(this.selectedList)) {
        /**
         * Object of ids
         * keys are product ids (ID) or category ids (c + ID)
         * ex: {254:[23,34,35],'c-20':true,...}
         */
        return Object.keys(this.selectedList).some(
          (item) => item.toString() === item_id.toString(),
        ); //int & string support!
      } else return this.selectedList?.toString() === item_id.toString();
    },

    onDragStart(
      dragged,
      show_spirit_container = false,
      transferData,
      nativeEvent,
    ) {
      // ━━━━━━━━━━━━━━━━ product dragging ━━━━━━━━━━━━━━━━
      if (dragged.product) {
        this.current_dragged_product = dragged.product;
      }

      // ━━━━━━━━━━━━━━━━ category dragging ━━━━━━━━━━━━━━━━
      else if (dragged.category) {
        this.current_dragged_folder = dragged.category;
      }

      if (show_spirit_container)
        this.show_spirit_container = show_spirit_container;
    },

    handleDropInFolder(data, category_target) {
      if (!data) return;

      // -------------------------- Product --------------------------
      if (data.product) {
        this.setProductCategoryID(data.product.id, category_target.id, () => {
          if (category_target.id === this.current_dir_id) {
            // Drop in spirit container
            this.AddOrUpdateItemByID(this.products, data.product);
          } else {
            // Drop in category
            this.DeleteItemByID(this.products, data.product.id);
          }

          // Remove from holder.
          this.DeleteItemByID(this.held_items, data.product.id);

          // Remove cut product:
          this.$store.commit("setCutProduct", null);
        });
      }
      // -------------------------- Category --------------------------
      else if (data.category) {
        // ███████ Categories arrangement: ███████
        if (this.arrange_folder_mode) {
          this.onDropArrangeCategory(category_target);
          return;
        }

        if (data.category.id === category_target.id) return;
        this.setCategoryParentID(data.category.id, category_target.id, () => {
          if (category_target.id === this.current_dir_id) {
            // Drop in spirit container
            this.AddOrUpdateItemByID(this.folders, data.category);
          } else {
            // Drop in category
            this.DeleteItemByID(this.folders, data.category.id);
          }

          // Remove from holder.
          this.DeleteItemByID(this.held_folders, data.category.id);
        });
      }
      this.onDragEnd();

      // Force clean all temporary cache!
      CleanCache();
    },

    onDropEnter(category) {
      this.arrange_products_target = null; // Always reset arrangement blue bar (for products)
      this.arrange_categories_target = this.arrange_folder_mode
        ? category
        : null;

      delay(
        () => {
          this.current_drop_enter_folder = category;
        },
        this.show_spirit_container ? 500 : 0,
      ); // Solve jumping on drag over before animation ended!
    },

    onDropLeave() {
      this.$nextTick(() => {
        this.current_drop_enter_folder = null;
      });
    },
    handleDropInHolder(data) {
      if (data.product) {
        if (!this.held_items.some((item) => data.product.id === item.id))
          this.held_items.push(data.product);
      } else if (data.category) {
        if (!this.held_folders.some((item) => data.category.id === item.id))
          this.held_folders.push(data.category);
      }

      this.onDragEnd();
    },
    onDropEnterHolder() {
      this.current_drop_enter_folder = null;
      this.dragOverHolder = true;
      this.dragOverClone = false;
    },
    onDropLeaveHolder() {
      this.dragOverHolder = false;
    },

    handleDropInDuplicate(data) {
      if (data.product) {
        this.cloneProduct(data.product.id);
      }
      this.onDragEnd();
    },

    onDropEnterDuplicate() {
      this.current_drop_enter_folder = null;
      this.dragOverHolder = false;
      this.dragOverClone = true;
    },
    onDropLeaveDuplicate() {
      this.dragOverClone = false;
    },

    cloneProduct(product_id, category_id) {
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_CLONE_PRODUCT(this.vendor.id)
            : window.API.POST_CLONE_PRODUCT(this.shop.id),

          {
            product_id: product_id,
            category_id: category_id,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t("products_select.notifications.copy_success"),
            );
            this.AddOrUpdateItemByID(this.products, data.product);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        });
    },

    setProductCategoryID(product_id, category_id, success_callback) {
      const bundle = this.drag_bundle_products
        ? this.selected_products /*Add bundle products*/
        : null;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.changeCategory(
            this.vendor.id,
            product_id,
            category_id,
            bundle,
          )
        : window.$backoffice.product.changeCategory(
            this.shop.id,
            product_id,
            category_id,
            bundle,
          )
      )

        .then(({}) => {
          if (success_callback) success_callback();

          NotificationService.showSuccessAlert(
            null,
            this.$t("products_select.notifications.change_category_success"),
          );

          if (bundle) {
            if (category_id !== this.current_dir_id) {
              // Change the category of selected products?
              this.selected_products.forEach((id) => {
                this.DeleteItemByID(this.products, id); // Make sure remove all selected products from current category
              });
            }

            this.selected_products = []; // Reset selected products.
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        });
    },

    setCategoryParentID(category_id, parent_id, success_callback) {
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_MY_VENDOR_SET_CATEGORY_PARENT(
                this.vendor.id,
                category_id,
              )
            : window.API.PUT_SET_CATEGORY_PARENT(this.shop.id, category_id),

          {
            parent_id: parent_id,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            if (success_callback) success_callback();
            NotificationService.showSuccessAlert(
              null,
              this.$t("products_select.notifications.change_category_success"),
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        });
    },

    selectFolder(category) {
      if (this.isSpecImport) {
        clearTimeout(this.importSearchTimer);
        this.current_dir_id = category?.id || null;
        this.search = null;
        this.folder_page = 1;
        this.product_page = 1;
        this.fetchData();
        return;
      }
      this.loading_cat = category;
      this.$router.push({
        /*hash: this.hash,*/ query: { dir: category?.id, "no-scroll": true },
      }); // Dont scroll up!
    },

    onFilterChange() {
      if (this.isSpecImport) {
        this.product_page = 1;
        this.fetchData();
        return;
      }
      if (this.$route.name === "BPageShopProductsList") {
        const types = Object.values(ProductType)
          .map((type) => type.code)
          .filter((code) => this.filters?.includes(code));
        if (types.join() !== this.route_types.join()) {
          this.$router.push({
            query: {
              ...this.$route.query,
              types: types.length ? types : undefined,
            },
          });
          return;
        }
      }
      this.product_page = 1;
      this.fetchData();
    },

    applyRouteTypes() {
      if (this.isSpecImport) return;
      if (this.$route.name !== "BPageShopProductsList") return;
      this.filters = [
        ...(this.filters || []).filter(
          (code) =>
            !Object.values(ProductType).some((type) => type.code === code),
        ),
        ...this.route_types,
      ];
    },

    fetchData(force = false) {
      const offset = (this.product_page - 1) * this.max_products_per_page;
      const limit = this.max_products_per_page;

      const with_folders = this.product_page === 1;
      // Type links open the complete catalog without changing the folder used by add/move actions.
      const typed_catalog = this.route_types.length > 0 && !this.current_dir_id;

      const params = {
        statuses: this.filters?.filter((x) => !!ProductStatus[x]),
        types: this.filters?.filter((x) => !!ProductType[x]),

        offset,
        limit, // Just for update query!

        sort: this.sort,
        available: this.only_available,
        set: this.set, // null : default  ,   spec: for copy spec (list)
        dir: typed_catalog ? "*" : this.current_dir_id,
        with_product_variants: this.withFullVariant,
        with_parent: with_folders, // No parent if load more items!
        search: this.search,
        vendor: this.vendor_filter,

        products_only: typed_catalog || !with_folders, // Only products if load more!
        with_total: true,

        show_deletes: this.showDeletes, // Show deletes items
        show_vendors: this.showVendors, // Show dall vendors

        with_product_translations: this.withProductTranslations, // Return translations
        with_category_translations: this.withCategoryTranslations, // Return translations
      };
      if (
        !force &&
        JSON.stringify(this.LAST_QUERY_PARAMS) === JSON.stringify(params)
      ) {
        console.log("⛨ Prevent duplicated products list query.");
        return;
      }
      this.LAST_QUERY_PARAMS = params;
      // Import searches cancel older reads; only the latest browse request owns the view.
      const importRequestId = this.isSpecImport ? ++this.importRequestId : null;

      this.busy_fetch = true;
      if (this.isSpecImport) this.importLoadError = false;

      const handleSuccessResponse = ({
        folders,
        products,
        total,
        parent,
        tax_profile,
        valuation,
        time_filter,
      }) => {
        if (importRequestId !== null && importRequestId !== this.importRequestId) return;
        this.products_count = total;

        this.products = products;

        if (with_folders) {
          this.folders = folders;
          this.parent_folders = parent;
        }

        //━━━━━━━━━━━━━━━━ 🞧 Extra objects return by special search ━━━━━━━━━━━━
        this.tax_profile = tax_profile;
        this.valuation_filter = valuation;
        this.time_filter = time_filter;

        this.$emit("change:folders", this.folders);
        this.$emit("change:parent-folder", this.parent_folders);
      };

      (this.IS_VENDOR_PANEL
        ? /*🟢 Vendor Panel 🟢*/ window.$vendor.product
            .optimize(force ? 0 : 30)
            .cancellation()
            .list(this.vendor.id, offset, limit, params)
        : window.$backoffice.product
            .optimize(force ? 0 : 30)
            .cancellation()
            .list(this.shop.id, offset, limit, params)
      )

        // It always returns all folders!

        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          if (importRequestId !== null && (importRequestId !== this.importRequestId || error === undefined)) return;
          if (this.isSpecImport) this.importLoadError = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (importRequestId !== null && importRequestId !== this.importRequestId) return;
          this.busy_fetch = false;
        });
    },

    //-------------------- Context Menu -------------------------
    showMenu(e, product, category) {
      if (this.isSpecImport) return;
      //console.log('show',e)

      if (
        !product && !category && e.target.id !== "manage-panel" &&
        !(this.modern && !this.mini && e.target.classList?.contains("b-products-window__list-background"))
      ) {
        // Prevent conflicts with product context menu
        return;
      }

      this.currentProductForMenu = product;
      this.currentCategoryForMenu = category;

      e.preventDefault();
      this.showProductMenu = false;
      const anchor = e.type === "click" && !e.clientX && !e.clientY
        ? e.currentTarget?.getBoundingClientRect()
        : null;
      this.x = anchor ? anchor.x + anchor.width / 2 : e.clientX;
      this.y = anchor ? anchor.bottom : e.clientY;
      this.$nextTick(() => {
        this.showProductMenu = true;
      });
    },
    cutProduct(product) {
      this.$store.commit("setCutProduct", product);
      this.$store.commit("setCopyProduct", null);
    },

    copyProduct(product) {
      this.$store.commit("setCutProduct", null);
      this.$store.commit("setCopyProduct", product);
    },

    pastProduct(product) {
      this.cloneProduct(product.id, this.current_dir_id); // Past here
    },

    deleteProduct(product) {
      NotificationService.openDangerAlert(
        this.$t("add_product.delete_product.title"),
        this.$t("add_product.delete_product.message", {
          product_title: product.title,
        }),
        this.$t("global.actions.delete"),
        () => {
          this.busy_delete = product.id;
          axios
            .delete(
              this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.DELETE_MY_VENDOR_PRODUCT(
                    this.vendor.id,
                    product.id,
                  )
                : window.API.DELETE_PRODUCT(this.shop.id, product.id),
            )
            .then(({ data }) => {
              if (data.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
              } else {
                NotificationService.showSuccessAlert(
                  null,
                  "The product removed.",
                );
                // this.$emit("delete", product);

                if (this.showDeletes) {
                  product.deleted_at = data.deleted_at;
                } else {
                  this.DeleteItemByID(this.products, product.id);
                }
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        },
      );
    },

    deleteAllSelectedProduct(selected_products) {
      const product_titles = this.products
        .filter((p) => selected_products.includes(p.id))
        .map((p) => p.title);

      NotificationService.openDangerAlert(
        this.$t("add_product.delete_product.title"),
        this.$t("add_product.delete_product.message", {
          product_title: product_titles.join(", "),
        }),
        this.$t("global.actions.delete"),
        () => {
          this.busy_delete = "selected";
          axios
            .delete(
              this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.DELETE_MY_VENDOR_PRODUCTS_BULK(this.vendor.id)
                : window.API.DELETE_PRODUCTS_BULK(this.shop.id),
              {
                params: { ids: selected_products },
              },
            )
            .then(({ data }) => {
              if (data.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
              } else {
                NotificationService.showSuccessAlert(
                  `<b>${data.ids.length}</b>×  Removed`,
                  `Selected products has been removed successfully.`,
                );
                // this.$emit("delete", product);

                // Remove only deleted products (not valid ids will be removed in server side)
                if (this.showDeletes) {
                  this.products
                    .filter((p) => data.ids.includes(p.id))
                    .forEach((product) => {
                      product.deleted_at = data.deleted_at;
                    });
                } else {
                  this.products
                    .filter((p) => data.ids.includes(p.id))
                    .forEach((product) => {
                      this.DeleteItemByID(this.products, product.id);
                    });
                }
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              this.busy_delete = false;
            });
        },
      );
    },

    restoreProduct(product) {
      this.busy_restore = product.id;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_RESTORE_DELETED_PRODUCT(
                this.vendor.id,
                product.id,
              )
            : window.API.POST_RESTORE_DELETED_PRODUCT(this.shop.id, product.id),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              "The product restored successfully.",
            );

            this.AddOrUpdateItemByID(this.products, data.product);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_restore = false;
        });
    },

    showEditCategory(category) {
      this.selected_cat = category;

      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.dialog_cat = true;
        });
      });
    },

    // ---------------------------------------------------------------------------------

    toggleViewMode() {
      this.mini = !this.mini;
      this.local_view_mode = this.mini ? "mini" : "normal";
      localStorage.setItem("products-view-mode", this.local_view_mode);
    },

    onDragEnd() {
      this.current_dragged_product = null;
      this.current_dragged_folder = null;
      this.current_drop_enter_folder = null;
      this.dragOverHolder = false;
      this.show_spirit_container = false;
      this.dragOverClone = false;

      this.arrange_products_target = null;
      this.arrange_categories_target = null;
    },

    // ██████████████████████ Products Arrangement ██████████████████████
    dragenterProduct(product) {
      this.arrange_categories_target = null;

      if (!this.current_dragged_product) return;

      this.arrange_products_target = product;
      this.arrange_categories_target = null;
      // console.log("dragenterProduct", product.id);
    },

    onDropArrangeProduct(product) {
      //   console.log("onDropArrangeProduct-->", product.id,this.current_dragged_product.id);

      // Re-arrange:
      if (
        !this.current_dragged_product ||
        product === this.current_dragged_product
      )
        return;

      const origin_index = this.products.indexOf(this.current_dragged_product);
      const target_index = this.products.indexOf(product);
      if (origin_index < 0 || target_index < 0) return;
      // console.log("Re-arrange", origin_index, "->", target_index);

      this.products.move(origin_index, target_index);

      this.busy_arrange = true;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_CATEGORY_MOVE_PRODUCTS_ORDER(
                this.vendor.id,
                this.current_dir_id,
              )
            : window.API.POST_CATEGORY_MOVE_PRODUCTS_ORDER(
                this.shop.id,
                this.current_dir_id,
              ),
          {
            origin: this.current_dragged_product.id,
            target: product.id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_arrange = false;
        });

      this.arrange_products_target = null;
      this.current_dragged_product = null;
    },

    // ██████████████████████ Categories Arrangement ██████████████████████
    onDropArrangeCategory(category) {
      // Re-arrange:
      if (
        !this.current_dragged_folder ||
        category === this.current_dragged_folder
      )
        return;

      const origin_index = this.folders.indexOf(this.current_dragged_folder);
      const target_index = this.folders.indexOf(category);
      if (origin_index < 0 || target_index < 0) return;
      //console.log("Re-arrange", origin_index, "->", target_index);

      this.folders.move(origin_index, target_index);

      this.busy_arrange = true;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_CATEGORY_MOVE_CATEGORIES_ORDER(
                this.vendor.id,
                this.current_dir_id,
              )
            : window.API.POST_CATEGORY_MOVE_CATEGORIES_ORDER(
                this.shop.id,
                this.current_dir_id,
              ),
          {
            origin: this.current_dragged_folder.id,
            target: category.id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_arrange = false;
        });

      this.arrange_categories_target = null;
      this.current_dragged_folder = null;
    },

    // ██████████████████████ Add Vendor ██████████████████████

    showAssignVendor(product) {
      this.assign_vendor_product_ids =
        this.selected_products &&
        this.selected_products.includes(
          product.id,
        ) /*Right click on selected item!*/
          ? this.selected_products
          : [product.id];
      this.check_bulk_vendor = false;
      this.dialog_vendors = true;
    },
    assignVendor() {
      this.busy_assign_vendor = true;

      axios
        .post(window.API.POST_ASSIGN_VENDORS_TO_PRODUCTS(this.shop.id), {
          product_ids: this.assign_vendor_product_ids,
          vendor_ids: this.vendor_id_input ? [this.vendor_id_input] : [],
          pricing_id: this.pricing_id,
          quantity: this.quantity,
          clear: this.clear_other,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Vendors have been added to selected products.",
            );
            this.dialog_vendors = false;

            if (this.showVendors) {
              // Need to refresh data.
              this.fetchData();
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_assign_vendor = false;
        });
    },

    // ██████████████████████ Multi Select Products ██████████████████████

    toggleProductsSelect(product) {
      this.selected_products.toggle(product.id);
    },
    // ██████████████████████ Notes ██████████████████████

    showNoteProduct(product) {
      this.note_product_item = product;
      this.note_product_dialog = true;
    },

    showNoteCategory(category) {
      this.note_category_item = category;
      this.note_category_dialog = true;
    },
    // ██████████████████████ Category bulk profile assigment ██████████████████████
    showSetBulkCategoryProfile(category) {
      this.selected_category_bulk_profile = category;
      this.bulk_profile_dialog = true;
    },

    showCategoryBulkDiscount(category) {
      this.selected_category_bulk_discount = category;
      this.bulk_discount_dialog = true;
    },

    // ██████████████████████ Product Status ██████████████████████

    showChangeStatusProduct(...products) {
      this.status_product_items = products;
      this.product_status_input =
        products?.length === 1 ? products[0].status : null;
      this.status_last_choice = this.product_status_input;
      this.status_product_dialog = true;
    },
    onProductStatusChange(status) {
      // The accessible selector can activate its checked row; keep that choice a no-op.
      if (this.modern && status === this.status_last_choice) return;
      this.status_last_choice = status;
      this.setBulkProductStatus(status, this.status_product_items);
    },
    setBulkProductStatus(status, products) {
      this.status_busy = true;
      axios
        .post(window.API.POST_ASSIGN_STATUS_TO_PRODUCTS(this.shop.id), {
          product_ids: products.map((p) => p.id),
          status: status,
        })
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Product(s) status has been updated successfully.",
            );
            this.status_product_dialog = false;
            products.forEach((p) => (p.status = status)); // Update status of products in local.
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.status_busy = false;
        });
    },

    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * 🛑 DO NOT CHANGE IT!
     * This function is called externally.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *
     * Do not change! Called externally.
     * ex. $refs.products_list?.onAddOrUpdateProduct
     */
    onAddOrUpdateProduct(product) {
      this.AddOrUpdateItemByID(this.products, product);
    },
    /**
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     * 🛑 DO NOT CHANGE IT!
     * This function is called externally.
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     *
     *
     * Do not change! Called externally.
     * ex. $refs.products_list?.onAddOrUpdateCategory
     */
    onAddOrUpdateCategory(category) {
      if (category.parent_id !== this.current_dir_id) {
        // Category's parent changed! Remove from current category:
        this.DeleteItemByID(this.folders, category.id);
      } else {
        // Add or update in current category:
        this.AddOrUpdateItemByID(this.folders, category);
      }
    },

    showClearRootFiltersDialog(category) {
      NotificationService.openConfirmationAlert(
        `Remove ${category ? category.title : "Root"} Filter`,
        "Do you want to clear filter of this category?",
        "Yes, Clear filters",
        () => {
          this.clearRootFilters(category);
        },
      );
    },
    clearRootFilters(category) {
      this.busy_clear_root_filter = true;
      axios
        .delete(
          window.API.DELETE_CATEGORY_FILTER(
            this.shop.id,
            category ? category.id : "root",
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            NotificationService.showSuccessAlert(
              null,
              "Root filters has been removed successfully.",
            );
            if (category) {
              category.filters = data.filters;
            } else {
              this.shop.filters = data.filters;
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_clear_root_filter = false;
        });
    },

    selectAllProducts(select) {
      this.selected_products = select ? this.products.map((p) => p.id) : [];
    },
  },
};
</script>

<style lang="scss" scoped src="./style.scss"></style>

<style lang="scss" scoped>
.b-products-window__location,
.b-products-window__catalog,
.b-products-window__categories,
.b-products-window__products,
.b-products-window__tools,
.b-products-window__feature-body,
.b-products-window__feature-actions {
  display: contents;
}

.b-products-window--list {
  container: b-products-workspace / inline-size;
  .b-products-window__catalog { container: b-products-workspace / inline-size; }
  #manage-panel {
    container: b-products-catalog / inline-size;
    display: grid;
    grid-template-columns: 246px minmax(0, 1fr);
    gap: 0 20px;
    align-items: start;
    margin: 0;
  }

  .b-products-window__categories,
  .b-products-window__products {
    display: block;
    min-width: 0;
    > .v-col, > [class*="v-col-"] { width: 100%; max-width: none; flex: none; padding: 0; }
  }
  .b-products-window__categories { grid-column: 1; align-self: stretch; }
  .b-products-window__products {
    position: relative;
    grid-column: 2;
    align-self: stretch;
    &::before {
      content: "";
      position: absolute;
      inset-block: 0;
      inset-inline-start: -10px;
      border-inline-start: 1px solid var(--sd-modern-border);
      pointer-events: none;
    }
  }
  .b-products-window__drop-box { grid-column: 1 / -1; width: 100%; max-width: none; }

  .b-products-window__list-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 12px;
    min-height: 43px;
    padding: 4px 10px 12px;
    h2 { display: flex; align-items: center; gap: 7px; margin: 0; font-family: inherit; font-size: 14px; font-weight: 500; line-height: 21px; letter-spacing: 0; }
    h2 > .b-products-window__section-icon { display: block; flex-shrink: 0; color: var(--sd-modern-muted); }
    span { color: var(--sd-modern-muted); font-size: 13px; font-weight: 400; line-height: 20px; }
    h2 > span { margin-inline-start: 2px; }
  }
  .b-products-window__product-heading { padding-inline: 12px; }
  .b-products-window__list-pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 42px;
    padding: 0 10px 10px;
    margin: 0;
    border: 0;
    > :deep(.v-pagination) { min-width: 0; }
  }
  .b-products-window__selection {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    > .v-btn { min-height: 28px; height: auto; padding: 3px 6px; font-size: 13px; font-weight: 500; line-height: 20px; }
  }
  .b-products-window__back {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    margin-block-end: 4px;
    border-radius: 8px;
    color: rgb(var(--v-theme-on-surface));
    text-align: start;
    font-family: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    > span { min-width: 0; overflow-wrap: anywhere; }
    > .v-icon { flex-shrink: 0; }
    &:disabled { opacity: .5; pointer-events: none; }
  }
  .b-products-window__list-columns {
    display: grid;
    grid-template-columns: 24px minmax(140px, 1fr) 88px 72px 100px 146px;
    align-items: center;
    gap: 10px;
    min-height: 32px;
    padding: 0 12px 8px;
  }
  .b-products-window__select-page {
    grid-column: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
    cursor: pointer;
    > input { width: 16px; height: 16px; accent-color: rgb(var(--v-theme-primary)); cursor: pointer; }
    > input:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }
  .b-products-window__select-page-label { display: none; }
  .b-products-window__column-product { grid-column: 2; }
  .b-products-window__column-price { grid-column: 3; text-align: end; }
  .b-products-window__column-stock { grid-column: 4; }
  .b-products-window__column-activity { grid-column: 5; }
  .b-products-window__column-actions { grid-column: 6; text-align: end; }
  .b-products-window__list-empty { padding: 18px 12px; margin: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }

  @container b-products-workspace (width > 760px) {
    &:not(.b-products-window--products-only) {
      // Native pages share three header tracks and eight natural item tracks; unused tracks collapse.
      #manage-panel { grid-template-rows: repeat(3, auto) repeat(8, auto); }
      .b-products-window__categories,
      .b-products-window__products {
        --b-products-list-row-min-height: 72px;
        --b-products-list-item-height: 100%;
        display: grid;
        grid-template-rows: subgrid;
        grid-row: span 11;
      }
      .b-products-window__list-heading { grid-row: 1; }
      .b-products-window__list-pagination { grid-row: 2; }
      .b-products-window__back-column,
      .b-products-window__list-columns { grid-row: 3; }
      .b-products-window__list-columns { padding-block: 8px; }
      .b-products-window__back-column { display: flex; }
      .b-products-window__back { flex: 1; margin-block-end: 0; }
      .b-products-window__list-item { grid-row: var(--b-products-list-row); min-width: 0; }
      .b-products-window__categories > .b-products-window__list-item :deep(.f-anim) { height: 100%; }
      .b-products-window__list-empty { grid-row: 4; border-block-start: 1px solid var(--sd-modern-border); }
    }
  }

  @container b-products-catalog (max-width: 1060px) {
    .b-products-window__categories { width: 210px; }
    .b-products-window__products::before { inset-inline-start: -7px; }
    .b-products-window__list-columns { grid-template-columns: 24px minmax(130px, 1fr) 83px 70px 100px 108px; gap: 9px; }
  }
  @container b-products-catalog (max-width: 850px) {
    .b-products-window__list-columns { grid-template-columns: 24px minmax(130px, 1fr) 83px 70px 108px; }
    .b-products-window__column-activity { display: none; }
    .b-products-window__column-actions { grid-column: 5; }
  }
  @container b-products-catalog (max-width: 760px) {
    .b-products-window__categories { width: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 12px; }
    .b-products-window__categories > .b-products-window__list-heading,
    .b-products-window__categories > .sd-modern-table-footer,
    .b-products-window__categories > .v-col:first-of-type:has(> .b-products-window__back),
    .b-products-window__categories > .b-products-window__list-empty { grid-column: 1 / -1; }
    .b-products-window__products { grid-column: 1 / -1; margin-block-start: 20px; }
    .b-products-window__products::before { content: none; }
    .b-products-window__list-pagination:empty { display: none; }
    .b-products-window__list-columns { grid-template-columns: 24px minmax(130px, 1fr) 83px 70px 146px; }
  }
  @container b-products-catalog (max-width: 530px) {
    .b-products-window__categories { display: block; }
    .b-products-window__list-columns { display: block; min-height: 0; padding: 0; }
    .b-products-window__list-columns > span { display: none; }
    .b-products-window__select-page { justify-content: flex-start; gap: 10px; min-height: 44px; padding-inline: 14px; font-size: 13px; font-weight: 400; line-height: 20px; letter-spacing: 0; text-transform: none; }
    .b-products-window__select-page-label { display: inline; }
    .b-products-window__selection > .v-btn { min-height: 44px; }
    .b-products-window__back { min-height: 44px; }
  }
  @container b-products-workspace (max-width: 1060px) { #manage-panel { grid-template-columns: 210px minmax(0, 1fr); gap: 0 14px; } }
  @container b-products-workspace (max-width: 760px) { #manage-panel { grid-template-columns: minmax(0, 1fr); } .b-products-window__categories { grid-column: 1 / -1; } }
}

.b-products-window--list.b-products-window--products-only {
  #manage-panel { grid-template-columns: minmax(0, 1fr); }
  .b-products-window__categories {
    // Keep the native parent-folder action in the flow when there are no category rows.
    display: contents;
    > .b-products-window__list-heading,
    > .b-products-window__list-pagination,
    > .b-products-window__list-empty { display: none; }
  }
  .b-products-window__products { grid-column: 1 / -1; margin-block-start: 0; }
  .b-products-window__products::before { content: none; }
}

.b-products-window__status-dialog {
  padding: 0 !important;
  border: 1px solid var(--sd-modern-border);
  border-radius: 16px !important;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 10px 34px rgba(var(--v-theme-on-surface), .11) !important;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  .b-products-window__status-heading { display: flex; align-items: center; gap: 11px; padding: 18px 22px 16px; white-space: normal; }
  .b-products-window__status-heading > .v-icon { flex-shrink: 0; color: var(--sd-modern-muted); font-size: 22px !important; }
  .b-products-window__status-heading h2 { flex: 1; min-width: 0; margin: 0; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 25px; letter-spacing: -.2px; }
  .b-products-window__status-heading > .sd-modern-icon-button { flex-shrink: 0; width: 32px !important; min-width: 32px !important; height: 32px !important; min-height: 32px !important; }
  .b-products-window__status-heading > .sd-modern-icon-button :deep(.v-icon) { font-size: 18px !important; }
  .b-products-window__status-body { padding: 0 22px 18px !important; letter-spacing: normal; }
  .b-products-window__status-identity { display: flex; align-items: center; gap: 12px; min-width: 0; padding-block: 13px 17px; border-block-start: 1px solid var(--sd-modern-border); }
  .b-products-window__status-images { flex: 0 1 auto; min-width: 0; max-width: 240px; padding: 0 !important; }
  .b-products-window__status-images :deep(.citm) { flex-shrink: 0; margin-inline-end: 0 !important; }
  .b-products-window__status-images :deep(.citm:not(:first-child)) { margin-left: 0 !important; margin-right: 0 !important; margin-inline-start: -6px !important; }
  .b-products-window__status-copy { flex: 1; min-width: 0; }
  .b-products-window__status-name { font-size: 14px; font-weight: 500; line-height: 21px; overflow-wrap: anywhere; }
  .b-products-window__status-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-products-window__status-summary-item { display: inline-flex; align-items: center; gap: 5px; margin-inline-end: 5px; white-space: nowrap; }
  .b-products-window__status-summary-item > .sd-modern-status__dot { width: 5px; height: 5px; }
  .b-products-window__status-help { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 12px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  .b-products-window__status-help > .v-icon { flex-shrink: 0; margin-block-start: 2px; font-size: 15px !important; }
  .b-products-window__status-announcement { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .b-products-window__status-current { margin-inline-start: 8px; color: var(--sd-modern-muted); font-family: inherit; font-size: 11px; font-weight: 400; line-height: 16px; }
  .b-products-window__status-options { margin: 0; }
  .b-products-window__status-options :deep(> .rounded-card) { border: 1px solid var(--sd-modern-border); border-radius: 12px !important; }
  .b-products-window__status-options :deep(> .rounded-card > .pp) { min-height: 68px; padding: 12px 14px !important; border-color: var(--sd-modern-border) !important; }
  .b-products-window__status-options :deep(.mnh) { gap: 12px; min-height: 42px; }
  .b-products-window__status-options :deep(.mnh > .flex-grow-0) { flex: 0 0 22px; width: 22px; margin: 0 !important; padding: 0; background: transparent !important; }
  .b-products-window__status-options :deep(.mnh > .flex-grow-0 > .text-center) { width: 22px !important; }
  .b-products-window__status-options :deep(.mnh > .flex-grow-0 .v-icon) { color: var(--sd-modern-muted) !important; font-size: 20px !important; }
  .b-products-window__status-options :deep(.circle-check) { width: 18px; height: 18px; margin: 2px; animation: none; }
  .b-products-window__status-options :deep(.circle-check .v-progress-circular) { width: 12px !important; height: 12px !important; }
  .b-products-window__status-options :deep(.mnh > .flex-grow-1 > b) { font-family: inherit; font-size: 14px; font-weight: 500; line-height: 21px; }
  .b-products-window__status-options :deep(.mnh > .flex-grow-1 > .small) { margin-block-start: 2px; color: var(--sd-modern-muted); font-family: inherit; font-size: 13px; font-weight: 400; line-height: 20px; opacity: 1 !important; }
  .b-products-window__status-options :deep(.mnh > .v-icon) { flex-shrink: 0; margin: 0 !important; color: inherit; font-size: 18px !important; opacity: .65; }
  .b-products-window__status-options :deep(.pp[aria-checked="true"]) { background: rgba(var(--v-theme-on-surface), .035) !important; }
  .b-products-window__status-footer { min-height: 0; padding: 13px 22px 16px; border-block-start: 1px solid var(--sd-modern-border); }
  .b-products-window__status-actions { display: flex; justify-content: flex-end; width: 100%; }
  .b-products-window__status-close { min-height: 42px; height: auto; padding: 8px 15px; border-color: var(--sd-modern-border); font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; text-transform: none; }
  .b-products-window__status-close :deep(.v-icon) { font-size: 18px !important; }

  @media (max-width: 450px) {
    .b-products-window__status-heading { padding: 15px 16px 13px; gap: 9px; }
    .b-products-window__status-heading h2 { font-size: 17px; line-height: 24px; }
    .b-products-window__status-body { padding: 0 16px 16px !important; }
    .b-products-window__status-identity { flex-wrap: wrap; gap: 9px; }
    .b-products-window__status-images { max-width: 100%; flex-wrap: wrap; }
    .b-products-window__status-copy { flex-basis: 160px; }
    .b-products-window__status-options :deep(> .rounded-card > .pp) { padding: 12px !important; }
    .b-products-window__status-options :deep(.mnh) { gap: 10px; }
    .b-products-window__status-options :deep(.mnh > .v-icon) { max-width: 20px; white-space: normal; }
    .b-products-window__status-footer { padding: 12px 16px 14px; }
  }
  @media (max-width: 599px), (pointer: coarse) {
    .b-products-window__status-heading > .sd-modern-icon-button { width: 44px !important; min-width: 44px !important; height: 44px !important; min-height: 44px !important; }
    .b-products-window__status-close { min-height: 44px; }
  }
}

.b-products-window__context {
  width: 100%;
  padding: 0 !important;
  max-height: inherit;
  overflow-y: auto;
  overscroll-behavior: contain;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--sd-modern-border);
  border-radius: 13px !important;
  box-shadow: 0 10px 34px rgba(var(--v-theme-on-surface), .11) !important;
  font-family: inherit;
  font-size: 13px;
  line-height: 19.5px;

  .b-products-window__context-heading { display: flex; align-items: center; gap: 10px; padding: 13px 15px; border-block-end: 1px solid var(--sd-modern-border); }
  .b-products-window__context-identity { display: grid; place-items: center; flex-shrink: 0; width: 34px; height: 34px; border-radius: 8px; color: var(--sd-modern-muted); background: rgba(var(--v-theme-on-surface), .035); }
  .b-products-window__context-copy { flex: 1; min-width: 0; }
  .b-products-window__context-kind { color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 16px; }
  .b-products-window__context-heading h2 { margin: 0; font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; overflow-wrap: anywhere; }
  .b-products-window__context-state { display: inline-flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 5px; max-width: 100px; color: var(--sd-modern-muted); font-family: inherit; font-size: 11px; font-weight: 400; line-height: 16px; }
  > .v-list { padding: 5px 6px !important; color: inherit; background: transparent; }
  > .v-list + .v-list { border-block-start: 1px solid var(--sd-modern-border); }
  .v-list-item { min-height: 36px; padding: 7px 9px; border-radius: 7px; color: inherit; }
  .v-list-item:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }
  :deep(.v-list-item-title) { font-family: inherit; font-size: 13px; font-weight: 500; line-height: 20px; letter-spacing: 0; white-space: normal; overflow-wrap: anywhere; }
  :deep(.v-list-item-subtitle) { margin-block-start: 1px; color: var(--sd-modern-muted); font-family: inherit; font-size: 11px; font-weight: 400; line-height: 16px; letter-spacing: 0; white-space: normal; overflow: visible; overflow-wrap: anywhere; opacity: 1; -webkit-line-clamp: unset; }
  :deep(.v-list-item__prepend > .v-icon) { font-size: 17px !important; opacity: 1; color: var(--sd-modern-muted); }
  :deep(.v-list-item__prepend > .v-list-item__spacer) { width: 10px; }
  :deep(.v-list-item__append > .v-icon) { opacity: 1; color: var(--sd-modern-muted); }
  :deep(.v-list-item__append > .v-list-item__spacer) { width: 8px; }
  :deep(.v-list-item__prepend > .v-avatar) { margin-inline-end: 0 !important; }
  .v-divider { margin: 5px -6px !important; border-color: var(--sd-modern-border); opacity: 1; }
  .b-products-window__context-notice { display: flex; align-items: flex-start; gap: 8px; margin: 3px 9px 5px; padding: 9px 10px; border-radius: 7px; background: rgba(var(--v-theme-on-surface), .035); color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  .b-products-window__context-notice > .v-icon { flex-shrink: 0; margin: 1px 0 0 !important; font-size: 15px !important; }

  @media (max-width: 599px), (pointer: coarse) {
    .v-list-item { min-height: 44px; }
  }
}

.b-products-window--modern {
  padding: 0;
  border: 0;
  font-size: 13px;
  line-height: 1.5;

  .b-products-window__catalog {
    display: block;
    padding: 15px 17px 17px;
    border: 0;
    border-radius: 17px;
    font-size: inherit;
    line-height: inherit;
  }
  .b-products-window__tool-row { margin: 18px 0 0; }

  #manage-panel .item { transition: none; }

  #manage-panel :deep(.b-product-window-product-mini__note) {
    display: inline-flex;
    top: -14px !important;
    left: auto !important;
    right: auto !important;
    inset-inline-start: -8px !important;
  }
  #manage-panel :deep(.b-product-window-product-mini__note > .v-btn),
  #manage-panel :deep(.b-products-window__folder-note > .v-btn) {
    width: 36px !important;
    min-width: 36px !important;
    height: 36px !important;
    min-height: 36px !important;
    padding: 0;
  }
  #manage-panel :deep(.b-product-window-product-mini__note > .v-btn > .v-btn__content > .v-icon),
  #manage-panel :deep(.b-products-window__folder-note > .v-btn > .v-btn__content > .v-icon) {
    font-size: 16px !important;
  }
  @media (max-width: 600px), (pointer: coarse) {
    // Move the larger touch target outward to keep the visible marker in the same place.
    #manage-panel :deep(.b-product-window-product-mini__note) {
      top: -18px !important;
      inset-inline-start: -12px !important;
    }
    #manage-panel :deep(.b-product-window-product-mini__note > .v-btn),
    #manage-panel :deep(.b-products-window__folder-note > .v-btn) {
      width: 44px !important;
      min-width: 44px !important;
      height: 44px !important;
      min-height: 44px !important;
    }
  }

  .b-products-window__location {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding-block: 10px 13px;
  }

  .b-products-window__breadcrumbs {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    margin: 0;
    :deep(.v-breadcrumbs) { padding: 0; min-height: 36px; font-size: 12px; line-height: 18px; }
  }

  .b-products-window__sort {
    min-height: 0;
    overflow: visible;
    flex-wrap: wrap;
    gap: 12px;
    padding-block: 11px 13px;
    margin-block-end: 0;
    border-block-end: 1px solid var(--sd-modern-border);

    :deep(> .v-spacer) { display: none; }
    :deep(> div:has(> .v-btn-toggle)) { order: 2; flex: 1; }
    :deep(> .s-products-sort-view__availability-group) { order: 1; }
    :deep(> .v-btn:first-child) { order: 1; }
    :deep(> .show-on-small-900) { order: 2; margin-inline-end: auto; }
    :deep(> .v-btn:not(.b-products-window__view-button)) {
      height: 36px !important;
      min-height: 36px;
      padding-inline: 6px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
    }
    :deep(> .v-btn .v-icon) { font-size: 18px !important; margin-block: 0 !important; }
    :deep(.v-btn-toggle:not(.s-products-sort-view__availability-group)) { height: 36px; gap: 5px; }
    :deep(.v-btn-toggle:not(.s-products-sort-view__availability-group) > .v-btn) {
      height: 36px !important;
      min-height: 36px;
      border-radius: 7px;
      padding: 7px 8px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      line-height: 15px;
      letter-spacing: 0;
    }
    :deep(.v-btn-toggle:not(.s-products-sort-view__availability-group) > .dark-flat) {
      color: rgb(var(--v-theme-on-surface)) !important;
      background: var(--sd-modern-canvas-color) !important;
    }
    :deep(.search-box) {
      order: 9;
      flex: 0 1 220px;
      margin: 0 !important;
      margin-inline-start: auto !important;
      min-width: 150px !important;
      max-width: 280px;
    }
    :deep(.search-box .v-field) { background: transparent; box-shadow: none; }
    :deep(.search-box .v-field__input) {
      font-family: inherit;
      font-size: 12px;
      line-height: 20px;
    }
    :deep(.search-box .v-field__prepend-inner .v-icon) { font-size: 18px; }
  }

  .b-products-window__view-button { order: 3; }
  .b-products-window__toolbar-break { order: 6; flex-basis: 100%; }
  .b-products-window__inventory-filter { order: 7; flex: 0 1 230px; }
  .b-products-window__vendor-filter { order: 8; flex: 0 1 230px; }

  .b-products-window__tools {
    --tool-outer-radius: 12px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(min-content, 1fr) max-content;
    gap: 5px;
    flex: 0 0 100%;
    width: 100%;
    margin: 0;
    align-items: stretch;

    > :deep([class*="v-col-"]) {
      --tool-start-start: 2px;
      --tool-start-end: 2px;
      --tool-end-start: 2px;
      --tool-end-end: 2px;
      width: auto;
      max-width: none;
      min-width: 0;
      flex: none;
      grid-row: span 2;
      padding: 0 !important;
    }

    > :deep([class*="v-col-"]:not(.b-products-window__creation-stack)) {
      display: grid !important;
      grid-template-rows: subgrid;
    }

    &:not(:has(> :nth-child(4))) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    > :deep(:first-child) {
      --tool-start-start: var(--tool-outer-radius);
      --tool-end-start: var(--tool-outer-radius);
    }
    > :deep(:last-child) {
      --tool-start-end: var(--tool-outer-radius);
      --tool-end-end: var(--tool-outer-radius);
    }
  }

  .b-products-window__creation-stack {
    --tool-outer-radius: 10px;
    display: grid !important;
    grid-template-rows: repeat(3, minmax(100px, 1fr));
    gap: 5px;

    .b-products-window__create:not(:first-child) {
      border-start-start-radius: 2px !important;
      border-start-end-radius: 2px !important;
    }
    .b-products-window__create:not(:last-child) {
      border-end-start-radius: 2px !important;
      border-end-end-radius: 2px !important;
    }
  }

  .b-products-window__create {
    margin: 0 !important;
    min-height: 100px;
    height: auto !important;
    border: 1px solid var(--sd-modern-border);
    border-start-start-radius: var(--tool-start-start, 10px) !important;
    border-start-end-radius: var(--tool-start-end, 10px) !important;
    border-end-start-radius: var(--tool-end-start, 10px) !important;
    border-end-end-radius: var(--tool-end-end, 10px) !important;
    box-shadow: none !important;
    color: rgb(var(--v-theme-on-surface));

    :deep(.sprite) { display: none; }
    :deep(.center-content) {
      position: static;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 6px;
      min-height: 100px;
      padding: 13px;
      margin: 0;
      transform: none;
    }
    :deep(.-title.small) { font-size: 12px !important; font-weight: 500; line-height: 18px; }
    :deep(.-message) { font-size: 11px; font-weight: 400; line-height: 16px; opacity: .75; }
    :deep(.v-icon) { color: rgb(var(--v-theme-primary)); }
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  }

  .b-products-window__create--primary {
    border-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    :deep(.v-icon) { color: inherit; }
  }

  .b-products-window__feature {
    display: grid;
    grid-row: span 2;
    grid-template-rows: subgrid;
    height: 100%;
    padding: 12px 13px;
    border-start-start-radius: var(--tool-start-start, 12px);
    border-start-end-radius: var(--tool-start-end, 12px);
    border-end-start-radius: var(--tool-end-start, 12px);
    border-end-end-radius: var(--tool-end-end, 12px);
    text-align: center;

    > div { display: contents; }
    h3 { font-family: inherit; font-size: 14px; font-weight: 500; line-height: 20px; margin-block-end: 6px; }
    small { font-family: inherit; font-size: 11px; font-weight: 400; line-height: 18px; color: var(--sd-modern-muted); }
    .sd-modern-button { margin: 4px !important; }
  }

  .b-products-window__feature-body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 0; }
  .b-products-window__feature-actions { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 8px; min-width: 0; }
  .b-products-window__feature-actions .sd-modern-button {
    min-width: 0;
    max-width: 100%;
    margin: 0 !important;
    :deep(.v-btn__content) { display: flex; gap: 6px; min-width: 0; max-width: 100%; }
  }
  .b-products-window__filter-tile .b-products-window__feature-actions {
    flex-wrap: nowrap;
    gap: 6px;
    .sd-modern-button {
      flex: 1 1 0;
      padding-inline: 8px;
      &:only-child { flex: 0 1 auto; }
    }
  }
  .b-products-window__action-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .b-products-window__scope-avatar {
    flex-shrink: 0;
    img { width: 100%; height: 100%; object-fit: cover; }
    :deep(.v-icon) { margin: 0; }
  }
  .b-products-window__engine-tile .b-products-window__feature-body > .my-2 { margin-block: 0 !important; }

  @media (min-width: 600px) and (max-width: 1199px) {
    .b-products-window__tools {
      &, &:not(:has(> :nth-child(4))) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      > :deep(:first-child) { --tool-end-start: 2px; }
      > :deep(:last-child) { --tool-start-end: 2px; }
      > :deep(:nth-child(2)) { --tool-start-end: var(--tool-outer-radius); }
      > :deep(:nth-child(2n + 1):nth-last-child(-n + 2)) { --tool-end-start: var(--tool-outer-radius); }
      > :deep(:last-child:nth-child(2n + 1)) { grid-column: 1 / -1; }
    }
  }
  @media (max-width: 599px) {
    .b-products-window__tools {
      grid-auto-rows: auto;
      &, &:not(:has(> :nth-child(4))) { grid-template-columns: minmax(0, 1fr); }
      > :deep(:first-child) { --tool-start-end: var(--tool-outer-radius); --tool-end-start: 2px; }
      > :deep(:last-child) { --tool-start-end: 2px; --tool-end-start: var(--tool-outer-radius); }
    }
    .b-products-window__sort :deep(.search-box) { flex: 1 1 180px; max-width: none; }
    .b-products-window__inventory-filter { flex: 1 1 180px; }
    .b-products-window__feature { min-height: 0; }
  }
  @media (max-width: 599px), (pointer: coarse) {
    .b-products-window__sort :deep(.v-input .v-field__input),
    .b-products-window__sort :deep(.v-select .v-field__input > input) { font-size: 16px; min-height: 44px; }
  }

  // Vendor tools share the native actions, with the approved compact three-tile layout.
  &:has(.b-products-window__tools--vendor) { container: b-products-workspace / inline-size; }
  .b-products-window__tools--vendor {
    &, &:not(:has(> :nth-child(4))) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    grid-auto-rows: auto;
    gap: 5px;
    margin-block-start: 0;
    padding-block-start: 0;
    border-radius: 12px;
    overflow: hidden;

    > :deep([class*="v-col-"]) { grid-row: auto; border-radius: 2px; }
    > :deep([class*="v-col-"]:not(.b-products-window__creation-stack)) { display: flex !important; }
    > .b-products-window__creation-stack {
      display: flex !important;
      align-items: flex-start;
      gap: 12px;
      padding: 20px !important;
      background: rgb(var(--v-theme-surface));
    }
    h3 { margin: 0; font-size: 14px; font-weight: 500; line-height: 21px; }
    .b-products-window__feature {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      width: 100%;
      padding: 20px;
      border: 0;
      border-radius: 2px;
      text-align: start;
      > div { display: contents; }
      small { font-size: 12px; line-height: 19px; }
    }
    .b-products-window__feature-body { align-items: flex-start; justify-content: flex-start; gap: 12px; }
    .b-products-window__feature-body > .mt-2 { margin-block-start: 0 !important; }
    .b-products-window__feature-actions { margin-block-start: auto; justify-content: flex-start; }
    .b-products-window__managed-engine { display: inline-flex; min-width: 0; max-width: 100%; border-radius: 9px; }
    .b-products-window__managed-engine:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
    .b-products-window__vendor-create-actions { display: flex; flex: 1; flex-direction: column; gap: 8px; width: 100%; }
    .b-products-window__vendor-create-actions .sd-modern-button { justify-content: flex-start; }
    .sd-modern-button { height: auto; min-height: 36px; padding: 8px 13px; border-color: var(--sd-modern-border); border-radius: 9px; font-size: 13px; font-weight: 500; line-height: 20px; }
    .sd-modern-button :deep(.v-btn__content) { gap: 8px; white-space: normal; font-size: 13px; font-weight: 500; line-height: 20px; text-align: start; }
    .sd-modern-button :deep(.v-icon) { width: 16px; height: 16px; font-size: 16px; margin: 0 !important; }
    .sd-modern-button:focus-visible { outline-offset: -3px; }
  }
  @container b-products-workspace (max-width: 850px) {
    .b-products-window__tools--vendor {
      &, &:not(:has(> :nth-child(4))) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      > :deep(:last-child) { grid-column: 1 / -1; }
    }
  }
  @container b-products-workspace (max-width: 560px) {
    .b-products-window__tools--vendor {
      &, &:not(:has(> :nth-child(4))) { grid-template-columns: minmax(0, 1fr); }
      > :deep(:last-child) { grid-column: auto; }
    }
  }
  @media (max-width: 599px), (pointer: coarse) {
    .b-products-window__tools--vendor .sd-modern-button { min-height: 44px; }
  }
}

.b-products-window__filter-editor {
  > .v-card-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 24px; background: rgb(var(--v-theme-surface)); border-block-end: 1px solid var(--sd-modern-border); font-size: 18px; font-weight: 500; line-height: 26px; white-space: normal; overflow-wrap: anywhere; }
  .b-products-window__filter-heading { flex: 1 1 auto; min-width: 0; }
  .b-products-window__filter-heading h2 { margin: 0; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; }
  .b-products-window__filter-breadcrumbs { flex-wrap: wrap; gap: 8px 0; margin-block-start: 8px; padding: 0; color: var(--sd-modern-muted); font-size: 13px; font-weight: 400; line-height: 20px; }
  .b-products-window__filter-crumb { min-width: 0; max-width: 100%; gap: 8px; padding: 0; white-space: normal; }
  .b-products-window__filter-crumb > span { min-width: 0; overflow-wrap: anywhere; }
  .b-products-window__filter-divider { flex: 0 0 auto; }
  .b-products-window__filter-avatar { flex: 0 0 auto; background: var(--sd-modern-inset); }
  .b-products-window__filter-avatar > img { width: 100%; height: 100%; object-fit: cover; }
  .b-products-window__filter-avatar :deep(.v-icon) { margin: 0; }
  .b-products-window__filter-breadcrumbs :deep(.v-breadcrumbs-divider) { display: none; }
  .sd-modern-icon-button { flex-shrink: 0; }

  @media (max-width: 600px) { > .v-card-title { padding: 16px; } }
}

.b-products-window__editor {
  > .v-card-title { padding: 22px 24px; font-size: 18px; font-weight: 500; }
  > .v-card-text { padding: 0 24px 24px; }
}
</style>

<style lang="scss" scoped>
.b-products-window--spec-import {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  .b-products-window__import { min-width: 0; font-size: 14px; line-height: 21px; }
  .b-products-window__import-toolbar { display: flex; align-items: center; gap: 12px; margin: 0; padding: 0 0 15px; border-bottom: 1px solid var(--sd-modern-border); }
  .b-products-window__import-search { flex: 1; min-width: 100px; }
  .b-products-window__import-search :deep(.v-field) { align-items: center; }
  .b-products-window__import-search :deep(.v-field__input) { box-sizing: border-box; min-height: 36px; height: 36px; padding-block: 0; font-size: 13px; line-height: 20px; }
  .b-products-window__import-search :deep(.v-field__prepend-inner),
  .b-products-window__import-search :deep(.v-field__append-inner),
  .b-products-window__import-search :deep(.v-field__clearable) { padding-top: 0; align-items: center; }
  .b-products-window__import-search :deep(.v-field__prepend-inner) { padding-inline-end: 8px; }
  .b-products-window__import-sort { min-width: 0; max-width: 170px; height: 36px; font: inherit; font-size: 13px; line-height: 20px; color: inherit; background: transparent; padding-inline-end: 18px; appearance: auto; }
  .b-products-window__import-sort option { color: rgb(var(--v-theme-on-surface)); background: rgb(var(--v-theme-surface)); }
  .b-products-window__import-filter-dot { position: absolute; inset-block-start: 3px; inset-inline-end: 3px; width: 5px; height: 5px; border-radius: 50%; background: rgb(var(--v-theme-primary)); }
  .b-products-window__import-filters { padding-block: 18px 20px; border-bottom: 1px solid var(--sd-modern-border); }
  .b-products-window__import-filter-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  h2 { margin: 0; font-size: 14px; font-weight: 500; line-height: 22px; }
  .b-products-window__import-availability { display: flex; align-items: center; gap: 6px; }
  label { display: flex; align-items: center; gap: 8px; min-height: 32px; padding-block: 3px; font-size: 12px; line-height: 18px; cursor: pointer; }
  input[type='checkbox'] { width: 15px; height: 15px; margin: 0; accent-color: rgb(var(--v-theme-primary)); flex-shrink: 0; }
  .b-products-window__import-filter-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 14px; }
  fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
  legend { margin-bottom: 6px; padding: 0; font-size: 12px; font-weight: 500; line-height: 18px; }
  fieldset > div { display: flex; flex-wrap: wrap; gap: 0 18px; }
  .b-products-window__import-vendor { max-width: 320px; margin-top: 14px; }
  .b-products-window__import-catalog { display: grid; grid-template-columns: 148px minmax(0, 1fr); gap: 22px; padding-top: 19px; }
  .b-products-window__import-categories { min-width: 0; }
  .b-products-window__import-categories h2 { margin-bottom: 12px; color: var(--sd-modern-muted); font-size: 11px; font-weight: 400; line-height: 17px; }
  .b-products-window__import-categories nav { display: grid; gap: 4px; }
  .b-products-window__import-categories nav button { display: flex; align-items: center; gap: 9px; min-width: 0; min-height: 39px; width: 100%; padding: 8px 9px; border: 0; border-radius: 8px; background: transparent; color: var(--sd-modern-muted); font: inherit; font-size: 12px; line-height: 18px; text-align: start; }
  .b-products-window__import-categories nav button > span { min-width: 0; overflow-wrap: anywhere; }
  .b-products-window__import-categories nav button > svg { flex-shrink: 0; }
  .b-products-window__import-categories nav button[aria-current],
  .b-products-window__import-categories nav button:hover { color: inherit; background: rgb(var(--v-theme-surface)); box-shadow: 0 2px 5px rgba(var(--v-theme-on-surface), .07); }
  .b-products-window__import-category-pager { display: flex; align-items: center; gap: 4px; margin-top: 15px; }
  .b-products-window__import-category-pager > span { flex: 1; text-align: center; font-size: 10px; color: var(--sd-modern-muted); }
  .b-products-window__import-products { min-width: 0; }
  .b-products-window__import-location { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; min-height: 23px; margin-bottom: 14px; }
  .b-products-window__import-location nav { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; min-width: 0; font-size: 12px; line-height: 18px; }
  .b-products-window__import-location nav button { min-height: 24px; padding: 0; color: var(--sd-modern-muted); text-align: start; }
  .b-products-window__import-location > span { padding-top: 3px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; white-space: nowrap; }
  .b-products-window__import-active { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 11px; color: var(--sd-modern-muted); }
  .b-products-window__import-active > span { padding: 5px 7px; border-radius: 5px; background: rgb(var(--v-theme-surface)); }
  .b-products-window__import-list, .b-products-window__import-skeletons { display: grid; gap: 6px; min-width: 0; }
  .b-products-window__import-product-wrapper { min-width: 0; }
  .b-products-window__import-product { box-sizing: border-box; display: flex; align-items: center; gap: 12px; width: 100%; min-width: 0; min-height: 76px; padding: 12px; border: 1px solid transparent; border-radius: 10px; background: rgb(var(--v-theme-surface)); color: inherit; text-align: start; }
  .b-products-window__import-product[aria-pressed='true'] { border-color: rgb(var(--v-theme-primary)); background: color-mix(in srgb, rgb(var(--v-theme-primary)) 6%, rgb(var(--v-theme-surface))); }
  .b-products-window__import-image { width: 44px; height: 44px; flex: 0 0 44px; }
  .b-products-window__import-fallback { display: grid; place-items: center; border-radius: 9px; background: var(--sd-modern-inset); }
  .b-products-window__import-product-copy { flex: 1; min-width: 0; }
  .b-products-window__import-product-name { display: block; font-size: 13px; font-weight: 500; line-height: 20px; overflow-wrap: anywhere; }
  .b-products-window__import-product-subtitle { display: block; margin-top: 2px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; overflow-wrap: anywhere; }
  .b-products-window__import-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px; color: var(--sd-modern-muted); font-size: 11px; line-height: 17px; }
  .b-products-window__import-meta .sd-modern-status { font-size: inherit; line-height: inherit; }
  .b-products-window__import-type { display: inline-flex; align-items: center; gap: 5px; }
  .b-products-window__import-arrow { flex-shrink: 0; color: var(--sd-modern-muted); }
  .b-products-window__import-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .b-products-window__import-grid .b-products-window__import-product { position: relative; align-items: flex-start; flex-wrap: wrap; gap: 10px; height: 100%; }
  .b-products-window__import-grid .b-products-window__import-product-copy { flex-basis: 100%; }
  .b-products-window__import-grid .b-products-window__import-arrow { position: absolute; inset-inline-end: 12px; inset-block-start: 25px; }
  .b-products-window__import-pagination { margin: 0; padding: 17px 0 0; font-size: 11px; color: var(--sd-modern-muted); background: transparent; }
  .sd-modern-empty-state { background: transparent; }
  .sd-modern-empty-state h3 { margin-block: 12px 6px; font-size: 14px; font-weight: 500; line-height: 22px; }
  button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  button:disabled { opacity: .45; cursor: default; }
  :dir(rtl) .b-products-window__import-direction { transform: scaleX(-1); }

  @media (min-width: 940px) {
    .b-products-window__import-catalog { grid-template-columns: 184px minmax(0, 1fr); gap: 28px; }
    .b-products-window__import-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (max-width: 600px) {
    .b-products-window__import-toolbar { flex-wrap: wrap; gap: 9px; }
    .b-products-window__import-search { flex-basis: 100%; }
    .b-products-window__import-sort { flex: 1; max-width: none; }
    .b-products-window__import-catalog { display: block; padding-top: 17px; }
    .b-products-window__import-categories { margin-bottom: 20px; }
    .b-products-window__import-categories h2 { margin-bottom: 7px; }
    .b-products-window__import-categories nav { display: flex; flex-wrap: wrap; }
    .b-products-window__import-categories nav button { width: auto; }
    .b-products-window__import-category-pager { justify-content: flex-end; margin-top: 7px; }
    .b-products-window__import-category-pager > span { flex: 0 1 auto; margin-inline: 6px; }
    .b-products-window__import-location { align-items: center; margin-bottom: 9px; }
    .b-products-window__import-location nav button { min-height: 44px; }
    .b-products-window__import-filter-columns { gap: 15px; }
    fieldset > div { display: block; }
    .b-products-window__import-product { gap: 10px; }
    .b-products-window__import-grid .b-products-window__import-product { padding: 10px 12px; }
  }
  @media (max-width: 380px) {
    .b-products-window__import-filter-columns { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 680px), (pointer: coarse) {
    .b-products-window__import-sort { height: 44px; font-size: 16px; }
    .b-products-window__import-search :deep(.v-field__input) { min-height: 44px; height: 44px; font-size: 16px; }
    label, .b-products-window__import-categories nav button { min-height: 44px; }
  }
}
</style>

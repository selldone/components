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
    class="s--backoffice-products-management-view"
    @contextmenu="showMenu($event, null, null)"
    v-bind="$attrs"
  >
    <!-- ⬬⬬⬬⬬ Breadcrumbs ⬬⬬⬬⬬ -->

    <u-breadcrumb
      v-intersect="
        (isIntersecting, entries, observer) => {
          fixed = !isIntersecting;
        }
      "
      :hierarchy-items="hierarchy_items"
      :replace="dialogMode"
    />

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
    <v-row no-gutters>
      <s-products-sort-view
        v-model="sort"
        v-model:only-available="only_available"
        :loading="busy_fetch"
        class="w-100"
        has-search
        @update:search="
          (val) => {
            search = val;
            fetchData();
          }
        "
      >
        <v-btn
          icon
          title="Change view mode"
          variant="text"
          @click="toggleViewMode"
        >
          <v-icon>{{ mini ? "folder" : "view_comfy" }}</v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Filter by Status & Types ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

        <b-inventory-filter
          v-model="filters"
          :shop="shop"
          class="min-width-200"
          dense
          @change="onFilterChange"
          variant="solo"
          flat
        >
        </b-inventory-filter>

        <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ Filter by vendor ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
        <b-vendor-input
          v-if="IS_MARKETPLACE && !IS_VENDOR_PANEL && $vuetify.display.mdAndUp"
          v-model="vendor_filter"
          :shop="shop"
          class="max-w-300 min-width-200"
          dense
          variant="solo"
          flat
          hide-details
          prepend-inner-icon="storefront"
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
      hide-details
      prepend-inner-icon="storefront"
      solo
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

    <!-- ██████████████████ List ██████████████████ -->

    <v-fade-transition
      id="manage-panel"
      class="v-row v-row--dense"
      group
      hide-on-leave
      origin="center center"
      tag="div"
    >
      <!-- ⬬⬬⬬⬬ ▞▞▞▞▞▞▞▞▞▞▞▞ Spirit Container ▞▞▞▞▞▞▞▞▞▞▞▞ ⬬⬬⬬⬬ -->

      <v-col
        v-if="show_spirit_container"
        key="drop-box"
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

      <!-- ⬬⬬⬬⬬ ▞▞▞▞▞▞▞▞▞▞▞▞ Back Button ▞▞▞▞▞▞▞▞▞▞▞▞ ⬬⬬⬬⬬ -->
      <v-col
        v-if="parent_folders"
        key="back"
        :cols="mini ? 4 : 12"
        :lg="mini ? 1 : 3"
        :md="mini ? 2 : 4"
        :sm="mini ? 3 : 6"
        :xl="mini ? 1 : 3"
      >
        <div
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
        v-for="category in folders.slice(
          (folder_page - 1) * max_folders_per_page,
          folder_page * max_folders_per_page,
        )"
        :key="'f' + category.id"
        :cols="mini ? 4 : 12"
        :lg="mini ? 1 : 3"
        :md="mini ? 2 : 4"
        :sm="mini ? 3 : 6"
        :xl="mini ? 1 : 3"
        class="position-relative"
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
              @select="selectFolder(category)"
            >
            </b-product-window-category-mini>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Category > Normal ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <b-product-window-category-large
              v-else
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
            />
            <v-btn
              v-if="selectMode && canSelectCategory"
              class="absolute-top-end selected-icon m-2"
              icon
              :size="38"
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
          v-if="showNotes || (category.note && category.note.length)"
          :activeColor="showNotes ? undefined : '#333'"
          :note="category.note"
          class="absolute-top-start"
          style="top: 0; left: 0; z-index: 50"
          @click="showNoteCategory(category)"
        ></b-note-button>
      </v-col>

      <v-col
        v-if="folder_pages_count > 1"
        key="pagination-categories"
        cols="12"
      >
        <v-pagination
          v-model="folder_page"
          :length="folder_pages_count"
          rounded
        ></v-pagination>
      </v-col>

      <!-- ⬬⬬⬬⬬ ▞▞▞▞▞▞▞▞▞▞▞▞ Products ▞▞▞▞▞▞▞▞▞▞▞▞ ⬬⬬⬬⬬ -->

      <v-col
        v-for="product in products.slice(
          (product_page - 1) * max_products_per_page,
          product_page * max_products_per_page,
        )"
        :key="product.id"
        :class="{
          'op-0-3': cut_product === product,
          'op-0-1 pen': arrange_folder_mode,
        }"
        :cols="mini ? 4 : 12"
        :lg="mini ? 1 : 3"
        :md="mini ? 2 : 4"
        :sm="mini ? 3 : 6"
        :xl="mini ? 1 : 3"
        class="position-relative"
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
            :dark="dark"
            @mousedown.middle.stop="$emit('select:middle', product)"
          >
          </b-product-window-product-mini>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product > Normal ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

          <b-product-window-product-large
            v-else
            :class="{
              'not-drop-able':
                current_dragged_product || current_dragged_folder,

              disabled: disableTypes?.includes(product.type),
            }"
            :compact-mode="compactMode"
            :deleting="product.id === busy_delete"
            :i-selected="selected_products.includes(product.id)"
            :product="product"
            :restoring="product.id === busy_restore"
            :selected="selected_products.includes(product.id)"
            :shop="shop"
            :shortcut="current_dir_id && product.category_id !== current_dir_id"
            :show-edit-button="showEditButton"
            :show-notes="showNotes"
            :show-price="showPrice"
            :show-ratting="showRatting"
            :show-select="press_ctrl"
            :show-statistics="showStatistics"
            class="item h-100 ma-2"
            @onSelect="toggleProductsSelect(product)"
            @onShowNote="showNoteProduct(product)"
            @select="$emit('select', product)"
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
            :dark="dark"
            :color="dark ? '#000' : '#fff'"
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

      <div v-if="mini" key="spx" class="pen" style="flex-grow: 12"></div>

      <v-col v-if="product_pages_count > 1" key="pagination-products" cols="12">
        <v-pagination
          v-model="product_page"
          :length="product_pages_count"
          rounded
        ></v-pagination>
      </v-col>

      <!-- ⬬⬬⬬ Add Mode ⬬⬬⬬ -->
      <template
        v-if="
          CAN_ADD_PRODUCT &&
          addProductButton &&
          !search &&
          (!busy_fetch || products.length)
        "
      >
        <!-- ⬬⬬⬬ Force new line in mini mode ⬬⬬⬬ -->

        <v-col v-if="mini" key="spacer" cols="12"></v-col>

        <!-- ⬬⬬⬬ Add button ⬬⬬⬬ -->

        <v-col
          key="new"
          class="p-2 d-flex flex-column"
          cols="12"
          lg="3"
          md="4"
          sm="6"
          xl="3"
        >
          <u-button-add
            :caption="$t('add_product.title_new')"
            :fillHeight="false"
            class="flex-grow-1"
            icon="library_add"
            message="⌘Ctrl + P"
            min-height="100px"
            small
            @click="$emit('click:add')"
          ></u-button-add>
          <u-button-add
            :caption="$t('add_product.title_new')"
            :fillHeight="false"
            class="mt-1 flex-grow-1"
            icon="flash_on"
            message="Fast Mode"
            min-height="100px"
            small
            @click="$emit('click:fast-add')"
          ></u-button-add>
          <u-button-add
            :fillHeight="false"
            :caption="$t('products_select.ai.title')"
            class="mt-1 flex-grow-1"
            color="#516ad6"
            hover-color="#667eea"
            icon="auto_fix_high"
            message="⌘Ctrl + X"
            min-height="100px"
            small
            @click="$emit('click:ai-add')"
          ></u-button-add>
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
          cols="12"
          lg="3"
          md="4"
          sm="6"
          xl="3"
        >
          <div
            class="dashed rounded-8px d-flex align-center justify-center pa-3 bg-white min-h-100 position-relative"
          >
            <div>
              <h3 v-if="current_filter">
                <v-icon class="me-1 zoomIn" color="green">check_circle</v-icon>

                {{
                  parent_folders
                    ? "This category has a filter."
                    : $t("products_select.filter_box.has_root_filter_message")
                }}
              </h3>
              <h3 v-else>
                {{
                  parent_folders
                    ? "No filters have been defined!"
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

              <v-btn
                class="tnt ma-1"
                color="primary"
                size="small"
                @click="dialog_root_filter = true"
              >
                <v-icon class="me-1" size="small">filter_alt</v-icon>

                {{
                  parent_folders
                    ? `Edit ${parent_folders.title.limitWords(1)} Filter`
                    : $t("products_select.filter_box.edit_action")
                }}
              </v-btn>
              <v-btn
                v-if="current_filter"
                :loading="busy_clear_root_filter"
                class="tnt ma-1"
                size="small"
                variant="outlined"
                @click="showClearRootFiltersDialog(parent_folders)"
              >
                <v-icon class="me-1" size="small">filter_alt_off</v-icon>

                {{
                  parent_folders
                    ? "Clear Category Filter"
                    : $t("products_select.filter_box.clear_action")
                }}
              </v-btn>
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
          cols="12"
          lg="3"
          md="4"
          sm="6"
          xl="3"
        >
          <div
            class="dashed rounded-8px d-flex align-center justify-center pa-3 bg-white min-h-100 position-relative"
          >
            <div>
              <h3>Extra Products Engine</h3>

              <template v-if="current_engine">
                <small class="d-block">
                  More products will be loaded from selected categories and
                  tags.
                </small>

                <b-category-engine-preview
                  class="my-2"
                  :category="
                    parent_folders
                      ? parent_folders
                      : { id: 'root', title: $t('global.commons.home') }
                  "
                  :engine-categories="current_engine.categories"
                  :engine-tags="current_engine.tags"
                >
                </b-category-engine-preview>
              </template>

              <v-icon v-else class="my-2" size="36"> devices_fold</v-icon>

              <div class="mt-2">
                <small class="d-block"
                  >Load products from categories in the
                  {{
                    parent_folders
                      ? parent_folders.title
                      : $t("global.commons.home")
                  }}.</small
                >
              </div>

              <v-btn
                class="tnt ma-1"
                color="primary"
                size="small"
                @click="dialog_root_engine = true"
              >
                <v-icon class="me-1" size="small">auto_mode</v-icon>

                {{
                  parent_folders
                    ? `Edit ${parent_folders.title.limitWords(1)} Engine`
                    : "Edit Root Engine"
                }}
              </v-btn>
            </div>
          </div>
        </v-col>
      </template>
    </v-fade-transition>

    <u-loading-ellipsis
      v-if="busy_load_more"
      css-mode
      light
    ></u-loading-ellipsis>
    <div v-if="has_more" class="widget-buttons">
      <v-btn
        v-intersect="onIntersect"
        :loading="busy_fetch"
        class="m-3"
        color="blue"
        size="x-large"
        variant="text"
        @click="fetchData(true)"
      >
        <v-icon class="me-1">autorenew</v-icon>
        <div>
          <b>{{ remains_count }} {{ $t("global.actions.more") }}</b>
          <div class="small mt-1">
            More products are available in this category; click to load
            additional items.
          </div>
        </div>
      </v-btn>
    </div>

    <!-- ███████████████████████ Context Menu ███████████████████████ -->
    <v-menu
      v-model="showProductMenu"
      :target="[x, y]"
      absolute
      transition="slide-y-transition"
    >
      <v-sheet class="text-start" rounded="lg">
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ For products (Right-click on a selected item) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-list
          v-if="is_menu_multi_select_product"
          class="py-0"
          color="primary"
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
              <v-chip class="mx-2" color="#fff" label size="x-small"
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
                <v-icon size="small">nat</v-icon>
              </template>
              <v-list-item-title>
                {{ $t("add_product.menu.change_status") }} |
                <v-icon
                  :color="ProductStatus[currentProductForMenu?.status]?.color"
                  size="x-small"
                  >circle
                </v-icon>
                {{ $t(ProductStatus[currentProductForMenu?.status]?.name) }}
              </v-list-item-title>
            </v-list-item>
          </template>

          <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Delete All selected Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

          <v-divider class="my-0"></v-divider>

          <v-list-item @click="deleteAllSelectedProduct(selected_products)">
            <template v-slot:prepend>
              <v-icon color="red" size="small">fa:fas fa-trash</v-icon>
            </template>
            <v-list-item-title>
              {{ $t("global.actions.delete_all") }}
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
                  getProductLink(
                    shop,
                    currentProductForMenu.id,
                    slugify(currentProductForMenu.title),
                  )
                "
                base-color="#1976d2"
                target="_blank"
                theme="dark"
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
              </v-list-item>
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
                base-color="#512da8"
                theme="dark"
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
                class="max-w-250 mx-auto pa-2 d-block border-bottom"
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
                <template v-slot:append>
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
                  <v-icon size="small">fa:fas fa-boxes</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("products_select.product_menu.inventory") }}
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
                  <v-icon size="small">fa:fas fa-image</v-icon>
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
                    <v-icon size="small">nat</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t("add_product.menu.change_status") }} |
                    <v-icon
                      :color="
                        ProductStatus[currentProductForMenu?.status]?.color
                      "
                      size="x-small"
                      >circle
                    </v-icon>
                    {{ $t(ProductStatus[currentProductForMenu?.status]?.name) }}
                  </v-list-item-title>
                </v-list-item>
              </template>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Product Add Note ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item @click="showNoteProduct(currentProductForMenu)">
                <template v-slot:prepend>
                  <v-icon size="small">edit_note</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("notes.add_action") }}
                </v-list-item-title>
              </v-list-item>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Delete Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <template v-if="CAN_ADD_PRODUCT">
                <v-divider class="my-0"></v-divider>

                <v-list-item @click="deleteProduct(currentProductForMenu)">
                  <template v-slot:prepend>
                    <v-icon color="red" size="small">fa:fas fa-trash</v-icon>
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
                <v-icon color="green" size="small"
                  >fa:fas fa-trash-restore
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
                  <v-icon size="small">fa:fas fa-cut</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("global.actions.cut") }}
                </v-list-item-title>
              </v-list-item>
              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Copy Product ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

              <v-list-item @click="copyProduct(currentProductForMenu)">
                <template v-slot:prepend>
                  <v-icon size="small">fa:fas fa-copy</v-icon>
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
              :href="getCategoryLink(shop, currentCategoryForMenu.name)"
              base-color="#1976d2"
              target="_blank"
              theme="dark"
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
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Category Edit ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item @click="showEditCategory(currentCategoryForMenu)">
              <template v-slot:prepend>
                <v-icon size="small">edit</v-icon>
              </template>

              <v-list-item-title>
                {{ $t("add_category.edit_action") }}
              </v-list-item-title>

              <template v-slot:append>
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

            <template>
              <v-list-item @click="showNoteCategory(currentCategoryForMenu)">
                <template v-slot:prepend>
                  <v-icon size="small">edit_note</v-icon>
                </template>
                <v-list-item-title>
                  {{ $t("notes.add_action") }}
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
                  {{ $t("products_select.menu.category_assign_profile") }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    $t("products_select.menu.category_assign_profile_subtitle")
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
                  {{ $t("products_select.menu.bulk_discount_subtitle") }}
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
              @click="dialog_root_filter = true"
              append-icon="filter_alt"
            >
              <template v-slot:prepend>
                <v-avatar
                  v-if="parent_folders"
                  :image="getShopImagePath(parent_folders.icon, 64)"
                  :size="24"
                  class="avatar-gradient -thin -category"
                ></v-avatar>
                <v-icon v-else size="small">home</v-icon>
              </template>

              <v-list-item-title v-if="parent_folders">
                Set Filter: {{ parent_folders.title?.limitWords(3) }}
              </v-list-item-title>
              <v-list-item-title v-else> Set Root Filter</v-list-item-title>

              <v-list-item-subtitle>
                Set filters of this category.
              </v-list-item-subtitle>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Set root engine ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item
              @click="dialog_root_engine = true"
              append-icon="auto_mode"
            >
              <template v-slot:prepend>
                <v-avatar
                  v-if="parent_folders"
                  :image="getShopImagePath(parent_folders.icon, 64)"
                  :size="24"
                  class="avatar-gradient -thin -category"
                ></v-avatar>
                <v-icon v-else size="small">home</v-icon>
              </template>

              <v-list-item-title v-if="parent_folders">
                Set Engine: {{ parent_folders.title?.limitWords(3) }}
              </v-list-item-title>
              <v-list-item-title v-else> Set Root Engine</v-list-item-title>

              <v-list-item-subtitle>
                Load extra products from other categories or by tags.
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider></v-divider>
          </v-list>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ For all ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <v-list class="text-start py-0" density="compact">
            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Past Product (copy) ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item v-if="copy_product" @click="pastProduct(copy_product)">
              <template v-slot:prepend>
                <v-icon v-if="!copy_product || !copy_product.icon" size="small"
                  >fa:fas fa-paste
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
                {{ copy_product.title }}
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
                  >fa:fas fa-paste
                </v-icon>
                <v-avatar v-else size="24" class="me-3"
                  ><img
                    :src="getShopImagePath(cut_product.icon, IMAGE_SIZE_SMALL)"
                /></v-avatar>
              </template>

              <v-list-item-title> Move here</v-list-item-title>
              <v-list-item-subtitle>
                {{ cut_product.title }}
              </v-list-item-subtitle>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Select All Products ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <v-list-item @click="selectAllProducts(!all_products_selected)">
              <template v-slot:prepend>
                <v-icon>highlight_alt</v-icon>
              </template>

              <v-list-item-title>
                {{
                  all_products_selected
                    ? $t("products_select.menu.unselect")
                    : $t("products_select.menu.select_all_products")
                }}
              </v-list-item-title>
            </v-list-item>

            <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ New Category ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

            <template v-if="CAN_ADD_CATEGORY">
              <v-divider class="my-0"></v-divider>

              <v-list-item @click="showEditCategory(null)">
                <template v-slot:prepend>
                  <v-icon color="amber">create_new_folder</v-icon>
                </template>

                <v-list-item-title>
                  {{ $t("admin_shop.categories.menu.add_new") }}
                </v-list-item-title>
              </v-list-item>

              <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Category Arrange Mode ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
              <!-- Enable / Disable Categories arrangement -->
              <v-list-item @click="arrange_folder_mode = !arrange_folder_mode">
                <template v-slot:prepend>
                  <v-icon
                    :color="arrange_folder_mode ? 'primary' : '#333'"
                    size="small"
                    >{{
                      arrange_folder_mode ? "circle" : "radio_button_unchecked"
                    }}
                  </v-icon>
                </template>

                <v-list-item-title>
                  {{ $t("products_select.menu.sort_categories") }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </template>
      </v-sheet>
    </v-menu>
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
            false,
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
    max-width="1080"
    inset
    width="98cw"
    scrollable
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>Bulk actions > Assign vendor</v-card-title>
      <v-card-text>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Vendor ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <div class="widget-box mb-5">
          <s-widget-header icon="admin_panel_settings" title="Vendor">
          </s-widget-header>
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
          <s-widget-header icon="price_change" title="Marketplace pricing">
          </s-widget-header>
          <v-list-subheader
            >Select a marketplace pricing model to assign to the selected
            product. If you leave it empty, the product pricing will be set as
            vendor price, and the marketplace commission will assume as zero.
          </v-list-subheader>

          <v-pricing-input v-model="pricing_id" :shop="shop"></v-pricing-input>
        </div>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Quantity  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <div class="widget-box mb-5">
          <s-widget-header
            icon="inventory"
            title="Vendor Inventory"
          ></s-widget-header>
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
            true-title="Verify Bulk Vendor Assignment"
            true-description="Please confirm that you want to assign the vendor in bulk."
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

  <v-dialog v-model="status_product_dialog" max-width="640" scrollable>
    <v-card v-if="status_product_items?.length" class="text-start" rounded="xl">
      <v-card-title>
        <v-icon class="me-2">nat</v-icon>
        Change Product Status
      </v-card-title>
      <v-card-text>
        <products-dense-images-circles
          :ids="status_product_items.map((p) => p.id)"
        ></products-dense-images-circles>

        <u-smart-select
          v-model="product_status_input"
          :color="ProductStatus[status_product_items[0].status]?.color"
          :items="status_list"
          :loading="status_busy"
          class="my-8"
          force-show-all
          gray-unselected
          item-description="description"
          item-icon="icon"
          item-text="title"
          item-value="code"
          @change="(val) => setBulkProductStatus(val, status_product_items)"
        >
        </u-smart-select>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
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
    <v-card class="text-start">
      <v-card-title>
        <v-avatar class="avatar-gradient -thin -shop me-2" size="38">
          <img :src="getShopImagePath(shop.icon)" />
        </v-avatar>

        {{ shop.title }}
        <b v-if="parent_folders" class="ms-1">
          |

          <u-avatar-folder
            :src="getShopImagePath(parent_folders.icon, 64)"
            is-amber
            :size="36"
            class="mx-1"
            side-icon="folder"
            :border-size="5"
          ></u-avatar-folder>

          {{ parent_folders.title }}
        </b>
      </v-card-title>
      <v-card-text>
        <b-category-filter-editor
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
            }
          "
        />
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_root_filter = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
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
    <v-card class="text-start">
      <v-card-title>
        <v-avatar class="avatar-gradient -thin -shop me-2" size="38">
          <img :src="getShopImagePath(shop.icon)" />
        </v-avatar>

        {{ shop.title }}
        <b v-if="parent_folders" class="ms-1">
          |

          <u-avatar-folder
            :src="getShopImagePath(parent_folders.icon, 64)"
            is-amber
            :size="36"
            class="mx-1"
            side-icon="folder"
            :border-size="5"
          ></u-avatar-folder>

          {{ parent_folders.title }}
        </b>
      </v-card-title>
      <v-card-text>
        <b-category-engine-editor
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
      <v-card-actions>
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

<script>
import BProductWindowProductLarge from "../../product/window/product/large/BProductWindowProductLarge.vue";
import SProductsSortView from "../../../storefront/product/sort/SProductsSortView.vue";
import BProductWindowCategoryLarge from "../../product/window/category/large/BProductWindowCategoryLarge.vue";

import CircleImage from "../../../ui/image/CircleImage.vue";
import UBreadcrumb from "../../../ui/breadcrumb/UBreadcrumb.vue";
import { HierarchyHelper } from "@selldone/core-js/helper/breadcrumb/HierarchyHelper";
import ULoadingEllipsis from "../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
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
import BTaxProfileBox from "../../tax/profile/box/BTaxProfileBox.vue";
import BCategoryBulkActionSetLogisticProfile from "../../category/bulk-action/set-logistic-profile/BCategoryBulkActionSetLogisticProfile.vue";
import BInventoryBulkDiscount from "../../inventory/bulk/discount/BInventoryBulkDiscount.vue";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import BInventoryFilter from "../../inventory/filter/BInventoryFilter.vue";
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import _ from "lodash-es";
import BCategoryFilterEditor from "../../category/filter/BCategoryFilterEditor.vue";
import SDenseImagesCircles from "../../../ui/image/SDenseImagesCircles.vue";
import UAvatarFolder from "../../../ui/avatar/folder/UAvatarFolder.vue";
import UDrop from "../../../ui/drag/core/UDrop.vue";
import UDrag from "../../../ui/drag/core/UDrag.vue";
import VPricingInput from "../../../storefront/pricing/VPricingInput.vue";
import BCategoryEngineEditor from "@selldone/components-vue/backoffice/category/engine/BCategoryEngineEditor.vue";
import BCategoryEnginePreview from "@selldone/components-vue/backoffice/category/engine/preview/BCategoryEnginePreview.vue";

export default {
  name: "BProductsWindow",
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
    ULoadingEllipsis,
    UBreadcrumb,
    CircleImage,

    BProductWindowCategoryLarge,
    SProductsSortView,
    BProductWindowProductLarge,
  },
  props: {
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
    ProductStatus: ProductStatus,

    mini: true,
    local_view_mode: null,

    products: [],
    products_count: 0,
    busy_fetch: false,
    busy_load_more: false,

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

    max_folders_per_page: 48,
    max_products_per_page: 100,

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
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    CAN_ADD_PRODUCT() {
      return (
        !this.IS_VENDOR_PANEL ||
        (this.shop.marketplace && this.shop.marketplace.product)
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
      return HierarchyHelper.GenerateCategoryHierarchy(
        this.$t("global.store"),
        this.parent_folders,
        undefined,
        true,
        this.dialogMode,
        null,
        this.IS_VENDOR_PANEL,
      );
    },

    has_more() {
      return this.remains_count > 0;
    },
    remains_count() {
      return this.products_count - this.products.length;
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

    folder_pages_count() {
      return (
        this.folders &&
        Math.ceil(this.folders.length / this.max_folders_per_page)
      );
    },
    product_pages_count() {
      return (
        this.products &&
        Math.ceil(this.products.length / this.max_products_per_page)
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
  },
  watch: {
    "$route.query"(query) {
      this.current_dir_id = query.dir ? parseInt(query.dir) : null;
      this.search = query.search;
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
  },
  created() {
    // Load search query:
    this.search = this.$route.query.search;

    // Set initial view mode:
    this.local_view_mode = localStorage.getItem("products-view-mode");
    this.mini = !this.local_view_mode || this.local_view_mode === "mini";

    this.current_dir_id = this.$route.query.dir
      ? parseInt(this.$route.query.dir)
      : null;

    this.fetchData();
  },

  mounted() {
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
    document.removeEventListener("keydown", this.key_listener_keydown);
    document.removeEventListener("keyup", this.key_listener_up);
  },

  methods: {
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

    onIntersect(isIntersecting, entries, observer) {
      // More information about these options
      // is located here: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
      // console.log('------- END -------',isIntersecting)

      if (isIntersecting && !this.busy_fetch && this.has_more) {
        // console.log("------- FETCH MORE -------");

        this.fetchData(true);
      }
    },

    isSelected(item_id) {
      return Object.keys(this.selectedList).some(
        (item) => item === "" + item_id,
      ); //int & string support!
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
    },

    onDropEnter(category) {
      this.arrange_products_target = null; // Always reset arrangement blue bar (for products)
      this.arrange_categories_target = this.arrange_folder_mode
        ? category
        : null;

      _.delay(
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("products_select.notifications.copy_success"),
            );
            this.AddOrUpdateItemByID(this.products, data.product);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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

          this.showSuccessAlert(
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
          this.showLaravelError(error);
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            if (success_callback) success_callback();
            this.showSuccessAlert(
              null,
              this.$t("products_select.notifications.change_category_success"),
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        });
    },

    selectFolder(category) {
      this.loading_cat = category;
      this.$router.push({
        /*hash: this.hash,*/ query: { dir: category?.id, "no-scroll": true },
      }); // Dont scroll up!
    },

    onFilterChange() {
      this.fetchData(false, false);
    },

    fetchData(more = false, force = false) {
      const params = {
        statuses: this.filters?.filter((x) => !!ProductStatus[x]),
        types: this.filters?.filter((x) => !!ProductType[x]),

        offset: more ? this.products.length : 0,
        limit: this.mini ? 5 * 12 : 20,

        sort: this.sort,
        available: this.only_available,
        set: this.set, // null : default  ,   spec: for copy spec (list)
        dir: this.current_dir_id,
        with_product_variants: this.withFullVariant,
        with_parent: !more, // No parent if load more items!
        search: this.search,
        vendor: this.vendor_filter,

        products_only: more, // Only products if load more!
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

      this.busy_fetch = true;
      this.busy_load_more = more;

      const handleSuccessResponse = ({
        folders,
        products,
        total,
        parent,
        tax_profile,
        valuation,
        time_filter,
      }) => {
        this.products_count = total;

        if (more) {
          products.forEach((product) => {
            this.AddOrUpdateItemByID(this.products, product);
          });
        } else {
          this.products = products;
          this.folders = folders;
          this.parent_folders = parent;

          //━━━━━━━━━━━━━━━━ 🞧 Extra objects return by special search ━━━━━━━━━━━━
          this.tax_profile = tax_profile;
          this.valuation_filter = valuation;
          this.time_filter = time_filter;

          // Reset to firts page:
          this.folder_page = 1;
          this.product_page = 1;

          this.$emit("change:folders", this.folders);
          this.$emit("change:parent-folder", this.parent_folders);
        }
      };

      (this.IS_VENDOR_PANEL
        ? /*🟢 Vendor Panel 🟢*/ window.$vendor.product
            .optimize(30)
            .cancellation()
            .list(
              this.vendor.id,
              more ? this.products.length : 0,
              this.mini ? 5 * 12 : 20,
              params,
            )
        : window.$backoffice.product
            .optimize(30)
            .cancellation()
            .list(
              this.shop.id,
              more ? this.products.length : 0,
              this.mini ? 5 * 12 : 20,
              params,
            )
      )

        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
          this.busy_load_more = false;
        });
    },

    //-------------------- Context Menu -------------------------
    showMenu(e, product, category) {
      //console.log('show',e)

      if (!product && !category && e.target.id !== "manage-panel") {
        // Prevent conflicts with product context menu
        return;
      }

      this.currentProductForMenu = product;
      this.currentCategoryForMenu = category;

      e.preventDefault();
      this.showProductMenu = false;
      this.x = e.clientX;
      this.y = e.clientY;
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
      this.openDangerAlert(
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
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.showSuccessAlert(null, "The product removed.");
                // this.$emit("delete", product);

                if (this.showDeletes) {
                  product.deleted_at = data.deleted_at;
                } else {
                  this.DeleteItemByID(this.products, product.id);
                }
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
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

      this.openDangerAlert(
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
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.showSuccessAlert(
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
              this.showLaravelError(error);
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(null, "The product restored successfully.");

            this.AddOrUpdateItemByID(this.products, data.product);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
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
            this.showSuccessAlert(
              null,
              "Vendors have been added to selected products.",
            );
            this.dialog_vendors = false;

            if (this.showVendors) {
              // Need to refresh data.
              this.fetchData();
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
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
      this.status_product_dialog = true;
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
            this.showSuccessAlert(
              null,
              "Product(s) status has been updated successfully.",
            );
            this.status_product_dialog = false;
            products.forEach((p) => (p.status = status)); // Update status of products in local.
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
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
      this.openConfirmationAlert(
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
            this.showSuccessAlert(
              null,
              "Root filters has been removed successfully.",
            );
            if (category) {
              category.filters = data.filters;
            } else {
              this.shop.filters = data.filters;
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
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

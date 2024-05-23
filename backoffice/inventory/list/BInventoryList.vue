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
  <div v-bind="$attrs" @dragover="dragover">
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!---------------------------- Filter ----------------------->

    <v-row no-gutters>
      <v-btn icon variant="text" @click="showBulkPrice">
        <v-icon size="small">auto_fix_high</v-icon>

        <v-tooltip
          :text="$t('inventory_list.bulk_price')"
          activator="parent"
          location="bottom"
        ></v-tooltip>
      </v-btn>

      <v-btn icon variant="text" @click="showBulkDiscount">
        <v-icon size="small">local_offer</v-icon>
        <v-tooltip
          :text="$t('inventory_list.bulk_discount')"
          activator="parent"
          location="bottom"
        ></v-tooltip>
      </v-btn>

      <v-divider class="my-0 mx-2" vertical></v-divider>

      <v-btn icon variant="text" @click="toggleGroup()">
        <v-icon
          >{{
            group_mode === "auto"
              ? "flash_auto"
              : group_mode
                ? "view_stream"
                : "view_day"
          }}
        </v-icon>

        <v-tooltip
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
        @change="onFilterChange"
        class="min-width-200"
        variant="plain"
      >
      </b-inventory-filter>
      <s-storefront-search-box
        :dark="false"
        :label="$t('inventory_list.search_input')"
        :shop-id="shop.id"
        :title="$t('inventory_list.search_input_title')"
        background-color="transparent"
        block
        class="search-inline mx-2 max-width-field min-width-250 flex-grow-1"
        @onClear="onClear()"
        @onSearch="(event) => onSearch(event)"
        variant="plain"
        expand-input
      />
    </v-row>

    <!---------------------------- List ----------------------->
    <v-data-table-server
      :mobile="$vuetify.display.xs"
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
      class="bg-transparent min-height-80vh"
      density="compact"
      hide-default-footer
      item-value="key"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="!busy_fetch && !search" class="py-5 usn text-center fadeIn">
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
        v-slot:group-header="{
          isMobile,
          item,
          columns,
          toggleGroup,
          isGroupOpen,
        }"
      >
        <b-inventory-list-group-header
          :isMobile="isMobile"
          :columns="columns"
          :item="item"
          :toggleGroup="toggleGroup"
          :isGroupOpen="isGroupOpen"
        ></b-inventory-list-group-header>
      </template>

      <!-- ===================================== End Group ================================== -->

      <template v-slot:item.icon="{ item }">
        <div class="p-2">
          <router-link
            :to="{
              name: 'BPageProductDashboard',
              params: { product_id: item.id },
            }"
          >
            <v-img
              :aspect-ratio="1"
              :height="48"
              :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
              :width="48"
              class="image-border"
            >
              <img
                :src="getProductTypeImage(item.type)"
                class="image-bottom-right"
              />
            </v-img>

            <v-tooltip activator="parent" location="bottom"
              >Open product admin page.
            </v-tooltip>
          </router-link>
        </div>
      </template>

      <template v-slot:item.title="{ item }">
        <template v-if="$vuetify.display.xs">
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

            <v-img
              :aspect-ratio="1"
              :height="48"
              :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
              :width="48"
              class="image-border flex-grow-0"
            >
              <img
                :src="getProductTypeImage(item.type)"
                class="image-bottom-right"
              />
            </v-img>
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
        <div v-copy class="min-width-100 text-subtitle-2 py-2">
          {{ item.code }}
        </div>
      </template>

      <template v-slot:item.sku="{ item }">
        <div>
          <span v-copy class="min-width-50 text-subtitle-2 py-2">{{
            item.sku
          }}</span>
        </div>
      </template>

      <template v-slot:item.mpn="{ item }">
        <div>
          <span v-copy class="min-width-50 text-subtitle-2 py-2">
            {{ item.mpn }}</span
          >
        </div>
      </template>

      <template v-slot:item.original="{ item }">
        <v-icon v-if="item.original" color="success"> check</v-icon>
      </template>

      <template v-slot:item.status="{ item }">
        <product-status-view
          v-if="!item.disabled"
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
          class="min-width-150 font-weight-black"
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
          <small>Infinite</small>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <div
          :class="{ '-focus': show_price_dialog && selected_item === item }"
          class="editable center-flex rounded-28px m-2 price-btn px-5"
          @click="showEditPrice(item)"
        >
          <v-icon
            v-if="item && item.variant && item.variant.pricing"
            :title="$t('add_product.pricing.independent_price')"
            class="me-2"
            size="small"
            >local_offer
          </v-icon>
          <u-price
            :amount="CalcPriceProductCurrentCurrency(shop, item, item.variant)"
            medium
          ></u-price>
        </div>
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

        <div
          v-else-if="item.type === ProductType.PHYSICAL.code"
          :class="{ 'min-width-250': $vuetify.display.smAndUp }"
          class="p-2"
        >
          <u-number-input
            v-model="item.number"
            :min="item.add ? -1000 : 0"
            class="max-width-field inline-block vertical-align-middle center-input strong-field"
            variant="solo-filled"
            background-color="#fafafa"
            flat
            hide-details
            no-padding
            rounded
          >
            <template v-slot:prepend-inner>
              <v-btn-toggle
                v-model="item.add"
                class="mx-2 vertical-align-middle"
                mandatory
                rounded="xl"
                density="compact"
              >
                <v-btn :value="true" selected-class="green-flat" size="small">
                  {{ $t("global.actions.add") }}
                </v-btn>
                <v-btn :value="false" selected-class="blue-flat" size="small">
                  {{ $t("global.actions.set") }}
                </v-btn>
              </v-btn-toggle>
            </template>

            <template v-slot:append-inner>
              <v-btn
                :class="{
                  disabled: item.add
                    ? item.number === 0
                    : item.number === item.quantity,
                }"
                :color="SaminColorLight"
                :loading="busy_count === item.key"
                :variant="
                  (item.add ? item.number === 0 : item.number === item.quantity)
                    ? 'plain'
                    : 'elevated'
                "
                class="mx-2 vertical-align-middle"
                rounded
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
        <v-pagination v-model="page" :length="pageCount" rounded />
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
    <v-card v-if="item_clone && show_price_dialog_pre" class="text-start">
      <v-btn
        class="absolute-top-end m-2"
        icon
        @click="show_price_dialog = false"
      >
        <v-icon>close</v-icon>
      </v-btn>
      <v-card-title class="d-flex align-center">
        <v-avatar class="me-2" size="48">
          <img
            v-if="selected_item.icon"
            :src="getShopImagePath(selected_item.icon, IMAGE_SIZE_SMALL)"
          />
          <v-icon v-else>inventory</v-icon>
        </v-avatar>

        <div>
          {{ selected_item?.product?.title }}

          <small class="d-block">{{ selected_item?.product?.title_en }}</small>
        </div>
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
          external-action-buttons
          instance-mode
          light
          transparent
          @update:instance="onUpdatePrice"
        >
        </b-product-edit-price>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="show_price_dialog = false"
          >
            <v-icon start>close</v-icon>

            {{ $t("global.actions.close") }}
          </v-btn>

          <v-btn
            :loading="busy_save_price"
            color="primary"
            size="x-large"
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

<script>
import UNumberInput from "../../../ui/number/input/UNumberInput.vue";
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import BProductEditPrice from "../../product/edit/price/BProductEditPrice.vue";
import ProductStatusView from "../../../storefront/product/status/ProductStatusView.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BInventoryFilter from "../../inventory/filter/BInventoryFilter.vue";
import SStorefrontSearchBox from "../../../storefront/search/SStorefrontSearchBox.vue";
import { TemporaryDataHelper } from "../../../utils/temporary-data/TemporaryDataHelper";
import BInventoryBulkPrice from "../../inventory/bulk/price/BInventoryBulkPrice.vue";
import BInventoryBulkDiscount from "../../inventory/bulk/discount/BInventoryBulkDiscount.vue";
import BInventoryListGroupHeader from "../../inventory/list/group-header/BInventoryListGroupHeader.vue";

export default {
  name: "BInventoryList",
  components: {
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
  },
  data: function () {
    return {
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
      if (this.$vuetify.display.xs) {
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
            align: "center",
            value: "quantity",
            sortable: true,
          },
          {
            title: this.$t("global.commons.price"),
            align: "center",
            sortable: true,
            value: "price",
          },
          {
            title: this.$t("inventory_list.table.edit"),
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
          align: "center",
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
          align: "center",
          value: "quantity",
          sortable: true,
        },
        {
          title: this.$t("global.commons.price"),
          align: "center",
          sortable: true,
          value: "price",
        },
        {
          title: this.$t("inventory_list.table.edit"),
          align: "center",
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
            this.showSuccessAlert(
              null,
              this.$t("inventory_list.notifications.save_success"),
            );
            item.quantity = response.data.quantity;

            if (item.add) item.number = 0;
            //item.add = true;
            this.$forceUpdate(); // Update vue component!
          } else {
            this.showErrorAlert(null, response.data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
  },
};
</script>

<style lang="scss" scoped>
.image-border {
  outline: #dadada solid 1px;
  border-radius: 4px;
  outline-offset: 3px;

  background-color: white;
}

.search-inline {
  display: inline-block;
  margin-right: 16px;
}

.image-bottom-right {
  width: 23px;
  height: 23px;
  border-radius: 16px 0 0 0;
  position: absolute;
  padding: 5px 0 0 5px;
  right: 0;
  bottom: 0;
  background-color: white;
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

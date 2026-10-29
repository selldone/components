<!--
  - Copyright (c) 2025. Selldone® Business OS™
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
    :class="
      modern
        ? 'b-products-list b-products-list--modern sd-modern-widget text-start'
        : undefined
    "
  >
    <v-row
      no-gutters
      :class="{ 'sd-modern-list-toolbar b-products-list__toolbar': modern }"
    >
      <b-inventory-filter
        v-model="filters"
        :shop="$shop"
        :modern="modern"
        class="min-width-200 max-w-300"
        :class="{ 'b-products-list__filter': modern }"
        dense
        flat
        variant="plain"
        @change="onFilterChange"
      />
      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        :placeholder="$t('global.commons.search')"
        class="max-width-field"
        :class="{ 'b-products-list__search': modern }"
        :aria-label="$t('global.commons.search')"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>

    <v-data-table-server
      :class="{ 'sd-modern-data-table b-products-list__table': modern }"
      :mobile="$vuetify.display.xs"
      :items="products"
      :loading="busy_fetch"
      :items-length="total"
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :headers="headers"
      density="compact"
      :items-per-page-options="[10, 20, 50, 100]"
    >
      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ title ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.title="{ item }">
        <div
          class="d-flex align-center"
          :class="modern ? 'b-products-list__identity' : 'overflow-hidden'"
        >
          <router-link
            :to="{
              name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? 'Vendor_ProductDashboard'
                : 'BPageProductDashboard',
              params: { product_id: item.id },
            }"
          >
            <b-product-window-product-mini
              :product="item"
              :shop="$shop"
              :show-notes="false"
              :show-select="false"
              icon-only
              class="my-n3"
            >
            </b-product-window-product-mini>
          </router-link>

          <div class="text-start py-1 max-w-300">
            <div
              :class="modern ? 'b-products-list__title' : 'font-weight-bold'"
            >
              {{ item.title?.limitWords(8) }}
            </div>
            <div class="small">
              {{ item.title_en?.limitWords(8) }}
            </div>
          </div>
        </div>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ price ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.price="{ item }">
        <div class="text-start py-1">
          <u-price :amount="item.price" :currency="item.currency"></u-price>
          <br />
          <u-chip-discount
            :percent="discountProductPercent($shop, item, null)"
            size="small"
          ></u-chip-discount>
        </div>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ sku ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.sku="{ item }">
        <div class="text-start py-1">
          {{ item.sku }}
        </div>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ variants ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.variants="{ item }">
        <product-variants-view
          v-if="item.variants"
          :variants="item.variants"
          center
        ></product-variants-view>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ status ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.status="{ item }">
        <div class="text-center py-1">
          <product-status-view :product="item"></product-status-view>
        </div>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ vendor_id ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.vendor_id="{ item }">
        <div v-if="item.vendors?.length">
          <v-avatar
            v-for="v in item.vendors"
            :key="v.id"
            :image="getShopImagePath(v.icon, 128)"
            :title="v.name"
            class="ma-1 avatar-gradient -thin -vendor hover-scale"
            :size="24"
          ></v-avatar>
        </div>
        <b-vendor-box
          v-else-if="item.vendor"
          :vendor="item.vendor"
          small
        ></b-vendor-box>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ category_id ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.category_id="{ item }">
        <div class="text-center py-1 overflow-hidden">
          <b-product-window-category-mini
            v-if="item.category"
            :category="item.category"
            icon-only
            class="my-n3"
            :gray-on-clicked="false"
            :is-empty="
              item.category.is_empty /*We use it only in the vendor panel*/
            "
          ></b-product-window-category-mini>
        </div>
      </template>

      <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ note ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
      <template v-slot:item.note="{ item }">
        <b-note-button
          :note="item.note"
          @click="showNote(item)"
        ></b-note-button>
      </template>

      <template v-if="modern" #no-data>
        <div class="sd-modern-empty-state" role="status">
          <v-icon size="28" aria-hidden="true">inventory_2</v-icon>
          <p>{{ $t("global.commons.no_data") }}</p>
        </div>
      </template>

      <template v-if="modern" #bottom="{ pageCount, setItemsPerPage }">
        <div class="sd-modern-table-footer b-products-list__footer">
          <span class="sd-modern-page-summary">
            {{ $t("global.commons.page") }}
            <bdi
              >{{ $n(total ? page : 0) }} / {{ $n(total ? pageCount : 0) }}</bdi
            >
            <span class="b-products-list__total"
              >{{ $t("global.commons.total") }}: {{ $n(total) }}</span
            >
          </span>
          <div class="b-products-list__page-size">
            <span>{{
              $vuetify.locale.t("$vuetify.dataFooter.itemsPerPageText")
            }}</span>
            <v-select
              :model-value="itemsPerPage"
              :items="[10, 20, 50, 100]"
              :aria-label="
                $vuetify.locale.t('$vuetify.dataFooter.itemsPerPageText')
              "
              density="compact"
              variant="plain"
              hide-details
              single-line
              @update:model-value="setItemsPerPage(Number($event))"
            />
          </div>
          <v-pagination
            v-model="page"
            :length="pageCount"
            :disabled="busy_fetch || !total"
            :total-visible="$vuetify.display.xs ? 3 : 5"
            show-first-last-page
            class="sd-modern-pagination"
          />
        </div>
      </template>
    </v-data-table-server>

    <!-- █████████████████████ Dialog > Product Note Messages █████████████████████ -->

    <b-note-dialog
      v-model="note_dialog"
      :add-url="
        () =>
          IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_PRODUCT_ADD_NOTE(
                $vendor.id,
                note_item.id,
              )
            : window.API.POST_PRODUCT_ADD_NOTE($shop.id, note_item.id)
      "
      :delete-url="
        (index) =>
          IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_MY_VENDOR_PRODUCT_NOTE(
                $vendor.id,
                note_item.id,
                index,
              )
            : window.API.DELETE_PRODUCT_NOTE($shop.id, note_item.id, index)
      "
      :icon="note_item ? getShopImagePath(note_item.icon, 128) : null"
      :target="note_item"
      :title="note_item && note_item.title"
    ></b-note-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus.ts";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import BInventoryFilter from "@selldone/components-vue/backoffice/inventory/filter/BInventoryFilter.vue";
import BProductWindowProductMini from "@selldone/components-vue/backoffice/product/window/product/mini/BProductWindowProductMini.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import ProductVariantsView from "@selldone/components-vue/storefront/product/variant/ProductVariantsView.vue";
import BNoteButton from "@selldone/components-vue/backoffice/note/button/BNoteButton.vue";
import BNoteDialog from "@selldone/components-vue/backoffice/note/dialog/BNoteDialog.vue";
import ProductStatusView from "@selldone/components-vue/storefront/product/status/ProductStatusView.vue";
import { throttle } from "lodash-es";
import UChipDiscount from "@selldone/components-vue/ui/chip/discount/UChipDiscount.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel.ts";
import BVendorBox from "@selldone/components-vue/backoffice/vendor/box/BVendorBox.vue";
import SCategoryCard from "@selldone/components-vue/storefront/category/card/SCategoryCard.vue";
import BProductWindowCategoryMini from "@selldone/components-vue/backoffice/product/window/category/mini/BProductWindowCategoryMini.vue";

export default defineComponent({
  name: "BProductsList",
  components: {
    BInventoryFilter,
    BProductWindowCategoryMini,
    SCategoryCard,
    BVendorBox,
    UChipDiscount,
    ProductStatusView,
    BNoteDialog,
    BNoteButton,
    ProductVariantsView,
    UPrice,
    BProductWindowProductMini,
  },
  mixins: [ProductMixin],
  inject: ["$shop", "$vendor"],

  props: {
    modern: Boolean,
    set: {
      // Set: null : default , spec: for import spec
      required: false,
      type: String,
      default: null,
    },
    withFullVariant: {
      type: Boolean,
      default: false,
    },

    showDeletes: {
      type: Boolean,
      default: false,
    },

    showVendors: {
      type: Boolean,
      default: false,
    },
    withProductTranslations: { type: Boolean, default: false },

    addProductButton: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      products: [],
      total: 0,
      busy_fetch: false,
      itemsPerPage: 10,
      page: 1,
      sortBy: [{ key: null, order: "desc" }],

      // -----------------------------------

      search: "",
      vendor_filter: null,

      filters: [],
      sort: null,
      only_available: false,

      // -----------------------------------
      tax_profile: null,
      valuation_filter: null,
      time_filter: null,

      // -----------------------------------
      note_item: null,
      note_dialog: false,
    };
  },

  computed: {
    route_types() {
      if (this.$route.name !== "BPageShopProductsList") return [];
      const selected = [this.$route.query.types].flat();
      return Object.values(ProductType)
        .map((type) => type.code)
        .filter((code) => selected.includes(code));
    },
    IS_MARKETPLACE() {
      return this.$shop.model === BusinessModel.MARKETPLACE.code;
    },

    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    headers() {
      return [
        {
          title: this.$t("global.commons.title"),
          align: "start",
          value: "title",
          sortable: true,
        },

        {
          title: this.$t("global.commons.sku"),
          align: "start",
          value: "sku",
          sortable: true,
        },

        {
          title: this.$t("global.commons.price"),
          align: "start",
          value: "price",
          sortable: true,
        },

        {
          title: this.$t("global.commons.variants"),
          align: "center",
          value: "variants",
          sortable: true,
        },

        {
          title: this.$t("global.commons.status"),
          align: "start",
          value: "status",
          sortable: true,
        },
        {
          title: this.$t("global.commons.category"),
          align: "start",
          value: "category_id",
          sortable: true,
        },
        {
          title: this.$t("global.commons.note"),
          align: "start",
          value: "note",
          sortable: true,
        },

        ...(this.IS_MARKETPLACE
          ? [
              {
                title: this.$t("global.commons.vendor"),
                align: "start",
                value: "vendor_id",
                sortable: true,
              },
            ]
          : []),

        { text: "Updated At", value: "updated_at" },
      ];
    },
  },

  watch: {
    "$route.query.types"() {
      if (this.$route.name !== "BPageShopProductsList") return;
      this.applyRouteTypes();
      this.page = 1;
      this.fetchProducts();
    },
    itemsPerPage() {
      this.fetchProducts();
    },
    page() {
      this.fetchProducts();
    },
    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.page = 1;
      this.fetchProducts();
    }, window.SERACH_THROTTLE),

    withFullVariant() {
      this.fetchProducts();
    },
    showDeletes() {
      this.fetchProducts();
    },
    showVendors() {
      this.fetchProducts();
    },
    withProductTranslations() {
      this.fetchProducts();
    },

    sortBy() {
      this.fetchProducts();
    },
  },

  created() {
    this.applyRouteTypes();
    this.fetchProducts();
  },

  methods: {
    applyRouteTypes() {
      if (this.$route.name !== "BPageShopProductsList") return;
      this.filters = [
        ...(this.filters || []).filter(
          (code) =>
            !Object.values(ProductType).some((type) => type.code === code),
        ),
        ...this.route_types,
      ];
    },
    onFilterChange() {
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
      this.page = 1;
      this.fetchProducts();
    },
    fetchProducts() {
      const handleSuccessResponse = ({
        folders,
        products,
        total,
        parent,
        tax_profile,
        valuation,
        time_filter,
      }) => {
        this.total = total;

        this.products = products;

        //━━━━━━━━━━━━━━━━ 🞧 Extra objects return by special search ━━━━━━━━━━━━
        this.tax_profile = tax_profile;
        this.valuation_filter = valuation;
        this.time_filter = time_filter;
      };

      const params: api.shop.products.get.IParams = {
        statuses: this.filters?.filter((x) => !!ProductStatus[x]),
        types: this.filters?.filter((x) => !!ProductType[x]),

        sort: this.sort,
        available: this.only_available,
        set: this.set, // null : default  ,   spec: for copy spec (list)
        dir: "*",
        with_product_variants: this.withFullVariant,
        with_parent: false, // No parent if load more items!
        search: this.search,
        vendor: this.vendor_filter,

        products_only: true, // Only products if load more!
        with_total: true,

        show_deletes: this.showDeletes, // Show deletes items
        show_vendors: this.showVendors, // Show dall vendors

        with_product_translations: this.withProductTranslations, // Return translations
        with_category_translations: false, // Return translations

        sortBy: this.sortBy[0]?.key,
        sortDesc: this.sortBy[0]?.order === "desc",

        with_category: true,
      };

      this.busy_fetch = true;

      (this.IS_VENDOR_PANEL
        ? /*🟢 Vendor Panel 🟢*/ window.$vendor.product
            .optimize(30)
            .cancellation()
            .list(
              this.$vendor.id,
              (this.page - 1) * this.itemsPerPage,
              this.itemsPerPage,
              params,
            )
        : window.$backoffice.product
            .optimize(30)
            .cancellation()
            .list(
              this.$shop.id,
              (this.page - 1) * this.itemsPerPage,
              this.itemsPerPage,
              params,
            )
      )

        // It always returns all folders!

        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    showNote(item) {
      this.note_item = item;
      this.note_dialog = true;
    },
  },
});
</script>

<style scoped lang="scss">
.b-products-list--modern {
  min-width: 0;
  padding: 15px 17px 20px;
  border-radius: 17px;

  .b-products-list__toolbar {
    margin: 0 0 10px;
    flex-wrap: wrap;
  }

  .b-products-list__filter {
    flex: 0 1 300px;
  }

  .b-products-list__search {
    flex: 0 1 240px;
    min-width: 150px;
  }

  .b-products-list__identity {
    min-width: 220px;
    gap: 10px;
  }

  .b-products-list__title {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  .b-products-list__total {
    margin-inline-start: 10px;
  }

  .b-products-list__page-size {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    white-space: nowrap;

    > .v-input {
      flex: 0 0 65px;
      width: 65px;
      margin: 0;
    }
  }

  .b-products-list__table :deep(.v-table__wrapper) {
    // The nine existing fields keep horizontal access when they cannot fit.
    overflow-x: auto;
  }

  @media (max-width: 600px) {
    padding: 15px 12px 18px;

    .b-products-list__toolbar {
      gap: 8px;
    }

    .b-products-list__filter,
    .b-products-list__search {
      flex: 1 1 100%;
      max-width: 100% !important;
    }

    .b-products-list__identity {
      min-width: 0;
    }

    .b-products-list__footer {
      gap: 10px;
    }

    .b-products-list__footer > .sd-modern-page-summary {
      flex-basis: 100%;
    }
  }
}
</style>

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
  <v-row no-gutters>
    <v-spacer></v-spacer>

    <v-text-field
      v-model="search"
      :placeholder="$t('global.commons.search')"
      class="max-width-field"
      clearable
      hide-details
      prepend-inner-icon="search"
      single-line
      variant="plain"
    ></v-text-field>
  </v-row>

  <v-data-table-server
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
      <div class="d-flex align-center overflow-hidden">
        <b-product-window-product-mini
          :product="item"
          :shop="$shop"
          :show-notes="false"
          :show-select="false"
          icon-only
          class="my-n3"
          @select="() =>
          $router.push({
            name: IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
              ? 'Vendor_ProductDashboard'
              : 'BPageProductDashboard',
            params: { product_id: item.id },
          })"
        >
        </b-product-window-product-mini>

        <div class="text-start py-1 max-w-300">
          <div class="font-weight-bold">{{ item.title?.limitWords(8) }}</div>
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
      <b-note-button :note="item.note" @click="showNote(item)"></b-note-button>
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
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus.ts";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
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
import BProductWindowCategoryMini
  from "@selldone/components-vue/backoffice/product/window/category/mini/BProductWindowCategoryMini.vue";

export default defineComponent({
  name: "BProductsList",
  components: {
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
    this.fetchProducts();
  },

  methods: {
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

<style scoped lang="scss"></style>

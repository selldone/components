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

<template>
  <div :class="{ 'b-products-import-queue text-start': modern, 's-table-loading': !modern }" :aria-busy="busy_fetch">
    <div v-if="modern" class="sd-modern-list-toolbar b-products-import-queue__toolbar">
      <div class="b-products-import-queue__heading">
        <span>{{ $t("global.commons.products") }} · {{ $n(totalItems) }}</span>
        <v-tooltip content-class="sd-modern-tooltip text-start" location="top" open-on-click>
          <template #activator="{ props }">
            <v-btn v-bind="props" class="sd-modern-icon-button sd-modern-info-button" variant="text" icon="info_outline" :aria-label="$t('importer.product_queue.status')" />
          </template>
          {{ $t("importer.product_queue.status_help") }}
        </v-tooltip>
      </div>
      <v-text-field
        v-model="search"
        :placeholder="$t('importer.product_queue.search')"
        :aria-label="$t('importer.product_queue.search')"
        class="sd-modern-search b-products-import-queue__search"
        prepend-inner-icon="search"
        clearable
        hide-details
        single-line
        variant="plain"
      />
    </div>
    <v-row v-else no-gutters>
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
    <u-loading-progress v-if="busy_fetch && !modern"></u-loading-progress>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:options="options"
      v-model:page="page"
      :class="[{ disabled: busy_fetch }, modern ? 'sd-modern-data-table b-products-import-queue__table' : 'bg-transparent min-height-60vh']"
      :headers="displayHeaders"
      :items="products"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="modern ? $vuetify.display.width < 960 : $vuetify.display.xs"
      :loading="modern && busy_fetch"
      :loading-text="$t('global.commons.waiting_load_data')"
      :header-props="modern ? { sortByText: $t('global.commons.sort_by') } : undefined"
      density="compact"
      hide-default-footer
      item-key="id"
      style="width: 100%"
    >
      <template v-slot:item.title="{ item }">
        <div v-if="modern" class="b-products-import-queue__identity">
          <v-avatar :class="{ 'hover-scale': item.icon }" size="36" class="b-products-import-queue__image">
            <img v-if="item.icon" :src="item.icon" :alt="item.title" />
            <v-icon v-else aria-hidden="true">wallpaper</v-icon>
          </v-avatar>
          <div class="b-products-import-queue__identity-copy">
            <div class="b-products-import-queue__name">
              <img :src="getProductTypeImage(item.type)" :alt="getProductTypeName(item.type)" :title="getProductTypeName(item.type)" width="16" height="16" />
              <span>{{ item.title }}</span>
            </div>
            <p v-if="item.title_en" class="b-products-import-queue__secondary">{{ item.title_en }}</p>
            <div v-if="item.error" class="b-products-import-queue__error">
              <v-icon size="16" color="error" aria-hidden="true">error_outline</v-icon>
              <span>{{ item.error }}</span>
            </div>
          </div>
        </div>
        <div v-else class="d-flex align-center">
          <v-avatar
            :class="{ 'hover-scale': item.icon }"
            class="force-top ma-1"
            size="42"
          >
            <img v-if="item.icon" :src="item.icon" />
            <v-icon v-else>wallpaper</v-icon>
          </v-avatar>

          <div class="px-2">
            <img
              :src="getProductTypeImage(item.type)"
              :title="getProductTypeName(item.type)"
              class="me-1"
              height="16"
              width="16"
            />
            {{ item.title }}<br />
            <small>{{ item.title_en }}</small>
            <p v-if="item.error" class="text-danger my-1">{{ item.error }}</p>
          </div>
        </div>
      </template>

      <template v-slot:item.status="{ item }">
        <span v-if="modern" class="sd-modern-status sd-modern-status--plain">
          <span class="sd-modern-status__dot" :class="{ 'sd-modern-status__dot--success': item.status === 'Open', 'sd-modern-status__dot--error': item.status === 'Close' }" />
          {{ item.status }}
        </span>
        <u-check
          v-else
          :model-value="item.status === 'Open'"
          :title="item.status"
        ></u-check>
      </template>

      <template v-slot:item.price="{ item }">
        <u-price :amount="item.price" :currency="item.currency"></u-price>
      </template>

      <template v-slot:item.sku="{ item }">
        <bdi v-if="modern" v-copy class="b-products-import-queue__sku">{{ item.sku }}</bdi>
        <span v-else v-copy class="small">{{ item.sku }}</span>
      </template>

      <template v-slot:item.updated_at="{ item }">
        <div :class="modern ? 'b-products-import-queue__date' : 'min-width-150'">
          {{ getFromNowString(item.updated_at) }}
          <small class="d-block">
            {{ getLocalTimeString(item.updated_at) }}
          </small>
        </div>
      </template>

      <template v-slot:item.clear="{ item }">
        <v-tooltip v-if="modern" content-class="sd-modern-tooltip text-start" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" :loading="busy_remove === item.id" class="sd-modern-icon-button" variant="text" icon="delete_outline" :aria-label="`${$t('importer.product_queue.remove')} · ${item.title}`" @click="cancelImportItem(item.id)" />
          </template>
          {{ $t("importer.product_queue.remove") }}
        </v-tooltip>
        <v-btn
          v-else
          :loading="busy_remove === item.id"
          color="red"
          icon
          size="small"
          title="Remove this item from importing que."
          variant="text"
          @click="cancelImportItem(item.id)"
        >
          <v-icon>delete</v-icon>
        </v-btn>
      </template>

      <template v-if="modern" #no-data>
        <div class="sd-modern-empty-state b-products-import-queue__empty">{{ $t("importer.product_queue.empty") }}</div>
      </template>

      <template v-slot:bottom>
        <div v-if="modern" class="sd-modern-table-footer b-products-import-queue__footer">
          <span>{{ $t("global.commons.products") }} · {{ $n(totalItems) }}</span>
          <v-pagination v-model="page" :length="Math.max(1, pageCount)" class="sd-modern-pagination" :total-visible="5" density="compact" />
        </div>
        <v-pagination v-else v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import threads from "@selldone/core-js/utils/thread/threads";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "BProductsImporterProducts",
  mixins: [DateMixin, ProductMixin],
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      require: true,
    },
  },

  data: function () {
    return {
      ProductType: ProductType,

      busy_fetch: false,

      products: [],

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},

      headers: [
        {
          title: this.$t("global.sort.title"),
          align: "start",
          sortable: true,
          value: "title",
        },
        {
          title: this.$t("global.commons.brand"),
          align: "center",
          sortable: true,
          value: "brand",
        },

        {
          title: "SKU",
          align: "center",
          sortable: true,
          value: "sku",
        },
        {
          title: this.$t("global.commons.condition"),
          align: "center",
          sortable: true,
          value: "condition",
        },

        {
          title: this.$t("global.sort.status"),
          align: "center",
          sortable: true,
          value: "status",
        },
        {
          title: this.$t("global.sort.price"),
          align: "center",
          sortable: true,
          value: "price",
        },
        {
          title: this.$t("global.sort.updated_at"),
          align: "start",
          sortable: true,
          value: "updated_at",
        },
        {
          sortable: false,
          value: "clear",
          align: "center",
        },
      ],

      search: null,

      //---------------
      busy_remove: null,
    };
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchProducts(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: threads.debounceSearch(function () {
      const { sortBy, page, itemsPerPage } = this.options;

      this.fetchProducts(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    }),
  },

  computed: {
    displayHeaders() {
      if (!this.modern) return this.headers;
      const widths = { title: "27%", brand: "9%", sku: "11%", condition: "9%", status: "10%", price: "11%", updated_at: "17%", clear: "6%" };
      return this.headers.map((header) => ({
        ...header,
        title: header.value === "status" ? this.$t("importer.product_queue.status") : header.title,
        align: ["price", "clear"].includes(header.value) ? "end" : "start",
        width: widths[header.value],
        cellProps: { class: header.value === "title" ? "b-products-import-queue__identity-cell" : header.value === "clear" ? "b-products-import-queue__action-cell" : undefined },
      }));
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
  },

  methods: {
    fetchProducts(page, sortBy, sortDesc = true) {
      this.page = page;

      this.busy_fetch = true;

      const offset = (page - 1) * this.itemsPerPage;
      const limit = this.itemsPerPage;

      const params = {
        sortBy: sortBy,
        sortDesc: sortDesc,
        search: this.search,
      };

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.importer.que.products(
            this.$route.params.vendor_id,
            offset,
            limit,
            params,
          )
        : window.$backoffice.product.importer.que.products(
            this.shop.id,
            offset,
            limit,
            params,
          )
      )

        .then(({ total, products }) => {
          this.totalItems = total;
          this.products = products;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    cancelImportItem(item_id) {
      this.busy_remove = item_id;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.importer.que.removeProduct(
            this.$route.params.vendor_id,
            item_id,
          )
        : window.$backoffice.product.importer.que.removeProduct(
            this.shop.id,
            item_id,
          )
      )

        .then(({ id }) => {
          this.DeleteItemByID(this.products, id);
          this.totalItems--;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_remove = null;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-products-import-queue {
  --sd-modern-icon-button-size: 32px;
  min-width: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0;

  &__toolbar { flex-wrap: wrap; padding: 12px 0; }
  &__heading { display: flex; align-items: center; gap: 8px; min-width: 0; }
  &__search { flex: 0 1 230px; width: 230px; min-width: 150px; margin-inline-start: auto; }
  &__table {
    --sd-modern-table-font-size: 14px;
    --sd-modern-table-line-height: 22px;
    :deep(> .v-table__wrapper) { overflow: visible; }
    :deep(> .v-table__wrapper > table) {
      table-layout: fixed;
      > thead > tr:not(.v-data-table-progress) > th,
      > tbody > tr > td { padding: 14px 8px !important; }
      > thead > tr:not(.v-data-table-progress) > th:first-child,
      > tbody > tr > td:first-child { padding-inline-start: 12px !important; }
      > thead > tr:not(.v-data-table-progress) > th:last-child,
      > tbody > tr > td:last-child { padding-inline-end: 12px !important; }
      > tbody > tr > td { overflow-wrap: anywhere; }
    }
    :deep(.u--price), :deep(.u--price .small) { font-size: inherit; font-weight: 400; }
  }
  &__identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
  &__image { flex: 0 0 36px; }
  &__image img { width: 100%; height: 100%; object-fit: contain; }
  &__identity-copy { min-width: 0; }
  &__name { display: flex; align-items: baseline; gap: 5px; font-size: 14px; font-weight: 500; line-height: 22px; }
  &__name img { flex: 0 0 16px; align-self: center; }
  &__secondary, &__date small { display: block; margin: 3px 0 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__error { display: flex; align-items: flex-start; gap: 5px; margin-block-start: 5px; font-size: 13px; line-height: 21px; }
  &__error > .v-icon { flex: 0 0 auto; margin-block-start: 2px; }
  &__sku { font-size: 13px; line-height: 21px; overflow-wrap: anywhere; }
  &__date { font-size: 14px; line-height: 22px; }
  &__empty { padding: 32px 12px; font-size: 14px; line-height: 22px; }
  &__footer { padding: 14px 12px; font-size: 13px; line-height: 21px; }

  @media (max-width: 959px) {
    &__table :deep(> .v-table__wrapper > table) {
      display: block;
      > tbody { display: block; width: 100%; }
      > tbody > .v-data-table__tr--mobile {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px 18px;
        padding: 18px 12px;
        border-block-end: 1px solid var(--sd-modern-border);
        > td { display: block; width: auto !important; padding: 0 !important; border: 0; text-align: start; }
        > td:first-child, > td:last-child { padding: 0 !important; }
        > .b-products-import-queue__identity-cell, > .b-products-import-queue__action-cell { grid-column: 1 / -1; }
        > .b-products-import-queue__identity-cell .v-data-table__td-title,
        > .b-products-import-queue__action-cell .v-data-table__td-title { display: none; }
        .v-data-table__td-title { display: block; margin-block-end: 5px; }
        .v-data-table__td-value { display: block; width: 100%; text-align: start; }
      }
      > tbody > tr:not(.v-data-table__tr--mobile) { display: block; > td { display: block; width: 100%; } }
    }
  }
  @media (max-width: 540px) {
    &__search { flex-basis: 100%; width: 100%; margin-inline-start: 0; }
  }
}
</style>

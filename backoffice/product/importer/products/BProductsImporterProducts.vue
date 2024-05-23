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
  <div>
    <v-row no-gutters>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        :label="$t('global.commons.search')"
        class="max-width-field"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:options="options"
      v-model:page="page"
      :class="{ disabled: busy_fetch }"
      :headers="headers"
      :items="products"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="$vuetify.display.xs"
      class="bg-transparent min-height-60vh"
      density="compact"
      hide-default-footer
      item-key="id"
      style="width: 100%"
    >
      <template v-slot:item.title="{ item }">
        <div class="d-flex align-center">
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
        <u-check
          :model-value="item.status === 'Open'"
          :title="item.status"
        ></u-check>
      </template>

      <template v-slot:item.price="{ item }">
        <u-price :amount="item.price" :currency="item.currency"></u-price>
      </template>

      <template v-slot:item.sku="{ item }">
        <span v-copy class="small">{{ item.sku }}</span>
      </template>

      <template v-slot:item.updated_at="{ item }">
        <div class="min-width-150">
          {{ getFromNowString(item.updated_at) }}
          <small class="d-block">
            {{ getLocalTimeString(item.updated_at) }}
          </small>
        </div>
      </template>

      <template v-slot:item.clear="{ item }">
        <v-btn
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

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script>
import threads from "@selldone/core-js/utils/thread/threads";

export default {
  name: "BProductsImporterProducts",

  props: {
    shop: {
      require: true,
    },
  },

  data: function () {
    return {
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
          this.showLaravelError(error);
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
          this.showLaravelError(error);
        })

        .finally(() => {
          this.busy_remove = null;
        });
    },
  },
};
</script>

<style scoped></style>

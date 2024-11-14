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
  <div>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

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
    <v-data-table-server
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="products"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading-text="$t('admin_shop.blogs.list.waiting_message')"
      :mobile="$vuetify.display.xs"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="bg-transparent my-2"
      density="compact"
      hide-default-footer
      item-key="id"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:no-data>
        <div v-if="!busy_fetch && !search" class="py-5 usn fadeIn">
          <img
            :src="require('../../../../assets/guides/map-locations-empty.png')"
            class="m-3 op-0-3"
            width="85%"
          />
          <h2 class="text-h4 font-weight-thin">No product added...</h2>
        </div>
        <div v-else class="text-center px-3 py-5">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:item.title="{ item }">
        <div class="py-1 d-flex align-center">
          <v-avatar class="me-2" rounded size="48">
            <v-img v-if="item.icon" :src="getShopImagePath(item.icon, 128)" />
            <v-icon v-else>fastfood</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <b class="d-block"
              >{{ item.title?.limitWords(7) }}
              <img
                v-if="item.connect_id"
                :src="getConnectIcon(item.connect_id)"
                class="ms-1 rounded"
                height="24"
                width="24"
              />
              <v-icon
                v-if="item.vendor_id"
                class="ms-1"
                size="24"
                title="Created by a vendor."
                >storefront
              </v-icon>
            </b>
            <small>{{ item.title_en }}</small>
          </div>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <u-price
          :amount="item.price"
          :currency="item.currency"
          :title="`Price before discount: ${item.price} ${item.currency}`"
        ></u-price>

        <div v-if="item.discount">
          <v-chip
            :title="`Discount: ${item.discount} ${item.currency}`"
            color="#C2185B"
            size="x-small"
          >
            <v-icon size="x-small" start>fa:fas fa-percentage</v-icon>
            {{ numeralFormat((100 * item.discount) / item.price, "0.[0]") }}
          </v-chip>

          <u-time-progress-bar
            :created-time="item.created_at"
            :end-time="item.dis_end"
            :start-time="item.dis_start"
            small
          />
        </div>
      </template>

      <template v-slot:item.sku="{ item }">
        <div class="py-1">
          <small class="d-block single-line">SKU: {{ item.sku }}</small>
          <small class="d-block single-line">MPN: {{ item.mpn }}</small>
        </div>
      </template>

      <template v-slot:item.edit="{ item }">
        <div class="py-1">
          <v-btn
            :to="{ name: 'BPageProductEdit', params: { product_id: item.id } }"
            icon
            size="small"
            target="_blank"
            title="Edit product"
            variant="text"
          >
            <v-icon>edit</v-icon>
          </v-btn>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { throttle } from "lodash-es";

export default {
  name: "BMapTagProducts",
  components: { UTimeProgressBar },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    mapTag: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    busy_fetch: false,

    products: [],

    search: "",

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    headers() {
      return [
        {
          title: "Title",
          align: "start",
          sortable: true,
          value: "title",
        },
        {
          title: "Price",
          align: "start",
          sortable: true,
          value: "price",
        },
        {
          title: "SKU/MPN",
          align: "start",
          sortable: true,
          value: "sku",
        },
        {
          title: "",
          align: "center",
          sortable: false,
          value: "edit",
        },
      ];
    },
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
    search: throttle(function (newVal, oldVal) {
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchProducts(
        this.page,
        sortBy[0]?.key,
        sortBy[0]?.order === "desc",
      );
    }, window.SERACH_THROTTLE),

    mapTag() {
      this.products = [];
      this.totalItems = 0;
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchProducts(
        this.page,
        sortBy[0]?.key,
        sortBy[0]?.order === "desc",
      );
    },
  },

  created() {},

  methods: {
    getConnectIcon(connect_id: string | number) {
      return window.CDN.GET_CONNECT_ICON(connect_id);
    },

    fetchProducts(page, sortBy, sortDesc = true) {
      // Not created map tag mode:
      if (!this.mapTag.id) {
        return;
      }

      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_SHOP_MAP_TAG_PRODUCTS(this.shop.id, this.mapTag.id),
          {
            params: {
              search: this.search,

              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: sortBy,
              sortDesc: sortDesc,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.totalItems = data.total;
            this.products = data.products;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>

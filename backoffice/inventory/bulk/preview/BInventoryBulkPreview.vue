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
  <div class="widget-box -large min-height-50vh">
    <div v-if="hasCurrency" class="d-flex">
      <v-spacer></v-spacer>
      <u-currency-input
        v-model="currency"
        :active-currencies="currencies"
        :return-object="false"
        class="max-width-field-mini"
        flat
        solo
        transparent
      ></u-currency-input>
    </div>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <v-data-table-server
      v-model:page="page"
      v-model:sort-by="sortBy"
      :class="{ disabled: busy_fetch }"
      :headers="headers"
      :items="products"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="$vuetify.display.xs"
      class="bg-transparent"
      density="compact"
      hide-default-footer
    >
      <template v-slot:item.icon="{ item }">
        <v-img
          :aspect-ratio="1"
          :height="48"
          :src="getShopImagePath(item.icon, 128)"
          :width="48"
          class="rounded my-1 border"
          cover
        />
      </template>

      <template v-slot:item.title="{ item }">
        <div>
          <b> {{ item.title?.limitWords(8) }}</b>
          <small class="d-block my-1 max-w-300">{{
            item.title_en?.limitWords(12)
          }}</small>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <div class="py-1 fxcol0">
          <u-price
            :amount="item.price"
            :currency="item.currency"
            class="disabled"
          ></u-price>

          <template v-if="item.new_price && item.new_price !== item.price">
            <v-icon class="my-n1" size="small">expand_more</v-icon>
            <u-price
              :amount="item.new_price"
              :currency="item.currency"
            ></u-price>
          </template>
        </div>
      </template>

      <template v-slot:item.discount="{ item }">
        <div class="py-1 fxcol0">
          <u-price
            :amount="item.discount"
            :currency="item.currency"
            class="disabled"
          ></u-price>

          <u-time-progress-bar
            :end-time="item.dis_end"
            :start-time="item.dis_start"
            class="disabled"
            small
          ></u-time-progress-bar>

          <template
            v-if="
              typeof item.new_discount !== 'undefined' &&
              ((item.new_dis_start ? item.new_dis_start : null) !==
                item.dis_start ||
                (item.new_dis_end ? item.new_dis_end : null) !== item.dis_end ||
                item.new_discount !== item.discount)
            "
          >
            <v-icon class="my-n1" size="small">expand_more</v-icon>

            <u-price
              :amount="item.new_discount"
              :currency="item.currency"
            ></u-price>

            <u-time-progress-bar
              :end-time="item.new_dis_end"
              :start-time="item.new_dis_start"
              small
            ></u-time-progress-bar>
          </template>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" class="my-3" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { throttle } from "lodash-es";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BInventoryBulkPreview",
  mixins: [],
  components: { UTimeProgressBar, UCurrencyInput },
  props: {
    url: {
      required: true,
    },
    params: { required: true },

    shop: { required: true },
    defaultCurrency: {},
    hasCurrency: { type: Boolean, default: false },
  },
  data: () => ({
    currency: null,
    headers: [
      {
        title: "",
        align: "start",
        sortable: false,
        value: "icon",
        width: "48px",
      },
      {
        title: " Title",
        align: "start",
        sortable: true,
        value: "title",
      },
      {
        title: "Price",
        align: "center",
        value: "price",
        sortable: true,
      },
      {
        title: "Discount",
        align: "center",
        value: "discount",
        sortable: true,
      },
    ],

    products: [],
    busy_fetch: false,

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],

    search: "",
    pending: false,
  }),
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    currencies() {
      return this.shop.currencies;
    },
  },

  watch: {
    search: throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.page = 1;
      this.fetchPage();
    }, window.SERACH_THROTTLE),

    // Pagination:
    sortBy() {
      this.fetchPage();
    },
    page() {
      this.fetchPage();
    },

    currency(_new, _old) {
      this.page = 1;
      this.fetchPage();
    },
  },
  created() {
    if (this.defaultCurrency) this.currency = this.defaultCurrency;
    if (!this.currency) this.currency = this.currencies[0];
  },
  methods: {
    fetchPage() {
      const { sortBy, page } = this.options;
      this.fetchEligibleProducts();
    },

    fetchEligibleProducts() {
      if (this.hasCurrency && !this.currency) return;

      const page = this.page;
      const sortBy = this.sortBy[0]?.key;
      const sortDesc = this.sortBy[0]?.order === "desc";

      this.busy_fetch = true;

      axios
        .get(this.url, {
          params: {
            ...this.params,

            ...(this.hasCurrency ? { currency: this.currency } : {}), // Override currency param in params.

            search: this.search,
            pending: this.pending,

            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.products = data.products;
            this.totalItems = data.total;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
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

<style lang="scss" scoped>
.fxcol0 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

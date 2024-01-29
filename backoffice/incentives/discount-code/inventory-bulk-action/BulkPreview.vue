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
      <s-currency-input
        v-model="currency"
        :active-currencies="currencies"
        :return-object="false"
        transparent
        class="max-width-field-mini"
        solo
        flat
      ></s-currency-input>
    </div>
    <s-progress-loading v-if="busy_fetch"></s-progress-loading>
    <v-data-table-server
      :headers="headers"
      :items="products"
      hide-default-footer
      :items-length="totalItems"
      v-model:options="options"
      v-model:page="page"
      :sort-by="[{ key: null, order: 'desc' }]"
      :items-per-page="itemsPerPage"
      class="bg-transparent dense-padding"
    >
      <template v-slot:item.icon="{ item }">
        <v-img
          :src="getShopImagePath(item.icon, 128)"
          :aspect-ratio="1"
          :height="48"
          :width="48"
          contain
          class="rounded my-1 border"
        />
      </template>

      <template v-slot:item.title="{ item }">
        <div>
          <b> {{ item.title }}</b>
          <small class="d-block my-1">{{ item.title_en }}</small>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <div class="py-1 fxcol0">
          <price-view
            :amount="item.price"
            :currency="item.currency"
            class="disabled"
          ></price-view>

          <template v-if="item.new_price && item.new_price !== item.price">
            <v-icon class="my-n1" size="small">expand_more</v-icon>
            <price-view
              :amount="item.new_price"
              :currency="item.currency"
            ></price-view>
          </template>
        </div>
      </template>

      <template v-slot:item.discount="{ item }">
        <div class="py-1 fxcol0">
          <price-view
            :amount="item.discount"
            :currency="item.currency"
            class="disabled"
          ></price-view>

          <s-time-progress-bar
            small
            :start-time="item.dis_start"
            :end-time="item.dis_end"
            class="disabled"
          ></s-time-progress-bar>

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

            <price-view
              :amount="item.new_discount"
              :currency="item.currency"
            ></price-view>

            <s-time-progress-bar
              small
              :start-time="item.new_dis_start"
              :end-time="item.new_dis_end"
            ></s-time-progress-bar>
          </template>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" rounded :length="pageCount" class="my-3" />
      </template>
    </v-data-table-server>
  </div>
</template>

<script>
import SCurrencyInput from "@components/ui/currency/input/SCurrencyInput.vue";
import STimeProgressBar from "@components/ui/calendar/time-progress/STimeProgressBar.vue";
import _ from "lodash-es";
export default {
  name: "BulkPreview",
  components: { STimeProgressBar, SCurrencyInput },
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
        text: "",
        align: "start",
        sortable: false,
        value: "icon",
        width: "48px",
      },
      {
        text: " Title",
        align: "start",
        sortable: true,
        value: "title",
      },
      {
        text: "Price",
        align: "center",
        value: "price",
        sortable: true,
      },
      {
        text: "Discount",
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
    search: _.throttle(function (newVal, oldVal) {
      if (!newVal && !oldVal) return;
      this.options.page = 1;
      this.fetchEligibleProducts(this.page, this.sortBy);
    }, window.SERACH_THROTTLE),

    // Pagination:
    options: {
      handler() {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        this.fetchEligibleProducts(page, sortBy[0], sortDesc[0]);
      },
      deep: true,
    },

    currency(_new, _old) {
      this.options.page = 1;
      this.fetchEligibleProducts(this.page, this.sortBy);
    },
  },
  created() {
    if (this.defaultCurrency) this.currency = this.defaultCurrency;
    if (!this.currency) this.currency = this.currencies[0];
  },
  methods: {
    fetchEligibleProducts(page, sortBy, sortDesc = true) {
      if (this.hasCurrency && !this.currency) return;

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
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.fxcol0 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

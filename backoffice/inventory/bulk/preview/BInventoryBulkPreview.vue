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
  <div
    class="b-inventory-bulk-preview s-table-loading text-start"
    :class="modern ? 'sd-modern-widget b-inventory-bulk-preview--modern' : 'widget-box -large min-height-50vh'"
    :aria-busy="busy_fetch"
  >
    <div v-if="hasCurrency" :class="modern ? 'sd-modern-list-toolbar b-inventory-bulk-preview__toolbar' : 'd-flex'">
      <v-spacer v-if="!modern"></v-spacer>
      <u-currency-input
        v-model="currency"
        :active-currencies="currencies"
        :return-object="false"
        :class="modern ? 'b-inventory-bulk-preview__currency' : 'max-width-field-mini'"
        :label="modern ? $t('bulk_price_dialog.modern.preview_currency') : undefined"
        :variant="modern ? 'plain' : undefined"
        :single-line="modern"
        :hide-details="modern"
        :dense="modern"
        flat
        solo
        transparent
      ></u-currency-input>
      <p v-if="modern" class="b-inventory-bulk-preview__currency-help">{{ $t(discountUpdate ? 'inventory_list.bulk_discount_dialog.modern.preview_currency_help' : 'bulk_price_dialog.modern.preview_currency_help') }}</p>
    </div>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <div v-if="modern && fetch_error" class="sd-modern-notice b-inventory-bulk-preview__error" role="alert">
      <v-icon size="18" aria-hidden="true">cloud_off</v-icon>
      <span class="sd-modern-notice__content">{{ $t('bulk_price_dialog.modern.preview_error') }}</span>
      <v-btn variant="text" class="sd-modern-button sd-modern-button--inline" @click="fetchPage">{{ $t('bulk_price_dialog.modern.preview_retry') }}</v-btn>
    </div>
    <v-data-table-server
      v-model:page="page"
      v-model:sort-by="sortBy"
      :class="{ disabled: busy_fetch, 'sd-modern-data-table b-inventory-bulk-preview__table': modern }"
      :headers="previewHeaders"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :items="products"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="modern ? $vuetify.display.width <= 760 : $vuetify.display.xs"
      :loading="modern && busy_fetch"
      :loading-text="$t('global.commons.waiting_load_data')"
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
        <div :class="{ 'b-inventory-bulk-preview__identity': modern }">
          <v-img
            v-if="modern"
            :aspect-ratio="1"
            :height="36"
            :src="getShopImagePath(item.icon, 128)"
            :alt="item.title"
            :width="36"
            class="b-inventory-bulk-preview__image hover-scale-small"
            cover
          />
          <div>
            <span v-if="modern" class="b-inventory-bulk-preview__name">{{ item.title }}</span>
            <b v-else>{{ item.title?.limitWords(8) }}</b>
            <small :class="modern ? 'b-inventory-bulk-preview__secondary' : 'd-block my-1 max-w-300'">{{
              modern ? item.title_en : item.title_en?.limitWords(12)
            }}</small>
          </div>
        </div>
      </template>

      <template v-slot:item.price="{ item }">
        <div :class="modern ? 'b-inventory-bulk-preview__current' : 'py-1 fxcol0'">
          <u-price
            :amount="item.price"
            :currency="item.currency"
            :class="{ disabled: !modern }"
          ></u-price>

          <template v-if="!modern && hasNewPrice(item) && item.new_price !== item.price">
            <v-icon class="my-n1" size="small">expand_more</v-icon>
            <u-price
              :amount="item.new_price"
              :currency="item.currency"
            ></u-price>
          </template>
        </div>
      </template>

      <template v-if="modern && !discountUpdate" v-slot:item.new_price="{ item }">
        <div class="b-inventory-bulk-preview__proposed">
          <u-price :amount="hasNewPrice(item) ? item.new_price : item.price" :currency="item.currency" />
          <span v-if="!hasNewPrice(item) || item.new_price === item.price" class="b-inventory-bulk-preview__secondary">{{ $t('bulk_price_dialog.modern.preview_unchanged') }}</span>
        </div>
      </template>

      <template v-slot:item.discount="{ item }">
        <div :class="modern ? 'b-inventory-bulk-preview__discount' : 'py-1 fxcol0'">
          <u-price
            :amount="item.discount"
            :currency="item.currency"
            class="disabled"
          ></u-price>

          <u-time-progress-bar
            :modern="modern"
            :end-time="item.dis_end"
            :start-time="item.dis_start"
            class="disabled"
            small
          ></u-time-progress-bar>
          <span v-if="modern && discountUpdate" class="b-inventory-bulk-preview__secondary">{{ discountPeriodText(item.dis_start, item.dis_end) }}</span>

          <template
            v-if="
              !(modern && discountUpdate) && typeof item.new_discount !== 'undefined' &&
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
              :modern="modern"
              :end-time="item.new_dis_end"
              :start-time="item.new_dis_start"
              small
            ></u-time-progress-bar>
          </template>
        </div>
      </template>

      <template v-if="modern && discountUpdate" v-slot:item.new_discount="{ item }">
        <div class="b-inventory-bulk-preview__discount">
          <u-price :amount="hasNewDiscount(item) ? item.new_discount : item.discount" :currency="item.currency" />
          <u-time-progress-bar :modern="modern" :start-time="hasNewDiscount(item) ? item.new_dis_start : item.dis_start" :end-time="hasNewDiscount(item) ? item.new_dis_end : item.dis_end" small />
          <span class="b-inventory-bulk-preview__secondary">{{ discountPeriodText(hasNewDiscount(item) ? item.new_dis_start : item.dis_start, hasNewDiscount(item) ? item.new_dis_end : item.dis_end) }}</span>
          <span v-if="!hasDiscountChange(item)" class="b-inventory-bulk-preview__secondary">{{ $t('bulk_price_dialog.modern.preview_unchanged') }}</span>
        </div>
      </template>

      <template v-if="modern" v-slot:no-data>
        <div v-if="!fetch_error" class="sd-modern-empty-state">
          <v-icon size="28" aria-hidden="true">inventory_2</v-icon>
          <h3>{{ $t('bulk_price_dialog.modern.preview_empty') }}</h3>
          <p>{{ $t('bulk_price_dialog.modern.preview_empty_help') }}</p>
        </div>
      </template>

      <template v-slot:bottom>
        <div :class="{ 'sd-modern-table-footer b-inventory-bulk-preview__footer': modern }">
          <p v-if="modern">{{ $t('bulk_price_dialog.modern.preview_count', { from: totalItems ? (page - 1) * itemsPerPage + 1 : 0, to: Math.min(page * itemsPerPage, totalItems), total: totalItems }) }}</p>
          <v-pagination v-model="page" :length="pageCount" :class="modern ? 'sd-modern-pagination' : 'my-3'" rounded />
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { throttle } from "lodash-es";
import { formatDiscountPeriod } from '../formatDiscountPeriod';

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
    modern: { type: Boolean, default: false },
    discountUpdate: { type: Boolean, default: false },
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
    fetch_error: false,
    request_id: 0,

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
    previewHeaders() {
      if (!this.modern) return this.headers;
      if (this.discountUpdate) return [
        { title: this.$t('global.commons.product'), align: 'start', sortable: true, value: 'title', width: '38%' },
        { title: this.$t('inventory_list.bulk_discount_dialog.modern.illustration_base'), align: 'end', sortable: true, value: 'price' },
        { title: this.$t('inventory_list.bulk_discount_dialog.modern.preview_discount_current'), align: 'center', sortable: true, value: 'discount' },
        { title: this.$t('inventory_list.bulk_discount_dialog.modern.preview_discount_proposed'), align: 'center', sortable: false, value: 'new_discount' },
      ];
      return [
        { title: this.$t('global.commons.product'), align: 'start', sortable: true, value: 'title', width: '38%' },
        { title: this.$t('bulk_price_dialog.modern.preview_current'), align: 'end', sortable: true, value: 'price' },
        { title: this.$t('bulk_price_dialog.modern.preview_proposed'), align: 'end', sortable: false, value: 'new_price' },
        { title: this.$t('global.commons.discount'), align: 'center', sortable: true, value: 'discount' },
      ];
    },
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
  beforeUnmount() {
    this.request_id++;
  },
  methods: {
    discountPeriodText(start, end) {
      return formatDiscountPeriod(start, end, this.$i18n?.locale || 'en', this.$t);
    },
    hasNewPrice(item) {
      return item.new_price !== undefined && item.new_price !== null;
    },
    hasNewDiscount(item) {
      return item.new_discount !== undefined && item.new_discount !== null;
    },
    hasDiscountChange(item) {
      return this.hasNewDiscount(item) && (item.new_discount !== item.discount ||
        (item.new_dis_start || null) !== (item.dis_start || null) ||
        (item.new_dis_end || null) !== (item.dis_end || null));
    },
    fetchPage() {
      return this.fetchEligibleProducts();
    },

    fetchEligibleProducts() {
      if (this.hasCurrency && !this.currency) return;

      const page = this.page;
      const sortBy = this.sortBy[0]?.key;
      const sortDesc = this.sortBy[0]?.order === "desc";
      const requestId = ++this.request_id;

      this.busy_fetch = true;
      this.fetch_error = false;

      return axios
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
          if (requestId !== this.request_id) return;
          if (!data.error) {
            this.products = data.products;
            this.totalItems = data.total;
          } else {
            this.fetch_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (requestId !== this.request_id) return;
          this.fetch_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (requestId === this.request_id) this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-inventory-bulk-preview--modern {
  min-height: 400px;
  padding: 0;
  border: 0;
  --sd-modern-table-font-size: 13px;

  .b-inventory-bulk-preview__toolbar {
    display: grid;
    grid-template-columns: minmax(160px, 230px) minmax(0, 1fr);
    align-items: center;
    gap: 20px;
    padding: 18px 20px;
  }

  .b-inventory-bulk-preview__currency { min-width: 0; }
  .b-inventory-bulk-preview__currency-help { margin: 0; font-size: 13px; line-height: 21px; color: var(--sd-modern-muted); }
  .b-inventory-bulk-preview__error { margin: 16px 20px; }
  .b-inventory-bulk-preview__table :deep(> .v-table__wrapper) { overflow: visible; }
  .b-inventory-bulk-preview__identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .b-inventory-bulk-preview__image { flex: 0 0 36px; border-radius: 9px; }
  .b-inventory-bulk-preview__name { display: block; font-weight: 500; font-size: 13px; line-height: 21px; overflow-wrap: anywhere; }
  .b-inventory-bulk-preview__secondary { display: block; margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; overflow-wrap: anywhere; }
  .b-inventory-bulk-preview__current,
  .b-inventory-bulk-preview__proposed { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .b-inventory-bulk-preview__discount { display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .b-inventory-bulk-preview__footer { padding: 14px 20px; }
  .b-inventory-bulk-preview__footer > p { margin: 0; font-size: 12px; line-height: 20px; }

  @media (max-width: 760px) {
    .b-inventory-bulk-preview__toolbar { grid-template-columns: 1fr; gap: 8px; padding-inline: 16px; }
    .b-inventory-bulk-preview__currency { max-width: 280px; }
    .b-inventory-bulk-preview__footer { padding-inline: 16px; }
    .b-inventory-bulk-preview__discount { align-items: flex-end; }
  }
}

.fxcol0 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

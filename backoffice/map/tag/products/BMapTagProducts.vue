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
  <div class="b-map-tag-products text-start">
    <div class="sd-modern-list-toolbar b-map-tag-products__toolbar">
      <span class="sd-modern-eyebrow">{{
        $t("map_channel.products_total", { count: totalItems })
      }}</span
      ><v-text-field
        v-model="search"
        :placeholder="$t('map_channel.search_products')"
        :aria-label="$t('map_channel.search_products')"
        class="b-map-tag-products__search"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      />
    </div>
    <v-data-table-server
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="failed ? [] : products"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading="busy_fetch"
      :loading-text="$t('map_channel.loading_products')"
      :mobile="$vuetify.display.xs"
      class="sd-modern-data-table b-map-tag-products__table"
      density="compact"
      hide-default-footer
      item-value="id"
    >
      <template #no-data
        ><div class="sd-modern-empty-state">
          <v-icon size="28" aria-hidden="true">{{
            failed ? "error_outline" : search ? "search_off" : "inventory_2"
          }}</v-icon
          ><strong>{{
            $t(
              failed
                ? "map_channel.products_load_error"
                : search
                  ? "map_channel.products_search_empty"
                  : "map_channel.products_empty",
            )
          }}</strong>
          <p>
            {{
              $t(
                search
                  ? "map_channel.products_search_hint"
                  : "map_channel.products_assignment_help",
              )
            }}
          </p>
          <v-btn
            v-if="failed"
            class="sd-modern-button"
            variant="text"
            prepend-icon="refresh"
            @click="retry"
            >{{ $t("map_channel.retry") }}</v-btn
          >
        </div></template
      >
      <template #item.title="{ item }"
        ><div class="b-map-tag-products__identity">
          <v-avatar rounded size="40" class="hover-scale-small"
            ><v-img
              v-if="item.icon"
              :src="getShopImagePath(item.icon, 128)"
            /><v-icon v-else aria-hidden="true">inventory_2</v-icon></v-avatar
          >
          <div>
            <span class="b-map-tag-products__title">{{ item.title }}</span
            ><span v-if="item.title_en" class="b-map-tag-products__secondary">{{
              item.title_en
            }}</span
            ><img
              v-if="item.connect_id"
              :src="getConnectIcon(item.connect_id)"
              class="hover-scale-small b-map-tag-products__connect"
              width="20"
              height="20"
              alt=""
            /><v-icon
              v-if="item.vendor_id"
              size="16"
              tabindex="0"
              :aria-label="$t('map_channel.vendor_product')"
              v-tooltip="tooltip($t('map_channel.vendor_product'))"
              >storefront</v-icon
            >
          </div>
        </div></template
      >
      <template #item.price="{ item }"
        ><u-price :amount="item.price" :currency="item.currency" />
        <div v-if="item.discount" class="b-map-tag-products__discount">
          <span
            tabindex="0"
            v-tooltip="
              tooltip(
                $t('map_channel.discount_amount', {
                  amount: item.discount,
                  currency: item.currency,
                }),
              )
            "
            ><v-icon size="13" aria-hidden="true">percent</v-icon
            >{{
              numeralFormat(
                item.price ? (100 * item.discount) / item.price : 0,
                "0.[0]",
              )
            }}%</span
          ><u-time-progress-bar
            :created-time="item.created_at"
            :end-time="item.dis_end"
            :start-time="item.dis_start"
            small
          /></div
      ></template>
      <template #item.sku="{ item }"
        ><div class="b-map-tag-products__identifiers">
          <span
            >SKU:
            <span v-if="item.sku" v-copy="item.sku" @click.stop>{{
              item.sku
            }}</span
            ><span v-else>—</span></span
          ><span
            >MPN:
            <span v-if="item.mpn" v-copy="item.mpn" @click.stop>{{
              item.mpn
            }}</span
            ><span v-else>—</span></span
          >
        </div></template
      >
      <template #item.edit="{ item }"
        ><v-tooltip location="top" content-class="sd-modern-tooltip text-start"
          ><template #activator="{ props }"
            ><v-btn
              v-bind="props"
              :to="{
                name: 'BPageProductEdit',
                params: { product_id: item.id },
              }"
              class="sd-modern-icon-button"
              icon="north_east"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="$t('map_channel.open_product_editor')"
              variant="text" /></template
          >{{ $t("map_channel.open_product_editor") }}</v-tooltip
        ></template
      >
      <template #bottom
        ><footer class="sd-modern-table-footer">
          <span>{{
            $t("map_channel.products_page_summary", {
              start: totalItems ? (page - 1) * itemsPerPage + 1 : 0,
              end: Math.min(page * itemsPerPage, totalItems),
              total: totalItems,
            })
          }}</span
          ><v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="$vuetify.display.xs ? 3 : 5"
            class="sd-modern-pagination"
            :disabled="busy_fetch"
          /></footer
      ></template>
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
    shop: { required: true, type: Object },
    mapTag: { required: true, type: Object },
  },
  data: () => ({
    busy_fetch: false,
    failed: false,
    products: [],
    search: "",
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],
    fetch_revision: 0,
    disposed: false,
  }),
  computed: {
    pageCount() {
      return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    },
    scope_key() {
      return String(this.shop.id) + ":" + String(this.mapTag.id || "");
    },
    headers() {
      return [
        {
          title: this.$t("map_channel.product_title"),
          align: "start",
          sortable: true,
          key: "title",
        },
        {
          title: this.$t("map_channel.price"),
          align: "start",
          sortable: true,
          key: "price",
        },
        { title: "SKU / MPN", align: "start", sortable: true, key: "sku" },
        { title: "", align: "end", sortable: false, key: "edit", width: 48 },
      ];
    },
  },
  watch: {
    options: {
      deep: true,
      handler() {
        this.fetchProducts(
          this.page,
          this.sortBy[0]?.key,
          this.sortBy[0]?.order === "desc",
        );
      },
    },
    search: throttle(function () {
      this.page = 1;
      this.fetchProducts(
        1,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    }, window.SERACH_THROTTLE),
    scope_key() {
      this.fetch_revision++;
      this.products = [];
      this.totalItems = 0;
      this.page = 1;
      this.search = "";
      this.fetchProducts(
        1,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },
  },
  beforeUnmount() {
    this.disposed = true;
    this.fetch_revision++;
  },
  methods: {
    getConnectIcon(connectId: string | number) {
      return window.CDN.GET_CONNECT_ICON(connectId);
    },
    tooltip(text) {
      return {
        text,
        location: "top",
        contentClass: "sd-modern-tooltip text-start",
      };
    },
    retry() {
      return this.fetchProducts(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    },
    async fetchProducts(page, sortBy, sortDesc = true) {
      if (this.disposed) return;
      const revision = ++this.fetch_revision,
        shopId = this.shop.id,
        tagId = this.mapTag.id,
        search = this.search;
      if (!tagId) {
        this.busy_fetch = false;
        return;
      }
      this.busy_fetch = true;
      this.failed = false;
      try {
        const { data } = await axios.get(
          window.API.GET_SHOP_MAP_TAG_PRODUCTS(shopId, tagId),
          {
            params: {
              search,
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy,
              sortDesc,
            },
          },
        );
        if (
          revision !== this.fetch_revision ||
          String(this.shop.id) !== String(shopId) ||
          String(this.mapTag.id) !== String(tagId) ||
          this.search !== search
        )
          return;
        if (
          data.error ||
          !Array.isArray(data.products) ||
          !Number.isFinite(Number(data.total))
        )
          throw new Error("Invalid assigned-products response");
        this.totalItems = Number(data.total);
        this.products = data.products;
        if (this.page > this.pageCount) this.page = this.pageCount;
      } catch (error) {
        if (revision === this.fetch_revision) {
          this.failed = true;
          this.products = [];
          NotificationService.showLaravelError(error);
        }
      } finally {
        if (revision === this.fetch_revision) this.busy_fetch = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.b-map-tag-products {
  font-size: 13px;
  line-height: 21px;
  &__toolbar {
    margin-top: 12px;
  }
  &__search {
    max-width: 230px;
  }
  &__identity {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
    padding-block: 8px;
  }
  &__identity > div:last-child {
    min-width: 0;
  }
  &__title {
    display: block;
    font-size: 13px;
    line-height: 21px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  &__secondary,
  &__identifiers {
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 21px;
    overflow-wrap: anywhere;
  }
  &__identifiers {
    display: grid;
    gap: 2px;
    padding-block: 8px;
  }
  &__identifiers :deep(.animate-underline) {
    padding-bottom: 0;
  }
  &__connect {
    object-fit: contain;
    margin-inline-end: 5px;
    vertical-align: middle;
  }
  &__discount {
    max-width: 150px;
    margin-top: 4px;
    color: var(--sd-modern-muted);
    font-size: 12px;
  }
  &__discount > span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  &__table {
    --sd-modern-table-font-size: 13px;
    --sd-modern-table-line-height: 21px;
  }
  &__table :deep(.v-data-table__td) {
    font-size: 13px;
    line-height: 21px;
  }
  &__table :deep(.v-data-table__td:last-child) {
    padding-inline-start: 16px;
  }
}
@media (max-width: 600px) {
  .b-map-tag-products__search {
    max-width: none;
    width: 100%;
  }
}
</style>

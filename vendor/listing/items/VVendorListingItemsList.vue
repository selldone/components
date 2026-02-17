<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-bind="$attrs" class="widget-box -large mb-5">
    <u-widget-header
      :title="$t('shop_listing.items.title')"
      icon="view_list"
      :add-caption="$t('global.actions.add')"
      @click:add="createNewDialog"
    />

    <v-list-subheader>
      {{ $t("shop_listing.items.sub_title") }}

      <v-btn
        v-if="ShopURLs && shop"
        :href="ShopURLs.MainShopUrl(shop) + '/listing'"
        target="_blank"
        prepend-icon="launch"
        variant="text"
        size="small"
        color="primary"
        class="ms-2"
      >
        Open Listing
      </v-btn>
    </v-list-subheader>

    <v-row no-gutters class="align-center">
      <b-listing-category-input
        v-model="filter_category_id"
        :return-object="false"
        :label="$t('global.commons.category')"
        variant="solo"
        bg-color="transparent"
        class="max-w-350"
        clearable
        flat
        hide-details
        prepend-inner-icon="folder_open"
      />

      <v-select
        v-model="filter_status"
        :items="statusOptions"
        item-title="title"
        item-value="value"
        :label="$t('global.commons.status')"
        class="max-w-250 ms-2"
        clearable
        flat
        hide-details
        bg-color="transparent"
        variant="solo"
      />

      <v-spacer />

      <v-text-field
        v-model="search"
        :placeholder="$t('global.commons.search')"
        bg-color="transparent"
        class="max-width-field-mini"
        clearable
        flat
        hide-details
        prepend-icon="search"
        single-line
        variant="solo"
      />
    </v-row>

    <u-loading-progress v-if="busy_fetch" />

    <v-data-table-server
      :mobile="$vuetify.display.xs"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :row-props="
        (_data) => {
          return {
            class: 'row-hover' + (busy_action === _data.item.id ? ' disabled' : ''),
          };
        }
      "
      class="bg-transparent mb-4 min-height-60vh"
      density="compact"
      hide-default-footer
      @click:row="(_, r) => editDialog(r.item)"
    >
      <template v-slot:no-data>
        <div v-if="!busy_fetch && !searchSafe" class="py-5 usn text-center fadeIn">
          <v-icon size="64" class="op-0-3">view_list</v-icon>
          <h2 class="text-h5 font-weight-thin mt-2">
            {{ $t("shop_listing.items.empty_title") }}
          </h2>
          <div class="text-muted mt-2">
            {{ $t("shop_listing.items.empty_subtitle") }}
          </div>
        </div>

        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>

      <template v-slot:item.title="{ item }">
        <div class="min-width-200 py-1 d-flex align-center">
          <u-avatar-folder
            :src="
              item.media?.length > 0
                ? getShopImagePath(item.media[0].path || item.media[0].url)
                : undefined
            "
            side-icon="person"
          />

          <div class="ps-2 min-w-0">
            <div class="font-weight-black text-truncate">{{ item.title }}</div>

            <small v-if="item.subtitle" class="d-block lhn text-muted text-truncate">
              {{ item.subtitle }}
            </small>

            <small v-if="item.description" class="d-block lhn op-0-7 text-truncate">
              {{ String(item.description || '').limitWords(12) }}
            </small>
          </div>
        </div>
      </template>

      <template v-slot:item.category_id="{ item }">
        <v-chip
          v-if="item.category"
          size="small"
          variant="flat"
          color="amber"
          :prepend-avatar="item.category.icon ? getShopImagePath(item.category.icon) : undefined"
        >
          {{ item.category.title }}
        </v-chip>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip size="x-small" label variant="tonal" :class="statusClass(item)">
          {{ item.status }}
        </v-chip>
      </template>

      <template v-slot:item.price="{ item }">
        <div class="min-width-160">
          <u-price
            v-if="item.price !== null && item.price !== undefined"
            :amount="item.price"
            :currency="item.currency || shop?.listing?.default_currency"
          />
          <span v-if="item.price_to" class="ms-1 text-muted">
            —
            <u-price
              :amount="item.price_to"
              :currency="item.currency || shop?.listing?.default_currency"
            />
          </span>

          <small v-if="item.price === null || item.price === undefined" class="text-muted">
            {{ $t("global.commons.not_set") }}
          </small>
        </div>
      </template>

      <template v-slot:item.created_at="{ item }">
        <div class="min-width-250">
          {{ getFromNowString(item.created_at) }}
          <br />
          <small>{{ getLocalTimeString(item.created_at) }}</small>
        </div>
      </template>

      <template v-slot:item.menu="{ item }">
        <u-smart-menu
          :loading="busy_action === item.id"
          :items="menuItems(item)"
        />
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>

  <!-- █████████████████ Dialog > Add/Edit Item █████████████████ -->
  <v-dialog v-model="dialog" fullscreen scrollable transition="dialog-bottom-transition">
    <!-- General shared upsert (will work in vendor routes too) -->
    <b-shop-listing-item-upsert
      v-if="dialog_pre"
      :item="selected_item"
      has-close
      @close="dialog = false"
      @add="onItemAdded"
      @edit="onItemEdited"
    />
  </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { throttle } from "lodash-es";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import BShopListingItemUpsert from "@selldone/components-vue/backoffice/listing/item/upsert/BShopListingItemUpsert.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import BListingCategoryInput from "@selldone/components-vue/backoffice/listing/category/input/BListingCategoryInput.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { ShopURLs } from "@selldone/core-js/helper";

export default {
  name: "VVendorListingItemsList",
  mixins: [DateMixin],

  inject: ["$shop"],

  components: {
    UAvatarFolder,
    BListingCategoryInput,
    USmartMenu,
    BShopListingItemUpsert,
  },

  props: {
    vendorId: { type: Number, required: true },
  },

  data: () => ({
    ShopURLs,

    items: [] as any[],
    totalItems: 0,

    search: "",
    filter_category_id: null as number | null,
    filter_status: null as string | null,

    busy_fetch: false,
    busy_action: null as number | null,

    page: 1,
    itemsPerPage: 10,
    options: {} as any,
    sortBy: [{ key: "created_at", order: "desc" }] as any[],

    dialog: false,
    dialog_pre: false,
    selected_item: null as any | null,

    _fetch_timer: null as any,
    _last_fetch_key: "" as string,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    pageCount(): number {
      return Math.ceil((this.totalItems || 0) / this.itemsPerPage);
    },

    searchSafe(): string | null {
      const s = String(this.search || "").trim();
      return s.length ? s : null;
    },

    statusOptions(): any[] {
      return [
        { title: this.$t("global.commons.all"), value: null },
        { title: "pending", value: "pending" },
        { title: "approved", value: "approved" },
        { title: "published", value: "published" },
        { title: "rejected", value: "rejected" },
        { title: "archived", value: "archived" },
      ];
    },

    headers(): any[] {
      return [
        { title: this.$t("global.sort.title"), align: "start", sortable: true, value: "title" },
        { title: this.$t("global.commons.category"), align: "center", sortable: false, value: "category_id" },
        { title: this.$t("global.commons.status"), align: "center", sortable: true, value: "status" },
        { title: this.$t("global.sort.price"), align: "center", sortable: true, value: "price" },
        { title: this.$t("global.sort.created_at"), align: "start", sortable: true, value: "created_at" },
        { title: "", align: "center", value: "menu", sortable: false },
      ];
    },
  },

  watch: {
    vendorId: {
      immediate: true,
      handler() {
        this.page = 1;
        this.scheduleFetch();
      },
    },

    options: {
      handler() {
        this.scheduleFetch();
      },
      deep: true,
    },

    page() {
      this.scheduleFetch();
    },

    search: throttle(function () {
      this.page = 1;
      this.scheduleFetch();
    }, (window as any).SERACH_THROTTLE || 600),

    filter_category_id() {
      this.page = 1;
      this.scheduleFetch();
    },

    filter_status() {
      this.page = 1;
      this.scheduleFetch();
    },
  },

  beforeUnmount() {
    if (this._fetch_timer) clearTimeout(this._fetch_timer);
  },

  methods: {
    statusClass(item: any) {
      const s = String(item?.status || "").toLowerCase();
      if (s === "published") return "text-success";
      if (s === "approved") return "text-success";
      if (s === "pending") return "text-warning";
      if (s === "rejected") return "text-red";
      if (s === "archived") return "text-muted";
      return "text-muted";
    },

    buildFetchKey(page: number, sortBy: string, sortDesc: boolean) {
      return JSON.stringify({
        vendorId: this.vendorId,
        page,
        ipp: this.itemsPerPage,
        sortBy,
        sortDesc,
        search: this.searchSafe || "",
        category_id: this.filter_category_id || null,
        status: this.filter_status || null,
      });
    },

    scheduleFetch() {
      if (this._fetch_timer) clearTimeout(this._fetch_timer);

      this._fetch_timer = setTimeout(() => {
        const sortKey =
          this.options?.sortBy?.[0]?.key ||
          this.sortBy?.[0]?.key ||
          "created_at";

        const sortDesc =
          (this.options?.sortBy?.[0]?.order || this.sortBy?.[0]?.order) === "desc";

        const page = this.page || this.options?.page || 1;

        this.fetchItems(page, sortKey, sortDesc);
      }, 0);
    },

    fetchItems(page: number, sortBy: string, sortDesc: boolean) {
      const vendorId = parseInt(String(this.vendorId || 0), 10) || 0;
      if (!vendorId) return;

      const key = this.buildFetchKey(page, sortBy, sortDesc);
      if (key === this._last_fetch_key) return;
      this._last_fetch_key = key;

      this.busy_fetch = true;

      axios
        .get(window.VAPI.GET_MY_VENDOR_LISTING_ITEMS(vendorId), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,

            sortBy,
            sortDesc: sortDesc ? "true" : "false",

            search: this.searchSafe,
            category_id: this.filter_category_id || null,
            status: this.filter_status || null,
          },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.items = Array.isArray(data.items) ? data.items : [];
          this.totalItems = parseInt(String(data.total || 0), 10) || this.items.length;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_fetch = false));
    },

    // ───────────────────────────────────────────────────────────────
    // Dialog
    // ───────────────────────────────────────────────────────────────

    createNewDialog() {
      this.selected_item = null;
      this.dialog_pre = false;

      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => (this.dialog = true));
      });
    },

    editDialog(item: any) {
      this.selected_item = item;
      this.dialog_pre = false;

      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => (this.dialog = true));
      });
    },

    onItemAdded(created: any) {
      this.dialog = false;

      // Your global helper (preferred)
      // @ts-ignore
      if (typeof this.AddOrUpdateItemByID === "function") {
        // @ts-ignore
        this.AddOrUpdateItemByID(this.items, created);
      } else {
        const id = created?.id;
        const i = this.items.findIndex((x: any) => x?.id === id);
        if (i >= 0) this.items.splice(i, 1, { ...this.items[i], ...created });
        else this.items.unshift(created);
      }

      this.totalItems++;
      this.scheduleFetch();
    },

    onItemEdited(updated: any) {
      this.dialog = false;

      // @ts-ignore
      if (typeof this.AddOrUpdateItemByID === "function") {
        // @ts-ignore
        this.AddOrUpdateItemByID(this.items, updated);
      } else {
        const id = updated?.id;
        const i = this.items.findIndex((x: any) => x?.id === id);
        if (i >= 0) this.items.splice(i, 1, { ...this.items[i], ...updated });
      }

      this.scheduleFetch();
    },

    // ───────────────────────────────────────────────────────────────
    // Duplicate (vendor: POST create)
    // ───────────────────────────────────────────────────────────────

    duplicateItem(item: any) {
      const vendorId = parseInt(String(this.vendorId || 0), 10) || 0;
      if (!vendorId) return;

      const categoryId = item?.category_id ?? item?.category?.id ?? null;
      if (!categoryId) {
        NotificationService.showErrorAlert(null, "This item has no category.");
        return;
      }

      NotificationService.openDangerAlert(
        "Duplicate item",
        "Create a copy of this item? Media will not be duplicated.",
        "Duplicate",
        () => {
          this.busy_action = item.id;

          const payload: any = {
            category_id: categoryId,
            title: `${item.title || "Item"} (Copy)`,
            slug: null,

            subtitle: item.subtitle ?? null,
            description: item.description ?? null,

            price: item.price ?? null,
            price_to: item.price_to ?? null,
            currency: item.currency ?? this.shop?.listing?.default_currency ?? null,
            price_unit: item.price_unit ?? null,

            country_code: item.country_code ?? null,
            city: item.city ?? null,
            address: item.address ?? null,
            lat: item.lat ?? null,
            lng: item.lng ?? null,

            tel: item.tel ?? null,
            email: item.email ?? null,
            website: item.website ?? null,

            links: Array.isArray(item.links) && item.links.length ? item.links : null,
            opening_hours: Array.isArray(item.opening_hours) && item.opening_hours.length ? item.opening_hours : null,

            meta:
              item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
                ? item.meta
                : null,

            company_id: item.company_id ?? item.company?.id ?? null,
            badge_ids: Array.isArray(item.badge_ids) && item.badge_ids.length ? item.badge_ids : null,
          };

          axios
            .post(window.VAPI.POST_MY_VENDOR_LISTING_ITEM_ADD(vendorId), payload)
            .then(({ data }) => {
              if (data?.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }

              const created = data.item || data.result || data;
              if (!created?.id) {
                NotificationService.showErrorAlert(null, "Invalid server response.");
                return;
              }

              // Required by you:
              // @ts-ignore
              if (typeof this.AddOrUpdateItemByID === "function") {
                // @ts-ignore
                this.AddOrUpdateItemByID(this.items, created);
              } else {
                this.items.unshift(created);
              }
              this.totalItems++;

              NotificationService.showSuccessAlert(null, "Duplicated successfully.");
              this.editDialog(created);
            })
            .catch((error) => NotificationService.showLaravelError(error))
            .finally(() => (this.busy_action = null));
        },
      );
    },

    menuItems(item: any) {
      return [
        { title: this.$t("global.actions.edit"), icon: "edit", click: () => this.editDialog(item) },
        { title: this.$t("global.actions.create_clone"), icon: "library_add", click: () => this.duplicateItem(item) },
        { title: this.$t("global.actions.delete"), icon: "delete", click: () => this.deleteItem(item) },
      ];
    },

    deleteItem(item: any) {
      const vendorId = parseInt(String(this.vendorId || 0), 10) || 0;
      if (!vendorId || !item?.id) return;

      NotificationService.openDangerAlert(
        this.$t("global.actions.delete"),
        "Delete this listing item?",
        this.$t("global.actions.delete"),
        () => {
          this.busy_action = item.id;

          axios
            .delete(window.VAPI.DELETE_MY_VENDOR_LISTING_ITEM(vendorId, item.id))
            .then(({ data }) => {
              if (data?.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }

              const i = this.items.findIndex((x: any) => x?.id === item.id);
              if (i >= 0) this.items.splice(i, 1);
              this.totalItems = Math.max(0, (this.totalItems || 0) - 1);

              NotificationService.showSuccessAlert(null, "Deleted.");
              this.scheduleFetch();
            })
            .catch((error) => NotificationService.showLaravelError(error))
            .finally(() => (this.busy_action = null));
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.max-w-350 {
  max-width: 350px;
}
.max-w-250 {
  max-width: 250px;
}
</style>

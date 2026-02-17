<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div v-bind="$attrs"  class="widget-box -large mb-5">
      <u-widget-header
        :title="$t('shop_listing.companies.title')"
        icon="business"
        :add-caption="$t('global.actions.add')"
        @click:add="createNewDialog"
      />

      <v-list-subheader>
        {{ $t("shop_listing.companies.sub_title") }}
      </v-list-subheader>

      <v-row no-gutters class="align-center">
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
        :items="companies"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :row-props="
          (_data) => {
            return {
              class:
                'row-hover' + (busy_action === _data.item.id ? ' disabled' : ''),
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
            <v-icon size="64" class="op-0-3">business</v-icon>
            <h2 class="text-h5 font-weight-thin mt-2">
              {{ $t("shop_listing.companies.empty_title") }}
            </h2>
            <div class="text-muted mt-2">
              {{ $t("shop_listing.companies.empty_subtitle") }}
            </div>
          </div>

          <div v-else class="text-center px-3 py-5 text-muted">
            <v-icon class="me-1">sentiment_dissatisfied</v-icon>
            {{ $t("global.commons.no_data") }}
          </div>
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-1 min-width-260">
            <v-avatar :size="40" class="rounded-lg me-2" color="#f6f6f6">
              <img v-if="item.logo" :src="getShopImagePath(item.logo)" />
              <v-icon v-else>business</v-icon>
            </v-avatar>

            <div class="min-width-120 min-w-0">
              <div class="font-weight-black text-truncate">{{ item.name }}</div>

              <small v-if="item.website" class="d-block lhn text-muted text-truncate">
                {{ item.website }}
              </small>

              <small v-else-if="item.email" class="d-block lhn text-muted text-truncate">
                {{ item.email }}
              </small>
            </div>
          </div>
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-chip
            size="x-small"
            label
            variant="tonal"
            :class="item.is_active ? 'text-success' : 'text-muted'"
          >
            {{ item.is_active ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <template v-slot:item.sort_order="{ item }">
          <div class="text-center min-width-80">
            <b>{{ item.sort_order ?? 0 }}</b>
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

    <!-- █████████████████ Dialog > Add/Edit Company █████████████████ -->
    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <!-- Shared component (auto-switches to VAPI in vendor routes) -->
      <b-shop-listing-company-upsert
        v-if="dialog_pre"
        :company="selected_company"
        has-close
        @close="dialog = false"
        @add="onCompanySaved"
        @edit="onCompanySaved"
      />
    </v-dialog>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { throttle } from "lodash-es";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import BShopListingCompanyUpsert from "@selldone/components-vue/backoffice/listing/company/upsert/BShopListingCompanyUpsert.vue";

export default {
  name: "VVendorListingCompaniesList",

  inject: ["$shop"],

  components: {
    USmartMenu,
    BShopListingCompanyUpsert,
  },

  props: {
    vendorId: { type: Number, required: true },
  },

  data: () => ({
    companies: [] as any[],
    totalItems: 0,

    search: "",

    busy_fetch: false,
    busy_action: null as number | null,

    // Pagination
    page: 1,
    itemsPerPage: 10,
    options: {} as any,
    sortBy: [{ key: "created_at", order: "desc" }] as any[],

    // Dialog
    dialog: false,
    dialog_pre: false,
    selected_company: null as any | null,
  }),

  computed: {
    pageCount(): number {
      return Math.ceil((this.totalItems || 0) / this.itemsPerPage);
    },

    searchSafe(): string | null {
      const s = String(this.search || "").trim();
      return s.length ? s : null;
    },

    headers(): any[] {
      return [
        { title: this.$t("global.sort.title"), align: "start", sortable: true, value: "name" },
        { title: this.$t("global.commons.state"), align: "center", sortable: true, value: "is_active" },
        { title: this.$t("global.sort.order"), align: "center", sortable: true, value: "sort_order" },
        { title: "", align: "center", value: "menu", sortable: false },
      ];
    },
  },

  watch: {
    vendorId: {
      immediate: true,
      handler() {
        this.page = 1;
        this.refresh();
      },
    },

    options: {
      handler() {
        this.refresh();
      },
      deep: true,
    },

    search: throttle(function () {
      this.page = 1;
      this.refresh();
    }, (window as any).SERACH_THROTTLE || 600),
  },

  methods: {
    refresh() {
      const vendorId = parseInt(String(this.vendorId || 0), 10) || 0;
      if (!vendorId) return;

      const sortKey = this.options?.sortBy?.[0]?.key || "created_at";
      const sortDesc = this.options?.sortBy?.[0]?.order === "desc";
      const page = this.options?.page || this.page || 1;

      this.busy_fetch = true;

      axios
        .get(window.VAPI.GET_MY_VENDOR_LISTING_COMPANIES(vendorId), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortKey,
            sortDesc: sortDesc ? "true" : "false",
            search: this.searchSafe,
          },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.companies = Array.isArray(data.companies) ? data.companies : [];
          this.totalItems = parseInt(String(data.total || 0), 10) || this.companies.length;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_fetch = false));
    },

    createNewDialog() {
      this.selected_company = null;
      this.dialog_pre = false;

      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => (this.dialog = true));
      });
    },

    editDialog(company: any) {
      this.selected_company = company;
      this.dialog_pre = false;

      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => (this.dialog = true));
      });
    },

    onCompanySaved(company: any) {
      this.dialog = false;

      // Best effort local update (keeps UI snappy), then refresh for consistency.
      const id = company?.id ? parseInt(String(company.id), 10) : 0;
      if (id) {
        const existed = this.companies.some((x: any) => parseInt(String(x?.id || 0), 10) === id);

        // @ts-ignore (project helper)
        if (typeof this.AddOrUpdateItemByID === "function") {
          // @ts-ignore
          this.AddOrUpdateItemByID(this.companies, company);
        } else {
          const i = this.companies.findIndex((x: any) => parseInt(String(x?.id || 0), 10) === id);
          if (i >= 0) this.companies.splice(i, 1, { ...this.companies[i], ...company });
          else this.companies.unshift(company);
        }

        if (!existed) this.totalItems = (parseInt(String(this.totalItems || 0), 10) || 0) + 1;
      }

      this.refresh();
    },

    menuItems(company: any) {
      return [
        { title: this.$t("global.actions.edit"), icon: "edit", click: () => this.editDialog(company) },
        { title: this.$t("global.actions.delete"), icon: "clear", click: () => this.deleteCompany(company) },
      ];
    },

    deleteCompany(company: any) {
      const vendorId = parseInt(String(this.vendorId || 0), 10) || 0;
      const id = company?.id ? parseInt(String(company.id), 10) : 0;
      if (!vendorId || !id) return;

      NotificationService.openDangerAlert(
        this.$t("global.actions.delete"),
        "Delete this company? Items using it will lose company_id.",
        this.$t("global.actions.delete"),
        () => {
          this.busy_action = id;

          axios
            .delete(window.VAPI.DELETE_MY_VENDOR_LISTING_COMPANY(vendorId, id))
            .then(({ data }) => {
              if (data?.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }

              NotificationService.showSuccessAlert(null, "Deleted.");

              const i = this.companies.findIndex((x: any) => parseInt(String(x?.id || 0), 10) === id);
              if (i >= 0) this.companies.splice(i, 1);
              this.totalItems = Math.max(0, (parseInt(String(this.totalItems || 0), 10) || 0) - 1);

              this.refresh();
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

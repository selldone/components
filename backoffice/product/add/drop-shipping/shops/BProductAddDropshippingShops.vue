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
  <div class="b-product-add-wholesalers sd-modern-content text-start">
    <header class="sd-modern-header b-product-add-wholesalers__heading">
      <div>
        <h1 class="sd-modern-title-text">{{ $t(copy + "title") }}</h1>
        <p class="sd-modern-subtitle">{{ $t(copy + "intro") }}</p>
      </div>
      <v-btn
        class="sd-modern-button sd-modern-button--compact"
        variant="text"
        color="primary"
        :aria-expanded="show_workflow"
        aria-controls="dropshipping-workflow"
        @click="show_workflow = !show_workflow"
      >
        <v-icon size="18" aria-hidden="true">schema</v-icon>
        {{ $t(copy + "how_it_works") }}
        <v-icon size="16" aria-hidden="true">{{
          show_workflow ? "expand_less" : "expand_more"
        }}</v-icon>
      </v-btn>
    </header>

    <b-product-add-dropshipping-workflow
      v-if="show_workflow"
      id="dropshipping-workflow"
      class="b-product-add-wholesalers__workflow"
    />

    <section
      class="sd-modern-widget b-product-add-wholesalers__list"
      :aria-busy="busy_fetch"
      :aria-label="$t(copy + 'title')"
    >
      <div class="sd-modern-list-toolbar b-product-add-wholesalers__toolbar">
        <div class="b-product-add-wholesalers__filter">
          <label class="b-product-add-wholesalers__toggle">
            <input v-model="show_all" type="checkbox" @change="filterChanged" />
            <span>{{ $t(copy + "all_wholesalers") }}</span>
          </label>
          <v-tooltip
            content-class="sd-modern-tooltip"
            location="top"
            open-on-click
            :persistent="false"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="sd-modern-info-button"
                :aria-label="$t(copy + 'accepted_filter_help')"
              >
                <v-icon size="14" aria-hidden="true">info_outline</v-icon>
              </button>
            </template>
            {{ $t(copy + "accepted_filter_help") }}
          </v-tooltip>
        </div>
        <div class="b-product-add-wholesalers__utilities">
          <s-country-select
            v-model="country"
            :filter="shop.countries"
            class="b-product-add-wholesalers__country"
            :placeholder="$t(copy + 'country_placeholder')"
            :aria-label="$t(copy + 'country_placeholder')"
            prepend-inner-icon="public"
            hide-details
            clearable
            item-value="alpha2"
            variant="plain"
            :menu-props="{ contentClass: 'sd-modern-select-menu' }"
            @change="filterChanged"
          />
          <v-text-field
            v-model="search"
            :placeholder="$t(copy + 'search_placeholder')"
            :aria-label="$t(copy + 'search_placeholder')"
            class="b-product-add-wholesalers__search"
            clearable
            hide-details
            prepend-inner-icon="search"
            single-line
            variant="plain"
            @update:model-value="searchThrottled"
          />
          <v-select
            :model-value="sortKey"
            :items="sortOptions"
            :aria-label="$t(copy + 'sort_label')"
            class="b-product-add-wholesalers__sort"
            hide-details
            variant="plain"
            :menu-props="{ contentClass: 'sd-modern-select-menu' }"
            @update:model-value="changeSort"
          />
          <v-tooltip content-class="sd-modern-tooltip" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="sd-modern-icon-button"
                icon
                variant="text"
                :aria-label="sortDirectionLabel"
                @click="toggleSortDirection"
              >
                <v-icon size="17" aria-hidden="true">{{
                  sortBy[0]?.order === "asc" ? "arrow_upward" : "arrow_downward"
                }}</v-icon>
              </v-btn>
            </template>
            {{ sortDirectionLabel }}
          </v-tooltip>
        </div>
      </div>

      <v-data-table-server
        :page="page"
        :sort-by="sortBy"
        :headers="headers"
        :items="drop_shops"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :loading="busy_fetch"
        :loading-text="$t('global.commons.waiting_load_data')"
        :mobile="$vuetify.display.width < 800"
        :hide-default-header="$vuetify.display.width < 800"
        :row-props="() => ({ class: 'row-hover' })"
        class="sd-modern-data-table b-product-add-wholesalers__table"
        density="compact"
        hide-default-footer
        item-value="id"
        @update:page="changePage"
        @update:sort-by="setSort"
        @click:row="(_, row) => $emit('select', row.item)"
      >
        <template #item.title="{ item }">
          <div class="b-product-add-wholesalers__identity">
            <v-avatar
              class="b-product-add-wholesalers__avatar avatar-gradient -thin -wholesaler"
              size="35"
            >
              <v-img
                v-if="item.icon"
                :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
              />
              <v-icon v-else size="20" aria-hidden="true">storefront</v-icon>
            </v-avatar>
            <div class="b-product-add-wholesalers__identity-copy">
              <button
                type="button"
                class="b-product-add-wholesalers__name"
                @click.stop="$emit('select', item)"
              >
                {{ item.title }}
              </button>
              <button
                v-copy
                type="button"
                class="b-product-add-wholesalers__handle"
                :aria-label="$t('global.actions.copy') + ': @' + item.name"
                @click.stop
              >
                <bdi>@{{ item.name }}</bdi>
              </button>
            </div>
          </div>
        </template>
        <template #item.countries="{ item }">
          <div class="b-product-add-wholesalers__countries">
            <v-tooltip
              v-for="code in item.countries?.slice(0, 7)"
              :key="code"
              content-class="sd-modern-tooltip"
              location="top"
              open-on-click
              :persistent="false"
            >
              <template #activator="{ props }">
                <button
                  v-bind="props"
                  type="button"
                  class="b-product-add-wholesalers__country-help"
                  :aria-label="getCountryName(code)"
                  @click.stop
                >
                  <flag :iso="code" :squared="false" />
                </button>
              </template>
              {{ getCountryName(code) }}
            </v-tooltip>
            <v-tooltip
              v-if="item.countries?.length > 7"
              content-class="sd-modern-tooltip"
              location="top"
              open-on-click
              :persistent="false"
            >
              <template #activator="{ props }">
                <button
                  v-bind="props"
                  type="button"
                  class="b-product-add-wholesalers__country-help"
                  :aria-label="
                    $t(copy + 'countries_more', {
                      count: item.countries.length - 7,
                    })
                  "
                  @click.stop
                >
                  +{{ item.countries.length - 7 }}
                </button>
              </template>
              {{ item.countries.slice(7).map(getCountryName).join(", ") }}
            </v-tooltip>
          </div>
        </template>
        <template #item.drop_shipping_products="{ item }">
          {{ numeralFormat(item.drop_shipping_products, "0.[0] a") }}
        </template>
        <template #item.drop_shipping_score="{ item }">
          {{ item.drop_shipping_score ?? "—" }}
        </template>
        <template #item.access="{ item }">
          <span
            class="sd-modern-status sd-modern-status--plain b-product-add-wholesalers__access"
          >
            <span
              class="sd-modern-status__dot"
              :class="statusDot(item)"
              aria-hidden="true"
            />
            {{ accessLabel(item) }}
          </span>
          <v-tooltip
            v-if="item.dropship_access?.status === 'REJECT'"
            content-class="sd-modern-tooltip"
            location="top"
            open-on-click
            :persistent="false"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                type="button"
                class="sd-modern-info-button"
                :aria-label="$t(copy + 'rejected_help')"
                @click.stop
              >
                <v-icon size="14" aria-hidden="true">info_outline</v-icon>
              </button>
            </template>
            {{ $t(copy + "rejected_help") }}
          </v-tooltip>
        </template>
        <template #item.actions="{ item }">
          <div class="b-product-add-wholesalers__actions">
            <v-btn
              v-if="
                item.id !== shop.id &&
                (!item.dropship_access ||
                  item.dropship_access.status === 'REJECT')
              "
              :loading="busy_request === item"
              :disabled="!!busy_request && busy_request !== item"
              class="sd-modern-button sd-modern-button--compact"
              variant="outlined"
              @click.stop="requestAccount(item)"
              >{{ $t(copy + "request_access") }}</v-btn
            >
            <v-btn
              class="sd-modern-button sd-modern-button--compact sd-modern-button--inline"
              color="primary"
              variant="text"
              @click.stop="$emit('select', item)"
            >
              {{ $t(copy + "view_products") }}
              <v-icon size="16" aria-hidden="true">{{
                $t("icons.chevron_next")
              }}</v-icon>
            </v-btn>
          </div>
        </template>
        <template #no-data>
          <div
            class="sd-modern-empty-state b-product-add-wholesalers__empty"
            :role="fetch_error ? 'status' : undefined"
          >
            <template v-if="busy_fetch">{{
              $t("global.commons.waiting_load_data")
            }}</template>
            <template v-else-if="fetch_error">
              <v-icon size="25" aria-hidden="true">cloud_off</v-icon>
              <h2>{{ $t(copy + "load_error") }}</h2>
              <v-btn
                class="sd-modern-button sd-modern-button--compact"
                variant="text"
                color="primary"
                @click="fetchDropShops"
                >{{ $t(copy + "retry") }}</v-btn
              >
            </template>
            <template v-else>
              <v-icon size="25" aria-hidden="true">storefront</v-icon>
              <h2>{{ $t(copy + "empty_title") }}</h2>
              <p>{{ $t(copy + "empty_body") }}</p>
              <v-btn
                class="sd-modern-button sd-modern-button--compact"
                variant="text"
                color="primary"
                @click="resetFilters"
                >{{ $t(copy + "clear_filters") }}</v-btn
              >
            </template>
          </div>
        </template>
        <template #bottom>
          <footer
            class="sd-modern-table-footer b-product-add-wholesalers__footer"
          >
            <span class="sd-modern-page-summary">{{
              $t(copy + "records", { count: totalItems })
            }}</span>
            <v-pagination
              :model-value="page"
              :length="pageCount"
              :total-visible="5"
              :disabled="busy_fetch || !totalItems"
              class="sd-modern-pagination"
              density="comfortable"
              variant="text"
              rounded="lg"
              @update:model-value="changePage"
            />
          </footer>
        </template>
      </v-data-table-server>
    </section>
  </div>
</template>

<script lang="ts">
import { SetupService } from "@selldone/core-js/server/SetupService";
import { throttle } from "lodash-es";
import SCountrySelect from "@selldone/components-vue/ui/country/select/SCountrySelect.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductAddDropshippingWorkflow from "./BProductAddDropshippingWorkflow.vue";

export default {
  name: "BProductAddDropshippingShops",
  components: { SCountrySelect, BProductAddDropshippingWorkflow },
  emits: ["select"],
  props: { shop: { required: true } },
  data: () => ({
    copy: "product_add_dropshipping_shops.modern.",
    drop_shops: [],
    busy_fetch: false,
    fetch_error: false,
    fetch_sequence: 0,
    disposed: false,
    country: null,
    search: null,
    show_all: false,
    show_workflow: true,
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    sortBy: [{ key: null, order: "desc" }],
    busy_request: null,
    searchThrottled: null,
  }),
  computed: {
    pageCount() {
      return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    },
    sortKey() {
      return this.sortBy[0]?.key || "created_at";
    },
    sortDirectionLabel() {
      return this.$t(
        this.copy +
          (this.sortBy[0]?.order === "asc"
            ? "sort_direction_asc"
            : "sort_direction_desc"),
      );
    },
    sortOptions() {
      return [
        { title: this.$t(this.copy + "latest_added"), value: "created_at" },
        { title: this.$t(this.copy + "wholesaler"), value: "title" },
        { title: this.$t("global.commons.countries"), value: "countries" },
        {
          title: this.$t("global.commons.products"),
          value: "drop_shipping_products",
        },
        {
          title: this.$t("global.commons.score"),
          value: "drop_shipping_score",
        },
      ];
    },
    headers() {
      return [
        {
          title: this.$t(this.copy + "wholesaler"),
          key: "title",
          width: "27%",
          cellProps: { class: "b-product-add-wholesalers__identity-cell" },
        },
        {
          title: this.$t("global.commons.countries"),
          key: "countries",
          width: "13%",
        },
        {
          title: this.$t("global.commons.products"),
          key: "drop_shipping_products",
          width: "10%",
        },
        {
          title: this.$t("global.commons.score"),
          key: "drop_shipping_score",
          width: "8%",
        },
        {
          title: this.$t(this.copy + "access"),
          key: "access",
          sortable: false,
          width: "18%",
        },
        {
          title: this.$t("global.commons.actions"),
          key: "actions",
          sortable: false,
          width: "24%",
          cellProps: { class: "b-product-add-wholesalers__actions-cell" },
        },
      ];
    },
  },
  watch: {
    "shop.id"() {
      this.searchThrottled?.cancel();
      this.country = this.defaultCountry();
      this.search = null;
      this.show_all = false;
      this.drop_shops = [];
      this.totalItems = 0;
      this.filterChanged();
    },
  },
  created() {
    this.searchThrottled = throttle(
      () => this.filterChanged(),
      window.SERACH_THROTTLE,
    );
    this.country = this.defaultCountry();
    this.fetchDropShops();
  },
  beforeUnmount() {
    this.disposed = true;
    this.fetch_sequence++;
    this.searchThrottled?.cancel();
  },
  methods: {
    defaultCountry() {
      return (
        this.shop.countries?.[0] || SetupService.LocalServiceCountry() || null
      );
    },
    filterChanged() {
      this.page = 1;
      return this.fetchDropShops();
    },
    changePage(page) {
      if (page === this.page || page < 1 || page > this.pageCount) return;
      this.page = page;
      return this.fetchDropShops();
    },
    changeSort(key) {
      return this.setSort([
        {
          key: key === "created_at" ? null : key,
          order: this.sortBy[0]?.order || "desc",
        },
      ]);
    },
    setSort(sort) {
      const value = sort.length ? sort : [{ key: null, order: "desc" }];
      if (
        value[0]?.key === this.sortBy[0]?.key &&
        value[0]?.order === this.sortBy[0]?.order
      )
        return;
      this.sortBy = value;
      return this.filterChanged();
    },
    toggleSortDirection() {
      return this.setSort([
        {
          key: this.sortBy[0]?.key,
          order: this.sortBy[0]?.order === "asc" ? "desc" : "asc",
        },
      ]);
    },
    resetFilters() {
      this.searchThrottled?.cancel();
      this.country = null;
      this.search = null;
      this.show_all = true;
      return this.filterChanged();
    },
    accessLabel(item) {
      if (item.id === this.shop.id) return this.$t(this.copy + "current_shop");
      return this.$t(
        this.copy +
          ({ ACCEPT: "accepted", PENDING: "pending", REJECT: "rejected" }[
            item.dropship_access?.status
          ] || "not_requested"),
      );
    },
    statusDot(item) {
      if (item.id === this.shop.id) return "";
      return (
        {
          ACCEPT: "sd-modern-status__dot--success",
          PENDING: "sd-modern-status__dot--warning",
          REJECT: "sd-modern-status__dot--error",
        }[item.dropship_access?.status] || ""
      );
    },
    fetchDropShops() {
      const sequence = ++this.fetch_sequence;
      const shopId = this.shop.id;
      this.busy_fetch = true;
      this.fetch_error = false;
      return axios
        .get(window.API.GET_DROP_SHIPPING_SHOPS(shopId), {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: this.sortBy[0]?.key,
            sortDesc: this.sortBy[0]?.order === "desc",
            search: this.search,
            country: this.country,
            show_all: this.show_all,
          },
        })
        .then(({ data }) => {
          if (
            this.disposed ||
            sequence !== this.fetch_sequence ||
            shopId !== this.shop.id
          )
            return;
          if (!data.error) {
            this.drop_shops = data.shops;
            this.totalItems = data.total;
          } else {
            this.fetch_error = true;
            this.drop_shops = [];
            this.totalItems = 0;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (
            this.disposed ||
            sequence !== this.fetch_sequence ||
            shopId !== this.shop.id
          )
            return;
          this.fetch_error = true;
          this.drop_shops = [];
          this.totalItems = 0;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (
            !this.disposed &&
            sequence === this.fetch_sequence &&
            shopId === this.shop.id
          )
            this.busy_fetch = false;
        });
    },
    requestAccount(drop_shop) {
      if (
        this.disposed ||
        this.busy_request ||
        drop_shop.id === this.shop.id ||
        ["ACCEPT", "PENDING"].includes(drop_shop.dropship_access?.status)
      )
        return;
      const shopId = this.shop.id;
      this.busy_request = drop_shop;
      return axios
        .post(window.API.POST_REQUEST_DROPSHIP_ACCESS(shopId), {
          shop_id: drop_shop.id,
        })
        .then(({ data }) => {
          if (this.disposed || shopId !== this.shop.id) return;
          if (!data.error) {
            drop_shop.dropship_access = data.request;
            NotificationService.showSuccessAlert(
              null,
              this.$t("dropshipping_products.notifications.request_access"),
            );
          } else NotificationService.showErrorAlert(null, data.error_msg);
        })
        .catch((error) => {
          if (!this.disposed && shopId === this.shop.id)
            NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (this.busy_request === drop_shop) this.busy_request = null;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.b-product-add-wholesalers {
  --sd-modern-icon-button-size: 32px;
  padding-block: 28px 34px;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0;
  &__workflow {
    margin-block-end: 20px;
  }
  &__heading {
    gap: 20px;
    align-items: flex-start;
    margin-block-end: 22px;
  }
  &__heading > div {
    flex: 1;
    min-width: 0;
  }
  &__heading .sd-modern-title-text {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    line-height: 26px;
  }
  &__heading .sd-modern-subtitle {
    margin: 7px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  &__list {
    padding: 0;
    border-radius: 16px;
  }
  &__toolbar {
    padding: 16px 20px;
    flex-wrap: wrap;
  }
  &__filter,
  &__toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    line-height: 20px;
  }
  &__toggle {
    min-height: 36px;
  }
  &__toggle input {
    width: 16px;
    height: 16px;
    accent-color: rgb(var(--v-theme-primary));
  }
  &__utilities {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    min-width: 0;
    margin-inline-start: auto;
  }
  &__country {
    width: 180px;
    flex: 0 1 180px;
    min-width: 140px;
  }
  &__search {
    width: 190px;
    flex: 1 1 190px;
    min-width: 140px;
  }
  &__sort {
    width: 132px;
    flex: 0 1 132px;
    min-width: 110px;
  }
  &__table {
    --sd-modern-table-font-size: 13px;
    --sd-modern-table-line-height: 20px;
    :deep(> .v-table__wrapper) {
      overflow: visible;
    }
    :deep(> .v-table__wrapper > table) {
      table-layout: fixed;
      > thead > tr > th,
      > tbody > tr > td {
        padding: 17px 10px !important;
      }
      > thead > tr > th:first-child,
      > tbody > tr > td:first-child {
        padding-inline-start: 20px !important;
      }
      > thead > tr > th:last-child,
      > tbody > tr > td:last-child {
        padding-inline-end: 20px !important;
      }
    }
  }
  &__identity {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }
  &__avatar {
    flex: none;
    overflow: visible;
  }
  &__identity-copy {
    min-width: 0;
  }
  &__name,
  &__handle {
    display: block;
    padding: 0;
    border: 0;
    background: transparent;
    text-align: start;
    overflow-wrap: anywhere;
  }
  &__name {
    color: inherit;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
  &__handle {
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
  }
  &__countries {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  &__country-help {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    min-height: 24px;
    border: 0;
    background: transparent;
    color: var(--sd-modern-muted);
    font: inherit;
  }
  &__access {
    font-size: 12px;
    line-height: 19px;
    white-space: normal;
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__actions .sd-modern-button {
    max-width: 100%;
    white-space: normal;
    height: auto;
    min-height: 32px;
  }
  &__actions :deep(.v-btn__content) {
    white-space: normal;
  }
  &__empty {
    padding: 42px 20px;
    font-size: 13px;
  }
  &__empty h2 {
    margin: 12px 0 7px;
    font-size: 14px;
    line-height: 21px;
    font-weight: 500;
  }
  &__empty p {
    max-width: 410px;
    margin: 0 auto 8px;
    font-size: 13px;
    line-height: 21px;
  }
  &__footer {
    padding: 14px 20px;
    gap: 12px;
  }
  @media (max-width: 960px) {
    &__utilities {
      flex: 1 1 100%;
      margin: 0;
    }
    &__country {
      flex-grow: 1;
    }
    &__search {
      flex-grow: 1;
    }
  }
  @media (max-width: 799px) {
    &__table :deep(> .v-table__wrapper > table) {
      display: block;
      > tbody {
        display: block;
        width: 100%;
      }
      > tbody > .v-data-table__tr--mobile {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px 18px;
        padding: 18px 16px;
        border-block-end: 1px solid var(--sd-modern-border);
        > td {
          display: block;
          width: auto !important;
          min-height: 0;
          padding: 0 !important;
          border: 0;
          text-align: start;
        }
        > td:first-child,
        > td:last-child {
          padding: 0 !important;
        }
        > .b-product-add-wholesalers__identity-cell,
        > .b-product-add-wholesalers__actions-cell {
          grid-column: 1 / -1;
        }
        > .b-product-add-wholesalers__identity-cell .v-data-table__td-title,
        > .b-product-add-wholesalers__actions-cell .v-data-table__td-title {
          display: none;
        }
        .v-data-table__td-title {
          display: block;
          margin-block-end: 5px;
        }
        .v-data-table__td-value {
          display: block;
          width: 100%;
          text-align: start;
        }
      }
      > tbody > tr:not(.v-data-table__tr--mobile) {
        display: block;
        > td {
          display: block;
          width: 100%;
        }
      }
    }
    &__actions {
      justify-content: flex-start;
    }
    &__country-help {
      min-width: 44px;
      min-height: 44px;
    }
    &__toggle {
      min-height: 44px;
    }
  }
  @media (max-width: 620px) {
    width: 100%;
    padding-block: 22px;
    &__heading {
      flex-direction: column;
      gap: 8px;
    }
    &__toolbar {
      padding: 14px 16px;
    }
    &__utilities {
      width: 100%;
    }
    &__country,
    &__search {
      flex: 1 1 100%;
      width: 100%;
    }
    &__sort {
      flex: 1;
      width: auto;
    }
    &__footer {
      padding-inline: 16px;
    }
  }
}
</style>

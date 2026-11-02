<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-container v-if="shop" fluid class="b-app-store sd-modern-canvas pa-0 text-start">
    <header class="b-app-store__header">
      <div class="sd-modern-content b-app-store__header-content">
        <div class="b-app-store__title">
          <img src="@selldone/components-vue/assets/icons/selldone-appstore.svg" width="23" height="27" alt="" />
          <h1>{{ $t('app_store_catalog.title') }}</h1>
        </div>
        <div class="b-app-store__header-actions">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                class="sd-modern-icon-button b-app-store__more"
                icon
                v-bind="props"
                variant="text"
                :aria-label="$t('app_store_catalog.more_actions')"
              >
                <v-icon size="17">more_horiz</v-icon>
                <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
                  {{ $t('app_store_catalog.more_actions') }}
                </v-tooltip>
              </v-btn>
            </template>
            <v-list class="text-start">
              <v-list-item
                prepend-icon="key"
                @click="show_add_enterprise = true"
              >
                <v-list-item-title>{{ $t('app_store_catalog.add_enterprise') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" @click="$emit('close')">
            <v-icon size="17">close</v-icon>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
              {{ $t('global.actions.close') }}
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </header>

    <div class="sd-modern-content b-app-store__content">
      <div class="b-app-store__toolbar">
        <p>{{ $t('app_store_catalog.subtitle') }}</p>
        <v-select v-model="selected_category" :items="categories" :label="$t('app_store_catalog.all_categories')"
                  :placeholder="$t('app_store_catalog.all_categories')" :aria-label="$t('global.commons.category')"
                  class="b-app-store__category" item-value="code" bg-color="transparent"
                  clearable hide-details single-line variant="plain">
          <template #item="{ item, props }">
            <v-list-item v-bind="props" :prepend-icon="item.raw.icon" :title="$t(item.raw.name)" class="text-start" />
          </template>
          <template #selection="{ item }"><span>{{ $t(item.raw.name) }}</span></template>
        </v-select>
      </div>

      <div class="b-app-store__catalog s-table-loading" :aria-busy="busy">
      <div v-if="list_error && !busy" class="b-app-store__error" role="alert">
        <p>{{ $t('app_store_catalog.load_error') }}</p>
        <v-btn class="sd-modern-button" variant="outlined" @click="fetchAppsList(page, options.sortBy?.[0]?.key, options.sortBy?.[0]?.order === 'desc')">
          <v-icon start size="16">refresh</v-icon>{{ $t('app_store_catalog.retry') }}
        </v-btn>
      </div>

      <b-list-loading-state v-if="busy && apps?.length" kind="app" compact class="sd-modern-list-refresh" />

      <v-data-iterator
        v-model:options="options"
        v-model:page="page"
        :items="apps"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :loading="busy && !apps?.length"
        :aria-busy="busy"
        :search="search"
        v-show="!list_error"
        class="b-app-store__iterator"
        hide-default-footer
      >
        <template #no-data><b-list-empty-state v-if="emptyStateLoaded && !busy" kind="app"
          :title="$t('dashboard_empty_state.no_results.title')"
          :description="$t('dashboard_empty_state.no_results.description')" /></template>
        <template #loader>
          <b-list-loading-state kind="app" />
        </template>

        <template v-slot:header></template>

        <template v-slot:default="props">
          <div class="b-app-store__grid" :inert="busy ? true : undefined">
            <b-app-shop-store-icon
              v-for="app in props.items"
              :key="app.raw.id"
              :app="app.raw"
              :loading="busy_fetch_id === app.raw.id"
              :disabled="busy"
              @select="editPluginDialog"
            />
          </div>
        </template>

        <template v-slot:footer>
          <div v-if="emptyStateLoaded || apps.length" class="sd-modern-table-footer b-app-store__footer">
            <span>{{ $t('app_store_catalog.range', { start: rangeStart, end: rangeEnd, total: totalItems }) }}</span>
            <v-pagination v-model="page" :length="Math.max(1, pageCount)" :total-visible="5"
                          :disabled="busy" class="sd-modern-pagination" />
          </div>
        </template>
      </v-data-iterator>
      </div>
    </div>

    <!-- ------------------- Edit Plugin Dialog ------------------- -->

    <b-app-config-dialog
      v-if="app && shop"
      v-model="dialog_app_edit"
      v-model:shop-app="shop_app"
      :app="app"
      :shop="shop"
      @after-leave="restoreDetailFocus"
    />

    <!-- ------------------- Add Enterprise App Dialog ------------------- -->
    <v-dialog v-model="show_add_enterprise" max-width="460" :persistent="busy_add_credential"
              :aria-label="$t('app_store_catalog.add_enterprise')" @after-leave="restoreMenuFocus">
      <v-card class="sd-modern-widget b-app-store__enterprise text-start">
        <form @submit.prevent="addCredential">
          <h2>{{ $t('app_store_catalog.add_enterprise') }}</h2>
          <p>{{ $t('app_store_catalog.enterprise_help') }}</p>
          <v-text-field v-model="credential" :label="$t('app_store_catalog.credential')"
                        :disabled="busy_add_credential" class="sd-modern-underlined-field b-app-store__credential"
                        type="password" autocomplete="off" variant="underlined" required hide-details="auto" />
          <div class="sd-modern-actions b-app-store__enterprise-actions">
            <v-btn class="sd-modern-button" variant="text" :disabled="busy_add_credential" @click="show_add_enterprise = false">
              {{ $t('global.actions.cancel') }}
            </v-btn>
            <v-btn class="sd-modern-button sd-modern-button--primary" type="submit" color="primary" variant="flat"
                   :disabled="!credential?.trim() || busy_add_credential" :loading="busy_add_credential">
              <v-icon start size="16">add</v-icon>{{ $t('app_store_catalog.add_app') }}
            </v-btn>
          </div>
        </form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import BListEmptyState from "@selldone/components-vue/backoffice/empty-state/BListEmptyState.vue";
import BListLoadingState from "@selldone/components-vue/backoffice/loading-state/BListLoadingState.vue";
import BAppConfigDialog from "../../config/dialog/BAppConfigDialog.vue";
import BAppShopStoreIcon from "../../../app/shop/store/icon/BAppShopStoreIcon.vue";
import { Application } from "@selldone/core-js";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAppShopStore",
  emits: ["select", "close"],
  components: {
    BListLoadingState,
    BListEmptyState, BAppShopStoreIcon, BAppConfigDialog },
  props: {
    shop: {
      type: Object,
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  data: () => ({
    busy: false,
    emptyStateLoaded: false,
    list_error: false,
    list_request_id: 0,
    list_key: null,
    loaded_offset: 0,
    detail_request_id: 0,
    detail_focus_target: null,
    credential_request_id: 0,
    selected_category: undefined, // Prevent double call fetch!

    //--------------------
    apps: [],
    search: "",

    // Pagination:
    page: 1,
    totalItems: 0,
    options: { page: 1, sortBy: [] },

    //--------------
    dialog_app_edit: false,
    app: null,
    shop_app: null,

    busy_fetch_id: null,

    //----- Enterprise apps -----
    show_add_enterprise: false,
    credential: "",
    busy_add_credential: false,
  }),
  computed: {
    itemsPerPage() {
      const width = this.$vuetify.display.width;
      return (width <= 360 ? 1 : width <= 640 ? 2 : 3) * 6;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    rangeStart() {
      return this.apps.length ? this.loaded_offset + 1 : 0;
    },
    rangeEnd() {
      return Math.min(this.loaded_offset + this.apps.length, this.totalItems);
    },
    categories() {
      return Object.values(Application.ApplicationCategories);
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page } = this.options;
        this.fetchAppsList(page, sortBy?.[0]?.key, sortBy?.[0]?.order === "desc");
      },
      deep: true,
    },

    selected_category(category) {
      this.page = 1;
      this.apps = [];
      this.$emit("select", category);
      const { sortBy } = this.options;
      this.fetchAppsList(
        this.page,
        sortBy?.[0]?.key,
        sortBy?.[0]?.order === "desc",
      );
    },
    show_add_enterprise(open) {
      if (!open) this.credential = "";
    },
    active(visible) {
      if (!visible) this.closeDialogs();
      else if (!this.emptyStateLoaded && !this.busy)
        this.fetchAppsList(this.page, this.options.sortBy?.[0]?.key, this.options.sortBy?.[0]?.order === "desc");
    },
    "shop.id"() {
      this.list_request_id++;
      this.list_key = null;
      this.busy = false;
      this.apps = [];
      this.totalItems = 0;
      this.loaded_offset = 0;
      this.emptyStateLoaded = false;
      this.list_error = false;
      this.page = 1;
      this.closeDialogs();
      this.fetchAppsList(1, this.options.sortBy?.[0]?.key, this.options.sortBy?.[0]?.order === "desc");
    },
  },

  created() {
    this.selected_category = this.$route.query.category;
  },
  beforeUnmount() {
    this.list_request_id++;
    this.closeDialogs();
  },

  methods: {
    restoreMenuFocus() {
      if (this.active) this.$el?.querySelector?.('.b-app-store__more')?.focus({ preventScroll: true });
    },
    restoreDetailFocus() {
      if (!this.active) return;
      if (this.detail_focus_target?.isConnected && this.detail_focus_target.getClientRects().length)
        this.detail_focus_target.focus({ preventScroll: true });
      else this.restoreMenuFocus();
    },
    closeDialogs() {
      // A hidden or replaced store must not open a dialog from an older response.
      this.detail_request_id++;
      this.credential_request_id++;
      this.busy_fetch_id = null;
      this.detail_focus_target = null;
      this.busy_add_credential = false;
      this.dialog_app_edit = false;
      this.app = null;
      this.shop_app = null;
      this.show_add_enterprise = false;
      this.credential = "";
    },
    addCredential() {
      if (!this.active || !this.shop?.id || !this.credential?.trim() || this.busy_add_credential) return;
      const request = ++this.credential_request_id;
      this.busy_add_credential = true;

      axios
        .post(window.API.POST_ADD_ENTERPRISE_APP(this.shop.id), {
          credential: this.credential,
        })
        .then(({ data }) => {
          if (request !== this.credential_request_id) return;
          if (!data.error) {
            this.show_add_enterprise = false;
            this.credential = "";
            this.list_request_id++;
            this.busy = false;
            this.selected_category = undefined;
            this.page = 1;
            this.apps = [];
            this.totalItems = 0;
            this.loaded_offset = 0;
            this.emptyStateLoaded = false;
            // The assignment response has no category or catalog total; reload the authorized list.
            this.fetchAppsList(1, this.options.sortBy?.[0]?.key, this.options.sortBy?.[0]?.order === "desc");

            NotificationService.showSuccessAlert(
              null,
              this.$t('app_store_catalog.enterprise_added'),
            );
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (request !== this.credential_request_id) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request !== this.credential_request_id) return;
          this.busy_add_credential = false;
        });
    },

    fetchAppsList(page, sortBy, sortDesc = true) {
      if (!this.active || !this.shop?.id) return;
      const key = JSON.stringify([this.shop.id, page, this.itemsPerPage, sortBy, sortDesc, this.search, this.selected_category]);
      if (this.busy && key === this.list_key) return;
      this.list_key = key;
      const request = ++this.list_request_id;
      const offset = (page - 1) * this.itemsPerPage;

      this.busy = true;
      this.emptyStateLoaded = false;
      this.list_error = false;
      axios
        .get(window.API.GET_APPSTORE_LIST(this.shop.id), {
          params: {
            offset,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,
            search: this.search,

            categories: this.selected_category
              ? [this.selected_category]
              : null,
          },
        })
        .then(({ data }) => {
          if (request !== this.list_request_id) return;
          if (data.error || !Array.isArray(data.apps)) {
            this.list_error = true;
            NotificationService.showErrorAlert(null, data.error_msg || this.$t('app_store_catalog.load_error'));
            return;
          }
          this.apps = data.apps;
          this.emptyStateLoaded = Array.isArray(data.apps);

          this.totalItems = data.total;
          this.loaded_offset = offset;
        })
        .catch((error) => {
          if (request !== this.list_request_id) return;
          this.list_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request !== this.list_request_id) return;
          this.busy = false;
        });
    },

    editPluginDialog(app) {
      if (!this.active || !this.shop?.id || this.busy) return;
      this.detail_focus_target = typeof document === 'undefined' ? null : document.activeElement?.closest?.('.b-app-store-card');
      const request = ++this.detail_request_id;
      this.app = null;
      this.busy_fetch_id = app.id;
      axios
        .get(window.API.GET_SHOP_APP_INFO(this.shop.id, app.code))
        .then(({ data }) => {
          if (request !== this.detail_request_id) return;
          if (!data.error) {
            this.app = data.app;
            this.shop_app = data.shop_app;
            this.dialog_app_edit = true;
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (request !== this.detail_request_id) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request !== this.detail_request_id) return;
          this.busy_fetch_id = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-app-store {
  min-height: 100%;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  line-height: 21px;

  &__header { position: sticky; top: 0; z-index: 2; padding-block: 22px; background: rgb(var(--v-theme-surface)); border-block-end: 1px solid var(--sd-modern-border); }
  &__header-content { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-inline: 22px; }
  &__title { display: flex; align-items: center; gap: 10px; min-width: 0; }
  &__title img { flex: 0 0 23px; object-fit: contain; }
  &__title h1 { margin: 0; font-size: 24px; font-weight: 500; line-height: 30px; letter-spacing: -.4px; }
  &__header-actions { display: flex; align-items: center; gap: 8px; }
  &__content { padding: 22px; }
  &__toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-block-end: 20px; }
  &__toolbar > p { flex: 1 1 240px; margin: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  &__category { flex: 0 1 240px; min-width: 0; font-size: 13px; }
  &__catalog { position: relative; min-height: 220px; }
  &__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  &__error { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-block-end: 18px; }
  &__error p { margin: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  &__footer { margin-block-start: 22px; padding-block: 16px; font-size: 12px; line-height: 18px; }
  &__enterprise { padding: 24px; }
  &__enterprise h2 { margin: 0 0 8px; font-size: 20px; font-weight: 500; line-height: 27px; }
  &__enterprise p { margin: 0; color: var(--sd-modern-muted); font-size: 13px; line-height: 21px; }
  &__credential { margin-block: 24px; }
  &__enterprise-actions { justify-content: flex-end; gap: 10px; }

  @media (max-width: 640px) {
    &__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    &__category { flex: 1 1 220px; }
  }
  @media (max-width: 420px) {
    &__header { padding-block: 18px; }
    &__header-content { padding-inline: 14px; }
    &__content { padding: 18px 14px; }
    &__title h1 { font-size: 21px; line-height: 28px; }
  }
  @media (max-width: 360px) {
    &__grid { grid-template-columns: minmax(0, 1fr); }
  }
}
</style>

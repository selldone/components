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
  <v-container class="pa-0 pa-sm-3">
    <div class="widget-box -large mb-5 min-height-50vh">
      <u-widget-header :title="$t('admin_shop.apps.store.title')" icon="shop">
        <template v-slot:actions>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                class="mx-2"
                icon
                size="small"
                style="align-self: baseline"
                v-bind="props"
                variant="text"
              >
                <v-icon>more_vert</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                prepend-icon="add"
                @click="show_add_enterprise = true"
              >
                <v-list-item-title>Add enterprise app</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </u-widget-header>

      <v-list-subheader>
        {{ $t("admin_shop.apps.store.subtitle") }}
      </v-list-subheader>

      <v-row no-gutters>
        <v-spacer></v-spacer>

        <v-select
          v-model="selected_category"
          :items="categories"
          :label="$t('global.commons.category')"
          bg-color="transparent"
          class="max-width-field"
          clearable
          flat
          item-value="code"
          messages="Filter apps by category"
          variant="solo"
        >
          <template v-slot:item="{ item, props }">
            <v-list-item
              :prepend-icon="item.raw.icon"
              :title="$t(item.raw.name)"
              class="text-start"
              v-bind="props"
            >
            </v-list-item>
          </template>

          <template v-slot:selection="{ item }">
            <v-icon>{{ item.raw.icon }}</v-icon>
            <span class="mx-2">{{ $t(item.raw.name) }}</span>
          </template>
        </v-select>
      </v-row>

      <v-data-iterator
        v-model:options="options"
        v-model:page="page"
        :items="apps"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :loading="busy"
        :search="search"
        class="my-3"
        hide-default-footer
        no-data-text="Not found!"
      >
        <template v-slot:loading>
          <u-loading-ellipsis css-mode light></u-loading-ellipsis>
        </template>

        <template v-slot:header></template>

        <template v-slot:default="props">
          <v-row class="m-2" no-gutters>
            <b-app-shop-store-icon
              v-for="(app, index) in props.items"
              :key="app.id"
              :app="app.raw"
              :loading="busy_fetch_id === app.raw.id"
              :style="`animation-delay: ${130 * index}ms`"
              class="ma-2 zoomIn"
              @select="editPluginDialog"
            >
            </b-app-shop-store-icon>
          </v-row>
        </template>

        <template v-slot:footer>
          <v-pagination v-model="page" :length="pageCount" rounded />
        </template>
      </v-data-iterator>
    </div>

    <!-- ------------------- Edit Plugin Dialog ------------------- -->

    <b-app-config-dialog
      v-if="app"
      v-model="dialog_app_edit"
      v-model:shop-app="shop_app"
      :app="app"
      :shop="shop"
    />

    <!-- ------------------- Add Enterprise App Dialog ------------------- -->
    <v-dialog v-model="show_add_enterprise" max-width="620">
      <v-card class="text-start">
        <v-card-title>Add Enterprise App</v-card-title>
        <v-card-text>
          <p>
            To install a private enterprise app on the store, you must have a
            credential key, which can be obtained from the developer.
          </p>
          <v-text-field
            v-model="credential"
            class="max-width-field-large mx-auto my-3"
            label="App Credential"
            messages="Enter app credential"
            variant="outlined"
          >
          </v-text-field>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              :class="{ disabled: !credential }"
              :loading="busy_add_credential"
              color="primary"
              size="x-large"
              variant="flat"
              @click="addCredential()"
            >
              <v-icon size="small">add</v-icon>
              Add Credential
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import BAppConfigDialog from "../../config/dialog/BAppConfigDialog.vue";
import BAppShopStoreIcon from "../../../app/shop/store/icon/BAppShopStoreIcon.vue";
import { Application } from "@selldone/core-js";

export default {
  name: "BAppShopStore",
  components: { BAppShopStoreIcon, BAppConfigDialog },
  props: {
    shop: {
      type: Object,
      require: true,
    },
  },
  data: () => ({
    busy: false,
    selected_category: undefined, // Prevent double call fetch!

    //--------------------
    apps: [],
    search: "",
    filter: {},

    // Pagination:
    page: 1,
    itemsPerPage: 18,
    totalItems: 0,
    options: {},

    keys: [
      { label: "code", value: "code" },
      { label: "name", value: "name" },
      /*  {label: 'global.sort.title', value: 'title'},
              {label: 'global.sort.like', value: 'like'},
              {label: 'global.sort.power', value: 'power'},*/
    ],
    //------------------
    offset: 0,
    more: true,

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
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    categories() {
      return Object.values(Application.ApplicationCategories);
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchAppsList(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    selected_category(category, category1) {
      this.page = 1;
      this.apps = [];
      this.$emit("select", category);
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchAppsList(
        this.page,
        sortBy[0]?.key,
        sortBy[0]?.order === "desc",
      );
    },
  },

  created() {
    this.selected_category = this.$route.query.category;
  },

  methods: {
    addCredential() {
      this.busy_add_credential = true;

      axios
        .post(window.API.POST_ADD_ENTERPRISE_APP(this.$route.params.shop_id), {
          credential: this.credential,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.show_add_enterprise = false;
            this.credential = null;
            this.AddOrUpdateItemByID(this.apps, data.app, "id", false);

            this.showSuccessAlert(
              "Add credential",
              "Your enterprise app credential added successfully.",
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_credential = false;
        });
    },

    fetchAppsList(page, sortBy, sortDesc = true) {
      if (this.busy) return;

      this.busy = true;
      axios
        .get(window.API.GET_APPSTORE_LIST(this.$route.params.shop_id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
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
          this.apps = data.apps;

          this.totalItems = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },

    editPluginDialog(app) {
      this.app = null;
      this.busy_fetch_id = app.id;
      axios
        .get(window.API.GET_SHOP_APP_INFO(this.$route.params.shop_id, app.code))
        .then(({ data }) => {
          if (!data.error) {
            this.app = data.app;
            this.shop_app = data.shop_app;
            this.dialog_app_edit = true;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch_id = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.scrolling-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  padding-top: 8px;
  padding-bottom: 16px;

  &::-webkit-scrollbar {
    display: none;
  }

  -webkit-overflow-scrolling: touch;

  .item {
    user-select: none;
    padding: 8px;
    display: inline-block;
    border-radius: 12px;

    background-color: #fff;
    margin: 14px 4px;
    cursor: pointer;

    transition: all 0.25s;
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);

    &:hover {
      z-index: 2;
      box-shadow: 0px 5px 25px 0px rgba(0, 0, 0, 0.2);
      transition: all 0.5s;
    }

    min-width: 128px;

    p {
      font-weight: 500;
      margin-top: 8px;
    }

    .icon {
      margin: auto;
    }

    .gray {
      -webkit-filter: grayscale(1);
      filter: grayscale(1);
    }
  }

  .item-space {
    display: inline-block;

    vertical-align: unset !important;
    margin: auto 16px;
    height: 84px;
  }
}
</style>

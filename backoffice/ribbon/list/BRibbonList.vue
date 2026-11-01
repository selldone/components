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
  <div class="widget-box -large s-table-loading" v-bind="$attrs">
    <u-widget-header
      :src="require('@selldone/core-js/assets/product-types/subscription.svg')"
      title="Ribbon Subscriptions"
    >
    </u-widget-header>

    <v-list-subheader
      >Here, you will find a collection of subscription products and their
      corresponding plans. Each subscription product can be associated with one
      or more subscription panels.
    </v-list-subheader>

    <b-list-loading-state v-if="busy_fetch && ribbons?.length" kind="product" compact class="sd-modern-list-refresh" />

    <v-row no-gutters>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        :placeholder="$t('global.commons.search')"
        class="max-width-field"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>

    <v-data-table-server
      :aria-busy="busy_fetch"
      :loading="busy_fetch"
      v-model:expanded="expanded"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="ribbons"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading-text="$t('admin_shop.blogs.list.waiting_message')"
      :mobile="$vuetify.display.xs"
      class="bg-transparent min-height-60vh"
      expand-on-click
      hide-default-footer
      hover
      item-key="id"
      show-expand
      @click:row="(_, r) => expanded.toggle(r.item)"
    >
      <template v-if="!ribbons?.length" #loading>
        <b-list-loading-state kind="product" />
      </template>

      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

<template v-slot:no-data><b-list-empty-state v-if="emptyStateLoaded && !busy_fetch" kind="product" :title="(totalItems) > 0 ? $t('dashboard_empty_state.empty_page.title') : ($t(search ? 'dashboard_empty_state.no_results.title' : 'dashboard_empty_state.context.ribbon.title'))" :description="(totalItems) > 0 ? $t('dashboard_empty_state.empty_page.description') : ($t(search ? 'dashboard_empty_state.no_results.description' : 'dashboard_empty_state.context.ribbon.description'))" /></template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ expanded-item ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:expanded-row="{ item /*,isMobile*/ }">
        <td :colspan="headers.length + 1 /*Expand column*/">
          <div v-if="item.subscription_prices?.length">
            <v-list
              bg-color="#fff"
              class="border-between-vertical my-3"
              density="compact"
              rounded="xl"
            >
              <v-list-item v-for="sp in item.subscription_prices" :key="sp.id">
                <v-list-item-title
                  ><b>{{ sp.title }}</b></v-list-item-title
                >
                <v-list-item-subtitle class="mt-1"
                  >{{ sp.description }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-list-item-action class="min-width-100 px-1">
                    <u-price
                      :amount="sp.price"
                      :currency="sp.currency"
                    ></u-price>
                    <small class="ms-1"
                      >/ {{ $t(BillingPeriod[sp.period]?.title) }}</small
                    >
                  </v-list-item-action>
                  <v-list-item-action>
                    <v-btn
                      class="ms-2 tnt"
                      color="primary"
                      min-width="48"
                      title="View and sync subscribes list."
                      @click="showSubscribers(item, sp)"
                    >
                      <v-icon start>groups</v-icon>
                      Subscribers
                    </v-btn>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </v-list>
          </div>
          <div v-else class="pa-3 text-center text-muted">
            No pricing plan defined for {{ item.title }}.
          </div>

          <div class="py-1">
            Go to the
            <router-link
              :to="{
                name: 'BPageProductInventory',
                params: { product_id: item.id },
              }"
              class="font-weight-bold"
              target="_blank"
            >
              {{ item.title }}
            </router-link>
            plans management.
          </div>
        </td>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ title ▁▁▁▁▁▁▁▁▁▁▁ -->
      <template v-slot:item.title="{ item }">
        <div class="py-1 d-flex align-center">
          <u-avatar-folder
            :side-image="ProductType.SUBSCRIPTION.image"
            :size="62"
            :src="getShopImagePath(item.icon, 128)"
            class="me-2"
            is-gray
            placeholder-icon="fastfood"
            elevated
          >
          </u-avatar-folder>
          <div class="flex-grow-1">
            <b class="d-block"
              >{{ item.title }}
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

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ plans ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.plans="{ item }">
        <v-chip
          :color="item.subscription_prices.length ? '#000' : '#999'"
          class="h-auto py-1 min-width-75"
          density="comfortable"
          label
          variant="flat"
        >
          <div class="text-start">
            <b> {{ numeralFormat(item.subscription_prices.length, "0,0") }}🞬</b>
            <div class="x-small">Plans</div>
          </div>
        </v-chip>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ edit ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.edit="{ item }">
        <div class="py-1">
          <u-smart-menu
            :items="[
              {
                title: 'Edit product',
                icon: 'edit',
                to: {
                  name: 'BPageProductEdit',
                  params: { product_id: item.id },
                },
              },
              {
                title: 'Edit subscription plans',
                icon: 'subscriptions',
                to: {
                  name: 'BPageProductInventory',
                  params: { product_id: item.id },
                },
              },
            ]"
          ></u-smart-menu>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>

  <!-- ██████████████████████ Dialog > Subscribers ██████████████████████ -->

  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card
      v-if="selected_ribbon && selected_price && dialog_pre"
      class="text-start"
    >
      <v-card-title>
        <v-avatar class="me-2" rounded
          ><img :src="getShopImagePath(selected_ribbon.icon, 128)"
        /></v-avatar>
        {{ selected_ribbon.title }} / {{ selected_price.title }}
      </v-card-title>
      <v-card-text>
        <b-process-center-list
          :filter-subscription-price-id="selected_price.id"
          :shop="shop"
          :type="ProductType.SUBSCRIPTION"
        >
        </b-process-center-list>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import BListEmptyState from "@selldone/components-vue/backoffice/empty-state/BListEmptyState.vue";
import BListLoadingState from "@selldone/components-vue/backoffice/loading-state/BListLoadingState.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import USmartMenu from "../../../ui/smart/menu/USmartMenu.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import BProcessCenterList from "../../process-center/list/BProcessCenterList.vue";
import { throttle } from "lodash-es";
import UAvatarFolder from "../../../ui/avatar/folder/UAvatarFolder.vue";

export default {
  name: "BRibbonList",
  components: {
    BListLoadingState,
    BListEmptyState, UAvatarFolder, BProcessCenterList, USmartMenu },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    BillingPeriod: BillingPeriod,

    ProductType: ProductType,
    busy_fetch: false,
    emptyStateLoaded: false,
    emptyStateRequest: 0,

    ribbons: [],

    search: "",

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],

    expanded: [],
    //----------------------
    dialog: false,
    dialog_pre: false,

    selected_ribbon: null,
    selected_price: null,
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    headers() {
      return [
        {
          title: "Product",
          align: "start",
          sortable: true,
          value: "title",
        },
        {
          title: "Plans",
          align: "center",
          sortable: false,
          value: "plans",
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
        this.fetchRibbons(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },
    search: throttle(function (newVal, oldVal) {
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchRibbons(this.page, sortBy[0]?.key, sortBy[0]?.order === "desc");
    }, window.SERACH_THROTTLE),
  },

  created() {},

  methods: {
    getConnectIcon(connect_id: string | number) {
      return window.CDN.GET_CONNECT_ICON(connect_id);
    },

    fetchRibbons(page, sortBy, sortDesc = true) {
      const emptyRequest = ++this.emptyStateRequest;
      this.busy_fetch = true;
      this.emptyStateLoaded = false;

      axios
        .get(window.API.GET_SHOP_RIBBONS(this.shop.id), {
          params: {
            search: this.search,

            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,
          },
        })
        .then(({ data }) => {
          if (emptyRequest !== this.emptyStateRequest) return;
          if (!data.error) {
            this.totalItems = data.total;
            this.ribbons = data.ribbons;
            this.emptyStateLoaded = Array.isArray(data.ribbons);
          }
        })
        .catch((error) => {
          if (emptyRequest !== this.emptyStateRequest) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (emptyRequest !== this.emptyStateRequest) return;
          this.busy_fetch = false;
        });
    },

    showSubscribers(product, subscription_price) {
      this.selected_ribbon = product;
      this.selected_price = subscription_price;

      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.dialog = true;
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>

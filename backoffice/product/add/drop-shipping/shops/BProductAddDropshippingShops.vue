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
  <div class="widget-box -large mb-5">
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-list-subheader>
      {{ $t("product_add_dropshipping_shops.subtitle") }}
    </v-list-subheader>

    <v-row align="center" no-gutters>
      <u-smart-toggle
        v-model="show_all"
        false-gray
        :false-description="
          $t('dropshipping_products.show_eligible_shops_message')
        "
        :true-description="$t('dropshipping_products.show_all_message')"
        :true-title="$t('dropshipping_products.show_all_shops')"
      >
      </u-smart-toggle>

      <v-spacer></v-spacer>

      <s-country-select
        v-model="country"
        :filter="shop.countries"
        class="max-width-field ma-1"
        placeholder="Select country..."
        prepend-inner-icon="travel_explore"
        flat
        hide-details
        clearable
        item-value="alpha2"
        variant="plain"
        @change="fetchDropShops"
      ></s-country-select>
      <v-text-field
        v-model="search"
        :label="$t('global.commons.search')"
        class="max-width-field ma-1"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>

    <v-data-table-server
      :mobile="$vuetify.display.xs"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="drop_shops"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading-text="$t('global.commons.waiting_load_data')"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="bg-transparent min-height-60vh"
      density="compact"
      hide-default-footer
      item-key="id"
      @click:row="(_, r) => $emit('select', r.item)"
    >
      <template v-slot:item.shop_id="{ item }">
        <v-avatar class="my-2 avatar-gradient -thin -wholesaler" size="42">
          <v-img
            v-if="item.icon"
            :src="getShopImagePath(item.icon, IMAGE_SIZE_SMALL)"
          />
          <v-icon v-else>storefront</v-icon>
        </v-avatar>
      </template>
      <template v-slot:item.title="{ item }">
        <div class="py-1">
          <div>
            <b>{{ item.title }}</b>

            <v-chip
              v-if="item.dropship_access?.status === 'ACCEPT'"
              class="ms-1"
              color="green"
              size="x-small"
              label
            >
              <v-icon start>check_circle</v-icon>
              {{ $t("dropshipping_products.request_accepted") }}
            </v-chip>
            <v-chip
              v-else-if="item.dropship_access?.status === 'REJECT'"
              class="ms-1"
              color="green"
              size="x-small"
              label
            >
              <v-icon start>cancel</v-icon>
              {{ $t("dropshipping_products.request_rejected") }}
            </v-chip>
          </div>
          <div class="small">@{{ item.name }}</div>
        </div>
      </template>

      <template v-slot:item.countries="{ item }">
        <flag
          v-for="cont in item.countries?.limit(7)"
          :key="cont"
          :iso="cont"
          :squared="false"
          class="mx-1"
        />

        <span v-if="item.countries?.length > 7" class="ms-2">
          {{ `${item.countries.length - 7} ${$t("global.commons.more")}` }}
          <v-icon class="mx-1">more_horiz</v-icon>
        </span>
      </template>

      <template v-slot:item.products="{ item }">
        {{ numeralFormat(item.products, "0.[0] a") }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-chip
          v-if="item.id === shop.id"
          prepend-icon="storefront"
          size="small"
        >
          {{ $t("dropshipping_products.current_shop") }}
        </v-chip>

        <v-btn
          v-else-if="!item.dropship_access"
          :loading="busy_request === item"
          color="primary"
          prepend-icon="add_comment"
          @click.stop="requestAccount(item)"
          >{{ $t("dropshipping_products.request_account") }}
        </v-btn>

        <v-btn
          v-else-if="item.dropship_access?.status === 'REJECT'"
          :loading="busy_request === item"
          class="ms-1"
          color="primary"
          icon
          @click.stop="requestAccount(item)"
          prepend-icon="refresh"
        >
          {{ $t("dropshipping_products.request_account") }}
        </v-btn>

        <v-chip
          v-else-if="item.dropship_access.status === 'PENDING'"
          prepend-icon="hourglass_empty"
          size="small"
        >
          {{ $t("dropshipping_products.request_pending") }}
        </v-chip>
      </template>

      <template v-slot:no-data>
        <div class="py-6 px-2 text-center text-muted">
          {{ $t("dropshipping_products.no_shops") }}
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import { SetupService } from "@selldone/core-js/server/SetupService";

import { throttle } from "lodash-es";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import SCountrySelect from "@selldone/components-vue/ui/country/select/SCountrySelect.vue";

export default {
  name: "BProductAddDropshippingShops",
  components: {
    USmartToggle,

    SCountrySelect,
  },
  emits: ["select"],
  props: {
    shop: {
      required: true,
    },
  },
  data: () => ({
    drop_shops: [],
    busy_fetch: false,

    //-----------------------------------------
    country: null,
    search: null,
    show_all: false,

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    sortBy: [{ key: null, order: "desc" }],

    //-----------------------------------------
    request_dialog: false,
    busy_request: null,
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    headers() {
      return [
        {
          title: "Shop",
          align: "start",
          sortable: false,
          value: "shop_id",
          width: "64px",
        },

        {
          title: this.$t("global.commons.title"),
          align: "start",
          value: "title",
          sortable: true,
        },

        {
          title: this.$t("global.commons.countries"),
          align: "start",
          value: "countries",
          sortable: true,
        },
        {
          title: this.$t("global.commons.products"),
          align: "start",
          value: "drop_shipping_products",
          sortable: true,
        },
        {
          title: this.$t("global.commons.score"),
          align: "center",
          value: "drop_shipping_score",
          sortable: true,
        },
        {
          title: this.$t("global.commons.actions"),
          align: "start",
          value: "actions",
          sortable: false,
        },
      ];
    },
  },
  watch: {
    search: throttle(function (newVal, oldVal) {
      this.fetchDropShops();
    }, window.SERACH_THROTTLE),

    sortBy() {
      this.fetchDropShops();
    },

    page() {
      this.fetchDropShops();
    },

    show_all() {
      this.fetchDropShops();
    },
  },

  created() {
    this.fetchDropShops();

    this.country =
      this.shop.countries && this.shop.countries.length
        ? this.shop.countries[0]
        : SetupService.LocalServiceCountry();
    if (!this.country) this.country = null; // Clear empty string!
  },

  methods: {
    fetchDropShops() {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_DROP_SHIPPING_SHOPS(this.shop.id), {
          params: {
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: this.sortBy[0]?.key,
            sortDesc: this.sortBy[0]?.order === "desc",

            search: this.search,

            country: this.country,
            show_all: this.show_all, // True: Show all store False: show permitted shops
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.drop_shops = data.shops;
            this.totalItems = data.total;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    requestAccount(drop_shop) {
      this.busy_request = drop_shop;
      axios
        .post(window.API.POST_REQUEST_DROPSHIP_ACCESS(this.shop.id), {
          shop_id: drop_shop.id,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.request_dialog = false;
            drop_shop.dropship_access = data.request;
            this.showSuccessAlert(
              null,
              this.$t("dropshipping_products.notifications.request_access"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .then(() => {
          this.busy_request = null;
        });
    },
  },
};
</script>

<style scoped></style>

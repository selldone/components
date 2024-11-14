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
  <!-- ██████████████████ Locations List ██████████████████ -->

  <div class="widget-box" v-bind="$attrs">
    <u-widget-header
      add-caption="Add location"
      icon="edit_location"
      title="List of location tags"
      @click:add="showAdd()"
      :disabled-access="!writeShopAccess(ShopPermissionRegions.CHANNELS.code)"
    ></u-widget-header>

    <v-list-subheader>
      You can pin products on the map location by assigning location tags to the
      products.
    </v-list-subheader>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-row no-gutters>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        :label="$t('global.commons.search')"
        class="max-width-field"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>
    <v-data-table-server
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="map_tags"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading-text="$t('admin_shop.blogs.list.waiting_message')"
      :mobile="$vuetify.display.xs"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="bg-transparent my-2 min-height-60vh"
      density="compact"
      hide-default-footer
      item-key="id"
      @click:row="(_, r) => showEdit(r.item)"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:no-data>
        <div v-if="!busy_fetch && !search" class="py-5 usn fadeIn">
          <img
            :src="require('../../../../assets/guides/map.png')"
            class="m-3 op-0-3"
            width="85%"
          />
          <h2 class="text-h4 font-weight-thin">
            List of location
            <v-icon>sync_alt</v-icon>
            tags relations...
          </h2>
        </div>
        <div v-else class="text-center px-3 py-5">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:header.lat>
        <v-icon class="me-1" size="small">location_searching</v-icon>
        Location
      </template>
      <template v-slot:header.user_id>
        <v-icon size="small">assignment_ind</v-icon>
      </template>

      <template v-slot:header.tags>
        <v-icon class="me-1" size="small">label_important</v-icon>
        Tags
      </template>

      <template v-slot:item.lat="{ item }">
        <div class="py-1">
          <b>
            <flag
              v-if="item.country"
              :iso="item.country"
              :squared="false"
              class="me-1"
            />
            {{ item.title }}</b
          >
          <small v-if="item.address" class="pt-1 d-block">
            {{ item.address.limitWords(6) }}
          </small>
        </div>
      </template>

      <template v-slot:item.user_id="{ item }">
        <v-avatar
          v-if="item.user_id"
          :title="`Last editor / ${getFromNowString(item.updated_at)}`"
          class="mx-1 avatar-gradient -thin -staff"
          size="24"
        >
          <img :src="getUserAvatar(item.user_id)" />
        </v-avatar>
      </template>

      <template v-slot:item.tags="{ item }">
        <div v-if="item.tags">
          <v-chip
            v-for="tag in item.tags.limit(3)"
            :key="tag"
            class="m-1"
            label
            size="x-small"
            >{{ tag }}
          </v-chip>
          <v-icon v-if="item.tags.length > 3" class="m-1">more_horiz</v-icon>
        </div>
      </template>

      <template v-slot:item.products_count="{ item }">
        <b>{{ item.products_count }}</b
        ><small>🞫</small>
      </template>

      <template v-slot:item.vendors_count="{ item }">
        <b>{{ item.vendors_count }}</b
        ><small>🞫</small>
      </template>

      <template v-slot:item.range="{ item }">
        <v-icon v-if="!item.range">all_inclusive</v-icon>
        <span v-else>{{ item.range }} km</span>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>

  <!-- ███████████████████████ Dialog > Add / Edit ███████████████████████ -->

  <b-map-tag-add
    v-model="dialog"
    :current-item="current_item"
    :shop="shop"
    @add="
      (map_tag) => {
        AddOrUpdateItemByID(map_tags, map_tag, 'id', false);
        ++this.totalItems;
      }
    "
    @delete="(id) => DeleteItemByID(map_tags, id)"
    @edit="(map_tag) => AddOrUpdateItemByID(map_tags, map_tag)"
  >
  </b-map-tag-add>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import { throttle } from "lodash-es";
import BMapTagAdd from "../../../map/tag/add/BMapTagAdd.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BMapTagsList",
  mixins: [DateMixin],

  components: {
    BMapTagAdd,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    // ―――――――― 🗘 Sync locations list ――――――――
    busy_fetch: false,

    map_tags: [],

    search: "",

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],

    //---------------------------------------
    dialog: false,

    current_item: {},

    //---------------------------------------
    accept_delete: false,
    busy_delete: false,

    //---------------------------------------
    show_products: false,
  }),
  computed: {
    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    headers() {
      return [
        {
          title: "Location",
          align: "start",
          sortable: true,
          value: "lat", // lng
        },

        {
          title: "Editor",
          align: "center",
          sortable: true,
          value: "user_id",
        },

        {
          title: "Tags",
          align: "start",
          sortable: true,
          value: "tags",
        },
        {
          title: "Products",
          align: "center",
          sortable: false,
          value: "products_count",
        },
        ...(this.IS_MARKETPLACE
          ? [
              {
                title: "Vendors",
                align: "center",
                sortable: false,
                value: "vendors_count",
              },
            ]
          : []),

        {
          title: "Range",
          align: "start",
          sortable: true,
          value: "range",
        },
      ];
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchLocations(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },
    search: throttle(function (newVal, oldVal) {
      this.options.page = 1;
      this.fetchLocations(
        this.page,
        this.sortBy[0]?.key,
        this.sortBy[0]?.order === "desc",
      );
    }, window.SERACH_THROTTLE),
  },

  created() {},

  methods: {
    fetchLocations(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(window.API.GET_SHOP_MAP_TAGS(this.shop.id), {
          params: {
            search: this.search,

            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.totalItems = data.total;
            this.map_tags = data.map_tags;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    showAdd() {
      this.current_item = {
        location: null,
      };
      this.dialog = true;
    },
    showEdit(item) {
      this.current_item = item;
      this.dialog = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>

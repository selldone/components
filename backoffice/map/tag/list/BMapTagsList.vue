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
  <section v-bind="$attrs" class="sd-modern-widget b-map-tags-list text-start">
    <header class="sd-modern-header b-map-tags-list__header">
      <div>
        <h2>{{ $t("map_channel.locations_title") }}</h2>
        <p class="sd-modern-subtitle">
          {{ $t("map_channel.locations_subtitle") }}
        </p>
      </div>
      <v-btn
        class="sd-modern-button sd-modern-button--primary"
        color="primary"
        variant="flat"
        :disabled="!writeShopAccess(ShopPermissionRegions.CHANNELS.code)"
        @click="showAdd"
      >
        <v-icon start size="18" aria-hidden="true">add</v-icon
        >{{ $t("map_channel.add_location") }}
      </v-btn>
    </header>
    <div class="sd-modern-list-toolbar b-map-tags-list__toolbar">
      <span class="sd-modern-list-header">{{
        $t("map_channel.locations_count", { count: $n(totalItems) })
      }}</span>
      <v-text-field
        v-model="search"
        :placeholder="$t('map_channel.search_locations')"
        :aria-label="$t('map_channel.search_locations')"
        class="b-map-tags-list__search"
        clearable
        hide-details
        single-line
        prepend-inner-icon="search"
        variant="plain"
      />
    </div>
    <v-data-table-server
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="busy_fetch || load_failed ? [] : map_tags"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :loading="busy_fetch"
      :loading-text="$t('map_channel.locations_loading')"
      :mobile="$vuetify.display.width < 720"
      :row-props="locationRowProps"
      class="sd-modern-data-table b-map-tags-list__table"
      density="compact"
      hide-default-footer
      item-value="id"
      @click:row="(_, row) => showEdit(row.item)"
    >
      <template #item.lat="{ item }">
        <div class="b-map-tags-list__identity">
          <button
            type="button"
            class="b-map-tags-list__name"
            v-tooltip="item.address ? addressTooltip(item.address) : undefined"
            @click.stop="showEdit(item)"
          >
            <flag
              v-if="item.country"
              :iso="item.country"
              :squared="false"
            /><span>{{ item.title }}</span>
          </button>
          <span v-if="item.address" class="b-map-tags-list__address">{{
            item.address
          }}</span>
        </div>
      </template>
      <template #item.tags="{ item }">
        <div v-if="item.tags?.length" class="b-map-tags-list__tags">
          <span
            v-for="tag in item.tags.slice(0, 3)"
            :key="tag"
            class="sd-modern-tag"
            >{{ tag }}</span
          >
          <button
            v-if="item.tags.length > 3"
            type="button"
            class="b-map-tags-list__more-tags"
            v-tooltip="addressTooltip(item.tags.join(', '))"
            :aria-label="item.tags.join(', ')"
            @click.stop
          >
            +{{ $n(item.tags.length - 3) }}
          </button>
        </div>
        <span v-else class="b-map-tags-list__muted">—</span>
      </template>
      <template #item.products_count="{ item }"
        ><span class="b-map-tags-list__number">{{
          $n(item.products_count || 0)
        }}</span></template
      >
      <template #item.vendors_count="{ item }"
        ><span class="b-map-tags-list__number">{{
          $n(item.vendors_count || 0)
        }}</span></template
      >
      <template #item.range="{ item }">
        <span v-if="item.range" class="b-map-tags-list__range">{{
          $t("map_channel.range_km", { count: $n(item.range) })
        }}</span>
        <span
          v-else
          class="b-map-tags-list__range"
          :aria-label="$t('map_channel.no_range_limit')"
          ><v-icon size="18" aria-hidden="true">all_inclusive</v-icon></span
        >
      </template>
      <template #item.user_id="{ item }">
        <div v-if="item.user_id" class="b-map-tags-list__editor">
          <v-avatar
            class="avatar-gradient -thin -staff hover-scale-small"
            size="24"
            v-tooltip="
              addressTooltip(
                $t('map_channel.last_editor_help', {
                  time: getFromNowString(item.updated_at),
                }),
              )
            "
            ><img
              :src="getUserAvatar(item.user_id)"
              :alt="$t('map_channel.last_editor')" /></v-avatar
          ><span>{{ getFromNowString(item.updated_at) }}</span>
        </div>
        <span v-else class="b-map-tags-list__muted">—</span>
      </template>
      <template #item.actions="{ item }">
        <div class="b-map-tags-list__actions">
          <v-btn
            class="sd-modern-icon-button"
            icon
            variant="text"
            :aria-label="
              $t('map_channel.edit_location_named', { name: item.title })
            "
            @click.stop="showEdit(item)"
            ><v-icon size="16" aria-hidden="true">edit</v-icon
            ><v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              open-on-focus
              >{{ $t("map_channel.edit_location") }}</v-tooltip
            ></v-btn
          >
        </div>
      </template>
      <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty and recovery states ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template #no-data>
        <div
          v-if="!busy_fetch"
          class="sd-modern-empty-state b-map-tags-list__empty"
          role="status"
        >
          <v-icon size="28" aria-hidden="true">{{
            load_failed
              ? "error_outline"
              : appliedSearch
                ? "search_off"
                : "add_location_alt"
          }}</v-icon>
          <h3>
            {{
              $t(
                load_failed
                  ? "map_channel.locations_error"
                  : appliedSearch
                    ? "map_channel.locations_search_empty"
                    : "map_channel.locations_empty_title",
              )
            }}
          </h3>
          <p>
            {{
              $t(
                load_failed
                  ? "map_channel.locations_error_message"
                  : appliedSearch
                    ? "map_channel.locations_search_empty_message"
                    : "map_channel.locations_empty_message",
              )
            }}
          </p>
          <v-btn
            v-if="load_failed"
            class="sd-modern-button"
            variant="outlined"
            @click="fetchLocations"
            ><v-icon start size="18" aria-hidden="true">refresh</v-icon
            >{{ $t("map_channel.retry") }}</v-btn
          >
          <v-btn
            v-else-if="appliedSearch"
            class="sd-modern-button"
            variant="text"
            color="primary"
            @click="clearSearch"
            >{{ $t("map_channel.clear_search") }}</v-btn
          >
          <v-btn
            v-else-if="writeShopAccess(ShopPermissionRegions.CHANNELS.code)"
            class="sd-modern-button sd-modern-button--primary"
            variant="flat"
            color="primary"
            @click="showAdd"
            ><v-icon start size="18" aria-hidden="true">add</v-icon
            >{{ $t("map_channel.add_location") }}</v-btn
          >
        </div>
      </template>
      <template #bottom>
        <footer class="sd-modern-table-footer b-map-tags-list__footer">
          <span role="status">{{
            $t("map_channel.locations_page_summary", {
              start: totalItems ? (page - 1) * itemsPerPage + 1 : 0,
              end: Math.min(page * itemsPerPage, totalItems),
              total: totalItems,
            })
          }}</span
          ><v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="$vuetify.display.width < 580 ? 1 : 3"
            class="sd-modern-pagination"
            density="compact"
          />
        </footer>
      </template>
    </v-data-table-server>
  </section>
  <!-- ███████████████████████ Dialog > Add / Edit ███████████████████████ -->
  <b-map-tag-add
    v-model="dialog"
    :current-item="current_item"
    :shop="shop"
    @add="onAdded"
    @edit="onEdited"
    @delete="onDeleted"
  />
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
  components: { BMapTagAdd },
  props: { shop: { required: true, type: Object } },
  data: () => ({
    // ―――――――― 🗘 Sync locations list ――――――――
    busy_fetch: false,
    load_failed: false,
    map_tags: [],
    search: "",
    appliedSearch: "",
    searchThrottled: null,
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    sortBy: [{ key: null, order: "desc" }],
    requestRevision: 0,
    scopeShopId: null,
    dialog: false,
    dialogShopId: null,
    current_item: {},
  }),
  computed: {
    ShopPermissionRegions() {
      return ShopPermissionRegions;
    },
    pageCount() {
      return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    },
    IS_MARKETPLACE() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },
    requestKey() {
      return JSON.stringify([
        this.shop.id,
        this.page,
        this.sortBy[0]?.key || null,
        this.sortBy[0]?.order || "desc",
        this.appliedSearch,
      ]);
    },
    headers() {
      return [
        {
          title: this.$t("map_channel.location"),
          align: "start",
          sortable: true,
          key: "lat",
          width: "31%",
        },
        {
          title: this.$t("map_channel.tags"),
          align: "start",
          sortable: true,
          key: "tags",
          width: "20%",
        },
        {
          title: this.$t("map_channel.products"),
          align: "end",
          sortable: false,
          key: "products_count",
          width: 84,
        },
        ...(this.IS_MARKETPLACE
          ? [
              {
                title: this.$t("map_channel.vendors"),
                align: "end",
                sortable: false,
                key: "vendors_count",
                width: 80,
              },
            ]
          : []),
        {
          title: this.$t("map_channel.range"),
          align: "start",
          sortable: true,
          key: "range",
          width: 85,
        },
        {
          title: this.$t("map_channel.last_editor"),
          align: "start",
          sortable: true,
          key: "user_id",
          width: 130,
        },
        { title: "", align: "end", sortable: false, key: "actions", width: 48 },
      ];
    },
  },
  watch: {
    requestKey: {
      immediate: true,
      handler() {
        if (this.scopeShopId !== this.shop.id) {
          this.searchThrottled?.cancel();
          this.requestRevision++;
          this.map_tags = [];
          this.totalItems = 0;
          this.search = "";
          this.appliedSearch = "";
          this.page = 1;
          this.dialog = false;
          this.dialogShopId = null;
          this.current_item = {};
          this.scopeShopId = this.shop.id;
        }
        this.fetchLocations();
      },
    },
    search() {
      this.requestRevision++;
      this.busy_fetch = true;
      this.searchThrottled?.();
    },
  },
  created() {
    this.searchThrottled = throttle(() => {
      const nextSearch = this.search || "";
      if (this.appliedSearch === nextSearch && this.page === 1)
        return this.fetchLocations();
      this.page = 1;
      this.appliedSearch = nextSearch;
    }, window.SERACH_THROTTLE);
  },
  beforeUnmount() {
    this.requestRevision++;
    this.searchThrottled?.cancel();
  },
  methods: {
    addressTooltip(text) {
      return {
        text,
        location: "top",
        contentClass: "sd-modern-tooltip text-start",
        openOnFocus: true,
        openOnClick: true,
      };
    },
    locationRowProps({ item }) {
      return {
        class: "sd-modern-clickable-item",
        tabindex: 0,
        onKeydown: (event) => {
          if (
            event.target !== event.currentTarget ||
            !["Enter", " "].includes(event.key)
          )
            return;
          event.preventDefault();
          this.showEdit(item);
        },
      };
    },
    clearSearch() {
      this.search = "";
    },
    async fetchLocations() {
      const shopId = this.shop.id;
      if (!shopId) return;
      const key = this.requestKey,
        revision = ++this.requestRevision;
      this.busy_fetch = true;
      this.load_failed = false;
      try {
        const { data } = await axios.get(window.API.GET_SHOP_MAP_TAGS(shopId), {
          params: {
            search: this.appliedSearch,
            offset: (this.page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: this.sortBy[0]?.key,
            sortDesc: this.sortBy[0]?.order === "desc",
          },
        });
        // A response must still belong to the displayed shop, query and page.
        if (
          revision !== this.requestRevision ||
          key !== this.requestKey ||
          String(shopId) !== String(this.shop.id)
        )
          return;
        if (
          data?.error ||
          !Array.isArray(data?.map_tags) ||
          data.total == null ||
          !Number.isFinite(Number(data.total))
        )
          throw new Error("Invalid locations response");
        this.totalItems = Math.max(0, Number(data.total));
        if (this.page > this.pageCount) {
          this.page = this.pageCount;
          return;
        }
        this.map_tags = data.map_tags;
      } catch (error) {
        if (
          revision !== this.requestRevision ||
          key !== this.requestKey ||
          String(shopId) !== String(this.shop.id)
        )
          return;
        this.load_failed = true;
        NotificationService.showLaravelError(error);
      } finally {
        if (revision === this.requestRevision) this.busy_fetch = false;
      }
    },
    showAdd() {
      if (!this.writeShopAccess(ShopPermissionRegions.CHANNELS.code)) return;
      this.dialogShopId = this.shop.id;
      this.current_item = { location: null };
      this.dialog = true;
    },
    showEdit(item) {
      if (
        !item?.id ||
        !this.map_tags.some((row) => String(row.id) === String(item.id))
      )
        return;
      this.dialogShopId = this.shop.id;
      this.current_item = item;
      this.dialog = true;
    },
    onAdded(item) {
      if (!item?.id || String(this.dialogShopId) !== String(this.shop.id))
        return;
      const index = this.map_tags.findIndex(
        (row) => String(row.id) === String(item.id),
      );
      if (index < 0) {
        this.map_tags = [item, ...this.map_tags].slice(0, this.itemsPerPage);
        this.totalItems++;
      } else this.map_tags.splice(index, 1, item);
      this.fetchLocations();
    },
    onEdited(item) {
      if (!item?.id || String(this.dialogShopId) !== String(this.shop.id))
        return;
      const index = this.map_tags.findIndex(
        (row) => String(row.id) === String(item.id),
      );
      if (index >= 0) this.map_tags.splice(index, 1, item);
      this.fetchLocations();
    },
    onDeleted(id) {
      if (
        String(this.dialogShopId) !== String(this.shop.id) ||
        String(this.current_item.id) !== String(id)
      )
        return;
      this.map_tags = this.map_tags.filter(
        (item) => String(item.id) !== String(id),
      );
      this.totalItems = Math.max(0, this.totalItems - 1);
      this.current_item = {};
      this.dialog = false;
      const nextPage = Math.min(this.page, this.pageCount);
      if (nextPage !== this.page) this.page = nextPage;
      else this.fetchLocations();
    },
  },
};
</script>
<style lang="scss" scoped>
.b-map-tags-list {
  padding: 24px;
  border-radius: 16px;
  &__header {
    align-items: flex-start;
    margin-bottom: 22px;
    gap: 18px;
    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
    .sd-modern-subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      line-height: 21px;
    }
  }
  &__toolbar {
    justify-content: space-between;
    padding-bottom: 13px;
    margin-bottom: 12px;
  }
  &__search {
    flex: 0 1 230px;
    width: 230px;
    min-width: 0;
  }
  & &__table.sd-modern-data-table {
    --sd-modern-table-font-size: 13px;
    --sd-modern-table-line-height: 20px;
    background: transparent;
    :deep(.v-table__wrapper) {
      overflow: visible;
    }
    :deep(tbody > tr > td) {
      // The shared server table and legacy cells use important padding utilities.
      padding: 16px 12px !important;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
    }
    :deep(thead > tr > th) {
      padding-inline: 12px !important;
    }
    :deep(.v-data-table__tr:focus-visible) {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
    }
  }
  &__identity {
    min-width: 0;
  }
  &__name {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0;
    text-align: start;
    color: inherit;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }
  &__name:hover {
    color: rgb(var(--v-theme-primary));
  }
  &__name:focus-visible,
  &__more-tags:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
    border-radius: 3px;
  }
  &__address {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 4px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    overflow-wrap: anywhere;
  }
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    .sd-modern-tag {
      font-size: 11px;
      line-height: 18px;
      padding: 2px 7px;
    }
  }
  &__more-tags {
    min-height: 24px;
    padding-inline: 3px;
    font: inherit;
    font-size: 12px;
    color: var(--sd-modern-muted);
  }
  &__number {
    font-variant-numeric: tabular-nums;
  }
  &__range {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    white-space: nowrap;
  }
  &__editor {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    white-space: nowrap;
    .v-avatar {
      flex: 0 0 24px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &__muted {
    color: var(--sd-modern-muted);
  }
  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }
  &__empty {
    min-height: 205px;
    padding: 36px 20px;
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
    }
    p {
      max-width: 360px;
      font-size: 13px;
      line-height: 21px;
    }
  }
  &__footer {
    margin-top: 12px;
    padding-top: 13px;
  }
  @media (max-width: 719px) {
    padding: 20px 16px;
    border-radius: 14px;
    &__header {
      flex-wrap: wrap;
      gap: 12px;
      > div {
        flex: 1;
        min-width: 130px;
      }
    }
    &__toolbar {
      flex-wrap: wrap;
      gap: 8px;
      > span {
        width: 100%;
      }
    }
    &__search {
      flex-basis: 100%;
      width: 100%;
    }
    & &__table.sd-modern-data-table {
      :deep(.v-data-table__tr--mobile) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        padding: 18px 12px;
        border-bottom: 1px solid var(--sd-modern-border);
      }
      :deep(.v-data-table__tr--mobile > td) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        min-height: 0;
        padding: 0 !important;
        border-bottom: 0;
      }
      :deep(.v-data-table__tr--mobile > td:first-child),
      :deep(.v-data-table__tr--mobile > td:nth-child(2)),
      :deep(.v-data-table__tr--mobile > td:last-child) {
        grid-column: 1 / -1;
        padding-block: 0 !important;
      }
      :deep(.v-data-table__tr--mobile > td:first-child .v-data-table__td-title),
      :deep(.v-data-table__tr--mobile > td:last-child .v-data-table__td-title) {
        display: none;
      }
      :deep(.v-data-table__tr--mobile .v-data-table__td-value) {
        width: 100%;
        text-align: start;
      }
    }
    &__actions {
      justify-content: flex-end;
    }
    .sd-modern-icon-button {
      --sd-modern-icon-button-size: 44px;
    }
    &__more-tags {
      min-width: 44px;
      min-height: 44px;
    }
  }
}
</style>

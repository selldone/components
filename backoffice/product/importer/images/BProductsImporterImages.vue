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
  <div>
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
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:options="options"
      v-model:page="page"
      :class="{ disabled: busy_fetch }"
      :headers="headers"
      :items="images"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="$vuetify.display.xs"
      class="bg-transparent min-height-60vh"
      density="compact"
      hide-default-footer
      item-key="id"
    >
      <template v-slot:item.image="{ item }">
        <v-avatar
          class="hover-scale force-top m-1 pp"
          size="42"
          title="Copy image URL"
        >
          <v-img :src="item.url" />
        </v-avatar>
      </template>

      <template v-slot:item.url="{ item }">
        <v-btn
          :href="item.url"
          :title="item.url"
          icon
          target="_blank"
          variant="text"
        >
          <v-icon>link</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.attempt="{ item }">
        <b class="ma-1">{{ item.attempt }}</b>
        <v-chip
          v-if="item.dispatched"
          class="ms-2"
          color="green"
          pill
          size="small"
        >
          <v-icon class="fa-spin fa-spin-reverse" start>sync</v-icon>
          Fetching...
        </v-chip>
        <v-btn
          v-else
          :class="{ disabled: busy_attempt }"
          :loading="busy_attempt === item.id"
          class="ma-1 ms-2"
          icon
          title="Try to fetch image now."
          variant="text"
          @click="tryImportItem(item.id)"
        >
          <v-icon>refresh</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.updated_at="{ item }">
        <div class="min-width-150">
          {{ getFromNowString(item.updated_at) }}
          <small class="d-block">
            {{ getLocalTimeString(item.updated_at) }}
          </small>
        </div>
      </template>

      <template v-slot:item.clear="{ item }">
        <v-btn
          :loading="busy_remove === item.id"
          color="red"
          icon
          size="small"
          title="Remove image from the que."
          variant="text"
          @click="cancelImportItem(item.id)"
        >
          <v-icon>delete</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.product_id="{ item }">
        <v-btn
          v-if="item.product_id"
          :title="$t('global.commons.product')"
          :to="{
            name: 'BPageProductEdit',
            params: { product_id: item.product_id },
            hash: '#images',
          }"
          class="tnt"
          size="small"
          target="_blank"
          variant="elevated"
        >
          <v-icon start>launch</v-icon>
          Product Admin
        </v-btn>
      </template>

      <template v-slot:item.type="{ item }">
        <v-chip v-if="item.type === 'Icon'" pill size="small" variant="plain">
          <v-icon start>image</v-icon>
          {{ item.type }}
        </v-chip>
        <v-chip v-else pill size="small" variant="plain">
          <v-icon start>burst_mode</v-icon>
          {{ item.type }}
        </v-chip>
      </template>

      <template v-slot:item.error="{ item }">
        <div
          v-if="item.error"
          :title="item.error"
          class="max-width-field overflow-hidden text-subtitle-2"
        >
          <v-icon class="mx-1" color="red">error_outline</v-icon>
          {{ item.error }}
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import threads from "@selldone/core-js/utils/thread/threads";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BProductsImporterImages",
  mixins: [DateMixin],

  props: {
    shop: {
      require: true,
    },
  },

  data: function () {
    return {
      busy_fetch: false,

      images: [],

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},

      headers: [
        {
          sortable: false,
          value: "image",
          align: "center",
        },
        {
          title: this.$t("global.commons.type"),
          align: "start",
          sortable: true,
          value: "type",
        },

        {
          title: this.$t("global.sort.product"),
          align: "center",
          sortable: true,
          value: "product_id",
        },

        {
          title: this.$t("global.commons.url"),
          align: "center",
          sortable: true,
          value: "url",
        },

        {
          title: this.$t("global.commons.attempt"),
          align: "center",
          sortable: true,
          value: "attempt",
        },
        {
          title: this.$t("global.commons.error"),
          align: "start",
          sortable: true,
          value: "error",
        },
        {
          title: this.$t("global.sort.updated_at"),
          align: "start",
          sortable: true,
          value: "updated_at",
        },
        {
          sortable: false,
          value: "clear",
          align: "center",
        },
      ],

      search: null,

      //---------------
      busy_remove: null,
      busy_attempt: null,
    };
  },

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchImages(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: threads.debounceSearch(function () {
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchImages(
        1,
        sortBy[0]?.key,
        sortBy[0]?.order === "desc",
        itemsPerPage,
      );
    }),
  },

  methods: {
    fetchImages(page, sortBy, sortDesc = true) {
      this.page = page;

      this.busy_fetch = true;

      const offset = (page - 1) * this.itemsPerPage;
      const limit = this.itemsPerPage;

      const params = {
        sortBy: sortBy,
        sortDesc: sortDesc,
        search: this.search,
      };

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.importer.que.images(
            this.$route.params.vendor_id,
            offset,
            limit,
            params,
          )
        : window.$backoffice.product.importer.que.images(
            this.shop.id,
            offset,
            limit,
            params,
          )
      )
        .then(({ total, images }) => {
          this.totalItems = total;
          this.images = images;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    cancelImportItem(item_id) {
      this.busy_remove = item_id;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.importer.que.removeImage(
            this.$route.params.vendor_id,
            item_id,
          )
        : window.$backoffice.product.importer.que.removeImage(
            this.shop.id,
            item_id,
          )
      )

        .then(({ id }) => {
          this.DeleteItemByID(this.images, id);
          this.totalItems--;
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_remove = null;
        });
    },

    tryImportItem(item_id) {
      this.busy_attempt = item_id;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.importer.que.syncImage(
            this.$route.params.vendor_id,
            item_id,
          )
        : window.$backoffice.product.importer.que.syncImage(
            this.shop.id,
            item_id,
          )
      )
        .then(({ success, id = null, item = null }) => {
          if (success) {
            this.DeleteItemByID(this.images, id);
            this.totalItems--;
            NotificationService.showSuccessAlert(null, "Import image successfully completed.");
          } else {
            this.AddOrUpdateItemByID(this.images, item);
            NotificationService.showWarningAlert(null, "Server can not download image.");
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_attempt = null;
        });
    },
  },
};
</script>

<style scoped></style>

<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div v-bind="$attrs" class="widget-box -large mb-5">
    <u-widget-header
      title="Messages"
      icon="mail"
      :add-caption="$t('global.actions.refresh')"
      @click:add="refresh"
      addText
      add-icon="refresh"
    >

    </u-widget-header>

    <v-list-subheader>
      Messages sent by customers to your listing profiles will appear here.
    </v-list-subheader>

    <!-- Filters (admin-like) -->
    <v-row no-gutters class="align-center">
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="search"
        variant="solo"
        bg-color="transparent"
        density="comfortable"
        clearable
        class="max-w-320"
        flat
        hide-details
      />

      <v-select
        v-model="filter_status"
        :items="statusOptions"
        item-title="title"
        item-value="value"
        label="Status"
        variant="solo"
        bg-color="transparent"
        density="comfortable"
        clearable
        class="max-w-220 ms-2"
        flat
        hide-details
      />

      <v-spacer />
    </v-row>

    <u-loading-progress v-if="busy_fetch" />

    <v-data-table-server
      :mobile="$vuetify.display.xs"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="messages"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      class="bg-transparent mb-2 min-height-60vh"
      density="compact"
      hide-default-footer
      @click:row="(_, r) => openDialog(r.item)"
    >
      <template v-slot:no-data>
        <div v-if="!busy_fetch && !searchSafe" class="py-5 usn text-center fadeIn">
          <v-icon size="64" class="op-0-3">mail</v-icon>
          <h2 class="text-h5 font-weight-thin mt-2">No messages</h2>
          <div class="text-muted mt-2">
            Messages from customers will appear here.
          </div>
        </div>

        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>

      <!-- Sender + Preview -->
      <template v-slot:item.sender="{ item }">
        <div class="min-width-280 py-1">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center min-w-0">
              <v-avatar size="32" class="me-2">
                <img
                  v-if="senderUserId(item)"
                  :src="getUserAvatar(senderUserId(item))"
                  alt="avatar"
                />
                <v-icon v-else>person</v-icon>
              </v-avatar>

              <div class="min-w-0">
                <div class="font-weight-black text-truncate">
                  {{ senderName(item) }}
                </div>
                <small class="text-muted d-block text-truncate">
                  {{ senderEmail(item) }}
                </small>
              </div>
            </div>

            <v-chip size="x-small" label variant="tonal" :class="statusClass(item)">
              {{ String(item.status || "new") }}
            </v-chip>
          </div>

          <div v-if="item.subject" class="text-truncate mt-1">
            {{ item.subject }}
          </div>

          <small class="d-block lhn text-muted">
            {{ String(item.message || "").limitWords(14) }}
          </small>
        </div>
      </template>

      <!-- Item -->
      <template v-slot:item.item="{ item }">
        <div class="min-width-220 py-1">
          <div class="font-weight-black text-truncate">
            {{ item.item?.title || (item.item_id ? `Item #${item.item_id}` : "—") }}
          </div>

          <v-chip
            v-if="item.item?.category?.title"
            size="x-small"
            variant="tonal"
            label
            class="mt-1"
            :prepend-avatar="item.item.category.icon ? getShopImagePath(item.item.category.icon) : undefined"
          >
            {{ item.item.category.title }}
          </v-chip>
        </div>
      </template>

      <!-- Created -->
      <template v-slot:item.created_at="{ item }">
        <div class="min-width-180">
          {{ formatDate(item.created_at) }}
        </div>
      </template>

      <!-- Menu -->
      <template v-slot:item.menu="{ item }">
        <u-smart-menu :loading="busy_action_id === item.id" :items="menuItems(item)" />
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>

    <!-- Dialog -->
    <v-vendor-listing-message-dialog
      v-model="dialog"
      :vendor-id="vendorId"
      :message="selected_message"
      @updated="onUpdated"
    />
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { throttle } from "lodash-es";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import VVendorListingMessageDialog from "./dialog/VVendorListingMessageDialog.vue";

export default {
  name: "VVendorListingMessagesList",

  components: {
    USmartMenu,
    VVendorListingMessageDialog,
  },

  props: {
    vendorId: { type: Number, required: true },
  },

  data: () => ({
    messages: [] as any[],
    totalItems: 0,

    busy_fetch: false,
    busy_action_id: null as number | null,

    // filters
    search: "",
    filter_status: null as string | null,

    // pagination / sort
    page: 1,
    itemsPerPage: 12,
    options: {} as any,
    sortBy: [{ key: "created_at", order: "desc" }] as any[],

    // dialog
    dialog: false,
    selected_message: null as any | null,
  }),

  computed: {
    pageCount(): number {
      return Math.max(1, Math.ceil((this.totalItems || 0) / this.itemsPerPage));
    },

    searchSafe(): string | null {
      const s = String(this.search || "").trim();
      return s.length ? s : null;
    },

    statusOptions(): any[] {
      return [
        { title: "All", value: null },
        { title: "new", value: "new" },
        { title: "read", value: "read" },
        { title: "replied", value: "replied" },
        { title: "archived", value: "archived" },
        { title: "spam", value: "spam" },
      ];
    },

    headers(): any[] {
      return [
        { title: "Sender", align: "start", sortable: false, value: "sender" },
        { title: "Item", align: "start", sortable: false, value: "item" },
        { title: "Created", align: "start", sortable: true, value: "created_at" },
        { title: "", align: "center", sortable: false, value: "menu" },
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
      deep: true,
      handler() {
        this.refresh();
      },
    },

    search: throttle(function () {
      this.page = 1;
      this.refresh();
    }, (window as any).SERACH_THROTTLE || 600),

    filter_status() {
      this.page = 1;
      this.refresh();
    },
  },

  methods: {
    formatDate(dt: any) {
      const s = String(dt || "").trim();
      if (!s) return "";
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
    },

    // sender helpers
    senderUserId(msg: any): number | null {
      const id = msg?.user?.id ?? msg?.user_id ?? null;
      const n = id !== null && id !== undefined ? parseInt(String(id), 10) : 0;
      return n > 0 ? n : null;
    },

    senderName(msg: any): string {
      return String(msg?.user?.name ?? msg?.name ?? "User");
    },

    senderEmail(msg: any): string {
      return String(msg?.contact_email ?? msg?.email ?? "");
    },

    statusClass(msg: any) {
      const s = String(msg?.status || "").toLowerCase();
      if (msg?.deleted_at) return "text-red";
      if (s === "spam") return "text-red";
      if (s === "archived") return "text-muted";
      if (s === "replied") return "text-success";
      if (s === "read") return "text-success";
      if (s === "new") return "text-warning";
      return "text-muted";
    },

    refresh() {
      const vendorId = parseInt(String(this.vendorId || 0), 10) || 0;
      if (!vendorId) return;

      const sortKey = this.options?.sortBy?.[0]?.key || "created_at";
      const sortDesc = this.options?.sortBy?.[0]?.order === "desc";
      const page = this.options?.page || this.page || 1;

      this.busy_fetch = true;

      axios
        .get(window.VAPI.GET_MY_VENDOR_LISTING_MESSAGES(vendorId), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortKey,
            sortDesc: sortDesc ? "true" : "false",
            search: this.searchSafe,
            status: this.filter_status || null,
          },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.messages = Array.isArray(data.messages) ? data.messages : [];
          this.totalItems = parseInt(String(data.total || 0), 10) || this.messages.length;
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => (this.busy_fetch = false));
    },

    openDialog(msg: any) {
      this.selected_message = msg;
      this.dialog = true;
    },

    onUpdated(patch: any) {
      const id = patch?.id ?? this.selected_message?.id;
      if (!id) return this.refresh();

      const i = this.messages.findIndex((x: any) => x?.id === id);
      if (i >= 0) this.messages.splice(i, 1, { ...this.messages[i], ...patch });
      this.refresh();
    },

    menuItems(msg: any) {
      return [
        { title: "Open", icon: "visibility", click: () => this.openDialog(msg) },
        { title: "Delete", icon: "delete", click: () => this.deleteMessage(msg) },
      ];
    },

    deleteMessage(msg: any) {
      const vendorId = parseInt(String(this.vendorId || 0), 10) || 0;
      const id = msg?.id ? parseInt(String(msg.id), 10) : 0;
      if (!vendorId || !id) return;

      NotificationService.openDangerAlert(
        "Delete message",
        "Delete this message?",
        "Delete",
        () => {
          this.busy_action_id = id;

          axios
            .delete(window.VAPI.DELETE_MY_VENDOR_LISTING_MESSAGE(vendorId, id))
            .then(({ data }) => {
              if (data?.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
                return;
              }
              NotificationService.showSuccessAlert(null, "Deleted.");
              this.refresh();
            })
            .catch((e) => NotificationService.showLaravelError(e))
            .finally(() => (this.busy_action_id = null));
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.max-w-320 {
  max-width: 320px;
}
.max-w-220 {
  max-width: 220px;
}
</style>

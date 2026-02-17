<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <div class="text-start">
    <!-- Header -->
    <div class="d-flex align-center mb-2">
      <div class="font-weight-bold">
        {{ resolvedLabel }}
      </div>

      <v-spacer />

      <v-chip v-if="selectedIds.length" size="x-small" label variant="tonal" class="me-2">
        {{ selectedIds.length }} selected
      </v-chip>

      <v-btn
        v-if="selectedIds.length"
        size="small"
        variant="text"
        :disabled="disabled"
        @click="clearAll"
      >
        <v-icon start>clear</v-icon>
        Clear
      </v-btn>
    </div>

    <!-- Selected chips -->
    <div v-if="selectedIds.length" class="d-flex flex-wrap mb-2">
      <v-chip
        v-for="id in selectedIds"
        :key="id"
        size="small"
        label
        class="ma-1"
        variant="tonal"
        :disabled="disabled"
        @click="removeById(id)"
      >
        <v-avatar v-if="getBadgeById(id)?.image" size="18" class="me-2">
          <img :src="getShopImagePath(getBadgeById(id).image)" />
        </v-avatar>

        <v-icon v-else size="16" class="me-2">workspace_premium</v-icon>

        {{ getBadgeById(id)?.title || `#${id}` }}

        <v-icon size="16" class="ms-2">close</v-icon>
      </v-chip>
    </div>

    <!-- Search -->
    <v-text-field
      v-model="search"
      :label="searchLabel"
      prepend-inner-icon="search"
      variant="underlined"
      clearable
      hide-details
      :disabled="disabled"
    />

    <u-loading-progress v-if="busy" />

    <!-- Badge cards -->
    <div v-if="filteredBadges.length" class="badge-grid mt-3">
      <div
        v-for="b in filteredBadges"
        :key="b.id"
        class="badge-tile"
      >
        <v-card
          class="badge-card"
          rounded="xl"
          variant="flat"
          :class="{ '-selected': isSelected(b.id), '-disabled': disabled }"
          @click="toggle(b)"
        >
          <div class="d-flex align-center">
            <v-avatar size="34" class="rounded-lg me-2" color="#f6f6f6">
              <img v-if="b.image" :src="getShopImagePath(b.image)" />
              <v-icon v-else>workspace_premium</v-icon>
            </v-avatar>

            <div class="min-width-0">
              <div class="font-weight-bold text-truncate">
                {{ b.title }}
              </div>
              <small v-if="b.description" class="text-muted text-truncate d-block">
                {{ b.description }}
              </small>
            </div>

            <v-spacer />

            <v-icon v-if="isSelected(b.id)" class="text-success">check_circle</v-icon>
            <v-icon v-else class="text-muted">add_circle_outline</v-icon>
          </div>
        </v-card>
      </div>
    </div>

    <div v-else class="text-center text-muted py-4">
      <v-icon class="me-1">sentiment_dissatisfied</v-icon>
      No badges found.
    </div>

    <small class="text-muted d-block mt-2">
      Click a badge card to toggle selection. Selected badges will be highlighted with a green border.
    </small>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { throttle } from "lodash-es";

export default {
  name: "BListingBadgeInput",

  inject: ["$shop"],

  props: {
    modelValue: { default: null },

    returnObject: { type: Boolean, default: false },

    label: { type: String, default: null },

    activeOnly: { type: Boolean, default: true },

    withTrashed: { type: Boolean, default: false },

    limit: { type: Number, default: 100 },

    disabled: { type: Boolean, default: false },
  },

  emits: ["update:modelValue"],

  data: () => ({
    busy: false,
    badges: [] as any[],
    search: "",
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // Standard detection requested
      // @ts-ignore
      return (
        this.$route?.params?.vendor_id &&
        // @ts-ignore
        this.$route?.matched?.some((record: any) => record?.meta?.vendor)
      );
    },

    vendorIdSafe(): number | null {
      if (!this.IS_VENDOR_PANEL) return null;
      // @ts-ignore
      const raw = this.$route?.params?.vendor_id;
      const id = raw !== null && raw !== undefined ? parseInt(String(raw), 10) : 0;
      return id > 0 ? id : null;
    },

    shopIdSafe(): number | null {
      const id = this.shop?.id ? parseInt(String(this.shop.id), 10) : 0;
      return id > 0 ? id : null;
    },

    contextKey(): string {
      if (this.IS_VENDOR_PANEL) return `vendor:${this.vendorIdSafe || 0}`;
      return `shop:${this.shopIdSafe || 0}`;
    },

    resolvedLabel(): string {
      if (this.label) return this.label;
      // @ts-ignore
      return typeof this.$t === "function" ? this.$t("shop_listing.badges.title") : "Badges";
    },

    searchLabel(): string {
      // @ts-ignore
      return typeof this.$t === "function" ? this.$t("global.commons.search") : "Search";
    },

    selectedIds(): number[] {
      const v: any = this.modelValue;
      if (!v) return [];

      if (this.returnObject) {
        if (!Array.isArray(v)) return [];
        return v
          .map((x: any) => parseInt(String(x?.id || ""), 10))
          .filter((n: number) => Number.isFinite(n) && !Number.isNaN(n));
      }

      if (Array.isArray(v)) {
        return v
          .map((x: any) => parseInt(String(x), 10))
          .filter((n: number) => Number.isFinite(n) && !Number.isNaN(n));
      }

      return [];
    },

    filteredBadges(): any[] {
      let list = Array.isArray(this.badges) ? this.badges : [];

      if (this.activeOnly) {
        list = list.filter((b: any) => !!b?.is_active && !b?.deleted_at);
      } else {
        if (!this.withTrashed) {
          list = list.filter((b: any) => !b?.deleted_at);
        }
      }

      const s = (this.search || "").trim().toLowerCase();
      if (!s) return list;

      return list.filter((b: any) => {
        const t = String(b?.title || "").toLowerCase();
        const d = String(b?.description || "").toLowerCase();
        return t.includes(s) || d.includes(s);
      });
    },
  },

  watch: {
    // Re-fetch when switching between shop vs vendor panel context
    contextKey: {
      immediate: true,
      handler() {
        this.fetchBadges();
      },
    },

    withTrashed() {
      this.fetchBadges();
    },

    search: throttle(function () {
      // local filter only (no server search)
    }, 200),
  },

  methods: {
    getBadgeById(id: number) {
      return (this.badges || []).find((b: any) => b?.id === id) || null;
    },

    isSelected(id: number): boolean {
      return this.selectedIds.includes(id);
    },

    emitValueFromIds(ids: number[]) {
      const unique = Array.from(new Set(ids)).filter((x) => x > 0);

      if (this.returnObject) {
        const objects = unique
          .map((id) => this.getBadgeById(id))
          .filter((x: any) => !!x);
        this.$emit("update:modelValue", objects);
      } else {
        this.$emit("update:modelValue", unique);
      }
    },

    toggle(badge: any) {
      if (this.disabled) return;

      const id = parseInt(String(badge?.id || ""), 10);
      if (!id) return;

      const ids = [...this.selectedIds];
      const i = ids.indexOf(id);

      if (i >= 0) ids.splice(i, 1);
      else ids.push(id);

      this.emitValueFromIds(ids);
    },

    removeById(id: number) {
      if (this.disabled) return;
      this.emitValueFromIds(this.selectedIds.filter((x) => x !== id));
    },

    clearAll() {
      if (this.disabled) return;
      this.$emit("update:modelValue", this.returnObject ? [] : []);
    },

    fetchBadges() {
      // Vendor panel → VAPI
      if (this.IS_VENDOR_PANEL) {
        const vendorId = this.vendorIdSafe;
        if (!vendorId) return;

        this.busy = true;

        axios
          .get(window.VAPI.GET_MY_VENDOR_LISTING_BADGES(vendorId), {
            params: {
              offset: 0,
              limit: Math.min(Math.max(1, parseInt(String(this.limit || 100), 10) || 100), 100),
              with_trashed: this.withTrashed ? "true" : "false",
              sortBy: "sort_order",
              sortDesc: "false",
            },
          })
          .then(({ data }) => {
            if (data?.error) {
              NotificationService.showErrorAlert(null, data.error_msg);
              return;
            }

            this.badges = Array.isArray(data.badges) ? data.badges : [];

            if (this.returnObject && this.selectedIds.length) {
              this.emitValueFromIds(this.selectedIds);
            }
          })
          .catch((error) => NotificationService.showLaravelError(error))
          .finally(() => (this.busy = false));

        return;
      }

      // Shop backoffice → API
      const shopId = this.shopIdSafe;
      if (!shopId) return;

      this.busy = true;

      axios
        .get(window.API.GET_SHOP_LISTING_BADGES(shopId), {
          params: {
            offset: 0,
            limit: Math.min(Math.max(1, parseInt(String(this.limit || 100), 10) || 100), 100),
            with_trashed: this.withTrashed ? "true" : "false",
            sortBy: "sort_order",
            sortDesc: "false",
          },
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          this.badges = Array.isArray(data.badges) ? data.badges : [];

          if (this.returnObject && this.selectedIds.length) {
            this.emitValueFromIds(this.selectedIds);
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style scoped>
.badge-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.badge-tile {
  flex: 1 1 calc(50% - 10px);
  min-width: 240px;
}

@media (max-width: 720px) {
  .badge-tile {
    flex-basis: 100%;
    min-width: 0;
  }
}

.badge-card {
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 180ms ease;
}

.badge-card:hover {
  border-color: rgba(0, 0, 0, 0.18);
}

.badge-card.-selected {
  border: 3px solid #1b5e20;
}

.badge-card.-disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>

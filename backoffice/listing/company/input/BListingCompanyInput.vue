<template>
  <div class="text-start">
    <u-loading-progress v-if="busy" />

    <v-select
      :model-value="internal"
      @update:modelValue="onInternalChange"
      :items="filteredCompanies"
      item-title="name"
      item-value="id"
      :label="resolvedLabel"
      :clearable="clearable"
      :disabled="disabled"
      :variant="variant"
      :messages="messages"
      :hide-details="hideDetails"
      :menu-props="{ maxHeight: 420 }"
      prepend-inner-icon="business"
    >
      <!-- Search inside dropdown -->
      <template v-slot:prepend-item>
        <div class="px-3 pt-2">
          <v-text-field
            v-model="search"
            :label="searchLabel"
            prepend-inner-icon="search"
            variant="underlined"
            hide-details
            clearable
            :disabled="disabled"
          />
        </div>
        <v-divider class="mt-2" />
      </template>

      <!-- Selected -->
      <template v-slot:selection="{ item }">
        <div class="d-flex align-center min-width-0">
          <v-avatar v-if="item?.raw?.logo" size="20" class="me-2 rounded-lg">
            <img :src="getShopImagePath(item.raw.logo)" />
          </v-avatar>

          <v-icon v-else size="18" class="me-2 text-muted">business</v-icon>

          <div class="text-truncate">
            {{ item?.raw?.name || "—" }}
          </div>
        </div>
      </template>

      <!-- Item -->
      <template v-slot:item="{ props, item }">
        <v-list-item v-bind="props">
          <template v-slot:prepend>
            <v-avatar v-if="item?.raw?.logo" size="28" class="rounded-lg">
              <img :src="getShopImagePath(item.raw.logo)" />
            </v-avatar>
            <v-icon v-else>business</v-icon>
          </template>

          <v-list-item-title class="font-weight-bold">
            {{ item?.raw?.name }}
          </v-list-item-title>

          <v-list-item-subtitle
            v-if="item?.raw?.website || item?.raw?.email"
            class="text-truncate"
          >
            {{ item?.raw?.website || item?.raw?.email }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-chip
              v-if="item?.raw?.deleted_at"
              size="x-small"
              label
              variant="tonal"
              class="text-red"
            >
              Removed
            </v-chip>

            <v-chip
              v-else-if="item?.raw?.is_active === false"
              size="x-small"
              label
              variant="tonal"
              class="text-muted"
            >
              Inactive
            </v-chip>
          </template>
        </v-list-item>
      </template>

      <template v-slot:no-data>
        <div class="text-center text-muted py-4">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          No companies found.
        </div>
      </template>
    </v-select>

    <small v-if="hint" class="text-muted d-block mt-1">
      {{ hint }}
    </small>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BListingCompanyInput",

  inject: ["$shop"],

  props: {
    modelValue: { default: null },
    returnObject: { type: Boolean, default: false },

    label: { type: String, default: null },
    hint: { type: String, default: "" },

    variant: { type: String, default: "underlined" },
    messages: { type: String, default: " " },
    hideDetails: { type: [Boolean, String], default: false },

    clearable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },

    activeOnly: { type: Boolean, default: true },
    withTrashed: { type: Boolean, default: false },

    limit: { type: Number, default: 100 },
  },

  emits: ["update:modelValue"],

  data: () => ({
    busy: false,
    companies: [] as any[],
    search: "",

    internal: null as number | null,

    _syncing: false,
    _loaded_for_key: "" as string,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // @ts-ignore
      return (
        (this as any).$route?.params?.vendor_id &&
        // @ts-ignore
        (this as any).$route?.matched?.some((record: any) => record?.meta?.vendor)
      );
    },

    vendorIdSafe(): number | null {
      if (!this.IS_VENDOR_PANEL) return null;
      // @ts-ignore
      const raw = (this as any).$route?.params?.vendor_id;
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
      return typeof (this as any).$t === "function"
        ? (this as any).$t("shop_listing.items.company")
        : "Company";
    },

    searchLabel(): string {
      // @ts-ignore
      return typeof (this as any).$t === "function"
        ? (this as any).$t("global.commons.search")
        : "Search";
    },

    selectedId(): number | null {
      const v: any = this.modelValue;

      if (v && typeof v === "object" && !Array.isArray(v)) {
        const id = v?.id ? parseInt(String(v.id), 10) : 0;
        return id > 0 ? id : null;
      }

      const id = v !== null && v !== undefined ? parseInt(String(v), 10) : 0;
      return id > 0 ? id : null;
    },

    filteredCompanies(): any[] {
      let list = Array.isArray(this.companies) ? this.companies : [];

      if (this.activeOnly) {
        list = list.filter((c: any) => !!c?.is_active && !c?.deleted_at);
      } else if (!this.withTrashed) {
        list = list.filter((c: any) => !c?.deleted_at);
      }

      // Keep selected visible (even if inactive/deleted)
      if (this.internal) {
        const selected = this.findCompanyById(this.internal);
        if (selected && !list.some((x: any) => x?.id === selected.id)) {
          list = [selected, ...list];
        }
      }

      const s = (this.search || "").trim().toLowerCase();
      if (!s) return list;

      return list.filter((c: any) => {
        const n = String(c?.name || "").toLowerCase();
        const w = String(c?.website || "").toLowerCase();
        const e = String(c?.email || "").toLowerCase();
        const t = String(c?.tel || "").toLowerCase();
        return n.includes(s) || w.includes(s) || e.includes(s) || t.includes(s);
      });
    },
  },

  watch: {
    contextKey: {
      immediate: true,
      handler() {
        // context changed => refetch
        this.fetchCompanies(true);
      },
    },

    withTrashed() {
      this.fetchCompanies(true);
    },

    modelValue: {
      immediate: true,
      handler() {
        // sync internal from modelValue (NO loops)
        this._syncing = true;
        this.internal = this.selectedId;
        this.$nextTick(() => (this._syncing = false));

        // if selected not found in fetched list, refetch once (contain helps if backend supports)
        if (this.selectedId && !this.findCompanyById(this.selectedId)) {
          this.fetchCompanies(false);
        }
      },
    },
  },

  methods: {
    findCompanyById(id: number) {
      return (this.companies || []).find((c: any) => c?.id === id) || null;
    },

    normalizeCompanies(raw: any[]): any[] {
      const list = Array.isArray(raw) ? raw : [];

      return list
        .map((c: any) => {
          const id = c?.id !== null && c?.id !== undefined ? parseInt(String(c.id), 10) : 0;
          if (!id) return null;

          return {
            ...c,
            id, // ✅ force numeric id (fixes "selected not showing")
          };
        })
        .filter(Boolean);
    },

    onInternalChange(val: any) {
      const id = val !== null && val !== undefined ? parseInt(String(val), 10) : 0;
      const next = id > 0 ? id : null;

      // update local
      this.internal = next;

      // avoid emitting while syncing from parent
      if (this._syncing) return;

      if (this.returnObject) {
        this.$emit("update:modelValue", next ? this.findCompanyById(next) : null);
      } else {
        this.$emit("update:modelValue", next);
      }
    },

    fetchCompanies(force: boolean) {
      const ctx = this.contextKey;
      if (!force && this._loaded_for_key === ctx && this.companies.length) return;

      const vendorId = this.vendorIdSafe;
      const shopId = this.shopIdSafe;

      const url = this.IS_VENDOR_PANEL
        ? (vendorId ? window.VAPI.GET_MY_VENDOR_LISTING_COMPANIES(vendorId) : null)
        : (shopId ? window.API.GET_SHOP_LISTING_COMPANIES(shopId) : null);

      if (!url) return;

      this.busy = true;

      axios
        .get(url, {
          params: {
            offset: 0,
            limit: Math.min(Math.max(1, parseInt(String(this.limit || 100), 10) || 100), 100),

            // optional: if backend supports, it should include selected row even if filtered/paged
            contain: this.selectedId || null,

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

          const list = this.normalizeCompanies(data.companies);

          // ✅ use your universal helper if exists (keeps array stable, no reactivity glitches)
          // @ts-ignore
          if (typeof (this as any).AddOrUpdateItemByID === "function") {
            // Keep old list but update/add incoming ones
            // (Do not delete old ones; safe for selection stability)
            list.forEach((c: any) => {
              // @ts-ignore
              (this as any).AddOrUpdateItemByID(this.companies, c, "id", false);
            });
          } else {
            this.companies = list;
          }

          // Ensure internal matches selectedId after load
          if (this.selectedId) {
            this._syncing = true;
            this.internal = this.selectedId;
            this.$nextTick(() => (this._syncing = false));
          }

          // If returnObject, keep v-model object synced
          if (this.returnObject && this.selectedId) {
            const obj = this.findCompanyById(this.selectedId);
            this.$emit("update:modelValue", obj || null);
          }

          this._loaded_for_key = ctx;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style scoped></style>

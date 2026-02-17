<template>
  <div class="text-start">
    <u-loading-progress v-if="busy" />

    <v-select
      v-model="internal"
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
      @update:modelValue="onChange"
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
      // Used to auto-refetch when switching contexts
      if (this.IS_VENDOR_PANEL) return `vendor:${this.vendorIdSafe || 0}`;
      return `shop:${this.shopIdSafe || 0}`;
    },

    resolvedLabel(): string {
      if (this.label) return this.label;
      // @ts-ignore
      return typeof this.$t === "function"
        ? this.$t("shop_listing.items.company")
        : "Company";
    },

    searchLabel(): string {
      // @ts-ignore
      return typeof this.$t === "function" ? this.$t("global.commons.search") : "Search";
    },

    filteredCompanies(): any[] {
      let list = Array.isArray(this.companies) ? this.companies : [];

      // Filter
      if (this.activeOnly) {
        list = list.filter((c: any) => !!c?.is_active && !c?.deleted_at);
      } else if (!this.withTrashed) {
        list = list.filter((c: any) => !c?.deleted_at);
      }

      // Ensure currently selected company is still visible even if inactive
      if (this.internal) {
        const selected = this.findCompanyById(this.internal);
        if (selected && !list.some((x: any) => x?.id === selected.id)) {
          list = [selected, ...list];
        }
      }

      // Local search (dropdown-only)
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

    selectedId(): number | null {
      const v: any = this.modelValue;

      if (this.isObject(v) && v.id) {
        const id = parseInt(String(v.id), 10);
        return Number.isFinite(id) && id > 0 ? id : null;
      }

      const id = v !== null && v !== undefined ? parseInt(String(v), 10) : 0;
      return Number.isFinite(id) && id > 0 ? id : null;
    },

    selectedCompany(): any | null {
      if (!this.selectedId) return null;
      return this.companies.find((c: any) => c && c.id === this.selectedId) || null;
    },
  },

  watch: {
    // Auto-fetch when context switches (shop vs vendor, or different vendor)
    contextKey: {
      immediate: true,
      handler() {
        this.fetchCompanies();
      },
    },

    // Refetch when toggling trashed (vendor endpoint supports it too)
    withTrashed() {
      this.fetchCompanies();
    },

    modelValue: {
      handler() {
        // Ensure selected row exists for stable UI (contain)
        if (this.selectedId && !this.selectedCompany) {
          this.fetchCompanies();
        }
      },
    },
  },

  methods: {
    isObject(val: any): boolean {
      return val !== null && typeof val === "object" && !Array.isArray(val);
    },

    findCompanyById(id: number) {
      return (this.companies || []).find((c: any) => c?.id === id) || null;
    },

    onChange(val: any) {
      const id = val !== null && val !== undefined ? parseInt(String(val), 10) : null;
      const normalized = id && Number.isFinite(id) ? id : null;

      if (this.returnObject) {
        this.$emit("update:modelValue", normalized ? this.findCompanyById(normalized) : null);
      } else {
        this.$emit("update:modelValue", normalized);
      }
    },

    fetchCompanies() {
      // Vendor panel → VAPI
      if (this.IS_VENDOR_PANEL) {
        const vendorId = this.vendorIdSafe;
        if (!vendorId) return;

        this.busy = true;

        axios
          .get(window.VAPI.GET_MY_VENDOR_LISTING_COMPANIES(vendorId), {
            params: {
              offset: 0,
              limit: Math.min(Math.max(1, parseInt(String(this.limit || 100), 10) || 100), 100),

              // Keep selected row available in list
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

            this.companies = Array.isArray(data.companies) ? data.companies : [];

            // Keep v-model synced to object form if required
            if (this.returnObject && this.selectedId) {
              const obj = this.findCompanyById(this.selectedId);
              this.$emit("update:modelValue", obj || null);
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
        .get(window.API.GET_SHOP_LISTING_COMPANIES(shopId), {
          params: {
            offset: 0,
            limit: Math.min(Math.max(1, parseInt(String(this.limit || 100), 10) || 100), 100),

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

          this.companies = Array.isArray(data.companies) ? data.companies : [];

          if (this.returnObject && this.selectedId) {
            const obj = this.findCompanyById(this.selectedId);
            this.$emit("update:modelValue", obj || null);
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy = false));
    },
  },
};
</script>

<style scoped></style>

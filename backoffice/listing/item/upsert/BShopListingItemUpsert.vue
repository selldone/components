<!--
  - Copyright (c) 2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card class="text-start h-100" flat>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">edit_attributes</v-icon>
      <div class="font-weight-black">
        {{ isEdit ? $t("shop_listing.items.edit_title") : $t("shop_listing.items.add_title") }}
      </div>
      <v-spacer />
      <v-chip size="x-small" label variant="tonal">
        Step {{ activeStep }}/{{ tabs.length }}
      </v-chip>
    </v-card-title>

    <v-card-text class="text-start position-relative pt-6">
      <v-expand-transition>
        <v-alert v-if="form_error" type="error" variant="tonal" border="start">
          {{ form_error }}
        </v-alert>
      </v-expand-transition>

      <v-form ref="form" lazy-validation>
        <v-tabs
          v-model="tab"
          show-arrows
          density="comfortable"
          align-tabs="center"
          class="mt-2"
        >
          <v-tab
            v-for="(t, i) in tabs"
            :key="t.value"
            :value="t.value"
            class="text-none"
          >
            <v-icon size="18" class="me-1">{{ t.icon }}</v-icon>
            {{ i + 1 }}. {{ t.title }}
          </v-tab>
        </v-tabs>

        <v-list-subheader class="max-widget-width mx-auto">
          Step <b>{{ activeStep }}</b> of <b>{{ tabs.length }}</b> —
          {{ activeTabTitle }}
        </v-list-subheader>

        <v-window v-model="tab">
          <!-- General -->
          <v-window-item value="general">
            <b-shop-listing-item-tab-general
              v-model:category="form.category"
              v-model:company-id="form.company_id"
              v-model:badge-ids="form.badge_ids"
              v-model:title="form.title"
              v-model:slug="form.slug"
              v-model:status="form.status"
              v-model:is-featured="form.is_featured"
              :status-options="statusOptions"
            />
          </v-window-item>

          <!-- Description -->
          <v-window-item value="description">
            <b-shop-listing-item-tab-description
              v-model:subtitle="form.subtitle"
              v-model:description="form.description"
            />
          </v-window-item>

          <!-- Pricing -->
          <v-window-item value="pricing">
            <b-shop-listing-item-tab-pricing
              v-model:currency="form.currency"
              v-model:price="form.price"
              v-model:price-to="form.price_to"
              v-model:price-unit="form.price_unit"
              :currency-object="currencyObject"
              :active-currencies="shop?.currencies"
            />
          </v-window-item>

          <!-- Contact -->
          <v-window-item value="contact">
            <b-shop-listing-item-tab-contact
              v-model:tel="form.tel"
              v-model:email="form.email"
              v-model:website="form.website"
              v-model:links="form.links"
            />
          </v-window-item>

          <!-- Location -->
          <v-window-item value="location">
            <b-shop-listing-item-tab-location
              v-model:country-code="form.country_code"
              v-model:city="form.city"
              v-model:address="form.address"
              v-model:lat="form.lat"
              v-model:lng="form.lng"
            />
          </v-window-item>

          <!-- Hours -->
          <v-window-item value="hours">
            <b-shop-listing-item-tab-hours v-model:opening-hours="form.opening_hours" />
          </v-window-item>

          <!-- Listing Form (shared) -->
          <v-window-item v-if="hasListingFormTab" value="form_listing">
            <b-shop-listing-item-tab-form
              :title="$t('shop_listing.items.form_fields')"
              subtitle="Shared fields for all items in this listing."
              icon="data_object"
              :schema="listingSchemaEffective"
              v-model:meta-fields="form.listing_fields"
              :disabled="busy_save"
            />
          </v-window-item>

          <!-- Category Form (specific) -->
          <v-window-item v-if="hasCategoryFormTab" value="form_category">
            <b-shop-listing-item-tab-form
              :title="categoryFormTitle"
              :subtitle="categoryFormSubtitle"
              icon="data_object"
              :schema="categorySchema"
              v-model:meta-fields="form.category_fields"
              :disabled="busy_save"
            />
          </v-window-item>

          <!-- ✅ Media tab ALWAYS exists (last tab) -->
          <v-window-item value="media">
            <!-- When item exists -->
            <div v-if="effectiveItemId" class="mt-1">
              <b-shop-listing-item-tab-media :item-id="effectiveItemId" />
            </div>

            <!-- When creating (no item yet) -->
            <div v-else class="widget-box -large mt-2">
              <u-widget-header :title="$t('global.commons.media')" icon="photo_library" />

              <v-list-subheader>
                Media uploads require an item ID. First, save the item (create it), then you can upload images here —
                without closing this editor.
              </v-list-subheader>

              <s-widget-buttons>
                <v-btn
                  color="primary"
                  size="x-large"
                  variant="elevated"
                  :loading="busy_save"
                  @click="save({ goMediaAfterCreate: true, silentEmit: true, quiet: false })"
                >
                  <v-icon start>save</v-icon>
                  Save item to enable media
                </v-btn>
              </s-widget-buttons>
            </div>
          </v-window-item>
        </v-window>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="!hasClose">
        <v-btn
          v-if="hasClose"
          class="mx-1"
          size="x-large"
          variant="text"
          :disabled="busy_save"
          @click="$emit('close')"
        >
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          class="mx-1"
          size="x-large"
          variant="text"
          :disabled="isFirstTab || busy_save"
          @click="prevTab"
        >
          <v-icon start>chevron_left</v-icon>
          {{ $t("global.actions.back") }}
        </v-btn>

        <!-- ✅ Next autosaves (Create first, then Edit) -->
        <v-btn
          class="mx-1"
          size="x-large"
          variant="text"
          :disabled="isLastTab || busy_save"
          @click="nextTab"
        >
          {{ $t("global.actions.next") }}
          <v-icon end>chevron_right</v-icon>
        </v-btn>

        <!-- Manual save (emits add/edit => parent may close; kept as-is) -->
        <v-btn
          :loading="busy_save"
          class="mx-1"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="save({ goMediaAfterCreate: false, silentEmit: false, quiet: false })"
        >
          <v-icon start>save</v-icon>
          {{ $t("global.actions.save") }}
        </v-btn>
      </s-widget-buttons>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import BShopListingItemTabGeneral from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabGeneral.vue";
import BShopListingItemTabDescription from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabDescription.vue";
import BShopListingItemTabPricing from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabPricing.vue";
import BShopListingItemTabContact from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabContact.vue";
import BShopListingItemTabLocation from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabLocation.vue";
import BShopListingItemTabHours from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabHours.vue";
import BShopListingItemTabMedia from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabMedia.vue";
import BShopListingItemTabForm from "@selldone/components-vue/backoffice/listing/item/upsert/tabs/BShopListingItemTabForm.vue";

type SaveOptions = {
  goMediaAfterCreate?: boolean;
  /**
   * When true, do NOT emit add/edit events (prevents parent dialog from closing).
   */
  silentEmit?: boolean;
  /**
   * When true, do not show success toasts (used for Next autosave).
   */
  quiet?: boolean;
};

export default {
  name: "BShopListingItemUpsert",
  mixins: [CurrencyMixin],

  inject: ["$shop"],

  components: {
    SWidgetButtons,
    BShopListingItemTabGeneral,
    BShopListingItemTabDescription,
    BShopListingItemTabPricing,
    BShopListingItemTabContact,
    BShopListingItemTabLocation,
    BShopListingItemTabHours,
    BShopListingItemTabForm,
    BShopListingItemTabMedia,
  },

  props: {
    item: { type: Object, default: null },
    hasClose: { type: Boolean, default: false },
  },

  emits: ["add", "edit", "close"],

  data: () => ({
    tab: "general" as string,

    busy_save: false,
    form_error: "",

    // Stored locally to enable media after first create (without closing editor)
    created_item: null as any | null,

    form: {
      category: null as any,

      company_id: null as number | null,
      badge_ids: [] as number[],

      title: "",
      slug: "",
      subtitle: "",
      description: "",

      status: null as string | null,

      price: null as any,
      price_to: null as any,
      currency: "",
      price_unit: "",

      country_code: "",
      city: "",
      address: "",
      lat: null as any,
      lng: null as any,

      tel: "",
      email: "",
      website: "",

      is_featured: false,

      links: [] as string[],
      opening_hours: [] as any[],

      listing_fields: {} as Record<string, any>,
      category_fields: {} as Record<string, any>,
      meta_extra: {} as Record<string, any>,
    },
  }),

  computed: {
    /*🟢 Vendor Panel 🟢*/
    IS_VENDOR_PANEL(): boolean {
      // @ts-ignore
      return (
        this.$route?.params?.vendor_id &&
        // @ts-ignore
        this.$route?.matched?.some((record: any) => record?.meta?.vendor)
      );
    },

    vendorId(): number | null {
      // @ts-ignore
      const raw = this.$route?.params?.vendor_id;
      const n = raw !== undefined && raw !== null ? parseInt(String(raw), 10) : 0;
      return n > 0 ? n : null;
    },

    shop(): any {
      return (this as any).$shop;
    },

    effectiveItem(): any | null {
      // When editing use prop `item`, when creating use `created_item`
      // @ts-ignore
      return (this as any).item?.id ? (this as any).item : (this as any).created_item;
    },

    effectiveItemId(): number | null {
      const id = this.effectiveItem?.id ? parseInt(String(this.effectiveItem.id), 10) : 0;
      return id > 0 ? id : null;
    },

    isEdit(): boolean {
      return !!this.effectiveItemId;
    },

    currencyObject(): any {
      // @ts-ignore
      return this.form.currency ? this.GetCurrency(this.form.currency) : null;
    },

    listingSchemaRaw(): any[] {
      const s: any = this.shop?.listing?.form_schema;
      return Array.isArray(s) ? s : [];
    },

    categorySchemaRaw(): any[] {
      const c: any = this.form.category;
      if (!c || typeof c !== "object") return [];
      if (Array.isArray(c.form_schema)) return c.form_schema;

      if (Array.isArray(c.meta)) return c.meta;
      if (c.meta && typeof c.meta === "object" && Array.isArray(c.meta.form_schema)) {
        return c.meta.form_schema;
      }

      return [];
    },

    categorySchemaNames(): Set<string> {
      const set = new Set<string>();

      (this.categorySchemaRaw || []).forEach((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return;
        const name = f?.name ? String(f.name) : "";
        if (name) set.add(name);
      });

      return set;
    },

    listingSchemaEffective(): any[] {
      const catNames = this.categorySchemaNames;

      return (this.listingSchemaRaw || []).filter((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return true;

        const name = f?.name ? String(f.name) : "";
        if (!name) return false;

        return !catNames.has(name);
      });
    },

    categorySchema(): any[] {
      return Array.isArray(this.categorySchemaRaw) ? this.categorySchemaRaw : [];
    },

    hasListingFormTab(): boolean {
      return (this.listingSchemaEffective || []).length > 0;
    },

    hasCategoryFormTab(): boolean {
      return (this.categorySchema || []).length > 0;
    },

    categoryTitle(): string {
      const c: any = this.form.category;
      return c?.title ? String(c.title) : "Category";
    },

    categoryFormTitle(): string {
      return `${this.$t("shop_listing.items.form_fields")} - ${this.categoryTitle}`;
    },

    categoryFormSubtitle(): string {
      return `Extra fields specific to "${this.categoryTitle}". Values here override shared fields with the same key.`;
    },

    tabs(): any[] {
      const t = [
        { value: "general", title: this.$t("global.commons.general"), icon: "tune" },
        { value: "description", title: this.$t("global.commons.description"), icon: "notes" },
        { value: "pricing", title: this.$t("global.commons.finance"), icon: "price_change" },
        { value: "contact", title: this.$t("global.commons.contact"), icon: "contact_phone" },
        { value: "location", title: this.$t("global.commons.location"), icon: "location_on" },
        { value: "hours", title: this.$t("shop_listing.items.opening_hours"), icon: "schedule" },
      ];

      if (this.hasListingFormTab) {
        t.push({
          value: "form_listing",
          title: this.$t("shop_listing.items.form_fields"),
          icon: "data_object",
        });
      }

      if (this.hasCategoryFormTab) {
        t.push({
          value: "form_category",
          title: this.categoryFormTitle,
          icon: "data_object",
        });
      }

      // Always last
      t.push({
        value: "media",
        title: this.$t("global.commons.media"),
        icon: "photo_library",
      });

      return t;
    },

    activeStep(): number {
      const i = this.tabs.findIndex((x: any) => x.value === this.tab);
      return (i >= 0 ? i : 0) + 1;
    },

    activeTabTitle(): string {
      const t = this.tabs.find((x: any) => x.value === this.tab);
      return t ? t.title : "";
    },

    isFirstTab(): boolean {
      return this.activeStep <= 1;
    },

    isLastTab(): boolean {
      return this.activeStep >= this.tabs.length;
    },

    statusOptions(): any[] {
      return [
        { title: "draft", value: "draft" },
        { title: "pending", value: "pending" },
        { title: "approved", value: "approved" },
        { title: "published", value: "published" },
        { title: "rejected", value: "rejected" },
        { title: "archived", value: "archived" },
      ];
    },

    categoryId(): number | null {
      const c: any = this.form.category;
      if (!c) return null;
      if (typeof c === "number") return c;
      if (typeof c === "object" && c.id) return parseInt(String(c.id), 10) || null;
      return null;
    },
  },

  watch: {
    item: {
      immediate: true,
      handler(newVal: any) {
        // if editing a real item, forget created_item
        if (newVal?.id) this.created_item = null;
        this.initForm(newVal);
      },
    },

    "form.category": {
      deep: false,
      handler() {
        this.rebuildMetaBuckets();
        this.ensureTabStillValid();
      },
    },
  },

  methods: {
    // ✅ Type normalization only for decision making (schema stays untouched)
    getFieldType(field: any): string {
      const raw = field?.type;
      if (raw === null || raw === undefined || raw === "") return "text";

      const t = String(raw).trim().toLowerCase().replace(/-/g, "_");
      if (t === "note") return "note";
      if (t === "switch") return "switch";
      if (t === "select") return "select";
      if (t === "key_value" || t === "keyvalue") return "key_value";
      return "text";
    },

    ensureTabStillValid() {
      const exists = this.tabs.some((t: any) => t.value === this.tab);
      if (!exists) this.tab = "general";
    },

    async nextTab() {
      if (this.busy_save) return;
      if (!this.validateCurrentStep()) return;

      // ✅ Auto-save on Next:
      // - Create on first time (no id yet)
      // - Edit on subsequent steps
      // - No emits => parent won't close dialog
      // - Quiet => no toast spam
      const ok = await this.save({
        goMediaAfterCreate: false,
        silentEmit: true,
        quiet: true,
      });
      if (!ok) return;

      const i = this.tabs.findIndex((x: any) => x.value === this.tab);
      if (i >= 0 && i < this.tabs.length - 1) this.tab = this.tabs[i + 1].value;
    },

    prevTab() {
      const i = this.tabs.findIndex((x: any) => x.value === this.tab);
      if (i > 0) this.tab = this.tabs[i - 1].value;
    },

    validateCurrentStep(): boolean {
      if (this.tab !== "general") return true;

      try {
        const title = (this.form.title || "").trim();
        if (!title) throw new Error("Title is required.");
        if (!this.categoryId) throw new Error("Category is required.");
        return true;
      } catch (e: any) {
        this.form_error = e?.message || "Invalid step.";
        return false;
      }
    },

    normalizeLinks(v: any): string[] {
      if (!v || !Array.isArray(v)) return [];
      return v
        .map((x: any) => {
          if (typeof x === "string") return x.trim();
          if (x && typeof x === "object" && x.url) return String(x.url).trim();
          return "";
        })
        .filter((x: string) => x.length);
    },

    normalizeBadgeIds(v: any): number[] {
      if (Array.isArray(v)) {
        return v
          .map((x: any) => parseInt(String(x), 10))
          .filter((n: number) => Number.isFinite(n) && !Number.isNaN(n) && n > 0);
      }
      if (Array.isArray(v?.badges)) {
        return v.badges
          .map((b: any) => parseInt(String(b?.id || ""), 10))
          .filter((n: number) => Number.isFinite(n) && !Number.isNaN(n) && n > 0);
      }
      return [];
    },

    initForm(item: any | null) {
      const defaultCurrency = this.shop?.listing?.default_currency || this.shop?.currency || "";

      this.form_error = "";
      this.tab = "general";

      if (!item) {
        this.form = {
          category: null,

          company_id: null,
          badge_ids: [],

          title: "",
          slug: "",
          subtitle: "",
          description: "",

          status: null,

          price: null,
          price_to: null,
          currency: defaultCurrency,
          price_unit: "",

          country_code: "",
          city: "",
          address: "",
          lat: null,
          lng: null,

          tel: "",
          email: "",
          website: "",

          is_featured: false,

          links: [],
          opening_hours: [],

          listing_fields: {},
          category_fields: {},
          meta_extra: {},
        };
        return;
      }

      const meta =
        item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
          ? { ...item.meta }
          : {};

      this.form = {
        category: item.category || item.category_id || null,

        company_id: item.company_id ?? item.company?.id ?? null,
        badge_ids: Array.isArray(item.badge_ids) ? this.normalizeBadgeIds(item.badge_ids) : this.normalizeBadgeIds(item),

        title: item.title || "",
        slug: item.slug || "",
        subtitle: item.subtitle || "",
        description: item.description || "",

        status: item.status ?? null,

        price: item.price ?? null,
        price_to: item.price_to ?? null,
        currency: item.currency || defaultCurrency,
        price_unit: item.price_unit || "",

        country_code: item.country_code || "",
        city: item.city || "",
        address: item.address || "",
        lat: item.lat ?? null,
        lng: item.lng ?? null,

        tel: item.tel || "",
        email: item.email || "",
        website: item.website || "",

        is_featured: !!item.is_featured,

        links: this.normalizeLinks(item.links),
        opening_hours: Array.isArray(item.opening_hours) ? item.opening_hours : [],

        listing_fields: {},
        category_fields: {},
        meta_extra: meta,
      };

      this.rebuildMetaBuckets();
    },

    collectNamedKeys(schema: any[]): string[] {
      const out: string[] = [];
      (Array.isArray(schema) ? schema : []).forEach((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return;

        const name = f?.name ? String(f.name) : "";
        if (name) out.push(name);
      });
      return out;
    },

    rebuildMetaBuckets() {
      const combined: Record<string, any> = {
        ...(this.form.meta_extra || {}),
        ...(this.form.listing_fields || {}),
        ...(this.form.category_fields || {}),
      };

      const listingNames = this.collectNamedKeys(this.listingSchemaEffective);
      const categoryNames = this.collectNamedKeys(this.categorySchema);

      const nextCategory: Record<string, any> = {};
      categoryNames.forEach((k) => {
        if (combined[k] !== undefined) nextCategory[k] = combined[k];
      });

      const nextListing: Record<string, any> = {};
      listingNames.forEach((k) => {
        if (combined[k] !== undefined) nextListing[k] = combined[k];
      });

      const nextExtra: Record<string, any> = { ...combined };
      categoryNames.forEach((k) => delete nextExtra[k]);
      listingNames.forEach((k) => delete nextExtra[k]);

      this.form.category_fields = nextCategory;
      this.form.listing_fields = nextListing;
      this.form.meta_extra = nextExtra;
    },

    normalizeValueByField(field: any, value: any) {
      const type = this.getFieldType(field);

      if (type === "note") return undefined;
      if (type === "switch") return !!value;

      if (type === "select") {
        if (field?.multiple) {
          if (!Array.isArray(value)) return [];
          return value
            .map((x: any) => (x === null || x === undefined ? "" : String(x).trim()))
            .filter((x: string) => x.length);
        }

        const v = value === null || value === undefined ? null : String(value).trim();
        return v ? v : null;
      }

      if (type === "key_value") {
        let rows: any[] = [];

        if (Array.isArray(value)) rows = value;
        else if (value && typeof value === "object") rows = [value];
        else if (typeof value === "string") rows = [{ key: "", value }];
        else rows = [];

        const normalized = rows
          .map((r: any) => ({
            key: String(r?.key ?? "").trim(),
            value: String(r?.value ?? "").trim(),
          }))
          .filter((r: any) => r.key.length || r.value.length);

        return normalized.length ? normalized : null;
      }

      if (value === null || value === undefined) return null;
      if (Array.isArray(value) || (value && typeof value === "object")) return value;

      const v = String(value).trim();
      return v ? v : null;
    },

    buildMetaFromSchema(schema: any[], values: Record<string, any>) {
      const out: Record<string, any> = {};
      const src = values && typeof values === "object" ? values : {};

      (Array.isArray(schema) ? schema : []).forEach((f: any) => {
        const t = this.getFieldType(f);
        if (t === "note") return;

        const name = f?.name ? String(f.name) : "";
        if (!name) return;

        const val = this.normalizeValueByField(f, src[name]);
        if (val === undefined) return;

        out[name] = val;
      });

      return out;
    },

    buildFinalMetaPayload() {
      const listingMeta = this.buildMetaFromSchema(this.listingSchemaEffective, this.form.listing_fields);
      const categoryMeta = this.buildMetaFromSchema(this.categorySchema, this.form.category_fields);

      return {
        ...(this.form.meta_extra || {}),
        ...listingMeta,
        ...categoryMeta,
      };
    },

    validateForm() {
      const title = (this.form.title || "").trim();
      if (!title) throw new Error("Title is required.");
      if (!this.categoryId) throw new Error("Category is required.");
    },

    /**
     * Save item:
     * - Create on first call (no item id yet)
     * - Edit on subsequent calls
     * - Can optionally jump to media after create
     * - Can be silent (no emits) to keep dialog open
     * - Can be quiet (no toast spam)
     */
    async save(opts: SaveOptions = {}): Promise<boolean> {
      const shopId = this.shop?.id;
      if (!shopId) return false;

      const goMediaAfterCreate = !!opts.goMediaAfterCreate;
      const silentEmit = !!opts.silentEmit;
      const quiet = !!opts.quiet;

      this.form_error = "";

      try {
        (this.$refs.form as any)?.validate?.();
        this.validateForm();
      } catch (e: any) {
        this.form_error = e?.message || "Invalid form.";
        return false;
      }

      const payload: any = {
        title: (this.form.title || "").trim(),
        slug: (this.form.slug || "").trim() || null,

        company_id: this.form.company_id ? parseInt(String(this.form.company_id), 10) : null,
        badge_ids: Array.isArray(this.form.badge_ids) && this.form.badge_ids.length ? this.form.badge_ids : null,

        subtitle: (this.form.subtitle || "").trim() || null,
        description: (this.form.description || "").trim() || null,

        category_id: this.categoryId,
        status: this.form.status || null,

        price: this.form.price !== "" ? this.form.price : null,
        price_to: this.form.price_to !== "" ? this.form.price_to : null,
        currency: (this.form.currency || "").trim() || null,
        price_unit: (this.form.price_unit || "").trim() || null,

        country_code: (this.form.country_code || "").trim() || null,
        city: (this.form.city || "").trim() || null,
        address: (this.form.address || "").trim() || null,
        lat: this.form.lat !== "" ? this.form.lat : null,
        lng: this.form.lng !== "" ? this.form.lng : null,

        tel: (this.form.tel || "").trim() || null,
        email: (this.form.email || "").trim() || null,
        website: (this.form.website || "").trim() || null,

        is_featured: this.form.is_featured ? "1" : "0",

        links: Array.isArray(this.form.links) && this.form.links.length ? this.form.links : null,
        opening_hours: Array.isArray(this.form.opening_hours) && this.form.opening_hours.length ? this.form.opening_hours : null,

        meta: this.buildFinalMetaPayload(),
      };

      if (this.busy_save) return false;
      this.busy_save = true;

      const currentId = this.effectiveItemId;

      const request =
        this.IS_VENDOR_PANEL && this.vendorId
          ? (currentId
            ? axios.post(window.VAPI.POST_MY_VENDOR_LISTING_ITEM_EDIT(this.vendorId, currentId), payload)
            : axios.post(window.VAPI.POST_MY_VENDOR_LISTING_ITEM_ADD(this.vendorId), payload))
          : (currentId
            ? axios.post(window.API.POST_SHOP_LISTING_ITEM_EDIT(shopId, currentId), payload)
            : axios.post(window.API.POST_SHOP_LISTING_ITEM_ADD(shopId), payload));

      try {
        const { data } = await request;

        if (data?.error) {
          const msg = data.error_msg || "Failed to save item.";
          if (quiet) this.form_error = msg;
          else NotificationService.showErrorAlert(null, msg);
          return false;
        }

        const saved = data.item;
        if (!saved?.id) {
          const msg = "Invalid server response.";
          if (quiet) this.form_error = msg;
          else NotificationService.showErrorAlert(null, msg);
          return false;
        }

        const wasCreate = !currentId;

        if (wasCreate) {
          // ✅ Keep item inside editor so Media becomes available without closing
          this.created_item = saved;

          // Optional: keep UI consistent with backend generated values
          if (!this.form.slug && saved.slug) this.form.slug = saved.slug;
          if (!this.form.status && saved.status) this.form.status = saved.status;

          if (!silentEmit) this.$emit("add", saved);
          if (!quiet) NotificationService.showSuccessAlert(null, "Item created successfully.");
        } else {
          if (!silentEmit) this.$emit("edit", saved);
          if (!quiet) NotificationService.showSuccessAlert(null, "Item updated successfully.");
        }

        if (goMediaAfterCreate) {
          this.tab = "media";
        }

        return true;
      } catch (error: any) {
        if (quiet) {
          this.form_error = "Failed to save item.";
        } else {
          NotificationService.showLaravelError(error);
        }
        return false;
      } finally {
        this.busy_save = false;
      }
    },
  },
};
</script>

<style scoped></style>

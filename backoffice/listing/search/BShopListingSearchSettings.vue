<template>
  <v-card class="text-start h-100" flat>
    <u-loading-progress v-if="busy_save || busy_generate || busy_fields" />

    <v-card-text class="text-start position-relative pt-6">
      <!-- Overview -->
      <div class="widget-box mb-5">
        <u-widget-header :title="$t('shop_listing.search.title')" icon="search" />
        <v-list-subheader>
          {{ $t("shop_listing.search.subtitle") }}
        </v-list-subheader>
      </div>

      <v-alert
        v-if="error_text"
        type="error"
        variant="tonal"
        border="start"
        class="mb-4"
      >
        {{ error_text }}
      </v-alert>

      <!-- Location -->
      <div class="widget-box mb-5">
        <u-widget-header
          :title="$t('shop_listing.search.location_title')"
          icon="my_location"
        />
        <v-list-subheader>
          {{ $t("shop_listing.search.location_subtitle") }}
        </v-list-subheader>

        <u-smart-toggle
          v-model="form.location.enabled"
          :true-title="$t('global.commons.enable')"
          :false-title="$t('global.commons.disable')"
          :true-description="$t('shop_listing.search.location_enabled_true')"
          :false-description="$t('shop_listing.search.location_enabled_false')"
          false-gray
        />

        <div class="mt-4">
          <div class="font-weight-bold mb-1">
            {{ $t("shop_listing.search.radius_default") }}
          </div>

          <v-slider
            v-model="form.location.default_radius_km"
            :min="1"
            :max="maxRadiusSafe"
            :step="1"
            thumb-label="always"
            color="black"
            track-color="grey-lighten-3"
          />

          <small class="text-muted d-block">
            {{ $t("shop_listing.search.radius_default_hint") }}
          </small>
        </div>

        <div class="mt-4">
          <v-text-field
            v-model="form.location.max_radius_km"
            type="number"
            variant="underlined"
            :label="$t('shop_listing.search.radius_max')"
          />
          <small class="text-muted d-block">
            {{ $t("shop_listing.search.radius_max_hint") }}
          </small>
        </div>

        <div class="mt-4">
          <v-combobox
            v-model="form.location.options_km"
            variant="underlined"
            multiple
            chips
            clearable
            :label="$t('shop_listing.search.radius_options')"
            :hint="$t('shop_listing.search.radius_options_hint')"
            persistent-hint
            closableChips
          />

          <v-alert type="info" variant="tonal" class="mt-2 mb-0">
            Remove a chip to hide that radius option on the storefront search UI.
            If you remove all options, the radius dropdown will be hidden.
          </v-alert>
        </div>
      </div>

      <!-- Filters -->
      <div class="widget-box mb-5">
        <u-widget-header :title="$t('shop_listing.search.filters_title')" icon="tune">
          <template v-slot:actions>
            <v-btn variant="text" size="small" @click="addFilter">
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>

            <v-btn
              variant="text"
              size="small"
              :loading="busy_generate"
              @click="autoGenerate"
            >
              <v-icon start>auto_fix_high</v-icon>
              {{ $t("shop_listing.search.auto_generate") }}
            </v-btn>
          </template>
        </u-widget-header>

        <v-list-subheader>
          {{ $t("shop_listing.search.filters_subtitle") }}
        </v-list-subheader>

        <div v-if="!form.filters.length" class="text-muted">
          {{ $t("shop_listing.search.no_filters") }}
        </div>

        <div
          v-for="(f, idx) in form.filters"
          :key="`f_${idx}`"
          class="search-filter"
        >
          <div class="d-flex align-center justify-space-between gap-2 flex-wrap">
            <v-select
              v-model="f.key"
              :items="availableFieldKeys"
              variant="underlined"
              :label="$t('shop_listing.search.filter_field')"
              @update:modelValue="syncFilterFromField(idx)"
            />

            <v-btn
              icon
              variant="text"
              @click="removeFilter(idx)"
              title="Remove this filter"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </div>

          <div class="d-flex align-center justify-space-between gap-2 flex-wrap">
            <v-text-field
              v-model="f.label"
              variant="underlined"
              :label="$t('shop_listing.search.filter_label')"
              class="max-w-320"
            />

            <v-select
              v-model="f.type"
              :items="typeOptions"
              item-title="title"
              item-value="value"
              variant="underlined"
              :label="$t('shop_listing.search.filter_type')"
              class="max-w-220"
            />

            <u-smart-toggle
              v-model="f.multiple"
              :true-title="$t('shop_listing.search.multiple')"
              :false-title="$t('shop_listing.search.single')"
              false-gray
              class="ms-auto"
            />
          </div>

          <div v-if="f.type === 'key_value'" class="mt-2">
            <v-select
              v-model="f.kv_mode"
              :items="kvModeOptions"
              item-title="title"
              item-value="value"
              variant="underlined"
              :label="$t('shop_listing.search.kv_mode')"
              class="max-w-220"
            />
          </div>

          <div v-if="f.type === 'select'" class="mt-3">
            <v-combobox
              v-model="f.options"
              multiple
              chips
              clearable
              variant="underlined"
              :label="$t('shop_listing.search.filter_options')"
              :hint="$t('shop_listing.search.filter_options_hint')"
              persistent-hint
              closableChips
            />
          </div>

          <v-divider class="my-4" />
        </div>
      </div>

      <v-alert v-if="!IS_LISTING_ACTIVE" type="info" variant="tonal" border="start">
        {{ $t("shop_listing.search.requires_listing_active") }}
      </v-alert>
    </v-card-text>

    <v-card-actions>
      <s-widget-buttons :auto-fixed-position="true">
        <v-btn
          color="primary"
          size="x-large"
          variant="elevated"
          :loading="busy_save"
          :disabled="!shopId"
          @click="save"
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
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

type SearchFilterRow = {
  key: string;
  label: string | null;
  source: "meta";
  type: "select" | "switch" | "text" | "key_value";
  multiple: boolean;
  kv_mode: "key" | "value";
  options: string[];
};

export default {
  name: "BShopListingSearchSettings",
  inject: ["$shop"],
  components: { SWidgetButtons, USmartToggle, UWidgetHeader },

  data: () => ({
    busy_save: false,
    busy_generate: false,
    busy_fields: false,

    error_text: "",

    available_fields: [] as any[],

    // IMPORTANT: this is the DB column key name.
    search_settings: {
      text: { enabled: true, placeholder: "" },
      location: {
        enabled: false,
        default_radius_km: 10,
        max_radius_km: 50,
        // IMPORTANT: may be [] (means hide dropdown)
        options_km: [5, 10, 20, 50] as any[],
      },
      filters: [] as SearchFilterRow[],
    },
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopId(): number | null {
      const id = this.shop?.id ? parseInt(String(this.shop.id), 10) : 0;
      return id > 0 ? id : null;
    },

    IS_LISTING_ACTIVE(): boolean {
      return !!(this.shop?.listing?.is_active);
    },

    // Alias for template readability
    form(): any {
      return (this as any).search_settings;
    },

    availableFieldKeys(): any[] {
      return (this.available_fields || []).map((f: any) => ({
        title: `${f.title} (${f.key})`,
        value: f.key,
      }));
    },

    typeOptions(): any[] {
      return [
        { title: "select", value: "select" },
        { title: "switch", value: "switch" },
        { title: "text", value: "text" },
        { title: "key_value", value: "key_value" },
      ];
    },

    kvModeOptions(): any[] {
      return [
        { title: "use key", value: "key" },
        { title: "use value", value: "value" },
      ];
    },

    maxRadiusSafe(): number {
      const raw = this.form?.location?.max_radius_km ?? 50;
      const n = parseInt(String(raw), 10);
      if (!Number.isFinite(n) || Number.isNaN(n)) return 50;
      return Math.min(500, Math.max(1, n));
    },
  },

  watch: {
    // No re-fetch of settings. Just re-read from shop when it changes.
    "shop.listing.search_settings": {
      immediate: true,
      deep: true,
      handler() {
        this.initFromShop();
      },
    },

    // keep default radius within max
    "form.location.max_radius_km": {
      handler() {
        const max = this.maxRadiusSafe;
        const def = parseInt(String(this.form.location.default_radius_km ?? 10), 10) || 10;
        if (def > max) this.form.location.default_radius_km = max;
      },
    },
  },

  created() {
    // Settings are loaded from shop.listing.search_settings (no fetch).
    this.initFromShop();

    // We still need available_fields for filter picker.
    this.fetchAvailableFieldsOnce();
  },

  methods: {
    initFromShop() {
      const s = this.shop?.listing?.search_settings;

      // If no settings, keep current (do not force defaults repeatedly).
      if (!s || typeof s !== "object") return;

      const text = s.text && typeof s.text === "object" ? s.text : {};
      const loc = s.location && typeof s.location === "object" ? s.location : {};
      const filters = Array.isArray(s.filters) ? s.filters : [];

      // IMPORTANT: keep [] as []
      const opts = Array.isArray(loc.options_km) ? loc.options_km : [5, 10, 20, 50];

      this.search_settings = {
        text: {
          enabled: !!(text.enabled ?? true),
          placeholder: String(text.placeholder ?? ""),
        },
        location: {
          enabled: !!(loc.enabled ?? false),
          default_radius_km: Number(loc.default_radius_km ?? 10),
          max_radius_km: Number(loc.max_radius_km ?? 50),
          options_km: opts,
        },
        filters: Array.isArray(filters) ? filters : [],
      };
    },

    fetchAvailableFieldsOnce() {
      if (!this.shopId) return;
      if (this.busy_fields) return;
      if (Array.isArray(this.available_fields) && this.available_fields.length) return;

      this.busy_fields = true;

      // NOTE: This call should return available_fields. We ignore any "settings" in response.
      axios
        .get(window.API.GET_SHOP_LISTING_SEARCH(this.shopId))
        .then(({ data }) => {
          if (data?.error) return;
          this.available_fields = Array.isArray(data.available_fields) ? data.available_fields : [];
        })
        .catch((e) => {
          // silent; UI still works with manual keys
          NotificationService.showLaravelError(e);
        })
        .finally(() => (this.busy_fields = false));
    },

    normalizeRadiusOptions(): number[] {
      // Must always return array (may be empty)
      let arr: any[] = Array.isArray(this.form.location.options_km) ? this.form.location.options_km : [];

      arr = arr
        .map((x: any) => parseInt(String(x), 10))
        .filter((n: number) => Number.isFinite(n) && !Number.isNaN(n) && n > 0);

      arr = Array.from(new Set(arr)).sort((a, b) => a - b);

      const max = this.maxRadiusSafe;
      arr = arr.filter((n: number) => n <= max);

      // Keep empty if user cleared
      this.form.location.options_km = arr;

      return arr;
    },

    normalizeFiltersForSave(): SearchFilterRow[] {
      const out: SearchFilterRow[] = [];
      const list = Array.isArray(this.form.filters) ? this.form.filters : [];

      list.forEach((f: any) => {
        if (!f || typeof f !== "object") return;

        const key = String(f.key || "").trim();
        if (!key) return;

        const typeRaw = String(f.type || "select").trim();
        const type = (["select", "switch", "text", "key_value"].includes(typeRaw) ? typeRaw : "select") as any;

        const kvRaw = String(f.kv_mode || "key").trim();
        const kv_mode = (["key", "value"].includes(kvRaw) ? kvRaw : "key") as any;

        const label = String(f.label || "").trim();
        const multiple = !!f.multiple;

        const options = Array.isArray(f.options)
          ? Array.from(
            new Set(
              f.options
                .map((x: any) => String(x ?? "").trim())
                .filter((x: string) => x.length),
            ),
          )
          : [];

        out.push({
          key,
          label: label || null,
          source: "meta",
          type,
          multiple,
          kv_mode,
          options,
        });
      });

      return out;
    },

    buildSavePayload() {
      const max = this.maxRadiusSafe;

      const defaultRadius = Math.min(
        max,
        Math.max(1, parseInt(String(this.form.location.default_radius_km ?? 10), 10) || 10),
      );

      const options_km = this.normalizeRadiusOptions(); // may be []

      return {
        // ✅ DB column key name
        search_settings: {
          text: {
            enabled: !!this.form.text.enabled,
            placeholder: String(this.form.text.placeholder || "").trim() || null,
          },

          location: {
            enabled: !!this.form.location.enabled,
            default_radius_km: defaultRadius,
            max_radius_km: max,
            // IMPORTANT: keep empty array if user cleared it
            options_km,
          },

          filters: this.normalizeFiltersForSave(),
        },

        // Let backend auto-generate after save:
        auto_generate: true,
        generate: {
          scan_status: "published",
          max_options: 200,
        },
      };
    },

    // Keep current UX:
    addFilter() {
      this.form.filters.push({
        key: "",
        label: "",
        source: "meta",
        type: "select",
        multiple: true,
        kv_mode: "key",
        options: [],
      });
    },

    removeFilter(i: number) {
      this.form.filters.splice(i, 1);
    },

    syncFilterFromField(index: number) {
      const key = String(this.form.filters[index]?.key || "").trim();
      if (!key) return;

      const field = (this.available_fields || []).find((x: any) => String(x?.key || "") === key);
      if (!field) return;

      if (!this.form.filters[index].label) {
        this.form.filters[index].label = String(field.title || key);
      }

      const t = String(field.type || "").toLowerCase();
      if (t === "select") this.form.filters[index].type = "select";
      if (t === "switch") this.form.filters[index].type = "switch";
      if (t === "key_value") this.form.filters[index].type = "key_value";

      if (this.form.filters[index].multiple === null || this.form.filters[index].multiple === undefined) {
        this.form.filters[index].multiple = !!field.multiple;
      }
    },

    save() {
      if (!this.shopId) return;

      this.busy_save = true;
      this.error_text = "";

      let payload: any;
      try {
        payload = this.buildSavePayload();
      } catch (e: any) {
        this.error_text = e?.message || "Invalid form.";
        this.busy_save = false;
        return;
      }

      axios
        .post(window.API.POST_SHOP_LISTING_SEARCH_SAVE(this.shopId), payload)
        .then(({ data }) => {
          if (data?.error) {
            this.error_text = data.error_msg || "Failed to save search settings.";
            return;
          }

          // ✅ Update shop.listing in-place from returned listing (NO fetch)
          const listing = data?.listing || null;
          if (listing && this.shop) {
            if (this.shop.listing && typeof this.shop.listing === "object") {
              Object.assign(this.shop.listing, listing);
            } else {
              this.shop.listing = listing;
            }
          } else if (data?.search_settings && this.shop?.listing) {
            // Fallback (if backend returns only search_settings)
            this.shop.listing.search_settings = data.search_settings;
          }

          NotificationService.showSuccessAlert(null, "Search settings saved.");
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => (this.busy_save = false));
    },

    autoGenerate() {
      if (!this.shopId) return;

      this.busy_generate = true;
      this.error_text = "";

      axios
        .post(window.API.POST_SHOP_LISTING_SEARCH_GENERATE(this.shopId), {
          scan_status: "published",
          max_options: 200,
        })
        .then(({ data }) => {
          if (data?.error) {
            this.error_text = data.error_msg || "Failed to generate options.";
            return;
          }

          // update shop.listing in-place if returned
          const listing = data?.listing || null;
          if (listing && this.shop) {
            if (this.shop.listing && typeof this.shop.listing === "object") {
              Object.assign(this.shop.listing, listing);
            } else {
              this.shop.listing = listing;
            }
          } else if (data?.search_settings && this.shop?.listing) {
            this.shop.listing.search_settings = data.search_settings;
          } else if (data?.settings && this.shop?.listing) {
            // last fallback
            this.shop.listing.search_settings = data.settings;
          }

          NotificationService.showSuccessAlert(null, "Options generated.");
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => (this.busy_generate = false));
    },
  },
};
</script>

<style lang="scss" scoped>
.max-w-320 { max-width: 320px; }
.max-w-220 { max-width: 220px; }
.search-filter { padding-top: 6px; }
</style>

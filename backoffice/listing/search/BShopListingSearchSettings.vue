<template>
  <v-card class="text-start h-100" flat>
    <u-loading-progress v-if="busy_fetch || busy_save || busy_generate" />

    <v-card-text class="text-start position-relative pt-6">
      <!-- Overview -->
      <div class="widget-box mb-5">
        <u-widget-header :title="$t('shop_listing.search.title')" icon="search" />
        <v-list-subheader>
          {{ $t("shop_listing.search.subtitle") }}
        </v-list-subheader>
      </div>

      <v-alert v-if="error_text" type="error" variant="tonal" border="start" class="mb-4">
        {{ error_text }}
      </v-alert>

      <!-- Location -->
      <div class="widget-box mb-5">
        <u-widget-header :title="$t('shop_listing.search.location_title')" icon="my_location" />
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
            :max="form.location.max_radius_km"
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
          />
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

        <div v-for="(f, idx) in form.filters" :key="`f_${idx}`" class="search-filter">
          <div class="d-flex align-center justify-space-between gap-2 flex-wrap">

          <v-select
              v-model="f.key"
              :items="availableFieldKeys"
              variant="underlined"
              :label="$t('shop_listing.search.filter_field')"
              @update:modelValue="syncFilterFromField(idx)"
            />
            <v-btn icon variant="text" @click="removeFilter(idx)" title="Delete item from filters">
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

export default {
  name: "BShopListingSearchSettings",
  inject: ["$shop"],
  components: { SWidgetButtons, USmartToggle, UWidgetHeader },

  data: () => ({
    busy_fetch: false,
    busy_save: false,
    busy_generate: false,
    error_text: "",

    available_fields: [] as any[],

    form: {
      text: { enabled: true, placeholder: "" },
      location: {
        enabled: false,
        default_radius_km: 10,
        max_radius_km: 50,
        options_km: [5, 10, 20, 50] as any[],
      },
      filters: [] as any[],
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
  },

  watch: {
    "shop.id": {
      immediate: true,
      handler() {
        this.fetch();
      },
    },
  },

  methods: {
    fetch() {
      if (!this.shopId) return;

      this.busy_fetch = true;
      this.error_text = "";

      axios
        .get(window.API.GET_SHOP_LISTING_SEARCH(this.shopId))
        .then(({ data }) => {
          if (data?.error) {
            this.error_text = data.error_msg || "Failed to load search settings.";
            return;
          }

          this.available_fields = Array.isArray(data.available_fields) ? data.available_fields : [];

          const s = data.settings || null;
          if (s && typeof s === "object") {
            this.form = {
              text: {
                enabled: !!(s.text?.enabled ?? true),
                placeholder: String(s.text?.placeholder ?? ""),
              },
              location: {
                enabled: !!(s.location?.enabled ?? false),
                default_radius_km: Number(s.location?.default_radius_km ?? 10),
                max_radius_km: Number(s.location?.max_radius_km ?? 50),
                options_km: Array.isArray(s.location?.options_km) ? s.location.options_km : [5, 10, 20, 50],
              },
              filters: Array.isArray(s.filters) ? s.filters : [],
            };
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => (this.busy_fetch = false));
    },

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

      // If schema says select, set type to select (best UX)
      const t = String(field.type || "").toLowerCase();
      if (t === "select") this.form.filters[index].type = "select";
      if (t === "switch") this.form.filters[index].type = "switch";
      if (t === "key_value") this.form.filters[index].type = "key_value";

      // preserve multiple if already set; otherwise infer
      if (this.form.filters[index].multiple === null || this.form.filters[index].multiple === undefined) {
        this.form.filters[index].multiple = !!field.multiple;
      }
    },

    save() {
      if (!this.shopId) return;

      this.busy_save = true;
      this.error_text = "";

      axios
        .post(window.API.POST_SHOP_LISTING_SEARCH_SAVE(this.shopId), {
          settings: this.form,
        })
        .then(({ data }) => {
          if (data?.error) {
            this.error_text = data.error_msg || "Failed to save search settings.";
            return;
          }
          NotificationService.showSuccessAlert(null, "Search settings saved.");
          this.fetch();
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
          NotificationService.showSuccessAlert(null, "Options generated.");
          if (data.settings) {
            this.form.filters = Array.isArray(data.settings.filters) ? data.settings.filters : this.form.filters;
          }
        })
        .catch((e) => NotificationService.showLaravelError(e))
        .finally(() => (this.busy_generate = false));
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

.search-filter {
  padding-top: 6px;
}
</style>

<!--
  - Copyright (c) 2023. Selldone® Business OS™
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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card-text
    :class="
      modern
        ? 'b-category-filter-editor b-category-filter-editor--modern sd-modern-content text-start'
        : undefined
    "
  >
    <div
      :class="
        modern
          ? 'b-category-filter-editor__widget sd-modern-widget'
          : 'widget-box mb-5'
      "
    >
      <u-widget-header
        :title="$t('add_category.filter.title')"
        icon="filter_list"
        :class="{ 'sd-modern-form-header': modern }"
      ></u-widget-header>
      <v-list-subheader :class="{ 'b-category-filter-editor__help': modern }">
        {{ $t("add_category.filter.sub_title") }}
      </v-list-subheader>

      <!-- ███████████████████████████ Variants ███████████████████████████ -->
      <v-chip
        v-for="item in present_variants_in_filter"
        :key="item.value"
        :color="
          modern ? undefined : ignore.includes(item.value) ? '#aaa' : '#111'
        "
        :variant="modern || ignore.includes(item.value) ? 'outlined' : 'flat'"
        class="m-2"
        :class="{
          'b-category-filter-editor__dimension': modern,
          'b-category-filter-editor__dimension--active':
            modern && !ignore.includes(item.value),
        }"
        :title="
          modern ? undefined : 'Make this variant active/inactive in filter'
        "
        :aria-pressed="modern ? !ignore.includes(item.value) : undefined"
        @click="ignore.toggle(item.value)"
      >
        <v-icon class="me-2" start
          >{{ ignore.includes(item.value) ? "cancel" : "check_circle" }}
        </v-icon>

        <v-icon class="me-2">{{ item.icon }}</v-icon>
        {{ item.text }}
        <v-tooltip
          v-if="modern"
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
        >
          {{
            $t(
              ignore.includes(item.value)
                ? "global.commons.enable"
                : "global.commons.disable",
            )
          }}: {{ item.text }}
        </v-tooltip>
      </v-chip>

      <!-- ███████████████████████████ Spec List ███████████████████████████ -->

      <u-widget-header
        :title="$t('add_category.edit_filter.spec_input')"
        class="mt-5"
        icon="summarize"
        :class="{ 'sd-modern-form-header': modern }"
      ></u-widget-header>
      <v-list-subheader :class="{ 'b-category-filter-editor__help': modern }">
        {{ $t("add_category.filter.message") }}
      </v-list-subheader>
      <v-select
        v-model="selected_specs"
        :disabled="busy_get_specs"
        :items="spec_keys"
        :loading="busy_get_specs"
        :messages="$t('add_category.edit_filter.inputs.spec.message')"
        chips
        clearable
        closable-chips
        multiple
        :placeholder="$t('add_category.edit_filter.inputs.spec.placeholder')"
        variant="underlined"
        :class="{ 'b-category-filter-editor__multiple': modern }"
      >
      </v-select>

      <v-list-subheader
        :class="{
          'b-category-filter-editor__help b-category-filter-editor__manual':
            modern,
        }"
      >
        <div>
          <v-icon size="small">published_with_changes</v-icon>
          <span
            v-html="$t('add_category.edit_filter.manually_update_filters_tips')"
          ></span>
        </div>
      </v-list-subheader>
      <!-- ███████████████████████████ Preview / Details ███████████████████████████ -->

      <div v-for="item in suggested_list_presented" :key="'_' + item.value">
        <div class="s-filter-header">
          <v-icon size="small" style="color: currentColor">
            {{ item.icon }}
          </v-icon>
          <span class="mx-2">{{ item.text }}</span>
        </div>

        <v-row v-if="filters && filters[item.value]" no-gutters>
          <v-chip
            v-for="val in filters[item.value]"
            :key="val"
            class="ma-1"
            :class="{ 'b-category-filter-editor__value': modern }"
            size="small"
            variant="tonal"
          >
            <span v-if="item.value === 'colors'">
              <v-icon :color="val" start>brightness_1</v-icon>
              {{ coloName(val) }}</span
            >
            <template v-else>
              <u-variant-asset-image
                :size="16"
                :value="val"
                class="pen me-1"
              ></u-variant-asset-image>
              {{ val?.removeVariantAsset() }}
            </template>
          </v-chip>
        </v-row>
      </div>

      <template v-if="!ignore?.includes('price') && !busy_get_specs">
        <div class="s-filter-header">
          <v-icon size="small" style="color: currentColor">
            fa:fas fa-money-bill-wave-alt
          </v-icon>
          <span class="mx-2">{{ $t("add_category.edit_filter.price") }}</span>
        </div>
        <v-chip-group>
          <v-chip
            v-for="price in prices"
            :key="price.currency"
            class="mx-2"
            :color="modern ? undefined : '#fafafa'"
            :class="{ 'b-category-filter-editor__value': modern }"
            size="small"
          >
            <u-currency-icon
              :currency="price.currency"
              caption
              class="ms-n1"
              flag
            ></u-currency-icon>

            <span class="mx-1"
              ><small> {{ $t("add_category.edit_filter.min") }}: </small>
              <b>{{ FormatNumberCurrency(price.min, price.currency) }}</b></span
            >
            <span class="mx-1">
              <small>{{ $t("add_category.edit_filter.max") }}: </small>
              <b>{{ FormatNumberCurrency(price.max, price.currency) }}</b></span
            >

            {{ getCurrencyName(price.currency) }}
          </v-chip>
        </v-chip-group>
      </template>

      <v-fade-transition group hide-on-leave tag="div">
        <template v-for="item in selected_specs" :key="'__' + item">
          <div class="s-filter-header">
            <v-icon size="small" style="color: currentColor">
              arrow_drop_down
            </v-icon>

            {{ item }}
            <v-spacer></v-spacer>
            <v-btn
              class="ms-1"
              :class="{ 'sd-modern-icon-button': modern }"
              :color="modern ? undefined : 'red'"
              icon
              :title="
                modern ? undefined : 'Remove this spec from the filter list.'
              "
              :aria-label="
                modern ? `${$t('global.actions.delete')}: ${item}` : undefined
              "
              variant="text"
              @click="remove(selected_specs, item)"
            >
              <v-icon>close</v-icon>
              <v-tooltip
                v-if="modern"
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                :open-on-focus="true"
              >
                {{ $t("global.actions.delete") }}: {{ item }}
              </v-tooltip>
            </v-btn>
          </div>

          <v-chip-group v-if="filters && filters[item]">
            <v-chip
              v-for="val in filters[item]"
              :key="val"
              class="mx-2"
              :color="modern ? undefined : '#fafafa'"
              :class="{ 'b-category-filter-editor__value': modern }"
              size="small"
            >
              {{ val?.toString().limitWords(3) }}
            </v-chip>
          </v-chip-group>
        </template>
      </v-fade-transition>
    </div>
  </v-card-text>

  <v-card-actions
    :class="
      modern
        ? 'b-category-filter-editor b-category-filter-editor--modern sd-modern-content sd-modern-form-actions text-start'
        : undefined
    "
  >
    <div class="widget-buttons">
      <v-btn
        v-if="modern"
        :disabled="busy_edit || busy_get_specs"
        class="sd-modern-button"
        variant="outlined"
        @click="cancelFilters"
      >
        {{ $t("global.actions.cancel") }}
      </v-btn>
      <v-btn
        :loading="busy_edit"
        :disabled="modern && busy_get_specs"
        :class="{ 'sd-modern-button sd-modern-button--primary': modern }"
        color="primary"
        :size="modern ? undefined : 'x-large'"
        variant="elevated"
        @click="editCategoryFilter"
      >
        <v-icon start>save</v-icon>
        {{ $t("global.actions.save") }} /
        {{ $t("global.actions.regenerate") }}
      </v-btn>
    </div>
  </v-card-actions>
</template>

<script lang="ts">
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UVariantAssetImage from "../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BCategoryFilterEditor",
  mixins: [CurrencyMixin],

  components: { UCurrencyIcon, UVariantAssetImage },
  emits: ["edit-filters", "cancel"],
  props: {
    modern: Boolean,
    shop: {
      required: true,
      type: Object,
    },
    category: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    busy_get_specs: false,
    busy_edit: false,

    filters: null,
    spec_keys: [],

    selected_specs: [],

    ignore: [], // Ignored variants to show in filter
  }),
  computed: {
    suggested_list() {
      return [
        {
          value: "brands",
          text: this.$t("add_category.edit_filter.suggested_list.brand"),
          icon: "fa:fas fa-braille",
        },
        {
          value: "price",
          text: this.$t("global.commons.price"),
          icon: "price_change",
          force: true, // Always show
        },
        {
          value: "discount",
          text: this.$t("global.commons.discount"),
          icon: "local_offer",
          force: true, // Always show
        },
        {
          value: "original",
          text: this.$t("global.commons.original"),
          icon: "verified",
          force: true, // Always show
        },

        {
          value: "colors",
          text: this.$t(ProductVariants.color.name),
          icon: ProductVariants.color.icon,
        },
        {
          value: "styles",
          text: this.$t(ProductVariants.style.name),
          icon: ProductVariants.style.icon,
        },

        {
          value: "volumes",
          text: this.$t(ProductVariants.volume.name),
          icon: ProductVariants.volume.icon,
        },
        {
          value: "weights",
          text: this.$t(ProductVariants.weight.name),
          icon: ProductVariants.weight.icon,
        },

        {
          value: "packs",
          text: this.$t(ProductVariants.pack.name),
          icon: ProductVariants.pack.icon,
        },
        {
          value: "types",
          text: this.$t(ProductVariants.type.name),
          icon: ProductVariants.type.icon,
        },
      ];
    },
    present_variants_in_filter() {
      if (!this.filters) return [];
      return this.suggested_list.filter((item) => {
        return (
          item.force ||
          this.filters[item.value] ||
          this.ignore?.includes(
            item.value,
          ) /*Force to show variants in the ignore list!*/
        );
      });
    },
    prices() {
      if (!this.filters) return [];
      return this.filters.prices.filter((item) => item.currency);
    },

    suggested_list_presented() {
      if (!this.filters) return [];
      return this.suggested_list.filter((item) => this.filters[item.value]);
    },
  },

  watch: {
    filters(filters) {
      let _list = [];
      for (let prop in filters) {
        if (
          !this.suggested_list.some((item) => item.value === prop) &&
          prop !== "prices" &&
          prop !== "ignore"
        )
          _list.push(prop);
      }
      this.selected_specs = _list;
      this.ignore = filters?.ignore;
      if (!this.ignore || !Array.isArray(this.ignore)) this.ignore = [];
      else if (this.modern) this.ignore = [...this.ignore];
    },
  },

  created() {
    this.getCategoryFilter();
  },
  methods: {
    cancelFilters() {
      this.ignore = Array.isArray(this.filters?.ignore)
        ? [...this.filters.ignore]
        : [];
      this.selected_specs = Object.keys(this.filters || {}).filter(
        (key) =>
          !this.suggested_list.some((item) => item.value === key) &&
          key !== "prices" &&
          key !== "ignore",
      );
      this.$emit("cancel");
    },

    coloName(color) {
      return GetNameOfColor(color);
    },

    getCategoryFilter() {
      this.filters = this.category.filters;
      this.ignore = this.filters?.ignore;
      if (!this.ignore || !Array.isArray(this.ignore)) this.ignore = [];
      else if (this.modern) this.ignore = [...this.ignore];

      this.busy_get_specs = true;
      axios
        .get(
          window.API.GET_CATEGORY_FILTER(
            this.$route.params.shop_id,
            this.category.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.filters = data.filters;
            this.spec_keys = data.spec_keys;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_get_specs = false;
        });
    },

    editCategoryFilter() {
      this.busy_edit = true;

      axios
        .put(
          window.API.PUT_EDIT_CATEGORY_FILTER(this.shop.id, this.category.id),
          {
            list: this.selected_specs.map((i) => i.toString()),
            ignore: this.ignore,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.filters = data.filters;
            NotificationService.showSuccessAlert(
              null,
              this.$t("add_category.edit_filter.notifications.edit_success"),
            );
            this.$emit("edit-filters", data.filters);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s-filter-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: start;
}

.b-category-filter-editor--modern {
  padding: 0;

  .b-category-filter-editor__widget {
    padding: 23px;
    border-radius: 15px;
  }

  :deep(.sd-modern-form-header h2) {
    font-size: 17px;
    font-weight: 500;
    line-height: 24px;
  }

  .b-category-filter-editor__help {
    height: auto;
    min-height: 0;
    padding-inline: 0;
    margin-block: 0 18px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
    white-space: normal;

    :deep(.v-list-subheader__text) {
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
    }
  }

  .b-category-filter-editor__multiple {
    min-width: 0;
    font-family: inherit;

    :deep(.v-field__input) {
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 24px;
      letter-spacing: 0;
    }

    :deep(.v-field-label) {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0;
    }

    :deep(.v-field-label--floating) {
      font-size: 12px;
      line-height: 18px;
    }
  }

  .b-category-filter-editor__dimension {
    min-height: 37px;
    margin: 4px;
    font-size: 12px;
    border-color: var(--sd-modern-border);
    border-radius: 8px;
  }

  .b-category-filter-editor__dimension--active {
    border-color: rgb(var(--v-theme-primary));
  }

  .b-category-filter-editor__value {
    color: rgb(var(--v-theme-on-surface));
    background: var(--sd-modern-inset);
    font-size: 12px;
  }

  .b-category-filter-editor__manual {
    margin-block: 22px 14px;
  }

  .s-filter-header {
    gap: 7px;
    padding: 14px 0 8px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  @media (max-width: 760px) {
    .b-category-filter-editor__widget {
      padding: 19px;
    }
  }

  @media (max-width: 600px), (pointer: coarse) {
    .b-category-filter-editor__dimension {
      min-height: 44px;
    }
  }
}
</style>

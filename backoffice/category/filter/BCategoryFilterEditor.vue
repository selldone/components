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
  <v-card-text class="b-category-filter-editor text-start">
    <div class="b-category-filter-editor__content">
      <div v-if="!hideContext" class="b-category-filter-editor__context">
        <v-icon size="20" aria-hidden="true">filter_list</v-icon>
        <div>
          <h2 class="b-category-filter-editor__title">
            {{
              $t(
                category.id === "root"
                  ? "add_category.edit_filter.modern.root_title"
                  : "add_category.edit_filter.modern.category_title",
              )
            }}
          </h2>
          <span class="b-category-filter-editor__context-name">{{
            category.title || shop.title
          }}</span>
          <p>
            {{
              $t(
                category.id === "root"
                  ? "add_category.edit_filter.modern.root_scope"
                  : "add_category.edit_filter.modern.category_scope",
              )
            }}
          </p>
        </div>
      </div>

      <div v-if="load_error" class="sd-modern-notice" role="alert">
        <v-icon size="20" aria-hidden="true">info_outline</v-icon>
        <div class="sd-modern-notice__content">
          {{ $t("add_category.edit_filter.modern.load_error") }}
        </div>
        <v-btn
          class="sd-modern-button sd-modern-button--inline"
          variant="text"
          :disabled="busy_get_specs || busy_edit"
          @click="getCategoryFilter"
          >{{ $t("global.actions.refresh") }}</v-btn
        >
      </div>
      <v-progress-linear
        v-if="busy_get_specs"
        indeterminate
        :aria-label="$t('global.commons.loading')"
      />

      <section
        v-if="compact_empty"
        class="b-category-filter-editor__empty-state sd-modern-widget"
        :aria-labelledby="$.uid + '-empty-filters'"
      >
        <div class="b-category-filter-editor__empty-art" aria-hidden="true">
          <span
            class="b-category-filter-editor__empty-card b-category-filter-editor__empty-card--back"
          ></span>
          <span
            class="b-category-filter-editor__empty-card b-category-filter-editor__empty-card--front"
          >
            <v-icon size="24">inventory_2</v-icon>
            <span class="b-category-filter-editor__empty-line"></span>
            <span
              class="b-category-filter-editor__empty-line b-category-filter-editor__empty-line--short"
            ></span>
          </span>
          <span class="b-category-filter-editor__empty-funnel"
            ><v-icon size="23">filter_alt</v-icon></span
          >
        </div>
        <div class="b-category-filter-editor__empty-copy">
          <h2 :id="$.uid + '-empty-filters'">
            {{ $t("add_category.edit_filter.modern.compact_empty_title") }}
          </h2>
          <p class="b-category-filter-editor__help">
            {{ $t("add_category.edit_filter.modern.compact_empty_help") }}
          </p>
          <div
            class="b-category-filter-editor__empty-actions sd-modern-actions"
          >
            <v-btn
              v-if="!embedded"
              :disabled="busy_edit"
              class="sd-modern-button"
              variant="outlined"
              @click="cancelFilters"
              >{{ $t("global.actions.cancel") }}</v-btn
            >
            <v-btn
              :loading="busy_edit"
              :disabled="busy_edit"
              class="sd-modern-button sd-modern-button--primary"
              color="primary"
              variant="elevated"
              @click="editCategoryFilter"
            >
              <v-icon start aria-hidden="true">save</v-icon>
              {{ $t("add_category.edit_filter.modern.save_regenerate") }}
            </v-btn>
          </div>
        </div>
      </section>
      <template v-else>
        <section
          class="b-category-filter-editor__section sd-modern-widget"
          :aria-labelledby="$.uid + '-visible-filters'"
        >
          <h2 :id="$.uid + '-visible-filters'">
            {{ $t("add_category.edit_filter.modern.visible_title") }}
          </h2>
          <p class="b-category-filter-editor__help">
            {{ $t("add_category.edit_filter.modern.visible_help") }}
          </p>

          <!-- ███████████████████████████ Variants ███████████████████████████ -->
          <div
            v-if="read_ready && !present_variants_in_filter.length"
            class="b-category-filter-editor__empty"
            role="status"
          >
            <v-icon size="22" aria-hidden="true">filter_alt_off</v-icon>
            <div>
              <h3>
                {{ $t("add_category.edit_filter.modern.empty_variants_title") }}
              </h3>
              <p>
                {{ $t("add_category.edit_filter.modern.empty_variants_help") }}
              </p>
            </div>
          </div>
          <div v-else class="b-category-filter-editor__dimensions">
            <v-checkbox-btn
              v-for="item in present_variants_in_filter"
              :key="item.value"
              :model-value="!ignore.includes(item.value)"
              :disabled="!read_ready || busy_edit"
              :label="item.text"
              class="b-category-filter-editor__dimension"
              density="compact"
              @update:model-value="setDimensionEnabled(item.value, $event)"
            >
              <template #label>
                <v-icon
                  size="18"
                  class="b-category-filter-editor__dimension-icon"
                  aria-hidden="true"
                  >{{ item.icon }}</v-icon
                >
                <span>{{ item.text }}</span>
              </template>
            </v-checkbox-btn>
          </div>
        </section>

        <!-- ███████████████████████████ Spec List ███████████████████████████ -->
        <section
          class="b-category-filter-editor__section b-category-filter-editor__specs sd-modern-widget"
          :aria-labelledby="$.uid + '-technical-specifications'"
        >
          <h2 :id="$.uid + '-technical-specifications'">
            {{ $t("add_category.edit_filter.spec_input") }}
          </h2>
          <p class="b-category-filter-editor__help">
            {{ $t("add_category.edit_filter.modern.specs_help") }}
          </p>
          <div
            v-if="read_ready && !spec_keys.length"
            class="b-category-filter-editor__empty"
            role="status"
          >
            <v-icon size="22" aria-hidden="true">tune</v-icon>
            <div>
              <h3>
                {{ $t("add_category.edit_filter.modern.empty_specs_title") }}
              </h3>
              <p>
                {{ $t("add_category.edit_filter.modern.empty_specs_help") }}
              </p>
            </div>
          </div>
          <v-select
            v-model="selected_specs"
            :disabled="!read_ready || busy_edit"
            :items="spec_keys"
            :loading="busy_get_specs"
            :messages="$t('add_category.edit_filter.inputs.spec.message')"
            :aria-label="$t('add_category.edit_filter.spec_input')"
            :placeholder="
              $t('add_category.edit_filter.inputs.spec.placeholder')
            "
            :menu-props="{ contentClass: 'sd-modern-select-menu text-start' }"
            class="b-category-filter-editor__multiple sd-modern-underlined-field"
            chips
            clearable
            closable-chips
            multiple
            variant="underlined"
          />
        </section>

        <!-- ███████████████████████████ Preview / Details ███████████████████████████ -->
        <section
          class="b-category-filter-editor__section b-category-filter-editor__generated sd-modern-widget"
          :aria-labelledby="$.uid + '-generated-filter-values'"
        >
          <div class="b-category-filter-editor__heading">
            <h2 :id="$.uid + '-generated-filter-values'">
              {{ $t("add_category.edit_filter.modern.generated_title") }}
            </h2>
            <span class="b-category-filter-editor__saved">{{
              $t("add_category.edit_filter.modern.saved_output")
            }}</span>
          </div>
          <p class="b-category-filter-editor__help">
            {{ $t("add_category.edit_filter.modern.generated_help") }}
          </p>

          <div
            v-if="read_ready && !has_saved_values"
            class="b-category-filter-editor__empty"
            role="status"
          >
            <v-icon size="22" aria-hidden="true">manage_search</v-icon>
            <div>
              <h3>
                {{ $t("add_category.edit_filter.modern.empty_saved_title") }}
              </h3>
              <p>
                {{ $t("add_category.edit_filter.modern.empty_saved_help") }}
              </p>
            </div>
          </div>
          <div v-if="has_saved_values" class="b-category-filter-editor__groups">
            <details
              v-for="item in suggested_list_presented"
              :key="item.value"
              :open="item.value === 'brands' || item.value === 'price'"
              :data-filter-group="item.value"
              class="b-category-filter-editor__group"
            >
              <summary>
                <span>{{
                  item.value === "price"
                    ? $t("add_category.edit_filter.price")
                    : item.text
                }}</span>
                <span class="b-category-filter-editor__count">{{
                  item.value === "price"
                    ? prices.length
                    : filters[item.value].length
                }}</span>
                <v-icon
                  size="18"
                  class="b-category-filter-editor__chevron"
                  aria-hidden="true"
                  >expand_more</v-icon
                >
              </summary>
              <div
                v-if="item.value === 'price'"
                class="b-category-filter-editor__price-content"
              >
                <table class="b-category-filter-editor__prices" role="table">
                  <thead role="rowgroup">
                    <tr role="row">
                      <th scope="col" role="columnheader">
                        {{ $t("global.commons.currency") }}
                      </th>
                      <th scope="col" role="columnheader">
                        {{ $t("add_category.edit_filter.min") }}
                      </th>
                      <th scope="col" role="columnheader">
                        {{ $t("add_category.edit_filter.max") }}
                      </th>
                    </tr>
                  </thead>
                  <tbody role="rowgroup">
                    <tr
                      v-for="price in prices"
                      :key="price.currency"
                      role="row"
                    >
                      <td role="cell">
                        <div class="b-category-filter-editor__currency">
                          <u-currency-icon
                            :currency="price.currency"
                            small
                            flag
                          />
                          <bdi>{{ price.currency }}</bdi>
                        </div>
                      </td>
                      <td role="cell">
                        <span
                          class="b-category-filter-editor__price-label"
                          aria-hidden="true"
                          >{{ $t("add_category.edit_filter.min") }}</span
                        >
                        <bdi>{{
                          FormatNumberCurrency(price.min, price.currency)
                        }}</bdi>
                      </td>
                      <td role="cell">
                        <span
                          class="b-category-filter-editor__price-label"
                          aria-hidden="true"
                          >{{ $t("add_category.edit_filter.max") }}</span
                        >
                        <bdi>{{
                          FormatNumberCurrency(price.max, price.currency)
                        }}</bdi>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="b-category-filter-editor__values">
                <v-chip
                  v-for="val in filters[item.value]"
                  :key="val"
                  class="b-category-filter-editor__value"
                  label
                  size="small"
                  variant="flat"
                >
                  <template v-if="item.value === 'colors'">
                    <v-icon
                      :color="val"
                      size="14"
                      class="b-category-filter-editor__color"
                      aria-hidden="true"
                      >brightness_1</v-icon
                    >
                    <span class="b-category-filter-editor__value-label">{{
                      coloName(val)
                    }}</span>
                  </template>
                  <template v-else>
                    <u-variant-asset-image
                      :size="16"
                      :value="val"
                      class="pen"
                    />
                    <span class="b-category-filter-editor__value-label">{{
                      val?.removeVariantAsset()
                    }}</span>
                  </template>
                </v-chip>
              </div>
            </details>

            <details
              v-for="item in selected_specs"
              :key="'spec-' + item"
              class="b-category-filter-editor__group"
              :data-spec-group="item"
            >
              <summary>
                <span>{{ item }}</span>
                <span class="b-category-filter-editor__count">{{
                  filters?.[item]?.length || "—"
                }}</span>
                <v-icon
                  size="18"
                  class="b-category-filter-editor__chevron"
                  aria-hidden="true"
                  >expand_more</v-icon
                >
              </summary>
              <div
                v-if="filters?.[item]?.length"
                class="b-category-filter-editor__values"
              >
                <v-chip
                  v-for="val in filters[item]"
                  :key="val"
                  class="b-category-filter-editor__value"
                  label
                  size="small"
                  variant="flat"
                >
                  <span class="b-category-filter-editor__value-label">{{
                    val?.toString().limitWords(3)
                  }}</span>
                </v-chip>
              </div>
              <p v-else class="b-category-filter-editor__pending">
                {{ $t("add_category.edit_filter.modern.pending_values") }}
              </p>
            </details>
          </div>
        </section>
        <div v-if="embedded" class="b-category-filter-editor__inline-actions">
          <p>{{ $t("add_category.edit_filter.modern.save_scope") }}</p>
          <v-btn
            :loading="busy_edit"
            :disabled="!read_ready || busy_edit"
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            variant="elevated"
            @click="editCategoryFilter"
          >
            <v-icon start aria-hidden="true">save</v-icon
            >{{ $t("add_category.edit_filter.modern.save_regenerate") }}
          </v-btn>
        </div>
      </template>
    </div>
  </v-card-text>

  <v-card-actions
    v-if="!embedded && !compact_empty"
    class="b-category-filter-editor__actions text-start"
  >
    <div class="b-category-filter-editor__action-content sd-modern-actions">
      <v-btn
        :disabled="busy_edit || busy_get_specs"
        class="sd-modern-button"
        variant="outlined"
        @click="cancelFilters"
        >{{ $t("global.actions.cancel") }}</v-btn
      >
      <v-btn
        :loading="busy_edit"
        :disabled="!read_ready || busy_edit"
        class="sd-modern-button sd-modern-button--primary"
        color="primary"
        variant="elevated"
        @click="editCategoryFilter"
      >
        <v-icon start aria-hidden="true">save</v-icon>
        {{ $t("add_category.edit_filter.modern.save_regenerate") }}
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
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BCategoryFilterEditor",
  mixins: [CurrencyMixin],

  components: { UCurrencyIcon, UVariantAssetImage },
  emits: ["edit-filters", "cancel"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    category: {
      required: true,
      type: Object,
    },
    hideContext: Boolean,
    embedded: Boolean,
  },

  data: () => ({
    busy_get_specs: false,
    busy_edit: false,
    loaded: false,
    load_error: false,

    filters: null,
    spec_keys: [],

    selected_specs: [],

    ignore: [], // Ignored variants to show in filter
  }),
  computed: {
    read_ready() {
      return this.loaded && !this.busy_get_specs && !this.load_error;
    },
    has_saved_values() {
      return Object.entries(this.filters || {}).some(([key, value]) =>
        key === "prices"
          ? this.prices.length > 0
          : key !== "ignore" && Array.isArray(value) && value.length > 0,
      );
    },
    compact_empty() {
      return (
        this.read_ready &&
        !this.has_saved_values &&
        !this.spec_keys.length &&
        !this.selected_specs.length &&
        !this.present_variants_in_filter.some(
          (item) => !item.force && this.ignore.includes(item.value),
        )
      );
    },
    resolvedProductVariants() {
      const custom = ShopOptionsHelper.GetCustomVariants(this.shop);
      return Object.fromEntries(
        Object.entries(ProductVariants).map(([key, variant]) => [
          key,
          {
            ...variant,
            name: custom?.[key] ?? variant.name,
            icon: custom?.[key + "_icon"] ?? variant.icon,
          },
        ]),
      );
    },
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
          text: this.$t(this.resolvedProductVariants.color.name),
          icon: this.resolvedProductVariants.color.icon,
        },
        {
          value: "styles",
          text: this.$t(this.resolvedProductVariants.style.name),
          icon: this.resolvedProductVariants.style.icon,
        },

        {
          value: "volumes",
          text: this.$t(this.resolvedProductVariants.volume.name),
          icon: this.resolvedProductVariants.volume.icon,
        },
        {
          value: "weights",
          text: this.$t(this.resolvedProductVariants.weight.name),
          icon: this.resolvedProductVariants.weight.icon,
        },

        {
          value: "packs",
          text: this.$t(this.resolvedProductVariants.pack.name),
          icon: this.resolvedProductVariants.pack.icon,
        },
        {
          value: "types",
          text: this.$t(this.resolvedProductVariants.type.name),
          icon: this.resolvedProductVariants.type.icon,
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
      return (this.filters.prices || []).filter((item) => item.currency);
    },

    suggested_list_presented() {
      return this.suggested_list.filter((item) =>
        item.value === "price"
          ? !this.ignore.includes("price") && !this.busy_get_specs
          : this.filters?.[item.value],
      );
    },
  },

  watch: {
    filters() {
      this.resetDraft();
    },
  },

  created() {
    this.filters = this.category.filters;
    this.resetDraft();
    this.getCategoryFilter();
  },
  methods: {
    resetDraft() {
      this.ignore = Array.isArray(this.filters?.ignore)
        ? [...this.filters.ignore]
        : [];
      this.selected_specs = Object.keys(this.filters || {}).filter(
        (key) =>
          !this.suggested_list.some((item) => item.value === key) &&
          key !== "prices" &&
          key !== "ignore",
      );
    },

    cancelFilters() {
      this.resetDraft();
      this.$emit("cancel");
    },

    setDimensionEnabled(value, enabled) {
      if (!this.read_ready || this.busy_edit) return;
      this.ignore = enabled
        ? this.ignore.filter((item) => item !== value)
        : this.ignore.includes(value)
          ? this.ignore
          : [...this.ignore, value];
    },

    coloName(color) {
      return GetNameOfColor(color);
    },

    getCategoryFilter() {
      if (this.busy_get_specs || this.busy_edit) return;

      this.busy_get_specs = true;
      this.load_error = false;
      axios
        .get(
          window.API.GET_CATEGORY_FILTER(
            this.$route.params.shop_id,
            this.category.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.load_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.filters = data.filters;
            this.spec_keys = data.spec_keys;
            this.loaded = true;
          }
        })
        .catch((error) => {
          this.load_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_get_specs = false;
        });
    },

    editCategoryFilter() {
      if (!this.read_ready || this.busy_edit) return;
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
.b-category-filter-editor,
.b-category-filter-editor__actions {
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  font-weight: 400;
  line-height: 23px;
  letter-spacing: normal;
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.b-category-filter-editor.v-card-text {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  padding: 0 !important;
  overflow-y: auto;
}

.b-category-filter-editor {
  &__empty-state.sd-modern-widget {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    align-items: center;
    gap: 24px;
    padding: 28px;
    border-radius: 16px;
  }
  &__empty-copy {
    min-width: 0;
  }
  &__empty-actions {
    justify-content: flex-start;
    gap: 12px;
    margin-top: 20px;
  }
  &__empty-art {
    position: relative;
    width: 112px;
    height: 100px;
    color: var(--sd-modern-muted);
  }
  &__empty-card {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    width: 60px;
    height: 76px;
    padding: 12px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    &--back {
      inset-block-start: 6px;
      inset-inline-start: 12px;
      transform: rotate(-10deg);
    }
    &--front {
      inset-block-start: 14px;
      inset-inline-start: 26px;
    }
  }
  &__empty-line {
    width: 28px;
    height: 3px;
    border-radius: 2px;
    background: var(--sd-modern-border);
    &--short {
      width: 19px;
    }
  }
  &__empty-funnel {
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 12px;
    color: rgb(var(--v-theme-on-surface));
    background: rgb(var(--v-theme-surface));
  }
  @media (max-width: 540px) {
    &__empty-state.sd-modern-widget {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
      padding: 24px;
    }
  }
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: calc(100% - 48px);
    max-width: 808px;
    margin: 24px auto;
  }

  &__section.sd-modern-widget {
    min-width: 0;
    padding: 24px;
    border-radius: 16px;
    overflow: visible;
  }

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
    letter-spacing: normal;
  }

  &__context {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 0 4px 4px;
    > .v-icon {
      margin-block-start: 2px;
    }
    p {
      margin: 3px 0 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 20px;
    }
  }

  &__context-name {
    display: block;
    margin-block-start: 3px;
    font-size: 14px;
    line-height: 23px;
  }

  &__help {
    margin: 8px 0 0;
    color: var(--sd-modern-muted);
    font-size: 14px;
    line-height: 23px;
  }

  &__empty {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 20px;
    color: var(--sd-modern-muted);
    > .v-icon {
      flex: 0 0 auto;
      margin-top: 2px;
    }
    > div {
      min-width: 0;
    }
    h3 {
      margin: 0;
      color: rgb(var(--v-theme-on-surface));
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
    }
    p {
      margin: 4px 0 0;
      font-size: 13px;
      line-height: 21px;
    }
  }

  &__inline-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding-block: 4px;
    > p {
      flex: 1 1 240px;
      min-width: 0;
      margin: 0;
      color: var(--sd-modern-muted);
      font-size: 13px;
      line-height: 21px;
    }
    > .v-btn {
      flex: 0 0 auto;
      margin-inline-start: auto;
    }
  }

  &__dimensions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2px 28px;
    margin-block-start: 16px;
  }

  &__dimension {
    // Native selection controls name a grid area; these choices must auto-place independently.
    grid-area: auto;
    min-width: 0;
    min-height: 44px;
    :deep(.v-label) {
      min-height: 44px;
      opacity: 1;
      color: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 23px;
    }
  }

  &__dimension-icon {
    flex: 0 0 auto;
    margin-inline-end: 10px;
    color: var(--sd-modern-muted);
  }

  &__multiple {
    min-width: 0;
    margin-block-start: 12px;
    font-family: inherit;
    :deep(.v-field__input) {
      min-width: 0;
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 23px;
      letter-spacing: normal;
    }
    :deep(.v-select__selection),
    :deep(.v-chip) {
      max-width: 100%;
    }
    :deep(.v-chip__content) {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :deep(.v-messages) {
      font-size: 13px;
      line-height: 20px;
    }
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  &__saved,
  &__count {
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }

  &__groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 12px;
    margin-block-start: 16px;
  }

  &__group {
    min-width: 0;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    > summary {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 46px;
      padding: 10px 12px;
      list-style: none;
      font-size: 14px;
      font-weight: 500;
      line-height: 23px;
      > span:first-child {
        min-width: 0;
        overflow-wrap: anywhere;
      }
    }
    > summary::-webkit-details-marker {
      display: none;
    }
    > summary {
      border-radius: 9px;
    }
    > summary:hover {
      background: var(--sd-modern-inset);
    }
    &[open] > summary {
      border-end-start-radius: 0;
      border-end-end-radius: 0;
    }
    > summary:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
    }
    &[open] > summary .b-category-filter-editor__chevron {
      transform: rotate(180deg);
    }
  }

  &__count {
    margin-inline-start: auto;
  }
  &__chevron {
    flex: 0 0 auto;
  }

  &__values {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 0 12px 14px;
  }

  &__value.v-chip {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-width: 0;
    min-height: 24px;
    height: auto;
    padding: 2px 6px;
    border-radius: 5px;
    background: var(--sd-modern-inset);
    color: inherit;
    font-size: 13px;
    line-height: 20px;
    overflow: visible;
    :deep(.v-chip__content) {
      min-width: 0;
      gap: 4px;
      overflow: visible;
      white-space: normal;
    }
  }

  &__value-label {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &__color {
    flex: 0 0 auto;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.3);
    border-radius: 50%;
  }

  &__price-content {
    container: category-filter-price / inline-size;
    padding: 0 12px 14px;
  }
  &__price-label {
    display: none;
  }
  &__prices {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    line-height: 20px;
    th {
      padding: 0 0 6px;
      color: var(--sd-modern-muted);
      font-weight: 400;
      text-align: start;
    }
    td {
      padding: 3px 0;
      border-block-start: 1px solid var(--sd-modern-border);
    }
    th:not(:first-child),
    td:not(:first-child) {
      padding-inline-start: 10px;
      text-align: end;
      white-space: nowrap;
    }
  }

  &__currency {
    display: flex;
    align-items: center;
    gap: 6px;
    > bdi {
      min-width: 0;
    }
  }

  @container category-filter-price (max-width: 320px) {
    &__prices {
      display: block;
      thead {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      tbody {
        display: block;
      }
      tbody > tr {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px 12px;
        padding-block: 6px;
        border-block-start: 1px solid var(--sd-modern-border);
      }
      td,
      td:not(:first-child) {
        display: block;
        min-width: 0;
        padding: 0;
        border: 0;
        text-align: start;
        white-space: normal;
      }
      td:first-child {
        grid-column: 1 / -1;
      }
      bdi {
        display: block;
        overflow-wrap: anywhere;
      }
    }
    &__price-label {
      display: block;
      margin-block-end: 2px;
      color: var(--sd-modern-muted);
    }
    &__currency {
      > :first-child {
        flex: 0 0 auto;
      }
    }
  }

  &__pending {
    margin: 0;
    padding: 0 12px 14px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }

  &__actions.v-card-actions {
    flex: 0 0 auto;
    padding: 0;
    border-block-start: 1px solid var(--sd-modern-border);
    background: rgb(var(--v-theme-surface));
  }

  &__action-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
    max-width: 808px;
    margin-inline: auto;
    padding: 16px 24px;
  }

  @media (max-width: 600px) {
    &__content {
      width: calc(100% - 32px);
      margin-block: 16px;
    }
    &__section.sd-modern-widget {
      padding: 20px 16px;
    }
    &__dimensions,
    &__groups {
      grid-template-columns: minmax(0, 1fr);
    }
    &__action-content {
      padding: 16px;
    }
  }
}
</style>

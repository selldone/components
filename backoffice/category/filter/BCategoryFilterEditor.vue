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
  <v-card-text>
    <div class="widget-box mb-5">
      <s-widget-header
        :title="$t('add_category.filter.title')"
        icon="filter_list"
      ></s-widget-header>
      <v-list-subheader>
        {{ $t("add_category.filter.sub_title") }}
      </v-list-subheader>

      <!-- ███████████████████████████ Variants ███████████████████████████ -->
      <v-chip
        v-for="item in present_variants_in_filter"
        :key="item.value"
        :color="ignore.includes(item.value) ? '#aaa' : '#111'"
        :variant="ignore.includes(item.value) ? 'outlined' : 'flat'"
        class="m-2"
        title="Make this variant active/inactive in filter"
        @click="ignore.toggle(item.value)"
      >
        <v-icon class="me-2" start
          >{{ ignore.includes(item.value) ? "cancel" : "check_circle" }}
        </v-icon>

        <v-icon class="me-2">{{ item.icon }}</v-icon>
        {{ item.text }}
      </v-chip>

      <!-- ███████████████████████████ Spec List ███████████████████████████ -->

      <s-widget-header
        :title="$t('add_category.edit_filter.spec_input')"
        class="mt-5"
        icon="summarize"
      ></s-widget-header>
      <v-list-subheader>
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
      >
      </v-select>

      <v-list-subheader>
        <div>
          <v-icon size="small">published_with_changes</v-icon>
         <span v-html="$t('add_category.edit_filter.manually_update_filters_tips')"></span>
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
            color="#fafafa"
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
              color="red"
              icon
              title="Remove this spec from the filter list."
              variant="text"
              @click="remove(selected_specs, item)"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </div>

          <v-chip-group v-if="filters && filters[item]">
            <v-chip
              v-for="val in filters[item]"
              :key="val"
              class="mx-2"
              color="#fafafa"
              size="small"
            >
              {{ val?.toString().limitWords(3) }}
            </v-chip>
          </v-chip-group>
        </template>
      </v-fade-transition>
    </div>
  </v-card-text>

  <v-card-actions>
    <div class="widget-buttons">
      <v-btn
        :loading="busy_edit"
        color="primary"
        size="x-large"
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

<script>
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UVariantAssetImage from "../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";

export default {
  name: "BCategoryFilterEditor",
  components: { UCurrencyIcon, UVariantAssetImage },
  emits: ["edit-filters"],
  props: {
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
    },
  },

  created() {
    this.getCategoryFilter();
  },
  methods: {
    coloName(color) {
      return this.GetNameOfColor(color);
    },

    getCategoryFilter() {
      this.filters = this.category.filters;
      this.ignore = this.filters?.ignore;
      if (!this.ignore || !Array.isArray(this.ignore)) this.ignore = [];

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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.filters = data.filters;
            this.spec_keys = data.spec_keys;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.filters = data.filters;
            this.showSuccessAlert(
              null,
              this.$t("add_category.edit_filter.notifications.edit_success"),
            );
            this.$emit("edit-filters", data.filters);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
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
</style>

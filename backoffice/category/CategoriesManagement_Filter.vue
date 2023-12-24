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

    <div class="widget-box mb-5">

      <s-widget-header :title="$t('add_category.filter.title')" icon="filter_alt"></s-widget-header>
      <v-subheader>
        {{ $t("add_category.filter.sub_title") }}

      </v-subheader>



      <!-- ███████████████████████████ Variants ███████████████████████████ -->
    <v-chip
      v-for="item in present_variants_in_filter"
      :key="item.value"
      :color="ignore.includes(item.value) ? '#aaa' : 'success'"
      class="m-2"
      @click="ignore.toggle(item.value)"
      title="Make this variant active/inactive in filter"
      :outlined="ignore.includes(item.value)"
      :dark="!ignore.includes(item.value)"
      label

    >
      <span class="me-2">
        <v-icon left small>{{ item.icon }}</v-icon>
        {{ item.text }}
        <v-icon small right>{{
          ignore.includes(item.value) ? "cancel" : "check_circle"
        }}</v-icon>
      </span>
    </v-chip>
    <!-- ███████████████████████████ Spec List ███████████████████████████ -->

    <s-widget-header :title="$t('add_category.edit_filter.spec_input')" icon="summarize" class="mt-5"></s-widget-header>
      <v-subheader>
        {{ $t("add_category.filter.message") }}

      </v-subheader>
    <v-select
      v-model="list"
      :messages="$t('add_category.edit_filter.spec_input_message')"
      chips
      clearable
      multiple
      :items="spec_keys"
      :loading="busy_get_specs"
      :disabled="busy_get_specs"
      placeholder="Select specs to show in filter..."
    >
      <template v-slot:selection="{ item, selected }">
        <v-chip
          :input-value="selected"
          close
          color="#111"
          dark
          @click:close="removeChip(list, item)"
        >
          <span class="me-2">{{ item }}</span>
        </v-chip>
      </template>
    </v-select>

    <div class="widget-buttons mt-5">
      <v-btn
        depressed
        color="primary"
        x-large
        dark
        @click="editCategoryFilter"
        :loading="busy_edit"
      >
        <v-icon class="me-1">save</v-icon>
        {{ $t("global.actions.save") }} / {{ $t("global.actions.regenerate") }}
      </v-btn>
    </div>
    <v-subheader>
      <div>
        <v-icon small>published_with_changes</v-icon> <b>Important! </b> After
        changing products in a category, return here and click the
        save/regenerate button to refresh the filter.
      </div>
    </v-subheader>
    <!-- ███████████████████████████ Preview / Details ███████████████████████████ -->

    <hr />
    <div v-for="item in suggested_list_presented" :key="'_' + item.value">
      <div class="s-filter-header">
        <v-icon small style="color: currentColor">
          {{ item.icon }}
        </v-icon>
        <span class="mx-2">{{ item.text }}</span>
      </div>

      <v-chip-group v-if="filters && filters[item.value]" show-arrows>
        <v-chip
          v-for="val in filters[item.value]"
          :key="val"
          class="mx-2"
          color="#fafafa"
          small
        >
          <span v-if="item.value === 'colors'">
            <v-icon left :color="val">brightness_1</v-icon>
            {{ coloName(val) }}</span
          >
          <template v-else>
            <variant-asset-view
              :shop-id="category.shop_id"
              :value="val"
              class="pen me-1"
              :size="16"
            ></variant-asset-view>
            {{ val?.removeVariantAsset() }}</template
          >
        </v-chip>
      </v-chip-group>
    </div>

    <template v-if="!ignore?.includes('price') && !busy_get_specs">
      <div class="s-filter-header">
        <v-icon small style="color: currentColor">
          fas fa-money-bill-wave-alt
        </v-icon>
        <span class="mx-2">{{ $t("add_category.edit_filter.price") }}</span>
      </div>
      <v-chip-group>
        <v-chip
          v-for="price in prices"
          :key="price.currency"
          small
          class="mx-2"
          color="#fafafa"
        >
          <s-currency-icon
            :currency="price.currency"
            flag
            caption
          ></s-currency-icon>

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

    <div v-for="item in list" :key="'__' + item">
      <div class="s-filter-header">
        <v-icon small style="color: currentColor">
          arrow_drop_down
        </v-icon>

        {{ item }}
        <v-spacer></v-spacer>
        <v-btn icon color="red" @click="remove(list, item)" class="ms-1"
          ><v-icon>close</v-icon></v-btn
        >
      </div>

      <v-chip-group v-if="filters && filters[item]" show-arrows>
        <v-chip
          v-for="val in filters[item]"
          :key="val"
          class="mx-2"
          color="#fafafa"
          small
        >
          {{ val }}
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script>
import { ProductVariants } from "@core/enums/product/ProductVariants";
import VariantAssetView from "@components/ui/variant/VariantAssetView.vue";
import SCurrencyIcon from "@components/ui/currency/icon/SCurrencyIcon.vue";

export default {
  name: "CategoriesManagementFilter",
  components: { SCurrencyIcon, VariantAssetView },
  emits: ["edit-filters"],
  props: {
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

    list: [],

    ignore: [], // Ignored variants to show in filter
  }),
  computed: {
    suggested_list() {
      return [
        {
          value: "brands",
          text: this.$t("add_category.edit_filter.suggested_list.brand"),
          icon: "fas fa-braille",
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
            item.value
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
      this.list = _list;
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
            this.category.id
          )
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
          window.API.PUT_EDIT_CATEGORY_FILTER(
            this.$route.params.shop_id,
            this.category.id
          ),
          {
            list: this.list,
            ignore: this.ignore,
          }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.filters = data.filters;
            this.showSuccessAlert(
              null,
              this.$t("add_category.edit_filter.notifications.edit_success")
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

    removeChip(chips, item) {
      chips.splice(chips.indexOf(item), 1);
      chips = [...chips];
    },
  },
};
</script>

<style scoped lang="scss">
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

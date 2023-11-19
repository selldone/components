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
  <div>
    <!-- ███████████████████████████ Variants ███████████████████████████ -->

    <v-chip
      v-for="item in present_variants_in_filter"
      :key="item.value"
      :color="SaminColorDark"
      dark
      class="m-2"
    >
      <span class="me-2">
        <v-icon left>{{ item.icon }}</v-icon>
        {{ item.text }}
      </span>
    </v-chip>
    <!-- ███████████████████████████ Spec List ███████████████████████████ -->

    <v-select
      v-model="list"
      :label="$t('add_category.edit_filter.spec_input')"
      :messages="$t('add_category.edit_filter.spec_input_message')"
      chips
      clearable
      multiple
      :items="spec_keys"
      :loading="busy_get_specs"
      :disabled="busy_get_specs"
      class="my-3"
    >
      <template v-slot:selection="{ item, selected }">
        <v-chip
          :input-value="selected"
          close
          :color="SaminColorDark"
          dark
          @click:close="removeChip(list, item)"
        >
          <span class="me-2">{{ item }}</span>
        </v-chip>
      </template>
    </v-select>

    <div class="widget-buttons">
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
      <v-subheader>
        <v-icon small>
          {{ item.icon }}
        </v-icon>
        <span class="mx-2">{{ item.text }}</span>
      </v-subheader>

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
          <template v-else> <variant-asset-view :shop-id="category.shop_id" :value="val" class="pen me-1" :size="16"></variant-asset-view>  {{ val?.removeVariantAsset() }}</template>
        </v-chip>
      </v-chip-group>
    </div>

    <v-subheader>
      <v-icon small> fas fa-money-bill-wave-alt </v-icon>
      <span class="mx-2">{{ $t("add_category.edit_filter.price") }}</span>
    </v-subheader>
    <v-chip-group>
      <v-chip
        v-for="price in prices"
        :key="price.currency"
        small
        class="mx-2"
        color="#fafafa"
      >
        <currency-icon
            :currency="price.currency"
            flag
            caption
        ></currency-icon>


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

    <div v-for="item in list" :key="'__' + item">
      <v-subheader
        >{{ item }}
        <v-spacer></v-spacer>
        <v-btn icon color="red" @click="remove(list, item)" class="ms-1"
          ><v-icon>close</v-icon></v-btn
        >
      </v-subheader>

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
import CurrencyIcon from "@components/ui/currency/CurrencyIcon.vue";

export default {
  name: "CategoriesManagementFilter",
  components: {CurrencyIcon, VariantAssetView },

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
          value: "colors",
          text: this.$t("add_category.edit_filter.suggested_list.colors"),
          icon: ProductVariants.color.icon,
        },
        {
          value: "styles",
          text: this.$t("add_category.edit_filter.suggested_list.styles"),
          icon: ProductVariants.style.icon,
        },

        {
          value: "volumes",
          text: this.$t("add_category.edit_filter.suggested_list.volumes"),
          icon: ProductVariants.volume.icon,
        },
        {
          value: "weights",
          text: this.$t("add_category.edit_filter.suggested_list.weights"),
          icon: ProductVariants.weight.icon,
        },

        {
          value: "packs",
          text: this.$t("add_category.edit_filter.suggested_list.packs"),
          icon: ProductVariants.pack.icon,
        },
        {
          value: "types",
          text: this.$t("add_category.edit_filter.suggested_list.types"),
          icon: ProductVariants.type.icon,
        },
      ];
    },
    present_variants_in_filter() {
      if (!this.filters) return [];
      return this.suggested_list.filter((item) => {
        return this.filters[item.value];
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
    filters(val_filters) {
      let _list = [];
      for (let prop in val_filters) {
        if (
          !this.suggested_list.some((item) => item.value === prop) &&
          prop !== "prices"
        )
          _list.push(prop);
      }
      this.list = _list;
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

<style scoped></style>
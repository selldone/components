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
  <v-navigation-drawer
    v-model="drawer"
    :color="light ? '#fafafa' : SaminColorDarkDeep"
    :expand-on-hover="expandOnHover"
    :mini-variant="miniVariant"
    :width="300"
    :right="right"
    :dark="!light"
    hide-overlay
    floating
    :class="{
      'scrollable-element-dark': !light,
      'scrollable-element-light': light,
    }"
    :fixed="$vuetify.breakpoint.smAndDown"
    :absolute="$vuetify.breakpoint.mdAndUp"
    :height="
      $vuetify.breakpoint.mdAndDown ? 'calc(100% - 48px)' : 'calc(100% - 16px)'
    "
    class="s--storefront-products-filter-menu"
  >
    <v-list dense nav class="py-0">
      <v-list-item two-line>
        <v-list-item-avatar v-if="category_image">
          <img :src="category_image" />
        </v-list-item-avatar>

        <v-list-item-content class="text-start">
          <v-list-item-title>{{ category_title }}</v-list-item-title>
          <v-list-item-subtitle>{{
            category_description
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <v-treeview
        ref="treeview"
        :items="categories_item"
        dense
        hoverable
        color="accent"
        rounded
        item-text="title"
        class="text-start hover-smart-tree"
        item-key="id"
        return-object
        open-all
      >
        <template v-slot:label="{ item }">
          <p
            class="m-0 text-ellipsis"
            :class="{
              'pointer-pointer': !item.current,
              'amber--text font-weight-bold': item.current,
            }"
            @click="clickTreeView(item)"
          >
            <v-avatar v-if="item.icon" class="me-1" size="28" color="primary">
              <img :src="getShopImagePath(item.icon)" />
            </v-avatar>
            {{ item.title }}
          </p>
        </template>
      </v-treeview>

      <v-divider />

      <s-smart-toggle
        v-model="only_is_original"
        :true-title="$t('product_filter_menu.only_original')"
        false-gray
        true-icon="verified"
        :dark="!light"
      />

      <v-divider />

      <s-smart-toggle
        v-model="only_has_discount"
        :true-title="$t('product_filter_menu.only_has_discount')"
        false-gray
        true-icon="local_offer"
        :dark="!light"
      />

      <!-- =========================================== Price =========================================== -->
      <div v-if="max_price">
        <v-divider />

        <v-subheader class="pb-3">{{
          $t("product_filter_menu.price_range")
        }}</v-subheader>

        <v-range-slider
          v-model="price_range"
          :max="max_price"
          :min="min_price"
          hide-details
          class="align-center text-dark mt-5 mx-2"
          thumb-label="always"
          :tick-size="8"
          @end="onChangeFilter"
          @start="price_range_changed = true"
        >
          <template v-slot:thumb-label="">
            <v-icon small color="accent"> star </v-icon>
          </template>
        </v-range-slider>

        <v-layout row wrap>
          <v-flex xs6 class="p-2">
            {{ FormatNumberCurrency(price_range[0]) }}
            <br />
            <small>{{ GetUserSelectedCurrencyName() }}</small>
          </v-flex>
          <v-flex xs6 class="p-2">
            {{ FormatNumberCurrency(price_range[1]) }}
            <br />
            <small>{{ GetUserSelectedCurrencyName() }}</small>
          </v-flex>
        </v-layout>
      </div>
    </v-list>

    <!-- =========================================== Brands =========================================== -->

    <div v-if="brands && brands.length > 0">
      <v-divider />

      <v-subheader>
        <v-icon small> fas fa-braille </v-icon>
        <span class="mx-2">{{ $t("product_filter_menu.brands") }} </span>
      </v-subheader>
      <selection-list
        class="px-1"
        v-model="selected_brands"
        :list="brands"
        @change="onChangeFilter"
        :light="light"
      />
    </div>

    <!-- =========================================== Variants =========================================== -->

    <v-divider
      v-if="present_variants_in_filter && present_variants_in_filter.length > 0"
    />

    <div v-for="item in present_variants_in_filter" :key="item.code">
      <v-subheader>
        <v-icon small>
          {{ item.icon }}
        </v-icon>
        <span class="mx-2"> {{ $t(item.name) }}</span>
      </v-subheader>
      <selection-list
        class="px-1"
        v-model="selected_variants[item.code + 's']"
        :is-color="item.code === 'color'"
        :list="getList(item.code + 's')"
        @change="onChangeFilter"
        :light="light"
      />
    </div>

    <!-- =========================================== Specs =========================================== -->
    <v-divider v-if="other_filters && other_filters.length > 0" />

    <div v-for="item in other_filters" :key="item">
      <v-subheader>
        <span class="mx-2"> {{ item }}</span>
      </v-subheader>
      <selection-list
        class="px-1"
        v-model="selected_spec[item]"
        :list="getList(item)"
        @change="onChangeFilter"
        :light="light"
      />
    </div>

    <div style="min-height: 84px; height: 15vh" />
  </v-navigation-drawer>
</template>

<script>
import SelectionList from "@components/ui/select/SelectionList.vue";
import { ProductVariants } from "@core/enums/product/ProductVariants";
import SSmartToggle from "@components/smart/SSmartToggle.vue";

export default {
  name: "SStorefrontProductsFilterMenu",
  components: { SSmartToggle, SelectionList },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    value: {},
    folders: {},
    parentFolders: {},
  },

  data() {
    return {


      selected_spec: {},
      selected_variants: {},

      drawer: true,


      miniVariant: false,
      expandOnHover: false,
      background: false,

      // Tree view
      selection: [],
      selected_item_treeview: null,

      //Price
      price_range: [0, 50],
      price_range_changed: false,

      //Original
      only_is_original: false,

      //Discount
      only_has_discount: false,

      // Brands:
      selected_brands: [],


      reserved_names: ["prices", "brands"],

      update_values_time_ms: 0, // Prevent trigger by watcher!
    };
  },

  computed: {
    theme() {
      return this.getShop().theme;
    },

    light() {
      return this.theme?.light_filter;
    },
    right() {
      return this.$vuetify.rtl;
    },

    max_price() {
      if (!this.filters || !this.filters.prices) return null;

      let out = 0;

      this.filters.prices.forEach((item) => {
        const rate = this.getExchangeRateValue(
          this.getShop(),
          item.currency,
          this.GetUserSelectedCurrency().code,
          null
        );
        if (!rate) return;

        if (rate * item.max > out) out = rate * item.max;
      });

      return out;
    },
    min_price() {
      if (!this.filters || !this.filters.prices) return null;

      let out = 0;

      this.filters.prices.forEach((item) => {
        const rate = this.getExchangeRateValue(
          this.getShop(),
          item.currency,
          this.GetUserSelectedCurrency().code,
          null
        );
        if (!rate) return;

        if (rate * item.min < out) out = rate * item.min;
      });

      return out;
    },

    filters() {

      // Root category:
      if(!this.parentFolders){
        return this.shop.filters;
      }

      // In a category:
      if (!this.parentFolders?.filters) return null;
      return this.parentFolders.filters;
    },
    present_variants_in_filter() {
      if (!this.filters) return [];

      return Object.values(ProductVariants).filter((item) => {
        return !!this.filters[item.code + "s"]; // color -> colors  |  style -> styles  |  volume -> volumes  |  weight -> weights  |  pack -> packs  |  type -> types
      });
    },

    other_filters() {
      let out = [];
      for (let prop in this.filters) {
        if (
          !Object.values(ProductVariants).some(
            (item) => item.code + "s" === prop
          ) &&
          !this.reserved_names.includes(prop)
        )
          out.push(prop);
      }
      return out;
    },

    brands() {
      if (!this.parentFolders || !this.parentFolders.filters) return null;
      return this.parentFolders.filters.brands;
    },

    category_image() {
      if (!this.getShop()) return null;
      if (this.parentFolders) {
        return this.getShopImagePath(
          this.parentFolders.icon,
          this.IMAGE_SIZE_SMALL
        );
      }
      return this.getShopIcon(this.getShop().id);
    },

    category_title() {
      if (!this.getShop()) return null;

      if (this.parentFolders) {
        return this.parentFolders.title;
      }
      return this.getShop().title;
    },
    category_description() {
      if (!this.getShop()) return null;

      if (this.parentFolders) {
        return this.parentFolders.description;
      }
      return this.$t("product_filter_menu.main_shop_page");
    },

    categories_item() {
      let out = [];
      let parent_1,
        parent_2,
        parent_3,
        parent_4 = null;
      if (this.parentFolders) {
        if (this.parentFolders.parent) {
          if (this.parentFolders.parent.parent) {
            if (this.parentFolders.parent.parent.parent) {
              parent_1 = {
                id: -100,
                title: this.parentFolders.parent.parent.parent.title,
                name: this.parentFolders.parent.parent.parent.name,
                //  to: {query: {dir: this.parentFolders.parent.parent.parent.id}}
                to: {
                  name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                  params: {
                    category_name: this.parentFolders.parent.parent.parent.name,
                  },
                },
                icon: this.parentFolders.parent.parent.parent.icon,
              };
              out.push(parent_1);
            }

            parent_2 = {
              id: -101,
              title: this.parentFolders.parent.parent.title,
              name: this.parentFolders.parent.parent.name,
              //  to: {query: {dir: this.parentFolders.parent.parent.id}}
              to: {
                name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                params: {
                  category_name: this.parentFolders.parent.parent.name,
                },
              },
              icon: this.parentFolders.parent.parent.icon,
            };
            if (parent_1) parent_1.children = [parent_2];
            else out.push(parent_2);
          }

          parent_3 = {
            id: -102,
            title: this.parentFolders.parent.title,
            name: this.parentFolders.parent.name,
            //to: {query: {dir: this.parentFolders.parent.id}}
            to: {
              name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
              params: { category_name: this.parentFolders.parent.name },
            },
            icon: this.parentFolders.parent.icon,
          };

          if (parent_2) parent_2.children = [parent_3];
          else out.push(parent_3);
        }

        // Current category
        let children = [];
        if (this.folders) {
          let id = 0;
          this.folders.forEach((folder) => {
            children.push({
              id: id++,
              title: folder.title,
              name: folder.name,
              // to: {query: {dir: folder.id}}
              to: {
                name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                params: { category_name: folder.name },
              },
              icon: folder.icon,
            });
          });
        }

        parent_4 = {
          id: -103,
          title: this.parentFolders.title,
          name: this.parentFolders.name,
          children: children,
          //to: {query: {dir: this.parentFolders.id}},
          to: {
            name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
            params: { category_name: this.parentFolders.name },
          },
          current: true,
          icon: this.parentFolders.icon,
        };

        if (parent_3) parent_3.children = [parent_4];
        else out.push(parent_4);

        // Add home
      } else {
        // Current category: Home
        let children = [];
        if (this.folders) {
          let id = 0;
          this.folders.forEach((folder) => {
            children.push({
              id: id++,
              title: folder.title,
              name: folder.name,
              //to: {query: {dir: folder.id}}
              to: {
                name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                params: { category_name: folder.name },
              },
            });
          });
        }
        out.push({
          id: -200,
          title: this.$t("product_filter_menu.home"),
          name: "home",
          children: children,
          //to: {query: {dir: ''}}
          to: { name: window.$storefront.routes.SHOP_PAGE },
        });
      }

      return out;
    },
  },
  watch: {
    drawer(val) {
      this.$emit("input", val);
    },

    value(val) {
      this.drawer = val;
    },

    parentFolders() {
      this.change_not_user = new Date().getTime();

      (this.price_range_changed = false), (this.selected_spec = {});
      this.selected_variants = {};
      this.selected_brands = [];
      this.only_is_original = false;
      this.only_has_discount = false;
      this.price_range = [this.min_price, this.max_price];

      this.$nextTick(function () {
        this.$refs.treeview.updateAll(true);
      });
    },

    only_is_original() {
      this.onChangeFilter();
    },

    only_has_discount() {
      this.onChangeFilter();
    },
    price_range() {
      ///////   this.onChangeFilter();
    },

    /*
                        selected: {
                            handler: function (val) {
                                this.onChangeFilter();
                            },
                            deep: true
                        },*/
  },

  created() {
    this.change_not_user = new Date().getTime();
    this.drawer = this.value;
    this.price_range = [this.min_price, this.max_price];

    // Load from route query:
    if (this.$route.query?.filter) {
      try {
        const filter = JSON.parse(this.$route.query.filter);
        // console.log('filter-->',filter)
        if (filter.only_is_original)
          this.only_is_original = filter.only_is_original;
        if (filter.only_has_discount)
          this.only_has_discount = filter.only_has_discount;
        //if(filter.prices)this.prices=filter.prices;
        if (filter.brands) this.selected_brands = filter.brands;
        if (filter.selected_spec) this.selected_spec = filter.selected_spec;
        if (filter.selected_variants)
          this.selected_variants = filter.selected_variants;
      } catch (e) {
        console.error(e);
      }
    }
  },
  methods: {
    onChangeFilter() {
      const now = new Date().getTime();
      if (now - this.change_not_user < 500) {
        return;
      }

      //console.log('------onChangeFilter-------')
      this.$nextTick(() => {
        this.$emit("change-filter", {
          only_is_original: this.only_is_original,
          only_has_discount: this.only_has_discount,

          prices: this.price_range_changed ? this.getPrices() : null,

          brands: this.selected_brands,
          selected_spec: this.selected_spec,
          selected_variants: this.selected_variants,
        });
      });
    },
    getPrices() {
      if (!this.filters || !this.filters.prices) return null;

      let prices = {};

      this.filters.prices.forEach((item) => {
        // console.log("*** item",item)

        const rate = this.getExchangeRateValue(
          this.getShop(),
          this.GetUserSelectedCurrency().code,
          item.currency,
          null
        );
        //if (!rate) return;
        // console.log("*** rate",rate)

        prices[item.currency] = [
          this.price_range[0] * rate,
          this.price_range[1] * rate,
        ];
      });

      //   console.log("*** prices",prices)

      return prices;
    },

    getList(name) {
      if (!this.parentFolders || !this.parentFolders.filters) return null;
      let out = this.parentFolders.filters[name];

      if (!out) return null;
      if (!Array.isArray(out)) {
        out = Object.values(out); // If some values is null or empty string filter list returned as object! this line re convert its to array.
      }
      return out.filter(Boolean); // Remove empty values!
    },

    coloName(color) {
      return this.GetNameOfColor(color);
    },

    clickTreeView(item) {
      if (item.current) return;
      if (item && item.to) {
        this.$router.push(item.to);
      }
      // console.log(list)
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-products-filter-menu {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-products-filter-menu{

}
</style>

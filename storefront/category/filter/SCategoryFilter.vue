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
    :absolute="true"
    :class="{
      'scrollable-element-dark': !light,
      'scrollable-element-light': light,
      '-dark': !light,
    }"
    :color="light ? '#fafafa' : ThemeColorDeepDark"
    :expand-on-hover="expandOnHover"
    :floating="!$vuetify.display.smAndDown"
    :rail="miniVariant"
    :right="right"
    :scrim="$vuetify.display.smAndDown"
    :style="{
      height: $vuetify.display.mdAndDown
        ? 'calc(100% - 48px)'
        : 'calc(100% - 16px)',
    }"
    :theme="light ? 'light' : 'dark'"
    :width="300"
    class="s--storefront-products-filter-menu"
    disable-route-watcher
    elevation="0"
    temporary
  >
    <div ref="list_container">
      <v-list class="py-0 text-start" density="compact" nav>
        <v-list-item lines="two">
          <template v-slot:prepend>
            <v-avatar v-if="category_image">
              <v-img :src="category_image" />
            </v-avatar>
          </template>

          <v-list-item-title>{{ category_title }}</v-list-item-title>
          <v-list-item-subtitle
            >{{ category_description }}
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-list-item-action end>
              <v-btn :size="48" icon variant="plain" @click="drawer = false">
                <v-icon>close</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>

        <v-treeview
          v-if="
            categories_item?.length > 1 ||
            categories_item?.some((item) => item.children?.length > 0)
          "
          ref="treeview"
          :items="categories_item"
          class="text-start hover-smart-tree pt-0"
          density="comfortable"
          hoverable
          item-title="title"
          item-value="id"
          open-all
          open-strategy="multiple"
        >
          <template v-slot:title="{ item, props }">
            <div
              :class="{
                'pointer-pointer': !item.current,
                'font-weight-bold': item.current,
              }"
              class="text-ellipsis"
              v-bind="props"
              @click.stop="clickTreeView(item)"
            >
              <v-avatar v-if="item.icon" class="me-1" color="primary" size="28">
                <v-img :src="getShopImagePath(item.icon)" />
              </v-avatar>
              {{ item.title }}
            </div>
          </template>
        </v-treeview>

        <template v-if="!ignore?.includes('original')">
          <v-divider class="-divider" />
          <u-smart-toggle
            v-model="only_is_original"
            :dark="!light"
            :true-title="$t('product_filter_menu.only_original')"
            false-gray
            true-icon="verified"
          />
        </template>

        <template v-if="!ignore?.includes('discount')">
          <v-divider class="-divider" />

          <u-smart-toggle
            v-model="only_has_discount"
            :dark="!light"
            :true-title="$t('product_filter_menu.only_has_discount')"
            false-gray
            true-icon="local_offer"
          />
        </template>
        <!-- =========================================== Price =========================================== -->
        <div v-if="!ignore?.includes('price') && max_price">
          <v-divider class="-divider" />

          <div class="s-filter-header">
            {{ $t("product_filter_menu.price_range") }}
          </div>

          <v-range-slider
            v-model="price_range"
            :max="max_price"
            :min="min_price"
            :step="1"
            :tick-size="8"
            class="align-center text-dark mt-5 mx-4"
            hide-details
            thumb-label
            @end="onChangeFilter"
            @start="price_range_changed = true"
          >
            <template v-slot:thumb-label="{ modelValue }">
              <u-price :amount="modelValue" compact></u-price>
            </template>
          </v-range-slider>

          <v-row class="text-center">
            <v-col class="p-2" cols="6">
              <u-price :amount="price_range[0]"></u-price>
            </v-col>
            <v-col class="p-2" cols="6">
              <u-price :amount="price_range[1]"></u-price>
            </v-col>
          </v-row>
        </div>
      </v-list>

      <!-- =========================================== Brands =========================================== -->

      <div v-if="brands && brands.length > 0">
        <v-divider class="-divider mx-2" />

        <div class="s-filter-header">
          <v-icon style="color: currentColor"> fa:fas fa-braille</v-icon>
          <span class="mx-2">{{ $t("product_filter_menu.brands") }} </span>
        </div>
        <s-category-filter-selector
          v-model="selected_brands"
          :light="light"
          :list="brands"
          class="px-1"
          @change="onChangeFilter"
        />
      </div>

      <!-- =========================================== Variants =========================================== -->

      <v-divider
        v-if="
          present_variants_in_filter && present_variants_in_filter.length > 0
        "
        class="-divider mx-2"
      />

      <div v-for="item in present_variants_in_filter" :key="item.code">
        <div class="s-filter-header">
          <v-icon style="color: currentColor">
            {{ item.icon }}
          </v-icon>
          <span class="mx-2"> {{ $t(item.name) }}</span>
          <v-spacer></v-spacer>
          <v-btn
            v-if="selected_variants[item.code + 's']"
            :title="`Reset filter: ${$t(item.name)}`"
            icon
            size="small"
            variant="text"
            @click="selected_variants[item.code + 's'] = []"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </div>
        <s-category-filter-selector
          v-model="selected_variants[item.code + 's']"
          :is-color="item.code === 'color'"
          :light="light"
          :list="getList(item.code + 's')"
          class="px-1"
          @change="onChangeFilter"
        />
      </div>

      <!-- =========================================== Specs =========================================== -->
      <v-divider
        v-if="other_filters && other_filters.length > 0"
        class="-divider mx-2"
      />

      <div v-for="item in other_filters" :key="item">
        <div class="s-filter-header">
          <v-icon style="color: currentColor"> arrow_drop_down</v-icon>

          <span class="mx-2"> {{ item }}</span>

          <v-spacer></v-spacer>
          <v-btn
            v-if="selected_spec[item]"
            :title="`Reset filter: ${$t(item)}`"
            icon
            size="small"
            variant="text"
            @click="selected_spec[item] = []"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </div>
        <s-category-filter-selector
          v-model="selected_spec[item]"
          :light="light"
          :list="getList(item)"
          class="px-1"
          @change="onChangeFilter"
        />
      </div>

      <div style="min-height: 84px; height: 15vh" />
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import SCategoryFilterSelector from "../../../storefront/category/filter/selector/SCategoryFilterSelector.vue";
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import USmartToggle from "../../../ui/smart/toggle/USmartToggle.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import { GetNameOfColor } from "@selldone/core-js/helper";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

/**
 *
 */
export default {
  name: "SCategoryFilter",
  mixins: [TemplateMixin,CurrencyMixin],

  components: { UPrice, USmartToggle, SCategoryFilterSelector },
  emits: ["change-filter", "change-height", "update:modelValue"],
  inject: ["$shop"],
  props: {
    modelValue: {},
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

      reserved_names: ["prices", "brands", "ignore"],

      update_values_time_ms: 0, // Prevent trigger by watcher!

      cal_height: null,
    };
  },

  computed: {
    theme() {
      return this.$shop.theme;
    },

    light() {
      return this.theme?.light_filter;
    },
    right() {
      return this.$vuetify.locale.isRtl;
    },

    max_price() {
      if (!this.filters || !this.filters.prices) return null;

      let out = 0;

      this.filters.prices.forEach((item) => {
        const rate = this.getExchangeRateValue(
          this.$shop,
          item.currency,
          this.GetUserSelectedCurrency().code,
          null,
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
          this.$shop,
          item.currency,
          this.GetUserSelectedCurrency().code,
          null,
        );
        if (!rate) return;

        if (rate * item.min < out) out = rate * item.min;
      });

      return out;
    },

    filters() {
      // Root category:
      if (!this.parentFolders) {
        return this.$shop.filters;
      }

      // In a category:
      return this.parentFolders?.filters;
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
            (item) => item.code + "s" === prop,
          ) &&
          !this.reserved_names.includes(prop)
        )
          out.push(prop);
      }
      return out;
    },

    brands() {
      return this.filters?.brands;
    },
    ignore() {
      return this.filters?.ignore;
    },
    category_image() {
      if (!this.$shop) return null;
      if (this.parentFolders) {
        return this.getShopImagePath(
          this.parentFolders.icon,
          this.IMAGE_SIZE_SMALL,
        );
      }
      return this.getShopIcon(this.$shop.id);
    },

    category_title() {
      if (!this.$shop) return null;

      if (this.parentFolders) {
        return this.parentFolders.title;
      }
      return this.$shop.title;
    },
    category_description() {
      if (!this.$shop) return null;

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
            if (
              folder.categories > 0 ||
              folder.products > 0 ||
              folder.products === undefined /*Not set!*/
            ) {
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
            }
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
            if (
              folder.categories > 0 ||
              folder.products > 0 ||
              folder.products === undefined /*Not set!*/
            ) {
              children.push({
                id: id++,
                title: folder.title,
                icon: folder.icon,
                name: folder.name,
                //to: {query: {dir: folder.id}}
                to: {
                  name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
                  params: { category_name: folder.name },
                },
              });
            }
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
      this.$emit("update:modelValue", val);
    },

    modelValue(val) {
      this.drawer = val;
    },

    parentFolders() {
      this.change_not_user = new Date().getTime();

      this.price_range_changed = false;
      this.selected_spec = {};
      this.selected_variants = {};
      this.selected_brands = [];
      this.only_is_original = false;
      this.only_has_discount = false;
      this.price_range = [this.min_price, this.max_price];

      /* this.$nextTick(function () {
         this.$refs.treeview.updateAll(true);
       });*/

      // Watch a reactive property that changes when the content changes
      this.$nextTick(() => {
        this.updateHeight();
      });
    },

    only_is_original() {
      this.onChangeFilter();
    },

    only_has_discount() {
      this.onChangeFilter();
    },
  },

  created() {
    this.change_not_user = new Date().getTime();
    this.drawer = this.modelValue;
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
          this.$shop,
          this.GetUserSelectedCurrency().code,
          item.currency,
          null,
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
      if (!this.filters) return null;
      let out = this.filters[name];

      if (!out) return null;
      if (!Array.isArray(out)) {
        out = Object.values(out); // If some values is null or empty string filter list returned as object! this line re convert its to array.
      }
      return out.filter(Boolean); // Remove empty values!
    },

    coloName(color) {
      return GetNameOfColor(color);
    },

    clickTreeView(item) {
      if (item.current) return;
      if (item && item.to) {
        this.$router.push(item.to);
      }
      // console.log(list)
    },

    updateHeight() {
      this.cal_height = this.$refs.list_container?.clientHeight;
      if (!this.cal_height) return;
      this.$emit("change-height", this.cal_height);
      //console.debug("Filter menu height", this.cal_height);
    },
  },
  mounted() {
    this.updateHeight();
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-products-filter-menu {
  .-divider {
    --v-border-opacity: 0.5;
    margin: 8px 0;
  }

  &.-dark {
    .-divider {
      border-color: #fff;
      --v-border-opacity: 0.15;
    }
  }
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-products-filter-menu {
  .s-filter-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 1.2rem;
    font-weight: 600;
    text-align: start;
  }
}
</style>

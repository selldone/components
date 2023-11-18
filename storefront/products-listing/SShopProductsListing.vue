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

<template>
  <div>
    <!-- ████████████████████ Custom Page ███████████████████ -->
    <VuseRenderer
      v-if="parent_folders?.page"
      :data="parent_folders.page.content"
      :augment="parent_folders.augment"
      :style="parent_folders.page.background"
    />

    <!-- ███████████████████ Products & Categories List ███████████████████ -->
    <div
      class="s--products-list"
      :class="{
        rtl: $vuetify.rtl,
        'position-relative':
          parent_folders?.page /*Only in custom page mode! otherwise menu should fill top to buttom of window.*/,
      }"
    >
      <div>
        <!-- ━━━━━━━ Breadcrumbs ━━━━━━━ -->
        <v-expand-transition>
          <div
            v-if="
              hasBreadcrumb &&
              hierarchy_items.length > 1 &&
              $vuetify.breakpoint.smAndUp
            "
          >
            <s-breadcrumb-image
              :hierarchy-items="hierarchy_items"
              :class="
                $vuetify.breakpoint.mdAndUp
                  ? {
                      'add-marginal-side-menu-open':
                        show_filter_menu && has_filter,
                      'mx-2': !(show_filter_menu && has_filter),
                    }
                  : {}
              "
              class="flex-grow-1"
              style="max-width: inherit"
            />
          </div>
        </v-expand-transition>
        <v-toolbar
          v-if="hasBreadcrumb || has_filter"
          flat
          color="transparent"
          class="position-relative"
        >
          <!-- ━━━━━━━ Sort tools ━━━━━━━ -->
          <s-products-sort-view
            v-if="hasSort"
            class="w-100 overflow-x-auto"
            :class="{
              'add-marginal-side-menu-open':
                show_filter_menu && has_filter && $vuetify.breakpoint.smAndUp,
            }"
            v-model="sort"
            :only-available.sync="only_available"
            :has-view-mode="!freeMode /*Don't show view modes in map view!*/"
            :viewMode.sync="mode_view"
            :mandatory="false"
          >
            <!-- ............................ Categories > Small screen ............................ -->
            <v-btn
              v-if="$vuetify.breakpoint.xs && hierarchy_items.length > 1"
              text
              tile
              height="46px"
              @click="show_categories = !show_categories"
            >
              {{ $t("global.commons.category") }}
              <v-icon class="ms-1" x-small>expand_more</v-icon>
            </v-btn>
            <!-- .................................................................................... -->

            <v-spacer></v-spacer>

            <div style="min-width: 100px; height: 1px"></div>
            <v-btn
              class="border-start position-absolute bg-white"
              :style="$vuetify.rtl ? 'left: 0' : 'right: 0'"
              text
              tile
              height="46px"
              v-if="has_filter"
              absolute
              @click="show_filter_menu = !show_filter_menu"
              >{{ $t("shop.products_filter") }}
              <v-icon class="ms-1" small>{{
                show_filter_menu ? "close" : "filter_alt"
              }}</v-icon></v-btn
            >
          </s-products-sort-view>
        </v-toolbar>

        <!-- ............................ Categories > Small screen ............................ -->
        <v-expand-transition>
          <div
            v-if="
              $vuetify.breakpoint.xs &&
              hierarchy_items.length > 1 &&
              show_categories
            "
            class="border-between-vertical"
          >
            <v-list class="text-start">
              <v-list-item
                selectable
                v-for="(item, i) in hierarchy_items"
                :key="i"
                :to="item.disabled ? undefined : item.to"
                exact
                active-class="bg-primary white--text"
              >
                <v-list-item-avatar :tile="!!item.icon">
                  <img
                    v-if="item.image"
                    :src="getShopImagePath(item.image, IMAGE_SIZE_SMALL)"
                  />
                  <v-icon v-else-if="item.icon" class="me-1">{{
                    item.icon
                  }}</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-expand-transition>
        <!-- .................................................................................... -->

        <!-- -------------------------- Container -------------------------------- -->

        <v-container
          fluid
          class="products-container"
          :class="{
            'container-expanded-side-menu': show_filter_menu && has_filter,
            'p-3': !hasSelfeItemSpacing,
            'p-1': hasSelfeItemSpacing,
          }"
        >
          <v-fade-transition
            tag="v-row"
            group
            class="products-layout"
            hide-on-leave
            :style="{ '--insta-size': insta_size }"
            v-resize="onResize"
            :class="[
              class_row_products,
              align ? 'align-' + align : undefined,
              justify ? 'justify-' + justify : undefined,
            ]"
            :align="align"
            :justify="justify"
          >
            <!-- ⬬⬬⬬⬬ Folders ⬬⬬⬬⬬ -->

            <category-card
              v-for="category in folders"
              :key="'f' + category.id"
              class="flex m-0"
              :class="[class_items_categories]"
              :category="category"
              :to="
                viewOnly || window.ExternalWidget
                  ? undefined
                  : {
                      name: 'ShopCategoryPage',
                      params: { category_name: category.name },
                    }
              "
              v-bind="
                !viewOnly && window.ExternalWidget
                  ? { href: getCategoryLink(shop, category.name), target: '' }
                  : {}
              "
              :static="no_animation"
            />

            <v-spacer
              v-if="has_breaker"
              key="breaker"
              class="w-100 mt-16"
            ></v-spacer>
            <!-- ⬬⬬⬬⬬ Products ⬬⬬⬬⬬ -->

            <s-shop-product-card
              v-for="(product, index) in products"
              :key="product.id"
              class="flex"
              :class="[class_items_products]"
              :is-small="isSmallItem"
              :product="product"
              :to="
                viewOnly || window.ExternalWidget
                  ? undefined
                  : {
                      name: 'ProductPage',
                      params: {
                        product_id: product.id,
                      },
                    }
              "
              v-bind="
                !viewOnly && window.ExternalWidget
                  ? { href: getProductLink(shop, product.id), target: '' }
                  : {}
              "
              @click.native="onClickProduct(product, index)"
              :is-row="isRow"
              :quick-buy="hover_actions"
              @quick-buy="quickBuy(product)"
              :dense="show_filter_menu"
              :isInsta="isInsta"
              :static="no_animation"
              :rounded="freeMode"
              @mouseenter.native="$emit('product-hover:enter', product)"
              @mouseleave.native="$emit('product-hover:leave', product)"
            />

            <v-spacer
              v-if="!landingPageMode && !freeMode"
              key="space"
              :style="{ 'max-width': spacer_w }"
            ></v-spacer>
          </v-fade-transition>
        </v-container>

        <v-btn
          v-if="has_more"
          @click="fetchData(false, true)"
          v-intersect="onIntersect"
          :loading="busy_fetch"
          color="blue"
          text
          x-large
          class="m-3"
          >{{ remains_count }} {{ $t("global.actions.more") }}</v-btn
        >

        <product-filter-menu
          v-if="has_filter"
          v-model="show_filter_menu"
          class="product-filter-menu"
          :folders="folders"
          :parent-folders="parent_folders"
          @change-filter="setFilter"
          :style="{
            borderRadius: $vuetify.breakpoint.mdAndDown ? '32px' : '32px',
          }"
          :class="{
            'ms-2 mt-2': $vuetify.breakpoint.mdAndDown,
            'm-2': !$vuetify.breakpoint.mdAndDown,
          }"
        />
      </div>
      <!-- ██████████████████████ Dialog > Quick Buy ██████████████████████ -->

      <v-bottom-sheet
        v-if="hover_actions"
        v-model="quick_buy"
        max-width="1480px"
        :fullscreen="$vuetify.breakpoint.mdAndDown"
        scrollable
        content-class="no-shadow-dialog"
      >
        <v-card
          class="position-relative rounded-t-xl rounded-b-0 overflow-hidden"
        >
          <v-card-text class="pt-5 thin-scroll">
            <product-info-loading-view
              v-if="busy_fetch_product && !selected_product"
            ></product-info-loading-view>

            <template v-if="selected_product">
              <s-shop-product-main-card
                :product="selected_product"
                can-buy
                show-cover
                quick-buy-mode
              />

              <product-spec-view v-if="spec_array" :spec="spec_array" />
              <div class="min-height-10vh"></div>
            </template>
            <v-btn
              class="absolute-top-end z1"
              icon
              large
              @click="quick_buy = false"
              ><v-icon>close</v-icon>
            </v-btn>
          </v-card-text>
          <v-card-actions
            v-if="$vuetify.breakpoint.mdAndDown"
            class="border-top mb-16"
          >
            <div class="widget-buttons mb-4">
              <v-btn text @click="quick_buy = false" x-large
                ><v-icon class="me-1">close</v-icon
                >{{ $t("global.actions.close") }}</v-btn
              >
            </div>
          </v-card-actions>
        </v-card>
      </v-bottom-sheet>

      <progress-loading v-if="busy_fetch"></progress-loading>
    </div>
  </div>
</template>

<script>
import SShopProductCard from "@components/product/card/SShopProductCard.vue";
import SProductsSortView from "@components/product/sort/SProductsSortView.vue";
import CategoryCard from "@components/backoffice/category/CategoryCard.vue";
import { HierarchyHelper } from "../../../../core/helper/breadcrumb/HierarchyHelper";
import ProductFilterMenu from "@components/storefront/filter/ProductFilterMenu.vue";
import { LocalStorages } from "../../../../core/helper/local-storage/LocalStorages";
import GtagEcommerce from "../../../Applications/Storefront/plugins/gtag/GtagEcommerce";
import SShopProductMainCard from "@components/product/info/SShopProductMainCard.vue";
import { SpecHelper } from "../../../../core/helper/product/SpecHelper";
import ProductSpecView from "../product/spec/ProductSpecView.vue";
import SBreadcrumbImage from "@components/ui/breadcrumb/SBreadcrumbImage.vue";
import ProductInfoLoadingView from "@components/product/loading/ProductInfoLoadingView.vue";
import { ModeView } from "../../../../core/enums/shop/ModeView";
import _ from "lodash-es";

export default {
  name: "SShopProductsListing",
  components: {
    ProductInfoLoadingView,
    SBreadcrumbImage,
    ProductSpecView,
    SShopProductMainCard,
    ProductFilterMenu,
    CategoryCard,
    SProductsSortView,
    SShopProductCard,
  },

  props: {
    /**
     * Represents the current shop object.
     * @type {Object}
     * @required
     */
    shop: {
      require: true,
      type: Object,
    },

    /**
     * Determines whether to display the sorting bar.
     * @type {Boolean}
     * @default false
     */
    hasSort: {
      default: false,
      type: Boolean,
    },
    /**
     * Determines whether to display the filter option.
     * @type {Boolean}
     * @default false
     */
    hasFilter: {
      default: false,
      type: Boolean,
    },
    /**
     * Determines whether to display the breadcrumb navigation.
     * @type {Boolean}
     * @default false
     */
    hasBreadcrumb: {
      default: false,
      type: Boolean,
    },

    /**
     * Enables route-based interaction. In this mode, any changes to filter values
     * will update the route. Also, products and categories will refresh based on route and query parameters.
     * @type {Boolean}
     * @default false
     */
    routeMode: {
      default: false,
      type: Boolean,
    },
    /**
     * If set to true, the route's query parameters will be updated based on filter, availability, and sort options.
     * @type {Boolean}
     * @default false
     */
    updateRoute: {
      default: false,
      type: Boolean,
    },

    /**
     * Represents the criteria used to fetch products and categories.
     *
     * @property {number} limit - Number of items to fetch, corresponds to `this.forcePackage.count`.
     * @property {number} categories_count - Number of categories, typically used in the products section of a page builder.
     * @property {string} sort - Sorting criteria.
     * @property {boolean} available - Indicates if only available products/categories should be fetched. Maps to `this.forcePackage.only_available`.
     * @property {string} search - Search query string.
     * @property {string} search_type - Type of search.
     * @property {string} dir - Direction for search. Default is "*", which forces a search across all products & categories.
     * @property {Object} filter - Filter criteria. If set, it's converted to a string using JSON.stringify.
     * @property {boolean} products_only - If true, fetches only products.
     * @property {boolean} categories_only - If true, fetches only categories.
     * @property {Array} dirs - Array of directions.
     * @property {Object} bounds - Bounds for searching, particularly in map views.
     * @property {Array} tags - Tags associated with products or categories.
     * @property {number|string} vendor_id - Specific vendor ID to fetch products for.
     * @property {boolean} surrounded - Some flag or condition (this needs more context for a clearer description).
     *
     */
    forcePackage: {},

    /**
     * Enforces a specific view mode for the listing. Possible values include: 'normal', 'grid', 'list', 'insta'.
     * If set, the view mode will not be stored in local storage.
     */
    forceModeView: {},

    /**
     * If set to true, listings will be in view-only mode. Clicking items will not navigate to product or category pages.
     * Useful for previewing in design mode.
     * @type {Boolean}
     * @default false
     */
    viewOnly: {
      default: false,
      type: Boolean,
    },

    /**
     * If set to true, additional products will be automatically fetched as the user scrolls to the end of the list.
     * @type {Boolean}
     * @default false
     */
    loadMore: {
      default: false,
      type: Boolean,
    },

    /**
     * Defines the alignment of items using CSS flexbox alignment properties.
     */
    align: {},
    /**
     * Defines the justification of items using CSS flexbox justification properties.
     */
    justify: {},

    /**
     * Indicates whether the listing is displayed within a landing page.
     * @type {Boolean}
     * @default false
     */
    landingPageMode: {
      default: false,
      type: Boolean,
    },

    /**
     * In free mode, the width of product and category items is set directly in the CSS.
     * @type {Boolean}
     * @default false
     */
    freeMode: {
      // In the map view -> set min width for cards (in card modes only!)
      default: false,
      type: Boolean,
    },

    /**
     * Displays only products within a specified map location bounds.
     * Structure: [lng1, lat1, lng2, lat2]
     * Where lng1, lat1 represent max bounds and lng2, lat2 represent min bounds.
     * @type {Array}
     */
    locationBounds: {
      type: Array,
    },
    /**
     * If provided, only products for the specified vendor will be displayed.
     */
    vendorId: {}, // Show products only for this vendor!
  },
  data: () => ({
    busy_fetch: false,

    products: [],
    sort: null /*Custom sorting*/, // "most_popular",
    only_available: true,

    folders: [],

    parent_folders: {},

    show_filter_menu: false,

    filter: null,

    mode_view: ModeView.NORMAL,

    quick_buy: false,
    selected_product: null,
    spec_array: null,
    busy_fetch_product: true,

    insta_size: "200px",
    spacer_w: 0,

    //--------------------
    prevent_refetch: false,

    show_categories: false,
  }),

  computed: {
    theme() {
      return this.shop.theme;
    },
    no_animation() {
      return this.theme && this.theme.static;
    },
    hover_actions() {
      return this.theme && this.theme.hover_actions;
    },

    class_items_categories() {
      if (this.freeMode) {
        return "free-mode";
      }

      if (this.mode_view.code === ModeView.NORMAL.code)
        return "xs12 sm6 md4 lg3 xl20p"; // xl20p: 5 columns in row
      else if (this.mode_view.code === ModeView.GRID.code)
        return "xs6 sm4 md3 lg2 xl2 p-2";
      else if (this.mode_view.code === ModeView.LIST.code)
        return "xs12 sm6 sm4 lg3 xl3 p-2";
      else if (this.mode_view.code === ModeView.INSTA.code) return "insta-cat";

      return "";
    },

    class_items_products() {
      if (this.freeMode) {
        return "free-mode";
      }

      if (this.mode_view.code === ModeView.NORMAL.code)
        return "m-0 xs12 sm6 md4 lg3 xl20p"; // xl20p: 5 columns in row
      else if (this.mode_view.code === ModeView.GRID.code)
        return "m-0 xs6 sm4 md3 lg2 xl2 p-2";
      else if (this.mode_view.code === ModeView.LIST.code)
        return "m-0 xs12 lg6 p-0";
      else if (this.mode_view.code === ModeView.INSTA.code)
        return "m-0 insta-prod";

      return "";
    },

    class_row_products() {
      if (!this.freeMode && this.mode_view.code === ModeView.INSTA.code)
        return "insta-row";

      return "";
    },

    isSmallItem() {
      return !this.freeMode && this.mode_view.code === ModeView.GRID.code;
    },

    isRow() {
      return !this.freeMode && this.mode_view.code === ModeView.LIST.code;
    },
    isInsta() {
      return !this.freeMode && this.mode_view.code === ModeView.INSTA.code;
    },
    has_breaker() {
      return (this.isInsta || this.isRow) && this.folders.length > 0;
    },

    hasSelfeItemSpacing() {
      return (
        !this.freeMode &&
        (this.mode_view.code === ModeView.GRID.code ||
          this.mode_view.code === ModeView.LIST.code)
      );
    },

    hierarchy_items() {
      if (!this.getShop()) return [];
      return HierarchyHelper.GenerateCategoryHierarchyGeneral(
        this.$t("global.store"),
        this.parent_folders,
        this.getShop().name,
        null,
        "shopping_bag",
      );
    },

    has_filter() {
      return (
        this.hasFilter && this.parent_folders && this.parent_folders.filters
      );
    },

    has_more() {
      return this.loadMore && this.remains_count > 0;
    },
    remains_count() {
      return this.products_count - this.products.length;
    },

    limit() {
      let limit = 20;

      if (this.$vuetify.breakpoint.xs) limit = 6;
      else if (this.$vuetify.breakpoint.sm) limit = 10;
      else if (this.$vuetify.breakpoint.md) limit = 16;
      else if (this.$vuetify.breakpoint.lg) limit = 20;
      else if (this.$vuetify.breakpoint.xl) limit = 25;

      if (this.freeMode) return limit;

      if (this.mode_view.code === ModeView.GRID.code) limit = limit * 2;
      else if (this.mode_view.code === ModeView.LIST.code) limit = limit * 2;
      else if (this.mode_view.code === ModeView.INSTA.code) limit = limit * 4;

      return limit;
    },

    // Device by screen size:
    template_device() {
      if (this.$vuetify.breakpoint.xsOnly) {
        return "mobile";
      } else if (
        this.$vuetify.breakpoint.smOnly ||
        this.$vuetify.breakpoint.mdOnly
      ) {
        return "tablet";
      } else if (
        this.$vuetify.breakpoint.lgOnly ||
        this.$vuetify.breakpoint.xlOnly
      ) {
        return "pc";
      }
      return "pc";
    },
  },
  watch: {
    $route(to, from) {
      //console.log(to,from)
      if (
        !this.routeMode ||
        (to?.name === from?.name &&
          to.params?.category_name === from.params?.category_name && // data refresh by changing the category in the parameters!
          to.query?.search === from.query?.search && // data refresh by changing the search & search_type in the query!
          to.query?.search_type === from.query?.search_type)
      )
        return; // Prevent execute of filter change and update route by it!

      this.filter = null;

      /*  this.current_dir_id = this.$route.query
        ? this.$route.query["dir"] || ""
        : null;*/
      //console.log('fetch list : change route');
      this.fetchData(true);
    },

    filter() {
      if (!this.routeMode || !this.filter) return;

      function removenull(obj) {
        const out = {};
        Object.keys(obj).forEach((k) => {
          if (k === "prices") return;
          if (Array.isArray(obj[k])) {
            if (!obj[k].length) return; //Remove empty arrays!
            out[k] = obj[k];
          } else if (obj[k] && typeof obj[k] === "object") {
            const _r = removenull(obj[k]);
            if (_r && Object.keys(_r).length) out[k] = _r;
          } else if (obj[k]) {
            out[k] = obj[k];
          }
        });
        return out;
      }

      const _filter_query = JSON.stringify(removenull(this.filter));

      if (_filter_query === this.$route.query?.filter) return;

      const _query = Object.assign(Object.assign({}, this.$route.query), {
        filter: _filter_query,
      }); // Create full query - keep previous!
      if (this.updateRoute) this.$router.replace({ query: _query });
      // console.log("filter", _filter_query);
    },

    sort(sort) {
      //console.log('fetch list : change sort');

      this.fetchData(false);

      // Update route by filters:
      if (sort === this.$route.query?.sort) return;

      const _query = Object.assign(Object.assign({}, this.$route.query), {
        sort: sort,
      }); // Create full query - keep previous!
      if (this.updateRoute) this.$router.replace({ query: _query });
    },

    only_available(only_available) {
      //console.log('fetch list : change available');

      this.fetchData(false);

      // Update route by filters:
      if (
        only_available ===
        (this.$route.query?.only_available === "true" ||
          this.$route.query?.only_available === true)
      )
        return;

      const _query = Object.assign(Object.assign({}, this.$route.query), {
        only_available: only_available,
      }); // Create full query - keep previous!

      if (this.updateRoute) this.$router.replace({ query: _query });
    },

    mode_view(mode_view) {
      if (this.forceModeView) return; // Do not save mode view in local storage! (Show in landing pages)
      localStorage.setItem(
        LocalStorages.GetUserShopViewModePath(
          this.$localstorage_base_path(),
          this.template_device,
        ),
        mode_view.code,
      );
    },

    products() {
      this.onResize();
    },

    forcePackage: {
      handler: function (newValue) {
        //console.log('fetch list : change package');

        this.fetchData(false);
      },
      deep: true,
    },

    forceModeView() {
      // console.log('===========forceModeView=============')
      if (this.forceModeView) {
        this.mode_view = Object.values(ModeView).find(
          (i) => i.code === this.forceModeView,
        );
      }
    },

    //------------------ Global filter view -----------------
    show_filter_menu() {
      this.onResize();
      if (
        !this.viewOnly &&
        !this.$route.params.shop_id /* Not available in realtime view!*/
      )
        this.$store.commit(
          "setShowFilterMenu",
          this.show_filter_menu &&
            this.has_filter &&
            !this.parent_folders
              ?.page /*In custom page show on the top of the page, the side bar filter is limited and has no overlap with top menu!*/,
        );
    },
    has_filter() {
      if (
        !this.viewOnly &&
        !this.$route.params.shop_id /* Not available in realtime view!*/
      )
        this.$store.commit(
          "setShowFilterMenu",
          this.show_filter_menu && this.has_filter,
        );
    },
    //-------------------------------------------------------

    locationBounds: _.debounce(function (newVal, oldVal) {
      this.fetchData(false);
    }, 1500),
  },
  created() {
    // Show filters on large screens by default:
    this.show_filter_menu = this.$vuetify.lgAndUp;

    // Read from local storage:
    let code = null;
    // ............... Apply customized template ...............

    code = localStorage.getItem(
      LocalStorages.GetUserShopViewModePath(
        this.$localstorage_base_path(),
        this.template_device,
      ),
    );
    if (!code && this.theme && this.theme[this.template_device]) {
      code = this.theme[this.template_device];
    }

    this.only_available = !!this.theme?.only_available;

    // ...........................................................

    // Read from force mode view:
    if (this.forceModeView) code = this.forceModeView;

    console.debug(`${this.template_device} ➡ view mode : ${code}`);

    if (code)
      this.mode_view = Object.values(ModeView).find((i) => i.code === code);

    if (!this.mode_view) this.mode_view = ModeView.NORMAL;

    if (this.forcePackage) {
      // Important: this cause re-fetch ba watcher:
      this.sort = this.forcePackage.sort;
      this.only_available = this.forcePackage.only_available;
      // this.current_dir_id=this.forcePackage.dir;
    } else {
      /* this.current_dir_id = this.$route.query
              ? this.$route.query["dir"] || ""
              : null;*/
    }

    // Load from route query: (Important: Initial state)
    if (this.$route.query?.filter) {
      try {
        this.filter = JSON.parse(this.$route.query.filter);
      } catch (e) {
        console.error(e);
      }
    }

    if (this.$route.query?.sort) {
      this.sort = this.$route.query?.sort;
    }
    if (
      this.$route.query?.only_available === "false" ||
      this.$route.query?.only_available === "true"
    ) {
      this.only_available = this.$route.query?.only_available === "true";
    }

    this.fetchData(true);

    // Prevent duplicate fetch on change sort or only_available:
    this.prevent_refetch = true;
    this.$nextTick(() => {
      this.prevent_refetch = false;
    });
  },

  methods: {
    onIntersect(entries, observer) {
      if (!this.loadMore) return;
      // More information about these options
      // is located here: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
      const isIntersecting = entries[0].isIntersecting;
      // console.log('------- END -------',isIntersecting)

      if (isIntersecting && !this.busy_fetch && this.has_more) {
        console.log("⏺ Fetch more data...");

        this.fetchData(false, true);
      }
    },

    onResize() {
      let real_w =
        Math.min(window.innerWidth, 1720) -
        (this.$vuetify.breakpoint.mdAndUp &&
        this.show_filter_menu &&
        this.has_filter
          ? 256
          : 0);

      let width = Math.min(real_w / 3, 200);

      //   console.log('onResize',width)
      this.insta_size = `${width}px`;

      const col_in_row = Math.floor(real_w / width);
      const rem = this.products.length % col_in_row;
      const sp = rem ? col_in_row - rem : 0;
      //console.log("onResize", (real_w ) / width, rem, col_in_row);

      this.spacer_w = `${width * sp}px`;
    },
    quickBuy(product) {
      if (this.viewOnly) return;

      this.quick_buy = true;
      this.selected_product = null;
      this.busy_fetch_product = true;
      this.spec_array = null;


      const handleSuccessResponse=({ product }) => {
        this.selected_product = product;

        if (Array.isArray(this.selected_product.spec))
          this.spec_array = this.selected_product.spec;
        //Old version:
        else
          this.spec_array = SpecHelper.CONVERT_SPEC_JSON_TO_ARRAY(
              this.selected_product.spec,
              this.selected_product.spec_order,
          );
        GtagEcommerce.MeasuringViewsOfProductDetails(
            this.shop,
            product,
            this.GetUserSelectedCurrency().code,
            "quick-view",
        );
      }

      window.$storefront.products.optimize(60).getInfo(product.id,{
        no_article: true,
      })
          .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch_product = false;
        });
    },

    onClickProduct(product, index) {
      GtagEcommerce.MeasuringProductClicks(
        this.shop,
        product,
        this.GetUserSelectedCurrency().code,
        index + 1,
        this.parent_folders,
      );
    },

    setFilter(filter) {
      this.filter = filter;
      console.style('<b="font-size:12px;">Set Filter</b> fetch data... ✔');
      //console.log('fetch list : change filter');

      this.fetchData(false);
    },

    fetchData(with_parent = true, more = false) {
      // Prevent re fetch if in fetching by package:
      if (this.prevent_refetch) return;

      this.busy_fetch = true;

      let limit,
        categories_count,
        sort,
        available,
        search,
        search_type,
        dir,
        filter,
        products_only,
        categories_only,
        dirs,
        bounds,
        tags,
        vendor_id,
        surrounded;

      if (this.forcePackage) {
        this.prevent_refetch = true; // Prevent re fetch if in fetching by package!

        limit = this.forcePackage.count;
        categories_count = this.forcePackage.categories_count; // In page builder! Products section!
        sort = this.forcePackage.sort;
        available = this.forcePackage.only_available;
        search = this.forcePackage.search;
        search_type = this.forcePackage.search_type;
        dir = "*"; //this.forcePackage.dir Force search in all products & categories!
        filter = this.forcePackage.filter
          ? JSON.stringify(this.forcePackage.filter)
          : null;
        products_only = this.forcePackage.products_only;
        categories_only = this.forcePackage.categories_only;
        dirs = this.forcePackage.dirs;

        bounds = this.forcePackage.bounds;

        tags = this.forcePackage.tags;
        vendor_id = this.forcePackage.vendor_id;
        surrounded = this.forcePackage.surrounded;
      } else {
        limit = this.limit;
        categories_count = null;
        sort = this.sort;
        available = this.only_available;
        search = this.$route.query.search;
        search_type = this.$route.query.search_type;
        dir = this.$route.params.category_name;
        filter = JSON.stringify(this.filter);
        products_only = more;
        categories_only = false;
        dirs = null;

        bounds = this.locationBounds;

        tags = null;
        vendor_id = this.vendorId;
        surrounded = null;
      }

      const handleSuccessResponse = ({ products, total, folders, parent }) => {
        this.products_count = total;

        if (more) {
          products.forEach((product) => {
            this.AddOrUpdateItemByID(this.products, product);
          });
        } else {
          this.products = products;
          this.folders = folders;
          if (with_parent) {
            this.parent_folders = parent;
            if (parent) {
              this.$emit("update:title", parent.title); // Set Page Title!
            }
          }
        }

        // Emit product (Used in map view show pins)
        this.$emit("fetch-products", {
          products: this.products,
          folders: this.folders,
          total: total,
        });

        GtagEcommerce.MeasuringProductImpressions(
          this.shop,
          products,
          this.GetUserSelectedCurrency().code,
          this.$route.query.search ? "Search Results" : null,
          parent,
        );
      };

      window.$storefront.products
        .optimize(600)
        .fetchProducts(dir, more ? this.products.length : 0, limit, {
          categories_count: categories_count,

          with_parent: with_parent,
          with_page: true, // Only return page if with_parent be true! It return linked custom page of current category (parent).

          sort: sort,
          available: available,
          search: search,
          search_type: search_type,

          dirs: dirs,

          filter: filter, //filter

          products_only: products_only, // Only products if load more!
          categories_only: categories_only,

          with_total: true,

          bounds: bounds, // Location constraints

          tags: tags, //Filter by tags
          vendor_id: vendor_id, // Show only for this vendor!

          surrounded: surrounded, // true:Show only selected categories. false: Show items inside selected categories.
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((error) => {
          this.showLaravelError(error);
        })

        .finally(() => {
          this.prevent_refetch = false;

          this.busy_fetch = false;
          // always executed
        });
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--products-list{

}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */


.s--products-list{
  .product-filter-menu {
    z-index: 100;
    border-radius: 8px;
  }

  .products-container {
    transition: 0.4s;
    padding-bottom: 68px;

    &.container-expanded-side-menu {
      padding-left: var(--products-filter-width) !important;
      @media (max-width: 800px) {
        padding-left: 0 !important;
        transform: translateX(var(--products-filter-width));
      }
    }

    .products-layout {
      margin-left: 1.2%;
      margin-right: 1.2%;
      @media (max-width: 800px) {
        margin-left: 0.3%;
        margin-right: 0.3%;
      }
    }
  }


  &.rtl{
    .products-container {
      &.container-expanded-side-menu {
        padding-left: 0px !important;
        padding-right: var(--products-filter-width) !important;
        @media (max-width: 800px) {
          padding-right: 0 !important;
          transform: translateX(- var(--products-filter-width));
        }
      }
    }
  }


  //─────────── Free mode view ───────────
  .free-mode {
    flex-grow: 0 !important;
    width: 320px;

    padding: 12px;
    max-width: 100% !important;
    @media only screen and (max-width: 760px) {
      flex-basis: 100% !important;

      // Justify center:
      margin-left: auto !important;
      margin-right: auto !important;
    }
    @media only screen and (max-width: 1200px) and (min-width: 760px) {
      flex-basis: 50% !important;
    }
    @media only screen and (max-width: 1600px) and (min-width: 1200px) {
      flex-basis: 33% !important;
    }
    @media only screen and (min-width: 1600px) {
      flex-basis: 25% !important;
    }
  }

  // ─────────── Insta mode view ───────────
  .insta-cat {
    max-width: 50%;
    min-height: 160px;
    padding: 0 8px;
    overflow: visible;

    // Fix Flickering in Safari in Safari: (Apple bug)
    -webkit-transform: translateZ(0);
    -webkit-backface-visibility: hidden;

    @media only screen and (max-width: 1200px) {
      .category-card-root {
        .box {
          padding: 0 !important;
        }
      }
    }
    .category-card-root {
      .folder-card {
        // Fix Flickering in Safari in Safari: (Apple bug)
        -webkit-backface-visibility: hidden;

        --f-size: 200px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 50%;
        height: var(--f-size);
        width: var(--f-size);

        &:after {
          border-radius: 35% !important;
        }

        &:before {
          border-radius: 30% !important;
        }

        &:hover {
          .imgBx {
            top: calc(var(--f-size) / 2);
            bottom: calc(var(--f-size) / 2);
            left: calc(var(--f-size) / 2);
            right: calc(var(--f-size) / 2);
          }

          .details {
            display: flex;
          }
        }

        .imgBx {
          border-radius: 50%;

          img {
            border-radius: 50%;
          }

          p {
            font-size: 8px;
            background: transparent;
            border-radius: 15px;
            bottom: -40px;
            top: unset;
            transform: translate(-50%, 0%);
            width: 90%;
          }

          .category-title {
            font-size: 11px;
            overflow: visible;
            width: max-content;
          }
        }

        .details {
          display: none;
          align-items: center;
          justify-content: center;
          position: relative;
          left: unset;
          right: unset;
          top: unset;
          bottom: unset;
          flex-direction: column;

          h2 {
            font-size: 0px !important;
          }

          span {
            font-size: 10px !important;

            overflow: hidden;
            padding: 5px;
            line-height: normal;
            max-height: var(--f-size);
          }

          @media only screen and (min-width: 600px) and (max-width: 1200px) {
            span {
              font-size: 8px !important;
              line-height: 11px;
            }
          }
          @media only screen and (max-width: 600px) {
            span {
              font-size: 7px !important;
              line-height: 10px;
            }
          }
        }

        @media only screen and (min-width: 600px) and (max-width: 1200px) {
          --f-size: 120px;

          //  height: 120px !important;
          // width: 120px !important;

          .imgBx {
            .category-title {
              font-size: 9px;
              overflow: visible;
              width: max-content;
            }
          }
        }

        @media only screen and (max-width: 600px) {
          --f-size: 100px;
          // height: 100px !important;
          //  width: 100px !important;

          .imgBx {
            .category-title {
              font-size: 8px;
              overflow: hidden;
              width: 90%;
            }
          }
        }
      }
    }
  }

  .insta-prod {
    // Fix Flickering in Safari in Safari: (Apple bug)
    -webkit-transform: translateZ(0);
    -webkit-backface-visibility: hidden;

    &:hover {
      -webkit-transform: unset; // Make sure card be on top!
    }

    max-width: max-content !important;
    height: var(--insta-size) !important;
    min-width: var(--insta-size) !important;
    padding: 0 !important;

    .card--1 {
      height: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      border: 1px solid rgba(0, 0, 0, 0.03) !important;

      .card__info-hover {
        display: none;
      }
      .card__img--hover {
        top: 0 !important;
        bottom: 0;
        height: 100% !important;
      }
      .top-title {
        background: transparent;
        h3 {
          font-size: 0.8rem !important;
          margin: 4px !important;
          white-space: nowrap;
        }
      }
      .count-down-bg {
        transition: all 0.5s !important;
      }
      &:hover {
        transform: scale(1.2, 1.2) !important;
        z-index: 20;

        .card__info {
        }
        // Hide discount bar on hover:
        .count-down-bg {
          transform: scale(0);
          transform-origin: top right;
        }
        .count-down-container {
          opacity: 0 !important;
        }
      }

      .card__info {
        position: absolute;
        bottom: 0;
        width: calc(100% - 16px);
        height: max-content !important;
        padding: 2px 4px !important;
        margin: 9px;
        border-radius: 8px;
        background-color: #ffffff8f;
        display: flex !important;
        align-items: center;
        justify-content: center;

        .toggle-visible-on-hover {
          width: auto !important;
          margin: 0 2px !important;
        }

        .sec--rate-variants {
          display: none;
        }
        .sec--price {
          flex-grow: 1;
          max-width: 100%;

          .main-price-label {
            font-size: 1rem;
            margin: 3px !important;
            p {
              min-height: 0 !important;
            }
            .mt-2 {
              margin: 0 !important;
            }
            .price-view.large {
              font-size: 1rem !important;
            }
          }
        }
      }

      @media only screen and (max-width: 600px) {
        .top-title {
          h3 {
            font-size: 0.6rem !important;
            font-weight: 500;
          }
        }

        .card__info {
          .sec--price {
            .main-price-label {
              padding: 4px !important;
              .dis-val {
                display: none;
              }
              .price-view.large {
                font-size: 0.9rem !important;
              }
            }
          }

          .product-variant-view {
            > div {
              padding: 0 !important;
              font-size: 8px;
            }
            .v-icon {
              font-size: 9px !important;
            }
          }
        }
      }
    }

    // Position quick by at center:
    .quick-buy {
      top: 50% !important;
      bottom: unset !important;
    }
  }

  .insta-row {
    justify-content: center;
    margin-top: 16px !important;
    margin-left: -14px !important;
    margin-right: -14px !important;
  }
}
</style>

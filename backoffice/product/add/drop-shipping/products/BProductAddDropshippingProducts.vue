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
  <div v-bind="$attrs" class="widget-box -large mb-5">
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-list-subheader>
      Select products from the following list and add them to your shop. You can
      edit the product's content and more options on the admin product page
      afterward. Additionally, you can see the product preview in the
      wholesaler's shop if it is available on their website.
    </v-list-subheader>

    <v-row align="center" no-gutters class="mb-3">
      <!-- ⬬⬬⬬⬬ Breadcrumbs ⬬⬬⬬⬬ -->

      <!-- Shops -->
      <div @click="$emit('back')">
        <v-icon class="me-1">home</v-icon>
        <span class="link-dash pointer-pointer">{{
          $t("global.commons.home")
        }}</span>

        <v-icon class="mx-2">{{ $t("icons.chevron_next") }}</v-icon>
      </div>
      <!-- Current Shop -->
      <div>
        <img
          :src="getShopImagePath(wholesalerShop.icon, 64)"
          class="me-1 rounded-xl"
          height="24"
        />
        <span
          :class="{
            'link-dash pointer-pointer':
              parent_folders && parent_folders.length,
          }"
          >{{ wholesalerShop.title }}</span
        >

        <v-icon v-if="parent_folders && parent_folders.length" class="mx-2"
          >{{ $t("icons.chevron_next") }}
        </v-icon>
      </div>

      <v-spacer></v-spacer>

      <v-text-field
        v-model="search_in_shop"
        :label="$t('global.commons.search')"
        class="max-width-field"
        clearable
        hide-details
        prepend-inner-icon="search"
        single-line
        variant="plain"
      ></v-text-field>
    </v-row>

    <v-data-table-server
      :mobile="$vuetify.display.xs"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="products"
      :items-length="total_products"
      :items-per-page="itemsPerPage"
      :loading-text="$t('global.commons.waiting_load_data')"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="bg-transparent min-height-60vh"
      density="compact"
      hide-default-footer
      item-key="id"
      @click:row="(_, r) => showAddProduct(r.item)"
    >
      <template v-slot:item.title="{ item }">
        <div class="d-flex align-center py-1">
          <u-avatar-folder
            :src="getShopImagePath(item.icon, 128)"
            :is-gray="!item.added_product_id"
            :is-green="!!item.added_product_id"
            elevated
            class="me-2"
            :size="48"
            :border-size="6"
            hide-side-icon
          >
          </u-avatar-folder>

          <div>
            <div>
              {{ item.title }}
              <router-link
                v-if="item.added_product_id"
                :to="{
                  name: 'BPageProductDashboard',
                  params: { product_id: item.added_product_id },
                }"
                title="Open product admin..."
                @click.stop
                target="_blank"
              >
                <v-chip
                  size="x-small"
                  color="green"
                  label
                  class="ma-1"
                  append-icon="launch"
                  >Added
                </v-chip>
              </router-link>
            </div>
            <div class="small">
              {{ item.title_en }}
            </div>
          </div>
        </div>
      </template>

      <template v-slot:item.variants="{ item }">
        <product-variants-view
          v-if="item.variants?.length"
          :variants="item.variants"
          center
          small
        />
      </template>

      <template v-slot:item.price="{ item }">
        <u-price :amount="item.price" :currency="item.currency"></u-price>
      </template>

      <template v-slot:item.commission="{ item }">
        <u-price :amount="item.commission" :currency="item.currency"></u-price>
      </template>

      <template v-slot:item.quantity="{ item }">
        {{ numeralFormat(item.quantity, "0.[0]a") }}
      </template>

      <template v-slot:item.action="{ item }">
        <v-btn
          size="small"
          icon
          variant="text"
          :href="getProductLink(wholesalerShop, item.id)"
          @click.stop
          target="_blank"
          title="See product page... (if available)"
        >
          <v-icon>launch</v-icon>
        </v-btn>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>

  <!-- ------------------------------ Add Product Dialog ----------------------------- -->
  <v-bottom-sheet
    v-model="show_add_dialog"
    scrollable
    max-width="98vw"
    width="1600"
    content-class="rounded-t-xl"
  >
    <v-card v-if="selected_product" class="text-start" rounded="t-xl">
      <v-card-title class="d-flex align-center">
        <v-img
          :cover="!selected_product.style?.contain"
          :src="getShopImagePath(selected_product.icon)"
          aspect-ratio="1"
          class="rounded-lg me-3 ms-n2 flex-grow-0 rounded-ts-xl"
          height="64"
          width="64"
        ></v-img>

        <div>
          <b>{{ selected_product.title }}</b>
          <div class="small">
            {{ selected_product.title_en }}
          </div>
        </div>
      </v-card-title>

      <v-card-text>
        <div class="widget-box -large">
          <v-list-subheader>
            You can set your own pricing to resell products in your store. The
            commission value provided by the wholesaler is just a
            recommendation, and you can add any margin you wish when selling to
            end users.
          </v-list-subheader>

          <u-price-input
            v-model="selected_product_variant_pricing.commission"
            :currency="selected_product.currency"
            class="max-width-field-mini fadeIn strong-field"
            :label="$t('global.commons.commission')"
            flat
            variant="solo"
            rounded="xl"
          />

          <template v-if="variants && variants.length">
            <u-widget-header
              :title="$t('global.commons.Variants')"
              icon="animation"
            ></u-widget-header>
            <v-menu>
              <template v-slot:activator="{ props }">
                <div class="position-relative mb-10" v-bind="props">
                  <variant-item-mini
                    :product-variant="selected_variant"
                    class="m-2"
                    selected
                  />
                  <v-icon class="absolute-top-end"> arrow_drop_down</v-icon>
                </div>
              </template>
              <v-sheet class="py-2" color="#fff">
                <variant-item-mini
                  v-for="(product_variant, index) in variants"
                  :key="index"
                  :product-variant="product_variant"
                  :selected="product_variant === selected_variant"
                  class="m-2"
                  force-enable
                  @select="selected_variant = product_variant"
                />
              </v-sheet>
            </v-menu>
          </template>

          <u-widget-header
            :title="$t('add_product.pricing.edit_price')"
            icon="price_change"
          ></u-widget-header>

          <v-table class="mx-auto my-5 bg-transparent">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-start">
                    {{ $t("global.commons.country") }}
                  </th>

                  <th class="text-left">
                    {{ $t("global.commons.net_price") }}
                  </th>
                  <th class="text-center">
                    <v-tooltip location="bottom">
                      <template v-slot:activator="{ props }">
                        <span v-bind="props">
                          {{ $t("global.commons.discount") }}

                          <v-icon
                            v-if="dis_start || dis_end"
                            class="ms-1"
                            color="amber"
                            >warning</v-icon
                          >
                        </span>
                      </template>
                      <u-time-progress-bar
                        :created-time="created_at"
                        :end-time="dis_end"
                        :start-time="dis_start"
                      ></u-time-progress-bar>
                    </v-tooltip>
                  </th>
                  <th class="text-center">
                    {{ $t("global.commons.shipping_cost") }}
                  </th>

                  <th class="text-left">Price for you</th>
                  <th class="text-left">Your commission</th>
                  <th class="text-left">Final price (Customers)</th>
                </tr>
              </thead>
              <tbody class="text-start">
                <tr
                  v-for="(shipping, country) in selected_product.shipping"
                  :key="country"
                >
                  <td>
                    <flag :iso="country" :squared="false" class="me-3" />
                    {{ getCountryName(country) }}
                  </td>

                  <td class="text-left">
                    <u-price
                      :amount="net_price_without_commission + discount"
                      :currency="selected_product.currency"
                    ></u-price>
                  </td>
                  <td class="text-left">
                    <u-price
                      :amount="-discount"
                      :currency="selected_product.currency"
                    ></u-price>
                  </td>

                  <td class="text-center">
                    <u-price
                      :amount="shipping"
                      :currency="selected_product.currency"
                    ></u-price>
                  </td>

                  <td class="text-left">
                    <u-price
                      :amount="
                        net_price_without_commission + (shipping ? shipping : 0)
                      "
                      :currency="selected_product.currency"
                    ></u-price>
                  </td>

                  <td class="text-left">
                    <u-price
                      class="text-success"
                      :amount="commission"
                      :currency="selected_product.currency"
                    ></u-price>
                  </td>

                  <td class="text-left">
                    <u-price
                      :amount="net_price_without_commission + commission"
                      :currency="selected_product.currency"
                    ></u-price>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="show_add_dialog = false"
            prepend-icon="close"
          >
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :loading="busy_add"
            color="primary"
            size="x-large"
            variant="elevated"
            @click="addProduct()"
            prepend-icon="add"
          >
            {{ $t("global.actions.add") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { throttle } from "lodash-es";
import UTimeProgressBar from "@selldone/components-vue/ui/time/progress-bar/UTimeProgressBar.vue";
import VariantItemMini from "@selldone/components-vue/storefront/product/variant/VariantItemMini.vue";
import ProductVariantsView from "@selldone/components-vue/storefront/product/variant/ProductVariantsView.vue";
import UPriceInput from "@selldone/components-vue/ui/price/input/UPriceInput.vue";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "BProductAddDropshippingProducts",
  mixins: [ProductMixin],
  components: {
    UAvatarFolder,
    UPriceInput,
    ProductVariantsView,
    UTimeProgressBar,
    VariantItemMini,
  },
  emits: ["back"],
  props: {
    shop: {
      required: true,
    },
    wholesalerShop: {
      required: false,
    },
  },
  data: () => ({
    busy_fetch: false,

    //---------------------------------------
    products: [],
    total_products: 0,

    categories: [],
    total_categories: 0,

    //---------------------------------------

    selected_folder: null,
    search_in_shop: null,
    sort: null,
    only_available: true,
    parent_folders: [],

    //-----------------------------------------
    selected_product: null,
    show_add_dialog: null,
    selected_variant: null,
    busy_add: false,

    editing: null,

    //-----------------------------------------

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: null, order: "desc" }],
  }),

  computed: {
    headers() {
      return [
        {
          title: this.$t("global.commons.title"),
          align: "start",
          value: "title",
          sortable: true,
        },
        {
          title: this.$t("global.commons.variant"),
          align: "start",
          value: "variants",
          sortable: false,
        },

        {
          title: this.$t("global.commons.brand"),
          align: "start",
          value: "brand",
          sortable: true,
        },
        {
          title: this.$t("global.commons.sku"),
          align: "start",
          value: "sku",
          sortable: true,
        },
        {
          title: this.$t("global.commons.price"),
          align: "start",
          value: "price",
          sortable: true,
        },
        {
          title: this.$t("global.commons.quantity"),
          align: "start",
          value: "quantity",
          sortable: true,
        },
        {
          title: "",
          align: "end",
          value: "action",
          sortable: false,
        },
      ];
    },
    pageCount() {
      return Math.ceil(this.total_products / this.itemsPerPage);
    },

    selected_product_variant_pricing() {
      return this.selected_variant && this.selected_variant.pricing
        ? this.selected_variant
        : this.selected_product;
    },

    commission() {
      return this.selected_product_variant_pricing.commission;
    },
    net_price_without_commission() {
      return (
        this.priceProductByCurrency(
          null,
          this.selected_product,
          this.selected_variant,
          this.selected_product.currency,
        ) - this.commission
      );
    },
    discount() {
      return this.getProductDiscountAmountByCurrency(
        null,
        this.selected_product,
        this.selected_variant,
        this.selected_product.currency,
      );
    },

    created_at() {
      return this.selected_product_variant_pricing.created_at;
    },
    dis_start() {
      return this.selected_product_variant_pricing.dis_start;
    },
    dis_end() {
      return this.selected_product_variant_pricing.dis_end;
    },
    variants() {
      return this.selected_product.product_variants;
    },
  },
  watch: {
    selected_folder() {
      this.fetchProducts();
    },

    sortBy() {
      this.fetchProducts();
    },

    page() {
      this.fetchProducts();
    },

    search_in_shop: throttle(function (newVal, oldVal) {
      this.fetchProducts();
    }, 1000),
  },

  created() {
    this.fetchProducts();
  },

  methods: {
    fetchProducts() {
      this.busy_fetch = true;
      axios
        .get(
          window.API.GET_DROP_SHIPPING_SHOP_PRODUCTS(
            this.shop.id,
            this.wholesalerShop.id,
          ),
          {
            params: {
              offset: (this.page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: this.sortBy[0]?.key,
              sortDesc: this.sortBy[0]?.order === "desc",

              sort: this.sort,
              available: this.only_available,
              search: this.search_in_shop,

              dir: this.selected_folder ? this.selected_folder.id : null,
            },
          },
        )
        .then(({ data }) => {
          this.products = data.products;
          this.total = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .then(() => {
          this.busy_fetch = false;
        });
    },

    fetchCategories() {
      this.busy_fetch = true;
      axios
        .get(
          window.API.GET_DROP_SHIPPING_SHOP_CATEGORIES(
            this.shop.id,
            this.wholesalerShop.id,
          ),
          {
            params: {
              offset: 0,
              limit: 50,
            },
          },
        )
        .then(({ data }) => {
          this.categories = data.categories;
          this.total_categories = data.total;
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .then(() => {
          this.busy_fetch = false;
        });
    },

    showAddProduct(product) {
      this.selected_product = product;
      this.show_add_dialog = true;
      this.selected_variant = null;
      if (this.variants && this.variants.length) {
        this.selected_variant = this.variants[0];
      }
    },
    addProduct() {
      this.busy_add = true;

      let commission = this.selected_product.commission;
      let commissions = {};

      if (this.variants && this.variants.length) {
        this.variants.forEach((variant) => {
          if (variant.pricing) commissions[variant.id] = variant.commission;
        });
      }

      axios
        .post(window.API.POST_ADD_PRODUCT_BY_DROP_SHIPPING(this.shop.id), {
          product_id: this.selected_product.id,
          category_id: this.$route.query.dir,

          commission: commission, // Main product commission
          commissions: commissions, // Variants custom commissions (If enable pricing)
        })
        .then(({ data }) => {
          if (!data.error) {
            this.show_add_dialog = false;
            this.showSuccessAlert(
              null,
              this.$t("dropshipping_products.notifications.add_product"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .then(() => {
          this.busy_add = false;
        });
    },
  },
};
</script>

<style scoped></style>

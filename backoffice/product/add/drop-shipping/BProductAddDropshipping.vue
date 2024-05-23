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
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!-- --------------------------------------- STEP 1 : Select Shop ---------------------------------- -->
    <template v-if="!selected_shop">
      <v-row align="center" no-gutters>
        <u-smart-toggle
          v-model="show_all"
          :false-description="
            $t('dropshipping_products.show_eligible_shops_message')
          "
          :true-description="$t('dropshipping_products.show_all_message')"
          :true-title="$t('dropshipping_products.show_all_shops')"
        >
        </u-smart-toggle>

        <v-spacer></v-spacer>

        <div>
          <s-country-select
            v-model="country"
            :filter="shop.countries"
            class="max-width-field m-2"
            dense
            flat
            hide-details
            item-value="alpha2"
            solo
            transparent
            @change="fetchDropShops"
          ></s-country-select>
          <v-text-field
            v-model="search"
            :label="$t('global.commons.search')"
            class="max-width-field"
            clearable
            hide-details
            prepend-inner-icon="search"
            single-line
            variant="plain"
          ></v-text-field>
        </div>
      </v-row>

      <div
        v-if="!busy_fetch && !drop_shops.length"
        class="py-6 px-2 text-center text-muted"
      >
        {{ $t("dropshipping_products.no_shops") }}
      </div>

      <v-container fluid>
        <v-row>
          <v-col
            v-for="drop_shop in drop_shops"
            :key="drop_shop.id"
            cols="12"
            lg="3"
            md="4"
            sm="6"
            xl="2"
          >
            <v-card
              class="widget widget-hover rounded-18px overflow-hidden text-center"
              @click="showStore(drop_shop)"
            >
              <v-avatar class="mx-auto" rounded size="128">
                <v-img
                  v-if="drop_shop.icon"
                  :src="getShopImagePath(drop_shop.icon, 128)"
                ></v-img>
                <v-icon v-else>storefront</v-icon>
              </v-avatar>
              <v-card-title class="justify-center">
                {{ drop_shop.title }}
              </v-card-title>
              <v-card-subtitle>@{{ drop_shop.name }}</v-card-subtitle>

              <v-card-text>
                <div class="pt-2 pb-3">
                  <span v-if="drop_shop.id === shop.id" class="text-uppercase"
                    ><v-icon class="me-1">storefront</v-icon>
                    {{ $t("dropshipping_products.current_shop") }}
                  </span>

                  <v-btn
                    v-else-if="!drop_shop.dropship_access"
                    :loading="busy_request"
                    color="primary"
                    dark
                    @click.stop="requestAccount(drop_shop)"
                    >{{ $t("dropshipping_products.request_account") }}
                  </v-btn>

                  <span
                    v-else-if="drop_shop.dropship_access.status === 'ACCEPT'"
                    class="text-success"
                    ><v-icon class="me-1" color="green">check</v-icon>
                    {{ $t("dropshipping_products.request_accepted") }}</span
                  >

                  <span
                    v-else-if="drop_shop.dropship_access.status === 'REJECT'"
                    class="text-danger"
                    ><v-icon class="me-1" color="red">close</v-icon>
                    {{ $t("dropshipping_products.request_rejected") }}
                    <v-btn
                      :loading="busy_request"
                      class="ms-1"
                      color="primary"
                      dark
                      icon
                      @click.stop="requestAccount(drop_shop)"
                      ><v-icon>refresh</v-icon></v-btn
                    ></span
                  >

                  <span
                    v-else-if="drop_shop.dropship_access.status === 'PENDING'"
                    class="text-muted"
                    ><v-icon class="me-1">hourglass_empty</v-icon>
                    {{ $t("dropshipping_products.request_pending") }}</span
                  >
                </div>

                <flag
                  v-for="cont in drop_shop.countries"
                  :key="cont"
                  :iso="cont"
                  :squared="false"
                  class="mx-1"
                />
              </v-card-text>
              <v-card-text class="d-flex border-between">
                <div class="flex-grow-1">
                  <small class="d-block">{{
                    $t("global.commons.products")
                  }}</small>
                  {{ drop_shop.drop_shipping_products }}
                </div>
                <div class="flex-grow-1">
                  <small class="d-block">{{
                    $t("global.commons.score")
                  }}</small>
                  {{ drop_shop.drop_shipping_score }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <!-- --------------------------------------- STEP 2 : Select Product ---------------------------------- -->

    <div v-else>
      <v-row align="center" no-gutters>
        <v-spacer></v-spacer>

        <v-text-field
          v-model="search_in_shop"
          :label="$t('global.commons.search')"
          :loading="busy_fetch && search_in_shop"
          class="max-width-field"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        ></v-text-field>
      </v-row>
      <v-col key="header" cols="12">
        <!-- ⬬⬬⬬⬬ Breadcrumbs ⬬⬬⬬⬬ -->

        <v-row no-gutters>
          <!-- Shops -->
          <div @click="selected_shop = null">
            <v-icon class="me-1">home</v-icon>
            <span class="link-dash pointer-pointer">{{
              $t("global.commons.home")
            }}</span>

            <v-icon class="mx-2">{{ $t("icons.chevron_next") }}</v-icon>
          </div>
          <!-- Current Shop -->
          <div @click="selected_folder = null">
            <img
              :src="getShopImagePath(selected_shop.icon, 64)"
              class="me-1 rounded-xl"
              height="24"
            />
            <span
              :class="{
                'link-dash pointer-pointer':
                  parent_folders && parent_folders.length,
              }"
              >{{ selected_shop.title }}</span
            >

            <v-icon v-if="parent_folders && parent_folders.length" class="mx-2"
              >{{ $t("icons.chevron_next") }}
            </v-icon>
          </div>
          <!-- Current Shop Categories -->
          <div
            v-for="(fol, index) in parent_folders"
            :key="fol.id"
            @click="selected_folder = fol"
          >
            <span
              :class="{
                'link-dash pointer-pointer': index < parent_folders.length - 1,
              }"
              >{{ fol.title }}</span
            >
            <v-icon v-if="index < parent_folders.length - 1" class="mx-2"
              >{{ $t("icons.chevron_next") }}
            </v-icon>
          </div>
        </v-row>
      </v-col>

      <v-container class="text-center" fluid>
        <v-row>
          <!-- ⬬⬬⬬⬬ Folders ⬬⬬⬬⬬ -->

          <s-category-card
            v-for="category in folders"
            :key="'f' + category.id"
            :category="category"
            class="xs12 sm6 md4 lg3 xl2 xl3 flex m-0 pointer-pointer"
            style="transition: all 400ms ease"
            @click="selected_folder = category"
          />

          <!-- ⬬⬬⬬⬬ Products ⬬⬬⬬⬬ -->

          <v-col
            v-for="product in products"
            :key="'p' + product.id"
            cols="12"
            lg="3"
            md="4"
            sm="6"
            xl="2"
          >
            <v-card
              class="widget widget-hover rounded-18px overflow-hidden"
              @click="showAddProduct(product)"
            >
              <v-img
                :contain="product.style && product.style.contain"
                :src="getShopImagePath(product.icon)"
                class="rounded-18px"
                height="128"
              ></v-img>
              <v-card-title>
                {{ product.title }}
              </v-card-title>
              <v-card-subtitle class="text-start"
                >{{ product.title_en }}
              </v-card-subtitle>

              <product-variants-view
                v-if="product.variants && product.variants.length"
                :variants="product.variants"
                center
                small
              />

              <v-card-text class="d-flex border-between">
                <div class="flex-grow-1">
                  <small class="d-block">{{
                    $t("global.commons.price")
                  }}</small>

                  <u-price
                    :amount="product.price"
                    :currency="product.currency"
                  ></u-price>
                </div>
                <div class="flex-grow-1">
                  <small class="d-block">{{
                    $t("global.commons.commission")
                  }}</small>

                  <u-price
                    :amount="product.commission"
                    :currency="product.currency"
                    class="text-success"
                  ></u-price>
                </div>

                <div class="flex-grow-1">
                  <small class="d-block">{{
                    $t("global.commons.quantity")
                  }}</small>
                  {{ product.quantity }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- ------------------------------ Add Product Dialog ----------------------------- -->
    <v-dialog
      v-model="show_add_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selected_product">
        <v-card-title class="text-start">
          <v-img
            :contain="selected_product.style && selected_product.style.contain"
            :src="getShopImagePath(selected_product.icon)"
            aspect-ratio="1"
            class="rounded-lg me-1 flex-grow-0"
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
            <template v-if="variants && variants.length">
              <s-widget-header
                :title="$t('global.commons.Variants')"
                icon="animation"
              ></s-widget-header>
              <v-menu offset-y>
                <template v-slot:activator="{ props }">
                  <div class="position-relative mb-10" v-bind="props">
                    <variant-item-mini
                      :product-variant="selected_variant"
                      class="m-2"
                      selected
                    />
                    <v-icon class="absolute-top-end" dark>
                      arrow_drop_down
                    </v-icon>
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

            <s-widget-header
              :title="$t('add_product.pricing.edit_price')"
              icon="price_change"
            ></s-widget-header>

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
                    class="row-hover pointer-pointer"
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
                          net_price_without_commission +
                          (shipping ? shipping : 0)
                        "
                        :currency="selected_product.currency"
                      ></u-price>
                    </td>

                    <td class="text-left" @click="editing = country">
                      <u-price
                        v-if="editing !== country"
                        :amount="commission"
                        :currency="selected_product.currency"
                        class="text-success"
                      ></u-price>

                      <u-price-input
                        v-else
                        v-model="selected_product_variant_pricing.commission"
                        :decimal="2"
                        :label="$t('global.commons.commission')"
                        :suffix="getCurrencyName(selected_product.currency)"
                        class="max-width-field-mini fadeIn"
                        dense
                        filled
                        flat
                        hide-details
                        required
                        solo
                      />
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
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
            <v-btn
              :loading="busy_add"
              color="primary"
              size="x-large"
              @click="addProduct()"
            >
              <v-icon class="me-1">add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SCountrySelect from "../../../../ui/country/select/SCountrySelect.vue";
import { SetupService } from "@selldone/core-js/server/SetupService";
import SCategoryCard from "../../../../storefront/category/card/SCategoryCard.vue";
import VariantItemMini from "../../../../storefront/product/variant/VariantItemMini.vue";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import ProductVariantsView from "../../../../storefront/product/variant/ProductVariantsView.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";

import _ from "lodash-es";

export default {
  name: "BProductAddDropshipping",
  components: {
    USmartToggle,
    UPriceInput,
    ProductVariantsView,
    UTimeProgressBar,
    VariantItemMini,
    SCategoryCard,
    SCountrySelect,
  },
  props: {
    shop: {
      required: true,
    },
  },
  data: () => ({
    drop_shops: [],
    busy_fetch: false,

    //-----------------------------------------
    country: null,
    search: null,
    show_all: false,
    //---------------------------------------
    selected_shop: null,
    products: [],
    folders: [],

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
    request_dialog: false,
    busy_request: false,
  }),

  computed: {
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
    search: _.throttle(function (newVal, oldVal) {
      this.fetchDropShops();
    }, window.SERACH_THROTTLE),

    selected_folder() {
      this.fetchProducts();
    },

    search_in_shop: _.throttle(function (newVal, oldVal) {
      this.fetchProducts(false);
    }, 1000),

    show_all() {
      this.fetchDropShops(false);
    },
  },

  created() {
    this.fetchDropShops();

    this.country =
      this.shop.countries && this.shop.countries.length
        ? this.shop.countries[0]
        : SetupService.LocalServiceCountry();
  },

  methods: {
    fetchDropShops() {
      if (!this.search)
        // Do not show for search!

        this.busy_fetch = true;

      axios
        .get(window.API.GET_DROP_SHIPPING_SHOPS(this.shop.id), {
          params: {
            country: this.country,
            search: this.search,
            show_all: this.show_all, // True: Show all store False: show permitted shops
          },
        })
        .then(({ data }) => {
          if (!data.error) {
            this.drop_shops = data.shops;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    showStore(drop_shop) {
      this.selected_shop = drop_shop;
      this.selected_folder = null;
      this.parent_folders = [];
      this.products = [];
      this.folders = [];

      this.fetchProducts();
    },

    fetchProducts(with_parent = true) {
      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_DROP_SHIPPING_SHOP_PRODUCTS(
            this.shop.id,
            this.selected_shop.id,
          ),
          {
            params: {
              with_parent: true,

              sort: this.sort,
              available: this.only_available,
              search: this.search_in_shop,

              dir: this.selected_folder ? this.selected_folder.id : null,
            },
          },
        )
        .then(({ data }) => {
          this.products = data.products;
          this.folders = data.folders;
          if (with_parent) {
            this.parent_folders = data.parents;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .then(() => {
          // always executed
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

    requestAccount(drop_shop) {
      this.busy_request = true;
      axios
        .post(window.API.POST_REQUEST_DROPSHIP_ACCESS(this.shop.id), {
          shop_id: drop_shop.id,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.request_dialog = false;
            drop_shop.dropship_access = data.request;
            this.showSuccessAlert(
              null,
              this.$t("dropshipping_products.notifications.request_access"),
            );
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .then(() => {
          this.busy_request = false;
        });
    },
  },
};
</script>

<style scoped></style>

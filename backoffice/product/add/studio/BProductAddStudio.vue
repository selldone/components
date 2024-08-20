<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-sheet>
    <v-row align="center" class="body-title" no-gutters>
      <a class="pointer-pointer text-primary" @click="finish()">
        <v-icon class="me-1" size="small">view_module</v-icon>
        <span>{{ $t("admin_shop.products.title") }}</span>
      </a>

      <v-icon class="mx-1" size="small">{{ $t("icons.angle_next") }}</v-icon>

      <a
        :class="{ disabled: !type || tab_product !== 1 }"
        @click="tab_product === 1 ? (type = null) : undefined"
      >
        {{ $t("add_product.title_new") }}
      </a>

      <span v-if="type">
        <v-icon class="mx-1" size="small">{{ $t("icons.angle_next") }}</v-icon>

        <img :src="type.image" class="me-1" height="18" width="18" />
        {{ $t(type.name) }}
      </span>

      <v-spacer />
    </v-row>

    <div v-if="tab_mode === TAB_PRODUCT">
      <!-- --------------------- Select Product Type --------------------- -->

      <div v-if="!type" class="max-width-container-1280px mx-auto">
        <!-- ██████████████████████ Select type ██████████████████████ -->

        <s-widget-header
          :title="$t('global.commons.product_type')"
          icon="workspaces"
          icon-color="#333"
        ></s-widget-header>
        <v-list-subheader>
          {{ $t("add_product.select_type.title") }}
        </v-list-subheader>

        <b-product-edit-type
          :shop="shop"
          has-add-connect-os
          has-add-dropshipping
          has-add-sku
          @select="(item) => setType(item)"
        ></b-product-edit-type>
      </div>

      <div v-else>
        <v-container v-if="tab_product === 1">
          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Marketplace Settings ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div v-if="is_marketplace" class="widget-box mb-5 mt-5">
            <s-widget-header
              :title="$t('global.commons.vendor')"
              icon="storefront"
            ></s-widget-header>

            <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Vendor panel > Fixed mode ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

            <template v-if="vendor">
              <v-list-subheader>
                <div
                  v-html="
                    $t(
                      'add_product.edit_info.marketplace.vendor_panel_message',
                      {
                        vendor_name: vendor.name,
                      },
                    )
                  "
                ></div>
              </v-list-subheader>

              <v-list-item :prepend-avatar="getShopImagePath(vendor.icon, 64)">
                <v-list-item-title class="font-weight-bold"
                  >{{ vendor.name }}
                </v-list-item-title>
                <v-list-item-subtitle
                  >{{ vendor.description }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>

            <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Marketplace panel > Subscription products ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->

            <template v-else-if="isSubscription">
              <v-list-subheader>
                <div>
                  <img
                    :src="ProductType.SUBSCRIPTION.image"
                    class="me-1"
                    height="20"
                    width="20"
                  />
                  {{
                    $t("add_product.edit_info.marketplace.subscription_message")
                  }}
                </div>
              </v-list-subheader>

              <b-vendor-input
                v-model="selected_vendor_id"
                :disabled="!!vendor"
                :shop="shop"
                flat
                label="Vendor*"
                solo clearable
              ></b-vendor-input>
            </template>

            <!-- ▂▂▂▂▂▂▂▂▂▂▂▂▂ Marketplace panel > Normal products ▂▂▂▂▂▂▂▂▂▂▂▂▂ -->
            <template v-else>
              <v-list-subheader>
                {{ $t("add_product.edit_info.marketplace.default_message") }}
              </v-list-subheader>

              <u-smart-switch
                v-model="single_vendor"
                :false-description="
                  $t('add_product.edit_info.marketplace.multi_vendors_desc')
                "
                :false-title="
                  $t('add_product.edit_info.marketplace.multi_vendors_title')
                "
                :true-description="
                  $t('add_product.edit_info.marketplace.single_vendor_desc')
                "
                :true-title="
                  $t('add_product.edit_info.marketplace.single_vendor_title')
                "
                class="my-3"
                @change="selected_vendor_id = null"
              ></u-smart-switch>

              <v-expand-transition>
                <div v-if="single_vendor">
                  <b-vendor-input
                    v-model="selected_vendor_id"
                    :disabled="!!vendor"
                    :shop="shop"
                    class="mt-5"
                    flat
                    label="Vendor"
                    solo clearable
                    @change="$forceUpdate()"
                  ></b-vendor-input>
                </div>
              </v-expand-transition>
            </template>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ General ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div class="widget-box mb-5">
            <s-widget-header
              :title="$t('global.commons.info')"
              icon="info"
            ></s-widget-header>
            <v-list-subheader
              >{{ $t("product_studio.info.subtitle") }}
            </v-list-subheader>

            <v-text-field
              v-model="title"
              :counter="120"
              :label="$t('add_product.edit_info.product_name')"
              :placeholder="
                $t('add_product.edit_info.product_name_placeholder')
              "
              :rules="[GlobalRules.required(), GlobalRules.counter(120)]"
              class="m-2"
              variant="underlined"
            ></v-text-field>
            <v-text-field
              v-model="brand"
              :label="$t('add_product.edit_info.brand.label')"
              :placeholder="$t('add_product.edit_info.brand.placeholder')"
              class="m-2"
              variant="underlined"
            ></v-text-field>
            <u-number-input
              v-if="!isSubscription && !isVirtual && !isFile"
              v-model="quantity"
              :label="$t('product_admin.inventory.variants.count_input')"
              :min="0"
              append-icon="inventory"
              class="m-2 strong-field"
            >
            </u-number-input>
          </div>

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

          <div class="widget-box mb-5">
            <s-widget-header
              :title="$t('global.commons.price')"
              icon="monetization_on"
            ></s-widget-header>
            <v-list-subheader>
              {{ $t("product_studio.price.subtitle") }}
            </v-list-subheader>

            <u-currency-input
              v-model="currency"
              :activeCurrencies="shop.currencies"
              :label="$t('add_product.pricing.currency_input')"
              :messages="$t('add_product.pricing.currency_input_messages')"
              class="m-2"
            />

            <u-price-input
              v-model="price"
              :currency="currency"
              :disabled="!currency"
              :label="$t('add_product.pricing.price_input')"
              :rules="[GlobalRules.required()]"
              class="m-2 strong-field"
              placeholder="0.00"
            />
          </div>

          <s-widget-buttons auto-fixed-position>
            <v-btn
              :disabled="!can_add"
              :loading="busy_add"
              color="primary"
              size="x-large"
              variant="elevated"
              @click="addProduct()"
            >
              <v-icon start>add</v-icon>
              {{ $t("global.actions.add") }}
            </v-btn>
          </s-widget-buttons>
        </v-container>

        <div v-if="tab_product === 2">
          <!-- ---------------------  Images --------------------- -->

          <b-product-edit-images v-if="product" :product="product" for-studio>
          </b-product-edit-images>

          <s-widget-buttons auto-fixed-position>
            <v-btn
              size="x-large"
              variant="text"
              @click="
                () => {
                  tab_product = 3;
                  GoToTopPage();
                }
              "
            >
              <v-icon start>add</v-icon>
              {{ $t("product_studio.add_mode") }}
            </v-btn>
            <v-btn
              color="primary"
              size="x-large"
              variant="elevated"
              @click="finish()"
            >
              <v-icon start>done</v-icon>
              {{ $t("global.actions.finish") }}
            </v-btn>
          </s-widget-buttons>
        </div>

        <div v-if="tab_product === 3">
          <!-- ---------------------  Variants --------------------- -->
          <b-product-inventory-management
            v-if="product"
            :product="product"
            :shop="shop"
            :vendor="vendor"
            class="my-10"
            for-studio
          />

          <s-widget-buttons auto-fixed-position>
            <v-btn
              color="primary"
              size="x-large"
              variant="elevated"
              @click="finish()"
            >
              <v-icon start>done</v-icon>
              {{ $t("global.actions.finish") }}
            </v-btn>
          </s-widget-buttons>
        </div>
      </div>
    </div>

    <!-- ================================ CATEGORY ================================ -->
    <div v-else-if="tab_mode === TAB_CATEGORY"></div>
  </v-sheet>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductInventoryManagement from "../../inventory/management/BProductInventoryManagement.vue";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import UNumberInput from "../../../../ui/number/input/UNumberInput.vue";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import BProductEditImages from "../../../product/edit/images/BProductEditImages.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import BVendorInput from "../../../vendor/input/BVendorInput.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import USmartSwitch from "../../../../ui/smart/switch/USmartSwitch.vue";
import BProductEditType from "../../../product/edit/type/BProductEditType.vue";
import SWidgetButtons from "@selldone/components-vue/ui/widget/buttons/SWidgetButtons.vue";
import { Article } from "@selldone/core-js";

const TAB_PRODUCT = 1;
const TAB_CATEGORY = 2;

export default {
  name: "BProductAddStudio",
  components: {
    SWidgetButtons,
    BProductEditType,
    USmartSwitch,
    BVendorInput,
    BProductEditImages,
    UCurrencyInput,
    UPriceInput,
    UNumberInput,

    BProductInventoryManagement,
  },
  emits: ["add", "finish"],
  props: {
    shop: {
      required: true,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
  },

  data: function () {
    return {
      show_article: true, // For refresh article!

      article_type: Article.Types.Product,

      TAB_PRODUCT: TAB_PRODUCT,
      TAB_CATEGORY: TAB_CATEGORY,

      ProductType: ProductType,

      //-------- Google Preview ----------
      busy_render_google: false,
      rendered_on_google: "",

      tab_mode: TAB_PRODUCT,

      //-------- Product ----------
      tab_product: 1,
      type: null,
      title: null,
      brand: null,
      price: 0,
      currency: null,
      quantity: 0,

      product: null,

      selected_vendor_id: null,
      //---------------------------
      busy_add: false,

      //-----------------------------
      single_vendor: false,
    };
  },
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },

    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    can_add() {
      return this.type && this.title && this.price >= 0 && this.currency;
    },

    isFile() {
      return this.type?.code === ProductType.FILE.code;
    },
    isVirtual() {
      return this.type?.code === ProductType.VIRTUAL.code;
    },
    isSubscription() {
      return this.type?.code === ProductType.SUBSCRIPTION.code;
    },
    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },
  },
  watch: {
    type(type) {
      window.sessionStorage.setItem(
        "temp-studio-type",
        type ? type.code : null,
      );
    },
    currency(currency) {
      window.sessionStorage.setItem("temp-studio-currency", currency);
    },
  },
  created() {
    if (window.sessionStorage.getItem("temp-studio-type") && false)
      this.type =
        ProductType[window.sessionStorage.getItem("temp-studio-type")];

    if (window.sessionStorage.getItem("temp-studio-currency"))
      this.currency = window.sessionStorage.getItem("temp-studio-currency");
    else if (this.shop.currencies.length > 0)
      this.currency = this.shop.currencies[0];

    // Assign vendor (used in subscription products)
    this.selected_vendor_id = this.vendor?.id;
  },

  methods: {
    setType(type) {
      this.type = type;
    },
    addProduct() {
      this.busy_add = true;

      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_ADD_PRODUCT(this.vendor.id)
            : window.API.POST_ADD_PRODUCT(this.shop.id),

          {
            // For marketplace: Vendor owner
            vendor_id: this.selected_vendor_id,

            type: this.type.code,

            title: this.title,
            condition: ProductCondition.NEW.code,

            price: this.price,
            currency: this.currency,

            commission: 0,
            discount: 0,

            status: "Open",

            category_id: this.$route.query.dir,

            lead: 0,

            style: null,

            brand: this.brand,
            warranty: null,
            original: true,
            return_warranty: null,

            video: null,

            quantity: this.isSubscription
              ? 1 /*Subscription default available!*/
              : this.quantity,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.product = data.product;

            this.showSuccessAlert(null, "The product added to the list.");
            this.$emit("add", data.product);

            this.tab_product = 2;
            this.GoToTopPage();
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = false;
        });
    },

    finish() {
      this.$emit("finish");
    },
  },
};
</script>

<style lang="scss" scoped></style>
